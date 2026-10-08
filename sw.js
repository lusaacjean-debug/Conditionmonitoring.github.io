/* CM Inspect — offline support. Network-first for the page, cache-first for versioned assets.
   The cache name changes with every release, so old files are removed automatically. */
const CACHE = 'cm-inspect-1.3.0';
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
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate'){
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => {
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; })));
});
