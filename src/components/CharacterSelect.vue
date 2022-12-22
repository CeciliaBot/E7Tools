<template>
    <div class="center-modal" @click="checkOutOfBounds">
        <div class="modal-game-box gamebox" style="padding: 10px;">
            <div style="flex: 1; display: flex; overflow: hidden;">
                <div style="flex: 1; display: flex; flex-direction: column;">
                    <div style="height: 56px; border-bottom: solid 2px #6a553a; display: flex; justify-content: space-between;">
                        <h1 style="margin-left: 5px; width: 50%;">Select Heroes <span v-if="max">({{ selected.length }}/{{max || 1}})</span></h1>
                        <button class="material-button basic basic" style="float: right; font-size: 18px;" @click="openFilter" v-ripple-effect>
                            <span><i class="fa fa-sliders-h fa-rotate-90" /> &#x2605; {{ $t('strings.'+sorter[0]) }}</span>
                        </button>
                        <!-- <button class="material-button basic basic" style="float: right; font-size: 18px; border: solid 1px;" v-ripple-effect>
                            <span><i class="fa fa-search" /> Search</span>
                        </button> -->
                    </div>
                    <div style="flex: 1; overflow: auto;">
                        <HeroIcon v-for="hero in displayList" :key="hero" :hero="hero" :hover="false" :selected="localSelected.includes(hero)" @click="clickHero(hero)"/>
                    </div>
                </div>
                <template v-if="recentColumn">
                    <div style="width: 1px; background: #6a553a; margin: 0 10px 20px;"></div>
                    <div style="min-width: 100px;">
                        <div style="height: 56px; border-bottom: solid 2px #6a553a; text-align: center;">Recently<br>Selected</div>
                        <div style="overflow: auto;">
                            <div v-for="hero in localSelected" :key="'selected-'+hero" @click="clickHero(hero)">
                                <HeroIcon :hero="hero" :hover="false"/>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
            <div style="border-top: solid 2px #6a553a; padding: 10px 5px; display: flex;">
                <div style="flex: 1;">
                    <h2>{{ descriptionTitle }}</h2>
                    <span v-html="description"></span>
                </div>
                <button class="material-button flat confirm" style="float: right; font-size: 22px;" @click="confirm" v-ripple-effect>Select</button>
            </div>
            <FilterComponent ref="FILTER_MODAL" v-show="openFilterModal" :filter="filter" :sorting="sorter" @close="openFilterModal=false" />
        </div>
    </div>
</template>

<script>
import FilterComponent from '@/components/filter-modal.vue'
import { computePosition, shift } from '@floating-ui/dom';
import sort from '@/utils/sort-heroes.js'
import filterItem from '@/utils/filter-data-item.js'

export default {
    emits: ['selected', 'close'],
    components: {
        FilterComponent
    },
    props: {
        list: {
            type: Array,
            default: () => []
        },
        selected: {
            type: Array,
            default: () => []
        },
        max: {
            type: Number,
            default: 0
        },
        title: {
            type: String,
            default: 'Select heroes'
        },
        description: {
            type: String,
            default: 'Description'
        },
        descriptionTitle: {
            type: String,
            default: 'Info'
        },
        recentColumn: {
            type: Boolean,
            defaiult: false
        }
    },
    created() {
        this.localSelected = this.selected;
    },
    data() {
        return {
            localSelected: [],
            displayList: this.list.slice(),

            openFilterModal: false,
            sorter: ['rarity', false],
            filter: {name: '', attribute: [], role: [], rarity: []}
        }
    },
    watch: {
        list() {
            this.displayList = this.list.slice()
        },
        selected() {
            this.localSelected = this.selected.slice()
        },
        filter: {
            deep: true,
            handler() {
                var list = this.list.filter( el => {
                    return filterItem(this.filter, el, this.$store.getters.getHero, this.$store.getters.getHeroName)
                })
                sort(list, this.sorter[0], this.sorter[1], this.$store.getters.getHero)
                this.displayList = list
            }
        },
        sorter: {
            deep: true,
            handler () {
                sort(this.displayList, this.sorter[0], this.sorter[1], this.$store.getters.getHero)
            }
        }
    },
    methods: {
        clickHero(hero) {
            var index = this.localSelected.indexOf(hero)
            if (index !== -1) {
                this.localSelected.splice(index, 1)
            } else if (this.max && this.max === this.localSelected.length) {
                if (this.$snackbar)
                    this.$snackbar.error({title: 'Can\'t select more'})
            } else {
                this.localSelected.push(hero)
            }
        },
        confirm() {
            this.$emit('selected', this.localSelected.slice())
            this.localSelected = [];
        },
        checkOutOfBounds(e) {
            if (e.target===e.currentTarget)
                this.$emit('close');
        },

        openFilter(e) {
            this.openFilterModal=true
            var el = e.currentTarget || e.target;
            var tNode = this.$refs.FILTER_MODAL.$el.firstChild
            this.$nextTick( () => {
                computePosition(el, tNode, {
                    strategy: 'fixed',
                    placement: 'bottom',
                    middleware: [
                        shift()
                    ]
                }).then( ({x, y}) => {
                    this.$refs.FILTER_MODAL.$.props.xy = {
                        top: y+'px',
                        left: x+'px'
                    }
                })
            })
        }
    }
}
</script>

<style>
    .gamebox {
        /* background: radial-gradient(#131313 50%, #0d0c0c 180%); */
        background: #131313;
        color: #A1AEBD;
        box-shadow: inset 0 0 16px 7px black;
        border: solid 4px #6a553a;
        border-radius: 20px;
    }
    .modal-game-box {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 90%;
        width: 90%;
        margin: auto;
        animation: animatezoom 0.3s;
        -webkit-animation: animatezoom 0.3s;
    }
</style>