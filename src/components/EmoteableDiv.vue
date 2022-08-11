<template>
    <div class="emotable-div" v-if="icon">
        <!-- <div v-if="icon" class="emote-icon-toggle" @mousedown.prevent @click="toggleEmoteSelector" data-html2canvas-ignore>
            <button class="material-button flat basic" style="font-size: 20px; line-height: 2em; pointer-events: none;">
                <i class="fas fa-smile"></i>
            </button>
        </div> v-if="showEmoteSelector"-->
        <div ref="emote-selector" v-if="showEmoteSelector" class="emote-selector" :style="selectorStyling">
            <span v-for="emote in emotes" :key="emote.code" class="emote-wrapper" @mousedown.prevent @click="clickToInserEmote(emote.code)" style="min-width: 40px; min-height: 40px;">
                <img :src="emote.src" :title="':'+ emote.code +':'" height="40" SameSite="Lax" />
            </span>
        </div>
        <div v-if="autocomplete.length">
            <div v-for="emote in autocomplete" :key="emote.code">
                <img :src="emote.src" style="height: 1.5em" />
            </div>
        </div>
    </div>

    <component :is="tagName" key="text-content" ref="text-box" v-bind="$attrs" class="input-box" :contenteditable="editable" spellcheck="false" @blur="onBlur" @click="onClick" v-emote v-html="text" />
</template>
<script>
import { computePosition, autoPlacement } from '@floating-ui/dom';
import { stringToHtmlEmotes, clickToInsertEmote, emotes } from '@/utils/text-to-emoji.js'
import emoteDirective from '@/directives/emote-editable-box.js'

export default {
    name: 'EmotableBox',
    emits: ['update'],
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
            autocomplete: [],
            autocompleteIndex: 0,
            selectorStyling: {
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
                var t = this.$refs['text-box'],
                    target = this.$refs['emote-selector'];
                if (!t) return;
                computePosition(t, target, {
                    strategy: 'fixed',
                    middleware: [autoPlacement({
                        allowedPlacements: ['top-end', 'bottom-end', 'left-start', 'right-start'],
                    })]
                }).then( ({x,y}) => {
                    this.selectorStyling.top = y+'px';
                    this.selectorStyling.left = x+'px';
                })
            }
        },
        onClick() {
            // this.showEmoteSelector = true;
            // this.$nextTick( () => this.setSelectorStyling() )
        },
        onBlur(e) {
            //this.showEmoteSelector = false;
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
    position: fixed;
    z-index: 50;
    width: 320px;
    height: 300px;
    overflow: auto;
    padding: 10px;
    background-color: var(--background-color-secondary);
    border-bottom: solid 20px var(--background-color-tertiary);
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