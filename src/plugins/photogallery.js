import mount from '@/utils/pluginMountComponent.js'

var install;
var state;
function selfDestroy() {
    state.destroy();
    state = null;
}
async function gallery (data, index=0) {
    if (!state) {
        await install(data, index);
    }
}

export default {
    install(app) {
        install = (gallery, index) => {
            import(/* webpackChunkName: "PhotogalleryPlugin" */ '@/components/PhotoGallery.vue').then(module => {
                const { vNode, el, destroy } = mount(module.default, {app, props: {album: gallery, index: index, onCloseHandler: selfDestroy} })
                state = {node: vNode, el: el, destroy: destroy, component: vNode.component.proxy}
                document.body.appendChild(el)
            })
        }
        app.config.globalProperties.$gallery = gallery;
    }
}
window.$gallery = gallery