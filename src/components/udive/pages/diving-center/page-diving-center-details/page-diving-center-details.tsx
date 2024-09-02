import {Component, h, Prop, State, Element} from "@stencil/core";
import {UserRoles} from "../../../../../interfaces/common/user/user-roles";
import {UserService} from "../../../../../services/common/user";
import {
  DivingCentersService,
  DIVECENTERSSCOLLECTION,
} from "../../../../../services/udive/divingCenters";
import {DivingCenter} from "../../../../../interfaces/udive/diving-center/divingCenter";
import {Marker} from "../../../../../interfaces/interfaces";
import {RouterService} from "../../../../../services/common/router";
import {UDiveFilterService} from "../../../../../services/udive/ud-db-filter";
import {
  mapHeight,
  fabButtonTopMarginString,
} from "../../../../../helpers/utils";
import {DIVESITESCOLLECTION} from "../../../../../services/udive/diveSites";
import {DiveTripsService} from "../../../../../services/udive/diveTrips";
import {Subscription} from "rxjs";
import Swiper from "swiper";

@Component({
  tag: "page-diving-center-details",
  styleUrl: "page-diving-center-details.scss",
})
export class PageDivingCenterDetails {
  @Element() el: HTMLElement;
  @Prop() dcid: string;
  admin = false;
  @State() divingCenter: DivingCenter;
  @State() diveTrips: any;
  @State() diveSites: any;
  @State() titles = [
    {tag: "map"},
    {tag: "information"},
    {tag: "dive-sites"},
    {tag: "team"},
    {tag: "next-trips", text: "Next Dive Trips"},
  ];
  @State() slider: Swiper;
  userRoles: UserRoles;
  markers: Marker[] = [];
  mapElement: HTMLAppMapElement;
  dcSubscription: Subscription;

  async componentWillLoad() {
    //check if admin page or user details page
    if (DivingCentersService.selectedDivingCenter) {
      //admin page
      this.admin = true;
      this.dcSubscription =
        DivingCentersService.selectedDivingCenter$.subscribe((dc) => {
          if (dc && dc.displayName) {
            this.divingCenter = dc;
            this.dcid = DivingCentersService.selectedDivingCenterId;
          }
        });
    } else {
      this.admin = false;
      delete this.titles[4];
      delete this.titles[3];
      this.divingCenter = await DivingCentersService.getDivingCenter(this.dcid);
      this.diveTrips = await DiveTripsService.getTripsSummary(
        DIVECENTERSSCOLLECTION,
        this.dcid
      );
    }
    this.userRoles = UserService.userRoles;

    this.diveSites = DivingCentersService.loadDivingCenterSites(
      this.divingCenter
    );
    let dcIcon = UDiveFilterService.getMapDocs()[DIVECENTERSSCOLLECTION]
      .icon as any;
    dcIcon.size = "large";
    this.markers.push({
      icon: dcIcon,
      latitude: this.divingCenter.position.geopoint.latitude,
      longitude: this.divingCenter.position.geopoint.longitude,
    });
    let siteIcon = UDiveFilterService.getMapDocs()[DIVESITESCOLLECTION]
      .icon as any;
    siteIcon.size = "small";
    this.diveSites.divingCenterSites.forEach((site) => {
      this.markers.push({
        name: site.displayName,
        icon: siteIcon,
        latitude: site.position.geopoint.latitude,
        longitude: site.position.geopoint.longitude,
      });
    });
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
    this.mapElement = this.el.querySelector("#map");
    const mapContainer = this.el.querySelector("#map-container");
    mapContainer.setAttribute(
      "style",
      "height: " + mapHeight(this.divingCenter) + "px"
    ); //-cover photo -slider  - title
    this.mapElement["mapLoaded"]().then(() => {
      //add dive sites lines
      this.setLinesForDiveCenter();
    });
    //add dive sites lines
    this.setLinesForDiveCenter();
  }

  disconnectedCallback() {
    if (this.dcSubscription) this.dcSubscription.unsubscribe();
  }

  setLinesForDiveCenter() {
    this.mapElement.triggerMapResize();
    const pointsArray = [this.divingCenter];
    this.diveSites.divingCenterSites.forEach(async (site) => {
      pointsArray.push(site);
      this.mapElement["createLine"](site.id, this.divingCenter, site);
    });
    this.mapElement["fitToBounds"](pointsArray);
  }

