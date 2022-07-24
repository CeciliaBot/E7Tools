const alphabet = ['S','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
export function newTierRow (addTo, index) {
    if (index===undefined) index = addTo.length;
    addTo.splice(index, 0, {
        _id: Date.now() + '-' + (Math.floor(Math.random() * 1000) + '-' + index), // Generate random id to use as key for vue
        name: alphabet[index % alphabet.length],
        color: null,
        list: []
    })
}
export function newTierRows(n, to, index) {
    if (index===undefined) index=to.length;
    for (var i=0;i<n;i++) {
        newTierRow(to, index);
        index++;
    }
}