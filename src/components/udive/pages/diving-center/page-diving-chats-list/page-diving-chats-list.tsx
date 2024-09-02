import { Component, h, State } from "@stencil/core";
import { DivingCenter } from "../../../../../interfaces/udive/diving-center/divingCenter";
import { Subscription } from "rxjs";
import {
  DivingCentersService,
  DIVECENTERSSCOLLECTION,
} from "../../../../../services/udive/divingCenters";
import { ChatService } from "../../../../../services/common/chat";

@Component({
  tag: "page-diving-chats-list",
  styleUrl: "page-diving-chats-list.scss",
})
export class PageDivingChatsList {
  @State() divingCenter: DivingCenter;
  @State() dcId: string;
  dcSubscription: Subscription;

  componentWillLoad() {
    this.dcSubscription = DivingCentersService.selectedDivingCenter$.subscribe(
      (dc) => {
        if (dc && dc.displayName) {
          this.divingCenter = dc;
          this.dcId = DivingCentersService.selectedDivingCenterId;
        }
      }
    );
  }

  disconnectedCallback() {
    if (this.dcSubscription) this.dcSubscription.unsubscribe();
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
                DIVECENTERSSCOLLECTION,
                this.dcId,
                this.divingCenter.displayName
              )
            }
          >
            <ion-icon name='add'></ion-icon>
          </ion-fab-button>
        </ion-fab>
        {this.dcId ? (
          <app-admin-chats filterByOrganisierId={this.dcId} />
        ) : undefined}
      </ion-content>,
    ];
  }
}
