import ripple from '@/utils/material-ripple-effect.js';

export default {
    beforeMount: function (el) {
        el.addEventListener('touchstart', ripple);
        el.addEventListener('mousedown', ripple);
    },
    beforeUnmount: function (el) {
        el.removeEventListener('touchstart', ripple);
        el.removeEventListener('mousedown', ripple);
    }
}