<script>
import { h } from 'vue'
import childContext from './child-context.vue'
const CONTEXT_WIDTH = 250;

export default {
    name: 'child-context',
    props: ['options', 'parent','visible','direction'],
    data: function () {
        return {
            focused: -1,
            left: null,
            top: null,
            currDirection: 0
        }
    },
    watch: {
        visible: function (val) {
            if (val==true && !this.left && !this.top)
                this.positionSubmenu();
        }
    },
    methods: {
        positionSubmenu: function () {
            const px = this.parent.x, py = this.parent.y+4;
            var x,y;
            if (this.direction === 1) {
                if (px-CONTEXT_WIDTH < 0 && px+CONTEXT_WIDTH<=window.innerWidth)
                    x=CONTEXT_WIDTH,
                    this.currDirection = 0;
                else if (px-CONTEXT_WIDTH>0)
                    x=-CONTEXT_WIDTH,
                    this.currDirection = 1;
                else
                    x=-CONTEXT_WIDTH-(px-CONTEXT_WIDTH);
                    this.currDirection = 1;
            } else {
                if (px+CONTEXT_WIDTH*2 > window.innerWidth && px-CONTEXT_WIDTH>=0)
                    x=-CONTEXT_WIDTH,
                    this.currDirection = 1;
                else if (px+CONTEXT_WIDTH*2<=window.innerWidth)
                    x=CONTEXT_WIDTH,
                    this.currDirection = 0;
                else
                    x=CONTEXT_WIDTH-(px+CONTEXT_WIDTH*2-window.innerWidth),
                    this.currDirection = 0;
            }
            if (57*this.options.length<window.innerHeight && this.parent.realY+57*this.options.length>window.innerHeight-5)
                y=py-57*(this.options.length-1);
            else if (57*this.options.length>window.innerHeight && this.parent.realY+window.innerHeight*0.8>window.innerHeight-5) {
                const position = (window.innerHeight*0.8) - (window.innerHeight-this.parent.realY),
                      newPosition = Math.floor(position/57)*57;
                y=-Math.ceil( newPosition );
            } else
                y=py;
            this.left = x;
            this.top = y;
        },

        leftOptionBox: function (i) {
            if (this.focused===i) this.focused = -1;
        },
        clickedOption: function (e,option) {
            if (option.handler) {
                this.$emit('clickOption', e,option);
                this.focused = -1;
            }
        }
    },
    render: function () {
        return h('div', {class: 'contextual-menu glass-container', style: {display: this.visible?'':'none', 'max-height': '80vh', position: 'fixed', top: this.top+'px', left: this.left+'px', 'background-color': 'var(--background-color-secondary)', color: 'var(--font-color-secondary)'} }, 
            this.options.map( (option, i) => {
                return h('div', {class: 'option-wrapper mat-hover', style: {color: option.color}, onClick: (e) => this.clickedOption(e, option), onMouseenter: () => this.focused=i, onMouseleave: () => this.leftOptionBox(i) }, [
                    h('div', {class: 'context-icon', style: option.noIcon?'margin:0; width:0;':''}, [
                        option.img? h('img', {src: option.img, crossorigin: 'anonymous', SameSite: 'Lax'})
                        : h('i', {class: option.class})
                    ]),
                    h('div', {class: 'context-label'}, option.name),
                    option.children ? [
                        h('i', {class: 'fas fa-angle-right context-more'}),
                        h(childContext, {options: option.children, visible: this.focused === i, parent: {x: this.parent.x+this.left, y: -4+57*i, realY: 57*(i-1)}, direction: this.currDirection, onClickOption: (e,option) => this.clickedOption(e, option) })
                    ] : null
                ])
            })
        );
    }
}
</script>