import {Component, h, State} from "@stencil/core";
import {DiveCommunity} from "../../../../../interfaces/udive/dive-community/diveCommunity";
import {DiveCommunitiesService} from "../../../../../services/udive/diveCommunities";
import {Subscription} from "rxjs";
import {TripSummary} from "../../../../../interfaces/udive/dive-trip/diveTrip";

@Component({
  tag: "page-community-dashboard",
  styleUrl: "page-community-dashboard.scss",
})
export class PageCommunityDashboard {
  @State() diveCommunity: DiveCommunity;
  @State() diveTrips: TripSummary;
  dcSubscription: Subscription;
  divingTripsSub: Subscription;
  @State() dcId: string;

  componentWillLoad() {
    this.dcSubscription =
      DiveCommunitiesService.selectedDiveCommunity$.subscribe(async (dc) => {
        if (dc && dc.displayName) {
          this.diveCommunity = dc;
          this.dcId = DiveCommunitiesService.selectedDiveCommunityId;
        }
      });
    this.divingTripsSub =
      DiveCommunitiesService.selectedDiveCommunityTrips$.subscribe(
        async (trips) => {
          this.diveTrips = trips;
        }
      );
  }

  disconnectedCallback() {
    this.dcSubscription.unsubscribe();
    this.divingTripsSub.unsubscribe();
  }

  render() {
    return this.diveCommunity
      ? [
          <ion-header>
            <app-navbar
              tag="dashboard"
              text="Dashboard"
              color="divecommunity"
            ></app-navbar>
          </ion-header>,
          <ion-content>
            <app-calendar
              calendarId="community-dashboard-calendar"
              addEvents={{trips: this.diveTrips}}
            ></app-calendar>
          </ion-content>,
        ]
      : undefined;
  }
}
