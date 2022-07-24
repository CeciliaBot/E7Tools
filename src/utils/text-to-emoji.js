import { cdn } from '@/utils/constant.js'
var emj = {
    /* Sets */
    hitset: cdn+'item/icon_set_acc.png',
    atkset: cdn+'item/icon_set_att.png',
    unityset: cdn+'item/icon_set_coop.png',
    counterset: cdn+'item/icon_set_counter.png',
    critset: cdn+'item/icon_set_cri.png',
    defset: cdn+'item/icon_set_def.png',
    healset: cdn+'item/icon_set_heal_inc.png',
    immunityset: cdn+'item/icon_set_immune.png',
    healthset: cdn+'item/icon_set_max_hp.png',
    penetrationset: cdn+'item/icon_set_penetrate.png',
    rageset: cdn+'item/icon_set_rage.png',
    randomset: cdn+'item/icon_set_random.png',
    resistset: cdn+'item/icon_set_res.png',
    revengeset: cdn+'item/icon_set_revenge.png',
    injuryset: cdn+'item/icon_set_scar.png',
    speedset: cdn+'item/icon_set_speed.png',
    lifestealset: cdn+'item/icon_set_vampire.png',

    /* Stats */
    attack: cdn+'img/icon_menu_att.png',
    defense: cdn+'img/icon_menu_def.png',
    health: cdn+'img/icon_menu_max_hp.png',
    speed: cdn+'img/icon_menu_speed.png',
    critchance: cdn+'img/icon_menu_cri.png',
    critdamage: cdn+'img/icon_menu_cri_dmg.png',
    effectivness: cdn+'img/icon_menu_acc.png',
    effectresist: cdn+'img/icon_menu_res.png',
    dual: cdn+'img/icon_menu_coop.png',
    counter: cdn+'img/icon_menu_counter.png',

    /* Rarity */
    rarity: cdn+'cm_icon_star.png',

    /* Roles */
    warrior: cdn+'class/cm_icon_role_warrior.png',
    knight: cdn+'class/cm_icon_role_knight.png',
    thief: cdn+'class/cm_icon_role_thief.png',
    ranger: cdn+'class/cm_icon_role_ranger.png',
    mage: cdn+'class/cm_icon_role_mage.png',
    'soul-weaver': cdn+'class/cm_icon_role_soul-weaver.png',

    /* Attributes */
    fire: cdn+'attribute/cm_icon_profire.png',
    ice: cdn+'attribute/cm_icon_proice.png',
    grass: cdn+'attribute/cm_icon_proearth.png',
    dark: cdn+'attribute/cm_icon_promdark.png',
    light: cdn+'attribute/cm_icon_prolight.png',

    /* Zodiac */
    aries: cdn+'img/cm_icon_zodiac_ram.png',
    taurus: cdn+'img/cm_icon_zodiac_bull.png',
    gemini: cdn+'img/cm_icon_zodiac_twins.png',
    cancer: cdn+'img/cm_icon_zodiac_crab.png',
    leo: cdn+'img/cm_icon_zodiac_lion.png',
    virgo: cdn+'img/cm_icon_zodiac_maiden.png',
    libra: cdn+'img/cm_icon_zodiac_scales.png',
    scorpius: cdn+'img/cm_icon_zodiac_scorpion.png',
    sagittarius: cdn+'img/cm_icon_zodiac_archer.png',
    capricornus: cdn+'img/cm_icon_zodiac_goat.png',
    aquarius: cdn+'img/cm_icon_zodiac_waterbearer.png',
    pisces: cdn+'img/cm_icon_zodiac_fish.png',

    /* E7 Emotes */
    noted: cdn+'ui/emote/c5009_hard_001.webp',
    provoke: cdn+'ui/emote/c3121_provoke_001.webp',
    tired: cdn+'ui/emote/c3123_tired_001.webp',

    /* E7 Items */
    skystones: cdn+'item/token_crystal.png',
    transmit: cdn+'item/token_hero1.png',
    transmit2: cdn+'item/token_hero2.png',
    powder: cdn+'item/token_powder.png',
    covenant: cdn+'item/token_ticket_rare.png',
    mystic: cdn+'item/token_ticket_special.png',
    galaxy: cdn+'item/token_ticket_moon.png',
    molagoraseed: cdn+'item/token_mura.png',
    molagora: cdn+'item/ma_moragora1.png',

    /* Other E7Stuff */
    banned: cdn+'img/_cm_banned_res.png',
    d: cdn+'img/hero_dedi_a_d.png',
    c: cdn+'img/hero_dedi_a_c.png',
    b: cdn+'img/hero_dedi_a_b.png',
    a: cdn+'img/hero_dedi_a_a.png',
    s: cdn+'img/hero_dedi_a_s.png',
    ss: cdn+'img/hero_dedi_a_ss.png',
    sss: cdn+'img/hero_dedi_a_sss.png',

    /* Twitch emotes */
    booba: cdn+'ui/emote/booba.webp',
    based: 'https://www.nicepng.com/png/full/831-8318812_view-samegoogleiqdbsaucenao-based-pepe-in-a-tuxedo.png',
    basedcigar: cdn+'ui/emote/basedCigar.webp',
    modcheck: cdn+'ui/emote/modCheck.webp',
    clueless: 'https://cdn.betterttv.net/emote/60419081306b602acc5972c9/3x',
    aware: 'https://cdn.betterttv.net/emote/6151c623b63cc97ee6d39040/3x',
    omegalul: 'https://cdn.betterttv.net/emote/583089f4737a8e61abb0186b/3x',
    PepeLaugh: 'https://cdn.betterttv.net/emote/5c548025009a2e73916b3a37/3x',
    NOPPERS: 'https://cdn.betterttv.net/emote/5ec39a9db289582eef76f733/3x',
    EZ: 'https://cdn.betterttv.net/emote/5590b223b344e2c42a9e28e3/3x',
    who: cdn+'ui/emote/WHO.webp',
    Pepega: cdn+'ui/emote/pepega.png',
    pepegacredit: cdn+'ui/emote/PepegaCredit.webp',
    copium: cdn+'ui/emote/copium.png',
    gigachad: cdn+'ui/emote/GIGACHAD.webp',
    sussy: cdn+'ui/emote/SUSSY.webp',
    Bedge: cdn+'ui/emote/bedge.webp',
    Smadge: cdn+'ui/emote/Smadge.webp'
}

