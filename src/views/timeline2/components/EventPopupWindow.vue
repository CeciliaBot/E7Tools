<template>
    <FloatingWindow :key="event" :wid="wid" @close="close" :open-maximized="fullScreenWindows" :glass-window="!lowEndMode" >
        <template v-if="link" v-slot:extra-button>
            <a v-tooltip="'Go to STOVE'" :href="link" target="_blank"><i class="fas fa-external-link-alt"></i></a>
            <button v-tooltip="'Copy link'" @click="copyLink"><i class="fas fa-share-alt"></i></button>
        </template>
        <template v-slot:icon><img src="https://page.onstove.com/img/icons/apple-touch-icon.png" samesite="Lax" /></template>
        <template v-slot:title><span>{{ windowTitle }}</span></template>
        <div class="window-content-body">
            <div class="event-side-menu">
                <button @click="TAB='HOME'" class="material-button flat basic"><i class="fa fa-home"></i></button>
                <template v-if="Array.isArray(event.nid)">
                    <button v-for="cnid,i in event.nid" :key="'button-nid-'+cnid" @click="nid=cnid, TAB='STOVE'" class="material-button flat basic" v-tooltip="'Stove Notice' + (i+1)"><img src="https://page.onstove.com/img/icons/apple-touch-icon.png"></button>
                </template>
                <template v-else-if="event.nid">
                    <button :key="'button-nid-'+event.nid" @click="nid=event.nid, TAB='STOVE'" class="material-button flat basic" v-tooltip="'Stove Notice'"><img src="https://page.onstove.com/img/icons/apple-touch-icon.png"></button>
                </template>
                <button @click="TAB='DISQUS'" class="material-button flat basic" v-tooltip="'Comments [Not STOVE]'"><i class="fa fa-comments"></i></button>
            </div>
            <div style="flex: 1; padding: 10px;">
                <template v-if="TAB==='HOME'">
                    <div style="width: 100%; max-width: 1000px;padding: 20px;margin: auto;background-color: var(--background-modifier-darken-alpha);border-radius: 8px;">
                        <div style="text-align: center;"><img v-if="event.thumbnail" :src="event.thumbnail" style="width: 100%; border-radius: 8px;"/></div>
                        <div ><span>Start: {{$d( event.dt[0], 'long-with-time')}}</span><span v-if="timeElapsed"> ({{ timeElapsed[0] }} ago)</span></div>
                        <div v-if="event.dt[1]"><span>End: {{$d( event.dt[1], 'long-with-time')}}</span><span v-if="timeElapsed"> ({{ timeElapsed[1] }} ago)</span></div>
                    </div>
                </template>
                <template v-if="TAB === 'DISQUS'"><DISQUS :discussion-id="DISQUSID" /></template>
                <template v-if="TAB === 'STOVE'"><StoveComponent :key="nid" :nid="nid" @title="updateTitle" @link="updateLink"/></template>
            </div>
        </div>
    </FloatingWindow>
</template>

<script>
import DISQUS from './DISQUSComponents.vue'
import FloatingWindow from '@/layout/FloatingWindow.vue'
import StoveComponent from './GetStove.vue'
import copyToClipboard from '@/utils/copy.js'
import { fullDateDiff2 } from '@/utils/dates.js'

export default {
    emits: ['close'],
    inject: ['lowEndMode'],
    components: {
        FloatingWindow,
        StoveComponent,
        DISQUS
    },
    props: {
        event: {
            type: Object,
            required: true
        },
        wid: {
            required: true
        }
    },
    data() {
        return {
            TAB: 'HOME',
            windowTitle: '',
            link: '',
            nid: null
        }
    },
    mounted() {
    },
    created() {
        this.windowTitle = this.event.c && this.event.c.length ? this.event.c.map(x => this.$store.getters.getHeroName(x.id)).join(', ') : this.event.name || 'Event'
    },
    computed: {
        DISQUSID() {
            return (
                this.event.c? this.event.c.map(x => x.id).sort( (a,b) => { return a > b ? 1 : -1 } ).join('-').slice(0,40).toUpperCase()+'_' :
                this.event.a? this.event.a.map(x => x.id).sort( (a,b) => { return a > b ? 1 : -1 } ).join('-').slice(0,40).toUpperCase()+'_' : 
                this.event.name? this.event.name+'_' : ''
            ) + this.UTCISODate(new Date(this.event.dt[0])) + '_' + this.UTCISODate(new Date(this.event.dt[1] || this.event.dt[0]))
        },
        fullScreenWindows() {
            return this.$store.getters.getIsMobile()
        },
        timeElapsed() {
            if (this.event.isComingSoon || this.event.isOngoing)
                return null
            else {
                var l = ['Y', 'M', 'D'];
                var diff1 = fullDateDiff2(this.event.dt[0])
                var diff2 = this.event.dt[1] ? fullDateDiff2(this.event.dt[1]) : []
                return [
                    l.map( (x,i) => diff1[i]+x).join(' '),
                    l.map( (x,i) => diff2[i]+x).join(' ')
                ]
            }
        }
    },
    methods: {
        UTCISODate(date) {
            const pad = (n) => {return n <10?'0'+n : n}
            return date.getUTCFullYear() + '-' + pad(date.getUTCMonth()) + '-' + pad(date.getUTCDate())
        },
        updateTitle(t) {
            this.windowTitle = (t || '').slice()
            return
        },
        updateLink(link) {
            this.link = link ? link.slice() : false;
        },
        copyLink() {
            copyToClipboard(this.link).then( () => {
                this.$snackbar.log({title: 'Link copied to your clipboard'})
            }).catch( () => {
                this.$snackbar.error({title: 'Could not copy'})
            })
        },
        close() {
            this.$emit('close')
        }
    }
}
</script>

<style>
    .window-content-body {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .event-side-menu {
        background-color: var(--background-modifier-darken-alpha);
        display: flex;
        flex-direction: row;
        justify-content: center;
        font-size: 1.4em;
        height: auto;
        font-size: 20px;
    }
    .event-side-menu button {
        font-size: inherit;
    }
    .event-side-menu img {
        height: 1em;
    }
</style>