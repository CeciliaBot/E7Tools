/*
  How to use: v-tooltip="Your text" or v-tooltip="{value: 'Your text'}"
  v-tooltip will cause element render updates everytime parent component is updated!
  For dynamic tooltips (Localized text) the value must be passed as a function to allow updates -> v-tooltip="{value: () => $t('translation key') }"
*/
import './tooltip.css'
var tNode = document.getElementById('simple-tooltip');
const weak = new WeakMap();                                             //Store reference to the element and it's tooltip value

function setTooltipText(e) {
    if (window.$isDraggingSomething) return;
    var el = e.currentTarget || e.target;
    //var value = el.getAttribute('data-tooltip');
    var binding = weak.get(el);
    var value=binding.value || binding;
    if (value instanceof Function) value = value(el);
    tNode.style.display = 'block';
    tNode.style.opacity = '0';
    tNode.children[1].innerHTML = value;
    window.requestAnimationFrame( () => {
      var pos = el.getBoundingClientRect(), _pos = tNode.getBoundingClientRect();
      var x, y, aY, cenX = pos.left + pos.width/2, _halfX = _pos.width/2, /*cenY = pos.top + pos.height/2, _halfY = _pos.height/2,*/
          a = tNode.children[0];
      if (window.innerWidth < cenX + _halfX) {
        x = Math.min(window.innerWidth - _pos.width,pos.right - _pos.width);
        a.style.right = Math.min(_pos.width/2-30,pos.width/2-10)+'px';
        a.style.left = 'auto';
      } else if (0 > cenX - _halfX) {
        x = Math.max(0, pos.left);
        a.style.left = Math.min(_pos.width/2-30,pos.width/2-10)+'px';
        a.style.right = '';
      } else {
        x=cenX-_halfX;
        a.style.right = '';
        a.style.left = '';
      }
      if (0 >= pos.top-_pos.height-5) {
        y = pos.bottom+2;
        aY = 'bottom';
      } else {
        y=pos.top-_pos.height-5;
        aY = 'top';
      }
      tNode.setAttribute('x-placement', aY);
      tNode.style.transform = 'translate3d(' + x+'px,' + y + 'px,0)';
      tNode.style.opacity = '1';
    });
}

function hideTooltip () {
  tNode.style.opacity = '0';
  tNode.children[1].innerHTML = '';
  tNode.style.display = 'none';
  tNode.style.transform = '';
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