export var emotes = Object.keys(emj).map(key => {
    return {
        code: key,
        src: emj[key]
    }
})

function buildEmoteElement (emote) {
    var img = document.createElement( 'img' );
    img.src=emj[emote];
    img.setAttribute('draggable', false);
    img.title = ':'+emote+':';
    img.style.height='1.5em';
    img.style.verticalAlign = 'middle';
    img.style.pointerEvents = 'none'; //allows user to click around the emote
    img.setAttribute('SameSite', 'Lax');
    return img;
}

export function stringToHtmlEmotes (text) {
    let str = (text || '').replace(/<(?!br\s*\/?)[^>]+>/, (match) => {
        console.log(match);
        return match.replace('<', '&lt;').replace('>', '&gt;').replace('/', '&#47;')
    })
    //let str = (text || '').replace('<[^br]', '&lt;').replace('[^br]>', '&gt;').replace('/', '&#47;'); //replace <,>,/ to prevent pure html code in the string
    let newString = str.replace(/:\w+:/g, function (match) {
        var emote = emj[match.replace(/:/g,'')];
        if (emote) {
            return '<img src="' + emote + '" title="' + match + '" draggable="false" style="height: 1.5em; vertical-align: middle; pointer-events: none;" SameSite="Lax" />'
        } else
            return match;
    })
    return newString
}
function recursiveCleaner(node) { /* Loop through each node and get text + emotes */
    var str = '';
    if (!node.childNodes) return node.innerHTML;
    node.childNodes.forEach((child, index) => {
        if (child.nodeName === '#text')
            str+=child.data;
        else if (child.nodeName === 'IMG'/* && node.title*/)
            str+=child.title||'';
        else if (child.nodeName === 'BR' && index>0)
            str+='<br>'
        else if (child.nodeName === 'DIV' || child.nodeName === 'P')
            str+='<div>'+recursiveCleaner(child)+'</div>'
    })
    return str.replace(/(<[/]*div>){2}/g,'<br>').replace(/(<[/]*div>)/g, '<br>').replace(/(<br>)*$/,'');
}
export function cleanInnerText (el) {
    let text= recursiveCleaner(el);
    return text
}

export function liveHtmlToEmote (e) {
    if (e.key===':' || e.keyCode==229) { // = : ..... e.key doesn't work on mobile
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
                        );
                    }
                }
            }
        }) //animation frame
    }// else { /* Autocomplete emote */
    //     var cart = getSelection();
    //     var nodeTarget = cart.startContainer;
    //     if (nodeTarget.nodeName === "#text") {
    //         var string = nodeTarget.data.slice(0,cart.startOffset);
    //         var match = string.match(/:\w+$/);
    //         if (match) {
    //             let typed = match[0].slice(1)
    //             for (var i=0;i<emotes.length;i++) {
    //                 if (emotes[i].code.indexOf(typed) != -1) {
    //                     console.log(emotes[i].code)
    //                 }
    //             }
    //         }
    //     }
    // }
}

function getSelection() {
    if (window.getSelection) {
        const sel = window.getSelection();
        if (sel.getRangeAt /*&& sel.rangeCount*/) {
            return sel.getRangeAt(0);
        }
    } else if (document.selection && document.selection.createRange) {
        return document.selection.createRange();
    }
    return null;
}
// function setCaretPosition(elem, caretPos) {
//     if(elem != null) {
//         if(elem.createTextRange) {
//             var range = elem.createTextRange();
//             range.move('character', caretPos);
//             range.select();
//         }
//         else {
//             if(elem.selectionStart) {
//                 elem.focus();
//                 elem.setSelectionRange(caretPos, caretPos);
//             }
//             else
//                 elem.focus();
//         }
//     }
// }

function insertAtIndex (targetEl, newEl, index, length = 0) {
    var sel, range;
    if (window.getSelection)
    {
        sel = window.getSelection();    
        if (index !==undefined && length !==undefined) { // Live text to emote
            range = document.createRange();
            range.setStart(targetEl, index);
            range.setEnd(targetEl, index+length);
            sel.removeAllRanges();
            sel.addRange(range);
        } 
        if (sel.rangeCount)
        {
            range = sel.getRangeAt(0);          
            //var selectedText = range.toString();
            range.deleteContents();
            range.insertNode( newEl ); 
            
            //move the cursor
            range.setStartAfter(newEl);
            range.setEndAfter(newEl); 
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
}

export function clickToInsertEmote(emote, targetEl) {
    var caret = getSelection();
    console.log(caret)
    var target = caret.startContainer;
    if (!emote) return;
    if (targetEl) {
        var isAChild = targetEl.contains(target);
        if (!isAChild) {
            target = targetEl.lastChild;
            if (!target) {
                target = document.createTextNode("");
                targetEl.appendChild( target );
            }
        } else {
            console.log('is a child')
        }
    }
    insertAtIndex(
        target,
        buildEmoteElement(emote)
    );
}