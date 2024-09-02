import { Component, h, State } from "@stencil/core";
import {
  DivingSchoolsService,
  DIVESCHOOLSSCOLLECTION,
} from "../../../../../services/udive/divingSchools";
import { DivingSchool } from "../../../../../interfaces/udive/diving-school/divingSchool";
import { Subscription } from "rxjs";
import { Organiser } from "../../../../../interfaces/udive/dive-trip/diveTrip";

@Component({
  tag: "page-school-members",
  styleUrl: "page-school-members.scss",
})
export class PageSchoolMembers {
  @State() divingSchool: DivingSchool;
  dsSubscription: Subscription;
  dsId: string;
  admin: Organiser;

  componentWillLoad() {
    this.dsSubscription = DivingSchoolsService.selectedDivingSchool$.subscribe(
      (dc) => {
        if (dc && dc.displayName) {
          this.divingSchool = dc;
          this.dsId = DivingSchoolsService.selectedDivingSchoolId;
          this.admin = {
            collectionId: DIVESCHOOLSSCOLLECTION,
            id: this.dsId,
          };
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
              tag='members'
              text='Members'
              color='clients'
            ></app-navbar>
          </ion-header>,
          <ion-content>
            <app-admin-clients-list admin={this.admin} />
          </ion-content>,
        ]
      : undefined;
  }
}
