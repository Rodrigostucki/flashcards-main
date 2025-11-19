const CACHE_NAME = "diario-de-bordo-v1";
const OFFLINE_URL = "index.html";
const ASSETS = [
  "./",
  "index.html",
  "styles.min.css",
  "script.min.js",
  "manifest.json",
  "icons/icon-192x192.png",
  "icons/icon-512x512.png",
  "icons/left-lake-180.webp",
  "icons/left-lake-360.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        // tenta adicionar todos de uma vez — falhará se algum recurso 404
        await cache.addAll(ASSETS);
      } catch (err) {
        // fallback: adiciona um a um, ignorando falhas individuais
        for (const url of ASSETS) {
          try {
            const resp = await fetch(url, { cache: "no-store" });
            if (resp && resp.ok) {
              await cache.put(url, resp.clone());
            }
          } catch (e) {
            // ignora erro de fetch/caching para não quebrar o SW
            console.warn("SW: falha ao cachear", url, e);
          }
        }
      }
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // navigate: serve index.html for SPA navigation requests (fallback)
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match(OFFLINE_URL)));
    return;
  }
  // For other requests, try cache first, then network, then cache fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // put into cache for future
          return caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(req, res.clone());
            } catch (e) {}
            return res;
          });
        })
        .catch(() => {
          // fallback to cached index or nothing
          return caches.match(OFFLINE_URL);
        });
    })
  );
});
