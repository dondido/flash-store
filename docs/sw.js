const CACHE_NAME = 'v1';
const STATIC_CACHE_URLS = [];
const cache = (request, response) => {
    if (response.type === 'error' || response.type === 'opaque') {
      return Promise.resolve(); // do not put in cache network errors
    }
  
    return caches
      .open(CACHE_NAME)
      .then(cache => cache.put(request, response.clone()));
};
const normaliseRequest = (request) => {
    if (request.headers.get('Range')) {
        return new Request(request, {
            headers: {
              ...request.headers,
              Range: null
            }
        })
    }
    return request;
};
self.addEventListener('install', event => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_CACHE_URLS))
  );
});

self.addEventListener('fetch', event => {
    // Network-First Cache-Fallback Strategy
    // Open the cache
    event.respondWith(caches.open(CACHE_NAME).then((cache) => {
        // Go to the network first
        return fetch(event.request.url).then((fetchedResponse) => {
          cache.put(event.request, fetchedResponse.clone());
          return fetchedResponse;
        }).catch(() => {
          // If the network is unavailable, get
          return cache.match(event.request.url);
        });
    }));
});

self.addEventListener('activate', event => {
    // delete any unexpected caches
    event.waitUntil(
        caches
            .keys()
            .then(keys => keys.filter(key => key !== CACHE_NAME))
            .then(keys =>
                Promise.all(
                    keys.map(key => {
                        console.log(`Deleting cache ${key}`);
                        return caches.delete(key);
                    })
                )
            )
    );
});