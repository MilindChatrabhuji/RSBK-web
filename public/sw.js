// Service Worker for RSBK Online PWA
const CACHE_NAME = 'rsbk-online-v5.4';

const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/styles.css?v=5.4',
    '/features.css?v=5.4',
    '/script.js?v=5.4',
    '/features.js?v=5.4',
    '/email-service.js?v=5.4',
    '/assets/icons/logo.png',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-512.png',
    '/favicon.png',
    '/favicon.ico'
];

// Install Event
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS).catch((err) => {
                console.warn('Pre-cache partial failure (non-blocking):', err);
            });
        })
    );
});

// Activate Event (Immediately purge ALL old caches)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('Purging legacy cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event (Network First with fallback to cache for freshest content)
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Skip non-GET and foreign-origin API / Firebase requests
    if (request.method !== 'GET') return;
    if (url.origin !== self.location.origin) return;

    // Network First strategy: Always get fresh live server content first
    event.respondWith(
        fetch(request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    if (request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                    return null;
                });
            })
    );
});
