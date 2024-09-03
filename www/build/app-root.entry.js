import { h, r as registerInstance, k as getElement } from './index-d515af00.js';
import { U as UserService, C as CUSTOMERSCOLLECTION, A as ADMINROUTE, r as CONTACTSCOLLECTION, s as DATASHEETSCOLLECTION, P as PROJECTSCOLLECTION, t as SHAPESCOLLECTION, k as SERVICECENTERSCOLLECTION, m as DIVESCHOOLSSCOLLECTION, o as DIVECOMMUNITIESCOLLECTION, c as DIVECENTERSSCOLLECTION, N as NotificationsService, u as setCoverHeight, D as DatabaseService, v as auth, w as UserProfile, x as AuthService, y as UserRoles, z as UserSettings, B as SystemService, T as TranslationService, E as UDiveFilterService, F as TrasteelFilterService, R as RouterService } from './utils-ced1e260.js';
import './index-be90eba5.js';
import { r as registerPlugin, E as Environment } from './env-c3ad5e77.js';
import { a as isPlatform } from './ionic-global-c07767bf.js';
import { T as TrasteelService } from './services-7994f696.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-fe092362.js';
import './index-9b61a50b.js';
import './overlays-b3ceb97d.js';
import './index-51ff1772.js';
import './helpers-ff3eb5b3.js';
import './hardware-back-button-da755485.js';
import './framework-delegate-779ab78c.js';
import './gesture-controller-a0857859.js';
import './index-93ceac82.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-222db2aa.js';
import './ios.transition-4bc5d5e6.js';
import './md.transition-b118d52a.js';
import './cubic-bezier-acda64df.js';
import './index-493838d0.js';
import './config-45217ee2.js';
import './theme-6bada181.js';
import './index-f47409f3.js';

/// <reference types="@capacitor/cli" />

const PushNotifications = registerPlugin('PushNotifications', {});

/// <reference types="@capacitor/cli" />

const SplashScreen = registerPlugin('SplashScreen', {
    web: () => import('./web-fac9635a.js').then(m => new m.SplashScreenWeb()),
});

function init() {
    if (isPlatform("capacitor")) {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
        // On success, we should be able to receive notifications
        PushNotifications.addListener("registration", (token) => {
            console.log("Push registration success, token: " + token.value);
        });
        // Some issue with our setup and push will not work
        PushNotifications.addListener("registrationError", (error) => {
            console.log("Error on registration: " + JSON.stringify(error));
        });
        // Show us the notification payload if the app is open on our device
        PushNotifications.addListener("pushNotificationReceived", (notification) => {
            console.log("Push received: " + JSON.stringify(notification));
        });
        // Method called when tapping on a notification
        PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
            alert("Push action performed: " + JSON.stringify(notification));
        });
    }
}
function hideSplash() {
    SplashScreen.hide();
}
function showSplash() {
    SplashScreen.show({
        showDuration: 2000,
        autoHide: false,
    });
}

