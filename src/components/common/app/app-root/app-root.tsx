import { Component, h, State, Element, Listen } from "@stencil/core";
import { AuthService } from "../../../../services/common/auth";
import { UserService } from "../../../../services/common/user";
import * as Plugins from "../../../../helpers/plugins";
import { TranslationService } from "../../../../services/common/translations";
import { UDiveFilterService } from "../../../../services/udive/ud-db-filter";
import { RouterService, ADMINROUTE } from "../../../../services/common/router";
import { SystemService } from "../../../../services/common/system";
import { isElectron, setCoverHeight } from "../../../../helpers/utils";
import { UserProfile } from "../../../../interfaces/common/user/user-profile";
import { UserRoles } from "../../../../interfaces/common/user/user-roles";
import { UserSettings } from "../../../../interfaces/udive/user/user-settings";
import { Environment } from "../../../../global/env";
//import {defineCustomElements} from "@ionic/pwa-elements/loader";
import { isPlatform } from "@ionic/core";
import { TrasteelFilterService } from "../../../../services/trasteel/common/trs-db-filter";
import { auth } from "../../../../helpers/firebase";
import { DatabaseService } from "../../../../services/common/database";
import { TrasteelRoutingService } from "../../../../services/trasteel/common/routing";
import { UdiveRoutingService } from "../../../../services/udive/routing";
import { NotificationsService } from "../../../../services/common/notifications";

@Component({
  tag: "app-root",
  styleUrl: "app-root.scss",
})
export class AppRoot {
  @Element() el: HTMLElement;
  @State() userProfile: UserProfile;
  @State() isAdmin = false;
  @State() appLoaded = false;
  @State() userRoles: UserRoles;
  @State() userSettings: UserSettings;
  userProfileLoaded = false;
  navCtrl: HTMLIonRouterElement;

  // SEND a message to user for software updates
  @Listen("swUpdate", { target: "window" })
  onServiceWorkerUpdate() {
    NotificationsService.onServiceWorkerUpdate();
  }

  componentWillLoad() {
    this.initApp();
  }

  componentDidLoad() {
    //for PWA custom windows
    //defineCustomElements(window);
  }

  async initApp() {
    Plugins.init();
    //check platform
    if (isPlatform("pwa") || isPlatform("desktop") || isPlatform("mobileweb")) {
      //load pwa splash screen
      this.appLoaded = false;
      this.resetBkgColor(false);
    } else {
      //native app
      this.appLoaded = true;
      this.resetBkgColor(true);
    }

    window.addEventListener("resize", setCoverHeight);
    setCoverHeight();

    //this.darkTheme();
    UserService.userProfile$.subscribe(async (userProfile: UserProfile) => {
      //wait for user services to start and skip first null userProfile
      if (DatabaseService.servicesStarted) {
        const user = auth.currentUser;
        if (user && user.uid && userProfile && userProfile.uid) {
          //user logged in
          this.userProfile = new UserProfile(userProfile);
          //DatabaseService.initServices();
          //avoid double calling
          if (!this.userProfileLoaded) {
            this.userProfileLoaded = true;
            //wait for new router and menu to render
            await customElements.whenDefined("app-menu");
            await setTimeout(async () => {
              if (AuthService.showDashboard) {
                if (Environment.isUdive()) {
                  this.navCtrl.push("/dashboard", "root");
                } else if (Environment.isDecoplanner()) {
                  this.navCtrl.push("/deco-planner", "root");
                } else if (Environment.isTrasteel()) {
                  //after first login force download data
                  await DatabaseService.forceRefreshMapData();
                  this.navCtrl.push("/customers", "root");
                }
                AuthService.showDashboard = false;
              } else if (AuthService.showUserSettings) {
                this.navCtrl.push("/" + ADMINROUTE + "/user", "root");
                this.presentUserUpdate();
                AuthService.showUserSettings = false;
              }
              AuthService.dismissLoading();
              this.appLoaded = true;
              this.resetBkgColor(true);
              Plugins.hideSplash();
            }, 200);
          }
        } else {
          Environment.log("user not logged in");
          //user not logged in
          this.appLoaded = true;
          this.resetBkgColor(true);
          this.userProfile = null;
          this.userProfileLoaded = false;
          AuthService.signOut();
          Plugins.hideSplash();
        }
        this.loadRouter();
      }
    });
    UserService.userRoles$.subscribe((userRoles) => {
      if (userRoles && userRoles.uid) {
        this.userRoles = new UserRoles(userRoles);
        DatabaseService.initServices();
      } else {
        this.userRoles = null;
      }
    });
    UserService.userSettings$.subscribe((userSettings) => {
      if (userSettings && userSettings.uid) {
        this.userSettings = new UserSettings(userSettings);
        //DatabaseService.initServices();
      } else {
        this.userSettings = null;
      }
    });

    //subscribe to updates in data
    SystemService.systemPreferences$.subscribe(() => {
      //refresh mapdata when system document is updated
      DatabaseService.refreshMapData(false);
    });
    this.startServices();
  }

