import {Component, h, State, Host} from "@stencil/core";
import {UserService} from "../../../../../services/common/user";
import {UserRoles} from "../../../../../interfaces/common/user/user-roles";
import {orderBy} from "lodash";
import {
  DiveSitesService,
  DIVESITESCOLLECTION,
} from "../../../../../services/udive/diveSites";
import {Subscription} from "rxjs";

@Component({
  tag: "app-user-dive-sites",
  styleUrl: "app-user-dive-sites.scss",
})
export class AppUserDiveSites {
  @State() userRoles: UserRoles;
  userRoles$: Subscription;
  diveSitesList$: Subscription;
  sitesCollection: any[] = [];
  @State() mySites: any[] = [];

  async componentWillLoad() {
    this.userRoles$ = UserService.userRoles$.subscribe(async (userRoles) => {
      if (userRoles && userRoles.uid) {
        this.userRoles = new UserRoles(userRoles);
        this.filterMySites();
      }
    });
    //load all dive sites
    this.diveSitesList$ = DiveSitesService.diveSitesList$.subscribe(
      (collection) => {
        this.sitesCollection = collection;
        this.filterMySites();
      }
    );
  }

  disconnectedCallback() {
    this.userRoles$.unsubscribe();
    this.diveSitesList$.unsubscribe();
  }

  filterMySites() {
    this.mySites = [];
    if (
      this.sitesCollection.length > 0 &&
      this.userRoles &&
      this.userRoles.editorOf
    ) {
      Object.keys(this.userRoles.editorOf).forEach((key) => {
        if (this.userRoles.editorOf[key].collection == DIVESITESCOLLECTION) {
          let site = this.sitesCollection.find((site) => site.id == key);
          this.mySites.push(site);
        }
      });
      this.mySites = orderBy(this.mySites, "displayname");
    }
  }

  update(event, id) {
    event.stopPropagation();
    DiveSitesService.presentDiveSiteUpdate(id);
  }

  render() {
    return (
      <Host>
        {this.mySites.map((site) => (
          <ion-item
            button
            onClick={() => DiveSitesService.presentDiveSiteDetails(site.id)}
            detail
          >
            {site.photoURL ? (
              <ion-avatar slot="start">
                <img src={site.photoURL} />
              </ion-avatar>
            ) : undefined}

            <ion-label>{site.displayName}</ion-label>
            <ion-button
              fill="clear"
              icon-only
              slot="end"
              onClick={(ev) => this.update(ev, site.id)}
            >
              <ion-icon name="create" slot="end"></ion-icon>
            </ion-button>
          </ion-item>
        ))}
      </Host>
    );
  }
}
