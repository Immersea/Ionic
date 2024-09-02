import { Component, h } from "@stencil/core";

@Component({
  tag: "page-diving-classes",
  styleUrl: "page-diving-classes.scss",
})
export class PageDivingClasses {
  render() {
    return [
      <app-navbar
        color='divingclass'
        tag='diving-classes'
        text='Diving Classes'
      ></app-navbar>,
      <ion-content>
        <ion-list>
          <app-admin-diving-classes />
        </ion-list>
      </ion-content>,
    ];
  }
}
