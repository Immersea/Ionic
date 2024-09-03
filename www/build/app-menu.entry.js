import { r as registerInstance, h } from './index-d515af00.js';
import { A as ADMINROUTE, o as DIVECOMMUNITIESCOLLECTION, p as DiveCommunitiesService, c as DIVECENTERSSCOLLECTION, i as DivingCentersService, m as DIVESCHOOLSSCOLLECTION, n as DivingSchoolsService, k as SERVICECENTERSCOLLECTION, l as ServiceCentersService, U as UserService, E as UDiveFilterService, C as CUSTOMERSCOLLECTION, F as TrasteelFilterService, P as PROJECTSCOLLECTION, s as DATASHEETSCOLLECTION, t as SHAPESCOLLECTION, R as RouterService, T as TranslationService } from './utils-ced1e260.js';
import { E as Environment } from './env-c3ad5e77.js';
import './index-be90eba5.js';
import { m as menuController } from './index-f47409f3.js';
import { l as lodash } from './lodash-68d560b6.js';
import { B as Browser } from './index-233fe412.js';
import { a as alertController } from './overlays-b3ceb97d.js';
import { a as isPlatform } from './ionic-global-c07767bf.js';
import './map-fe092362.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
import './index-93ceac82.js';
import './helpers-ff3eb5b3.js';
import './ios.transition-4bc5d5e6.js';
import './md.transition-b118d52a.js';
import './cubic-bezier-acda64df.js';
import './index-493838d0.js';
import './gesture-controller-a0857859.js';
import './config-45217ee2.js';
import './theme-6bada181.js';
import './hardware-back-button-da755485.js';
import './framework-delegate-779ab78c.js';

class MenuController$2 {
    constructor() {
        this.appMenu = [];
        this.url = [];
    }
    resetMenus() {
        this.appMenu = [];
        this.adminMenu = {
            listButtons: [],
        };
    }
    enableMenu(menu) {
        if (menu == "user") {
            menuController.enable(true, "user");
            menuController.enable(false, "admin");
        }
        else {
            menuController.enable(false, "user");
            menuController.enable(true, "admin");
        }
    }
}
const MenuService = new MenuController$2();

