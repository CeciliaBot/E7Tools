<template>
    <div class="phantom-background">
        <Transition name="fade">
            <img :src="dynamicSrc" :key="dynamicSrc">
        </Transition>
    </div>
</template>

<script>
import config from '../config.js'
var imgs = Object.values(config.bgBreakPoints)

export default {
    props: {
        end: {
            type: Number
        }
    },
    data() {
        return {
            observer: null,
            breakPoints: [[],[],[],[],[]],
            dynamicSrc: 'https://multiplayer.net-cdn.it/thumbs/images/2018/11/16/epic-seven-cover_png_1200x0_crop_q85.jpg'
        }
    },
    watch: {
        end() { // end date changed so there may be more stuff to watch...
            this.oberveDOM()
        }
    },
    mounted() {
        this.observer = new IntersectionObserver( entries => {
                entries.forEach(entry => {
                    var img
                    if (entry.isIntersecting) {
                        img = entry.target.getAttribute('data-background-break')
                    } else {
                        if (!img && entry.boundingClientRect.left>0) { // going backwards -> need to get the previous image
                            var imgIndex = imgs.indexOf(entry.target.getAttribute('data-background-break'))
                            imgIndex!==-1 ? img = imgs[imgIndex-1] : null
                        }
                    }
                    if (img)
                        this.dynamicSrc = img
                })
            },
            {
                rootMargin: '0px',
                threshold: 0
            }
        )
        this.oberveDOM()
    },
    beforeUnmount() {
        this.observer.disconnect()
    },
    methods: {
        oberveDOM() {
            document.querySelectorAll('[data-background-break]').forEach(el => this.observer.observe(el))
        }
    }
}
</script>

<style scoped>
    .phantom-background {
        position: fixed;
        top: 0;
        left: 0;
        z-index: -1;
        height: 100%;
        width: 100%;
        pointer-events: none;
        backdrop-filter: blur(8px);
        opacity: 0.07;
    }
    .phantom-background > img {
        position: absolute;
        height: inherit;
        object-fit: cover;
        width: inherit;
        
    }
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.7s ease;
    }
    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }

</style>