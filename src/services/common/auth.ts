import { Capacitor } from "@capacitor/core";
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  signOut,
  deleteUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  sendEmailVerification,
  OAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../helpers/firebase";
import { loadingController, alertController } from "@ionic/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

import { DatabaseService } from "./database";
import { Environment } from "../../global/env";
import { TranslationService } from "./translations";
import { UserService } from "./user";
import { UserProfile } from "../../interfaces/common/user/user-profile";
import { SystemService } from "./system";
import { UserRoles } from "../../interfaces/common/user/user-roles";
import { UserSettings } from "../../interfaces/udive/user/user-settings";
import { RouterService } from "./router";

class AuthController {
  userProfile: UserProfile;
  userRoles: UserRoles;
  userSettings: UserSettings;
  authenticating: boolean = false;
  loading: HTMLIonLoadingElement;

  loginStarted = false;
  showDashboard = false;
  showUserSettings = false;

  actionCodeSettings = {
    url: Environment.getSiteUrl(), //send to user page
    handleCodeInApp: true,
    iOS: {
      bundleId: Environment.getBundleId(),
    },
    android: {
      packageName: Environment.getBundleId(),
      installApp: true,
      minimumVersion: "12",
    },
    dynamicLinkDomain: Environment.getDynamicLinkDomain(),
  };

  constructor() {}

  init() {
    onAuthStateChanged(auth, (user) => {
      //wait for services and registration
      //only used for logout
      if (!user) {
        Environment.log("onAuthStateChanged logout", [user]);
        UserService.getUserInfo(user);
      }
    });

    UserService.userProfile$.subscribe((userProfile: UserProfile) => {
      this.userProfile = userProfile;
      //update services
      //DatabaseService.initServices();
    });

    UserService.userRoles$.subscribe((userRoles) => {
      if (userRoles && userRoles.uid) {
        this.userRoles = new UserRoles(userRoles);
        //DatabaseService.initServices();
      } else {
        this.userRoles = null;
      }
    });
    UserService.userSettings$.subscribe((userSettings) => {
      if (userSettings && userSettings.uid) {
        this.userSettings = new UserSettings(userSettings);
      } else {
        this.userSettings = null;
      }
    });
  }

  async sendEmailLink(email: string) {
    await this.presentLoader();

    DatabaseService.saveLocalDocument("emailForSignIn", email);
    return new Promise((resolve, reject) => {
      sendSignInLinkToEmail(auth, email, this.actionCodeSettings).then(
        () => {
          this.dismissLoading();
          resolve(true);
        },
        (err) => {
          this.dismissLoading();
          reject(err);
        }
      );
    });
  }

  public async verifyEmailLink(url: string) {
    const signin = isSignInWithEmailLink(auth, url);
    if (signin) {
      let email = await DatabaseService.getLocalDocument("emailForSignIn");
      // if no email is found, ask for it again
      if (!email) {
        email = window.prompt("Please provide your email for confirmation");
      }
      let result;
      if (Capacitor.isNativePlatform()) {
        // The client SDK will parse the code from the link for you.
        const credential = EmailAuthProvider.credentialWithLink(
          email,
          Environment.getDynamicLinkDomain()
        );
        result = await signInWithCredential(auth, credential);
      } else {
        result = await signInWithEmailLink(auth, email, url);
      }

      if (history && history.replaceState) {
        history.replaceState({}, document.title, url.split("?")[0]);
      }
      DatabaseService.deleteLocalDocument("emailForSignIn");
      return this.providerHandler(result);
    }
    return null;
  }

  async fetchSignInMethodsForEmail(email) {
    return fetchSignInMethodsForEmail(auth, email);
  }

  async passwordReset(email) {
    return sendPasswordResetEmail(auth, email);
  }

  async signInWithEmailPsw(email: string, psw: string) {
    //checkif user signed in with email link method
    const signInMethods = await this.fetchSignInMethodsForEmail(email);
    if (
      signInMethods.indexOf(EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD) !=
      -1
    ) {
      await this.presentLoader();
      DatabaseService.deleteLocalDocument("emailForSignIn");
      const result = await signInWithEmailAndPassword(auth, email, psw);
      return this.providerHandler({
        user: result.user,
        additionalUserInfo: getAdditionalUserInfo(result),
      });
    } else if (
      signInMethods.indexOf(EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD) != -1
    ) {
      return this.sendEmailLink(email);
    } else if (
      signInMethods.indexOf(GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD) != -1
    ) {
      return this.google();
    } /*else if (
      signInMethods.indexOf(FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD) != -1
    ) {
      return this.facebook();
    } */ else if (signInMethods.length == 0) {
      //new user
      await this.presentLoader();
      var result;
      if (psw) {
        if (Capacitor.isNativePlatform()) {
          //create user with email and psw
          result = await FirebaseAuthentication.createUserWithEmailAndPassword({
            email: email,
            password: psw,
          });
          // 2. Sign in on the web layer using the id token and nonce
          const credential = EmailAuthProvider.credential(email, psw);
          await signInWithCredential(auth, credential);
          DatabaseService.deleteLocalDocument("emailForSignIn");
          result.additionalUserInfo = {
            isNewUser: true,
          };
          return this.providerHandler(result);
        } else {
          //create user with email and psw
          result = await createUserWithEmailAndPassword(auth, email, psw);
          DatabaseService.deleteLocalDocument("emailForSignIn");
          return this.providerHandler({
            user: result.user,
            additionalUserInfo: getAdditionalUserInfo(result),
          });
        }
      } else {
        //only email link
        result = await this.sendEmailLink(email);
        return this.providerHandler(result);
      }
    } else {
      throw "Error";
    }
  }

