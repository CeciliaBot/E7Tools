<template>
    <div>
        <h1 style="text-align: center;">{{ $t('strings.your_teams') }}</h1>
        <div class="flex-center">
            <template v-for="team in localTeams" :key="team">
                <Card :team="team" @edit="editTeam" @delete="deleteTeam"/>
            </template>
        </div>
        <TeamEditor :camp="openEditModal" :edit-mode="true" :title="$t('strings.edit')" @close="closeEditModal" @save="saveTeamEdit" />
    </div>
</template>

<script>
import Card from './SavedTeamsCard.vue'
import TeamEditor from './SaveTeamModal.vue'
import { isEditing } from '../util/send-team-usage.js'
//import ajax from '@/utils/ajax.js'

export default {
    name: 'saved-teams',
    components: {
        Card,
        TeamEditor
    },
    props: {
        teams: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            localTeams: [],
            openEditModal: null
        }
    },
    watch: {
        teams: {
            immediate: true,
            handler() {
                this.localTeams = this.teams
            }
        }
    },
    methods: {
        editTeam(team) {
            this.openEditModal = team;
        },
        closeEditModal() {
            this.openEditModal = null
        },
        saveTeamEdit(team) {
            try {
                var edited;
                for (var i = 0; i < this.teams.length; i++ ) {
                    if (this.localTeams[i] === this.openEditModal) {
                        edited = JSON.parse(JSON.stringify(this.localTeams[i]));
                        this.localTeams[i] = team;
                        
                    }
                }
                if (edited) {
                    this.closeEditModal();
                    isEditing(team, edited)
                } else
                    this.$snackbar.error({title: 'error', description: 'Team not found in local teams.'});
            } catch (err) {
                this.$snackbar.error({title: 'error', description: 'Something went wrong.'})
            }
        },
        deleteTeam: function (team) {
            this.$promiseAlert(
                this.$t('strings.delete'),
                this.$t('strings.delete_confirm', [team.name]),
                [{name: this.$t('strings.confirm'), class: 'material-button basic warn noselect'}, this.$t('strings.cancel')]
            ).then(answer => {
                if (answer[0] === 0) {
                    this.$emit('delete-team', team)
                }
            }).catch(()=> {})
        }
    }
}
</script>
<style>
    .flex-center {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        width: 100%;
    }
    .team-card {
        width: 100%;
        max-width: 500px;
        overflow: hidden;
        background-color: rgba(0,0,0,.3);
        border-radius: 8px;
        margin: 10px;
        transition: box-shadow .5s ease;
    }
    .team-card:hover {
        box-shadow: 0 0 10px white;
    }
    .team-card .options {
        float: right;
        cursor: pointer;
        padding: 0 10px;
    }
    .team-card .options:hover {
        color: red;
    }
    .team-card > h1  {
        height: 60px;
        padding: 0 10px;
        width: 100%;
        background-color: #FFED86;
        color: black;
        font-size: 20px;
        line-height: 60px;

        /* Enemy pick positioning */
        background-position-y: center;
        background-size: 15%;
        background-repeat: no-repeat;
        /* background-position-x: 92%, 80%, 68%, 56%, 44%, 32%, 20%, 8%; */
        background-position-x: 78%, 64%, 50%, 36%, 22%, 8%;
    }
    .team-card .morale-box {
        text-align: center;
        font-size: 18px;
    }
    .team-card > div  {
        padding: 10px;
        text-align: center;
    }
    .team-card .topic-box {
        padding: 10px;
        display: inline-block;
    }
</style>