class MenuController$1 {
    renderMenus(url) {
        if (url[1] === ADMINROUTE &&
            url[2] === DIVECOMMUNITIESCOLLECTION.toLowerCase()) {
            const item = DiveCommunitiesService.getDiveCommunityDetails(url[3]);
            //load diving center observable into service
            DiveCommunitiesService.selectDiveCommunityForAdmin(item.id);
            //create related menu
            this.createAdminMenu(url[2], item);
            MenuService.headerColor = "divecommunity";
            MenuService.enableMenu("admin");
        }
        else if (url[1] === ADMINROUTE &&
            url[2] === DIVECENTERSSCOLLECTION.toLowerCase()) {
            const item = DivingCentersService.getDivingCenterDetails(url[3]);
            //load diving center observable into service
            DivingCentersService.selectDivingCenterForAdmin(item.id);
            //create related menu
            this.createAdminMenu(url[2], item);
            MenuService.headerColor = "divingcenter";
            MenuService.enableMenu("admin");
        }
        else if (url[1] === ADMINROUTE &&
            url[2] === DIVESCHOOLSSCOLLECTION.toLowerCase()) {
            const item = DivingSchoolsService.getDivingSchoolDetails(url[3]);
            //load diving center observable into service
            DivingSchoolsService.selectDivingSchoolForAdmin(item.id);
            //create related menu
            this.createAdminMenu(url[2], item);
            MenuService.headerColor = "school";
            MenuService.enableMenu("admin");
        }
        else if (url[1] === ADMINROUTE &&
            url[2] === SERVICECENTERSCOLLECTION.toLowerCase()) {
            const item = ServiceCentersService.getServiceCenterDetails(url[3]);
            //load diving center observable into service
            ServiceCentersService.selectServiceCenterForAdmin(item.id);
            //create related menu
            this.createAdminMenu(url[2], item);
            MenuService.headerColor = "servicecenter";
            MenuService.enableMenu("admin");
        }
        else {
            //unsubsrcibe to various observables
            DivingCentersService.unsubscribeDivingCenterForAdmin();
            DivingSchoolsService.unsubscribeDivingSchoolForAdmin();
            ServiceCentersService.unsubscribeServiceCenterForAdmin();
            MenuService.headerColor = Environment.getAppColor();
            MenuService.enableMenu("user");
        }
        this.renderUserMenus();
    }
    renderUserMenus() {
        if (UserService.userProfile && UserService.userProfile.uid) {
            //logged in  user menu
            MenuService.coverItemUser = UserService.userProfile;
            if (Environment.isUdive()) {
                //UDive
                MenuService.appMenu.push({
                    listTitle: {
                        tag: "scuba-diver",
                        text: "Diver",
                    },
                    listButtons: [
                        {
                            tag: "dashboard",
                            text: "Dashboard",
                            url: "/dashboard",
                            iconType: "ionicon",
                            icon: "calendar",
                        },
                        {
                            tag: "map",
                            text: "Map",
                            url: "/map",
                            iconType: "ionicon",
                            icon: "globe",
                        },
                        {
                            tag: "logbook",
                            text: "Logbook",
                            url: "/logbook",
                            iconType: "udiveicon",
                            icon: "udive-icon-diver",
                        },
                        {
                            tag: "dive-trips",
                            text: "Dive Trips",
                            url: "/divetrips",
                            iconType: "ionicon",
                            icon: "boat",
                        },
                        {
                            tag: "diving-classes",
                            text: "Diving Classes",
                            url: "/divingclasses",
                            iconType: "ionicon",
                            icon: "school",
                        },
                        {
                            tag: "deco-planner",
                            text: "Deco Planner",
                            url: "/deco-planner",
                            iconType: "custom",
                            icon: "assets/images/dp4.svg",
                        },
                        {
                            tag: "gas-blender",
                            text: "Gas Blender",
                            url: "/gas-blender",
                            iconType: "udiveicon",
                            icon: "udive-icon-scuba-tank",
                        },
                        {
                            tag: "chat",
                            text: "Chat",
                            url: "/chat",
                            iconType: "ionicon",
                            icon: "chatbubbles",
                        },
                    ],
                });
            }
            else {
                //Decoplanner
                MenuService.appMenu.push({
                    listTitle: {
                        tag: "scuba-diver",
                        text: "Diver",
                    },
                    listButtons: [
                        {
                            tag: "deco-planner",
                            text: "Deco Planner",
                            url: "/deco-planner",
                            iconType: "custom",
                            icon: "assets/images/dp4.svg",
                        },
                        {
                            tag: "logbook",
                            text: "Logbook",
                            url: "/logbook",
                            iconType: "udiveicon",
                            icon: "udive-icon-diver",
                        },
                        {
                            tag: "gas-blender",
                            text: "Gas Blender",
                            url: "/gas-blender",
                            iconType: "udiveicon",
                            icon: "udive-icon-scuba-tank",
                        },
                    ],
                });
            }
            const admin = this.renderUserAdminMenus();
            if (admin) {
                admin.forEach((item) => {
                    MenuService.appMenu.push(item);
                });
            }
            MenuService.appMenu.push({
                listTitle: {
                    tag: "settings",
                    text: "Settings",
                },
                listButtons: [
                    {
                        tag: "settings",
                        text: "Settings",
                        url: "/" + ADMINROUTE + "/user",
                        icon: "cog",
                    },
                    {
                        tag: "support",
                        text: "Support",
                        url: "/support",
                        icon: "help-buoy",
                    },
                ],
            });
            //translation and system menus
            if (UserService.userRoles &&
                (UserService.userRoles.isAgencyAdmin() ||
                    UserService.userRoles.isTranslator())) {
                const systemMenu = {
                    listTitle: {
                        tag: "admin",
                        text: "Administrator",
                    },
                    listButtons: [],
                };
                if (UserService.userRoles.isTranslator()) {
                    systemMenu.listButtons.push({
                        tag: "translations",
                        text: "Translations",
                        url: "/translations",
                        iconType: "ionicon",
                        icon: "language-outline",
                    });
                }
                if (UserService.userRoles.isAgencyAdmin() &&
                    !Environment.isDecoplanner()) {
                    systemMenu.listButtons.push({
                        tag: "diving-agency",
                        text: "Diving Agency",
                        url: "/" + ADMINROUTE + "/agencies",
                        iconType: "ionicon",
                        icon: "library-outline",
                    });
                }
                //user management
                if (UserService.userRoles.isSuperAdmin()) {
                    systemMenu.listButtons.push({
                        tag: "user-manager",
                        text: "User Manager",
                        url: "/usermanager",
                        iconType: "ionicon",
                        icon: "person-outline",
                    });
                }
                MenuService.appMenu.push(systemMenu);
            }
        }
        else {
            //not logged in user
            let listButtons = null;
            if (Environment.isUdive()) {
                //UDive
                listButtons = [
                    {
                        tag: "map",
                        text: "Map",
                        url: "/map",
                        iconType: "ionicon",
                        icon: "globe",
                    },
                    {
                        tag: "deco-planner",
                        text: "Deco Planner",
                        url: "/deco-planner",
                        iconType: "custom",
                        icon: "assets/images/dp4.svg",
                    },
                    {
                        tag: "gas-blender",
                        text: "Gas Blender",
                        url: "/gas-blender",
                        iconType: "udiveicon",
                        icon: "udive-icon-scuba-tank",
                    },
                ];
            }
            else {
                //Decoplanner
                listButtons = [];
            }
            if (listButtons.length > 0)
                MenuService.appMenu.push({
                    listTitle: {
                        tag: "dashboard",
                        text: "Dashboard",
                    },
                    listButtons: listButtons,
                });
            MenuService.appMenu.push({
                listTitle: {
                    tag: "settings",
                    text: "Settings",
                },
                listButtons: [
                    {
                        tag: "login",
                        text: "Login",
                        url: "/login",
                        iconType: "ionicon",
                        icon: "log-in",
                    },
                    {
                        tag: "support",
                        text: "Support",
                        url: "/support",
                        iconType: "ionicon",
                        icon: "help-buoy",
                    },
                ],
            });
        }
    }
    renderUserAdminMenus() {
        if (UserService.userRoles && Environment.isUdive()) {
            const menus = {};
            const icons = UDiveFilterService.getMapDocs();
            for (let itemId in UserService.userRoles.editorOf) {
                const editorOf = UserService.userRoles.editorOf[itemId];
                switch (editorOf.collection) {
                    case DIVECENTERSSCOLLECTION:
                        if (!menus[DIVECENTERSSCOLLECTION]) {
                            menus[DIVECENTERSSCOLLECTION] = {
                                listTitle: {
                                    tag: "diving-center",
                                    text: "Diving Center",
                                },
                                listButtons: [],
                            };
                        }
                        const dc = DivingCentersService.getDivingCenterDetails(itemId);
                        const dcicon = icons[DIVECENTERSSCOLLECTION].icon;
                        if (dc)
                            menus[DIVECENTERSSCOLLECTION].listButtons.push({
                                text: dc.displayName,
                                url: "/" +
                                    ADMINROUTE +
                                    "/" +
                                    DIVECENTERSSCOLLECTION.toLowerCase() +
                                    "/" +
                                    itemId +
                                    "/dashboard",
                                avatar: dc.photoURL ? dc.photoURL : null,
                                iconType: dcicon.type,
                                icon: dcicon.name,
                            });
                        break;
                    case DIVECOMMUNITIESCOLLECTION:
                        if (!menus[DIVECOMMUNITIESCOLLECTION]) {
                            menus[DIVECOMMUNITIESCOLLECTION] = {
                                listTitle: {
                                    tag: "dive-community",
                                    text: "Dive Community",
                                },
                                listButtons: [],
                            };
                        }
                        const dcom = DiveCommunitiesService.getDiveCommunityDetails(itemId);
                        const dcomicon = icons[DIVECOMMUNITIESCOLLECTION].icon;
                        if (dcom)
                            menus[DIVECOMMUNITIESCOLLECTION].listButtons.push({
                                text: dcom.displayName,
                                url: "/" +
                                    ADMINROUTE +
                                    "/" +
                                    DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                                    "/" +
                                    itemId +
                                    "/dashboard",
                                avatar: dcom.photoURL ? dcom.photoURL : null,
                                iconType: dcomicon.type,
                                icon: dcomicon.name,
                            });
                        break;
                    case DIVESCHOOLSSCOLLECTION:
                        if (!menus[DIVESCHOOLSSCOLLECTION]) {
                            menus[DIVESCHOOLSSCOLLECTION] = {
                                listTitle: {
                                    tag: "diving-school",
                                    text: "Diving School",
                                },
                                listButtons: [],
                            };
                        }
                        const ds = DivingSchoolsService.getDivingSchoolDetails(itemId);
                        const dsicon = icons[DIVESCHOOLSSCOLLECTION].icon;
                        if (ds)
                            menus[DIVESCHOOLSSCOLLECTION].listButtons.push({
                                text: ds.displayName,
                                url: "/" +
                                    ADMINROUTE +
                                    "/" +
                                    DIVESCHOOLSSCOLLECTION.toLowerCase() +
                                    "/" +
                                    itemId +
                                    "/dashboard",
                                avatar: ds.photoURL ? ds.photoURL : null,
                                iconType: dsicon.type,
                                icon: dsicon.name,
                            });
                        break;
                    case SERVICECENTERSCOLLECTION:
                        if (!menus[SERVICECENTERSCOLLECTION]) {
                            menus[SERVICECENTERSCOLLECTION] = {
                                listTitle: {
                                    tag: "service-center",
                                    text: "Service Center",
                                },
                                listButtons: [],
                            };
                        }
                        const sc = ServiceCentersService.getServiceCenterDetails(itemId);
                        const scicon = icons[SERVICECENTERSCOLLECTION].icon;
                        if (sc)
                            menus[SERVICECENTERSCOLLECTION].listButtons.push({
                                text: sc.displayName,
                                url: "/" +
                                    ADMINROUTE +
                                    "/" +
                                    SERVICECENTERSCOLLECTION.toLowerCase() +
                                    "/" +
                                    itemId +
                                    "/dashboard",
                                avatar: sc.photoURL ? sc.photoURL : null,
                                iconType: scicon.type,
                                icon: scicon.name,
                            });
                        break;
                }
            }
            const arrayMenu = [];
            Object.keys(menus).forEach((menu) => {
                //order by name
                const orderedMenu = lodash.exports.orderBy(menus[menu].listButtons, "text");
                menus[menu].listButtons = orderedMenu;
                arrayMenu.push(menus[menu]);
            });
            return arrayMenu;
        }
        else {
            return undefined;
        }
    }
    createAdminMenu(type, item) {
        MenuService.coverItemAdmin = item;
        switch (type) {
            case DIVECENTERSSCOLLECTION.toLowerCase():
                MenuService.adminMenu.listButtons = [
                    {
                        tag: "dashboard",
                        text: "Dashboard",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/dashboard",
                        iconType: "ionicon",
                        icon: "calendar",
                    },
                    {
                        tag: "customers",
                        text: "Customers",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/customers",
                        iconType: "ionicon",
                        icon: "people",
                    },
                    {
                        tag: "dive-trips",
                        text: "Dive trips",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/divetrips",
                        iconType: "ionicon",
                        icon: "boat",
                    },
                    {
                        tag: "chat",
                        text: "Chat",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/chat",
                        iconType: "ionicon",
                        icon: "chatbubbles",
                    },
                    {
                        tag: "rental",
                        text: "Rental",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/rentals",
                        iconType: "ionicon",
                        icon: "stopwatch",
                    },
                    {
                        tag: "warehouse",
                        text: "Warehouse",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/warehouse",
                        iconType: "ionicon",
                        icon: "business",
                    },
                    {
                        tag: "payments",
                        text: "Payments",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/payments",
                        iconType: "ionicon",
                        icon: "card",
                    },
                    {
                        tag: "invoicing",
                        text: "Invoicing",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/invoicing",
                        iconType: "ionicon",
                        icon: "wallet",
                    },
                    {
                        tag: "documents",
                        text: "Documents",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/documents",
                        iconType: "ionicon",
                        icon: "file-tray-full-outline",
                    },
                    {
                        tag: "reports",
                        text: "Reports",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/reports",
                        iconType: "ionicon",
                        icon: "analytics",
                    },
                    {
                        tag: "settings",
                        text: "Settings",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/settings",
                        iconType: "ionicon",
                        icon: "settings",
                    },
                ];
                break;
            case DIVECOMMUNITIESCOLLECTION.toLowerCase():
                MenuService.adminMenu.listButtons = [
                    {
                        tag: "dashboard",
                        text: "Dashboard",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/dashboard",
                        icon: "calendar",
                    },
                    {
                        tag: "members",
                        text: "Members",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/members",
                        icon: "people",
                    },
                    {
                        tag: "dive-trips",
                        text: "Dive trips",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/divetrips",
                        icon: "boat",
                    },
                    {
                        tag: "chat",
                        text: "Chat",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/chat",
                        icon: "chatbubbles",
                    },
                    {
                        tag: "settings",
                        text: "Settings",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/settings",
                        icon: "settings",
                    },
                ];
                break;
            case DIVESCHOOLSSCOLLECTION.toLowerCase():
                MenuService.adminMenu.listButtons = [
                    {
                        tag: "dashboard",
                        text: "Dashboard",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/dashboard",
                        icon: "calendar",
                    },
                    {
                        tag: "members",
                        text: "Members",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/members",
                        icon: "people",
                    },
                    {
                        tag: "classes",
                        text: "Classes",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/divingclasses",
                        icon: "school",
                    },
                    {
                        tag: "dive-trips",
                        text: "Dive trips",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/divetrips",
                        icon: "boat",
                    },
                    {
                        tag: "chat",
                        text: "Chat",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/chat",
                        icon: "chatbubbles",
                    },
                    {
                        tag: "warehouse",
                        text: "Warehouse",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/warehouse",
                        icon: "business",
                    },
                    {
                        tag: "rental",
                        text: "Rental",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/rentals",
                        icon: "stopwatch",
                    },
                    {
                        tag: "settings",
                        text: "Settings",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/settings",
                        icon: "settings",
                    },
                ];
                break;
            case SERVICECENTERSCOLLECTION.toLowerCase():
                MenuService.adminMenu.listButtons = [
                    {
                        tag: "dashboard",
                        text: "Dashboard",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/dashboard",
                        icon: "calendar",
                    },
                    {
                        tag: "customers",
                        text: "Customers",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/customers",
                        icon: "people",
                    },
                    {
                        tag: "chat",
                        text: "Chat",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/chat",
                        icon: "chatbubbles",
                    },
                    {
                        tag: "servicing",
                        text: "Servicing",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/servicing",
                        icon: "construct",
                    },
                    {
                        tag: "warehouse",
                        text: "Warehouse",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/warehouse",
                        icon: "business",
                    },
                    {
                        tag: "payments",
                        text: "Payments",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/payments",
                        icon: "card",
                    },
                    {
                        tag: "invoicing",
                        text: "Invoicing",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/invoicing",
                        icon: "wallet",
                    },
                    {
                        tag: "documents",
                        text: "Documents",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/documents",
                        icon: "file-tray-full-outline",
                    },
                    {
                        tag: "settings",
                        text: "Settings",
                        url: "/" + ADMINROUTE + "/" + type + "/" + item.id + "/settings",
                        icon: "settings",
                    },
                ];
                break;
        }
        MenuService.enableMenu("admin");
    }
}
const UDiveMenuService = new MenuController$1();

