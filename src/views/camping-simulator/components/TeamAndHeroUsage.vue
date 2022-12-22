<template>
    <div style="max-width: 980px; margin: auto;">
        <h1>Usage Data</h1>
        <div>
            <div class="flex noselect text-center" style="background: var(--background-modifier-darken-alpha);">
                <div class="flex-fill flex flex-center relative overflow-hidden border-thin mat-hover pointer" @click="selectTypeDropdown" v-ripple-effect>
                    Data type:<br>
                    {{ $t('strings.'+fetchOptions.type) }}
                </div>
                <div class="flex-fill flex flex-center relative overflow-hidden border-thin mat-hover pointer" @click="selectSortingDropdown" v-ripple-effect>
                    {{ $t('strings.sort') }} ({{ fetchOptions.gamemode.length }})
                </div>
                <div class="flex-fill flex flex-center relative overflow-hidden border-thin mat-hover pointer" @click="openCharacterSelect" v-ripple-effect>
                    {{ displayFilterHeroName }}
                </div>
                <div class="flex-fill flex flex-center relative overflow-hidden border-thin mat-hover pointer" @click="fetchData" style="background-color: var(--font-color-confirm); color: white;" v-ripple-effect>
                    <div :style="{opacity: isFetching ? 1 : 0, marginRight: '5px'}">
                        <i class="fa fa-sync fa-spin" />
                    </div>
                    Get Data!
                </div>
            </div>
        </div>
        <table class="text-center" style="width: 100%; white-space: nowrap; border-collapse: collapse;">
            <thead>
                <th>{{ $t('strings.'+fetchOptions.type) }}</th>
                <th style="width: 58%;"></th>
                <th>
                    {{ $t('strings.morale') }}
                </th>
                <th>
                    {{ $t('strings.team') }}
                </th>
            </thead>
            <tbody>
                <tr v-for="(camp, i) in toDisplay" :key="i">
                    <td class="relative mat-hover pointer overflow-hidden" @click="saveTeam(camp.team)" v-ripple-effect>
                        <div v-if="camp.team">
                            <HeroIcon v-for="hero in camp.team" :key="hero" :hero="hero" :hover="false" :size="55" />
                        </div>
                        <div v-else>
                            <HeroIcon :hero="camp.id" :hover="false" :size="55" />
                        </div>
                    </td>
                    <td>
                        <div class="usage-bar" :style="{width: camp.rate + '%'}"></div>
                    </td>
                    <td>
                        {{ camp.morale }}
                    </td>
                    <td class="relative mat-hover overflow-hidden">
                        {{ camp.value }}
                    </td>
                </tr>
            </tbody>
            <!-- <pre>{{ toDisplay }}</pre> -->
        </table>
        <div v-if="showHelp" class="text-center">
            Use the buttons at the top of the page to filter the data you want then click "Get Data!" to display the results
        </div>
        <div v-else-if="fetchError" class="text-center">
            <img :src="require('@/assets/cermia404.png')" style="height: 200px" />
            <br>
            Ops... Something went wrong
        </div>
        <div class="text-center" style="font-size: 12px; margin-top: 10px;">
            <i>
                The data provided here does not represent the actual in-game character usage or clear rate.
                <br>
                The data is collected when a user saves a team on this website. No personal data is collected.
                <br>
                The data has been reset on 2022/11/18. You can access the old data by clicking <span @click="oldStatsModal = true" class="pointer" style="color: purple">here</span>.
            </i>
        </div>
        <CharacterSelect v-if="characterSelect" :list="availableHeroes" :selected="fetchOptions.hero ? [fetchOptions.hero] : []" :max="1" @close="closeCharacterSelect" @selected="saveAndCloseCharacterSelect" />
        <SaveTeamModal :camp="openTeamSave" @close="closeSaveTeamModal" @save="saveCamp" />
        <OldStats v-if="oldStatsModal" @close="oldStatsModal = false" />
    </div>
</template>

<script>
import { toRaw } from 'vue'
import CharacterSelect from '@/components/CharacterSelect.vue'
import SaveTeamModal from './SaveTeamModal.vue'
import OldStats from './TeamAndHeroUsageOld.vue'
import ajax from '@/utils/ajax.js'
import { enemies } from '../util/constant.js'
import { camperinoCalculate } from '../worker/index.js'

