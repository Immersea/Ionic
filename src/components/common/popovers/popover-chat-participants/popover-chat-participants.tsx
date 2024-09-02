import {Component, h, Host, State, Element, Prop} from "@stencil/core";
import {UserService} from "../../../../services/common/user";
import {DivingCentersService} from "../../../../services/udive/divingCenters";
import {DivingSchoolsService} from "../../../../services/udive/divingSchools";
import {ServiceCentersService} from "../../../../services/udive/serviceCenters";
import {popoverController} from "@ionic/core";
import {TranslationService} from "../../../../services/common/translations";
import {Chat} from "../../../../interfaces/common/chat/chat";
import {Environment} from "../../../../global/env";
import {getEmailValidator} from "../../../../validators/email-validator";
import {orderBy} from "lodash";

@Component({
  tag: "popover-chat-participants",
  styleUrl: "popover-chat-participants.scss",
})
export class PopoverChatParticipants {
  @Element() el: HTMLElement;
  @Prop() chat: Chat;
  @State() editable: boolean = true;
  usersList: any[] = [];
  participantsList: any[] = [];
  addedParticipantsList: any[] = [];
  removedParticipantsList: any[] = [];
  @State() showList: any[] = [];
  searchFilter: string;
  userNotFound = false;
  modifiedParticipants = false;
  @State() updateView = false;
  ownersIds: string[];

  async componentWillLoad() {
    const chatParticipants = Object.keys(this.chat.participants);

    this.usersList = [];
    for (let id of chatParticipants) {
      const participant = this.chat.participants[id];
      if (participant.collectionId == "userProfiles") {
        const publicProfile = await UserService.getPublicProfileUserDetails(
          participant.id
        );
        if (publicProfile && publicProfile.uid) {
          this.usersList.push(publicProfile);
        }
      }
    }
    if (Environment.isUdive()) {
      this.usersList = this.usersList.concat(
        DivingCentersService.divingCentersList
      );
      this.usersList = this.usersList.concat(
        DivingSchoolsService.divingSchoolsList
      );
      this.usersList = this.usersList.concat(
        ServiceCentersService.serviceCentersList
      );
    }
    this.participantsList = orderBy(
      this.usersList.filter(
        (participant) =>
          chatParticipants.includes(participant.id) ||
          chatParticipants.includes(participant.uid)
      ),
      "displayName"
    );
    const userIds = Object.keys(this.chat.users);
    this.ownersIds = userIds.filter((userId) =>
      this.chat.users[userId].includes("owner")
    );

    if (Environment.isUdive()) {
      this.editable =
        this.ownersIds.includes(UserService.userProfile.uid) ||
        this.ownersIds.includes(
          ServiceCentersService.selectedServiceCenterId
        ) ||
        this.ownersIds.includes(DivingCentersService.selectedDivingCenterId) ||
        this.ownersIds.includes(DivingSchoolsService.selectedDivingSchoolId);
    }
  }

  async searchUsers(ev) {
    this.searchFilter = ev.target.value.toLowerCase();
    this.showList = [];
    if (getEmailValidator().validate(this.searchFilter)) {
      const user = await UserService.searchUserByEmail(this.searchFilter);
      if (user && user.uid) {
        this.showList.push(user);
        this.userNotFound = false;
      } else {
        this.showList = [];
        this.userNotFound = true;
      }
      this.updateView = !this.updateView;
    }
  }

  resetShowList() {
    this.userNotFound = false;
    this.showList = [];
  }

  addUser(user) {
    if (this.participantsList.findIndex((part) => user.uid === part.id) == -1) {
      this.participantsList.push(user);
      this.addedParticipantsList.push(user);
    }
    this.searchFilter = "";
    this.resetShowList();
    this.modifiedParticipants = true;
  }

