import { h } from 'vue'
import sortHeroArray from '@/utils/sort-heroes.js'
import filterModalComponent from '@/components/filter-modal.vue'
import HeroIcon from '@/components/hero-icon.vue'
export default {
  name: 'camping-heroes',
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
    heroes: {
      type: Array
    },
    roster: {
      type: Array
    },
    settings: {
      type: Object,
      required: false,
      default: function () {return {}}
    }
  },
  data: function () {
    return {
      myHeroes: [],
      sort: ['rarity', false], // sort by, reverse?
      filters: {rarity: [], attribute: [], role: [], sex: []},
      filterModal: false,
      searchQuery: '',
      filterModalPosition: {}
    }
  },
  beforeCreate() {
  },
  created: function () {
  },
  watch: {
    roster: {
      deep: true,
      immeditate: true,
      handler: function() {this.myHeroes = this.roster}
    }
  },
  computed: {
    sortedList: function () {
      return sortHeroArray(this.heroes.slice(),this.sort[0],this.sort[1]); // from utils.js
    },
    chIconSize: function () {
      //(mobile) resize icons to fit screen;
      var dsize = 75;
      if (!this.mobile)
        return dsize;
      var w = this.$store.state.screenWidth-20, fsize = dsize*1.32; // 20 = container padding; 1 (icon size) + 0.32 (padding) = icon padding
      var p = w / fsize;
      return ((w/Math.round(p)-0.5))/1.32;
    }
  },
  methods: {
    addHero: function (c) {
      this.myHeroes.push(c);
    },
    characterName: function (id) {
      return this.$store.getters.getHero(id).name;
    },
    toggleFilterModal: function (e) {
      this.filterModal = !this.filterModal;
      if (e && !this.filterModal) return;
      var box = e.currentTarget.getBoundingClientRect();
      this.filterModalPosition = {
        top: box.bottom+3 + 'px',
        right: (window.innerWidth - box.right) + 'px'
      }
    },
    handleSearchBar: function (e) {
      this.searchQuery = e.target.value;
    },
    handleGoSearchBar: function () {
      if (this.searchQuery) {
        this.searchQuery = '';
        if (!this.mobile) document.getElementById('camp_heroesw_input').focus()
      }
    },
    isInRoster: function (c) {
      return this.myHeroes.includes(c);
    },
    checkFilterHero: function (c) {
      const hero = this.$store.getters.getHero(c)
      if (this.isInRoster(c) || this.characterName(c).toLowerCase().indexOf(this.searchQuery.toLowerCase()) === -1) return false;
      for (var f in this.filters) {
        var v = this.filters[f];
        if (v.length && !v.includes(hero[f]))
          return false
      }
      return true
    },
    addAll: function () {
      this.heroes.slice().forEach(hero => { // .slice() so .forEach can continue correctly even after a element has been removed
        if (this.checkFilterHero(hero))
          this.addHero(hero);
      });
    },

    moreMenu: function (e) {
      e.stopPropagation();
      e.preventDefault();
      let box = (e.currentTarget || e.target).getBoundingClientRect();
      var customEventObject = { clientX: box.left, clientY: box.top+box.height }
      this.$contextmenu( customEventObject , [
        {
          class: 'fas fa-plus',
          name: this.$t('strings.add_all_in_view'),
          color: '#4caf50',
          handler: () => this.$promiseAlert(this.$t('strings.add_all_in_view'),this.$t('strings.add_all_in_view_confirm', [this.heroes.filter(hero => this.checkFilterHero(hero)).length, 'main']), [this.$t('strings.confirm'), this.$t('strings.cancel')]).then( ([res]) => {if (res === 0) this.addAll()}).catch(()=>{})
        },
        {
          class: 'fas fa-th',
          name: this.$t('strings.layout'),
          children: [
            {
              class: 'fas fa-check',
              name: this.$t('strings.ui_icons')
            }
          ]
        }
      ], {mobile: this.mobile})
    },
    heroContextmenu: function (e,hero) {
      //let heroData = this.$store.getters.getHero(hero);
      this.$contextmenu(e, [
        {
          class: 'far fa-heart',
          name: this.$t('strings.calculate_friendship'),
          handler: () => this.$emit('calculateFriendship', hero)
        },
        {
          class: 'fas fa-link',
          name: this.$t('strings.view_model'),
          handler: () => window.open('https://www.e7vau.lt/portrait-viewer.html?id='+this.$store.getters.getHero(hero).id, '_blank').focus()
        },
        {
          class: 'fas fa-plus',
          name: this.$t('strings.add_hero'),
          color: '#4caf50',
          handler: () => this.addHero(hero)
        }
      ])
    }
  },
  render: function () {
    return h('div', {style: {padding: '10px'}}, [
      h('div', {class: 'nav-camping-base'}, [
        h('div', {class: 'nMobile-nav'}, [
          // h('button', {style: 'background-color: transparent; cursor: default;', directives: [{name: 'tooltip', value: 'Number of heroes currently not in your Hero Box'}]},
          //   this.heroes.length - this.roster.length
          // ),
          h('button', {onClick: this.moreMenu }, [
            h('i', {class: 'fa fa-bars'})
          ]),
          h('div', {class: 'nsearchbar'}, [
            h('input', {id: 'camp_heroesw_input', autocomplete: 'off', value: this.searchQuery, placeholder: this.$t('strings.search'), onInput: this.handleSearchBar}),
            h('div', {class: 'go', onClick: this.handleGoSearchBar}, [
              h('i', {class: ['fa', !this.searchQuery ? 'fa-search' : 'fa-times'] })
            ])
          ]),
          h('button', {onClick: this.toggleFilterModal }, [
            h('i', {class: 'fa fa-filter'})
          ]),
          h('user-component', {style: 'display: none'})
        ])
      ]),
      /****************************** HERO BOX ******************************/
      h('div', {class: 'hero-list-box'}, [
        this.sortedList.map(c => {
          return h(HeroIcon, {key: c, hero: c, size: this.chIconSize, showname: this.settings.showHeroName, showrarity: this.settings.showHeroRarity, showrole: this.settings.showHeroAttrRole, onClick: () => this.addHero(c), onContext: e => this.heroContextmenu(e, c), style: {display: this.checkFilterHero(c) ? '' : 'none'} })
        })
      ]),
      /****************************** FILTER MODAL ******************************/
      h(filterModalComponent, {style: {'z-index': 100, display: this.filterModal ? '' : 'none'}, onClose: this.toggleFilterModal, save: this.toggleFilterModal, filter: this.filters, sorting: this.sort, hidesort: false, limit: 1, xy: this.filterModalPosition})
    ])
  }
}