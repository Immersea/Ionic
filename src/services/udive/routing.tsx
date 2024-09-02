import {h} from "@stencil/core";
import {UserService} from "../common/user";
import {ADMINROUTE} from "../common/router";
import {DIVECOMMUNITIESCOLLECTION} from "./diveCommunities";
import {SERVICECENTERSCOLLECTION} from "./serviceCenters";
import {DIVESCHOOLSSCOLLECTION} from "./divingSchools";
import {DIVECENTERSSCOLLECTION} from "./divingCenters";

export class UdiveRouting {
  renderUDiveRedirectRoutes() {
    const unmatched = [<ion-route url=":any" component="page-404" />];
    const res = UserService.userProfile
      ? [
          <ion-route-redirect from="/" to="/dashboard" />,
          <ion-route-redirect from="/login" to="/dashboard" />,
        ]
      : [
          <ion-route-redirect from="/" to="/map" />,
          <ion-route-redirect from="/admin" to="/map" />,
          <ion-route-redirect from="/admin/*" to="/map" />,
          <ion-route-redirect from="/dashboard" to="/map" />,
        ];
    return [...unmatched, ...res];
  }
  renderDecoplannerRedirectRoutes() {
    const unmatched = [<ion-route url=":any" component="page-404" />];
    const res = UserService.userProfile
      ? [
          <ion-route-redirect from="/" to="/deco-planner" />,
          <ion-route-redirect from="/login" to="/deco-planner" />,
        ]
      : [
          <ion-route-redirect from="/" to="/login" />,
          <ion-route-redirect from="/admin" to="/login" />,
          <ion-route-redirect from="/admin/*" to="/login" />,
          <ion-route-redirect from="/deco-planner" to="/login" />,
          <ion-route-redirect from="/deco-planner/*" to="/login" />,
        ];
    return [...unmatched, ...res];
  }
  renderUdiveLoggedinUserRoutes() {
    const ret = [
      <ion-route url="/dashboard" component="page-dashboard"></ion-route>,
      <ion-route url="/divetrips" component="page-dive-trips"></ion-route>,
      <ion-route
        url="/divingclasses"
        component="page-diving-classes"
      ></ion-route>,
      <ion-route url="/chat" component="page-chats-list"></ion-route>,
      <ion-route url="/chat/:chatId" component="page-chat"></ion-route>,
      <ion-route
        url={"/" + ADMINROUTE + "/user"}
        component="page-user-settings"
      ></ion-route>,
    ];
    //Agency admin route
    if (UserService.userRoles.isAgencyAdmin()) {
      ret.push(
        <ion-route
          url={"/" + ADMINROUTE + "/agencies"}
          component="page-admin-agencies"
        ></ion-route>
      );
    }
    return ret;
  }
  renderDecoplannerLoggedinUserRoutes() {
    const ret = [
      <ion-route
        url={"/" + ADMINROUTE + "/user"}
        component="page-user-settings"
      ></ion-route>,
    ];
    //Agency admin route
    if (UserService.userRoles.isAgencyAdmin()) {
      ret.push(
        <ion-route
          url={"/" + ADMINROUTE + "/agencies"}
          component="page-admin-agencies"
        ></ion-route>
      );
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
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECENTERSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/dashboard"
              }
              componentProps={{dcid: itemId}}
              component="page-diving-dashboard"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECENTERSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/customers"
              }
              componentProps={{dcid: itemId}}
              component="page-diving-customers"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECENTERSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/customers/:clientId"
              }
              componentProps={{dcid: itemId}}
              component="page-client-details"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECENTERSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/chat"
              }
              componentProps={{dcid: itemId}}
              component="page-diving-chats-list"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECENTERSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/chat/:chatId"
              }
              componentProps={{dcid: itemId}}
              component="page-chat"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECENTERSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/divetrips"
              }
              componentProps={{dcid: itemId}}
              component="page-diving-dive-trips"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECENTERSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/divetrips/:tripid"
              }
              componentProps={{dcid: itemId}}
              component="page-dive-trip-details"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECENTERSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/rentals"
              }
              componentProps={{dcid: itemId}}
              component="page-diving-rentals"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECENTERSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/warehouse"
              }
              componentProps={{dcid: itemId}}
              component="page-diving-warehouse"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECENTERSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/payments"
              }
              componentProps={{dcid: itemId}}
              component="page-diving-payments"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECENTERSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/invoicing"
              }
              componentProps={{dcid: itemId}}
              component="page-diving-invoicing"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECENTERSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/documents"
              }
              componentProps={{dcid: itemId}}
              component="page-diving-documents"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECENTERSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/reports"
              }
              componentProps={{dcid: itemId}}
              component="page-diving-reports"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECENTERSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/settings"
              }
              componentProps={{dcid: itemId}}
              component="page-diving-center-details"
            ></ion-route>,
          ]);
          break;
        case DIVECOMMUNITIESCOLLECTION:
          routes.push([
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/dashboard"
              }
              componentProps={{dcid: itemId}}
              component="page-community-dashboard"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/members"
              }
              componentProps={{dcid: itemId}}
              component="page-community-members"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/members/:memberId"
              }
              componentProps={{dcid: itemId}}
              component="page-member-details"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/chat"
              }
              componentProps={{dcid: itemId}}
              component="page-community-chats-list"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/chat/:chatId"
              }
              componentProps={{dcid: itemId}}
              component="page-chat"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/divetrips"
              }
              componentProps={{dcid: itemId}}
              component="page-community-dive-trips"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/divetrips/:tripid"
              }
              componentProps={{dcid: itemId}}
              component="page-dive-trip-details"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVECOMMUNITIESCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/settings"
              }
              componentProps={{dcid: itemId}}
              component="page-dive-community-details"
            ></ion-route>,
          ]);
          break;
        case DIVESCHOOLSSCOLLECTION:
          routes.push([
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/dashboard"
              }
              componentProps={{dsid: itemId}}
              component="page-school-dashboard"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/members"
              }
              componentProps={{dsid: itemId}}
              component="page-school-members"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/members/:clientId"
              }
              componentProps={{dsid: itemId}}
              component="page-client-details"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/chat"
              }
              componentProps={{dsid: itemId}}
              component="page-school-chats-list"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/chat/:chatId"
              }
              componentProps={{dsid: itemId}}
              component="page-chat"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/divingclasses"
              }
              componentProps={{dsid: itemId}}
              component="page-school-classes"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/divingclasses/:classid"
              }
              componentProps={{dsid: itemId}}
              component="page-diving-class-details"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/divetrips"
              }
              componentProps={{dsid: itemId}}
              component="page-school-dive-trips"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/divetrips/:tripid"
              }
              componentProps={{dsid: itemId}}
              component="page-dive-trip-details"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/warehouse"
              }
              componentProps={{dsid: itemId}}
              component="page-school-warehouse"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/rentals"
              }
              componentProps={{dsid: itemId}}
              component="page-school-rentals"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                DIVESCHOOLSSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/settings"
              }
              componentProps={{dsid: itemId}}
              component="page-diving-school-details"
            ></ion-route>,
          ]);
          break;
        case SERVICECENTERSCOLLECTION:
          routes.push([
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                SERVICECENTERSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/dashboard"
              }
              componentProps={{centerid: itemId}}
              component="page-service-dashboard"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                SERVICECENTERSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/customers"
              }
              componentProps={{centerid: itemId}}
              component="page-service-customers"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                SERVICECENTERSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/customers/:clientId"
              }
              componentProps={{centerid: itemId}}
              component="page-client-details"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                SERVICECENTERSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/chat"
              }
              componentProps={{centerid: itemId}}
              component="page-service-chats-list"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                SERVICECENTERSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/chat/:chatId"
              }
              componentProps={{centerid: itemId}}
              component="page-chat"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                SERVICECENTERSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/servicing"
              }
              componentProps={{centerid: itemId}}
              component="page-service-servicing"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                SERVICECENTERSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/warehouse"
              }
              componentProps={{centerid: itemId}}
              component="page-service-warehouse"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                SERVICECENTERSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/payments"
              }
              componentProps={{centerid: itemId}}
              component="page-service-payments"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                SERVICECENTERSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/invoicing"
              }
              componentProps={{centerid: itemId}}
              component="page-service-invoicing"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                SERVICECENTERSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/documents"
              }
              componentProps={{centerid: itemId}}
              component="page-service-documents"
            ></ion-route>,
            <ion-route
              url={
                "/" +
                ADMINROUTE +
                "/" +
                SERVICECENTERSCOLLECTION.toLowerCase() +
                "/" +
                itemId +
                "/settings"
              }
              componentProps={{centerid: itemId}}
              component="page-service-center-details"
            ></ion-route>,
          ]);
          break;
      }
    }
    //user administration routes
    if (UserService.userRoles.isUserAdmin()) {
      routes.push([
        <ion-route
          url={"/usermanager"}
          component="page-user-manager"
        ></ion-route>,
      ]);
    }
    return routes;
  }
  renderDecoplannerAdminRoutes() {
    const routes = [];
    //user administration routes
    if (UserService.userRoles.isUserAdmin()) {
      routes.push([
        <ion-route
          url={"/usermanager"}
          component="page-user-manager"
        ></ion-route>,
      ]);
    }
    return routes;
  }
  renderUdiveCommonUserRoutes() {
    return [
      <ion-route url="/page-404" component="page-404"></ion-route>,
      <ion-route url="/map" component="page-map"></ion-route>,
      <ion-route url="/guemap" component="page-gue-map"></ion-route>,
      <ion-route url="/logbook" component="page-log-book"></ion-route>,
      <ion-route url="/deco-planner" component="page-dive-planner"></ion-route>,
      <ion-route url="/gas-blender" component="page-gas-blender"></ion-route>,
      <ion-route
        url="/divetrips/:tripid"
        component="page-dive-trip-details"
      ></ion-route>,
      <ion-route
        url="/divingclasses/:classid"
        component="page-diving-class-details"
      ></ion-route>,
      <ion-route
        url="/divesite/:siteid"
        component="page-dive-site-details"
      ></ion-route>,
      <ion-route
        url="/divingcenter/:dcid"
        component="page-diving-center-details"
      ></ion-route>,
      <ion-route
        url="/divecommunity/:dcid"
        component="page-dive-community-details"
      ></ion-route>,
      <ion-route
        url="/divingschool/:dsid"
        component="page-diving-school-details"
      ></ion-route>,
      <ion-route
        url="/servicecenter/:centerid"
        component="page-service-center-details"
      ></ion-route>,
      <ion-route
        url="/diveplan/:planid/dive/:diveid"
        component="page-dive-plan-details"
      ></ion-route>,
      <ion-route url="/login" component="page-login"></ion-route>,
      <ion-route url="/forgotpsw" component="page-lostpsw"></ion-route>,
      <ion-route url="/support" component="page-support"></ion-route>,
      <ion-route url="/loading" component="page-loading"></ion-route>,
    ];
  }
  renderDecoplannerCommonUserRoutes() {
    return [
      <ion-route url="/page-404" component="page-404"></ion-route>,
      <ion-route url="/deco-planner" component="page-dive-planner"></ion-route>,
      <ion-route url="/gas-blender" component="page-gas-blender"></ion-route>,
      <ion-route url="/login" component="page-login"></ion-route>,
      <ion-route url="/forgotpsw" component="page-lostpsw"></ion-route>,
      <ion-route url="/support" component="page-support"></ion-route>,
      <ion-route url="/loading" component="page-loading"></ion-route>,
      <ion-route url="/logbook" component="page-log-book"></ion-route>,
      <ion-route
        url="/diveplan/:planid/dive/:diveid"
        component="page-dive-plan-details"
      ></ion-route>,
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
export const UdiveRoutingService = new UdiveRouting();
