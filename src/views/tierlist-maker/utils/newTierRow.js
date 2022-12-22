const alphabet = ['S','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
// ':S:',':A:',':B:',':C:',':D:'  -> for emotes
export function newTierRow (addTo, index) {
    var i;
    if (!index === undefined)
        i = addTo.length
    else
        i = Number(index),
        i = isNaN(i) ? addTo.length : i;

    addTo.splice(i, 0, {
        _id: Date.now() + '-' + (Math.floor(Math.random() * 1000) + '-' + i), // Generate random id to use as key for vue
        name: alphabet[i % alphabet.length],
        color: null,
        list: []
    })
}
export function newTierRows(n, to, index) { // n = number of tiers to add
    if (index===undefined) index=to.length;
    for (var i=0;i<n;i++) {
        newTierRow(to, index);
        index++;
    }
}