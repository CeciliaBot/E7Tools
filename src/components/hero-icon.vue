<script>
import { h, withDirectives/*, resolveDirective*/ } from 'vue'
import { cdn } from '@/utils/constant.js'
import lazyloader from '@/directives/lazyloader.js'

export default {
  name: 'HeroIcon',
  emits: ['click', 'context', 'remove'],
  props: {
    type: {
      type: Number,
      default: 0
    },
    hero: {
      type: String
    },
    skin: {
      type: String,
      default: undefined
    },
    showrole: {
      type: Boolean,
      required: false,
      default: true
    },
    showname: {
      type: Boolean,
      default: false
    },
    showrarity: {
      type: Boolean,
      default: false
    },
    removable: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Boolean,
      default: false
    },
    hover: {
      type: Boolean,
      default: true
    },
    size: {
      type: Number,
      default: 75
    },
    style: {
      default: ''
    },
    lazyload: {
      type: Boolean,
      default: true
    }
  },
  //renderTriggered (e) {console.log('HeroIcon', e)},
  //beforeUpdate() {console.log(this.name)},
  computed: {
    heroData: function () {return this.$store.getters.getHero(this.hero)},
    name: function () {return  this.$store.getters.getHeroName(this.hero) },//this.$store.getters.getHeroName(this.heroData._id)},
    icon: function () {return cdn+'face' + ['','2','2'][this.type] +'/' + (this.skin || this.heroData.id) + '_' + ['s','su','l'][this.type] + '.png'},
    roleIcon: function () {return this.$store.getters.getRoleIcon(this.heroData.role)},
    attributeIcon: function () {return this.$store.getters.getAttributeIcon(this.heroData.attribute)},
    computedStyle() {return {opacity: this.lazyload?0:''}}
  },
  render: function () {
    if (!this.hero) return;
    //console.log('Rerendering hero', this.name)
    return h('div', {class: ['hero-icon-comp noselect', {hoverable: this.hover}], style: [this.style, {'font-size': this.size + 'px'}], onClick: event => {event.target.className.indexOf('remove') !=-1 ? this.$emit('remove', this.hero, event) : this.$emit('click', this.hero, event)}, onContextmenu: event => {event.preventDefault(); this.$emit('context',this.hero, event) } }, [
      h('div', {style: {position: 'relative', height: '1em', 'min-width': (1+(this.removable ? 0.35 : 0))+'em', 'text-align': 'start', 'pointer-events': 'none'}}, [
        this.selected ? [
          h('div', {class: 'circle', style: {'animation-delay': '-3s'}}),
          h('div', {class: 'circle', style: {'animation-delay': '-2s'}}),
          h('div', {class: 'circle', style: {'animation-delay': '-1s'}}),
          h('div', {class: 'circle', style: {'animation-delay': '0s'}})
        ] : null,
        this.lazyload? h('img', {key: 'lazy', class: 'avatar', style: 'position: absolute;', src: 'https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/face/c0000_s.png', 'data-lazy-fader': true, crossorigin: 'anonymous', SameSite: 'Lax'}) : null,
        withDirectives(
          h('img', {
            key: 'avatar',
            class: ['avatar', {fit: this.type===1}],
            style: this.computedStyle,
            [this.lazyload?'data-src':'src']: this.icon,
            crossorigin: 'anonymous',
            SameSite: 'Lax'
          }),
          [ [lazyloader] ]
        ),
        this.showrole ? h('div', {class: 'attribute-role', style: {'background-image': 'url(' + this.roleIcon + '),url(' + this.attributeIcon + ')'}}) : null,
        this.showrarity ? h('div', {class: 'wrapper-hero-info rarity-'+this.heroData.rarity}) : null,
        this.selected ? h('i', {class: 'fa fa-lock text-black-stroke', style: {position: 'absolute', bottom: 0, left: '-0.15em', 'font-size': '0.3em', color: 'white'}}) : null,
        this.removable ? h('span', {class: "remove", style: {fontSize: '0.35em'}, title: "Remove " + this.name}, '×') : null
      ]),
      this['showname'] ? h('div', {'pointer-events': 'none', style: {width: (this.size + (this.removable ? this.size*0.35 : 0)) + 'px' }}, [
        h('p', {class: 'label'}, this.name)
      ]) : null
    ])
  }
};
</script>


