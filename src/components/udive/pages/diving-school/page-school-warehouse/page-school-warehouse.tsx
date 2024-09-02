import { Component, h, State } from "@stencil/core";
import { DivingSchoolsService } from "../../../../../services/udive/divingSchools";
import { DivingSchool } from "../../../../../interfaces/udive/diving-school/divingSchool";
import { Subscription } from "rxjs";

@Component({
  tag: "page-school-warehouse",
  styleUrl: "page-school-warehouse.scss",
})
export class PageSchoolWarehouse {
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
              tag='warehouse'
              text='Warehouse'
              color='warehouse'
            ></app-navbar>
          </ion-header>,
          <ion-content>Coming soon!</ion-content>,
        ]
      : undefined;
  }
}
