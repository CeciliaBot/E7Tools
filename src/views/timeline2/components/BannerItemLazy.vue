<template>
    <Lazy :style="bannerStyle" parent=".ultimate-timeline" @click="openEvent">
        <TimelineItem :event="event" :daySize="daySize" :vertical="vertical" :category="category" />
    </Lazy>
</template>

<script>
import Lazy from '@/layout/Lazy.vue'
import TimelineItem from './BannerItem.vue'

export default {
    emits: ['open-event'],
    components: {
        Lazy,
        TimelineItem
    },
    props: {
        event: Object,
        daySize: Number,
        category: String,
        vertical: Boolean,
        reverse: Boolean
    },
    computed: {
        bannerStyle() {
            return {
                position: 'absolute',
                padding: this.vertical ? '1px 0' : '0 1px',
                transform:
                    !this.vertical ?
                        'translate(' + (!this.reverse ? this.event.fromStart : this.event.fromEnd)*this.daySize + 'px, ' + this.event.inDayIndex*55+ 'px )'
                    :
                        'translate(' + this.event.inDayIndex*55+ 'px, ' + (!this.reverse ? this.event.fromStart : this.event.fromEnd)*this.daySize + 'px)',
                //[this.vertical ? 'top':'left']: (!this.reverse ? this.event.fromStart : this.event.fromEnd)*this.daySize+'px',
                [this.vertical ? 'height':'width']: this.daySize*this.event.size+'px',
                //[this.vertical ? 'left':'top']: this.event.inDayIndex*55+'px'
            }
        }
        // bannerStyle() {
        //     return {
        //         position: 'absolute',
        //         padding: this.vertical ? '1px 0' : '0 1px',
        //         transform:
        //             !this.vertical ?
        //                 'translate(' + (!this.reverse ? this.event.fromStart : this.event.fromEnd)*this.daySize + 'px, ' + this.event.inDayIndex*55+ 'px )'
        //             :
        //                 'translate(' + this.event.inDayIndex*55+ 'px, ' + (!this.reverse ? this.event.fromStart : this.event.fromEnd)*this.daySize + 'px)',
        //         //[this.vertical ? 'top':'left']: (!this.reverse ? this.this.event.fromStart : this.this.event.fromEnd)*this.daySize+'px',
        //         [this.vertical ? 'height':'width']: this.daySize*this.event.size+'px',
        //         //[this.vertical ? 'left':'top']: this.this.event.inDayIndex*55+'px'
        //     }
        // }
    },
    methods: {
        openEvent() {
            this.$emit('open-event', this.event)
        }
    }
}
</script>

<style>

</style>