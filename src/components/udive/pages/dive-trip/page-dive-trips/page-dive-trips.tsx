import { Component, h } from "@stencil/core";
import { DiveTripsService } from "../../../../../services/udive/diveTrips";
import {
  UserService,
  USERPROFILECOLLECTION,
} from "../../../../../services/common/user";

@Component({
  tag: "page-dive-trips",
  styleUrl: "page-dive-trips.scss",
})
export class PageDiveTrips {
  render() {
    return [
      <app-navbar
        color='divetrip'
        tag='dive-trips'
        text='Dive trips'
      ></app-navbar>,
      <ion-content>
        <ion-fab horizontal='end' vertical='top' slot='fixed' edge>
          <ion-fab-button
            color='divetrip'
            onClick={() =>
              DiveTripsService.presentDiveTripUpdate(
                USERPROFILECOLLECTION,
                UserService.userRoles.uid
              )
            }
          >
            <ion-icon name='add'></ion-icon>
          </ion-fab-button>
        </ion-fab>
        <ion-list>
          <app-admin-dive-trips />
        </ion-list>
      </ion-content>,
    ];
  }
}
