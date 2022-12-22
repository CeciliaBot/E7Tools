<template>
    <component :is="tagName">
        <slot v-if="shouldRender" />
    </component>
</template>

<script>
var map = new WeakMap()
var intersection = {
    root: initIntersection(null)
}
function getObserver(query) {
    return query ?
        intersection[query] || (intersection[query] = initIntersection(query))
    :
        intersection.root;
}
export function createLazyObserver(query) {
    removeLazyObserver()
    intersection[query] = initIntersection(query)
}
export function removeLazyObserver(query) {
    if (intersection[query]) {
        intersection[query].disconnect();
        delete intersection[query]
    }
}
function initIntersection(query) {
    return new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                map.get(entry.target)(entry.isIntersecting)
            })
        },
        {
            root: query ? document.querySelector(query) : null,
            rootMargin: `${Math.max(window.innerWidth, 1080)}px ${Math.max(window.innerHeight, 1080)}px`,
            threshold: 0
    })
}

export default {
    ceci_observer: null,
    name: 'LazyRender',
    props: {
        immediate: {
            default: true
        },
        unrender: { // unrender if it goes off screen
            default: true,
            type: Boolean
        },
        parent: {
            default: null
        },
        tagName: {
            type: String,
            default: 'DIV'
        }
    },
    data() {
        return {
            shouldRender: false,

            unrenderTimer: null,
            renderTimer: null
        }
    },
    methods: {
        renderHandler(isIntersecting) {
            if (this.immediate) {
                if (isIntersecting) {
                    this.shouldRender = true
                } else if (this.unrender) {
                    this.shouldRender = false;
                }
            } else {
                if (isIntersecting) {
                    clearTimeout(this.unrenderTimer);
                    this.renderTimer = setTimeout(() => {
                        this.shouldRender = true
                    }, this.renderDelay || 300 )
                } else if (this.unrender) {
                    clearTimeout(this.renderTimer);
                    this.unrenderTimer = setTimeout(() => {
                        this.shouldRender = false;
                    }, this.unrenderDelay || 1000 );
                }
            }

        }
    },
    mounted() {
        this.$nextTick( () => {
        this.ceci_observer = getObserver(this.parent)
        map.set(this.$el, this.renderHandler)
        this.ceci_observer.observe(this.$el)
        })
    },
    beforeUnmount() {
        map.delete(this.$el)
        this.ceci_observer.unobserve(this.$el)
    }
}
</script>