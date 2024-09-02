import { Component, h, State } from "@stencil/core";
import { DiveTripsService } from "../../../../../services/udive/diveTrips";
import {
  DivingSchoolsService,
  DIVESCHOOLSSCOLLECTION,
} from "../../../../../services/udive/divingSchools";
import { DivingSchool } from "../../../../../interfaces/udive/diving-school/divingSchool";
import { Subscription } from "rxjs";

@Component({
  tag: "page-school-dive-trips",
  styleUrl: "page-school-dive-trips.scss",
})
export class PageSchoolDiveTrips {
  @State() divingSchool: DivingSchool;
  @State() divingSchoolId: string;
  dsSubscription: Subscription;

  componentWillLoad() {
    this.dsSubscription = DivingSchoolsService.selectedDivingSchool$.subscribe(
      (dc) => {
        if (dc && dc.displayName) {
          this.divingSchool = dc;
          this.divingSchoolId = DivingSchoolsService.selectedDivingSchoolId;
        }
      }
    );
  }

  disconnectedCallback() {
    this.dsSubscription.unsubscribe();
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
                DIVESCHOOLSSCOLLECTION,
                this.divingSchoolId
              )
            }
          >
            <ion-icon name='add'></ion-icon>
          </ion-fab-button>
        </ion-fab>
        <ion-list>
          <app-admin-dive-trips filterByOrganisierId={this.divingSchoolId} />
        </ion-list>
      </ion-content>,
    ];
  }
}
