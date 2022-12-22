<template>
    <div style="height: 100%; width: 100%;" >
        <DynamicBackgroundImage v-if="dynamicBackground" />
        <div ref="SCROLL_TARGET" :class="[this.vertical?'vtimeline':'ultimate-timeline']" style="position: relative;">
            <TimelineCalendar :start="startingDate" :end="endDate" :daySize="daySize"/>
            <div :style="['padding-top: 15px; z-index: 2;', {[vertical ? 'height' : 'width']: timelinePXLength}]" data-drop="timelines" @drop="dragDropTimeline">
                <TimelineItems
                    v-for="i of timelines"
                    :key="i"
                    :timeline="i"
                    :icon="supportedTimelines[i].icon"
                    :start="startingDate"
                    :end="endDate"
                    :daySize="daySize"
                    @events="putEvents"
                    @openEvent="openPopupEvent"
                    @destroyed="timelineRowDestroyed"
                    @remove="removeTimelineRow"
                    @highestDate="checkIfHigherEndDate"
                />
                <div style="height: 50px; width: 100%;">
                    <div class="timeline-row-aside glass-container-2" @click="customizeTimelineWindow=true">
                        <div>Customize</div>
                        <span class="icon"><i class="fa fa-plus"></i></span>
                    </div>
                </div>
            </div>
        </div>
        <TimelineSideMenu
            :dynamic-background="dynamicBackground"
            @toggleUTC="toggleUTCTime"
            @toggleBackground="toggleBackground"
            @toggleVertical="toggleVertical"
            @toggleLowEndMode="toggleLowEndMode"
            @search="openNewSearchBar"
            @customize="customizeTimelineWindow=true"
            @ongoing="ongoingEventsWindow = Date.now()"
            @changelog="changelogWindow = true"
            @home="$store.commit('toggleMainMenu')"
            @goToday="goToDate(Date.now())"
        />
        <EventPopup :event="openInPopup" />
        <SearchComponent :events="events" @goTo="goToEvent" :open-id="openSearchBar" />
        <TimelineManager :visible="timelines" @setTimelines="timelines=$event" v-if="customizeTimelineWindow" @close="customizeTimelineWindow=false"/>
        <OngoingWindow v-if="ongoingEventsWindow" :wid="ongoingEventsWindow" @close="ongoingEventsWindow = false" />
        <ChangelogWindow v-if="changelogWindow" @close="changelogWindow = false" />
    </div>
</template>
<script>
import { computed } from 'vue'
import TimelineCalendar from './components/TimelineCalendar.vue'
import TimelineItems from './components/TimelineItems.vue'
import EventPopup from './components/EventPopup.vue'
import DynamicBackgroundImage from './components/DynamicBackgroundImage.vue'
import TimelineManager from './components/TimelineManager.vue'
import SearchComponent from './components/SearchBars.vue'
import ChangelogWindow from './components/ChangelogWindow.vue'
import OngoingWindow from './components/OngoingEvents.vue'
import TimelineSideMenu from './components/TimelineMenu.vue'
import horizontalScroll from './utils/horizontal-scroll.js'
import defaultSettings from './config.js'
import { daysDifference } from '@/utils/dates.js'
import { arrayMove } from '@/utils/array.js'
import { createLazyObserver, removeLazyObserver } from '@/layout/Lazy.vue'

