<template>
    <div ref="loading-screen" class="loading-camping-box" style="display: none;">
        <div class="loading-camping-content">
            <div class="infinite-loading-wrapper">
                <div class="infinite-loading" />
            </div>
            <div ref="percentage_status_text">0%</div>
            <img src="https://cdn.glitch.com/5c21c869-ea9a-48ba-b019-90cd493f45cd%2Fangienobg.gif?v=1585008523656" style="height: 171px" />
        </div>
        <button class="material-button basic warn" @click="promptAbortOperation" v-ripple-effect>
            <span>{{ $t('strings.abort_operation') }}</span>
        </button>
    </div>

    <div :class="['camping-window', {'horizontal-layout': !this.verticalToolbar}]">
        <ToolBar
            :tab="TAB" 
            @set-tab="setWindow"
            :vertical="verticalToolbar"
            :standalone="standalone"
        />
        <div class="main" ref="main_camp_view">
            <div class="full-size" v-show="TAB==='welcome'">
                <Welcome />
            </div>
            <div class="full-size" v-show="TAB==='add'">
                <AddHero
                    :list="displayableHeroes"
                    :settings="settings"
                    :mobile="mobile"
                    @add="addHero"
                    @addAll="addAllHeroes"
                    @calculate-friendship="calculateHeroFriendship"
                />
            </div>
            <div class="full-size" v-show="TAB==='manage'">
                <HeroBox
                    :list="roster"
                    :locked="locked"
                    :settings="settings"
                    :mobile="mobile"
                    @lock="lockHero"
                    @remove="removeHero"
                    @removeAll="removeAllHeroes"
                    @exportURL="generateExportURL"
                    @calculate-friendship="calculateHeroFriendship"
                />
            </div>
            <div class="full-size" v-show="TAB==='advanced'">
                <Advanced
                    :advanced="advancedSettings"
                    :roster="roster"
                    @reset="advancedSettings = {}"
                />
            </div>
            <div class="full-size" v-show="TAB==='results'">
                <Results
                    :teams="teams"
                    :results="results"
                    @save-team="saveCamp"
                />
            </div>
            <div class="full-size" v-if="TAB==='usage-stats'">
                <TeamAndCharacterUsage
                    :available-heroes="heroList"
                    @save-team="saveCamp"
                />
            </div>
            <div class="full-size" v-show="TAB==='teams'">
                <SavedTeams
                    :teams="teams"
                    @delete-team="deleteCamp"
                />
            </div>
            <div class="full-size" v-show="TAB==='maps'">
                <RouteMaps  />
            </div>
            <div class="full-size" v-show="TAB==='settings'">
                <Settings
                    :settings="settings"
                    @welcome="TAB='welcome'"
                    @exportURL="generateExportURL"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { toRaw } from 'vue'

import ToolBar from './components/ToolBar.vue'
import Welcome from './components/WelcomeComponent.vue'
import AddHero from './components/AddHero.vue'
import HeroBox from './components/HeroBox.vue'
import Advanced from './components/AdvancedSettings.vue'
import Results from './components/ResultsPage.vue'
import RouteMaps from './components/RouteMaps.vue'
import SavedTeams from './components/SavedTeams.vue'
import TeamAndCharacterUsage from './components/TeamAndHeroUsage.vue'
import Settings from './components/Settings.vue'

import ajax from '@/utils/ajax.js'
import parseUrlRoster from './util/url-parser.js'
import { generateUrl } from './util/export-link.js'
import SendTeamDataUsage from './util/send-team-usage.js'
import {newWorker, terminateWorker, restartWorker, camperinoCalculate} from './worker/index.js'
import { fallbackTheme } from '@/utils/theme.js'

// this should be removed once the locale plugin has been fully enabled
import { getUserLocaleCode, loadLocaleMessagesAsync } from '@/i18n.js'

