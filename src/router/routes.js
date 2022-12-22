import store from '@/store/index.js'

/*
  Name is set as document title (with localization)
  Title is used as fallback if i18n is not ready yet
*/

const routes = [
    {
      path: '/',
      title: 'Main Menu',
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
      path: '/ultimate-timeline',
      title: 'Ultimate Timmeline',
      name: 'app_ultimate_timeline',
      icon: require('@/assets/timeline-app-icon.png'),
      component: () => import(/* webpackChunkName: "timeline2" */'../views/timeline2/index.vue')
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
    {
      path: '/camping-simulator',
      title: 'Camping Simulator',
      name: 'app_camp_simulator',
      icon: require('@/assets/camp-fire-icon-small.png'),
      component: () => import(/* webpackChunkName: "camping" */'../views/camping-simulator/index.vue')
    },
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

export default routes;