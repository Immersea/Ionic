import {Component, h, State, Host} from "@stencil/core";
import {UserService} from "../../../../../services/common/user";
import {UserRoles} from "../../../../../interfaces/common/user/user-roles";
import {orderBy} from "lodash";
import {
  ServiceCentersService,
  SERVICECENTERSCOLLECTION,
} from "../../../../../services/udive/serviceCenters";
import {Subscription} from "rxjs";

@Component({
  tag: "app-user-service-centers",
  styleUrl: "app-user-service-centers.scss",
})
export class AppUserServiceCenters {
  @State() userRoles: UserRoles;
  userRoles$: Subscription;
  scList$: Subscription;
  scCollection: any[] = [];
  @State() mySchools: any[] = [];

  async componentWillLoad() {
    this.userRoles$ = UserService.userRoles$.subscribe(async (userRoles) => {
      if (userRoles && userRoles.uid) {
        this.userRoles = new UserRoles(userRoles);
        this.filterMyCenters();
      }
    });
    //load all dive sites
    this.scList$ = ServiceCentersService.serviceCentersList$.subscribe(
      (collection) => {
        this.scCollection = collection;
        this.filterMyCenters();
      }
    );
  }

  disconnectedCallback() {
    this.userRoles$.unsubscribe();
    this.scList$.unsubscribe();
  }

  filterMyCenters() {
    this.mySchools = [];
    if (
      this.scCollection.length > 0 &&
      this.userRoles &&
      this.userRoles.editorOf
    ) {
      Object.keys(this.userRoles.editorOf).forEach((key) => {
        if (
          this.userRoles.editorOf[key].collection == SERVICECENTERSCOLLECTION
        ) {
          let ds = this.scCollection.find((ds) => ds.id == key);
          this.mySchools.push(ds);
        }
      });
      this.mySchools = orderBy(this.mySchools, "displayname");
    }
  }

  update(event, id) {
    event.stopPropagation();
    ServiceCentersService.presentServiceCenterUpdate(id);
  }

  render() {
    return (
      <Host>
        {this.mySchools.map((sc) => (
          <ion-item
            button
            onClick={() =>
              ServiceCentersService.presentServiceCenterDetails(sc.id)
            }
            detail
          >
            {sc.photoURL ? (
              <ion-avatar slot="start">
                <img src={sc.photoURL} />
              </ion-avatar>
            ) : undefined}

            <ion-label>{sc.displayName}</ion-label>
            <ion-button
              fill="clear"
              icon-only
              slot="end"
              onClick={(ev) => this.update(ev, sc.id)}
            >
              <ion-icon name="create" slot="end"></ion-icon>
            </ion-button>
          </ion-item>
        ))}
      </Host>
    );
  }
}
