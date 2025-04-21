import { Component, h, Host, Prop, State, Element } from "@stencil/core";
import { ServiceCenter } from "../../../../../interfaces/udive/service-center/serviceCenter";
import { modalController } from "@ionic/core";
import { isNumber, isString, toLower, toNumber } from "lodash";
import { Subscription } from "rxjs";
import { UserService } from "../../../../../services/common/user";
import {
  ServiceCentersService,
  SERVICECENTERSCOLLECTION,
} from "../../../../../services/udive/serviceCenters";
import { UserProfile } from "../../../../../interfaces/common/user/user-profile";
import { mapHeight } from "../../../../../helpers/utils";
import Swiper from "swiper";

@Component({
  tag: "modal-service-center-update",
  styleUrl: "modal-service-center-update.scss",
})
export class ModalServiceCenterUpdate {
  @Element() el: HTMLElement;
  @Prop() serviceCenterId: string = undefined;
  @State() serviceCenter: ServiceCenter;
  @State() updateView = true;
  @State() validServiceCenter = false;
  @State() divingCourses: {
    serviceCenterCourses: any[];
    serviceCenterCoursesSelect: any[];
  };
  @State() tmpServiceCenterId: string;
  @State() showSCId = false;
  @State() titles = [
    { tag: "map" },
    { tag: "position" },
    { tag: "information" },
    { tag: "team" },
  ];

  mapElement: HTMLAppMapElement;
  @State() slider: Swiper;
  draggableMarkerPosition: any;
  userProfile: UserProfile;
  userProfileSub$: Subscription;

  async componentWillLoad() {
    this.userProfileSub$ = UserService.userProfile$.subscribe(
      (userProfile: UserProfile) => {
        this.userProfile = new UserProfile(userProfile);
      }
    );
    await this.loadServiceCenter();
  }

