import { Component, h, Prop, State } from "@stencil/core";
import {
  DIVESCHOOLSSCOLLECTION,
  DivingSchoolsService,
} from "../../../../../services/udive/divingSchools";
import {
  DIVECENTERSSCOLLECTION,
  DivingCentersService,
} from "../../../../../services/udive/divingCenters";
import { Subscription } from "rxjs";
import { MapDataUserPubicProfile } from "../../../../../interfaces/common/user/user-public-profile";
import { UserService } from "../../../../../services/common/user";
import { TranslationService } from "../../../../../services/common/translations";
import { ADMINROUTE } from "../../../../../services/common/router";
import {
  SERVICECENTERSCOLLECTION,
  ServiceCentersService,
} from "../../../../../services/udive/serviceCenters";
import { Organiser } from "../../../../../interfaces/udive/dive-trip/diveTrip";
import { Clients } from "../../../../../interfaces/udive/clients/clients";
import { orderBy } from "lodash";

@Component({
  tag: "app-admin-clients-list",
  styleUrl: "app-admin-clients-list.scss",
})
export class AppAdminClientsList {
  @Prop() admin: Organiser;
  clients: Clients;
  clientsList: MapDataUserPubicProfile[];

  @State() clientsFilteredList: MapDataUserPubicProfile[];
  clientsSub: Subscription;
  filter: string;
  customersUrl: string;
  type: string;
  id: string;

  async filterClients(ev) {
    this.filter = ev ? (ev.target ? ev.target.value : ev) : null;
    if (this.filter) {
      this.clientsFilteredList = this.clientsList.filter((client) =>
        client.displayName.toLowerCase().includes(this.filter.toLowerCase())
      );
    } else {
      this.clientsFilteredList = this.clientsList;
    }
  }
  async componentWillLoad() {
    let sub = null;
    switch (this.admin.collectionId) {
      case DIVESCHOOLSSCOLLECTION:
        sub = DivingSchoolsService.selectedDivingSchoolClients$;
        this.type = DIVESCHOOLSSCOLLECTION.toLowerCase();
        this.id = DivingSchoolsService.selectedDivingSchoolId;
        this.customersUrl = "members";
        break;
      case DIVECENTERSSCOLLECTION:
        sub = DivingCentersService.selectedDivingCenterClients$;
        this.type = DIVECENTERSSCOLLECTION.toLowerCase();
        this.id = DivingCentersService.selectedDivingCenterId;
        this.customersUrl = "customers";
        break;
      case SERVICECENTERSCOLLECTION:
        sub = ServiceCentersService.selectedServiceCenterClients$;
        this.type = SERVICECENTERSCOLLECTION.toLowerCase();
        this.id = ServiceCentersService.selectedServiceCenterId;
        this.customersUrl = "customers";
        break;
    }
    this.clientsSub = sub.subscribe(async (clients) => {
      this.clients = clients;
      const list = [];
      if (clients) {
        for (let clientId of Object.keys(this.clients)) {
          list.push(await UserService.getMapDataUserDetails(clientId));
        }
      }
      this.clientsList = orderBy(list, "displayName");
      this.filterClients(this.filter);
    });
  }
  disconnectedCallback() {
    this.clientsSub.unsubscribe();
  }
  render() {
    return [
      <ion-header>
        <ion-toolbar color='clients'>
          <ion-searchbar
            animated
            placeholder={TranslationService.getTransl("search", "Search")}
            onIonInput={(ev) => this.filterClients(ev)}
          ></ion-searchbar>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        <ion-list>
          {this.clientsFilteredList.map((client) => (
            <ion-item
              button
              detail
              href={
                "/" +
                ADMINROUTE +
                "/" +
                this.type +
                "/" +
                this.id +
                "/" +
                this.customersUrl +
                "/" +
                client.id
              }
            >
              {client.photoURL ? (
                <ion-avatar slot='start'>
                  <img src={client.photoURL} />
                </ion-avatar>
              ) : (
                <ion-icon slot='start' name='person'></ion-icon>
              )}
              <ion-label>{client.displayName}</ion-label>
            </ion-item>
          ))}
        </ion-list>
      </ion-content>,
    ];
  }
}
