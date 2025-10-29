// public/sw.js

const CACHE_VERSION = 'v1.0.3'; // 🚀 bump this whenever you deploy
const STATIC_CACHE = `raid-static-${CACHE_VERSION}`;
const ASSET_CACHE = `raid-assets-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/',
  '/splash',
  '/welcome',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/assets/raid1.svg',
];

// 🧩 Install — precache essential assets
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version: ${CACHE_VERSION}`);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 🧹 Activate — clear old caches and reload clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating and cleaning old caches...');
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => {
          if (name !== STATIC_CACHE && name !== ASSET_CACHE) {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
      await self.clients.claim();

      // 🔄 Refresh open tabs automatically
      const clientsList = await self.clients.matchAll({ type: 'window' });
      for (const client of clientsList) {
        client.navigate(client.url);
      }
    })()
  );
});

// ⚡ Fetch — cache-first for assets, network-first for HTML
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip cross-origin & non-HTTP requests
  if (!url.protocol.startsWith('http') || url.origin !== location.origin) return;

  // Always fetch HTML fresh (no caching pages)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(fetch(request).catch(() => caches.match('/offline.html')));
    return;
  }

  // Cache-first for static assets (CSS, JS, images)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Update in background
        fetch(request).then((response) => {
          if (response && response.status === 200) {
            caches.open(ASSET_CACHE).then((cache) => cache.put(request, response.clone()));
          }
        });
        return cachedResponse;
      }

      // Fetch new asset and cache it
      return fetch(request).then((response) => {
        if (!response || response.status !== 200) return response;
        const responseClone = response.clone();
        caches.open(ASSET_CACHE).then((cache) => cache.put(request, responseClone));
        return response;
      });
    })
  );
});

// 🧼 Manual commands from client
self.addEventListener('message', (event) => {
  const { type } = event.data || {};

  if (type === 'SKIP_WAITING') {
    console.log('[SW] Skipping waiting...');
    self.skipWaiting();
  }

  if (type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches...');
    event.waitUntil(
      caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
    );
  }
});
