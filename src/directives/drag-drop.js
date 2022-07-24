import './drag-drop.css'
/*
    HOW TO USE drag
    Add a vue directive to the element that will have the draggin trigger and pass the following modifiers:
        * item: String                                                    String to identify the target on the drop event handler
        * index: Number                                                   Index of the item in the array / container
        * drops: Array                                                    Array of Strings, pass the name of a conatiner where this element can be dropped 
        * node: Dom Node or function returning a dom node                 (Optional) If the element to drag is different from the element with the directive. Node can also be a function, function can be useful for element rendered at the same time and can't be referenced
        * vertical: Boolean                                               (Optional) Set to true if the element can only be dragged vertically
        * horizontal: Boolen (NOT WORKING YET)                            (Optional) Same as above but horizontally
    When left click is released this directive will emit a 'drop' event, listent for this event on the parent div to handle and applay changes to the vue component
    drop event will return:
        item: state.item,               String you passed in the drag direvtive
        list: state.from,               
        oldIndex: state.index,
        index: state.targetIndex,       //new index
        node: state.node

    HOW TO USE drop

*/




var state;
var originalParent;
var nextSibling;
var placeholder;
var clickTimer;
var timer = function() {
    var start = new Date();
    return {
        stop: function() {
            var end  = new Date();
            var time = end.getTime() - start.getTime();
            return time;
        }
    }
};
/* Helpers */
// function findParent (el, callback) {
//   while (el.parentNode) {
//     el=el.parentNode;
//     if (el && callback(el)) return el;
//   }
// }

function createPlaceholder (p,c) {
    placeholder = c.cloneNode(true);
    placeholder.className= state.node.className + " dragPlaceholder";
    placeholder.id = 'item-placeholder';
    placeholder.style.position = '';
    state.node.style.width = getComputedStyle(state.node).width;
    state.node.style.height = getComputedStyle(state.node).height;
    p.insertBefore(placeholder,c);
}
function movePlaceholder(container, sibling) {
    if (!placeholder)return
    placeholder.style.display = '';
    container.insertBefore(placeholder,sibling);
}
function hidePlaceholder () {
    if (placeholder) placeholder.style.display="none";
}
function removePlaceholder () {
    if (!placeholder) return;
    placeholder.remove();
    placeholder=null;
}
function restoreStyles() {
    originalParent.insertBefore(state.node,nextSibling);
    state.node.classList.remove("is-dragging");
    state.node.style = state.originalStyle;
    document.body.classList.remove("holding-drag");
}
function resetDrag () {
    if (state) { // force mouse release
        removePlaceholder();
        state = null;
    }
}
function fireCustomEvent (e) {
    var click=e;
    if (state.touch || !e.clientX) click = e.touches[0] || e.changedTouches[0];
    var x = click.clientX;
    var y = click.clientY;
    if (Math.abs(state.freezeX-x) <= 4 && Math.abs(state.freezeY-y)<=4) {
        if (clickTimer < 700) {
            /* e.isTrusted can be used to check whatever the event is user interaction or js => just in case we decide to name the event as click */
            customEvent(state.node, 'dragclick', {node: state.node, clientX: x, clientY: y})
        } else {
            return false;
            // could emit mobile custom contextmenu
        }
        return true;
    }
    return false;
}

function customEvent (node,name,data) {
    if (!node || !name) return;
    const event = new CustomEvent(name, {
        detail: data || {}
    });
    node.dispatchEvent(event);
}

function startDragging (e, binding, touch) {
    document.activeElement.blur();
    if (!touch && (e.button !==0 || e.ctrlKey)) return;   // return if not left clicking
    else if (touch && e.touches.length > 1) return;
    e.preventDefault();                                 // avoid scrolling on mobile
    e.stopPropagation();
    resetDrag();
    clickTimer = timer();
    var click = e;
    if (!click.clientX || touch) click = e.touches[0];
    if (typeof binding.node === 'function') binding.node = binding.node(e);
    var x = click.clientX;
    var y = click.clientY;
    state = {
      from: binding.list,
      drop: binding.drops|| [],                              // array of css selectors for drop area
      node: binding.node || e.currentTarget,
      targetNode: null,
      vertical: binding.vertical,
      touch: touch,
      freezeX: x,
      freezeY: y,
      targetIndex: null
    };
    state.item = state.node.getAttribute('data-item');
    state.index = state.node.getAttribute('data-item-index');
    state.originalStyle = state.node.style.cssText.slice();

    createPlaceholder(state.node.parentNode, state.node);
    state.node.classList.add("is-dragging");
    document.body.classList.add("holding-drag");

    let boxRect = state.node.getBoundingClientRect();
    state.node.style.top = y - boxRect.height / 2 + 'px';
    if (!state.vertical)
        state.node.style.left = x - boxRect.width / 2 + 'px';
    else
        state.node.style.left = boxRect.left + 'px';

    customEvent(state.node, 'dragstart', {node: state.node})
    // let ogParent = findParent(state.node, function (node) {
    //     const attr = node.attributes['data-drop'];
    //     if (attr && state.drop.includes(attr.value)) 
    //         return true;
    //     return false;
    // });
    nextSibling = state.node.nextSibling;
    originalParent = state.node.parentNode;
    document.body.appendChild(state.node);
    // if (ogParent) {
    //     //customEvent(ogParent, 'dragenter', {node: state.node});
    //     state.targetNode = ogParent;
    //     state.targetIndex = state.index;
    // }
}
function onMouseMove(e) {
    if (!state) return;
    var click=e;
    if (state.touch || !e.clientX) click = e.touches[0] || e.changedTouches[0];
    var x = click.clientX;
    var y = click.clientY;

    let box = state.node.getBoundingClientRect();
    state.node.style.top = y - box.height / 2 + 'px';
    if (!state.vertical)
        state.node.style.left = x - box.width / 2 + 'px';
    else
        x = state.freezeX; // freeze x

    const dropAreas = state.drop; //Array;

    const els = document.elementsFromPoint(x,y);

    for (var i in els) {
        let area = els[i].attributes['data-drop'];
        if (area && dropAreas.includes(area.value)) {
            if (state.targetNode !== els[i])
                customEvent(els[i], 'dragenter', {node: state.node}),
                customEvent(state.targetNode, 'dragleave', {node: state.node});
            state.targetNode = els[i];
            if (i>0) {
                for (var j=0;j<i;j++ ) {
                    let intersectIndex = els[j].attributes['data-item-index'];
                    if (els[j].id === 'item-placeholder') {
                        if (state.targetIndex === null) state.targetIndex = state.index;
                        break;
                    }
                    else if (intersectIndex && state.node.classList.contains(els[j].classList[0])) {
                        const _pos= els[j].getBoundingClientRect();
                        let index = intersectIndex.value;
                        let dist = state.vertical ? _pos.top+ _pos.height/2 <y : _pos.left+ _pos.width/2 <x;
                        if  ( dist ) {
                            index++;
                            movePlaceholder(els[j].parentNode, els[j].nextSibling);
                        } else {
                            movePlaceholder(els[j].parentNode, els[j]);
                        }
                        state.targetIndex = Math.max(0,index);
                        break;
                    }
                }
            } else { // No element collision
                movePlaceholder(els[i], els[i].children[els[i].children.length]);
                state.targetIndex = els[i].children.length;
            }
            break;
        } else if (i>els.length-2) {
            customEvent(state.targetNode, 'dragleave', {node: state.node});
            hidePlaceholder();
            state.targetNode = null;
            state.targetIndex = null;
        }
    }
}

