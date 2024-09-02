import {Component, h, Host, Prop, State, Element} from "@stencil/core";
import {actionSheetController, modalController} from "@ionic/core";
import {Environment} from "../../../../global/env";
import {
  UserTeams,
  UsersTeams,
} from "../../../../interfaces/trasteel/users/users-teams";
import {TrasteelService} from "../../../../services/trasteel/common/services";
import {UserPubicProfile} from "../../../../components";
import {ProductLines} from "../../../../interfaces/trasteel/users/user-plans";

@Component({
  tag: "modal-user-teams-update",
  styleUrl: "modal-user-teams-update.scss",
})
export class ModalUserTeamsUpdate {
  @Element() el: HTMLElement;
  @Prop() user: UserPubicProfile;
  @State() usersTeams: UsersTeams;
  @State() userIndex: number;
  @State() userTeams: UserTeams;
  @State() updateView = false;

  async componentWillLoad() {
    this.usersTeams = await TrasteelService.getUsersTeams();
    this.userIndex =
      this.usersTeams.usersTeams.length > 0
        ? this.usersTeams.usersTeams.findIndex((x) => x.uid === this.user.uid)
        : -1;
    if (this.userIndex < 0) {
      this.userTeams = new UserTeams(this.user);
    } else {
      this.userTeams = this.usersTeams.usersTeams[this.userIndex];
    }
  }

  async addTeam() {
    let buttons = [];
    let teams = Object.keys(ProductLines);
    teams.forEach((team) => {
      if (!this.userTeams.teams.includes(team)) {
        buttons.push({
          text: team,
          handler: () => {
            this.userTeams.teams.push(team);
            this.updateView = !this.updateView;
          },
        });
      }
    });
    buttons.push({
      text: "Close",
      icon: "close",
      role: "cancel",
      handler: () => {},
    });
    const actionSheet = await actionSheetController.create({
      header: "Add",
      buttons: buttons,
    });
    await actionSheet.present();
  }

  async deleteTeam(index) {
    this.userTeams.teams.splice(index);
    this.updateView = !this.updateView;
  }

  async save() {
    if (this.userIndex >= 0) {
      this.usersTeams.usersTeams[this.userIndex] = this.userTeams;
    } else {
      this.usersTeams.usersTeams.push(this.userTeams);
    }
    TrasteelService.updateUsersTeams(this.usersTeams);
    modalController.dismiss();
  }

  async cancel() {
    return modalController.dismiss();
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color="trasteel">
            <ion-title>USER TEAMS MANAGER</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            <ion-item>{this.user.email}</ion-item>
            <ion-item-divider>
              <ion-label>
                <my-transl tag="teams" text="Teams"></my-transl>
              </ion-label>
            </ion-item-divider>
            {this.userTeams.teams.map((team, index) => (
              <ion-item>
                <ion-label>{team}</ion-label>
                <ion-button
                  slot="end"
                  fill="clear"
                  onClick={() => this.deleteTeam(index)}
                >
                  <ion-icon name="trash" color="danger"></ion-icon>
                </ion-button>
              </ion-item>
            ))}
            <ion-button
              color="trasteel"
              fill="outline"
              expand="full"
              onClick={() => {
                this.addTeam();
              }}
            >
              <ion-icon name="add" slot="start"></ion-icon>
              <ion-label>
                <my-transl tag="add-team" text="Add Team"></my-transl>
              </ion-label>
            </ion-button>
          </ion-list>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
