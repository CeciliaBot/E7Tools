<script>
/* Port of the old version to Vue 3 */
import { Transition, h, withDirectives } from 'vue'
import ctrlf from '../timeline/components/ctrlf.vue'
import FloatingMenu from '@/components/mobile-floating-menu.vue'
import tooltip from '@/directives/tooltip.js'
import { throttle } from '@/utils/helpers.js'

var mobileTouch = {};
function touchStart (e) {
  if (!mobileTouch.start) mobileTouch.start = e.touches[0] || e.changedTouches[0];
}
function touchMove (e) {
  e.preventDefault(); /* Disable normal scrolling */
}
function touchEnd (e) {
  var end = e.touches[0] || e.changedTouches[0];
  if (mobileTouch.start) {
    if (mobileTouch.start.clientX - end.clientX > 50) { //swipe left
      const evt = new CustomEvent("swipe-left", {"bubbles":true, "cancelable":false});
      e.target.dispatchEvent(evt);
    } else if (mobileTouch.start.clientX - end.clientX < -50) { // swipe left
      const evt = new CustomEvent("swipe-right", {"bubbles":true, "cancelable":false});
      e.target.dispatchEvent(evt);
    } else if (mobileTouch.start.clientY - end.clientY > 50) { //swipe down
      const evt = new CustomEvent("swipe-down", {"bubbles":true, "cancelable":false});
      e.target.dispatchEvent(evt);
    } else if (mobileTouch.start.clientY - end.clientY < -50) { // swipe up
      const evt = new CustomEvent("swipe-up", {"bubbles":true, "cancelable":false});
      e.target.dispatchEvent(evt);
    }
    delete mobileTouch.start;
  }
}



