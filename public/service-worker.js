// Cache
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v2";
const CACHE_FILES = [
  "/",
  "/index.html",
  "/index.js",
  "/db.js",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_FILES);
    })
  );
  self.skipWaiting();
});


self.addEventListener("activate", (event) => {
  // remove unwanted caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== DATA_CACHE_NAME) {
            console.log("Clearing cache data", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );

  self.clients.claim();
});


self.addEventListener("fetch", (event) => {
  console.log("Service worker fetching", event.request.url);
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch((error) => {
              return cache.match(event.request);
            });
        })
        .catch((error) => console.log(error))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request);
      });
    })
  );
});