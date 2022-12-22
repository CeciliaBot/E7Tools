<template>
    <div id="XYCanvas"
        ref="XYCanvas"
        :class="['tier-graph-xy noselect', {grid: displayGrid}]"
        :data-drop-type="1"
        data-drop="tierlist-element"
        @drop="handleItemDrop($event, list)"
        @dragenter="(e) => dragOverResize(e.detail.node, true)"
        @dragleave="(e) => dragOverResize(e.detail.node, false)"
    >
        <template v-if="isMounted">
            <Teleport :to="$el.parentNode.parentNode">
                <div style="position: absolute; top: 10px; left: 0; width: 100%; z-index: 1; text-align: center;" data-html2canvas-ignore>
                    <button class="material-button flat primary" @click="toggleRenameAxesModal" v-ripple-effect>
                        <span>{{ $t('strings.rename_canvas_axes') }}</span>
                    </button>
                </div>
            </Teleport>
        </template>
        <div v-for="(pos, i) in ['top: 40px; left: 50%; transform: translateX(-50%);','right: 10px; top: 50%;','bottom: 10px; left: 50%; transform: translateX(-50%);','top: 50%; left: 10px;']" :key="'cartesian-ax'+i" :style="[pos, 'position: absolute; font-size: 72px; z-index: 1; pointer-events: none']">
            <EmoteableComponent :value="axes[i]" :editable="false" />
        </div>
        <span
            v-for="(c,i) in list"
            :key="c.id"
            :style="{left: c.x+'%', top: c.y+'%'}"
            :class="['tier-item', {'filter-out': !tierItemsMask[c.id]}]"
            v-drag="{drops: ['tierlist-element'], index: i, item: c.id, list: list}"
            @dragstart="(e) => dragOverResize(e.detail.node, true, true)"
            @dragfail="restoreElement"
            @dragclick="itemContextMenu(c.id, $event)"
            v-tooltip="() => getItemTooltip(c.id)"
        >
            <component
                :is="isComponentType"
                :hero="getItemId(c.id)"
                :artifact="getItemId(c.id)"
                :skin="skin[c.id]"
                :type="settings.fullArtwork?1:0"
                :hover="false"
                :showname="settings.showName"
                :showrole="settings.showRole"
                :showrarity="settings.showRarity"
                :size="settings.iconSize"
                :lazyload="true"
                :class="{'no-padding': !iconPadding}"
                @context="(h,e) => itemContextMenu(c.id,e)"
            ></component>
        </span>

        <RenameAxes v-if="renameAxesModal" :names="axes" @close="toggleRenameAxesModal"/>
    </div>
</template>

<script>
import artifactIconComponent from '@/components/artifact-icon.vue'
import renameAxesComponent from './TierListXYRename.vue'
import EmoteableBoxComponente from '@/components/EmoteableDiv.vue'
import { drag, drop } from '@/directives/drag-drop.js'
import arrayMove from '../utils/array-move.js'
var draggedElement; // used for resizing while dragging and zooming

