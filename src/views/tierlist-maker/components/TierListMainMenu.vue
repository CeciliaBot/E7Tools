<template>
    <div class="full-screen">
        <div class="new-box" style="justify-content: space-evenly;">
            <div class="new-tiers-title" style="width: 100%;">
                <button v-show="canClose" @click="$emit('close')" class="material-button flat primary raised mat-hover" v-ripple-effect><i class="fas fa-angle-left" style="padding-right: 1em;"></i><span>{{ $t('strings.back') }}</span></button>
                <h2 style="align-self: baseline; font-weight: 200; padding: 30px 0; text-align: start;"><img style="height: 2em; vertical-align: middle;" src="/favicons/apple-touch-icon.png" />{{ $t('strings.app_cecilia_tools') }}</h2>
                <h1 class="hide-mobile">{{ $t('strings.new_tier_list') }}</h1>
            </div>
            <div class="new-tiers-group">
                <button @click="newTierList('character')" class="material-button stroked raised" v-ripple-effect>
                    <span>{{ $t('strings.new_tier_type_hero') }}</span>
                </button>
                <button @click="newTierList('artifact')" class="material-button stroked raised" v-ripple-effect>
                    <span>{{ $t('strings.new_tier_type_artifact') }}</span>
                </button>
                <button class="material-button stroked raised" @dragover.prevent @dragenter.prevent @drop.prevent="dropJSONFile" @click="selectJSONFile" v-ripple-effect>
                    <input @change="selectedJSONFile" ref="json-tierlist-input" type="file" accept=".json" style="display: none" />
                    <span>{{ $t('strings.load_tier_json') }}</span>
                </button>
            </div>
            <button @click="$emit('settings')" class="material-button stroked raised" v-ripple-effect>{{ $t('strings.settings') }}</button>
        </div>
        <div class="tier-load-box glass-container-2">
            <h1>
                <span style="font-weight: 600;">Your Tier Lists</span>
                <button class="material-button stroked primary button-large" @click="viewChangelog=!viewChangelog" v-ripple-effect>
                    <span>{{ viewChangelog ? $t('strings.load') : $t('strings.changelog') }}</span>
                </button>
            </h1>
            <div v-show="!viewChangelog" class="hide-scrollbar load-body">
                <template v-if="numberOfTierLists && tierListsLoaded">
                    <span v-for="tierList in sortedHistory" :key="tierList.id" > <!-- @click="loadTierList(tierList)" @delete="deletePrompt($event, tierList)" -->
                        <TierListCard :tierlist="tierList" @load="loadTierList" @delete="deletePrompt"/>
                    </span>
                </template>
                <div v-else-if="tierListsLoaded" style="text-align: center;background-color: var(--background-modifier-darken-alpha);padding: 10px;border-radius: 8px;font-size: 20px; height: min-content;">
                    <span>{{ $t('strings.no_tierlists') }}</span>
                </div>
                <div v-else style="width: 100%; height: 100%;">
                    <div class="infinite-loading-wrapper">
                        <div class="infinite-loading"></div>
                    </div>
                </div>
            </div>
            <div v-show="viewChangelog" class="hide-scrollbar">
                <CustomChangelog path="./views/tierlist-maker/" />
            </div>
        </div>
    </div>
</template>

<script>
import tierListCardComponent from './TierListCard.vue'
import { stringToHtmlEmotes } from '@/utils/text-to-emoji.js'
import { newTierRows } from '../utils/newTierRow.js'
import changelogComponent from '@/components/changelog.vue'
import JSONTierListLoader from '../utils/load-json-file.js'
import { getRandomElement } from '@/utils/array.js'