class TrasteelRouting {
    renderRedirectRoutes() {
        const unmatched = [h("ion-route", { url: ":any", component: "page-404" })];
        const res = UserService.userProfile
            ? [
                h("ion-route-redirect", { from: "/", to: "/" + CUSTOMERSCOLLECTION }),
                h("ion-route-redirect", { from: "/login", to: "/" + CUSTOMERSCOLLECTION }),
            ]
            : [h("ion-route-redirect", { from: "/", to: "/login" })];
        return [...unmatched, ...res];
    }
    renderAdminRoutes() {
        const routes = [];
        for (let itemId in UserService.userRoles.editorOf) {
            const editorOf = UserService.userRoles.editorOf[itemId];
            switch (editorOf.collection
            ///to be completed
            ) {
            }
        }
        //set administration routes
        if (TrasteelService.isTeamAdmin()) {
            /*routes.push([
              <ion-route
                url={USERPLANSCOLLECTION + "/user/:uid"}
                component="page-user-plans"
              ></ion-route>,
            ]);*/
        }
        //set administration routes
        if (UserService.userRoles.isTranslator()) {
            routes.push([
                h("ion-route", { url: "/translations", component: "page-admin-translations" }),
            ]);
        }
        //set administration routes
        if (UserService.userRoles.isUserAdmin()) {
            routes.push([
                h("ion-route", { url: "/usermanager", component: "page-user-manager" }),
                h("ion-route", { url: "/teammanager", component: "page-team-manager" }),
            ]);
        }
        return routes;
    }
    renderLoggedinUserRoutes() {
        const ret = [
            h("ion-route", { url: "/" + ADMINROUTE + "/user", component: "page-trs-user-settings" }),
            h("ion-route", { url: "/dashboard", component: "page-trs-dashboard" }),
            h("ion-route", { url: "/" + CONTACTSCOLLECTION, component: "page-contacts" }),
            h("ion-route", { url: "/" + CONTACTSCOLLECTION + "/:itemId", component: "page-contact-details" }),
            h("ion-route", { url: "/" + CUSTOMERSCOLLECTION, component: "page-customers" }),
            h("ion-route", { url: "/" + CUSTOMERSCOLLECTION + "/:itemId", component: "page-customer-details" }),
            /*<ion-route
              url={"/" + USERPLANSCOLLECTION}
              component="page-user-plans"
            ></ion-route>,
            <ion-route
              url={"/" + USERPLANSCOLLECTION + "/details/:itemId"}
              component="page-user-plans-details"
            ></ion-route>,*/
            h("ion-route", { url: "/" + DATASHEETSCOLLECTION, component: "page-datasheets" }),
            h("ion-route", { url: "/" + DATASHEETSCOLLECTION + "/:itemId", component: "page-datasheet-details" }),
            h("ion-route", { url: "/" + PROJECTSCOLLECTION, component: "page-projects" }),
            h("ion-route", { url: "/" + PROJECTSCOLLECTION + "/:itemId", component: "page-project-details" }),
            h("ion-route", { url: "/" + SHAPESCOLLECTION, component: "page-shapes" }),
            h("ion-route", { url: "/" + SHAPESCOLLECTION + "/:itemId", component: "page-shape-details" }),
        ];
        return ret;
    }
    renderCommonUserRoutes() {
        return [
            h("ion-route", { url: "/page-404", component: "page-404" }),
            h("ion-route", { url: "/login", component: "page-login" }),
            h("ion-route", { url: "/forgotpsw", component: "page-lostpsw" }),
            h("ion-route", { url: "/loading", component: "page-loading" }),
        ];
    }
    renderSuperAdminRoutes() {
        /*translator route urls*/
        return UserService.userRoles && UserService.userRoles.isSuperAdmin()
            ? []
            : undefined;
    }
}
const TrasteelRoutingService = new TrasteelRouting();