export default {
    name: 'XY-Graph',
    directives: {
        drag,
        drop
    },
    components: {
        ArtifactIcon: artifactIconComponent,
        RenameAxes: renameAxesComponent,
        EmoteableComponent: EmoteableBoxComponente
    },
    inject: [
        /* zoom from layout/interactive.vue, needed to calculate relative drop position */
        'zoom',
        /* From tierlist-maker/index.vue */
        'settings',
        /* From TierList.vue */
        'tierItemsMask',
        'elementType',
        'getItemId',
        'getItemTooltip',
        'itemContextMenu',
        'skin', // skin object
        'iconPadding',
    ],
    props: {
        list: {
            type: Array,
            default() {return []}
        },
        axes: {
            type: Array,
            default() {return []}
        }
    },
    data() {
        return {
            isMounted: false,
            isFirefox: navigator.userAgent.indexOf("Firefox") > -1 ? true : false,  // this is needed because the grid in firefox is displayed incorrectly when zoomed out, chrome can handle it in it's own
            renameAxesModal: false
        }
    },
    mounted() {
        this.isMounted=true;
    },
    beforeUnmount() {
        draggedElement = null;
    },
    computed: {
        isComponentType() {
            return this.elementType==='character'
                ? 'HeroIcon'
                : 'ArtifactIcon'
        },
        displayGrid() {
            if (!this.isFirefox)
                return true;
            else if (this.zoom > 1.2)
                return true;
            return false;
        }
    },
    watch: {
        zoom() {
            if (draggedElement) this.dragOverResize(draggedElement, true)
        }
    },
    methods: {
        toggleRenameAxesModal() {
            this.renameAxesModal=!this.renameAxesModal;
        },
        handleItemDrop(e, to) { // to === this.list but don't let vue know
            var cX = e.detail.clientX, cY = e.detail.clientY;
            let canvas = this.$el.getBoundingClientRect();
            cX = Math.min(100, Math.max(0, (-canvas.left+cX)/canvas.width*100) ),
            cY = Math.min(100, Math.max( 0, (-canvas.top+cY)/canvas.height*100) );
            this.dragOverResize(e.detail.node, false);
            if (e.detail.list === this.list) { // element was moved withing graph
                e.detail.list[e.detail.oldIndex].x=cX;
                e.detail.list[e.detail.oldIndex].y=cY;
                arrayMove(e.detail.list, e.detail.oldIndex, e.detail.list.length);
                e.detail.node.style.top = cY+'%';
                e.detail.node.style.left = cX+'%';
            } else {
                e.detail.list.splice(e.detail.oldIndex, 1);
                to.push({id: e.detail.item, x: cX, y: cY})
            }
        },
        dragOverResize: function (node, over, starting = false) {
            var preZoom = node.getBoundingClientRect();
            node.style.transform = over?'scale('+this.zoom+')':'';
            var newZoom = node.getBoundingClientRect();
            if (!starting) {
                node.style.left = (preZoom.left + preZoom.width/2 - newZoom.width/2) +'px'
                node.style.top = (preZoom.top + preZoom.height/2 - newZoom.height/2) +'px'
            }

            if (over)
                draggedElement = node
            else
                draggedElement = null
        },
        restoreElement: function (e) {
            let target = e.detail.node;
            draggedElement = null;
            target.style.transform = '';
            target.style.top = e.detail.list[e.detail.oldIndex].y+'%';
            target.style.left = e.detail.list[e.detail.oldIndex].x+'%';
        }
    }
}
</script>

<style>
/*
url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Cg fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath opacity=".5" d="M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z"/%3E%3Cpath d="M6 5V0H5v5H0v1h5v94h1V6h94V5H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
*/
.tier-graph-xy {
    position: relative;
    height: 100%;
    width: 100%;
    /* border: solid thin; */
    background: linear-gradient(var(--font-color-secondary), var(--font-color-secondary)), linear-gradient(var(--font-color-secondary),var(--font-color-secondary));
    background-position: center, center;
    background-size: 100% 2px, 2px 100%;
    background-repeat: no-repeat, no-repeat;
}
.tier-graph-xy.grid {
    background: linear-gradient(var(--font-color-secondary), var(--font-color-secondary)), linear-gradient(var(--font-color-secondary),var(--font-color-secondary)), linear-gradient(to right, #80808033 1px, transparent 1px), linear-gradient(to bottom, #80808033 1px, transparent 1px);
    background-position: center, center, top left, top left;
    background-size: 100% 2px, 2px 100%, 50px 50px, 50px 50px;
    background-repeat: no-repeat, no-repeat, repeat, repeat;
}
.tier-graph-xy .tier-item {
    position: absolute;
    transform: translate(-50%, -50%);
}
.tier-graph-xy .dragPlaceholder {
    display: none !important;
}
</style>