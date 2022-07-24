<script>
/* This is a port to vue 3 of the old version, this will probably remade sometime in the future */

import { h, withDirectives } from 'vue'
import tooltip from '@/directives/tooltip.js'
import lazyImage from '@/directives/lazyloader.js'
import shopOverlay from './components/shop-overlay.vue'
import Changelog from '@/components/changelog.vue'
import MobileFloatingMenu from '@/components/mobile-floating-menu.vue'
import ctrlf from './components/ctrlf.vue'
import ajax from '@/utils/ajax.js'
import {fullDateDiff} from '@/utils/dates.js'
var SCROLL_TARGET;

export default {
    name: 'timeline-main',
    components: {/*,eventOverlay*/},
    props: ['standalone'],
    data: function () {
        return {
            VERSION: 1.15,
            events: [],             //list of banners (updated on created event)
            timelineItems: [],      //list to render, updated by buildRenderArray() method
            vertical: false,        //Timeline orientation
            daySize: 20,            //size of a day in pixels
            direction: 0,           // 0 normal (left to right), 1 reverse (right to left)
            today: '',              //set the current day to display on the timeline 

            openBanner: false,
            openChangelog: false,

            /* For extra timelines */
            covenantShop: [],
            galaxyShop: [],
            powderShop: [],
            balance: []
        }
    },
    beforeCreate: function () {},
    created: function () {
        this.toggleLoading(true, 'downloading');
        Promise.all([
            this.$store.dispatch('GET_RATE_UP_HISTORY'),     // get full list of known banners
            this.$store.dispatch('GET_HERO_DB'),       // not assined but this will update the $store
            this.$store.dispatch('GET_ARTIFACT_DB')
        ]).then(data => {
            this.events=[].concat(data[0]/*,JSON.parse(data[1])*/);
            this.today = new Date().toISOString().substr(0, 10)
            this.$nextTick(() => {
                this.toggleLoading(false);
            })

            Promise.all([
                ajax('./data/powder-shop.json').catch( () => {return '[]'}),
                ajax('./data/galaxy-coin-shop.json').catch( () => {return '[]'}),
                ajax('./data/covenant-coin-shop.json').catch( () => {return '[]'}),
            ]).then(data => {
                this.powderShop = JSON.parse(data[0]);
                this.galaxyShop = JSON.parse(data[1]);
                this.covenantShop = JSON.parse(data[2]);
            });
            /*
            ajax('./data/balance.json').then(data => {
                this.balance = JSON.parse(data)
            }).catch( () => console.log() );
            */
        });
    },
    beforeMount: function () {},
    mounted: function () {
        SCROLL_TARGET = this.$refs.TIMELINE_CONTAINER;
        SCROLL_TARGET.addEventListener('wheel', this.horizionatlScroll);
    },
    beforeUnmount: function () {
        SCROLL_TARGET.removeEventListener('wheel', this.horizionatlScroll);
        SCROLL_TARGET = null;
    },
    watch: {
        timelineDates: function () {
            this.timelineItems = this.buildRenderArray();
            this.$nextTick(() => { // Scroll to today
                //not using behavior smooth because it will cause images (with lazy loading) to be loaded immediatly
                this.$refs[this.today].scrollIntoView({behavior: "auto", block: "center", inline: "center"});
            })
        },
        direction: function () {
            this.loading().then( () => {
                this.timelineItems = this.buildRenderArray();
                this.$nextTick(() => { // Scroll to today
                    this.$refs[this.today].scrollIntoView({behavior: "auto", block: "center", inline: "center"});
                })
            })
        },
        vertical: function (value) {
            if (value) this.direction = 1; // reverse
            else this.direction = 0;
            this.$nextTick(() => { // Scroll to today
                this.$refs[this.today].scrollIntoView({behavior: "auto", block: "center", inline: "center"});
            })
        }
    },
    computed: {
        mobile: function () {
            return this.$store.state.isMobile;
        },
        timelineDates: function () {
            // get each start and end date from the banners then sort them
            var s=[this.today];
            for (var i=0;i<this.events.length;i++) {
                let dt = this.events[i].dt;
                if (!dt) continue;
                for (var j=0;j<dt.length;j++) {
                    if (!s.includes(dt[j])) s.push(dt[j]);
                }
            }
            s.sort((a,b) => {
                return a<b?1:a===b?0:-1;
            });
            return s;
        },
        timelinePixelLength: function () {
            return this.dateDiff(this.timelineDates[0],this.timelineDates[this.timelineDates.length - 1]);
        }
    },
    methods: {
        home: function () {
            this.$store.commit('toggleMainMenu');             // open and close the main menu for e7tools
        },
        toggleLoading: function (value,text) {
            this.$store.commit('loading', value, text);       // val can be true or false, text is the text you want to show (CONNECTING...)
        },
        loading: function (text) {
            this.toggleLoading(true, text);
            return new Promise((resolve)=>{
                setTimeout(() => {
                    resolve();
                    this.$nextTick(()=>{
                        this.$store.commit('loading', false);
                    })
                }, 0);
            })
        },
        /*********************** Store methods (can use spread but I prefer this to avoid method name changes) ***********************/
        getHero: function (id) {
            return this.$store.getters.getHero(id);
        },
        getHeroName: function (id) {
            return this.$store.getters.getHeroName(id);
        },
        getHeroIcon: function (id) {
            return this.$store.getters.getHeroIcon(id);
        },
        getArtifact: function (id) {
            return this.$store.getters.getArtifact(id);
        },
        getArtifactName: function (id) {
            return this.$store.getters.getArtifactName(id) || '';
        },
        getArtifactIcon: function (id) {
            return this.$store.getters.getArtifactIcon(id);
        },
        /*********************** Search bar (CTRL+F) methods [Required by CTRLF component] ***********************/
        showSearchBar: function () {
            this.$refs.ctrlf.openSearchBar();
        },
        searchFunction: function (keyword) {
            const target = this.events;
            if (!target.length || !keyword) return [];
            const reg = new RegExp('(\\b|-)'+keyword, 'i');
            var res = [['Banner',this.events],['Powder Shop', this.powderShop], ['Galaxy Coin', this.galaxyShop], ['Covenant Coin', this.covenantShop]].map(el => {
                return el[1].filter(rotation => {
                    if (rotation.name && reg.test(rotation.name)) {
                        return true;
                    }
                    if (rotation.c) {
                        if (rotation.c.some(hero => { return reg.test(this.getHeroName(hero.id)) }) )
                            return true;
                    }
                    if (rotation.a && rotation.a.length) {
                        if (rotation.a.some(arti => { return reg.test(this.getArtifactName(arti.id)) }) )
                            return true;
                    }
                }).map(rotation => {
                    // set what to display in the search results
                    if (el[0]==='Banner') {
                        rotation.handler = () => this.$refs['shop-timeline'].close();
                        rotation.resultName = rotation.c ? rotation.c.map(hero => {return this.getHeroName(hero.id)}).join(', ') : el[0];
                    } else {
                        rotation.handler = () => this.$refs['shop-timeline'].open();
                        rotation.resultName = el[0];
                    }
                    return rotation
                })
            }).flat().sort((a,b) => {
                return a.dt[0]<b.dt[0]?1:a.dt[0]===b.dt[0]?0:-1;
            })
            return res

        },
        searchToDisplay: function (result) {
            return result.dt[0] + ' - ' + result.resultName
        },
        goToSearchResult: function (e) {
            if (!e) return;
            if (e.handler) e.handler();
            var distance = this.dateDiff(e.dt[this.direction], this.timelineDates[this.direction !== 1 ? this.timelineDates.length-1 : 0]),
                options = {top: 0, left: 0, behavior: 'smooth'}
            if (this.vertical) {
                options.top = distance*this.daySize;
            } else {
                options.left = distance*this.daySize+100-window.innerWidth/2;
            }
            SCROLL_TARGET.scrollTo(options);
        },
        /*********************** MISC METHODS ***********************/
        goToDate: function (e) { // scroll to a specific date
            this.$refs[e].scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
        },
        horizionatlScroll: function(event) {
            //const SCROLL_TARGET = document.body;
            const target = SCROLL_TARGET;
            if (this.vertical) return;
            const toLeft  = event.deltaY < 0 && target.scrollLeft > 0
            const toRight = event.deltaY > 0 && target.scrollLeft < target.scrollWidth - target.clientWidth

            if (toLeft || toRight) {
                target.scrollLeft += event.deltaY;
            }
        },
        onContextMenu: function (e) {
            this.$contextmenu( e, [
                {
                    name: 'Direction',
                    children: [
                        {
                            class: this.direction === 0 ? 'fa fa-check' : '',
                            name: 'Normal',
                            handler: () => this.direction = 0
                        },
                        {
                            class: this.direction === 1 ? 'fa fa-check' : '',
                            name: 'Reverse',
                            handler: () => this.direction = 1
                        }
                    ]
                },
                {
                    name: 'Orientation',
                    children: [
                        {
                            class: !this.vertical ? 'fa fa-check' : '',
                            name: 'Horizontal',
                            handler: ( ) => this.vertical = false
                        },
                        {
                            class: this.vertical ? 'fa fa-check' : '',
                            name: 'Vertical',
                            handler: ( ) => this.vertical = true
                        }
                    ]
                },
                {
                    name: 'Change Day Size',
                    children: [15,20,30,40,50].map(size => {
                        return {
                            class: this.daySize === size ? 'fa fa-check' : '', 
                            name: size,
                            handler: () => this.setDaySize(size)
                        }
                    })
                },
                {
                    class: 'fas fa-map-marker-alt',
                    name: this.$t('strings.scroll_to_today'),
                    handler: () => this.goToDate(this.today)
                },
                {
                    class: 'fa fa-search',
                    name: this.$t('strings.search'),
                    handler: () => this.showSearchBar()
                }
            ])
        },
        /*********************** Date manipulation ***********************/
        dateDiff: function (ad,bd) {
            if (!ad||!bd) return 1;
            let a = ad, b= bd;
            if (a > b) {
                var swap = a;
                a = b;
                b = swap;
            }
            return (new Date(b).getTime()-new Date(a).getTime())/(1000 * 3600 * 24);
        },
        formatDate: function (date,event) {
            if (!date) return ''
            var d=date.split(/-/g);
            var day=d[2], month=['January','February','March','April','May','June','July','August','September','October','November','December'][Number(d[1])-1], year=d[0];
            return Number(day) + ' ' + month.slice(0,3) + ' ' + year + (event?' - ' + event:'');
        },
        /*********************** Rendering helpers ***********************/
        dayGraphSize: function (ds,de) {
            return this.daySize*this.dateDiff(ds,de); //+25;
        },
        setDaySize: function (value) {
            this.loading().then( () => {
                this.daySize=value;
                this.timelineItems = this.buildRenderArray();
            })
        },
        buildRenderArray: function () {
            const rtd = [0,1][this.direction||0];
            const rdte = [0,1].filter(d => d!==rtd)[0];
            const defaultDayModel = (day,nextDay) =>  {return {date: day, size: this.direction===1 ? this.dayGraphSize(nextDay,day) : this.dayGraphSize(day,nextDay), m:[],n:[], e:[]} };
            var o=this.events, d=this.timelineDates.slice().reverse(), x=[];
            if (this.direction===1) d = d.reverse();
            for (var i=0; i<d.length; i++) {                                    //loop through each date
                if (!x[i]) x[i] = defaultDayModel(d[i],d[i+1]);                 //add basic data each day;
                for (var j=0;j<o.length;j++) {                                  //loop through each event
                    var pos = -1, 
                        targetDate = o[j].dt[rtd] || o[j].dt[rdte],                   //we are rendering from end date, use start date if ending date is missing
                        itemType = o[j].type === 'event' ? 'e' : o[j].type === 'mystic' ? 'm' : 'n';
                    if (d[i] !== targetDate) continue;                          // if current date is different from ending date continue

                    if (o[j].dt[1]<this.today) o[j].bTooltip = 'Ended: <span style="color: #ff1919">' + fullDateDiff(o[j].dt[1], this.today) + '</span> ago';
                    else if (o[j].dt[0]>this.today) o[j].bTooltip = 'Starts: <span style="color: green">' + fullDateDiff(o[j].dt[0], this.today) + '</span>';
                    else o[j].bTooltip = 'Started: <span style="color: green">' + fullDateDiff(o[j].dt[0], this.today) + '</span> ago<br>Ends: <span style="color: #ff1919">' + fullDateDiff(o[j].dt[1], this.today) + '</span>';

                    o[j].duration = this.dateDiff(o[j].dt[0],o[j].dt[1]);
                    o[j].bannerClass = '';                                      // set value for bannner background decoration during rendering
                    if (o[j].type==='limited') o[j].bannerClass = 'limited'
                    else if (o[j].type==='mystic') o[j].bannerClass = 'mystic'
                    else if (o[j].c && o[j].c[0]) o[j].bannerClass = this.getHero(o[j].c[0].id).attribute;

                    o[j].bannerSize = x[i].size-10;                             // set the banner size
                    for (var k=0; k<x[i][itemType].length; k++) {
                        if (x[i][itemType][k]) continue;
                        x[i][itemType][k] = o[j];
                        pos=k;
                        break;
                    }
                    if (pos===-1) { // could not find an empty slot;
                        x[i][itemType].push(o[j]);
                        pos=x[i][itemType].length-1;
                    }
                    var z=d.indexOf(o[j].dt[rdte])||1;
                    for (k=i;k<z;k++) {
                        if (!x[k]) x[k]=defaultDayModel(d[k],d[k+1]);
                        if (k!=i) o[j].bannerSize+=x[k].size;
                        x[k][itemType][pos] = o[j];
                    }
                }
            }
            return x;
        }
    },
    render: function () {
        return h('div', {style: 'height: inherit', onContextmenu: this.onContextMenu}, [
            this.openChangelog ? h('div', {class: 'center-modal', style: 'position: absolute; z-index: 10;', onClick: (e) => e.target === e.currentTarget ? this.openChangelog = !this.openChangelog:null}, [
                h('div', {class: 'flat-modal glass-container-2', style: 'padding: 10px; color: var(--font-color); overflow: auto;'}, [
                    h(Changelog, {path: '/views/timeline/', style: 'height: auto;'})
                ])
            ]) : null,
            h(MobileFloatingMenu, {mobile: this.mobile, options: [{title: this.$t('strings.search'), class: 'fa fa-search', click: 'search'},{title: this.$t('strings.scroll_to_today'), class: 'fas fa-map-marker-alt', click: 'goToday'},{title: this.$t('strings.vertical_toggle'), class: 'fa fa-mobile '+(this.vertical?'fa-rotate-90':''), click: 'vertical'},{title: this.$t('strings.changelog'), class: 'fa fa-history', click: 'changelog'}, {title: this.$t('strings.language'), class: 'fas fa-language', click: 'language'},!this.standalone ? {title: this.$t('strings.home'), class: 'fa fa-home', click: 'home'}:{}], onSearch: ()=>this.showSearchBar(), onGoToday: () => this.goToDate(this.today), onHome: ()=>this.home(), onVertical: () => this.loading().then(()=>this.vertical=!this.vertical), onChangelog: () => this.openChangelog = !this.openChangelog, onLanguage: this.$localePicker }),
            h(ctrlf, {ref: 'ctrlf', key: 'ctrlf-timeline', mobile: this.mobile, events: this.events, toDisplay: this.searchToDisplay, searchFunction: this.searchFunction, onEvent: this.goToSearchResult}),
            /*********************** Render Main timeline ***********************/
            h('div', {ref: 'TIMELINE_CONTAINER', style: 'height: inherit; width: inherit; overflow: auto;'}, [
                h('ul', {class: this.vertical ? 'vtimeline': 'timeline'}, [
                    //h('eventOverlay', {props: {events: this.balance, vertical: this.vertical, timelinedates: this.timelineDates, daysize: this.daySize, timelinelength: this.timelinePixelLength*this.daySize, direction: this.direction}}),
                    h(shopOverlay, {ref: 'shop-timeline', events: [this.powderShop, this.galaxyShop, this.covenantShop], vertical: this.vertical, timelinedates: this.timelineDates, daysize: this.daySize, timelinelength: this.timelinePixelLength*this.daySize, direction: this.direction}),
                    this.timelineItems.map ((day,i) => {
                        return h('li', {ref: day.date, key: day.date, class: {today: this.today===day.date}, index: i, 'data-date': this.$d(day.date, 'short'), id: day.date, style: { [!this.vertical?'width':'height']: day.size+'px'}}, [
                            ['m','n'].map( arrayType => { // Arrays: mystic, covenant / limiteds
                                return h('section', {class: 'wrapper-'+arrayType, key: 'wrapper-key-'+day.date+arrayType}, [
                                    day[arrayType].map( item => { // get banner or event
                                        return item.dt[this.direction||0]===day.date ?
                                            withDirectives(
                                                h('div', {ref: item.id +'-'+day.date, key:item.id, class: 'banner '+ item.bannerClass, tabindex: 0, 'data-hero': item.c ? item.c[0].id : 'null', style: {[!this.vertical?'width':'height']: item.bannerSize+'px'} }, [
                                                    item.c ? h('div', {class: 'icon_container'}, item.c.map(c => {
                                                        return h('div', {class: {isnew: c.new}}, [
                                                            withDirectives(
                                                                h('img', {'data-src': this.getHeroIcon(this.getHero(c.id).id), 'src': 'https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/face/c0000_s.png', crossorigin: 'anonymous', SameSite: 'Lax'} ),
                                                                [[lazyImage]]
                                                            )
                                                        ])
                                                    })) : null,
                                                    item.name ? h('span', {class: 'banner-description'}, item.name) : null
                                                ]),
                                                [
                                                    [tooltip, {value: item.bTooltip}]
                                                ]
                                            )
                                        : h('div',{class: 'banner dummy'})
                                    })
                                ])
                            })
                        ])
                    })
                ])
            ]) // timeline_container
        ])
    },
    renderError: function() {}
}
</script>
<style scoped src="./style.css"></style>