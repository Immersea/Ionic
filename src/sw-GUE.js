// change to the version you get from `npm ls workbox-build`
importScripts("workbox-v6.6.0/workbox-sw.js");
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.

//UDIVE
const firebaseConfig = {
  apiKey: "AIzaSyCBxu4H6gznmMjjtyJC4E5tHBsvjcz9Gvo",
  authDomain: "u-dive-cloud-prod.firebaseapp.com",
  databaseURL: "https://u-dive-cloud-prod.firebaseio.com",
  projectId: "u-dive-cloud-prod",
  storageBucket: "u-dive-cloud-prod.appspot.com",
  messagingSenderId: "352375493863",
  appId: "1:352375493863:web:7a0df180088ea8e6dffe42",
  measurementId: "G-VMMT8STTSV",
  vapidKey:
    "BHUKjUbPorRLiLAkBHJIWpIbukBW2OZae40DArnshzhd4WCiS6PpBSXtULf9lXBolTTexGekINCZWaQ5-iQLYaY",
};

importScripts("https://www.gstatic.com/firebasejs/8.6.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.6.1/firebase-messaging.js");
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: "/assets/images/logo_decoplanner.png",
    data: payload.data,
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

self.addEventListener("notificationclick", function (event) {
  const link =
    event.notification.data && event.notification.data.link
      ? event.notification.data.link
      : null;
  event.notification.close();
  if (clients.openWindow && link) {
    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(
      clients
        .matchAll({
          type: "window",
        })
        .then(function (clientList) {
          for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if (
              client.url.includes("localhost:3333") &&
              "focus" in client &&
              client.frameType == "top-level"
            )
              return client.focus().then(function () {
                client.navigate(link);
              });
          }
          if (clients.openWindow) return clients.openWindow(link);
        })
    );
  }
});

//listen for swUpdate message
self.addEventListener("message", ({ data }) => {
  //console.log("message", data);
  if (data === "skipWaiting") {
    self.skipWaiting();
  }
});

// the precache manifest will be injected into the following line
self.workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
