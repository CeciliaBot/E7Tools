<script>
import ajax from '@/utils/ajax.js'
const API_URL = 'https://ceciliabotgithub.glitch.me/team_statistics';
const filters = {
    gamemode: ['all', 'labyrinth', 'raid_normal', 'raid_hell'],
    enemy: [
        ['all', ''],
        ['queen','https://cdn.glitch.com/97cf5510-4561-4fba-a2bd-849e3aed02ba%2FQueen-Azumashik-284x300.png?v=1590932065337'],
        ['karkanis', 'https://cdn.glitch.com/97cf5510-4561-4fba-a2bd-849e3aed02ba%2FKarkanis-284x300.png?v=1590932065109'],
        ['juleeve', 'https://cdn.glitch.com/97cf5510-4561-4fba-a2bd-849e3aed02ba%2FJuleeve-284x300.png?v=1590932065054'],
        ['vera', 'https://cdn.glitch.com/97cf5510-4561-4fba-a2bd-849e3aed02ba%2FSecretary-Vera-284x300.png?v=1590932064989'],
        ['arakahan', 'https://cdn.glitch.com/97cf5510-4561-4fba-a2bd-849e3aed02ba%2FDevourer-Arakahan-284x300.png?v=1590932064956']
    ]
}
export default {
    name: 'team-usage-stats',
    props: ['visible'],
    data: function () {
        return {
            usage: [],
            totalUsage: 0,
            loading: true,
            failed: false,
            mode: 'teams',
            filters: {type: 'teams', gamemode: [], enemy: ['vera'], hero: []}
        }
    },
    computed: {
    },
    created: function () {
        if (!this.usage.length) this.getData();
    },
    mounted: function () {},
    beforeDestroy: function () {},
    methods: {
        getData: function (options) {
            this.failed = false;
            this.loading = true;
            ajax(API_URL, options).then(res => {
                res = JSON.parse(res); 
                this.usage = res.data;
                this.totalUsage = res.totale;
                this.loading = false;
            }).catch(err => {
                console.log(err);
                this.loading = false;
                this.failed = true;
            })
        },
        isActiveFilter: function (group, ele) {
            if (ele==='all') return !this.filters[group].length;
            return this.filters[group].includes(ele);
        }
    },
    render: function (h) {
        return h('div', {style: {}}, [
            h('div', {staticClass: 'filter-block'}, [
                h('div', {staticClass: 'filter-group'}, [
                    h('span', {class: {active: this.filters.type === 'teams'}}, 'Teams'),
                    h('span', {class: {active: this.filters.type === 'heroes'}}, 'Heroes'),
                ]),
                h('div', {staticClass: 'filter-group'}, [
                    filters.gamemode.map(mode => {
                        return h('span', {class: {active: this.isActiveFilter('gamemode', mode)}}, mode)
                    })
                ]),
                h('div', {staticClass: 'filter-group'}, [
                    filters.enemy.map(enemy => {
                        return h('span', {class: {active: this.isActiveFilter('enemy', enemy[0])}}, [
                            h('img', {attrs: {src: enemy[1]}}),
                            enemy[0]
                        ])
                    })
                ]),
                h('div', {staticClass: 'filter-group'}, [
                    h('span', 'Select a character'),
                    h('span', 'x')
                ])
            ]),
            h('div', {style: 'text-align: center'}, [
                h('button', 'Apply filters')
            ]),
            h('table', {staticClass: 'main-stats-print', class: {hero: this.mode==='heroes', team: this.mode==='teams'}}, 
                this.mode === 'teams' ?
                    [ /************************** TEAM STATS ***************************************/
                        h('thead', [
                            h('th', {attrs: {colspan: 4}}, 'Team'),
                            h('th', ''),
                            h('th', 'Usage'),
                            h('th', 'Morale')
                        ]),
                        h('tbody', [
                            this.usage.map( team => {
                                return h('tr', [
                                    team.team.map( c => {
                                        return h('td', [
                                            h('hero-icon', {props: {hero: c, hover: false, size: 50}})
                                        ])
                                    }),
                                    h('td', {}, [
                                        h('div', {staticClass: 'histogram_bar', style: {width: team.usi/this.totalUsage*100 + '%'}}, [
                                            h('span', Math.round(( (team.usi/this.totalUsage*100)+ Number.EPSILON) * 100) / 100 + '%')
                                        ])
                                    ]),
                                    h('td', {}, team.usi),
                                    h('td', team.morale)
                                ])
                            })
                        ])
                    ]
                :
                    [/************************** CHARACTER STATS ***************************************/

                    ]
            )
        ])
    } 
}
</script>
<style scoped>
    .main-stats-print {
        width: 100%;
        background-color: var(--background-color-secondary);
        padding: 10px;
        border-radius: 0 0 12px 12px;
    }
    .main-stats-print.team th:nth-child(2),
    .main-stats-print.team td:nth-child(5) {
        width:50vw;
        padding-top: 15px;
        padding-bottom:10px
    }
    .main-stats-print.team td:nth-child(6),
    .main-stats-print.team td:nth-child(7) {
        text-align: center;
        padding-top: 15px;
        padding-bottom:10px;
    }
    .histogram_bar {
        border-radius: 15px;
        height: 40px;
        background: linear-gradient(to bottom, rgb(128, 194, 254) 30%, rgb(14, 175, 227) 100%);
    }

    .histogram_bar span {
        position: relative;
        white-space: nowrap;
        left: 100%;
        margin-left: 20px;
        top: 10px;
        bottom: 0;
        vertical-align: middle;
        height: 40px;
    }
</style>