<template>
    <div class="tierlist-compare-box" style="font-size: 1em; color: var(--font-color-confirm)" data-html2canvas-ignore>
        <template v-if="!oldPosition">NEW</template>
        <template v-else>
            <span :style="{display: !array[0] ? 'none' : '' }" :class="{'compare-up-tier': array[0]>0, 'compare-down-tier': array[0]<0}">{{ Math.abs(array[0]) }}</span>
            <span :style="{display: !array[1] || array[0] ? 'none' : '' }" :class="[array[1]>0 ? 'compare-left-tier' : 'compare-right-tier']">{{ Math.abs(array[1]) }}</span>
        </template>
    </div>
</template>
<script>
export default {
    name: 'compare-items',
    props: ['item', 'to', 'vertical', 'index'],
    computed: {
        oldPosition() { // the result will be kept in memory making variations faster to calculate until item and to are changed
            var t = this.to.tiers || [];
            for (var i in t) {
                var u = t[i].list || [];
                var j = u.indexOf(this.item);
                if (j>-1) {
                    return [j,i]
                }
            }
            return false;
        },
        array() {
            if (this.oldPosition) {
                let x = this.oldPosition[1]-this.vertical
                return [x, x!==0?this.index : this.oldPosition[0]-this.index]
            }
            return false
        }
    }
}
</script>