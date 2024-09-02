import {Component, h, Host, Prop, State, Element} from "@stencil/core";
import {DivingCenter} from "../../../../../interfaces/udive/diving-center/divingCenter";
import {modalController, popoverController} from "@ionic/core";
import {cloneDeep, isNumber, isString, toLower, toNumber} from "lodash";
import {DiveConfiguration} from "../../../../../interfaces/udive/planner/dive-configuration";
import {Subscription} from "rxjs";
import {UserService} from "../../../../../services/common/user";
import {
  DivingCentersService,
  DIVECENTERSSCOLLECTION,
} from "../../../../../services/udive/divingCenters";
import {UserProfile} from "../../../../../interfaces/common/user/user-profile";
import {UserSettings} from "../../../../../interfaces/udive/user/user-settings";
import {mapHeight} from "../../../../../helpers/utils";
import Swiper from "swiper";

@Component({
  tag: "modal-diving-center-update",
  styleUrl: "modal-diving-center-update.scss",
})
export class ModalDivingCenterUpdate {
  @Element() el: HTMLElement;
  @Prop() divingCenterId: string = undefined;
  @State() divingCenter: DivingCenter;
  @State() segment = "map";
  @State() updateView = true;
  @State() validDiveCenter = false;
  @State() diveSites: {
    divingCenterSites: any[];
    divingCenterSelect: any[];
  };
  @State() titles = [
    {tag: "map"},
    {tag: "position"},
    {tag: "information"},
    {tag: "dive-sites", text: "Dive Sites"},
    {tag: "team"},
  ];

