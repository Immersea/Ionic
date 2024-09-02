import {BehaviorSubject, Observable} from "rxjs";
import {DatabaseService} from "./database";
import {TranslationService} from "./translations";
import {alertController, loadingController} from "@ionic/core";
import {orderBy} from "lodash";
import {SystemPreference} from "../../interfaces/common/system/system";
import {DivePlanModel} from "../../interfaces/udive/planner/dive-plan";
import {Environment} from "../../global/env";
import {RouterService} from "./router";
import {Device, DeviceInfo} from "@capacitor/device";
import {Network} from "@capacitor/network";
import {TextMultilanguage} from "../../components";
import {Capacitor} from "@capacitor/core";

export const SYSTEMCOLLECTION = "system";

class SystemController {
  systemPreferences: SystemPreference;
  systemPreferences$: BehaviorSubject<SystemPreference> = new BehaviorSubject(
    <SystemPreference>{}
  );
  loading: any;
  deviceInfo: DeviceInfo;

  async init(): Promise<SystemPreference> {
    return new Promise(async (resolve, reject) => {
      const observable = await DatabaseService.getDocumentObservable(
        SYSTEMCOLLECTION,
        "preferences"
      );
      observable.subscribe((pref: SystemPreference) => {
        if (pref && Object.keys(pref).length > 0) {
          this.systemPreferences = pref;
          DatabaseService.saveLocalDocument(
            "systemPreferences",
            this.systemPreferences
          );
          Environment.log("system updated", [this.systemPreferences]);
          this.systemPreferences$.next(this.systemPreferences);
          resolve(pref);
        } else {
          reject(null);
        }
      });
      const serviceLocal =
        await DatabaseService.getLocalDocument("systemPreferences");
      if (serviceLocal) {
        this.systemPreferences = serviceLocal;
        this.systemPreferences$.next(this.systemPreferences);
      }
      this.getDeviceInfo();
    });
  }

  async getSubscriptions() {
    return DatabaseService.getDocument("system", "subscriptions");
  }

  async updateSubscription(itemId, date) {
    let subscriptions = await this.getSubscriptions();
    if (!subscriptions) {
      subscriptions = {};
    }
    subscriptions[itemId] = new Date(date);
    return DatabaseService.updateDocument(
      "system",
      "subscriptions",
      subscriptions
    );
  }

  async getSystemPreferences(): Promise<SystemPreference> {
    const prefs = await DatabaseService.getLocalDocument("systemPreferences");
    if (prefs) {
      return prefs;
    } else {
      return await this.init();
    }
  }

  async getDivingAgencies() {
    const pref = await this.getSystemPreferences();
    return pref.divingAgencies;
  }

  async getDivingCoursesForSchool(divingSchool?) {
    let divingCourses = [];
    const divingAgencies = await this.getDivingAgencies();
    const agencies = orderBy(Object.keys(divingAgencies));
    agencies.forEach((agency) => {
      const courses = [];
      if (divingSchool) {
        divingSchool.divingCourses.forEach((course) => {
          if (course.agencyId == agency) {
            const cert = divingAgencies[course.agencyId].certifications[
              course.certificationId
            ] as any;
            cert.agencyId = agency;
            courses.push(cert);
          }
        });
      } else {
        Object.keys(divingAgencies[agency].certifications).forEach(
          (certification) => {
            const cert = divingAgencies[agency].certifications[
              certification
            ] as any;
            cert.agencyId = agency;
            courses.push(cert);
          }
        );
      }
      divingCourses = divingCourses.concat(orderBy(courses, "order"));
      //convert diveplans to models
      divingCourses = divingCourses.map((course) => {
        if (course.activities)
          course.activities = course.activities.map((activity) => {
            if (activity.divePlan)
              activity.divePlan = new DivePlanModel(activity.divePlan);
            return activity;
          });
        return course;
      });
    });
    return divingCourses;
  }

  async presentAlertError(error) {
    return new Promise(async (resolve, reject) => {
      let header = TranslationService.getTransl(
        "general-error-header",
        "Error"
      );
      let message_error = TranslationService.getTransl(
        "general-error-message",
        "There was an error. Please try again later."
      );
      const alert = await alertController.create({
        header: header,
        message: message_error + "->" + error,
        buttons: [
          {
            text: TranslationService.getTransl("ok", "OK"),
            handler: async () => {
              resolve(true);
            },
          },
          {
            text: TranslationService.getTransl("cancel", "Cancel"),
            handler: async () => {
              reject();
            },
          },
        ],
      });
      alert.present();
    });
  }

