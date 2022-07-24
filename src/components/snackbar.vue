<script>
import { h, TransitionGroup } from 'vue'
export default {
    name: 'SnackbarComponent',
    props: {
    },
    data: function () {
    return {
        ev: {},
        id: 0
    }
    },
    computed: {
    },
    mounted: function () {
    },
    methods: {
      pushNotification: function (event) {
        this.id++;
        let id="N"+this.id;
        event.id=id;
        this.ev[id] = event;
        if (event.manual) { /* manually remove notification on click */
            return
        }
        if (this.mobile) { /* only one notification on mobile and has to be manually dismissed*/
        //this.$delete(this.ev, 'N'+(this.id-1))
        //return;
        }
        setTimeout(() => {
            delete this.ev[id];
        }, 3000)
      }
    },
    render: function () {
      return h('div', [
          h('div', {class: 'noselect', style: 'z-index: 1000;position: fixed; top: 0; right: 0; height: 0; text-align: center;'}, [
              h(TransitionGroup, {name:'bounce'},
                  () => {
                      return Object.values(this.ev).map( (item) => {
                          return h('div', {key: 'snack'+item.id, class: 'snackbar snack-'+item.type, onClick: ()=>delete this.ev[item.id] }, [
                              h('div', {class: 'content'}, [
                                  h('i', {class: ['icon fa', {'fa-times-circle': item.type==='error', 'fa-check-circle': item.type==='success', 'fas fa-exclamation-circle': item.type==="info" || item.type==='warn'}] }),
                                  h('h3', {class: 'title', innerHTML: item.title }),
                                  h('p', {class: 'description', innerHTML: item.description })
                              ])
                          ]);
                      })
                  }
              )
          ])
      ])
    }
};
</script>
<style>
.snackbar-container {
  z-index: 1000;position: fixed; top: 0; right: 0; height: 0; text-align: center;
}
.snackbar {
  background-color: white;
  height: 100px;
  width: 300px;
  border-radius: 15px;
  margin: 5px;
  position: relative;
  display: flex;
  overflow: hidden;
}
.snackbar > .content {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.snackbar > .content > .icon {
  position: absolute;
  left: 10px;
  font-size: 100px;
  opacity: 0.12;
}
.snack-error:before {
  content: '';
  width: 10px;
  height: 100%;
  background-color: red;
}
.snack-warn:before {
  content: '';
  width: 10px;
  height: 100%;
  background-color: rgb(255, 106, 0);
}
.snack-info:before {
  content: '';
  width: 10px;
  height: 100%;
  background-color: blue;
}
.snack-success:before {
  content: '';
  width: 10px;
  height: 100%;
  background-color: green;
}
.bounce-enter-active {
  animation: snackbar-in .5s;
}
.bounce-leave-active {
  animation: snackbar-out .5s reverse;
}
@keyframes snackbar-in {
  0% {
    transform: scale(0);
  }
  70% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes snackbar-out {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
  }
}
</style>