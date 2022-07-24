<template>
    <div class="tier-database noselect" v-drop="'tierlist-element'" @drop="e=> handleDropEvent(e.detail.item, list, e.detail.list, e.detail.index, e.detail)">
        <span v-for="(c,i) in list" :key="'item-'+c" v-show="tierItemsMask[c]" class="tier-item" v-drag="{drops: ['tierlist-element'], index: i, item: c, list: list}" v-tooltip="()=>getItemTooltip(c)">
            <component
                :is="isComponentType"
                :hero="c"
                :artifact="c"
                :skin="skin[c]"
                :type="settings.fullArtwork?1:0"
                :hover="false"
                :showname="settings.showName"
                :showrole="settings.showRole"
                :showrarity="settings.showRarity"
                :size="settings.iconSize"
                :lazyload="true"
                :class="{'no-padding': !iconPadding}"
                @context="itemContextMenu"
            ></component>
        </span>
    </div>
</template>

<script>
import artifactIconComponent from '@/components/artifact-icon.vue'

import { drag, drop } from '@/directives/drag-drop.js'
import arrayMove from '../utils/array-move.js'

export default {
    name: 'TierListItemBox',
    components: {
        // ArtifactIcon is not global but eslint will throw an error so next line is needed
        // eslint-disable-next-line
        ArtifactIcon: artifactIconComponent
    },
    directives: {
        drag,
        drop
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
        list: {
            type: Array,
            required: true
        },
        tierType: {
            type: Number,
            required: true
        }
    },
    watch: {
    },
    computed: {
        isComponentType() {
            return this.elementType==='character'
                ? 'HeroIcon'
                : 'ArtifactIcon'
        }
    },
    methods: {
        handleDropEvent(item, to, from, newIndex, detail) {
            if (from === to) { // moved withing the item box
                arrayMove(from, from.indexOf(item), newIndex);
            } else { // from another list
                if (this.tierType === 0) { // moved from a tier row
                    /* make sure there are no duplicates */
                    while ( from.includes(item) ) from.splice(from.indexOf(item), 1);
                    to.splice(newIndex, 0, item);
                } else { // moved from XY graph
                    from.splice(detail.oldIndex, 1);
                    to.splice(newIndex, 0, item);
                }
            }
        }
    }
}
</script>

<style>

</style>