<template>
  <div class="container" v-cloak>
    <router-view />
  </div>
  <!-- LOADING COMPONENTS ETC -->
  <div id="loading" class="noselect loading-container animatefade" v-show="loading" @contextmenu="(e)=>{return e.preventDefault();}" v-cloak>
    <img style="height: 100px;" src="https://cdn.glitch.com/6c14ca82-3bcb-4fd6-afa7-815b95e04a14%2Fras-run-slow.gif?v=1632241290215">
    <transition name="slide-fade" mode="out-in">
      <div :key="loadingText" style="font-size: 32px;color: white;text-shadow: 0px 0px 3px grey, 0 0 10px black, 0 0 10px black;line-height: 30px;padding-top: 12px;margin-left: 20px;">
        {{loadingText}}
      </div>
    </transition>
  </div>
  <!--M  A  I  N     M  E  N  U -->
  <div id="main_menu" v-show="mainMenu" class="mm_container" v-cloak>
    <h2>{{$t('strings.app_cecilia_tools')}}</h2>
    <div class="app_drawer">
      <div v-for="x in menuIcons" v-bind:key="x.title" v-on:click="mainMenuClick(x.path,x.keep)">
        <div class="noselect">
          <i v-if="x.class" v-bind:class="x.class" aria-hidden="true"></i>
          <img v-else :src="x.icon" height="70%"/>
        </div>
        <h3>{{ $t(`strings.${x.name}`) }}</h3>
      </div>
      <div v-if="PWAButton" @click="()=>installPWA()">
        <div>
          <i class="fa fa-download" aria-hidden="true"></i>
        </div>
        <h3>{{$t('strings.app_pwa_install')}}</h3>
      </div>
    </div>
  </div>
</template>

<script>
import {router,routes} from './router'
import store from '@/store'
import isMobileOS from './utils/isMobileOS.js'

function setScreenType () {
  var r, w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth, h = window.innerHeight || document.documentElement.height || document.body.clientHeight;
  if (w <= 600)
    r = true;
  else
    r = false;
  if (store) {
    store.commit('updateIsMobile', r);
    store.commit('updateWindowSize', w)
    store.commit('updateWindowHeight', h)
  }
}
window.onresize = setScreenType;
export default {
  data: function () {
    return {
      VERSION: '1.0',
      memed: false
    }
  },
  methods: {
    setLoading: function (val,text) {
      this.$store.commit('loading',[val,text]);
    },
    mainMenuClick: function (e) {
      this.$store.commit('toggleMainMenu');
      if (e === this.$route.path) return;
      router.push({ path: e}).catch(fail => {
        console.log(fail);
        console.log('failed');
      });
      return;
    },
    openHome: function () {
      this.$store.commit('toggleMainMenu');
    },
    openModal: function () {
      document.body.classList.add("modal-open");
    },
    closeModal: function () {
      document.body.classList.remove("modal-open");
    },
    installPWA: function () {
      this.PWAButton.prompt();
      this.PWAButton.userChoice.then((choiceResult) => {
        if(choiceResult.outcome == 'dismissed') {
          console.log('Permission refused')
        }
        else {
          this.$set(this.$store.state,'installPWAButton',null);
        }
      });
    },
    onContextualMenu: function (e) {
      this.$contextmenu.show( e, [['fa fa-times', 'Funziona'],['fa fa-times', 'Non funziona']] )
    }
  },
  computed: {
    menuIcons: function () {
      return routes.filter(el => {
        return el.path !== '/' && el.path !== '/:pathMatch(.*)*';
      })
    },
    loading: function () {
      return this.$store.state.loading[0];
    },
    loadingText: function () {
      return this.$store.state.loading[1];
    },
    mainMenu: function () {
      return this.$store.state.mainMenu;
    },
    PWAButton: function () {
      return this.$store.state.installPWAButton;
    }
  },
  watch: {
    mainMenu: function () {
      if (this.mainMenu)
          this.openModal();
      else
          this.closeModal();
    }
  },
  mounted: function () {
  },
  created: async function () {
    console.log('%cCeciliaBot',"font-size: 30px");
    console.log(`%cVersion: ${this.VERSION}`,"color: red")
    this.$store.commit('updateIsMobile', isMobileOS.any());
    setScreenType(); // from utils.js
    console.log('Mobile:',this.$store.state.isMobile);
    if (Math.floor(Math.random() * 100) + 1 <5) return this.memed=true;
    document.addEventListener('keydown', (e) => {
      if ( e.target.tagName==='INPUT' || e.target.tagName==='TEXTAREA' || e.target.contentEditable=="true" ) return; /*Don't trigger if typing*/
      if ( e.key==='Escape' || e.key==='m' ) this.openHome();
    })
  }
}
</script>

<style src='@/styles/main.css'></style>
