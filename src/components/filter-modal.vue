<script>
import { h, withDirectives } from 'vue'
import { cdn, roles, attributes, rarity, zodiac, getZodiacIcon } from '@/utils/constant.js'
import lazyloader from '@/directives/lazyloader.js'

export default {
  name: 'filters-modal',
  props: {
    options: {
      type: Object,
      required: false,
      default: function () {return {}}
    },
    filter: {
      type: Object,
      required: false,
      default: function () {return {role: [], attribute: [], rarity: [], sex: [], year: null, month: null}}
    },
    sorting: {
      type: Array,
      required: false,
      default: function () {return ['name',false]}
    },
    limit: {
      type: Number,
      required: false,
      default: 0
    },
    relative: {
      type: Boolean,
      required: false,
      default: false
    },
    xy: {
      type: Object,
      required: false
    },
    hidesort: {
      type: Boolean,
      required: false,
      default: false
    },
    extrasort: {
      type: Array,
      required: false,
      default: function () {return []}
    }
  },
  data: function () {
    return {
      res: {},
      sorter: [],
      role: [{name: 'All', id: 'all'}].concat(roles.map(x=>{return {name: x, id: x}})),
      attribute: [{name: 'All', id: 'all'}].concat(attributes.map(x=>{return {name: x, id: x}})),
      rarity: [{name: 'All', id: 'all'}].concat(rarity.map(x=>{return {name: x+'', id: x}})),
      zodiac: [{name: 'All', id: 'all'}].concat(zodiac.map(x=>{return {name: x+'', id: x}})),
      sex: [{name: 'All', id: 'all'}, {name: 'Male', id: 1}, {name: 'Female', id: 2}, {name: 'None', id: 0}],
      sort: [{name: 'name', id: 'name'}, {name: 'rarity', id:'rarity'}, {name: 'attribute', id: 'attribute'}, {name: 'role', id: 'role'}, {name: 'ingame_id', id: 'id'}]
    }
  },
  computed: {
    mobile: function () {
      return this.$store.state.isMobile;
    },
  },
  created: function () {
    this.res = this.filter;
    this.sorter = this.sorting;
    this.extrasort.forEach(option => { //add extra sorting options of needed
      this.sort.push(option);
    })
  },
  methods: {
    isActive: function (cat, id) {
      if (!this.res[cat].length && id==='all')
        return true;
      else if (this.res[cat].includes(id))
        return true;
      return false;
    },
    isActiveSorting: function (id) {
      return this.sorter[0] === id;
    },
    getRoleIcon: function (id) {
      return this.$store.getters.getRoleIcon(id);
    },
    getAttributeIcon: function (id) {
      return this.$store.getters.getAttributeIcon(id);
    },
    getRarityIcon: function (id) {
      return this.$store.getters.getRarityIcon(id);
    },
    getZodiacIcon: function (id) {
      return getZodiacIcon(id)
    },
    getGenderIcon: function (id) {
      if (id==='all') return cdn+'label-all.png';
      var t = ['none','male', 'female'];
      return cdn+'ui/icon_sex_' + t[id] + '.png';
    },
    updateFilter(cat, opt) {
      if (opt!='all') {
        if (!this.limit) {
          if (!this.res[cat].includes(opt))
            this.res[cat].push(opt);
          else 
            this.res[cat].splice(this.res[cat].indexOf(opt), 1);
        } else {
          if (!this.res[cat].includes(opt))
            this.res[cat] = [opt];
          else
            this.res[cat] = [];
        }
      } else 
        if (this.res[cat].length)
          this.res[cat] = [];
        else
          this[cat].forEach( item => {if (item.id==='all') return; this.res[cat].push(item.id) });
    },
    updateSorting: function (id) {
      var r = this.sorter[0] === id ? !this.sorter[1] : false;
      this.sorter[0] = id;
      this.sorter[1] = r;
    },
    insideClick: function (e) {
        e.stopPropagation();
    },
    outOfBounds: function (e) {
        if (e.currentTarget===e.target)
          this.close();
    },
    close: function () {
      this.$emit('close');
    },
    setFilters: function () {
      this.$emit('save', this.filter, this.sorter);
    }
  },
  render: function () {
    return h('div',{class: 'filter-wrapper', style: {position: this.relative ? 'relative':'fixed'}, onClick: this.outOfBounds },[
      h('div',{class: 'filter-modal', style: {'max-width': this.relative?'100%':'90%', position: this.xy ? 'fixed':'relative', top: this.xy ? this.xy.top : null, left: this.xy ? this.xy.left:null, right: this.xy ? this.xy.right:null, bottom: this.xy ? this.xy.bottom:null}, onClick: this.insideClick},[
        h('div', {class: 'filter-columns'}, [
          [{list: this.attribute, cat: 'attribute', icon: 'getAttributeIcon'}, {list: this.role, cat: 'role', icon: 'getRoleIcon'}, {list: this.rarity, cat: 'rarity', icon: 'getRarityIcon'}, {list: this.zodiac, cat: 'zodiac', icon: 'getZodiacIcon'}, {list: this.sex, cat: 'sex', icon: 'getGenderIcon'}].map( (filter) => {
            return this.res[filter.cat] ? h('div', {style: {width: /* Temporary fix to firefox not calculating correctly */ Math.floor(filter.list.length/6)*5 +'em'}}, filter.list.map( (option,index) => {
                return h('div', {class: ['elements', {active: this.isActive(filter.cat, option.id)}], onClick: () => this.updateFilter(filter.cat, option.id) }, [
                  h('label', {class: 'custom-check', style: {margin: 0, 'pointer-events': 'none'}}, [
                    h('input', {type: 'checkbox', checked: this.isActive(filter.cat, option.id) }),
                    h('span', {class: 'checkmark'}),
                    filter.cat==='rarity'&&index>0 ? h('span', option.id) : null,
                    withDirectives(
                      h('img', {class: {'all-filter-label': index===0}, 'data-src': this[filter.icon](option.id), SameSite: 'Lax'}),
                      [ [lazyloader] ]
                    )
                  ])
                ])
              })) : null ;
          }),
          !this.hidesort ? h('div', {},
            this.sort.map(sorter => {
              return h('div', {class: ['elements noselect', {'active-sort': this.isActiveSorting(sorter.id)}], onClick: () => this.updateSorting(sorter.id)}, [
                this.isActiveSorting(sorter.id) ? h('i', {class: ['fas',  !this.sorter[1] ? 'fa-sort-down' : 'fa-sort-up'], style: {'vertical-align': this.sorter[1]?'sub':'top', 'margin-right': '0.2em'} }) : null,
                this.$tc(`strings.${sorter.name}`, 1)
              ])
            })
          ) : null
        ]),
        this.$slots.default ? h('div', {key: 'options', class: 'filter-options'}, [
          this.$slots.default()
        ]) : null
      ])
    ]);
  }
};
</script>

