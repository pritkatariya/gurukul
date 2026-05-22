// public/sw.js
const CACHE_NAME = 'gurukul-system-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});