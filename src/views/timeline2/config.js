import { cdn } from '@/utils/constant.js'

export default {
    startingTimelines: ['covenant', 'mystic', 'powder_shop', 'covenant_shop', 'galaxy_shop', 'exclusive_equipment', 'specialty_change', 'arena', 'world_arena', 'guild_war'],
    supportedTimelines: {
        covenant: {
            icon: cdn+'item/token_ticket_rare.png'
        },
        mystic: {
            icon: cdn+'item/token_ticket_special.png'
        },
        powder_shop: {
            icon: cdn+'item/token_powder.png'
        },
        covenant_shop: {
            icon: cdn+'item/token_rarecoin.png'
        },
        galaxy_shop: {
            icon: cdn+'item/token_mooncoin.png'
        },
        exclusive_equipment: {
            icon: cdn+'img/token_exclusive.png'
        },
        balance_adjustment: {
            icon: cdn+'img/icon_menu_store.png'
        },
        specialty_change: {
            icon: cdn+'img/icon_menu_classchange.png'
        },
        arena: {
            icon: cdn+'img/icon_menu_arena.png'
        },
        world_arena: {
            icon: cdn+'img/icon_battle.png'
        },
        guild_war: {
            icon: cdn+'img/icon_menu_clan_war.png'
        },
        skin: {
            icon: cdn+'img/icon_menu_skin.png'
        },
        'check-in': {
            icon: ''
        }
    },
    bgBreakPoints: {
        2018: {
            // Game Release
            11: 'https://multiplayer.net-cdn.it/thumbs/images/2018/11/16/epic-seven-cover_png_1200x0_crop_q85.jpg'
        },
        2019: {
            // Episode 2
            7: 'https://i.redd.it/iw40wnybwjt41.jpg'
        },
        2020: {
            // Episode 3
            8: 'https://i.ytimg.com/vi/vrdWaQMjK-g/maxresdefault.jpg'
        },
        2021: {
            // Summer event
            4: 'https://external-preview.redd.it/LxJvmBPs63PwYalDoaZrwlYivPiBuS1oE6pVdH8i9yA.jpg?auto=webp&s=54753599a34f858016cb0deb5becaeb6ac3725a6',
            // Rise
            6: '',
            // E7WC 2021
            7: 'https://i.ibb.co/9W0WYDM/34307ae2205c4198a25ae3c6106915e1-1619684701-3.jpg',
            // Episode 4
            11: ''

        },
        2022: {
            8: 'https://progioco.com/wp-content/uploads/2022/08/Elenco-dei-sette-livelli-di-Epic-i-migliori-personaggi-per.jpg'
        }
    }
}