import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import { router } from './router'
import i18n from './i18n.js'

import '@/directives/drag-drop.css'
import '@/directives/tooltip.css'
import tooltip from './directives/tooltip.js'
import lazyloader from './directives/lazyloader.js'
import '@/styles/material.css';
import rippleEffect from './directives/material-ripple.js'

import localePlugin from './plugins/language'
import contextmenu from './plugins/contextmenu/contextmenu.js'
import snackbar from './plugins/snackbar.js'
import callbackAlert from './plugins/callback-modal.js'
import photogalleryPlugin from './plugins/photogallery'

import heroIcon from './components/hero-icon.vue'
import MobileFloatingMenu from './components/mobile-floating-menu.vue'


window.i18n = i18n
let app = createApp(App)
app.config.unwrapInjectedRef = true
app.use(router)
    .use(store)
    .use(i18n)
    .use(contextmenu)
    .use(snackbar)
    .use(callbackAlert)
    .use(localePlugin)
    .use(photogalleryPlugin)
    .directive('tooltip', tooltip)
    .directive('lazyloader', lazyloader)
    .directive('ripple-effect', rippleEffect)
    .component('HeroIcon', heroIcon)
    .component('MobileFloatingMenu', MobileFloatingMenu)
    .mount('#app');