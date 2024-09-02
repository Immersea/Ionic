import {Component, h, Prop, State, Element} from "@stencil/core";
import {UserRoles} from "../../../../../interfaces/common/user/user-roles";
import {UserService} from "../../../../../services/common/user";
import {
  ServiceCentersService,
  SERVICECENTERSCOLLECTION,
} from "../../../../../services/udive/serviceCenters";
import {ServiceCenter} from "../../../../../interfaces/udive/service-center/serviceCenter";
import {Marker} from "../../../../../interfaces/interfaces";
import {RouterService} from "../../../../../services/common/router";
import {UDiveFilterService} from "../../../../../services/udive/ud-db-filter";
import {
  mapHeight,
  fabButtonTopMarginString,
} from "../../../../../helpers/utils";
import {Subscription} from "rxjs";
import Swiper from "swiper";

@Component({
  tag: "page-service-center-details",
  styleUrl: "page-service-center-details.scss",
})
export class PageServiceCenterDetails {
  @Element() el: HTMLElement;
  @Prop() centerid: string;
  admin = false;
  @State() serviceCenter: ServiceCenter;
  @State() titles = [{tag: "map"}, {tag: "information"}, {tag: "team"}];
  @State() slider: Swiper;
  userRoles: UserRoles;
  markers: Marker[] = [];
  mapElement: HTMLAppMapElement;
  scSubscription: Subscription;

