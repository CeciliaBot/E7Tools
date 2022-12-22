<template>
    <div :class="['tier-wrapper', settings.rowLabelLayout ? 'type1':'type2']">
        <div class="tier-name" :style="'position: relative; background-color:'+ color">
            <EmotableBox
                class="center-tier-label-input"
                :key="'row-name'"
                :value="tier.name"
                @update="updateTierName"
                @contextmenu.prevent="openRowSettings"
                v-tooltip="{value: 'Click to edit.<br>Right click for more options.'}"
            ></EmotableBox>
            <div class="resizer w" @mousedown.stop.prevent="startResizer" @touchstart.stop.prevent="startResizer"></div> <!--@mousedown="resizeMouseDown" @touchstart="resizeMouseDown"-->
        </div>
        <div class="tier-list" :style="{'min-height': (iconFullSize + 30) + 'px'}" v-drop="'tierlist-element'" @drop="e=> handleDropEvent(e.detail.item, tier.list, e.detail.list, e.detail.index)">
            <span v-for="(c,i) in tier.list" :key="c" :class="['tier-item', {'filter-out': !tierItemsMask[c]}]" v-drag="{drops: ['tierlist-element'], index: i, item: c, list: tier.list}" @dragclick="itemContextMenu(c, $event)" v-tooltip="() => getItemTooltip(c)">
                <component
                    :is="isComponentType"
                    :hero="getItemId(c)"
                    :artifact="getItemId(c)"
                    :skin="skin[c]"
                    :type="settings.fullArtwork?1:0"
                    :hover="false"
                    :showname="settings.showName"
                    :showrole="settings.showRole"
                    :showrarity="settings.showRarity"
                    :size="settings.iconSize"
                    :lazyload="true"
                    :class="{'no-padding': !iconPadding}"
                    @context="(h,e) => itemContextMenu(c,e,tier.list)"
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
        'setSettings',
        /* From TierList.vue */
        'tierItemsMask',
        'elementType',
        'getItemId',
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
        },
        

        startResizer(e) {
            var target = e.target.parentNode;
            var box = target.getBoundingClientRect()
            document.body.style.pointerEvents = 'none'
            document.querySelector("html").style.cursor = 'w-resize'
            const mouseMove = (event) => {
                const clientX = event.touches ? event.touches[0].clientX : event.clientX;
                var x = Math.max(50, Math.min(clientX - box.left + 2, 300));
                this.setSettings('labelWidth', x)
            }
            function mouseUp() {
                window.removeEventListener('mousemove', mouseMove)
                window.removeEventListener('mouseup', mouseUp)
                window.removeEventListener('touchmove', mouseMove)
                window.removeEventListener('touchend', mouseUp)
                window.removeEventListener('touchleave', mouseUp)
                document.body.style.pointerEvents = ''
                document.querySelector("html").style.cursor = ''
            }
            window.addEventListener('mousemove', mouseMove)
            window.addEventListener('mouseup', mouseUp)

            window.addEventListener('touchmove', mouseMove)
            window.addEventListener('touchend', mouseUp)
            window.addEventListener('touchleave', mouseUp)
        }
    }
}
</script>
<style>
.center-tier-label-input {
    display: table-cell;
    vertical-align: middle;
    width: 100%;
}
.filter-out {
    opacity: 0.1;
}

.resizer {
    position: absolute;
    height: 5px;
    width: 5px;
}
.tier-wrapper.type1 .resizer {
    display: none;
}
.resizer.w {
    height: 100%;
    top: 0;
    right: 0;
    cursor: w-resize;
}
.resizer.w:active,
.resizer.w:hover {
    box-shadow: inset #008eff -1px 0px 0px 0px, #008eff 1px 0px 0px 0px;
}
</style>