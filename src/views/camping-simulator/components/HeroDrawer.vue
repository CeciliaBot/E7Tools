<template>
    <div class="hero-list-box">
        <HeroIcon
            v-for="hero in sortedList"
            v-show="elementMask[hero]"
            :key="hero" 
            :hero="hero"
            :removable="removable"
            :selected="selectedObj[hero]"
            :size="chIconSize"
            :showname="showName"
            :showrarity="showRarity"
            :showrole="showAttrRole"
            :hover="!disableHover"
            @remove="removeHero"
            @click="clickHero"
            @context="context"
        />
    </div>
</template>

<script>
import sortHeroList from '@/utils/sort-heroes.js'

export default {
    name: 'HeroDrawer',
    emits: ['click', 'contextualmenu', 'remove', 'updatedMask'],
    props: {
        iconSize: {
            type: Number,
            default: 75
        },
        list: {
            type: Array,
            default() {return []}
        },
        selected: {
            type: Array,
            default() {return []}
        },
        elementMask: {
            type: Object,
            default() {return {} }
        },
        removable: {
            type: Boolean,
            default: false
        },
        mobile: {
            type: Boolean,
            default: false
        },
        showAttrRole: {
            type: Boolean,
            default: true
        },
        showRarity: {
            type: Boolean,
            default: false
        },
        showName: {
            type: Boolean,
            default: false
        },
        disableHover: {
            type: Boolean,
            default: false
        },
        sorting: {
            type: Array,
            default() { return []}
        },
        skipNextChange: { // skip the next list watcher (filter list) because the character was removed internally
            type: Boolean
        }
    },
    //renderTriggered (e) {console.log('HeroList', e)},
    data() {
        return  {
        }
    },
    computed: {
        sortedList() {
            return sortHeroList(this.list.slice(), this.sorting[0], this.sorting[1]);
        },
        selectedObj() {
            var o = {};
            for (var i=0;i<this.selected.length; i++) {
                o[this.selected[i]] = true;
            }
            return o
        },
        chIconSize: function () {
            try {
                //(mobile) resize icons to fit screen;
                var dsize = this.iconSize;
                if (!this.mobile)
                    return dsize;
                var boxSize = this.$store.state.screenWidth;
                var padding = 1.32; // icon container padding HeroIcon.vue
                if (this.removable) padding = 1.671; // icon padding + remove character icon ("x")
                var w = boxSize-10, fsize = dsize*padding;
                var p = w / fsize;
                return ((w/Math.round(p)-0.5))/padding;
            } catch (err) {
                return this.iconSize
            }
        }
    },
    methods: {
        clickHero(hero, event) {
            this.$emit('click', hero, event)
        },
        context(hero, event) {
            this.$emit('contextualmenu', hero, event)
        },
        removeHero(hero, event) {
            this.$emit('remove', hero, event)
        },
        returnVisibleList() { // external method called by HeroBox.vue and AddHero.vue when needed (Add all and Remove all)
            return this.sortedList.filter( hero => this.elementMask[hero] === true)
        }
    }
}
</script>

<style>

</style>