//import {USERPLANSCOLLECTION} from "../crm/user-plans";
class MenuController {
    renderMenus(url) {
        if (url[1] === ADMINROUTE && url[2] !== "user") {
            /*const item = DiveCommunitiesService.getDiveCommunityDetails(url[3]);
            //load diving center observable into service
            DiveCommunitiesService.selectDiveCommunityForAdmin(item.id);
            //create related menu
            this.createAdminMenu(url[2], item);
            MenuService.headerColor = "divecommunity";*/
        }
        else {
            //unsubsrcibe to various observables
            //DivingCentersService.unsubscribeDivingCenterForAdmin();
            //DivingSchoolsService.unsubscribeDivingSchoolForAdmin();
            //ServiceCentersService.unsubscribeServiceCenterForAdmin();
            this.renderUserMenus();
            MenuService.enableMenu("user");
            MenuService.headerColor = "trasteel";
        }
    }
    renderUserMenus() {
        if (UserService.userProfile && UserService.userProfile.uid) {
            //logged in  user menu
            MenuService.coverItemUser = UserService.userProfile;
            MenuService.appMenu.push({
                listTitle: {
                    tag: "clients",
                    text: "Clients",
                },
                listButtons: [
                    /*{
                      tag: "dashboard",
                      text: "Dashboard",
                      url: "/dashboard",
                      iconType: "ionicon",
                      icon: "calendar",
                    },*/
                    {
                        tag: "customers",
                        text: "Customers",
                        url: "/" + CUSTOMERSCOLLECTION,
                        iconType: TrasteelFilterService.getMapDocs()[CUSTOMERSCOLLECTION].icon.type,
                        icon: TrasteelFilterService.getMapDocs()[CUSTOMERSCOLLECTION].icon
                            .name,
                    } /*
                    {
                      tag: "contacts",
                      text: "Contacts",
                      url: "/" + CONTACTSCOLLECTION,
                      iconType:
                        TrasteelFilterService.getMapDocs()[CONTACTSCOLLECTION].icon.type,
                      icon: TrasteelFilterService.getMapDocs()[CONTACTSCOLLECTION].icon
                        .name,
                    },,
                    {
                      tag: "planofaction",
                      text: "Plan of Actions",
                      url: "/" + USERPLANSCOLLECTION,
                      iconType: "ionicon",
                      icon: "calendar",
                    },*/,
                ],
            });
            MenuService.appMenu.push({
                listTitle: {
                    tag: "refractories",
                    text: "Refractories",
                },
                listButtons: [
                    {
                        tag: "projects",
                        text: "Projects",
                        url: "/" + PROJECTSCOLLECTION,
                        iconType: TrasteelFilterService.getMapDocs()[PROJECTSCOLLECTION].icon.type,
                        icon: TrasteelFilterService.getMapDocs()[PROJECTSCOLLECTION].icon
                            .name,
                    },
                    {
                        tag: "datasheets",
                        text: "Data Sheets",
                        url: "/" + DATASHEETSCOLLECTION,
                        iconType: TrasteelFilterService.getMapDocs()[DATASHEETSCOLLECTION].icon
                            .type,
                        icon: TrasteelFilterService.getMapDocs()[DATASHEETSCOLLECTION].icon
                            .name,
                    },
                    {
                        tag: "shapes",
                        text: "Shapes",
                        url: "/" + SHAPESCOLLECTION,
                        iconType: TrasteelFilterService.getMapDocs()[SHAPESCOLLECTION].icon.type,
                        icon: TrasteelFilterService.getMapDocs()[SHAPESCOLLECTION].icon
                            .name,
                    },
                ],
            });
            MenuService.appMenu.push({
                listTitle: {
                    tag: "marketing",
                    text: "Marketing",
                },
                listButtons: [
                    {
                        tag: "ladle-slide-gate",
                        text: "Ladle Slide Gate",
                        externalUrl: "https://trasteel-consumables.web.app/assets/vt/trasteel/index.htm",
                        iconType: "ionicon",
                        icon: "tablet-portrait",
                    },
                ],
            });
            const admin = this.renderUserAdminMenus();
            if (admin) {
                admin.forEach((item) => {
                    MenuService.appMenu.push(item);
                });
            }
            MenuService.appMenu.push({
                listTitle: {
                    tag: "settings",
                    text: "Settings",
                },
                listButtons: [
                    {
                        tag: "settings",
                        text: "Settings",
                        url: "/" + ADMINROUTE + "/user",
                        icon: "cog",
                    },
                ],
            });
            //translation and system menus
            if (UserService.userRoles &&
                (UserService.userRoles.isSuperAdmin() ||
                    UserService.userRoles.isTranslator())) {
                const systemMenu = {
                    listTitle: {
                        tag: "admin",
                        text: "Administrator",
                    },
                    listButtons: [],
                };
                if (UserService.userRoles.isTranslator()) {
                    systemMenu.listButtons.push({
                        tag: "translations",
                        text: "Translations",
                        url: "/translations",
                        iconType: "ionicon",
                        icon: "language-outline",
                    });
                }
                //user management
                if (UserService.userRoles.isUserAdmin()) {
                    systemMenu.listButtons.push({
                        tag: "user-manager",
                        text: "User Manager",
                        url: "/usermanager",
                        iconType: "ionicon",
                        icon: "person-outline",
                    });
                    systemMenu.listButtons.push({
                        tag: "team-manager",
                        text: "Team Manager",
                        url: "/teammanager",
                        iconType: "ionicon",
                        icon: "people-outline",
                    });
                }
                MenuService.appMenu.push(systemMenu);
            }
        }
        else {
            //not logged in user
            MenuService.appMenu.push({
                listTitle: {
                    tag: "settings",
                    text: "Settings",
                },
                listButtons: [
                    {
                        tag: "login",
                        text: "Login",
                        url: "/login",
                        iconType: "ionicon",
                        icon: "log-in",
                    },
                ],
            });
        }
    }
    renderUserAdminMenus() {
        if (UserService.userRoles) {
            const menus = {};
            //const icons = TrasteelFilterService.getMapDocs();
            for (let itemId in UserService.userRoles.editorOf) {
                const editorOf = UserService.userRoles.editorOf[itemId];
                switch (editorOf.collection) {
                }
            }
            const arrayMenu = [];
            Object.keys(menus).forEach((menu) => {
                //order by name
                const orderedMenu = lodash.exports.orderBy(menus[menu].listButtons, "text");
                menus[menu].listButtons = orderedMenu;
                arrayMenu.push(menus[menu]);
            });
            return arrayMenu;
        }
        else {
            return undefined;
        }
    }
    createAdminMenu(type, item) {
        MenuService.coverItemAdmin = item;
        switch (type) {
        }
        MenuService.enableMenu("admin");
    }
}
const TrasteelMenuService = new MenuController();

