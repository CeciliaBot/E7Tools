<template>
        <Teleport :to="teleport[1]">
            <div @click="minimizedIconClick" class="minimized">
                <div class="min-icon"><slot name="icon"></slot></div>
                <div class="min-title"><slot name="title"></slot></div>
            </div>
        </Teleport>
        <Teleport :to="teleport[0]">
            <div v-show="!isMinimized" ref="floating-window" :class="['floating-window', {'glass-container-2': glassWindow, 'flat-window': !glassWindow, 'full-screen': isFullScreen}]" @focusin="onFocus" @blur="onBlur" tabindex="0">
                <div class="floating-content">
                    <div class="window-header">
                        <div class="window-title noselect" @mousedown.prevent="moveWindowMouseDown" @touchstart.prevent="moveWindowMouseDown">
                            <slot name="icon"></slot>
                            <slot name="title"></slot>
                        </div>
                        <div class="header-buttons">
                            <slot name="extra-button"></slot>
                            <button class="header-button" @click="toggleMinimize"><i class="fas fa-window-minimize"></i></button>
                            <button class="header-button" @click="toggleFullScreen"><i :class="['fa', isFullScreen ? 'fa-window-restore' : 'fa-window-maximize']"></i></button>
                            <button class="header-button close" @click="close"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <div class="window-body hide-scrollbar">
                        <slot></slot>
                    </div>
                </div>
                <div class="resizer n"  @mousedown="resizeMouseDown" @touchstart="resizeMouseDown"></div>
                <div class="resizer e"  @mousedown="resizeMouseDown" @touchstart="resizeMouseDown"></div>
                <div class="resizer s"  @mousedown="resizeMouseDown" @touchstart="resizeMouseDown"></div>
                <div class="resizer w"  @mousedown="resizeMouseDown" @touchstart="resizeMouseDown"></div>
                <div class="resizer nw" @mousedown="resizeMouseDown" @touchstart="resizeMouseDown"></div>
                <div class="resizer sw" @mousedown="resizeMouseDown" @touchstart="resizeMouseDown"></div>
                <div class="resizer se" @mousedown="resizeMouseDown" @touchstart="resizeMouseDown"></div>
                <div class="resizer ne" @mousedown="resizeMouseDown" @touchstart="resizeMouseDown"></div>
            </div>
        </Teleport>
</template>

<script>
function normalizedCoordinates(e) {
    var ev = e;
    if (!ev.clientX && e.touches && e.touches.length) ev = e.touches[0]
    return {
        clientX: ev.clientX,
        clientY: ev.clientY
    }
}
function minimizeAllOpenWindows() {
    windows.forEach(window => {
        window.minimize()
    })
}
function createWindowsContainer() {
    var found = document.getElementById('FloatingWindowsContainer');
    if (found) {
        var icons = document.getElementById('FloatingWindowsIconContainer');
        return [found, icons]
    }

    var container = document.createElement( 'div' )
    container.id = "FloatingWindowsContainer"
    container.style='position: fixed; bottom: 20px; left: 0; z-index: 20;'
        var startIcon = document.createElement( 'div' )
        startIcon.tabIndex = -1
        startIcon.className = 'windows-apps-icon'
        startIcon.style.display = 'none'
            var startIcon1 = document.createElement( 'div' )
            startIcon1.className = 'minimized'
            startIcon1.innerHTML = '<div class="min-icon"><i class="fa fa-th"></i></div>'
            startIcon.appendChild( startIcon1 )

            var iconBlock = document.createElement( 'div' )
            iconBlock.id = 'FloatingWindowsIconContainer'
            iconBlock.className = 'popup-window-icon-container material-popup'
                var minimizeAll = document.createElement( 'div' )
                minimizeAll.className = 'minimized'
                minimizeAll.onclick = minimizeAllOpenWindows
                minimizeAll.innerHTML = '<div class="min-icon"><i class="fa fa-eye-slash"></i></div><div class="min-title">Minimize all</div>'
                iconBlock.appendChild( minimizeAll )
            startIcon.appendChild( iconBlock )
        container.appendChild( startIcon )
    document.body.appendChild( container )
    return [container, iconBlock]
}

var container = createWindowsContainer()
var windows = []

