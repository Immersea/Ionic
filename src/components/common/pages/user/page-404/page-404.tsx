import {Component, h} from "@stencil/core";
import {Environment} from "../../../../../global/env";
import {RouterService} from "../../../../../services/common/router";

@Component({
  tag: "page-404",
  styleUrl: "page-404.scss",
})
export class Page404 {
  render() {
    return [
      <app-navbar color={Environment.getAppColor()} tag="404" text="404" />,
      <ion-content>
        <img class="logo" src={"./assets/images/" + Environment.getAppLogo()} />
        <ion-item lines="none">
          <ion-label>
            <h1>Page Not Found</h1>
          </ion-label>
        </ion-item>
        <ion-item lines="none">
          <ion-label>
            <p>
              The page you are looking for might have been removed, had its name
              changed, or is temporarily unavailable.
            </p>
          </ion-label>
        </ion-item>
        <ion-item
          lines="none"
          button
          onClick={() => RouterService.push("/", "root")}
        >
          <ion-label>
            <a>Go to Home Page</a>
          </ion-label>
        </ion-item>
      </ion-content>,
    ];
  }
}
