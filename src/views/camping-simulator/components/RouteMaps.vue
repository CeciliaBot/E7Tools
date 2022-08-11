<template>
    <div>
        <div v-for="(group,index) in maps" :key="index" class="map-container" :style="{'backgroundColor': group.background}" >
            <div class="dungeon-title">{{ $t('strings.'+group.name) }}</div>
            <div style="text-align: center" v-html="group['description_'+lang]||group['description_en']"></div>
            <div v-for="(img,mapIndex) in (group[lang] || group['en'] || [])" :key="mapIndex" class="image-container noselect" :style="{minWidth: img.size ? (200/img.size[1]*img.size[0] ) + 'px' : '200px', minHeight: '200px'}">
                <img :data-src="img.src" SameSite="Lax" style="opacity: 0" @click="openImage(index, mapIndex)" v-lazyloader />
                <span class="map-name">{{ img.description }}</span>

            </div>
        </div>
        <template v-if="openImageGallery">
            <PhotoGallery
                :index="galleryIndex"
                :album="openImageGallery"
                @close="closeImage"
            />
        </template>
    </div>
</template>

<script>
import PhotoGallery from '@/components/PhotoGallery.vue'
import maps from '../util/maps.js'

export default {
    components: {
        PhotoGallery
    },
    data() {
        return {
            openImageGallery: false,
            galleryIndex: 0,
            maps: maps
        }
    },
    computed: {
        lang: function () {
            return this.$i18n.locale || 'en';
        }
    },
    renderTriggered (e) {console.log('Maps', e)},
    methods: {
        openImage(index, mapIndex) {
            this.openImageGallery = this.maps[index][this.lang] || this.maps[index]['en'] || [];
            this.galleryIndex=mapIndex
        },
        closeImage() {
            this.openImageGallery = false;
        }
    }
}
</script>

<style scoped>
    .map-container {
        position: relative;
        margin: 0;
        width: 100%;
        padding: 20px 0 20px 100px;
        background-color: rgb(0, 0, 0);
        color: white;
    }
    .dungeon-title {
        position: absolute;
        height: calc(100% - 40px);
        left: 10px;
        text-align: center;
        text-orientation: mixed;
        text-transform: uppercase;
        max-width: 50px;
        writing-mode: vertical-rl;
        font-size: 30px;
    }
    .image-container {
        position: relative;
        height: 200px;
        margin: 20px 15px;
        display: inline-block;
    }
    .image-container img {
        height: 200px;
        filter: brightness(50%);
        border: 2px;
        border-color: black;
        transition: all .3s ease;
    }
    .image-container img:hover {
        cursor: pointer;
        filter: brightness(.2);
    }
    .map-name {
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        margin-top: 100px;
        margin-left: 50%;
        transform: translate(-50%,-50%);
        text-align: center;
        font-size: 25px;
        color: white;
        text-shadow: 1px 1px 0px black, 1px -1px 0px black, -1px 1px 0px black, -1px -1px 0px black;
    }
</style>