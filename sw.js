const VERSION = 'v2.2';
const CACHE = 'lea-' + VERSION;

const CORE = [
  '/',
  '/index.html',
  '/lea-public.html',
  '/manifest.json',
];

// Install: cache files, NU skipWaiting — asteapta confirmarea userului
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE).catch(() => {}))
  );
});

// Activate: sterge cache-ul vechi, notifica pagina
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({type:'window', includeUncontrolled:true}))
      .then(clients => clients.forEach(c => c.postMessage({type:'SW_UPDATED', version:VERSION})))
  );
});

// Fetch: HTML mereu de pe network (versiunea noua); assets din cache
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const url = e.request.url;
  if(/firestore|googleapis\.com\/css|anthropic|nominatim|openstreetmap|gstatic/.test(url)) return;

  if(e.request.mode === 'navigate' || /\/(lea-public|lea|index)\.html/.test(url) || url.endsWith('/')) {
    e.respondWith(
      fetch(e.request, {cache:'no-store'})
        .then(res => {
          if(res && res.ok){ const cl = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cl)); }
          return res;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match('/lea-public.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        if(res && res.ok){ const cl = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cl)); }
        return res;
      }).catch(() => caches.match('/lea-public.html'));
    })
  );
});

// Primeste SKIP_WAITING de la pagina cand userul da click pe Actualizeaza
self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
