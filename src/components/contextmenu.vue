<script>
import { h, nextTick } from 'vue'
export default {
    name: 'ContextualMenu',
    props: ['optionsProp'],
    data: function () {
        return {
            x: 0,
            y: 0,
            show: true,
            options: [
                ['fa fa-times', 'Test', function () {console.log('Clicked')}],
                ['fa fa-trash', 'Elimina', function () {console.log('Clicked')}]
            ]
        }
    },
    watch: {
        options: function (val) {
            this.setOptions(val)
        }
    },
    created: function () {
        console.log(this)
        document.body.addEventListener('click', this.clickOff)
    },
    beforeUnmount: function () {
        document.body.removeEventListener('click', this.clickOff)
    },
    computed: {
    },
    methods: {
        setVisible(val) {
            this.show = val;
        },
        setPosition: function (e) {
            console.log(e);
            this.y = e.clientY;
            this.x = e.clientX;
            nextTick ( () => {
                var rect = this.$el.getBoundingClientRect();
                if (this.x + rect.width > window.innerWidth)
                    this.x = e.clientX-rect.width;
                if (this.y + rect.height > window.innerHeight)
                    this.y = e.clientY-rect.height;
            })
        },
        setOptions: function (data) {
            this.options = data;
        },
        clickOff: function () {
            this.show = false;
            this.options.forEach(element => {
                element[2] = null
            })
        }
    },
    render: function () {
        return h('div', {class: ['contextual-menu glass-container2 noselect', {hidden: !this.show, visible: this.show}], style: [{left: this.x +'px', top: this.y+'px'}] }, [
            this.options.map( option => {
                return h('div', {class: 'option-wrapper', onClick: typeof option[2] === 'function' ? option[2] : function () {return false} }, [
                    h('div', {class: option[0]}),
                    h('div', option[1])
                ])
            })
        ])
    }
}
</script>

<style>
    .contextual-menu {
        position: absolute;
        top: 0;
        left: 0;
        transform: scale(1);
        transform-origin: top left;
        opacity: 1;
        height: auto;
        min-width: 200px;
        padding: 8px 0;
        background-color: #212121;
        transition: transform 0.2s ease, opacity .3s ease;
        border-radius: 10px;
        font-size: 18px;
        overflow: hidden;
        z-index: 999;
    }
    .contextual-menu.hidden {
        transform: scale(0);
        opacity: 0;
    }
    .option-wrapper {
        padding: 15px 0;
        cursor: pointer;
    }
    .option-wrapper > div:first-child {
        display: inline-block;
        padding: 0 20px;
    }
    .option-wrapper > div:last-child {
        display: inline-block;
        padding: 0 10px;
    }
    .option-wrapper:hover {
        background-color: #f2f2f212;
    }
</style>