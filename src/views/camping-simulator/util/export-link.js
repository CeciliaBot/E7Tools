export function cleanUrl (router) {
    console.log(router)
    let url = window.location.href.split('?')[0];
    let segments = url.split('#'), maxSegments = router && router.mode==='hash' ? 2 : 1;
    while (segments.length > maxSegments) segments.pop();
    return segments.join('#')
}
export function generateUrl (_this) {
    window.$promiseAlert(
        _this.$t('strings.generate_export_url'),
        new Promise ( resolve => {
            setTimeout( () => {
                resolve(
                `<div style="height: 100%; overflow: hidden;">
                    <textarea readonly style="height: 100%; width: 100%; word-break: break-all;resize: none;" onmouseup="event.preventDefault()" onclick="event.target.select();document.execCommand('copy'); $snackbar.show({type: 'info', title: 'Info', description: '${_this.$t('strings.copied_to_clipboard')}'})">${cleanUrl(_this.$router)}#roster=${exportLink(_this.roster, _this.$store.state.HeroDB)}&version=${(_this.version || 1)}</textarea>
                </div>`
                )
            }, 2000)
        }),
        [_this.$t('strings.back')]
    )
}
export function exportLink (roster, database) {
    let numbers = Object.keys(database).map( c => {return roster.includes(c) ? 1 : 0})
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
export function decodeLink (link, database) {
    let linkSplit = link.split(/x/)
    let shouldAdd = true;
    
    let heroes = Object.keys(database)
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