import {Component, h, Prop, State, Element} from "@stencil/core";
import {UserRoles} from "../../../../../interfaces/common/user/user-roles";
import {UserService} from "../../../../../services/common/user";
import {
  DivingSchoolsService,
  DIVESCHOOLSSCOLLECTION,
} from "../../../../../services/udive/divingSchools";
import {DivingSchool} from "../../../../../interfaces/udive/diving-school/divingSchool";
import {Marker} from "../../../../../interfaces/interfaces";
import {RouterService} from "../../../../../services/common/router";
import {UDiveFilterService} from "../../../../../services/udive/ud-db-filter";
import {
  mapHeight,
  fabButtonTopMarginString,
} from "../../../../../helpers/utils";
import {
  DiveTripsService,
  DIVETRIPSCOLLECTION,
} from "../../../../../services/udive/diveTrips";
import {Subscription} from "rxjs";
import Swiper from "swiper";

@Component({
  tag: "page-diving-school-details",
  styleUrl: "page-diving-school-details.scss",
})
export class PageDivingSchoolDetails {
  @Element() el: HTMLElement;
  @Prop() dsid: string;
  admin = false;
  @State() divingSchool: DivingSchool;
  @State() diveTrips: any;
  @State() divingCourses: any;
  @State() titles = [
    {tag: "map"},
    {tag: "information"},
    {tag: "diving-courses"},
    {tag: "team"},
    {tag: "next-trips", text: "Next Dive Trips"},
  ];
  @State() slider: Swiper;
  userRoles: UserRoles;
  markers: Marker[] = [];
  mapElement: HTMLAppMapElement;
  dsSubscription: Subscription;

  async componentWillLoad() {
    //check if admin page or user details page
    if (DivingSchoolsService.selectedDivingSchool) {
      //admin page
      this.admin = true;
      this.dsSubscription =
        DivingSchoolsService.selectedDivingSchool$.subscribe((ds) => {
          if (ds && ds.displayName) {
            this.divingSchool = ds;
            this.dsid = DivingSchoolsService.selectedDivingSchoolId;
          }
        });
    } else {
      this.admin = false;
      delete this.titles[4];
      delete this.titles[3];
      this.divingSchool = await DivingSchoolsService.getDivingSchool(this.dsid);
      this.diveTrips = await DiveTripsService.getTripsSummary(
        DIVETRIPSCOLLECTION,
        this.dsid
      );
    }

    this.userRoles = UserService.userRoles;
    this.divingCourses = await DivingSchoolsService.loadDivingSchoolCourses(
      this.divingSchool
    );
    let icon = UDiveFilterService.getMapDocs()[DIVESCHOOLSSCOLLECTION]
      .icon as any;
    icon.size = "large";
    this.markers.push({
      icon: icon,
      latitude: this.divingSchool.position.geopoint.latitude,
      longitude: this.divingSchool.position.geopoint.longitude,
    });
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-diving-school", {
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
      "height: " + mapHeight(this.divingSchool) + "px"
    ); //-cover photo -slider  - title
    this.mapElement["mapLoaded"]().then(() => {
      this.mapElement.triggerMapResize();
    });
    this.mapElement.triggerMapResize();
  }

  disconnectedCallback() {
    if (this.dsSubscription) this.dsSubscription.unsubscribe();
  }

  render() {
    return [
      <ion-header>
        <app-item-cover item={this.divingSchool}></app-item-cover>
      </ion-header>,
      <ion-header>
        <ion-toolbar color="school" class="no-safe-padding">
          {this.divingSchool && !this.divingSchool.coverURL
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
                        DivingSchoolsService.presentDivingSchoolUpdate(
                          this.dsid
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
          <ion-title>{this.divingSchool.displayName}</ion-title>
        </ion-toolbar>
      </ion-header>,
      <app-header-segment-toolbar
        color="school"
        swiper={this.slider}
        titles={this.titles}
      ></app-header-segment-toolbar>,
      <ion-content class="slides">
        {this.divingSchool && this.divingSchool.coverURL ? (
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
                DivingSchoolsService.presentDivingSchoolUpdate(this.dsid)
              }
              class="fab-icon"
            >
              <ion-icon name="create"></ion-icon>
            </ion-fab-button>
          </ion-fab>
        ) : undefined}
        <swiper-container class="slider-diving-school swiper">
          <swiper-wrapper class="swiper-wrapper">
            <swiper-slide class="swiper-slide">
              <ion-list class="ion-no-padding">
                <ion-list-header>
                  <ion-label color="school">
                    <my-transl
                      tag="general-information"
                      text="General Information"
                    />
                  </ion-label>
                </ion-list-header>
                <ion-item>
                  <ion-label class="ion-text-wrap">
                    <ion-text color="dark">
                      <p>{this.divingSchool.description}</p>
                    </ion-text>
                  </ion-label>
                </ion-item>
                {this.divingSchool.email ? (
                  <ion-item button href={"mailto:" + this.divingSchool.email}>
                    <ion-icon slot="start" name="at-outline"></ion-icon>
                    <ion-label>{this.divingSchool.email}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.divingSchool.phoneNumber ? (
                  <ion-item
                    button
                    href={"tel:" + this.divingSchool.phoneNumber}
                  >
                    <ion-icon slot="start" name="call-outline"></ion-icon>
                    <ion-label>{this.divingSchool.phoneNumber}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.divingSchool.website ? (
                  <ion-item
                    button
                    href={"http://" + this.divingSchool.website}
                    target="_blank"
                  >
                    <ion-icon slot="start" name="link-outline"></ion-icon>
                    <ion-label>{this.divingSchool.website}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.divingSchool.facebook ? (
                  <ion-item
                    button
                    href={
                      "https://www.facebook.com/" + this.divingSchool.facebook
                    }
                    target="_blank"
                  >
                    <ion-icon slot="start" name="logo-facebook"></ion-icon>
                    <ion-label>{this.divingSchool.facebook}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.divingSchool.instagram ? (
                  <ion-item
                    button
                    href={
                      "https://www.instagram.com/" + this.divingSchool.instagram
                    }
                    target="_blank"
                  >
                    <ion-icon slot="start" name="logo-instagram"></ion-icon>
                    <ion-label>{this.divingSchool.instagram}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.divingSchool.twitter ? (
                  <ion-item
                    button
                    href={
                      "https://www.twitter.com/" + this.divingSchool.twitter
                    }
                    target="_blank"
                  >
                    <ion-icon slot="start" name="logo-twitter"></ion-icon>
                    <ion-label>@{this.divingSchool.twitter}</ion-label>
                  </ion-item>
                ) : undefined}
              </ion-list>
            </swiper-slide>

            <swiper-slide class="swiper-slide">
              <div id="map-container">
                <app-map
                  id="map"
                  pageId="dive-site-details"
                  center={this.divingSchool}
                  markers={this.markers}
                ></app-map>
              </div>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <ion-grid>
                <ion-row class="ion-text-start">
                  {this.divingCourses.divingSchoolCourses.map((course) => (
                    <ion-col size-sm="12" size-md="6" size-lg="4">
                      <app-dive-course-card
                        divingCourse={course}
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
                  item={this.divingSchool}
                  show={["owner", "editor", "instructor"]}
                />
              </swiper-slide>
            ) : (
              <swiper-slide class="swiper-slide">
                <app-calendar
                  calendarId="diving-school-calendar"
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
              onClick={() => DivingSchoolsService.deleteDivingSchool(this.dsid)}
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
