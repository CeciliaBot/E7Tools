<template>
    <div class="team-card">
        <h1 :class="[team.gameMode.join(' ')]" :style="{'background-image': backgroundImages }">
            <div class="options" @click="deleteTeam" v-tooltip=" () => $t('strings.delete')"><i class="fa fa-trash" /></div>
            <span><i v-if="team._type==='friendship'" class="far fa-heart" />{{ team.name }}</span>
        </h1>
        <div>
            <TeamFormation :team="team.team" :editable="false" :add="false" :remove="false" />
            <div class="morale-box">{{ $t('strings.morale') }}: {{ team.morale }}</div>
            <div class="topic-box">
                <div v-for="n in 2" :key="team.id+'topic'+n">
                    <span>
                        <b>{{ getHeroName(team.holder[n-1]) }}</b>: {{$t('strings.'+team.topics[n-1])}}
                    </span>
                </div>
            </div>
            <div>{{ team.description }}</div>
        </div>
    </div>
</template>

<script>
import TeamFormation from '@/components/TeamFormation.vue'
import { enemies } from '../util/constant.js'


export default {
    emits: ['delete'],
    components: {
        TeamFormation
    },
    props: {
        team: {
            type: Object,
            default: () => {}
        }
    },
    computed: {
        backgroundImages() {
            return enemies.filter(enemy => this.team.enemy.includes(enemy[0])).map(enemy => 'url(' + enemy[1] + ')').join(', ')
        }
    },
    methods: {
        getHeroName: function (id) {
            return this.$store.getters.getHeroName(id);
        },
        deleteTeam() {
            this.$emit('delete', this.team)
        }
    }
}
</script>

<style>
    .azmakalis_hell {
        background-color: #7c001e !important;
        color: white !important;
    }
    .azmakalis_nightmare {
        background-color: #6c007c !important;
        color: white !important;
    }
</style>
