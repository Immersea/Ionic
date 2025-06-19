// change to the version you get from `npm ls workbox-build`
importScripts("workbox-v7.3.0/workbox-sw.js");

//listen for swUpdate message
self.addEventListener("message", ({ data }) => {
  if (data === "skipWaiting" || data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", function (event) {
  console.log("Fetching:", event.request.url);
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});

// the precache manifest will be injected into the following line
self.workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
