import {Component, h, State, Host} from "@stencil/core";
import {UserService} from "../../../../../services/common/user";
import {UserRoles} from "../../../../../interfaces/common/user/user-roles";
import {orderBy} from "lodash";
import {
  DivingSchoolsService,
  DIVESCHOOLSSCOLLECTION,
} from "../../../../../services/udive/divingSchools";
import {Subscription} from "rxjs";

@Component({
  tag: "app-user-diving-schools",
  styleUrl: "app-user-diving-schools.scss",
})
export class AppUserDivingSchools {
  @State() userRoles: UserRoles;
  userRoles$: Subscription;
  dsList$: Subscription;
  dsCollection: any[] = [];
  @State() mySchools: any[] = [];

  async componentWillLoad() {
    this.userRoles$ = UserService.userRoles$.subscribe(async (userRoles) => {
      if (userRoles && userRoles.uid) {
        this.userRoles = new UserRoles(userRoles);
        this.filterMyCenters();
      }
    });
    //load all dive sites
    this.dsList$ = DivingSchoolsService.divingSchoolsList$.subscribe(
      (collection) => {
        this.dsCollection = collection;
        this.filterMyCenters();
      }
    );
  }

  disconnectedCallback() {
    this.userRoles$.unsubscribe();
    this.dsList$.unsubscribe();
  }

  filterMyCenters() {
    this.mySchools = [];
    if (
      this.dsCollection.length > 0 &&
      this.userRoles &&
      this.userRoles.editorOf
    ) {
      Object.keys(this.userRoles.editorOf).forEach((key) => {
        if (this.userRoles.editorOf[key].collection == DIVESCHOOLSSCOLLECTION) {
          let ds = this.dsCollection.find((ds) => ds.id == key);
          this.mySchools.push(ds);
        }
      });
      this.mySchools = orderBy(this.mySchools, "displayname");
    }
  }

  update(event, id) {
    event.stopPropagation();
    DivingSchoolsService.presentDivingSchoolUpdate(id);
  }

  render() {
    return (
      <Host>
        {this.mySchools.map((dc) => (
          <ion-item
            button
            onClick={() =>
              DivingSchoolsService.presentDivingSchoolDetails(dc.id)
            }
            detail
          >
            {dc.photoURL ? (
              <ion-avatar slot="start">
                <img src={dc.photoURL} />
              </ion-avatar>
            ) : undefined}

            <ion-label>{dc.displayName}</ion-label>
            <ion-button
              fill="clear"
              icon-only
              slot="end"
              onClick={(ev) => this.update(ev, dc.id)}
            >
              <ion-icon name="create" slot="end"></ion-icon>
            </ion-button>
          </ion-item>
        ))}
      </Host>
    );
  }
}
