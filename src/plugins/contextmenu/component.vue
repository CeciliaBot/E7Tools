<script>
import { h, nextTick } from 'vue'
import childContext from './child-context.vue'
export default {
    name: 'ContextualMenu',
    data: function () {
        return {
            contextId: 0,
            x: 0,
            y: 0,
            show: false,
            focused: -1,
            options: [],

            mobile: false,
            mobileIndex: '0',
            transition: 'scroll-left'
        }
    },
    created: function () {
        document.body.addEventListener('mouseup', this.clickOff)
        document.body.addEventListener('contextmenu', this.clickOff)
        document.body.addEventListener('click', this.clickOff)
    },
    beforeUnmount: function () {
        document.body.removeEventListener('mouseup', this.clickOff)
        document.body.removeEventListener('contextmenu', this.clickOff)
        document.body.removeEventListener('click', this.clickOff)
    },
    watch: {
    },
    computed: {
    },
    methods: {
        setVisible(val) {
            this.show = val;
        },
        open(options) {
            this.show = false;
            this.focused = -1;
            this.options = [];
            nextTick(() => {
                this.contextId++;
                this.show = true;
                this.options = options;
            })
        },
        setPosition: function (e) {
            this.y = e.clientY;
            this.x = e.clientX;
            nextTick( () => {
                var rect = {height: 60*this.options.length, width: 250}
                if (this.x + rect.width > window.innerWidth) {
                    let val=e.clientX-rect.width
                    if (val>0)
                        this.x = val;
                    else
                        this.x = e.clientX-(e.clientX+rect.width-window.innerWidth);
                }
                if (this.y + rect.height > window.innerHeight)
                    this.y = Math.max(e.clientY-rect.height,0);
            })
        },
        setOptions: function () {
            //this.options = data;
        },
        setFocus: function (i) {
            setTimeout(()=> this.focused=i, 10)
        },
        insideClick: function (e, option) {
            if (!option || option.children) {
                return e.stopPropagation();
            } else if (option.handler) {
                option.handler();
                this.clickOff();
            }
        },
        clickOff: function () {
            if (!this.show) return;
            this.show = false;
            this.focused = -1;
            this.mobileIndex = '0';
            this.options.forEach(option => {
                delete option.children;
            })
        },

        mobileIndexSetter: function (child, index) {
            if (!child) return;
            this.mobileIndex=index;
        },
        mobileIndexBack: function () {
            var ar = (this.mobileIndex+'').split('-');
            ar.pop();
            this.mobileIndexSetter(true, ar.join('-'))
        },
        getRecusiveLayout(options, index) {
            let table = [];
            const getLayout = (options, index) => {
                table.push([index, options]);
                options.forEach( (option,i) => {
                    var optionIndex = index+'-'+i;
                    if (option.children) getLayout(option.children,optionIndex)
                })
            }
            getLayout(options, index)
            return table;
        }
    },
    render: function () {
        return !this.mobile ? 
            h('div', {key: this.contextId, class: ['contextual-menu glass-container-2 hide-scrollbar noselect', {hidden: !this.show, visible: this.show}], style: {left: this.x +'px', top: this.y+'px'}, onClick: this.insideClick, onMouseup: this.insideClick, onMousedown: this.insideClick}, [
                this.options.map( (option, i) => {
                    return h('div', {class: 'option-wrapper mat-hover', style: {color: option.color}, onClick: (e) => this.insideClick(e, option, i), onMouseenter: () => this.setFocus(i) }, [
                        option.img?
                            h('div', {class: 'context-icon'}, [
                                h('img', {attrs: {src: option.img}})
                            ])
                        :
                            h('div', {class: 'context-icon ' + option.class}),
                        h('div', {class: 'context-label'}, option.name),
                        option.children ? [
                            h('i', {class: 'fas fa-angle-right context-more'}),
                            h(childContext, {options: option.children, visible: this.focused === i, parent: {x: this.x, y: -4+57*i,realY: this.y+8+57*i}, direction: 0, onClickOption: (e, option) => this.insideClick(e, option) })
                        ] : null,
                    ])
                })
            ])
        :
            h('div', {key: 'mobile-contextmenu', class: ['contextual-menu mobile-contextmenu glass-container-2 noselect', {hidden: !this.show, visible: this.show}], style: {display: 'flex', 'flex-direction': 'column'}, onClick: this.insideClick, onMouseup: this.insideClick, onMousedown: this.insideClick, onWheel: (e) => e.stopPropagation()}, [
                h('div', {class: 'mobile-navigation'}, [
                    this.mobileIndex!=='0' ? h('i', {class: 'fas fa-angle-left', onClick: () => this.mobileIndexBack() }) : h('i'),
                    h('i', {class: 'fas fa-times', onClick: this.clickOff})
                ]),
                h('div', {class: 'hide-scrollbar', style: 'overflow: auto'}, [
                        this.getRecusiveLayout(this.options, '0').map( el => {
                            return this.mobileIndex === el[0] ?
                                h('div', {key: el[0]}, el[1].map( (option,i) => {
                                    let optionIndex = el[0]+'-'+i;
                                    return h('div', {class: 'option-wrapper mat-hover', style: {color: option.color}, onClick: (e) => !option.children ? this.insideClick(e, option, i) : this.mobileIndexSetter(true,optionIndex) }, [
                                        option.img ?
                                            h('div', {class: 'context-icon'}, [
                                                h('img', {src: option.img})
                                            ])
                                        :
                                            h('div', {class: 'context-icon ' + option.class}),
                                        h('div', {class: 'context-label'}, option.name),
                                        option.children ? h('i', {class: 'fas fa-angle-right context-more'}) : null
                                    ])
                                }))
                            :
                                null
                        })
                ])
            ])
    }
}
</script>

