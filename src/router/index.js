import { createRouter, createWebHashHistory } from 'vue-router'
import {nextTick} from 'vue'
import store from '../store/index.js'
import i18n from '../i18n.js'

const routes = [
  {
    path: '/',
    name: 'app_main_menu',
    component: {
      created: function () {
        store.commit('loading', false);
        store.commit('toggleMainMenu');
      },
      render: function () {}
    }
  },
  {
    path: '/timeline',
    title: 'Timeline',
    name: 'app_timeline',
    icon: 'https://cdn.glitch.com/6c14ca82-3bcb-4fd6-afa7-815b95e04a14%2Ftimeline-icon3.png?v=1631368191379',
    component: () => import(/* webpackChunkName: "timeline" */'../views/timeline/index.vue')
  },
  // {
  //   path: '/powder-shop',
  //   title: 'Powder Shop',
  //   name: 'app_powder_shop',
  //   icon: 'https://cdn.glitch.me/f70857a1-7b0f-4f6d-a1f1-2c24d95fcc88%2Fpowder-nocolor.png',
  //   component: () => import(/* webpackChunkName: "powder-shop" */'../views/powder-shop/index.vue')
  // },
  {
    path: '/tierlist-maker',
    title: 'Tier List Maker',
    name: 'app_tier_list_maker',
    class: 'fa fa-trophy',
    component: () => import(/* webpackChunkName: "tierlist-maker" */ '../views/tierlist-maker/index.vue')
  },
  {
    path: '/camping-simulator',
    title: 'Camping Simulator',
    name: 'app_camp_simulator',
    icon: 'https://cdn.glitch.com/5c21c869-ea9a-48ba-b019-90cd493f45cd%2Fcamp-fire-icon%20small.png?v=1585067234171',
    component: () => import(/* webpackChunkName: "camping" */'../views/camping-simulator/index.vue')
  },
  {
    path: '/gear-score',
    title: 'Gear Score',
    name: 'app_gear_score',
    class: 'fa fa-info-circle',
    component: () => import(/* webpackChunkName: "gear-score" */'../views/gear-score/index.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'app_not_found',
    component: () => import(/* webpackChunkName: "error404" */'../views/404/index.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  store.commit('loading', true)
  next()
})

router.afterEach((to) => {
  store.commit('loading', false);
  nextTick(()=>{
    document.title = `${i18n.global.t(`strings.${to.name}`)} | ${i18n.global.t('strings.app_cecilia_tools')}`;
  })
})

export { router, routes }
