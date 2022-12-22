<script>
import { h } from 'vue'
export default {
    name: 'open-banner',
    props: ['discussionId'],
    data: function () {
        return {
            DISQUSApproved: false
        }
    },
    created: function () {
        this.checkDISQUSPrivacy();
    },
    methods: {
        checkDISQUSPrivacy: function () {
            this.DISQUSApproved = false;
            this.DISQUSApproved = localStorage.getItem('DISQUS_USER_APPROVAL');
            if (this.DISQUSApproved) {
                this.$nextTick(()=> {
                    this.initDISQUS();
                })
            }
        },
        initDISQUS: function () {
            var iframe = document.createElement( 'iframe' )
            iframe.style="height: 100%; width: 100%; border: none; outline: none;"
            this.$el.appendChild(iframe)
                var c = document.createElement( 'div' )
                iframe.contentDocument.querySelector('body').appendChild(c);
                c.outerHTML = '<div id="disqus_thread" style="font: normal 16px/1.5 \'Titillium Web\', sans-serif;"></div>'
                var myscript = iframe.contentDocument.createElement('script');
                myscript.type = 'text/javascript';
                myscript.innerHTML = 'var disqusId= "' + this.discussionId + '"; window.disqus_config = function () { this.page.url="https://ceciliabot.github.io/ultimate-timeline/?"+disqusId; this.page.identifier = disqusId; this.page.title = disqusId;}; var d = document, s = d.createElement("script"); s.src = "https://ceciliabot.disqus.com/embed.js"; s.setAttribute("data-timestamp", +new Date()); (d.head || d.body).appendChild(s);';
                iframe.contentDocument.querySelector('body').appendChild(myscript);
        }
    },
    render: function () {
        return h('div', {style: "max-width: 1000px; margin: auto; height: 100%;", tabIndex: '-1'}, [
            this.discussionId,
            !this.DISQUSApproved ?
                h('div', {}, [
                    h('div', {style: 'text-align: center;'}, [
                        'CeciliaBot\'s comment section is powered by DISQUS.',
                        h('br'),
                        'DISQUS is a third-party service and as such it may collect, use, store and transfer different kinds of personal data about you.',
                        h('br'),
                        'If you live outside the EU make sure to OPT-OUT from DISQUS\' trackings: click on \'Do Not Sell My Data\' at the bottom of the comment section or click ', h('a', {href: 'https://disqus.com/data-sharing-settings/', target: '_blank'}, 'here.'),
                        h('br'),
                        h('br'),
                        'CeciliaBot does not actively collect your data!',
                        h('br'),
                        'Click the button bellow to accept and go to the comment section',
                        h('br'),
                        h('br'),
                        h('button', {onClick: () => {localStorage.setItem('DISQUS_USER_APPROVAL', true); this.checkDISQUSPrivacy()}, class: "material-button flat accent"}, 'OK, I understand')
                    ]),
                ])
            : null
        ])
    }
}
</script>
<style>
</style>

