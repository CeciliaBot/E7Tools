<template>
    <Teleport to="body">
        <Modal @close="emitClose">
            <template v-slot:title>{{ $t('strings.rename_canvas_axes') }}</template>
            <EmoteableComponent v-for="(pos, i) in ['top: 60px; left: 50%; transform: translateX(-50%);','right: 10px; top: 50%;','bottom: 10px; left: 50%; transform: translateX(-50%);','top: 50%; left: 10px;']" :key="'cartesian-ax'+i" :value="localNames[i]" @update="updateNames($event,i)" :style="['position: absolute; font-size: 18px; z-index: 1; width: 45%; min-height: 32px; border: solid thin;', pos]"></EmoteableComponent>
        </Modal>
    </Teleport>
</template>

<script>
import modalComponent from '@/layout/modal.vue'
import EmoteableBoxComponente from '@/components/EmoteableDiv.vue'
export default {
    name: 'TierListXYRename',
    emits: ['close'],
    components: {
        EmoteableComponent: EmoteableBoxComponente,
        Modal: modalComponent
    },
    props: {
        names: {
            type: Array
        }
    },
    data() {
        return {
            localNames: []
        }
    },
    watch: {
        names: {
            immediate: true,
            deep: true,
            handler() {this.localNames=this.names}
        }
    },
    methods: {
        updateNames(e,i) {
            console.log(e,i)
            this.localNames[i]=e;
        },
        emitClose() {
            this.$emit('close', this.localNames)
        }
    }
}
</script>

<style>

</style>