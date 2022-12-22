export default function (name = '', hero = {}, filter = {}) {
    for (const f in filter) {
        if (f==='name') {
            if (name.toLowerCase().indexOf(filter[f].toLowerCase()) === -1) return false;
            continue;
        }
        if (f==='hasSkins' && filter[f]) {
            if (!hero.skin) return false;
            continue;
        }
        if (filter[f].length && !filter[f].includes(hero[f])) return false;
    }
    return true;
}