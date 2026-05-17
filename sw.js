const CACHE = 'vv-v3';
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
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (/firestore|googleapis|anthropic|nominatim|openstreetmap|gstatic/.test(url)) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/vv-nexus/index.html'));
    })
  );
});