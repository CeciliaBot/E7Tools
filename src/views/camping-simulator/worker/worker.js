import { hasAdvancedSettings, checkSCDupe } from './calcUtils.js'
import { legacyCalculator } from './legacyMethod'
import { calculateWithoutAdvanced } from './fastWithoutAdvanced.js'
import friendshipCalculator from './friendship.js'

function resolve(id, data) {
    postMessage({id: id, type: 'resolve', data: data})
}
function reject(id, data) {
    postMessage({id: id, type: 'reject', error: data})
}
function update(id, data) {
    postMessage({id: id, type: 'update', update: data})
}
if (!Array.prototype.flat) {
    Object.defineProperty(Array.prototype, 'flat', {
      value: function(depth = 1) {
        return this.reduce(function (flat, toFlatten) {
          return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
        }, []);
      }
    })
}

onmessage = function (e) {
    var PROMISE_ID  = e.data.id,
        payload     = e.data.payload,
        operation   = payload.message,
        HeroDB      = payload.HeroDB,
        roster      = payload.roster,
        locked      = payload.locked,
        advanced    = payload.advanced;
    
    if (operation === 'MORALE') {
        if (checkSCDupe(locked, HeroDB)) {
            reject(PROMISE_ID, 'cant_lock_both_sc_normal')
        } else if ( roster.length < 50 || locked.length > 1 || hasAdvancedSettings(advanced) ) {    // if roster is small or 2 locked heroes or has settings use legacy calculator
            try {
                resolve(PROMISE_ID, legacyCalculator(roster, locked, advanced, HeroDB, (val) => update(PROMISE_ID, val) ) )
            } catch (err) {
                reject(PROMISE_ID, err)
            }
        } else {
            try {
                resolve( PROMISE_ID, calculateWithoutAdvanced(roster, locked, advanced, HeroDB) )
            } catch (err) {
                reject(PROMISE_ID, err)
            }
        }
    } else if (operation === 'FRIENDSHIP' ) {
        try {
            resolve(PROMISE_ID, friendshipCalculator(roster, locked, HeroDB) );
        } catch (err) {
            reject(PROMISE_ID, err)
        }
    }
}