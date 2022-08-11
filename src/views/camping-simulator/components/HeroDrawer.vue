<template>
    <div class="hero-list-box">
        <HeroIcon
            v-for="hero in list"
            :key="hero" 
            :hero="hero"
            :removable="removable"
            :selected="selectedObj[hero]"
            :size="chIconSize"
            @remove="removeHero"
            @click="clickHero"
            @context="context"
        />
    </div>
</template>

<script>
export default {
    name: 'HeroDrawer',
    emits: ['click', 'contextualmenu', 'remove'],
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
        removable: {
            type: Boolean,
            default: false
        },
        mobile: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        selectedObj() {
            var o = {};
            for (var i=0;i<this.selected.length; i++) {
                o[this.selected[i]] = true;
            }
            return o
        },
        chIconSize: function () {
            //(mobile) resize icons to fit screen;
            var dsize = this.iconSize;
            if (!this.mobile)
                return dsize;
            var padding = 1.32; // icon container padding HeroIcon.vue
            if (this.removable) padding = 1.671; // icon padding + remove character icon ("x")
            var w = this.$store.state.screenWidth-10, fsize = dsize*padding;
            var p = w / fsize;
            return ((w/Math.round(p)-0.5))/padding;
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
        }
    }
}
</script>

<style>

</style>