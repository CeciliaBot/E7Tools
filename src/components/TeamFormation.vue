<template>
    <div class="team-comp" :style="{fontSize: this.boxSize + 'px'}" tabindex="-1" @blur="blur">
        <div v-for="(slot, i) in positionSlots" :key="slot" :class="['team-pos-cont', slot]" @click="clickSlot($event, i)">
            <div style="position: relative; height: 100%; width: 100%">
                <HeroIcon v-if="team[i]" class="hero-icon-pos" :key="team[i]" :hero="team[i]" :hover="false" :size="boxSize*0.65" :showrole="true" :showname="false" :removable="false" :lazylaod="false" style="padding: 0;" />
                <div v-else-if="add"  class="focus-icon">
                    <img :src="require('@/assets/hero_config_btn_add.png')" />
                </div>
                <template v-if="this.focused!==undefined">
                    <div v-if="this.focused!==i" class="focus-icon">
                        <img :src="require('@/assets/hero_config_btn_change.png')" />
                    </div>
                    <div v-else-if="canRemove(this.team[i])" class="focus-icon">
                        <img :src="require('@/assets/hero_config_btn_remove.png')" />
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
import { toRaw } from 'vue'

function swapPosition (old,newPos,list) {
    var b = list[newPos];
    list[newPos] = list[old];
    list[old] = b;
}
export default {
    name: 'team-comp',
    props: {
        team: {
            default: () => []
        },
        size: {
            default: 100
        },
        editable: {
            default: true
        },
        add: {
            default: false
        },
        remove: {
            default: false
        },
        removeOriginal: {
            default: false
        }
    },
    data: function () {
        return {
            positionSlots: ['right','top','left','bottom'],
            focused: undefined,
            originalCopy: toRaw(this.team).slice()
        }
    },
    computed: {
        boxSize: function () {
            return this.size
        }
    },
    methods: {
        canRemove(hero) {
            return this.remove && ( this.removeOriginal || !this.originalCopy.includes(hero) )
        },
        clickSlot: function (e,i) {
            e.stopPropagation();
            if (this.editable)
                if (this.add && this.focused===undefined && !this.team[i])
                    return this.addToSlot(i)
                else if (this.focused===undefined) {
                    this.focused = i;
                } else {
                    if (i===this.focused && this.canRemove(this.team[i]) )
                        this.removeFromTeam(i);
                    else
                        swapPosition(this.focused, i, this.team);
                    this.focused = undefined;
                }
        },
        addToSlot(index) {
            var hero = 'cecilia'
            // eslint-disable-next-line
            this.team[index] = hero
            this.$emit( 'added', hero )
        },
        removeFromTeam: function (i) {
            var hero = this.team[i];
            // eslint-disable-next-line
            this.team.splice(i, 1, undefined);
            this.$emit( 'removed', hero )
        },
        blur: function () {
            this.focused = undefined;
        }
    }
}
</script>
<style scoped>
.team-comp {
    position: relative;
    display: inline-block;
    height: 1.65em;
    width: 2.3em;
    vertical-align: middle;
}
.team-pos-cont {
    display: inline-block;
    height: 0.52em;
    width: 0.9em;
    position: absolute;
    text-align: center;
    background-image: url('@/assets/hero_config_bg.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position-y: bottom;
}
.team-pos-cont.top {
    left: 50%;
    top: 29%;
    transform: translateX(-50%);
}
.team-pos-cont.bottom {
    left: 50%;
    bottom: 6%;
    transform: translateX(-50%);
    z-index: 1;
}
.team-pos-cont.left {
    left: 0;
    top: 63%;
    transform: translateY(-50%);
}
.team-pos-cont.right {
    right: 0;
    top: 60%;
    transform: translateY(-50%);
    background-image: url('@/assets/hero_config_panelleader.png');
    z-index: 1;
}
.hero-icon-pos {
    position: absolute;
    top: -0.45em;
    left: 50%;
    transform: translateX(-50%);
    padding: 0;
}
.focus-icon {
    position: absolute;
    bottom: 15%;
    left: 50%;
    transform: translateX(-50%);
    height: 0.5em;
    width: 0.5em;
    border-radius: 50%;
}
.focus-icon > img {
    position: absolute;
    height: 0.5em;
    transform: translateX(-50%);
}
</style>