import { Capacitor } from "@capacitor/core";
import { isPlatform } from "@ionic/core";
import { ISDEV } from "./dev";
import { selectedApp } from "./env-apps";
import { isElectron, isLocalhost } from "../helpers/utils";

export enum AppNames {
  udive = "udive",
  decoplanner = "decoplanner",
  trasteel = "trasteel",
}
export enum bundleIds {
  udive = "cloud.udive.app",
  decoplanner_ios = "com.gue.decoplanner-mobile",
  decoplanner_android = "cloud.udive.app",
  decoplanner_web = "com.gue.decoplanner-mobile-web",
  trasteel = "com.trasteel.app",
}
enum AppProtocols {
  udive = "udiveapp",
  decoplanner = "decoplannerapp",
  trasteel = "trasteelapp",
}

enum AppTitles {
  udive = "U-Dive",
  decoplanner = "GUE Decoplanner",
  trasteel = "Trasteel",
}

enum AppSubTitles {
  udive = "Dive, Explore, Share",
  decoplanner = "Online",
  trasteel = "Consumables department",
}

export enum AppVersions {
  udive = "beta 1.1.1",
  decoplanner = "1.4.1",
  trasteel = "1.4.1c",
}

const firebase_settings = {
  TRASTEEL: {
    apiKey: "AIzaSyBAcEFeZE0dltFPxfSoOJ_llE4UaD7iq00",
    authDomain: "trasteel-consumables.firebaseapp.com",
    projectId: "trasteel-consumables",
    storageBucket: "trasteel-consumables.appspot.com",
    messagingSenderId: "260293051543",
    appId: "1:260293051543:web:776561f763150002de95d2",
    measurementId: "G-8ZKKV1CP6R",
  },
  UDIVE: {
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
  },
  DECOPLANNER: {
    apiKey: "AIzaSyCBxu4H6gznmMjjtyJC4E5tHBsvjcz9Gvo",
    authDomain: "u-dive-cloud-prod.firebaseapp.com",
    databaseURL: "https://u-dive-cloud-prod.firebaseio.com",
    projectId: "u-dive-cloud-prod",
    storageBucket: "u-dive-cloud-prod.appspot.com",
    messagingSenderId: "352375493863",
    appId: "1:352375493863:web:1644f6a60d57ff0adffe42",
    measurementId: "G-D642PPJCHE",
    vapidKey:
      "BHUKjUbPorRLiLAkBHJIWpIbukBW2OZae40DArnshzhd4WCiS6PpBSXtULf9lXBolTTexGekINCZWaQ5-iQLYaY",
    clientId:
      "352375493863-6gm864tl3v3mepoosvlum9h756ssqb76.apps.googleusercontent.com",
  },
};
const siteUrls = {
  LOCALHOST: "http://localhost:3333",
  TRASTEEL: "https://trasteel-consumables.web.app",
  UDIVE: "https://app.u-dive.cloud",
  DECOPLANNER: "https://guedecoplanner.web.app",
};

const cloudFunctionsUrls = {
  TRASTEEL: "https://europe-west1-u-dive-cloud-dev.cloudfunctions.net/",
  UDIVE: "https://europe-west1-u-dive-cloud-prod.cloudfunctions.net/",
  DECOPLANNER: "https://europe-west1-u-dive-cloud-prod.cloudfunctions.net/",
};

const dynamicLinkDomain = {
  TRASTEEL: "trasteel.page.link",
  UDIVE: "udive.page.link",
  DECOPLANNER: "decoplanner.page.link",
};

const bundleId = {
  TRASTEEL: "com.trasteel.app",
  UDIVE: "cloud.udive.app",
  DECOPLANNER: isPlatform("android")
    ? bundleIds.decoplanner_android
    : isPlatform("ios")
      ? bundleIds.decoplanner_ios
      : bundleIds.decoplanner_web,
};

export const MAPBOX =
  "pk.eyJ1IjoidWRpdmUiLCJhIjoiY2s2dDRlbHQyMDNyOTNsbXlraXQ2dzhxaSJ9.CYFNebHv6aQWw3W348wwog";
export const LOCATIONIQ_GEOCODE = "pk.4e444afb4eadab2a91b57f961f23c297";
export const CURRENCY_API = "c70d97d8927a21f913ee1ce6e49b6120";

class EnvController {
  appName = selectedApp;

  public getAppTitle() {
    let title = "";
    let subtitle = "";
    let $webapptitle = document.querySelector(
      'meta[name="apple-mobile-web-app-title"]'
    ) as HTMLMetaElement;
    let $description = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement;
    if (this.isUdive()) {
      title = AppTitles.udive;
      subtitle = AppSubTitles.udive;
    } else if (this.isDecoplanner()) {
      title = AppTitles.decoplanner;
      subtitle = AppSubTitles.decoplanner;
    } else if (this.isTrasteel()) {
      title = AppTitles.trasteel;
      subtitle = AppSubTitles.trasteel;
    }
    document.title = title + (subtitle !== "" ? "-" + subtitle : "");
    $webapptitle.content = title + (subtitle !== "" ? "-" + subtitle : "");
    $description.content = subtitle !== "" ? "-" + subtitle : "";
    return title;
  }

  public getAppSubTitle() {
    let subtitle = "";
    if (this.isUdive()) {
      subtitle = AppSubTitles.udive;
    } else if (this.isDecoplanner()) {
      subtitle = isPlatform("capacitor") ? "Mobile" : AppSubTitles.decoplanner;
    } else if (this.isTrasteel()) {
      subtitle = AppSubTitles.trasteel;
    }
    return subtitle;
  }

