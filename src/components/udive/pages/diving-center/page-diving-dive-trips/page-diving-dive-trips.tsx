import { Component, h, State } from "@stencil/core";
import { DiveTripsService } from "../../../../../services/udive/diveTrips";
import { DivingCenter } from "../../../../../interfaces/udive/diving-center/divingCenter";
import {
  DivingCentersService,
  DIVECENTERSSCOLLECTION,
} from "../../../../../services/udive/divingCenters";
import { Subscription } from "rxjs";

@Component({
  tag: "page-diving-dive-trips",
  styleUrl: "page-diving-dive-trips.scss",
})
export class PageDivingDiveTrips {
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
                DIVECENTERSSCOLLECTION,
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