<style>
  .filter-wrapper {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 50;
  }
  .filter-wrapper * {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .filter-wrapper *::-webkit-scrollbar {
    display: none;
  }
  .filter-modal {
    /*width: 100%;*/
    max-width: 90%;
    /*height: 100%;*/
    overflow: scroll;
    max-height: 550px;
    background-color: black;
    color: #A1AEBD;
    margin: auto;
    border-radius: 10px;
    border: solid 2px #776048;
    z-index: 0;
    padding: 10px 0;
    font-size: 16px;
  }
  /*
  .filter-columns {
    height: 12.737em;
    font-size: 1.3em;
    overflow: scroll;
  }
  .filter-columns > div {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    overflow: hidden;
    padding: 0 10px;
    min-width: 5.5em;
  }
  */ 
  /* Flex columns wrap doesn't work as expected (bug?) using this hacky method */
  .filter-columns {
    height: 13.4em;
    font-size: 1.3em;
    display: block;
    white-space: nowrap;
    overflow-x: scroll;
    overflow-y: hidden;
  }
  .filter-columns > div {
    padding: 0 0.4em;
    min-width: 5.5em; /* Avoid layout shifts */
    display: inline-flex;
    writing-mode: vertical-lr;
    flex-wrap: wrap;
    align-content: flex-start;
    height: 100%;
  }
  .filter-columns > div:not(:last-child) {
    border-right: solid thin #776048;
  }
  .filter-columns .elements {
    min-width: 4.4em;
    writing-mode: horizontal-tb;
    padding: 0.1em 0.3em;
    border-radius: 0.4em;
    margin: 0.1em;
    white-space: nowrap;
    cursor: default;
  }
  .filter-columns .elements.active {
    background: #4CAF5066;
  }
  .filter-columns .elements.active-sort {
    background-color: #af804c66;
    color: white;
  }
  .filter-columns img {
    height: 1.25em;
    vertical-align: middle;
  }
  .filter-columns .all-filter-label {
    height: 1.3em; /* 1.5em */
  }
  .filter-modal .filter-options {
    margin: 10px;
    padding: 20px 10px 0;
    border-top: solid thin #776048;
  }
  
  
  .custom-check {
    position: relative;
    display: inline-block;
    /*color: var(--font-color);*/
    user-select: none;
    margin: 10px 0;
    padding-left: 1.8em;
  }
  .custom-check input[type="checkbox"] {
    display: none;
    position: absolute;
  }
  .custom-check .checkmark {
    position: absolute;
    left: 0;
    transition: all ease-out 0.2s;
    white-space: nowrap;
    height: 1.2em;
    width: 1.2em;
    background-color: #1e2126;
    border-radius: .4em;
    border: solid .1em #1b1c1c;
    box-shadow: inset .2em .2em .2em #00000094, .2em .2em .2em #00000094;
    top: 50%;
    transform: translateY(-50%);
  }
  .custom-check .checkmark::after {
    content: "";
    position: absolute;
    width: 0;
    height: 0.7em;
    border-bottom: 0.2em solid #4CAF50;
    border-left: 0.2em solid #4CAF50;
    /*top: 0;*/
    left: 50%;
    transform-origin: bottom left;
    transform: rotate(-45deg);
    opacity: 0;
    transition: all ease-out 0.2s;
  }
  .custom-check input:checked ~ .checkmark::after {
    opacity: 1;
    width: 1.2em;
  }

  .filter-modal .custom-check {
    color: #A1AEBD !important; 
  }
</style>