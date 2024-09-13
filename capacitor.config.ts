import { CapacitorConfig } from "@capacitor/cli";
enum AppNames {
  udive = "udive",
  decoplanner = "decoplanner",
  trasteel = "trasteel",
}
enum bundleIds {
  udive = "cloud.udive.app",
  decoplanner_ios = "com.gue.decoplanner-mobile",
  decoplanner_android = "cloud.udive.app",
  decoplanner_web = "com.gue.decoplanner-mobile-web",
  trasteel = "com.trasteel.app",
}
const app_id = bundleIds.decoplanner_ios;
const app_name = AppNames.decoplanner;

const config: CapacitorConfig = {
  appId: app_id,
  appName: app_name,
  webDir: "www",
  loggingBehavior: "production",
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
