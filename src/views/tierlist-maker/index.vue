<template>
    <div style="height: 100%; width: 100%;">
        <NewTierList
            key="newTierListMenu"
            :class="{hide: !showNewComponent}"
            :canClose="hasSomethingInWorkspace"
            @workTierList="loadTierListEvent"
            @close="closeNewTierListMenu"
            @settings="openTierListSettings"
        />
        <TierList
            key="tierListMain"
            :tierlist="current"
            :can-save-as-new="canSaveAsNew"
            @newTierList="openNewTierListMenu"
            @save="saveTierList"
            @saveAsNew="saveNewTierList"
            @exportAsJSON="exportAsJSON"
            @settings="openTierListSettings"
        />
        <KeepAlive>
            <TierListSettings
                v-if="showSettingsModal"
                @close="closeTierListSettings"
            />
        </KeepAlive>
    </div>
</template>

<script>
import { computed } from 'vue'
import tierListMakerMenu from './components/TierListMainMenu.vue'
import tierList from './components/TierList.vue'
import tierListSettingsComponent from './components/TierListSettings.vue'
/* Other stuff */
import exportAsJSON from '@/utils/saveJSON.js'

export default {
    name: 'tier-list-maker',
    components: {
        NewTierList: tierListMakerMenu,
        TierList: tierList,
        TierListSettings: tierListSettingsComponent
    },
    provide: function () {
        return {
            settings: computed(() => this.settings),                            // See data.settings
            setSettings: (key,val) => this.settings[key] = val
        }
    },
    created() {
    },
    data: function () {
        return {
            current: {},                                                        // Current tier list open in workspace (Passed as prop to TierList component)
            showNewComponent: true,                                             // Show Tier list main menu
            hasSomethingInWorkspace: false,                                     // Show close button in TierListMainMenu
            canSaveAsNew: false,                                                // Toggle save as new in the tier list maker
            showSettingsModal: false,                                           // Shwo or hide tier list settings menu
            settings: {                                                         // Inject to all child components, from child components changes can be applied with setSettings(key, value)
                tierListMakerView: 0,                                           // 0 = side by side, 1 = vertical stack
                rowLabelLayout: 0,                                                   // 0 = full box, 1 = small box
                tierRowControlsType: 0,                                         // 0 grip to move, 1 = tiermaker.com style
                iconSize: 75,
                showName: false,
                showRole: false,
                showRarity: false,
                fullArtwork: false                                              // True = use _su.png images, false = use _s.png images
            }
        }
    },
    renderTriggered (e) {console.log('Index', e)},
    computed: {
        tierListHistory() {
            return this.$store.getters.getTierListDB();
        }
    },
    methods: {
        setAsWorkspaceTierList(data) {
            this. current = JSON.parse(JSON.stringify(data))
        },
        openNewTierListMenu() {
            this.showNewComponent = true;
        },
        closeNewTierListMenu() {
            this.showNewComponent = false;
        },
        openTierListSettings() {
            this.showSettingsModal = true;
        },
        closeTierListSettings() {
            this.showSettingsModal = false;
        },
        loadTierListEvent(data) {
            // warn the user to save current progress before loading a new tier list
            if (!this.hasSomethingInWorkspace)
                this.loadTierList(data);
            else
                this.$promiseAlert(this.$t('strings.warning'), this.$t('strings.l_while_tier_list_open', ['<b>'+this.$t('strings.cancel')+'</b>']), [this.$t('strings.confirm'), this.$t('strings.cancel')]).then( ([answer]) => {
                    if (answer===0)
                        this.loadTierList(data);
                    else
                        this.closeNewTierListMenu();
                })
        },
        loadTierList(data) {
            this.showNewComponent = false;

            if (data.id) this.canSaveAsNew=true;
            else this.canSaveAsNew=false;

            this.setAsWorkspaceTierList(data);
            this.hasSomethingInWorkspace = true;
        },
        saveTierList(data) {
            let time = new Date().getTime();
            if (!this.current.id) // Use available id or generete a new one if the tier list is new
                data.id = time;
            else
                data.id=this.current.id;
            if (this.current.created_at)
                data.created_at = time;
            else
                data.created_at = time;
            data.updated_at = time;    
            this.$store.dispatch('SAVE_TIER_LIST', JSON.parse(JSON.stringify(data))).then( () => {
                this.canSaveAsNew = true;
            }).catch(err => {
                this.$snackbar.error({title: 'Save failed', description: err})
            });
        },
        saveNewTierList(data) {
            let id = new Date().getTime(); // Always generate a new id for Save as New method, by doing this $store.dispatch('SAVE_TIER_LIST') will add the tier list as a new entry into the indexed DB
            data.id = id;
            data.created_at = id;
            data.updated_at = id;
            this.$store.dispatch('SAVE_TIER_LIST', JSON.parse(JSON.stringify(data)))
        },
        exportAsJSON(data) {
            let time = new Date().getTime();
            if (!this.current.id)
                data.id = time;
            else
                data.id=this.current.id;
            if (this.current.created_at)
                data.created_at = time;
            else
                data.created_at = time;
            data.updated_at = time;
            exportAsJSON(data.name || 'TierList', data)
        }
    },
    beforeRouteLeave: async function() {
        if (!this.hasSomethingInWorkspace)
            return true;
        let answer = await this.$promiseAlert(this.$t('strings.warning'), this.$t('strings.l_while_tier_list_open', ['<b>'+this.$t('strings.cancel')+'</b>']), [this.$t('strings.confirm'), this.$t('strings.cancel')]);
        if (Array.isArray(answer) && answer[0] === 1) return false; // User clicked "NO" don't leave
    }
}
</script>

<style>
.hide {
    display: none !important;
}
</style>