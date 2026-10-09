/* CM Inspect — offline support. NETWORK-FIRST for everything: online you always get the
   latest release; the cache is only used when there is no network. The cache
   name changes with every release, so old files are removed automatically. */
const CACHE = 'cm-inspect-1.3.2';
const ASSETS = [
 "./",
 "index.html",
 "manifest.webmanifest",
 "assets/css/cm-inspect.css",
 "assets/img/favicon.svg",
 "assets/js/app.js",
 "assets/vendor/jsQR-1.4.0.js",
 "assets/vendor/jspdf-2.5.1.umd.min.js",
 "checklists/00-base-library.js",
 "checklists/10-genset-hme.js",
 "checklists/20-site-hyundai-mcr001.js",
 "checklists/30-prestart.js",
 "checklists/40-process-plant.js",
 "checklists/50-instrumentation.js",
 "checklists/60-routes-standard-pm.js",
 "data/document-register.js",
 "data/pm-task-map.js"
];
self.addEventListener('install', e => {
  // cache:'reload' bypasses the browser HTTP cache so the stored copy is the new release
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(ASSETS.map(u => fetch(new Request(u, { cache: 'reload' })).then(r => r.ok ? c.put(u, r) : null).catch(() => null))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' }).then(r => {
      if (r && r.ok){ const copy = r.clone();
        caches.open(CACHE).then(c => c.put(req.mode === 'navigate' ? 'index.html' : req, copy)); }
      return r;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
