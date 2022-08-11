<template>
    <div class="center-modal" @click="externalClick">
        <div class="glass-container-2 hide-scrollbar" style="margin: auto; max-height: 85%; width: 450px; max-width: 90%; padding: 20px; overflow: scroll; border-radius: 8px;">
            <!-- Icon settings -->
            <div style="display: flex; align-items: center; margin: 10px 0; border-radius: 8px; border: solid grey; padding: 10px;">
                <div>
                    <div v-for="setting in [['showName','show_name'], ['showRarity','show_rarity'], ['showRole', 'show_role_attr'], ['fullArtwork', 'use_full_art']]" :key="setting[0]">
                        <label class="check" style="font-size: 16px">
                            <input type="checkbox" :checked="settings[setting[0]]" @change="setLocalSettings(setting[0], $event.target.checked)" ><!--@change="settings[setting[0]]=$event.target.checked"-->
                            <span class="checkmark"></span>
                            {{ $t('strings.'+setting[1]) }}
                        </label>
                    </div>
                    {{ $t('strings.size') }}: <input type="range" min="40" max="120" step="5" :value="localSettings.iconSize" @change="setLocalSettings('iconSize', Number($event.target.value) )">{{ localSettings['iconSize'] }}
                </div>
                <div style="display: inline-block; width: 160px; text-align: center; float: right;">
                    <HeroIcon hero="alencia" :type="localSettings.fullArtwork?1:0" :hover="false" :showname="localSettings.showName" :showrole="localSettings.showRole" :showrarity="localSettings.showRarity" :size="localSettings.iconSize" :lazyload="true" />
                </div>
            </div>
            <!-- Tier Row Layout -->
            <div style="margin: 10px 0; border-radius: 8px; border: solid grey; padding: 10px;">
                <div style="text-align: center; display: flex; align-items: center; justify-content: space-between;">
                    <span>{{ $t('strings.compact_tier_name') }}</span>
                    <label class="switch">
                        <input type="checkbox" :checked="localSettings.rowLabelLayout===1" @change="setLocalSettings('rowLabelLayout', localSettings.rowLabelLayout?0:1)" />
                        <i class="slider round" />
                    </label>
                </div>
                <br>
                <div style="height: 115px">
                    <div class="tier-wrapper" :class="{type1: localSettings.rowLabelLayout, type2: !localSettings.rowLabelLayout}">
                        <div class="tier-name" style="background-color': rgb(180,58,58)">Preview</div>
                        <div class="tier-list noselect" style="min-height: 50px">
                            <div v-for="i in ['white','yellow', 'blue','red']" :key="'preview-item'+i" :style="['display: inline-block;border-radius: 50px;height: 30px;width: 30px;', {backgroundColor: i}]"></div>
                            <div v-if="!localSettings.tierRowControlsType" class="drag-tier-container"><i class="fas fa-grip-lines" /></div>
                            <div v-else class="tiermaker-control-box">
                                <i class="fas fa-chevron-up" />
                                <i class="fas fa-cog" />
                                <i class="fas fa-chevron-down" />
                            </div>
                        </div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span>{{ $t('strings.simplified_tier_ctrl') }}</span>
                    <label class="switch">
                        <input type="checkbox" :checked="localSettings.tierRowControlsType===1" @change="setLocalSettings('tierRowControlsType', localSettings.tierRowControlsType?0:1)" />
                        <i class="slider round" />
                    </label>
                </div>
            </div>
            <div style="margin: 10px 0; border-radius: 8px; border: solid grey; padding: 10px; margin: 2px 0;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span>{{ $t('strings.tier_list_vertical_layout') }}</span>
                    <label class="switch">
                        <input type="checkbox" :checked="localSettings.tierListMakerView===1" @change="setLocalSettings('tierListMakerView', localSettings.tierListMakerView?0:1)" />
                        <i class="slider round" />
                    </label>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin: 2px 0;">
                    <span>{{ $t('strings.export_png_without_title') }}</span>
                    <label class="switch">
                        <input type="checkbox" :checked="localSettings.exportTitlessImage" @change="setLocalSettings('exportTitlessImage', !localSettings.exportTitlessImage)" />
                        <i class="slider round" />
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'tier-list-settings',
    inject: ['settings', 'setSettings'],
    data: function() {
        return {
            localSettings: {}
        }
    },
    watch: {
    },
    created: function () {
        this.localSettings = JSON.parse(JSON.stringify(this.settings))
    },
    methods: {
        setLocalSettings(key, val) {
            this.localSettings[key] = val;
        },
        externalClick(e) {
            if (e.currentTarget === e.target)
                this.closeAndSave();
        },
        closeAndSave() {
            for (const key in this.localSettings) { /* Applay local settings to the real settings */
                this.setSettings(key, this.localSettings[key])
            }
            this.$emit('close')
        }
    }
}
</script>
<style>
/************ SLIDER  ********************/
.switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 36px;
    vertical-align: middle;
}

/* Hide default HTML checkbox */
.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

/* The slider */
.slider {
    position: absolute;
    cursor: pointer;
    width: 60px;
    top: 0;
    /*left: 0;*/
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 5px;
    bottom: 5px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
}

input:checked + .slider {
    background-color: #2196F3;
}

input:focus + .slider {
    box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
    -webkit-transform: translateX(24px);
    -ms-transform: translateX(24px);
    transform: translateX(24px);
}

/* Rounded sliders */
.slider.round {
    border-radius: 34px;
}

.slider.round:before {
    border-radius: 50%;
}
</style>