  async startServices() {
    try {
      AuthService.init();
      await SystemService.init();
      await TranslationService.init(
        Environment.isUdive() ||
          Environment.isDecoplanner() ||
          Environment.isTrasteel()
          ? "en"
          : "it"
      );

      if (Environment.isUdive() || Environment.isDecoplanner()) {
        await UDiveFilterService.init();
      } else if (Environment.isTrasteel()) {
        await TrasteelFilterService.init();
      }
      UserService.start();
      DatabaseService.servicesStarted = true;
      DatabaseService.initServices();

      //check email link for user registration
      if (!isElectron()) {
        await AuthService.signInLinkReceived(location.href);
      } else {
        // Ensure that the electronAPI is available before calling
        if (window["electronAPI"]) {
          if (window["electronAPI"].onSignInLinkReceived) {
            // Listen for the 'sign-in-link-received' event from Electron
            window["electronAPI"].onSignInLinkReceived((url: string) => {
              console.log("Electron sign-in-link-received", url);
              // Call the AuthService's method
              AuthService.signInLinkReceived(url);
            });
          }
          if (window["electronAPI"].onMainLog) {
            // Listen for logs from the main process
            window["electronAPI"].onMainLog((log: string) => {
              console.log("Received main process log:", log);
            });
          }
        }
      }
    } catch {
      //user never logged in
      //check network
      await SystemService.getNetworkStatus().then((networkObservable) => {
        const networkObs = networkObservable.subscribe((status) => {
          if (status) {
            //wait for network
            this.startServices();
            networkObs.unsubscribe();
          }
        });
      });
    }
  }

  resetBkgColor(white) {
    //reset background color after splash screen
    if (white) {
      document.documentElement.style.setProperty(
        "--ion-background-color",
        "#fff"
      );
      document.documentElement.style.setProperty("--ion-text-color", "#000");
    } else {
      document.documentElement.style.setProperty(
        "--ion-background-color",
        "var(" + Environment.getAppSplashColor() + ")"
      );
      document.documentElement.style.setProperty(
        "--ion-text-color",
        "var(" + Environment.getAppSplashColor() + "-contrast)"
      );
    }
  }

  /*setManifestJSON() {
    let manifest = "";
    if (Environment.isUdive()) {
      manifest = "udive";
    } 
    document
      .querySelector("#my-manifest-placeholder")
      .setAttribute("href", "/manifest_" + manifest + ".json");
  }*/

  loadRouter() {
    //loop until router is loaded
    setTimeout(async () => {
      let nav = this.el.querySelector("#app-router");
      if (nav) {
        this.navCtrl = await (nav as any).componentOnReady();
        RouterService.init(this.navCtrl);
      } else {
        this.loadRouter();
      }
    });
  }

  async presentUserUpdate() {
    UserService.presentUserUpdate();
  }

  renderRedirectRoutes() {
    let res;
    if (Environment.isUdive()) {
      res = UdiveRoutingService.renderUDiveRedirectRoutes();
    } else if (Environment.isDecoplanner()) {
      res = UdiveRoutingService.renderDecoplannerRedirectRoutes();
    } else if (Environment.isTrasteel()) {
      res = TrasteelRoutingService.renderRedirectRoutes();
    }
    return res;
  }

  renderLoggedInUserRoutes() {
    if (this.userRoles) {
      if (Environment.isUdive()) {
        return UdiveRoutingService.renderUdiveLoggedinUserRoutes();
      } else if (Environment.isDecoplanner()) {
        return UdiveRoutingService.renderDecoplannerLoggedinUserRoutes();
      } else if (Environment.isTrasteel()) {
        return TrasteelRoutingService.renderLoggedinUserRoutes();
      }
    } else {
      return undefined;
    }
  }

  renderAdminRoutes() {
    if (this.userRoles) {
      if (Environment.isUdive()) {
        return UdiveRoutingService.renderUDiveAdminRoutes();
      } else if (Environment.isDecoplanner()) {
        return UdiveRoutingService.renderDecoplannerAdminRoutes();
      } else if (Environment.isTrasteel()) {
        return TrasteelRoutingService.renderAdminRoutes();
      }
    } else {
      return undefined;
    }
  }

  renderCommonRoutes() {
    if (Environment.isUdive()) {
      return UdiveRoutingService.renderUdiveCommonUserRoutes();
    } else if (Environment.isDecoplanner()) {
      return UdiveRoutingService.renderDecoplannerCommonUserRoutes();
    } else if (Environment.isTrasteel()) {
      return TrasteelRoutingService.renderCommonUserRoutes();
    }
  }

  renderSuperAdminRoutes() {
    if (Environment.isUdive()) {
      return UdiveRoutingService.renderUDiveSuperAdminRoutes();
    } else if (Environment.isDecoplanner()) {
      return UdiveRoutingService.renderDecoplannerSuperAdminRoutes();
    } else if (Environment.isTrasteel()) {
      return TrasteelRoutingService.renderSuperAdminRoutes();
    }
  }

  darkTheme() {
    // Use matchMedia to check the user preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    toggleDarkTheme(prefersDark.matches);

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addListener((mediaQuery) =>
      toggleDarkTheme(mediaQuery.matches)
    );

    // Add or remove the "dark" class based on if the media query matches
    function toggleDarkTheme(shouldAdd) {
      document.body.classList.toggle("dark", shouldAdd);
    }
  }

  render() {
    return (
      <ion-app class={"ion-color-" + Environment.getAppColor()}>
        {this.appLoaded ? (
          <ion-router
            useHash={false}
            id='app-router'
            onIonRouteWillChange={(ev) => RouterService.routerChanged(ev)}
          >
            {
              /*loggedin user route urls*/
              this.renderLoggedInUserRoutes()
            }
            {
              /*admin for diving ceneters, schools, service centers*/
              this.renderAdminRoutes()
            }
            {
              /*common route urls*/
              this.renderCommonRoutes()
            }
            {
              /*translator route urls*/
              this.userRoles && this.userRoles.isTranslator()
                ? [
                    <ion-route
                      url={"/translations"}
                      component='page-admin-translations'
                    ></ion-route>,
                  ]
                : undefined
            }
            {
              /* superadmin routes */
              this.renderSuperAdminRoutes()
            }
            {
              /* redirect routes */
              this.renderRedirectRoutes()
            }
          </ion-router>
        ) : undefined}

        {this.appLoaded ? <app-menu /> : <page-loading></page-loading>}
      </ion-app>
    );
  }
}