class UdiveRouting {
    renderUDiveRedirectRoutes() {
        const unmatched = [h("ion-route", { url: ":any", component: "page-404" })];
        const res = UserService.userProfile
            ? [
                h("ion-route-redirect", { from: "/", to: "/dashboard" }),
                h("ion-route-redirect", { from: "/login", to: "/dashboard" }),
            ]
            : [
                h("ion-route-redirect", { from: "/", to: "/map" }),
                h("ion-route-redirect", { from: "/admin", to: "/map" }),
                h("ion-route-redirect", { from: "/admin/*", to: "/map" }),
                h("ion-route-redirect", { from: "/dashboard", to: "/map" }),
            ];
        return [...unmatched, ...res];
    }
    renderDecoplannerRedirectRoutes() {
        const unmatched = [h("ion-route", { url: ":any", component: "page-404" })];
        const res = UserService.userProfile
            ? [
                h("ion-route-redirect", { from: "/", to: "/deco-planner" }),
                h("ion-route-redirect", { from: "/login", to: "/deco-planner" }),
            ]
            : [
                h("ion-route-redirect", { from: "/", to: "/login" }),
                h("ion-route-redirect", { from: "/admin", to: "/login" }),
                h("ion-route-redirect", { from: "/admin/*", to: "/login" }),
                h("ion-route-redirect", { from: "/deco-planner", to: "/login" }),
                h("ion-route-redirect", { from: "/deco-planner/*", to: "/login" }),
            ];
        return [...unmatched, ...res];
    }
    renderUdiveLoggedinUserRoutes() {
        const ret = [
            h("ion-route", { url: "/dashboard", component: "page-dashboard" }),
            h("ion-route", { url: "/divetrips", component: "page-dive-trips" }),
            h("ion-route", { url: "/divingclasses", component: "page-diving-classes" }),
            h("ion-route", { url: "/chat", component: "page-chats-list" }),
            h("ion-route", { url: "/chat/:chatId", component: "page-chat" }),
            h("ion-route", { url: "/" + ADMINROUTE + "/user", component: "page-user-settings" }),
        ];
        //Agency admin route
        if (UserService.userRoles.isAgencyAdmin()) {
            ret.push(h("ion-route", { url: "/" + ADMINROUTE + "/agencies", component: "page-admin-agencies" }));
        }
        return ret;
    }
    renderDecoplannerLoggedinUserRoutes() {
        const ret = [
            h("ion-route", { url: "/" + ADMINROUTE + "/user", component: "page-user-settings" }),
        ];
        //Agency admin route
        if (UserService.userRoles.isAgencyAdmin()) {
            ret.push(h("ion-route", { url: "/" + ADMINROUTE + "/agencies", component: "page-admin-agencies" }));
        }
        return ret;
    }
    renderUDiveAdminRoutes() {
        const routes = [];
        for (let itemId in UserService.userRoles.editorOf) {
            const editorOf = UserService.userRoles.editorOf[itemId];
            switch (editorOf.collection) {
                case DIVECENTERSSCOLLECTION:
                    routes.push([
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECENTERSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/dashboard", componentProps: { dcid: itemId }, component: "page-diving-dashboard" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECENTERSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/customers", componentProps: { dcid: itemId }, component: "page-diving-customers" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECENTERSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/customers/:clientId", componentProps: { dcid: itemId }, component: "page-client-details" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECENTERSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/chat", componentProps: { dcid: itemId }, component: "page-diving-chats-list" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECENTERSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/chat/:chatId", componentProps: { dcid: itemId }, component: "page-chat" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECENTERSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/divetrips", componentProps: { dcid: itemId }, component: "page-diving-dive-trips" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECENTERSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/divetrips/:tripid", componentProps: { dcid: itemId }, component: "page-dive-trip-details" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECENTERSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/rentals", componentProps: { dcid: itemId }, component: "page-diving-rentals" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECENTERSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/warehouse", componentProps: { dcid: itemId }, component: "page-diving-warehouse" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECENTERSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/payments", componentProps: { dcid: itemId }, component: "page-diving-payments" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECENTERSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/invoicing", componentProps: { dcid: itemId }, component: "page-diving-invoicing" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECENTERSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/documents", componentProps: { dcid: itemId }, component: "page-diving-documents" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECENTERSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/reports", componentProps: { dcid: itemId }, component: "page-diving-reports" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECENTERSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/settings", componentProps: { dcid: itemId }, component: "page-diving-center-details" }),
                    ]);
                    break;
                case DIVECOMMUNITIESCOLLECTION:
                    routes.push([
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/dashboard", componentProps: { dcid: itemId }, component: "page-community-dashboard" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/members", componentProps: { dcid: itemId }, component: "page-community-members" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/members/:memberId", componentProps: { dcid: itemId }, component: "page-member-details" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/chat", componentProps: { dcid: itemId }, component: "page-community-chats-list" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/chat/:chatId", componentProps: { dcid: itemId }, component: "page-chat" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/divetrips", componentProps: { dcid: itemId }, component: "page-community-dive-trips" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/divetrips/:tripid", componentProps: { dcid: itemId }, component: "page-dive-trip-details" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/settings", componentProps: { dcid: itemId }, component: "page-dive-community-details" }),
                    ]);
                    break;
                case DIVESCHOOLSSCOLLECTION:
                    routes.push([
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/dashboard", componentProps: { dsid: itemId }, component: "page-school-dashboard" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/members", componentProps: { dsid: itemId }, component: "page-school-members" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/members/:clientId", componentProps: { dsid: itemId }, component: "page-client-details" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/chat", componentProps: { dsid: itemId }, component: "page-school-chats-list" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/chat/:chatId", componentProps: { dsid: itemId }, component: "page-chat" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/divingclasses", componentProps: { dsid: itemId }, component: "page-school-classes" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/divingclasses/:classid", componentProps: { dsid: itemId }, component: "page-diving-class-details" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/divetrips", componentProps: { dsid: itemId }, component: "page-school-dive-trips" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/divetrips/:tripid", componentProps: { dsid: itemId }, component: "page-dive-trip-details" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/warehouse", componentProps: { dsid: itemId }, component: "page-school-warehouse" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/rentals", componentProps: { dsid: itemId }, component: "page-school-rentals" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/settings", componentProps: { dsid: itemId }, component: "page-diving-school-details" }),
                    ]);
                    break;
                case SERVICECENTERSCOLLECTION:
                    routes.push([
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                SERVICECENTERSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/dashboard", componentProps: { centerid: itemId }, component: "page-service-dashboard" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                SERVICECENTERSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/customers", componentProps: { centerid: itemId }, component: "page-service-customers" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                SERVICECENTERSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/customers/:clientId", componentProps: { centerid: itemId }, component: "page-client-details" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                SERVICECENTERSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/chat", componentProps: { centerid: itemId }, component: "page-service-chats-list" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                SERVICECENTERSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/chat/:chatId", componentProps: { centerid: itemId }, component: "page-chat" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                SERVICECENTERSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/servicing", componentProps: { centerid: itemId }, component: "page-service-servicing" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                SERVICECENTERSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/warehouse", componentProps: { centerid: itemId }, component: "page-service-warehouse" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                SERVICECENTERSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/payments", componentProps: { centerid: itemId }, component: "page-service-payments" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                SERVICECENTERSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/invoicing", componentProps: { centerid: itemId }, component: "page-service-invoicing" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                SERVICECENTERSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/documents", componentProps: { centerid: itemId }, component: "page-service-documents" }),
                        h("ion-route", { url: "/" +
                                ADMINROUTE +
                                "/" +
                                SERVICECENTERSCOLLECTION.toLowerCase() +
                                "/" +
                                itemId +
                                "/settings", componentProps: { centerid: itemId }, component: "page-service-center-details" }),
                    ]);
                    break;
            }
        }
        //user administration routes
        if (UserService.userRoles.isUserAdmin()) {
            routes.push([
                h("ion-route", { url: "/usermanager", component: "page-user-manager" }),
            ]);
        }
        return routes;
    }
    renderDecoplannerAdminRoutes() {
        const routes = [];
        //user administration routes
        if (UserService.userRoles.isUserAdmin()) {
            routes.push([
                h("ion-route", { url: "/usermanager", component: "page-user-manager" }),
            ]);
        }
        return routes;
    }
    renderUdiveCommonUserRoutes() {
        return [
            h("ion-route", { url: "/page-404", component: "page-404" }),
            h("ion-route", { url: "/map", component: "page-map" }),
            h("ion-route", { url: "/guemap", component: "page-gue-map" }),
            h("ion-route", { url: "/logbook", component: "page-log-book" }),
            h("ion-route", { url: "/deco-planner", component: "page-dive-planner" }),
            h("ion-route", { url: "/gas-blender", component: "page-gas-blender" }),
            h("ion-route", { url: "/divetrips/:tripid", component: "page-dive-trip-details" }),
            h("ion-route", { url: "/divingclasses/:classid", component: "page-diving-class-details" }),
            h("ion-route", { url: "/divesite/:siteid", component: "page-dive-site-details" }),
            h("ion-route", { url: "/divingcenter/:dcid", component: "page-diving-center-details" }),
            h("ion-route", { url: "/divecommunity/:dcid", component: "page-dive-community-details" }),
            h("ion-route", { url: "/divingschool/:dsid", component: "page-diving-school-details" }),
            h("ion-route", { url: "/servicecenter/:centerid", component: "page-service-center-details" }),
            h("ion-route", { url: "/diveplan/:planid/dive/:diveid", component: "page-dive-plan-details" }),
            h("ion-route", { url: "/login", component: "page-login" }),
            h("ion-route", { url: "/forgotpsw", component: "page-lostpsw" }),
            h("ion-route", { url: "/support", component: "page-support" }),
            h("ion-route", { url: "/loading", component: "page-loading" }),
        ];
    }
    renderDecoplannerCommonUserRoutes() {
        return [
            h("ion-route", { url: "/page-404", component: "page-404" }),
            h("ion-route", { url: "/deco-planner", component: "page-dive-planner" }),
            h("ion-route", { url: "/gas-blender", component: "page-gas-blender" }),
            h("ion-route", { url: "/login", component: "page-login" }),
            h("ion-route", { url: "/forgotpsw", component: "page-lostpsw" }),
            h("ion-route", { url: "/support", component: "page-support" }),
            h("ion-route", { url: "/loading", component: "page-loading" }),
            h("ion-route", { url: "/logbook", component: "page-log-book" }),
            h("ion-route", { url: "/diveplan/:planid/dive/:diveid", component: "page-dive-plan-details" }),
        ];
    }
    renderUDiveSuperAdminRoutes() {
        /*translator route urls*/
        return UserService.userRoles && UserService.userRoles.isSuperAdmin()
            ? []
            : undefined;
    }
    renderDecoplannerSuperAdminRoutes() {
        /*translator route urls*/
        return UserService.userRoles && UserService.userRoles.isSuperAdmin()
            ? []
            : undefined;
    }
}
const UdiveRoutingService = new UdiveRouting();

