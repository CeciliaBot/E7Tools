<template>
    <div :class="['camping-window', {'horizontal-layout': !this.verticalToolbar}]">
        <ToolBar :tab="TAB" @set-tab="setWindow" :vertical="verticalToolbar" />
        <div class="main" ref="main_camp_view">
            <AddHero
                v-show="TAB==='add'"
                :list="displayableHeroes"
                :mobile="mobile"
                @add="addHero"
                @addAll="addAllHeroes"
            />
            <HeroBox
                v-show="TAB==='manage'"
                :list="roster"
                :locked="locked"
                :mobile="mobile"
                @lockHero="lockHero"
                @removeHero="removeHero"
            />
            <Advanced
                v-show="TAB==='advanced'"
                :advanced="advancedSettings"
                :roster="roster"
            />
            <RouteMaps
                v-show="TAB==='maps'"
            />
        </div>
    </div>
</template>

<script>
import ToolBar from './components/ToolBar.vue'
import AddHero from './components/AddHero.vue'
import HeroBox from './components/HeroBox.vue'
import Advanced from './components/AdvancedSettings.vue'
import RouteMaps from './components/RouteMaps.vue'

import ajax from '@/utils/ajax.js'
import parseUrlRoster from './util/url-parser.js'
export default {
    name: 'CampingSimulator',
    components: {
        ToolBar,
        AddHero,
        HeroBox,
        Advanced,
        RouteMaps
    },
    data() {
        return {
            VERSION: 1,              // Camping simulator version -> needed for data conversion of old savedata and other stuff
            TAB: 'welcome',
            settings: {},
            accounts: [],
            profile: {},             // current account
            heroList: [],            // List of characters available in the camping simulator

            /* User session */
            roster: [],              // User roster
            locked: [],              // Currently locked heroes
            teams: [],               // Saved teams
            advancedSettings: {},
            results: []
        }
    },
    computed: {
        HeroDB() {
            return this.$store.getters.getHeroDB;
        },
        verticalToolbar() {
            return this.settings.verticalToolbar || !this.$store.state.isMobile
        },
        mobile: function () {
            return !this.verticalToolbar
        },
        displayableHeroes: function () {
            return this.heroList.filter(c => {
                return !this.roster.includes(c)
            })
        }
    },
    created() {
        this.toggleLoading(true,'CONNECTING...');
        if (this.standalone) {
            console.log('Standalone version');
        }
        this.$nextTick( () => {
            this.getSettings();
            Promise.all([
                this.$store.dispatch('GET_HERO_DB'),
                ajax('./data/CampingData.json').then(data=>JSON.parse(data)).catch( () => {return []})
            ]).then(data => {
                this.heroList = Object.keys(data[1])
                for (var d in data[1]) { // Add camping data to HeroDB
                    for (var o in data[1][d]) {
                        data[0][d][o] = data[1][d][o];
                    }
                }
                parseUrlRoster(this);
            }).catch(err => {
                console.log(err);
            }).finally( () => {
                this.toggleLoading(false);
                this.booting = false;
                localStorage.setItem('CVERSION', this.VERSION);
            })
        })
    },
    methods: {
        toggleLoading(state, text) {
            this.$store.commit('loading', [state, text])
        },

        /* Read user settings or use default */
        getSettings() {
            let settings = localStorage.getItem('settings')
            let defaultSettings = {
                showHeroAttrRole: true
            }
            if (settings) {
                try {
                    this.settings = JSON.parse(settings);
                } catch (err) {
                    this.settings = defaultSettings;
                    console.log('error while reading camping settings');
                }
            } else {
                this.settings = defaultSettings;
            }
        },
        writeSettings: function () {
            localStorage.setItem( 'settings', JSON.stringify(this.settings) )
        },

        /* Toggle window */
        setWindow: function (id) {
            if (id === this.TAB) return;
            //this.$refs['main_camp_view'].scrollTo(0, 0);
            if (id==='home') {
                this.$store.commit('toggleMainMenu');
                return;
            }
            this.TAB = id;
            if (id==='calculate')
                this.calculateResults;
        },

        /* Manage Roster */
        addHero(hero) {
            this.roster.push(hero)
        },
        addAllHeroes() {
            this.displayableHeroes.forEach(hero => {
                this.addHero(hero)
            })
        },
        removeHero(hero) {
            this.roster.splice( this.roster.indexOf(hero), 1)
            if (this.locked.includes(hero))
                this.locked.splice( this.locked.indexOf(hero), 1)
        },
        lockHero(hero) {
            if (this.locked.includes(hero))
                this.locked.splice( this.locked.indexOf(hero), 1)
            else
                if (this.locked.length<4)
                    this.locked.push(hero)
                else this.$snackbar.log({title: 'Cant lock more than 4 heroes'})
        }
    }
}
</script>

<style src="./styles.css"></style>