<script>
import formation from '@/components/team-formation.vue'
import ajax from '@/utils/ajax.js'

var img = {
    'queen': 'https://cdn.glitch.com/97cf5510-4561-4fba-a2bd-849e3aed02ba%2FQueen-Azumashik-284x300.png?v=1590932065337',
    'karkanis': 'https://cdn.glitch.com/97cf5510-4561-4fba-a2bd-849e3aed02ba%2FKarkanis-284x300.png?v=1590932065109',
    'juleeve': 'https://cdn.glitch.com/97cf5510-4561-4fba-a2bd-849e3aed02ba%2FJuleeve-284x300.png?v=1590932065054',
    'vera': 'https://cdn.glitch.com/97cf5510-4561-4fba-a2bd-849e3aed02ba%2FSecretary-Vera-284x300.png?v=1590932064989',
    'arakahan': 'https://cdn.glitch.com/97cf5510-4561-4fba-a2bd-849e3aed02ba%2FDevourer-Arakahan-284x300.png?v=1590932064956'
};
export default {
    name: 'saved-teams',
    props: ['visible','teams'],
    data: function () {
        return {
            myTeams: []
        }
    },
    computed: {},
    created: function () {
    },
    watch: {
        // teams: {
        //     deep: true,
        //     immediate: true,
        //     handler: function () {this.myTeams=this.teams}
        // },
        visible: function () {
            this.myTeams=this.teams
        }
    },
    methods: {
        getHeroName: function (id) {
            return this.$store.getters.getHeroName(id);
        },
        renameTeam: function (id,name) {
            for (var i = 0; i<this.myTeams.length; i++) {
                if (this.myTeams[i].teamId === id) {
                    this.$set(this.teams[i], 'name', name);
                }
            }
        },
        deleteTeam: function (team) {
            this.$promiseAlert(
                'Delete team',
                'Are you sure you want to delete ' + team.name + '?',
                [{name: 'Confirm', class: 'material-button basic warn noselect'}, 'Cancel']
            ).then(answer => {
                if (answer[0] === 0) {
                    for (var i = 0; i<this.myTeams.length; i++) {
                        if (this.myTeams[i] === team) {
                            let team = this.myTeams[i];
                            if (team.uploaded) {
                                ajax('https://ceciliabotgithub.glitch.me/team_statistics', 'POST', {function: "remove", data: [{
                                    teamId: team.id,
                                    morale: team.morale,
                                    team: team.team,
                                    normal: team.gamemode.includes('normal_raid'),
                                    hell: team.gamemode.includes('hell_raid'),
                                    queen: team.enemy.includes('queen'),
                                    karkanis: team.enemy.includes('karkanis'),
                                    juleeve: team.enemy.includes('juleeve'),
                                    vera: team.enemy.includes('vera'),
                                    arakahan: team.enemy.includes('arakahan')
                                }]}).then( () => {
                                    console.log('sending remove request')
                                }).catch(()=>{})
                            }
                            this.myTeams.splice(i,1);
                        }
                    }
                }
            }).catch(()=> {})

        }
    },
    render: function (h) {
        return h('div', {staticClass: 'flex-center', style: {}}, this.myTeams.map( (team,i) => {
            return h('div', {key: team.id, staticClass: 'team-card'}, [
                h('h1', {style: {'background-image': team.enemy.map( en => {return 'url(' + img[en] + ')'}).join(',') }}, [
                    h('div', {staticClass: 'options', directives: [{name: 'tooltip', value: 'Delete this team'}], on: {click: () => this.deleteTeam(team, i) }}, [h('i', {staticClass: 'fa fa-trash'})]),
                    //h('div', {staticClass: 'options', directives: [{name: 'tooltip', value: 'Edit this team'}]}, [h('i', {staticClass: 'fa fa-pencil-alt'})]),
                    team.name
                ]),
                h('div', [
                    h('div', {staticClass: 'morale-box', domProps: {innerHTML: 'Morale: ' + team.morale}}),
                    h(formation, {key: 'team-formation'+i, props: {team: team.team, size: 120, editable: false, remove: false}, style: {'vertical-align': 'middle'}}),
                    h('div', {staticClass: 'topic-box'}, [
                        [0,1].map( j => {
                            return h('div', [
                                h('span', [
                                    h('b', this.getHeroName(team.holder[j])),
                                    ': ',
                                    team.topics[j]
                                ])
                            ])
                        })
                    ]),
                    h('div', [
                        h('i', team.description)
                    ])
                ])
            ])
        }))
    }
}
</script>
<style>
    .flex-center {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        width: 100%;
        max-width: 1200px;
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
        /*background-position-x: 100%, 85%, 70%, 55%, 40%, 35%, 20%, 5%;*/
        background-position-x: 92%, 80%, 68%, 56%, 44%, 32%, 20%, 8%;
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