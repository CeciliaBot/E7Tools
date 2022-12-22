<template>
    <div style="width: 100%; max-width: 1000px;padding: 20px;margin: auto;background-color: var(--background-modifier-darken-alpha);border-radius: 8px;">
        <template v-if="nid">
            <div style="text-align: center">
                <template v-if="fetchFailed">
                    <img :src="require('@/assets/cermia404.png')" />
                    <p>Sorry, something went wrong. Unable to get this STOVE notice!</p>
                </template>
                <i v-if="isFetching" class="fa fa-spinner fa-pulse" style="font-size: 70px; text-align:center;"></i>
            </div>
            <div v-if="author" style="text-align: center; margin-bottom: 5px;">{{ author }} • {{$d(this.date, 'long-with-time', 'en')}}</div>
            <div v-html="body"></div>
        </template>
        <template v-else>
            <div style="text-align: center">
                <img v-if="event.thumbnail" style="width: 100%;" />
                <p>Sorry no STOVE link has been provided for this event.</p>
            </div>
        </template>
    </div>
</template>

<script>
import ajax from '@/utils/ajax.js'
const TinyColor = require('../utils/TinyColor.js')

export default {
    emits: ['title', 'link'],
    props: {
        nid: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            title: '',
            author: '',
            dt: 0,
            body: '',
            link: '',
            mediaList: [],
            isFetching: true,
            fetchFailed: false
        }
    },
    watch: {
        title() {
            this.$emit('title', this.title)
        },
        link() {
            this.$emit('link', this.link)
        }
    },
    created() {
        if (this.nid) {
            var nid = this.nid
            if (Array.isArray(nid))
                nid = nid[0]
            ajax('https://ceciliabotgithub.glitch.me/stove/'+nid).then(article => JSON.parse(article)).then(article => {
                console.log(article)
                this.title = article.title
                this.author = article.user.nickname
                this.date = Number(article.reg_dt)
                this.body = this.checkHtmlText(article.content)
                this.mediaList = article.media_list
                this.$nextTick( this.patchHtml )
            }).catch(err => {
                console.error(err)
                this.fetchFailed = true
            }).finally( () => {
                this.isFetching = false
                this.link = 'https://page.onstove.com/epicseven/global/view/' + nid
            })
        }
    },
    methods: {
        checkHtmlText(text) {
            return text.replace( /(<([^/][\S]*?)[^<>]*)(style="[^"]*(color|background)[^"]*")([^>]*>)/gi /*/<([^/][\S]*?)(\sstyle\s*=\s*"[^<>]*(color|background)+[^<>]*")+[^<>]*>/gi*/, function(match) {
                if (match.match(/\bcolor\s*:\s*[^;]+/i)) {
                    match = match.slice(0, -1);
                    match += ' data-color-patch="true">';
                    return match
                } else {
                    match = match.slice(0, -1);
                    match += ' data-background-patch="true">';
                    return match
                }
            })
        },
        getRecursiveParentBackground(child) {
            if (child.parentNode===this.$el)
                return 'black';
            var color = child.style.background || child.style.backgroundColor
            if (!color)
                return this.getRecursiveParentBackground(child.parentNode)
            else
                return color
        },
        patchHtml() {
            this.$el.querySelectorAll('img').forEach(el => {
                el.style.cursor="pointer"
                el.style.maxWidth='100%'
                el.onclick = (e) => {
                    if (e.target.tagName === 'IMG')
                        this.$gallery([{src: el.src}], 0)
                }
            })
            this.$el.querySelectorAll('iframe').forEach(el => {
                el.style.maxWidth='100%'
            })
            this.$el.querySelectorAll('span, p').forEach(el => {
                el.style.background = null;
            })
            this.$el.querySelectorAll('[data-color-patch]').forEach(el => {
                var bg = TinyColor( this.getRecursiveParentBackground(el) )
                var color = TinyColor( el.style.color );
                if (!TinyColor.isReadable(color, bg,{level:"AA",size:"small"}) ) {
                    if (bg.isLight()) {
                        color = color.darken(50)
                    } else {
                        color = color.brighten().lighten(40)
                    }
                    el.style.color = color
                }
            })
            this.$el.querySelectorAll('[data-background-patch]').forEach(el => {
                var bg = TinyColor( el.style.background || el.style.backgroundColor )
                var color = TinyColor( el.style.color || 'black' );
                if (!TinyColor.isReadable(color, bg,{level:"AA",size:"small"}) ) {
                    if (bg.isLight()) {
                        color = color.darken(50)
                    } else {
                        color = color.brighten().lighten(40)
                    }
                    el.style.color = color
                }
            })
        }
    }
}
</script>

<style>

</style>