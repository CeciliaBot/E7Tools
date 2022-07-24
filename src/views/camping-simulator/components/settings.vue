<script>
export default {
    name: 'camping-settings',
    props: ['settings','visible'],
    data: function () {
        return {
            localSettings: this.settings,

            subMenu: false,
            subMenuName: '',

            privacyPolicy: {}
        }
    },
    watch: {
        visible: function () {
            this.subMenu = false;
        }
    },
    computed: {
        theme: function () {return this.$store.getters.getTheme}
    },
    render: function(h) {
        return h('div', {style: 'max-width: 600px; margin: auto;'}, [
            h('h1', [
                !this.subMenu ? 
                    h('span', this.$t('strings.settings'))
                : h('button', {staticClass: 'material-button basic primary noselect', style: 'line-height: 0; padding: 3px 10px; font-size: inherit;', directives: [ { name: 'ripple-effect' } ], on: { click: () => this.subMenu = false }}, [
                        h('i', {staticClass: 'fas fa-angle-left', style: 'padding-right: 0.3em'}),
                        h('span', this.subMenuName)
                ]),
                h('lang-picker', {style: 'float: right;', props: {type: 0}})
            ]),
            h('div', {style: 'margin: 10px 0;'}, [
                h('div', {key: 'main-settings-group', staticClass: 'settings-group noselect', style: {display: !this.subMenu ? '' : 'none' } }, [
                    h('div', {staticClass: 'settings-row mat-hover', directives: [ { name: 'ripple-effect' } ]}, [
                        h('span', {staticClass: 'icon'}, [
                            h('i', {staticClass: 'fas fa-sun'})
                        ]),
                        h('div', {style: 'flex: 1; padding-right: 15px;'}, [
                            h('div', this.$t('strings.light_theme')),
                            h('div', {staticClass: 'description', domProps: {innerHTML: this.$t('strings.light_theme_desc')}}),
                        ]),
                        h('label', {staticClass: 'switch'}, [
                            h('input', { attrs: { type: 'checkbox', checked: this.theme==='light'}, on: {change: (e) => this.$store.commit('setTheme', e.target.checked ? 'light':'dark') } }),
                            h('i', {staticClass: 'slider round'})
                        ])
                    ]),
                    h('div', {staticClass: 'settings-row mat-hover', directives: [ { name: 'ripple-effect' } ]}, [
                        h('span', {staticClass: 'icon'}, [
                            h('i', {staticClass: 'fas fa-icons'})
                        ]),
                        h('div', {style: 'flex: 1; padding-right: 15px;'}, [
                            h('div', this.$t('strings.force_vert_toolbar')),
                            h('div', {staticClass: 'description', domProps: {innerHTML: this.$t('strings.force_vert_toolbar_desc')} }),
                        ]),
                        h('label', {staticClass: 'switch'}, [
                            h('input', { attrs: { type: 'checkbox', checked: this.localSettings.verticalToolbar}, on: {change: (e) => this.$set(this.localSettings, 'verticalToolbar', e.target.checked) } }),
                            h('i', {staticClass: 'slider round'})
                        ])
                    ]),
                    h('div', {staticClass: 'settings-row mat-hover', directives: [ { name: 'ripple-effect' } ], on: { click: () => {this.subMenu = 'icons', this.subMenuName=this.$t('strings.ui_icons')} } }, [
                        h('span', {staticClass: 'icon'}, [
                            h('i', {staticClass: 'fas fa-theater-masks'})
                        ]),
                        h('div', {style: 'flex: 1; padding-right: 15px;'}, [
                            h('div', this.$t('strings.ui_icons')),
                            h('div', {staticClass: 'description', domProps: {innerHTML: this.$t('strings.ui_icons_desc')} }),
                        ]),
                        h('i', {staticClass: 'fas fa-angle-right'})
                    ]),
                    h('div', {staticClass: 'settings-row mat-hover', directives: [ { name: 'ripple-effect' } ], on: { click: () => this.$emit('generateUrl') } }, [
                        h('span', {staticClass: 'icon'}, [
                            h('i', {staticClass: 'fas fa-share-alt'})
                        ]),
                        h('div', {style: 'flex: 1; padding-right: 15px;'}, [
                            h('div', this.$t('strings.generate_export_url')),
                            h('div', {staticClass: 'description', domProps: {innerHTML: this.$t('strings.generate_export_url_desc')} }),
                        ])
                    ]),
                    h('div', {staticClass: 'settings-row mat-hover', directives: [ { name: 'ripple-effect' } ], on: { click: () => {this.privacyPolicy = window._ceciliaPrivacyPolicy , this.subMenu = 'privacy_options', this.subMenuName='Privacy'} } }, [
                        h('span', {staticClass: 'icon'}, [
                            h('i', {staticClass: 'fas fa-user-secret'})
                        ]),
                        h('div', {style: 'flex: 1; padding-right: 15px;'}, [
                            h('div', 'Privacy'),
                            h('div', {staticClass: 'description', domProps: {innerHTML: 'Your cookie options'} }),
                        ]),
                        h('i', {staticClass: 'fas fa-angle-right'})
                    ]),
                    h('div', {staticClass: 'settings-row mat-hover', directives: [ { name: 'ripple-effect' } ], on: { click: () => this.$emit('goTo', 'welcome') } }, [
                        h('span', {staticClass: 'icon'}, [
                            h('i', {staticClass: 'fas fa-home'})
                        ]),
                        h('div', {style: 'flex: 1; padding-right: 15px;'}, [
                            h('div', this.$t('strings.welcome')+' screen'),
                            h('div', {staticClass: 'description', domProps: {innerHTML: this.$t('strings.welcome_screen_desc')} }),
                        ])
                    ])
                ]),

                /************* ICONS *************/
                h('div', {key: 'hero-icon-group', staticClass: 'settings-group noselect', style: {display: this.subMenu === 'icons' ? '' : 'none' }}, [
                    h('span', {style: 'display: block; text-align: center; height: 120px;'}, [
                        h('hero-icon', {key: 'alencia-settings', props: {size: 75, hero: 'alencia', removable: false, hover: false, selected: false, showname: this.localSettings.showHeroName, showrarity: this.localSettings.showHeroRarity, showrole: this.localSettings.showHeroAttrRole}, on: {} })
                    ]),
                    h('div', {staticClass: 'settings-row mat-hover', directives: [ { name: 'ripple-effect' } ]}, [
                        h('span', {staticClass: 'icon'}, [
                            h('i', {staticClass: 'fas fa-tag'})
                        ]),
                        h('div', {style: 'flex: 1; padding-right: 15px;'}, [
                            h('div', this.$t('strings.show_name')),
                            h('div', {staticClass: 'description', domProps: {innerHTML: this.$t('strings.show_name_desc')} }),
                        ]),
                        h('label', {staticClass: 'switch'}, [
                            h('input', { attrs: { type: 'checkbox', checked: this.localSettings.showHeroName}, on: {change: (e) => this.$set(this.localSettings, 'showHeroName', e.target.checked) } }),
                            h('i', {staticClass: 'slider round'})
                        ])
                    ]),
                    h('div', {staticClass: 'settings-row mat-hover', directives: [ { name: 'ripple-effect' } ]}, [
                        h('span', {staticClass: 'icon'}, [
                            h('i', {staticClass: 'fas fa-snowflake'})
                        ]),
                        h('div', {style: 'flex: 1; padding-right: 15px;'}, [
                            h('div', this.$t('strings.show_role_attr')),
                            h('div', {staticClass: 'description', domProps: {innerHTML: this.$t('strings.show_role_attr_desc')} }),
                        ]),
                        h('label', {staticClass: 'switch'}, [
                            h('input', { attrs: { type: 'checkbox', checked: this.localSettings.showHeroAttrRole}, on: {change: (e) => this.$set(this.localSettings, 'showHeroAttrRole', e.target.checked) } }),
                            h('i', {staticClass: 'slider round'})
                        ])
                    ]),
                    h('div', {staticClass: 'settings-row mat-hover', directives: [ { name: 'ripple-effect' } ]}, [
                        h('span', {staticClass: 'icon'}, [
                            h('i', {staticClass: 'fas fa-star'})
                        ]),
                        h('div', {style: 'flex: 1; padding-right: 15px;'}, [
                            h('div', this.$t('strings.show_rarity')),
                            h('div', {staticClass: 'description', domProps: {innerHTML: this.$t('strings.show_rarity_desc')} }),
                        ]),
                        h('label', {staticClass: 'switch'}, [
                            h('input', { attrs: { type: 'checkbox', checked: this.localSettings.showHeroRarity}, on: {change: (e) => this.$set(this.localSettings, 'showHeroRarity', e.target.checked) } }),
                            h('i', {staticClass: 'slider round'})
                        ])
                    ])
                ]),

                /************* Policy *************/
                h('div', {key: 'privacy-options-group', staticClass: 'settings-group noselect', style: {display: this.subMenu === 'privacy_options' ? '' : 'none' }}, [
                    h('div', {staticClass: 'settings-row mat-hover', directives: [ { name: 'ripple-effect' } ]}, [
                        h('span', {staticClass: 'icon'}, [
                            h('i', {staticClass: 'fas fa-star'})
                        ]),
                        h('div', {style: 'flex: 1; padding-right: 15px;'}, [
                            h('div', 'Google analytics'),
                            h('div', {staticClass: 'description', domProps: {innerHTML: 'GA Text here.'} }),
                        ]),
                        h('label', {staticClass: 'switch'}, [
                            h('input', { attrs: { type: 'checkbox', checked: this.privacyPolicy.analytics_storage === 'granted'}, on: {change: (e) => {let popup = document.getElementById('gtag_grant_permission_popup'); if (popup) popup.remove(); let state = e.target.checked ? 'granted':'denied'; window.gtagUpdatePolicy({analytics_storage: state}); this.$set(this.privacyPolicy, 'analytics_storage', state)} } }),
                            h('i', {staticClass: 'slider round'})
                        ])
                    ])
                ])
            ])
        ])
    }
}
</script>
<style>
.settings-group {
    overflow: hidden;
    margin: 10px 0;
    padding: 5px 0;
    border-radius: 10px;
    background-color: var(--background-color-secondary);
    font-size: 25px;
    font-weight: 300;
}
.settings-group > div:not(:last-of-type) {
    border-bottom: solid thin gray;
}

.settings-row {
    display: flex;
    padding: 10px 15px;
    position: relative;
    overflow: hidden;
    justify-content: space-between;
    align-items: center;
}
.settings-row .description {
    font-size: 0.8em;
    opacity: 0.8;
}
.settings-row .icon {
    display: inline-block;
    width: 2em;
    text-align: center;
}



/************ SLIDER  ********************/
.switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 36px;
    vertical-align: middle;
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