<template>
    <div>
        <Header
            :mobile="mobile"
            @more="moreMenu"
            @query="updateSearchQuery"
            @filter="toggleFilterModal"
        />
        <HeroDrawer
            :removable="false"
            :list="list"
            :mobile="mobile"
            @contextualmenu="contextHero"
            @click="addHero"
        />
        <FilterModal
            v-show="filterModal"
            ref="filter-modal"
            id="filter-modal-add"
            :sorting="sort"
            :filter="filters"
            @close="toggleFilterModal"
        />
    </div>
</template>

<script>
import Header from './ManageHeader.vue'
import HeroDrawer from './HeroDrawer.vue'
import FilterModal from '@/components/filter-modal.vue'

export default {
    name: 'AddHero',
    emits: ['add', 'addAll'],
    components: {
        Header,
        HeroDrawer,
        FilterModal
    },
    props: {
        list: {
            type: Array,
            default() {return []}
        },
        mobile: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            searchQuery: '',
            sort: ['rarity', false], // sort by, reverse?
            filters: {rarity: [], attribute: [], role: [], zodiac: [], sex: []},
            filterModal: false
        }
    },
    computed: {
        mask() {
            this.filters, this.sort, this.list
            return this.buildFilterMask();
        }
    },
    methods: {
        addHero(hero) {
            console.log(hero)
            this.$emit('add', hero);
        },
        toggleFilterModal(e) {
            if (this.filterModal) this.filterModal = false;
            else {
                this.filterModal = true;
                this.$nextTick(()=>{
                    var box = e.currentTarget.getBoundingClientRect(),
                        filterBox = this.$refs['filter-modal'].$el.children[0].getBoundingClientRect();
                    let posX = window.innerWidth - box.right - box.width/2 - filterBox.width/2;
                    console.log(posX)
                    if (posX<0) posX = 10;
                    this.$refs['filter-modal'].$.props.xy = {
                        top: box.bottom+3 + 'px',
                        right: posX + 'px'
                    }
                })
            } 
            this.mask
        },
        updateSearchQuery(e) {
            this.searchQuery = e;
        },
        buildFilterMask() {
            var obj = {};
            for (var i in this.list) {
                const c = this.list[i]
                const hero = this.$store.getters.getHero(c)
                if (this.$store.getters.getHeroName(c).toLowerCase().indexOf(this.searchQuery.toLowerCase()) === -1) {
                    obj[c] = false;
                    continue;
                }
                for (var f in this.filters) {
                    var v = this.filters[f];
                    if (v.length && !v.includes(hero[f])) {
                        obj[c] = false;
                        continue;
                    }
                }
                obj[c] = true;
            }
            console.log(obj)
            return obj;
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
                    color: '#4caf50',
                    handler: () => this.addHero(hero)
                }
            ])
        },
        moreMenu(e) {
            e.stopPropagation();
            e.preventDefault();
            let box = (e.currentTarget || e.target).getBoundingClientRect();
            var customEventObject = { clientX: box.left, clientY: box.top+box.height }
            this.$contextmenu( customEventObject , [
                {
                    class: 'fas fa-plus',
                    name: this.$t('strings.add_all_in_view'),
                    color: '#4caf50',
                    handler: () => this.$promiseAlert(this.$t('strings.add_all_in_view'),this.$t('strings.add_all_in_view_confirm', [this.list.filter(hero => this.checkFilterHero(hero)).length, 'main']), [this.$t('strings.confirm'), this.$t('strings.cancel')]).then( ([res]) => {if (res === 0) this.$emit('removeAll')}).catch(()=>{})
                },
                {
                    class: 'fas fa-th',
                    name: this.$t('strings.layout'),
                    children: [
                        {
                            class: 'fas fa-check',
                            name: this.$t('strings.ui_icons')
                        }
                    ]
                }
            ], { mobile: this.mobile })
        }
    }
}
</script>

<style>

</style>