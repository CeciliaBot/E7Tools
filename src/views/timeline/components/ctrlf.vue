<script>
import { h } from 'vue'
import {debounce} from '@/utils/helpers.js'

export default {
  name: 'ctrlf-component',
  props: {
    events: {
      type: Array,
      required: false,
      default: () => {return []}
    },
    renderBox: {
      type: Boolean,
      required: false,
      default: true
    },
    searchFunction: {
      type: Function,
      required: true
    },
    toDisplay: {
      type: Function,
      required: true
    }
  },
  data: function () {
    return {
      render: false,
      localRenderBox: false,
      current: 0,
      results: [],
      hideResultsBox: false
    }
  },
  watch: {
    renderBox: {
      immediate: true,
      handler: function (val) { this.localRenderBox = val }
    }
  },
  computed: {
    mobile: function () {
      return true;
      //return this.$store.state.isMobile;
    },
  },
  created: function () {
    document.addEventListener('keydown', this.openCtrl, true);
  },
  beforeUnmount: function () {
    document.removeEventListener('keydown', this.openCtrl, true);
  },
  mounted: function () {
  },
  methods: {
    openCtrl: function (e) {
        if (e.ctrlKey && e.key==='f') {
            e.preventDefault();
            this.render = true;
            this.openSearchBar();
        }
    },
    openSearchBar: function () { // this method can be called from parent
        this.render = true;
        this.focusInput();
        this.selectInputContent();
    },
    focus: function () {
        this.focusInput();
        this.selectInputContent();
    },
    focusInput: function () {
      this.$nextTick(()=>{this.$refs['input-search-box'].focus()})
    },
    selectInputContent: function () {
      this.$nextTick(()=>{this.$refs['input-search-box'].select()})
    },
    searchEvent: debounce(function (e) {
      this.results = this.searchFunction(e.target.value);
      this.current = 0;
      this.clickEvent(this.results[this.current])
    }, 400),
    goToSearchEvent: function (n) {
      if (!this.results.length) return;
      this.current=n;
      if (this.current<0) this.current=this.results.length-1;
      if (this.current>this.results.length-1) this.current=0;
      this.clickEvent(this.results[this.current]);
    },
    clickEvent: function (event) {
      this.$emit('event', event);
    },
    closeSearchBar: function () {
      this.render = false;
    }
  },
  render: function () {
    //return this.render ?
    return h('div',{class: 'search-box-pos', style: {display: this.render ? '' : 'none'} }, [
        h('div', {class: 'ch-search-box'},[
          h('input',{ref:'input-search-box', onInput: (e) => this.searchEvent(e), onKeydown: (e)=> {e.key === 'enter'||e.keyCode === 13?this.goToSearchEvent(this.current+1):0}, autocomplete: 'off' }),
          h('div',{}, Math.min(this.current+1,this.results.length)+'/'+this.results.length),
          h('span',{class: ['fas fa-angle-up', {disabled: this.results.length===0}], onClick: ()=>this.goToSearchEvent(this.current+1)}),
          h('span',{class: ['fas fa-angle-down', {disabled: this.results.length===0}], onClick: ()=>this.goToSearchEvent(this.current-1)}),
          h('span',{class: 'fas fa-bars', onClick: ()=>this.localRenderBox=!this.localRenderBox}),
          h('span',{class: 'fas fa-times', onClick: ()=>this.closeSearchBar()})
        ]),
        this.localRenderBox?h('div', {class: ['search-results-box',  { hidebox: this.hideResultsBox }]}, this.results.map((x,i)=>{return h('div', {class: ['item', {active: i===this.current}], onClick: () => this.goToSearchEvent(i)}, this.toDisplay(x))})):null
    ])
  }
};
</script>
<style>
.search-box-pos {
    position: fixed;
    z-index: 100;
    right: 90px;
    top: 0px;
    width: 328px;
    display: flex;
    flex-direction: column;
}
.ch-search-box {
    background-color: #1d1d21;
    border-radius: 5px;
    box-shadow: 0 0 2px 2px #00000082;
    display: flex;
    padding: 10px 15px;
    align-items: center;
    color: #a6a6a6;
    font-size: 13px;
    text-align: center;
    transition: all ease .4s;
    z-index: 1;
}
.ch-search-box > input {
    background-color: transparent;
    border: none;
    color: white;
    outline: none;
    width: 50%;
    font-size: 12px;
    text-align: start;
    padding: 8px 0;
}
.ch-search-box > div {
    flex: 1.6;
    border-right: solid 2px #454343;
    padding: 8px 0;
    margin-right: 10px;
}
.ch-search-box > span {
    flex: 1;
    border-radius: 100%;
}
.ch-search-box > span.disabled {
    color: #ffffff1c;
}
.ch-search-box > span:not(.disabled):hover {
    background-color: #ffffff1c;
    padding: 8px 0;
}
.search-results-box {
	top: 0;
	right: 0;
	padding: 20px 0;
	max-height: 300px;
	background-color: #1d1d21;
    color: white;
	overflow-y: auto;
	order: 1;
	margin: 0 10px;
	border-radius: 0 0 8px 8px;
	scrollbar-width: none;
	box-shadow: 0 0 2px 2px #00000082;
}
.search-results-box.hidebox {
	height: 0;
	padding: 0;
    opacity: 0;
}
.search-results-box .item {
    cursor: pointer;
    padding: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: start;
    z-index: 99;
}
</style>