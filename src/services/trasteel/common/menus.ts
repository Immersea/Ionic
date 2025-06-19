import { ADMINROUTE } from "../../common/router";
import { UserService } from "../../common/user";
import { MenuService } from "../../common/menus";
import { orderBy } from "lodash";
import { TrasteelFilterService } from "./trs-db-filter";
import { CUSTOMERSCOLLECTION } from "../crm/customers";
import { PROJECTSCOLLECTION } from "../refractories/projects";
import { DATASHEETSCOLLECTION } from "../refractories/datasheets";
import { SHAPESCOLLECTION } from "../refractories/shapes";
//import {USERPLANSCOLLECTION} from "../crm/user-plans";

export class MenuController {
  renderMenus(url) {
    if (url[1] === ADMINROUTE && url[2] !== "user") {
      /*const item = DiveCommunitiesService.getDiveCommunityDetails(url[3]);
      //load diving center observable into service
      DiveCommunitiesService.selectDiveCommunityForAdmin(item.id);
      //create related menu
      this.createAdminMenu(url[2], item);
      MenuService.headerColor = "divecommunity";*/
    } else {
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
            iconType:
              TrasteelFilterService.getMapDocs()[CUSTOMERSCOLLECTION].icon.type,
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
            iconType:
              TrasteelFilterService.getMapDocs()[PROJECTSCOLLECTION].icon.type,
            icon: TrasteelFilterService.getMapDocs()[PROJECTSCOLLECTION].icon
              .name,
          },
          {
            tag: "datasheets",
            text: "Data Sheets",
            url: "/" + DATASHEETSCOLLECTION,
            iconType:
              TrasteelFilterService.getMapDocs()[DATASHEETSCOLLECTION].icon
                .type,
            icon: TrasteelFilterService.getMapDocs()[DATASHEETSCOLLECTION].icon
              .name,
          },
          {
            tag: "shapes",
            text: "Shapes",
            url: "/" + SHAPESCOLLECTION,
            iconType:
              TrasteelFilterService.getMapDocs()[SHAPESCOLLECTION].icon.type,
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
            externalUrl:
              "https://trasteel-consumables.web.app/assets/vt/trasteel/index.htm",
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
      if (
        UserService.userRoles &&
        (UserService.userRoles.isSuperAdmin() ||
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
    } else {
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
    }
  }
}
export const TrasteelMenuService = new MenuController();
