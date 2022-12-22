<template>
    <div class="timeline-row" :style="timelineRowStyle">
        <div style="position: relative; height: 100%; width: 100%;">
            <div :style="timezonePaddingStyle">
                <BannerItemLazy 
                    v-for="event, index in renderList"
                    :event="event"
                    :key="index"
                    :daySize="daySize"
                    :category="timeline"
                    :vertical="vertical"
                    @openEvent="openEvent"
                />
                <!--<BannerItem v-for="event in renderList" :key="event.dt[0]+'-'+event.inDayIndex" :event="event" :daySize="daySize" :vertical="vertical" :category="timeline" @openEvent="openEvent" />-->
            </div>
            <div :class="['timeline-row-aside', {'glass-container-2': !this.lowEndMode, 'low-end': this.lowEndMode}]" v-drag="{drops: ['timelines'], node: this.$el, item: this.timeline, list: [], vertical: !this.vertical, disableDeepPlaceholder: true}">
                <div class="content">
                    <div style="text-align: center">{{ timeline }}</div>
                    <button class="material-button stroked primary" @click="openStats=true" style="line-height: 1.5em" v-ripple-effect>
                        <span>Stats</span>
                    </button>
                    <button class="material-button stroked warn" @click="$emit('remove', timeline)" style="line-height: 1.5em" v-ripple-effect>
                        <span>Remove</span>
                    </button>
                </div>
                <div class="icon">
                    <img :src="icon" style="width: 36px;" crossorigin="anonymous" samesite="Lax" />
                </div>
            </div>
        </div>
        <StatisticsWindow v-if="openStats" :timeline-key="timeline" :timeline-data="renderList" @close="openStats=false"/>
    </div>
</template>

<script>
// import BannerItem from './BannerItem.vue'
import ajax from '@/utils/ajax.js'
import { cdn } from '@/utils/constant.js'
import { daysDifference } from '@/utils/dates.js'
import { arenaPrediction, worldArenaPrediction, guildWarPrediction, balancePrediction } from '../utils/predictions.js'

import StatisticsWindow from './StatisticsWindow.vue'
import { drag } from '@/directives/drag-drop2.js'

import BannerItemLazy from './BannerItemLazy.vue'

