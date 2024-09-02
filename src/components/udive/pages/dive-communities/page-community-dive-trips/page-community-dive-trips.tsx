import { Component, h, State } from "@stencil/core";
import { DiveTripsService } from "../../../../../services/udive/diveTrips";
import { DiveCommunity } from "../../../../../interfaces/udive/dive-community/diveCommunity";
import {
  DiveCommunitiesService,
  DIVECOMMUNITIESCOLLECTION,
} from "../../../../../services/udive/diveCommunities";
import { Subscription } from "rxjs";

@Component({
  tag: "page-community-dive-trips",
  styleUrl: "page-community-dive-trips.scss",
})
export class PageCommunityDiveTrips {
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
      <app-navbar
        color='divetrip'
        tag='dive-trips'
        text='Dive trips'
      ></app-navbar>,
      <ion-content>
        <ion-fab horizontal='end' vertical='top' slot='fixed' edge>
          <ion-fab-button
            color='divetrip'
            onClick={() =>
              DiveTripsService.presentDiveTripUpdate(
                DIVECOMMUNITIESCOLLECTION,
                this.dcId
              )
            }
          >
            <ion-icon name='add'></ion-icon>
          </ion-fab-button>
        </ion-fab>
        <ion-list>
          <app-admin-dive-trips filterByOrganisierId={this.dcId} />
        </ion-list>
      </ion-content>,
    ];
  }
}
