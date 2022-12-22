<template>
    <FloatingWindow wid="changelog-ultimate-timeline" @close="$emit('close')" :glass-window="!lowEndMode">
        <template v-slot:icon><i class="fa fa-history"></i></template>
        <template v-slot:title>Changelog</template>
        <div style="text-align: center;">You can contact me on discord: gio#0898</div>
        <ChangelogComponent path="views/timeline2/" />
    </FloatingWindow>
</template>

<script>
import FloatingWindow from '@/layout/FloatingWindow.vue'
import ChangelogComponent from '@/components/changelog.vue'
export default {
    emits: ['close'],
    inject: ['lowEndMode'],
    components: {
        FloatingWindow,
        ChangelogComponent
    }
}
</script>

<style>
</style>