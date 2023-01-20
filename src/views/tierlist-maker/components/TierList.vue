<template>
    <div :class="['tier-maker-container tier', {mobileView: this.mobile, 'force-stack-view': settings.tierListMakerView===1}]">
        <div key="desktop-buttons" class="tier-draw-area">
            <!-- Show desktop tier list buttons -->
            <div v-if="!mobile" class="tier-control-buttons glass-container" style="top: -10px" data-html2canvas-ignore>
                <button @click="toggleTierListType" style="float: left" v-tooltip="() => $t('strings.tier_list_type')">
                    <i class="icon fas fa-border-all" style="margin-right: 6px"></i>
                    {{ !this.tierType? this.$t('strings.alignment_chart') : this.$t('strings.row_tier_chart') }}
                </button>
                <button @click="$emit('newTierList')" v-tooltip="() => $t('strings.new_tier_list')">
                    <i class="icon fas fa-folder-open"></i> {{ $t('strings.menu') }}
                </button>
                <button v-show="!tierType && !compare" @click="showCompareModal=true" v-tooltip="() => $t('strings.compare')">
                    <i class="icon fas fa-exchange-alt" />
                </button>
                <button v-show="!tierType && compare" @click="compare=false" v-tooltip="() => $t('strings.stop_compare')">
                    <i class="icon fas fa-times" />
                </button>
                <button @click="saveTierList" v-tooltip="() => $t('strings.save')">
                    <i class="icon fas fa-save"></i>
                </button>
                <button v-show="canSaveAsNew" @click="saveNewTierList" style="position: relative" v-tooltip="() => $t('strings.save_as_new')">
                    <span class="icon-stack">
                        <i class="icon fas fa-save" style="margin-right: 0;"></i>
                        <i class="icon fa fa-plus" style="position: absolute;top: 7px;left: 25px;font-size: 0.6em;"></i>
                    </span>
                </button>
                <button @click="exportAsJSON" v-tooltip="() => $t('strings.export_as', ['JSON'])">
                    <i class="icon fas fa-file-code"></i>
                </button>
                <button @click="exportAsPNG" v-tooltip="() => $t('strings.export_as', ['PNG'])">
                    <i class="icon fas fa-download"></i> {{ $t('strings.export_as', ['PNG']) }}
                </button>
                <button @click="$emit('settings')" style="float: right;" v-tooltip="() => $t('strings.settings')">
                    <i class="icon fas fa-cog"></i>
                </button>
                <!-- <button @click="$localePicker" style="float: right;" v-tooltip="() => $t('strings.language')">
                    <i class="icon fas fa-globe"></i>
                </button> -->
            </div>
            <template v-else>
                <MobileFloatingMenu
                    :options="mobileMenuOptions"
                    @new="$emit('newTierList')"
                    @save="saveTierList"
                    @saveAsNew="saveNewTierList"
                    @exportJSON="exportAsJSON"
                    @exportPNG="exportAsPNG"
                    @toggleTierType="toggleTierListType"
                    @compare="showCompareModal=true"
                    @stopCompare="compare=false"
                    @settings="$emit('settings')"
                    @filters="openFilterModal"
                />
            </template>

            <!-- Normal Tier list-->
            <div v-show="!tierType" id="tiers" class="tier-drop-area" :style="{'--label-width': labelWidth + 'px'}">
                <EmotableBox key="tier-list-title-main" class="tier-list-title" :value="tierListName" :icon="true" @update="updateTierListTitle" />
                <TierListTable
                    :tiers="tiers"
                    :itemList="charList"
                    @rename-tier-row="renameTierRow"
                    @move-tier-row="moveTierRow"
                    @clear-tier-row="clearTierRow"
                    @delete-tier-row="deleteTierRow"
                    @new-tier="addNewTierRow"
                />
                <div class="new-tier-box noselect" style="height: 100px;" @click="addNewTierRow" data-html2canvas-ignore>
                    <i class="fa fa-plus"></i>
                    <span>{{ $t('strings.add_new_tier') }}</span>
                </div>
            </div>
            <div v-if="tierType===1" class="xy-graph-container">
                <ScalableDIV
                    id="AlignChart"
                    :height="2500"
                    :width="2500"
                    :maxzoom="5"
                    :minzoom="0.03"
                    padding="70 70 70 70"
                ><!-- ScalableDIV's ID is used during export as png -->
                    <TierListXY 
                        key="XYGraph"
                        :list="xy.list"
                        :axes="xy.names"
                    />
                </ScalableDIV>
            </div>
        </div><!-- Tier List area over -->

        <div key="hero-box" :class="{'mobile-list': mobile, 'desktop-list':  !mobile}" :style="{width: mobile ? '' : desktopHeroBoxWidth+1 + 'px'}">
            <!-- Desktop character box buttons -->
            <div v-if="!mobile" class="tier-control-buttons glass-container" style="margin: 0; text-align: end; position: sticky; top: 0; z-index: 1; display: flex; margin-bottom: 5px;">
                <div class="nsearchbar" style="display: inline-block; display: flex; flex: 1; overflow: hidden; position: relative;" v-ripple-effect>
                    <input ref="tierlist-maker-search-bar" @input="typingSearchQuery" :value="filterModel.name" style="background-color: #575656ad" :placeholder="`${$t('strings.search')}...`" autocomplete="off">
                    <div class="go" @click="filterModel.name='', $event.currentTarget.previousSibling.focus()">
                        <i :class="['fa', {'fa-search': !filterModel.name, 'fa-times': filterModel.name}]"></i>
                    </div>
                </div>
                <button class="noselect" style="border: solid thin;" @click="openFilterModal">
                    <i class="fa fa-filter"></i>
                    <span style="font-size: 1.3em; padding: 0 5px;">{{ $t('strings.filter') }}</span>
                </button>
            </div>
            <TierListItemBox
                :list="charList"
                :tierType="tierType"
            />
        </div>
        <KeepAlive>
            <CompareModal
                v-if="showCompareModal"
                :type="elementType"
                @load="console.log('comparing')"
                @compare="compare=$event"
                @close="showCompareModal=false"
            />
        </KeepAlive>
        <FilterModal
            ref="filter-modal"
            v-show="showFilterModal"
            :sorting="sort"
            :filter="filterModel"
            @close="closeFilterModal"
        >
            <div key="filter-option" v-if="showFilterModal">
                <label class="custom-check" style="margin: 5px">
                  <input type="checkbox" :checked="filterPlacedElements" @change="filterPlacedElements = $event.target.checked" />
                  <span class="checkmark"></span>
                  {{ $t('strings.apply_filter_to_ranked') }}
                </label>
                <label class="custom-check" style="margin: 5px">
                  <input type="checkbox" :checked="filterModel.hasSkins" @change="filterModel.hasSkins = $event.target.checked" />
                  <span class="checkmark"></span>
                  {{ $t('strings.has_skin') }}
                </label>
            </div>
        </FilterModal>
        <ItemComment v-if="openCommentModal" :name="getItemName(openCommentModal)" :comment="getItemComment(openCommentModal)" @setcomment="updateItemComment" @close="openCommentModal=false" />
    </div>
