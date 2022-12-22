<template>
    <div class="container noselect">
        <div :class="['nav-bar text-black-stroke', {invisible: !ui}]">
            <span class="slide-counter"> {{ localIndex+1 }}/{{album.length }}</span>
            <span class="nav-icon" @click="closeGallery" v-tooltip="() => this.$t('strings.close')">
                <i class="fa fa-times"></i>
            </span>
            <span v-if="canCopy" class="nav-icon" @click="copyImage" style="font-weight: 800; margin-top: -2px; font-size: 0.8em;" v-tooltip="() => this.$t('strings.copy')"><i class="fas fa-copy"></i></span>
            <span v-if="canDownload" class="nav-icon" @click="downloadImage" style="font-weight: 800; margin-top: -2px; font-size: 0.8em;" v-tooltip="() => this.$t('strings.download')"><i class="fas fa-download"></i></span>
            <span :class="['nav-icon', {invisible: isLast}]" @click="nextImage" style="font-weight: 800; margin-top: -2px;" v-tooltip="() => this.$t('strings.next')">&gt;</span>
            <span v-show="!isFirst" :class="['nav-icon', {invisible: isFirst}]" @click="prevImage" style="font-weight: 800; margin-top: -2px;" v-tooltip="() => this.$t('strings.back')">&lt;</span>
            <div :class="['next-prev-img', {invisible: isFirst}]" @click="prevImage" style="left: 10px;"><i class="fa fa-angle-left"></i></div>
            <div :class="['next-prev-img', {invisible: isLast}]" @click="nextImage" style="right: 10px;"><i class="fa fa-angle-right"></i></div>
        </div>
        <div class="center">
            <i v-show="loadingImage" class="fas fa-spinner fa-spin"></i>
            <span v-if="imageFailed">
                <img :src="require('@/assets/cermia404.png')"/>
                <br>{{ $t('strings.app_not_found') }}
            </span>
        </div>
        <div style="height: 100%; width: 100%;"><!--important or can be set to Interactive-->
            <Interactive
                :height="1"
                :width="1"
                :maxzoom="10"
                :minzoom="0.03"
                padding="50 0 60 0"
                :smooth="true"
                @dragging-start="hideUI"
                @dragging-end="showUI"
                v-slot="{ loadEvent }"
            >
                <!-- setting opacity and scale low for transition with loadEvent -->
                <img v-if="album[localIndex]" ref="active-image" :key="localIndex" style="transform: scale(0.2); opacity: 0;" @load="loadEvent($event); imageLoaded($event);" @error="imageFailedLoading" :src="album[localIndex].src" />
            </Interactive>
        </div>
        <div :class="['caption text-black-stroke', {invisible: !ui}]" ref="debug-gallery">
            <p v-if="album[localIndex]">{{ album[localIndex].description }}</p>
            <span v-if="album[localIndex] && album[localIndex].author" v-html="'Author: '+album[localIndex].author"></span>
        </div>
    </div>
</template>

<script>
import Interactive from '@/layout/interactive.vue'
export default {
    name: 'PhotoGallery',
    emits: ['close'],
    components: {
        Interactive
    },
    props: {
        index: {
            type: Number,
            default: 0
        },
        album: {
            type: Array,
            default() {return []}
        },
        download: {
            type: Boolean,
            default: true
        },
        copy: {
            type: Boolean,
            default: true
        },
        onCloseHandler: {
            type: Function,
            default() {return undefined}
        }
    },
    data() {
        return {
            ui: true,
            localIndex: 0,
            loadingImage: true,
            imageFailed: false
        }
    },
    computed: {
        isFirst() {
            return this.localIndex === 0;
        },
        isLast() {
            return !this.album.length || this.localIndex === this.album.length-1;
        },
        canDownload() {
            return this.download && !this.loadingImage && !this.imageFailed;
        },
        canCopy() {
            return false //this.copy && !this.loadingImage && !this.imageFailed;
        }
    },
    created() {
        this.localIndex = this.index
    },
    watch: {
        localIndex: function () {
            this.loadingImage = true;
            this.imageFailed = false;
        }
    },
    methods: {
        hideUI() {
            this.ui = false
        },
        showUI() {
            this.ui = true
        },
        nextImage() {
            if (!this.isLast)
                this.localIndex++
        },
        prevImage() {
            if (!this.isFirst)
                this.localIndex--
        },
        imageLoaded(e) {
            this.loadingImage = false
            e.target.onload = null
            e.target.onerror = null
        },
        imageFailedLoading(e) {
            this.imageFailed = true
            this.loadingImage = false
            e.target.onload = null
            e.target.onerror = null
        },
        downloadImage() {
            const img = this.album[this.localIndex]
            var isUrl = img.src.match(/(?:.+\/)([^#?]+)/)
            if (isUrl)
                fetch(img.src)
                    .then(resp => resp.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.style.display = 'none'
                        a.href = url
                        a.download = img.name || isUrl[1] || 'Untitled'
                        document.body.appendChild(a)
                        a.click()
                        window.URL.revokeObjectURL(url)
                        document.body.removeChild(a)
                    })
                    .catch(() => this.$snackbar.error({title: 'Something went wrong'}) );
            else  {
                var link = document.createElement('a')
                link.download = img.name +'.png'
                link.href = img.src
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }
        },

        closeGallery(e) {
            if (e.currentTarget) {// Trigger a mouseleave event to make sure the tooltip is removed from the "close" button
                const event = new Event('mouseleave')
                e.currentTarget.dispatchEvent(event)
            }
            this.$emit('close')
            if (this.onCloseHandler)
                this.onCloseHandler(); // used by the plugin to destroy the component
        }
    }
}
</script>

<style scoped>
    .container {
        position: fixed;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        background-color: rgb(0,0,0);
        background-color: rgba(0,0,0,.9);
        z-index: 50;
    }
    .center {
        text-align: center;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 40px;
    }
    .nav-bar {
        z-index: 1;
        opacity: 1;
        transition: all .4s ease;
        position: absolute;
        width: 100%;
        height: 50px;
        font-size: 18px;
        color: lightgray;
        background-color: rgba(0,0,0,.5);
        padding: 0 15px;
    }
    .slide-counter {
        line-height: 50px;
        margin-left: 10px;
    }
    .nav-icon {
        float: right;
        padding: 0 10px;
        font-size: 20px;
        font-weight: normal;
        line-height: 50px;
        cursor: pointer;
    }
    .main-container {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
    }
    .caption {
        opacity: 1;
        transition: all .4s ease;
        min-height: 60px;
        position: absolute;
        width: 100%;
        bottom: 0;
        left: 0;
        background-color: rgba(0,0,0,.5);
        color: white;
        text-align: center;
    }
    .caption-box {
        display: inline-block;
        width: 100%;
        max-width: 500px;
        text-align: start;
    }
    .hide-bars {
        opacity: 0;
        pointer-events: none;
    }
    .next-prev-img {
        position: fixed;
        top: 50%;
        transform: translateY(-50%);
        padding: 6px 18px;
        font-size: 30px;
        color: white;
        border-radius: 10px;
        background-color: rgba(0,0,0,.4);
        cursor: pointer;
        opacity: .5;
        transition: all .4s ease;
    }
    .invisible {
        opacity: 0;
        pointer-events: none;
    }
    @media (hover: hover) { /* when supported */
        .nav-icon:hover {
            color: white;
        }
        .next-prev-img:hover {
            opacity: 1;
        }
    }
</style>