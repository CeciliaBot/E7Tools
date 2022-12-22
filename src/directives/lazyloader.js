/*
  add v-lazyloader to the image you want to lazy load
  addattribute data-lazy-fader to the image to use as cross fade for the main image and add data-src to the real image
  example:
    <img src="placeholder.png" data-lazy-fader style="position: absolute;" />
    <img data-src="real-image.png" v-lazyloader style="style: opacity: 0;" />
*/
var ImgMap = []; // Array of imgs already loaded at least once

export function lazyOnload(e) {
  e.target.style.opacity = '';
  const prev = e.target.previousSibling;
  if (prev && prev.tagName === 'IMG' && prev.getAttribute('data-lazy-fader')) prev.style.opacity = 0;
  e.target.onload = null; // delete self
  ImgMap.push(e.target.src.valueOf()+'');
}

export const lazyImage = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        var target = entry.target;
        const src = target.getAttribute('data-src');
        if (src) {
            target.onload = lazyOnload;
            target.setAttribute('src', src);
            target.removeAttribute('data-src');
        }
        lazyImage.unobserve(target);
        return;
      }
    });
  },
  {
    /*root: document.body,*/  //removed because it doesn't work with position fixed and absolute
    rootMargin: "0px",
    threshold: 0
  }
)

function handleElement(el) {
  const src = el.getAttribute('data-src')
  if (src) {
    if (ImgMap.includes(src)) { /* Image has been loaded before */
      const prev = el.previousSibling;
      if (prev && prev.tagName === 'IMG' && prev.getAttribute('data-lazy-fader')) prev.style.opacity = 0;
      el.style.opacity = '';
      el.setAttribute('src', src);
      el.removeAttribute('data-src');
      lazyImage.unobserve(el);
    } else {
      if (!el.getAttribute('src')) el.style.opacity = 0;
      lazyImage.observe(el);
    }
  }
}

export default {
    mounted: function (el) {
        //lazyImage.observe(el)
        handleElement(el)
    },
    updated: function (el) {
        handleElement(el)
    },
    beforeUnmount: function (el) {
        el.onload=null; // Just to make sure;
        lazyImage.unobserve(el);
    }
}