export default {
    emits: ['close', 'minimize', 'restore', 'resize'],
    props: {
        wid: {
            required: true
        },
        minheight: {
            type: Number,
            required: false,
            default: 30
        },
        minwidth: {
            type: Number,
            required: false,
            default: 130
        },
        glassWindow: {
            type: Boolean,
            default: true
        },
        openMaximized: {
            type: Boolean,
            default: false
        },
        size: {
            type: Object,
            required: false
        },
        position: {
            required: false
        }
    },
    data() {
        return {
            teleport: container,
            isFullScreen: false,
            isMinimized: false,
            onMouseMove: [],
            onMouseUp: [],
            beforeSnapSize: null
        }
    },
    created() {
        window.addEventListener('mouseup', this.mouseUp)
        window.addEventListener('touchend', this.mouseUp)
        window.addEventListener('touchleave', this.mouseUp)

        if (this.openMaximized) this.isFullScreen = true;
    },
    mounted() {
        let floatingWindow = this.$refs['floating-window']
        let width = this.size && this.size.width ? this.size.width : Math.min( window.innerWidth - 30, Math.max(window.innerWidth*0.5, 900) )
        let height = this.size && this.size.height ? this.size.height : Math.min( window.innerHeight, Math.max(window.innerHeight*0.5, 500) )
        let left = (window.innerWidth - width) / 2 + (10*windows.length) + 'px'
        let top = (window.innerHeight - height) / 2 + (10*windows.length) + 'px'

        floatingWindow.style.height = height + 'px'
        floatingWindow.style.width = width + 'px'

        var p = this.position;
        if (p && (typeof p === 'string' || p instanceof String)) {
            var newP = {}
            if (p.indexOf('top')!==-1) {
                newP.top = '1%'
            } else if (p.indexOf('bottom') !== -1) {
                newP.bottom = '1%'
            }
            if (p.indexOf('left') !==-1) {
                newP.left = '2%'
            } else if (p.indexOf('right') !==-1) {
                newP.right = '2%'
            }
            p = newP
        }
        if (p) {
            top = p.top || top
            left = p.left || left
        }
        
        this.applyTranslatePosition(
            this.$refs['floating-window'],
            [left, top]
        )

        windows.push(this)
        container[1].parentNode.style.display = ''
        container[1].parentNode.style.zIndex = windows.length+1
        floatingWindow.style.zIndex = windows.length
    },
    beforeUnmount() {
        window.removeEventListener('mouseup', this.mouseUp)
        window.removeEventListener('touchend', this.mouseUp)
        window.removeEventListener('touchleave', this.mouseUp)
        this.removeEvents()

        windows.splice(windows.indexOf(this), 1)
        if (!windows.length) container[1].parentNode.style.display = 'none';
    },
    watch: {
    },
    methods: {
        resizeMouseDown(e) {
            e.preventDefault()
            e.stopPropagation()
            this.removeEvents()
            this.$refs['floating-window'].focus(); // calling focus manually because we are preventing the event this will allow the window to jump on top of the others
            var elClass = e.target.classList[1]
            var rect = this.$refs['floating-window'].getBoundingClientRect()
            e = normalizedCoordinates(e);
            this.beforeSnapSize = null;

            if (elClass.indexOf('n')!==-1)
                this.onMouseMove.push( (e1) => this.resize(e1, rect, 1, e))
            else if (elClass.indexOf('s')!==-1)
                this.onMouseMove.push( (e) => this.resize(e, rect, 1, false))

            if (elClass.indexOf('w')!==-1)
                this.onMouseMove.push( (e1) => this.resize(e1, rect, 0, e))
            else if (elClass.indexOf('e')!==-1)
                this.onMouseMove.push( (e) => this.resize(e, rect, 0, false))

            this.onMouseMove.forEach(event => {
                window.addEventListener('mousemove', event)
                window.addEventListener('touchmove', event)
            })

            this.$refs['floating-window'].style.boxShadow = '#008eff 0px 0px 0px 2px'
            document.body.style.pointerEvents = 'none'
            this.onMouseUp.push( () => {
                document.body.style.pointerEvents = null
                this.$refs['floating-window'].style.boxShadow = null
            })
        },
        resize(e, rect, axes, ajust) {
            var size = ['width', 'height'][axes],
                cord = ['clientX', 'clientY'][axes],
                pos = ['left', 'top'][axes],
                new_size;
            e = normalizedCoordinates(e);
            if (!ajust) {
                new_size = e[cord] - rect[pos]+1; // +1 to make sure the mouse is still over at the end of the drag so the user can press and hold to resize again
                if (this['min'+size]>=new_size)
                    return;
                this.$refs['floating-window'].style[size] = new_size + 'px'
            } else {
                new_size = rect[size] - (e[cord] - ajust[cord])
                if (this['min'+size]>=new_size)
                    return;
                this.$refs['floating-window'].style[size] = new_size + 'px'

                this.applyTranslatePosition(
                    this.$refs['floating-window'],
                    Math.max(0, rect[pos] + (e[cord] - ajust[cord])) + 'px',
                    axes
                )

            }
        },

        moveWindowMouseDown(e) {
            this.$refs['floating-window'].focus();
            e = normalizedCoordinates(e)
            var rect = this.$refs['floating-window'].getBoundingClientRect()
            var offX = this.beforeSnapSize ? -this.beforeSnapSize.width/2 : rect.left-e.clientX
            var offY = rect.top-e.clientY
            if (this.isFullScreen) {
                offX = -parseInt(this.$refs['floating-window'].style.width) / 2
            }
            this.onMouseMove.push((e) => this.moveWindow(e, offX, offY))
            this.onMouseMove.forEach(event => {
                window.addEventListener('mousemove', event)
                window.addEventListener('touchmove', event)
            })
            this.onMouseUp.push( this.snapWindow )
            document.body.style.pointerEvents = 'none'
            this.onMouseUp.push( () => document.body.style.pointerEvents = null)
        },
        moveWindow(e, offX, offY) {
            e = normalizedCoordinates(e);
            this.isFullScreen = false
            if (this.beforeSnapSize) {
                var wStyle=this.$refs['floating-window'].style
                wStyle.height = this.beforeSnapSize.height + 'px'
                wStyle.width = this.beforeSnapSize.width + 'px'
                this.beforeSnapSize = null;
            }
            // this.$refs['floating-window'].style.top = Math.max(0, Math.min( window.innerHeight-30, e.clientY + offY)) + 'px'
            // this.$refs['floating-window'].style.left = Math.max(0, Math.min( window.innerWidth-30, e.clientX + offX)) + 'px'
            this.applyTranslatePosition(
                this.$refs['floating-window'],
                [
                    Math.max(0, Math.min( window.innerWidth-30, e.clientX + offX)) + 'px',
                    Math.max(0, Math.min( window.innerHeight-30, e.clientY + offY)) + 'px'
                ]
            )
            // wStyle.top = Math.max(0, Math.min( window.innerHeight-30, e.clientY + offY) / window.innerHeight *100) + '%'
            // wStyle.left = Math.max(0, Math.min( window.innerWidth-30, e.clientX + offX) / window.innerWidth *100) + '%'
        },
        snapWindow(e) {
            var el = this.$refs['floating-window']
            var x = e.clientX,
                y = e.clientY,
                shouldApply = false,
                width = '100%',
                height = '100%',
                top = 0,
                left = 0;

            if (x<15) {
                width = '50%'
                left = 0
                shouldApply = true
            } else if (x>window.innerWidth-60) {
                width = '50%'
                left = window.innerWidth/2 + 'px'
                shouldApply = true
            }
            if (y<15) {
                height = '50%'
                top = 0
                shouldApply = true
            } else if (y>window.innerHeight-60) {
                height = '50%'
                top = window.innerHeight/2 + 'px'
                shouldApply = true
            }
            if (shouldApply === true) {
                var rect = el.getBoundingClientRect()
                this.beforeSnapSize = {
                    height: rect.height,
                    width: rect.width
                }
                el.style.width = width
                el.style.height = height
                this.applyTranslatePosition(
                    el,
                    [
                        left,
                        top
                    ]
                )
            }
        },

        applyMouseUpEvents(e) {
            this.onMouseUp.forEach(event => {
                event(e)
            })
        },
        mouseUp(e) {
            this.applyMouseUpEvents(e)
            this.removeEvents()
        },
        removeEvents() {
            this.onMouseMove.forEach( event => {
                window.removeEventListener('mousemove', event)
                window.removeEventListener('touchmove', event)
            })
            this.onMouseMove = []
            this.onMouseUp = []
        },
        applyTranslatePosition(el, pos, axes) {
            if (Array.isArray(pos))
                el.style.transform = `translate(${pos[0]}, ${pos[1]})`
            else
                el.style.transform = el.style.transform.replace(/translate\(([^s]*)\)/, function (match, val) {
                    var old = val.split(',')
                    old[axes] = pos;
                    return `translate(${old.join(',')})`
                })
        },

        moveToTheTop() {
            //if (windows[windows.length-1]===this) return;
            var index = windows.indexOf(this);
            if (index!==-1) {
                windows.splice(index, 1)
                windows.push(this)
                for (var i = index; i<windows.length; i++) {
                    if (!windows[i]) {
                        continue
                    }
                    windows[i].$refs['floating-window'].style.zIndex=i
                }
            }
        },
        onFocus() {
            this.moveToTheTop()
        },
        onBlur() {
            // this.$refs['floating-window'].style.zIndex=zIndex
            // console.log('blur')
        },

        toggleFullScreen() {
            this.isFullScreen = !this.isFullScreen
        },
        toggleMinimize() {
            this.isMinimized ? this.resotreFromMinimized() : this.minimize();
        },
        minimize() {
            this.$emit('minimize', this.wid)
            this.isMinimized = true
        },
        resotreFromMinimized() {
            this.isMinimized = false
            this.moveToTheTop()
        },
        minimizedIconClick() { // if it's minimized => restore, otherwise just put at the top
            if (!this.isMinimized) {
                if (windows.slice(-1)[0]!==this) {
                     this.$refs['floating-window'].focus()
                } else {
                    this.minimize()
                }
            } else {
                this.$refs['floating-window'].focus()
                this.toggleMinimize()
            }
        },
        outsideSetFocus() { // don't change this name, call from outside to focus this window
            this.$refs['floating-window'].focus()
            this.isMinimized=false
        },
        close() {
            this.$emit('close', this.wid)
        }
    }
}
</script>

