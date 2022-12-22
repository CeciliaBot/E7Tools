<template>
    <div>

    </div>
</template>

<script>
import lvl85 from './GearData.js'
function get_summing_subsets(set_arr, target, within = 5){
     let finish = [];
     let working = [[]];
     while (working.length){
         let next_work = []
         var breaker = false
         for (let i = 0; i < working.length; i++){
            if (working[i].length === within ) {
                breaker = true;
                break
            }
             for (let j = 0; j < set_arr.length; j++){
                 let subset = working[i].concat([set_arr[j][0]]);
                 let sum = subset.reduce((a,b) => a + b, 0);
                 if (sum <= target){
                     (sum == target ? finish : next_work).push(subset);
                 }
             }
         }
         if (breaker)
            break;
         working = next_work
     }
     return finish;
}

const combineObjects = ([head, ...[headTail, ...tailTail]]) => {
  if (!headTail) return head

  const combined = headTail.reduce((acc, x) => {
    return acc.concat(head.map(h => ({...h, ...x})))
  }, [])

  return combineObjects([combined, ...tailTail])
}
export default {
    props: {
        quality: {
            required: false,
            default: 'epic'
        },
        rolls: {
            required: true,
            type: Array
        }
    },
    created() {
        // var a = [];

    },
    watch: {
        rolls: {
            deep: true,
            handler() {
                this.findPossibleCombo(this.quality, this.rolls)
            }
        }
    },
    methods: {
        findPossibleCombo(quality, stats) {
            var combos = {}
            var rolls = [null,null,null,'rare','heroic','epic'].indexOf(quality)
            for (var i=0;i<stats.length;i++) {
                let sub = stats[i]
                if (!sub.type || !sub.value) {
                    break
                }
                combos[sub.type] = []
                var possibleRolls = get_summing_subsets(lvl85[sub.type][quality], Number(sub.value), rolls+1)
                possibleRolls.forEach(rolls => {
                    if (!combos[sub.type][rolls.length])
                        combos[sub.type][rolls.length] = rolls
                })
            }
            // var totalRolls = rolls + 4
            var objected = Object.keys(combos).map(key => { return combos[key].map(roll => { return {[key]: roll }}) })
            console.log(objected)
            console.log(combineObjects(objected))
        }
    }
}
</script>

<style>

</style>