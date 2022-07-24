<template>
  
</template>

<script>
import sortHeroArray from '@/utils/sort-heroes.js'
export default {
  name: 'camping-manage',
  props: {
    mobile: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      required: false,
      default: true
    },
    roster: {
      type: Array
    },
    locked: {
      type: Array,
      default: function () {return []}
    },
    settings: {
      type: Object,
      required: false,
      default: function () {return {}}
    }
  },
  inject: ['accounts', 'profile','switchUser', 'newUser', 'deleteUser', 'editUser'],
  data: function () {
    return {
      myHeroes: [],
      lockedHeroes: [],
      sort: ['recent', false], // sort by, reverse?
      searchQuery: '',
      filters: {rarity: [], attribute: [], role: [], sex: []},
      lockedHeroesOnly: false,
      filterModal: false
    }
  },
  beforeCreate() {
  },
  created: function () {
  },
  watch: {
    locked: {
      deep: true,
      immeditate: true,
      handler: function() {this.lockedHeroes = this.locked}
    },
    roster: {
      deep: true,
      immeditate: true,
      handler: function() {this.myHeroes = this.roster}
    },
    mobile: function (/*o,n*/) {
      // close modals if layout switched
      this.filterModal=false;
    }
  },
  computed: {
    sortedList: function () {
      return sortHeroArray(this.myHeroes.slice(),this.sort[0],this.sort[1]); // from utils.js
    },
    chIconSize: function () {
      //(mobile) resize icons to fit screen;
      var dsize = 75;
      if (!this.mobile)
        return dsize;
      var w = this.$store.state.screenWidth-20, fsize = dsize*1.671; // 20 = container padding; 1.67 = icon padding + remove character icon ("x")
      //var r = w % fsize;
      var p = w / fsize;
      //if (r<=15)
      //  return dsize
      return ((w/Math.round(p)-0.5))/1.67;
    }
  },
  methods: {
    toggleFilterModal: function (e) {
      this.filterModal = !this.filterModal;
      if (e && !this.filterModal) return;
      var box = e.currentTarget.getBoundingClientRect();
      this.filterModalPosition = {
        top: box.bottom+3 + 'px',
        right: (window.innerWidth - box.right) + 'px'
      }
    },
    checkFilterHero: function (c) {
      if (this.lockedHeroesOnly && !this.lockedHeroes.includes(c)) return false;
      if (this.characterName(c).toLowerCase().indexOf(this.searchQuery.toLowerCase()) === -1) return false;

      const hero = this.$store.getters.getHero(c);
      for (var f in this.filters) {
        var v = this.filters[f];
        if (v.length && !v.includes(hero[f]))
          return false
      }
      return true
    },
    handleSearchBar: function (e) {
      this.searchQuery = e.target.value;
    },
    handleGoSearchBar: function () {
      if (this.searchQuery) {
        this.searchQuery = '';
        if (!this.mobile) document.getElementById('camp_managew_input').focus()
      }
    },
    setFilter: function (a,b) {
      if (b==='all') {
        this.filters[a] = [];
      } else
        if (this.filters[a].includes(b))
          this.filters[a] = [];
        else
          this.filters[a] = [b];
    },
    isActiveFilter: function (a, b, c) {
      if (b === 0) {
        return this.filters[a].length === 0;
      } else {
        return this.filters[a].includes(c);
      }
    },
    removeHero: function (id) {
      if (this.lockedHeroes.includes(id))
        this.lockedHeroes.splice(this.lockedHeroes.indexOf(id), 1);
      this.myHeroes.splice(this.myHeroes.indexOf(id), 1);
    },
    removeDisplayed: function () {
      this.myHeroes.slice().forEach(hero => { // .slice() so .forEach can continue correctly even after a element has been removed
        if (this.checkFilterHero(hero))
          this.removeHero(hero);
      });
    },
    lockHero: function (id) {
      if (this.lockedHeroes.includes(id)) {
        this.lockedHeroes.splice(this.lockedHeroes.indexOf(id), 1);
      } else if (this.lockedHeroes.length<4) {
        this.lockedHeroes.push(id);
      } else {
        this.$snackbar.show({type: 'error', title: 'Camping Error', description: 'Can\'t lock more than 4 heroes.'});
      }
    },
    characterName: function (id) {
      return this.$store.getters.getHero(id).name || '';
    },

    moreMenu: function (e) {
      e.stopPropagation();
      e.preventDefault();
      let box = (e.currentTarget || e.target).getBoundingClientRect();
      var customEventObject = { clientX: box.left, clientY: box.top+box.height }

      const getCurrentUser = () => {return this.accounts.filter(user => {return user.id = this.profile})[0]}

      this.$contextmenu( customEventObject , [
        {
          class: '',
          name: 'Test async alert',
          handler: () => this.$promiseAlert(
            'Test: Wait 10s for content to appear', 
            new Promise ( (resolve) => {
              setTimeout( () => {resolve('<div>Test returned 1</div>')},10000)
            }),
            ['Cancel']
          )
        },
        {
          class: 'fa fa-trash',
          name: this.$t('strings.remove_all_in_view'),
          color: 'red',
          handler: () => this.$promiseAlert(this.$t('strings.remove_all_in_view'),this.$t('strings.remove_all_in_view_confirm', [this.myHeroes.filter(hero => this.checkFilterHero(hero)).length, getCurrentUser().name]), [this.$t('strings.confirm'), this.$t('strings.cancel')]).then( ([res]) => {if (res === 0) this.removeDisplayed()}).catch(()=>{})
        },
        {
          class: 'fa fa-link',
          name: this.$t('strings.generate_export_url'),
          handler: () => this.$emit('generateUrl')
        },
        {
          class: 'fas fa-th',
          name: this.$t('strings.layout'),
          children: [
            {
              class: 'fa fa-check',
              name: this.$t('strings.ui_icons')
            }
          ]
        },
        {
          class: 'fa fa-user',
          name: this.$t('strings.roster'),
          children: [
            this.accounts.map( user => {
              return {
                class: user.id === this.profile ? 'fa fa-check' : null,
                name: user.name,
                children: [
                  {
                    class: 'fas fa-check-circle',
                    name: this.$t('strings.set_active_roster'),
                    handler: () => this.switchUser(user.id)
                  },
                  {
                    class: 'fa fa-user-edit',
                    name: this.$t('strings.rename_roster'),
                    handler: () => this.$callbackAlert(this.$t('strings.rename_roster'), '<div class="input-field"><input placeholder="name" required="true" value="'+ user.name + '"><label class="label">' + this.$t('strings.rename_roster') + '</label><span class="focus-bg"></span></div>', [this.$t('strings.confirm'), this.$t('strings.cancel')], (i, e, d, fu) => {
                      if (i === 0) {
                        if (!fu.checkInputs()) {return fu.preventClosing()}
                        let data = JSON.parse(JSON.stringify(user));
                        data.name = d.querySelector('input').value;
                        this.editUser(data)
                      }
                    })
                  },
                  {
                    class: 'fas fa-trash',
                    name: this.$t('strings.delete_roster'),
                    color: 'red',
                    handler: () => this.$promiseAlert(
                      this.$t('strings.delete_roster'),
                      'Are you sure you want to delete ' + user.name + '?',
                      [this.$t('strings.confirm'),this.$t('strings.cancel')]
                    ).then( ([answer]) => {
                        if (answer === 0) this.deleteUser(user.id)
                    })
                  }
                ]
              }
            }),
            {
              name: this.$t('strings.new_roster'),
              class: 'fa fa-user-plus',
              color: '#4caf50',
              handler: () => this.$callbackAlert(
                this.$t('strings.new_roster'),
                '<div class="input-field"><input placeholder="-" required="true"><label class="label">Roster name</label><span class="focus-bg"></span></div>',
                [this.$t('strings.confirm'), this.$t('strings.cancel')],
                (answer, event, doc, funz) => {
                  if (answer === 0) { /* First button */
                    if (!funz.checkInputs()) { /* check if required inputs have been field */
                      this.$snackbar.show({type: 'error', title: 'Roster name is required', description: 'Please fill in the input field.'});
                      return funz.preventClosing();
                    }
                    let name = doc.querySelector('input').value;
                    this.newUser({name: name, icon: ''})
                  }
                }
              )
            }
          ].flat()
        }
      ], {mobile: this.mobile })
    },
    heroContextmenu: function (e, hero) {
      let isLocked = this.locked.includes(hero);
      this.$contextmenu( e, [
        {
          class: 'far fa-heart',
          name: this.$t('strings.calculate_friendship'),
          handler: () => this.$emit('calculateFriendship', hero)
        },
        {
          class: isLocked ? 'fa fa-unlock' : 'fa fa-lock',
          name: this.$t(isLocked ? 'strings.unlock_hero' : 'strings.lock_hero'),
          handler: () => this.lockHero(hero)
        },
        {
          class: 'fas fa-link',
          name: this.$t('strings.view_model'),
          handler: () => window.open('https://www.e7vau.lt/portrait-viewer.html?id='+this.$store.getters.getHero(hero).id, '_blank').focus()
        },
        {
          class: 'fa fa-times',
          name: this.$t('strings.remove_hero'),
          color: 'red',
          handler: () => this.removeHero(hero)
        }
      ]);
    }
  },
  render: function (h) {
    return h('div', {style: {}}, [
      h('div', {staticClass: 'nav-camping-base'}, [
        
        h('div', {staticClass: 'nMobile-nav'}, [
          // h('button', {style: 'background-color: var(--icon-bar-active); cursor: default; color: white', directives: [{name: 'tooltip', value: 'Heroes in your Hero Box'}]},
          //   this.myHeroes.length
          // ),
          h('button', {on: {click: this.moreMenu }}, [
            h('i', {staticClass: 'fa fa-bars'})
          ]),
          h('div', {staticClass: 'nsearchbar'}, [
            h('input', {attrs: {id: 'camp_managew_input', autocomplete: 'off'}, domProps: {value: this.searchQuery, placeholder: this.$t('strings.search')}, on: {input: this.handleSearchBar}}),
            h('div', {staticClass: 'go', on: {click: this.handleGoSearchBar}, attrs: {tabindex: 0}}, [
              h('i', {staticClass: 'fa', class: {'fa-search': !this.searchQuery,'fa-times': this.searchQuery}})
            ])
          ]),
          h('button', {on: {click: this.toggleFilterModal }}, [
            h('i', {staticClass: 'fa fa-filter'})
          ])
        ]),
      ]),
      h('div', {staticClass: 'hero-list-box'}, [
        this.sortedList.map( (c) => {
          return h('hero-icon', {key: c, props: {size: this.chIconSize, hero: c, removable: true, selected: this.lockedHeroes.includes(c), showname: this.settings.showHeroName, showrarity: this.settings.showHeroRarity, showrole: this.settings.showHeroAttrRole}, on: {click: () => this.lockHero(c), remove: () => this.removeHero(c), contextmenu: e => this.heroContextmenu(e, c) }, style: {display: this.checkFilterHero(c) ? '' : 'none'} })
        })
      ]),
      h('filter-modal', {style: {'z-index': 100, display: this.filterModal ? '' : 'none'}, on: {close: this.toggleFilterModal, save: this.toggleFilterModal}, props: {res: this.filters, sorting: this.sort, extrasort: [{name: 'recent', id: 'recent'}], limit: 1, xy: this.filterModalPosition}}, [
        this.filterModal ? h('div', {}, [
          h('label', {staticClass: 'custom-check'}, [
            h('input', {attrs: {id: 'lockedHeroesOnlyCheckbox', type: 'checkbox', checked: this.lockedHeroesOnly}, on: {change: e => {this.lockedHeroesOnly = e.target.checked}  }}),
            h('span', {staticClass: 'checkmark'}),
            this.$t('strings.locked_heroes_only')
          ])
        ]) : null
      ])
    ])
  }
}
</script>

<style>

</style>