import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth";
import {
  CACHE_SIZE_UNLIMITED,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getFunctions } from "firebase/functions";
//import {getMessaging} from "firebase/messaging";
import { Environment } from "../global/env";
import { Capacitor } from "@capacitor/core";
import { getAnalytics } from "firebase/analytics";

export const firebaseApp = initializeApp(Environment.getFirebaseSettings());

function whichAuth() {
  let auth;
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() !== "electron") {
    auth = initializeAuth(firebaseApp, {
      persistence: indexedDBLocalPersistence,
    });
  } else {
    auth = getAuth(firebaseApp);
  }
  return auth;
}

export const auth = whichAuth();

initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache(
    /*settings*/ {
      tabManager: persistentMultipleTabManager(),
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    }
  ),
});
export const firestore = getFirestore(firebaseApp);
// Get a reference to the storage service, which is used to create references in your storage bucket
export const storage = getStorage(firebaseApp);
export const functions = getFunctions(firebaseApp, "europe-west1");
export const messaging = null; //getMessaging(firebaseApp);
export const analytics = getAnalytics(firebaseApp);

//export const remoteConfig = firebase.remoteConfig();
