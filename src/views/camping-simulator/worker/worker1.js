/* global importScripts, Combinatorics */
/* eslint-disable */
importScripts('https://cdn.jsdelivr.net/npm/js-combinatorics@0.5.5/combinatorics.min.js');
var topics = [
    "Criticism",
    "Reality Check",
    "Heroic Tale",
    "Comforting Cheer",
    "Cute Cheer",
    "Heroic Cheer",
    "Sad Memory",
    "Joyful Memory",
    "Happy Memories",
    "Unique Comment",
    "Self-Indulgent",
    "Occult",
    "Myth",
    "Bizarre Story",
    "Food Story",
    "Horror Story",
    "Gossip",
    "Dream",
    "Advice",
    "Complain",
    "Belief",
    "Interesting Story"
];
var topics_results = {};



var AoEHeroes = [];
var dispelHeroes = [];
var cleanserHeroes = [];
var scHeroes = {
    "kluri": "falconer-kluri",
    "butcher-corps-inquisitor": "chaos-inquisitor",
    "roozid" : "righteous-thief-roozid",
    "helga": "mercenary-helga",
    "church-of-ilryos-axe": "chaos-sect-axe",
    "rikoris": "captain-rikoris",
    "lorina": "commander-lorina",
    "hazel": "mascot-hazel",
    "montmorancy": "angelic-montmorancy",
    "carrot": "researcher-carrot",
    "wanda": "allrounder-wanda",
    "ras": "adventurer-ras",
    "pearlhorizon": "doll-maker-pearlhorizon",
    "doris": "magic-scholar-doris",
    "carmainerose": "zealot-carmainerose",
    "rima": "muse-rima",
    "pyllis": "shadow-knight-pyllis",
    "glenn": "vigilante-leader-glenn",
    "adin": "verdant-adin"
};






