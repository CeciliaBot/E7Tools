<template>
    <Teleport to="body">
        <Modal @click="outOfBounds">
            <template v-slot:title>{{ $t('strings.tier_editor') }}</template>
            <div style="max-width: 470px; display: inline-block;">
                <h3>{{ $t('strings.label_bg_color') }}:</h3>
                <span :class="['color-circle', {'selected-color': !localTier.color}]" style="background-color: white;" @click="localTier.color = null">A</span>
                <span v-for="color in colors" :key="color" :class="['color-circle', {'selected-color': color===localTier.color}]" :style="{backgroundColor: color}" @click="localTier.color=color" ></span>
                <div>{{ $t('strings.selected') }}: {{ localTier.color || $t('strings.automatic') }}</div>
            </div>
            <div>
                <h3>{{ $t('strings.label_text') }}:</h3>
                <EmoteableDiv :value="localTier.name" :icon="true" @update="localTier.name=$event" style="display: inline-block; border: solid 1px; width: 100%; max-width: 470px; height: 70px; font-size: 16px;" />
            </div>
            <div style="margin-top: 20px;">
                <button class="flat-button material-button basic basic" v-ripple-effect @click="$emit('newAbove', localTier)"><span>{{ $t('strings.new_tier_above') }}</span></button>
                <button class="flat-button material-button basic basic" v-ripple-effect @click="$emit('newBelow', localTier)"><span>{{ $t('strings.new_tier_below') }}</span></button>
                <button class="flat-button material-button basic basic" v-ripple-effect @click="$emit('clear', localTier)"><span>{{ $t('strings.clear_tier') }}</span></button>
                <button class="flat-button material-button basic basic" v-ripple-effect @click="$emit('move', localTier, -1)"><span>{{ $t('strings.move_up') }}</span></button>
                <button class="flat-button material-button basic warn" v-ripple-effect @click="$emit('delete', localTier)"><span>{{ $t('strings.delete_tier') }}</span></button>
                <button class="flat-button material-button basic basic" v-ripple-effect @click="$emit('move', localTier, +2)"><span>{{ $t('strings.move_down') }}</span></button>
            </div>
        </Modal>
    </Teleport>
</template>
<script>
import modalComponent from '@/layout/modal.vue'
import emoteableComponent from '@/components/EmoteableDiv.vue'
import { labelColors } from '../constants/'
export default {
    name: 'TierRowSettings',
    emits: ['move', 'delete', 'clear', 'newAbove', 'newBelow', 'close'],
    components: {
        Modal: modalComponent,
        EmoteableDiv: emoteableComponent
    },
    props: {
        tier: {
            type: Object,
            required: true
        }
    },
    created() {
        this.localTier=this.tier
    },
    data() {
        return {
            localTier: {},
            colors: labelColors
        }
    },
    methods: {
        outOfBounds(e) {
            if (e.currentTarget === e.target)
                this.closeModal();
        },
        closeModal() {
            this.$emit('close')
        }
    }
}
</script>
<style>
.color-circle {
    display: inline-block;
    height: 30px;
    width: 30px;
    border-radius: 100%;
    margin: 5px;
    vertical-align: middle;
    font-size: 19px;
    text-align: center;
    cursor: pointer;
    border: solid 2px transparent;
}
.color-circle.selected-color {
    border: solid 2px;
}
</style>