  async presentAlert(header, message) {
    const alert = await alertController.create({
      header: header,
      message: message,
      buttons: [
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: async () => {},
        },
      ],
    });
    alert.present();
  }

  async presentLoading(
    message:
      | "loading"
      | "updating"
      | "calculating"
      | "please-wait"
      | "searching"
      | "deleting"
      | "deleted"
      | "error"
      | "saved",
    showBackdrop = true
  ) {
    let showMessage = "";
    switch (message) {
      case "loading":
        showMessage =
          TranslationService.getTransl("loading", "Loading") + "...";
        break;
      case "updating":
        showMessage =
          TranslationService.getTransl("updating", "Updating") + "...";
        break;
      case "calculating":
        showMessage =
          TranslationService.getTransl("calculating", "Calculating") + "...";
        break;
      case "please-wait":
        showMessage =
          TranslationService.getTransl("please-wait", "Please Wait") + "...";
        break;
      case "searching":
        showMessage =
          TranslationService.getTransl("searching", "Searching") + "...";
        break;
      case "deleting":
        showMessage =
          TranslationService.getTransl("deleting", "Deleting") + "...";
        break;
      case "deleted":
        showMessage = TranslationService.getTransl("deleted", "Deleted");
        break;
      case "saved":
        showMessage = TranslationService.getTransl("saved", "Saved");
        break;
      case "error":
        showMessage = TranslationService.getTransl("error", "Error");
        break;
    }
    this.loading = await loadingController.create({
      mode: "ios",
      message: showMessage,
      showBackdrop: showBackdrop,
      translucent: true,
      duration: message == "saved" || message == "error" ? 1500 : null,
      spinner: message == "saved" || message == "error" ? null : "crescent",
    });
    await this.loading.present();
  }

  async dismissLoading() {
    //dismiss all active loading controllers
    let openLoading = await loadingController.getTop();
    if (openLoading) {
      await loadingController.dismiss();
      //loop to search other loadings
      setTimeout(() => this.dismissLoading(), 100);
    }
  }

  async checkSubscription(itemId) {
    //check subscription
    const subscription = await this.getSubscriptions();
    const subscriptionDate = subscription[itemId];
    const subscriptionValid =
      new Date(subscriptionDate).getTime() - new Date().getTime() > 0;
    if (subscriptionValid) {
      return true;
    } else {
      const alert = await alertController.create({
        header: TranslationService.getTransl("subscription", "Subscription"),
        message: TranslationService.getTransl(
          "subscription-expired",
          "Your subscription has expired on xxx. Please contact the administrators to re-activate it.",
          {
            xxx: new Date(subscriptionDate).toLocaleDateString(undefined, {
              weekday: undefined,
              year: "numeric",
              month: "numeric",
              day: "numeric",
            }),
          }
        ),
        buttons: [
          {
            text: TranslationService.getTransl("ok", "OK"),
            handler: async () => {
              RouterService.goBack();
            },
          },
        ],
      });
      alert.present();
      return false;
    }
  }

  getLanguages() {
    if (Environment.isUdive() || Environment.isDecoplanner()) {
      return [
        {label: "English", value: "en", countryCode: "gb"},
        {label: "Italiano", value: "it", countryCode: "it"},
        {label: "Français", value: "fr", countryCode: "fr"},
        {label: "Español", value: "es", countryCode: "es"},
        {label: "Deutsch", value: "de", countryCode: "de"},
        {label: "Português", value: "pt", countryCode: "pt"},
        {label: "Svenska", value: "sv", countryCode: "se"},
        {label: "Русский", value: "ru", countryCode: "ru"},
        {label: "한국어", value: "ko", countryCode: "kr"},
        {label: "中文", value: "zh", countryCode: "cn"},
      ];
    } else {
      return [
        {label: "English", value: "en", countryCode: "en"},
        {label: "Italiano", value: "it", countryCode: "it"},
        {label: "Français", value: "fr", countryCode: "fr"},
        {label: "Español", value: "es", countryCode: "es"},
        {label: "Deutsch", value: "de", countryCode: "de"},
        {label: "Русский", value: "ru", countryCode: "ru"},
      ];
    }
  }

  getValueForLanguage(item: TextMultilanguage, lang: string) {
    if (item[lang]) {
      return item[lang];
    } else {
      return item["en"];
    }
  }

  async getDeviceInfo() {
    const info = await Device.getInfo();
    this.deviceInfo = info;
    return info;
  }

  async getNetworkStatus(): Promise<Observable<boolean>> {
    return new Promise((resolve) => {
      Network.removeAllListeners();
      Network.getStatus().then((net) => {
        const network$ = new BehaviorSubject(net.connected);
        Network.addListener("networkStatusChange", (res) => {
          network$.next(res.connected);
        });
        resolve(network$);
      });
    });
  }

  async getNetwork() {
    if (Capacitor.isNativePlatform()) {
      // In a native environment, use the Capacitor Network Plugin
      try {
        const status = await Network.getStatus();
        return status.connected;
      } catch (error) {
        console.error("Error getting network status from Capacitor:", error);
        // Handle error or return a default value
        return false;
      }
    } else {
      // In a web environment, use navigator.onLine
      const isOnline = navigator.onLine;
      return isOnline;
    }
  }
}

export const SystemService = new SystemController();
