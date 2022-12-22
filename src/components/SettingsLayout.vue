<template>
    <div style="max-width: 600px; margin: auto; padding: 0 10px;">
        <h1>
            <span v-if="!subMenu.length">{{ $t('strings.settings') }}</span>
            <button v-else class="material-button basic primary" style="line-height: 0; padding: 3px 10px; font-size: inherit;" @click="backButton" v-ripple-effect>
                <i class="fa fa-angle-left" style="padding-right: 0.3em" />
                <span>{{ this.$t('strings.'+subMenuName[0]) }}</span>
            </button>
        </h1>
        <div style="margin: 10px 0;">
            <div v-for="(group, groupIndex) in currentMenu" :key="subMenu.join('-')+'-'+groupIndex" class="settings-group noselect">
                <div v-for="(option, optionIndex) in group" :key="'option'+optionIndex" class="settings-row mat-hover" @click="optionClick($event, option, groupIndex, optionIndex)" v-ripple-effect>
                    <span class="icon" :style="{color: option.iconColor}" v-html="option.icon"></span>
                    <div style="flex: 1; padding-right: 15px;">
                        <div>{{ $t('strings.'+option.name) }}</div>
                        <div class="description" v-html="$t('strings.'+option.description)"></div>
                    </div>
                    <SliderCheckbox v-if="option.slider" :value="option.value" />
                    <i v-else-if="option.children" class="fa fa-angle-right" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import SliderCheckbox from '@/layout/Slider.vue'

export default {
    name: 'SettingsLayout',
    components: {
        SliderCheckbox
    },
    props: {
        settings: {
            required: true,
            type: Array
        }
    },
    data: function () {
        return {
            subMenu: [],
            subMenuName: [],

            privacyPolicy: {}
        }
    },
    computed: {
        currentMenu() {
            var prof = this.subMenu.slice(),
                res = this.settings;
            while (prof.length>0) {
                res = this.getSubSettings(res, prof[0])
                prof.shift()
            }
            return res;
        }
    },
    methods: {
        getSubSettings(array, index) {
            var o  = array[index]
            if (o instanceof Object) {
                if (o.children)
                    return o.children
            }
            return o
        },
        optionClick(e, option, group, index) {
            if (option.slider) {
                option.value = !option.value
            }
            if (option.handler)
                option.handler(e, option)
            else if (option.children)
                this.subMenuName.unshift(option.name),
                this.subMenu.push(group),
                this.subMenu.push(index);
        },
        backButton() {
            this.subMenuName.shift()
            this.subMenu.splice(-2)
        }
    }
}
</script>
<style>
.settings-group {
    overflow: hidden;
    margin: 10px 0;
    padding: 5px 0;
    border-radius: 10px;
    background-color: var(--background-color-secondary);
    font-size: 25px;
    font-weight: 300;
}
.settings-group > div:not(:last-of-type) {
    border-bottom: solid thin gray;
}

.settings-row {
    display: flex;
    padding: 10px 15px;
    position: relative;
    overflow: hidden;
    justify-content: space-between;
    align-items: center;
}
.settings-row .description {
    font-size: 0.8em;
    opacity: 0.8;
}
.settings-row .icon {
    display: inline-block;
    width: 2em;
    text-align: center;
}
</style>