import { CapacitorConfig } from "@capacitor/cli";
import { ISDEV } from "./src/global/dev";

const app_id = "cloud.udive.app";

const app_name: "Decoplanner" | "Udive" = "Decoplanner";

const config: CapacitorConfig = {
  appId: app_id,
  appName: app_name,
  webDir: "www",
  loggingBehavior: ISDEV ? "debug" : "production",
  server: ISDEV
    ? {
        url: "http://localhost:3333",
        cleartext: true, // for Android
      }
    : undefined,
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
