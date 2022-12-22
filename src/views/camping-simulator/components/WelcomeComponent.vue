<template>
    <div style="height: 100%; width: 100%; position: relative; overflow: hidden;">
        <div style="position: absolute; height: 100%; width: 100%; pointer-events: none;" class="noselect">
            <img :src="bg" style="object-fit: cover; opacity: 0; transition: opacity 0.4s ease; height: 100%; width: 100%;" @load="e => e.target.style.opacity=0.2" />
        </div>

        <div :style="['height: 100%;width: 100%;padding-bottom: 20px;display: flex;flex-direction: column;flex-wrap: wrap;position: absolute;top: 0px;left: 0px;transition: transform 0.4s ease 0s;', {transform: !welcomeTab ? 'translateY(0)' : 'translateY(-100%)'}]">
            <div style="flex: 1; position: relative;">
                <div class="absolute-center camp-title noselect">
                    <img :src="require('@/assets/camping-simulator-logo.png')"/>
                    <br>
                    <span style="font-weight: 300; font-size: 12px;">Version {{ VERSION }}</span>
                    <br>
                    <span v-if="newHeroes" style="font-weight: 300; font-size: 12px;">
                        New characters since your last visit: {{ newHeroes.join(', ')}}
                    </span>
                </div>
            </div>
            <span class="text-center">
                The old camp simulator can be found <a href="./old-camping/">here</a>.
            </span>

            <div style="text-align: center;">
                <div class="noselect" style="overflow: hidden; position: relative; height: 100px; width: 300px; z-index: 0; display: inline-block; text-align: start;">
                    <div style="position: absolute; bottom: 0; width: 100%; z-index: -1;">
                        <button class="material-button flat primary" style="width: 99%; vertical-align: bottom; border: solid 2px; padding-left: 80px;" @click="welcomeTab='changelog'" v-ripple-effect>{{ $t('strings.changelog') }}<i class="fa fa-arrow-right" style="float: right; line-height: 2.4em;" /></button>
                    </div>
                    <div style="pointer-events: none;">
                        <img :src="require('@/assets/chibi-maid-chloe.png')" style="height: 98px;" />
                    </div>
                </div>
                <!-- <div class="noselect" style="overflow: hidden; position: relative; height: 100px; width: 300px; z-index: 0; display: inline-block; text-align: start;">
                    <div style="position: absolute; bottom: 0; width: 100%; z-index: -1;">
                        <button class="material-button flat accent" style="width: 99%; vertical-align: bottom; border: solid 2px; padding-left: 80px;" @click="welcomeTab='help'" v-ripple-effect>{{ $t('strings.help') }}<i class="fa fa-arrow-right" style="float: right; line-height: 2.4em;" /></button>
                    </div>
                    <div style="pointer-events: none;">
                        <img :src="require('@/assets/chibi-yufine.png')" style="height: 98px; transform: rotateY(180deg);" />
                    </div>
                </div> -->
                <div class="noselect" style="overflow: hidden; position: relative; height: 100px; width: 300px; z-index: 0; display: inline-block; text-align: start;">
                    <div style="position: absolute; bottom: 0; width: 100%; z-index: -1;">
                        <button class="material-button flat confirm" style="width: 99%; vertical-align: bottom; border: solid 2px; padding-left: 80px;" @click="welcomeTab='credits'" v-ripple-effect>{{ $t('strings.credits') }}<i class="fa fa-arrow-right" style="float: right; line-height: 2.4em;" /></button>
                    </div>
                    <div style="pointer-events: none;">
                        <img :src="require('@/assets/chibi-tamarinne-trace.png')" style="height: 98px;" />
                    </div>
                </div>
                <div class="noselect" style="overflow: hidden; position: relative; height: 100px; width: 300px; z-index: 0; display: inline-block; text-align: start;">
                    <div style="position: absolute; bottom: 0; width: 100%; z-index: -1;">
                        <button class="material-button flat warn" style="width: 99%; vertical-align: bottom; border: solid 2px; padding-left: 80px;" @click="welcomeTab='report'" v-ripple-effect>{{ $t('strings.contribute_and_report') }}<i class="fa fa-arrow-right" style="float: right; line-height: 2.4em;" /></button>
                    </div>
                    <div style="pointer-events: none;">
                        <img :src="require('@/assets/cermia404.png')" style="height: 98px;" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Changelog -->
        <div :class="['slide flex-col', {visible: welcomeTab === 'changelog'}]">
            <div @click="welcomeTab=false" class="slide-back-button animated-text overflow-hidden mat-hover relative noselect" v-ripple-effect>
                <div><i class="fa fa-ellipsis-v" /></div>
                <div>{{ $t('strings.back') }}</div>
            </div>
            <div class="flex-fill">
                <ChangelogComponent path="views/camping-simulator/" />
            </div>
        </div>

        <!-- Help -->
        <div :class="['slide flex-col', {visible: welcomeTab === 'help'}]">
            <div @click="welcomeTab=false" class="slide-back-button animated-text overflow-hidden mat-hover relative noselect" v-ripple-effect>
                <div><i class="fa fa-ellipsis-v" /></div>
                <div>{{ $t('strings.back') }}</div>
            </div>
            <HelpSlides :show="welcomeTab === 'help'" />
        </div>

        <!-- Credits -->
        <div :class="['slide flex-col', {visible: welcomeTab === 'credits'}]">
            <div @click="welcomeTab=false" class="slide-back-button animated-text overflow-hidden mat-hover relative noselect" v-ripple-effect>
                <div><i class="fa fa-ellipsis-v" /></div>
                <div>{{ $t('strings.back') }}</div>
            </div>
            <div class="flex-fill" style="text-align: center;">
                <div>{{ $t('strings.developed_by', ['gio#0898']) }}</div><br>
                <div v-for="locale in locales" :key="locale.code">
                    <img v-if="locale.flag" :data-src="locale.flag" style="height: 1em; vertical-align: middle; margin-right: 5px;" v-lazyloader />{{ locale.name }}: <span v-html="(locale.authors || ['-']).join(', ')" />
                </div>
                <br>
                <div>If you want to help translate contact me!</div>
            </div>
        </div>

        <!-- Contribute -->
        <div :class="['slide flex-col', {visible: welcomeTab === 'report'}]">
            <div @click="welcomeTab=false" class="slide-back-button animated-text overflow-hidden mat-hover relative noselect" v-ripple-effect>
                <div><i class="fa fa-ellipsis-v" /></div>
                <div>{{ $t('strings.back') }}</div>
            </div>
            <div class="flex-fill" style="text-align: center;">
                If you want to report an issue or request a feature you can do it here
                <div>
                    <a href="https://github.com/CeciliaBot/E7Tools/issues" target="_blank" class="social-box glass-container mat-hover noselect" v-ripple-effect>
                        <i class="fab fa-github" style="font-size: 3em;"/>
                        <p>E7Tools</p>
                    </a>
                </div>
                if you don't have a GitHub account you can contact me through one of the socials bellow
                <div>
                    <a v-for="brand in [['reddit', 'UsernameSniped', 'https://www.reddit.com/user/UsernameSniped/'], ['discord', 'gio#0898', 'https://discordapp.com/users/605601436570615828'], ['telegram', '@Gio94', 'https://t.me/Gio94']]" :key="brand[0]" :href="brand[2]" target="_blank" class="social-box glass-container mat-hover noselect" v-ripple-effect>
                        <i :class="'fab fa-'+brand[0]" style="font-size: 3em;"/>
                        <p>{{ brand[1] }}</p>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ChangelogComponent from '@/components/changelog.vue'
