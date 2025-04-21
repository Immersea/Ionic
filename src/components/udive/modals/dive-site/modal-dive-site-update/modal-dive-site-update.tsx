import { Component, h, Host, Prop, State, Element } from "@stencil/core";
import { DiveSite } from "../../../../../interfaces/udive/dive-site/diveSite";
import { TranslationService } from "../../../../../services/common/translations";
import { modalController, alertController } from "@ionic/core";
import {
  cloneDeep,
  each,
  forEach,
  isNumber,
  isString,
  toNumber,
  toString,
} from "lodash";
import { DiveConfiguration } from "../../../../../interfaces/udive/planner/dive-configuration";
import { Subscription } from "rxjs";
import { UserService } from "../../../../../services/common/user";
import {
  DiveSitesService,
  DIVESITESCOLLECTION,
} from "../../../../../services/udive/diveSites";
import { UserProfile } from "../../../../../interfaces/common/user/user-profile";
import { UserSettings } from "../../../../../interfaces/udive/user/user-settings";
import { mapHeight } from "../../../../../helpers/utils";
import { RouterService } from "../../../../../services/common/router";
import Swiper from "swiper";
import { MapService } from "../../../../../services/common/map";
import { Environment } from "../../../../../global/env";

@Component({
  tag: "modal-dive-site-update",
  styleUrl: "modal-dive-site-update.scss",
})
export class ModalDiveSiteUpdate {
  @Element() el: HTMLElement;
  @Prop() diveSiteId: string = undefined;
  @State() diveSite: DiveSite;
  @State() segment = "map";
  @State() updateView = true;
  @State() validSite = false;
  @State() titles = [
    { tag: "map" },
    { tag: "position" },
    { tag: "information" },
    { tag: "dive-profiles", text: "Dive Profiles" },
    { tag: "team" },
  ];
  @State() slider: Swiper;
  draggableMarkerPosition: any;
  stdConfigurations: DiveConfiguration[] = [];
  userProfile: UserProfile;
  userProfileSub$: Subscription;
  userSettings: UserSettings;
  userSettingsSub$: Subscription;
  mapElement: HTMLAppMapElement;

  async componentWillLoad() {
    this.userProfileSub$ = UserService.userProfile$.subscribe(
      (userProfile: UserProfile) => {
        this.userProfile = new UserProfile(userProfile);
      }
    );
    this.userSettingsSub$ = UserService.userSettings$.subscribe(
      (userSettings: UserSettings) => {
        this.userSettings = new UserSettings(userSettings);
        this.stdConfigurations = cloneDeep(
          this.userSettings.userConfigurations
        );
      }
    );
    await this.loadDiveSite();
  }