  @State() tmpDivingCenterId: string;
  mapElement: HTMLAppMapElement;
  @State() slider: Swiper;
  draggableMarkerPosition: any;
  stdConfigurations: DiveConfiguration[] = [];
  userProfile: UserProfile;
  userProfileSub$: Subscription;
  userSettings: UserSettings;
  userSettingsSub$: Subscription;
  @State() showDCId = false;

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
    await this.loadDivingCenter();
  }

  async loadDivingCenter() {
    if (this.divingCenterId) {
      this.showDCId = false;
      this.tmpDivingCenterId = this.divingCenterId;
      this.divingCenter = await DivingCentersService.getDivingCenter(
        this.divingCenterId
      );
      this.draggableMarkerPosition = {
        lat: this.divingCenter.position.geopoint.latitude,
        lon: this.divingCenter.position.geopoint.longitude,
      };
    } else {
      this.showDCId = true;
      this.divingCenter = new DivingCenter();
      this.divingCenter.users = {
        [UserService.userRoles.uid]: ["owner"],
      };
      this.draggableMarkerPosition = {};
    }
    this.loadDivingCenterSites();
  }

  loadDivingCenterSites() {
    this.diveSites = DivingCentersService.loadDivingCenterSites(
      this.divingCenter
    );
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-diving-center", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
    });

    //reset map height inside slide
    await customElements.whenDefined("app-map");
    this.mapElement = this.el.querySelector("#map") as any;
    const mapContainer = this.el.querySelector("#map-container");
    mapContainer.setAttribute(
      "style",
      "height: " + mapHeight(this.divingCenter.coverURL, true) + "px"
    ); //-cover photo -slider  - footer

    this.mapElement["mapLoaded"]().then(() => {
      this.mapElement.triggerMapResize();
    });
    this.mapElement.triggerMapResize();
    this.validateDiveCenter();
  }

  disconnectedCallback() {
    this.userProfileSub$.unsubscribe();
    this.userSettingsSub$.unsubscribe();
  }

  updateLocation(ev) {
    this.draggableMarkerPosition = {
      lat: toNumber(ev.detail.lat),
      lon: toNumber(ev.detail.lon),
    };
    this.divingCenter.setPosition(ev.detail.lat, ev.detail.lon);
    this.validateDiveCenter();
  }

  updateAddress(ev) {
    this.divingCenter.setAddress(ev.detail);
  }

  handleChange(ev) {
    if (
      ev.detail.name == "facebook" ||
      ev.detail.name == "instagram" ||
      ev.detail.name == "twitter" ||
      ev.detail.name == "website" ||
      ev.detail.name == "email"
    ) {
      const val = toLower(ev.detail.value).split(" ").join("-");
      this.divingCenter[ev.detail.name] = val;
    } else if (ev.detail.name == "id") {
      this.setTmpId(ev.detail.value);
    } else {
      this.divingCenter[ev.detail.name] = ev.detail.value;
    }
    this.updateView = !this.updateView;
    this.validateDiveCenter();
  }

  setTmpId(value) {
    this.tmpDivingCenterId = toLower(value)
      .trim()
      .split(" ")
      .join("-")
      .substring(0, 16);
  }

  updateImageUrls(ev) {
    const imageType = ev.detail.type;
    const url = ev.detail.url;
    if (imageType == "photo") {
      this.divingCenter.photoURL = url;
    } else {
      this.divingCenter.coverURL = url;
    }
  }

  uniqueIdValid(ev) {
    if (ev.detail) {
      this.divingCenterId = this.tmpDivingCenterId;
    } else {
      this.divingCenterId = null;
    }
  }

  validateDiveCenter() {
    this.validDiveCenter =
      isNumber(this.divingCenter.position.geopoint.latitude) &&
      isNumber(this.divingCenter.position.geopoint.longitude) &&
      isString(this.divingCenterId) &&
      isString(this.divingCenter.displayName) &&
      isString(this.divingCenter.description);
  }

  async openAddDiveSite() {
    const popover = await popoverController.create({
      component: "popover-search-dive-site",
      translucent: true,
    });
    popover.onDidDismiss().then((ev) => {
      const siteId = ev.data;
      this.divingCenter.diveSites.push(siteId);
      this.loadDivingCenterSites();
    });
    popover.present();
  }

  removeDiveSite(siteId) {
    const index = this.divingCenter.diveSites.findIndex((id) => id == siteId);
    this.divingCenter.diveSites.splice(index, 1);
    this.loadDivingCenterSites();
  }

  async save() {
    await DivingCentersService.updateDivingCenter(
      this.divingCenterId,
      this.divingCenter,
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
              collection: DIVECENTERSSCOLLECTION,
              id: this.divingCenterId,
              photoURL: this.divingCenter.photoURL,
              coverURL: this.divingCenter.coverURL,
            }}
            onCoverUploaded={(ev) => this.updateImageUrls(ev)}
          ></app-upload-cover>
        </ion-header>

        <app-header-segment-toolbar
          color="divingcenter"
          swiper={this.slider}
          titles={this.titles}
        ></app-header-segment-toolbar>
        <ion-content class="slides">
          <swiper-container class="slider-diving-center swiper">
            <swiper-wrapper class="swiper-wrapper">
              <swiper-slide class="swiper-slide">
                <div id="map-container">
                  <app-map
                    id="map"
                    pageId="diving-center"
                    draggableMarkerPosition={this.draggableMarkerPosition}
                    onDragMarkerEnd={(ev) => this.updateLocation(ev)}
                  ></app-map>
                </div>
              </swiper-slide>
              <swiper-slide class="swiper-slide">
                <app-coordinates
                  coordinates={this.draggableMarkerPosition}
                  onCoordinatesEmit={(ev) => this.updateLocation(ev)}
                  onAddressEmit={(ev) => this.updateAddress(ev)}
                ></app-coordinates>
              </swiper-slide>
              <swiper-slide class="swiper-slide">
                <ion-list class="ion-no-padding">
                  <ion-list-header>
                    <my-transl
                      tag="general-information"
                      text="General Information"
                      isLabel
                    />
                  </ion-list-header>
                  <app-form-item
                    label-tag="name"
                    label-text="Name"
                    value={this.divingCenter.displayName}
                    name="displayName"
                    input-type="text"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    onFormItemBlur={() =>
                      this.setTmpId(this.divingCenter.displayName)
                    }
                    validator={["required"]}
                  ></app-form-item>
                  {this.showDCId ? (
                    <app-form-item
                      label-tag="unique-id"
                      label-text="Unique ID"
                      value={this.tmpDivingCenterId}
                      name="id"
                      input-type="text"
                      onFormItemChanged={(ev) => this.handleChange(ev)}
                      onIsValid={(ev) => this.uniqueIdValid(ev)}
                      validator={[
                        "required",
                        {
                          name: "uniqueid",
                          options: {type: DIVECENTERSSCOLLECTION},
                        },
                      ]}
                    ></app-form-item>
                  ) : undefined}
                  <app-form-item
                    label-tag="description"
                    label-text="Description"
                    value={this.divingCenter.description}
                    name="description"
                    textRows={10}
                    input-type="text"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag="phone"
                    label-text="Phone"
                    value={this.divingCenter.phoneNumber}
                    name="phoneNumber"
                    input-type="tel"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  <app-form-item
                    label-tag="email"
                    label-text="Email"
                    value={this.divingCenter.email}
                    name="email"
                    input-type="email"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["email"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag="website"
                    label-text="Website"
                    value={this.divingCenter.website}
                    name="website"
                    input-type="url"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  {this.divingCenter.website ? (
                    <a
                      class="ion-padding-start"
                      href={"http://" + this.divingCenter.website}
                      target="_blank"
                    >
                      {"http://" + this.divingCenter.website}
                    </a>
                  ) : undefined}
                  <app-form-item
                    label-tag="facebook-id"
                    label-text="Facebook ID"
                    value={this.divingCenter.facebook}
                    name="facebook"
                    input-type="url"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  {this.divingCenter.facebook ? (
                    <a
                      class="ion-padding-start"
                      href={
                        "https://www.facebook.com/" + this.divingCenter.facebook
                      }
                      target="_blank"
                    >
                      {"https://www.facebook.com/" + this.divingCenter.facebook}
                    </a>
                  ) : undefined}
                  <app-form-item
                    label-tag="instagram-id"
                    label-text="Instagram ID"
                    value={this.divingCenter.instagram}
                    name="instagram"
                    input-type="url"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  {this.divingCenter.instagram ? (
                    <a
                      class="ion-padding-start"
                      href={
                        "https://www.instagram.com/" +
                        this.divingCenter.instagram
                      }
                      target="_blank"
                    >
                      {"https://www.instagram.com/" +
                        this.divingCenter.instagram}
                    </a>
                  ) : undefined}
                  <app-form-item
                    label-tag="twitter id"
                    label-text="Twitter ID"
                    value={this.divingCenter.twitter}
                    name="twitter"
                    input-type="url"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  {this.divingCenter.twitter ? (
                    <a
                      class="ion-padding-start"
                      href={
                        "https://www.twitter.com/" + this.divingCenter.twitter
                      }
                      target="_blank"
                    >
                      {"https://www.twitter.com/" + this.divingCenter.twitter}
                    </a>
                  ) : undefined}
                </ion-list>
              </swiper-slide>
              <swiper-slide class="swiper-slide">
                <ion-grid>
                  <ion-row class="ion-text-start">
                    {this.diveSites.divingCenterSites.map((site) => (
                      <ion-col size-sm="12" size-md="6" size-lg="4">
                        <app-dive-site-card
                          diveSite={site}
                          startlocation={this.divingCenter}
                          edit={true}
                          onRemoveEmit={(ev) =>
                            this.removeDiveSite(ev.detail.value)
                          }
                        />
                      </ion-col>
                    ))}
                    <ion-col size-sm="12" size-md="6" size-lg="4">
                      <ion-card onClick={() => this.openAddDiveSite()}>
                        <ion-card-content class="ion-text-center">
                          <ion-icon
                            name="add-circle-outline"
                            style={{fontSize: "130px"}}
                          ></ion-icon>
                        </ion-card-content>
                      </ion-card>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </swiper-slide>
              <swiper-slide class="swiper-slide">
                <app-users-list
                  item={this.divingCenter}
                  editable
                  show={["owner", "editor"]}
                />
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
        </ion-content>
        <app-modal-footer
          disableSave={!this.validDiveCenter}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
