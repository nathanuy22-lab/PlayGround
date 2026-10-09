/* MAGI offline service worker — cache-first, zero network dependency after install. */
const CACHE = "magi-offline-v6";
const ASSETS = ["./", "./index.html", "./styles.css", "./magi.js", "./map.js", "./cores.js", "./app.js", "./world.json", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: false }).then(hit => {
      if (hit) return hit;
      // Street tiles: served from the dedicated tile cache (page-managed), never
      // duplicated into the app cache. Miss → network; offline gap → 504.
      if (e.request.url.indexOf("basemaps.cartocdn.com") !== -1) {
        return fetch(e.request).catch(() => new Response("", { status: 504 }));
      }
      return fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