export default {
    name: 'tier-list-main-menu',
    components: {
        TierListCard: tierListCardComponent,
        CustomChangelog: changelogComponent
    },
    props: {
        canClose: { /* Can close without selecting anything */
            type: Boolean,
            required: false,
            default: false
        }
    },
    data: function () {
        return {
            tierListsLoaded: false,
            viewChangelog: false
        }
    },
    computed: {
        tierListHistory() {
            return this.$store.getters.getTierListDB();
        },
        sortedHistory() {
            return Object.values(this.tierListHistory || {}).sort( (a,b) => a.updated_at > b.updated_at ? -1 : 0 )
        },
        numberOfTierLists() {
            return Object.values(this.tierListHistory).length
        }
    },
    renderTriggered (e) {console.log('MainMenu', e)},
    created: function () {
        this.$store.dispatch('LOAD_TIER_LIST_DB')
            .catch( () => { /* Can't open indexed db -> Probably firefox incognito mode, let the user know they wont be able to save progress only export */
                this.$snackbar.warn({title: 'Can\'t open local database', description: 'Saving and Loading disabled'})
            })
            .finally( () => {
                this.tierListsLoaded = true;
            })
    },
    methods: {
        deletePrompt(tierList) {
            this.$promiseAlert(stringToHtmlEmotes(tierList.name), this.$t('strings.delete_tier_confirm'), [this.$t('strings.confirm'), this.$t('strings.cancel')]).then( ([answer]) => {
                if (answer === 0) {
                    this.$store.dispatch('DELETE_TIER_LIST', tierList)
                }
            })
        },
        newTierList(type) {
            let tiers = [];
            newTierRows(5, tiers);
            this.$emit('workTierList', {type: type, name: ':' + getRandomElement(['Aware', 'Clueless', 'BOOBA', 'Copium', 'Bedge', 'Pepega', 'PepegaCredit', 'PepeLaugh', 'CharlotteNoted', 'skystone', 'molagora', 'molagoraseed']) + ': '+ this.$t('strings.untitled_tier_list'), tiers: tiers, xy: {names: [], list: []}})
        },
        loadTierList(data) {
            this.$emit('workTierList', data)
        },

        /*********** JSON Loader ***********/
        dropJSONFile(e) {
            this.parseJSONFile(e.dataTransfer.files[0])
        },
        selectJSONFile(e) {
            e.stopPropagation();
            this.$refs['json-tierlist-input'].click();
        },
        selectedJSONFile(e) {
            this.parseJSONFile(e.target.files[0])
        },
        parseJSONFile(file) {
            JSONTierListLoader(file).then( data => {
                this.loadTierList(data)
            }).catch( err => {
                if (err.error)
                    this.$snackbar.warn({title: err.message})
            })
        }
    }
}
</script>
<style scoped>
.full-screen {
    position: absolute;
    z-index: 50;
    width: 100vw;
    height: 100%;
    display: flex;
}
.full-screen > div {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}
.new-box {
    flex: 0 0 400px;
    background-color: white;
    flex-direction: column;
    color: black;
    text-align: center;
}
.new-box button {
    width: 100%;
    font-size: 18px;
    font-weight: 300;
}
.tier-load-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    box-shadow: none;
}
.tier-load-box > h1 {
    width: 100%;
    padding: 40px 0;
    font-size: 50px;
    align-self: start;
    font-weight: 400;
}
.tier-load-box > div {
    flex: 1;
    width: 100%;
    overflow: auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
.load-body {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
.button-large {
    float: right;
    font-size: 0.5em;
    width: 180px;
}

@media only screen and (max-width: 900px) { /* Mobile version */
    .hide-mobile {
        display: none;
    }
    .full-screen {
        flex-direction: column-reverse;
    }
    .new-box {
        flex: 0 0 280px;
        flex-direction: row;
        flex-wrap: wrap;
    }
    .new-tiers-title {
        order: -1;

    }
    .new-tiers-title > h2 {
        display: none;
    }
    .new-tiers-group {
        flex: 1 0 50%;
        order: -1;
    }

    .tier-load-box {
        height: 0;
    }
    .tier-load-box > h1 {
        padding: 20px 0;
        font-size: 34px;
    }
    .button-large {
        width: auto;
    }
}
</style>