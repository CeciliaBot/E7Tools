import { createApp } from 'vue'
import ContextMenuMain from './component.vue'
var state;

const contextmenu = {
    show: (e, options, settings={}) => {
        if (e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (settings.mobile) state.mobile = true;
        else state.mobile = false;
        state.open(options);
        state.setPosition(e);
    },
    hide: () =>{
        state.show = false,
        state.options = [];
    },
    install: (app) => {
        var ComponentApp = createApp(ContextMenuMain)
        const wrapper = document.createElement("div")
        ComponentApp.mount(wrapper)
        document.body.appendChild(wrapper)
        state = ComponentApp._instance.proxy;
        app.config.globalProperties.$contextmenu = contextmenu.show;
    }
};

export default contextmenu;