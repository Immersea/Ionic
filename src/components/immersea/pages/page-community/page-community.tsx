import { menuController } from "@ionic/core";
import { Component, h } from "@stencil/core";

@Component({
  tag: "page-community",
  styleUrl: "page-community.scss",
})
export class PageCommunity {
  render() {
    return [
      <ion-header translucent={true}>
        <ion-toolbar color='immersea-community'>
          <ion-title>Immersea Community</ion-title>
          <ion-buttons slot='secondary'>
            <ion-button onClick={() => menuController.open("end")}>
              <app-user-avatar size={32}></app-user-avatar>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,
      <ion-content>Community</ion-content>,
    ];
  }
}
