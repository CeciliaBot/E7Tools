<template>
    <div key="tier-list-table" style="margin-top: 1px;" data-drop="tiers" @drop="handleDropEvent">
        <TransitionGroup :name="animation" tag="div">
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
        </TransitionGroup>
        <Teleport to="body">
            <RowSettings
                v-if="showRowModal"
                :tier="showRowModal"
                @move="moveTierListRow"
                @delete="deleteTier"
                @clear="clearTier"
                @new-above="addNewTierAbove"
                @new-below="addNewTierBelow"
                @close="showRowModal=false"
            />
        </Teleport>
    </div>
</template>
<script>
import tierRowComponent from './TierListTableRow.vue'
import tierRowSettingsComponent from './TierListRowSettings.vue'
import arrayMove from '../utils/array-move.js'
import { labelColors } from '../constants/'

export default {
    emits: ['rename-tier-row', 'delete-tier-row', 'clear-tier-row', 'move-tier-row', 'newTier'],
    components: {
        TierRow: tierRowComponent,
        RowSettings: tierRowSettingsComponent
    },
    inject: ['settings'],
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
            labelColors: labelColors, //['#ff5f5f','#fa6e6e','#fa9560','#fac552','#f4fa43','#b0fa35','#62fb26','#18fb26','#09fb6b','#03f3b7','#0383f3','#095ab0','#503ece','#5b31f0','#7640b7','#c44bc8','#ec7597','#f9b4c8','#fdedf2','#c4babd','#686566'],
            showRowModal: false
        }
    },
    computed: {
        animation() {
            return this.settings.tierRowControlsType===1 ? 'list' : ''
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
        addNewTierAbove(tier) {
            this.$emit('newTier', this.tiers.indexOf(tier))
        },
        addNewTierBelow(tier) {
            this.$emit('newTier', this.tiers.indexOf(tier)+1)
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
            // this.$nextTick( () => {
            //     var rows = this.$el.querySelectorAll('div .tier-wrapper');
            //     if (rows)
            //         rows[newIndex].scrollIntoView({block: 'center'});
            // })
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
<style scoped>
    .list-move, /* apply transition to moving elements */
    .list-enter-active,
    .list-leave-active {
        transition: all 0.5s ease;
    }

    .list-enter-from,
    .list-leave-to {
        opacity: 0;
        transform: translateX(30px);
    }

    /* ensure leaving items are taken out of layout flow so that moving
    animations can be calculated correctly. */
    .list-leave-active {
        position: absolute;
    }
</style>