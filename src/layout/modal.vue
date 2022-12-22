<template>
    <div class="center-modal" @click="outOfBounds">
        <div class="flat-modal">
            <h1 v-if="title" class="n-window-title"><slot name="title"></slot></h1>
            <div style="text-align: center;"><slot></slot></div>
        </div>
    </div>
</template>
<script>
export default {
    emits: ['close'],
    name: 'FlatModal',
    props: {
        title: {
            type: Boolean,
            default: true
        }
    },
    methods: {
        outOfBounds(e) {
            if (e.target===e.currentTarget)
                this.$emit('close')
        }
    }
}
</script>