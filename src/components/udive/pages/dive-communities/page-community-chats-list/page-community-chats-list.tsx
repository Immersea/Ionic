import { Component, h, State } from "@stencil/core";
import { DiveCommunity } from "../../../../../interfaces/udive/dive-community/diveCommunity";
import { Subscription } from "rxjs";
import {
  DiveCommunitiesService,
  DIVECOMMUNITIESCOLLECTION,
} from "../../../../../services/udive/diveCommunities";
import { ChatService } from "../../../../../services/common/chat";

@Component({
  tag: "page-community-chats-list",
  styleUrl: "page-community-chats-list.scss",
})
export class PageCommunityChatsList {
  @State() diveCommunity: DiveCommunity;
  @State() dcId: string;
  dcSubscription: Subscription;

  componentWillLoad() {
    this.dcSubscription =
      DiveCommunitiesService.selectedDiveCommunity$.subscribe((dc) => {
        if (dc && dc.displayName) {
          this.diveCommunity = dc;
          this.dcId = DiveCommunitiesService.selectedDiveCommunityId;
        }
      });
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
                DIVECOMMUNITIESCOLLECTION,
                this.dcId,
                this.diveCommunity.displayName
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
