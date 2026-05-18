const CACHE = 'vv-v5';
const SHELL = [
  '/vv-nexus/',
  '/vv-nexus/index.html',
  '/vv-nexus/lea.html',
  '/vv-nexus/lea.css',
  '/vv-nexus/lea.js',
  '/vv-nexus/vv-pulse.html',
  '/vv-nexus/manifest.json',
  '/vv-nexus/icons/icon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL.map(u => new Request(u, {cache: 'reload'}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({type:'window', includeUncontrolled:true}))
      .then(clients => clients.forEach(c => c.postMessage({type:'SW_UPDATED'})))
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (/firestore|googleapis|anthropic|nominatim|openstreetmap|gstatic/.test(url)) return;

  // Network-first pentru HTML — mereu versiunea noua
  if (e.request.mode === 'navigate' || /\/(lea|index|vv-pulse|nexus)\.html/.test(url) || url.endsWith('/vv-nexus/')) {
    e.respondWith(
      fetch(e.request, {cache:'no-store'})
        .then(res => {
          if (res && res.ok) {
            const cl = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, cl));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match('/vv-nexus/index.html')))
    );
    return;
  }

  // Cache-first pentru assets (CSS, JS, imagini)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request)
        .then(res => {
          if (res && res.ok) {
            const cl = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, cl));
          }
          return res;
        })
        .catch(() => caches.match('/vv-nexus/index.html'));
    })
  );
});