</template>

<script>
import { computed } from 'vue'
import { computePosition, offset, shift, flip } from '@floating-ui/dom'; // calculate filter modal position

import tierListTable from './TierListTable.vue'
import XYGraphComponent from './TierListXY.vue'
import tierListItemBoxComponent from './TierListItemBox.vue'
import tierListCompareModalComponent from './TierListCompareModal.vue'
import filterModalComponent from '@/components/filter-modal.vue'
import emoteEditableBoxComponent from '@/components/EmoteableDiv.vue'
import scalableComponent from '@/layout/interactive.vue'
import commentEditorComponent from './TierListItemComment.vue'

import ajax from '@/utils/ajax.js'
import { newTierRow } from '../utils/newTierRow.js'
import arrayMove from '../utils/array-move.js'
import sort from '@/utils/sort-heroes.js'
import { debounce } from '@/utils/helpers.js'
import { stringToHtmlEmotes } from '@/utils/text-to-emoji.js'
import { cdn } from '@/utils/constant.js'
import exportAsPNG from '../utils/export-as-png.js'

export default {
    name: 'TierList',
    components: {
        TierListTable: tierListTable,
        TierListItemBox: tierListItemBoxComponent,
        TierListXY: XYGraphComponent,
        ItemComment: commentEditorComponent,

        CompareModal: tierListCompareModalComponent,
        FilterModal: filterModalComponent,
        EmotableBox: emoteEditableBoxComponent,
        ScalableDIV: scalableComponent
    },
    provide() {
        return {
            tierItemsMask: computed( () => this.tierItemsMask),
            elementType: computed( () => this.elementType),
            getItemId: this.getItemId,
            getItemName: this.getItemName,
            getItemComment: this.getItemComment,
            getItemTooltip: this.getItemTooltip,
            itemContextMenu: this.itemContextMenu,
            iconPadding: computed( () => this.iconPadding),
            iconFullSize: computed( () => this.iconFullSize),
            skin: computed( () => this.skin),
            compareTiers: computed( () => this.compare),
        }
    },
    inject: ['settings', 'setSettings'],
    props: {
        tierlist: {
            type: Object,
            default: function () {
                return {}
            }
        },
        canSaveAsNew: {
            type: Boolean,
            default: false
        }
    },
    //renderTriggered (e) {console.log('TierList', e)},
    watch: {
        'tierlist': function (n, o) {
            if (n.type && n!==o) { /* Use has clicked on a new tier list -> load into workspace */
                this.$store.commit('loading', true);
                this.getDatabasePromise(n.type).then(response => {
                    this.database = response;
                    //this.autosaveTimer = setInterval( this.autosave, 120000 ); // autosave every 2 minutes
                    
                    this.updateTierListTitle(n.name);
                    this.tierId = n.id;
                    this.elementType = n.type;
                    this.tierType = n.tier_type || 0;
                    this.tierListName = n.name || '';
                    this.tiers = n.tiers || [];
                    this.xy = n.xy || {}; if (!this.xy.names) this.xy.names=[]; if (!this.xy.list) this.xy.list=[];
                    this.skin = n.skin || {};
                    this.comments = n.comments || {};
                    this.clones = n.clones || {}

                    this.setSettings('labelWidth', n.labelWidth)

                    // Applay filter and sort
                    this.buildItemList();
                    this.$snackbar.log({title: stringToHtmlEmotes(n.name), description: 'Tier list loaded' })
                }).catch(err => {
                    console.error(err);
                    this.$snackbar.warn({title: 'Error', description: 'Tier list loading failed' })
                }).finally(() => {
                    this.$store.commit('loading', false);
                })
            }
        },
        tierType: function () {
            this.buildItemList();
        },
        filterModel: {
            deep: true,
            handler: function() {
                this.applyFilter()
            }
        },
        filterPlacedElements: function() {
            this.applyFilter()
        },
        sort: {
            deep: true,
            handler: function() {this.sortList(this.charList, this.sort[0], false);}
        }
    },
    data: function() {
        return {
            autosaveTimer: null,
            openCommentModal: false,                                                                      // This will be set to the item's value when opening comment modal
            showCompareModal: false,                                                                      // Show / hide compare modal
            compare: false,                                                                               // Tier list currently comparing to

            database: {},                                                                                 // Container for tier list item data
            showFilterModal: false,
            sort: ['rarity', false],                                                                      // sort by, reversed
            filterModel: {name: '', hasSkins: false, rarity: [], attribute: [], role: [], zodiac: [], sex: []},
            filterPlacedElements: false,                                                                  // true if Elements in the tier list must be filtered
            tierItemsMask: {},                                                                            // set visisbility for the tier list items according to the current filter

            tierType: 0,                                                                                  // tier layout; type 1 === xy
            elementType: 'character',                                                                     // supported 'artifact' and 'character' to add more the mthod getDatabasePromise must be updated first
            tierId: null,
            tierListName: 'CeciliaBot Tier List Maker',
            charList: [],
            tiers: [],
            xy: {names: [], list: []},
            comments: {},                                                                                 // charcter comments
            skin: {},                                                                                     // alternative icons to use
            clones: {}                                                                                    // pair of clones and original element example: 'clone804303040': 'alencia'
        }
    },
    mounted() {
        window.addEventListener('keydown', this.focusSearchBar)
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.focusSearchBar)
        if (this.autosaveTimer) {
            this.autosaveTimer.clearInterval()
            this.autosaveTimer = null
        }
    },
    computed: {
        mobile() {
            return this.$store.getters.getIsMobile();
        },
        labelWidth() {
            return this.settings.labelWidth || 100
        },
        iconSize() {
            return this.settings.iconSize;
        },
        fullArtwork() {
            return this.settings.fullArtwork;
        },
        iconPadding() {
            return this.settings.showRole || this.settings.showName;
        },
        iconFullSize: function () {
            return this.iconSize*(this.iconPadding ? 1.32 : 1);
        },
        desktopHeroBoxWidth: function () {
            var target = 350;
            var icon = this.iconFullSize;
            var n = 1;
            for (var i=1; i<10;i++) {
                var size  = i*icon;
                if (size>=target) {
                    if (size<target+50) n = i;
                    else n=i-1||1
                    break;
                }
            }
            return icon*n; // 1.32 = padding*2 + icon size(100%) = in this case 0.16*2+1;
            // n = number of icons we want to fit for each row
        },
        mobileMenuOptions() {
            var o = [
                {title: this.$t('strings.new_tier_list'), class: 'fa fa-plus', click: 'new'},
                {title: this.$t('strings.save'), class: 'fa fa-save', click: 'save'},
                {title: this.$t('strings.export_as', ['JSON']), class: 'fas fa-code', click: 'exportJSON'},
                {title: this.$t('strings.export_as', ['PNG']), class: 'fas fa-download', click: 'exportPNG'},
                {title: this.tierType===0?'Alignment chart':'Classic tierlist', class: 'fas fa-border-all', click: 'toggleTierType'},
                {title: this.$t('strings.settings'), class: 'fa fa-cog', click: 'settings'},
                {title: this.$t('strings.filter'), class: 'fa fa-filter', click: 'filters'}
            ];
            if (this.tierType===0) o.splice( 5, 0, !this.compare? { title: this.$t('strings.compare'), class: 'fas fa-exchange-alt', click: 'compare' } : { title: this.$t('strings.stop_compare'), class: 'fas fa-times', click: 'stopCompare' }  )
            if (this.canSaveAsNew) o.splice( 2, 0, {title: this.$t('strings.save_as_new'), class: 'fa fa-save', click: 'saveAsNew'});
            return o;
        }
    },
    methods: {
        updateTierListTitle(title) {
            this.tierListName = title;
            document.title = title + ' | ' + this.$t('strings.app_tier_list_maker');
        },
        toggleTierListType() {
            this.tierType = this.tierType===0?1:0;
        },
        buildItemList() {
            this.charList = [...Object.keys(this.database), ...Object.keys(this.clones)]
            if (!this.tierType) { // remove every ranked item
                this.tiers.forEach(tier => {
                    tier.list.forEach(el => {
                      var i = this.charList.indexOf(el)
                      if (i!==-1)
                        this.charList.splice(i, 1)
                    })
                })
            } else { // remove cartesian items
                for (var i in this.xy.list) {
                    var j = this.charList.indexOf(this.xy.list[i].id)
                    if (j!==-1)
                      this.charList.splice(j, 1)
                }
            }
            this.charList.forEach(el => this.tierItemsMask[el] = true)
            this.applyFilter();
            this.sortList(this.charList, this.sort[0], false);
        },
        getDatabasePromise: function (type) {
            switch (type) {
                case 'artifact':
                    return this.$store.dispatch('GET_ARTIFACT_DB');
                case 'character':
                default:
                    return new Promise((resolve, reject) => {
                        Promise.all([
                            this.$store.dispatch('GET_HERO_DB'),
                            ajax('./data/HeroSkins.json').then( data => {return JSON.parse(data)}).catch( () => {return {}}),
                        ]).then( (data) => {
                            let db = data[0],
                                skins = data[1];
                            for (var key in skins) {
                                if (db[key] && !db[key].skin)
                                    db[key].skin = skins[key];
                                }
                            resolve(db);
                        }).catch(err => {
                            reject(err);
                        });
                    });
            }
        },
        getItem: function (h) {
            var id = this.clones[h] || h;
            return this.database[id] || {id: id, _id: id};
        },
        getItemId: function (id) {
            // Get the database reference item id -> for normal items is the id for clones is the original item
            return this.clones[id] || id
        },
        getItemName: function (h) {
            var id = this.clones[h] || h;
            switch (this.elementType) {
                case 'character':
                    return this.$store.getters.getHeroName(id);
                case 'artifact':
                    return this.$store.getters.getArtifactName(id);
                default:
                    return id;
            }
        },
        getItemComment: function (id) {
            return this.comments[ id ];
        },
        cloneItem(id) {
            var cloneId = id+''+Date.now()
            this.clones[cloneId] = id;
            this.tierItemsMask[cloneId] = true;
            if (this.skin[id])
                this.skin[cloneId] = this.skin[id];
            return cloneId;
        },
        destroyClone(cloneId) {
            delete this.comments[cloneId]
            delete this.skin[cloneId]
            delete this.clones[cloneId]
        },
        isClone(id) {
            return this.clones[id] != null
        },
        addNewTierRow(index) {
            newTierRow(this.tiers, index)
        },

        /******************************************** Save and export methods  ********************************************/
        tierListToObject() {
          return {
            id: 0,
            tier_type: this.tierType,
            type: this.elementType,
            labelWidth: this.settings.labelWidth,
            name: this.tierListName,
            tiers: this.tiers,
            xy: this.xy || {},
            skin: this.skin,
            comments: this.comments,
            clones: this.clones
          }
        },
        autosave() {
            // run on beforeUnmount or window.onbeforeunload if any changes are made to the tier list
            localStorage.setItem('TierListAutosave', JSON.stringify(this.tierListToObject()))
        },
        saveTierList() {
            this.$emit('save', this.tierListToObject());
        },
        saveNewTierList() {
            this.$emit('saveAsNew', this.tierListToObject());
        },
        exportAsJSON() {
            this.$emit('exportAsJSON', this.tierListToObject());
        },
        exportAsPNG() {
            exportAsPNG(this);
        },

        /******************************************** Filter and Search methods  ********************************************/
        openFilterModal: function(e) {
            this.showFilterModal=true;
            if (this.mobile) return;
            this.$nextTick( () => {
                computePosition(e.currentTarget, this.$refs['filter-modal'].$el.firstChild, {
                    strategy: 'fixed',
                    placement: 'bottom-end',
                    middleware: [
                        offset(5),
                        shift(),
                        flip()
                    ]
                }).then( ({x, y}) => {
                    this.$refs['filter-modal'].$.props.xy = {
                        top: y+'px',
                        left: x+'px'
                    }
                })
            })
        },
        closeFilterModal: function() {
            this.showFilterModal=false;
        },
        applyFilter: function() {
            for (const item in this.tierItemsMask) { // set true to hide icon
                let isRanked = !this.charList.includes(item);
                this.tierItemsMask[item] = isRanked && !this.filterPlacedElements ? true : this.applyFilterItem(this.filterModel, item);
            }
        },
        focusSearchBar(e) {
            if (e.ctrlKey && e.key == 'f')
              e.preventDefault(),
              this.$refs['tierlist-maker-search-bar'].focus(),
              this.$refs['tierlist-maker-search-bar'].select();
        },
        typingSearchQuery: debounce( function(e) {
            this.filterModel.name = e.target.value
        }, 300),
        applyFilterItem: function (filter, hero) {
            for (const f in filter) {
                if (f==='name') {
                    if (this.getItemName(hero).toLowerCase().indexOf(filter[f].toLowerCase()) === -1) return false;
                    continue;
                }
                if (f==='hasSkins' && filter[f]) {
                    if (!this.getItem(hero).skin) return false;
                    continue;
                }
                var v = filter[f];
                if (v.length && !v.includes(this.getItem(hero)[f])) return false;
            }
            return true;
        },
        sortList: function (list, by, disableReversed=false) {
            const reverse = disableReversed ? false : this.sort[1];
            return sort(
                list,
                by,
                reverse,
                this.getItem
            );
        },
        
        /******************************************** Misc stuff  ********************************************/
        getItemTooltip(item) {
            return '<p style="text-align: center">'+this.getItemName(item) + '</p>' + stringToHtmlEmotes( this.getItemComment(item) || '' )
        },
        updateItemComment(value) {
            this.comments[this.openCommentModal] = value;
        },
        itemContextMenu(item, e, list) {
            var data = this.getItem(item),
            options = [
                {
                    name: this.$t('strings.edit_item_comment'),
                    class: 'fas fa-edit',
                    handler: () => {this.openCommentModal = item}
                }
            ];
            if (list) {
                options.push({
                    name: this.$t('strings.clone_item'),
                    class: 'far fa-clone',
                    handler: () => {
                        list.splice(list.indexOf(item)+1, 0, this.cloneItem(this.getItemId(item)))
                    }
                })
                if (this.isClone(item)) {
                    options.push({
                        name: this.$t('strings.destroy_clone'),
                        class: 'far fa-times-circle',
                        handler: () => {
                            list.splice(list.indexOf(item), 1)
                            this.destroyClone(item)
                        }
                    })
                }
            }
            if (this.elementType === 'character')
                options.push({
                    name: this.$t('strings.view_model'),
                    class: 'fas fa-link',
                    handler: () => window.open('https://www.e7vau.lt/portrait-viewer.html?id='+(this.skin[item] || data.id), '_blank').focus()
                })
            else {
                const name = this.getItemName(item)
                const artiId = this.getItemId(item)
                options.push({
                    name: 'View artwork',
                    class: 'fas fa-image',
                    handler: () => this.$gallery([{description: name, src: this.$store.getters.getArtifactImage(artiId)}, {description: 'Icon: ' + name, src: this.$store.getters.getArtifactIcon(artiId)}])
                })
            }
            if (data.skin) {
                const link = (id) => {return cdn+'face/' + id + '_s.png'};
                options.push(
                  {
                    name: this.$t('strings.skin'),
                    class: 'fas fa-theater-masks',
                    children: [{name: this.$t('strings.default'), img: link(data.id), handler: () => delete this.skin[item]}].concat(data.skin.map( skin => {
                        return {
                            name: skin.name,
                            img: link(skin.id),
                            handler: () => this.skin[item] = skin.id
                        }
                    }))
                  }
                )
            }
            this.$contextmenu(
              e, options,
              {
                mobile: this.mobile
              }
            )
        },

        /******************************************** Tier List table methods ********************************************/
        renameTierRow(index, name) {
            this.tiers[index].name = name;
        },
        moveTierRow(oIndex, nIndex) {
            if (nIndex<0) return;
            arrayMove(this.tiers, oIndex, nIndex)
        },
        clearTierRow(index) {
            this.tiers[index].list.forEach(item => {
                this.charList.push(item)
            });
            this.tiers[index].list=[];
        },
        deleteTierRow(index) {
            this.tiers[index].list.forEach(item => {
                this.charList.push(item)
            });
            this.tiers.splice(index, 1);
        },

        /******************************************** Drag and Drop handlers  ********************************************/
        // handleDropEvent(item, to, from, newIndex, detail) {
        //     if (this.tierType === 0)
        //         if (from === to) {
        //             arrayMove(from, from.indexOf(item), newIndex);
        //         } else {
        //             /* make sure there are no duplicates */
        //             while ( from.includes(item) ) from.splice(from.indexOf(item), 1);
        //             to.splice(newIndex, 0, item);
        //         }
        //     else {
        //         var cX = detail.clientX, cY = detail.clientY;
        //         let canvas = document.getElementById('XYCanvas').getBoundingClientRect();
        //         cX = Math.min(100, Math.max(0, (-canvas.left+cX)/canvas.width*100) ), cY = Math.min(100, Math.max( 0, (-canvas.top+cY)/canvas.height*100) );
        //         var index = -1;
        //         this.xy.list.some((hero,i) => {if (hero.id === item) index = i;})
        //         if (to === this.charList) {
        //             if (from === to)
        //               arrayMove(from, from.indexOf(item), newIndex);
        //             else {
        //                 to.splice(newIndex, 0, item);
        //                 from.splice(index, 1);
        //             }
        //         } else {
        //             if (from === to) {
        //                 this.xy.list[index].x = cX;
        //                 this.xy.list[index].y = cY;
        //                 arrayMove(this.xy.list, index, this.xy.list.length);
        //                 detail.node.style.top = cY+'%';
        //                 detail.node.style.left = cX+'%';
        //             } else {
        //                 from.splice(from.indexOf(item), 1);
        //                 this.xy.list.push({id: item, x: cX, y: cY})
        //             }
        //         }
        //     }
        // }
    }
}
</script>

