import { CapacitorConfig } from "@capacitor/cli";

const app_id = "cloud.udive.app"; //Environment.getBundleId();
const app_name = "decoplanner"; //Environment.getAppTitle();
const app_protocol = "decoplanner-app"; //Environment.getElectronAppProtocol();
const app_custom_url = "decoplannerelectron"; //Environment.getElectronCustomUrl();

const config: CapacitorConfig = {
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
};
export default config;
