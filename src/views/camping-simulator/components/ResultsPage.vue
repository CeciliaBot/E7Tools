<template>
    <div style="width: 100%;">
        <div style="max-width: 900px; margin: auto;">
            <h1>{{ $t('strings.results') }}</h1>
            <table style="text-align: center; width: 100%;">
                <thead>
                    <th></th>
                    <th>{{ $t('strings.team') }}</th>
                    <th style="column-width: 400px;">{{ $t('strings.topics') }}</th>
                    <th>{{ $t('strings.morale') }}</th>
                </thead>
                <tbody>
                    <tr v-for="(result, i) in displayResults" :key="i">
                        <td @click="openSaveModal(result)" class="save-box" v-ripple-effect>
                            <i class="fa fa-save" />
                            <br>{{ i+1+25*(page-1) }}
                        </td>
                        <td>
                            <span v-for="row in [[0,1], [2,3]]" :key="'team-row'+row" style="display: inline-block;">
                                <template v-for="index in row" :key="i+'-hero-'+index">
                                    <HeroIcon v-if="result.team[index]" :hero="result.team[index]" :hover="false" :size="50" />
                                </template>
                            </span>
                        </td>
                        <td>
                            <div v-for="j in 2" :key="i + '-topic-' + j">
                                <b>{{ getHeroName(result.holder[j-1]) }}</b>: {{ $t('strings.'+result.topics[j-1]) }}
                            </div>
                        </td>
                        <td>
                            {{ result.morale }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-if="pages>1" class="glass-container" style="position: sticky; bottom: 0; white-space: nowrap; overflow: auto;">
            <Pagination
                :total-pages="pages"
                :total="results.length"
                :per-page="25"
                :current-page="page"
                @pagechanged="changeResultsPage"
            />
        </div>
        <SaveModal :camp="openResult" @close="closeSaveModal" @save="saveCamp" />
    </div>
</template>

<script>
import SaveModal from './SaveTeamModal.vue'
import Pagination from '@/components/Pagination.vue'

export default {
    components: {
        SaveModal,
        Pagination
    },
    props: {
        results: {
            type: Array,
            default: () => []
        }
    },
    watch: {
        results() {
            this.page=1
        },
        page() {
            if (this.$el && this.$el.scrollTo) {
                this.$el.parentNode.parentNode.scrollTo(0, 0)
            }
        }
    },
    computed: {
        displayResults() {
            var page = this.page-1;
            return this.results.slice(page*25, page*25+25)
        },
        pages() {
            return Math.ceil( this.results.length/25 )
        }
    },
    data() {
        return {
            page: 1,
            openResult: null
        }
    },
    methods: {
        getHeroName(hero) {
            return this.$store.getters.getHeroName(hero)
        },
        changeResultsPage(page) {
            this.page = page
        },
        openSaveModal(camp) {
            this.openResult = camp
        },
        closeSaveModal() {
            this.openResult = null
        },
        saveCamp(camp) {
            this.$emit('save-team', camp)
            this.closeSaveModal()
        }
    }
}
</script>

<style scoped>
    table {
        border-collapse: collapse;
    }
    tr:nth-child(even) {
        background: rgb(14 14 14 / 17%);
    }
    td.save-box {
        width: 45px;
        cursor: pointer;
        overflow: hidden;
        position: relative;
        border-right: solid 1px var(--font-color);
    }
</style>