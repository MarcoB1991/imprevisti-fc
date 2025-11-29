// Nome della cache (puoi cambiare versione quando aggiorni i file)
const CACHE_NAME = 'imprevisti-fc-v1';

// Lista di file da mettere in cache all'installazione
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './config.html',
  './assets/css/base.css',
  './assets/css/layout.css',
  './assets/css/components.css',
  './assets/js/app_home.js',
  './assets/js/app_config.js',
  './assets/js/data.js',
  './assets/js/store.js',
  './assets/js/rng.js',
  './assets/js/picker.js',
  './assets/img/favicon.png',
  './assets/img/logo.png',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png'
];

// Install: mettiamo in cache i file base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Activate: puliamo cache vecchie
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

// Fetch: prima prova cache, poi rete
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() =>
          // Fallback semplice: se offline e non cache, restituiamo la home
          caches.match('./index.html')
        )
      );
    })
  );
});
