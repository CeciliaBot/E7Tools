<script>
import characterSelection from '../../../components/character-select.vue';
var buffList = {
  "stic_debuf_impossible": {"name": "Immunity", "id": 12},
  "stic_att_up": {"name": "Attack up", "id": 1},
  "stic_att_up2": {"name": "Attack up (Greater)", "id": 44},
  "stic_def_up": {"name": "Defense up", "id": 2},
  "stic_speed_up": {"name": "Speed up", "id": 3},
  "stic_dodge_up": {"name": "Evasion", "id": 10},
  "stic_protect": {"name": "Barrier", "id": 5},
  "stic_cri_up": {"name": "Crit chance up", "id": 4},
  "stic_cridmg_up": {"name": "Crit damage up", "id": 9},
  "stic_crires_up": {"name": "Crit Resistance", "id": 40},
  "stic_invincible": {"name": "Invincibility", "id": 6},
  "stic_endure": {"name": "Skill nullifier", "id": 46},
  "stic_heal": {"name": "Continuous Healing", "id": 11},
  "stic_hide": {"name": "Stealth", "id": 15},
  "stic_immortality": {"name": "Immortality", "id": 14},
  "stic_reflect": {"name": "Reflect", "id": 13},
  "stic_counter": {"name": "Counter", "id": 7}
};
var debuffList = {
  "stic_def_dn": {"name": "Def down", "id": 18},
  "stic_speed_dn": {"name": "Speed down", "id": 19},
  "stic_att_dn": {"name": "Attack down", "id": 17},
  "stic_blind": {"name": "Blind", "id": 22},
  "stic_target": {"name": "Target", "id": 26},
  "stic_buf_impossible": {"name": "Unbuffable", "id": 29},
  "stic_heal_impossible": {"name": "Unhealable", "id": 27},
  "stic_stun": {"name": "Stun", "id": 20},
  "stic_provoke": {"name": "Provoke", "id": 25},
  "stic_silence": {"name": "Silence", "id": 28},
  "stic_sleep": {"name": "Sleep", "id": 21},
  "stic_blood": {"name": "Bleed", "id": 32},
  "stic_dot": {"name": "Poison", "id": 24},
  "stic_blaze": {"name": "Burn", "id": 31},
  "stic_vampire": {"name": "Vampire", "id": 23},
  "stic_bomb": {"name": "Bomb", "id": 53}
};