const appMenuCss = "app-menu .cover{height:20%}app-menu .logo{padding-left:10px;height:50px}app-menu .right-menu{--min-width:300px;--width:50%}";

const AppMenu = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.userRoles = undefined;
        this.selectedMenu = undefined;
        this.appMenu = [];
        this.url = [];
        this.coverItemUser = undefined;
        this.coverItemAdmin = undefined;
        this.adminMenu = undefined;
        this.headerColor = undefined;
        this.showMenu = true;
    }
    componentWillLoad() {
        UserService.userRoles$.subscribe((roles) => {
            this.userRoles = roles;
            this.renderMenus();
        });
        //get page url and render menu accordingly
        RouterService.routerSub$.subscribe((to) => {
            this.url = to;
            this.renderMenus();
        });
    }
    renderMenus() {
        this.showMenu = "lg"; //if true shows always the menu without auto-hide
        //update selected menu for highlight
        this.selectedMenu = lodash.exports.isArray(this.url) ? this.url.join("/") : this.url;
        //create menu for admin
        MenuService.resetMenus();
        if (Environment.isUdive() || Environment.isDecoplanner()) {
            //UDIVE - DECOPLANNER
            UDiveMenuService.renderMenus(this.url);
        }
        else if (Environment.isTrasteel()) {
            //TRASTEEL
            TrasteelMenuService.renderMenus(this.url);
        }
        this.appMenu = MenuService.appMenu;
        this.coverItemUser = MenuService.coverItemUser;
        this.coverItemAdmin = MenuService.coverItemAdmin;
        this.adminMenu = MenuService.adminMenu;
        this.headerColor = MenuService.headerColor;
    }
    async itemSelect(item) {
        if (item.url) {
            RouterService.push(item.url, "forward");
        }
        else if (item.externalUrl) {
            const alert = await alertController.create({
                header: TranslationService.getTransl(item.tag, item.text),
                message: TranslationService.getTransl("open-new-window", "The page will be opened in a new window"),
                buttons: [
                    {
                        text: TranslationService.getTransl("cancel", "Cancel"),
                        role: "cancel",
                    },
                    {
                        text: TranslationService.getTransl("ok", "OK"),
                        handler: async () => {
                            await Browser.open({ url: item.externalUrl });
                        },
                    },
                ],
            });
            alert.present();
        }
    }
    render() {
        return (h("ion-split-pane", { key: 'dcc27e39063581b59d0a1db17f07d221e6720ea9', "content-id": 'menu-content', when: this.showMenu }, h("ion-menu", { key: 'c8e1ccc6f501464ddca94d058e5a72fb4cb6ea36', "content-id": 'menu-content', menuId: 'user' }, h("ion-header", { key: '23ae6bc452c170b2a7a3561e31c02c4fcdf51f3e' }, h("ion-toolbar", { key: '6e9d49826ff8e329104b7722c0426c2f9dae3b1a', color: this.headerColor }, h("img", { key: '46f103d22be618f2d88dc66538815c587fa99ac1', slot: 'start', class: 'logo', src: "assets/images/" + Environment.getAppLogo() }), h("ion-title", { key: '393d46241a4a3e64eef8226df2c47eeaca7a88b7' }, Environment.getAppTitle()), Environment.getAppSubTitle() && !isPlatform("ios") ? (h("ion-title", { size: 'small' }, Environment.getAppSubTitle())) : undefined)), h("ion-content", { key: 'b2016c62f8e620482845fcf1ac08fb94b5c09447', forceOverscroll: false }, this.userRoles ? (h("app-user-cover", { showUserDetails: false, class: 'cover' })) : undefined, this.appMenu.map((list) => (h("ion-list", null, h("ion-list-header", null, h("my-transl", { tag: list.listTitle.tag, text: list.listTitle.text, isLabel: true })), list.listButtons.map((p) => !p.adminOnly ||
            (p.adminOnly && UserService.userRoles.isAdmin()) ? (h("ion-menu-toggle", { autoHide: false }, h("ion-item", { button: true, onClick: () => this.itemSelect(p), detail: false, color: this.selectedMenu == p.url ? this.headerColor : "" }, p.avatar ? (h("ion-avatar", { slot: 'start' }, h("img", { src: p.avatar }))) : p.iconType && p.iconType !== "ionicon" ? (p.iconType == "custom" ? (h("ion-icon", { slot: 'start', src: p.icon })) : (h("ion-icon", { slot: 'start', class: p.iconType == "mapicon"
                ? "map-icon " + p.icon
                : p.iconType == "udiveicon"
                    ? "udive-icon " + p.icon
                    : undefined }))) : (h("ion-icon", { slot: 'start', name: p.icon })), h("ion-label", null, h("my-transl", { tag: p.tag ? p.tag : null, text: p.text }))))) : undefined))))), h("ion-footer", { key: 'efa749680a9c3aef6f5ebe8cbdf64fb8bddecee7' }, h("ion-title", { key: '16ba9e68ad04d6ff0552b5aab392dd5d9464e48a', size: 'small' }, "version: " + Environment.getAppVersion()))), h("ion-menu", { key: 'd2b86054389bf6501dad45c86a8595aebdffb49f', "content-id": 'menu-content', menuId: 'admin' }, this.adminMenu
            ? [
                h("ion-header", null, h("ion-toolbar", { color: this.headerColor }, h("ion-title", null, this.coverItemAdmin
                    ? this.coverItemAdmin.displayName
                    : undefined), h("ion-buttons", { slot: 'start' }, h("ion-button", { fill: 'clear', href: '/' }, h("ion-icon", { name: 'arrow-back-outline' }))))),
                h("ion-content", { forceOverscroll: false }, this.coverItemAdmin &&
                    (this.coverItemAdmin.coverURL ||
                        this.coverItemAdmin.photoURL) ? (h("app-item-cover", { item: this.coverItemAdmin, class: 'cover' })) : undefined, h("ion-list", null, this.adminMenu.listButtons.map((p) => !p.adminOnly ||
                    (p.adminOnly && UserService.userRoles.isAdmin()) ? (h("ion-menu-toggle", { autoHide: false }, h("ion-item", { button: true, onClick: () => this.itemSelect(p), detail: false, color: this.selectedMenu == p.url ? this.headerColor : "" }, p.avatar ? (h("ion-avatar", { slot: 'start' }, h("img", { src: p.avatar }))) : p.iconType && p.iconType !== "ionicon" ? (p.iconType == "custom" ? (h("ion-icon", { slot: 'start', src: p.icon })) : (h("ion-icon", { slot: 'start', class: p.iconType == "mapicon"
                        ? "map-icon " + p.icon
                        : p.iconType == "udiveicon"
                            ? "udive-icon " + p.icon
                            : undefined }))) : (h("ion-icon", { slot: 'start', name: p.icon })), h("ion-label", null, h("my-transl", { tag: p.tag ? p.tag : null, text: p.text }))))) : undefined))),
                h("ion-footer", null, h("ion-title", { size: 'small' }, "version: " + Environment.getAppVersion())),
            ]
            : undefined), h("ion-router-outlet", { key: '87594e9fd4fe18c62a54a33cbea80bf94998fb83', animated: true, id: 'menu-content' })));
    }
};
AppMenu.style = appMenuCss;

export { AppMenu as app_menu };

//# sourceMappingURL=app-menu.entry.js.map