export default {
  name: 'powder-shop',
  components: {
    ctrlf
  },
  data: function () {
    return {
      shop: [],
      artifacts: null,
      slide: 0,
      focused: null,
      observer: null,
      animationEnter: 'slide-from-right',
      openShopList: false
    }
  },
  computed: {
    mobile: function () {
      return this.$store.state.isMobile;
    },
    saveDataMode: function () {
      //return false;
      return this.mobile;
    }
  },
  watch: {
    slide: function (old, val) {
      this.focused=null;
      if (val > old) {
        this.animationEnter = 'slide-from-right';
      } else {
        this.animationEnter = 'slide-from-left';
      }
    }
  },
  beforeCreate: function () {
    this.$store.commit('loading', true);
  },
  created: function () {
    this.toggleLoading(true);
    Promise.all([this.$store.dispatch('GET_POWDER_SHOP'), this.$store.dispatch('GET_ARTIFACT_DB')]).then(data => {
      this.shop = data[0];
      this.artifacts = data[1];
      this.ready = true;
      this.$nextTick(() => {
        this.toggleLoading(false);
        this.createObserver();
        var el = document.getElementById('shop-slides');
        el.addEventListener('wheel', this.mousewheel, {passive: true});
        document.addEventListener('keydown', this.handleKeyDown, false);
        el.addEventListener('touchstart', touchStart, {passive: true});
        el.addEventListener('touchmove', touchMove, {passive: false});
        el.addEventListener('touchend', touchEnd, {passive: true});
      })
    }).catch(err => console.log(err));
  },
  beforeUnmount: function(){
    var el = document.getElementById('shop-slides');
    document.removeEventListener('keydown', this.handleKeyDown);
    el.removeEventListener('wheel', this.mousewheel);
    el.removeEventListener('touchstart', touchStart);
    el.removeEventListener('touchmove', touchMove);
    el.removeEventListener('touchend', touchEnd);
    const boxElList = document.querySelectorAll('li');
    boxElList.forEach((el) => {
      this.observer.unobserve(el);
    });
    this.destroyObserver();
    this.observer = null;
  },
  mounted: function () {
  },
  beforeUpdate: function () {
  },
  updated: function () {
  },
  methods: {
    home: function () {
      this.$store.commit('toggleMainMenu');
    },
    toggleLoading: function (val,text) {
      this.$store.commit('loading', val, text);
    },
    loading: function () { /*VUE  will update dom then run js*/
      this.$store.commit('loading', true);
      return new Promise((resolve)=>{
        setTimeout(() => {
          resolve();
          this.$nextTick(()=>{
            this.$store.commit('loading', false);
          })
        }, 0);
      })
    },
    artifact: function (id) {
      return this.$store.getters.getArtifact(id);
    },
    getArtifactName: function (id) {
      return this.$store.getters.getArtifactName(id);
    },
    getArtifactIcon: function (id) {
      return this.$store.getters.getArtifactIcon(id);
    },
    getArtifactImage: function (id) {
      return this.$store.getters.getArtifactImage(id);
    },
    getRarityIcon: function (id) {
      return this.$store.getters.getRarityIcon(id);
    },
    getRoleIcon: function (id) {
      return this.$store.getters.getRoleIcon(id);
    },
    toggleShopList: function () {
      this.openShopList = !this.openShopList;
    },
    focusArtifact: function (i) {
      if (this.focused===i) {
        this.focused=null;
        return;
      }
      this.focused = i;
    },
    searchFunction: function (keyword) {
      const target = this.shop;
      if (!target.length || !keyword) return [];
      const word = keyword.toLowerCase();
      return target.filter(item=>{
        if (!item.a || !Array.isArray(item.a)) return false;
        return item.a.some(artifact => {
          return this.$store.getters.getArtifactName(artifact.id).toLowerCase().indexOf(word) !== -1
        })
      });
    },
    searchToDisplay: function (result) {
      return result.dt.map( date => this.$d(date) ).join(' ~ ');
    },
    goToResult: function (result) {
      this.shop.forEach( (rotation,i) => {
        if (rotation === result) {
          this.slide = i;
        }
      })
    },
    mousewheel: throttle(function (e) {
      //e.preventDefault();
      if (e.deltaY<0) {
        if (this.slide > 0)
          document.getElementById('shop-slides').scrollTop=(this.slide-1)*window.innerHeight;
      } else {
        if (this.slide < this.shop.length)
          document.getElementById('shop-slides').scrollTop=(this.slide+1)*window.innerHeight;
      }
    }, 300),
    scrollSlide: function () {
      var lastPos = document.body.scrollTop;
      window.requestAnimationFrame(() => {
        var pos = document.body.scrollTop;
        if (lastPos >= pos) {
          if (this.slide > 0)
            window.scrollY = (this.slide-1)*window.innerHeight-10;
        } else {
          if (this.slide < this.shop.length)
            window.scrollY = (this.slide+1)*window.innerHeight-10;
        }
      });
    },
    scrollBySwipe: function (n) {
      if (n>0&&this.slide<this.shop.length) {
        document.getElementById('shop-slides').scrollTop = (this.slide+1)*window.innerHeight;
      } else if (n<0&&this.slide>0) {
        document.getElementById('shop-slides').scrollTop = (this.slide-1)*window.innerHeight;
      }
    },
    handleKeyDown: throttle(function (e) {
      if (e.ctrlKey) return;
      if (e.target.tagName==='INPUT' || e.target.tagName==='TEXTAREA' || e.target.contentEditable=="true") return;
      e.preventDefault();
      if (
        e.keyCode === 39 || e.key === 'ArrowRight' ||
        e.keyCode === 40 || e.key === 'ArrowDown' ||
        e.keyCode === 68 || e.key === 'd'
      ) this.scrollBySwipe(1);
      else if (
        e.keyCode === 37 || e.key === 'ArrowLeft' ||
        e.keyCode === 38 || e.key === 'ArrowUp' ||
        e.keyCode === 65 || e.key === 'a'
      ) this.scrollBySwipe(-1);
    },300),
    scrollToSelected: function (n) {
      document.getElementById('shop-slides').scrollTop = (n)*window.innerHeight;
    },
    createObserver: function () {
      let options = {
        root: null,
        rootMargin: "0px",
        threshold: 0.8
      };
      this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            var val=parseInt(entry.target.attributes.index.value);
            if (entry.isIntersecting) {
              this.slide = val;
              return;
            }
          });
          //console.log(this.slide);
        }, 
        options
      );
      const boxElList = document.querySelectorAll('li');
      boxElList.forEach((el) => {
        this.observer.observe(el);
      });
    },
    destroyObserver: function () {
      if (this.observer)
        this.observer.disconnect();
    }
  },
  render: function () {
    return h('section', {class: '', id: 'shop-container'}, [
      h(FloatingMenu,{mobile: this.mobile, options: [{title: 'Search', class: 'fa fa-search', click: 'search'}, {title: 'Home', class: 'fa fa-home', click: 'home'}], onHome: ()=>this.home(), onSearch: () => this.$refs.ctrlf.openSearchBar() }),
      h(ctrlf, {ref: 'ctrlf', events: this.shop, searchFunction: this.searchFunction, toDisplay: this.searchToDisplay, onEvent: this.goToResult }),
      h('ul', {style: {width: '100%', height: '100%', overflow: 'auto'}, id: 'shop-slides', onSwipeLeft: () => this.scrollBySwipe(1), onSwipeRight: () => this.scrollBySwipe(-1), onSwipeUp: () => this.scrollBySwipe(-1), onSwipeDown: () => this.scrollBySwipe(1)}, [
        this.shop[this.slide] ? h( Transition, {name: this.animationEnter}, () => { return [
          h('div', {key: this.slide, class: 'powder-slide-rotations', style: {position: 'absolute', 'z-index': 1, top: 0, left: 0}}, [
            h('div', {class: 'title-container'}, [
              h('button', {class: ['fa rotation-list-btn', {'fa-list': !this.openShopList, 'fa-times': this.openShopList}], onClick: () => this.toggleShopList()}),
              this.shop[this.slide].nid ? 
                withDirectives(
                  h('a', {target: '_blank', href: 'https://page.onstove.com/epicseven/global/view/'+this.shop[this.slide].nid, crossorigin: 'anonymous', SameSite: 'Lax', style: {float: 'right', height: '100%', width: '110px', 'margin-right': '14px',background: 'url(https://static-cdn.onstove.com/0.0.14/img/gnb/bi.svg) no-repeat scroll 0% 50%'}} ),
                  [[tooltip, 'Read notice on stove']]
                )
              : null,
              h('span', {style: {float: 'left', 'padding-left': '10px'}}, (this.slide+1) + '/' + this.shop.length ),
              h('div', {style: {margin: '0 180px 0 55px',overflow: 'hidden','text-overflow': 'ellipsis','white-space': 'nowrap'}}, this.shop[this.slide].dt.map(date => this.$d(date)).join(' - ') )
            ]),
            h('div', {class: 'rotation'}, [
                !this.saveDataMode ?
                  this.shop[this.slide].a.map( (artifact,j) => {
                    return h('div', {class: ['artifact', {focused: this.focused===j}], onClick: () => this.focusArtifact(j)}, [
                        h('img', {class: 'artwork', crossorigin: 'anonymous', SameSite: 'Lax', src: this.getArtifactImage(artifact.id), onLoad: (e) => e.target.style.opacity = 1}),
                        h('span', {style: {'padding-left': '8px'}}, new Array(this.artifact(artifact.id).rarity || 1).fill(h('img', {src: this.getRarityIcon(), SameSite: 'Lax', crossorigin: 'anonymous', style: {height: '20px', 'margin-left': '-8px', 'vertical-align': 'middle'} }))),
                        h('span', {class: 'vertical-name'}, this.getArtifactName(artifact.id)),
                    ])
                  })
                : 
                  h('div', {style: {'align-self': 'center', width: '100%', 'max-width': '450px'}}, [
                    this.shop[this.slide].a.map( (artifact) => {
                      var height = ((window.innerHeight-100)/this.shop[this.slide].a.length) + 'px';
                      return h('div', {style: {display: 'flex', width: '100%', 'align-items': 'center'}}, [
                        h('img', {src: this.getArtifactIcon(artifact.id), crossorigin: 'anonymous', SameSite: 'Lax', style: {height: height}}),
                        h('img', {src: this.getRoleIcon(this.artifact(artifact.id).role), style: {height: '30px'}}),
                        h('span', {style: {flex: 1,margin: '0 20px'}}, this.getArtifactName(artifact.id)),
                        h('span', {style: {overflow: 'hidden', 'white-space': 'nowrap', 'padding-left': '8px'}}, new Array(this.artifact(artifact.id).rarity || 1).fill(h('img', {src: this.getRarityIcon(), style: {height: '20px', 'margin-left': '-8px', 'vertical-align': 'middle'} }))),
                      ])
                    })
                  ]),
                this.shop[this.slide].content? h('div', {innerHTML: this.shop[this.slide].content}) : null
            ])
          ])
        ]}) : null,
        this.shop.map( (rotation,i) => {
          return h('li', {class: 'powder-slide-rotations', style: {visibility: 'hidden'}, index: i}, [
            h('div', {class: 'title-container'}, 'Data della rotazione'),
            h('div', {class: 'rotation'}
              /*,
              rotation.a.map( (artifact,j) => {
                return h('div', {staticClass: 'artifact', style: {}}, [
                    h('span', {style: {'padding-left': '8px'}}, new Array(this.artifact(artifact.id).rarity || 1).fill(h('img', {attrs: {src: this.getRarityIcon()}, style: {height: '20px', 'margin-left': '-8px', 'vertical-align': 'middle'} }))),
                    h('span', {staticClass: 'vertical-name' }, this.artifact(artifact.id).name)
                ])
              })
              */
            )
          ])
        })
      ]),
      this.shop&&this.openShopList ? h('div', {class: 'glass-container rotation-list-box'}, [
        this.shop.map( (rotation,i) => {
          return h('div', {class: ['elements', {active: this.slide === i}], onClick: () => this.scrollToSelected(i) }, (i+1) + '. ' + this.$d(rotation.dt[0]))
        })
      ]) : null
    ]);
  }
}
</script>

