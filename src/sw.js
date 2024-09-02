// change to the version you get from `npm ls workbox-build`
importScripts("workbox-v7.1.0/workbox-sw.js");

//listen for swUpdate message
self.addEventListener("message", ({data}) => {
  if (data === "skipWaiting" || data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// the precache manifest will be injected into the following line
self.workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
