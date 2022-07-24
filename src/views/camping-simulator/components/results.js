import teamSaver from './view-team.vue'
import paginationComponent from '@/components/pagination-component.vue'
export default {
  name: 'camping-results',
  components: {
    teamSaver
  },
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
    results: {
      type: Array,
      required: false,
      default: function () {
        return []
      }
    }
  },
  data: function () {
    return {
      focusedResult: null,
      page: 1,
      resultsEachPage: 25,
      saveTeam: null
    }
  },
  watch: {
    results: function () {
      this.focusedResult = null;
      this.page = 1;
    },
    page: function () {
      this.focusedResult = null;
      this.$el.scrollTo(0,0)
    }
  },
  beforeCreate() {
  },
  created: function () {
  },
  computed: {
  },
  methods: {
    saveTeamModal: function (e,team) {
      e.stopPropagation();
      this.saveTeam = team;
    },
    closeTeamModal: function () {
      this.saveTeam = null;
    },
    characterName: function (id) {
      return this.$store.getters.getHeroName(id);
    },
    changePage: function (i) {
      this.page=i;
    },
    mobileFocusTeam: function (i) {
      if (i===this.focusedResult)
        this.focusedResult = null;
      else
        this.focusedResult = i;
    }
  },
  render: function (h) {
    return h('div', {style: {'max-width': '800px', margin:'auto'}}, [
      this.mobile ? h('div', {style: {'text-align': 'center','font-style': 'italic'}}, 'Tap on a team to view camping topics') : null,
      h('table', {style: {width: '100%', 'text-align': 'center'}}, [
        h('thead', [
          h('th'),
          h('th', {attrs: {colspan: 4}}, this.$t('strings.team')),
          !this.mobile ? h('th', this.$t('strings.topics')) : null,
          h('th', this.$t('strings.morale'))
        ]),
        h('tbody', [
          this.results.slice((this.resultsEachPage*this.page)-this.resultsEachPage, this.resultsEachPage*this.page).map( (r, i) => {
            return [
              h('tr', {on: {click: () => this.mobileFocusTeam(i)}}, [
                h('td', {on: {click: (e) => this.saveTeamModal(e,r) }, style: {'padding-top': '30px','padding-bottom': '30px','text-align': 'center','cursor': 'pointer'}}, [
                  h('i', {staticClass: 'fa fa-save', style: {'font-size':'30px'}, attrs: {'aria-hidden': true}}),
                  h('div', i+1+(this.page-1)*this.resultsEachPage)
                ]),
                r.team.map( c => {
                  return h('td', [
                    h('hero-icon', {props: {hero: c, size: 60, hover: false}}),
                  ])
                }),
                !this.mobile ? h('td', {style: {'text-align': 'center','font-family': 'sans-serif','font-size': '16px'}}, [
                  h('div', this.characterName(r.holder[0]) + ': ' + this.$t(`strings.${r.topics[0]}`)),
                  h('div', this.characterName(r.holder[1]) + ': ' + this.$t(`strings.${r.topics[1]}`)),
                ]) : null,
                h('td', {style: {'text-align': 'center','font-family': 'sans-serif','font-size': '17px'}}, r.morale)
              ]),
              this.mobile && this.focusedResult === i ? h('tr', [
                h('td', {style: {'text-align': 'center','font-family': 'sans-serif','font-size': '16px'}, attrs: {colspan: '100%'}}, [
                  h('div', this.characterName(r.holder[0]) + ': ' + this.$t(`strings.${r.topics[0]}`)),
                  h('div', this.characterName(r.holder[1]) + ': ' + this.$t(`strings.${r.topics[1]}`))
                ])
              ]) : null
            ]
          })
        ])
      ]),
      h(paginationComponent, {props: {'total-pages': Math.ceil(this.results.length/25), 'total': this.results.length, 'per-page': 25, 'current-page': this.page}, on: {pagechanged: this.changePage} }),

      this.saveTeam ? h(teamSaver, {props: {camp: this.saveTeam, isnew: true}, on: {close: this.closeTeamModal}}) : null
    ])
  }
}