function buildTopicCombos () {
    var a = [];
    for (var i = 0; i<topics.length; i++) {
        a.push(topics[i]) // pass i if hero.camping.values is array 
    }
    return Combinatorics.combination( a , 2 ).toArray();
}
function buildTopicResults(HeroDB) {
    if (Object.keys(topics_results).length === 0) { // create topics combos (once for page visit)
        var topic_combos = buildTopicCombos();
        for (var hero_id in HeroDB) {
            if (!HeroDB[hero_id].camping || !HeroDB[hero_id].camping.values) continue;
            for ( var i = 0; i<topic_combos.length; i++) {
                var key = topic_combos[i];
                if (!topics_results[key.join("_")]) {topics_results[key.join("_")] = {}; topics_results[key.join("_")]["heroes"] = []; topics_results[key.join("_")][key[0]] = [];  topics_results[key.join("_")][key[1]] = []}
                if (HeroDB[hero_id].camping.topics.includes(key[0]) ) topics_results[key.join("_")][key[0]].push({"_id": HeroDB[hero_id]._id, score: HeroDB[hero_id].camping.values[key[1]]})
                if (HeroDB[hero_id].camping.topics.includes(key[1]) ) topics_results[key.join("_")][key[1]].push({"_id": HeroDB[hero_id]._id, score: HeroDB[hero_id].camping.values[key[0]]});
                topics_results[key.join("_")]["heroes"].push( {"_id": HeroDB[hero_id]._id, score: HeroDB[hero_id].camping.values[key[0]]+HeroDB[hero_id].camping.values[key[1]]} );
                topics_results[key.join("_")]["heroes"].sort(function (a,b) {return ((a.score > b.score) ? -1 : ((a.score == b.score) ? 0: 1))});
                topics_results[key.join("_")][key[0]].sort(function (a,b) {return ((a.score > b.score) ? -1 : ((a.score == b.score) ? 0: 1))});
                topics_results[key.join("_")][key[1]].sort(function (a,b) {return ((a.score > b.score) ? -1 : ((a.score == b.score) ? 0: 1))});
            }
        }
    }
}
function markTeamMembers(topics_results, roster, locked) {
    for(var key in topics_results){
        var currArray = topics_results[key];
        for(var id in currArray){
            for(var i = 0; i < currArray[id].length; i++){
                if(roster.includes(currArray[id][i]._id) || locked.includes(currArray[id][i]._id)){
                    currArray[id][i].roster = true;
                } else {
                    currArray[id][i].roster = false;
                }
            }
        }
    }
}
function getRemainingMembers (holder_score, team, currTopicCombo, results, callback) {
    for (var i1=0;i1<currTopicCombo.heroes.length;i1++) {
        var shouldBreak2 = false;
        var c2 = currTopicCombo.heroes[i1]._id;
        if (!currTopicCombo.heroes[i1].roster || team.includes(c2)) continue;
        for (var i2=i1+1;i2<currTopicCombo.heroes.length;i2++) {
            var shouldBreak1 = false;
            var c3 = currTopicCombo.heroes[i2]._id;
            if (!currTopicCombo.heroes[i2].roster || team.includes(c3)) continue;
            if (team.length===2) {
                var score = holder_score + currTopicCombo.heroes[i1].score + currTopicCombo.heroes[i2].score;
                if ( results[results.length-1].morale > score ) {
                    if (i2 === i1+1) shouldBreak2 = true;
                    break;
                }
                callback([c2,c3], score);
            } else {
                for (var i3=i2+1;i3<currTopicCombo.heroes.length;i3++) {
                    var c4 = currTopicCombo.heroes[i3]._id;
                    if (!currTopicCombo.heroes[i3].roster || team.includes(c4)) continue;
                    score = currTopicCombo.heroes[i1].score + currTopicCombo.heroes[i2].score + currTopicCombo.heroes[i3].score;
                    if ( results[results.length-1].morale > score ) {
                        if (i3 === i2+1) shouldBreak1 = true;
                        break;
                    }
                    callback([c2,c3,c4], score);
                }
                if (shouldBreak1) break; 
            }
        }
        if (shouldBreak2) break;
    }
}
function teamAlreadyInResults(team,top) {
    if (top.length > 0 ) {
        for (var i = 0; i<top.length;i++) {
            if (top[i].morale === -100) break;
            if (top[i].team.includes(team[0]) && top[i].team.includes(team[1]) && top[i].team.includes(team[2]) && top[i].team.includes(team[3]) ) {
                return i;
            }
        }
    }
    return -1;
}
function cleanUpExperimentalResults (results, locked) {
    for (var i = 0; i < results.length; i++) {
        if (results[i].team.length<3) { // remove placeholders
            results.splice(i);
            break;
        } else { // Sort locked heroes in the team
            results[i].team.sort(function(a){
                return locked.includes(a) ? 1 : -1;
            })
        }
    }
}
function cartesianCombos(array) {
    var results = [[]];
    for (var i = 0; i < array.length; i++) {
        var currentSubArray = array[i];
        var temp = [];
        for (var j = 0; j < results.length; j++) {
            for (var k = 0; k < currentSubArray.length; k++) {
                if ( hasDuplicates(results[j].concat(currentSubArray[k])) ) continue;
                temp.push(results[j].concat(currentSubArray[k]));
            }
        }
        results = temp;
    }
    return results;
}
function teamCampingCalculator(team, locked, HeroDB, muteLocked) {
    var table = [];
    for (var i=0; i<team.length;  i++) {
        var hero = team[i];
        if (!HeroDB[hero].camping.topics) continue;
        if ( muteLocked && locked.includes(hero) ) continue;
        for (var j=0; j<HeroDB[hero].camping.topics.length; j++) {
            var obj = {hero: hero, topic: HeroDB[hero].camping.topics[j], score: 0};
            for (var k=0;k<team.length;k++) {
                if (i===k) continue;
                obj.score += HeroDB[team[k]].camping.values[obj.topic];
            }
            table.push(obj)
        }
    }
    if (table.length===0) return null;

    table.sort(function(a, b) {
        return ((a.score > b.score) ? -1 : ((a.score == b.score) ? 0 : 1));
    });

    while (table[0].topic === table[1].topic) {
        table.splice(1, 1);
    }

    return {
        morale: table[0].score + table[1].score,
        scores: [table[0].score, table[1].score],
        topics: [table[0].topic, table[1].topic],
        holder: [table[0].hero, table[1].hero],
        // variations: team.map(hero => { /* Variation for each character */
        //     return (hero !== table[0].hero ? HeroDB[hero].camping.values[table[0].topic] : 0) + (hero !== table[1].hero ? HeroDB[hero].camping.values[table[1].topic] : 0)
        // }),
        team: team
    }
}
/****************** Team Checkers *******************/
function countRoles(match) {
    if (!match) return 0;
    var i=0;
    for (var role in match) {
        i+= match[role];
    }
    return i;
}
function everyLocked(team, lock) {
    for (var i = 0; i < lock.length; i++) {
      if (!team.includes(lock[i])) {
        return false;
      }
    }
    return true;
}
function checkScDupe (team) {
    for (var i = 0; i<team.length; i++){
        if (scHeroes[team[i]] && team.includes(scHeroes[team[i]])) {
            return true;
        }
    }
    return false;
}
function hasDuplicates(array) {
    return array.some((val, i) => array.indexOf(val) !== i);
}
function checkHeroClassAttribute(team, HeroDB, match, key, fixed) {
    var o = {};
    for (var i = 0; i < team.length; i++) {
        var cKey = HeroDB[team[i]][key];
        o[cKey] = (o[cKey]||0) + 1;
    }
    for (const role in match) {
        if (!o[role] || o[role] < match[role] || (fixed && o[role] !== match[role]) )
            return false;
    }

    return true;
}



