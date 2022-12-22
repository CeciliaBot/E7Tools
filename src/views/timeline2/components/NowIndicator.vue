<template>
    <div class="now_line"><div id="now_indicator" class="now_pill"></div></div>
</template>

<script>
import CountDown from '@/utils/clockCountdown.js'
import { daysDifference } from '@/utils/dates.js'

export default {
    name: 'CurrentTimeIndicator',
    inject: ['UTCTime', 'daySize'],
    props: {
        start: {
            type: Date
        },
        end: {
            type: Date
        },
        vertical: {
            type: Boolean,
            default: false
        },
        reverse: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            timer: null,
            lastPositionAdjustment: -1
        }
    },
    watch: {
        daySize() {
            this.lastPositionAdjustment = -1 // this will force the timer to update the lines position
        },
        UTCTime() { // injected
            if (this.timer) {
                this.timer.$update({
                    utc: this.UTCTime
                })
            }
        }
    },
    mounted() {
        this.timer = new CountDown({
            utc: this.UTCTime,
            onUpdate: (timeArray, timeString) => {
                document.getElementById('now_indicator').innerHTML = timeString;
                if (timeArray[0] !== this.lastPositionAdjustment) { // adjust position every h
                    this.lastPositionAdjustment = timeArray[0]
                    var d = new Date()
                    var o = d.getTimezoneOffset()
                    this.updatePosition(daysDifference(new Date(), this.start), o)
                }
            }
        })
    },
    beforeUnmount() {
        this.timer.$destroy()
        this.timer = null
    },
    methods: {
        updatePosition(days, offset) {
            var off = !this.UTCTime ? offset / 1440 * this.daySize : 0; // offset is in minutes -> 1440 minutes in a day
            document.getElementById('now_indicator').parentNode.style.left = days*this.daySize-off+'px'
        }
    }
}
</script>

<style>
    .now_line {
        pointer-events: none;
        width: 1px;
        height: 100vh;
        position: absolute;
        background-color: white;
        z-index: 5;
    }
    .now_pill {
        color: black;
        position: absolute;
        background-color: white;
        border-radius: 10px;
        transform: translateX(-50%);
        padding: 0 5px;
    }
</style>