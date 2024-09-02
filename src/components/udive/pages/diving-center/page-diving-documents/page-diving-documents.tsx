import { Component, h, State } from "@stencil/core";
import { DivingCentersService } from "../../../../../services/udive/divingCenters";
import { DivingCenter } from "../../../../../interfaces/udive/diving-center/divingCenter";
import { Subscription } from "rxjs";

@Component({
  tag: "page-diving-documents",
  styleUrl: "page-diving-documents.scss",
})
export class PageDivingDocuments {
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
    return this.divingCenter
      ? [
          <ion-header>
            <app-navbar
              tag='documents'
              text='Documents'
              color='documents'
            ></app-navbar>
          </ion-header>,
          <ion-content>Coming soon!</ion-content>,
        ]
      : undefined;
  }
}