const appRootCss = "";

const AppRoot = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.userProfileLoaded = false;
        this.userProfile = undefined;
        this.isAdmin = false;
        this.appLoaded = false;
        this.userRoles = undefined;
        this.userSettings = undefined;
    }
    // SEND a message to user for software updates
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
        init();
        //check platform
        if (isPlatform("pwa") || isPlatform("desktop") || isPlatform("mobileweb")) {
            //load pwa splash screen
            this.appLoaded = false;
            this.resetBkgColor(false);
        }
        else {
            //native app
            this.appLoaded = true;
            this.resetBkgColor(true);
        }
        window.addEventListener("resize", setCoverHeight);
        setCoverHeight();
        //this.darkTheme();
        UserService.userProfile$.subscribe(async (userProfile) => {
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
                                }
                                else if (Environment.isDecoplanner()) {
                                    this.navCtrl.push("/deco-planner", "root");
                                }
                                else if (Environment.isTrasteel()) {
                                    //after first login force download data
                                    await DatabaseService.forceRefreshMapData();
                                    this.navCtrl.push("/customers", "root");
                                }
                                AuthService.showDashboard = false;
                            }
                            else if (AuthService.showUserSettings) {
                                this.navCtrl.push("/" + ADMINROUTE + "/user", "root");
                                this.presentUserUpdate();
                                AuthService.showUserSettings = false;
                            }
                            AuthService.dismissLoading();
                            this.appLoaded = true;
                            this.resetBkgColor(true);
                            hideSplash();
                        }, 200);
                    }
                }
                else {
                    Environment.log("user not logged in");
                    //user not logged in
                    this.appLoaded = true;
                    this.resetBkgColor(true);
                    this.userProfile = null;
                    this.userProfileLoaded = false;
                    AuthService.signOut();
                    hideSplash();
                }
                this.loadRouter();
            }
        });
        UserService.userRoles$.subscribe((userRoles) => {
            if (userRoles && userRoles.uid) {
                this.userRoles = new UserRoles(userRoles);
                DatabaseService.initServices();
            }
            else {
                this.userRoles = null;
            }
        });
        UserService.userSettings$.subscribe((userSettings) => {
            if (userSettings && userSettings.uid) {
                this.userSettings = new UserSettings(userSettings);
                //DatabaseService.initServices();
            }
            else {
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
            await TranslationService.init(Environment.isUdive() ||
                Environment.isDecoplanner() ||
                Environment.isTrasteel()
                ? "en"
                : "it");
            if (Environment.isUdive() || Environment.isDecoplanner()) {
                await UDiveFilterService.init();
            }
            else if (Environment.isTrasteel()) {
                await TrasteelFilterService.init();
            }
            UserService.start();
            DatabaseService.servicesStarted = true;
            DatabaseService.initServices();
            //check email link for user registration
            await AuthService.verifyEmailLink(location.href);
        }
        catch (_a) {
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
            document.documentElement.style.setProperty("--ion-background-color", "#fff");
            document.documentElement.style.setProperty("--ion-text-color", "#000");
        }
        else {
            document.documentElement.style.setProperty("--ion-background-color", "var(" + Environment.getAppSplashColor() + ")");
            document.documentElement.style.setProperty("--ion-text-color", "var(" + Environment.getAppSplashColor() + "-contrast)");
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
                this.navCtrl = await nav.componentOnReady();
                RouterService.init(this.navCtrl);
            }
            else {
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
        }
        else if (Environment.isDecoplanner()) {
            res = UdiveRoutingService.renderDecoplannerRedirectRoutes();
        }
        else if (Environment.isTrasteel()) {
            res = TrasteelRoutingService.renderRedirectRoutes();
        }
        return res;
    }
    renderLoggedInUserRoutes() {
        if (this.userRoles) {
            if (Environment.isUdive()) {
                return UdiveRoutingService.renderUdiveLoggedinUserRoutes();
            }
            else if (Environment.isDecoplanner()) {
                return UdiveRoutingService.renderDecoplannerLoggedinUserRoutes();
            }
            else if (Environment.isTrasteel()) {
                return TrasteelRoutingService.renderLoggedinUserRoutes();
            }
        }
        else {
            return undefined;
        }
    }
    renderAdminRoutes() {
        if (this.userRoles) {
            if (Environment.isUdive()) {
                return UdiveRoutingService.renderUDiveAdminRoutes();
            }
            else if (Environment.isDecoplanner()) {
                return UdiveRoutingService.renderDecoplannerAdminRoutes();
            }
            else if (Environment.isTrasteel()) {
                return TrasteelRoutingService.renderAdminRoutes();
            }
        }
        else {
            return undefined;
        }
    }
    renderCommonRoutes() {
        if (Environment.isUdive()) {
            return UdiveRoutingService.renderUdiveCommonUserRoutes();
        }
        else if (Environment.isDecoplanner()) {
            return UdiveRoutingService.renderDecoplannerCommonUserRoutes();
        }
        else if (Environment.isTrasteel()) {
            return TrasteelRoutingService.renderCommonUserRoutes();
        }
    }
    renderSuperAdminRoutes() {
        if (Environment.isUdive()) {
            return UdiveRoutingService.renderUDiveSuperAdminRoutes();
        }
        else if (Environment.isDecoplanner()) {
            return UdiveRoutingService.renderDecoplannerSuperAdminRoutes();
        }
        else if (Environment.isTrasteel()) {
            return TrasteelRoutingService.renderSuperAdminRoutes();
        }
    }
    darkTheme() {
        // Use matchMedia to check the user preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
        toggleDarkTheme(prefersDark.matches);
        // Listen for changes to the prefers-color-scheme media query
        prefersDark.addListener((mediaQuery) => toggleDarkTheme(mediaQuery.matches));
        // Add or remove the "dark" class based on if the media query matches
        function toggleDarkTheme(shouldAdd) {
            document.body.classList.toggle("dark", shouldAdd);
        }
    }
    render() {
        return (h("ion-app", { key: 'd738f16d65948b44fb1b74e758eac1531d495572', class: "ion-color-" + Environment.getAppColor() }, this.appLoaded ? (h("ion-router", { useHash: false, id: 'app-router', onIonRouteWillChange: (ev) => RouterService.routerChanged(ev) }, 
        /*loggedin user route urls*/
        this.renderLoggedInUserRoutes(), 
        /*admin for diving ceneters, schools, service centers*/
        this.renderAdminRoutes(), 
        /*common route urls*/
        this.renderCommonRoutes(), 
        /*translator route urls*/
        this.userRoles && this.userRoles.isTranslator()
            ? [
                h("ion-route", { url: "/translations", component: 'page-admin-translations' }),
            ]
            : undefined, 
        /* superadmin routes */
        this.renderSuperAdminRoutes(), 
        /* redirect routes */
        this.renderRedirectRoutes())) : undefined, this.appLoaded ? h("app-menu", null) : h("page-loading", null)));
    }
    get el() { return getElement(this); }
};
AppRoot.style = appRootCss;

export { AppRoot as app_root };

//# sourceMappingURL=app-root.entry.js.map