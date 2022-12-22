<template>
    <Modal @close="$emit('close')" >
        <template v-slot:title>Hero Usage Data (OLD)</template>
        <div>
            <div class="flex">
                <div class="flex-fill pointer relative overflow-hidden mat-hover" @click="toDisplay = 'team'" v-ripple-effect>
                    {{ $t('strings.team') }}
                </div>
                <div class="flex-fill pointer relative overflow-hidden mat-hover" @click="toDisplay = 'hero'" v-ripple-effect>
                    {{ $t('strings.hero') }}
                </div>
            </div>
            <div v-if="response.totale">Total number of teams in the database: {{ response.totale || 0 }}</div>
            <div v-if="fetching">Getting data...</div>
            <table v-else style="margin: auto;">
                <thead>
                    <th>{{ $t('strings.team') }}</th>
                    <th>{{ $t('strings.morale') }}</th>
                    <th>{{ $t('strings.teams') }}</th>
                </thead>
                <tbody>
                    <tr v-for="comp,i in displayData" :key="i">
                        <td>
                            <HeroIcon v-for="hero in comp.team" :key="hero" :hero="hero" :showrole="false" :hover="false" :size="50" />
                        </td>
                        <td>
                            {{ comp.morale }}
                        </td>
                        <td>
                            {{ comp.usi }} ({{Math.round(( (comp.usi/response.totale*100)+ Number.EPSILON) * 100) / 100}}%)
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </Modal>
</template>

<script>
import Modal from '@/layout/modal.vue'
import ajax from '@/utils/ajax.js'

export default {
    components: {
        Modal
    },
    data() {
        return {
            fetching: true,
            fetchError: false,
            toDisplay: 'team',
            response: {data: [], characters: []}
        }
    },
    computed: {
        displayData() {
            return this.toDisplay === 'team' ? this.response.data : this.response.characters
        }
    },
    created() {
        ajax('https://ceciliabotgithub.glitch.me/team_statistics').then( response => {
            response = JSON.parse(response)
            response.data = response.data.slice(0, 200)
            response.characters.forEach( ch => {
                ch.team = [ch.character]
            })
            this.response = response
        }).catch(err => {
            this.fetchError = err;
        }).then( () => {
            this.fetching = false;
        })
    }
}
</script>

<style scoped>
    .usage-bar {
        height: 40px;
        background: linear-gradient(90deg, var(--font-color-primary), var(--font-color-confirm));
        border-radius: 8px;
    }
</style>