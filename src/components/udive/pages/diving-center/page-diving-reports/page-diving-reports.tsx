import { Component, h, State } from "@stencil/core";
import { DivingCenter } from "../../../../../interfaces/udive/diving-center/divingCenter";
import { DivingCentersService } from "../../../../../services/udive/divingCenters";
import { Subscription } from "rxjs";

@Component({
  tag: "page-diving-reports",
  styleUrl: "page-diving-reports.scss",
})
export class PageDivingReports {
  @State() divingCenter: DivingCenter;
  dcSubscription: Subscription;
  @State() dcId: string;

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
    return this.divingCenter
      ? [
          <ion-header>
            <app-navbar
              tag='reports'
              text='Reports'
              color='documents'
            ></app-navbar>
          </ion-header>,
          <ion-content>Coming soon!</ion-content>,
        ]
      : undefined;
  }
}