  sendEmailVerification() {
    sendEmailVerification(auth.currentUser, this.actionCodeSettings);
  }

  isElectron() {
    return Capacitor.getPlatform() == "electron";
  }

  async google() {
    await this.presentLoader();
    if (this.isElectron()) {
      //electron popup window
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      return this.providerHandler(res);
    } else {
      // 1. Create credentials on the native layer
      const result = await FirebaseAuthentication.signInWithGoogle();
      if (Capacitor.isNativePlatform()) {
        // 2. Sign in on the web layer using the id token
        const credential = GoogleAuthProvider.credential(
          result.credential?.idToken
        );
        const res = await signInWithCredential(auth, credential);
        return this.providerHandler(res);
      } else {
        return this.providerHandler(result);
      }
    }
  }

  /*async facebook() {
    await this.presentLoader();
    // 1. Create credentials on the native layer
    const result = await FirebaseAuthentication.signInWithFacebook();
    if (Capacitor.isNativePlatform()) {
      // 2. Sign in on the web layer using the id token
      const credential = FacebookAuthProvider.credential(
        result.credential?.accessToken
      );
      const res = await signInWithCredential(auth, credential);
      return this.providerHandler(res);
    } else {
      return this.providerHandler(result);
    }
  }*/

  async apple() {
    await this.presentLoader();
    if (this.isElectron()) {
      //electron-android popup window
      const provider = new OAuthProvider("apple.com");
      const res = await signInWithPopup(auth, provider);
      return this.providerHandler(res);
    } else {
      // 1. Create credentials on the native layer
      const result = await FirebaseAuthentication.signInWithApple({
        skipNativeAuth: true,
      });
      if (Capacitor.isNativePlatform()) {
        // 2. Sign in on the web layer using the id token and nonce
        const provider = new OAuthProvider("apple.com");
        const credential = provider.credential({
          idToken: result.credential?.idToken,
          rawNonce: result.credential?.nonce,
        });
        const res = await signInWithCredential(auth, credential);
        return this.providerHandler(res);
      } else {
        return this.providerHandler(result);
      }
    }
  }

  private async providerHandler(res: any): Promise<any> {
    return new Promise(async (resolve) => {
      this.loginStarted = true;
      if (res && res.additionalUserInfo && res.additionalUserInfo.isNewUser) {
        this.showUserSettings = true;
      } else {
        this.showDashboard = true;
      }
      //reset count for new registrations
      UserService.numberOfTries = 0;
      await UserService.getUserInfo(res.user);
      resolve(true);
    });
  }

  async presentLoader() {
    //check if already open
    let openLoading = await loadingController.getTop();
    if (!openLoading) {
      let message =
        TranslationService.getTransl("logging-in", "Logging in") + "...";
      this.loading = await loadingController.create({
        message: message,
      });
      await this.loading.present();
    }
  }

  dismissLoading() {
    if (this.loading) this.loading.dismiss();
  }

  async deleteUser() {
    const confirm = await alertController.create({
      header: TranslationService.getTransl("delete-account", "Delete Account"),
      message: TranslationService.getTransl(
        "delete-account-are-you-sure",
        "This procedure will delete your account and all data stored in our database associated to it! Are sure?"
      ),
      buttons: [
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          role: "cancel",
          handler: () => {
            return null;
          },
        },
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: async () => {
            const confirm1 = await alertController.create({
              header: TranslationService.getTransl(
                "delete-account",
                "Delete Account"
              ),
              message: TranslationService.getTransl(
                "delete-account-confirm",
                "Your account will be deleted! Are really sure?"
              ),
              buttons: [
                {
                  text: TranslationService.getTransl("cancel", "Cancel"),
                  role: "cancel",
                  handler: () => {
                    return null;
                  },
                },
                {
                  text: TranslationService.getTransl("ok", "OK"),
                  handler: async () => {
                    const user = auth.currentUser;
                    try {
                      await deleteUser(user);
                      this.signOut();
                      SystemService.presentAlert(
                        "Account delete",
                        "Account succesfully deleted!"
                      );
                    } catch (error) {
                      SystemService.presentAlert(
                        "Account delete",
                        "To delete the account we need you to logout and login again. Then you can follow again this procedure. (" +
                          error +
                          ")"
                      ).then(() => {
                        this.signOut();
                      });
                    }
                  },
                },
              ],
            });
            confirm1.present();
          },
        },
      ],
    });
    confirm.present();
  }

  async logout() {
    const confirm = await alertController.create({
      header: TranslationService.getTransl("logout", "Logout"),
      message: TranslationService.getTransl(
        "logout-are-you-sure",
        "Are you sure you want to logout?"
      ),
      buttons: [
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          role: "cancel",
          handler: () => {
            return null;
          },
        },
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: () => {
            return this.signOut();
          },
        },
      ],
    });
    confirm.present();
  }

  async signOut() {
    DatabaseService.clearLocalDocuments();
    // 1. Sign out on the native layer
    await FirebaseAuthentication.signOut();
    // 1. Sign out on the web layer
    RouterService.goHome();
    return signOut(auth);
  }
}

export const AuthService = new AuthController();
