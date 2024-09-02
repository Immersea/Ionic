import {Component, h, State, Element, Host, Prop} from "@stencil/core";
import {UserService} from "../../../../../services/common/user";
import {
  fabButtonTopMarginString,
  slideHeight,
} from "../../../../../helpers/utils";
import {UserPubicProfile} from "../../../../../interfaces/common/user/user-public-profile";
import {RouterService} from "../../../../../services/common/router";
import {
  DIVESCHOOLSSCOLLECTION,
  DivingSchoolsService,
} from "../../../../../services/udive/divingSchools";
import {
  DIVECENTERSSCOLLECTION,
  DivingCentersService,
} from "../../../../../services/udive/divingCenters";
import {
  SERVICECENTERSCOLLECTION,
  ServiceCentersService,
} from "../../../../../services/udive/serviceCenters";
import {ClientData} from "../../../../../interfaces/udive/clients/clients";
import Swiper from "swiper";
import {Environment} from "../../../../../global/env";

@Component({
  tag: "page-client-details",
  styleUrl: "page-client-details.scss",
})
export class PageClientDetails {
  @Element() el: HTMLElement;
  @Prop() clientId: string;
  @State() clientData: ClientData;
  @State() userProfile: UserPubicProfile;
  @State() counters = {
    classes: 0,
    trips: 0,
    invoices: 0,
  };
  organiserId: string;
  @State() titles = [
    {tag: "details"},
    {tag: "dive-trips"},
    {tag: "diving-classes"},
    {tag: "invoices"},
  ];
  @State() slider: Swiper;

  async componentWillLoad() {
    this.userProfile = await UserService.getPublicProfileUserDetails(
      this.clientId
    );

    const url = RouterService.pageTo;
    if (url.includes(DIVECENTERSSCOLLECTION.toLowerCase())) {
      this.clientData =
        DivingCentersService.selectedDivingCenterClients[this.clientId];
      this.organiserId = DivingCentersService.selectedDivingCenterId;
    } else if (url.includes(DIVESCHOOLSSCOLLECTION.toLowerCase())) {
      this.clientData =
        DivingSchoolsService.selectedDivingSchoolClients[this.clientId];
      this.organiserId = DivingSchoolsService.selectedDivingSchoolId;
    } else if (url.includes(SERVICECENTERSCOLLECTION.toLowerCase())) {
      this.clientData =
        ServiceCentersService.selectedServiceCenterClients[this.clientId];
      this.organiserId = ServiceCentersService.selectedServiceCenterId;
    }
    this.counters = {
      classes: this.clientData.classes
        ? Object.keys(this.clientData.classes).length
        : 0,
      trips: this.clientData.trips
        ? Object.keys(this.clientData.trips).length
        : 0,
      invoices: this.clientData.invoices
        ? Object.keys(this.clientData.invoices).length
        : 0,
    };
    this.titles[1]["badge"] = this.counters.trips;
    this.titles[2]["badge"] = this.counters.classes;
    this.titles[3]["badge"] = this.counters.invoices;
  }
  async componentDidLoad() {
    this.setSliderHeight();
  }

  setSliderHeight() {
    this.slider = new Swiper(".slider-client", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: true,
      autoHeight: true,
    });
    //reset sliders height inside slider
    const slideContainers = Array.from(
      this.el.getElementsByClassName("slide-container")
    );
    slideContainers.map((container) => {
      container.setAttribute(
        "style",
        "height: " + slideHeight(this.userProfile) + "px"
      );
    });
  }

  render() {
    return (
      <Host>
        <ion-header class="cover">
          <app-item-cover item={this.userProfile}></app-item-cover>
        </ion-header>
        <ion-header>
          <ion-toolbar color="clients">
            {this.userProfile && !this.userProfile.coverURL
              ? [
                  <ion-buttons slot="start">
                    <ion-button
                      onClick={() => RouterService.goBack()}
                      icon-only
                    >
                      <ion-icon name="arrow-back"></ion-icon>
                    </ion-button>
                  </ion-buttons>,
                ]
              : undefined}
            <ion-title>{this.userProfile.displayName}</ion-title>
          </ion-toolbar>
        </ion-header>
        <app-header-segment-toolbar
          color={Environment.getAppColor()}
          swiper={this.slider}
          titles={this.titles}
        ></app-header-segment-toolbar>
        <ion-content class="slides">
          {this.userProfile && this.userProfile.coverURL ? (
            <ion-fab
              vertical="top"
              horizontal="start"
              slot="fixed"
              style={{marginTop: fabButtonTopMarginString(2)}}
            >
              <ion-fab-button
                onClick={() => RouterService.goBack()}
                class="fab-icon"
              >
                <ion-icon name="arrow-back-circle-outline"></ion-icon>
              </ion-fab-button>
            </ion-fab>
          ) : undefined}
          <swiper-container class="slider-client swiper">
            <swiper-wrapper class="swiper-wrapper">
              <swiper-slide class="swiper-slide">
                <ion-content class="slide-container">
                  <app-public-user userProfile={this.userProfile} />
                </ion-content>
              </swiper-slide>
              <swiper-slide class="swiper-slide">
                <ion-content class="slide-container">
                  {this.clientData &&
                  this.clientData.trips &&
                  Object.keys(this.clientData.trips).length > 0 ? (
                    <app-admin-dive-trips
                      filterByOrganisierId={this.organiserId}
                      filterByTrips={this.clientData.trips}
                    />
                  ) : (
                    <ion-card class="card-message">
                      <ion-title>
                        <my-transl tag="no-trips" text="No Diving Trips" />
                      </ion-title>
                    </ion-card>
                  )}
                </ion-content>
              </swiper-slide>
              <swiper-slide class="swiper-slide">
                <ion-content class="slide-container">
                  {this.clientData &&
                  this.clientData.classes &&
                  Object.keys(this.clientData.classes).length > 0 ? (
                    <app-admin-diving-classes
                      filterByOrganisierId={this.organiserId}
                      filterByClasses={this.clientData.classes}
                    />
                  ) : (
                    <ion-card class="card-message">
                      <ion-title>
                        <my-transl tag="no-classes" text="No Diving Classes" />
                      </ion-title>
                    </ion-card>
                  )}
                </ion-content>
              </swiper-slide>
              <swiper-slide class="swiper-slide">
                <ion-content class="slide-container">
                  {this.clientData &&
                  this.clientData.invoices &&
                  Object.keys(this.clientData.invoices).length > 0 ? (
                    <app-admin-client-invoices />
                  ) : (
                    <ion-card class="card-message">
                      <ion-title>
                        <my-transl tag="no-invoices" text="No Invoices" />
                      </ion-title>
                    </ion-card>
                  )}
                </ion-content>
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
        </ion-content>
      </Host>
    );
  }
}
