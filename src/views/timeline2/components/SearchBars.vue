<template>
    <div>
        <SearchWindow v-for="id in openWindows" :key="id" :ref="id" :wid="id" :events="events" @close="closeWindow" @go-to="$emit('goTo', $event)"></SearchWindow>
    </div>
</template>

<script>
import SearchWindow from './SearchFunction.vue'

export default {
    name: 'SearchBarsManager',
    components: {
        SearchWindow
    },
    props: {
        openId: {
            type: String
        },
        events: {
            required: true
        }
    },
    data() {
        return {
            openWindows: []
        }
    },
    watch: {
        openId(id) {
            this.openNewWindow(id)
        }
    },
    created() {
        window.addEventListener('keydown', this.keyboardShortcut)
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.keyboardShortcut)
    },
    methods: {
        openNewWindow(id) {
            this.openWindows.push(id)
        },
        closeWindow(id) {
            this.openWindows.splice(this.openWindows.indexOf(id), 1)
        },
        keyboardShortcut(e) {
            if (e.ctrlKey && e.key==='f') {
                e.preventDefault()
                var last = this.openWindows[this.openWindows.length-1],
                    el = this.$refs[last]
                if (last && el) {
                    el[0].outsideSetFocus()
                } else {
                    this.openNewWindow( 'search-id-'+Date.now() )
                }
            }
        }
    },
}
</script>

<style>

</style>