export default {
    name: 'TimelineItems',
    inject: ['vertical', 'UTCTime', 'lowEndMode'],
    emits: ['events', 'highestDate', 'openEvent', 'destroyed', 'remove'],
    directives: {
        drag
    },
    components: {
        // BannerItem,
        StatisticsWindow,
        BannerItemLazy
    },
    props: {
        timeline: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: false
        },
        start: {
            type: Date,
            required: true
        },
        end: {
            type: Date,
            required: true
        },
        timelineLength: {
            type: Number,
            default: 1
        },
        daySize: {
            type: Number,
            default: 30
        }
    },
    data() {
        return {
            list: [],
            renderList: [],
            largestStack: 0,
            prediction: function () {}, // Function that will run after the list is built
            openStats: false
        }
    },
    created() {
        this.getTimelineItems(this.timeline);
    },
    beforeUnmount() {
        this.$emit('destroyed', this.timeline)
    },
    computed: {
        timeZonePadding() {
            return this.UTCTime ? 0 : -new Date().getTimezoneOffset() / 1440 * this.daySize
        },
        timezonePaddingStyle() {
            return{
                [!this.vertical ? 'marginLeft' : 'marginTop']: this.timeZonePadding+'px'
            }
        },
        timelineRowStyle() {
            return {
                [this.vertical ? 'width' : 'height']: (this.largestStack+1)*55+'px'
            }
        }
    },
    watch: {
        list() {
            this.renderList = this.buildRenderArray()
        },
        start() { // start date has changed -> adjust event distance
            this.renderList.forEach(event => {
                event.fromStart = daysDifference( this.getDate(event.dt[0]), this.start )
            })
        }
    },
    methods: {
        openEvent(e) {
            this.$emit('openEvent', e)
        },
        getTimelineItems(id) {
            switch(id) {
                case 'covenant':
                    Promise.all([
                        ajax('./data/timeline/covenant.json').catch( () => {return '[]'}),
                        this.$store.dispatch('GET_HERO_DB'),
                        this.$store.dispatch('GET_ARTIFACT_DB')
                    ]).then(res => {
                        this.list = JSON.parse(res[0])
                    })
                    break;
                case 'mystic':
                    Promise.all([
                        ajax('./data/timeline/mystic.json').catch( () => {return '[]'}),
                        this.$store.dispatch('GET_HERO_DB'),
                        this.$store.dispatch('GET_ARTIFACT_DB')
                    ]).then(res => {
                        this.list = JSON.parse(res[0])
                    })
                    break;
                case 'covenant_shop':
                    Promise.all([
                        ajax('./data/timeline/covenant-coin-shop.json').catch( () => {return '[]'}),
                        this.$store.dispatch('GET_HERO_DB')
                    ]).then(res => {
                        this.list = JSON.parse(res[0])
                    })
                    break;
                case 'galaxy_shop':
                    Promise.all([
                        ajax('./data/timeline/galaxy-coin-shop.json').catch( () => {return '[]'}),
                        this.$store.dispatch('GET_HERO_DB')
                    ]).then(res => {
                        this.list = JSON.parse(res[0])
                    })
                    break;
                case 'powder_shop':
                    Promise.all([
                        this.$store.dispatch('GET_POWDER_SHOP'),
                        this.$store.dispatch('GET_ARTIFACT_DB')
                    ]).then(res => {
                        this.list = res[0]
                    })
                    break;
                case 'specialty_change':
                    Promise.all([
                        ajax('./data/timeline/specialty-change.json').catch( () => {return '[]'}),
                        this.$store.dispatch('GET_HERO_DB')
                    ]).then(res => {
                        this.list = JSON.parse(res[0])
                    })
                    break;
                case 'balance_adjustment':
                    Promise.all([
                        ajax('./data/timeline/balance.json').catch( () => {return '[]'}),
                        this.$store.dispatch('GET_HERO_DB'),
                        this.$store.dispatch('GET_ARTIFACT_DB')
                    ]).then(res => {
                        this.list = JSON.parse(res[0])
                        this.prediction = balancePrediction
                    })
                    break;
                case 'exclusive_equipment':
                    Promise.all([
                        ajax('./data/timeline/exclusive-equipment.json').catch( () => {return '[]'}),
                        this.$store.dispatch('GET_HERO_DB')
                    ]).then(res => {
                        this.list = JSON.parse(res[0])
                    })
                    break;
                case 'arena':
                    Promise.all([
                        ajax('./data/timeline/arena.json').catch( () => {return '[]'})
                    ]).then(res => {
                        this.list = JSON.parse(res[0])
                        this.prediction = arenaPrediction
                    })
                    break;
                case 'world_arena':
                    Promise.all([
                        ajax('./data/timeline/world-arena.json').catch( () => {return '[]'})
                    ]).then(res => {
                        this.list = JSON.parse(res[0])
                        this.prediction = worldArenaPrediction
                    })
                    break;
                case 'guild_war':
                    Promise.all([
                        ajax('./data/timeline/guild-war.json').catch( () => {return '[]'})
                    ]).then(res => {
                        this.list = JSON.parse(res[0])
                        this.prediction = guildWarPrediction
                    })
                    break;
                case 'skin':
                    Promise.all([
                        this.$store.dispatch('GET_HERO_DB'),
                        ajax('./data/timeline/skin.json').catch( () => {return '[]'})
                    ]).then(res => {
                        this.list = JSON.parse(res[1])
                    })
                    break;
                case 'check-in':
                    Promise.all([
                        ajax('./data/timeline/check-in.json').catch( () => {return '[]'})
                    ]).then(res => {
                        this.list = JSON.parse(res[0])
                    })
                    break;
            }
        },
        getDate(d) {
            if (!isNaN(d)) {
                return d
            } else {
                return new Date(d).getTime()
            }
        },
        buildRenderArray() {
            var list = this.list.sort( function (a,b) {return a.dt[0] - b.dt[0]}),
                filledDays = [],
                maxStack = 0,
                oldest='2000-01-01';

            list.forEach( e => {
                e.dt[0] = this.getDate(e.dt[0]),
                e.dt[1] ? e.dt[1] = this.getDate(e.dt[1]) : null
                e.c ? null : e.c = [], e.a ? null : e.a = []
                e.class = "max-content"
                var singleDayEvent = !e.dt[1],
                    sd = e.dt[0],
                    ed = e.dt[1] || e.dt[0],
                    length = daysDifference(sd,ed),
                    visualEndingDate = singleDayEvent ? sd+(86400000)*Math.max((e.c.length+e.a.length),0) : ed,
                    fromStart = daysDifference(sd,this.start),
                    fromEnd = daysDifference(this.end,ed),
                    inDayIndex = -1;

                for (var i = 0; i < filledDays.length; i++) {
                    var last = filledDays[i];
                    if (sd<last) {
                        continue;
                    }
                    inDayIndex=i;
                    filledDays.splice( i, 1, visualEndingDate);
                    break;
                }
                if (inDayIndex===-1) {
                    inDayIndex = filledDays.length
                    filledDays.push(visualEndingDate)
                }
                if (oldest<e.dt[1])
                    oldest = e.dt[1];

                e.renderIcons = this.icons(e)
                e.renderFirstAttribute = this.firstAttribute(e)
                e.renderText = this.bannerText(e)

                e.fromStart = fromStart
                e.fromEnd = fromEnd
                e.inDayIndex = inDayIndex
                e.size = Math.max(length,1)
                Date.now() < sd ? e.isComingSoon = true : Date.now() < ed ? e.isOngoing = true : null
                if (inDayIndex > maxStack)
                    maxStack = inDayIndex;
            })
            var predicted = this.prediction(list, this)
            this.largestStack = maxStack;
            this.$emit('highestDate', predicted || oldest)
            this.$emit('events', this.timeline, list.slice())
            return list;
        },
        diff(a,b) {
            return daysDifference(a,b)
        },

        /* Add stuff to render on item */
        icons(event) {
            var r = [];
            if (event.c) {
                r = r.concat(
                    event.c.map(hero => {
                        return [
                            cdn+'/face/c0000_s.png',                                            // placeholder image
                            this.$store.getters.getHeroIcon(hero.id),                           // actual lazy loaded image
                            hero.new,                                                           // is new css class
                            'hero',                                                             // img class type
                            () => this.heroAndArtifactTooltip(hero.id, 'hero')                  // tooltip message
                        ]
                    })
                )
            }
            if (event.a) {
                r = r.concat(
                    event.a.map(arti => {
                        return [
                            cdn+'item_arti/icon_art0000.png',
                            this.$store.getters.getArtifactIcon(arti.id),
                            arti.new,
                            'artifact',
                            () => this.heroAndArtifactTooltip(arti.id, 'artifact')
                        ]
                    })
                )
            }
            return r
        },
        firstAttribute(event) {
            if (event.type==='limited')
                return 'limited'
            else if (event.c && event.c.length)
                return this.$store.getters.getHero(event.c[0].id).attribute;
            return 'default'
        },
        bannerText(event) {
            return event.name

            // var str = []
            // if (event.name)
            //     str.push(event.name)
            // if (event.c) {
            //     event.c.forEach( (c, index) => {
            //         var ch = this.$store.getters.getHeroName(c.id)
            //         if (event.a && event.a[index]) {
            //             ch += ' & ' + this.$store.getters.getArtifactName(event.a[index].id)
            //         }
            //         str.push(ch)
            //     })
            // }

            // if (str.length)
            //     return str.join(', ');
            // else
            //     return false;
        },
        heroAndArtifactTooltip(id, type) {
            return type==='hero' ? this.$store.getters.getHeroName(id) : this.$store.getters.getArtifactName(id)
        }
    }
}
</script>

<style>
    .timeline-row {
        position: relative;
        z-index: 1;
        width: 100%;
    }
    .timeline-row-aside {
        position: sticky;
        left: 0;
        height: 100%;
        margin-left: 0px;
        z-index: 1;
        margin-top: -3.5px;
        width: 200px;
        transform: translateX(-200px);
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        /* background-color: var(--background-color-tertiary); */
        border: solid 1px #8a8a8a;
        border-left: none;
        border-radius: 0 8px 8px 0;
        transition: transform .3s ease;
    }
    .timeline-row-aside.low-end {
        background-color: var(--background-color-tertiary);
    }
    .timeline-row-aside:hover {
        transform: translateX(-48px);
    }
    .timeline-row-aside > .icon {
        width: 50px;
        text-align: center;
    }
    .timeline-row-aside > .content {
        flex: 1;
        white-space: nowrap;
    }
    .is-dragging > .timeline-row-aside {
        transform: translateX(48px);
    }
</style>