export default {
    name: 'UltimateTimeline',
    components: {
        TimelineCalendar,
        TimelineItems,
        DynamicBackgroundImage,
        EventPopup,
        SearchComponent,
        TimelineManager,
        OngoingWindow,
        TimelineSideMenu,
        ChangelogWindow
    },
    provide: function () {
        return {
            lowEndMode: computed(() => this.lowEndMode),
            vertical: computed(() => this.vertical),
            reverse: computed(() => this.reverse),
            daySize: computed(() => this.daySize),
            UTCTime: computed(() => this.UTCTime)
        }
    },
    data() {
        return {
            supportedTimelines: defaultSettings.supportedTimelines,
            startingDate: new Date('2018-11-01 0:00:00Z'), // time (0:00:00) is required to correctly set local time if missing it will set UTC time
            endDate: new Date( (new Date()).setDate(new Date().getDate()+20)),

            vertical: false,
            reverse: false,
            daySize: 30,
            UTCTime: false,
            dynamicBackground: true,
            lowEndMode: false,

            customizeTimelineWindow: false,
            ongoingEventsWindow: !this.$store.getters.getIsMobile(),
            changelogWindow: false,
            openInPopup: null,
            openSearchBar: null,

            timelines: defaultSettings.startingTimelines,
            events: {}
        }
    },
    created() {
        this.lowEndMode = this.$store.getters.getIsMobile()
    },
    mounted() {
        window.setDay = (n) => {
            this.daySize = n;
            this.UTCTime = !this.UTCTime
        };
        createLazyObserver('.ultimate-timeline')
        this.$refs.SCROLL_TARGET.addEventListener('wheel', horizontalScroll)
        this.goToDate(Date.now()+86400000, {behavior: 'auto'}) // scroll to today without any transition. 86400000 = 1 day in ms
    },
    beforeUnmount() {
        removeLazyObserver('.ultimate-timeline')
        this.endDate = null;
        this.$refs.SCROLL_TARGET.removeEventListener('wheel', horizontalScroll)
    },
    watch: {
        // events: {
        //     deep: true,
        //     handler() {console.log(this.events)}
        // }
    },
    computed: {
        timelinePXLength() {
            return Math.ceil(daysDifference(this.startingDate, this.endDate)+1)*this.daySize + 'px'
        }
    },
    methods: {
        checkIfHigherEndDate(date) {
            var nDate = new Date(date);
            if (nDate > this.endDate)
                this.endDate = new Date( nDate.getFullYear(), nDate.getMonth()+1, 0);
            else
                return false
        },
        putEvents(id, events) {
            this.events[id] = events
        },
        timelineRowDestroyed(id) {
            delete this.events[id]
        },
        removeTimelineRow(e) {
            var index = this.timelines.indexOf(e)
            if (index!==-1){
                this.timelines.splice(index, 1)
            }
        },
        dragDropTimeline(e) {
            if (!e.detail.item && e.detail.oldIndex === undefined)
                return console.error('Missing drop element name or starting index. At least one must be provided in the drag directive');
            var index = e.detail.index
            if (index === undefined)
                return console.error('No drop position provided');
            var oldIndex = e.detail.oldIndex || this.timelines.indexOf(e.detail.item)
            if (oldIndex<0)
                return console.error('Could not find the item in the array');
            if (oldIndex === index)
                return;
            arrayMove(this.timelines, oldIndex, index)
        },
        goToEvent(event) {
            this.goToDate(this.reverse ? event.dt[1] || event.dt[0] : event.dt[0])
        },
        goToDate(date, opt = {}) {
            if (!date) return;
            var distance = daysDifference(this.reverse?this.endDate:this.startingDate, date),
                options = {top: 0, left: 0, behavior: opt.behavior || 'smooth'}
            if (this.vertical) {
                options.top = distance*this.daySize;
            } else {
                options.left = distance*this.daySize-window.innerWidth/2;
            }
            this.$refs.SCROLL_TARGET.scrollTo(options);
        },
        openPopupEvent(event) {
            this.openInPopup = JSON.parse(JSON.stringify(event))
        },
        openNewSearchBar() {
            this.openSearchBar = 'search-id-'+Date.now()
        },
        toggleUTCTime() {
            this.UTCTime = !this.UTCTime
        },
        toggleBackground() {
            this.dynamicBackground = !this.dynamicBackground
        },
        toggleVertical() {
            this.vertical = !this.vertical
        },
        toggleLowEndMode() {
            this.lowEndMode = !this.lowEndMode
        }
    }
}
</script>
<style>
    .ultimate-timeline {
        /* display: flex; */
        /* flex-direction: column; */
        overflow: auto;
        height: 100%;
        padding-left: 48px;
    }
    /* .vtimeline {
        display: flex;
        flex-direction: column;
        overflow: auto;
        width: 100%;
    } */
</style>