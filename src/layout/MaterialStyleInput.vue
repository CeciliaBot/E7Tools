<template>
    <div class="input-field" v-bind="bindingAttrs.attrs" v-ripple-effect>
        <input
            :type="type"
            placeholder="&nbsp;"
            :required="required"
            :value="modelValue"
            v-bind="bindingAttrs.listeners"
            @input="$emit('update:modelValue', $event.target.value)"
            @blur="checkIfFilled"
        />
        <label class="label">{{ placeholder || label }}</label>
        <span class="focus-bg"></span>
    </div>
</template>

<script>
export default {
    emits: ['update:modelValue'],
    inheritAttrs: false,
    props: {
        modelValue: String,
        placeholder: String,
        label: String,
        required: Boolean,
        type: {
            default: 'text'
        }
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
    [data-theme="light"] .input-field {
        --bg-color: rgba(0, 0, 0, 0.02);
        --input-color: #000;
        --label-color: rgba(0, 0, 0, 0.5);
        --label-color-filled: rgba(0, 0, 0, 0.5);
    }
    [data-theme="dark"] .input-field {
        --bg-color: #00000026;
        --input-color: white;
        --label-color: #ffffff80;
        --label-color-filled: #ffffff80;
    }

    /* Custom input field*/
    .input-field {
        position: relative;
        margin: 5px 10px;
        border-radius: 3px;
        overflow: hidden;
    }
    .input-field > input::placeholder {
        color: transparent;
        user-select: none;
        font-size: 1.5em;
    }

    .input-field .label {
        position: absolute;
        top: 20px;
        left: 12px;
        font-size: 16px;
        color: var(--label-color);
        font-weight: 500;
        transform-origin: 0 0;
        transform: translate3d(0, 0, 0);
        transition: all .2s ease;
        pointer-events: none;
    }
    .input-field .focus-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.05);
        z-index: -1;
        transform: scaleX(0);
        transform-origin: left;
    }
    .input-field input {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        border: 0;
        font-family: inherit;
        padding: 16px 12px 0 12px;
        height: 56px;
        font-size: 16px;
        font-weight: 400;
        background: var(--bg-color);
        box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.3);
        color: var(--input-color);
        transition: all .15s ease;
    }
    .input-field input:hover {
        background: rgba(0, 0, 0, 0.04);
        box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.5);
    }
    .input-field input:not(:placeholder-shown) + .label {
        color: var(--label-color-filled);
        transform: translate3d(0, -12px, 0) scale(0.75);
    }
    .input-field input:focus {
        background: rgba(0, 0, 0, 0.05);
        outline: none;
        box-shadow: inset 0 -2px 0 #0077FF;
    }
    .input-field input:focus + .label {
        color: #0077FF;
        transform: translate3d(0, -12px, 0) scale(0.75);
    }
    .input-field input:focus + .label + .focus-bg {
        transform: scaleX(1);
        transition: all .1s ease;
    }
    .input-field.error .label {
        color: red;
    }
    .input-field.error input {
        box-shadow: inset 0 -1px 0 red;
    }
</style>