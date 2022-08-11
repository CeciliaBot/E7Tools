<script>
import { h, withDirectives } from 'vue'
import { cdn } from '@/utils/constant.js'
import lazyloader from '@/directives/lazyloader.js'

export default {
  name: 'artifact-icon',
  emits: ['click', 'context'],
  props: {
    inview: {
      type: Boolean,
      required: false,
      default: true
    },
    type: {
        type: Number, // 0 = icon, 1 = full, 2 = thumbnail
        default: 0
    },
    artifact: {
      type: String
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
    size: {
      type: Number,
      default: 75
    },
    lazyload: {
      type: Boolean,
      default: true
    }
  },
  computed: {
      artifactData: function () {
          return this.$store.getters.getArtifact(this.artifact);
      },
      image: function () {
          return this.type===1 ? 
            this.$store.getters.getArtifactImage(this.artifactData._id)
          :
            this.$store.getters.getArtifactIcon(this.artifactData._id)
      },
      placeholder: function () {
          return this.type===0 ? 
            ''
          :
            cdn+'item_arti/icon_art0000.png'
      },
      computedStyle() {return {width: '1em', 'vertical-align': 'top', 'opacity': this.lazyload ? 0 : 1, transition: 'opacity .4s ease'}}
  },
  render: function () {
    if (!this.artifact) return;
    return h('div', {class: 'hero-icon-comp noselect', style: {'font-size': this.size + 'px'}, onClick: event => event.target.className.indexOf('remove') !=-1 ? this.$emit('remove', this.artifact, event) : this.$emit('click', this.artifact, event), onContextmenu: event => {event.preventDefault(); this.$emit('context',this.artifact, event) } }, [
      h('div', {style: {position: 'relative', width: '1em', height: this.type===0?'1em':'auto', 'text-align': 'start', 'pointer-events': 'none'}}, [
        this.lazyload ? h('img', {style: 'height: 1em; vertical-align: top; position: absolute; transition: opacity .4s ease;', src: this.placeholder, 'data-lazy-fader': true, crossorigin: 'anonymous', SameSite: 'Lax'}) : null,
        withDirectives(
            h('img', {
              key: this.image,
              [ this.lazyload ? 'data-src' : 'src' ]: this.image,
              crossorigin: 'anonymous',
              SameSite: 'Lax',
              style: this.computedStyle
            }),
            [ [lazyloader] ]
        ),
        this.showrole ? h('div', {class: 'attribute-role', style: {'background-image': 'url(' + this.$store.getters.getRoleIcon(this.artifactData.role) + ')'}}) : null,
        this.showrarity ? h('div', {class: 'wrapper-hero-info rarity-'+this.artifactData.rarity, style: 'top: 0; left: 0'}) : null,
      ]),
      this['showname'] ? h('div', {'pointer-events': 'none', style: {width: (this.size + (this.removable ? this.size*0.35 : 0)) + 'px' }}, [
        h('p', {class: 'label'}, this.$store.getters.getArtifactName(this.artifactData._id))
      ]) : null
    ])
  }
};
</script>