import { cdn } from '@/utils/constant.js'
import HelpSlides from './WelcomeHelpSlides.vue'
// import ajax from '@/utils/ajax.js'

export default {
    components: {
        ChangelogComponent,
        HelpSlides
    },
    inject: ['VERSION'],
    props: {
        verticalToolbar: {
            type: Boolean,
            default: false
        },
        newHeroes: {
            default: false
        }
    },
    data() {
        return {
            welcomeTab: false,
            bg: cdn +'/ui/camping-low-res.png',
            cdn: cdn,
            locales: (this.$i18n._availableLocales || []).slice()
        }
    },
    created() {
        // ajax('https://api.github.com/repos/ceciliabot/ceciliabot.github.io/commits?path=data/CampingData.json&page=1&per_page=1').then( res => {
        //     var commit = res[0].commit;
        //     this.lastCampingDataCommit = {
        //         author: commit.committer.name,
        //         avatar: res[0].committer.avatar_url,
        //         data: commit.committer.date,
        //         message: commit.message.replace(/^\[.*\]/, '').trim()
        //     }
        //     console.log(this.lastCampingDataCommit)
        // }).catch(err => {
        //     console.error('Ops something went wrong while getting last github commit', err)
        // })
    }
}
</script>

<style scoped>
    .slide {
        height: 100%;
        width: 100%;
        overflow: auto;
        position: absolute;
        top: 0;
        left: 0;
        transform: translateY(100%);
        transition: transform 0.4s ease;
    }
    .slide.visible {
        transform: translateY(0);
    }
    .slide-back-button {
        padding: 10px;
        font-size: 20px;
        cursor: pointer;
        text-align: center;
    }
    .animated-text {
        background-image: linear-gradient(to bottom, white, rgb(75, 75, 75), white); 
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;  
        animation: move-text-colors 10s linear infinite reverse;
    }

    @keyframes move-text-colors {
        to {
            background-position: 0 320px;
        }
    }

    .flex-col {
        display: flex;
        flex-direction: column;
    }
    .flex-fill {
        flex: 1;
        overflow: auto;
    }

    .absolute-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%)
    }
    .camp-title {
        text-align: center;
        pointer-events: none;
        font-size: 30px;
        font-weight: 700;
        width: 100%;
    }
    .camp-title > img {
        vertical-align: middle;
        max-width: 85%;
    }

    .social-box {
        display: inline-flex;
        position: relative;
        overflow: hidden;
        flex-direction: column;
        justify-content: center;
        border-radius: 10px;
        /* background-color: var(--background-color-secondary); */
        margin: 10px;
        width: 170px;
        height: 170px;
        text-decoration: none;
    }
    .social-box:not(a) {
        cursor: default;
    }
</style>