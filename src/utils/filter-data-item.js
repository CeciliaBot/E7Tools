export default function (filter, hero, getData, getName) {
    for (const f in filter) {
        if (f==='name') {
            if (getName(hero).toLowerCase().indexOf(filter[f].toLowerCase()) === -1) return false;
            continue;
        }
        if (f==='hasSkins' && filter[f]) {
            if (!getData(hero).skin) return false;
            continue;
        }
        var v = filter[f];
        if (v.length && !v.includes(getData(hero)[f])) return false;
    }
    return true;
}