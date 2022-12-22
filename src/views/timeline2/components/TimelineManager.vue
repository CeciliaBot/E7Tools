<template>
    <div style="z-index: 50; position: fixed;">
        <FloatingWindow wid="timeline-rows-manager" @close="close" :glass-window="!lowEndMode">
            <template v-slot:icon><img src="/favicons/apple-touch-icon.png" /></template>
            <template v-slot:title>Timeline Manager</template>
            <div style="max-width: 800px; margin: auto; height: 100%;">
                <div style="margin-right: 50px;">
                    <i>Drag the items bellow to sort the timeline</i>
                    <div v-drop="'timelines-manager'" style="height: 100%;" @drop="e=> handleDropEvent(e.detail.item, timelinesArray, timelinesArray, e.detail.index, e.detail.oldIndex)">
                        <div v-for="item,i in timelinesArray" :key="item" class="draggable-timeline-row-wrapper" v-drag="{drops: ['timelines-manager'], index: i, item: item[0], list: timelinesArray, vertical: true}">
                            <div class="draggable-timeline-row-editor">
                                <div style="flex: 1;">
                                    <img :src="timelines[item[0]].icon" style="width: 1.5em; max-height: 2em; vertical-align: middle;" crossorigin="anonymous" samesite="Lax" />
                                    <span>{{ item[0] }}</span>
                                </div>
                                <i :class="['fa', item[1] ? 'fa-eye on' : 'fa-eye-slash off']" @click="item[1] = !item[1]" v-tooltip="()=>tooltip(item[1])" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FloatingWindow>
    </div>
</template>

<script>
import FloatingWindow from '@/layout/FloatingWindow.vue'

import { drag, drop } from '@/directives/drag-drop2.js'
import { arrayMove } from '@/utils/array.js'

import config from '../config.js'

export default {
    emits: ['close', 'setTimelines'],
    inject: ['lowEndMode'],
    components: {
        FloatingWindow
    },
    directives: {
        drag, drop
    },
    props: {
        visible: {
            type: Array
        }
    },
    data() {
        return {
            timelines: config.supportedTimelines,
            timelinesArray: [],
            isInternalChange: false
        }
    },
    created() {
        this.timelinesArray = this.visible.map(x => [x, true])
        Object.keys(config.supportedTimelines).filter(key=> !this.visible.includes(key)).forEach(key => this.timelinesArray.push([key, false]))
    },
    watch: {
        visible: {
            deep: true,
            handler: function () {
                if (!this.isInternalChange) {
                    this.timelinesArray.forEach( x => {
                        x[1] = this.visible.includes(x[0])
                    })
                }
                else {
                    this.isInternalChange = false;
                }
            }
        },
        timelinesArray: {
            deep: true,
            handler: function () { this.$emit('setTimelines', this.applyChanges() ) }
        }
    },
    methods: {
        applyChanges() {
            this.isInternalChange = true;
            return this.timelinesArray.filter(x => x[1]).map(x => x[0])
        },
        tooltip(state) {
            return state ? 'Click to hide' : 'Click to display'
        },
        close() {
            this.$emit('close')
        },
        handleDropEvent(item, to, from, index, oldIndex) {
            oldIndex = Number(oldIndex)
            if (oldIndex===-1)
                return;
            if (from === to) {
                if (index===oldIndex)
                    return;
                arrayMove(to, oldIndex, index)
            } else {
                from.splice(oldIndex, 1)
                to.splice(index, 0, item)
            }
        }
    }
}
</script>

<style scoped>
    .draggable-timeline-row-wrapper {
        margin: 2px;
    }
    .draggable-timeline-row-editor {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 1.1em;
        padding: 5px 10px;
        cursor: grab;
        border-radius: 6px;
        background: var(--background-modifier-darken-alpha);
    }
    .on {
        color: green;
    }
    .off {
        color: red;
    }
</style>