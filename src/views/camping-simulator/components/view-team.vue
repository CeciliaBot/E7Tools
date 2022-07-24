<script>
import formation from '@/components/team-formation.vue'
import ajax from '@/utils/ajax.js'
/*
function sendTeamUsageStatistics(data) {
    ajax({
        url: "https://ceciliabotgithub.glitch.me/team_statistics",
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify( data ),
        success: function () {

        },
        error: function() {
            console.log("could not upload team data");
        }
    });
}
*/
export default {
    name: 'camp-view-team',
    components: {formation},
    props: ['camp','editable','isnew'],
    inject: ['updateTeams', 'getTeams'],
    data: function () {
        return {
            campData: {},
            currSlide: 0,
            maxSlides: 1
        }
    },
    created: function () {
        this.copyData(this.camp);
    },
    watch: {
        camp: function (d) {
            if (d) this.copyData(d);
            this.currSlide=0;
        }
    },
    computed: {
        showSaveButton: function () {
            return this.isnew || this.editing;
        },
        isRaidTeam: function () {
            return this.isSelectedGameMode('hell_raid') || this.isSelectedGameMode('normal_raid');
        }
    },
    methods: {
        copyData: function (data) {
            //create copy so the original isn't affected
            var o = data ? JSON.parse( JSON.stringify(data) ) : {};
            if (!o.team) return this.campData = o;
            if (o.migliorPG1) {
                this.campData = {
                    morale: o.morale,
                    team: o.team,
                    topics: [o.opzioneMigliore1, o.opzioneMigliore2],
                    holder: [o.migliorPG1,o.migliorPG2]
                }
            } else {
                this.campData = o;
            }
            if (!this.campData.gamemode) this.$set(this.campData, 'gamemode', ['labyrinth']);
            if (!this.campData.enemy) this.$set(this.campData, 'enemy', []);
        },
        characterName: function (id) {
            return this.$store.getters.getHeroName(id);
        },
        typingName: function (e) {
            this.$set(this.campData, 'name', e.target.value);
        },
        typingDescription: function (e) {
            this.$set(this.campData, 'description', e.target.value);
        },
        setArrayElement: function (cat, mode) {
            if (!this.showSaveButton) return;
            var t = this.campData[cat];
            if (t.includes(mode))
                t.splice(t.indexOf(mode), 1);
            else
                t.push(mode);
            if (cat==='gamemode' && !this.isRaidTeam) this.campData.enemy = [];
            console.log('Game mode was changed')
        },
        isSelectedGameMode: function (mode) {
            return this.campData.gamemode.includes(mode);
        },
        findSavedTeam: function (teams, id) {
            var index = -1;
            if (this.editing && this.campData.id) {
                for (var i=0;i<teams.length; i++) {
                    if (teams.id === id) {
                        index = i;
                        break
                    }
                }
            }
            return index;
        },
        saveTeam: function () {
            var teams = this.getTeams(); //JSON.parse(localStorage.getItem('teams') || '[]');
            var index = this.findSavedTeam(teams, this.campData.id);
            if (index!==-1) { // edited team
                this.$set(teams. index, this.campData);
                this.closeModal();
            } else if (index === -1) { // send data if team is new
                const id = new Date().getTime();
                this.campData.uploaded = true; /* we expect the request to succed */
                this.campData.id = id;
                teams.push(this.campData);
                this.updateTeams(teams);

                /* Now we try to update usage stats in the background */
                var curr = this.campData;
                var sendData = {
                    teamId: curr.id,
                    morale: curr.morale,
                    team: curr.team,
                    normal: curr.gamemode.includes('normal_raid'),
                    hell: curr.gamemode.includes('hell_raid'),
                    queen: curr.enemy.includes('queen'),
                    karkanis: curr.enemy.includes('karkanis'),
                    juleeve: curr.enemy.includes('juleeve'),
                    vera: curr.enemy.includes('vera'),
                    arakahan: curr.enemy.includes('arakahan')
                };

                ajax("https://ceciliabotgithub.glitch.me/team_statistics", "POST", {function: "add", data: [sendData]}).then( () => {
                    // nothing to do here
                }).catch( err => {
                    console.warn('Team statistics request failed', err);
                    teams = this.getTeams();
                    var index = this.findSavedTeam(teams, this.campData.id);
                    if (index>-1) {
                        teams[index].uploaded = false;
                        this.updateTeams(teams);
                    }
                });
                this.closeModal();
            }
        },
        closeModal: function(e) {
            if (e) e.stopPropagation();
            this.campData={};
            this.currSlide=0;
            this.$emit('close')
        },
        preventClose: function(e) {
            e.stopPropagation();
            this.$refs.team_formation.blur();
        }
    },
    render: function (h) {
        if (!this.camp) return h('div');
        return h('div', {staticClass: 'center-modal', on: {click: this.closeModal}}, [
            h('div', {staticClass: 'flat-modal', style: 'max-height: 520px;', on: {click: this.preventClose}}, [
                h('h1', this.$t(`strings.edit_team`)),
                h('div', {style: 'padding: 10px; display: flex; flex-direction: column; justify-content: space-between;'}, [
                    h('div', [
                        /******************** SLIDE 1 (NAME AND DESCRIPTION OF THE TEAM) ********************/
                        h('div', {style: {display: this.currSlide===0 ?'': 'none'}}, [
                            h('div', {style: {'text-align': 'center'}}, [
                                h('span', `${this.$t(`strings.morale`)}: ${this.campData.morale}`)
                            ]),
                            h('div', {style: {'text-align': 'center'}}, [
                                h(formation, {ref: 'team_formation', key: 'team-formation', props: {team: this.campData.team, size: 120, editable: true, remove: false}, style: {'vertical-align': 'middle'}}),
                                h('div', {style: {'text-align': 'center', display: 'inline-block', 'vertical-align': 'middle', margin: '0 20px'}}, [
                                    [0,1].map( i => {
                                        return h('div', [
                                            h('span', [
                                                h('b', this.characterName(this.campData.holder[i])),
                                                ': ',
                                                this.$t(`strings.${this.campData.topics[i]}`)
                                            ])
                                        ])
                                    })
                                ])
                            ]),
                            /*
                            h('div', {style: {'text-align': 'center'}}, [
                                this.campData.team.map( hero => {
                                    return h('hero-icon', {key: 'team-formation-'+hero, props: {hero: hero, hover: false}})
                                })
                            ]),
                            */
                            h('div', {ref: 'camp-name-input', staticClass: 'input-field'}, [
                                h('input', {domProps: {value: this.campData.name || '', type: 'text', placeholder: '&nbsp;', required: true}, on: {keyup: this.typingName, focus: (e) => e.currentTarget.parentNode.classList.remove('error'), blur:  (e) => {if (!this.campData.name) e.currentTarget.parentNode.classList.add('error') }}}),
                                h('label', {staticClass: 'label'}, this.$t('strings.comp_name')),
                                h('span', {staticClass: 'focus-bg'})
                            ]),
                            h('div', {staticClass: 'input-field'}, [
                                h('input', {domProps: {value: this.campData.description || '', type: 'text', placeholder: '&nbsp;', required: true}, on: {keyup: this.typingDescription}}),
                                h('label', {staticClass: 'label'}, this.$t('strings.description')),
                                h('span', {staticClass: 'focus-bg'})
                            ]),
                        ]),
                        /******************** SLIDE 2 (GAMEMODE AND ENEMIES) ********************/
                        h('div', {style: {display: this.currSlide===1 ?'': 'none'}}, [
                            h('div', {style: 'text-align: center;'}, [
                                h('h2', 'Where do you want to use this team?'),
                                h('i', 'The data provided here will be used for statistics and help new people')
                            ]),
                            h('div', {style: {'text-align': 'center'}}, [
                                h('label', {staticClass: 'check'}, [
                                    h('input', {attrs: {type: 'checkbox', checked: this.isSelectedGameMode('labyrinth')}, staticClass: 'checkbox', on: {change: () => this.setArrayElement('gamemode','labyrinth')}}),
                                    h('span', {staticClass: 'checkmark'}),
                                    this.$t('strings.labyrinth')
                                ]),
                                h('label', {staticClass: 'check'}, [
                                    h('input', {attrs: {type: 'checkbox', checked: this.isSelectedGameMode('normal_raid')}, staticClass: 'checkbox', on: {change: () => this.setArrayElement('gamemode','normal_raid')}}),
                                    h('span', {staticClass: 'checkmark'}),
                                    this.$t('strings.azmakalis_normal')
                                ]),
                                h('label', {staticClass: 'check'}, [
                                    h('input', {attrs: {type: 'checkbox', checked: this.isSelectedGameMode('hell_raid')}, staticClass: 'checkbox', on: {change: () => this.setArrayElement('gamemode','hell_raid')}}),
                                    h('span', {staticClass: 'checkmark'}),
                                    this.$t('strings.azmakalis_hell')
                                ])
                            ]),
                            h('div', {staticClass: 'enemy-box', style: this.isRaidTeam ? {opacity: 1} : {opacity: 0.5, 'pointer-events': 'none'} }, [
                                [
                                    ['queen','https://cdn.glitch.com/97cf5510-4561-4fba-a2bd-849e3aed02ba%2FQueen-Azumashik-284x300.png?v=1590932065337'],
                                    ['karkanis', 'https://cdn.glitch.com/97cf5510-4561-4fba-a2bd-849e3aed02ba%2FKarkanis-284x300.png?v=1590932065109'],
                                    ['juleeve', 'https://cdn.glitch.com/97cf5510-4561-4fba-a2bd-849e3aed02ba%2FJuleeve-284x300.png?v=1590932065054'],
                                    ['vera', 'https://cdn.glitch.com/97cf5510-4561-4fba-a2bd-849e3aed02ba%2FSecretary-Vera-284x300.png?v=1590932064989'],
                                    ['arakahan', 'https://cdn.glitch.com/97cf5510-4561-4fba-a2bd-849e3aed02ba%2FDevourer-Arakahan-284x300.png?v=1590932064956']
                                ].map( boss => {
                                    return h('div', {staticClass: 'image-check', class: {enabled: this.campData.enemy.includes(boss[0])}, style: {}, on: {click: () => this.setArrayElement('enemy',boss[0])}}, [
                                        h('img', {attrs: {src: boss[1]}}),
                                        h('p', this.$t(`strings.${boss[0]}`))
                                    ])
                                })
                            ])
                        ])
                    ]),
                    /******************** MODAL BUTTONS ********************/
                    h('div', {style: {'text-align': 'end'}}, [
                        h('button', {staticClass: 'material-button basic primary noselect', on: {click: this.closeModal}, directives: [{name: 'ripple-effect'}]}, this.$t('strings.close')),
                        this.currSlide>0? h('button', {key: 'back-button', style: 'float: left;', staticClass: 'material-button basic primary noselect', on: {click: () => this.currSlide--}, directives: [{name: 'ripple-effect'}]}, this.$t('strings.back')) : null,
                        this.currSlide!==this.maxSlides ? h('button', {key: 'confirm-button', staticClass: 'material-button flat confirm noselect', on: {click: () => {if (this.campData.name) this.currSlide++; else this.$refs['camp-name-input'].classList.add('error')}}, directives: [{name: 'ripple-effect'}]}, this.$t('strings.next'))
                        : this.showSaveButton ? h('button', {key: 'confirm-button', staticClass: 'material-button flat confirm noselect', on: {click: this.saveTeam}, directives: [{name: 'ripple-effect'}]}, this.$t('strings.save')) : null
                    ])
                ])
            ])
        ])
    }
}
</script>
<style scoped>
    button {
        min-width: 100px;
    }
    .input-box {
        width: 100%;
        padding: 10px;
    }
    .enemy-box {
        height: auto;
        width: 100%;
        text-align: center;
        transition: opacity .4s ease;
        overflow: auto;
    }


.image-check {
    position: relative;
    cursor: pointer;
    display: inline-flex;
    flex-direction: column;
    text-align: center;
    width: 84px;
    padding: 12px;
}
.image-check > img {
    width: 100%;
}
.image-check.enabled:after {
    transform: scale(1);
}
.image-check:after {
    content: "✓";
    position: absolute;
    left: 14%;
    top: 0;
    display: inline-block;
    height: 1.8em;
    width: 1.8em;
    transition-duration: 0.4s;
    transform: scale(0);
    text-align: center;
    line-height: 1.8em;
    z-index: 1;
    background-color: green;
    color: white;
    border-radius: 50%;
}
</style>