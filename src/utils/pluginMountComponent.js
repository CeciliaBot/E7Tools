/* From https://github.com/pearofducks/mount-vue-component */

import { createVNode, render } from 'vue'

export default function mount(component, { props, children, element, app } = {}) {
  let el = element

  let vNode = createVNode(component, props, children)
  if (app && app._context) vNode.appContext = app._context
  if (el) render(vNode, el)
  else if (typeof document !== 'undefined' ) render(vNode, el = document.createElement('div'))

  const destroy = () => {
    if (el) render(null, el)
    el.remove()
    el = null
    vNode = null
  }
  
  return { vNode, destroy, el }
}