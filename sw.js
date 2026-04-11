const CACHE_NAME = 'whapay-v2';
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
  '/auth.js',          // <-- kept as requested
  '/manifest.json',
  '/whapay-logo.svg',
  // External CDNs (optional - cache for offline)
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/localforage@1.10.0/dist/localforage.min.js',
  'https://unpkg.com/html5-qrcode@2.3.8/minified/html5-qrcode.min.js',
  'https://js.stripe.com/v3/',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Install event – cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching static assets');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // activate immediately
});

// Fetch event – network-first for HTML pages (including those with auth.js), cache-first for static
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // For HTML pages (including those that might load auth.js), try network first, then cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone and cache fresh copy
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cached => {
            if (cached) return cached;
            // Optional fallback to offline page
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }
  
  // For static assets (CSS, JS, images, auth.js) – cache first, then network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache new assets on the fly
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Activate event – clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // take control of uncontrolled clients
});
