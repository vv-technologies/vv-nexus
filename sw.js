// VV NOW · Service Worker · v1.0
var CACHE = 'vvnow-v1';
var ASSETS = [
  './vv-now.html',
  'https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500&display=swap'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Cache-first pentru assets statice
  if (e.request.url.includes('vv-now.html') ||
      e.request.url.includes('fonts.googleapis')) {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        return cached || fetch(e.request).then(function(res) {
          var copy = res.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, copy); });
          return res;
        });
      })
    );
    return;
  }

  // Network-first pentru Firebase si API
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('anthropic') ||
      e.request.url.includes('nominatim')) {
    e.respondWith(
      fetch(e.request).catch(function() {
        return new Response(JSON.stringify({offline: true}), {
          headers: {'Content-Type': 'application/json'}
        });
      })
    );
    return;
  }

  // Default: network cu fallback cache
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});
