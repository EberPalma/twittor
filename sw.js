// * Imports
importScripts("js/sw-utils.js");

const STATIC_CACHE = "static-v3";
const DINAMYC_CACHE = "dimamyc-v2";
const INMUTABLE_CACHE = "inmutable-v1";

const appShell = [
  "/",
  "/index.html",
  "/css/style.css",
  "/img/favicon.ico",
  "/js/app.js",
  "/js/sw-utils.js",
];
const inmutable = [
  "/js/libs/jquery.js",
  "https://fonts.googleapis.com/css?family=Quicksand:300,400",
  "https://fonts.googleapis.com/css?family=Lato:400,300",
  "css/animate.css",
];

function limpiarCache(cacheName, numeroItems) {
  caches.open(cacheName).then((cache) => {
    return cache.keys().then((keys) => {
      if (keys.length > numeroItems) {
        cache.delete(keys[0]).then(limpiarCache(cacheName, numeroItems));
      }
    });
  });
}

self.addEventListener("install", (e) => {
  const cache_static = caches
    .open(STATIC_CACHE)
    .then((cache) => cache.addAll(appShell));
  const cache_inmutable = caches
    .open(INMUTABLE_CACHE)
    .then((cache) => cache.addAll(inmutable));
  e.waitUntil(Promise.all([cache_static, cache_inmutable]));
});

self.addEventListener("activate", (e) => {
  const response = caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== STATIC_CACHE && key.includes("static")) {
        return caches.delete(key);
      }
      if (key !== DINAMYC_CACHE && key.includes("dinamyc")) {
        return caches.delete(key);
      }
    });
  });
  e.waitUntil(response);
});

self.addEventListener("fetch", (e) => {
  const response = caches.match(e.request).then((response) => {
    if (response) return response;

    return fetch(e.request).then((response) => {
      return actualizaCacheDinamico(DINAMYC_CACHE, e.request, response);
    });
  });
  e.respondWith(response);
});
