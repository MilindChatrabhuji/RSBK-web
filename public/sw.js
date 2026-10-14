// Service Worker for RSBK Online PWA
const CACHE_NAME = 'rsbk-online-v5.0';

const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/styles.css',
    '/script.js',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-512.png',
    '/favicon.png',
    '/favicon.ico'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS).catch((err) => {
                console.warn('Pre-cache partial failure (non-blocking):', err);
            });
        }).then(() => self.skipWaiting())
    );
});

// Activate Event (Cleanup Old Caches)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Skip non-GET and foreign-origin API / Firebase requests
    if (request.method !== 'GET') return;
    if (url.origin !== self.location.origin) return;

    // HTML Navigation: Network first, fallback to cached HTML
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match(request).then((res) => {
                    return res || caches.match('/index.html');
                });
            })
        );
        return;
    }

    // Static Assets (CSS, JS, Images, Icons, Fonts): Stale-while-revalidate
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});
