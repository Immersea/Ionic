import {Environment} from "../../global/env";
import {functions, messaging} from "../../helpers/firebase";
import {isSupported, onMessage, getToken} from "firebase/messaging";
import {toastController, alertController, isPlatform} from "@ionic/core";
import {DatabaseService} from "./database";
import {USERPROFILECOLLECTION, UserService} from "./user";
import {NotificationDoc} from "../../interfaces/common/notifications/notifications";
import {TranslationService} from "./translations";
import {SystemService} from "./system";
import {RouterService} from "./router";
import {Device} from "@capacitor/device";
import {httpsCallable} from "firebase/functions";

const NOTIFICATIONSCOLLECTIONNAME = "notifications";
const NOTIFICATIONTOKENSDOCNAME = "tokens";

class NotificationsController {
  initStarted = false;
  token: string;

  async init() {
    //avoid multiple inits
    if (
      !this.initStarted &&
      (isPlatform("pwa") || isPlatform("desktop") || isPlatform("mobileweb"))
    ) {
      this.initStarted = true;
      this.initServiceWorker();
      /*this.initPWA()
        .then(() => {
          this.requestPermission();
        })
        .catch((err) => {
          console.log("initPWA err", err);
        });*/
    }
  }

  initServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.active) {
          navigator.serviceWorker.addEventListener("controllerchange", () =>
            window.location.reload()
          );
        }
      });
    }
  }

  async onServiceWorkerUpdate() {
    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration?.waiting) {
      // If there is no waiting registration, this is the first service
      // worker being installed.
      return;
    }

    const toast = await toastController.create({
      message: "New version available!",
      buttons: [{text: "Reload", role: "reload"}],
      duration: 0,
    });

    await toast.present();

    const {role} = await toast.onWillDismiss();

    if (role === "reload") {
      registration.waiting.postMessage("skipWaiting");
      window.location.reload();
    }
  }

  //OLD
  initPWA(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      navigator.serviceWorker.ready.then(
        (/*registration*/) => {
          // Don't crash an error if messaging not supported
          if (!isSupported()) {
            reject("not supported");
            return;
          }
          // Register the Service Worker
          //useServiceWorker(registration);

          // Initialize your VAPI key
          // messaging.usePublicVapidKey(
          //  Environment.getFirebaseSettings().vapidKey
          //);

          // Listen to messages when your app is in the foreground
          onMessage(messaging, (payload) => {
            console.log("messaging.onMessage", payload);
            this.showToast(payload);
          });
          // Handle token refresh
          /*messaging.onTokenRefresh(() => {
            messaging
              .getToken()
              .then((refreshedToken: string) => {
                this.saveNotificationToken(refreshedToken);
              })
              .catch((err) => {
                console.error("messaging.onTokenRefresh err", err);
              });
          });*/

          resolve();
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  requestPermission(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      try {
        // await messaging.requestPermission();

        const token: string = await getToken(messaging);
        this.saveNotificationToken(token);
      } catch (err) {
        // No notifications granted
      }

      resolve();
    });
  }

  async getLocalNotificationToken() {
    return await DatabaseService.getLocalDocument("localNotificationToken");
  }

  async saveNotificationToken(token) {
    //check local token to avoid saving again the same to server
    const localToken = await this.getLocalNotificationToken();
    if (!localToken || localToken !== token) {
      let notificationTokensDoc = await this.getUserTokensDoc();
      if (!notificationTokensDoc) notificationTokensDoc = {};
      let tokenData = {
        info: null,
        topics: {},
      };
      //delete old token for this device
      if (localToken) {
        tokenData = notificationTokensDoc[localToken];
        delete notificationTokensDoc[localToken];
      } else {
        //check if new token from other device and subscribe to same topics of other existing tokens
        if (Object.keys(notificationTokensDoc).length > 0) {
          tokenData =
            notificationTokensDoc[Object.keys(notificationTokensDoc)[0]];
        }
      }
      for (let topicId in tokenData.topics) {
        //subscribe new token to existing topics - true if already subscribed
        if (tokenData.topics[topicId]) {
          await this.subscribeToTopic(topicId, [token]);
        }
      }
      //write new token
      const info = await Device.getInfo();
      tokenData.info = info;
      notificationTokensDoc[token] = tokenData;

      //save token in the database
      const res = await this.saveUserTokensDoc(notificationTokensDoc);
      //save token locally
      if (res.id) {
        await DatabaseService.saveLocalDocument(
          "localNotificationToken",
          token
        );
      }
    }
  }

  async subscribeUserToTopic(topic: string): Promise<NotificationDoc> {
    return new Promise(async (resolve, reject) => {
      //get user tokens
      const notificationTokensDoc = await this.getUserTokensDoc();
      const errors = [];
      for (let tokenId of Object.keys(notificationTokensDoc)) {
        const tokenDoc = notificationTokensDoc[tokenId];
        const res = <any>await this.subscribeToTopic(topic, [tokenId]);
        if (res && res.data && res.data.errors.length == 0) {
          //success
          tokenDoc.topics[topic] = true;
        } else {
          errors.concat(res.data.errors);
        }
      }
      await this.saveUserTokensDoc(notificationTokensDoc);
      if (errors.length == 0) {
        resolve(notificationTokensDoc);
      } else {
        reject(errors);
      }
    });
  }

  async subscribeUserDeviceToTopic(
    topic: string,
    token: string
  ): Promise<NotificationDoc> {
    return new Promise(async (resolve, reject) => {
      const res = <any>await this.subscribeToTopic(topic, [token]);
      if (res && res.data && res.data.errors.length == 0) {
        //success
        let notificationTokensDoc = await this.getUserTokensDoc();
        notificationTokensDoc[token].topics[topic] = true;
        await this.saveUserTokensDoc(notificationTokensDoc);
        resolve(notificationTokensDoc);
      } else {
        reject(res.data.errors);
      }
    });
  }

  async subscribeToTopic(topic: string, tokens: string[]) {
    //check topic name
    topic = topic;
    const res = await httpsCallable(
      functions,
      "subscribeToTopic"
    )({
      tokens: tokens,
      topic: topic,
    });
    return res;
  }

  async unsubscribeUserFromTopic(topic: string): Promise<NotificationDoc> {
    return new Promise(async (resolve, reject) => {
      //get user tokens
      const notificationTokensDoc = await this.getUserTokensDoc();
      const errors = [];
      for (let tokenId of Object.keys(notificationTokensDoc)) {
        const tokenDoc = notificationTokensDoc[tokenId];
        const res = <any>await this.unsubscribeFromTopic(topic, [tokenId]);
        if (res && res.data && res.data.errors.length == 0) {
          //success
          tokenDoc.topics[topic] = false;
        } else {
          errors.concat(res.data.errors);
        }
      }
      await this.saveUserTokensDoc(notificationTokensDoc);
      if (errors.length == 0) {
        resolve(notificationTokensDoc);
      } else {
        reject(errors);
      }
    });
  }

  async deleteUserFromTopic(topic: string): Promise<NotificationDoc> {
    return new Promise(async (resolve, reject) => {
      const alert = await alertController.create({
        header: TranslationService.getTransl(
          "delete-topic",
          "Delete this Notification Topic"
        ),
        message: TranslationService.getTransl(
          "delete-topic-message",
          "You will not receive notifications from this topic and you cannot subscribe again. Are you sure?"
        ),
        buttons: [
          {
            text: TranslationService.getTransl("ok", "OK"),
            handler: async () => {
              //get user tokens
              SystemService.presentLoading("updating");
              const notificationTokensDoc = await this.getUserTokensDoc();
              const errors = [];
              for (let tokenId of Object.keys(notificationTokensDoc)) {
                const tokenDoc = notificationTokensDoc[tokenId];
                const res = <any>(
                  await this.unsubscribeFromTopic(topic, [tokenId])
                );
                if (res && res.data && res.data.errors.length == 0) {
                  //success
                  delete tokenDoc.topics[topic];
                } else {
                  errors.concat(res.data.errors);
                }
              }
              await this.saveUserTokensDoc(notificationTokensDoc);
              SystemService.dismissLoading();
              if (errors.length == 0) {
                resolve(notificationTokensDoc);
              } else {
                reject(errors);
              }
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

  async unsubscribeUserDeviceFromTopic(
    topic: string,
    token: string
  ): Promise<NotificationDoc> {
    return new Promise(async (resolve, reject) => {
      const res = <any>await this.unsubscribeFromTopic(topic, [token]);
      if (res && res.data && res.data.errors.length == 0) {
        //success
        let notificationTokensDoc = await this.getUserTokensDoc();
        notificationTokensDoc[token].topics[topic] = false;
        await this.saveUserTokensDoc(notificationTokensDoc);
        resolve(notificationTokensDoc);
      } else {
        reject(res.data.errors);
      }
    });
  }

  unsubscribeFromTopic(topic: string, tokens: string[]) {
    topic = topic;
    return httpsCallable(
      functions,
      "unsubscribeFromTopic"
    )({
      tokens: tokens,
      topic: topic,
    });
  }

  async saveUserTokensDoc(
    tokensDoc: NotificationDoc
  ): Promise<NotificationDoc> {
    return DatabaseService.updateDocumentCollection(
      USERPROFILECOLLECTION,
      UserService.userProfile.uid,
      NOTIFICATIONSCOLLECTIONNAME,
      NOTIFICATIONTOKENSDOCNAME,
      tokensDoc
    );
  }

  async getUserTokensDoc(): Promise<NotificationDoc> {
    const notificationTokensDoc = (await DatabaseService.getDocumentCollection(
      USERPROFILECOLLECTION,
      UserService.userProfile.uid,
      NOTIFICATIONSCOLLECTIONNAME,
      NOTIFICATIONTOKENSDOCNAME
    )) as NotificationDoc;
    return notificationTokensDoc;
  }

  async getUserTokensList(): Promise<string[]> {
    const notificationTokensDoc = await this.getUserTokensDoc();
    return Object.keys(notificationTokensDoc);
  }

  async getTopicsForActualDevice() {
    const tokens = await this.getUserTokensDoc();
    const localToken = await this.getLocalNotificationToken();
    if (tokens && tokens[localToken]) {
      return tokens[localToken].topics;
    } else {
      return null;
    }
  }

  sendNotificationToTopic(
    topic: string,
    title: string,
    body: string,
    data: any
  ) {
    return httpsCallable(
      functions,
      "sendNotificationToTopic"
    )({
      topic: topic,
      title: title,
      body: body,
      data: data,
    });
  }

  sendNotificationToTokens(
    tokens: string[],
    title: string,
    body: string,
    data: any
  ) {
    return httpsCallable(
      functions,
      "sendNotificationToTokens"
    )({
      tokens: tokens,
      title: title,
      body: body,
      data: data,
    });
  }

  async onSWUpdate() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.waiting) {
      // If there is no registration, this is the first service
      // worker to be installed. registration.waiting is the one
      // waiting to be activiated.
      return;
    }
    const toast = await toastController.create({
      message: "New version available",
      buttons: [
        {
          side: "end",
          icon: "star",
          text: "Reload",
          handler: () => {
            console.log("Reload clicked");
          },
        },
      ],
    });

    await toast.present();
    await toast.onWillDismiss();
    registration.waiting.postMessage("skipWaiting");
    window.location.reload();
  }

  async showToast(payload) {
    //show toast only if on another page
    if (RouterService.pageTo.join("/") != payload.data.link) {
      const toast = await toastController.create({
        header: payload.data.title,
        message: payload.data.body,
        position: "top",
        duration: 5000,
        color: Environment.appName,
        buttons: [
          {
            side: "end",
            icon: "arrow-redo",
            text: TranslationService.getTransl("show", "Show"),
            handler: () => {
              RouterService.push(payload.data.link, "forward");
            },
          },
          {
            icon: "close",
            role: "cancel",
          },
        ],
      });
      toast.present();
    }
  }
}

/* 
 {collapse_key: "do_not_collapse"
                from: "545871429854"
                notification:{
                body: "Hey, Hello World"
                click_action: "https://mywebsite.ccom"
                title: "Web Push Notifications"}}

curl -X POST -H "Authorization: key=AAAAfxh5AN4:APA91bGEiUZfAiamlp83foHQVpvCmBJpGuETA3ASJJtVlTMdkNQhFTi5SAZJSAynQ5Sj4IPPxnVhtrkJ5r2zYrmUfoNUZydVoG0F6OOaRCPG6jIFimBiTgpFZdhxgEUlFeY_-r6yO-GI" -H "Content-Type: application/json" -d '{"notification": {"title": "Web Push Notifications","body": "Hey, Hello World", "click_action": "https://localhost:3333/chat"},"to": "d8oTA0dUrSl_D-aVuAt1se:APA91bFszXOv-nWjGJNmwKtoJr5up_ERtfUGbM4JZKL9ow6ErpEmpRWA3D3Ty29BhL-MHBheIQpUA1Gg628sEl-D4uw1gI30VOgeH0eFgKRppBSXVB7bkv9Hs_KLJ137QVyikEv5WuyT
"}' "https://fcm.googleapis.com/fcm/send"


  async subscribeToTopic() {
    const tokens = await NotificationsService.getUserTokensList();
    const res = await NotificationsService.subscribeToTopic(
      "/topics/kiosks_bar_perla_orders",
      tokens
    );
    console.log("subscribeToTopic", tokens, res);
  }

  async unsubscribeFromTopic() {
    const tokens = await NotificationsService.getUserTokensList();
    const res = await NotificationsService.unsubscribeFromTopic(
      "/topics/kiosks_bar_perla_orders",
      tokens
    );
    console.log("unsubscribeFromTopic", res);
  }

  async sendNotificationToTopic() {
    const res = await NotificationsService.sendNotificationToTopic(
      "/topics/kiosks_bar_perla_orders",
      "Send to Topic",
      "CIA CIAO",
      { id: "1234", link: "https://example.it" }
    );
    console.log("sendNotificationToTopic", res);
  }
  async sendNotificationToTokens() {
    const tokens = await NotificationsService.getUserTokensList();
    const res = await NotificationsService.sendNotificationToTokens(
      tokens,
      "Send to Tokens",
      "PIPPO",
      { id: "4321", link: "https://example.it" }
    );
    console.log("sendNotificationToTokens", res);
  }

*/

export const NotificationsService = new NotificationsController();