  async loadDiveSite() {
    if (this.diveSiteId) {
      this.diveSite = await DiveSitesService.getDiveSite(this.diveSiteId);
      this.draggableMarkerPosition = {
        lat: this.diveSite.position.geopoint.latitude,
        lon: this.diveSite.position.geopoint.longitude,
      };
    } else {
      this.diveSite = new DiveSite();
      this.diveSite.users = {
        [UserService.userRoles.uid]: ["owner"],
      };
      this.draggableMarkerPosition = {};
    }
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-dive-site", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
    });
    this.setSelectOptions();

    //reset map height inside slide
    await customElements.whenDefined("app-map");
    this.mapElement = this.el.querySelector("#map") as any;
    const mapContainer = this.el.querySelector("#map-container");
    mapContainer.setAttribute(
      "style",
      "height: " + mapHeight(this.diveSite, true) + "px"
    ); //-cover photo -slider  - footer
    this.mapElement["mapLoaded"]().then(() => {
      this.mapElement.triggerMapResize();
    });
    this.mapElement.triggerMapResize();
    this.validateSite();
  }

  disconnectedCallback() {
    this.userProfileSub$.unsubscribe();
    this.userSettingsSub$.unsubscribe();
  }

  setSelectOptions() {
    const selectSiteTypeElement: HTMLIonSelectElement =
      this.el.querySelector("#dive-type-select");
    const customSiteTypePopoverOptions = {
      header: TranslationService.getTransl("site-type", "Site Type"),
    };
    selectSiteTypeElement.interfaceOptions = customSiteTypePopoverOptions;
    selectSiteTypeElement.placeholder = TranslationService.getTransl(
      "select",
      "Select"
    );
    each(DiveSitesService.getSiteTypes(), (val) => {
      const selectOption = document.createElement("ion-select-option");
      selectOption.value = val.type;
      selectOption.textContent = val.name;
      selectSiteTypeElement.appendChild(selectOption);
    });

    const selectEntryTypeElement: HTMLIonSelectElement =
      this.el.querySelector("#entry-type-select");
    const customEntryTypePopoverOptions = {
      header: TranslationService.getTransl("entry-type", "Entry Type"),
    };
    selectEntryTypeElement.interfaceOptions = customEntryTypePopoverOptions;
    selectEntryTypeElement.placeholder = TranslationService.getTransl(
      "select",
      "Select"
    );
    each(DiveSitesService.getEntryTypes(), (val) => {
      const selectOption = document.createElement("ion-select-option");
      selectOption.value = val.type;
      selectOption.textContent = val.name;
      selectEntryTypeElement.appendChild(selectOption);
    });

    const selectSeabedCompElement: HTMLIonSelectElement = this.el.querySelector(
      "#seabed-comp-select"
    );
    const customSeabedCompPopoverOptions = {
      header: TranslationService.getTransl("seabed-comp", "Seabed Composition"),
    };
    selectSeabedCompElement.interfaceOptions = customSeabedCompPopoverOptions;
    selectSeabedCompElement.placeholder = TranslationService.getTransl(
      "select",
      "Select"
    );
    each(DiveSitesService.getSeabedCompositions(), (val) => {
      const selectOption = document.createElement("ion-select-option");
      selectOption.value = val.type;
      selectOption.textContent = val.name;
      selectSeabedCompElement.appendChild(selectOption);
    });

    const selectSeabedCoverElement: HTMLIonSelectElement =
      this.el.querySelector("#seabed-cover-select");
    const customSeabedCoverPopoverOptions = {
      header: TranslationService.getTransl("seabed-cover", "Seabed Cover"),
    };
    selectSeabedCoverElement.interfaceOptions = customSeabedCoverPopoverOptions;
    selectSeabedCoverElement.placeholder = TranslationService.getTransl(
      "select",
      "Select"
    );
    each(DiveSitesService.getSeabedCovers(), (val) => {
      const selectOption = document.createElement("ion-select-option");
      selectOption.value = val.type;
      selectOption.textContent = val.name;
      selectSeabedCoverElement.appendChild(selectOption);
    });
  }

  updateLocation(ev) {
    this.draggableMarkerPosition = {
      lat: toNumber(ev.detail.lat),
      lon: toNumber(ev.detail.lon),
    };
    this.diveSite.position = MapService.getPosition(
      ev.detail.lat,
      ev.detail.lon
    );
    this.validateSite();
  }

  updateAddress(ev) {
    this.diveSite.setAddress(ev.detail);
  }

  handleChange(ev) {
    this.diveSite[ev.detail.name] = ev.detail.value;
    this.validateSite();
  }

  handleInformationChange(ev) {
    switch (ev.detail.name) {
      case "minDepth":
        this.diveSite.information.minDepth = toNumber(ev.detail.value);
        break;
      case "maxDepth":
        this.diveSite.information.maxDepth = toNumber(ev.detail.value);
        break;
      case "waterTemp.spring":
        this.diveSite.information.waterTemp.spring = ev.detail.value;
        break;
      case "waterTemp.summer":
        this.diveSite.information.waterTemp.summer = ev.detail.value;
        break;
      case "waterTemp.autumn":
        this.diveSite.information.waterTemp.autumn = ev.detail.value;
        break;
      case "waterTemp.winter":
        this.diveSite.information.waterTemp.winter = ev.detail.value;
        break;

      default:
        this.diveSite.information[ev.detail.name] = ev.detail.value;
    }
    this.validateSite();
  }

  updateParam(param, ev) {
    let value = ev.detail.value;
    switch (param) {
      case "type":
        this.diveSite.type = value;
        break;
      case "entryType":
        this.diveSite.information.entryType = value;
        break;
      case "seabedComposition":
        this.diveSite.information.seabedComposition = value;
        break;
      case "seabedCover":
        this.diveSite.information.seabedCover = value;
        break;
    }
    this.validateSite();
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
          handler: (data: any) => {
            this.addDivePlanWithConf(this.stdConfigurations[data]);
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

  async addDivePlanWithConf(selectedConfiguration: DiveConfiguration) {
    const openModal = await RouterService.openModal("modal-dive-template", {
      selectedConfiguration: selectedConfiguration,
      stdConfigurations: this.stdConfigurations,
      dive: 0,
      user: this.userProfile,
    });
    openModal.onDidDismiss().then((divePlan) => {
      const dpModal = divePlan.data;
      if (dpModal) {
        dpModal.dives[0].diveSiteId = this.diveSiteId;
        this.diveSite.divePlans.push(dpModal);
        this.updateView = !this.updateView;
      }
    });
  }

  async viewDivePlan(plan, i) {
    this.diveSite.divePlans[i] = plan.detail;
    this.updateView = !this.updateView;
  }

  async removeDivePlan(i) {
    this.diveSite.divePlans.splice(i, 1);
    this.updateView = !this.updateView;
  }

  updateImageUrls(ev) {
    const imageType = ev.detail.type;
    const url = ev.detail.url;
    if (imageType == "photo") {
      this.diveSite.photoURL = url;
    } else {
      this.diveSite.coverURL = url;
    }
  }

  validateSite() {
    this.validSite =
      isNumber(this.diveSite.position.geopoint.latitude) &&
      isNumber(this.diveSite.position.geopoint.longitude) &&
      isString(this.diveSite.type) &&
      isString(this.diveSite.information.entryType) &&
      isString(this.diveSite.description) &&
      this.diveSite.information.minDepth > 0 &&
      this.diveSite.information.maxDepth > 0;
  }

  async save() {
    await DiveSitesService.updateDiveSite(
      this.diveSiteId,
      this.diveSite,
      this.userProfile.uid
    );
    return modalController.dismiss();
  }

  async cancel() {
    return modalController.dismiss();
  }

  render() {
    return (
      <Host>
        <ion-header>
          <app-upload-cover
            item={{
              collection: DIVESITESCOLLECTION,
              id: this.diveSiteId,
              photoURL: this.diveSite.photoURL,
              coverURL: this.diveSite.coverURL,
            }}
            onCoverUploaded={(ev) => this.updateImageUrls(ev)}
          ></app-upload-cover>
        </ion-header>

        <app-header-segment-toolbar
          color={Environment.getAppColor()}
          swiper={this.slider}
          titles={this.titles}
        ></app-header-segment-toolbar>
        <ion-content class='slides'>
          <swiper-container class='slider-dive-site swiper'>
            <swiper-wrapper class='swiper-wrapper'>
              <swiper-slide class='swiper-slide'>
                <div id='map-container'>
                  <app-map
                    id='map'
                    pageId='dive-sites'
                    draggableMarkerPosition={this.draggableMarkerPosition}
                    onDragMarkerEnd={(ev) => this.updateLocation(ev)}
                  ></app-map>
                </div>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <app-coordinates
                  coordinates={this.draggableMarkerPosition}
                  onCoordinatesEmit={(ev) => this.updateLocation(ev)}
                  onAddressEmit={(ev) => this.updateAddress(ev)}
                ></app-coordinates>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <ion-list class='ion-no-padding'>
                  <ion-list-header>
                    <my-transl
                      tag='general-information'
                      text='General Information'
                      isLabel
                    />
                  </ion-list-header>
                  <ion-item>
                    <ion-label>
                      <my-transl tag='site-type' text='Site Type' />
                    </ion-label>
                    <ion-select
                      id='dive-type-select'
                      onIonChange={(ev) => this.updateParam("type", ev)}
                      value={this.diveSite.type}
                    ></ion-select>
                  </ion-item>
                  <ion-item>
                    <ion-label>
                      <my-transl tag='entry-type' text='Entry Type' />
                    </ion-label>
                    <ion-select
                      id='entry-type-select'
                      onIonChange={(ev) => this.updateParam("entryType", ev)}
                      value={this.diveSite.information.entryType}
                    ></ion-select>
                  </ion-item>
                  <app-form-item
                    label-tag='name'
                    label-text='Name'
                    value={this.diveSite.displayName}
                    name='displayName'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag='description'
                    label-text='Description'
                    value={this.diveSite.description}
                    name='description'
                    textRows={5}
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <ion-list-header>
                    <ion-label>
                      <my-transl tag='site-details' text='Site Details' />
                    </ion-label>
                  </ion-list-header>
                  <ion-grid class='ion-no-padding'>
                    <ion-row>
                      <ion-col>
                        <app-form-item
                          label-tag='min-depth'
                          label-text='Min. Depth'
                          append-text=' (m)'
                          value={toString(this.diveSite.information.minDepth)}
                          name='minDepth'
                          input-type='number'
                          onFormItemChanged={(ev) =>
                            this.handleInformationChange(ev)
                          }
                          validator={["required"]}
                        ></app-form-item>
                      </ion-col>
                      <ion-col>
                        <app-form-item
                          label-tag='max-depth'
                          label-text='Max. Depth'
                          append-text=' (m)'
                          value={toString(this.diveSite.information.maxDepth)}
                          name='maxDepth'
                          input-type='number'
                          onFormItemChanged={(ev) =>
                            this.handleInformationChange(ev)
                          }
                          validator={["required"]}
                        ></app-form-item>
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                  <app-form-item
                    label-tag='avg-vis'
                    label-text='Average Visibility'
                    append-text=' (m)'
                    value={toString(this.diveSite.information.avgViz)}
                    name='avgViz'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleInformationChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  <ion-list-header>
                    <my-transl
                      tag='water-temp'
                      text='Water Temperature'
                      append-text=' (°C)'
                      isLabel
                    />
                  </ion-list-header>
                  <ion-grid class='ion-no-padding'>
                    <ion-row>
                      <ion-col>
                        <app-form-item
                          label-tag='spring'
                          label-text='Spring'
                          value={toString(
                            this.diveSite.information.waterTemp.spring
                          )}
                          name='waterTemp.spring'
                          input-type='number'
                          onFormItemChanged={(ev) =>
                            this.handleInformationChange(ev)
                          }
                          validator={[]}
                        ></app-form-item>
                      </ion-col>
                      <ion-col>
                        <app-form-item
                          label-tag='summer'
                          label-text='Summer'
                          value={toString(
                            this.diveSite.information.waterTemp.summer
                          )}
                          name='waterTemp.summer'
                          input-type='number'
                          onFormItemChanged={(ev) =>
                            this.handleInformationChange(ev)
                          }
                          validator={[]}
                        ></app-form-item>
                      </ion-col>
                    </ion-row>
                    <ion-row>
                      <ion-col>
                        <app-form-item
                          label-tag='autumn'
                          label-text='Autumn'
                          value={toString(
                            this.diveSite.information.waterTemp.autumn
                          )}
                          name='waterTemp.autumn'
                          input-type='number'
                          onFormItemChanged={(ev) =>
                            this.handleInformationChange(ev)
                          }
                          validator={[]}
                        ></app-form-item>
                      </ion-col>
                      <ion-col>
                        <app-form-item
                          label-tag='winter'
                          label-text='Winter'
                          value={toString(
                            this.diveSite.information.waterTemp.winter
                          )}
                          name='waterTemp.winter'
                          input-type='number'
                          onFormItemChanged={(ev) =>
                            this.handleInformationChange(ev)
                          }
                          validator={[]}
                        ></app-form-item>
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                  <ion-item>
                    <ion-label>
                      <my-transl tag='seabed-comp' text='Seabed Composition' />
                    </ion-label>
                    <ion-select
                      id='seabed-comp-select'
                      multiple
                      onIonChange={(ev) =>
                        this.updateParam("seabedComposition", ev)
                      }
                      value={this.diveSite.information.seabedComposition}
                    ></ion-select>
                  </ion-item>

                  <ion-item>
                    <ion-label>
                      <my-transl tag='seabed-cover' text='Seabed Cover' />
                    </ion-label>
                    <ion-select
                      id='seabed-cover-select'
                      multiple
                      onIonChange={(ev) => this.updateParam("seabedCover", ev)}
                      value={this.diveSite.information.seabedCover}
                    ></ion-select>
                  </ion-item>
                </ion-list>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <ion-grid>
                  <ion-row class='ion-text-start'>
                    {this.diveSite.divePlans.map((plan, i) => (
                      <ion-col size-sm='12' size-md='6' size-lg='4'>
                        <app-dive-plan-card
                          divePlan={plan}
                          edit={true}
                          onViewEmit={(plan) => this.viewDivePlan(plan, i)}
                          onRemoveEmit={() => this.removeDivePlan(i)}
                        />
                      </ion-col>
                    ))}
                    <ion-col size-sm='12' size-md='6' size-lg='4'>
                      <ion-card onClick={() => this.addDivePlan()}>
                        <ion-card-content class='ion-text-center'>
                          <ion-icon
                            name='add-circle-outline'
                            style={{ fontSize: "130px" }}
                          ></ion-icon>
                        </ion-card-content>
                      </ion-card>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <app-users-list
                  item={this.diveSite}
                  editable
                  show={["owner", "editor"]}
                />
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
        </ion-content>
        <app-modal-footer
          disableSave={!this.validSite}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
