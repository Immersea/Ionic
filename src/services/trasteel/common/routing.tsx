import {h} from "@stencil/core";
import {UserService} from "../../common/user";
import {ADMINROUTE} from "../../common/router";
import {CUSTOMERSCOLLECTION} from "../crm/customers";
import {DATASHEETSCOLLECTION} from "../refractories/datasheets";
import {PROJECTSCOLLECTION} from "../refractories/projects";
import {SHAPESCOLLECTION} from "../refractories/shapes";
import {CONTACTSCOLLECTION} from "../crm/contacts";
//import {USERPLANSCOLLECTION} from "../crm/user-plans";
import {TrasteelService} from "./services";

export class TrasteelRouting {
  renderRedirectRoutes() {
    const unmatched = [<ion-route url=":any" component="page-404" />];
    const res = UserService.userProfile
      ? [
          <ion-route-redirect from="/" to={"/" + CUSTOMERSCOLLECTION} />,
          <ion-route-redirect from="/login" to={"/" + CUSTOMERSCOLLECTION} />,
        ]
      : [<ion-route-redirect from="/" to="/login" />];
    return [...unmatched, ...res];
  }

  renderAdminRoutes() {
    const routes = [];
    for (let itemId in UserService.userRoles.editorOf) {
      const editorOf = UserService.userRoles.editorOf[itemId];
      switch (
        editorOf.collection
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
        <ion-route
          url={"/translations"}
          component="page-admin-translations"
        ></ion-route>,
      ]);
    }
    //set administration routes
    if (UserService.userRoles.isUserAdmin()) {
      routes.push([
        <ion-route
          url={"/usermanager"}
          component="page-user-manager"
        ></ion-route>,
        <ion-route
          url={"/teammanager"}
          component="page-team-manager"
        ></ion-route>,
      ]);
    }
    return routes;
  }

  renderLoggedinUserRoutes() {
    const ret = [
      <ion-route
        url={"/" + ADMINROUTE + "/user"}
        component="page-trs-user-settings"
      ></ion-route>,
      <ion-route url="/dashboard" component="page-trs-dashboard"></ion-route>,
      <ion-route
        url={"/" + CONTACTSCOLLECTION}
        component="page-contacts"
      ></ion-route>,
      <ion-route
        url={"/" + CONTACTSCOLLECTION + "/:itemId"}
        component="page-contact-details"
      ></ion-route>,
      <ion-route
        url={"/" + CUSTOMERSCOLLECTION}
        component="page-customers"
      ></ion-route>,
      <ion-route
        url={"/" + CUSTOMERSCOLLECTION + "/:itemId"}
        component="page-customer-details"
      ></ion-route>,
      /*<ion-route
        url={"/" + USERPLANSCOLLECTION}
        component="page-user-plans"
      ></ion-route>,
      <ion-route
        url={"/" + USERPLANSCOLLECTION + "/details/:itemId"}
        component="page-user-plans-details"
      ></ion-route>,*/
      <ion-route
        url={"/" + DATASHEETSCOLLECTION}
        component="page-datasheets"
      ></ion-route>,
      <ion-route
        url={"/" + DATASHEETSCOLLECTION + "/:itemId"}
        component="page-datasheet-details"
      ></ion-route>,
      <ion-route
        url={"/" + PROJECTSCOLLECTION}
        component="page-projects"
      ></ion-route>,
      <ion-route
        url={"/" + PROJECTSCOLLECTION + "/:itemId"}
        component="page-project-details"
      ></ion-route>,
      <ion-route
        url={"/" + SHAPESCOLLECTION}
        component="page-shapes"
      ></ion-route>,
      <ion-route
        url={"/" + SHAPESCOLLECTION + "/:itemId"}
        component="page-shape-details"
      ></ion-route>,
    ];
    return ret;
  }
  renderCommonUserRoutes() {
    return [
      <ion-route url="/page-404" component="page-404"></ion-route>,
      <ion-route url="/login" component="page-login"></ion-route>,
      <ion-route url="/forgotpsw" component="page-lostpsw"></ion-route>,
      <ion-route url="/loading" component="page-loading"></ion-route>,
    ];
  }

  renderSuperAdminRoutes() {
    /*translator route urls*/
    return UserService.userRoles && UserService.userRoles.isSuperAdmin()
      ? []
      : undefined;
  }
}
export const TrasteelRoutingService = new TrasteelRouting();
