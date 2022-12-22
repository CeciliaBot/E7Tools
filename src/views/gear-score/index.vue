<script> /* Old version port, need some upgrades */
import { h } from 'vue'
import MobileFloatingMenu from '@/components/mobile-floating-menu.vue'
import Multiselect from '@vueform/multiselect'
//import GearSubsResult from './SubstatsRollGraph.vue'

import { score } from '@/utils/gear-utils.js'; 

var subs = [
  {
    name: 'spd',
    type: 'spd'
  },
  {
    name: 'atk',
    type: 'atk'
  },
  {
    name: 'atk_rate',
    type: 'atkRate'
  },
  {
    name: 'def',
    type: 'def'
  },
  {
    name: 'def_rate',
    type: 'defRate'
  },
  {
    name: 'hp',
    type: 'hp'
  },
  {
    name: 'hp_rate',
    type: 'hpRate'
  },
  {
    name: 'crit_rate',
    type: 'cr'
  },
  {
    name: 'crit_dmg',
    type: 'cd'
  },
  {
    name: 'eff',
    type: 'eff'
  },
  {
    name: 'efr',
    type: 'efr'
  },
];

export default {
  name: 'gear-score',
  components: {
  },
  data: function () {
    return {
      userStats: [{},{},{},{}]
    }
  },
  computed: {
    notSelected: function () {
        return this.subs.filter(sub=> {return !this.userStats.some(u=> u.type===sub.type)});
    },
    subs: function () {
        return subs.map( el => {
            return {
                name: this.$t(`strings.${el.name}`),
                type: el.type
            }
        })
    },
    score: function () {
        return score(this.userStats);
    }
  },
  methods: {
    resetForm: function () {
        this.userStats = [{},{},{},{}];
    },
    setGearSub: function (i, key, val) {
        console.log(i, key, val)
        this.userStats[i][key] = val;
    }
  },
  beforeUnmount: function () {
  },
  render: function () {
    return h('div', {style: {color: 'var(--font-color)', width: '100%', 'max-width': '600px', margin: 'auto', 'padding-top': '20px'}}, [
      //h(GearSubsResult, {rolls: this.userStats}),
      h(MobileFloatingMenu,{options: [{title: 'Home', class: 'fa fa-home', click: 'home'}], onHome: ()=>this.$store.commit('toggleMainMenu') }),
      [0,1,2,3].map( i => {
        return h('div', {style: {margin: '5px', display: 'flex'}}, [
          h(Multiselect, {
            key: `multiselect-${i}`,
            options: this.notSelected,
            onChange: (option) => {this.setGearSub(i,'type',option.type),this.setGearSub(i,'name',option.name)},
            value: this.userStats[i].name?this.userStats[i] : undefined,
            'value-prop': "type",
            object: true,
            'track-by': 'name',
            label: 'name',
            placeholder: this.$t('strings.gear_select_substat'),
            searchable: true,
            required: false,
            style: {flex: '1.3'},
            class: 'multiselect-styling'
          }),
          h('input', {key: 'input_val-'+i, type: 'number', placeholder: 0, onKeyup: (e) => {console.log(e), this.setGearSub(i,'value',e.target.value||0)}, style: {'font-size': '16px', height: '40px', 'border-radius': '8px', border: 'none', padding: '5px 10px', 'vertical-align': 'bottom', flex: 0.7 } })
        ])
      }),
      h('div', {style: {'text-align': 'center', margin: '30px 0', color: 'white'}}, [
        h('span', {style: {'background-color': 'var(--icon-bar-active)', height: '60px', display: 'inline-block', width: '100px', 'font-size': '32px', 'line-height': '60px', 'border-radius': '15px'}}, Math.round(this.score.score)),
      ]),
      h('div',{style: {display: 'flex', 'justify-content': 'space-around'}}, [
        h('span', `${this.$t('strings.gear_dscore')}: ${Math.round(this.score.dScore)}`),
        h('span', `${this.$t('strings.gear_sscore')}: ${Math.round(this.score.sScore)}`),
        h('span', `${this.$t('strings.gear_cscore')}: ${Math.round(this.score.cScore)}`),
      ])
    ]);
  }
}
</script>
<style src="@vueform/multiselect/themes/default.css"></style>
<style>
  .multiselect-styling {
    color: white;
    --ms-font-size: 1.4rem;
    --ms-option-font-size: 1.4rem;
    --ms-max-height: 20rem;

    --ms-bg: var(--background-modifier-darken-alpha);

    --ms-dropdown-bg: var(--background-color-tertiary)
  }
</style>