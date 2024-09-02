import {Component, h, Prop, State, Element} from "@stencil/core";
import {UserRoles} from "../../../../../interfaces/common/user/user-roles";
import {UserService} from "../../../../../services/common/user";
import {
  DiveCommunitiesService,
  DIVECOMMUNITIESCOLLECTION,
} from "../../../../../services/udive/diveCommunities";
import {DiveCommunity} from "../../../../../interfaces/udive/dive-community/diveCommunity";
import {Marker} from "../../../../../interfaces/interfaces";
import {UDiveFilterService} from "../../../../../services/udive/ud-db-filter";
import {
  mapHeight,
  fabButtonTopMarginString,
} from "../../../../../helpers/utils";
import {DiveTripsService} from "../../../../../services/udive/diveTrips";
import {Subscription} from "rxjs";
import Swiper from "swiper";

@Component({
  tag: "page-dive-community-details",
  styleUrl: "page-dive-community-details.scss",
})
export class PageDiveCommunityDetails {
  @Element() el: HTMLElement;
  @Prop() dcid: string;
  admin = false;
  @State() diveCommunity: DiveCommunity;
  @State() diveTrips: any;
  @State() titles = [
    {tag: "information"},
    {tag: "map"},
    {tag: "next-trips", text: "Next Dive Trips"},
    {tag: "team"},
  ];
  @State() slider: Swiper;
  userRoles: UserRoles;
  markers: Marker[] = [];
  mapElement: HTMLAppMapElement;
  dcSubscription: Subscription;

  async componentWillLoad() {
    //check if admin page or user details page
    if (DiveCommunitiesService.selectedDiveCommunity) {
      //admin page
      this.admin = true;
      this.dcSubscription =
        DiveCommunitiesService.selectedDiveCommunity$.subscribe((dc) => {
          if (dc && dc.displayName) {
            this.diveCommunity = dc;
            this.dcid = DiveCommunitiesService.selectedDiveCommunityId;
          }
        });
    } else {
      this.admin = false;
      this.diveCommunity = await DiveCommunitiesService.getDiveCommunity(
        this.dcid
      );
      this.diveTrips = await DiveTripsService.getTripsSummary(
        DIVECOMMUNITIESCOLLECTION,
        this.dcid
      );
      delete this.titles[3];
      delete this.titles[2];
    }
    this.userRoles = UserService.userRoles;

    let dcIcon = UDiveFilterService.getMapDocs()[DIVECOMMUNITIESCOLLECTION]
      .icon as any;
    dcIcon.size = "large";
    this.markers.push({
      icon: dcIcon,
      latitude: this.diveCommunity.position.geopoint.latitude,
      longitude: this.diveCommunity.position.geopoint.longitude,
    });
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-dive-community", {
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
      "height: " + mapHeight(this.diveCommunity) + "px"
    ); //-cover photo -slider  - title
  }

  disconnectedCallback() {
    if (this.dcSubscription) this.dcSubscription.unsubscribe();
  }

  render() {
    return [
      <ion-header>
        <app-item-cover item={this.diveCommunity}></app-item-cover>
      </ion-header>,
      <ion-header>
        <ion-toolbar color="divecommunity" class="no-safe-padding">
          <ion-title>{this.diveCommunity.displayName}</ion-title>
        </ion-toolbar>
        <app-header-segment-toolbar
          color="divecommunity"
          swiper={this.slider}
          titles={this.titles}
          noHeader
        ></app-header-segment-toolbar>
      </ion-header>,
      <ion-content class="slides">
        {this.admin ? (
          <ion-fab
            vertical="top"
            horizontal="end"
            slot="fixed"
            style={{marginTop: fabButtonTopMarginString(2)}}
          >
            <ion-fab-button
              onClick={() =>
                DiveCommunitiesService.presentDiveCommunityUpdate(this.dcid)
              }
              class="fab-icon"
            >
              <ion-icon name="create"></ion-icon>
            </ion-fab-button>
          </ion-fab>
        ) : undefined}

        <swiper-container class="slider-dive-community swiper">
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
                      <p>{this.diveCommunity.description}</p>
                    </ion-text>
                  </ion-label>
                </ion-item>
                {this.diveCommunity.email ? (
                  <ion-item button href={"mailto:" + this.diveCommunity.email}>
                    <ion-icon slot="start" name="at-outline"></ion-icon>
                    <ion-label>{this.diveCommunity.email}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.diveCommunity.phoneNumber ? (
                  <ion-item
                    button
                    href={"tel:" + this.diveCommunity.phoneNumber}
                  >
                    <ion-icon slot="start" name="call-outline"></ion-icon>
                    <ion-label>{this.diveCommunity.phoneNumber}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.diveCommunity.website ? (
                  <ion-item
                    button
                    href={"http://" + this.diveCommunity.website}
                    target="_blank"
                  >
                    <ion-icon slot="start" name="link-outline"></ion-icon>
                    <ion-label>{this.diveCommunity.website}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.diveCommunity.facebook ? (
                  <ion-item
                    button
                    href={
                      "https://www.facebook.com/" + this.diveCommunity.facebook
                    }
                    target="_blank"
                  >
                    <ion-icon slot="start" name="logo-facebook"></ion-icon>
                    <ion-label>{this.diveCommunity.facebook}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.diveCommunity.instagram ? (
                  <ion-item
                    button
                    href={
                      "https://www.instagram.com/" +
                      this.diveCommunity.instagram
                    }
                    target="_blank"
                  >
                    <ion-icon slot="start" name="logo-instagram"></ion-icon>
                    <ion-label>{this.diveCommunity.instagram}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.diveCommunity.twitter ? (
                  <ion-item
                    button
                    href={
                      "https://www.twitter.com/" + this.diveCommunity.twitter
                    }
                    target="_blank"
                  >
                    <ion-icon slot="start" name="logo-twitter"></ion-icon>
                    <ion-label>@{this.diveCommunity.twitter}</ion-label>
                  </ion-item>
                ) : undefined}
              </ion-list>
            </swiper-slide>

            <swiper-slide class="swiper-slide">
              <div id="map-container">
                <app-map
                  id="map"
                  pageId="dive-community-details"
                  center={this.diveCommunity}
                  markers={this.markers}
                ></app-map>
              </div>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <app-calendar
                calendarId="community-calendar"
                addEvents={{trips: this.diveTrips}}
              ></app-calendar>
            </swiper-slide>
            {this.admin ? (
              <swiper-slide class="swiper-slide">
                <app-users-list
                  item={this.diveCommunity}
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
                DiveCommunitiesService.deleteDiveCommunity(this.dcid)
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
