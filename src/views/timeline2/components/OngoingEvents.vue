<template>
    <FloatingWindow :wid="'upcoming-timeline-events-not'" ref="window" class="note-style-window" @close="close" position="top-right" :size="{width: '400px', height: '500px'}" :open-maximized="false" :glass-window="false" >
        <template v-slot:icon><i class="far fa-sticky-note"></i></template>
        <template v-slot:title><span>Onoging Events</span></template>
        <div class="window-content-body" style="color: black;padding: 3px;">
            <Markdown :source="message" style="white-space: pre-wrap; max-width: 980px; width: 100%; margin: 0 auto;"/> <!--  font-family: 'Brush Script MT', cursive; -->
            <!-- <div class="changelog-wrapper">
                <section class="changelog-section">
                    <header class="changelog-sec-header">
                        <h2 class="changelog-header-title">Ongoing</h2>
                    </header>
                    <ul style="margin-left: 15px;">
                        <li>
                            <div class="changelog-badge official">Official</div>
                            <div class="changelog-description flex-fill">Drop rate up 1</div>
                        </li>
                        <li>
                            <div class="changelog-badge official">Official</div>
                            <div class="changelog-description flex-fill">Drop rate up 1</div>
                        </li>
                    </ul>
                </section>
                <section class="changelog-section">
                    <header class="changelog-sec-header">
                        <h2 class="changelog-header-title">{{ $d('2022-10-10', 'short', 'en') }}</h2>
                    </header>
                    <ul style="margin-left: 15px;">
                        <li>
                            <div class="changelog-badge official">Prediction</div>
                            <div class="changelog-description flex-fill">Drop rate up 1</div>
                        </li>
                        <li>
                            <div class="changelog-badge official">Official</div>
                            <div class="changelog-description flex-fill">Drop rate up 1</div>
                        </li>
                    </ul>
                </section>
            </div> -->
        </div>
    </FloatingWindow>
</template>

<script>
import FloatingWindow from '@/layout/FloatingWindow.vue'
import ajax from '@/utils/ajax.js'
import Markdown from '@/components/MarkdownParser.vue'

export default {
    emits: ['close'],
    inject: ['lowEndMode'],
    components: {
        FloatingWindow,
        Markdown
    },
    props: {
        wid: {
            default: false
        }
    },
    data() {
        return {
            message: ''
        }
    },
    created() {
        ajax('https://ceciliabottimelineapi.gio940.repl.co/timeline-daily-msg/1').then(res => {
            this.message=res;
        }).catch(()=>{})
    },
    mounted() {
    },
    computed: {
    },
    watch: {
        wid(n,o) {
            if (n && o) {
                this.$refs.window.outsideSetFocus()
            }
        }
    },
    methods: {
        close() {
            this.$emit('close')
        }
    }
}
</script>

<style>
    .changelog-badge.official {
        background: #2196f3;
        color: white;
    }
    .note-style-window {
        background-color: #feff9c !important;
    }
    .note-style-window .window-header {
        background: transparent;
        color: black;
    }
</style>