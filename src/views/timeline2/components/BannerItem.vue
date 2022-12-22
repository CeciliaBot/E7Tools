<template>
    <!-- <div :style="bannerStyle" @click="openEvent"> -->
        <div :class="['banner', event.renderFirstAttribute, event.class, category]">
            <!-- <div class="b-thumblnail-cover"><img :src="event.thumbnail" style="height: 100%"/></div> -->
            <div class="banner-text-wrapper">
                <div style="position: sticky; left: 0;display: inline-block;">
                    <div v-if="showPill" ref="timer_pill" :class="['time-pill', {ongoing: needsTimer}]"></div>
                    <span v-if="event.renderText">
                        {{ event.renderText }}
                    </span>
                </div>
            </div>
            <div class="icon-container">
                <!-- v-lazyloader not lazyloading images becuse the component is already being lazy rendered -->
                <img v-for="icon in event.renderIcons" :key="icon[1]" :data-src="icon[0]" :src="icon[1]" :class="[icon[3], {new: icon[2]}]" crossorigin="anonymous" SameSite="Lax" v-tooltip="icon[4]"/>
            </div>
        </div>
    <!-- </div> -->
</template>

<script>
//import { cdn } from '@/utils/constant.js'
import CountDown from '@/utils/clockCountdown.js'
function padNumber(n) {return n<10?'0'+n:n}

export default {
    name: 'BannerItem',
    props: {
        event: {
            type: Object,
            required: true
        },
        category: {
            type: String,
            required: false
        },
        vertical: {
            type: Boolean,
            default: false
        },
        daySize: {
            type: Number,
            default: 30
        },
        reverse: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            countDown: 0
        }
    },
    mounted() {
        if (this.needsTimer) {
            this.createTimer(this.event)
        }
    },
    beforeUnmount() {
        if (this.countDown)
            this.countDown.$destroy();
        this.countDown = null
    },
    computed: {
        needsTimer() {
            return this.event.isOngoing || this.event.isComingSoon
        },
        showPill() {
            return this.needsTimer
        }
    },
    methods: {
        createTimer(event) {
            this.countDown = new CountDown({
                date: event.isComingSoon ? event.dt[0] : event.dt[1],
                //date: Date.now()+10000,
                interval: 60*1000,
                onUpdate: (timeArray) => {
                    this.$refs.timer_pill.innerHTML = this.$tm('strings.Dhms').slice(0,3).map( (t,i) => { // $tm is a vue18n method and returns and array from strings
                        if (timeArray[i] === undefined) return ''
                        return (i>0 ? padNumber(timeArray[i]) : timeArray[i]) + t
                    }).join(' ');
                },
                onZero: () => {
                    if (event.isComingSoon && event.dt[1]) {
                        event.isComingSoon = false
                        event.isOngoing = true
                        this.countDown.$update({ // start new count down to the end date
                            date: event.dt[1]
                        })
                    } else {
                        this.$refs.timer_pill.innerHTML = 'Closed'
                        this.countDown.$destroy()
                        this.countDown = null
                        event.isComingSoon = false
                        event.isOngoing = false
                    }
                }
            })
        }
    }
}
</script>

<style scoped>
    .banner {
        cursor: pointer;
        overflow: hidden;
        position: relative;
        height: 50px;
        border-radius: 8px;
        color: black;
        font-weight: 600;
    }
    .banner.max-content {
        min-width: max-content;
    }
    .banner.default {
        background-color: #236eac;
        color: black;
        text-shadow: 0px -2px 3px #236eac, 0px 2px 3px #236eac, 2px 0px 3px #236eac, -2px 0px 3px #236eac;
    }
    .banner.limited {
        background-color: #efae80;
        text-shadow: 0px -2px 3px #efae80, 0px 2px 3px #efae80, 2px 0px 3px #efae80, -2px 0px 3px #efae80;
    }
    .banner.limited:before {
        content: 'Limited';
        pointer-events: none;
        position: absolute;
        left: -27px;
        top: 5px;
        width: 90px;
        background: #7b0eb9;
        transform: rotate(-45deg);
        text-align: center;
        font-size: 0.7em;
        text-shadow: none;
        color: white;
        padding: 4px;
        font-weight: 300;
    }
    .banner.fire {
        background-color: #fc8e86;
        text-shadow: 0px -2px 3px #fc8e86, 0px 2px 3px #fc8e86, 2px 0px 3px #fc8e86, -2px 0px 3px #fc8e86;
    }
    .banner.wind {
        background-color: #91da94;
        text-shadow: 0px -2px 3px #91da94, 0px 2px 3px #91da94, 2px 0px 3px #91da94, -2px 0px 3px #91da94;
    }
    .banner.ice {
        background-color: #9de2e4;
        text-shadow: 0px -2px 3px #9de2e4, 0px 2px 3px #9de2e4, 2px 0px 3px #9de2e4, -2px 0px 3px #9de2e4;
    }
    .banner.light {
        background-color: #efce80;
        text-shadow: 0px -2px 3px #efce80, 0px 2px 3px #efce80, 2px 0px 3px #efce80, -2px 0px 3px #efce80;
    }
    .banner.dark {
        background-color: #7d5a91;
        text-shadow: 0px -2px 3px #7d5a91, 0px 2px 3px #7d5a91, 2px 0px 3px #7d5a91, -2px 0px 3px #7d5a91;
    }
    .banner.guild_war {
        background-color: #d0f690;;
        text-shadow: none;
    }
    .banner.world_arena {
        background-color: #6ff7c5;;
        text-shadow: none;
    }
    .banner.arena {
        background-color: #c8ce9f;
        text-shadow: none;
    }
    .banner.powder_shop {
        background-color: #a669b9;
        text-shadow: none;
    }
    .icon-container {
        float: right;
        height: 50px;
    }
    .icon-container > img {
        display: inline-block;
    }
    .icon-container > img.hero {
        height: 100%;
        min-width: 50px;
    }
    .icon-container > img.artifact {
        height: 100%;
        min-width: 45px;
    }
    .icon-container > img.new {
        border-radius: 50%;
        border: solid red;
        background-color: goldenrod;
    }

    .banner-text-wrapper {
        position: absolute;
        width: 100%;
        height: 1.5em;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
    }
    .limited .banner-text-wrapper {
        padding-left: 35px;
    }
    .banner-text-wrapper > span {
        position: sticky;
        padding: 0 5px;
        left: 0;
    }
    .b-thumblnail-cover {
        width: 100%;
        height: 100%;
        position: absolute;
    }
    .b-thumblnail-cover > img {
        height: 100%;
        width: 100%;
        object-fit: cover;
    }


    .time-pill {
        background-color: #ffffff8f; /* #ffffffd1 */
        border-radius: 10px;
        text-shadow: none;
        float: left;
        margin: 0 8px;
        padding: 0 10px;
        pointer-events: none;
        opacity: 0.4;
    }
    .time-pill.ongoing {
        opacity: 1;
    }
</style>