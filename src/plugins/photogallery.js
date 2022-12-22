import mount from '@/utils/pluginMountComponent.js'

var install;
var state;
var loading; // prevent to gallerys from opening at the same time (while importing async module)
function selfDestroy() {
    state.destroy();
    state = null;
}
async function gallery (data, index=0) {
    if (!state && !loading) {
        await install(data, index);
    }
}

export default {
    install(app) {
        install = (gallery, index) => {
            loading = true;
            import(/* webpackChunkName: "PhotogalleryPlugin" */ '@/components/PhotoGallery.vue').then(module => {
                const { vNode, el, destroy } = mount(module.default, {app, props: {album: gallery, index: index, onCloseHandler: selfDestroy} })
                state = {node: vNode, el: el, destroy: destroy, component: vNode.component.proxy}
                document.body.appendChild(el)
                loading = false
            })
        }
        app.config.globalProperties.$gallery = gallery;
    }
}
window.$gallery = gallery