<style>
    .tierlist-compare-box {
      pointer-events: none;
      display: flex;
      justify-content: space-evenly;
    }
    .is-dragging > .tierlist-compare-box {
      display: none;
    }
    .dragPlaceholder > .tierlist-compare-box {
      display: none;
    }
    .compare-up-tier {
      color: green;
      position: relative;
    }
    .compare-up-tier:before {
      content: '';
      display: inline-block;
      border-left: solid 5px transparent;
      border-right: solid 5px transparent;
      border-bottom: solid 10px;
      margin-right: 0.2em;
    }
    .compare-down-tier {
      color: red;
      padding-left: 10px;
      position: relative;
    }
    .compare-down-tier:before {
      content: '';
      display: inline-block;
      border-left: solid 5px transparent;
      border-right: solid 5px transparent;
      border-top: solid 10px;
      margin-right: 0.2em;
    }
    .compare-left-tier {
      color: green;
      position: relative;
    }
    .compare-left-tier:before {
      content: '';
      display: inline-block;
      border-top: solid 5px transparent;
      border-bottom: solid 5px transparent;
      border-right: solid 10px;
      margin-right: 0.2em;
    }
    .compare-right-tier {
      color: red;
      padding-left: 10px;
      position: relative;
    }
    .compare-right-tier:before {
      content: '';
      display: inline-block;
      border-top: solid 5px transparent;
      border-bottom: solid 5px transparent;
      border-left: solid 10px;
      margin-right: 0.2em;
    }
      /* Add Italianno font (Too hard to read)
      @import url('https://fonts.googleapis.com/css2?family=Italianno&display=swap');
      */
    .tier-list-title {
      /*
      font-family: 'Italianno', cursive;
      */
      position: relative;
      display: inline-block;
      color: var(--font-color-secondary);
      text-align: center;
      width: 100%;
      padding: 0.25em;
      margin: 0;
      font-size: 60px;
      font-weight: normal;
      white-space: break-spaces;
      word-break: break-word;
    }
    /*
    .box-ornament:after, .box-ornament:before {
      z-index: 1;
      content: "";
      pointer-events: none;
      position: absolute;
      background-repeat: no-repeat;
      background-size: 100% 100%;
      display: inline-block;
      height: 98px;
      width: 105px;
    }
    .box-ornament:before {
      background-image: url(https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/ui/box-decoration-type1.png);
      top: 0;
      left: 0;
    }
    .box-ornament:after {
      background-image: url(https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/ui/box-decoration-type1.png);
      bottom: 0;
      left: 100%;
      transform: translateX(-100%) rotate(180deg);
    }*/

    .mobile-list > .tier-database {
      /* Flex and flex wrap to force all the icons to the same width */
      overflow: scroll;
      overflow-y: hidden;
    }
    .desktop-list > .tier-database {
      display: flex;
      flex-wrap: wrap;
      min-height: 100%;
      padding-bottom: 100px;
      align-content: flex-start;
    }
    .tier-name div[contenteditable]:focus {
      outline: 0px solid transparent;
    }
    .type1 {
      padding: 10px 0;
    }
    .type1 .tier-name {
      background-color: #e3b972;
      border-radius: 6px;
      display: inline-block;
      margin-left: 10px;
      /*
      background: rgb(180,58,58);
      background: linear-gradient(90deg, rgba(180,58,58,1) 0%, rgba(253,29,29,1) 47%, rgba(252,176,69,1) 100%);
      color: white;*/
      color: black;
      max-width: 60%;
      white-space: break-spaces;
      word-break: break-word;
      position: relative;
      z-index: 1;
    }
    .type1 .tier-name .center-tier-label-input {
      padding: 5px 20px;
    }

    .tier-list {
      display: flex;
      flex-wrap: wrap;
    }
    .type1 .tier-list {
      min-height: 127px;
      margin-top: -20px;
      padding: 30px 15px 20px;
      background-color: #0000006e;
      border-radius: 12px;
      position: relative;
    }
    .type2 {
      display: flex;
      align-items: stretch;
      border: solid 1px black;
      border-bottom: none;
      background-color: #0000006e;
    }
    .type2:last-of-type {
      border-bottom: solid 1px black;
    }
    .type2 .tier-name1 {
      flex: 0 0 100px;
      white-space: break-spaces;
      word-break: break-word;
      background: rgb(180,58,58);
      color: black;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      border-right: solid 1px black;
      /*box-shadow: inset 0 0 0 .5px black;*/
    }
    .type2 .tier-name {
      width: var(--label-width, 100px);
      white-space: break-spaces;
      word-break: break-word;
      background: rgb(180,58,58);
      color: black;
      display: table;
      text-align: center;
      border-right: solid 1px black;
      /*box-shadow: inset 0 0 0 .5px black;*/
    }
    .type2 .tier-list {
      flex: 1;
      min-height: 127px;
      /*padding: 25px 15px 25px;*/
      padding: 15px 20px 15px 0px;
      /*background-color: #0000006e;*/
      position: relative;
      /*box-shadow: inset 0 0 0 .5px black;*/
    }
    .drag-tier-container {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: move;
    }
    .tiermaker-control-box {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 30px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
    }
    .tiermaker-control-box > i:hover {
      color: red;
    }
    /*
    .tier
    .dragPlaceholder {
      height: 70px;
      width: 70px;
      /*background-color: #ffffff29;
      /*border-radius: 100%;
      display: inline-block;
      vertical-align: bottom;
    }
    .tier .tier-item.dragPlaceholder:before {
      content: '';
      height: 100%;
      width: 100%;
      background-color: #ffffff29;
      border-radius: 100%;
      display: inline-block;
      vertical-align: bottom;
    }
    .tier .dragPlaceholder:not(.tier-item):before {
      content: '';
      height: 100%;
      width: 100%;
      background-color: #ffffff29;
      display: inline-block;
      vertical-align: bottom;
    }*/
    .tier-item {
      display: inline-block;
      cursor: grab;
      /*height: 70px;
      width: 70px;
      vertical-align: bottom;*/
    }
    .desktop-list {
      /*flex: 0.3 1 0%;*/
      overflow: scroll;
      /*padding-bottom: 100px;*/
      width: 350px; /* fit 5 heroes per row */
      background-color: var(--background-color-secondary);
    }
    .mobile-list {
      white-space: nowrap;
      bottom: 0;
      width: 100%;
      /*height: 140px;*/
      padding: 10px;
      border-radius: 20px 20px 0 0px;
      background-color: var(--background-color-secondary);
      z-index: 1; /* fix tier type1 labels over filters modal*/
    }
    .mobile-list .tier-database::before {
      content: '« Swipe here »';
      display: block;
      text-align: center;
      font-size: 30px;
      position: sticky;
      left: 0;
      right: 0;
      color: var(--font-color);
      pointer-events: none;
    }
    .mobile-list .tier-database:after { /* Add extra space at the end*/
      content: '';
      width: 100px;
      display: inline-block;
    }
    .tier-maker-container.mobileView #tier {
    }
    .tier-maker-container {
      display: flex;
      height: 100%;
      width: 100%;
    }
    .tier-maker-container.mobileView {
      flex-direction: column;
    }
    .tier-maker-container * {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .tier-maker-container *::-webkit-scrollbar {
      display: none;
    }
    .tier-maker-container.mobileView .tier-draw-area{
      /*margin-bottom: 140px;*/
    }
    .tier-draw-area {
      flex: 1;
      overflow: scroll;
      padding: 10px;
      position: relative;
    }
    .xy-graph-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      padding-top: 50px;
    }
    .mobileView .xy-graph-container {
      padding-top: 0
    }
    .force-stack-view:not(.mobile-list) .xy-graph-container {
      position: relative;
      padding-top:0;
    }

    .box-manage {
      margin: 0.2em 0;
      font-size: 20px;
      line-height: 1em;
      display: flex;
    }
    .box-manage > * > img {
      height: 1em;
      vertical-align: middle;
    }
    .box-manage > * {
      background-color: var(--icon-bar);
      padding: 0.6em;
      cursor: pointer;
      color: var(--font-color);
    }
    .box-manage > *:first-child {
      border-radius: 10px 0 0 10px;
    }
    .box-manage > *:last-child {
      border-radius: 0 10px 10px 0;
    }
    .box-manage > .active {
      color: white;
      background-color: var(--decoration-color-secondary);
    }
    .new-tier-modal {
      display: flex;
      height: 400px;
      max-width: 1000px;
      text-align: center;
      padding: 10px;
    }
    .new-tier-modal > div {
      flex: 1;
      overflow: auto;
    }
    .new-tier-box {
      flex: 1;
      font-size: 22px;
      border-radius: 10px;
      border: dotted;
      margin: 10px 0;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .new-tier-box:hover {
      background-color: #00000044;
    }
    .tierlist-history > div {
      cursor: pointer;
      padding: 10px;
    }
    .tierlist-history > div:hover {
      background-color: #00000044;
    }
    .flex-option-delete {
      display: flex;
      cursor: pointer;
      width: 100%;
      text-align: center;
      padding: 10px 0;
    }
    .flex-option-delete:hover {
      background-color: #00000044;
    }
    .flex-option-delete > span {
      flex: 1;
    }
    .tier-control-buttons {
      margin: -10px;
      /*background-color: var(--icon-bar);*/
      box-shadow: 0px -2px 3px 3px rgba(11, 11, 11, 0.65);
      text-align: center;
      position: sticky;
      top: 0;
      z-index: 2;
      margin-bottom: 5px;
    }
    .tier-control-buttons > button {
      margin: 5px;
      padding: 0 10px;
      font-size: 15px;
      background-color: #ffffff2e;
      border: none;
      color: inherit;
      border-radius: 50px;
      min-width: 40px;
      cursor: pointer;
      height: 40px;
      line-height: 37px;
    }
    .tier-control-buttons > button .icon:not(:last-child) {
      margin-right: 10px;
    }
    .tier-control-buttons > button:hover {
      background-color: white;
      color: green;
    }
    .force-stack-view:not(.mobile-list) {
      display: block;
      max-width: 1100px;
      margin: auto;
    }
    .force-stack-view:not(.mobile-list) .desktop-list {
      width: 100% !important;
      min-height: 100%;
    }


/*
  h2 {
    font-weight: bold;
    font-size: 1.2em;
  }
  p {
    font-size: 1em;
  }
  ul,li{
    list-style:none;
  }
  ul.sticky-notes{
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    font-size: 20px;
  }
  ul.sticky-notes li a{
    text-decoration:none;
    color:#000;
    background:#ffc;
    display:block;
    min-height:10em;
    width:10em;
    padding:1em;
    box-shadow: 5px 5px 7px rgba(33,33,33,.7);
    transform: rotate(-6deg);
    transition: transform .15s linear;
  }

  ul.sticky-notes li:nth-child(even) a{
    transform:rotate(4deg);
    position:relative;
    top:5px;
    background:#cfc;
  }
  ul.sticky-notes li:nth-child(3n) a{
    transform:rotate(-3deg);
    position:relative;
    top:-5px;
    background:#ccf;
  }
  ul.sticky-notes li:nth-child(5n) a{
    transform:rotate(5deg);
    position:relative;
    top:-10px;
  }

  ul.sticky-notes li a:hover,ul li a:focus{
    box-shadow:10px 10px 7px rgba(0,0,0,.7);
    transform: scale(1.25);
    position:relative;
    z-index:5;
  }

  ul.sticky-notes li{
    margin:1em;
  }
*/
</style>