  removeUser(user) {
    this.participantsList.splice(
      this.participantsList.findIndex(
        (val) => val.uid === user.uid || val.id === user.id
      ),
      1
    );
    this.addedParticipantsList.splice(
      this.addedParticipantsList.findIndex(
        (val) => val.uid === user.uid || val.id === user.id
      ),
      1
    );
    this.removedParticipantsList.push(user);
    this.searchFilter = "";
    this.resetShowList();
    this.modifiedParticipants = true;
  }

  changeName(ev) {
    this.chat.name = ev.target.value;
  }

  close() {
    popoverController.dismiss();
  }

  save() {
    popoverController.dismiss({
      chatName: this.chat.name,
      added: this.addedParticipantsList,
      removed: this.removedParticipantsList,
    });
  }

  render() {
    return (
      <Host>
        <ion-content>
          <ion-list>
            {this.editable && Object.keys(this.chat.participants).length > 2 ? (
              <ion-item color="chat">
                <ion-input
                  mode="ios"
                  placeholder={TranslationService.getTransl(
                    "chat-name",
                    "Insert Chat Name"
                  )}
                  value={this.chat.name}
                  onIonInput={(ev) => this.changeName(ev)}
                ></ion-input>
              </ion-item>
            ) : undefined}
            {this.editable
              ? [
                  <ion-header translucent>
                    <ion-toolbar>
                      <ion-title>
                        <my-transl
                          tag="edit-chat-participants"
                          text="Edit Chat Participants"
                        />
                      </ion-title>
                    </ion-toolbar>
                  </ion-header>,
                ]
              : undefined}
            {this.participantsList.map((user) => (
              <ion-item>
                {user.photoURL ? (
                  <ion-avatar slot="start">
                    <ion-img src={user.photoURL} />
                  </ion-avatar>
                ) : undefined}
                <ion-label>{user.displayName}</ion-label>
                {this.editable &&
                !this.ownersIds.includes(user.uid) &&
                !this.ownersIds.includes(user.id) ? (
                  <ion-button
                    slot="end"
                    icon-only
                    fill="clear"
                    color="danger"
                    onClick={() => this.removeUser(user)}
                  >
                    <ion-icon name="person-remove-outline"></ion-icon>
                  </ion-button>
                ) : undefined}
              </ion-item>
            ))}
          </ion-list>
          {this.editable
            ? [
                <ion-header translucent>
                  <ion-toolbar>
                    <ion-title>
                      <my-transl
                        tag="add-chat-participants"
                        text="Add Chat Participants"
                      />
                    </ion-title>
                  </ion-toolbar>
                </ion-header>,
                <ion-header translucent>
                  <ion-toolbar>
                    <ion-searchbar
                      value={this.searchFilter}
                      placeholder="Email"
                      inputmode="email"
                      type="email"
                      enterkeyhint="search"
                      clearIcon="close-circle"
                      autocomplete="email"
                      onIonInput={() => this.resetShowList()}
                      onIonClear={() => this.resetShowList()}
                      onIonCancel={() => this.resetShowList()}
                      onIonChange={(ev) => this.searchUsers(ev)}
                    ></ion-searchbar>
                  </ion-toolbar>
                </ion-header>,
              ]
            : undefined}
          <ion-list>
            {this.showList.map((user) => (
              <ion-item>
                {user.photoURL ? (
                  <ion-avatar slot="start">
                    <ion-img src={user.photoURL} />
                  </ion-avatar>
                ) : undefined}
                <ion-label>{user.displayName}</ion-label>
                <ion-button
                  slot="end"
                  icon-only
                  fill="clear"
                  color="success"
                  onClick={() => this.addUser(user)}
                >
                  <ion-icon name="person-add-outline"></ion-icon>
                </ion-button>
              </ion-item>
            ))}
            {this.userNotFound ? (
              <ion-item>
                <ion-label>
                  <my-transl tag="user-not-found" text="User Not Found" />
                </ion-label>
              </ion-item>
            ) : undefined}
          </ion-list>
        </ion-content>
        <app-modal-footer
          onCancelEmit={() => this.close()}
          disableSave={!this.modifiedParticipants}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
