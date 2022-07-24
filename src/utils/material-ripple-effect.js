/* !!!! IMPORTANT !!!!
    The element that is using this effect MUST have the following css properties
        overflow: hidden;
        position: relative;
*/

import '@/styles/material.css';

const events = ['mouseup','touchend'];

function ripple (event) {
    const button = event.currentTarget;
    let clientX = event.clientX, clientY = event.clientY;
    if (event.touches) {
        if (button.getAttribute('disabled')) return;
        button._rippleTouch = true;
        clientX = event.touches[0].clientX,
        clientY = event.touches[0].clientY;
    } else {
        if (button._rippleTouch) return;
    }
    
    var circle = document.createElement('div');
    circle.className='ripple';

    const box = button.getBoundingClientRect();
    const ratio = Math.max(box.width, box.height)*1.2;

    // circle.style.left = (clientX - box.left)-ratio/2 + 'px';
    // circle.style.top = (clientY - box.top)-ratio/2 +'px';
    circle.style.left = (clientX - box.left)-ratio/2 + 'px';
    circle.style.top = (clientY - box.top)-ratio/2 +'px';

    circle.style.width = circle.style.height = ratio + 'px';
    button.appendChild(circle);

    var check;
    Promise.all([
        new Promise(rsv => {
            check = rsv;
            events.forEach(event => document.body.addEventListener(event, check, { once: true, capture: true }) )
        }),
        new Promise(rsv => setTimeout(rsv, 300))
    ]).then(() => {
        events.forEach(event => document.body.removeEventListener(event, check, { once: true, capture: true }) )
        circle.className +=' ripple-leave';
        setTimeout(() => {
            circle.remove();
        }, 300)
    });
}
window.$ripple = ripple;
window.$materialRipple = ripple;
export default ripple;