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
                :removable="true"
                :list="list"
                :selected="locked"
                :elementMask="elementMask"
                :sorting="sort"
                :show-attr-role="settings.showHeroAttrRole"
                :show-rarity="settings.showHeroRarity"
                :show-name="settings.showHeroName"
                :disable-hover="settings.disableHeroIconHover"
                :mobile="mobile"
                @contextualmenu="contextHero"
                @click="lockHero"
                @remove="removeHero"
            />
        </div>
        <FilterModal
            v-show="filterModal"
            ref="filter-modal"
            id="filter-modal-add"
            :sorting="sort"
            :filter="filters"
            :extrasort="[{name: 'date', id: 'recent'}]"
            @close="toggleFilterModal"
        >
            <span @click="lockedHeroesOnly=!lockedHeroesOnly">
                <span style="pointer-events: none;">
                    <Checkbox :checked="lockedHeroesOnly">
                        {{ $t('strings.locked_heroes_only_filter') }}
                    </Checkbox>
                </span>
            </span>
        </FilterModal>
    </div>
</template>

<script>
import HeaderBar from './ManageHeader.vue'
import HeroDrawer from './HeroDrawer.vue'
import FilterModal from '@/components/filter-modal.vue'
import Checkbox from '@/layout/GameStyleCheckbox.vue'
import { computePosition, shift, flip, offset } from '@floating-ui/dom';

import filterHero from '../util/filter-hero.js'
import heroInfoWindow from '../util/heroInfoWindow.js'

export default {
    name: 'HeroBox',
    emits: ['remove', 'lock', 'removeAll', 'exportURL'],
    components: {
        HeaderBar,
        HeroDrawer,
        FilterModal,
        Checkbox
    },
    props: {
        list: {
            type: Array,
            default() { return [] }
        },
        locked: {
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
    updated() {console.log('Updated HeroBox')},
    data() {
        return {
            sort: ['recent', false], // sort by, reverse?
            filters: {name: '', rarity: [], attribute: [], role: [], zodiac: [], sex: []},
            lockedHeroesOnly: false,
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
        lockedHeroesOnly() {
            this.setMask()
        },
        list: {
            deep: true,
            immediate: true,
            handler() {
                if (!this.skipHeroDrawerChange)
                    this.setMask();
            }
        }
    },
    //renderTriggered (e) {console.log('HeroBox', e)},
    methods: {
        removeHero(hero) {
            this.skipHeroDrawerChange = true;
            this.$emit('remove', hero)
            this.$nextTick( () => {
                this.skipHeroDrawerChange=false
            })
        },
        lockHero(hero) {
            this.$emit('lock', hero)
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
                this.elementMask[hero] = this.lockedHeroesOnly ? this.locked.includes(hero) : filterHero(this.$store.getters.getHeroName(hero), this.$store.getters.getHero(hero), this.filters)
            })
        },

        contextHero: function (hero, e) {
            //let heroData = this.$store.getters.getHero(hero);
            var isLocked = this.locked.includes(hero)
            this.$contextmenu(e, [
                {
                    class: 'far fa-heart',
                    name: this.$t('strings.calculate_friendship'),
                    handler: () => this.$emit('calculateFriendship', hero)
                },
                {
                    class: 'fa fa-link',
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
                    class: isLocked ? 'fa fa-lock-open' : 'fa fa-lock',
                    name: this.$t(isLocked ? 'strings.unlock_hero' : 'strings.lock_hero'),
                    handler: () => this.lockHero(hero)
                },
                {
                    class: 'fa fa-minus',
                    name: this.$t('strings.remove_hero'),
                    color: 'var(--font-color-warn)',
                    handler: () => this.removeHero(hero)
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
                    class: 'fa fa-minus',
                    name: this.$t('strings.remove_all_in_view'),
                    color: 'var(--font-color-warn)',
                    handler: () => {
                        var list = this.$refs.HeroDrawer.returnVisibleList();
                        this.$promiseAlert(this.$t('strings.remove_all_in_view'),this.$t('strings.remove_all_in_view_confirm', [list.length, 'your roster']), [this.$t('strings.confirm'), this.$t('strings.cancel')]).then( ([res]) => {if (res === 0) this.$emit('removeAll', list)}).catch(()=>{})
                    }
                },
                {
                    class: 'fa fa-link',
                    name: this.$t('strings.generate_export_url'),
                    handler: () => {
                        this.$emit('exportURL')
                    }
                },
                {
                    class: 'fa fa-th',
                    name: this.$t('strings.layout'),
                    children: [
                        {
                            class: 'fa fa-check',
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
    .bottom-serachbar {
        order: 1;
    }
</style>