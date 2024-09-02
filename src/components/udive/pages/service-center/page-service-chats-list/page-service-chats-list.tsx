import { Component, h, State } from "@stencil/core";
import { Subscription } from "rxjs";
import { ChatService } from "../../../../../services/common/chat";
import {
  ServiceCentersService,
  SERVICECENTERSCOLLECTION,
} from "../../../../../services/udive/serviceCenters";
import { ServiceCenter } from "../../../../../interfaces/udive/service-center/serviceCenter";

@Component({
  tag: "page-service-chats-list",
  styleUrl: "page-service-chats-list.scss",
})
export class PageServiceChatsList {
  @State() serviceCenter: ServiceCenter;
  scSubscription: Subscription;
  scId: string;

  componentWillLoad() {
    this.scSubscription =
      ServiceCentersService.selectedServiceCenter$.subscribe((sc) => {
        if (sc && sc.displayName) {
          this.serviceCenter = sc;
          this.scId = ServiceCentersService.selectedServiceCenterId;
        }
      });
  }

  disconnectedCallback() {
    if (this.scSubscription) this.scSubscription.unsubscribe();
  }

  render() {
    return [
      <ion-header>
        <app-navbar tag='chat' text='Chat' color='chat'></app-navbar>
      </ion-header>,
      <ion-content>
        <ion-fab horizontal='end' vertical='top' slot='fixed' edge>
          <ion-fab-button
            color='chat'
            onClick={() =>
              ChatService.addChat(
                SERVICECENTERSCOLLECTION,
                this.scId,
                this.serviceCenter.displayName
              )
            }
          >
            <ion-icon name='add'></ion-icon>
          </ion-fab-button>
        </ion-fab>
        {this.scId ? (
          <app-admin-chats filterByOrganisierId={this.scId} />
        ) : undefined}
      </ion-content>,
    ];
  }
}