/********************************* HANDLE MESSAGE *********************************/
onmessage = function (e) {
    var data = e.data.payload,
        operation = data.message,
        promiseId = e.data.id,
        HeroDB = data.HeroDB,
        locked = data.locked || [],
        roster = data.roster || [],

        advanced = data.advanced || {},
        roles = advanced.role,
        fixedRoles = advanced.fixedNumberOfAttributes,
        attributes = advanced.attribute,
        fixedAttributes = advanced.fixedNumberOfAttributes,
        debuffs = advanced.debuffs || [],
        buffs = advanced.buffs || [],
        muteLockedHeroes = advanced.muteLockedHeroes,
        AoE = advanced.aoe,
        noS1debuffs = advanced.noS1debuffs,
        noDebuffs = advanced.noDebuffs,
        mustIncludeDispel = advanced.includeDispel,
        mustIncludeCleanser = advanced.includeCleanser,
        cartesian = advanced.cartesianLock || [[],[],[],[]];

        for (i = 0; i<locked.length; i++) {
            if (roster.includes(locked[i])) {
                roster.splice( roster.indexOf(locked[i]), 1)
            }
        }

    if (operation === 'BOOT_OPERATIONS') {
    /********************************* Prepare data (Boot) *********************************/
        buildTopicResults(HeroDB);
    } else if (operation === 'URL') {
        var ids = [], _ids = [], dbo = Object.values(HeroDB)
        dbo.sort( (a,b) => { return a.id > b.id ? -1 : 1})

        for (i=0;i<dbo.length;i++) {
            let h = dbo[i];
            if (!h.id) continue;
            var p = Number(h.id.charAt(1))
            var nid = Number(h.id.slice(2));
            if (!ids[p]) ids[p] = [], _ids[p] = [];
            ids[p][nid] = roster.includes(h._id) ? 1 : null;
            _ids[p][nid] = h._id;
        }
        console.log(ids)
        var newIds = [];
        for (i = 0; i<ids.length;i++) {
            var ia = ids[i];
            if (!newIds[i]) newIds[i] = [];
            if (!ia) {
                newIds[i].push([0,0]);
                continue;
            }
            for (j = 0; j<ids[i].length;j++) {
                var n = ia[j];
                if (!n) n = 0, ids[i][j] = 0;
                if (j>0 && ia[j-1]==n) {
                    let t = newIds[i][newIds[i].length-1];
                    t[1]++
                } else newIds[i].push([n,1]);
                
            }
        }
        let toString = newIds.map(arra => arra.map( x => {return x[1]}).join('x')).join('-');
        //0l
        //1x8x1x15x2x14x1x3x1x5x2x2x7x1x2x3x1x6x1x1x2x5x1x13x1x21x1x3x1x1x1x5l2x14x1x6x1x1x2x3x1x3x1x5x2x2x2x5x2x2x7x1x2x1x4x1x1x3x4x1x2x1x2x2x2x1x5x1x7x1x6x2
        //l1x6x4x5x5x6x4x5x5x5x5x5x5x5x5x5x8x1x6x5x5x5x7x1x7x5x5x5x7x1
        //l1x1x1x1x1x1x7x1x9x1x1x1x8x2x5x2x1x1x6x1x10x1x2x1x5x1x1x1x29x1x40l
        //1x1x2x1x11x1x7x1x25x1x20x1
        //l8x1x53x1
        //http://localhost:8080/e7tools/#/camping-simulator#roster=18x1x194x1x36x1x4&version=1
        return postMessage({id: promiseId, risultati: toString});
    } else if (operation === 'FRIENDSHIP') {
        buildTopicResults(HeroDB);
        markTeamMembers(topics_results, roster, locked);
        let results = new Array(200).fill({morale: -100, team: []})
        for (var key in topics_results) {
            var currTopicCombo = topics_results[key];
            var keys = key.split("_");
            var index = null;
            for (var j=0; j<locked.length;j++) {
              for (var i=0; i<topics_results[key].heroes.length;i++)
                if (currTopicCombo.heroes[i]._id == locked[j])
                  if (currTopicCombo.heroes[i].score > results[results.length-1].morale) index = i;
            }
            if (!index) continue;
            for (i = 0; i < currTopicCombo[keys[0]].length; i++) {
                if (!currTopicCombo[keys[0]][i].roster) {
                    continue;
                }
                var c1p = currTopicCombo[keys[0]][i].score;
                var c1 = currTopicCombo[keys[0]][i]._id;
                for (var w = 0; w < currTopicCombo[keys[1]].length; w++) {
                    var c2p = currTopicCombo[keys[1]][w].score;
                    var c2 = currTopicCombo[keys[1]][w]._id;
                    if (!currTopicCombo[keys[1]][w].roster) {
                        continue;
                    }
                    var score = 0;
                    if (locked.includes(c1) || locked.includes(c2)) {
                      score = locked.includes(c1) ? (locked.includes(c2) ? 0 : c1p) : (locked.includes(c2) ? c2p : 0);
                    } else {
                      score = currTopicCombo.heroes[index].score; 
                    }
                    for (var y = 0; y < results.length; y++) {
                        if (score >= results[y].morale) {
                            var team = c1 != c2 ? [c1,c2]:[c1];
                            for (j=0; j<locked.length; j++) {
                              if (!team.includes(locked[j])) team.push(locked[j]);
                            }
                            if (score === results[y].morale && team.length > results[y].team.length) continue; /* Preoritize smaller teams for more team building flexibility */
                            if (checkScDupe(team)) {
                                break; /* dupe character detected */
                            }
                            var inTop = teamAlreadyInResults(team, results);
                            var res = {
                                morale: score,
                                team: team,
                                holder: [c1,c2],
                                topics: [keys[0],keys[1]],
                                scores: [0,0]
                            }
                            if (inTop === -1) {
                                results.splice(y, 0,  res );
                                results.splice(200, 1);
                            } else if (inTop >= y) {
                                results.splice(inTop, 1);
                                results.splice(y, 0,  res );
                            }
                            break;
                        }
                    }
                } // var e
            }// var i
        }
        for (i = 0; i < results.length; i++) {
            if (results[i].morale==-100) { // remove placeholders
                results.splice(i);
                break;
            } else { // Sort locked heroes in the team
                results[i].team.sort(function(a){
                    return locked.includes(a) ? 1 : -1;
                })
            }
        }
        return postMessage({id: promiseId, risultati: results});
    } else if (operation === 'CHARACTER_SYNERGY') {
    /********************************* Find Synergetic Heroes *********************************/
        console.log(HeroDB)
        var h = locked[0],
            c = HeroDB[h].camping.values,
            cArray = Object.keys(c).map(t => {return [t,c[t]]}).sort( (a,b) => a[1] > b[1] ? -1 : 1),
            a = [];
        for (i in HeroDB) {
            const currH = HeroDB[i];
            if (!currH.camping || !currH.camping.values) continue;
            const o = currH.camping.values;
            var l=[];
            cArray.forEach( t => l.push([t[0], o[t[0]]]))
            a.push([i].concat(l));
        }
        a.sort( (a,b) => a[1][1]+a[2][1] > b[1][1]+b[2][1] ? -1 : 1 )
        return postMessage({id: promiseId, risultati: a.map(h => h[0])});
    } else if (operation === 'CALCULATE_MORALE') {
    /********************************* CALCULATE *********************************/
        var results = new Array(200).fill({morale: -100, team: []}),
            hasAdvSettings,
            nRoles = countRoles(roles),
            nAttributes = countRoles(attributes),
            isCartesian = cartesian.flat().length ? true : false;

        if (locked.length + cartesian.filter(slot => {return slot.length>0}).length + nRoles > 4 || locked.length + cartesian.filter(slot => {return slot.length>0}).length + nAttributes > 4) {
            return postMessage({id: promiseId, error: 'team_size_exceded'});
        }
        if (checkScDupe(locked)) {
            return postMessage({id: promiseId, error: 'error_sc_and_base_form_locked'});
        }
        if (isCartesian || nRoles || nAttributes || locked.length>1) {
            hasAdvSettings = true;
        }


        if (!hasAdvSettings) {
            buildTopicResults(HeroDB);
            markTeamMembers(topics_results, roster, locked);
            for (var key in topics_results) {
                var currTopicCombo = topics_results[key];
                var keys = key.split("_");
                for (var i = 0; i < currTopicCombo[keys[0]].length; i++) {
                    if (!currTopicCombo[keys[0]][i].roster || muteLockedHeroes && locked.includes(currTopicCombo[keys[0]][i]._id) ) {
                        continue;
                    }
                    var c1 = currTopicCombo[keys[0]][i]._id;
                    for (var w = 0; w < currTopicCombo[keys[1]].length; w++) {
                        var c2 = currTopicCombo[keys[1]][w]._id;
                        if (!currTopicCombo[keys[1]][w].roster || muteLockedHeroes && locked.includes(c2) ) {
                            continue;
                        }
                        var t = [c1];
                        var scoreHolders = 0;
                        if (c1!==c2) {
                            t.push(c2);
                            scoreHolders = currTopicCombo[keys[0]][i].score + currTopicCombo[keys[1]][w].score;
                        }
                        getRemainingMembers(scoreHolders, t, currTopicCombo, results, function (heroes, score) {
                            var team = [].concat(t,heroes);
                            if (!everyLocked(team, locked)) {
                                return; // because some locked heroes are missing continue
                            }
                            if (checkScDupe(team)) {
                                return; // dupe character detected
                            }
                            for (var y = 0; y < results.length; y++) {
                                if (score >= results[y].morale) {
                                    var res = {
                                        morale: score,
                                        team: team,
                                        holder: [c1,c2],
                                        topics: [keys[0],keys[1]],
                                        scores: [0,0]
                                    }
                                    var inTop = teamAlreadyInResults(team, results);
                                    if (inTop === -1) {
                                        results.splice(y, 0, res );
                                        results.splice(200, 1);
                                    } else if (inTop >= y) {
                                        results.splice(inTop, 1);
                                        results.splice(y, 0, res );
                                    }
                                    break;
                                }
                            }
                        })
                    }
                }
            }
            cleanUpExperimentalResults(results, locked);
        } else if (locked.length === 4) {/******************************* JUST ONE POSSIBLE TEAM *******************************************/
            results = [teamCampingCalculator(locked, [], HeroDB, false)]
        } else {/******************************* CALCULATE WITH ADVANCED *******************************************/
            for (var j1=0; j1 < cartesian.length; j1++){ /* Remove empty slots */
                if (!cartesian[j1].length) {cartesian.splice(j1, 1);j1--}
            }
            if (isCartesian) { /* Remove cartesian locked heroes from roster */
                for (j1 = 0; j1 < roster.length; j1++){
                    var tmp = cartesian.flat();
                    if (tmp.includes(roster[j1]) ) {roster.splice(j1, 1);j1--}
                }
            }
            if ((cartesian.length + locked.length) < 4 && roster.length < 4-(cartesian.length + locked.length)) { // can't calculate not enough heroes to fill remaining slots
                return postMessage({id: promiseId, error: "not_enough_heroes"});
            } else if ( (cartesian.length + locked.length + nRoles) > 4 || (cartesian.length + locked.length + nAttributes) > 4) { // Too many locked heroes
                return postMessage({id: promiseId, error: "team_size_exceeded"});
            }
            if (!roster.length) roster = ['ras']; // add placeholder ras to avoid uncaught exceptions
            var cartCombos = [[]];
            if (isCartesian) cartCombos = cartesianCombos(cartesian);
            var currIndex = 0,
                lastProgress = -1,
                tot = Combinatorics.bigCombination(roster,(4-locked.length-cartCombos[0].length)||1).length * cartCombos.length;
            cartCombos.forEach( (combo,i) => {
                let l = 4-locked.length-combo.length;
                Combinatorics.bigCombination(roster, l>0?l:1).forEach(teamComb => {
                    //Progress Bar
                    currIndex++
                    const pNow = Math.round(currIndex * 100 / tot);
                    if (lastProgress !== pNow)
                        lastProgress = pNow,
                        postMessage({id: promiseId, "update": pNow });

                    if (combo.length + locked.length>3) teamComb = []; // Se locked = 4 allora team deve riportare array vuota
                    var team = teamComb.concat( combo, locked );
                    let toFilter = teamComb;

                    if (!locked.every(i => team.includes(i)))
                        return;

                    if (checkScDupe(team))
                        return;

                    if (nRoles > 0 && !checkHeroClassAttribute(toFilter, HeroDB, roles, 'role', fixedRoles))
                        return;

                    if (nAttributes > 0 && !checkHeroClassAttribute(toFilter, HeroDB, attributes, 'attribute', fixedAttributes))
                        return;

                    if (buffs.length > 0 && !buffs.every(i => toFilter.map(function (hero) { return HeroDB[hero].buffs }).flat().includes(i)))
                        return;

                    if (debuffs.length > 0 && !debuffs.every(i => toFilter.map(function (hero) { return HeroDB[hero].debuffs }).flat().includes(i)))
                        return;

                    if (noS1debuffs && toFilter.map(function (hero) { return HeroDB[hero].skills[0].debuff }).flat().filter(function (team) {return team != 20 && team != 25 && team != 21 && team != 24}).length != 0)
                        return;

                    if (noDebuffs && toFilter.map(function (hero) { return HeroDB[hero].debuffs }).flat().filter(function (team) {return team != 20 && team != 25 && team != 21 && team != 24}).length != 0)
                        return;

                    if (AoE && !AoEHeroes.some(i => toFilter.includes(i)) )
                        return;

                    if (mustIncludeDispel && !dispelHeroes.some(i => toFilter.includes(i)))
                        return;

                    if (mustIncludeCleanser && !cleanserHeroes.some(i => toFilter.includes(i)))
                        return;

                    let thisTeamResult = teamCampingCalculator(team, locked, HeroDB, muteLockedHeroes);
                    
                    if (!thisTeamResult)
                        return;

                    if (results[results.length-1].morale >= thisTeamResult.morale)
                        return;

                    for (var i = 0; i<results.length;i++) {
                        if (thisTeamResult.morale >= results[i].morale) {
                            results.splice( i, 0, thisTeamResult );
                            results.splice( 200, 1 );
                            break;
                        }
                    }
                });
            })
            if (!results[results.length-1].team.length) {
                for (var j = 0; j < results.length; j++) {
                    if (!results[j].team.length) { // remove placeholders
                        results.splice(j);
                        break;
                    }
                }
            }
        }
        return postMessage({id: promiseId, risultati: results});
    }
}