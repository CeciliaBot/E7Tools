var VERSION = 1;
var CACHE_NAME = 'ceciliabot-cache-v' + VERSION;
var ASSETS_CACHE = 'epic-seven-assets-v' + VERSION;
var urlsToCache = [
  './'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  ),
  caches.open(ASSETS_CACHE)
});
self.addEventListener('activate', function(event) {
  var cacheAllowlist = [CACHE_NAME,ASSETS_CACHE];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


self.addEventListener('fetch', function(event) {
  var request = event.request;
  if (request.url.indexOf('cloudinary') === -1) { // fetch first fallback cache
     event.respondWith(
       fetch(event.request)
         .then((response) => {
           return caches.open(CACHE_NAME).then((cache) => {
             if(response && response.status === 200 && response.type === 'basic')
               cache.put(event.request, response.clone());
             return response;
           })
         })
         .catch(() => {
           return caches.match(event.request);
         })
     )
  }
  if (request.url.indexOf('cloudinary') !== -1) { // from cache fallback fetch 
     event.respondWith(
       caches.match(event.request).then((cacheResponse) => {
         return cacheResponse || fetch(event.request).then((response) => {
           return caches.open(ASSETS_CACHE).then((cache) => {
             console.log(response.type);
             if(response && response.status === 200 && response.type !== 'opaque')
               cache.put(event.request, response.clone());
             return response;
           })
         }).catch(err => {
           return err;
         })
       })
     )
  }
});

