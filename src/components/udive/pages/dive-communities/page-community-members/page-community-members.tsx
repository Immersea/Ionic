import { Component, h, State } from "@stencil/core";
import {
  DiveCommunitiesService,
  DIVECOMMUNITIESCOLLECTION,
} from "../../../../../services/udive/diveCommunities";
import { DiveCommunity } from "../../../../../interfaces/udive/dive-community/diveCommunity";
import { Subscription } from "rxjs";
import { Organiser } from "../../../../../interfaces/udive/dive-trip/diveTrip";

@Component({
  tag: "page-community-members",
  styleUrl: "page-community-members.scss",
})
export class PageCommunityMembers {
  @State() diveCommunity: DiveCommunity;
  dcSubscription: Subscription;
  dcId: string;
  admin: Organiser;

  componentWillLoad() {
    this.dcSubscription =
      DiveCommunitiesService.selectedDiveCommunity$.subscribe((dc) => {
        if (dc && dc.displayName) {
          this.diveCommunity = dc;
          this.dcId = DiveCommunitiesService.selectedDiveCommunityId;
          this.admin = {
            collectionId: DIVECOMMUNITIESCOLLECTION,
            id: this.dcId,
          };
        }
      });
  }

  disconnectedCallback() {
    if (this.dcSubscription) this.dcSubscription.unsubscribe();
  }

  render() {
    return this.diveCommunity
      ? [
          <ion-header>
            <app-navbar
              tag='members'
              text='Members'
              color='members'
            ></app-navbar>
          </ion-header>,
          <ion-content>
            <app-admin-clients-list admin={this.admin} />
          </ion-content>,
        ]
      : undefined;
  }
}
