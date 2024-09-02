import {Component, State, h} from "@stencil/core";
import {Environment} from "../../../../../global/env";
import {UserPubicProfile} from "../../../../../components";
import {UserService} from "../../../../../services/common/user";
import {Subscription} from "rxjs";

@Component({
  tag: "page-user-manager",
  styleUrl: "page-user-manager.scss",
})
export class PageUserManager {
  usersList: UserPubicProfile[] = [];
  @State() filteredUsersList: UserPubicProfile[] = [];
  @State() loading = true;
  usersListSub: Subscription;

  componentWillLoad() {
    this.usersListSub = UserService.userPublicProfilesList$.subscribe(
      (userProfiles) => {
        this.usersList = userProfiles;
        this.filteredUsersList = this.usersList;
        console.log("filteredUsersList", this.filteredUsersList);
        this.loading = false;
      }
    );
  }

  disconnectedCallback() {
    this.usersListSub.unsubscribe();
  }

  render() {
    return [
      <ion-header>
        <app-navbar
          color={Environment.getAppColor()}
          tag="user-manager"
          text="User Manager"
        ></app-navbar>
        <app-search-toolbar
          searchTitle="userManager"
          list={this.usersList}
          orderFields={["displayName", "email"]}
          color={Environment.getAppColor()}
          placeholder="Search by name or email"
          filterBy={["displayName", "email"]}
          onFilteredList={(ev) => (this.filteredUsersList = ev.detail)}
        ></app-search-toolbar>
      </ion-header>,
      <ion-content>
        <ion-list>
          <ion-item-divider>ACTIONS</ion-item-divider>
          <ion-item button onClick={() => UserService.checkUsersMapData()}>
            <ion-label>Check User Profiles MapData</ion-label>
          </ion-item>
          <ion-item-divider>USERS</ion-item-divider>
          <app-infinite-scroll
            list={this.filteredUsersList}
            loading={this.loading}
            showFields={["displayName", "email"]}
            showFieldsDivider=" - "
            returnField="id"
            groupBy={[]}
            icon={null}
            onItemClicked={(ev) => UserService.editUserRoles(ev.detail)}
          ></app-infinite-scroll>
        </ion-list>
      </ion-content>,
    ];
  }
}