export default {
  name: 'camping-manage',
  components: {
    'character-selection': characterSelection
  },
  props: {
    mobile: {
      type: Boolean,
      default: false
    },
    advanced: {
      type: Object,
      required: true,
    },
    visible: {
      type: Boolean,
      required: false,
      default: true
    },
    roster: {
      type: Array,
      required: true
    },
    locked: {
      type: Array,
      default: function () {return []}
    }
  },
  data: function () {
    return {
      myHeroes: [],
      lockedHeroes: [],
      advancedSettings: this.advanced,

      characterSelect: undefined // or slot number
    }
  },
  beforeCreate() {
  },
  created: function () {
  },
  watch: {
    mobile: function () {
      //mmm
    },
    locked: function() {this.lockedHeroes = this.locked},
    roster: function() {this.myHeroes = this.roster},
    // advanced: {
    //   immediate: true,
    //   deep: true,
    //   handler: function () {
    //     console.log('advanced changed');
    //     this.advancedSettings = this.advanced;
    //   }
    // }
  },
  computed: {
  },
  methods: {
    getHeroName: function (id) {
      return this.$store.getters.getHeroName(id);
    },
    roleIcon: function (id) {
      return this.$store.getters.getRoleIcon(id);
    },
    attributeIcon: function (id) {
      return this.$store.getters.getAttributeIcon(id);
    },
    setCheckbox: function (key,checked) {
      if (checked)
        this.$set(this.advancedSettings, key, checked);
      else
        delete this.advancedSettings[key];
    },
    countActive: function (cat) {
      var i = 0,t = this.advancedSettings[cat];
      for (var key in t) {
        i += t[key]
      }
      return i;
    },
    setReqestedNumber: function (obj, key, val=1) { // val = +1 || -1, obj = role/attribute etc, key = fire/ice etc
      var t = this.advancedSettings[obj];
      if (!t)
        this.$set(this.advancedSettings,obj,{}),
        t=this.advancedSettings[obj];
      if (!t[key]) 
        if (val > 0) this.$set(t,key,0);
        else return;
      if (val > 0 && this.countActive(obj)>3-this.lockedHeroes.length) {
        this.$snackbar.show({type: 'info', title: 'Can\'t select more '+obj, description: 'Can\'t lock more than 4 elements for eache category.'});
        return;
      }
      this.$set(t,key,t[key]+val);
      if (t[key]<1) delete t[key];
    },
    addToArray: function (cat,elem) {
      var t=this.advancedSettings;
      if (!t[cat]) this.$set(t,cat,[]);
      t = t [cat];
      if (!t.includes(elem))
        t.push(elem);
      else {
        t.splice(t.indexOf(elem),1);
        if (!t[cat].length) delete t[cat]; // don't keep empty arrays -> they might slow down the worker
      }
    },
    lockATopic: function (e) {
      e.stopPropagation();
      e.preventDefault();
      let box = (e.currentTarget || e.target).getBoundingClientRect();
      var customEventObject = { clientX: box.left, clientY: box.top+box.height }
      let topics = ["Criticism","Reality Check","Heroic Tale","Comforting Cheer","Cute Cheer","Heroic Cheer","Sad Memory","Joyful Memory","Happy Memories","Unique Comment","Self-Indulgent","Occult","Myth","Bizarre Story","Food Story","Horror Story","Gossip","Dream","Advice","Complain","Belief","Interesting Story"].filter(topic => !(this.advancedSettings.lockedTopics || []).includes(topic))
      if (!topics.length) return;
      if (this.advancedSettings.lockedTopics && this.advancedSettings.lockedTopics.length===4 ) return;

      this.$contextmenu.show( customEventObject , topics.map(topic => {
        return {
          class: '',
          name: this.$t('strings.'+topic),
          handler: () => this.addToArray('lockedTopics', topic)
        }
      }), {mobile: true })
    },
    doesArrayInclude: function (cat,el) {
      if (!this.advancedSettings[cat] || !this.advancedSettings[cat].includes(el))
        return false;
      return true;
    },
    getCartesianSlot: function (n) {
      if (!this.advancedSettings.cartesianLock) this.$set(this.advancedSettings, 'cartesianLock', [[],[],[],[]]);
      return this.advancedSettings.cartesianLock[n];
    },
    openCartesianSelector: function (e,i) {
      e.preventDefault();
      e.stopPropagation();
      this.$set(this, 'characterSelect', i);
    },
    closeCartesianSelector: function () {
      this.characterSelect = undefined;
    }
  },
  render: function (h) {
    return h('div', {style: {display: this.visible?'block':'none'}}, [
      h('h1', [
        this.$t('strings.advanced_settings'),
        h('button', {staticClass: 'material-button stroked warn', style: 'float: right;', on: {click: () => this.advancedSettings = {}}, directives: [{name: 'ripple-effect'}]}, [
          h('span', this.$t('strings.reset_advanced'))
        ])
      ]),
      h('div', {style: {padding: '15px', 'background-color': 'black', 'border-radius': '10px', border: 'solid #776048', 'font-size': '18px', color: '#A1AEBD'}}, [
        [
          /*  object key     ,  translation key   */
          ['muteLockedHeroes','discard_if_held_by_locked'],
          ['lockedMatter','camp_locked_matter'],
          ['aoe','must_include_aoe'],
          ['noS1debuffs','no_s1_debuffs'],
          ['noDebuffs','no_debuffs'],
          ['includeDispel','must_include_dispel'],
          ['includeCleanser','must_include_cleanse']
        ].map(opt => {
          return h('div', [
            h('label', {staticClass: 'custom-check', style: {margin: 0} }, [
              h('input', {attrs: {type: 'checkbox', checked: this.advancedSettings[opt[0]]===true }, on: {change: (e) => this.setCheckbox(opt[0], e.target.checked) }}),
              h('span', {staticClass: 'checkmark'}),
              h('span', this.$t(`strings.${opt[1]}`) )
            ])
          ])
        })
      ]),
      h('div', {staticClass: 'advanced-settings-box'}, [
        h('h2', `Topics:`),
        h('i', 'Teams must include the following topics:'),
        h('div', [
          (this.advancedSettings.lockedTopics || []).map( topic => {
            return h('button', {key: 'locked-'+topic, staticClass: 'material-button stroked', on: {click: () => this.addToArray('lockedTopics', topic)}, directives: [{name: 'ripple-effect'}]}, [
              h('span', this.$t('strings.'+topic)+' '),
              h('i', {staticClass: 'fas fa-times'})
            ])
          }),
          h('button', {key: 'add-new-topic-lock', staticClass: 'material-button stroked primary', style: {display: (this.advancedSettings.lockedTopics || []).length<4 ? '':'none'}, on: {click: this.lockATopic}, directives: [{name: 'ripple-effect'}]}, [
            h('span', 'Lock a new topic')
          ])
        ])
      ]),
      h('div', {staticClass: 'advanced-settings-box'}, [
        h('h2', `${this.$tc(`strings.role`)}:`),
        [
          ['knight','knight'],
          ['warrior','warrior'],
          ['assassin','assassin'],
          ['ranger','ranger'],
          ['mage','mage'],
          ['manauser','manauser']
        ].map(role => {
          var q = (this.advancedSettings['role'] || {})[role[0]];
          return h('div', {staticClass: 'quantityBox noselect'}, [
            h('img', {attrs: {src: this.roleIcon(role[0])}, directives: [{name: 'lazyloader'}]}),
            h('div', [
              h('span', {style:{color:'red'}, on: {click: () => this.setReqestedNumber('role',role[0],-1) }},'-'),
              h('span', {style: {color: q ? '':'transparent'}},  q || '0'),
              h('span', {style:{color:'green'}, on: {click: () => this.setReqestedNumber('role',role[0],1) }},'+')
            ])
          ]);
        }),
        h('div', [
          h('label', {staticClass: 'custom-check', style: {margin: 0}, on: {change: (e) => this.setCheckbox('fixedNumberOfRoles', e.target.checked) } }, [
            h('input', {attrs: {type: 'checkbox', checked: this.advancedSettings['fixedNumberOfRoles'] }}),
            h('span', {staticClass: 'checkmark'}),
            h('span', this.$t(`strings.must_be_exact_number_of`, {item: this.$tc(`strings.role`,2)}))
          ])
        ])
      ]),
      h('div', {staticClass: 'advanced-settings-box'}, [
        h('h2', `${this.$tc(`strings.attribute`)}:`),
        [
          ['fire','Fire'],
          ['ice','Ice'],
          ['wind','Earth'],
          ['dark','Dark'],
          ['light','Light']
        ].map(role => {
          var q = (this.advancedSettings['attribute'] || {})[role[0]];
          return h('div', {staticClass: 'quantityBox noselect'}, [
            h('img', {attrs: {src: this.attributeIcon(role[0])}, directives: [{name: 'lazyloader'}] }),
            h('div', [
              h('span', {style:{color:'red'}, on: {click: () => this.setReqestedNumber('attribute',role[0],-1) }},'-'),
              h('span', {style: {color: q ? '':'transparent'}, domProps: {innerHTML: q || '0'}}),
              h('span', {style:{color:'green'}, on: {click: () => this.setReqestedNumber('attribute',role[0],1) }},'+')
            ])
          ]);
        }),
        h('div', [
          h('label', {staticClass: 'custom-check', style: {margin: 0}, on: {change: (e) => this.setCheckbox('fixedNumberOfAttributes', e.target.checked) } }, [
            h('input', {attrs: {type: 'checkbox', checked: this.advancedSettings['fixedNumberOfAttributes'] }}),
            h('span', {staticClass: 'checkmark'}),
            h('span', this.$t(`strings.must_be_exact_number_of`, {item: this.$tc(`strings.attribute`,2)}))
          ])
        ])
      ]),
      h('div', {staticClass: 'advanced-settings-box'}, [
        h('h2', `${this.$tc(`strings.buff`, 2)}:`),
        Object.keys(buffList).map( buff => {
          return h('div', {staticClass: 'buff-debuff-check noselect', class: {enabled: this.doesArrayInclude('buffs', buffList[buff].id)}, on: {click: () => this.addToArray('buffs', buffList[buff].id) } }, [
            //this.doesArrayInclude('buffs', buffList[buff].id) ? h('div', {staticClass: 'activeBuff animate'},'✓') : null,
            h('img', {attrs: {src: 'https://assets.epicsevendb.com/buff/' + buff + '.png'}, directives: [{name: 'lazyloader'}]}),
            h('p', this.$t(`strings.${buff}`))
          ])
        })
      ]),
      h('div', {staticClass: 'advanced-settings-box'}, [
        h('h2', `${this.$tc(`strings.debuff`, 2)}:`),
        Object.keys(debuffList).map( debuff => {
          return h('div', {staticClass: 'buff-debuff-check noselect', class: {enabled: this.doesArrayInclude('debuffs', debuffList[debuff].id)}, on: {click: () => this.addToArray('debuffs', debuffList[debuff].id) } }, [
            h('img', {attrs: {src: 'https://assets.epicsevendb.com/buff/' + debuff + '.png'}, directives: [{name: 'lazyloader'}]}),
            h('p', this.$t(`strings.${debuff}`))
          ])
        })
      ]),
      h('div', {staticClass: 'advanced-settings-box'}, [
        h('h2', `${this.$t(`strings.camp_multilock`)}:`),
        [0,1,2,3].map( i => {
          return h('div', {staticClass: 'multilock-slot', on: {click: (e) => this.openCartesianSelector(e,i)}}, [
            h('h3', {attrs: {title: 'Add to this slot'}}, [
              this.$t('strings.camp_multi_slot', {n: i+1}),
              h('i', {staticClass: 'fa fa-pencil-alt', style: {float: 'right', 'line-height': '28px', 'padding-right': '5px'}})
            ]),
            h('div', [
              this.getCartesianSlot(i).map( hero => {
                return h('div', {staticClass: 'cartesian-element'}, this.getHeroName(hero))
              })
            ])
          ])
        })
      ]),
      this.characterSelect===undefined ? null : h('character-selection', {on: {close: () => this.closeCartesianSelector()}, props: {title: this.$t('strings.camp_multi_slot', {n: this.characterSelect+1}), description: this.$t('strings.camp_multi_slot_desc'), list: this.myHeroes, selected: this.getCartesianSlot(this.characterSelect), mobile: this.mobile }})
    ])
  }
};
</script>
<style scoped>
  .advanced-settings-box {
    text-align: center;
    background-color: var(--background-color-tertiary);
    border-radius: 10px;
    margin: 10px 0;
    padding: 10px;
  }
  .advanced-settings-box h2 {
    text-align: center;
  }
  .quantityBox {
    display: inline-block;
    width: 80px;
    text-align: center;
    margin: 10px;
  }
  .quantityBox > img {
    display: block;
    margin: auto;
    width: 75%;
  }
  .quantityBox > div {
    width: 100%;
    overflow: hidden;
    border-radius: 10px;
  }
  .quantityBox > div > span {
    display: inline-block;
    width: 33%;
    background-color: var(--background-modifier-darken-alpha);
  }
  .buff-debuff-check {
    position: relative;
    cursor: pointer;
    display: inline-flex;
    flex-direction: column;
    width: 120px;
    padding: 12px;
  }
  .buff-debuff-check:after {
    content: "✓";
    position: absolute;
    left: 14%;
    top: 0;
    display: inline-block;
    height: 1.8em;
    width: 1.8em;
    transition-duration: 0.4s;
    transform: scale(0);
    text-align: center;
    line-height: 1.8em;
    z-index: 1;
    background-color: green;
    color: white;
    border-radius: 50%;
  }
  .buff-debuff-check.enabled:after {
    transform: scale(1);
  }
  .buff-debuff-check img {
    width: 60px;
    height: 60px;
    margin: auto;
  }
  .buff-debuff-check p {
    text-align: center;
    margin: 16px 0;
  }
  .multilock-slot {
    display: inline-block;
    vertical-align: top;
    width: 25%;
    max-width: 200px;
    min-width: 150px;
    margin: 5px;
    background-color: var(--background-color-primary);
    border-radius: 4px;
  }
  .multilock-slot > h3 {
    font-weight: normal;
    background-color: var(--background-modifier-darken-alpha);
    cursor: pointer;
    border-radius: 4px 4px 0 0;
    border-bottom: solid thin white;
  }
  .multilock-slot > div {
    height: 230px;
    overflow: scroll;
    overscroll-behavior: contain;
  }
  .cartesian-element {
    height: 30px;
    line-height: 30px;
    background-color: #0006;
    border-radius: 0 5px 5px;
    margin: 2px;
  }
  @media (hover: hover) {
    .multilock-slot > h3:hover {
      color: red;
    }
  }
</style>