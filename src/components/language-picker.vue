<template>
    <div v-if="open" style="position: fixed; left: 0; top: 0; height: 100%; width: 100%; background-color: #00000033" @click="hide"></div>
    <div :class="['lang-picker glass-container-2', {show: open}]">
        <div v-for="locales in availableLangs" v-show="locale!==locales.code" :key="locales.code" class="locale mat-hover" @click="setLocale(locales)">
            <div :class="'flag-box flag-'+locales.code"></div>
            <div>{{ locales.name }}</div>
        </div>
    </div>
</template>

<script>
import '@/styles/lang-picker.css'
import { loadLocaleMessagesAsync } from "@/i18n"

export default {
    name: 'LocalePicker',
    data() {
        return {
            open: false
        }
    },
    computed: {
        locale: function () {
            return this.$i18n.locale;
        },
        availableLangs: function () {
            return this.$i18n._availableLocales;
        },
        lang: function () {
            return this.availableLangs.filter(locale => {
                return locale.code === this.locale;
            })[0] || {}
        }
    },
    methods: {
        show() {
            document.getElementById('app').classList.add('animate-scale-out');
            document.getElementById('app').classList.add('lang-picker-open');
            this.open=true;
        },
        hide() {
            if (this.open) {
                this.open=false;
                document.getElementById('app').classList.remove('lang-picker-open');
                setTimeout( () => document.getElementById('app').classList.remove('animate-scale-out'), 300 )
            }
        },
        setLocale(locale) {
            this.$store.commit('loading',[true,'GETTING LANG PACK...']);
            loadLocaleMessagesAsync(locale.code).then(() => {
                localStorage.setItem('USER_PREFERED_LOCALE', locale.code);
                this.hide();
            }).finally( () => {
                this.$store.commit('loading',false);
            })
        }
    }
}
</script>