<style>
    @media (hover: hover) {
      .hero-icon-comp.hoverable:hover {
        position: relative;
        cursor: pointer;
        background-color: var(--background-color-secondary);
        transform: scale(1.3);
        z-index: 1;
      }
      .hero-icon-comp .remove:hover {
        color: red;
        cursor: pointer;
      }
    }
    .hero-icon-comp {
      /*position: relative; issue with tierlist maker*/
      padding: 0.16em;
      font-weight: bold;
      font-size: 24px;
      /*color: var(--font-color);*/
      display: inline-block;
      vertical-align: top;
      transition: transform .2s ease;
      -moz-transition: transform .2s ease;
      -ms-transition: transform .2s ease;
      -o-transition: transform .2s ease;
    }
    .no-padding {
      padding: 0 !important;
    }
    .hero-icon-comp .avatar {
      height: 1em;
      vertical-align: top;
      transition: opacity .4s ease;
    }
    .avatar.fit {
      width: 1em;
      object-fit: cover;
      object-position: 25%;
    }
    .hero-icon-comp .attribute-role {
      position: absolute;
      top: -0.07em;
      left: -0.11em;
      height: 0.5em;
      width: 1.24em;
      background-position: 0% 0%, 100% 0%;
      background-repeat: no-repeat;
      background-size: 0.35em;
    }
    .hero-icon-comp .remove {
      position: absolute;
      top: 1.7em;
      right: 0.4em;
      font-size: 0.35em;
      height: 1em;
      font-weight: bold;
      vertical-align: middle;
      pointer-events: all;
    }
    .hero-icon-comp .label {
      font-size: 0.18em;
      text-align: center;
      overflow: hidden;
      font-weight: normal;
      pointer-events: none;
    }
    .wrapper-hero-info {
      height: 100%;
      width: 100%;
      position: absolute;
      top: 0;
      width: 1em;
    }
    .rarity-5 {
      background-image: url(https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/cm_icon_star.png),url(https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/cm_icon_star.png),url(https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/cm_icon_star.png),url(https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/cm_icon_star.png),url(https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/cm_icon_star.png);
      background-size: 23%;
      background-position: 90%,70%,50%,30%,10%;
      background-position-y: 99%;
      background-repeat: no-repeat;
    }
    .rarity-4 {
      background-image: url(https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/cm_icon_star.png),url(https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/cm_icon_star.png),url(https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/cm_icon_star.png),url(https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/cm_icon_star.png);
      background-size: 25%;
      background-position: 80%,60%,40%,20%;
      background-position-y: 99%;
      background-repeat: no-repeat;
    }
    .rarity-3 {
      background-image: url(https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/cm_icon_star.png),url(https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/cm_icon_star.png),url(https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/cm_icon_star.png);
      background-size: 25%;
      background-position: 70%,50%,30%;
      background-position-y: 99%;
      background-repeat: no-repeat;
    }

    /* from https://www.kirupa.com/animations/creating_pulsing_circle_animation.htm */
    .circle {
      pointer-events: none;
      border-radius: 50%;
      background-color: deepskyblue;
      width: 1em;
      height: 1em;
      z-index: -1;
      top: 0;
      left: 0;
      position: absolute;
      opacity: 0;
      animation: scaleIn 4s infinite cubic-bezier(.36, .11, .89, .32);
    }
    @keyframes scaleIn {
      from {
        transform: scale(.5, .5);
        opacity: .5;
      }
      to {
        transform: scale(2.5, 2.5);
        opacity: 0;
      }
    }
</style>