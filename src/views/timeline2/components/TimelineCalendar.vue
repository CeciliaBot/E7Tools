<template>
    <div style="position: sticky; top: 0;">
        <div class="timeline-background" :style="{width: timelineLengthPX, 'background-size': this.daySize+'px ' +this.daySize+'px'}"></div>
    </div>
    <div style="position: sticky; top: 0; z-index: 11;">
        <NowIndicator :start="start" :end="end" :reverse="reverse" :vertical="vertical" />
    </div>
    <div class="timeline_header" :style="{minWidth: timelineLengthPX}">
        <div v-for="year in calendar" :key="year[0]"> 
            <Lazy :immediate="true" parent=".ultimate-timeline" v-for="month in year[1]" :key="month[0] + '-' + month[1]" :style="{minWidth: month[1].length*daySize+'px', minHeight: '10px'}" class="month-block" :data-background-break="month[2]">
                <div class="month-label-box"><div class="month-label">{{$tm('strings.months')[month[0]] }} {{ year[0] }}</div></div>
                <div v-for="day,i in month[1]" :key="i" :ref="month[1]+'-'+month[0]+'-'+day[0]" class="timeline-day" :style="{width: daySize+'px'}" tabindex="0">
                    <div class="day-of-week noselect">{{ daysOfTheWeek[day[1]]}}</div>
                    <div :class="['date noselect', {'patch-day': day[3]}]">{{day[0]}}</div>
                </div>
            </Lazy>
        </div>
    </div>
</template>

<script>
import Lazy from '@/layout/Lazy.vue'
import NowIndicator from './NowIndicator.vue'
import { daysDifference, isPatchDay } from '@/utils/dates.js'
import defaultSettings from '../config.js'

//import { debounce } from '@/utils/helpers.js'

export default {
    name: 'TimelineCalendar',
    components: {
        Lazy,
        NowIndicator
    },
    props: {
        daySize: {
            type: Number,
            default: 60
        },
        vertical: {
            type: Boolean,
            default: false
        },
        reverse: {
            type: Boolean,
            default: false
        },
        indicator: {
            type: Boolean,
            default: true
        },
        start: {
            type: Date,
            default: 0
        },
        end: {
            type: Date,
            default: 0
        }
    },
    data() {
        return {
            calendar: [],
            lastDate: null,
            timelineLength: null
        }
    },
    mounted() {
    },
    beforeUnmount() {
        if (this.timer)
            this.timer.$destroy,
            this.timer = null;
    },
    watch: {
        end: {
            immediate: true,
            handler: function () {
                this.calendar = this.generateArrayWithYear()
            }
            
        }
    },
    computed: {
        daysOfTheWeek() {
            return this.$tm('strings.day_short')
        },
        timelineLengthPX() {
            return (this.timelineLength+1)*this.daySize + 'px'
        }
    },
    methods: {
        updateTimelineLength(d1,d2) {
            this.timelineLength = daysDifference(d1,d2)
        },
        generateArrayWithYear() {
            var arr = [],
                arrYear = [],
                arrMonth = [],
                currDate = new Date(this.lastDate || this.start || '2018-11-01'), // from the last date this function was executed or first day
                finalDate = this.end ? new Date(this.end) : new Date(),
                lastYear = currDate.getUTCFullYear(),
                lastMonth = currDate.getUTCMonth(),
                loop = true;

            if (currDate >= finalDate)
                return []

            while (loop) {
                var year = currDate.getUTCFullYear(),
                    month = currDate.getUTCMonth();

                if (month !== lastMonth) {
                    if (arrMonth.length) {
                        var bgs = defaultSettings.bgBreakPoints[lastYear]
                        var bgBreakPoint = bgs && bgs[lastMonth+1] ? bgs[lastMonth+1] : undefined
                        arrYear.push([
                            lastMonth,
                            arrMonth,
                            bgBreakPoint
                        ]);
                    }
                    arrMonth = []
                    if (lastYear >= finalDate.getUTCFullYear() && lastMonth>=finalDate.getUTCMonth()) {
                        loop = false
                        break
                    }
                    lastMonth = month
                }
                if (year !== lastYear) {
                    arr.push([lastYear, arrYear])
                    arrYear = []
                    lastYear = year
                }

                var day = currDate.getUTCDay()
                var isPatch = day===4 ? isPatchDay(currDate) : false
                arrMonth.push([currDate.getUTCDate(), day, day===4, isPatch]);
                currDate.setUTCDate(currDate.getUTCDate()+1);
            }
            if (arrMonth.length) {
                arrYear.push([lastMonth, arrMonth, null])
            }
            if (arrYear.length) {
                arr.push([lastYear, arrYear])
            }
            // this.lastDate = currDate.getTime()
            this.updateTimelineLength(new Date(this.start || '2018-11-01'), finalDate)
            return arr
        },


        // Other stuff
        // recursivePointerIntersections( x, y, increment, vertical, callback ) {
        //     var els = document.elementsFromPoint(x, y)
        //     for (var i = 0; i<els.length; i++) {
        //         if (callback(els[i])) break;
        //     }
        //     if ((vertical && y < window.innerHeight) || (!vertical && x < window.innerWidth))
        //         this.recursivePointerIntersections( vertical ? x : x+increment, vertical ? y+increment : y, increment, vertical, callback )
        // },
        // selectActiveEvents: debounce(function (e) {
        //     var box = (e.currentTarget || e.target).getBoundingClientRect();
        //     [box.left, box.left+box.width].forEach(pos => {
        //         this.recursivePointerIntersections(pos, 0, 55, true, (el) => {
        //             if (el.classList.contains('banner')) {
        //                 el.classList.add('highlight')
        //                 return true;
        //             }
        //             return false;
        //         })
        //     })
        // }, 200),
        // deselectActiveEvents: debounce(function () {
        //     (document.querySelectorAll('.banner.highlight') || []).forEach( el => {
        //         el.classList.remove('highlight')
        //     })
        // }, 200)
    }
}
</script>

