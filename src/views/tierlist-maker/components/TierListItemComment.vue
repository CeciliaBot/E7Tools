<template>
    <Modal @close="emitClose">
        <template v-slot:title>{{ $t('strings.edit_item_comment') }} - {{ name }}</template>
        <EmoteableComponent :value="localComment" @update="onUpdate" :icon="true" style="border: solid thin; height: 100%; text-align: start; padding: 5px;"></EmoteableComponent>
    </Modal>
</template>

<script>
import modalComponent from '@/layout/modal.vue'
import EmoteableBoxComponente from '@/components/EmoteableDiv.vue'

export default {
    name: 'TierListItemComment',
    components: {
        EmoteableComponent: EmoteableBoxComponente,
        Modal: modalComponent
    },
    props: {
        comment : {},
        name: {}
    },
    data() {
        return {
            localComment: this.comment
        }
    },
    methods: {
        emitClose() {
            this.$emit('close')
        },
        onUpdate(value) {
            this.$emit('setcomment', value)
        }
    }
}
</script>

<style>

</style>