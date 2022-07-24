<script>
import { h, withDirectives } from 'vue'
import tooltip from '@/directives/tooltip.js'
import lazyImage from '@/directives/lazyloader.js'

export default {
    name: 'shop-overlay',
    props: ['events','vertical','timelinelength', 'timelinedates', 'daysize', 'direction'],
    data: function () {
        return {
            initialRender: false,
            timelineItems: [],
            isOpen: false
        }
    },
    created: function () {
    },
    computed: {
        rdte: function () {
            return [0,1].filter (n => n!==this.direction)[0]
        }
    },
    methods: {
        open: function () {
            this.isOpen = true;
        },
        close: function () {
            this.isOpen = false;
        },
        checkRender: function () {
        },
        dateDiff: function (ad,bd) {
            if (!ad||!bd) return 1;
            let a = ad, b= bd;
            if (a > b) {
                var swap = a;
                a = b;
                b = swap;
            }
            return (new Date(b).getTime()-new Date(a).getTime())/(1000 * 3600 * 24);
        },
        getEvents: function () {
        },
    },
    render: function () {
        return h('section', {}, [
            h('div', {class: 'tshop-overlay-label noselect', onClick: () => this.isOpen ? this.close() : this.open() }, [
                h('div', {style: 'font-size: 20px;line-height: 40px;'+(!this.vertical ? 'width:'+this.$store.state.screenWidth+'px' : 'height:'+this.$store.state.screenHeight+'px;') }, 
                    !this.isOpen ? [
                        h('i', {class: ['fas', !this.vertical ? 'fa-angle-double-up' : 'fa-angle-double-left'] }),
                        h('span', 'View shop rotations'),
                        h('i', {class: ['fas', !this.vertical ? 'fa-angle-double-up' : 'fa-angle-double-left'] })
                    ] : [
                        h('i', {class: ['fas', !this.vertical ? 'fa-angle-double-down' : 'fa-angle-double-right'] }),
                        h('span', 'Hide shop rotations'),
                        h('i', {class: ['fas', !this.vertical ? 'fa-angle-double-down' : 'fa-angle-double-right'] })
                    ]
                )
            ]),
            h('div', {class: ['glass-container shop-timeline', {open: this.isOpen}], style: {[!this.vertical ? 'width' : 'height']: '100%'}}, [
                this.events.map( (shop, shopIndex) => {
                    return h('div', {class: 'shop-row' }, [
                        shop.map( powder => {
                            return powder.dt[1] ? h('div', {
                                    class: 'shop-rotation',
                                    style: {
                                        [!this.vertical ? 'width' : 'height']: this.dateDiff(powder.dt[this.direction],powder.dt[this.rdte], this.direction)*this.daysize+'px',
                                        [!this.vertical ? 'left' : 'top']: (this.dateDiff(powder.dt[this.direction],this.timelinedates[this.direction !== 1 ? this.timelinedates.length-1 : 0])*this.daysize)+'px'} 
                                },
                                (powder.a || powder.c).map(item => {
                                    return withDirectives(
                                        h('img', {
                                            src: shopIndex === 0 ? 'https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/item_arti/icon_art0000.png' : 'https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/face/c0000_s.png',
                                            'data-src': shopIndex === 0 ? this.$store.getters.getArtifactIcon(item.id) : this.$store.getters.getHeroIcon(item.id),
                                            crossorigin: 'anonymous',
                                            SameSite: 'Lax'
                                        }),
                                        [
                                            [lazyImage],
                                            [tooltip, () => shopIndex === 0 ? this.$store.getters.getArtifactName(item.id) : this.$store.getters.getHeroName(item.id) ]
                                        ]
                                    )
                                })
                            ) : null;
                        })
                    ])
                })
            ]) //
        ])
    }
}
</script>
<style scoped>
.tshop-overlay-label {
    position: absolute;
    text-align: center;
    z-index: 5;
    cursor: pointer;
    transition: box-shadow .3s ease;
}
.tshop-overlay-label i {
    padding: 5px;
}
.timeline .tshop-overlay-label {
    width: 100%;
    height: 40px;
    bottom: 0;
}
.timeline .tshop-overlay-label:hover {
    box-shadow: inset 0 -30px 32px -25px #596df5;
}
.timeline .tshop-overlay-label > div {
    position: sticky;
    left: 0;
}
.vtimeline .tshop-overlay-label {
    height: 100%;
    width: 40px;
    right: 0;
    writing-mode: vertical-lr;
}
.vtimeline .tshop-overlay-label:hover {
    box-shadow: inset -30px 0 32px -25px #596df5
}
.vtimeline .tshop-overlay-label > div {
    position: sticky;
    top: 0;
}
.vtimeline .tshop-overlay-label span {
    transform: rotate(180deg);
    display: inline-block;
}

.timeline .shop-timeline {
    z-index: 1;
    height: 40px;
    overflow: hidden;
    padding-top: 40px;
    position: absolute;
    bottom: 0;
    transition: height .4s ease;
}
.timeline .shop-timeline.open {
    height: 60%;
    z-index: 2;
}
.timeline .shop-timeline > .shop-row {
    position: relative;
    width: 100%;
    height: 28%;
    max-height: 75px;
    margin: 5px 0;
}
.timeline .shop-row > .shop-rotation {
    position: absolute;
    padding: 5px;
    height: 100%;
}
.shop-row > .shop-rotation {
    border-radius: 10px;
    border: solid thin white;
    background-color: rgba(0, 0, 0, 0.5);
}
.timeline .shop-row > .shop-rotation img {
    height: 100%;
}

.vtimeline .shop-timeline {
    z-index: 1;
    width: 40px;
    overflow: hidden;
    padding-left: 40px;
    position: absolute;
    right: 0;
    transition: width .4s ease;
}


.vtimeline .shop-timeline {
    z-index: 1;
    width: 40px;
    overflow: hidden;
    padding-left: 40px;
    position: absolute;
    right: 0;
    transition: width .4s ease;
}
.vtimeline .shop-timeline > .shop-row {
    display: inline-block;
    position: relative;
    height: 100%;
    width: 28%;
    max-width: 75px;
    margin: 0 5px;
}
.shop-timeline .shop-row>.shop-icon {
    height: 75px;
    display: none;
    width: 75px;
    position: fixed;
    background-color: black;
    z-index: 1;
}
.shop-timeline:hover .shop-row>.shop-icon {
    display: block;
}
.vtimeline .shop-row > .shop-rotation {
    position: absolute;
    width: 100%;
    padding: 5px;
}
.vtimeline .shop-row > .shop-rotation img {
    width: 100%;
}
.vtimeline .shop-timeline.open {
    width: 60%;
    z-index: 2;
}


.shop-timeline .date-icon {
    opacity: 0;
    animation-delay: .4s;
    -o-animation-delay: .4s;
}
.shop-timeline:hover .date-icon{
    opacity: 1;
}
.shop-timeline .date-icon:after {
    content: attr(data-date);
    position: absolute;
    top: 40%;
    transform: translateY(-50%) translateX(-16px) rotate(-45deg);
    width: 20px;
    height: 20px;
    z-index: 2;
    border: solid thick #fff;
    background: #4CAF50;
    color: white;
    text-indent: 20px;
    line-height: 10px;
    white-space: nowrap;
    pointer-events: none;
}
</style>