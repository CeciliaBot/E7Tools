import { /*stringToHtmlEmotes,*/ emj, emotes, getSelection, insertAtIndex, cleanInnerText, buildEmoteElement } from '@/utils/text-to-emoji.js'
import { computePosition, offset, shift, flip } from '@floating-ui/dom';
var suggestionWeak = new WeakMap();

function getSuggestionBox (el) {
    var get = suggestionWeak.get(el);
    if (get) return get.el;
    var div = document.createElement( 'div' )
    div.classList.add('hide-scrollbar')
    div.onmousedown = (e) => e.preventDefault() // keep focus on the input box
    div.style="background: var(--background-color-secondary); padding: 5px 0; border-radius: 8px; z-index: 100; cursor: pointer; position: absolute; top: 0; left: 0; transform: translate(-100%, -100%); max-height: 200px; overflow: auto;"
    suggestionWeak.set(el, {el: div, results: [], index: 0, matchLength: 0})
    document.body.appendChild(div)
    return div;
}
function deleteSuggestionBox (e) {
    let el = e.target
    var get = suggestionWeak.get(el);
    if (get && get.el) {
        get.el.remove();
        get.el = null;
    }
    get = null;
    suggestionWeak.delete(el)
}
function clickSuggestion (e, ref) {
    let img = e.currentTarget.querySelector('img');
    if (img) {
        let emote = img.title;
        if (!emote) return;
        let data = suggestionWeak.get(ref)
        emote = emote.slice(1,-1)
        var cart = getSelection()
        var nodeTarget = cart.startContainer
        insertAtIndex(
            nodeTarget,
            buildEmoteElement(emote),
            cart.startOffset-data.matchLength,
            data.matchLength
        )
        deleteSuggestionBox({target: ref})
    }
}

export function liveHtmlToEmote (e) {
    if ([17,18,16,20].includes(e.keyCode)) return; // Shift, control, alt, caps lock
    if (e.key===':' || e.keyCode==229) {
        deleteSuggestionBox(e)
        window.requestAnimationFrame( () => {
            var cart = getSelection();
            var nodeTarget = cart.startContainer;
            if (nodeTarget.nodeName === "#text") {
                var string = nodeTarget.data.slice(0,cart.startOffset);
                var match = string.match(/:\w+:$/);
                if (match) {
                    const emote = emj[match[0].replace(/:/g,'')];
                    if (emote) {
                        let l = match[0].length;

                        insertAtIndex(
                            nodeTarget,
                            buildEmoteElement(match[0].replace(/:/g,'')),
                            cart.startOffset-l,
                            l
                        )
                    }
                }
            }
        }) //animation frame
    } else if ( e.keyCode === 37 || e.keyCode===39 ) { // on arrow key left or right remove the suggestion box
        deleteSuggestionBox(e)
    } else if ([38,40,13,9].includes(e.keyCode)) {
        var data = suggestionWeak.get(e.target);
        if (!data || !data.results.length) return;
        if (!data.index) data.index = 0;
        if (e.keyCode === 38) { // up;
            e.preventDefault()
            data.el.children[data.index].style.background = '';
            data.index--
            if (data.index<0) data.index = data.results.length-1;
            data.el.children[data.index].style.background = 'black';
            data.el.children[data.index].scrollIntoView(false);
        } else if (e.keyCode === 40) { // down;
            e.preventDefault()
            data.el.children[data.index].style.background = '';
            data.index++
            if (data.index>data.results.length-1) data.index = 0;
            data.el.children[data.index].style.background = 'black';
            data.el.children[data.index].scrollIntoView(false);
        } else if (e.keyCode === 13 || e.keyCode === 9) { // enter or tab
            e.preventDefault()
            var cart = getSelection();
            var nodeTarget = cart.startContainer;
            insertAtIndex(
                nodeTarget,
                buildEmoteElement(data.results[data.index].code),
                cart.startOffset-data.matchLength,
                data.matchLength
            )
            deleteSuggestionBox(e)
        }
    } else { /* Autocomplete emote */
        window.requestAnimationFrame( () => {
            var autocomplete = getSuggestionBox(e.target)
            var data = suggestionWeak.get(e.target);
            var cart = getSelection();
            var nodeTarget = cart.startContainer;
            if (nodeTarget.nodeName === "#text") {
                var string = nodeTarget.data.slice(0,cart.startOffset);
                var match = string.match(/:\w+$/);
                if (!match) {
                    autocomplete.style.display = 'none'
                } else {
                    let typed = match[0].slice(1)
                    var reg = new RegExp('^'+typed, 'i')
                    autocomplete.innerHTML = '';
                    var results = emotes.filter(x => reg.test(x.code)).slice(0,10)
                    data.results = results;
                    data.index = 0;
                    data.matchLength = match[0].length;

                    results.forEach(res => {
                        let block = document.createElement( 'div' )
                        block.style='padding: 0 5px';
                        block.onclick = (ev) => clickSuggestion(ev, e.target);
                        block.onmouseenter = (e) => {autocomplete.children[data.index].style.background = ''; data.index = results.indexOf(res); e.target.style.background = 'black'; }
                        let emote = buildEmoteElement(res.code);
                        emote.style.minWidth = '1.5em';
                        block.appendChild(emote);
                        var name = document.createTextNode(res.code)
                        block.appendChild(name)
                        autocomplete.appendChild(block);
                        //return '<div  style="padding: 0 5px;"><img src="'+res.src+'" style="height: 1.5em; vertical-align: middle;"/>' + res.code + '</div>'
                    })
                    if (results.length == 0) {
                        autocomplete.style.display = 'none'
                        return
                    } else {
                        autocomplete.style.display = "block"
                    }
                    autocomplete.children[data.index].style.background = 'black';
                    window.requestAnimationFrame(()=>{
                        computePosition(cart, autocomplete, {
                            strategy: 'absolute',
                            placement: 'top',
                            middleware: [
                                offset(5),
                                shift(),
                                flip()
                            ]
                        }).then( ({x, y}) => {
                            Object.assign(autocomplete.style, {
                                transform: 'translate(' + x+'px,' + y + 'px)',
                                opacity: 1
                            })
                        })
                    })
                }
            }
        })
    }
}

export default {
    beforeMount: function (el) {
        el.addEventListener('keydown', liveHtmlToEmote)
        el.addEventListener('blur', deleteSuggestionBox)
        el.getCleanInnerHTML = () => cleanInnerText(el)
    },
    beforeUnmount: function (el) {
        el.getCleanInnerHTML = null
        el.removeEventListener('keydown', liveHtmlToEmote)
        deleteSuggestionBox({target: el})
    }
}