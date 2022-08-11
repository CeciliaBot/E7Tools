<template>
    <div ref="interactive-element" tabindex="-1" class="main-container" @mouseenter="focus" @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd" @mousemove="mouseMove" @mouseup="mouseUp" @mouseleave="mouseLeave" @mousedown="mouseDown" @wheel="mouseWheelZoom" @keydown.capture="keyDown">
        <div style="position: absolute; width: 100%; z-index: 1; text-align: center">
            <slot name="buttons"></slot>
        </div>
        <!-- <div key="hud-zoom-level" class="glass-container text-black-stroke" :style="['z-index: 1; position: absolute; display: inline-block; border-radius: 8px; padding: 8px 15px; pointer-events: none;', { left: (parentPadding[3]+5)+'px', top: (parentPadding[0]+5)+'px' }]" data-html2canvas-ignore>{{ Math.floor(zoom*100) }}%</div> -->
        <div :class="['noselect', {zoomed: zoomed, smooth: this.smoothTransitions}]" :style=" {display: 'inline-block', width: this.size[0]+'px', height: this.size[1]+'px', transform: 'translate(' + this.coordinates[0] + 'px,' + this.coordinates[1] + 'px) scale(' + this.zoom + ')', 'transform-origin': '0 0 0'}">
            <slot :loadEvent="loadEvent"></slot>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'

var mousePosition = {},
    pinchCenter;

