<template>
    <div ref="graph-wrapper" class="main-container" @touchstart="touchStart" @touchmove="touchMove" @touchEnd="touchEnd" @mousemove="mouseMove" @mouseup="mouseUp" @mouseleave="mouseLeave" @mousedown="mouseDown" @wheel="mouseWheelZoom">
        <div style="position: absolute; width: 100%; z-index: 1; text-align: center">
            <slot name="buttons"></slot>
        </div>
        <!-- <div key="hud-zoom-level" ref="hud-zoom-level" class="glass-container" style="z-index: 1; position: absolute; left: 0; top: 0; display: inline-block; border-radius: 8px; padding: 8px 15px; pointer-events: none;"></div> -->
        <div ref="currentGalleryImage" :class="['noselect', {zoomed: zoomed}]" :style=" {width: this.width+'px', height: this.height+'px', transform: 'translate(' + this.coordinates[0] + 'px,' + this.coordinates[1] + 'px) scale(' + this.zoom + ')', 'transform-origin': '0 0 0'}" @touchstart="touchStart">
            <slot></slot>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'

var mousePosition = {},
    pinchCenter,
    MAX_ZOOM = 10,
    MIN_ZOOM = 0.02;

export default {
    name: 'interactive-zoom-move',
    props: ['width', 'height', 'maxzoom','minzoom'],
    provide() {
        return {
            zoom: computed(()=> this.zoom)
        }
    },
    data: function () {
        return {
            size: [0,0],                        // image size
            zoom: 0,
            defaultZoom: 0,
            dragging: false,
            coordinates: [0,0], // image positioning left, top
            parentcontainer: null,

            /* Mobile */
            pinch: false
        }
    },
    computed: {
        zoomed: function () {
            return this.zoom>this.defaultZoom;
        },
        xy: function () {
            return this.data;
        }
    },
    created: function () {
        this.maxzoom ? MAX_ZOOM = Number(this.maxzoom) : 10;
        this.minzoom ? MIN_ZOOM = Number(this.minzoom) : 0.02;
        window.addEventListener('resize', this.onScreenResize);
    },
    mounted: function () {
        this.parentcontainer = this.$el;//this.$refs['graph-wrapper']; //this.$el.parentNode;
        this.size = [this.width, this.height];
    },
    beforeUnmount: function () {
        window.removeEventListener('resize', this.onScreenResize)
    },
    watch: {
        size: function () {
            this.zoom = this.setStartingZoom(this.size);
            this.defaultZoom = this.zoom;
        },
        zoom: function () {
            this.coordinates = this.centerImage(this.size, this.zoom, this.coordinates);
        },
        dragging: function (val) {
            if (!val)
                this.$refs.currentGalleryImage.classList.remove("dragging");
            else
                this.$refs.currentGalleryImage.classList.add("dragging");
        }
    },
    methods: {
        setStartingZoom: function (size) {
            var sw = this.parentcontainer.getBoundingClientRect().width,
                w = size[0],
                sh = this.parentcontainer.getBoundingClientRect().height,
                h = size[1];

            var wr = sw/w,
                hr = sh/h;

            return Math.min(wr,hr,1);
        },
        centerImage: function (size, zoom, coord) {
            var sw = this.parentcontainer.getBoundingClientRect().width, w = size[0]*zoom, sh = this.parentcontainer.getBoundingClientRect().height, h = size[1]*zoom;
            let x=coord[0],y=coord[1];

            if (w<=sw)
                x = (sw-w)/2;
            else if (coord[0]>=45)
                x = 45;
            else if (w+coord[0]<sw-45)
                x = -w+sw-45;
            if (h<=sh)
                y = (sh-h)/2;
            else if (coord[1]>55)
                y = 55;
            else if (h+coord[1]<sh-55)
                y = -h+sh-55;

            return [x,y];
        },
        restoreZoom: function () {
            this.zoom = this.defaultZoom;
        },
        doubleZoom: function () {
            this.zoom *= 2;
        },
        originalResolution: function () {
            this.zoom = 1;
        },

        clickImage: function (e) { // mouseup
            if (e.target.tagName !== 'IMG') return;
            const xs = (e.clientX - this.coordinates[0]) / this.zoom,
                  ys = (e.clientY - this.coordinates[1]) / this.zoom;
            if (this.zoomed)
                this.restoreZoom();
            else
                this.doubleZoom();
            this.coordinates = [
                e.clientX - xs * this.zoom,
                e.clientY - ys * this.zoom
            ]
        },
        isDragging: function (e) {
            if (mousePosition.x && Math.abs(mousePosition.x-e.clientX) > 2 && Math.abs(mousePosition.y-e.clientY) > 2)
                return true;
            return false
        },
        mouseDown: function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.dragging = false;
            mousePosition = {
                x: e.clientX - this.coordinates[0],
                y: e.clientY - this.coordinates[1]
            };
        },
        mouseMove: function (e)  {
            if (!this.dragging && !this.isDragging(e)) return;
            this.dragging = true;
            e.preventDefault();
            this.coordinates = [
                e.clientX - mousePosition.x,
                e.clientY - mousePosition.y
            ];
        },
        mouseUp: function (e) {
            if (this.dragging) {
                this.dragging = false;
                this.coordinates = this.centerImage(this.size, this.zoom, this.coordinates);
            } else
                this.clickImage(e);
            mousePosition = {};
        },
        mouseLeave: function () { // drop item
            if (this.dragging) {
                mousePosition = {};
                this.dragging = false;
                this.coordinates = this.centerImage(this.size, this.zoom, this.coordinates);
            }
        },
        mouseWheelZoom: function (e) {
            e.preventDefault();
            if (this.dragging) return;
            var xs = (e.clientX - this.coordinates[0]) / this.zoom,
                ys = (e.clientY - this.coordinates[1]) / this.zoom,
                delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
            this.zoom = delta > 0 ?
                    this.zoom * 1.1 > MAX_ZOOM ? MAX_ZOOM : this.zoom * 1.1
                :
                    this.zoom / 1.1 < MIN_ZOOM ? MIN_ZOOM : this.zoom / 1.1;
            //(delta > 0) ? (this.zoom *= 1.1) : (this.zoom /= 1.1);
            this.coordinates = [
                e.clientX - xs * this.zoom,
                e.clientY - ys * this.zoom
            ]
        },


        touchDistance(e) {
            return Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY)
        },
        touchStart: function (e) {
            var touch = e.touches || e.changedTouches;
            this.pinch = false;
            this.dragging = false;
            if (touch.length===2) {
                this.pinch = true;
                this.dragging = false;
                pinchCenter = this.touchDistance(e);
                mousePosition =  {
                    x: (touch[0].clientX + touch[1].clientX) / 2,
                    y: (touch[0].clientY + touch[1].clientY) / 2
                };
            } else {
                mousePosition.x = touch[0].clientX- this.coordinates[0];
                mousePosition.y = touch[0].clientY- this.coordinates[1];
            }
        },
        touchMove: function (e) {
            const touch = e.touches || e.changedTouches;
            if (this.pinch) {
                let scale;
                if (e.scale) // iOS
                    scale=e.scale
                else {
                    const delta = this.touchDistance(e);
                    scale = delta / pinchCenter
                }
                let divScale = Math.min( Math.max( scale, this.minzoom), this.maxzoom)
                console.log(divScale);

                /* Original */
                var diff0 = Math.hypot(
                    touch[0].clientX - touch[1].clientX,
                    touch[0].clientY - touch[1].clientY
                );
                var delta = diff0-pinchCenter;
                var xs = (mousePosition.x - this.coordinates[0]) / this.zoom,
                    ys = (mousePosition.y - this.coordinates[1]) / this.zoom;
                var tZoom = this.zoom + (0.005*delta)
                this.zoom =
                        tZoom > MAX_ZOOM ? 
                            MAX_ZOOM
                        : tZoom < MIN_ZOOM ?
                            MIN_ZOOM
                        : tZoom;
                this.coordinates = [
                    mousePosition.x - xs * this.zoom,
                    mousePosition.y - ys * this.zoom
                ]
                pinchCenter=diff0;
            } else {
                if (!this.dragging && !this.isDragging(touch[0])) return;
                this.dragging = true;
                e.preventDefault();
                this.coordinates = [
                    touch[0].clientX - mousePosition.x,
                    touch[0].clientY - mousePosition.y
                ];
            }
        },
        touchEnd: function (e) {
            if (this.pinch && e.changedTouches.length !==2) {
                this.pinch = false;
            }
            if (this.dragging) {
                this.dragging = false;
            }
            mousePosition = {};
            this.coordinates = this.centerImage(this.size, this.zoom, this.coordinates);
        },
        onScreenResize: function () {
            let newZoom = this.setStartingZoom(this.size);
            if (this.zoom === this.defaultZoom) {
                if (newZoom == this.zoom) this.coordinates = this.centerImage(this.size, this.zoom, this.coordinates);
                else this.zoom = newZoom;
            } else {
                this.coordinates = this.centerImage(this.size, this.zoom, this.coordinates);
            }
            this.defaultZoom = newZoom;
        }
    }
}
</script>

<style scoped>
.main-container {
    position: relative;
    width: 100%;
    height: 100%;
    max-height: 100vh;
    top: 0;
    left: 0;
}
.img-wrapper {
    position: relative;
    width: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transform: translate3d(0,50px,0);
    -webkit-transform-origin: left top;
    -ms-transform-origin: left top;
    transform-origin: left top;
    -webkit-transition: none;
    transition: none;
}
.img-wrapper img {
    position: absolute;
    width: auto;
    height: auto;
    top: 0;
    left: 0;
    transition: all ease .4s;
    cursor: zoom-in;
}
.img-wrapper img.zoomed {
    cursor: grab;
}
.img-wrapper img.dragging {
    transition: none;
    cursor: grabbing;
}
</style>