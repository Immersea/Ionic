import { Component, h, State } from "@stencil/core";
import { DivingSchoolsService } from "../../../../../services/udive/divingSchools";
import { DivingSchool } from "../../../../../interfaces/udive/diving-school/divingSchool";
import { Subscription } from "rxjs";

@Component({
  tag: "page-school-rentals",
  styleUrl: "page-school-rentals.scss",
})
export class PageSchoolRentals {
  @State() divingSchool: DivingSchool;
  dsSubscription: Subscription;

  componentWillLoad() {
    this.dsSubscription = DivingSchoolsService.selectedDivingSchool$.subscribe(
      (dc) => {
        if (dc && dc.displayName) {
          this.divingSchool = dc;
        }
      }
    );
  }

  disconnectedCallback() {
    this.dsSubscription.unsubscribe();
  }
  render() {
    return this.divingSchool
      ? [
          <ion-header>
            <app-navbar
              tag='rentals'
              text='Rentals'
              color='rentals'
            ></app-navbar>
          </ion-header>,
          <ion-content>Coming soon!</ion-content>,
        ]
      : undefined;
  }
}
