<template>
    <div class="full-size">
        <div v-if="!mapMaker">
            <div v-for="(group,index) in maps" :key="index" class="map-container" :style="{'backgroundColor': group.background}" >
                <div class="dungeon-title">{{ $t('strings.'+group.name) }}</div>
                <div style="text-align: center" v-html="group['description_'+lang]||group['description_en']"></div>
                <div v-for="(img,mapIndex) in (group[lang] || group['en'] || [])" :key="mapIndex" class="image-container noselect" :style="{minWidth: img.size ? (200/img.size[1]*img.size[0] ) + 'px' : '200px', minHeight: '200px'}">
                    <img :data-src="img.src" SameSite="Lax" style="opacity: 0" @click="openImage(index, mapIndex)" v-lazyloader />
                    <span class="map-name">{{ img.description }}</span>

                </div>
            </div>
            <div class="text-center">
                <div class="noselect" style="overflow: hidden; position: relative; height: 100px; width: 300px; z-index: 0; display: inline-block; text-align: start;">
                    <div style="position: absolute; bottom: 0; width: 100%; z-index: -1;">
                        <button class="material-button flat primary" style="width: 99%; vertical-align: bottom; border: solid 2px; padding-left: 80px;" v-ripple-effect>Map Maker Coming Soon<i class="fa fa-arrow-right" style="float: right; line-height: 2.4em;" /></button>
                    </div>
                    <div style="pointer-events: none;">
                        <img :src="require('@/assets/chibi-maid-chloe.png')" style="height: 98px;" />
                    </div>
                </div>
            </div>
        </div>
        <!-- <LabMaker v-else @close="mapMaker = false" /> -->
    </div>
</template>

<script>
// import LabMaker from './LabyrinthMapBuilder.vue'
import maps from '../util/maps.js'

export default {
    components: {
        // LabMaker
    },
    data() {
        return {
            maps: maps,
            mapMaker: false
        }
    },
    renderTriggered (e) {console.log('Maps', e)},
    computed: {
        lang: function () {
            return this.$i18n.locale || 'en';
        }
    },
    methods: {
        openImage(index, mapIndex) {
            this.$gallery(this.maps[index][this.lang] || this.maps[index]['en'] || [], mapIndex)
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