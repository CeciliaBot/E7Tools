import { throttle } from '@/utils/helpers.js'
//import './drag-drop.css'
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
        item: state.item,               // String you passed in the drag direvtive
        list: state.from,               // Array or Object you provided in the drag directive
        oldIndex: state.index,          // Number, number you provided or index of the element within the parent
        index: state.targetIndex,       // Number, final index
        node: state.node                // Dragged element
*/



export var state; // can be imported to know if it's dragging and other stuff
var mouseMoveEvents = [],
    mouseUpEvents = [],
    placeholder,
    nextSibling,
    originalParent;

function getCrossEventPosition(e) {
    var ev = e;
    if (!ev.clientX && e.touches && e.touches.length) ev = e.touches[0]
    return {
        clientX: ev.clientX,
        clientY: ev.clientY
    }
}
// function applyTranslatePosition(el, pos, axes) {
//     if (Array.isArray(pos))
//         el.style.transform = `translate(${pos[0]}, ${pos[1]})`
//     else
//         el.style.transform = el.style.transform.replace(/translate\(([^s]*)\)/, function (match, val) {
//             var old = val.split(',')
//             old[axes] = pos;
//             return `translate(${old.join(',')})`
//         })
// }

function setAsDragged(e, o) {
    state.hasMoved = true
    createPlaceholder(e, o)
    intitalTargetEdits(e, o)
    customEvent(o.target, 'dragstart', {node: o.target})
}

function setOffsets(e, o = {}) {
    state.offsetX = o.offsetX = o.box.left - o.clientX;
    state.offsetY = o.offsetY = o.box.top - o.clientY;
}

function abortDragOperation(e) {
    mouseUpEvents = []
    applyMouseUpEvents(e)
    resetDragData()
}

function movementDetector(e, o = {}, after, caller) {
    var deltaH = Math.abs(o.clientY - state.freezeY) > 1
    var deltaW = Math.abs(o.clientX - state.freezeX) > 1
    if ( (state.horizontal && deltaH) || (state.vertical && deltaW) ) {
        abortDragOperation(e)
    } else if ( deltaH || deltaW ) {
        setOffsets(e, o)
        setAsDragged(e, o)
        var eventIndex = mouseMoveEvents.indexOf(caller || movementDetector)
        if (eventIndex !== -1) {
            mouseMoveEvents.splice(eventIndex, 1, ...after)
            after.forEach(event => {
                event(e, o)
            })
        }
    }
}
function stopEvent(e) {
    e.stopPropagation()
}
function preventEvent(e) {
    e.preventDefault()
}

