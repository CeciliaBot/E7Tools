<script>
import photogallery from '@/components/photogallery.vue'

/*
    Map size is optional but prevents layout shifts with lazy loading
*/
var maps = [
    {
        name: 'azmakalis',
        'background': 'rgba(255, 0, 0, 0.133)',
        en: [
            {
                src: 'https://ceciliabot.github.io/img/Raid-Normal_en.png',
                description: 'Normal Raid Map',
                author: '',
                size: [1398, 1080]
            },
            {
                src: 'https://ceciliabot.github.io/img/Raid-Hell_en.png',
                description: 'Hell Raid Map',
                author: '<a href="https://www.reddit.com/user/C0NNECT1NG/">u/C0NNECT1NG</a> (<a href="https://www.reddit.com/r/EpicSeven/comments/flg4b1/complete_hell_raid_map/">Reddit post</a>)',
                size: [1101, 1080]
            }
        ],
        'zh': [
            {
                src: 'https://raw.githubusercontent.com/CeciliaBot/CeciliaBot.github.io/master/img/Raid-Normal_zht.png',
                description: '',
                author: '',
                size: [1398, 1080]
            },
            {
                src: 'https://raw.githubusercontent.com/CeciliaBot/CeciliaBot.github.io/master/img/Raid-Hell_zht.png',
                description: '',
                author: '',
                size: [799, 593]
            }
        ]
    },
    {
        name: 'nixied_sanctum',
        'background': 'rgba(15, 255, 255, 0.133)',
        description_en: 'Nixied\'s maps by game8. They have a full guide here:<br><a href ="https://game8.co/games/Epic-Seven/archives/284193">https://game8.co/games/Epic-Seven/archives/284193</a>',
        en: [
            {
                src: 'https://img.game8.co/3235580/df915e10aa933192c93773c9ee67c6ed.png/original',
                description: 'Nixied 1',
                author: '<a href="https://game8.co/games/Epic-Seven/archives/284193">game8</a>',
                size: [956,711]
            },
            {
                src: 'https://img.game8.co/3238837/41e580783640902df84ad4154d45b02b.png/original',
                description: 'Nixied 2',
                author: '<a href="https://game8.co/games/Epic-Seven/archives/284193">game8</a>',
                size: [1000,1009]
            },
            {
                src: 'https://img.game8.co/3240084/c9d0e19e6d97cfc31f10c9c0f2381a73.png/original',
                description: 'Nixied 3',
                author: '<a href="https://game8.co/games/Epic-Seven/archives/284193">game8</a>',
                size: [1000,836]
            },
            {
                src: 'https://img.game8.co/3258768/0dbd22118596b848cbe378e9eec42e13.jpeg/original',
                description: 'Nixied 4',
                author: '<a href="https://game8.co/games/Epic-Seven/archives/284193">game8</a>',
                size: [2050, 2160]
            },
            {
                src: 'https://img.game8.co/3259720/8a3f4a32a2ae7ffce3cf23bf25d75511.jpeg/original',
                description: 'Nixied 5',
                author: '<a href="https://game8.co/games/Epic-Seven/archives/284193">game8</a>',
                size: [2318, 2160]
            }
        ]
    },
    {
        name: 'test gallery',
        description_en: 'Photogallery.vue test images',
        en: [
            {
                src: 'https://farm4.staticflickr.com/3894/15008518202_c265dfa55f_h.jpg'
            },
            {
                src: 'https://farm6.staticflickr.com/5591/15008867125_b61960af01_h.jpg'
            },
            {
                src: 'https://farm4.staticflickr.com/3902/14985871946_24f47d4b53_h.jpg'
            },
            {
                src: 'https://farm6.staticflickr.com/5584/14985868676_b51baa4071_h.jpg'
            },
            {
                src: 'https://farm4.staticflickr.com/3920/15008465772_d50c8f0531_h.jpg'
            },
            {
                src: 'https://www.pngitem.com/pimgs/m/249-2498312_epic-seven-logo-png-transparent-png.png'
            }
        ]
    }
]


export default {
    name: 'maps-component',
    props: ['visible', 'mobile'],
    data: function () {
        return {
            currMap: undefined,
            mapIndex: 0
        }
    },
    computed: {
        lang: function () {
            return this.$i18n.locale || 'en';
        }
    },
    created: function () {
    },
    methods: {
        openMap: function (index, mapIndex) {
            this.currMap = maps[index][this.lang] || maps[index]['en'] || []
            this.mapIndex = mapIndex;
        },
        closePhotoGallery: function () {
            this.currMap = undefined;
            this.mapIndex = 0;
        }
    },
    render: function (h) {
        return h('div', {style: {}}, [
            maps.map( (map, index) => {
                return h('div', {staticClass: 'map-container', ref: 'map-block-'+index, style: {'background-color': map.background}}, [
                    h('div', {staticClass: 'dungeon-title'}, this.$t('strings.'+map.name)),
                    h('div', {domProps: {innerHTML: (map['description_'+this.lang]||map['description_en'])}, style: {'text-align': 'center'}}),
                    (map[this.lang] || map['en'] || []).map( (img, i) => {
                        return h('div', {staticClass: 'image-container noselect', style: {'min-width': img.size ? (200/img.size[1]*img.size[0] ) + 'px' : '200px', 'min-height': '200px'}}, [
                            h('img', {style: 'opacity: 0', attrs: {'data-src': img.src, SameSite: 'Lax'}, on: {click: () => this.openMap(index, i)}, directives: [{name: 'lazyloader'}] }),
                            h('span', {staticClass: 'map-name'}, img.description)
                        ])
                    })
                ])
            }),
            this.currMap != undefined ?
                h(photogallery, {props: {current: this.mapIndex, album: this.currMap }, on: {close: this.closePhotoGallery}})
            : null
        ])
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
