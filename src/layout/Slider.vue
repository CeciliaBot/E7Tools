<template>
    <label :class="['switch', classes]" role="checkbox" @keydown="toggle" @keydown.space="toggle" @click.prevent="toggle" tabindex="0" >
        <input type="checkbox" :checked="value" tabindex="-1"/>
        <i class="slider round" />
    </label>
</template>

<script>
export default {
    emits: ['input'],
    name: "SliderComponent",
    props: {
        disabled: {
            type: Boolean,
            default: false
        },

        value: {
            default: false
        },

        showLabels: {
            type: Boolean,
            default: false
        },

        labelChecked: {
            type: String,
            default: ""
        },

        labelUnchecked: {
            type: String,
            default: ""
        }
    },
    data: function () {
        return {
        }
    },
    computed: {
        classes: function() {
            return {
                disabled: this.disabled
            };
        },
        label: function() {
            return this.toggled && this.showLabels
                ? this.labelChecked
                : this.labelUnchecked;
        }
    },
    methods: {
        toggle: function(e) {
            if (this.disabled || e.keyCode === 9) {// if disabled or tab is pressed
                return;
            }

            this.$emit("input", !this.value)//this.$el.querySelector('input').checked);
        }
    }
}
</script>

<style>
/************ SLIDER  ********************/
.switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 36px;
    vertical-align: middle;
}
.disabled {
    opacity: 0.4;
    pointer-events: none;
    cursor: not-allowed !important;
}

/* Hide default HTML checkbox */
.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

/* The slider */
.slider {
    position: absolute;
    cursor: pointer;
    width: 60px;
    top: 0;
    /*left: 0;*/
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 5px;
    bottom: 5px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
}

input:checked + .slider {
    background-color: #2196F3;
}

input:focus + .slider {
    box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
    -webkit-transform: translateX(24px);
    -ms-transform: translateX(24px);
    transform: translateX(24px);
}

/* Rounded sliders */
.slider.round {
    border-radius: 34px;
}

.slider.round:before {
    border-radius: 50%;
}
</style>