import { getTopicResults, markAsRoster } from './fastWithoutAdvanced.js'
import { checkSCDupe } from './calcUtils.js'
/* eslint-disable */

export default function(roster, locked, HeroDB) {
    for (var lIndex in locked) {
        if (!roster.includes(locked[lIndex]))
            roster.push(locked[lIndex]);
    }

    var results = new Array(200).fill({morale: -100, team: []});
    var topics_results = getTopicResults(HeroDB)
    markAsRoster(roster, locked)

    for (var key in topics_results) {
        var currTopicCombo = topics_results[key];
        var index = null;
        for (var j=0; j<locked.length;j++) {
            for (var i=0; i<topics_results[key].heroes.length;i++)
                if (currTopicCombo.heroes[i]._id == locked[j] &&
                    currTopicCombo.heroes[i].morale > results[results.length-1].morale
                ) {
                    index = i
                    break
                }
        }
        if (!index) continue;
        for (var i = 0; i < currTopicCombo[key.split("_")[0]].length; i++) {
            if (!currTopicCombo[key.split("_")[0]][i].roster) {
                continue;
            }
            var c1p = currTopicCombo[key.split("_")[0]][i].morale;
            var c1 = currTopicCombo[key.split("_")[0]][i]._id;
            for (var w = 0; w < currTopicCombo[key.split("_")[1]].length; w++) {
                var c2p = currTopicCombo[key.split("_")[1]][w].morale;
                //var c1data = currTopicCombo[key.split("_")[1]][w];
                var c2 = currTopicCombo[key.split("_")[1]][w]._id;

                if (!currTopicCombo[key.split("_")[1]][w].roster) {
                    continue;
                }
                var morale = 0;
                if (locked.includes(c1) || locked.includes(c2)) {
                    morale = locked.includes(c1) ? (locked.includes(c2) ? 0 : c1p) : (locked.includes(c2) ? c2p : 0);
                } else {
                    morale = currTopicCombo.heroes[index].morale; 
                }
                for (var y = 0; y < results.length; y++) {
                    if (morale >= results[y].morale) {
                        var team = c1 !== c2 ? [c1,c2]:[c1];

                        locked.forEach(element => {
                            !team.includes(element) ? team.push(element) : null
                        });

                        if (morale === results[y].morale && team.length > results[y].team.length) continue; /* Preoritize smaller teams for more team building flexibility */
                        if (checkSCDupe(team, HeroDB)) {
                            break; /* dupe character detected */
                        }
                        var inTop = -1;
                        for (var k = 0; k<results.length;k++) {
                            if (results[k].morale === -100) break;
                            if (results[k].team.length == team.length && results[k].team.every(y => team.includes(y))) {
                                inTop = k;
                            }
                        }
                        if (inTop === -1) {
                            results.splice(y, 0,  {_type: 'friendship', morale: morale, team: team, topics: [key.split("_")[0], key.split("_")[1] ], holder: [c1, c2]} );
                            results.splice(200, 1);
                        } else if (inTop >= y) {
                            results.splice(inTop, 1);
                            results.splice(y, 0,  {_type: 'friendship', morale: morale, team: team, topics: [key.split("_")[0], key.split("_")[1] ], holder: [c1, c2]} );
                        }
                        break;
                    }
                }
            } // var e
        }// var i
    }

    for (var i = 0; i < results.length; i++) {
        if (results[i].morale===-100) { // remove placeholders
            results.splice(i)
            break
        } else { // Sort locked heroes in the team
            results[i].team.sort(function(a){
                return locked.includes(a) ? 1 : -1;
            })
        }
    }

    return results
} // end of friendship calc