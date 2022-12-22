<template>
    <div class="markdown" v-html="parsedText"></div>
</template>
<script>
import { emj } from '@/utils/text-to-emoji.js'
import CountDown from '@/utils/clockCountdown.js'

export default {
    props: {
        source: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            markdownClocks: [], // store makdown clocks
        }
    },
    beforeUnmount() {
        this.markdownClocks.forEach(clock => {
            clock.$destroy()
        })
        this.markdownClocks = [];
    },
    watch: {
        parsedText: {
            immediate: true,
            handler() {
                this.markdownClocks.forEach(clock => {
                    clock.$destroy()
                })
                this.markdownClocks = [];
                this.$nextTick( () => {
                    this.$el.querySelectorAll('[data-date]').forEach( el => {
                        var providedTime = el.getAttribute('data-date')
                        this.markdownClocks.push(
                            new CountDown({
                                date: providedTime ? new Date(providedTime).getTime() : undefined,
                                interval: 1000,
                                onUpdate: (timeArray, string) => {
                                    el.innerHTML = providedTime ? 
                                        this.localizeTime.map( (t,i) => {
                                            if (timeArray[i] === undefined) return ''
                                            return (i>0 ? timeArray[i] : timeArray[i]) + t
                                        }).join(' ')
                                    : string;
                                },
                                onZero() {
                                    //                     1               2           3
                                    // chain clocks: dt[2022-01-01](dt[2022-01-04](Event over))
                                    // If countdown 1 is over will go to the next one.
                                    // Text can be provided after a clock to display once the countdown is over (example 3 will display "Event over" after countdown 2)
                                    // 3 could be another clock... in this case is text and will be displayed after countdown #2
                                    var options = el.getAttribute('data-date-options') || '-',
                                        match = options.match(/dt\[(.*?)\](?:\((.*)\))?/g);
                                    if (match) {
                                        el.setAttribute('data-date', match[1] || '')
                                        el.setAttribute('data-date-options', match[2] || '')
                                        providedTime = match[1];
                                        return this.$update({
                                            date: providedTime ? new Date(providedTime).getTime() : null,
                                        }, true)
                                    }
                                    el.innerHTML = options
                                    this.$destroy()
                                }
                            })
                        )
                    })
                })
            }
        }
    },
    computed: {
        parsedText() {
            return simpleMakdwon(this.source || '', {
                extraRules: [
                    [/[^\\]:(\w+?):/g, (m, emote) =>  emj[emote] ? `<img src="${emj[emote]}" alt="${emote}" title=":${emote}:" style="vertical-align: middle; height: 1.5em; transform: scale(2); pointer-events: none; margin: 0 1em;">` : m]
                ]
            })
        },
        localizeTime() {
            return this.$tm('strings.Dhms')
        }
    }
}

