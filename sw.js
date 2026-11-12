const CACHE_NAME = 'RADIO-BOB-TimeshiftRadioPlayer-v2026-11-12a';

const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];


self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});


self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName.startsWith('TimeshiftRadioPlayer-') && cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' || 
    request.destination === 'audio' ||
    url.pathname.includes('stream') ||
    url.pathname.includes('.mp3') ||
    url.pathname.includes('.aac') ||
    !url.href.startsWith(self.location.origin)
  ) {
    return;
  }


  if (
    request.mode === 'navigate' || 
    request.destination === 'document' || 
    request.headers.get('accept')?.includes('text/html')
  ) {
    event.respondWith(
      caches.match('./index.html', { ignoreSearch: true })
        .then((cached) => {
          if (cached) {
            return cached;
          }

          return caches.match('index.html') || caches.match('./');
        })
        .catch(() => {
          return caches.match('./index.html') || caches.match('index.html');
        })
    );
    return;
  }


  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(response => {
      if (response) {
        return response;
      }
      
      return fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
