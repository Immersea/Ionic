import { Component, h, State } from "@stencil/core";
import { ServiceCentersService } from "../../../../../services/udive/serviceCenters";
import { ServiceCenter } from "../../../../../interfaces/udive/service-center/serviceCenter";
import { Subscription } from "rxjs";

@Component({
  tag: "page-service-warehouse",
  styleUrl: "page-service-warehouse.scss",
})
export class PageServiceWarehouse {
  @State() serviceCenter: ServiceCenter;
  scSubscription: Subscription;
  scId: string;

  componentWillLoad() {
    this.scSubscription = ServiceCentersService.selectedServiceCenter$.subscribe(
      (sc) => {
        if (sc && sc.displayName) {
          this.serviceCenter = sc;
          this.scId = ServiceCentersService.selectedServiceCenterId;
        }
      }
    );
  }

  render() {
    return this.serviceCenter
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
