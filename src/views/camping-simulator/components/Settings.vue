<template>
    <SettingsLayout :settings="options" />
</template>

<script>
import SettingsLayout from '@/components/SettingsLayout.vue'

export default {
    name: 'CampingSettings',
    components: {
        SettingsLayout
    },
    props: {
        settings: {
            type: Object
        }
    },
    data: function () {
        return {
            localSettings: this.settings,
        }
    },
    computed: {
        options() {
            return [
                [
                    {
                        name: 'light_theme',
                        description: 'light_theme_desc',
                        icon: '<i class="fa fa-sun" />',
                        slider: true,
                        value: this.settings.theme === 'light',
                        handler: () => {
                            this.localSettings.theme = this.localSettings.theme === 'light' ? 'dark' : 'light'
                            document.querySelector('html').setAttribute('data-theme', this.localSettings.theme)
                        }
                    },
                    {
                        name: 'force_vert_toolbar',
                        description: 'force_vert_toolbar_desc',
                        icon: '<i class="fa fa-icons" />',
                        slider: true,
                        value: this.settings.verticalToolbar,
                        handler: () => {
                            this.localSettings.verticalToolbar = !this.localSettings.verticalToolbar
                        }
                    },
                    {
                        name: 'bottom_searchbar',
                        description: 'bottom_searchbar_desc',
                        icon: '<i class="fa fa-filter" />',
                        slider: true,
                        value: this.settings.searchbarToBottom,
                        handler: () => {
                            this.localSettings.searchbarToBottom = !this.localSettings.searchbarToBottom
                        }
                    },
                    {
                        name: 'ui_icons',
                        description: 'ui_icons_desc',
                        icon: '<i class="fa fa-theater-masks" />',
                        children: [
                            [
                                {
                                    name: 'show_name',
                                    description: 'show_name_desc',
                                    icon: '<i class="fa fa-tag" />',
                                    slider: true,
                                    value: this.settings.showHeroName,
                                    handler: () => {
                                        this.localSettings.showHeroName = !this.localSettings.showHeroName
                                    }
                                },
                                {
                                    name: 'show_role_attr',
                                    description: 'show_role_attr_desc',
                                    icon: '<i class="fa fa-snowflake" />',
                                    slider: true,
                                    value: this.settings.showHeroAttrRole,
                                    handler: () => {
                                        this.localSettings.showHeroAttrRole = !this.localSettings.showHeroAttrRole
                                    }
                                },
                                {
                                    name: 'show_rarity',
                                    description: 'show_rarity_desc',
                                    icon: '<i class="fa fa-star" />',
                                    slider: true,
                                    value: this.settings.showHeroRarity,
                                    handler: () => {
                                        this.localSettings.showHeroRarity = !this.localSettings.showHeroRarity
                                    }
                                },
                                {
                                    name: 'disable_hover_effect',
                                    description: 'disable_hover_effect_desc',
                                    icon: '<i class="fa fa-hand-pointer" />',
                                    slider: true,
                                    value: this.settings.disableHeroIconHover,
                                    handler: () => {
                                        this.localSettings.disableHeroIconHover = !this.localSettings.disableHeroIconHover
                                    }
                                }
                            ]
                        ]
                    },
                    {
                        name: 'generate_export_url',
                        description: 'generate_export_url_desc',
                        icon: '<i class="fa fa-share-alt" />',
                        handler: () => {
                            this.$emit('exportURL')
                        }
                    },
                    {
                        name: 'language',
                        description: 'language_desc',
                        icon: '<i class="fa fa-globe" />',
                        handler: () => {
                            this.$localePicker()
                        }
                    },
                    // {
                    //     name: 'privacy',
                    //     description: 'privacy_desc',
                    //     icon: '<i class="fa fa-user-secret" />',
                    //     children: [
                    //         [
                    //             {
                    //                 name: 'Google analytics',
                    //                 description: 'GA Text here.',
                    //                 icon: '<i class="fa fa-star" />',
                    //                 slider: true,
                    //                 value: false
                    //             }
                    //         ]
                    //     ]
                    // },
                    {
                        name: 'welcome',
                        description: 'welcome_screen_desc',
                        icon: '<i class="fa fa-home" />',
                        handler: () => {
                            this.$emit('welcome')
                        }
                    }
                ]
            ]
        }
    }
}
</script>
<style>
</style>