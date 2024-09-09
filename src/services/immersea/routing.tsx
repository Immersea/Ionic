import {h} from "@stencil/core";
import {UserService} from "../common/user";
import {ADMINROUTE} from "../common/router";

export class ImmerseaRouting {
  renderRedirectRoutes() {
    const unmatched = [<ion-route url=":any" component="page-404" />];
    const res = UserService.userProfile
      ? [
          <ion-route-redirect from="/" to="/news" />,
          <ion-route-redirect from="/login" to="/news" />,
        ]
      : [
          <ion-route-redirect from="/" to="/news" />,
          <ion-route-redirect from="/admin" to="/news" />,
          <ion-route-redirect from="/admin/*" to="/news" />,
        ];
    return [...unmatched, ...res];
  }

  renderLoggedinUserRoutes() {
    const ret = [
      <ion-route
        url={"/" + ADMINROUTE + "/user"}
        component="page-user-settings"
      ></ion-route>,
    ];
    return ret;
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
    if (UserService.userRoles.isImmerseaAdmin()) {
      routes.push([
        <ion-route
          url={"/admin/immersea"}
          component="page-immersea-admin"
        ></ion-route>,
      ]);
    }
    return routes;
  }

  renderCommonUserRoutes() {
    return [
      <ion-route url="/page-404" component="page-404"></ion-route>,
      <ion-route component="page-home">
        <ion-route url="/news" component="tab-news">
          <ion-route component="page-news"></ion-route>
        </ion-route>
        <ion-route url="/sea" component="tab-sea">
          <ion-route component="page-sea"></ion-route>
        </ion-route>
        <ion-route url="/culture" component="tab-culture">
          <ion-route component="page-culture"></ion-route>
        </ion-route>
        <ion-route url="/community" component="tab-community">
          <ion-route component="page-community"></ion-route>
        </ion-route>
      </ion-route>,
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
export const ImmerseaRoutingService = new ImmerseaRouting();
