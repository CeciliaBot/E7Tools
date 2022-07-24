import { createApp } from 'vue'
import snackbarComponent from '@/components/snackbar.vue'

var state;
function model (type, object) {
    let standard = {
        type: type || 'info',
        title: object.title || object.name || '',
        description: object.description || ''
    }
    for (var key in object) {
        if (object[key]) object[key] = standard[key]
    }
    return standard;
}
const snack = {
    log: (options) => {
        state.pushNotification( model('success', options) )
    },
    info: (options) => {
        state.pushNotification( model('info', options) )
    },
    warn: (options) => {
        state.pushNotification( model('warn', options) )
    },
    error: (options) => {
        state.pushNotification( model('error', options) )
    },
    install: function (app) {
        var ComponentApp = createApp(snackbarComponent)
        const wrapper = document.createElement("div")
        ComponentApp.mount(wrapper)
        document.body.appendChild(wrapper)
        state = ComponentApp._instance.proxy;
        app.config.globalProperties.$snackbar = snack;
    }
};
window.$snackbar = snack;
export default snack;