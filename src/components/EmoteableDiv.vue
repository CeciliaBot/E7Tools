<template>
    <div class="emotable-div" v-if="icon">
        <!-- <div v-if="icon" class="emote-icon-toggle" @mousedown.prevent @click="toggleEmoteSelector" data-html2canvas-ignore>
            <button class="material-button flat basic" style="font-size: 20px; line-height: 2em; pointer-events: none;">
                <i class="fas fa-smile"></i>
            </button>
        </div> -->
        <div v-if="showEmoteSelector" class="emote-selector" :style="selectorStyling">
            <span v-for="emote in emotes" :key="emote.code" class="emote-wrapper" @mousedown.prevent @click="clickToInserEmote(emote.code)" style="min-width: 40px; min-height: 40px;">
                <img :src="emote.src" :title="':'+ emote.code +':'" height="40" />
            </span>
        </div>
    </div>

    <component :is="tagName" key="text-content" ref="text-box" v-bind="$attrs" class="input-box" :contenteditable="editable" spellcheck="false" @blur="onBlur" @click="onClick" v-emote v-html="text" />
</template>
<script>
import { stringToHtmlEmotes, clickToInsertEmote, emotes } from '@/utils/text-to-emoji.js'
import emoteDirective from '@/directives/emote-editable-box.js'

export default {
    name: 'EmotableBox',
    directives: {
        emote: emoteDirective
    },
    props: {
        tagName: {
            type: String,
            required: false,
            default: 'DIV'
        },
        value: {
            type: String,
            required: false,
            default: ''
        },
        editable: {
            type: Boolean,
            default: true
        },
        icon: {
            type: Boolean,
            default: false
        }
    },
    renderTriggered (e) {console.log('EmoteableDiv', e)},
    data() {
        return {
            showEmoteSelector: false,
            emotes: emotes,
            selectorStyling: {
                position: 'fixed',
                zIndex: 50,
                width: '300px',
                minHeight: '100px',
                left: 0,
                right: 0
            }
        }
    },
    computed: {
        text() {
            return stringToHtmlEmotes(this.value)
        },
    },
    methods: {
        toggleEmoteSelector() {
            this.showEmoteSelector = !this.showEmoteSelector;
        },
        clickToInserEmote(emote) {
            clickToInsertEmote(emote, this.$refs['text-box'])
        },
        setSelectorStyling() {
            if (this.icon) {
                var t = this.$refs['text-box']
                if (!t) return;
                t=t.getBoundingClientRect();
                this.selectorStyling.left=t.right+'px';
                this.selectorStyling.top=t.top+'px';
                this.selectorStyling.minHeight=t.height+'px';
            }
        },
        onClick() {
            this.showEmoteSelector = true;
            this.setSelectorStyling();
        },
        onBlur(e) {
            this.showEmoteSelector = false;
            this.$emit('update', this.$refs['text-box'].getCleanInnerHTML(), e)
        }
    }
}
</script>
<style>
.emotable-div {
    position: absolute;
    /*margin-top: -50px;*/
    opacity: 1;
    transition: opacity .4s ease;
}
.emotable-div:hover,
.input-box:hover + .emotable-div,
.input-box:focus-within + .emotable-div {
    opacity: 1;
    color: #f1e069;
}
.emote-selector {
    z-index: 10;
    position: absolute;
    width: 300px;
    background-color: var(--background-modifier-darken-alpha);
    border-radius: 8px;
}
.emote-wrapper {
    padding: 5px;
    height: 40px;
    cursor: pointer;
}
.emote-wrapper:hover {
    background-color: var(--background-modifier-darken-alpha);
}
</style>