export default {
    name: 'interactive-zoom-move',
    emits: ['draggingStart', 'draggingEnd'],
    props: ['width', 'height', 'padding', 'maxzoom','minzoom', 'smooth'],
    provide() {
        return {
            zoom: computed( () => this.zoom)
        }
    },
    data: function () {
        return {
            size: [0,0],                        // image size
            zoom: 1,
            defaultZoom: 1,
            MAX_ZOOM: 10,
            MIN_ZOOM: 0.2,
            dragging: false,
            coordinates: [0,0], // image positioning left, top
            parentcontainer: null,
            parentPadding: [0,0,0,0], // Padding: top, left, bottom, right in pixels

            /* Mobile */
            pinch: false,

            /* Other stuff */
            isLoading: false
        }
    },
    computed: {
        zoomed: function () {
            return this.zoom>this.defaultZoom
        },
        smoothTransitions: function () {
            return this.smooth && !this.dragging && !this.isLoading
        }
    },
    created: function () {
        this.maxzoom ? this.MAX_ZOOM = Number(this.maxzoom) : 10;
        this.minzoom ? this.MIN_ZOOM = Number(this.minzoom) : 0.02;
        window.addEventListener('resize', this.onScreenResize);
    },
    mounted: function () {
        this.parentcontainer = this.$el;
        this.$el.focus();
        this.size = [this.width, this.height];
    },
    beforeUnmount: function () {
        this.parentcontainer = null;
        mousePosition = {};
        pinchCenter = null;
        window.removeEventListener('resize', this.onScreenResize)
    },
    watch: {
        padding: {
            immediate: true,
            handler(value) {
                if (!value) return;
                value.split(' ').forEach((number,index) => {
                    this.parentPadding[index] = Number(number);
                })
            }
        },
        size() {
            const newZoomLevel = this.setStartingZoom(this.size);
            var isSameZoom = this.zoom===newZoomLevel
            this.zoom = newZoomLevel;
            this.defaultZoom = newZoomLevel;
            if (isSameZoom) // if the zoom level is the same as the old value the 'zoom' watcher wont trigger so we need to manually do it
                this.coordinates = this.centerImage(this.size, this.zoom, this.coordinates);
        },
        zoom: function () {
            this.coordinates = this.centerImage(this.size, this.zoom, this.coordinates);
        },
        dragging(val) {
            var ev = 'draggingStart'
            if (!val) ev = 'draggingEnd'
            this.$emit(ev)
        },
        pinch(val) {
            var ev = 'draggingStart'
            if (!val) ev = 'draggingEnd'
            this.$emit(ev)
        }
    },
    methods: {
        loadEvent(e) { // pass to the child slot to handle image loading complete = get height and width
            // set isLoading to true to remove the smooth class and play the animation correctly
            this.isLoading = true;
            setTimeout( () => {
                this.isLoading = false
            }, 400);

            var t = e.target || e.originalTarget || e.path[0];
            var h = t.height, w = t.width;
            this.coordinates = [0,0]
            this.size = [w,h]
            t.style.opacity=1;
            t.style.transition = 'all .4s ease'
            t.style.transform='scale(1)'
        },
        focus() {
            this.$el.focus()
        },
        blur() {
            this.$el.blur()
        },
        setStartingZoom: function (size) {
            var box = this.parentcontainer.getBoundingClientRect(),
                sw = box.width-this.parentPadding[1]-this.parentPadding[3],
                w = size[0],
                sh = box.height-this.parentPadding[0]-this.parentPadding[2],
                h = size[1];

            var wr = sw/w,
                hr = sh/h;

            return Math.min(wr,hr,1);
        },
        centerImage: function (size, zoom, coord) {
            var box = this.parentcontainer.getBoundingClientRect(),
                sw = box.width,
                w = size[0]*zoom,
                sh = box.height,
                h = size[1]*zoom,
                p = this.parentPadding,
                x=coord[0],
                y=coord[1];

            if (w<=sw-p[1]-p[3])
                x = (sw-w)/2;
            else if (coord[0]>=p[3])
                x = p[3];
            else if (w+coord[0]<sw-p[1])
                x = -w+sw-p[1];
            if (h<sh-p[0]-p[2])
                y = (sh-h)/2;
            else if (coord[1]>p[0])
                y = p[0];
            else if (h+coord[1]<sh-p[2])
                y = -h+sh-p[2];

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
            if (e.target.tagName !== 'IMG' || e.button === 2) return;
            var xs = (e.clientX - this.coordinates[0]) / this.zoom,
                ys = (e.clientY - this.coordinates[1]) / this.zoom;
            if (this.zoomed)
                this.restoreZoom()
            else
                if (this.defaultZoom - 1 > 0.2)
                    this.originalResolution();
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
            if (e.button===2) return;
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
            } else if (!e.detail === undefined || e.detail===2) // double click to zoom or single click if detail doesn't exsist in event object
                this.clickImage(e);
            mousePosition = {};
        },
        mouseLeave: function () { // drop item
            if (this.dragging) {
                mousePosition = {};
                this.dragging = false;
                this.coordinates = this.centerImage(this.size, this.zoom, this.coordinates);
            }
            //this.blur();
        },
        mouseWheelZoom: function (e) {
            e.preventDefault();
            if (this.dragging && this.isLoading) return;
            var xs = (e.clientX - this.coordinates[0]) / this.zoom,
                ys = (e.clientY - this.coordinates[1]) / this.zoom,
                delta =  e.wheelDelta || -e.deltaY;
            this.zoom = delta > 0 ?
                    this.zoom * 1.1 > this.MAX_ZOOM ? this.MAX_ZOOM : this.zoom * 1.1
                :
                    this.zoom / 1.1 < this.MIN_ZOOM ? this.MIN_ZOOM : this.zoom / 1.1;
            this.coordinates = [
                e.clientX - xs * this.zoom,
                e.clientY - ys * this.zoom
            ]
        },

        getPinchZoomSize(touch1, touch2) {
            var x = touch1.clientX - touch2.clientX,
                y = touch1.clientY - touch2.clientY;
            return Math.sqrt( x * x + y * y )
        },
        touchStart: function (e) {
            var touch = e.touches || e.changedTouches;
            this.pinch = false;
            this.dragging = false;
            if (touch.length===2) {
                this.pinch = true;
                this.dragging = false;
                pinchCenter = this.getPinchZoomSize(e.touches[0], e.touches[1])
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
                var diff0 = this.getPinchZoomSize(e.touches[0], e.touches[1])
                var zoomSpeed = 1,
                    xs = (mousePosition.x - this.coordinates[0]) / this.zoom,
                    ys = (mousePosition.y - this.coordinates[1]) / this.zoom;
                var tZoom = this.zoom * (1 + (diff0 / pinchCenter - 1) * zoomSpeed) //this.zoom + (0.005*delta*this.zoom)
                this.zoom =
                        tZoom > this.MAX_ZOOM ?
                            this.MAX_ZOOM
                        : tZoom < this.MIN_ZOOM ?
                            this.MIN_ZOOM
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
                this.pinchCenter = null;
            }
            if (this.dragging) {
                this.dragging = false;
                this.coordinates = this.centerImage(this.size, this.zoom, this.coordinates);
            }
            mousePosition = {};
        },

        keyDown(e) {
            console.log(e)
            if (this.dragging) return;
            var x = 0,
                y = 0,
                z = 0;
            
            // Use W / A / S / D and arrow key to move around
            // Use + / E and - / Q to zoom in and out
            switch(e.keyCode) {
                case 38: // ^
                case 87: // w
                    y++;
                    break;
                case 40: // v
                case 83: // s
                    y--;
                    break;
                case 37: // ->
                case 65: // d
                    x++
                    break;
                case 39: // <-
                case 68: // a
                    x--
                    break;
                case 187: // +
                case 107:
                case 69: // Q
                    z++
                    break;
                case 189: // -
                case 109:
                case 81: // E
                    z--;
                    break;
            }
            if ( x || y ) {
                e.preventDefault();
                e.stopPropagation();

                var availableSpace = this.parentcontainer.getBoundingClientRect(),
                    offset = Math.min(availableSpace.width, availableSpace.height),
                    moveSpeed = 0.05;

                this.coordinates = this.centerImage(
                    this.size,
                    this.zoom,
                    [
                        this.coordinates[0] + offset*moveSpeed*x,
                        this.coordinates[1] + offset*moveSpeed*y
                    ]
                );
            }
            if ( z ) {
                var newZoom = this.zoom + z * 0.05,
                    win = this.parentcontainer.getBoundingClientRect(),
                    xs = (win.width/2 - this.coordinates[0]) / this.zoom,
                    ys = (win.height/2 - this.coordinates[1]) / this.zoom;

                if (newZoom > this.MAX_ZOOM) newZoom = this.MAX_ZOOM;
                else if (newZoom < this.MIN_ZOOM) newZoom = this.MIN_ZOOM;

                this.zoom = newZoom
                // Because we don't know the mouse position we are zooming at whats in the center of the screen
                this.coordinates = [
                    win.width/2 - xs * this.zoom,
                    win.height/2 - ys * this.zoom
                ]
            }
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
    .smooth {
        transition: transform .3s cubic-bezier(0.66, 0.69, 0.54, 0.91);
    }
    .main-container {
        outline: none;
        position: relative;
        width: 100%;
        height: 100%;
        max-height: 100vh;
        top: 0;
        left: 0;
    }
</style>