  async loadServiceCenter() {
    if (this.serviceCenterId) {
      this.serviceCenter = await ServiceCentersService.getServiceCenter(
        this.serviceCenterId
      );
      this.draggableMarkerPosition = {
        lat: this.serviceCenter.position.geopoint.latitude,
        lon: this.serviceCenter.position.geopoint.longitude,
      };
    } else {
      this.serviceCenter = new ServiceCenter();
      this.draggableMarkerPosition = {};
    }
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-service-center", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
      on: {
        slideChange: () => {
          this.slider ? this.slider.updateAutoHeight() : null;
          this.slider.updateSize();
        },
      },
    });
    //reset map height inside slide
    await customElements.whenDefined("app-map");
    this.mapElement = this.el.querySelector("#map") as any;
    const mapContainer = this.el.querySelector("#map-container");
    mapContainer.setAttribute(
      "style",
      "height: " + mapHeight(this.serviceCenter, true) + "px"
    ); //-cover photo -slider  - footer

    this.mapElement["mapLoaded"]().then(() => {
      this.mapElement.triggerMapResize();
    });
    this.mapElement.triggerMapResize();
    this.validateServiceCenter();
  }

  disconnectedCallback() {
    this.userProfileSub$.unsubscribe();
  }

  updateLocation(ev) {
    this.draggableMarkerPosition = {
      lat: toNumber(ev.detail.lat),
      lon: toNumber(ev.detail.lon),
    };
    this.serviceCenter.setPosition(ev.detail.lat, ev.detail.lon);
    this.validateServiceCenter();
  }

  updateAddress(ev) {
    this.serviceCenter.setAddress(ev.detail);
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
      this.serviceCenter[ev.detail.name] = val;
    } else if (ev.detail.name == "id") {
      this.setTmpId(ev.detail.value);
    } else {
      this.serviceCenter[ev.detail.name] = ev.detail.value;
    }
    this.updateView = !this.updateView;
    this.validateServiceCenter();
  }
  setTmpId(value) {
    this.tmpServiceCenterId = toLower(value)
      .trim()
      .split(" ")
      .join("-")
      .substring(0, 16);
  }
  uniqueIdValid(ev) {
    if (ev.detail) {
      this.serviceCenterId = this.tmpServiceCenterId;
    } else {
      this.serviceCenterId = null;
    }
  }

  updateImageUrls(ev) {
    const imageType = ev.detail.type;
    const url = ev.detail.url;
    if (imageType == "photo") {
      this.serviceCenter.photoURL = url;
    } else {
      this.serviceCenter.coverURL = url;
    }
  }

  validateServiceCenter() {
    this.validServiceCenter =
      isNumber(this.serviceCenter.position.geopoint.latitude) &&
      isNumber(this.serviceCenter.position.geopoint.longitude) &&
      isString(this.serviceCenter.displayName) &&
      isString(this.serviceCenter.description);
  }

  async save() {
    await ServiceCentersService.updateServiceCenter(
      this.serviceCenterId,
      this.serviceCenter,
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
              collection: SERVICECENTERSCOLLECTION,
              id: this.serviceCenterId,
              photoURL: this.serviceCenter.photoURL,
              coverURL: this.serviceCenter.coverURL,
            }}
            onCoverUploaded={(ev) => this.updateImageUrls(ev)}
          ></app-upload-cover>
        </ion-header>
        <app-header-segment-toolbar
          color='servicecenter'
          swiper={this.slider}
          titles={this.titles}
        ></app-header-segment-toolbar>
        <ion-content class='slides'>
          <swiper-container class='slider-service-center swiper'>
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
                  <app-form-item
                    label-tag='name'
                    label-text='Name'
                    value={this.serviceCenter.displayName}
                    name='displayName'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  {this.showSCId ? (
                    <app-form-item
                      label-tag='unique-id'
                      label-text='Unique ID'
                      value={this.tmpServiceCenterId}
                      name='id'
                      input-type='text'
                      onFormItemChanged={(ev) => this.handleChange(ev)}
                      onIsValid={(ev) => this.uniqueIdValid(ev)}
                      validator={[
                        "required",
                        {
                          name: "uniqueid",
                          options: { type: SERVICECENTERSCOLLECTION },
                        },
                      ]}
                    ></app-form-item>
                  ) : undefined}
                  <app-form-item
                    label-tag='description'
                    label-text='Description'
                    value={this.serviceCenter.description}
                    name='description'
                    textRows={10}
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag='phone'
                    label-text='Phone'
                    value={this.serviceCenter.phoneNumber}
                    name='phoneNumber'
                    input-type='tel'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  <app-form-item
                    label-tag='email'
                    label-text='Email'
                    value={this.serviceCenter.email}
                    name='email'
                    input-type='email'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["email"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag='website'
                    label-text='Website'
                    value={this.serviceCenter.website}
                    name='website'
                    input-type='url'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  {this.serviceCenter.website ? (
                    <a
                      class='ion-padding-start'
                      href={"http://" + this.serviceCenter.website}
                      target='_blank'
                    >
                      {"http://" + this.serviceCenter.website}
                    </a>
                  ) : undefined}
                  <app-form-item
                    label-tag='facebook-id'
                    label-text='Facebook ID'
                    value={this.serviceCenter.facebook}
                    name='facebook'
                    input-type='url'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  {this.serviceCenter.facebook ? (
                    <a
                      class='ion-padding-start'
                      href={
                        "https://www.facebook.com/" +
                        this.serviceCenter.facebook
                      }
                      target='_blank'
                    >
                      {"https://www.facebook.com/" +
                        this.serviceCenter.facebook}
                    </a>
                  ) : undefined}
                  <app-form-item
                    label-tag='instagram-id'
                    label-text='Instagram ID'
                    value={this.serviceCenter.instagram}
                    name='instagram'
                    input-type='url'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  {this.serviceCenter.instagram ? (
                    <a
                      class='ion-padding-start'
                      href={
                        "https://www.instagram.com/" +
                        this.serviceCenter.instagram
                      }
                      target='_blank'
                    >
                      {"https://www.instagram.com/" +
                        this.serviceCenter.instagram}
                    </a>
                  ) : undefined}
                  <app-form-item
                    label-tag='twitter id'
                    label-text='Twitter ID'
                    value={this.serviceCenter.twitter}
                    name='twitter'
                    input-type='url'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  {this.serviceCenter.twitter ? (
                    <a
                      class='ion-padding-start'
                      href={
                        "https://www.twitter.com/" + this.serviceCenter.twitter
                      }
                      target='_blank'
                    >
                      {"https://www.twitter.com/" + this.serviceCenter.twitter}
                    </a>
                  ) : undefined}
                </ion-list>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <app-users-list
                  item={this.serviceCenter}
                  editable
                  show={["owner", "editor"]}
                />
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
        </ion-content>
        <app-modal-footer
          disableSave={!this.validServiceCenter}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
