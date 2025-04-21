import { Component, h, Host, Prop, State, Element } from "@stencil/core";
import { alertController, modalController } from "@ionic/core";
import { Environment } from "../../../../global/env";
import {
  PlanOfAction,
  ProductLines,
  UserPlan,
  UserPlans,
} from "../../../../interfaces/trasteel/users/user-plans";
import { UserPlansService } from "../../../../services/trasteel/crm/user-plans";
import { CustomersService } from "../../../../services/trasteel/crm/customers";
import { MapDataCustomer } from "../../../../interfaces/trasteel/customer/customer";
import { TranslationService } from "../../../../services/common/translations";
import { UserService } from "../../../../services/common/user";
import { cloneDeep } from "lodash";

@Component({
  tag: "modal-user-plans-update",
  styleUrl: "modal-user-plans-update.scss",
})
export class ModalUserPlansUpdate {
  @Element() el: HTMLElement;
  @Prop() uid: string; //User ID
  @Prop() userPlans: UserPlans = new UserPlans();
  @Prop() planIndex: number;
  @State() userPlan: UserPlan = new UserPlan();
  @State() validPlan = false;
  @State() selectedCustomer: MapDataCustomer;
  @State() updateView = false;

  async componentWillLoad() {
    //apply uid
    if (!this.uid) this.uid = UserService.userProfile.uid;
    if (this.planIndex >= 0) {
      this.userPlan = cloneDeep(this.userPlans.userPlans[this.planIndex]);
      this.selectedCustomer = CustomersService.getCustomersDetails(
        this.userPlan.customerId
      );
    } else {
      this.userPlan = new UserPlan();
    }
  }

  async componentDidLoad() {
    this.validatePlan();
  }

  async openSelectCustomer() {
    const cust = await CustomersService.openSelectCustomer(
      this.selectedCustomer
    );
    if (cust) {
      this.userPlan.customerId = cust.id;
      this.selectedCustomer = cust;
    }
  }

  addAction() {
    this.userPlan.planOfActions.push(new PlanOfAction());
    this.validatePlan();
  }

  handleOtherChange(ev) {
    this.userPlan.otherName = ev.detail.value;
    this.validatePlan();
  }

  handleChange(action, ev) {
    action[ev.detail.name] = ev.detail.value;
    action.updated = new Date().toISOString();
    this.validatePlan();
  }

  removePlan(index) {
    this.userPlan.planOfActions.splice(index, 1);
    this.validatePlan();
  }

