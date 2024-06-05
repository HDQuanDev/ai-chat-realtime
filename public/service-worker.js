// service-worker.js
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
    // Chỉ xử lý các yêu cầu GET
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function (response) {
            // Cache hit - return response
            if (response) {
                return response;
            }

            // Quan trọng: Nhân bản yêu cầu
            const fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(function (response) {
                // Kiểm tra nếu chúng ta nhận được một phản hồi hợp lệ
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Quan trọng: Nhân bản phản hồi
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
