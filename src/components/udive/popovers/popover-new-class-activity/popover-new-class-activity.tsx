import { Component, h, Host, Prop, State, Element } from "@stencil/core";
import { cloneDeep, forEach, isString } from "lodash";
import { popoverController, alertController } from "@ionic/core";
import { Activity } from "../../../../interfaces/udive/diving-class/divingClass";
import { TranslationService } from "../../../../services/common/translations";
import { DiveConfiguration } from "../../../../interfaces/udive/planner/dive-configuration";
import { UserService } from "../../../../services/common/user";
import { RouterService } from "../../../../services/common/router";
import { DivePlansService } from "../../../../services/udive/divePlans";

@Component({
  tag: "popover-new-class-activity",
  styleUrl: "popover-new-class-activity.scss",
})
export class PopoverNewClassActivity {
  @Element() el: HTMLElement;
  @Prop({ mutable: true }) activity: Activity;
  @Prop() showDiveLocation: boolean = true;

  @State() updateView = false;
  @State() validActivity = false;
  typeSelectOptions = [];
  stdConfigurations: DiveConfiguration[] = [];

  componentWillLoad() {
    this.typeSelectOptions = [
      { tag: "theory", text: TranslationService.getTransl("theory", "Theory") },
      { tag: "dry", text: TranslationService.getTransl("dry", "Dry") },
      {
        tag: "in-water",
        text: TranslationService.getTransl("in-water", "In Water"),
      },
      { tag: "dive", text: TranslationService.getTransl("dive", "Dive") },
    ];
    this.stdConfigurations = cloneDeep(
      UserService.userSettings.userConfigurations
    );
    this.validateActivity();
  }

  validateActivity() {
    this.validActivity =
      isString(this.activity.date) &&
      isString(this.activity.type) &&
      isString(this.activity.title);
    if (this.activity.type == "dive") {
      this.validActivity =
        this.validActivity && this.activity.divePlan !== null;
    }
    this.updateView = !this.updateView;
  }

  updateDay(date) {
    this.activity.date = date;
    this.validateActivity();
  }

  updateType(type) {
    if (type != "dive" && this.activity.type == "dive") {
      this.activity.divePlan = null;
    }
    this.activity.type = type;
    this.validateActivity();
  }
  updateTitle(ev) {
    let value = ev.detail.value;
    this.activity.title = value;
    this.validateActivity();
  }

  async addDivePlan() {
    let inputs = [];
    forEach(this.stdConfigurations, (conf, key) => {
      inputs.push({
        type: "radio",
        label: conf.stdName,
        value: key,
        checked: key == 0 ? true : false,
      });
    });
    const alert = await alertController.create({
      header: TranslationService.getTransl(
        "select-standard-configuration",
        "Select standard configuration"
      ),
      buttons: [
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: async (data: any) => {
            const openModal = await RouterService.openModal(
              "modal-dive-template",
              {
                selectedConfiguration: this.stdConfigurations[data],
                stdConfigurations: this.stdConfigurations,
                dive: 0,
                user: UserService.userProfile,
              }
            );
            openModal.onDidDismiss().then((divePlan) => {
              const dpModal = divePlan.data;
              if (dpModal) {
                this.activity.divePlan = dpModal;
                this.validateActivity();
                this.updateView = !this.updateView;
              }
            });
          },
        },
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          role: "cancel",
          cssClass: "secondary",
        },
      ],
      inputs: inputs,
    });
    alert.present();
  }

  async editDivePlan() {
    const modal = await DivePlansService.presentDiveTemplateUpdate(
      this.activity.divePlan,
      0,
      this.showDiveLocation
    );
    if (modal) {
      this.activity.divePlan = modal;
      this.updateView = !this.updateView;
    }
  }

  async save() {
    popoverController.dismiss(this.activity);
  }

  cancel() {
    popoverController.dismiss();
  }

  render() {
    return (
      <Host>
        <ion-toolbar>
          <ion-title>
            <my-transl tag='class-activity' text='Class Activity' />
          </ion-title>
        </ion-toolbar>
        <app-form-item
          label-tag='date'
          label-text='Date'
          value={this.activity.date}
          name='activityDate'
          input-type='date'
          datePresentation='date'
          lines='inset'
          onFormItemChanged={(ev) => this.updateDay(ev.detail.value)}
        ></app-form-item>
        <ion-item>
          <ion-select
            label={TranslationService.getTransl("type", "Type")}
            value={this.activity.type}
            onIonChange={(ev) => this.updateType(ev.detail.value)}
            interface='popover'
          >
            {this.typeSelectOptions.map((option) => (
              <ion-select-option value={option.tag}>
                {option.text}
              </ion-select-option>
            ))}
          </ion-select>
        </ion-item>
        <app-form-item
          label-tag='title'
          label-text='Title'
          value={this.activity.title}
          name='text'
          input-type='text'
          onFormItemChanged={(ev) => this.updateTitle(ev)}
          validator={["required"]}
        ></app-form-item>
        {this.activity.type == "dive" ? (
          this.activity.divePlan ? (
            <ion-item>
              <ion-label>
                {this.activity.divePlan.dives[0]
                  .getDiveDetails()
                  .map((detail) => (
                    <p>{detail}</p>
                  ))}
              </ion-label>
              <ion-button
                icon-only
                fill='clear'
                onClick={() => this.editDivePlan()}
              >
                <ion-icon name='create-outline'></ion-icon>
              </ion-button>
            </ion-item>
          ) : (
            <ion-button expand='full' onClick={() => this.addDivePlan()}>
              Add Dive Plan
            </ion-button>
          )
        ) : undefined}
        <app-modal-footer
          disableSave={!this.validActivity}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
