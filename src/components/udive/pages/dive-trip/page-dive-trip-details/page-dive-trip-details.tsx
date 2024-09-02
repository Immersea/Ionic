import {Component, h, Prop, State, Element} from "@stencil/core";
import {DiveTripsService} from "../../../../../services/udive/diveTrips";
import {DiveTrip} from "../../../../../interfaces/udive/dive-trip/diveTrip";
import {Marker} from "../../../../../interfaces/interfaces";
import {RouterService} from "../../../../../services/common/router";
import {Subscription} from "rxjs";
import {UserService} from "../../../../../services/common/user";
import {calculateColumns, mapHeight} from "../../../../../helpers/utils";
import Swiper from "swiper";
import {isArray, toNumber} from "lodash";

@Component({
  tag: "page-dive-trip-details",
  styleUrl: "page-dive-trip-details.scss",
})
export class PageDiveTripDetails {
  @Element() el: HTMLElement;
  @Prop() tripid: string;
  @State() diveTrip: DiveTrip;
  @State() titles = [
    {tag: "dives"},
    {tag: "bookings"},
    {tag: "chat", disabled: true},
  ];
  @State() slider: Swiper;
  markers: Marker[] = [];
  mapElement: HTMLAppMapElement;
  userSub: Subscription;
  @State() userId: string;
  @State() columns = {
    sm: 12,
    md: 6,
    lg: 4,
  };
  @State() showChat: boolean = false;
  @State() updateView: boolean = false;

  async componentWillLoad() {
    this.diveTrip = await DiveTripsService.getDiveTrip(this.tripid);
    this.userSub = UserService.userProfile$.subscribe((user) => {
      this.userId = user && user.uid ? user.uid : null;
      this.showChatSlide();
    });
    this.userId =
      UserService.userProfile && UserService.userProfile.uid
        ? UserService.userProfile.uid
        : null;

    this.columns = calculateColumns(this.diveTrip.tripDives.length);
  }

  showChatSlide() {
    this.showChat = false;
    if (this.diveTrip && this.diveTrip.chatId) {
      this.showChat = this.diveTrip.organiser.id === this.userId; //user is organiser
      this.showChat =
        this.showChat || isArray(this.diveTrip.users[this.userId]); //user is in the team
      this.diveTrip.tripDives.map((tripDive) => {
        tripDive.bookings.map((booking) => {
          this.showChat =
            this.showChat ||
            (booking.uid === this.userId && booking.confirmedOrganiser); //user is confirmed in the bookings
        });
      });
      this.titles[2].disabled = !this.showChat;
    }
  }

  setChatHeigth() {
    const slideContainer = this.el.querySelector("#chat-slide");
    slideContainer.setAttribute("style", "height: " + mapHeight(null) + "px");
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-dive-trip", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: true,
      autoHeight: true,
    });
  }

  disconnectedCallback() {
    this.userSub.unsubscribe();
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="divetrip">
          <ion-buttons slot="start">
            <ion-button onClick={() => RouterService.goBack()} icon-only>
              <ion-icon name="arrow-back"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>{this.diveTrip.displayName}</ion-title>
        </ion-toolbar>
      </ion-header>,
      <app-header-segment-toolbar
        color="divetrip"
        swiper={this.slider}
        titles={this.titles}
      ></app-header-segment-toolbar>,
      <ion-content class="slides">
        <swiper-container class="slider-dive-trip swiper">
          <swiper-wrapper class="swiper-wrapper">
            <swiper-slide class="swiper-slide">
              <ion-grid>
                <ion-row class="ion-text-start">
                  {this.diveTrip.tripDives.map((trip) => (
                    <ion-col
                      size-sm={this.columns.sm}
                      size-md={this.columns.md}
                      size-lg={this.columns.lg}
                    >
                      <app-dive-trip-card tripDive={trip} />
                    </ion-col>
                  ))}
                </ion-row>
              </ion-grid>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <ion-grid>
                <ion-row class="ion-text-start">
                  {!this.userId ? (
                    <div
                      style={{
                        marginTop: "10%",
                        marginLeft: "auto",
                        marginRight: "auto",
                      }}
                    >
                      <ion-card>
                        <ion-card-header>
                          <ion-card-title>
                            <my-transl
                              tag="please-login"
                              text="Please login to view this page"
                            />
                          </ion-card-title>
                        </ion-card-header>
                      </ion-card>
                    </div>
                  ) : (
                    Object.keys(this.diveTrip.tripDives).map((i) => (
                      <ion-col
                        size-sm={this.columns.sm}
                        size-md={this.columns.md}
                        size-lg={this.columns.lg}
                      >
                        <app-dive-trip-bookings
                          diveTrip={this.diveTrip}
                          diveTripId={this.tripid}
                          tripDiveIndex={toNumber(i)}
                        />
                      </ion-col>
                    ))
                  )}
                </ion-row>
              </ion-grid>
            </swiper-slide>
            {this.showChat ? (
              <swiper-slide class="swiper-slide">
                <app-chat id="chat-slide" chatId={this.diveTrip.chatId} />
              </swiper-slide>
            ) : undefined}
          </swiper-wrapper>
        </swiper-container>
      </ion-content>,
    ];
  }
}
