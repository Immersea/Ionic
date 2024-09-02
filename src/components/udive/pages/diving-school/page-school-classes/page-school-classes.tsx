import { Component, h, State } from "@stencil/core";
import {
  DivingSchoolsService,
  DIVESCHOOLSSCOLLECTION,
} from "../../../../../services/udive/divingSchools";
import { DivingSchool } from "../../../../../interfaces/udive/diving-school/divingSchool";
import { Subscription } from "rxjs";
import { DivingClassesService } from "../../../../../services/udive/divingClasses";

@Component({
  tag: "page-school-classes",
  styleUrl: "page-school-classes.scss",
})
export class PageSchoolClasses {
  @State() divingSchool: DivingSchool;
  divingSchoolId: string;
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
    return this.divingSchool
      ? [
          <ion-header>
            <app-navbar
              tag='classes'
              text='Classes'
              color='divingclass'
            ></app-navbar>
          </ion-header>,
          <ion-content>
            <ion-fab horizontal='end' vertical='top' slot='fixed' edge>
              <ion-fab-button
                color='divingclass'
                onClick={() =>
                  DivingClassesService.presentDivingClassUpdate(
                    DIVESCHOOLSSCOLLECTION,
                    this.divingSchoolId
                  )
                }
              >
                <ion-icon name='add'></ion-icon>
              </ion-fab-button>
            </ion-fab>
            <ion-list>
              <app-admin-diving-classes
                filterByOrganisierId={this.divingSchoolId}
              />
            </ion-list>
          </ion-content>,
        ]
      : undefined;
  }
}
