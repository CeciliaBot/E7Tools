<template>
    <FloatingWindow :wid="timelineKey + 'stats'" @close="close" :glass-window="!this.lowEndMode" :open-maximized="fullScreenWindows" >
        <template v-slot:icon><img src="https://page.onstove.com/img/icons/apple-touch-icon.png" samesite="Lax" /></template>
        <template v-slot:title><span>{{ windowTitle }}</span></template>
        <template v-if="StatsComponent">
            <component :is="StatsComponent" :timelineId="timelineKey" :data="timelineData" />
        </template>
        <template v-else>
            Loading
        </template>
    </FloatingWindow>
</template>

<script>
import { shallowRef } from 'vue'
import FloatingWindow from '@/layout/FloatingWindow.vue'
import StatsError from './stats/StatsError.vue'

export default {
    emits: ['close'],
    inject: ['lowEndMode'],
    components: {
        FloatingWindow,
    },
    props: {
        timelineKey: {
            type: String
        },
        timelineData: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            results: null,
            fullScreenWindows: this.$store.getters.getIsMobile()
        }
    },
    setup(props) {
        // use shallowRef to remove unnecessary optimizations
        const StatsComponent = shallowRef('')

        import(`./stats/${props.timelineKey}.vue`)
            .then( moduleImport => {
                console.log(moduleImport.default)
                StatsComponent.value = moduleImport.default
            })
            .catch( () => {
                StatsComponent.value = StatsError
            })

        return {
            StatsComponent
        }
    },
    computed: {
        windowTitle() {
            return this.timelineKey + ' - Stats'
        }
    },
    methods: {
        getStats() {
            var t = this.timelineData,
                o = {
                    eventDates: [],
                    newEventDates: [],
                    characters: {},
                    artifacts: {}
                };
            t.forEach(event => {
                o.eventDates.push(event.dt)
                if ( (event.c || []).some(x => x.new) )
                    o.newEventDates.push(event.dt);
                (event.c || []).forEach( character => {
                    if ( !o.characters[character.id] )
                        o.characters[character.id] = [];
                    o.characters[character.id].push(event.dt)
                });
                (event.a || []).forEach( artifact => {
                    if ( !o.artifacts[artifact.id] )
                        o.artifacts[artifact.id] = [];
                    o.artifacts[artifact.id].push(event.dt)
                });
            })

            
            this.results = o
        },
        close() {
            this.$emit('close')
        }
    }
}
</script>

<style>
</style>