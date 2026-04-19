// CardSend Service Worker - Cache Busted 1776568746268
const CACHE_NAME = 'cardsend-v1776568746268';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => clients.claim())
  );
});

// Always fetch fresh from network - no caching
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});