import { debounce } from '@/utils/helpers.js'

var map = new WeakMap()

const intersection = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        var target = entry.target,
            run = map.get(target)
        if (run) {
            debounce(run(target, entry.isIntersecting), 200)
        }
    })
},
{
    rootMargin: "500px",
    threshold: 0
})

export default {
    created: function (el, binding) {
        map.set(el, binding.value)
        intersection.observe(el)
    },
    updated: function (el, binding) {
        map.set(el, binding.value)
    },
    beforeUnmount: function (el) {
        map.delete(el);
        intersection.unobserve(el)
    }
}