<style>
    .scroll-left-enter-active {
        animation: scroll-left-in .5s;
    }
    .scroll-left-leave-active {
        animation: scroll-left-out .5s;
    }
    .scroll-right-enter-active {
        animation: scroll-left-out .5s reverse;
    }
    .scroll-right-leave-active {
        animation: scroll-left-in .5s reverse;
    }
    @keyframes scroll-left-out {
        0% {
            left: 0;
        }
        100% {
            left: -100%;
        }
    }
    @keyframes scroll-left-in {
        0% {
            left: 100%;
        }
        100% {
            left: 0;
        }
    }

    .contextual-menu {
        position: fixed;
        top: 0;
        left: 0;
        transform: scale(1);
        transform-origin: center; /*top left;*/
        opacity: 1;
        height: auto;
        width: 250px;
        padding: 8px 0;
        /*background-color: #212121;*/
        transition: transform 0.2s ease, opacity .3s ease;
        border-radius: 10px;
        font-size: 18px;
        /*overflow: hidden;*/
        z-index: 999;
    }
    .mobile-contextmenu {
        font-size: 28px;
        height: 90%;
        width: 500px;
        max-width: 90%;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
    }
    .contextual-menu.hidden {
        transform: scale(0);
        opacity: 0;
        /*z-index: -1;*/
    }
    .option-wrapper {
        /*padding: 15px 20px;*/
        padding: 0.833em 1.11em;
        cursor: pointer;
        position: relative;
        white-space: nowrap;
        display: flex;
        justify-content: space-between;
        align-items: center;

        position: relative;
        overflow: hidden;
    }
    .option-wrapper .context-icon {
        display: inline-block;
        margin-right: 0.2em;
        width: 1.8em;
        height: 1em;
    }
    .option-wrapper .context-icon img {
        height: 100%;
        vertical-align: top;
    }
    .option-wrapper .context-label {
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
    }
    .option-wrapper .context-more {
        float: right;
        line-height: 1em;
    }
    /* .option-wrapper:hover {
        background-color: #f2f2f212;
    } */
    .mobile-navigation {
        display: flex;
        width: 100%;
        justify-content: space-around;
        font-size: 1.1em;
        padding: 0.3em 0;
        border-bottom: solid thin;
    }
    .mobile-navigation > * {
        flex: 1;
        text-align: center;
        max-width: 50%;
    }
    .mobile-navigation > *:not(:last-of-type) {
        border-right: solid thin;
    }
</style>