import { Component, h, Host, Prop, State, Element } from "@stencil/core";
import { DiveCommunity } from "../../../../../interfaces/udive/dive-community/diveCommunity";
import { modalController } from "@ionic/core";
import { cloneDeep, isNumber, isString, toLower, toNumber } from "lodash";
import { DiveConfiguration } from "../../../../../interfaces/udive/planner/dive-configuration";
import { Subscription } from "rxjs";
import { UserService } from "../../../../../services/common/user";
import {
  DiveCommunitiesService,
  DIVECOMMUNITIESCOLLECTION,
} from "../../../../../services/udive/diveCommunities";
import { UserProfile } from "../../../../../interfaces/common/user/user-profile";
import { UserSettings } from "../../../../../interfaces/udive/user/user-settings";
import { mapHeight } from "../../../../../helpers/utils";
import Swiper from "swiper";

@Component({
  tag: "modal-dive-community-update",
  styleUrl: "modal-dive-community-update.scss",
})
export class ModalDiveCommunityUpdate {
  @Element() el: HTMLElement;
  @Prop() diveCommunityId: string = undefined;
  @State() diveCommunity: DiveCommunity;
  @State() updateView = true;
  @State() validDiveCommunity = false;
  titles = [
    { tag: "map" },
    { tag: "position" },
    { tag: "information" },
    { tag: "team" },
  ];
  @State() tmpDiveCommunityId: string;
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
    await this.loadDiveCommunity();
  }

  async loadDiveCommunity() {
    if (this.diveCommunityId) {
      this.showDCId = false;
      this.tmpDiveCommunityId = this.diveCommunityId;
      this.diveCommunity = await DiveCommunitiesService.getDiveCommunity(
        this.diveCommunityId
      );
      this.draggableMarkerPosition = {
        lat: this.diveCommunity.position.geopoint.latitude,
        lon: this.diveCommunity.position.geopoint.longitude,
      };
    } else {
      this.showDCId = true;
      this.diveCommunity = new DiveCommunity();
      this.diveCommunity.users = {
        [UserService.userRoles.uid]: ["owner"],
      };
      this.draggableMarkerPosition = {};
    }
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-dive-community-modal", {
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
      "height: " + mapHeight(this.diveCommunity.coverURL, true) + "px"
    ); //-cover photo -slider  - footer

    this.mapElement["mapLoaded"]().then(() => {
      this.mapElement.triggerMapResize();
    });
    this.mapElement.triggerMapResize();
    this.validateDiveCommunity();
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
    this.diveCommunity.setPosition(ev.detail.lat, ev.detail.lon);
    this.validateDiveCommunity();
  }

  updateAddress(ev) {
    this.diveCommunity.setAddress(ev.detail);
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
      this.diveCommunity[ev.detail.name] = val;
    } else if (ev.detail.name == "id") {
      this.setTmpId(ev.detail.value);
    } else {
      this.diveCommunity[ev.detail.name] = ev.detail.value;
    }
    this.updateView = !this.updateView;
    this.validateDiveCommunity();
  }

  setTmpId(value) {
    this.tmpDiveCommunityId = toLower(value)
      .trim()
      .split(" ")
      .join("-")
      .substring(0, 16);
  }

  updateImageUrls(ev) {
    const imageType = ev.detail.type;
    const url = ev.detail.url;
    if (imageType == "photo") {
      this.diveCommunity.photoURL = url;
    } else {
      this.diveCommunity.coverURL = url;
    }
  }

  uniqueIdValid(ev) {
    if (ev.detail) {
      this.diveCommunityId = this.tmpDiveCommunityId;
    } else {
      this.diveCommunityId = null;
    }
  }

  validateDiveCommunity() {
    this.validDiveCommunity =
      this.diveCommunity.position &&
      isNumber(this.diveCommunity.position.geopoint.latitude) &&
      isNumber(this.diveCommunity.position.geopoint.longitude) &&
      isString(this.diveCommunityId) &&
      isString(this.diveCommunity.displayName) &&
      isString(this.diveCommunity.description);
  }

  async save() {
    await DiveCommunitiesService.updateDiveCommunity(
      this.diveCommunityId,
      this.diveCommunity,
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
              collection: DIVECOMMUNITIESCOLLECTION,
              id: this.diveCommunityId,
              photoURL: this.diveCommunity.photoURL,
              coverURL: this.diveCommunity.coverURL,
            }}
            onCoverUploaded={(ev) => this.updateImageUrls(ev)}
          ></app-upload-cover>
        </ion-header>
        <app-header-segment-toolbar
          color='divecommunities'
          swiper={this.slider}
          titles={this.titles}
        ></app-header-segment-toolbar>
        <ion-content class='slides'>
          <swiper-container class='slider-dive-community-modal swiper'>
            <swiper-wrapper class='swiper-wrapper'>
              <swiper-slide class='swiper-slide'>
                <div id='map-container'>
                  <app-map
                    id='map'
                    pageId='dive-community'
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
                  <app-form-item
                    label-tag='name'
                    label-text='Name'
                    value={this.diveCommunity.displayName}
                    name='displayName'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    onFormItemBlur={() =>
                      this.setTmpId(this.diveCommunity.displayName)
                    }
                    validator={["required"]}
                  ></app-form-item>
                  {this.showDCId ? (
                    <app-form-item
                      label-tag='unique-id'
                      label-text='Unique ID'
                      value={this.tmpDiveCommunityId}
                      name='id'
                      input-type='text'
                      onFormItemChanged={(ev) => this.handleChange(ev)}
                      onIsValid={(ev) => this.uniqueIdValid(ev)}
                      validator={[
                        "required",
                        {
                          name: "uniqueid",
                          options: { type: DIVECOMMUNITIESCOLLECTION },
                        },
                      ]}
                    ></app-form-item>
                  ) : undefined}
                  <app-form-item
                    label-tag='description'
                    label-text='Description'
                    value={this.diveCommunity.description}
                    name='description'
                    textRows={10}
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag='phone'
                    label-text='Phone'
                    value={this.diveCommunity.phoneNumber}
                    name='phoneNumber'
                    input-type='tel'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  <app-form-item
                    label-tag='email'
                    label-text='Email'
                    value={this.diveCommunity.email}
                    name='email'
                    input-type='email'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["email"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag='website'
                    label-text='Website'
                    value={this.diveCommunity.website}
                    name='website'
                    input-type='url'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  {this.diveCommunity.website ? (
                    <a
                      class='ion-padding-start'
                      href={"http://" + this.diveCommunity.website}
                      target='_blank'
                    >
                      {"http://" + this.diveCommunity.website}
                    </a>
                  ) : undefined}
                  <app-form-item
                    label-tag='facebook-id'
                    label-text='Facebook ID'
                    value={this.diveCommunity.facebook}
                    name='facebook'
                    input-type='url'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  {this.diveCommunity.facebook ? (
                    <a
                      class='ion-padding-start'
                      href={
                        "https://www.facebook.com/" +
                        this.diveCommunity.facebook
                      }
                      target='_blank'
                    >
                      {"https://www.facebook.com/" +
                        this.diveCommunity.facebook}
                    </a>
                  ) : undefined}
                  <app-form-item
                    label-tag='instagram-id'
                    label-text='Instagram ID'
                    value={this.diveCommunity.instagram}
                    name='instagram'
                    input-type='url'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  {this.diveCommunity.instagram ? (
                    <a
                      class='ion-padding-start'
                      href={
                        "https://www.instagram.com/" +
                        this.diveCommunity.instagram
                      }
                      target='_blank'
                    >
                      {"https://www.instagram.com/" +
                        this.diveCommunity.instagram}
                    </a>
                  ) : undefined}
                  <app-form-item
                    label-tag='twitter id'
                    label-text='Twitter ID'
                    value={this.diveCommunity.twitter}
                    name='twitter'
                    input-type='url'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  {this.diveCommunity.twitter ? (
                    <a
                      class='ion-padding-start'
                      href={
                        "https://www.twitter.com/" + this.diveCommunity.twitter
                      }
                      target='_blank'
                    >
                      {"https://www.twitter.com/" + this.diveCommunity.twitter}
                    </a>
                  ) : undefined}
                </ion-list>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <app-users-list
                  item={this.diveCommunity}
                  editable
                  show={["owner", "editor"]}
                />
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
        </ion-content>
        <app-modal-footer
          disableSave={!this.validDiveCommunity}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
