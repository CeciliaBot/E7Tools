<template>
    <div style="height: 100%; width: 100%;">
        <div v-if="settings.backgroundImage" style="position: fixed;top: 0;left: 0;pointer-events: none;z-index: -1;opacity: 0.03;height: 100%;width: 100%;"><img src="https://d3kxs6kpbh59hp.cloudfront.net/community/COMMUNITY/e309bc955b464328ba48997869baa612/e2bbd13b405047668127ef11b7f685e6_1619683690.jpg" style="height: 100%;width: 100%;object-fit: cover;"></div>
        <NewTierList
            key="newTierListMenu"
            :class="{hide: !showNewComponent}"
            :canClose="hasSomethingInWorkspace"
            :version="VERSION"
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
    data: function () {
        return {
            VERSION: 1.62,
            current: {},                                                        // Current tier list open in workspace (Passed as prop to TierList component)
            showNewComponent: true,                                             // Show Tier list main menu
            hasSomethingInWorkspace: false,                                     // Show close button in TierListMainMenu
            canSaveAsNew: false,                                                // Toggle save as new in the tier list maker
            showSettingsModal: false,                                           // Shwo or hide tier list settings menu
            settings: {                                                         // Inject to all child components, from child components changes can be applied with setSettings(key, value)
                tierListMakerView: 0,                                           // 0 = side by side, 1 = vertical stack
                backgroundImage: 0,                                             // 0 = hide background image, 1 = show tier list maker background image
                rowLabelLayout: 0,                                              // 0 = full box, 1 = small box
                labelWidth: null,                                               // width of the label, can be adjusted by dragging the right border of the label
                tierRowControlsType: this.$store.state.isMobile ? 1 : 0,        // 0 grip to move, 1 = tiermaker.com style --> by default on mobile show buttons
                exportTitlessImage: false,                                      // Export to PNG without the tier list title showing
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
            // Use available id or generete a new one if the tier list is new
            data.id = this.current.id || time;
            data.created_at = this.current.created_at || time;
            data.updated_at = time;
            data.version = this.VERSION;
            this.$store.dispatch('SAVE_TIER_LIST', JSON.parse(JSON.stringify(data))).then( () => {
                this.canSaveAsNew = true;
                this.$snackbar.log({title: 'Saved successfully!'})
            }).catch(err => {
                this.$snackbar.error({title: 'Save failed', description: err})
            });
        },
        saveNewTierList(data) {
            let id = new Date().getTime(); // Always generate a new id for Save as New method, by doing this $store.dispatch('SAVE_TIER_LIST') will add the tier list as a new entry into the indexed DB
            data.id = id;
            data.created_at = id;
            data.updated_at = id;
            data.version = this.VERSION;
            this.$store.dispatch('SAVE_TIER_LIST', JSON.parse(JSON.stringify(data))).then( () => {
                this.$snackbar.log({title: 'Saved successfully!'})
            }).catch(err => {
                this.$snackbar.error({title: 'Save failed', description: err})
            });
        },
        exportAsJSON(data) {
            let time = new Date().getTime();
            data.id = this.current.id || time;
            data.created_at = this.current.created_at || null;
            data.updated_at = time;
            data.version = this.VERSION;
            exportAsJSON(data.name || 'TierList', data)
        }
    },
    beforeCreate() { // warn user when leaving the page to avoid losing progress
        window.onbeforeunload = function() {
            return true;
        };
    },
    beforeUnmount() {
        window.onbeforeunload = null;
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