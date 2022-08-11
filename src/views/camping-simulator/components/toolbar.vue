<template>
    <div :class="['hide-scrollbar',!this.vertical ? 'icon-bar' : 'vertical-icon-bar']">
        <template v-for="(t,index) in tabsToDisplay" >
            <span v-if="!vertical || (this.vertical && index !== 4)" :key="t.click" :class="{'active-icon-bar': tab === t.click}" @click="setTab(t.click, $event)" >
                <i v-if="t.class" :class="t.class"></i>
                <img v-else class="noselect" :src="t.img" :style="{marginBottom: '-10px', height: '40px', verticalAlign: this.vertical ? '' : 'text-top'}" />
            </span>
        </template>
    </div>
</template>

<script>
const tabs = [ /* Last element will be removed if in standalone mode (no vue router) */
  {tab: 'Add Heroes', tooltip: 'Add heroes to your roster', class: 'fa fa-plus', click: 'add', mobile: 'true'},
  {tab: 'Manage Heroes', tooltip: 'Manage your roster', class: 'fa fa-pencil-alt', click: 'manage', mobile: 'true'},
  {tab: 'Adavanced Settings', tooltip: '(Optional) Advanced settings', class: 'fa fa-book', click: 'advanced', mobile: 'true'},
  {tab: 'Calculate Results', tooltip: 'Go camping', img: require('@/assets/camp-fire-icon-small.png'), click: 'calculate', mobile: 'true'},
  {tab: 'More', tooltip: 'Click for more tools', class: 'fas fa-ellipsis-h', click: 'more', mobile: 'true'},
  {tab: 'Saved Teams', tooltip: 'View your teams', class: 'fa fa-save', click: 'recorded', mobile: 'false'},
  {tab: 'Maps', tooltip: 'Labyrinth routes', class: 'fa fa-map', click: 'maps', mobile: 'false'},
  {tab: 'Character Usage', tooltip: 'Character usage stats on this website', class: 'fa fa-chart-bar', click: 'usage-stats', mobile: 'false'},
  {tab: 'Settings', tooltip: 'Settings', class: 'fa fa-cog', click: 'settings', mobile: 'false'},
  {tab: 'Main menu', tooltip: 'E7 Tools main menu', class: 'fa fa-home', click: 'home', mobile: 'false'}
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
            tabs: tabs
        }
    },
    created() {
        if (this.standalone)
            this.tabs.pop();
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
                            name: x.tab,
                            handler: () => this.$emit('set-tab', x.click)
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