  async deletePlan() {
    const alert = await alertController.create({
      header: TranslationService.getTransl("delete-plan", "Delete Plan"),
      message: TranslationService.getTransl(
        "delete-plan-message",
        "This plan will be deleted! Are you sure?"
      ),
      buttons: [
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: async () => {
            this.save(true);
          },
        },
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          handler: async () => {},
        },
      ],
    });
    alert.present();
  }

  validatePlan() {
    this.validPlan = true;
    this.validPlan =
      this.validPlan &&
      (this.userPlan.customerId != null || this.userPlan.otherName != null);
    let actions = this.userPlan.planOfActions.length > 0;
    this.userPlan.planOfActions.forEach((action) => {
      actions = actions && action.dueDate != null;
      actions = actions && action.updated != null;
      actions = actions && action.product != null;
      actions = actions && action.plan != null;
      actions = actions && action.situation != null;
    });
    this.validPlan = this.validPlan && actions;
    this.updateView = !this.updateView;
  }

  async save(del = false) {
    if (!this.userPlans.users) {
      this.userPlans.users = {};
      this.userPlans.users[this.uid] = ["owner"];
    }
    if (this.planIndex >= 0 && this.userPlan.planOfActions.length == 0) {
      //delete if no plans
      del = true;
    }
    if (this.planIndex >= 0 && !del) {
      this.userPlans.userPlans[this.planIndex] = this.userPlan;
    } else if (del) {
      this.userPlans.userPlans.splice(this.planIndex);
    } else {
      this.userPlans.userPlans.push(this.userPlan);
    }
    await UserPlansService.updateUserPlan(this.uid, this.userPlans);
    modalController.dismiss();
  }

  async cancel() {
    return modalController.dismiss();
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color='trasteel'>
            <ion-title>
              <my-transl
                tag='plan-of-actions'
                text='Plan of Actions'
              ></my-transl>
            </ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            {this.userPlan.otherName == null ? (
              <ion-item
                button
                lines='inset'
                onClick={() => this.openSelectCustomer()}
              >
                <ion-label>
                  <p class='small'>
                    <my-transl tag='customer' text='Customer'></my-transl>*
                  </p>
                  <h2>
                    {this.selectedCustomer
                      ? this.selectedCustomer.fullName
                      : null}
                  </h2>
                </ion-label>
              </ion-item>
            ) : undefined}
            {this.userPlan.customerId == null &&
            this.userPlan.otherName == null ? (
              <ion-item-divider>
                <ion-label>- or -</ion-label>
              </ion-item-divider>
            ) : undefined}
            {this.userPlan.customerId == null ? (
              <app-form-item
                lines='inset'
                label-tag='other'
                label-text='Other'
                value={this.userPlan.otherName}
                name='otherName'
                input-type='string'
                onFormItemChanged={(ev) => this.handleOtherChange(ev)}
              ></app-form-item>
            ) : undefined}
            <ion-button
              color='trasteel'
              fill='outline'
              expand='full'
              disabled={
                this.userPlan.customerId == null &&
                this.userPlan.otherName == null
              }
              onClick={() => {
                this.addAction();
              }}
            >
              <ion-icon name='add' slot='start'></ion-icon>
              <ion-label>
                <my-transl tag='add-action' text='Add Action'></my-transl>
              </ion-label>
            </ion-button>
            <ion-grid>
              {this.userPlan.planOfActions.map((action, index) => [
                <ion-row>
                  <ion-col>
                    <ion-select
                      color='trasteel'
                      id='application'
                      interface='action-sheet'
                      label={TranslationService.getTransl("product", "Product")}
                      label-placement='floating'
                      onIonChange={(ev) => {
                        action.product = ev.detail.value;
                        this.validatePlan();
                      }}
                      value={action.product}
                    >
                      {Object.keys(ProductLines).map((line) => (
                        <ion-select-option value={line}>
                          {ProductLines[line]}
                        </ion-select-option>
                      ))}
                    </ion-select>
                  </ion-col>
                  <ion-col size='3'>
                    <app-form-item
                      lines='inset'
                      label-tag='due-date'
                      label-text='Due Date'
                      value={action.dueDate}
                      name='dueDate'
                      input-type='date'
                      date-presentation='date'
                      onFormItemChanged={(ev) => this.handleChange(action, ev)}
                      validator={["required"]}
                    ></app-form-item>
                  </ion-col>
                  <ion-col size='1'>
                    <ion-button
                      fill='clear'
                      icon-only
                      onClick={() => this.removePlan(index)}
                    >
                      <ion-icon name='trash' color='danger'></ion-icon>
                    </ion-button>
                  </ion-col>
                </ion-row>,
                <ion-row>
                  <ion-col>
                    <app-form-item
                      lines='inset'
                      label-tag='actual-situation'
                      label-text='Actual Situation'
                      value={action.situation}
                      name='situation'
                      input-type='text'
                      textRows={3}
                      onFormItemChanged={(ev) => this.handleChange(action, ev)}
                      validator={["required"]}
                    ></app-form-item>
                  </ion-col>
                  <ion-col>
                    <app-form-item
                      lines='inset'
                      label-tag='plan'
                      label-text='Plan'
                      value={action.plan}
                      name='plan'
                      input-type='text'
                      textRows={3}
                      onFormItemChanged={(ev) => this.handleChange(action, ev)}
                      validator={["required"]}
                    ></app-form-item>
                  </ion-col>
                </ion-row>,
                <ion-row>
                  <ion-item-divider></ion-item-divider>
                </ion-row>,
              ])}
            </ion-grid>
            {this.userPlan.planOfActions.length > 0 ? (
              <ion-button
                color='danger'
                fill='outline'
                expand='full'
                onClick={() => {
                  this.deletePlan();
                }}
              >
                <ion-icon name='trash' slot='start'></ion-icon>
                <ion-label>
                  <my-transl tag='delete' text='Delete'></my-transl>
                </ion-label>
              </ion-button>
            ) : undefined}
          </ion-list>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          disableSave={!this.validPlan}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
