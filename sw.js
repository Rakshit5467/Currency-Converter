const CACHE_NAME = 'currency-converter-v6';
const API_CACHE = 'currency-api-cache-v2';
const FLAG_CACHE = 'flag-image-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/index.js',
  '/country-list.js',
  '/pwa.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/assests/change.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.8.1/font/bootstrap-icons.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@100;900&display=swap'
];

self.addEventListener('install', event => {
  self.skipWaiting();    
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // turn each URL into a no-cors Request, then addAll()
        const requests = ASSETS_TO_CACHE.map(url =>
          new Request(url, { mode: 'no-cors' })
        );
        return cache.addAll(requests);
      })
      .catch(err => {
        console.warn('Some assets failed to cache (but install will still succeed):', err);
      })
  );
});


self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin === 'https://flagsapi.com') {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(networkRes => {
          if (networkRes.ok) {
            caches.open(FLAG_CACHE)
                  .then(cache => cache.put(req, networkRes.clone()));
          }
          return networkRes;
        });
      })
    );
    return;
  }


  if (url.origin === 'https://v6.exchangerate-api.com') {
    event.respondWith(
      fetch(req)
        .then(networkRes => {
          // Clone & cache the fresh response
          const copy = networkRes.clone();
          caches.open(API_CACHE).then(cache => cache.put(req, copy));
          return networkRes;
        })
        .catch(() => {
          return caches.match(req);
        })
    );
    return; 
  }

  if (req.destination === 'style' || req.destination === 'font') {
    event.respondWith(
      fetch(req)
        .then(networkRes => {
          const copy = networkRes.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
          return networkRes;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req)
      .then(cached => cached || fetch(req).then(resp => {
        if (resp.ok && resp.type === 'basic') {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
        }
        return resp;
      }))
  );
});


self.addEventListener('activate', event => {
  self.clients.claim(); 
  const cacheWhitelist = [
    CACHE_NAME,    
    API_CACHE,     
    FLAG_CACHE     
  ];

  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.map(name => {
          if (!cacheWhitelist.includes(name)) {
            return caches.delete(name);
          }
        })
      )
    )
  );
});

self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received.');

  let data = { title: 'Currency Converter', body: 'Here’s your simple notification!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body:  data.body,
    icon:  '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data:  data.url || '/'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});