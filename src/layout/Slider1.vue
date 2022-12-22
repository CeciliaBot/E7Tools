<template>
    <div 
        class="checkbox-toggle" 
        role="checkbox" 
        @keydown="toggle" 
        @click="toggle" 
        tabindex="0" 
        :aria-checked="toggled"
    >
        <div 
            class="checkbox-slide" 
            :class="classes"
        >
            <div 
                class="checkbox-switch" 
                :class="classes"
            ></div>
        </div>
        <div
            v-show="showLabels"
            class="checkbox-label"
            v-html="label"
        ></div>
   </div>
</template>

<script>
export default {
    name: 'SliderComponent',
    computed: {
        classes: function() {
            return {
                checked: this.toggled,
                unchecked: !this.toggled,
                disabled: this.disabled
            };
        },

        label: function() {
            return this.toggled && this.showLabels
                ? this.labelChecked
                : this.labelUnchecked;
        }
    },

    data() {
        return {
            toggled: this.value
        };
    },

    methods: {
        toggle: function(e) {
            if (this.disabled || e.keyCode === 9) { // not if disabled or tab is pressed
                return
            }

            this.toggled = ! this.toggled;

            this.$emit("input", this.toggled);
        }
    },

    props: {
        disabled: {
            type: Boolean,
            default: false
        },

        value: {
            type: Boolean,
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
}

</script>

<style>
.checkbox-toggle {
  width: 12em;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 0.5em;
}

.checkbox-slide {
  width: 4em;
  padding: 0;
  margin: 0;
  border-radius: 0.25em;
  cursor: pointer;
}

.checkbox-switch {
  padding: 0;
  margin: 0;
  width: 2em;
  height: 2em;
  border-radius: 0.25em;
  background: #384a5d;
  cursor: pointer;
}

.checkbox-label {
  margin-left: 0.5em;
}

.checkbox-switch.checked {
  transform: translateX(2em);
  transition: all 350ms;
}

.checkbox-switch.unchecked {
  transition: all 350ms;
}

.checkbox-slide.checked {
  transition: all 350ms;
  background: #67af7f;
}

.checkbox-slide.unchecked {
  transition: all 350ms;
  background: lightgray;
}

.checkbox-switch.disabled {
  cursor: not-allowed;
  background: #8da3ba;
}

.checkbox-slide.disabled {
  cursor: not-allowd;
  background: #e0e0e0;
}
</style>