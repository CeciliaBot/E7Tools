<template>
    <EventPopupWindow v-for="event in openWindows" :key="event[0]" :event="event[1]" :wid="event[0]" @close="close(event)"/>
</template>

<script>
import EventPopupWindow from './EventPopupWindow.vue'
export default {
    emits: [],
    components: {
        EventPopupWindow
    },
    props: {
        event: {
            required: true
        }
    },
    watch: {
        event() {
            this.openWindows.push(['event-window-'+Date.now(), this.event])
        }
    },
    data() {
        return {
            openWindows: []
        }
    },
    methods: {
        close(e) {
            this.openWindows.splice(this.openWindows.indexOf(e),1)
        }
    }
}
</script>

<style>

</style>