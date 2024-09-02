import {Component, State, h} from "@stencil/core";
import {Environment} from "../../../../../global/env";
import {UserPubicProfile} from "../../../../../components";
import {UserService} from "../../../../../services/common/user";
import {Subscription} from "rxjs";
import {TrasteelService} from "../../../../../services/trasteel/common/services";

@Component({
  tag: "page-team-manager",
  styleUrl: "page-team-manager.scss",
})
export class PageTeamManager {
  usersList: UserPubicProfile[] = [];
  @State() filteredUsersList: UserPubicProfile[] = [];
  @State() loading = true;
  @State() updateView = true;
  usersListSub: Subscription;

  componentWillLoad() {
    this.usersListSub = UserService.userPublicProfilesList$.subscribe(
      (userProfiles) => {
        this.usersList = userProfiles;
        this.filteredUsersList = this.usersList;
        this.loading = false;
        this.updateView = !this.updateView;
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
          tag="teams-manager"
          text="Teams Manager"
        ></app-navbar>
        <app-search-toolbar
          searchTitle="teamManager"
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
          <ion-item-divider>USERS</ion-item-divider>
          <app-infinite-scroll
            list={this.filteredUsersList}
            loading={this.loading}
            showFields={["displayName", "email"]}
            showFieldsDivider=" - "
            groupBy={[]}
            icon={null}
            onItemClicked={(ev) => TrasteelService.setUserTeams(ev.detail)}
          ></app-infinite-scroll>
        </ion-list>
      </ion-content>,
    ];
  }
}
