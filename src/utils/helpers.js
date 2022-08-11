export function debounce (fn, delay) {
    var timeoutID = null
    return function () {
      clearTimeout(timeoutID)
      var args = arguments
      var that = this
      timeoutID = setTimeout(function () {
        fn.apply(that, args)
      }, delay)
    }
}
export function throttle (callback, limit) {
    var waiting = false;                      // Initially, we're not waiting
    return function () {                      // We return a throttled function
        if (!waiting) {                       // If we're not waiting
            callback.apply(this, arguments);  // Execute users function
            waiting = true;                   // Prevent future invocations
            setTimeout(function () {          // After a period of time
                waiting = false;              // And allow future invocations
            }, limit);
        }
    }
}
export function cleanURL (router = false) {
    let url = window.location.href.split('?')[0];
    let segments = url.split('#'), maxSegments = router && router.href.charAt(0)==='#' ? 2 : 1;
    while (segments.length > maxSegments) segments.pop();
    return segments.join('#')
}