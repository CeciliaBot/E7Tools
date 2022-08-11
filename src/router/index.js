import { createRouter, createWebHashHistory } from 'vue-router'
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
      render: function () {},
      beforeRouteEnter() {
        document.title = `Main Menu`;
      }
    }
  },
  {
    path: '/timeline',
    title: 'Timeline',
    name: 'app_timeline',
    icon: require('@/assets/timeline-app-icon.png'),
    component: () => import(/* webpackChunkName: "timeline" */'../views/timeline/index.vue')
  },
  {
    path: '/powder-shop',
    title: 'Powder Shop',
    name: 'app_powder_shop',
    icon: require('@/assets/powder-shop-app-icon.png'),
    component: () => import(/* webpackChunkName: "powder-shop" */'../views/powder-shop/index.vue')
  },
  {
    path: '/tierlist-maker',
    title: 'Tier List Maker',
    name: 'app_tier_list_maker',
    class: 'fa fa-trophy',
    component: () => import(/* webpackChunkName: "tierlist-maker" */ '../views/tierlist-maker/index.vue')
  },
  // {
  //   path: '/camping-simulator',
  //   title: 'Camping Simulator',
  //   name: 'app_camp_simulator',
  //   icon: require('@/assets/camp-fire-icon-small.png'),
  //   component: () => import(/* webpackChunkName: "camping" */'../views/camping-simulator/index.vue')
  // },
  {
    path: '/gear-score',
    title: 'Gear Score',
    name: 'app_gear_score',
    class: 'fas fa-balance-scale-right',
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

router.afterEach((to, from, failure) => {
  store.commit('loading', false);
  if (failure) return;
  document.title = `${i18n.global.t(`strings.${to.name}`)} | ${i18n.global.t('strings.app_cecilia_tools')}`;
  if (window.gtag) {
    window.gtag('set', 'page_path', window.location.pathname + '#' + to.path)
    window.gtag('event', 'page_view')
  }
})

export { router, routes }
