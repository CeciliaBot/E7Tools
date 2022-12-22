export function cleanUrl () {
    let url = window.location.href.split('?')[0];
    let segments = url.split('#')
    while (segments.length > 1 && !/^\/\w+/.test(segments[segments.length-1]) ) segments.pop();
    return segments.join('#')
}
export function generateUrl (list, heroList, _this) {
    console.log(_this)
    window.$promiseAlert(
        _this.$t('strings.generate_export_url'),
        new Promise ( resolve => {
            setTimeout( () => {
                resolve(
                `<div style="height: 100%; overflow: hidden;">
                    <textarea readonly style="height: 100%; width: 100%; word-break: break-all;resize: none;" onmouseup="event.preventDefault()" onclick="event.target.select();document.execCommand('copy'); window.$snackbar.log({type: 'info', title: 'Info', description: '${_this.$t('strings.copied_to_clipboard')}'})">${cleanUrl()}#roster=${exportLink(list, heroList)}&version=${(_this.VERSION || 1)}</textarea>
                </div>`
                )
            }, 1000) // let the animation play
        }),
        [_this.$t('strings.back')]
    )
}
export function exportLink (roster, availableList) {
    let numbers = availableList.map( c => {return roster.includes(c) ? 1 : 0})
    let newNumbers = [];
    numbers.forEach( (n,i) => {
        if (i>0 && numbers[i-1]===n) {
            let t = newNumbers[newNumbers.length-1];
            t[1]++
        } else return newNumbers.push([n,1]);
    })
    let toString = newNumbers.map( x => {return x[1]}).join('x');
    if (numbers[0]===0) toString = '0x'+toString;
    return toString;
}
export function decodeOldLink (link) {
    return JSON.parse(atob(link));
}
export function decodeLink (link, availableList) {
    let linkSplit = link.split(/x/)
    let shouldAdd = true;
    
    let heroes = availableList
    let roster = [], index = 0;
    for (let i=0;i<linkSplit.length; i++) {
        let len = parseInt(linkSplit[i])
        if (shouldAdd) {
            heroes.slice(index, len+index).forEach( x => roster.push(x))
        }
        index+=len;
        shouldAdd = !shouldAdd;
    }
    return roster
}