<style>
  #shop-container {
    height: 100% !important;
  }
  .slide-from-left-enter-active {
    animation: rotation-slide-in .5s;
  }
  .slide-from-left-leave-active {
    animation: rotation-slide-out .5s;
  }
  .slide-from-right-enter-active {
    animation: rotation-slide-in-left .5s;
  }
  .slide-from-right-leave-active {
    animation: rotation-slide-out .5s;
  }
  @keyframes rotation-slide-in {
    0% {
      transform: translateX(70%) scale(0.85);
    }
    100% {
      transform: translateX(0) scale(1);
    }
  }
  @keyframes rotation-slide-in-left {
    0% {
      transform: translateX(-70%) scale(0.85);
    }
    100% {
      transform: translateX(0) scale(1);
    }
  }
  @keyframes rotation-slide-out {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0.85);
    }
  }
  .powder-slide-rotations {
    display: inline-block;
    width: 100%;
    height: 100%;
    background-color: #252526;
  }
  .powder-slide-rotations > .title-container {
    height: 45px;
    width: 100%;
    height: 45px;
    width: 100%;
    background-color: white;
    color: black;
    text-align: center;
    line-height: 45px;
    overflow: hidden;
    text-overflow: clip;
    white-space: nowrap;
  }
  .powder-slide-rotations > .rotation {
    display: flex;
    width: 100%;
    height: calc(100% - 45px);
    justify-content: center;
  }
  .powder-slide-rotations > .rotation > .artifact {
    flex: 1;
    position: relative;
    overflow: hidden;
    height: 100%;
    max-width: 378px;
    display: inline-block;
    transition: all ease .3s;
    filter: grayscale(50%);
  }
  .powder-slide-rotations > .rotation > .artifact:hover {
    filter: grayscale(0);
  }
  .powder-slide-rotations > .rotation > .artifact.focused {
    flex: 0 0 400px;
    max-width: 400px;
  }
  .powder-slide-rotations > .rotation > .artifact > .artwork {
    z-index: -1;
    position: absolute;
    top: 0px;
    left: 50%;
    transform: translateX(-50%);
    height: 100%;
    width: 100%;
    object-fit: cover;
    transition: opacity .3s ease;
    opacity: 0;
  }
  .powder-slide-rotations > .rotation > .artifact > .vertical-name{
    writing-mode: vertical-lr;
    text-orientation: inherit;
    transform: rotate(180deg);
    position: absolute;
    bottom: 0;
    right: 0;
    font-size: 30px;
    color: yellow;
    text-shadow: 0 0px 5px #e91414;
    pointer-events: none;
  }
  /*.powder-slide-rotations > .mobile-rotation {
  } */
  .rotation-list-btn {
    float: right;
    padding: 6px;
    margin: 2px 10px 2px 0;
    cursor: pointer;
    background-color: #0001;
    border: none;
    font-size: 16px;
    height: 40px;
    width: 40px;
    border-radius: 4px;
  }
  .rotation-list-box {
    position: absolute;
    height: calc(100% - 45px);
    top: 45px;
    width: 300px;
    right: 0;
    overflow: auto;
    z-index: 1;
  }
  .rotation-list-box > .elements {
    padding: 10px;
    cursor: pointer;
  }
  .rotation-list-box > .elements.active {
    background-color: #05050540;
  }
  .rotation-list-box > .elements:not(.active):hover {
    background-color: #05050540;
  }
</style>