function outdent(str) {
	return str.replace(RegExp('^'+(str.match(/^(\t| )+/) || '')[0], 'gm'), '');
}
function simpleMakdwon(input, options) {
    var codes = {
        '^': 'simie',
        '*': '&#42;',
        '#': '&#35;',
        '(': '&#40;',
        '!': '&#33;',
        '+': '&#43;',
        '-': '&#45;',
        ':': '&#58;',
        '=': '&#61;',
        '[': '&#91;',
        '_': '&#95;',
        '|': '&#124;',
        '~': '&#126;'
    }
    var prettify = {
        '(c)': '©',
        '(r)': '®',
        '(tm)': '™',
        '+-': '±',
        '-+': '±',
        '-&gt;': '&rarr;',
        '=&gt;': '&rArr;',
        '&lt;-': '&larr;',
        '&lt;=': '&lArr;'
    }
    var text = input/*.replace(/^[ \t]+$/mg, '')*/.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\\*</g,'&lt;').replace(/>/g,'&gt;').replace(/\\(\S?)/g, (m,c) => codes[c] || m) // escape characters

    function handleTable(tableReg) {
        var table = tableReg.trim(),
            rows = table.split('\n'),
            align = rows[1].split('|').slice(1,-1).map(col => /:-+:/g.test(col) ? 'center' : /-+:/g.test(col) ? 'right' : /:-+/.test(col) ? 'left': ''),
            header = rows[0].split('|').slice(1,-1).map((col, index) => `<th style="text-align: ${align[index]}">${col.trim()}</th>`),
            tbody = '';
        for (var i=2; i<rows.length; i++) {
            tbody+= `<tr>${rows[i].split('|').slice(1,-1).map((col,index) => `<td style="text-align: ${align[index]};">${col.trim()}</td>`).join('')}</tr>`
        }
        return `<table class="markdown-table"><thead>${header.join('')}</thead><tbody>${tbody}</tbody></table>`
    }
    function handleCustomBlocks(match, classes, content) {
        if (!content)
            return match;
        return `<div class="${classes}">${content.replace(/(?:\n|^):{3}\s*(.*?)\n([\s\S]+):{3}/gim, handleCustomBlocks).trim()}</div>`
    }
    function handleBlockQuote(a) {
        function recursiveQuote(string) {
            return /^&gt;/.test(string)?
                '<blockquote>'+ string.replace(/(?:^&gt;\s?)(.*)/gm, (a,b) => recursiveQuote(b)) + '</blockquote>'
            : string;
        }
        return recursiveQuote(a)
    }
    function handleBulletpoint(text) {

        var match = text.replace(/^(\d+\.|[*+-]) (.*(?:\r?\n(?!(?:\d+\.|[*+-]) ).*)*)/gm, (match1) => {
            var test1 = match1.replace(/^\s*(\d+\.|[*+-]) /g, '').replace(/\n\s*[-+*]{1}\s+((?!(\r?\n){2})[\s\S])*/gm)
            console.log((test1+'').trim().match(/\n\s*[-+*]{1}\s+((?!(\r?\n){2})[\s\S])*/gm))
            var txt = match1.replace(/^\s*(\d+\.|[*+-]) /g, '').replace(/\n\s*[-+*]{1}\s+((?!(\r?\n){2})[\s\S])*/gm, handleBulletpoint).trim();
            return '<li>' + txt +'</li>'
        })
        return `<ul style="margin-left: 20px;white-space: normal;">${match}</ul>\n`
    }

    /** Code: escape all **/
    text = text.replace(/((?:(?:^|\n+)(?:\t|  {2,}).+)+\n*)|(?:^``` *(\w*)\n([\s\S]*?)\n```$)/gm, match => {
        var escapeAll = new RegExp('\\'+Object.keys(codes).join('|\\'), 'g')
        return '<pre><code>' + outdent(match.replace(escapeAll, match => codes[match]).replace(/^\n+|\n+$/g, '')) + '</code></pre>'
    }).replace(/`([^`]*?)`/g, (match, content) => {
        var escapeAll = new RegExp('\\'+Object.keys(codes).join('|\\'), 'g')
        return '<code>'+content.replace(escapeAll, match => codes[match])+'</code>'
    })


    var definitions = {}
    function ref(val) {
        const i = Object.keys(definitions).indexOf(val);
        if (i>-1) {
            definitions[val].refs.push('ref')
            var ci = definitions[val].refs.length
            return `<sup><a href="#" id="markup-footnote-refback-${ci-1}" onclick="const t = document.getElementById('markup-footnote-${i+1}'); if (t) t.scrollIntoView();return false">[${i+1}${ci>1?':'+(ci-1):''}]</a></sup>`
        } else {
            return ''
        }
    }
    text = text
        .replace(/^\[\^(.*?)\]:\s+(.*)/gm, (a,b,c) => { definitions[b] = {content: c, refs: []}; return ''})
        .replace(/\[\^(.*)\]/gi, (a,b) => ref(b))
        .replace(/\^\[(.*?)\]/g, (a,b) => {definitions[b] = {content: b, refs: []}; return ref(b)});
    if (Object.keys(definitions).length)
        text += `<hr><section style="-moz-column-count: 2; column-count: 2; font-size: 1.3rem; font-weight: 300;"><ol style="margin-left: 15px">${Object.keys(definitions).map( (key, index) => `<li id="markup-footnote-${index+1}">${definitions[key].content} ${definitions[key].refs.map( (c,ci) =>{return `<a href="" onclick="const t = document.getElementById('markup-footnote-refback-${ci}'); if (t) t.scrollIntoView();return false"><b style="font-size: 13px;">&#8617;</b></a>`}).join('')}</li>`).join('')}</ol></section>`; /* <i class="fas fa-reply fa-flip-vertical"></i> */
    // Abbreviations /^\*\[(.*)\]:\s+([\s\S]+?)(?:\n$)/gm



    options && options.extraRules?
        options.extraRules.forEach(rule => {
            text = text.replace(rule[0], rule[1] || '$&')
        })
    : null;

    var toHTML = text
        //.replace(/\r?\n{2,}/gm, '\n')
        .replace(/\n[*_-]{3,}[^\w]/gm, '<hr/>')
        .replace(/\((?:c|r|tm)\)|\+-|-\+|-+&gt;|&lt;-+|=+&gt;|&lt;=+/gi, (match) => prettify[match.replace(/(.)\1+/, '$1').toLowerCase()] || match)
        .replace(/^(#+) (.*$)/gm, function (m,n,t) {return `<h${n.length}>${t}</h${n.length}>\n`})            // h
        .replace(/(\*\*|__)(.*?)\1/g, '<b>$2</b>')                                                                          // bold text
        .replace(/(\*|_)(.*?)\1/g, '<i>$2</i>')                                                                             // italic text
        .replace(/~~(.*?)~~/g, '<s>$1</s>')                                                                                 // strikethrough
        .replace(/==(.*?)==/g, '<mark>$1</mark>')                                                                           // mark
        .replace(/\+\+(.*?)\+\+/g, '<ins>$1</ins>')                                                                           // ins
        .replace(/\^(.*)\^/g, '<sup>$1</sup>')                                                                             // Superscript
        .replace(/~(.*?)~/g, '<sub>$1</sub>')                                                                               // Subscript
        .replace(/dt\[(.*?)\](?:\((.*)\))?/g, '<span data-date="$1" data-date-options="$2"></span>')
        .replace(/!\[(.*?)\]\((.*?)(?:"(.*)".*)\)/gi, '<img src="$2" alt="$1" title="$3" style="max-height: 200px;" onclick="window.$gallery([{src: \'$2\', description: \'$3\'}])" />')       // images
        .replace(/(?:[^("'\n]|^)https?:\/\/[^"'\s\n]*/gi, '<a href="$&">$&</a>')                                                // clean url
        .replace(/\[(.*?)\]\((.*?)\)((?:\{:.*?\})?)/gi, '<a href="$2">$1</a>')                                                              // links
        .replace(/(?:\n|^):{3}\s*(.*?)\n([\s\S]+?):{3}/gim, handleCustomBlocks)                                                  // custom divs
        .replace(/( *\|[^\n]+\|\r?\n)((?: *\|:?[ -]+:?)+ *\|)(\n(?: *\|[^\n]+\|\r?\n?)*)?/gm, handleTable)                   // table
        .replace(/^((\*|-|\+|\d.)\s?)+[\s\S]+?(?:\n\n)/gm, handleBulletpoint)
        .replace(/^(&gt;\s?)+[\s\S]+?(?:\n[^&gt;])/gm, handleBlockQuote)
        .replace(/(^|\n).*?((\s\S*)(?!\n{2,}))+./g, (m)=> m?'<p>' + m.trim() + '</p>':'').replace(/<p><\/p>/gm, '')
    return toHTML.trim();
}
</script>
<style>
    .markdown p {
        margin-bottom: 10px;
    }
    .markdown code {
        padding: 0 3px;
        border: 1px solid #CCC;
        border-radius: 2px;
        background: #FFF;
    }
    .markdown pre > code {
        display: block;
        padding: 2px 5px;
        border: 1px solid #DDD;
        background: #FFF;
        border-left-width: 3px;
    }
    .markdown a {
        text-decoration: none;
    }
    .markdown blockquote {
        margin: 0;
        padding-left: 1.4rem;
        position: relative;
        background: #ffffff;
    }
    .markdown blockquote::before {
        content: '';
        position: absolute;
        left: 0;
        width: 4px;
        height: 100%;
        background: #DDD;
        border-radius: 2px / 4px;
    }

    .markdown-table {
        width: 100%;
        max-width: 100%;
        margin-bottom: 20px;
        border-spacing: 0;
        border-collapse: collapse;
    }
    .markdown-table th {
        vertical-align: bottom;
        border-bottom: 2px solid #ddd;
    }
    .markdown-table tbody tr:nth-child(odd) {
        background-color: #f9f9f9aa;
    }
    .markdown-table td {
        padding: 8px;
        line-height: 1.42857143;
        vertical-align: top;
        border-top: 1px solid #ddd;
    }
</style>