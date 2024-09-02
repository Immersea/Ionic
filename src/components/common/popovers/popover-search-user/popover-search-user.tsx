import {Component, h, Host, State, Element} from "@stencil/core";
import {DatabaseService} from "../../../../services/common/database";
import {USERPUBLICPROFILECOLLECTION} from "../../../../services/common/user";
//import { UserService } from "../../../../services/common/user";

@Component({
  tag: "popover-search-user",
  styleUrl: "popover-search-user.scss",
})
export class PopoverSearchUser {
  @Element() el: HTMLElement;
  @State() showList: any[] = [];
  @State() searching = false;
  @State() noResult = false;
  popover: HTMLIonPopoverElement;

  componentWillLoad() {
    this.popover = this.el.closest("ion-popover");
  }

  async searchUsers(ev) {
    this.noResult = false;
    this.showList = [];
    this.searching = true;
    const query = ev.target.value.toLowerCase();
    const res = await DatabaseService.queryCollection(
      USERPUBLICPROFILECOLLECTION,
      ["email"],
      ["="],
      [query]
    );
    res.forEach((doc) => {
      this.showList.push(doc.data());
    });
    if (this.showList.length == 0) {
      this.noResult = true;
    } else {
      this.noResult = false;
    }
    this.searching = false;
  }

  addUser(user) {
    this.popover.dismiss(user.uid);
  }

  render() {
    return (
      <Host>
        <ion-header translucent>
          <ion-toolbar>
            <ion-title>
              <my-transl tag="search" text="Search" />
            </ion-title>
          </ion-toolbar>
          <ion-toolbar>
            <ion-searchbar
              onIonBlur={(ev) => this.searchUsers(ev)}
              inputmode="email"
              type="email"
              placeholder="email"
            ></ion-searchbar>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            {this.showList.map((user) => (
              <ion-item button onClick={() => this.addUser(user)}>
                {user.photoURL ? (
                  <ion-avatar slot="start">
                    <ion-img src={user.photoURL} />
                  </ion-avatar>
                ) : undefined}
                <ion-label>{user.displayName}</ion-label>
              </ion-item>
            ))}
            {this.searching ? (
              <app-skeletons skeleton="chat"></app-skeletons>
            ) : undefined}

            {this.noResult ? (
              <ion-item>
                <ion-label>No Users found!</ion-label>
              </ion-item>
            ) : undefined}
          </ion-list>
        </ion-content>
      </Host>
    );
  }
}
