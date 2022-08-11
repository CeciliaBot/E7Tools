<script>
import { h } from 'vue'
export default {
    name: 'ChangelogComponent',
    props: ['path'],
    data: function () {
        return {
            changelog: [],
            normalizedPath: this.path,
            changelogLang: '',
            changelogFetching: false,
            changelogFailed: false,
            isVisible: false,
            observer: null
        }
    },
    created: function () {
        while(this.normalizedPath.charAt(0) === '.' || this.normalizedPath.charAt(0) === '/')
        {
            this.normalizedPath = this.normalizedPath.substring(1);
        }
        this.observer = new IntersectionObserver(
            this.onElementObserved,
            {
                root: this.$el,
                threshold: 0,
            }
        );
    },
    beforeUnmount() {
        this.observer.disconnect();
    },
    mounted: function () {
        this.observer.observe(this.$refs.changelog);
    },
    computed: {
        lang: function () {
            return this.$i18n.locale;
        }
    },
    watch: {
        lang: function () {
            this.changelog = [];
            if (!this.changelogFetching && this.visible) this.getChangelog();
        }
    },
    methods: {
        onElementObserved(entries) {
            entries.forEach(({isIntersecting}) => {
                if (!isIntersecting) {
                    this.visible = false;
                    return;
                }
                this.visible = true;
                //this.observer.unobserve(target);
                if (!this.changelogFetching && !this.changelogFailed && (!this.changelog.length || this.changelogLang!==this.$i18n.locale)) {
                    this.getChangelog();
                }
            });
        },
        getChangelog: function () {
            this.changelogFailed = false;
            this.changelogFetching = true;
            return Promise.all([
                import(/* webpackChunkName: "[request]" */ `../${this.normalizedPath}${'changelog/'+this.$i18n.locale}.json`).catch(async () => {
                    return await import(/* webpackChunkName: "camping-changelog" */ `../${this.normalizedPath}changelog/en.json`)
                })
            ]).then(([res]) => {
                var data = res.default || [];
                this.changelog=data;
                return Promise.resolve(res)
            }).catch((error) => {
                this.changelogFailed = error;
                return Promise.resolve(false)
            }).finally(() => {
                this.changelogLang=this.$i18n.locale;
                this.changelogFetching = false;
            })
        }
    },
    render: function () {
        return h('div', {ref: 'changelog', class: 'camping-change-log'}, [
          h('h2', {class: 'title'}, [this.$t('strings.changelog'), ':']),
          this.changelog.length ? 
            this.changelog.map ( vchange => {
              return h('section', {class: "changelog-section"}, [
                h('header', {class: "changelog-sec-header"}, [
                  h('span', {class: "changelog-badge version"}, vchange[0].toFixed(2)),
                  h('h2', {class: "changelog-header-title"}, vchange[1])
                ]),
                vchange[2].map( change => {
                  return h('ul', {}, [
                    h('li', {}, [
                      h('div', {class: "changelog-badge "+change[0]}, change[0]),
                      h('div', {class: "changelog-description", innerHTML: change[1]})
                    ])
                  ])
                })
              ])
            })
          :
            h('div', {style: 'text-align: center'}, [
              this.changelogFetching ?
                h('div', {class: 'fa fa-circle-notch fa-spin'})
              :
                this.changelogFailed ?
                  h('div', {}, this.changelogFailed)
                :
                  !this.changelog || !this.changelog.length ? 
                    h('div', {}, 'Changelog is empty')
                  :
                    null
            ])
        ])
    }
}
</script>
<style>
  .camping-change-log {
    position: relative;
    z-index: 0;
    padding-bottom: 20px;
  }
  .camping-change-log .title {
    box-shadow: 0px 1px 0px 0px;
    max-width: 980px;
    margin: auto;
    padding-bottom: 5px;
    margin-bottom: 10px;
  }
  .changelog-section {
    position: relative;
    padding: 16px;
    max-width: 980px;
    margin-right: auto;
    margin-left: auto;
  }
  .changelog-sec-header {
    margin-bottom: 14px;
  }
  .changelog-section:first-of-type .changelog-sec-header:before {
    background-image: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.1) 50px);
  }
  .changelog-sec-header:before {
    content: "";
    background-image: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.1));
    width: 3px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc((65px / 2) + 16px);
    z-index: -1;
  }
  .changelog-badge {
    font-size: 11px;
    padding: 2px 5px;
    text-transform: uppercase;
    display: inline-block;
    border-radius: 3px;
    margin-right: 8px;
    text-align: center;
    width: 65px;
    height: 18px;
    flex: 0 0 65px;
    color: white;
    background-color: black;
  }
  .changelog-badge:not(.version) {
    margin-top: 2px;
  }
  .changelog-badge.version {
    font-size: 20px;
    height: 32px;
    background-color: purple;
  }
  .changelog-badge.added,.changelog-badge.new {
    background-color: #7cb939;
  }
  .changelog-badge.removed {
    background-color: red;
  }
  .changelog-badge.fix {
    background-color: #00b5ff;
  }
  .changelog-badge.bug {
    background-color: orangered;
  }
  .changelog-header-title {
    display: inline-block;
    font-weight: 300;
    font-size: 20px;
  }
  .changelog-section ul {
    list-style: none !important;
    margin-left: 55px;
  }
  .changelog-section li {
    list-style: none !important;
    display: flex;
    margin-bottom: 8px;
  }
  .changelog-description {
    text-align: start;
    overflow: auto;
    word-break: break-word;
  }
  .changelog-description a {
    text-decoration: none;
    color: rgb(151, 10, 151);
  }
  .changelog-description code {
    background-color: #00000044;
    padding: 0px 5px;
    border-radius: 5px;
  }
  @media screen and (max-width: 600px) {
    .changelog-section ul {
      margin-left: 25px;
    }
    .changelog-badge:not(.version) {
      flex: 0 0 18px;
      overflow: hidden;
      border-radius: 50%;
      color: transparent;
    }
  }
</style>