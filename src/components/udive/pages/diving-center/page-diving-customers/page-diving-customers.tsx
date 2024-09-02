import { Component, h, State } from "@stencil/core";
import {
  DivingCentersService,
  DIVECENTERSSCOLLECTION,
} from "../../../../../services/udive/divingCenters";
import { DivingCenter } from "../../../../../interfaces/udive/diving-center/divingCenter";
import { Subscription } from "rxjs";
import { Organiser } from "../../../../../interfaces/udive/dive-trip/diveTrip";

@Component({
  tag: "page-diving-customers",
  styleUrl: "page-diving-customers.scss",
})
export class PageDivingCustomers {
  @State() divingCenter: DivingCenter;
  dcSubscription: Subscription;
  dcId: string;
  admin: Organiser;

  componentWillLoad() {
    this.dcSubscription = DivingCentersService.selectedDivingCenter$.subscribe(
      (dc) => {
        if (dc && dc.displayName) {
          this.divingCenter = dc;
          this.dcId = DivingCentersService.selectedDivingCenterId;
          this.admin = {
            collectionId: DIVECENTERSSCOLLECTION,
            id: this.dcId,
          };
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
              tag='customers'
              text='Customers'
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
