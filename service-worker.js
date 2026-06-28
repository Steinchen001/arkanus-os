const CACHE_NAME = "arkanus-os-v15";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.json",
  "/pwa.js",

  "/icons/icon-192.png",
  "/icons/icon-512.png",

  "/app.js",

  "/engine/config.js",
  "/engine/version.js",
  "/engine/boot.js",
  "/engine/loader.js",
  "/engine/caseLoader.js",
  "/engine/storage.js",
  "/engine/profile.js",
  "/engine/stats.js",
  "/engine/decrypt.js",
  "/engine/feedback.js",
  "/engine/logbook.js",
  "/engine/map.js",
  "/engine/progress.js",
  "/engine/mission.js",
  "/engine/completion.js",
  "/engine/ui.js",
  "/engine/player.js",
  "/engine/archive.js",
"/engine/dev.js",
"/engine/update.js",
"/engine/app.js",

  "/data/cases.json",
  "/data/settings.json",
  "/data/ranks.json",
  "/data/achievements.json",

  "/akte001/case.json"
];

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  if(event.request.method !== "GET") return;

  if(url.hostname.includes("tile.openstreetmap.org")){
    return;
  }

  if(url.hostname.includes("unpkg.com")){
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, copy);
        });

        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(cached => {
          return cached || caches.match("/index.html");
        });
      })
  );
});