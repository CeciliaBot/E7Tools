<template>
    <FloatingWindow ref="search-window"  :wid="wid" :minheight="81" @close="close" :glass-window="!lowEndMode">
        <template v-slot:icon><i class="fas fa-search"></i></template>
        <template v-slot:title>Quick Search</template>
        <div ref="el" style="max-width: 960px; margin: auto;">
            <div class="nsearchbar" style="display: inline-block; display: flex; flex: 1; overflow: hidden; position: relative; height: 40px;" v-ripple-effect>
                <input ref="tierlist-maker-search-bar" @input="typingSearch" :value="searchQuery" style="background-color: #575656ad" :placeholder="`${$t('strings.search')}...`"  @keydown="(e)=> {e.key === 'enter'||e.keyCode === 13?this.goToAddition(1):null}" autocomplete="off">
                <div class="go" @click="searchQuery = '', $event.currentTarget.previousSibling.focus()">
                    <i :class="['fa', {'fa-search': !searchQuery, 'fa-times': searchQuery}]"></i>
                </div>
                <div :class="['go', {disabled: !results.length}]" @click="goToAddition(-1)">
                    <i class="fa fa-angle-up"></i>
                </div>
                <div :class="['go', {disabled: !results.length}]" @click="goToAddition(+1)">
                    <i class="fa fa-angle-down"></i>
                </div>
            </div>
            <!-- <div style="text-align:center;"><div v-for="val, key in timelineData" :key="key">{{key}}</div></div> -->
            <div class="search-content hide-scrollbar">
                <table class="table">
                    <thead>
                        <th>Type</th>
                        <th style="column-width: 400px;">Match</th>
                        <th>Date 1</th>
                        <th>Length</th>
                        <th>Time</th>
                    </thead>
                    <tbody>
                        <tr v-for="rotation,i in results" :key="'result-'+i" :class="{active: i===currResult}" @click="() => goToEvent(rotation, i)">
                            <td><img v-if="timelineData[rotation._type].icon" :src="timelineData[rotation._type].icon" style="height: 1.5em; vertical-align: middle;" crossorigin="anonymous" samesite="Lax" /><span v-else>{{ rotation._type }}</span></td>
                            <td style="max-width: 300px; overflow: clip;">{{ rotation._searchMatch }}</td>
                            <td>{{ $d(rotation.dt[0], 'long', 'en') }}</td>
                            <td>{{ isNaN(rotation.size) ? '' : Math.round(rotation.size) }}</td>
                            <td>{{ rotation._elapsed }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </FloatingWindow>
</template>

<script>
import FloatingWindow from '@/layout/FloatingWindow.vue'
import { debounce } from '@/utils/helpers.js'
import { fullDateDiff2 } from '@/utils/dates.js'
import config from '../config.js'

export default {
    emits: ['goTo', 'close'],
    inject: ['lowEndMode'],
    components: {
        FloatingWindow
    },
    props: {
        events: {
            type: Object,
            required: true
        },
        wid: {
            type: String
        }
    },
    data() {
        return {
            timelineData: config.supportedTimelines,
            searchEvents: [],
            searchQuery: '',
            results: [],
            currResult: 0
        }
    },
    watch: {
        searchQuery() {
            this.results = this.searchFunction(this.searchQuery)
            this.$nextTick(()=>this.goToEvent(this.results[0], 0))
        }
    },
    mounted() {
            this.$refs['search-window'].outsideSetFocus()
            this.focusSearchBar()
    },
    methods: {
        close() {
            this.searchQuery = ''
            this.results = [],
            this.currResult = 0
            this.$emit('close', this.wid)
        },
        goToAddition(n) {
            this.goToEventN(this.currResult+n)
        },
        goToEventN(n) {
            this.currResult = n
            if (this.currResult < 0)
                this.currResult = Math.max(this.results.length -1, 0)
            else if (this.currResult >= this.results.length)
                this.currResult = 0;
            this.goToEvent(this.results[this.currResult], this.currResult)
        },
        goToEvent(rotation, i) {
            if (!rotation)
                return;
            this.currResult = i
            this.$emit('goTo', rotation)
        },
        outsideSetFocus() { // set windows focus from outside the component
            this.$refs['search-window'].outsideSetFocus()
            this.focusSearchBar()
        },
        focusSearchBar: function () {
            this.focusInput();
            this.selectInputContent();
        },
        focusInput: function () {
            this.$nextTick(()=>{this.$refs['el'].querySelector('input').focus()})
        },
        selectInputContent: function () {
            this.$nextTick(()=>{this.$refs['el'].querySelector('input').select()})
        },
        typingSearch: debounce( function(e) {
            this.searchQuery = e.target.value.trim()
        }, 400),
        buildResultObject(ev) {
            return JSON.parse(JSON.stringify(ev))
        },
        elapsed(d) {
            return fullDateDiff2(Date.now(), d).map( (val, index) => {
                if (index===3) {
                    if (val)
                        return 'ago'
                    else
                        return ''
                }
                else if (!val)
                    return ''
                else
                    return val + ['Y','M','D'][index]
            }).join(' ')
        },
        searchFunction(keyword) {
            if (!keyword) return [];
            try {
                var ev = this.events;
                var results = [];
                const reg = new RegExp('(\\b|-)'+keyword, 'i');
                for (var key in ev) {
                    if (this.searchEvents.length && !this.searchEvents.includes(key))
                        continue;
                    for (var i=0; i<ev[key].length; i++) {
                        var rotation = ev[key][i],
                            cev,
                            found = false;

                        if (rotation.name && reg.test(rotation.name)) {
                            cev = this.buildResultObject(rotation)
                            cev._searchMatch = rotation.name+''
                            cev._type = key
                            cev._elapsed = this.elapsed(cev.dt[0])
                            results.push(cev)
                            continue;
                        }
                        if (rotation.c) {
                            for (var j = 0; j<rotation.c.length; j++) {
                                var name = this.$store.getters.getHeroName(rotation.c[j].id);
                                if (reg.test(name)) {
                                    cev = this.buildResultObject(rotation)
                                    cev._searchMatch = name+''
                                    cev._type = key
                                    cev._elapsed = this.elapsed(cev.dt[0])
                                    results.push(cev)
                                    found = true;
                                    break;
                                }
                            }
                            if (found)
                                continue;

                        }
                        if (rotation.a) {
                            for (var j1 = 0; j1<rotation.a.length; j1++) {
                                var aname = this.$store.getters.getArtifactName(rotation.a[j1].id);
                                if (reg.test(aname)) {
                                    cev = this.buildResultObject(rotation)
                                    cev._searchMatch = aname+''
                                    cev._type = key
                                    cev._elapsed = this.elapsed(cev.dt[0])
                                    results.push(cev)
                                    found = true;
                                    break;
                                }
                            }
                            if (found)
                                continue;

                        }
                    }
                }
                return results.sort( (a,b) => {
                    return b.dt[1] - a.dt[0]
                })
            } catch (e) {
                return []
            }
        }
    }
}
</script>

<style scoped>
    .search-content {
        width: 100%;
        padding: 10px;
        overflow: auto;
    }
    .table {
        border-collapse: collapse;
        background-color: var(--background-modifier-darken-alpha);
        width: 100%;
        height: 100%;
        border-radius: 3px;
        white-space: nowrap;
        text-align: center;
    }
    .table tr {
        position: relative;
        cursor: pointer;
    }
    .table tr.active {
        background-color: rgba(255, 255, 255, 0.35);
    }
    .table tr:hover {
        background-color: rgba(255, 255, 255, 0.35);
    }
    .table td {
        padding: 10px;
    }
</style>