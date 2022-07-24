<template>
    <div class="tier-load-box" style="position: absolute; z-index: 100; left: 0; top: 0; height: 100%; width: 100%;">
        <h1>
            <span style="font-weight: 600;">Compare to</span>
            <button class="material-button stroked primary" @click="$emit('close')" v-ripple-effect style="float: right; font-size: 0.6em;; width: 220px;">{{ $t('strings.cancel') }}</button>
        </h1>
        <div class="hide-scrollbar">
            <div v-if="numberOfTierLists" class="load-body">
                <TierListCard v-for="tierList in tierListHistory" v-show="tierList.type===type" :key="tierList.id" :tierlist="tierList" :buttons="false" @load="$emit('compare', tierList); $emit('close')" />
            </div>
            <div v-else>
                <span>No tier lists availabale</span>
            </div>
        </div>
    </div>
</template>
<script>
import tierListCard from './TierListCard.vue'

export default {
    name: 'SelectCompareTierList',
    components: {
        TierListCard: tierListCard
    },
    props: {
        type: {
            type: String,
            require: true
        }
    },
    computed: {
        tierListHistory() {
            return this.$store.getters.getTierListDB();
        },
        numberOfTierLists() {
            return Object.values(this.tierListHistory).length
        }
    }
}
</script>
<style scoped>
.full-screen {
    position: absolute;
    z-index: 50;
    width: 100vw;
    height: 100%;
    display: flex;
}
.full-screen > div {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}
.tier-load-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    background-color: #00000077;
}
.tier-load-box > h1 {
    width: 100%;
    padding: 40px 0;
    font-size: 50px;
    align-self: start;
    font-weight: 400;
}
.tier-load-box > div {
    flex: 1;
    width: 100%;
    overflow: auto;
}
.load-body {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
</style>