  render() {
    return [
      <ion-header>
        <app-item-cover item={this.divingCenter}></app-item-cover>
      </ion-header>,
      <ion-header>
        <ion-toolbar color="divingcenter" class="no-safe-padding">
          {this.divingCenter && !this.divingCenter.coverURL
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
                        DivingCentersService.presentDivingCenterUpdate(
                          this.dcid
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
          <ion-title>{this.divingCenter.displayName}</ion-title>
        </ion-toolbar>
      </ion-header>,
      <app-header-segment-toolbar
        color="divingcenter"
        swiper={this.slider}
        titles={this.titles}
      ></app-header-segment-toolbar>,
      <ion-content class="slides">
        {this.divingCenter && this.divingCenter.coverURL ? (
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
                DivingCentersService.presentDivingCenterUpdate(this.dcid)
              }
              class="fab-icon"
            >
              <ion-icon name="create"></ion-icon>
            </ion-fab-button>
          </ion-fab>
        ) : undefined}

        <swiper-container class="slider-diving-center swiper">
          <swiper-wrapper class="swiper-wrapper">
            <swiper-slide class="swiper-slide">
              <ion-list class="ion-no-padding">
                <ion-list-header>
                  <ion-label color="divingcenter">
                    <my-transl
                      tag="general-information"
                      text="General Information"
                    />
                  </ion-label>
                </ion-list-header>
                <ion-item>
                  <ion-label class="ion-text-wrap">
                    <ion-text color="dark">
                      <p>{this.divingCenter.description}</p>
                    </ion-text>
                  </ion-label>
                </ion-item>
                {this.divingCenter.email ? (
                  <ion-item button href={"mailto:" + this.divingCenter.email}>
                    <ion-icon slot="start" name="at-outline"></ion-icon>
                    <ion-label>{this.divingCenter.email}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.divingCenter.phoneNumber ? (
                  <ion-item
                    button
                    href={"tel:" + this.divingCenter.phoneNumber}
                  >
                    <ion-icon slot="start" name="call-outline"></ion-icon>
                    <ion-label>{this.divingCenter.phoneNumber}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.divingCenter.website ? (
                  <ion-item
                    button
                    href={"http://" + this.divingCenter.website}
                    target="_blank"
                  >
                    <ion-icon slot="start" name="link-outline"></ion-icon>
                    <ion-label>{this.divingCenter.website}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.divingCenter.facebook ? (
                  <ion-item
                    button
                    href={
                      "https://www.facebook.com/" + this.divingCenter.facebook
                    }
                    target="_blank"
                  >
                    <ion-icon slot="start" name="logo-facebook"></ion-icon>
                    <ion-label>{this.divingCenter.facebook}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.divingCenter.instagram ? (
                  <ion-item
                    button
                    href={
                      "https://www.instagram.com/" + this.divingCenter.instagram
                    }
                    target="_blank"
                  >
                    <ion-icon slot="start" name="logo-instagram"></ion-icon>
                    <ion-label>{this.divingCenter.instagram}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.divingCenter.twitter ? (
                  <ion-item
                    button
                    href={
                      "https://www.twitter.com/" + this.divingCenter.twitter
                    }
                    target="_blank"
                  >
                    <ion-icon slot="start" name="logo-twitter"></ion-icon>
                    <ion-label>@{this.divingCenter.twitter}</ion-label>
                  </ion-item>
                ) : undefined}
              </ion-list>
            </swiper-slide>

            <swiper-slide class="swiper-slide">
              <div id="map-container">
                <app-map
                  id="map"
                  pageId="diving-center-details"
                  center={this.divingCenter}
                  markers={this.markers}
                ></app-map>
              </div>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <ion-grid>
                <ion-row class="ion-text-start">
                  {this.diveSites.divingCenterSites.map((site) => (
                    <ion-col size-sm="12" size-md="6" size-lg="4">
                      <app-dive-site-card
                        diveSite={site}
                        startlocation={this.divingCenter}
                        edit={false}
                      />
                    </ion-col>
                  ))}
                </ion-row>
              </ion-grid>
            </swiper-slide>
            {this.admin ? (
              <swiper-slide class="swiper-slide">
                <app-users-list
                  item={this.divingCenter}
                  show={["owner", "editor"]}
                />
              </swiper-slide>
            ) : (
              <swiper-slide class="swiper-slide">
                <app-calendar
                  calendarId="diving-center-calendar"
                  addEvents={{trips: this.diveTrips}}
                ></app-calendar>
              </swiper-slide>
            )}
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
              onClick={() => DivingCentersService.deleteDivingCenter(this.dcid)}
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
