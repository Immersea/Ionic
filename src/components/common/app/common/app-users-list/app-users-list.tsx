import {Component, h, Prop, State} from "@stencil/core";
import {UserService} from "../../../../../services/common/user";
import {UserProfile} from "../../../../../interfaces/common/user/user-profile";
import {popoverController} from "@ionic/core";
import {isArray, orderBy} from "lodash";

@Component({
  tag: "app-users-list",
  styleUrl: "app-users-list.scss",
})
export class AppUsersList {
  @Prop() item: any;
  @Prop() editable: boolean = false;
  @Prop() show: string[];
  userProfile: UserProfile;
  @State() owner: any[] = [];
  @State() editor: any[] = [];
  @State() instructor: any[] = [];
  @State() divemaster: any[] = [];
  isOwner = false;
  groups: {
    owner: {show: boolean; tag: string; text: string};
    editor: {show: boolean; tag: string; text: string};
    instructor: {show: boolean; tag: string; text: string};
    divemaster: {show: boolean; tag: string; text: string};
  };

  async componentWillLoad() {
    this.groups = {
      owner: {
        show: this.show.includes("owner"),
        tag: "admin",
        text: "Administrator",
      },
      editor: {
        show: this.show.includes("editor"),
        tag: "editor",
        text: "Editor",
      },
      instructor: {
        show: this.show.includes("instructor"),
        tag: "instructor",
        text: "Instructor",
      },
      divemaster: {
        show: this.show.includes("divemaster"),
        tag: "divemaster",
        text: "Divemaster",
      },
    };
    this.userProfile = UserService.userProfile;
    this.isOwner =
      isArray(this.item.users[this.userProfile.uid]) &&
      this.item.users[this.userProfile.uid].includes("owner");
    await this.setUsers();
  }

  async setUsers() {
    this.owner = [];
    this.editor = [];
    this.instructor = [];
    for (let userId of Object.keys(this.item.users)) {
      if (this.item.users[userId].includes("owner")) {
        this.owner.push(await UserService.getMapDataUserDetails(userId));
      }
      if (this.item.users[userId].includes("editor")) {
        this.editor.push(await UserService.getMapDataUserDetails(userId));
      }
      if (this.item.users[userId].includes("instructor")) {
        this.instructor.push(await UserService.getMapDataUserDetails(userId));
      }
      if (this.item.users[userId].includes("divemaster")) {
        this.divemaster.push(await UserService.getMapDataUserDetails(userId));
      }
    }
    this.owner = orderBy(this.owner, "displayName");
    this.editor = orderBy(this.editor, "displayName");
    this.instructor = orderBy(this.instructor, "displayName");
    this.divemaster = orderBy(this.divemaster, "displayName");
  }

  async addUser(role) {
    const popover = await popoverController.create({
      component: "popover-search-user",
      translucent: true,
    });
    popover.onDidDismiss().then((ev) => {
      const userId = ev.data;
      let user = this.item.users[userId];
      if (user && !this.item.users[userId].includes(role)) {
        this.item.users[userId].push(role);
      } else if (!user) {
        this.item.users[userId] = [role];
      }
      this.setUsers();
    });
    popover.present();
  }

  removeUser(user, role) {
    const index = this.item.users[user.uid].findIndex((item) => item == role);
    this.item.users[user.uid].splice(index, 1);
    if (this.item.users[user.uid].length == 0) {
      delete this.item.users[user.uid];
    }
    this.setUsers();
  }

  render() {
    return [
      <ion-list>
        {Object.keys(this.groups).map((group) => [
          this.groups[group].show && (this[group].length > 0 || this.editable)
            ? [
                <ion-item lines="full">
                  <my-transl
                    tag={this.groups[group].tag}
                    text={this.groups[group].text}
                    isLabel
                  ></my-transl>
                  {this.editable &&
                  (this.isOwner || UserService.userRoles.isSuperAdmin()) ? (
                    <ion-button
                      color="primary"
                      fill="clear"
                      slot="end"
                      onClick={() => this.addUser(group)}
                    >
                      <ion-icon name="add-circle"></ion-icon>
                    </ion-button>
                  ) : undefined}
                </ion-item>,
              ]
            : undefined,
          this[group].length > 0
            ? [
                this[group].map((user) => (
                  <ion-item>
                    {this.editable &&
                    (this.isOwner || UserService.userRoles.isSuperAdmin()) ? (
                      <ion-button
                        icon-only
                        slot="end"
                        color="danger"
                        fill="clear"
                        disabled={UserService.userRoles.uid == user.uid}
                        onClick={() => this.removeUser(user, group)}
                      >
                        <ion-icon name="trash-bin-outline"></ion-icon>
                      </ion-button>
                    ) : undefined}
                    {user.photoURL ? (
                      <ion-avatar slot="start">
                        <ion-img src={user.photoURL} />
                      </ion-avatar>
                    ) : undefined}
                    <ion-label>{user.displayName}</ion-label>
                  </ion-item>
                )),
              ]
            : undefined,
        ])}
      </ion-list>,
    ];
  }
}
