import { Component, h, State, Host } from "@stencil/core";
import { UserService } from "../../../../../services/common/user";
import { UserRoles } from "../../../../../interfaces/common/user/user-roles";
import { orderBy } from "lodash";
import {
  DiveCommunitiesService,
  DIVECOMMUNITIESCOLLECTION,
} from "../../../../../services/udive/diveCommunities";
import { Subscription } from "rxjs";

@Component({
  tag: "app-user-dive-communities",
  styleUrl: "app-user-dive-communities.scss",
})
export class AppUserDiveCommunities {
  @State() userRoles: UserRoles;
  userRoles$: Subscription;
  dcList$: Subscription;
  dcCollection: any[] = [];
  @State() myCommunities: any[] = [];

  async componentWillLoad() {
    this.userRoles$ = UserService.userRoles$.subscribe(async (userRoles) => {
      if (userRoles && userRoles.uid) {
        this.userRoles = new UserRoles(userRoles);
        this.filterMyCenters();
      }
    });
    //load all dive sites
    this.dcList$ = DiveCommunitiesService.diveCommunitiesList$.subscribe(
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
    this.myCommunities = [];
    if (
      this.dcCollection.length > 0 &&
      this.userRoles &&
      this.userRoles.editorOf
    ) {
      Object.keys(this.userRoles.editorOf).forEach((key) => {
        if (
          this.userRoles.editorOf[key].collection == DIVECOMMUNITIESCOLLECTION
        ) {
          let dc = this.dcCollection.find((dc) => dc.id == key);
          this.myCommunities.push(dc);
        }
      });
      this.myCommunities = orderBy(this.myCommunities, "displayname");
    }
  }

  update(event, id) {
    event.stopPropagation();
    DiveCommunitiesService.presentDiveCommunityUpdate(id);
  }

  render() {
    return (
      <Host>
        {this.myCommunities.map((dc) => (
          <ion-item
            button
            onClick={() =>
              DiveCommunitiesService.presentDiveCommunityDetails(dc.id)
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
