import { Component, h, State } from "@stencil/core";
import { ServiceCentersService } from "../../../../../services/udive/serviceCenters";
import { ServiceCenter } from "../../../../../interfaces/udive/service-center/serviceCenter";
import { Subscription } from "rxjs";

@Component({
  tag: "page-service-dashboard",
  styleUrl: "page-service-dashboard.scss",
})
export class PageServiceDashboard {
  @State() serviceCenter: ServiceCenter;
  scSubscription: Subscription;
  scId: string;

  componentWillLoad() {
    this.scSubscription =
      ServiceCentersService.selectedServiceCenter$.subscribe((sc) => {
        if (sc && sc.displayName) {
          this.serviceCenter = sc;
          this.scId = ServiceCentersService.selectedServiceCenterId;
        }
      });
  }

  disconnectedCallback() {
    if (this.scSubscription) this.scSubscription.unsubscribe();
  }

  render() {
    return this.serviceCenter
      ? [
          <ion-header>
            <app-navbar
              tag='dashboard'
              text='Dashboard'
              color='servicecenter'
            ></app-navbar>
          </ion-header>,
          <ion-content>Coming soon!</ion-content>,
        ]
      : undefined;
  }
}
