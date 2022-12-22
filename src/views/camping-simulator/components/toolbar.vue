<template>
    <div :class="['hide-scrollbar',!this.vertical ? 'icon-bar' : 'vertical-icon-bar']">
        <template v-for="(t,index) in tabsToDisplay" >
            <span v-if="!vertical || (this.vertical && index !== 4)" :key="t.id" :class="{'active-icon-bar': tab === t.id}" @click="setTab(t.id, $event)" >
                <i v-if="t.class" :class="t.class"></i>
                <img v-else class="noselect" :src="t.img" :style="{marginBottom: '-10px', height: '40px', verticalAlign: this.vertical ? '' : 'text-top'}" />
            </span>
        </template>
    </div>
</template>

<script>
const tabs = [ /* Last element will be removed if in standalone mode (no vue router) */
  {id: 'add',           name: 'strings.add_heroes',             class: 'fa fa-plus',                                mobile: 'true' },
  {id: 'manage',        name: 'strings.your_heroes',            class: 'fa fa-pencil-alt',                          mobile: 'true' },
  {id: 'advanced',      name: 'strings.advanced_settings',      class: 'fa fa-book',                                mobile: 'true' },
  {id: 'results',       name: 'strings.results',                img: require('@/assets/camp-fire-icon-small.png'),  mobile: 'true' },
  {id: 'more',          name: 'strings.more',                   class: 'fas fa-ellipsis-h',                         mobile: 'true' },
  {id: 'teams',         name: 'strings.your_teams',             class: 'fa fa-save',                                mobile: 'false'},
  {id: 'maps',          name: 'strings.maps',                   class: 'fa fa-map',                                 mobile: 'false'},
  {id: 'usage-stats',   name: 'strings.camping_usage_stats',    class: 'fa fa-chart-bar',                           mobile: 'false'},
  {id: 'settings',      name: 'strings.settings',               class: 'fa fa-cog',                                 mobile: 'false'},
  {id: 'home',          name: 'strings.app_cecilia_tools',      class: 'fa fa-home',                                mobile: 'false'}
];

export default {
    name: 'ToolBar',
    props: {
        tab: {
            type: String,
            default: ''
        },
        vertical: {
            type: Boolean,
            default: false
        },
        standalone: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            tabs: []
        }
    },
    created() {
        var t = tabs.slice(0)
        if (this.standalone) t.pop();
        this.tabs = t;
    },
    computed: {
        tabsToDisplay() {
            return this.tabs.slice(0, this.vertical ? undefined : 5)
        }
    },
    methods: {
        setTab(tab,e) {
            if (tab==='more') {
                e.stopPropagation();
                e.preventDefault();
                this.$contextmenu(
                    {clientX: window.innerWidth-10, clientY: window.innerHeight-90},
                    tabs.slice(5).map( x => {
                        return {
                            class: x.class || '',
                            name: this.$t(x.name),
                            handler: () => this.$emit('set-tab', x.id)
                        }
                    }),
                    { mobile: false }
                )
            } else 
                this.$emit('set-tab', tab)
        }
    }
}
</script>

<style>

</style>