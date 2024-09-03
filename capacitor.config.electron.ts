import { CapacitorElectronConfig } from "@capacitor-community/electron";
import { ISDEV } from "./src/global/dev";
import { Environment } from "./src/global/env";

const app_id = "cloud.udive.app"; //Environment.getBundleId();
const app_name = "decoplanner"; //Environment.getAppTitle();
const app_protocol = "decoplanner-app"; //Environment.getElectronAppProtocol();
const app_custom_url = "decoplannerelectron"; //Environment.getElectronCustomUrl();

const config: CapacitorElectronConfig = {
  appId: app_id,
  appName: app_name,
  webDir: "www",
  loggingBehavior: "debug",
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchAutoHide: false,
      androidSplashResourceName: "splash",
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com", "apple.com"],
    },
  },
  electron: {
    // Custom scheme for your app to be served on in the electron window.
    customUrlScheme: app_custom_url,
    // Switch on/off a tray icon and menu, which is customizable in the app.
    trayIconAndMenuEnabled: false,
    // Switch on/off whether or not a splashscreen will be used.
    splashScreenEnabled: true,
    // Custom image name in the electron/assets folder to use as splash image (.gif included)
    splashScreenImageName: "splash.png",
    // Switch on/off if the main window should be hidden until brought to the front by the tray menu, etc.
    hideMainWindowOnLaunch: false,
    // Switch on/off whether or not to use deeplinking in your app.
    deepLinkingEnabled: true,
    // Custom protocol to be used with deeplinking for your app.
    deepLinkingCustomProtocol: app_protocol,
  },
};
export default config;
