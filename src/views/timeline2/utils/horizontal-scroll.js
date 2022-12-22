export default function(e) {
    //const SCROLL_TARGET = document.body;
    const target = e.currentTarget || e.target;

    if (e.ctrlKey)
        return;
    else if (e.shiftKey) {
        target.scrollTop += e.deltaY/2;
        e.preventDefault()
        return;
    }
    const toLeft  = e.deltaY < 0 && target.scrollLeft > 0
    const toRight = e.deltaY > 0 && target.scrollLeft < target.scrollWidth - target.clientWidth

    if (toLeft || toRight) {
        target.scrollLeft += e.deltaY;
        e.preventDefault()
    }
}