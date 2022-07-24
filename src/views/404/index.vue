<script>
import { h } from 'vue'

import cermia404 from '@/assets/cermia404.png'
import {router, routes} from '@/router'

export default {
  name: 'Error-404',
  data: function () {
    return {
    }
  },
  computed: {
  },
  methods: {
    selectRoute: function (e) {
      if (e === this.$route.path) return;
      router.push({ path: e}).catch(fail => {
        console.log(fail);
        console.log('failed');
      });
      return;
    }
  },
  render: function () {
    return h('div', {style: 'font-family: \'Lato\', sans-serif;display: flex; height: 100%; width: 100%; justify-content: center; align-items: center;'}, [
      h('img', {src: cermia404, height: 280.95, width: 270}),
      h('div', {style: 'margin-top: 30px;'}, [
        h('h1', 'Error 404'),
        h('div', routes.filter(route => route.path !== '*').map(route => {
          return h('div', {class: 'path-options', onClick: () => this.selectRoute(route.path) }, this.$t('strings.' + route.name))
        }))
      ])
    ]);
  }
}
</script>
<style scoped>
h1 {
  font-size: 50px;
  line-height: 1.1em;
  display: inline-block;
  padding-right: 12px;
  animation: typing .5s alternate infinite;
}
@keyframes typing {
	from{box-shadow: inset -3px 0px 0px #888;}
	to{box-shadow: inset -3px 0px 0px transparent;}
}
.path-options {
  cursor: pointer;
  background-color: #00000029;
  font-size: 20px;
  padding: 5px 10px;
  margin: 5px 0;
  border-radius: 8px;
}
.path-options:hover {
  background-color: #0000007d;
}
</style>