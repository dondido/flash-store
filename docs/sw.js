const CACHE_NAME = 'v1';

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

self.addEventListener('install', () => {
    self.skipWaiting(); // Activate worker immediately
});