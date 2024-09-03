import { ADMINROUTE } from "../common/router";
import { DIVECENTERSSCOLLECTION, DivingCentersService } from "./divingCenters";
import { DivingSchoolsService, DIVESCHOOLSSCOLLECTION } from "./divingSchools";
import {
  SERVICECENTERSCOLLECTION,
  ServiceCentersService,
} from "./serviceCenters";
import { UserService } from "../common/user";
import { MenuService } from "../common/menus";
import { UDiveFilterService } from "./ud-db-filter";
import {
  DIVECOMMUNITIESCOLLECTION,
  DiveCommunitiesService,
} from "./diveCommunities";
import { Environment } from "../../global/env";
import { orderBy } from "lodash";

export class MenuController {
  renderMenus(url) {
    if (
      url[1] === ADMINROUTE &&
      url[2] === DIVECOMMUNITIESCOLLECTION.toLowerCase()
    ) {
      const item = DiveCommunitiesService.getDiveCommunityDetails(url[3]);
      //load diving center observable into service
      DiveCommunitiesService.selectDiveCommunityForAdmin(item.id);
      //create related menu
      this.createAdminMenu(url[2], item);
      MenuService.headerColor = "divecommunity";
      MenuService.enableMenu("admin");
    } else if (
      url[1] === ADMINROUTE &&
      url[2] === DIVECENTERSSCOLLECTION.toLowerCase()
    ) {
      const item = DivingCentersService.getDivingCenterDetails(url[3]);
      //load diving center observable into service
      DivingCentersService.selectDivingCenterForAdmin(item.id);
      //create related menu
      this.createAdminMenu(url[2], item);
      MenuService.headerColor = "divingcenter";
      MenuService.enableMenu("admin");
    } else if (
      url[1] === ADMINROUTE &&
      url[2] === DIVESCHOOLSSCOLLECTION.toLowerCase()
    ) {
      const item = DivingSchoolsService.getDivingSchoolDetails(url[3]);
      //load diving center observable into service
      DivingSchoolsService.selectDivingSchoolForAdmin(item.id);
      //create related menu
      this.createAdminMenu(url[2], item);
      MenuService.headerColor = "school";
      MenuService.enableMenu("admin");
    } else if (
      url[1] === ADMINROUTE &&
      url[2] === SERVICECENTERSCOLLECTION.toLowerCase()
    ) {
      const item = ServiceCentersService.getServiceCenterDetails(url[3]);
      //load diving center observable into service
      ServiceCentersService.selectServiceCenterForAdmin(item.id);
      //create related menu
      this.createAdminMenu(url[2], item);
      MenuService.headerColor = "servicecenter";
      MenuService.enableMenu("admin");
    } else {
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
      } else {
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
      if (
        UserService.userRoles &&
        (UserService.userRoles.isAgencyAdmin() ||
          UserService.userRoles.isTranslator())
      ) {
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
        if (
          UserService.userRoles.isAgencyAdmin() &&
          !Environment.isDecoplanner()
        ) {
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
    } else {
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
      } else {
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
                url:
                  "/" +
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
                url:
                  "/" +
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
                url:
                  "/" +
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
                url:
                  "/" +
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
        const orderedMenu = orderBy(menus[menu].listButtons, "text");
        menus[menu].listButtons = orderedMenu;
        arrayMenu.push(menus[menu]);
      });
      return arrayMenu;
    } else {
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
            url:
              "/" + ADMINROUTE + "/" + type + "/" + item.id + "/divingclasses",
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
export const UDiveMenuService = new MenuController();
