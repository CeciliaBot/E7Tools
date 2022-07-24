<script>
import { h } from 'vue'
import changelog from '@/components/changelog.vue'

var TABS = ['welcome', 'changelog', 'credits'];
export default {
  name: 'camping-welcome',
  props: {
    visible: {
      type: Boolean,
      required: false,
      default: true
    },
    version: {
      type: Number,
      default: 1
    }
  },
  inject: ['standalone'],
  data: function () {
    return {
      currentTab: TABS[0]
    }
  },
  beforeCreate() {
  },
  created: function () {
  },
  mounted: function () {
  },
  computed: {
  },
  methods: {
    switchTab: function (tab) {
      if (tab===this.currentTab) return;
      this.currentTab = tab;
    }
  },
  render: function () {
    return h('div', {style: 'position: relative; margin: -10px 0; height: calc(100% + 20px);'}, [
      //h('div', {staticClass: 'blur-bg'}),
      h('div', {class: 'glass-container welcome-comp-header'}, 
        TABS.map(tab => {
          return h('span', {class: 'item-box noselect', onMouseenter: () => this.switchTab(tab)}, this.$t(`strings.${tab}`));
        })
      ),
      h('div', {class: 'welcome-main landing-comp-tab', style: {display: this.currentTab==='welcome'?'':'none'}}, [
        h('img', {src: 'https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/tile/camping_used.png', style: 'height: 177px; width: 216px; pointer-events: none;'}),
        h('div', {style: 'font-size: 30px;'}, this.$t('strings.camping_title_main', [this.version.toFixed(2)])),
        this.standalone ? h('div', 'Standalone version') : null,
        h('div', [
          // h('button', {staticClass: 'material-button basic noselect', on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('button', {staticClass: 'material-button basic primary noselect', on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('button', {staticClass: 'material-button basic confirm noselect', on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('button', {staticClass: 'material-button basic warn noselect', on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('button', {staticClass: 'material-button basic accent noselect', on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('button', {staticClass: 'material-button basic accent noselect', attrs: {disabled: true}, on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('br'),
          // h('button', {staticClass: 'material-button stroked noselect', on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('button', {staticClass: 'material-button stroked primary noselect', on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('button', {staticClass: 'material-button stroked confirm noselect', on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('button', {staticClass: 'material-button stroked warn noselect', on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('button', {staticClass: 'material-button stroked accent noselect', on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('button', {staticClass: 'material-button stroked accent noselect', attrs: {disabled: true}, on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('br'),
          // h('button', {staticClass: 'material-button flat noselect', on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('button', {staticClass: 'material-button flat primary noselect', on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('button', {staticClass: 'material-button flat confirm noselect', on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('button', {staticClass: 'material-button flat warn noselect', on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, [h('span','Test')]),
          // h('button', {staticClass: 'material-button flat accent noselect', on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('button', {staticClass: 'material-button flat accent noselect', attrs: {disabled: true}, on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),
          // h('button', {staticClass: 'material-button flat raised accent noselect', on: {mousedown: window.$materialRipple, touchstart: window.$materialRipple}}, 'Test'),

        ])
      ]),
      h('div', {class: 'welcome-main', style: {display: this.currentTab==='changelog'?'':'none'}}, [
        h(changelog, {style: 'color: white;', path: 'views/camping-simulator/'})
      ]),
      h('div', {class: 'welcome-main landing-comp-tab', style: {display: this.currentTab==='credits'?'':'none', 'text-align': 'center'}}, [
        h('div', {style: 'font-size: 30px;'}, 'Translations:'),
        this.$i18n._availableLocales.map( locale => {
          return h('div', {}, [
            h('span', locale.name),
            ': ',
            h('span', {innerHTML: (locale.authors||['-']).join(', ')})
          ])
        }),
        h('br'),
        'Code: Gio',
        h('br'),
        // h('span', {style: 'font-size: 30px;'}, [
        //   h('a', {style: 'margin: 5px;', attrs: {href: 'https://github.com/CeciliaBot/CeciliaBot.github.io', target: '_blank'}}, [h('i', {staticClass: 'fab fa-github'})]),
        //   h('a', {style: 'margin: 5px;', attrs: {href: 'https://www.reddit.com/user/UsernameSniped', target: '_blank'}}, [h('i', {staticClass: 'fab fa-reddit'})]),
        //   h('a', {style: 'margin: 5px;', attrs: {href: 'https://discordapp.com/users/605601436570615828', target: '_blank'}}, [h('i', {staticClass: 'fab fa-discord'})]),
        //   h('a', {style: 'margin: 5px;', attrs: {href: 'https://t.me/gio94', target: '_blank'}}, [h('i', {staticClass: 'fab fa-telegram'})])
        // ])
      ]),
    ])
  }
}
</script>
<style>
  .blur-bg {
    position: absolute;
    background: url(https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/ui/camping-low-res.jpg) no-repeat;
    background-position: center;
    background-size: cover;
    background-attachment: fixed;
    width: calc(100% + 20px);
    height: 100%;
    top: 0;
    left: 0;
    margin: 0 -10px;
    z-index: -1;
    box-shadow: inset 0 0 100px 100px var(--background-color-primary);
  }

  .blur-bg::before {
    content: "";
    display: block;
    -webkit-filter: blur(1px) brightness(0.5);
    -moz-filter: blur(1px) brightness(0.5);
    -ms-filter: blur(1px) brightness(0.5);
    -o-filter: blur(1px) brightness(0.5);
    filter: blur(8px) brightness(0.5);
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    background: inherit;
    z-index: 0;
  }

  .landing-comp-tab {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .welcome-comp-header {
    position: absolute;
    top: 0px;
    width: 100%;
    height: 50px;
    z-index: 10;
    text-align: center;
    padding-top: 10px;
  }
  .welcome-comp-header .item-box {
    display: inline-block;
    min-width: 100px;
    padding: 3px 10px;
    margin: 5px;
    border-radius: 5px;
    background-color: #7c797c5e;
    cursor: pointer;
  }
  .welcome-main {
    overflow: scroll;
    height: 100%;
    padding-top: 50px;
  }
</style>