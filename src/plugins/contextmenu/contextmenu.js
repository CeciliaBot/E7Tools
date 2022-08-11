// import { createApp } from 'vue'
import mountComponent from '@/utils/pluginMountComponent.js'
import ContextMenuMain from './component.vue'
var state,
    compHolder;

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
        // This method doesn't work beacuse ComponentApp._instance is undefined
        // var ComponentApp = createApp(ContextMenuMain)
        // const wrapper = document.createElement("div")
        // ComponentApp.mount(wrapper)
        // document.body.appendChild(wrapper)
        // state = ComponentApp._instance.proxy;
        // app.config.globalProperties.$contextmenu = contextmenu.show;

        const { vNode, el, destroy } = mountComponent(ContextMenuMain, {app})
        compHolder = {node: vNode, el: el, destroy: destroy, component: vNode.component.proxy}
        document.body.appendChild(el)
        state = compHolder.component;
        app.config.globalProperties.$contextmenu = contextmenu.show;
    }
};

export default contextmenu;