<style>
    .floating-window {
        position: fixed;
        min-height: 30px;
        min-width: 130px;
        border-radius: 5px;
        top: 0;
        left: 0;
        transform-origin: 0 0;
        padding: 1px;
        outline: none;
    }
    .floating-window.flat-window {
        background-color: var(--glass-fallback-1);
    }
    .floating-window.full-screen {
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        padding: 0 !important;
        transform: none !important;
        border-radius: 0;
    }
    .floating-window.full-screen .resizer {
        display: none;
    }
    .floating-content {
        display: flex;
        border-radius: inherit;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }
    .window-header {
        display: flex;
        height: 30px;
        width: 100%;
        color: #cec8c8;
        background-color: var(--background-modifier-darken-alpha);
    }
    .floating-window:not(.full-screen) .window-header {
        cursor: move;
    }
    .window-title {
        flex: 1;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        padding: 5px;
    }
    .window-title img,
    .window-title i,
    .window-title svg {
        width: 1em;
        vertical-align: text-top;
        margin-right: 0.5em;
    }
    .header-buttons {
        white-space: nowrap;
    }
    .header-buttons > * {
        position: relative;
        display: inline-block;
        height: 30px;
        width: 30px;
        background-color: transparent;
        border: none;
        cursor: pointer;
        color: inherit;
        vertical-align: top;
        text-align: center;
        line-height: 30px;
    }
    .header-buttons > *:hover {
        background-color: rgba(255, 255, 255, 0.146);
    }
    .header-button.close:hover {
        background-color: red;
    }
    .window-body {
        flex: 1;
        overflow: auto;
    }

    .resizer {
        position: absolute;
        height: 5px;
        width: 5px;
    }
    .resizer.n {
        width: 100%;
        top: 0;
        left: 0;
        cursor: n-resize;
    }
    .resizer.ne {
        top: 0;
        right: 0;
        cursor: ne-resize;
    }
    .resizer.e {
        height: 100%;
        top: 0;
        right: 0;
        cursor: e-resize;
    }
    .resizer.se {
        bottom: 0;
        right: 0;
        cursor: se-resize;
    }
    .resizer.s {
        width: 100%;
        bottom: 0;
        left: 0;
        cursor: s-resize;
    }
    .resizer.sw {
        bottom: 0;
        left: 0;
        cursor: sw-resize;
    }
    .resizer.w {
        height: 100%;
        top: 0;
        left: 0;
        cursor: w-resize;
    }
    .resizer.nw {
        top: 0;
        left: 0;
        cursor: nw-resize;
    }

    @media only screen and (max-width: 600px) { /* Mobile window styles */
        .window-header {
            height: 40px;
            background-color: white;
            color: black;
            font-size: 20px;
            line-height: 30px;
        }
        .header-buttons > * {
            font-size: inherit;
            line-height: 40px;
            height: 40px;
            width: 40px;
        }
        .resizer {
            height: 10px;
            width: 10px;
        }
    }

    .windows-apps-icon {
        position: fixed;
        left: calc(50% - 35px);
        bottom: 0;
    }
    .popup-window-icon-container {
        position: fixed;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        max-width: 91%;
        transition: transform .3s ease;
        transform: translate(-50%, -70px) scale(0);
        transform-origin: 50% 100%;
        left: 50%;
        margin: 0;
        overflow: auto;
        max-height: 85%;
    }
    .windows-apps-icon:focus .popup-window-icon-container,
    .windows-apps-icon:focus-within .popup-window-icon-container {
        transform: translate(-50%, -70px) scale(.9);
    }
    .popup-window-icon-container > * {
        flex: 1;
    }

    .minimized {
        min-height: 60px;
        width: 60px;
        text-align: center;
        margin: 5px;
    }
    .min-icon {
        position: relative;
        display: inline-block;
        cursor: pointer;
        width: 60px;
        height: 60px;
        text-align: center;
        line-height: 42px;
        font-size: 24px;
        padding: 10px;
        vertical-align: bottom;
        background-color: #8a8989b5;
        border-radius: 50%;
        color: white;
    }
    .minimized img, .minimized svg {
        height: 40px;
        width: 40px;
        border-radius: 8px;
    }
    .min-title {
        margin-top: 2px;
        font-size: 0.7em;
        color: black;
        text-align: center;
        line-height: 1em;
    }

</style>