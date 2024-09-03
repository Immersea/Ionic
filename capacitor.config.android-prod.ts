import { CapacitorElectronConfig } from "@capacitor-community/electron";

const app_id = "cloud.udive.app";

const app_name: "Decoplanner" | "Udive" = "Decoplanner";

const config: CapacitorElectronConfig = {
  appId: app_id,
  appName: app_name,
  webDir: "www",
  loggingBehavior: "production", //'none' | 'debug' | 'production';
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
    customUrlScheme: "immersea-electron",
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
    deepLinkingCustomProtocol: "immerseaapp",
  },
};
export default config;
