<template>
    <div>
        <Header
        />
        <HeroDrawer
            :removable="true"
            :list="list"
            :selected="locked"
            :mobile="mobile"
            @contextualmenu="contextHero"
            @click="lockHero"
            @remove="removeHero"
        />
    </div>
</template>

<script>
import Header from './ManageHeader.vue'
import HeroDrawer from './HeroDrawer.vue'

export default {
    name: 'HeroBox',
    components: {
        Header,
        HeroDrawer
    },
    props: {
        list: {
            type: Array,
            default() {return []}
        },
        locked: {
            type: Array,
            default() {return []}
        },
        mobile: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        removeHero(hero) {
            this.$emit('removeHero', hero);
        },
        lockHero(hero) {
            this.$emit('lockHero', hero);
        },
        contextHero: function (hero, e) {
            //let heroData = this.$store.getters.getHero(hero);
            this.$contextmenu(e, [
                {
                    class: 'far fa-heart',
                    name: this.$t('strings.calculate_friendship'),
                    handler: () => this.$emit('calculateFriendship', hero)
                },
                {
                    class: 'fas fa-link',
                    name: this.$t('strings.view_model'),
                    handler: () => window.open('https://www.e7vau.lt/portrait-viewer.html?id='+this.$store.getters.getHero(hero).id, '_blank').focus()
                },
                {
                    class: 'fas fa-plus',
                    name: this.$t('strings.add_hero'),
                    color: '#4caf50'
                }
            ])
            }
    }
}
</script>

<style>

</style>