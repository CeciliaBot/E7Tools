import { isCartesian, hasDuplicates, checkSetQuantity, getAdvancedOptionsQuantity, checkHeroHasAoE, checkHeroHasDispel, checkHeroHasCleanse } from './calcUtils'
var Combinatorics = require('js-combinatorics');

export function legacyMoraleCalculator (team, locked = [], opts = {}, HeroDB) {
    var results = [];
    for (var i=0; i<team.length;  i++) {
        var hero = team[i];
        if (!HeroDB[hero].camping.topics) continue;
        if ( opts.muteLockedHeroes && locked.includes(hero) ) continue;
        for (var j=0; j<HeroDB[hero].camping.topics.length; j++) {
            var obj = {hero: hero, topic: HeroDB[hero].camping.topics[j], morale: 0};
            for (var k=0;k<team.length;k++) {
                if (i===k) continue;
                obj.morale += HeroDB[team[k]].camping.values[obj.topic];
            }
            results.push(obj);
        }
    }
    if (results.length===0) return null;

    results.sort(function(a, b) {
        return ((a.morale > b.morale) ? -1 : ((a.morale == b.morale) ? 0 : 1));
    })

    while (results[0].topic === results[1].topic) {
        results.splice(1, 1);
    }

    return {
        morale: results[0].morale + results[1].morale,
        team: team,
        topics: [
            results[0].topic,
            results[1].topic
        ],
        holder: [
            results[0].hero,
            results[1].hero
        ],
        moraleChanges: [
            results[0].morale,
            results[1].morale
        ]
    }
}

function getCartesianCombos(array, database) {
    var results = [[]];
    for (var i = 0; i < array.length; i++) {
        var currentSubArray = array[i];
        var temp = [];
        for (var j = 0; j < results.length; j++) {
            for (var k = 0; k < currentSubArray.length; k++) {
                if ( hasDuplicates(results[j].concat(currentSubArray[k]), database) ) continue;
                temp.push(results[j].concat(currentSubArray[k]));
            }
        }
        results = temp;
    }
    return results;
}

export function legacyCalculator(roster, locked, advanced, HeroDB, update) {
    var results = [{morale: -100, team: []}],
        cartesian = [],
        cartesianCombos = [[]],
        role = getAdvancedOptionsQuantity(advanced.role || {}),
        mustCheckRole = role[0] > 0 || role[0] !== role[1],
        attribute = getAdvancedOptionsQuantity(advanced.attribute || {}),
        mustCheckAttribute = attribute[0] > 0 || attribute[0] !== attribute[1];

    //remove locked heroes from roster
    locked.forEach(hero => {
        var index = roster.indexOf(hero)
        if (index !== -1) roster.splice( index, 1 )
    })


    var hasCartesian = isCartesian(advanced)
    if (hasCartesian) {
        cartesian = advanced.cartesianLock;

        // remove empty slots
        for (var i = 0; i < cartesian.length; i++) {
            if (!cartesian[i].length) {
                cartesian.splice(i, 1)
                i--
            }
        }

        // remove cartesian locked heroes from roster
        var tmp = cartesian.flat();
        for (var j = 0; j < roster.length; j++){
            if (tmp.includes(roster[j]) ) {
                roster.splice(j, 1);
                j--
            }
        }

        // check if can fill remaining slots
        if ((cartesian.length + locked.length) < 4 && roster.length < 4-(cartesian.length + locked.length)) {
            throw 'not_enough_heroes';
        }

        cartesianCombos = getCartesianCombos(cartesian, HeroDB);

    }

    // check if team size is possible
    var heroesRolesSlots = advanced.lockedMatter ? 0 : role[0],
        heroesAttributesSlots = advanced.lockedMatter ? 0 : attribute[0];
    if ( (cartesian.length + locked.length + heroesRolesSlots > 4) || (cartesian.length + locked.length + heroesAttributesSlots) > 4) {
        throw 'team_size_exceeded'
    }

    if (!roster.length) roster = ['ras'];

    // Set Progress bar info 
    var currIndex = 0,
        lastProgress = -1,
        total = Combinatorics.bigCombination( roster, ( 4-locked.length-cartesianCombos[0].length ) || 1 ).length * cartesianCombos.length;

    cartesianCombos.forEach( combo => {
        let l = 4-locked.length-combo.length;
        Combinatorics.bigCombination(roster, l>0?l:Math.max(1, roster.length) ).forEach(teamComb => {

            //Update progress Bar
            currIndex++
            const pNow = Math.round(currIndex * 100 / total);
            if (lastProgress !== pNow)
                lastProgress = pNow,
                update(pNow);

            if (combo.length + locked.length>3) teamComb = []; // if we have 4 locked heroes teamComb must be empty
            var team = teamComb.concat( combo, locked );
            let toFilter = advanced.lockedMatter ? team : teamComb.concat(combo);
            
            if (hasDuplicates(team, HeroDB))
                return;

            if (!locked.every(i => team.includes(i)))
                return;

            if (mustCheckRole && !checkSetQuantity(toFilter, advanced.role, HeroDB, 'role'))
                return;

            if (mustCheckAttribute && !checkSetQuantity(toFilter, advanced.attribute, HeroDB, 'attribute'))
                return;

            if (advanced.buffs && advanced.buffs.length > 0 && !advanced.buffs.every(i => toFilter.map(function (hero) { return HeroDB[hero].buffs }).flat().includes(i)))
                return;

            if (advanced.debuffs && advanced.debuffs.length > 0 && !advanced.debuffs.every(i => toFilter.map(function (hero) { return HeroDB[hero].debuffs }).flat().includes(i)))
                return;

            if (advanced.noS1debuffs && toFilter.map(function (hero) { return HeroDB[hero].skills[0].debuff }).flat().filter(function (team) {return team != 20 && team != 25 && team != 21 && team != 24}).length != 0)
                return;

            if (advanced.noDebuffs && toFilter.map(function (hero) { return HeroDB[hero].debuffs }).flat().filter(function (team) {return team != 20 && team != 25 && team != 21 && team != 24}).length != 0)
                return;

            if (advanced.aoe && !toFilter.some( i => checkHeroHasAoE(HeroDB[i]) ) )
                return;

            if (advanced.includeDispel && !toFilter.some(i => checkHeroHasDispel(HeroDB[i]) ))
                return;

            if (advanced.includeCleanser && !toFilter.some(i => checkHeroHasCleanse(HeroDB[i]) ))
                return;

            let thisTeamResult = legacyMoraleCalculator(team, locked, advanced, HeroDB);
            
            if (!thisTeamResult)
                return;

            if (results.length && results[results.length-1].morale >= thisTeamResult.morale)
                return;

            for (var i = 0; i<results.length;i++) {
                if (thisTeamResult.morale >= results[i].morale) {
                    results.splice( i, 0, thisTeamResult );
                    results.splice( 200, 1 );
                    break;
                }
            }
        })
    })

    if (!results[results.length-1].team.length) {
        for (var k = 0; k < results.length; k++) {
            if (!results[k].team.length) { // remove placeholders
                results.splice(k);
                break;
            }
        }
    }

    return results
}