<style>
    /* .timeline-bg-wrapper {
        position: sticky;
        top: 0;
        z-index: 10;
    } */
    .timeline-background {
        position: absolute;
        width: 43560px;
        top: 0;
        left: 0;
        pointer-events: none;
        height: 100vh;
        background-size: 30px 30px;
        background-image: linear-gradient(to right, #80808014 1px, transparent 1px)
    }
    .timeline_header {
        white-space: nowrap;
        position: sticky;
        top: 0;
        min-width: 100%; 
        /* overflow: visible; */
        z-index: 10;
        display: inline-flex;
        background-color: var(--background-modifier-darken-alpha);
        flex-wrap: nowrap;
        align-self: flex-start;
        min-height: 48px;
        box-shadow: 0px -2px 3px 3px rgb(11 11 11 / 65%);
    }
    .month-block {
        white-space: nowrap;
        display: inline-block;
    }
    .month-label-box {
        display: inline-block;
        position: sticky;
        left: 0;
        vertical-align: top;
        z-index: 1;
        transition: opacity .3s ease;
    }
    .timeline_header:hover .month-label-box {
        opacity: 0;
    }
    .month-label {
        pointer-events: none;
        position: absolute;
        display: inline-block;
        background-color: var(--background-color-primary);
        color: var(--font-color-primary);
        padding: 0 10px;
        box-shadow: 1px 0 10px 5px var(--background-color-primary);
    }
    .timeline-day {
        display: inline-block;
        position: relative;
        text-align: center;
        width: 30px;
    }
    .timeline-day:hover:before,
    .timeline-day:focus:before {
        content: '';
        position: absolute;
        height: 100vh;
        width: 100%;
        margin-left: -50%;
        background-color: #2196f344;
        outline-color: transparent;
        border: none;
        pointer-events: none;
    }
    .day-of-week {
        opacity: 0.6;
        font-weight: 500;
    }
    .date {
        color: white;
    }
    .date.patch-day {
        color: orangered;
    }

    .banner.highlight {
        box-shadow: 0 0 2px 2px var(--font-color-primary);
    }
</style>