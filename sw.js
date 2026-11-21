/* AeroCalc v7.8 PWA
   Offline strategy: cache app shell + Leaflet CDN dependencies + visited Esri map tiles.
   Map tiles are saved as the user views them online; this does NOT pre-download all of Egypt.
*/
const VERSION = 'aerocalc-v7-8-offline';
const SHELL = `${VERSION}-shell`;
const TILES = `${VERSION}-tiles`;
const TILE_LIMIT = 2500;
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await cache.addAll(CORE);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => k.startsWith('aerocalc-') && ![SHELL, TILES].includes(k))
        .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

async function trimTiles(cache) {
  const keys = await cache.keys();
  if (keys.length > TILE_LIMIT) {
    await Promise.all(keys.slice(0, keys.length - TILE_LIMIT).map(k => cache.delete(k)));
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const response = await fetch(request);
    if (response && response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    return hit || new Response('Offline: this resource has not been cached yet.', {
      status: 503, statusText: 'Offline resource unavailable'
    });
  }
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isEsriTile =
    url.hostname === 'server.arcgisonline.com' &&
    url.pathname.includes('/MapServer/tile/');
  const isLibrary =
    url.hostname === 'unpkg.com' ||
    url.hostname === 'cdnjs.cloudflare.com';

  if (isEsriTile) {
    event.respondWith((async () => {
      const cache = await caches.open(TILES);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const response = await fetch(req);
        if (response && (response.ok || response.type === 'opaque')) {
          await cache.put(req, response.clone());
          await trimTiles(cache);
        }
        return response;
      } catch (error) {
        return cached || new Response('', {
          status: 503, statusText: 'Offline map tile not saved'
        });
      }
    })());
    return;
  }

  if (isLibrary) {
    event.respondWith(cacheFirst(req, SHELL));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL);
      if (req.mode === 'navigate') {
        try {
          const response = await fetch(req);
          if (response && response.ok) await cache.put('./index.html', response.clone());
          return response;
        } catch (error) {
          return (await cache.match(req)) ||
                 (await cache.match('./index.html')) ||
                 Response.error();
        }
      }
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const response = await fetch(req);
        if (response && response.ok) await cache.put(req, response.clone());
        return response;
      } catch (error) {
        return new Response('Offline: this resource has not been cached yet.', {
          status: 503, statusText: 'Offline resource unavailable'
        });
      }
    })());
  }
});
