import { createStore } from 'vuex'
import httpGetAsync from '@/utils/ajax.js'
import bannerId from '@/utils/bannerId.js';
import i18n from '../i18n.js'

import defaultTheme from '@/utils/theme.js'
import { cdn } from '@/utils/constant.js'

export default createStore({
  state: {
    loading: [true, 'CONNECTING...'],
    theme: defaultTheme(),
    mainMenu: false,
    isMobile: false,
    screenWidth: 0,
    screenHeight: 0,
    currentOpenBanner: null, // banner currently opened by user;
    
    /* DATA */
    HeroDB: null,
    ArtifactDB: null,
    TierListDB: null,

    rateUpHistory: null,
    powderShop: null,
    indexedDB: null,
    pulls: null
  },
  getters: {
    getIsMobile: (state) => () => {
      return state.isMobile
    },
    getHeroDB: (state) => () => {
      return state.HeroDB
    },
    getHero: (state) => (id) => {
      if (!state.HeroDB) return id;
      return state.HeroDB[id] || {id: id, _id: id, name: id, rarity: 5, attribute: 'fire', role: 'knight'};
    },
    getHeroName: (state) => (id) => {
      if (!state.HeroDB) return id;
      //check if this hero exsists in the translation files, if it doesn't fallback to database name
      return i18n.global.te('heroes.'+id) ? i18n.global.t('heroes.'+id) : (state.HeroDB[id] || {}).name || id;
    },
    getHeroIcon: (state) => (id) => {
      if (!state.HeroDB) return id;
      return cdn+'face/' + (state.HeroDB[id] || {id: id}).id + '_s.png';
    },
    getArtifact: (state) => (id) => {
      return state.ArtifactDB[id] || {id: id, _id: id, name: id, rarity: 5};
    },
    getArtifactName: (state) => (id) => {
      if (!state.ArtifactDB) return id;
      // same as getHeroName
      return i18n.global.te('artifacts.'+id) ? i18n.global.t('artifacts.'+id) : (state.ArtifactDB[id] || {}).name || id;
    },
    getArtifactIcon: (state,getters) => (artifact) => {
      let ic = getters.getArtifact(artifact).id;
      return cdn+'item_arti/icon_' + ic + '.png';
    },
    getArtifactImage: (state,getters) => (artifact) => {
      let ic = getters.getArtifact(artifact).id;
      return cdn+'item_arti/' + ic + '_fu.png';
    },
    getBannerPulls: (state) => (id) => {
      return state.pulls[id] || {};
    },
    getRarityIcon: () => (id) => {
      switch (id) {
        default:
          return cdn+'cm_icon_star.png';
        case 'all':
          return cdn+'label-all.png';
      }
    },
    getRoleIcon: () => (id) => {
      var b = cdn+'class/cm_icon_role_';
      switch (id) {
        default:
          return b + id + '.png';
        case 'assassin':
          return b + 'thief.png';
        case 'manauser':
          return b + 'soul-weaver.png'
        case 'all':
          return cdn+'label-all.png';
      }
    },
    getAttributeIcon: () => (id) => {
      var b = cdn+'attribute/cm_icon_pro';
      switch (id) {
        default:
          return b+id+'.png';
        case 'wind':
          return b+'earth.png';
        case 'dark':
          return b+'mdark.png'
        case 'all':
          return cdn+'label-all.png';
      }
    },
    getTierListDB: (state) => () => {
      return state.TierListDB || {}
    },
    getRateUpHistory(state) {
      return state.rateUpHistory || []
    }
  },
  mutations: {
    loading: function (state, payload=[false, 'CONNECTING...']) {
      if (!Array.isArray(payload))
        state.loading[0] = payload,
        state.loading[1] = 'CONNECTING...'
      else {
        state.loading[0] = payload[0],
        state.loading[1] = payload[1] || 'CONNECTING...'
      }
    },
    installPWAButton: function (state, e) {
      state.installPWAButton = e;
    },
    toggleMainMenu: function (state) {
      state.mainMenu = !state.mainMenu;
    },
    toggleBannerModal: function (state, banner=null) {
      state.currentOpenBanner = banner;
    },
    updateIsMobile: function (state, value=false) {
      state.isMobile = value;
    },
    updateWindowSize: function (state,w) {
      state.screenWidth = w;
    },
    updateWindowHeight: function (state,h) {
      state.screenHeight = h;
    },
    updateHeroDB: function (state, data) {
      state.HeroDB = data;
    },
    updateArtifactDB: function (state, data) {
      state.ArtifactDB = data;
    },
    updateTierListDB: function (state, data) {
      state.TierListDB = data;
    },
    updateRateUpHistory: function (state, data) {
      state.rateUpHistory = data;
    },
    updatePowderShop: function (state, data) {
      state.powderShop = data;
    },
    updateIndexedPulls: function (state, data) {
      state.indexedDB = data;
    },
    updateUserPulls: function (state, data) {
      state.pulls = data;
    },
    addUserPull: function (state, data) {
      if (state.pulls) state.pulls[data.id] = data;
    },
  },
  actions: {
    LOADING: function (context, text) {
      context.commit('loading', true, text);
      return new Promise((resolve)=>{
        setTimeout(() => {
          resolve();
          this.$nextTick(()=>{
            context.commit('loading', false);
          })
        }, 0);
      })
    },
    GET_HERO_DB: function (context) {
      return new Promise((resolve, reject) => {
        if (context.state.HeroDB) return resolve(context.state.HeroDB);
        httpGetAsync('./data/HeroDatabase.json').then( (res) => {
          var data = JSON.parse(res);
          context.commit('updateHeroDB', data);
          resolve(data);
        }).catch(err => {
          reject(err);
        });
      });
    },
    GET_ARTIFACT_DB: function (context) {
      return new Promise((resolve, reject) => {
        if (context.state.ArtifactDB) return resolve(context.state.ArtifactDB);
        httpGetAsync('./data/artifacts.json').then( (res) => {
          var data = JSON.parse(res);
          var obj = {};
          for (var i in data) {
            obj[data[i]._id] = data[i]
          }
          context.commit('updateArtifactDB', data);
          resolve(obj);
        }).catch(err => {
          reject(err);
        });
      });
    },
    GET_RATE_UP_HISTORY: function (context) {
      return new Promise((resolve, reject) => {
        if (context.state.rateUpHistory) return resolve(context.state.rateUpHistory);
        httpGetAsync('./data/timeline/timeline-items.json').then( (res) => {
          var data = JSON.parse(res);
          data.forEach(item => { if (item.type!='event') item.id=bannerId(item) });
          //var today = new Date();
          //function pad(d) {return (d < 10) ? '0' + d.toString() : d.toString();}
          //today = today.getUTCFullYear() + '-' + pad(today.getUTCMonth()+1) + '-' + pad(today.getUTCDate());
          //data.push({type: 'event', name: 'Today', start: today });
          context.commit('updateRateUpHistory', data);
          resolve(data);
        }).catch(err => {
          reject(err)
        });
      });
    },
    GET_POWDER_SHOP: function (context) {
      return new Promise((resolve, reject) => {
        if (context.state.powderShop) return resolve(context.state.powderShop);
        httpGetAsync('./data/timeline/powder-shop.json').then( (res) => {
          var data = JSON.parse(res);
          context.commit('updatePowderShop', data);
          resolve(data);
        }).catch(err => {
          reject(err);
        });
      });
    },
    LOAD_INDEXED_DB: function (context, database = 'timeline',version=2) {
      return new Promise((resolve, reject) => {
        if (context.state.indexedDB) return resolve(context.state.indexedDB);
        let request = window.indexedDB.open(database, version);
        request.onerror = e => {
          //app.$root.$emit('snackbar', {type: 'error', title: 'ERROR IndexedDB', description: 'Error while reading IndexedDB!'});
          console.log('Error opening db', e);
          reject('can\'t_open_indexed_db');
        };
        request.onsuccess = e => {
          console.log('IDB Loaded');
          context.commit('updateIndexedPulls', e.target.result);
          resolve(e.target.result);
        };
        request.onupgradeneeded = e => {
          var stores = [{name: 'pulls', keyPath: 'id'},{name: 'tierlist', keyPath: 'id'},{name: 'camping', keyPath: 'id'}]
          //app.$root.$emit('snackbar', {type: 'info', title: 'IndexedDB', description: 'Running onupgradeneeded'});
          let db = e.target.result;
          for (var i=0; i<stores.length; i++) {
            var store = stores[i];
            if (!db.objectStoreNames.contains(store.name)) {
              db.createObjectStore(store.name, {keyPath: store.keyPath})
            }
          }
        };
      });
    },
    loadUserDataDB: function (context, db, storeName='pulls') {
      return new Promise((resolve, reject) => {
        if (!db)db=context.state.indexedDB;
        if (context.state[storeName]) {
          resolve(context.state[storeName]);
          return
        }
        let trans = db.transaction(storeName, IDBTransaction.READ_ONLY);
        trans.oncomplete = () => {
          //app.$root.$emit('snackbar', {type: 'success', title: 'Complete', description: 'User data obtained from IndexedDB'});
          context.commit('updateUserPulls', items);
          resolve(items);
        };
        let store = trans.objectStore(storeName);
        let items={};
        store.openCursor().onsuccess = e => {
          let cursor = e.target.result;
          if (cursor) {
            items[cursor.value.id]=cursor.value;
            cursor.continue()
          }
        };
        trans.onerror = error => {
          //app.$root.$emit('snackbar', {type: 'error', title: 'Store Error', description: 'Error while reading data from ' + store});
          console.log(error);
          reject(error);
        };
      });
    },
    savePullData: function (context, data ) {
      return new Promise((resolve,reject)=>{
        if (!context.state.indexedDB) {
          reject('Can\'t open database');
          //app.$root.$emit('snackbar', {type: 'error', title: 'ERROR', description: 'Database not found!<br>Try refreshing...'});
          return
        }
        var transaction = context.state.indexedDB.transaction(['pulls'], 'readwrite');
        var store = transaction.objectStore('pulls');
        var request = store.put(data);
        request.onerror = (e) => {
          //app.$root.$emit('snackbar', {type: 'error', title: 'ERROR', description: e.target.error.name});
          reject('Error', e.target.error.name);
        };
        request.onsuccess = (e) => {
          context.commit('addUserPull', data);
          resolve(e,true);
          //app.$root.$emit('snackbar', {type: 'success', title: 'Success', description: 'Banner data successfully saved to database!'});
        };
      });
    },
    getBannerPulls: function (context, data ) {
      return new Promise((resolve,reject)=>{
        context.dispatch('LOAD_INDEXED_DB').then(db => {
          var transaction = db.transaction(['pulls'], IDBTransaction.READ_ONLY);
          var store = transaction.objectStore('pulls');
          var request = store.get(data);
          request.onerror = () => {
            //app.$root.$emit('snackbar', {type: 'error', title: 'ERROR', description: e.target.error.name});
            reject({});
          };
          request.onsuccess = (e) => {
            resolve(e.target.result,true);
            console.log(e.target.result);
          };
        }).catch(() => {
          reject({});
        });
      });
    },
    LOAD_TIER_LIST_DB: function (context) { // return object with id as key
      return new Promise((resolve, reject) => {
        context.dispatch('LOAD_INDEXED_DB').then(db => {
          let trans = db.transaction('tierlist', IDBTransaction.READ_ONLY);
          let items={};
          trans.oncomplete = () => {
            //app.$root.$emit('snackbar', {type: 'success', title: 'Complete', description: 'User data obtained from IndexedDB'});
            context.commit('updateTierListDB', items);
            resolve(items);
          };
          let store = trans.objectStore('tierlist');
          store.openCursor().onsuccess = e => {
            let cursor = e.target.result;
            if (cursor) {
              items[cursor.value.id]=cursor.value;
              cursor.continue()
            }
          };
          trans.onerror = error => {
            //app.$root.$emit('snackbar', {type: 'error', title: 'Store Error', description: 'Error while reading data from ' + store});
            console.log(error);
            reject(error);
          };
        }).catch(err => reject(err));
      });
    },
    SAVE_TIER_LIST: function (context, data ) {
      return new Promise((resolve,reject)=>{
        context.dispatch('LOAD_INDEXED_DB').then(db => {
          var transaction = db.transaction(['tierlist'], 'readwrite');
          var store = transaction.objectStore('tierlist');
          var request = store.put(data);
          request.onerror = (e) => {
            //app.$root.$emit('snackbar', {type: 'error', title: 'ERROR', description: e.target.error.name});
            reject('Error', e.target.error);
          };
          request.onsuccess = (e) => {
            context.state.TierListDB[data.id] = data;
            resolve(e,true);
            //app.$root.$emit('snackbar', {type: 'success', title: 'Success', description: 'Tierlist data successfully saved to database!'});
          };
        }).catch(err=> reject(err));
      });
    },
    DELETE_TIER_LIST: function (context, data ) {
      return new Promise((resolve,reject)=>{
        context.dispatch('LOAD_INDEXED_DB').then(db => {
          var transaction = db.transaction(['tierlist'], 'readwrite');
          var store = transaction.objectStore('tierlist');
          var request = store.delete(data.id);
          request.onerror = (e) => {
            //app.$root.$emit('snackbar', {type: 'error', title: 'ERROR', description: e.target.error.name});
            reject('Error', e.target.error.name);
          };
          request.onsuccess = (e) => {
            delete context.state.TierListDB[data.id];
            resolve(e,true);
            //app.$root.$emit('snackbar', {type: 'success', title: 'Success', description: 'Tierlist deleted!'});
          };
        }).catch(err=> reject(err));
      });
    }
  },
  modules: {
  }
})
