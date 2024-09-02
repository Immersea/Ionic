import {Component, h, State} from "@stencil/core";
import {DivingSchool} from "../../../../../interfaces/udive/diving-school/divingSchool";
import {DivingSchoolsService} from "../../../../../services/udive/divingSchools";
import {Subscription} from "rxjs";
import {TripSummary} from "../../../../../interfaces/udive/dive-trip/diveTrip";
import {ClassSummary} from "../../../../../interfaces/udive/diving-class/divingClass";

@Component({
  tag: "page-school-dashboard",
  styleUrl: "page-school-dashboard.scss",
})
export class PageSchoolDashboard {
  @State() divingSchool: DivingSchool;
  @State() diveTrips: TripSummary;
  @State() divingClasses: ClassSummary;
  divingSchoolSub: Subscription;
  divingTripsSub: Subscription;
  divingClassesSub: Subscription;

  componentWillLoad() {
    this.divingSchoolSub = DivingSchoolsService.selectedDivingSchool$.subscribe(
      async (ds) => {
        if (ds && ds.displayName) {
          this.divingSchool = ds;
        }
      }
    );
    this.divingTripsSub =
      DivingSchoolsService.selectedDivingSchoolTrips$.subscribe(
        async (trips) => {
          this.diveTrips = trips;
        }
      );
    this.divingClassesSub =
      DivingSchoolsService.selectedDivingSchoolClasses$.subscribe(
        async (classes) => {
          this.divingClasses = classes;
        }
      );
  }

  disconnectedCallback() {
    this.divingSchoolSub.unsubscribe();
    this.divingTripsSub.unsubscribe();
    this.divingClassesSub.unsubscribe();
  }

  render() {
    return this.divingSchool
      ? [
          <ion-header>
            <app-navbar
              tag="dashboard"
              text="Dashboard"
              color="school"
            ></app-navbar>
          </ion-header>,
          <ion-content>
            <app-calendar
              calendarId="school-dashboard-calendar"
              addEvents={{trips: this.diveTrips, classes: this.divingClasses}}
            ></app-calendar>
          </ion-content>,
        ]
      : undefined;
  }
}