function startDragging(e, binding, touch) {
    var isSameActive = e.target === document.activeElement;
    if (isSameActive && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contenteditable === true))
        return; // allow normal behavior if input was previously clicked

    document.activeElement.blur();
    if (!touch && (e.button !==0 || e.ctrlKey)) return;   // return if not left clicking
    else if (touch && e.touches.length > 1) return;
    //e.preventDefault();
    e.stopPropagation();                                    // avoid dragging 2 elements if nested v-drag
    var pointer = getCrossEventPosition(e)
    state = {
        originalEvent: e,
        item: binding.item,
        index: binding.index,
        from: binding.list,
        drop: binding.drops || [],
        node: binding.node || e.currentTarget,
        vertical: binding.vertical,
        targetDrop: null,
        targetIndex: null,
        freezeX: pointer.clientX,
        freezeY: pointer.clientY,
        deepPlaceholder: !binding.disableDeepPlaceholder,
        immediate: binding.immediate,
        center: binding.center===undefined ? binding.center : false,
        restoreOnSpill: binding.restoreOnSpill
    }
    if (state.node instanceof Function) state.node = state.node(e)
    if (state.index === undefined) state.index = Array.prototype.indexOf.call(state.node.parentNode.querySelectorAll('.'+state.node.classList[0]), state.node)
    state.box = state.node.getBoundingClientRect()

    nextSibling = state.node.nextSibling;
    originalParent = state.node.parentNode;

    var eventsToRun = [
        preventEvent,
        !state.vertical ? moveTargetX : () => {},
        !state.horizontal ? moveTargetY : () => {},
        state.center ? center : applyOffsetToElement,
        updatePosition
    ]

    if (state.immediate) {
        applyEvents(e, [
            setOffsets,
            setAsDragged,
            ...eventsToRun
        ])
        mouseMoveEvents = [
            ...eventsToRun,
            throttle(checkDropContainers, 50)
        ]
    } else {
        mouseMoveEvents = [
            stopEvent,
            function toRemove(e, o) {
                movementDetector(e, o, [  // will run only once, will set state.hasMoved, run createPlaceholder, set node styles then replace self with functions in the array
                    ...eventsToRun,
                    throttle(checkDropContainers, 50)
                ], toRemove)
            }
        ]
    }


    window.addEventListener('mousemove', applyMouseMoveEvents, {passive: false})
    window.addEventListener('touchmove', applyMouseMoveEvents, {passive: false})

    mouseUpEvents = [
        restoreTargetStyles,
        destroyPlaceholder,
        dropItem,
        resetDragData
    ]

    window.addEventListener('mouseup', applyMouseUpEvents, {passive: false, capture: true})
    window.addEventListener('touchend', appyTouchEndEvents, {passive: false, capture: true})
}

function applyEvents(e, list) {
    var pos = getCrossEventPosition(e)
    var box = state.box //.node.getBoundingClientRect()

    var options = {
        target: state.node,
        clientY: pos.clientY,
        clientX: pos.clientX,
        box: box,
        left: box.left,
        top: box.top,
        offsetX: state.offsetX || 0,
        offsetY: state.offsetY || 0
    }
    list.forEach(event => {
        if (event)
            event(e, options)
    })
}
function applyMouseMoveEvents(e) {
    applyEvents(e, mouseMoveEvents)
}
function appyTouchEndEvents(e) {
    if (!e.touches.length) applyMouseUpEvents(e)
}
function applyMouseUpEvents(e) {
    applyEvents(e, mouseUpEvents)
    mouseMoveEvents = [];
    mouseUpEvents = [];
    window.removeEventListener('mousemove', applyMouseMoveEvents, {passive: false})
    window.removeEventListener('touchmove', applyMouseMoveEvents, {passive: false})
    window.removeEventListener('mouseup', applyMouseUpEvents, {passive: false, capture: true})
    window.removeEventListener('touchend', appyTouchEndEvents, {passive: false, capture: true})
}

