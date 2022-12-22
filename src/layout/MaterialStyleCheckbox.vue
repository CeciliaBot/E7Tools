/* https://codepen.io/finnhvman/pen/zpygBB */
<template>
    <label class="pure-material-checkbox" v-bind="bindingAttrs.attrs" >
        <input type="checkbox" :checked="modelValue || checked" @change="$emit('update:modelValue', $event.target.value)" v-bind="bindingAttrs.listeners" >
        <span><slot /></span>
    </label>
</template>

<script>
export default {
    emits: ['update:modelValue'],
    inheritAttrs: false,
    props: {
        modelValue: String,
        checked: Boolean,
        required: Boolean,
        color: String
    },
    data() {
        return {
            bindingAttrs: {}
        }
    },
    created() {
        var res = {
            listeners: {},
            attrs: {}
        };
        for (var key in this.$attrs) {
            if (/^on/.test(key)) {
                res.listeners[key] = this.$attrs[key]
            } else {
                res.attrs[key] = this.$attrs[key]
            }
        }
        this.bindingAttrs = res;
    },
    methods: {
        focus() {
            this.$el.querySelector('input').focus();
        },
        error() {
            this.$el.classList.add('error')
        },

        checkIfFilled(e) {
            if ( this.required )
                if ( !e.target.value )
                    e.target.parentNode.classList.add('error')
                else
                    e.target.parentNode.classList.remove('error')
        }
    }
}
</script>

<style>
    .pure-material-checkbox {
        z-index: 0;
        position: relative;
        display: inline-block;
        color: rgba(var(--pure-material-onsurface-rgb, inherit), 0.87);
        font-family: var(--pure-material-font, "Roboto", "Segoe UI", BlinkMacSystemFont, system-ui, -apple-system);
        font-size: inherit;
        line-height: 1.5em;
    }

    /* Input */
    .pure-material-checkbox > input {
        font-size: inherit;
        appearance: none;
        -moz-appearance: none;
        -webkit-appearance: none;
        z-index: -1;
        position: absolute;
        left: -0.5625em;
        top: -0.45em;
        display: block;
        margin: 0;
        border-radius: 50%;
        width: 2.5em;
        height: 2.5em;
        background-color: rgba(var(--pure-material-onsurface-rgb, 0, 0, 0), 0.6);
        box-shadow: none;
        outline: none;
        opacity: 0;
        transform: scale(1);
        pointer-events: none;
        transition: opacity 0.3s, transform 0.2s;
    }

    /* Span */
    .pure-material-checkbox > span {
        display: inline-block;
        width: 100%;
        cursor: pointer;
    }

    /* Box */
    .pure-material-checkbox > span::before {
        content: "";
        display: inline-block;
        box-sizing: border-box;
        margin: 0.1875em 0.6875em 0.1875em 0.0625em;
        border: solid 0.125em; /* Safari */
        border-color: currentColor;  /* rgba(var(--pure-material-onsurface-rgb, 0, 0, 0), 0.6); */
        border-radius: 0.125em;
        width: 1.25em;
        height: 1.25em;
        vertical-align: top;
        transition: border-color 0.2s, background-color 0.2s;
    }

    /* Checkmark */
    .pure-material-checkbox > span::after {
        content: "";
        display: block;
        position: absolute;
        top: 0.3em;
        left: 0.1875em;
        width: 0.625em;
        height: 0.3125em;
        border: solid 2px transparent;
        border-right: none;
        border-top: none;
        transform: translate(0.1875em, 0.25em) rotate(-45deg);
    }

    /* Checked, Indeterminate */
    .pure-material-checkbox > input:checked,
    .pure-material-checkbox > input:indeterminate {
        background-color: rgb(var(--pure-material-primary-rgb, 33, 150, 243));
    }

    .pure-material-checkbox > input:checked + span::before,
    .pure-material-checkbox > input:indeterminate + span::before {
        border-color: rgb(var(--pure-material-primary-rgb, 33, 150, 243));
        background-color: rgb(var(--pure-material-primary-rgb, 33, 150, 243));
    }

    .pure-material-checkbox > input:checked + span::after,
    .pure-material-checkbox > input:indeterminate + span::after {
        border-color: rgb(var(--pure-material-onprimary-rgb, 255, 255, 255));
    }

    .pure-material-checkbox > input:indeterminate + span::after {
        border-left: none;
        transform: translate(0.25em, 0.1875em);
    }

    /* Hover, Focus */
    .pure-material-checkbox:hover > input {
        opacity: 0.04;
    }

    .pure-material-checkbox > input:focus {
        opacity: 0.12;
    }

    .pure-material-checkbox:hover > input:focus {
        opacity: 0.16;
    }

    /* Active */
    .pure-material-checkbox > input:active {
        opacity: 1;
        transform: scale(0);
        transition: transform 0s, opacity 0s;
    }

    .pure-material-checkbox > input:active + span::before {
        border-color: rgb(var(--pure-material-primary-rgb, 33, 150, 243));
    }

    .pure-material-checkbox > input:checked:active + span::before {
        border-color: transparent;
        background-color: rgba(var(--pure-material-onsurface-rgb, 0, 0, 0), 0.6);
    }

    /* Disabled */
    .pure-material-checkbox > input:disabled {
        opacity: 0;
    }

    .pure-material-checkbox > input:disabled + span {
        color: rgba(var(--pure-material-onsurface-rgb, 0, 0, 0), 0.38);
        cursor: initial;
    }

    .pure-material-checkbox > input:disabled + span::before {
        border-color: currentColor;
    }

    .pure-material-checkbox > input:checked:disabled + span::before,
    .pure-material-checkbox > input:indeterminate:disabled + span::before {
        border-color: transparent;
        background-color: currentColor;
    }
</style>