  public getAppColor() {
    if (this.isUdive()) {
      return "gue-blue";
    } else if (this.isDecoplanner()) {
      return "gue-blue";
    } else if (this.isTrasteel()) {
      return "trasteel";
    }
  }

  public getAppSplashColor() {
    if (this.isUdive()) {
      return "--ion-color-gue-blue";
    } else if (this.isDecoplanner()) {
      return "--ion-color-light";
    } else if (this.isTrasteel()) {
      return "--ion-color-trasteel";
    }
  }

  public getAppLogo() {
    if (this.isUdive()) {
      return "logo_udive.png";
    } else if (this.isDecoplanner()) {
      return "logo_decoplanner.png";
    } else if (this.isTrasteel()) {
      return "logo_trasteel.png";
    }
  }

  public getMenuColor() {
    if (this.isUdive()) {
      return "gue-grey";
    } else if (this.isDecoplanner()) {
      return "gue-grey";
    } else if (this.isTrasteel()) {
      return "trasteel";
    }
  }

  public getAppVersion() {
    if (this.isUdive()) {
      return AppVersions.udive;
    } else if (this.isDecoplanner()) {
      return AppVersions.decoplanner;
    } else if (this.isTrasteel()) {
      return AppVersions.trasteel;
    }
  }

  public changeIcons() {
    let favicon = null;
    let touchicon = null;
    if (this.isUdive()) {
      favicon = "assets/icon/favicon_udive.ico";
      touchicon = "assets/icon/apple-touch-icon-udive.ico";
    } else if (this.isDecoplanner()) {
      favicon = "assets/icon/favicon_decoplanner.ico";
      touchicon = "assets/icon/apple-touch-icon-decoplanner.ico";
    } else if (this.isTrasteel()) {
      favicon = "assets/icon/favicon_trasteel.ico";
      touchicon = "assets/icon/apple-touch-icon-trasteel.ico";
    }
    let $favicon = document.querySelector(
      'link[rel="icon"]'
    ) as HTMLLinkElement;
    let $touchicon = document.querySelector(
      'link[rel="apple-touch-icon"]'
    ) as HTMLLinkElement;
    // If a <link rel="icon"> element already exists,
    // change its href to the given link.
    if ($favicon !== null) {
      $favicon.href = favicon;
      $touchicon.href = touchicon;
      // Otherwise, create a new element and append it to <head>.
    } else {
      $favicon = document.createElement("link");
      $favicon.rel = "icon";
      $favicon.href = favicon;
      document.head.appendChild($favicon);
      $touchicon = document.createElement("link");
      $touchicon.rel = "apple-touch-icon";
      $touchicon.href = touchicon;
      document.head.appendChild($touchicon);
    }
  }

  public isTrasteel() {
    return this.appName === AppNames.trasteel;
  }

  public isDecoplanner() {
    return this.appName === AppNames.decoplanner;
  }

  public isUdive() {
    return this.appName === AppNames.udive;
  }

  public getFirebaseSettings() {
    if (this.appName === AppNames.udive) {
      return firebase_settings.UDIVE;
    } else if (this.appName === AppNames.decoplanner) {
      return firebase_settings.UDIVE;
    } else if (this.appName === AppNames.trasteel) {
      return firebase_settings.TRASTEEL;
    }
  }

  public getSiteUrl() {
    if (isElectron()) {
      return (
        "https://" +
        this.appName.toLocaleLowerCase() +
        "-signin.web.app/finishSignIn"
      );
    } else if (this.isDev() && isLocalhost(window.location.href)) {
      return siteUrls.LOCALHOST;
    } else if (this.appName === AppNames.udive) {
      return siteUrls.UDIVE;
    } else if (this.appName === AppNames.decoplanner) {
      return siteUrls.DECOPLANNER;
    } else if (this.appName === AppNames.trasteel) {
      return siteUrls.TRASTEEL;
    }
  }

  public getCloudFunctionsUrl() {
    if (this.appName === AppNames.udive) {
      return cloudFunctionsUrls.UDIVE;
    } else if (this.appName === AppNames.decoplanner) {
      return cloudFunctionsUrls.DECOPLANNER;
    } else if (this.appName === AppNames.trasteel) {
      return cloudFunctionsUrls.TRASTEEL;
    }
  }

  public getDynamicLinkDomain() {
    if (this.appName === AppNames.udive) {
      return dynamicLinkDomain.UDIVE;
    } else if (this.appName === AppNames.decoplanner) {
      return dynamicLinkDomain.DECOPLANNER;
    } else if (this.appName === AppNames.trasteel) {
      return dynamicLinkDomain.TRASTEEL;
    }
  }

  public getBundleId() {
    if (this.appName === AppNames.udive) {
      return bundleId.UDIVE;
    } else if (this.appName === AppNames.decoplanner) {
      return bundleId.DECOPLANNER;
    } else if (this.appName === AppNames.trasteel) {
      return bundleId.TRASTEEL;
    }
  }

  public getAppProtocol() {
    if (this.appName === AppNames.udive) {
      return AppProtocols.udive;
    } else if (this.appName === AppNames.decoplanner) {
      return AppProtocols.decoplanner;
    } else if (this.appName === AppNames.trasteel) {
      return AppProtocols.trasteel;
    }
  }

  isDev() {
    return ISDEV;
  }

  log(message: string, data?: any[]) {
    if (this.isDev()) {
      if (data) {
        console.log(
          message,
          Capacitor.isNativePlatform() ? JSON.stringify(data) : data
        );
      } else {
        console.log(message);
      }
    }
  }
}

export const Environment = new EnvController();
