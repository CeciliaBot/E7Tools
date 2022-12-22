<template>
    <div style="display: flex; flex-direction: column; height: 100%;">
        <div :class="{'bottom-serachbar': settings.searchbarToBottom}">
            <HeaderBar
                :mobile="mobile"
                @more="moreMenu"
                @query="updateSearchQuery"
                @filter="toggleFilterModal"
            />
        </div>
        <div style="flex: 1; overflow: auto;">
            <HeroDrawer
                ref="HeroDrawer"
                :removable="false"
                :list="list"
                :element-mask="elementMask"
                :sorting="sort"
                :show-attr-role="settings.showHeroAttrRole"
                :show-rarity="settings.showHeroRarity"
                :show-name="settings.showHeroName"
                :disable-hover="settings.disableHeroIconHover"
                :mobile="mobile"
                @contextualmenu="contextHero"
                @click="addHero"
            />
        </div>
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
import HeaderBar from './ManageHeader.vue'
import HeroDrawer from './HeroDrawer.vue'
import FilterModal from '@/components/filter-modal.vue'
import { computePosition, shift, flip, offset } from '@floating-ui/dom';

import filterHero from '../util/filter-hero.js'
import heroInfoWindow from '../util/heroInfoWindow.js'

export default {
    name: 'AddHero',
    emits: ['add', 'addAll'],
    components: {
        HeaderBar,
        HeroDrawer,
        FilterModal
    },
    props: {
        list: {
            type: Array,
            default() { return [] }
        },
        settings: {
            type: Object,
            default: () => { return {} }
        },
        mobile: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            sort: ['rarity', false], // sort by, reverse?
            filters: {name: '', rarity: [], attribute: [], role: [], zodiac: [], sex: []},
            filterModal: false,
            elementMask: {},

            skipHeroDrawerChange: false
        }
    },
    watch: {
        filters: {
            deep: true,
            handler() {
                this.setMask();
            }
        },
        list: {
            deep: true,
            immediate: true,
            handler() {
                if (!this.skipHeroDrawerChange)     // don't filter if the mutation was done inside the component
                    this.setMask();
            }
        }
    },
    updated() {console.log('Updated AddHero')},
    //renderTriggered (e) {console.log('AddHero', e)},
    methods: {
        addHero(hero) {
            this.skipHeroDrawerChange = true;
            this.$emit('add', hero)
            this.$nextTick( () => {
                this.skipHeroDrawerChange=false
            })
        },
        toggleFilterModal(e) {
            if (this.filterModal) this.filterModal = false;
            else {
                this.filterModal = true;
                this.$nextTick(()=>{
                    computePosition(e.currentTarget || e.target, this.$refs['filter-modal'].$el.firstChild, {
                        strategy: 'fixed',
                        placement: 'bottom',
                        middleware: [
                            shift(),
                            flip(),
                            offset(5)
                        ]
                    }).then( ({x, y}) => {
                        this.$refs['filter-modal'].$.props.xy = {
                            top: y+'px',
                            left: x+'px'
                        }
                    })
                })
            }
        },
        updateSearchQuery(e) {
            this.filters.name = e;
        },
        setMask() {
            this.list.forEach(hero => {
                this.elementMask[hero] = filterHero(this.$store.getters.getHeroName(hero), this.$store.getters.getHero(hero), this.filters)
            })
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
                    class: 'fa fa-info-circle',
                    name: 'Hero info',
                    handler: () => {
                        heroInfoWindow(hero, this)
                    }
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
            var customEventObject = { clientX: box.left, clientY: !this.settings.searchbarToBottom ? box.top+box.height : box.top-10 }
            this.$contextmenu( customEventObject , [
                {
                    class: 'fas fa-plus',
                    name: this.$t('strings.add_all_in_view'),
                    color: '#4caf50',
                    handler: () => {
                        var list = this.$refs.HeroDrawer.returnVisibleList();
                        this.$promiseAlert(this.$t('strings.add_all_in_view'),this.$t('strings.add_all_in_view_confirm', [list.length, 'your roster']), [this.$t('strings.confirm'), this.$t('strings.cancel')]).then( ([res]) => {if (res === 0) this.$emit('addAll', list)}).catch(()=>{})
                    }
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