<template>
    <div :class="['tier-wrapper', settings.rowLabelLayout ? 'type1':'type2']">
        <EmotableBox
            :key="'row-name'"
            class="tier-name"
            :value="tier.name"
            :style="'background-color:'+ color"
            @update="updateTierName"
            @contextmenu.prevent="openRowSettings"
        ></EmotableBox>
        <div class="tier-list" :style="{'min-height': (iconFullSize + 30) + 'px'}" v-drop="'tierlist-element'" @drop="e=> handleDropEvent(e.detail.item, tier.list, e.detail.list, e.detail.index)">
            <span v-for="(c,i) in tier.list" :key="c" :class="['tier-item', {'filter-out': !tierItemsMask[c]}]" v-drag="{drops: ['tierlist-element'], index: i, item: c, list: tier.list}" @dragclick="itemContextMenu(c, $event)" v-tooltip="() => getItemTooltip(c)">
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
                <TierListCompareBox v-if="compareTiers" :item="c" :index="i" :vertical="index" :to="compareTiers" />
            </span>
            <div v-if="settings.tierRowControlsType===0" key="drag-tier-row-box" class="drag-tier-container" v-drag="{drops: ['tiers'], index: index, item: 'tier-'+tier._id, list: tier, node: () => $el, vertical: true}" data-html2canvas-ignore>
                <i class="fas fa-grip-lines"></i>
            </div>
            <div v-else class="tiermaker-control-box" data-html2canvas-ignore>
                <i class="fas fa-chevron-up" style="flex: 1; display: inline-flex; align-items: center;" @click="$emit('move', tier, -1)"></i>
                <i class="fas fa-cog" style="flex: 1; display: inline-flex; align-items: center;" @click="openRowSettings"></i>
                <i class="fas fa-chevron-down" style="flex: 1; display: inline-flex; align-items: center;" @click="$emit('move', tier, +2)"></i>
            </div>
        </div>
    </div>
</template>
<script>
import artifactIconComponent from '@/components/artifact-icon.vue'
import emoteEditableBoxComponent from '@/components/EmoteableDiv.vue'
import { drag, drop } from '@/directives/drag-drop.js'
import compareBoxComponent from './TierListCompareBox.vue'
export default {
    name: 'tier-row',
    emits: ['settings', 'rename', 'drop-item', 'move'],
    inject: [
        /* From index.vue */
        'settings',
        /* From TierList.vue */
        'tierItemsMask',
        'elementType',
        'getItemTooltip',
        'itemContextMenu',
        'skin', // skin object
        'iconPadding',
        'iconFullSize',
        'compareTiers',
    ],
    directives: {
        drag, drop
    },
    components: {
        ArtifactIcon: artifactIconComponent,
        EmotableBox: emoteEditableBoxComponent,
        TierListCompareBox: compareBoxComponent
    },
    props: {
        tier: {
            type: Object,
            required: true
        },
        index: {
            type: Number,
            required: true
        },
        color: {
            type: String
        }
    },
    watch: {
    },
    data() {
        return {}
    },
    computed: {
        isComponentType() {
            return this.elementType==='character'
                ? 'HeroIcon'
                : 'ArtifactIcon'
        }
    },
    methods: {
        openRowSettings() {
            document.activeElement.blur() // remove focus from the box
            this.$emit('settings', this.tier)
        },
        updateTierName(name) {
            this.$emit('rename', this.index, name)
        },
        handleDropEvent(item, to, from, newIndex) {
            this.$emit('drop-item', item, to, from, newIndex);
        }
    }
}
</script>
<style>
.filter-out {
    opacity: 0.1;
}
</style>