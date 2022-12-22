import { checkSCDupe, everyLocked, alreadyInResults } from './calcUtils.js'
var Combinatorics = require('js-combinatorics')
/* eslint-disable */

export var topics_results = null;

export function getTopicResults(HeroDB) { // if object type
    if (topics_results)
        return topics_results;
    
    // create topics combos (once for page visit)
    topics_results = {}
    var topic_combos = Combinatorics.combination(["Criticism", "Reality Check", "Heroic Tale", "Comforting Cheer", "Cute Cheer", "Heroic Cheer", "Sad Memory", "Joyful Memory", "Happy Memories", "Unique Comment", "Self-Indulgent", "Occult", "Myth", "Bizarre Story", "Food Story", "Horror Story", "Gossip", "Dream", "Advice", "Complain", "Belief", "Interesting Story"], 2).toArray();
    for (var hero_id in HeroDB) {
        var this_hero_camping = HeroDB[hero_id].camping;
        if (!this_hero_camping)
            continue;
        for ( var i = 0; i<topic_combos.length; i++) {
            var key = topic_combos[i];
            if (!topics_results[key.join("_")]) {topics_results[key.join("_")] = {topics: topic_combos[i]}; topics_results[key.join("_")]["heroes"] = []; topics_results[key.join("_")][key[0]] = [];  topics_results[key.join("_")][key[1]] = []}
            if (this_hero_camping.topics.includes(key[0]) ) topics_results[key.join("_")][key[0]].push({"_id": HeroDB[hero_id]._id, morale: this_hero_camping.values[key[1]]});
            if (this_hero_camping.topics.includes(key[1]) ) topics_results[key.join("_")][key[1]].push({"_id": HeroDB[hero_id]._id, morale: this_hero_camping.values[key[0]]});
            topics_results[key.join("_")]["heroes"].push( {"_id": HeroDB[hero_id]._id, morale: this_hero_camping.values[key[0]]+this_hero_camping.values[key[1]]} );
            topics_results[key.join("_")]["heroes"].sort(function (a,b) {return ((a.morale > b.morale) ? -1 : ((a.morale == b.morale) ? 0: 1))});
            topics_results[key.join("_")][key[0]].sort(function (a,b) {return ((a.morale > b.morale) ? -1 : ((a.morale == b.morale) ? 0: 1))});
            topics_results[key.join("_")][key[1]].sort(function (a,b) {return ((a.morale > b.morale) ? -1 : ((a.morale == b.morale) ? 0: 1))});
        }
    }
    return topics_results
}

// export function getTopicResults(HeroDB) { //  if array type
//     if (topics_results)
//         return topics_results;
    
//     // create topics combos (once for page visit)
//     topics_results = {}
//     var topic_combos = Combinatorics.combination([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], 2).toArray();
//     for (var hero_id in HeroDB) {
//         var this_hero_camping = HeroDB[hero_id].camping;
//         if (!this_hero_camping)
//             continue;
//         for ( var i = 0; i<topic_combos.length; i++) {
//             var key = topic_combos[i];
//             if (!topics_results[key.join("_")]) {topics_results[key.join("_")] = {topics: topic_combos[i]}; topics_results[key.join("_")]["heroes"] = []; topics_results[key.join("_")][key[0]] = [];  topics_results[key.join("_")][key[1]] = []}
//             if (this_hero_camping.topics.includes(key[0]) ) topics_results[key.join("_")][key[0]].push({"_id": HeroDB[hero_id]._id, morale: this_hero_camping.values[key[1]]});
//             if (this_hero_camping.topics.includes(key[1]) ) topics_results[key.join("_")][key[1]].push({"_id": HeroDB[hero_id]._id, morale: this_hero_camping.values[key[0]]});
//             topics_results[key.join("_")]["heroes"].push( {"_id": HeroDB[hero_id]._id, morale: this_hero_camping.values[key[0]]+this_hero_camping.values[key[1]]} );
//             topics_results[key.join("_")]["heroes"].sort(function (a,b) {return ((a.morale > b.morale) ? -1 : ((a.morale == b.morale) ? 0: 1))});
//             topics_results[key.join("_")][key[0]].sort(function (a,b) {return ((a.morale > b.morale) ? -1 : ((a.morale == b.morale) ? 0: 1))});
//             topics_results[key.join("_")][key[1]].sort(function (a,b) {return ((a.morale > b.morale) ? -1 : ((a.morale == b.morale) ? 0: 1))});
//         }
//     }
//     return topics_results
// }

export function markAsRoster(roster, locked) {
    for(var key in topics_results){
        var currArray = topics_results[key];
        for(var id in currArray){
            if (id === 'topics')
                continue;
            for(var i = 0; i < currArray[id].length; i++){
                if (roster.includes(currArray[id][i]._id)) {
                    currArray[id][i].roster = true
                    if ( locked.includes(currArray[id][i]._id) )
                        currArray[id][i].locked = true;
                } else {
                    currArray[id][i].roster = false
                    currArray[id][i].locked = false
                }
            }
        }
    }
}

