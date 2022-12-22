/*
  How to use: v-tooltip="Your text" or v-tooltip="{value: 'Your text'}"
  v-tooltip will cause element render updates everytime parent component is updated!
  For dynamic tooltips (Localized text) the value must be passed as a function to allow updates -> v-tooltip="{value: () => $t('translation key') }"
*/
import { computePosition, offset, shift, flip, arrow } from '@floating-ui/dom';
import { state } from './drag-drop.js'
var tNode = document.getElementById('simple-tooltip');
var arrowEl = tNode.children[0];
const weak = new WeakMap();                                             //Store reference to the element and it's tooltip value

function setTooltipText(e) {
    if (state) /* Drag and drop directive is active don't show tooltip and compute */
      return;

    var el = e.currentTarget || e.target;
    //var value = el.getAttribute('data-tooltip');

    var binding = weak.get(el),
        value=binding.value || binding,
        placement = binding.placement || 'top';
      
    if (value instanceof Function) value = value(el);
    tNode.style.display = 'block';
    tNode.style.opacity = '0';
    tNode.children[1].innerHTML = value;
    window.requestAnimationFrame( () => {
      computePosition(el, tNode, {
        strategy: 'fixed',
        placement: placement,
        middleware: [
          offset(5),
          shift(),
          flip(),
          arrow({
            element: arrowEl
          })
        ]
      }).then( ({x, y, placement, middlewareData}) => {
        tNode.setAttribute('x-placement', placement);
        const arrowData = middlewareData.arrow;
        Object.assign(arrowEl.style, {
          left: arrowData.x != null ? `${arrowData.x}px` : '',
          top: arrowData.y != null ? `${arrowData.y}px` : '',
        });
        Object.assign(tNode.style, {
          transform: 'translate(' + x+'px,' + y + 'px)',
          opacity: 1
        })
      })
    });
}

function hideTooltip () {
  tNode.style.opacity = '0';
  tNode.children[1].innerHTML = '';
  tNode.style.display = 'none';
  tNode.style.transform = 'translate(-100%,-100%)';
}
export default {
  beforeMount: function (el, binding) {
    weak.set(el, binding.value);
    el.addEventListener('mouseenter', setTooltipText);
    el.addEventListener('mouseleave', hideTooltip);
  },
  update: function (el, binding) {
    weak.set(el, binding.value)
  },
  beforeUnmount: function (el) {
    weak.delete(el);
    el.removeEventListener('mouseenter', setTooltipText);
    el.removeEventListener('mouseleave', hideTooltip);
  }
}