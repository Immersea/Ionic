import { Component, State, h } from "@stencil/core";
import { Environment } from "../../../../../global/env";
import { SystemService } from "../../../../../services/common/system";

@Component({
  tag: "page-loading",
  styleUrl: "page-loading.scss",
})
export class PageLoading {
  @State() network: boolean;

  newUserRegistration = false;

  checkEmailTimer;
  checkingEmail = false;

  componentWillLoad() {
    SystemService.getNetworkStatus().then((networkObservable) => {
      const obs = networkObservable.subscribe((status) => {
        this.network = status;
        setTimeout(() => {
          if (status) obs.unsubscribe();
        });
      });
    });
  }

  render() {
    return [
      <div>
        {false //old logo
          ? [
              <div
                class='loading-logo'
                style={{
                  visibility: "visible",
                }}
              >
                <h1>{Environment.getAppTitle()}</h1>
              </div>,
              <img
                src='assets/css/loader.svg'
                class='loading-svg'
                alt='Loading...'
                style={{ visibility: "visible" }}
              />,
            ]
          : undefined}
        <ion-title class='loading-title ion-text-center' size='large'>
          {Environment.getAppTitle()}
        </ion-title>
        <ion-title class='loading-subtitle ion-text-center' size='small'>
          {Environment.getAppSubTitle()}
        </ion-title>
        <img
          src={"assets/images/" + Environment.getAppLogo()}
          class='loading-svg'
          alt='Loading...'
          style={{ visibility: "visible" }}
        />
        {this.network ? (
          <ion-spinner class='loading-spinner' name='crescent'></ion-spinner>
        ) : (
          [
            <ion-title class='loading-alert ion-text-center' size='large'>
              NETWORK NOT AVAILABLE
            </ion-title>,
            <ion-title class='loading-alert1 ion-text-center' size='large'>
              PLEASE TRY AGAIN LATER
            </ion-title>,
          ]
        )}
      </div>,
    ];
  }
}
