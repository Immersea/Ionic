import { Component, h, State } from "@stencil/core";
import { ServiceCentersService } from "../../../../../services/udive/serviceCenters";
import { ServiceCenter } from "../../../../../interfaces/udive/service-center/serviceCenter";
import { Subscription } from "rxjs";

@Component({
  tag: "page-service-documents",
  styleUrl: "page-service-documents.scss",
})
export class PageServiceDocuments {
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
