<template>
    <div>
        <div class="menu-icon pointer">
            <button class="material-button flat primary round-0 mat-hover" style="font-size: inherit; margin: 0;" @click="openMenu" v-ripple-effect>
                <i class="fa fa-bars" />
            </button>
        </div>
        <div :class="['side-menu flex flex-col justify-center font-l pad-5 margin-5 round-s noselect', {open: isOpen}]">
            <div class="flex relative items-center justify-between margin-5 font-bold">
                <div class="pad-5 text-center menu-option-icon"><i class="fa fa-calendar-alt" /></div>
                <div class="flex-fill pad-5 text-ellipsis">Ultimate Timeline</div>
            </div>
            <div class="separator margin-5 round-s" />
            <div class="flex-fill overflow-auto hide-scrollbar">
                <div class="flex flex-col flex-fill">
                    <div v-for="option in options" :key="option" :class="['flex relative items-center justify-between margin-5 round-s pointer mat-hover overflow-hidden', {disabled: option.disabled}]" @click="clickRow($event, option)" v-ripple-effect>
                        <div class="pad-5 text-center menu-option-icon">
                            <i :class="option.class" />
                        </div>
                        <div class="flex-fill pad-5 text-ellipsis">
                            {{ option.name }}
                        </div>
                        <div class="pad-5">
                            <i v-if="!option.slider" class="fa fa-angle-right" />
                            <Slider v-else-if="option.slider" :value="option.value"/>
                        </div>
                    </div>
                </div>
            </div>
            <div class="separator margin-5 round-s" />
            <div class="flex relative items-center justify-between margin-5 round-s pointer mat-hover overflow-hidden" @click="$store.commit('toggleMainMenu'); closeMenu()" v-ripple-effect>
                <div class="pad-5 text-center"><img src="/favicons/android-chrome-192x192.png" style="height: 1.5em; vertical-align: middle;"/></div>
                <div class="flex-fill pad-5 menu-option-icon">CeciliaBot Tools</div>
                <div class="pad-5"><i class="fa fa-angle-right" /></div>
            </div>
        </div>
        <div :class="['menu-background container', {open: isOpen}]" @click="closeMenu" />
    </div>
</template>

<script>
import Slider from '@/layout/Slider.vue'
export default {
    inject: ['vertical', 'lowEndMode', 'UTCTime'],
    components: {
        Slider
    },
    props: {
        dynamicBackground: {
            type: Boolean
        }
    },
    data: function () {
        return {
            isOpen: false,
            options: [
                {
                    class: 'fa fa-paint-brush',
                    name: 'Customize Timeline',
                    click: () => {
                        this.$emit('customize')
                    }
                },
                {
                    class: 'fa fa-search',
                    name: 'Search',
                    click: () => {
                        this.$emit('search')
                    }
                },
                {
                    class: 'fa fa-sticky-note',
                    name: 'Ongoing events',
                    click: () => {
                        this.$emit('ongoing')
                    }
                },
                {
                    class: 'fas fa-map-marker-alt',
                    name: 'Scroll to today',
                    click: () => {
                        this.$emit('goToday')
                    }
                },
                {
                    class: 'fa fa-history',
                    name: 'Changelog',
                    click: () => {
                        this.$emit('changelog')
                    }
                },
                {
                    class: 'fa fa-globe',
                    name: 'Language',
                    click() {
                        window.show()
                    }
                },
                {
                    class: 'fa fa-clock',
                    name: 'Use local time',
                    slider: true,
                    value: !this.UTCTime,
                    click: () => {
                        this.$emit('toggleUTC')
                    }
                },
                {
                    class: 'fa fa-image',
                    name: 'Dynamic Background',
                    slider: true,
                    value: this.dynamicBackground,
                    click: () => {
                        this.$emit('toggleBackground')
                    }
                },
                {
                    class: 'fas fa-ruler-vertical fa-rotate-180',
                    name: 'Vertical layout',
                    slider: true,
                    value: this.vertical,
                    disabled: true,
                    click: () => {
                        this.$emit('toggleVertical')
                    }
                },
                {
                    class: 'fa fa-microchip',
                    name: 'Low-end mode',
                    slider: true,
                    value: this.lowEndMode,
                    click: () => {
                        this.$emit('toggleLowEndMode')
                    }
                }
            ]
        }
    },
    methods: {
        openMenu() {
            this.isOpen = true;
        },
        closeMenu() {
            this.isOpen = false;
        },
        clickRow(e, option) {
            if (option.disabled)
                return;
            var close = option.slider ? false : true;
            var prevent = () => close = false
            if (option.slider) option.value = !option.value;
            if (option.click) option.click(e, option, prevent);
            if (close) this.closeMenu();
        }
    }
}
</script>

<style>
    .disabled {
        opacity: .5;
        pointer-events: none;
    }

    .menu-icon {
        position: absolute;
        z-index: 11;
        font-size: 20px;
        top: 0;
        left: 0;
        height: 48px;
        width: 48px;
    }
    .menu-background {
        position: absolute;
        z-index: 50;
        background-color: rgba(0, 0, 0, 0.555);
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        opacity: 0;
        transform: translateX(-10000px);
        transition: opacity .4s ease;
    }
    .menu-background.open {
        opacity: 1;
        transform: translateX(0);
    }
    .side-menu {
        width: 350px;
        height: calc(100% - 10px);
        z-index: 51;
        position: absolute;
        top: 0;
        left: 0;
        background: #111827;
        transform: translateX(-150%);
        transition: transform .4s ease;
    }
    .side-menu.open {
        transform: translateX(0);
    }
    .menu-option-icon {
        width: 50px;
    }
    .separator {
        background-color: #283141;
        height: 2px;
    }
</style>