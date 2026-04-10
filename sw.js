const CACHE_NAME = 'whapay-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/merchant.html',
  '/payment.html',
  '/reports.html',
  '/contact.html',
  '/about.html',
  '/features.html',
  '/pricing.html',
  '/blog.html',
  '/admin.html',
  '/process.html',
  '/registration.html',
  '/first-time-pay.html',
  '/sketch.html',
  '/privacy.html',
  '/terms.html',
  '/auth.js',
  '/manifest.json',
  '/whapay-logo.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
});
