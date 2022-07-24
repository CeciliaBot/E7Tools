import { /*stringToHtmlEmotes,*/ liveHtmlToEmote, cleanInnerText } from '@/utils/text-to-emoji.js'

export default {
    beforeMount: function (el) {
        el.addEventListener('keydown', liveHtmlToEmote)
        el.getCleanInnerHTML = () => cleanInnerText(el)
    },
    beforeUnmount: function (el) {
        el.getCleanInnerHTML = null
        el.removeEventListener('keydown', liveHtmlToEmote)
    }
}