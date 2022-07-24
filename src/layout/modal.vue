<template>
    <div class="center-modal" @click="outOfBounds">
        <div class="flat-modal">
            <h1 class="n-window-title"><slot name="title"></slot></h1>
            <div style="text-align: center; padding: 30px 10px;"><slot></slot></div>
        </div>
    </div>
</template>
<script>
export default {
    emits: ['close'],
    name: 'FlatModal',
    methods: {
        outOfBounds(e) {
            if (e.target===e.currentTarget)
                this.$emit('close')
        }
    }
}
</script>