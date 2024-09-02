import {Component, h, State, Element} from "@stencil/core";
import {DivingCenter} from "../../../../../interfaces/udive/diving-center/divingCenter";
import {DivingCentersService} from "../../../../../services/udive/divingCenters";
import {Subscription} from "rxjs";
import {TripSummary} from "../../../../../interfaces/udive/dive-trip/diveTrip";

@Component({
  tag: "page-diving-dashboard",
  styleUrl: "page-diving-dashboard.scss",
})
export class PageDivingDashboard {
  @Element() el: HTMLElement;
  @State() divingCenter: DivingCenter;
  @State() diveTrips: TripSummary;
  dcSubscription: Subscription;
  divingTripsSub: Subscription;
  @State() dcId: string;

  componentWillLoad() {
    this.dcSubscription = DivingCentersService.selectedDivingCenter$.subscribe(
      async (dc) => {
        if (dc && dc.displayName) {
          this.divingCenter = dc;
          this.dcId = DivingCentersService.selectedDivingCenterId;
        }
      }
    );
    this.divingTripsSub =
      DivingCentersService.selectedDivingCenterTrips$.subscribe(
        async (trips) => {
          this.diveTrips = trips;
        }
      );
  }

  async componentDidLoad() {}

  disconnectedCallback() {
    this.dcSubscription.unsubscribe();
    this.divingTripsSub.unsubscribe();
  }

  render() {
    return this.divingCenter
      ? [
          <ion-header>
            <app-navbar
              tag="dashboard"
              text="Dashboard"
              color="divingcenter"
            ></app-navbar>
          </ion-header>,
          <ion-content>
            <app-calendar
              calendarId="diving-dashboard-calendar"
              addEvents={{trips: this.diveTrips}}
            ></app-calendar>
          </ion-content>,
        ]
      : undefined;
  }
}
