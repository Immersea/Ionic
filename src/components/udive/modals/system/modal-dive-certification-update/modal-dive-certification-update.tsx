import {Component, h, Host, Prop, State, Element} from "@stencil/core";
import {modalController} from "@ionic/core";
import {isString, toNumber, toString} from "lodash";
import {Certification} from "../../../../../interfaces/udive/diving-class/divingClass";
import {
  SystemService,
  SYSTEMCOLLECTION,
} from "../../../../../services/common/system";
import {DivePlanModel} from "../../../../../interfaces/udive/planner/dive-plan";
import Swiper from "swiper";
import {Environment} from "../../../../../global/env";

@Component({
  tag: "modal-dive-certification-update",
  styleUrl: "modal-dive-certification-update.scss",
})
export class ModalDiveCertificationUpdate {
  @Element() el: HTMLElement;
  @Prop() agencyId: string;
  @Prop() diveCertification: Certification;
  @State() validCert = false;
  @State() newCert: boolean = false;
  @State() updateView = false;
  certGroups: any;
  @State() titles = [{tag: "details"}, {tag: "schedule"}];
  @State() slider: Swiper;

  async componentWillLoad() {
    this.newCert = !this.diveCertification.id;
    this.certGroups =
      SystemService.systemPreferences.selectOptions.certificationGroups;

    //convert diveplans to models
    if (this.diveCertification.activities)
      this.diveCertification.activities = this.diveCertification.activities.map(
        (activity) => {
          if (activity.divePlan)
            activity.divePlan = new DivePlanModel(activity.divePlan);
          return activity;
        }
      );
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-dive-cert", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: true,
      autoHeight: true,
    });
    this.validateCert();
  }

  handleCertChange(ev) {
    if (ev.detail.name == "maxDepth" || ev.detail.name == "numberOfStudents") {
      this.diveCertification[ev.detail.name] = toNumber(ev.detail.value);
    } else {
      this.diveCertification[ev.detail.name] = ev.detail.value;
    }
    this.validateCert();
  }

  updateCertGroup(group) {
    this.diveCertification.group = group;
    this.validateCert();
  }

  uniqueIdValid(ev) {
    this.validCert = this.validCert && ev.detail;
  }

  updateImageUrls(ev) {
    const imageType = ev.detail.type;
    const url = ev.detail.url;
    if (imageType == "photo") {
      this.diveCertification.photoURL = url;
    } else {
      this.diveCertification.coverURL = url;
    }
  }

  validateCert() {
    this.validCert =
      isString(this.diveCertification.id) &&
      isString(this.diveCertification.name) &&
      this.diveCertification.numberOfStudents > 0 &&
      this.diveCertification.maxDepth > 0;
  }

  async save() {
    return modalController.dismiss(this.diveCertification);
  }

  async cancel() {
    return modalController.dismiss();
  }

  render() {
    return (
      <Host>
        <ion-header>
          {this.diveCertification.id ? (
            <app-upload-cover
              item={{
                collection: SYSTEMCOLLECTION,
                id: this.agencyId + "-" + this.diveCertification.id,
                photoURL: this.diveCertification.photoURL,
                coverURL: this.diveCertification.coverURL,
              }}
              onCoverUploaded={(ev) => this.updateImageUrls(ev)}
            ></app-upload-cover>
          ) : undefined}
        </ion-header>
        <app-header-segment-toolbar
          color={Environment.getAppColor()}
          swiper={this.slider}
          titles={this.titles}
        ></app-header-segment-toolbar>
        <ion-content class="slides">
          <swiper-container class="slider-dive-cert swiper">
            <swiper-wrapper class="swiper-wrapper">
              <swiper-slide class="swiper-slide">
                <ion-list>
                  <app-form-item
                    label-tag="unique-id"
                    label-text="Unique ID"
                    value={this.diveCertification.id}
                    disabled={!this.newCert}
                    name="id"
                    input-type="text"
                    onFormItemChanged={(ev) => this.handleCertChange(ev)}
                    onIsValid={(ev) => this.uniqueIdValid(ev)}
                    validator={[
                      "required",
                      {
                        name: "uniqueid",
                        options: {type: null},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-tag="name"
                    label-text="Name"
                    value={this.diveCertification.name}
                    name="name"
                    input-type="text"
                    onFormItemChanged={(ev) => this.handleCertChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag="max-depth"
                    label-text="Max. Depth"
                    value={toString(this.diveCertification.maxDepth)}
                    name="maxDepth"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleCertChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag="max-students"
                    label-text="Max. number of students"
                    value={toString(this.diveCertification.numberOfStudents)}
                    name="numberOfStudents"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleCertChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <ion-item>
                    <ion-label>Certification Group</ion-label>
                    <ion-select
                      value={this.diveCertification.group}
                      onIonChange={(ev) =>
                        this.updateCertGroup(ev.detail.value)
                      }
                      interface="popover"
                    >
                      {this.certGroups.map((group) => (
                        <ion-select-option value={group.tag}>
                          {group.text}
                        </ion-select-option>
                      ))}
                    </ion-select>
                  </ion-item>
                </ion-list>
              </swiper-slide>
              <swiper-slide class="swiper-slide">
                <app-dive-course-activities
                  schedule={this.diveCertification.activities}
                  showDiveLocation={false}
                  onScheduleEmit={(ev) =>
                    (this.diveCertification.activities = ev.detail)
                  }
                  editable={true}
                />
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
        </ion-content>
        <app-modal-footer
          disableSave={!this.validCert}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