function onMouseUp(e) {
    if (state) {
        clickTimer = clickTimer.stop()
        //e.stopPropagation();
        restoreStyles();
        if (state.targetNode) {
            if (state.touch && fireCustomEvent(e)) {
                return resetDrag();
            }
            customEvent(state.targetNode, 'drop', {
                item: state.item,               //return item name
                list: state.from,               //return list reference
                oldIndex: state.index,
                index: state.targetIndex,       //new index
                node: state.node,
                clientX: e.clientX || (e.touches[0] || e.changedTouches[0]).clientX,
                clientY: e.clientY || (e.touches[0] || e.changedTouches[0]).clientY
            });
        } else {
            if (state.touch) /* Mouse didn't move, here we can trigger additional events as mobile helpers */
                fireCustomEvent(e);
            else customEvent(state.node, 'dragfail', {node: state.node, list: state.from, oldIndex: state.index});
        }
        return resetDrag();
    }
    resetDrag();
    //state = null;
}
function onTouchEnd(e) {
    if (!e.touches.length) onMouseUp(e)
}
document.body.addEventListener('mousemove', onMouseMove,true);
document.body.addEventListener('mouseup', onMouseUp,true);
document.body.addEventListener('touchmove', onMouseMove,true);
document.body.addEventListener('touchend', onTouchEnd,true);

export const drag = {
    beforeMount: function (el, binding) {
        el.setAttribute('data-item-index', binding.value.index);
        el.setAttribute('data-item', binding.value.item);
        el.onmousedown = (e) => startDragging(e, binding.value);
        el.ontouchstart = (e) => startDragging(e, binding.value, true);
    },
    beforeUpdate: function (el, binding) {
        el.setAttribute('data-item-index', binding.value.index);
        el.setAttribute('data-item', binding.value.item);
        el.onmousedown = (e) => startDragging(e, binding.value);
        el.ontouchstart = (e) => startDragging(e, binding.value, true);
    },
    beforeUnmount: function () {
    }
}

export const drop = {
    beforeMount: function (el, binding) {
        el.setAttribute('data-drop', binding.value);
    },
    beforeUpdate: function (el, binding) {
        el.setAttribute('data-drop', binding.value);
    },
    beforeUnmount: function () {
    }
}


/*  // Need to test
    // New data object
    const newLayout = { x:0, y:0, w:moveNode.w * 2, h:moveNode.h, i:Date.now() };
    // Remove VNode from old parent
    const vNode = moveNode.$parent._vnode.children.splice(moveNode.$parent._vnode.children.indexOf(moveNode.$vnode), 1)[0];
    // Rekey it
    vNode.key = newLayout.i;
    // Move HTMLElement
    newParent._vnode.elm.appendChild(vNode.elm);
    // Move VNode
    newParent._vnode.children.push(vNode);
    // Clean up old parent
    moveNode.eventBus.$emit('dragEvent', 'dragend')
    // Re-initialise Node for new parent (using copied source code - I don't think there's an easier way to do this)
    this.rebindEventBus(moveNode,  Object.getOwnPropertyDescriptor(newParent, "eventBus"));
    // Continue cleaning up old parent
    moveNode.$parent.$children.splice(moveNode.$parent.$children.indexOf(moveNode), 1)
    oldGrandParent.layout.splice(oldGrandParent.layout.findIndex(x => x.i == moveNode.i), 1);
    // Give Vue instance new parent
    moveNode.$parent = newParent;
    // Add new data object to new parent, triggering reactivity
    newGrandParent.layout.push(newLayout);
    // Call Nodes "mounted" hook to finish re-parenting
    this.$nextTick(function() { moveNode.$options.mounted.slice().reverse()[0].call(moveNode); });
    // Reparenting complete!

*/