  async componentWillLoad() {
    //check if admin page or user details page
    if (ServiceCentersService.selectedServiceCenter) {
      //admin page
      this.admin = true;
      this.scSubscription =
        ServiceCentersService.selectedServiceCenter$.subscribe((sc) => {
          if (sc && sc.displayName) {
            this.serviceCenter = sc;
            this.centerid = ServiceCentersService.selectedServiceCenterId;
          }
        });
    } else {
      this.admin = false;
      delete this.titles[2];
      this.serviceCenter = await ServiceCentersService.getServiceCenter(
        this.centerid
      );
    }

    this.userRoles = UserService.userRoles;
    let icon = UDiveFilterService.getMapDocs()[SERVICECENTERSCOLLECTION]
      .icon as any;
    icon.size = "large";
    this.markers.push({
      icon: icon,
      latitude: this.serviceCenter.position.geopoint.latitude,
      longitude: this.serviceCenter.position.geopoint.longitude,
    });
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-service-center", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
    });
    //reset map height inside slide
    await customElements.whenDefined("app-map");
    this.mapElement = this.el.querySelector("#map");
    const mapContainer = this.el.querySelector("#map-container");
    mapContainer.setAttribute(
      "style",
      "height: " + mapHeight(this.serviceCenter) + "px"
    ); //-cover photo -slider  - title
    this.mapElement["mapLoaded"]().then(() => {
      this.mapElement.triggerMapResize();
    });
    this.mapElement.triggerMapResize();
  }

  disconnectedCallback() {
    if (this.scSubscription) this.scSubscription.unsubscribe();
  }

  render() {
    return [
      <ion-header>
        <app-item-cover item={this.serviceCenter}></app-item-cover>
      </ion-header>,
      <ion-header>
        <ion-toolbar color="servicecenter" class="no-safe-padding">
          {this.serviceCenter && !this.serviceCenter.coverURL
            ? [
                <ion-buttons slot="start">
                  {this.admin ? (
                    <ion-menu-button />
                  ) : (
                    <ion-button
                      onClick={() => RouterService.goBack()}
                      icon-only
                    >
                      <ion-icon name="arrow-back"></ion-icon>
                    </ion-button>
                  )}
                </ion-buttons>,
                <ion-buttons slot="end">
                  {this.admin ? (
                    <ion-button
                      onClick={() =>
                        ServiceCentersService.presentServiceCenterUpdate(
                          this.centerid
                        )
                      }
                      icon-only
                    >
                      <ion-icon name="create"></ion-icon>
                    </ion-button>
                  ) : undefined}
                </ion-buttons>,
              ]
            : undefined}
          <ion-title>{this.serviceCenter.displayName}</ion-title>
        </ion-toolbar>
      </ion-header>,
      <app-header-segment-toolbar
        color="servicecenter"
        swiper={this.slider}
        titles={this.titles}
      ></app-header-segment-toolbar>,
      <ion-content class="slides">
        {this.serviceCenter && this.serviceCenter.coverURL ? (
          <ion-fab
            vertical="top"
            horizontal="start"
            slot="fixed"
            style={{marginTop: fabButtonTopMarginString(2)}}
          >
            {this.admin ? (
              <ion-fab-button class="fab-icon">
                <ion-menu-button />
              </ion-fab-button>
            ) : (
              <ion-fab-button
                onClick={() => RouterService.goBack()}
                class="fab-icon"
              >
                <ion-icon name="arrow-back-circle-outline"></ion-icon>
              </ion-fab-button>
            )}
          </ion-fab>
        ) : undefined}
        {this.admin ? (
          <ion-fab
            vertical="top"
            horizontal="end"
            slot="fixed"
            style={{marginTop: fabButtonTopMarginString(2)}}
          >
            <ion-fab-button
              onClick={() =>
                ServiceCentersService.presentServiceCenterUpdate(this.centerid)
              }
              class="fab-icon"
            >
              <ion-icon name="create"></ion-icon>
            </ion-fab-button>
          </ion-fab>
        ) : undefined}
        <swiper-container class="slider-service-center swiper">
          <swiper-wrapper class="swiper-wrapper">
            <swiper-slide class="swiper-slide">
              <ion-list class="ion-no-padding">
                <ion-list-header>
                  <ion-label color="servicecenter">
                    <my-transl
                      tag="general-information"
                      text="General Information"
                    />
                  </ion-label>
                </ion-list-header>
                <ion-item>
                  <ion-label class="ion-text-wrap">
                    <ion-text color="dark">
                      <p>{this.serviceCenter.description}</p>
                    </ion-text>
                  </ion-label>
                </ion-item>
                {this.serviceCenter.email ? (
                  <ion-item button href={"mailto:" + this.serviceCenter.email}>
                    <ion-icon slot="start" name="at-outline"></ion-icon>
                    <ion-label>{this.serviceCenter.email}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.serviceCenter.phoneNumber ? (
                  <ion-item
                    button
                    href={"tel:" + this.serviceCenter.phoneNumber}
                  >
                    <ion-icon slot="start" name="call-outline"></ion-icon>
                    <ion-label>{this.serviceCenter.phoneNumber}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.serviceCenter.website ? (
                  <ion-item
                    button
                    href={"http://" + this.serviceCenter.website}
                    target="_blank"
                  >
                    <ion-icon slot="start" name="link-outline"></ion-icon>
                    <ion-label>{this.serviceCenter.website}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.serviceCenter.facebook ? (
                  <ion-item
                    button
                    href={
                      "https://www.facebook.com/" + this.serviceCenter.facebook
                    }
                    target="_blank"
                  >
                    <ion-icon slot="start" name="logo-facebook"></ion-icon>
                    <ion-label>{this.serviceCenter.facebook}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.serviceCenter.instagram ? (
                  <ion-item
                    button
                    href={
                      "https://www.instagram.com/" +
                      this.serviceCenter.instagram
                    }
                    target="_blank"
                  >
                    <ion-icon slot="start" name="logo-instagram"></ion-icon>
                    <ion-label>{this.serviceCenter.instagram}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.serviceCenter.twitter ? (
                  <ion-item
                    button
                    href={
                      "https://www.twitter.com/" + this.serviceCenter.twitter
                    }
                    target="_blank"
                  >
                    <ion-icon slot="start" name="logo-twitter"></ion-icon>
                    <ion-label>@{this.serviceCenter.twitter}</ion-label>
                  </ion-item>
                ) : undefined}
              </ion-list>
            </swiper-slide>

            <swiper-slide class="swiper-slide">
              <div id="map-container">
                <app-map
                  id="map"
                  pageId="dive-site-details"
                  center={this.serviceCenter}
                  markers={this.markers}
                ></app-map>
              </div>
            </swiper-slide>
            {this.admin ? (
              <swiper-slide class="swiper-slide">
                <app-users-list
                  item={this.serviceCenter}
                  show={["owner", "editor"]}
                />
              </swiper-slide>
            ) : undefined}
          </swiper-wrapper>
        </swiper-container>
      </ion-content>,
      this.admin ? (
        <ion-footer class="ion-no-border">
          <ion-toolbar>
            <ion-button
              expand="block"
              fill="solid"
              color="danger"
              onClick={() =>
                ServiceCentersService.deleteServiceCenter(this.centerid)
              }
            >
              <ion-icon slot="start" name="trash"></ion-icon>
              <my-transl tag="delete" text="Delete" isLabel></my-transl>
            </ion-button>
          </ion-toolbar>
        </ion-footer>
      ) : undefined,
    ];
  }
}
