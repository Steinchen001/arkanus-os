const CACHE_NAME = "arkanus-os-v1";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.json",

  "/engine/config.js",
  "/engine/loader.js",
  "/engine/caseLoader.js",
  "/engine/storage.js",
  "/engine/profile.js",
  "/engine/decrypt.js",
  "/engine/logbook.js",
  "/engine/map.js",
  "/engine/progress.js",
  "/engine/ui.js",
  "/engine/player.js",
  "/engine/archive.js",
  "/engine/dev.js",
  "/engine/app.js",

  "/app.js",
  "/data/cases.json",
  "/data/settings.json",
  "/data/ranks.json",
  "/data/achievements.json",

  "/akte001/case.json"
];

self.addEventListener("install", event => {
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
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});