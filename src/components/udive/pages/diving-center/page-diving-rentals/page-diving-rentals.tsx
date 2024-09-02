import { Component, h, State } from "@stencil/core";
import { DivingCenter } from "../../../../../interfaces/udive/diving-center/divingCenter";
import { DivingCentersService } from "../../../../../services/udive/divingCenters";
import { Subscription } from "rxjs";

@Component({
  tag: "page-diving-rentals",
  styleUrl: "page-diving-rentals.scss",
})
export class PageDivingRental {
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
