import { createRouter, createWebHashHistory } from 'vue-router'
import store from '@/store/index.js'
import i18n from '@/i18n.js'
import routes from './routes.js'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  store.commit('loading', true)
  next()
})

router.afterEach((to, from, failure) => {
  store.commit('loading', false);
  if (failure) return;
  if (i18n.global.te('strings.app_cecilia_tools'))
    document.title = `${i18n.global.t(`strings.${to.name}`)} | ${i18n.global.t('strings.app_cecilia_tools')}`;
  else 
    document.title = 'CeciliaBot Tools';
  if (window.gtag) {
    window.gtag('set', 'page_path', window.location.pathname + '#' + to.path)
    window.gtag('event', 'page_view')
  }
})

export { router, routes }
