import {alertController} from "@ionic/core";
import {Environment} from "../../global/env";
import {SystemService} from "../common/system";
import {TranslationService} from "../common/translations";

class HttpsFunctionsController {
  async startTrialPeriod(uid) {
    await SystemService.presentLoading("please-wait");
    let data = {
      uid: uid,
      level: "unlimited",
      duration: 60,
      fromDate: new Date().toISOString(),
    };
    let response = await fetch(
      Environment.getCloudFunctionsUrl() + "startTrialPeriod",
      {
        method: "POST",
        redirect: "follow",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    try {
      let json = await response.json();
      SystemService.dismissLoading();
      if (!json.err) {
        let header = TranslationService.getTransl(
          "activate-trial",
          "Start Trial"
        );
        let message = TranslationService.getTransl(
          "activate-trail-message-ok",
          "Your trial licence has been activated!"
        );
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
      } else {
        SystemService.presentAlertError(json.err);
      }
    } catch (error) {
      SystemService.dismissLoading();
      SystemService.presentAlertError(error);
    }
  }

  async activateLicenses(uid, levels) {
    await SystemService.presentLoading("please-wait");
    let data = {
      uid: uid,
      levels: levels, // ["rec1","rec2",...],
    };
    let response = await fetch(
      Environment.getCloudFunctionsUrl() + "activateLicenses",
      {
        method: "POST",
        redirect: "follow",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    try {
      let json = await response.json();
      SystemService.dismissLoading();
      console.log("json", json);
    } catch (error) {
      SystemService.dismissLoading();
      console.log("error", error);
    }
  }

  async getServerDate(format) {
    await SystemService.presentLoading("please-wait");
    let data = {
      format: format,
    };
    let response = await fetch(Environment.getCloudFunctionsUrl() + "date", {
      method: "POST",
      redirect: "follow",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    try {
      let json = await response.json();
      SystemService.dismissLoading();
      return json;
    } catch (error) {
      SystemService.dismissLoading();
      return {err: error};
    }
  }

  /*const email = "luca.palezza@gmail.com";
    const res = await HttpsFunctionsService.getUserIdWithEmail(email);
    console.log("res", res);
    if (res && res.err) {
      //no user - create one
      const register = await HttpsFunctionsService.registerUserWithEmail(email);
      console.log("register", register);
      --> 
      data: {uid: "I5P1KUwpMqWegcN1ND2eS8g3OYx1", email: "luca.palezza@gmail.com", emailVerified: false, displayName: "luca.palezza@gmail.com", disabled: false, …}
      reset_link: "https://u-dive-cloud-prod.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=L0tTHvJRdaPjYS5_mAZyt57FwYgo4uYM-cFa1fnDYm4AAAF1systCQ&apiKey=AIzaSyCBxu4H6gznmMjjtyJC4E5tHBsvjcz9Gvo&lang=en"
      verification_link: "https://u-dive-cloud-prod.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=uOBEByWvsTTEuXRa2fPleIfM8San3eztxBsEO8471sUAAAF1sysulA&apiKey=AIzaSyCBxu4H6gznmMjjtyJC4E5tHBsvjcz9Gvo&lang=en"
      -->
    } else {
      //existing user info
      console.log("user", res.data);
    }*/
  async getUserIdWithEmail(email) {
    await SystemService.presentLoading("please-wait");
    let data = {
      email: email,
    };
    let response = await fetch(
      Environment.getCloudFunctionsUrl() + "getUserIdWithEmail",
      {
        method: "POST",
        redirect: "follow",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    try {
      let json = await response.json();
      SystemService.dismissLoading();
      return json;
    } catch (error) {
      SystemService.dismissLoading();
      return {err: error};
    }
  }

  async registerUserWithEmail(email, psw?) {
    await SystemService.presentLoading("please-wait");
    let data = {
      email: email,
      psw: psw,
    };
    let response = await fetch(
      Environment.getCloudFunctionsUrl() + "registerUserWithEmail",
      {
        method: "POST",
        redirect: "follow",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    try {
      let json = await response.json();
      SystemService.dismissLoading();
      return json;
    } catch (error) {
      SystemService.dismissLoading();
      return {err: error};
    }
  }

  /*const res = await HttpsFunctionsService.deleteUserWithId(uid);
    console.log("res", res); /* {ok: "user deleted"}*/
  async deleteUserWithId(uid) {
    await SystemService.presentLoading("please-wait");
    let data = {
      uid: uid,
    };
    let response = await fetch(
      Environment.getCloudFunctionsUrl() + "deleteUserWithId",
      {
        method: "POST",
        redirect: "follow",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    try {
      let json = await response.json();
      SystemService.dismissLoading();
      return json;
    } catch (error) {
      SystemService.dismissLoading();
      return {err: error};
    }
  }
}
export const HttpsFunctionsService = new HttpsFunctionsController();