export default {
    name: 'CampingSimulator',
    components: {
        ToolBar,
        Welcome,
        AddHero,
        HeroBox,
        Advanced,
        Results,
        SavedTeams,
        RouteMaps,
        TeamAndCharacterUsage,
        Settings
    },
    props: {
        standalone: {
            type: Boolean,
            default: false
        }
    },
    provide() {
        return {
            VERSION: this.VERSION,
            standalone: this.standalone
        }
    },
    data() {
        return {
            VERSION: 2.09,           // Camping simulator version -> needed for data conversion of old savedata and other stuff
            isBooting: true,
            TAB: 'welcome',
            settings: {},
            HeroDB: {},
            heroList: [],            // List of characters available in the camping simulator
            displayableHeroes: [],   // Heroes in the add tab

            /* User session */
            roster: [],              // User roster
            locked: [],              // Currently locked heroes
            teams: [],               // Saved teams

            advancedSettings: {},
            results: []
        }
    },
    watch: {
        // TAB() {
        //     if (this.TAB === 'results')
        //         this.calculateResults
        // },
        settings: {
            deep: true,
            handler () {
                if (!this.isBooting) this.writeSettings()
            }
        },
        teams: {
            deep: true,
            handler() {
                if (!this.booting) this.writeStorageTeams()
            }
        },
        roster: {
            deep: true,
            handler(a,b) {
                if (a!==b) { // array has changed maybe url roster or boot operation
                    // Set the add hero list tab (remove what's in the roster)
                    var all = this.heroList.slice();
                    this.roster.forEach(hero => {
                        var index = all.indexOf(hero);
                        if (index!==-1)
                            all.splice(index, 1)
                    })
                    this.displayableHeroes = all;
                }
                if (!this.booting) this.writeStorageRoster()
            }
        }
    },
    computed: {
        verticalToolbar() {
            return this.settings.verticalToolbar || !this.$store.state.isMobile
        },
        mobile: function () {
            return !this.verticalToolbar
        },
        calculateResults: function () {
            //this.results = [];
            this.roster.length
            this.locked.length
            this.advancedSettings.update_at
            if (this.roster.length>3) {
                this.calculate()
            }
            return 1;
        }
    },
    beforeCreate() {
        newWorker()
    },
    beforeUnmount: function () {
        terminateWorker()
    },
    created() {
        this.toggleLoading(true,'CONNECTING...');
        if (this.standalone) {
            console.log('Standalone version');
        }
        this.getSettings();
        this.$nextTick( () => {
            Promise.all([
                this.$store.dispatch('GET_HERO_DB'),
                ajax('./data/CampingData.json').then(data=>JSON.parse(data)).catch( () => {return []}),
                loadLocaleMessagesAsync(getUserLocaleCode())
            ]).then(data => {
                this.heroList = Object.keys(data[1])
                for (var d in data[1]) { // Add camping data to HeroDB
                    for (var o in data[1][d]) {
                        data[0][d][o] = data[1][d][o];
                    }
                }
                localStorage.setItem('CAMPING_LAST_SEEN_HERO', this.heroList[this.heroList.length-1])
                this.HeroDB = data[0]
                this.readStorageTeams()
                this.readStorageRoster()

                parseUrlRoster(this.heroList.slice(), this);
            }).catch(err => {
                console.log(err);
            }).then( () => {
                this.toggleLoading(false);
                this.isBooting = false;
                localStorage.setItem('CAMPING_VERSION', this.VERSION);
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
                showHeroAttrRole: true,
                theme: fallbackTheme()
            }
            if (settings) {
                try {
                    this.settings = JSON.parse(settings);
                    !this.settings.theme ? this.settings.theme = defaultSettings.theme : null
                } catch (err) {
                    this.settings = defaultSettings;
                }
            } else {
                this.settings = defaultSettings;
            }
            document.querySelector('html').setAttribute('data-theme', this.settings.theme)
        },
        writeSettings: function () {
            localStorage.setItem( 'settings', JSON.stringify(this.settings) )
        },
        readStorageRoster() {
            var c = localStorage.getItem('CAMPING_ROSTER');
            var roster = [];
            if (!c) {
                try { // get from old ceciliabot 1.0 -> convert and delete old data
                    var oldRoster = localStorage.getItem('Heroes')
                    if (oldRoster) {
                        oldRoster = JSON.parse(oldRoster)
                        if (oldRoster instanceof Object) {
                            roster = Object.keys(oldRoster).filter(hero => hero !== 'dark-tyrant-tenebria')
                        } else if (Array.isArray(oldRoster))
                            roster = oldRoster.filter(hero => hero !== 'dark-tyrant-tenebria')
                    }
                    localStorage.removeItem('Heroes')
                    localStorage.removeItem('avatars') // remove useless items
                    this.writeStorageRoster(roster)
                } catch(err) {
                    console.log('Error while parsing')
                }
            } else {
                roster = JSON.parse(c)
            }
            this.roster = roster
        },
        writeStorageRoster(roster) {
            localStorage.setItem('CAMPING_ROSTER', JSON.stringify( roster || this.roster ))
        },
        readStorageTeams() {
            var teams = localStorage.getItem('CAMPING_TEAMS')
            if (!teams) { // get from old ceciliabot 1.0 -> convert and delete old data
                try {
                    var oldObject = JSON.parse(localStorage.getItem('savedCamps') || '{}')
                    var res = [];
                    for (var name in oldObject) {
                        var old = oldObject[name],
                            gameMode = [];
                        if (old.hell)
                            gameMode.push('azmakalis_hell');
                        if (old.normal)
                            gameMode.push('azmakalis_normal');
                        res.push({
                            _type: 'morale',
                            name: name,
                            morale: old.morale,
                            team: old.team || [],
                            holder: [old.migliorPG1, old.migliorPG2],
                            topics: [old.opzioneMigliore1, old.opzioneMigliore2],
                            gameMode: gameMode,
                            enemy: ['queen', 'vera', 'arakahan', 'juleeve', 'karkanis'].filter(enemy => old[enemy]),
                            uploaded: false,
                            converted: true,
                            version: this.VERSION
                        })
                    }
                    this.teams = res;
                    localStorage.removeItem('savedCamps')
                    this.writeStorageTeams(res)
                } catch(err) {
                    console.log('Old temas parsing error')
                }
            } else {
                this.teams = JSON.parse(teams)
            }
        },
        writeStorageTeams(teams) {
            localStorage.setItem('CAMPING_TEAMS', JSON.stringify( teams || this.teams ))
        },

        /* Toggle window */
        setWindow: function (id) {
            if (id === this.TAB) return;
            // if (window.scrollTo)
            //     this.$refs['main_camp_view'].scrollTo(0, 0);
            if (id==='home') {
                this.$store.commit('toggleMainMenu');
                return;
            }
            this.TAB = id;
            if (id==='results')
                this.calculateResults;
        },

        /* Manage Roster */
        addHero(hero) {
            this.roster.push(hero)
            this.displayableHeroes.splice(this.displayableHeroes.indexOf(hero), 1)
        },
        addAllHeroes(list) {
            list.forEach(hero => {
                this.addHero(hero)
            })
        },
        removeHero(hero) {
            this.roster.splice( this.roster.indexOf(hero), 1)
            this.displayableHeroes.push(hero)
            if (this.locked.includes(hero))
                this.locked.splice( this.locked.indexOf(hero), 1)
        },
        removeAllHeroes(list) {
            list.forEach(hero => this.removeHero(hero))
        },
        lockHero(hero) {
            if (this.locked.includes(hero))
                this.locked.splice( this.locked.indexOf(hero), 1)
            else
                if (this.locked.length<4)
                    this.locked.push(hero)
                else this.$snackbar.log({title: 'Cant lock more than 4 heroes'})
        },
        saveCamp(camp) {
            camp.version = this.VERSION
            this.teams.push(camp)
            camp = this.teams[this.teams.length-1];
            SendTeamDataUsage(camp, true).then( () => {
                //
            }).catch( () => {
                camp.uploaded = false
                this.writeStorageTeams()
            })
        },
        deleteCamp(camp) {
            var index = this.teams.indexOf(camp)
            if (index!==-1) {
                SendTeamDataUsage(camp).then( () => {
                    //
                }).catch( () => {
                    //
                })
                this.teams.splice(index, 1)
            }
        },

        generateExportURL() {
            generateUrl(this.roster, this.heroList, this)
        },

        showSpinner: function (state) { /* Angelica eating popcorns */
            var d = this.$refs['loading-screen'];
            if (state)
                d.style.display = '';
            else
                d.style.display = 'none';
            },
            displayStyle: function (id) {
            if (id === this.activeTab)
                return '';
            return 'none';
        },
        updateSpinner(text) {
            this.$refs.percentage_status_text.innerText = text
        },
        promptAbortOperation() {
            this.$promiseAlert(
                this.$t('strings.abort_operation'),
                'Are you sure?',
                [this.$t('strings.confirm'), this.$t('strings.cancel')]
            ).then( ([answer]) => {
                if (answer === 0) {
                    restartWorker()
                    this.showSpinner(false)
                    this.updateSpinner('0%')
                    this.advancedSettings.update_at = Date.now()
                }
            }).catch(()=>{})
        },

        calculate() {
            this.results = [];
            this.showSpinner(true)
            camperinoCalculate(
                {
                    message: 'MORALE',
                    HeroDB: toRaw(this.HeroDB),             // using to raw to get the proxy's value -> worker can't copy proxy directly
                    roster: toRaw(this.roster),
                    locked: toRaw(this.locked),
                    advanced: toRaw(this.advancedSettings)
                },
                (update) => {
                    this.updateSpinner(update+'%')
                }
            ).then(res => {
                this.results = res;
            }).catch(err => {
                console.log('Camping results error', err);
                this.$snackbar.error({title: 'Worker error', description: this.$t('strings.'+err)});
            }).then( () => {
                this.showSpinner(false);
                this.updateSpinner('0%')
            });
        },

        calculateHeroFriendship(hero) {
            this.results = [];
            this.showSpinner(true)
            this.TAB = 'results'
            camperinoCalculate(
                {
                    message: 'FRIENDSHIP',
                    HeroDB: toRaw(this.HeroDB),
                    roster: toRaw(this.roster),
                    locked: [hero],
                },
                (update) => {
                    this.updateSpinner(update+'%')
                }
            ).then(res => {
                console.log(res)
                this.results = res;
            }).catch(err => {
                console.log('Camping results error', err);
                this.$snackbar.error({title: 'Worker error', description: this.$t('strings.'+err)});
            }).then( () => {
                this.showSpinner(false);
                this.updateSpinner('0%')
            })
        }

    },
    beforeRouteLeave: function() {
        document.querySelector('html').removeAttribute('data-theme')
    }
}
</script>

<style src="./styles.css"></style>
<style scoped>
    .full-size {
        height: 100%;
        width: 100%;
    }
</style>