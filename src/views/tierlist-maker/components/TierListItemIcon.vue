<template>
    <span class="tier-item">
        <component
            :is="isComponentType"
            :hero="item"
            :artifact="item"
            :skin="skin[item]"
            :type="settings.fullArtwork?1:0"
            :hover="false"
            :showname="settings.showName"
            :showrole="settings.showRole"
            :showrarity="settings.showRarity"
            :size="settings.iconSize"
            :lazyload="true"
            :class="{'no-padding': !iconPadding}"
            :tooltip="getItemTooltip"
            @context="itemContextMenu"
        ></component>
    </span>
</template>

<script>
import artifactIconComponent from '@/components/artifact-icon.vue'
import { drag } from '@/directives/drag-drop.js'
export default {
    name: 'TierListItemIcon',
    directives: { drag },
    components: {
        ArtifactIcon: artifactIconComponent
    },
    inject: [
        'settings',
        /* From TierList.vue */
        'tierItemsMask',
        'elementType',
        'getItemTooltip',
        'itemContextMenu',
        'skin', // skin object
        'iconPadding'
    ],
    props: {
        list: {},
        index: {},
        item: {}
    },
    computed: {
        isComponentType() {
            return this.elementType==='character'
                ? 'HeroIcon'
                : 'ArtifactIcon'
        }
    }
}
</script>

<style>

</style>