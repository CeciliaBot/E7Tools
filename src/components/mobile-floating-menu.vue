<script>
import { h } from 'vue'

export default {
  name: 'MobileFloatingMenu',
  props: {
    options: {
      type: Array,
      required: false,
      default: function () {return []}
    },
    style: {
      required: false
    }
  },
  data: function () {
    return {
      open: false
    }
  },
  computed: {
    mobile: function () {
      return this.$store.state.isMobile;
    },
  },
  mounted: function () {
  },
  methods: {
    closeMenu: function () {
        this.open=false;
    },
    clickEvent: function (event,date) {
      date;
      this.closeMenu();
      this.$emit(event.click, event)
    },
  },
  render: function () {
    return h('div', {style: this.style || {zIndex: 10, position: 'absolute'}}, this.options.length >0 ? [
      this.options.length ===1
      ?
        h('div', {class: 'mobile-menu ' + this.options[0].class, onClick: ()=> this.clickEvent(this.options[0]) })
      : [
        h('div', {class: ['mobile-menu-items', {closed: !this.open}] }, 
          this.options.map(o=>{
            return o.click ? [
              h('div', {class: o.class, onClick: ()=> this.clickEvent(o) }),
              h('span', o.title || o.name)
            ] : null
          })
        ),
        h('div', {class: ['fa mobile-menu', this.open?'fa-times':'fa-bars', {open: this.open}], onClick: ()=> this.open=!this.open })
      ]
    ] : null)
  }
}
</script>

<style>

</style>