function intitalTargetEdits(e, o = {}) {
    state.originalStyle = o.target.style.cssText + ''
    o.target.style.width = getComputedStyle(o.target).width;
    o.target.style.height = getComputedStyle(o.target).height;
    o.target.style.left = o.box.left +'px';
    o.target.style.right = o.box.right +'px';
    //applyTranslatePosition(o.target, [o.box.left, o.box.right])
    o.target.classList.add("is-dragging")
    document.body.classList.add("holding-drag")
    document.body.appendChild(o.target)
}
function restoreTargetStyles(e, o = {}) {
    if (document.body === o.target.parentNode) {
        originalParent.insertBefore(o.target,nextSibling);
        o.target.classList.remove("is-dragging");
        o.target.style = state.originalStyle;
        document.body.classList.remove("holding-drag");
    }
}
function createPlaceholder(e, o = {}) {
    placeholder = o.target.cloneNode(state.deepPlaceholder);
    placeholder.className = o.target.className + " dragPlaceholder";
    placeholder.id = 'item-placeholder';
    placeholder.style.position = '';
    o.target.parentNode.insertBefore(placeholder, o.target);
}
function destroyPlaceholder() {
    if (!placeholder) return;
    placeholder.remove();
    placeholder=null;
}
function hidePlaceholder () {
    if (placeholder)
        placeholder.style.display="none";
}
function moveTargetX(e, o = {}) {
    o.left = o.clientX
    state.lastX = o.clientX
}
function moveTargetY(e, o = {}) {
    o.top = o.clientY
    state.lastY = o.clientY
}
function applyOffsetToElement(e, o = {}) {
    if (!state.horizontal)
        o.top = o.top + (o.offsetY || 0)
    if (!state.vertical)
        o.left = o.left + (o.offsetX || 0)
}
function center(e, o = {}) {
    if (!state.horizontal)
        o.top = o.top -  o.box.height/2
    if (!state.vertical)
        o.left = o.left - o.box.width/2
}
function updatePosition(e, o = {}) {
    //applyTranslatePosition(o.target, [o.left, o.top])
    o.target.style.left = o.left + 'px'
    o.target.style.top = o.top + 'px'
}
function movePlaceholder(parent, sibling) {
    if (!placeholder)
        return;
    placeholder.style.display = '';
    parent.insertBefore(placeholder, sibling);
}
function checkDropContainers(e, o = {}) {
    const els = document.elementsFromPoint(state.lastX || state.freezeX, state.lastY || state.freezeY);
    var sibling, parent;
    for (var i in els) {
        if (els[i] === placeholder || (o.target.classList.contains(els[i].classList[0])) ) {
            sibling = els[i]
        }
        if (state.drop.includes(els[i].getAttribute('data-drop'))) {
            parent = els[i]
            break;
        }
    }

    if (state.targetDrop !== parent) {
        customEvent(state.targetDrop, 'dragleave', {node: state.node, state});
        if (parent) {
            customEvent(parent, 'dragenter', {node: state.node, state});
        }
    }

    if (parent) {
        state.targetDrop = parent
        if (!sibling) {
            movePlaceholder(parent)
            state.targetIndex = parent.children.length;
        } else {
            if (sibling === placeholder) {
                state.targetIndex = state.targetIndex !== null ? state.targetIndex : state.index
            } else {
                const _pos = sibling.getBoundingClientRect();
                let dist = state.vertical ? _pos.top+ _pos.height/2 < state.lastY : _pos.left + _pos.width / 2 < state.lastX

                var indexAttribute = sibling.getAttribute('data-item-index')
                var index = indexAttribute !== null ? Number(indexAttribute) : NaN;
                if (isNaN(index)) {
                    index = Array.prototype.indexOf.call(parent.querySelectorAll('.'+sibling.classList[0]+':not(.dragPlaceholder)'), sibling)
                    if (originalParent === parent && state.index <= index) index++
                }

                if  ( dist ) {
                    movePlaceholder(sibling.parentNode, sibling.nextSibling);
                    index++
                } else {
                    movePlaceholder(sibling.parentNode, sibling);
                }

                state.targetIndex = Math.max(0,index);
            }
        }
    } else {
        if (state.restoreOnSpill) {
            hidePlaceholder()
            state.targetDrop = null
            state.targetIndex = null
        }
    }
    return null
}
function dropItem(e, o = {}) {
    if (state.hasMoved) {
        if (state.targetDrop) {
            customEvent(state.targetDrop, 'drop', {
                item: state.item,               //return item name
                list: state.from,               //return list reference
                oldIndex: state.index,
                index: state.targetIndex,       //new index
                node: state.node,
                clientX: o.clientX || state.lastX,
                clientY: o.clientY || state.lastY
            })
        } else {
            customEvent(o.target, 'dragfail', {node: o.target, list: state.from, oldIndex: state.index});
        }
    }
}
function resetDragData() {
    state = null
    nextSibling = null
    originalParent = null
}
function customEvent (node,name,data) {
    if (!node || !name) return;
    const event = new CustomEvent(name, {
        detail: data || {}
    });
    node.dispatchEvent(event);
}

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