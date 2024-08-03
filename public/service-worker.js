const CACHE_NAME = 'my-cache';
const urlsToCache = [
    '/',
    'assets/logo.png',
    // other resources...
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function (event) {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Check for unsupported schemes and filter file types
    const url = new URL(event.request.url);
    const fileExtension = url.pathname.split('.').pop();

    const supportedFileTypes = ['js', 'css', 'png'];
    if (!event.request.url.startsWith('http') && !event.request.url.startsWith('https') ||
        !supportedFileTypes.includes(fileExtension)) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function (response) {
            // Cache hit - return response
            if (response) {
                return response;
            }

            // Important: Clone the request
            const fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(function (response) {
                // Check if we received a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Important: Clone the response
                const responseToCache = response.clone();

                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request, responseToCache);
                });

                return response;
            });
        })
    );
});

self.addEventListener('activate', function (event) {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
