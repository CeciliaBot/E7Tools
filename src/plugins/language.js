import languagePickerModal from '@/components/language-picker.vue'
import mount from '@/utils/pluginMountComponent.js'
let state;

window.show = () => state.component.show();
window.hide = () => state.component.hide();

export default {
    install(app) {
        const { vNode, el, destroy } = mount(languagePickerModal, {app})
        state = {node: vNode, el: el, destroy: destroy, component: vNode.component.proxy}
        // console.log(state)
        document.body.appendChild(el)
        app.config.globalProperties.$localePicker = window.show;
    }
}