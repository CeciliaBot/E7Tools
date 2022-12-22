<template>
    <div class="glass-container-2" style="display: flex; flex-direction: column; max-width: 900px; margin: 0 auto 20px; height: 100%; width: 100%; max-width: 980px; border-radius: 10px; padding: 0 20px 20px; overflow: hidden; background: rgb(247 247 247 / 6%);">
        <div style="flex: 1; overflow: auto;">
            <Transition :name="animation">
                <div :key="slide" class="full-size">
                    <div v-html="slides[slide]"></div>
                </div>
            </Transition>
        </div>
        <div>
            <button v-if="slide>0" class="material-button basic primary noselect" style="float: left;" @click="slide--" v-ripple-effect>
                <span>{{ $t('strings.back') }}</span>
            </button>
            <button v-if="slide<slides.length-1" class="material-button basic primary noselect" style="float: right;" @click="slide++" v-ripple-effect>
                <span>{{ $t('strings.next') }}</span>
            </button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isFetching: false,
            hasFailed: false,
            slide: 0,
            slides: [],
            animation: 'left-to-right'
        }
    },
    computed: {
        lang() {
            return this.$i18n.locale
        }
    },
    watch: {
        slide(n,o) {
            this.animation = n>o?'left-to-right':'right-to-left'
        },
        slides() {
            this.slide = 0
        },
        lang() {
            this.getHelpSlides()
        }
    },
    methods: {
        getHelpSlides() {
            this.hasFailed = false;
            this.isFetching = true;
            this.slides = [];
            return Promise.all([
                import(/* webpackChunkName: "[request]" */ '../help-slides/'+this.lang+'.json').catch(async () => {
                    return await import(/* webpackChunkName: "camping-help" */ '../help-slides/en.json').catch(() => {return []}) //`..\/help\/en\.json`
                })
            ]).then(([res]) => {
                var data = res.default || [];
                this.slides=data;
                return Promise.resolve(res)
            }).catch((error) => {
                this.hasFailed = error;
                return Promise.resolve(false)
            }).then(() => {
                this.changelogLang=this.$i18n.locale;
                this.isFetching = false;
            })
        }
    }
}
</script>

<style scoped>
    .full-size {
        height: 100%;
        width: 100%;
    }

    .left-to-right-enter-active,
    .left-to-right-leave-active,
    .right-to-left-enter-active,
    .right-to-left-leave-active {
        position: absolute;
        transition: transform 0.5s ease;
    }

    .left-to-right-enter-from {
        transform: translate(100vw);
    }
    .left-to-right-leave-to {
        transform: translate(-100vw);
    }

    .right-to-left-enter-from {
        transform: translate(-100vw);
    }
    .right-to-left-leave-to {
        transform: translate(100vw);
    }
</style>