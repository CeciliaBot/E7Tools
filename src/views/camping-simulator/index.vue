<template>
    <div :class="['camping-window', {'horizontal-layout': !this.verticalToolbar}]">
        <Toolbar :tab="TAB" @set-tab="setWindow" :vertical="verticalToolbar"/>
        <div class="main" ref="main_camp_view">
            <Welcome v-show="TAB==='welcome'" />
            <Heroes v-show="TAB==='add'" :heroes="heroList" :roster="roster" />
            <Manage v-show="TAB==='manage'" :roster="roster" :locked="locked" />
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'
import {getAccounts, setCurrentAccount, /*newAccount, deleteAccount, editAccount,*/  getRoster, writeRoster, getTeams/*, writeTeams,*/} from './utils/manage-data.js';
import {cleanUrl,/* generateUrl,*/ decodeLink, decodeOldLink} from './utils/exportLink.js'
import {newWorker, terminateWorker, restartWorker, camperinoCalculate} from './worker/index.js'

import ToolbarComponent from './components/toolbar.vue'
import WelcomeComponent from './components/welcome.vue'
import HeroesComponent from './components/heroes.js'
import ManageComponent from './components/manage2.vue'

import ajax from '@/utils/ajax.js'
export default {
    name: 'CampingSimulator',
    components: {
        Toolbar: ToolbarComponent,
        Welcome: WelcomeComponent,
        Manage: ManageComponent,
        Heroes: HeroesComponent
    },
    props: {
        standalone: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    provide() {
        return {
            standalone: this.standalone,
            settings: computed( () => this.settings ),
            accounts: computed( () => this.accounts ),
            profile: computed( () => this.profile )
        }
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
    beforeCreate() {
        newWorker();
    },
    beforeUnmount() {
        terminateWorker();
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
        },
        calculateResults: function () {
            this.advancedSettings, this.roster, this.locked; // add reactivity to calculateResults()
            if (this.roster.length>3) {
                this.calculate()
            }
            return 1;
        }
    },
    watch: {
        profile: async function () {
            this.toggleLoading(true);
            this.advancedSettings = {};
            setCurrentAccount(this.profile); //imported method
            await getRoster(this.profile, this.VERSION)
            .then(roster => {
                this.roster = roster;
                this.locked = [];
            })
            .catch(err => {
                console.warn(err);
                console.log('Error while getting roster', err);
            }).finally( () => {
                this.toggleLoading(false);
            })
            getTeams(this.profile, this.VERSION).then(teams => {
                this.teams = teams;
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
            getAccounts(this.VERSION).then( async ([accounts, profile]) => {
                this.profile = profile;
                this.accounts = accounts;
            }).catch(err => {
                console.log(err);
            })

            Promise.all([
                this.$store.dispatch('GET_HERO_DB'),
                ajax('./data/CampingData.json').then(data=>JSON.parse(data))
            ]).then(data => {
                this.heroList = Object.keys(data[0])
                for (var d in data[1]) { // Add camping data to HeroDB
                    for (var o in data[1][d]) {
                        data[0][d][o] = data[1][d][o];
                    }
                }
                this.parseUrlRoster();
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

        /********************** Parse URL **********************/
        parseUrlRoster: function () {
            var urlRoster;
            var oldLink = false;
            if (this.$route) {
                this.$route.hash.split('&')
                .forEach(param => {
                    if (param.indexOf('roster') !== -1) {
                        urlRoster = param.split('=')[1]
                    }
                })
            } else {
                window.location.href.split('#').forEach(hash => { /* if not using router (Standalone version) */
                hash.split('&')
                    .forEach(param => {
                        if (param.indexOf('roster') !== -1) {
                            urlRoster = param.split('=')[1]
                        }
                    })
                })
            }
            if (!urlRoster) { /******* for compatibility with old urls generated by the old page *******/
                const urlParams = new URLSearchParams(window.location.search);
                if (!this.$router && urlParams.get("camproster"))
                    urlRoster = urlParams.get("camproster");
                else if (this.$router && this.$route.query.camproster)
                    urlRoster = this.$route.query.camproster;
                if (urlRoster) oldLink = true;
            }
            if (urlRoster) {
                this.$promiseAlert(
                    this.$t('strings.url_to_roster'),
                    new Promise ((resolve, reject) => {
                        setTimeout( () => {
                            try {
                                urlRoster = oldLink ? decodeOldLink(urlRoster) : decodeLink(urlRoster, this.HeroDB);
                                console.log(urlRoster)
                                if (!urlRoster.length) throw new Error();
                                resolve('<div>'+urlRoster.map(el => {return this.$store.getters.getHeroName(el)+'<br>'}).join('') + '</div>')
                            } catch(err) {
                                reject('Something went wrong...')
                            }
                        }, 200)
                    }),
                    [ this.$t('strings.replace'), this.$t('strings.add_as_new_roster'), this.$t('strings.cancel')]
                ).then(async ([answer]) => {
                    if (answer === 0)
                        this.roster = urlRoster,
                        window.history.pushState("", "", cleanUrl(this.$router)); // remove ?camproster= from the URL to avoid accidental refreshes replacing your current team
                    else if (answer === 1) {
                        await this.newUser(),
                        this.roster = urlRoster,
                        writeRoster(urlRoster, this.profile, this.VERSION);
                        window.history.pushState("", "", cleanUrl(this.$router));
                    }
                })
            }
        },
        /********************** Calculate **********************/
        calculate() {
            this.showSpinner(true);
            var o = {};
            for (var i = 0; i<this.roster.length; i++) {
                o[this.roster[i]] = {}
            }
            var campList = this.roster.slice();
            for (var j = 0; j<this.roster.length; j++) {
                var h = this.roster[j];
                if (campList.includes(h))
                campList.splice(campList.indexOf(h), 1)
            }
            camperinoCalculate(
                {
                    message: 'CALCULATE_MORALE',
                    HeroDB: this.HeroDB,
                    roster: this.roster,
                    locked: this.locked,
                    advanced: this.advancedSettings
                },
                (update) => {
                    this.updateProgressionBar(update)
                }
            ).then(res => {
                this.results = res;
                this.showSpinner(false);
            }).catch(err => {
                console.log('Camping results error', err);
                this.$snackbar.show({type: 'error', title: 'Camping Error', description: this.$t('strings.'+err)});
                this.showSpinner(false);
            }).finally( () => {
                this.updateProgressionBar(0)
            });
        },
        updateProgressionBar(n) {
            this.$refs.percentage_status_text.innerText = n + '%';
        },
        promptAbortCalculation() {
            this.$promiseAlert(
                this.$t('strings.abort_operation'),
                'Are you sure?',
                [
                    this.$t('strings.confirm'),
                    this.$t('strings.cancel')
                ]
            ).then( ([answer]) => {
                if (answer===0) {
                    restartWorker();
                    this.$set(this.advancedSettings, 'recal', new Date().getTime()); // Add something random to avoid cache and trigger a new computation next time the user clicks calculate without changing any settings
                }
            })
        }
    }
}
</script>

<style src="./styles.css"></style>