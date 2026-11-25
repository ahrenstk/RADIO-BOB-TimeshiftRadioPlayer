'use strict';

const VERSION = 'RADIO-BOB-TimeshiftRadioPlayer-v2026-11-25';
const CACHE_STATIC = VERSION + '-static';

const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];


self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(async (cache) => {
        for (const url of ASSETS_TO_CACHE) {
          try {
            const response = await fetch(url, { cache: 'reload' });
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch (err) {
            await cache.add(url).catch(() => {});
          }
        }
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((k) => k.startsWith('TimeshiftRadioPlayer-') && k !== CACHE_STATIC)
        .map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});


function bypass(request, url) {
  if (request.method !== 'GET') return true;
  if (request.headers.has('range')) return true;
  if (request.destination === 'audio' || request.destination === 'video') return true;

  if (/\.(mp3|aac|ogg|opus|flac|m3u8?|pls)$/i.test(url.pathname)) return true;

  if (url.origin !== self.location.origin) return true;

  return false;
}


self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (bypass(request, url)) return;

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {

      if (cachedResponse) {
        return cachedResponse;
      }

      if (request.mode === 'navigate' || request.destination === 'document') {
        return caches.match('./index.html', { ignoreSearch: true })
          .then((indexFallback) => indexFallback || fetch(request));
      }

      return fetch(request);
    })
  );
});

