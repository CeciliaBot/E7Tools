<template>
    <div key="tier-list-table" style="margin-top: 1px;" data-drop="tiers" @drop="handleDropEvent">
        <TierRow 
            v-for="(tier,ti) in tiers"
            :key="tier._id"
            :index="ti"
            :tier="tier"
            :color="tier.color || labelColors[ti % labelColors.length]"
            :data-item-index="ti"
            @move="moveTierListRow"
            @rename="updateTierTitle"
            @drop-item="tierRowDropItem"
            @settings="openRowSettingsModal"
        />
        <Teleport to="body">
            <RowSettings
                v-if="showRowModal"
                :tier="showRowModal"
                :colors="labelColors"
                @move="moveTierListRow"
                @delete="deleteTier"
                @clear="clearTier"
                @close="showRowModal=false"
            />
        </Teleport>
    </div>
</template>
<script>
import tierRowComponent from './TierListTableRow.vue'
import tierRowSettingsComponent from './TierListRowSettings.vue'
import arrayMove from '../utils/array-move.js'
export default {
    components: {
        TierRow: tierRowComponent,
        RowSettings: tierRowSettingsComponent
    },
    props: {
        tiers: {
            type: Object,
            required: true
        },
        itemList: { /* Character list from hero box */
            type: Array,
            required: false,
            default() { return [] }
        },
        mask: {
            type: Object,
            required: false,
            default() { return {} }
        }
    },
    watch: {
    },
    data() {
        return {
            labelColors: ['#ff5f5f','#fa6e6e','#fa9560','#fac552','#f4fa43','#b0fa35','#62fb26','#18fb26','#09fb6b','#03f3b7','#0383f3','#095ab0','#503ece','#5b31f0','#7640b7','#c44bc8','#ec7597','#f9b4c8','#fdedf2','#c4babd','#686566'],
            showRowModal: false
        }
    },
    methods: {
        // Emitting a lot of events here because Vue doesn't like when you edit props,
        // in this case it would make the code a lot easier to read

        openRowSettingsModal(tier) {
            this.showRowModal=tier
        },
        updateTierTitle(index, name) {
            this.$emit('rename-tier-row', index, name)
        },
        deleteTier(tier) {
            this.$emit('delete-tier-row', this.tiers.indexOf(tier) )
            this.showRowModal=false;
        },
        clearTier(tier) {
            this.$emit('clear-tier-row', this.tiers.indexOf(tier) )
        },

        /******************* Move Tiers *******************/
        handleDropEvent(e) {
            this.$emit('move-tier-row', e.detail.oldIndex, e.detail.index);
        },
        moveTierListRow(tierlist, newIndex) {
            const index = this.tiers.indexOf(tierlist);
            if (index===-1) return;
            newIndex=index+newIndex;
            this.$emit('move-tier-row', index, newIndex);
        },
        /******************* drop item into one of the tiers *******************/
        tierRowDropItem(item, to, from, newIndex) {
            if (from === to) {
                arrayMove(from, from.indexOf(item), newIndex);
            } else {
                /* make sure there are no duplicates */
                while ( from.includes(item) ) from.splice(from.indexOf(item), 1);
                to.splice(newIndex, 0, item);
            }
        }
    }
}
</script>