export default {
    components: {
        CharacterSelect,
        SaveTeamModal,
        OldStats
    },
    props: {
        availableHeroes: Array
    },
    data() {
        return {
            isFetching: false,
            fetchError: false,
            showHelp: true,
            characterSelect: false,
            openTeamSave: false,
            oldStatsModal: false,

            toDisplay: [],
            fetchOptions: {
                type: 'team',
                hero: '',
                enemy: [],
                gamemode: []
            }
        }
    },
    created() {
    },
    computed: {
        displayFilterHeroName() {
            return this.fetchOptions.hero ? this.$store.getters.getHeroName(this.fetchOptions.hero)+' ×' : 'Select a character';
        }
    },
    methods: {
        fetchData() {
            if (this.isFetching) {
                return;
            }
            this.isFetching = true
            this.fetchError = false
            this.showHelp = false
            ajax('https://ceciliabotgithub.glitch.me/ceciliabot-team-usage', 'POST', JSON.stringify( {function: 'get', data: toRaw(this.fetchOptions)} )).then( res => {
                console.log(res)
                this.toDisplay = JSON.parse(res);
            }).catch( err => {
                console.error(err);
                this.fetchError = true
            }).then( () => {
                this.isFetching = false;
            })
        },
        openCharacterSelect() {
            if (this.fetchOptions.hero)
                this.fetchOptions.hero = ''
            else
                this.characterSelect = true
        },
        closeCharacterSelect() {
            this.characterSelect = false
        },
        saveAndCloseCharacterSelect(e) {
            console.log(e)
            this.fetchOptions.hero = e[0] || false;
            this.closeCharacterSelect()
        },
        saveTeam(team) {
            if (!team)
                return;
            // can't import the calculation function so ask the worker to calculate
            camperinoCalculate({
                message: 'MORALE',
                HeroDB: toRaw(this.$store.getters.getHeroDB()),
                roster: toRaw(team),
                locked: [],
                advanced: {}
            }).then( res => {
                this.openTeamSave = res[0]
            }).catch( err => {
                this.$snackbar.error({title: err})
            })
        },
        closeSaveTeamModal() {
            this.openTeamSave = false
        },
        saveCamp(e) {
            this.$emit('save-team', e)
        },

        dropdownPosition(e) {
            e.stopPropagation()
            e.preventDefault()
            let box = (e.currentTarget || e.target).getBoundingClientRect();
            return {
                clientX: box.left,
                clientY: box.bottom+5
            }
        },
        selectTypeDropdown(e) {
            return this.$contextmenu( this.dropdownPosition(e) , [

                {
                    class: this.fetchOptions.type==="team" ? 'fa fa-check' : null,
                    name: this.$t('strings.team'),
                    handler: () => {
                        this.fetchOptions.type="team"
                    }
                },
                {
                    class: this.fetchOptions.type==="hero" ? 'fa fa-check' : null,
                    name: this.$t('strings.hero'),
                    handler: () => {
                        this.fetchOptions.type="hero"
                    }
                }
            ], { mobile: false })
        },
        selectSortingDropdown(e) {
            return this.$contextmenu( this.dropdownPosition(e) , [
                {
                    class: !this.fetchOptions.gamemode.length ? 'fa fa-check' : '',
                    name: "Any",
                    handler: () => {
                        this.fetchOptions.gamemode=[]
                        this.fetchOptions.enemy=[]
                    }
                },
                {
                    class: this.fetchOptions.gamemode.includes('lab') ? 'fa fa-check' : '',
                    name: this.$t('strings.labyrinth'),
                    handler: () => {
                        this.fetchOptions.gamemode=['lab']
                    }
                },
                ...[['az_hell', 'azmakalis_hell'], ['az_night', 'azmakalis_nightmare'], ['az_normal', 'azmakalis_normal']].map( mode => {
                    var isInMode = this.fetchOptions.gamemode.includes(mode[0])
                    return {
                        class: isInMode ? 'fa fa-check' : null,
                        name: this.$t('strings.'+mode[1]),
                        children: [
                            {
                                class: isInMode && !this.fetchOptions.enemy.length ? 'fa fa-check' : undefined,
                                name: 'Overall',
                                handler: () => {
                                        this.fetchOptions.gamemode = [mode[0]]
                                        this.fetchOptions.enemy = []
                                }
                            },
                            ...enemies.map(enemy => {
                                var isIn = isInMode && this.fetchOptions.enemy.includes(enemy[0])
                                return {
                                    class: !isIn ? undefined : 'fa fa-check',
                                    img: isIn ? undefined : enemy[1],
                                    name: this.$t('strings.'+enemy[0]),
                                    handler: () => {
                                        this.fetchOptions.gamemode = [mode[0]]
                                        this.fetchOptions.enemy = [enemy[0]]
                                    }
                                }
                            })
                        ]
                    }
                }).flat()
            ], { mobile: false })
        }
    }
}
</script>

<style scoped>
    .border-thin {
        border: solid 1px #00000022;
        align-content: center;
    }
    td, th {
        border: solid 1px #00000022;
        padding: 10px;
    }
    tr:nth-child(odd) {
        background: #00000010;
    }
    .usage-bar {
        height: 40px;
        background: linear-gradient(90deg, var(--font-color-primary), var(--font-color-confirm));
        border-radius: 8px;
    }
</style>