export function calculateWithoutAdvanced(roster, locked, advanced, HeroDB) {
    var resultsLength = 400;
    var results = new Array(resultsLength).fill({morale: -100, team: []});

    getTopicResults(HeroDB)
    markAsRoster(roster, locked)

    for (var key in topics_results) {
        var currTopicCombo = topics_results[key],
            topics = currTopicCombo.topics;
        for (var i = 0; i < currTopicCombo[topics[0]].length; i++) {
            if (!currTopicCombo[topics[0]][i].roster || (advanced.muteLockedHeroes && currTopicCombo[topics[0]][i].locked) ) {
                continue;
            }
            var c1p = currTopicCombo[topics[0]][i].morale;
            var c1 = currTopicCombo[topics[0]][i]._id;
            for (var w = 0; w < currTopicCombo[topics[1]].length; w++) {
                var c2data = currTopicCombo[topics[1]][w];
                var c2p = c2data.morale;
                var c2 = c2data._id;
                if (!c2data.roster || (advanced.muteLockedHeroes && c2data.locked) ) {
                    continue;
                }

                if (c1 === c2) {
                    for (var i1 = 0; i1 < currTopicCombo.heroes.length; i1++) {
                        c2 = currTopicCombo.heroes[i1];
                        if (!c2.roster || c2._id === c1) continue;
                        for (var i2 = i1+1; i2 < currTopicCombo.heroes.length; i2++) {
                            var canContinue = true;
                            var c3 = currTopicCombo.heroes[i2];
                            if (!c3.roster || c3._id == c1) continue;
                            for (var i3 = i2+1; i3 < currTopicCombo.heroes.length; i3++) {
                                var c4 = currTopicCombo.heroes[i3];
                                if (!c4.roster || c4._id == c1) continue;

                                var morale = 0 + c2.morale + c3.morale + c4.morale;
                                if (results[results.length-1].morale > morale || (advanced.minMorale === true && advanced.morale > morale) ) {
                                    if (i3 == i2+1)
                                        canContinue = false;
                                    break;
                                }

                                for (var y = 0; y < results.length; y++) {
                                    if (morale >= results[y].morale) {
                                        var team = [c1,c2._id,c3._id,c4._id];
                                        if (checkSCDupe(team, HeroDB)) {
                                            break; // dupe character detected
                                        }
                                        if (!(everyLocked(team, locked))) {
                                            break; // Not all locked heroes are included
                                        }
                                        var inTop = alreadyInResults(team, results);
                                        if (inTop === -1) {
                                            results.splice(y, 0,  {_type: 'morale', morale: morale, team: team, topics: topics, holder: [c1, c1]} );
                                            results.splice(resultsLength, 1);
                                        } else if (inTop >= y) {
                                            results.splice(inTop, 1);
                                            results.splice(y, 0,  {_type: 'morale', morale: morale, team: team, topics: topics, holder: [c1, c1]} );
                                        }
                                        break;
                                    }
                                }

                            }
                            if (!canContinue) break;
                        }
                    }
                } else {

                    for (var i1 = 0; i1 < currTopicCombo.heroes.length; i1++) {
                        let canContinue = true;
                        var c3 = currTopicCombo.heroes[i1];
                        if (!c3.roster || c3._id == c1 || c3._id == c2) continue;
                        for (var i2 = i1+1; i2 < currTopicCombo.heroes.length; i2++) {
                            var c4 = currTopicCombo.heroes[i2];
                            if (!c4.roster || c4._id == c1 || c4._id == c2) continue;

                            var morale = c1p + c2p + c3.morale + c4.morale;
                            if (results[results.length-1].morale > morale || (advanced.minMorale === true && advanced.morale > morale) ) {
                                if (i2==i1+1) canContinue = false;
                                break;
                            }

                            for (var y = 0; y < results.length; y++) {
                                if (morale >= results[y].morale) {
                                    var team = [c1,c2,c3._id,c4._id];
                                    if (checkSCDupe(team, HeroDB)) {
                                        break; // dupe character detected
                                    }
                                    if (!(everyLocked(team, locked))) {
                                        break; // Not all locked heroes are included
                                    }
                                    var inTop = alreadyInResults(team, results);
                                    if (inTop === -1) {
                                        results.splice(y, 0,  {_type: 'morale', morale: morale, team: team, topics: topics, holder: [c1, c2]} );
                                        results.splice(resultsLength, 1);
                                    } else if (inTop >= y) {
                                        results.splice(inTop, 1);
                                        results.splice(y, 0,  {_type: 'morale', morale: morale, team: team, topics: topics, holder: [c1, c2]} );
                                    }
                                    break;
                                }
                            }
                        } // for var i2
                        if (!canContinue) break;
                    } // for var i1

                }

            }
        }
    }

    for (var i = 0; i < results.length; i++) {
        if (results[i].team.length<3) { // remove placeholders
            results.splice(i)
            break
        } else { // Sort locked heroes in the team
            results[i].team.sort(function(a){
                return locked.includes(a) ? 1 : -1;
            })
        }
    }

    return results
}