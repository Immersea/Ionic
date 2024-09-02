import { CapacitorConfig } from "@capacitor/cli";

const app_id = "cloud.udive.app";

const app_name: "Decoplanner" | "Udive" = "Decoplanner";

const config: CapacitorConfig = {
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
};
export default config;
