import { Component, h, State, Host } from "@stencil/core";
import { UserService } from "../../../../../services/common/user";
import { UserRoles } from "../../../../../interfaces/common/user/user-roles";
import { orderBy } from "lodash";
import {
  DivingCentersService,
  DIVECENTERSSCOLLECTION,
} from "../../../../../services/udive/divingCenters";
import { Subscription } from "rxjs";

@Component({
  tag: "app-user-diving-centers",
  styleUrl: "app-user-diving-centers.scss",
})
export class AppUserDivingCenters {
  @State() userRoles: UserRoles;
  userRoles$: Subscription;
  dcList$: Subscription;
  dcCollection: any[] = [];
  @State() myCenters: any[] = [];

  async componentWillLoad() {
    this.userRoles$ = UserService.userRoles$.subscribe(async (userRoles) => {
      if (userRoles && userRoles.uid) {
        this.userRoles = new UserRoles(userRoles);
        this.filterMyCenters();
      }
    });
    //load all dive sites
    this.dcList$ = DivingCentersService.divingCentersList$.subscribe(
      (collection) => {
        this.dcCollection = collection;
        this.filterMyCenters();
      }
    );
  }

  disconnectedCallback() {
    this.userRoles$.unsubscribe();
    this.dcList$.unsubscribe();
  }

  filterMyCenters() {
    this.myCenters = [];
    if (
      this.dcCollection.length > 0 &&
      this.userRoles &&
      this.userRoles.editorOf
    ) {
      Object.keys(this.userRoles.editorOf).forEach((key) => {
        if (this.userRoles.editorOf[key].collection == DIVECENTERSSCOLLECTION) {
          let dc = this.dcCollection.find((dc) => dc.id == key);
          this.myCenters.push(dc);
        }
      });
      this.myCenters = orderBy(this.myCenters, "displayname");
    }
  }

  update(event, id) {
    event.stopPropagation();
    DivingCentersService.presentDivingCenterUpdate(id);
  }

  render() {
    return (
      <Host>
        {this.myCenters.map((dc) => (
          <ion-item
            button
            onClick={() =>
              DivingCentersService.presentDivingCenterDetails(dc.id)
            }
            detail
          >
            {dc.photoURL ? (
              <ion-avatar slot='start'>
                <img src={dc.photoURL} />
              </ion-avatar>
            ) : undefined}

            <ion-label>{dc.displayName}</ion-label>
            <ion-button
              fill='clear'
              icon-only
              slot='end'
              onClick={(ev) => this.update(ev, dc.id)}
            >
              <ion-icon name='create' slot='end'></ion-icon>
            </ion-button>
          </ion-item>
        ))}
      </Host>
    );
  }
}
