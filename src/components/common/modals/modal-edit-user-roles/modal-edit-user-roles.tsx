import {Component, h, Host, Prop, State, Element} from "@stencil/core";
import {actionSheetController, modalController} from "@ionic/core";
import {USERROLESCOLLECTION} from "../../../../services/common/user";
import {UserRoles} from "../../../../interfaces/common/user/user-roles";
import {Environment} from "../../../../global/env";
import {DatabaseService} from "../../../../services/common/database";
import {TrasteelService} from "../../../../services/trasteel/common/services";
import {UDiveService} from "../../../../services/udive/services";

@Component({
  tag: "modal-edit-user-roles",
  styleUrl: "modal-edit-user-roles.scss",
})
export class ModalEditUserRoles {
  @Element() itemSliding: HTMLElement;
  @Prop() uid: string = undefined;
  @State() userRoles: UserRoles;
  @State() updateView = false;

  async componentWillLoad() {
    const roles = await DatabaseService.getDocument(
      USERROLESCOLLECTION,
      this.uid
    );
    this.userRoles = new UserRoles(roles);
  }

  async save() {
    await DatabaseService.updateDocument(
      USERROLESCOLLECTION,
      this.uid,
      this.userRoles
    );
    modalController.dismiss();
  }

  async cancel() {
    modalController.dismiss();
  }

  async presentActionSheet() {
    let buttons = [];
    let roles = [];
    if (Environment.isTrasteel()) {
      roles = TrasteelService.getUserRoles();
    } else if (Environment.isDecoplanner() || Environment.isUdive()) {
      roles = UDiveService.getUserRoles();
    }
    roles.forEach((role) => {
      if (!this.userRoles.roles.includes(role)) {
        buttons.push({
          text: role,
          handler: () => {
            this.userRoles.roles.push(role);
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

  updateLicense(license, ev) {
    this.userRoles.licences[license] = ev.detail.checked;
    this.updateView = !this.updateView;
  }

  handleChange(ev) {
    if (ev.detail.name == "fromDate") {
      this.userRoles.licences.trial.fromDate = new Date(ev.detail.value);
    } else {
      this.userRoles.licences.trial[ev.detail.name] = ev.detail.value;
    }
    this.updateView = !this.updateView;
  }

  deleteRole(index) {
    const el = this.itemSliding.getElementsByClassName(
      "item-sliding-" + index
    )[0] as HTMLIonItemSlidingElement;
    el.closeOpened();
    this.userRoles.roles.splice(index, 1);
    this.updateView = !this.updateView;
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color={Environment.getAppColor()}>
            <ion-title>User Roles Manager</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            <ion-item>uid: {this.userRoles.uid}</ion-item>
            <ion-item>email: {this.userRoles.email}</ion-item>
            {!Environment.isTrasteel &&
            Object.keys(this.userRoles.licences).length > 0
              ? [
                  <ion-item-divider>User Licences</ion-item-divider>,
                  Object.keys(this.userRoles.licences).map((license) =>
                    license == "trial"
                      ? [
                          <ion-item-divider>
                            <ion-label>Trial</ion-label>
                          </ion-item-divider>,
                          <app-form-item
                            label-tag="duration"
                            label-text="Duration"
                            value={this.userRoles.licences.trial.duration}
                            name="duration"
                            input-type="number"
                            onFormItemChanged={(ev) => this.handleChange(ev)}
                            validator={[]}
                          ></app-form-item>,
                          <app-form-item
                            label-tag="fromDate"
                            label-text="From Date"
                            value={
                              this.userRoles.licences.trial.fromDate !== null
                                ? this.userRoles.licences.trial.fromDate.toISOString()
                                : new Date().toISOString()
                            }
                            name="fromDate"
                            input-type="date"
                            onFormItemChanged={(ev) => this.handleChange(ev)}
                            validator={[]}
                          ></app-form-item>,
                          <app-form-item
                            label-tag="level"
                            label-text="Level"
                            value={this.userRoles.licences.trial.level}
                            name="level"
                            input-type="string"
                            onFormItemChanged={(ev) => this.handleChange(ev)}
                            validator={[]}
                          ></app-form-item>,
                          <ion-item>
                            <ion-label>
                              <p>
                                Trial Days:{" "}
                                {this.userRoles.licences.trialDays()}
                              </p>
                            </ion-label>
                          </ion-item>,
                        ]
                      : [
                          <ion-item>
                            <ion-label>{license}</ion-label>
                            <ion-toggle
                              slot="end"
                              onIonChange={(ev) =>
                                this.updateLicense(license, ev)
                              }
                              checked={this.userRoles.licences[license]}
                            ></ion-toggle>
                          </ion-item>,
                        ]
                  ),
                ]
              : null}
          </ion-list>
          <ion-list>
            <ion-item-divider>User Roles</ion-item-divider>
            {this.userRoles.roles.map((role, index) => (
              <ion-item-sliding class={"item-sliding-" + index}>
                <ion-item>
                  <ion-label>{role}</ion-label>
                </ion-item>
                <ion-item-options>
                  <ion-item-option
                    color="danger"
                    onClick={() => this.deleteRole(index)}
                  >
                    Delete
                  </ion-item-option>
                </ion-item-options>
              </ion-item-sliding>
            ))}
            <ion-item button onClick={() => this.presentActionSheet()}>
              <ion-icon name="add"></ion-icon>
              <ion-label>Add</ion-label>
            </ion-item>
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
