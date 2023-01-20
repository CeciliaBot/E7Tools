export function everyLocked (team, locked) {
    return locked.every( hero => team.includes(hero))
}

export function hasDuplicates(array, db) {  // check for duplicates or sc duplicates
    return array.some((val, i) => {
        return array.indexOf(val, i+1) != -1 || heroHasScDupe(array, i, db)
    })
}

function heroHasScDupe(team, index, database) {
    var data = database[team[index]];
    if (!data || !data.linked_hero)
        return false;

    if (!Array.isArray(data.linked_hero))
        data.linked_hero = [data.linked_hero];
    
    return data.linked_hero.some(s => team.indexOf(s) != -1)
}

export function checkSCDupe(array, database) {
    return array.some((el, i) => heroHasScDupe(array, i, database))
}

export function alreadyInResults(team, results) {
    if (results.length > 0 ) {
        for (var i = 0; i<results.length;i++) {
            if ( results[i].morale === -100 )
                break;
            if ( results[i].team.every(hero => team.includes(hero) ) ) {
                return i
            }
        }
    }
    return -1
}

export function hasAdvancedSettings(advanced) {
    var role = getAdvancedOptionsQuantity(advanced.role || {}),
        attribute = getAdvancedOptionsQuantity(advanced.attribute || {});
    if (
        role[0] > 0 || role[0] !== role[1] ||
        attribute[0] > 0 || attribute[0] !== attribute[1] ||
        advanced.debuffs && advanced.debuffs.length > 0 ||
        advanced.buffs && advanced.buffs.length > 0 ||
        advanced.aoe === true ||
        advanced.noS1debuffs === true ||
        advanced.noDebuffs === true ||
        advanced.includeDispel ||
        advanced.includeCleanser ||
        isCartesian(advanced)
    ) return true;

    return false
}

export function isCartesian(advanced) {
    if (!advanced.cartesianLock)
        advanced.cartesianLock = [[],[],[],[]];

    return advanced.cartesianLock && advanced.cartesianLock.flat().length>0
}

export function getAdvancedOptionsQuantity(obj) {
    var positive = 0,
        negative = 0;
    for (var key in obj) {
        positive += Math.max(0, obj[key]);
        negative += obj[key]
    }
    return [positive, negative]
}

export function checkSetQuantity(team, requested, database, key) {
    var teamRes = {}
    for (var i = 0; i < team.length; i++) {
        var _this = database[team[i]][key];
        if (!teamRes[_this]) teamRes[_this] = 0;
        teamRes[_this]++;
    }
    for (var key1 in requested) {
        var r = teamRes[key1] || 0;
        if ( ( requested[key1] < 0 && r > 0) || ( requested[key1] > 0 && r < requested[key1] ) )
            return false
    }
    return true
}

export function checkHeroHasAoE(heroData) {
    return heroData.common && heroData.common.includes('aoe')
}
export function checkHeroHasCleanse(heroData) {
    return heroData.common && heroData.common.includes('cleanse')
}
export function checkHeroHasDispel(heroData) {
    return heroData.common && heroData.common.includes('dispel')
}