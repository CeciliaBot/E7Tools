<template>
    <label class="custom-check">
        <input type="checkbox" :checked="modelValue || checked" :required="required" @change="$emit('update:modelValue', $event.target.value)" />
        <span class="checkmark"></span>
        <slot></slot>
    </label>
</template>

<script>
export default {
    emits: ['update:modelValue'],
    inheritAttrs: false,
    props: {
        modelValue: String,
        checked: Boolean,
        required: Boolean
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

</style>