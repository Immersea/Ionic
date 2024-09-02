import {Component, h, Prop, State, Element} from "@stencil/core";
import {
  DiveSitesService,
  DIVESITESCOLLECTION,
} from "../../../../../services/udive/diveSites";
import {DiveSite} from "../../../../../interfaces/udive/dive-site/diveSite";
import {UserRoles} from "../../../../../interfaces/common/user/user-roles";
import {UserService} from "../../../../../services/common/user";
import {Marker} from "../../../../../interfaces/interfaces";
import {RouterService} from "../../../../../services/common/router";
import {UDiveFilterService} from "../../../../../services/udive/ud-db-filter";
import {
  mapHeight,
  fabButtonTopMarginString,
} from "../../../../../helpers/utils";
import {DIVECENTERSSCOLLECTION} from "../../../../../services/udive/divingCenters";
import {DiveTripsService} from "../../../../../services/udive/diveTrips";
import Swiper from "swiper";

@Component({
  tag: "page-dive-site-details",
  styleUrl: "page-dive-site-details.scss",
})
export class PageDiveSiteDetails {
  @Element() el: HTMLElement;
  @Prop() siteid: string;
  @State() diveSite: DiveSite;
  @State() diveTrips: any;
  @State() divingCenters: any;
  @State() titles = [
    {tag: "map"},
    {tag: "information"},
    {tag: "dive-profiles"},
    {tag: "diving-centers"},
    {tag: "next-trips", text: "Next Dive Trips"},
  ];
  @State() segment: number = 0;
  @State() slider: Swiper;
  userRoles: UserRoles;
  markers: Marker[] = [];
  mapElement: HTMLAppMapElement;

  async componentWillLoad() {
    this.diveSite = await DiveSitesService.getDiveSite(this.siteid);
    this.diveTrips = await DiveTripsService.getTripsSummary(
      DIVESITESCOLLECTION,
      this.siteid
    );
    this.divingCenters = DiveSitesService.loadSiteDivingCenters(this.diveSite);
    let siteIcon = UDiveFilterService.getMapDocs()[DIVESITESCOLLECTION]
      .icon as any;
    siteIcon.size = "large";
    let dcIcon = UDiveFilterService.getMapDocs()[DIVECENTERSSCOLLECTION]
      .icon as any;
    dcIcon.size = "small";
    this.markers.push({
      icon: siteIcon,
      latitude: this.diveSite.position.geopoint.latitude,
      longitude: this.diveSite.position.geopoint.longitude,
    });
    this.divingCenters.siteDivingCenters.forEach((center) => {
      this.markers.push({
        name: center.displayName,
        icon: dcIcon,
        latitude: center.position.geopoint.latitude,
        longitude: center.position.geopoint.longitude,
      });
    });
    this.userRoles = UserService.userRoles;
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-dive-site", {
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
      "height: " + mapHeight(this.diveSite) + "px"
    ); //-cover photo -slider  - title
    this.mapElement["mapLoaded"]().then(() => {
      this.mapElement.triggerMapResize();
      //add dive sites lines
      this.setLinesForDiveSite();
    });
    //add dive sites lines
    this.setLinesForDiveSite();
    this.mapElement.triggerMapResize();
    if (DiveSitesService.showNewDivePlans) {
      this.segment = 2;
    } else {
      this.segment = 0;
    }
  }

  setLinesForDiveSite() {
    this.mapElement.triggerMapResize();
    const pointsArray = [this.diveSite];
    this.divingCenters.siteDivingCenters.forEach(async (center) => {
      pointsArray.push(center);
      this.mapElement["createLine"](center.id, this.diveSite, center);
    });
    this.mapElement["fitToBounds"](pointsArray);
  }

  render() {
    return [
      <ion-header>
        <app-item-cover item={this.diveSite}></app-item-cover>
      </ion-header>,
      <ion-header>
        <ion-toolbar color="divesite" class="no-safe-padding">
          {this.diveSite && !this.diveSite.coverURL ? (
            <ion-buttons slot="start">
              <ion-button onClick={() => RouterService.goBack()} icon-only>
                <ion-icon name="arrow-back"></ion-icon>
              </ion-button>
            </ion-buttons>
          ) : undefined}
          <ion-title>{this.diveSite.displayName}</ion-title>
        </ion-toolbar>
      </ion-header>,
      <app-header-segment-toolbar
        color="divesite"
        swiper={this.slider}
        titles={this.titles}
      ></app-header-segment-toolbar>,
      <ion-content class="slides">
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
        <swiper-container class="slider-dive-site swiper">
          <swiper-wrapper class="swiper-wrapper">
            <swiper-slide class="swiper-slide">
              <ion-list class="ion-no-padding">
                <ion-list-header>
                  <ion-label color="divesite">
                    <my-transl
                      tag="general-information"
                      text="General Information"
                    />
                  </ion-label>
                </ion-list-header>
                <ion-item>
                  <ion-label class="ion-text-wrap">
                    <ion-text color="divesite">
                      <h3>
                        <my-transl tag="site-type" text="Site Type" />
                      </h3>
                    </ion-text>
                    <ion-text color="dark">
                      <p>
                        {DiveSitesService.getSiteTypeName(this.diveSite.type)}
                      </p>
                    </ion-text>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-label class="ion-text-wrap">
                    <ion-text color="dark">
                      <p>{this.diveSite.description}</p>
                    </ion-text>
                  </ion-label>
                </ion-item>
                <ion-list-header>
                  <ion-label color="divesite">
                    <my-transl tag="site-details" text="Site Details" />
                  </ion-label>
                </ion-list-header>
                <ion-item>
                  <ion-label class="ion-text-wrap">
                    <ion-text color="divesite">
                      <h3>
                        <my-transl tag="entry-type" text="Entry Type" />
                      </h3>
                    </ion-text>
                    <ion-text color="dark">
                      <p>
                        {DiveSitesService.getEntryTypeName(
                          this.diveSite.information.entryType
                        )}
                      </p>
                    </ion-text>
                  </ion-label>
                </ion-item>
                <ion-grid class="ion-no-padding">
                  <ion-row>
                    <ion-col>
                      <ion-item>
                        <ion-label class="ion-text-wrap">
                          <ion-text color="divesite">
                            <h3>
                              <my-transl tag="min-depth" text="Min. Depth" />
                            </h3>
                          </ion-text>
                          <ion-text color="dark">
                            <p>{this.diveSite.information.minDepth} m</p>
                          </ion-text>
                        </ion-label>
                      </ion-item>
                    </ion-col>
                    <ion-col>
                      <ion-item>
                        <ion-label class="ion-text-wrap">
                          <ion-text color="dark">
                            <ion-text color="divesite">
                              <h3>
                                <my-transl tag="max-depth" text="Max. Depth" />
                              </h3>
                            </ion-text>
                            <p>{this.diveSite.information.maxDepth} m</p>
                          </ion-text>
                        </ion-label>
                      </ion-item>
                    </ion-col>
                  </ion-row>
                </ion-grid>
                <ion-item>
                  <ion-label class="ion-text-wrap">
                    <ion-text color="divesite">
                      <h3>
                        <my-transl tag="avg-vis" text="Average Visibility" />
                      </h3>
                    </ion-text>
                    <ion-text color="dark">
                      <p>{this.diveSite.information.avgViz} m</p>
                    </ion-text>
                  </ion-label>
                </ion-item>
                <ion-list-header>
                  <ion-label color="divesite">
                    <my-transl tag="water-temp" text="Water Temperature" />
                  </ion-label>
                </ion-list-header>
                <ion-grid class="ion-no-padding">
                  <ion-row>
                    <ion-col>
                      <ion-item>
                        <ion-label class="ion-text-wrap">
                          <ion-text color="divesite">
                            <h3>
                              <my-transl tag="spring" text="Spring" />
                            </h3>
                          </ion-text>
                          <ion-text color="dark">
                            <p>
                              {this.diveSite.information.waterTemp.spring} °C
                            </p>
                          </ion-text>
                        </ion-label>
                      </ion-item>
                    </ion-col>
                    <ion-col>
                      <ion-item>
                        <ion-label class="ion-text-wrap">
                          <ion-text color="divesite">
                            <h3>
                              <my-transl tag="summer" text="Summer" />
                            </h3>
                          </ion-text>
                          <ion-text color="dark">
                            <p>
                              {this.diveSite.information.waterTemp.summer} °C
                            </p>
                          </ion-text>
                        </ion-label>
                      </ion-item>
                    </ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col>
                      <ion-item>
                        <ion-label class="ion-text-wrap">
                          <ion-text color="divesite">
                            <h3>
                              <my-transl tag="autumn" text="Autumn" />
                            </h3>
                          </ion-text>
                          <ion-text color="dark">
                            <p>
                              {this.diveSite.information.waterTemp.autumn} °C
                            </p>
                          </ion-text>
                        </ion-label>
                      </ion-item>
                    </ion-col>
                    <ion-col>
                      <ion-item>
                        <ion-label class="ion-text-wrap">
                          <ion-text color="divesite">
                            <h3>
                              <my-transl tag="winter" text="Winter" />
                            </h3>
                          </ion-text>
                          <ion-text color="dark">
                            <p>
                              {this.diveSite.information.waterTemp.winter} °C
                            </p>
                          </ion-text>
                        </ion-label>
                      </ion-item>
                    </ion-col>
                  </ion-row>
                </ion-grid>
                {this.diveSite.information.seabedComposition ? (
                  <ion-item>
                    <ion-label class="ion-text-wrap">
                      <ion-text color="divesite">
                        <h3>
                          <my-transl
                            tag="seabed-comp"
                            text="Seabed Composition"
                          />
                        </h3>
                      </ion-text>
                      <ion-text color="dark">
                        {this.diveSite.information.seabedComposition.map(
                          (comp) => (
                            <p>
                              {DiveSitesService.getSeabedCompositionName(comp)}
                            </p>
                          )
                        )}
                      </ion-text>
                    </ion-label>
                  </ion-item>
                ) : undefined}

                {this.diveSite.information.seabedCover ? (
                  <ion-item>
                    <ion-label class="ion-text-wrap">
                      <ion-text color="divesite">
                        <h3>
                          <my-transl tag="seabed-cover" text="Seabed Cover" />
                        </h3>
                      </ion-text>
                      <ion-text color="dark">
                        {this.diveSite.information.seabedCover.map((comp) => (
                          <p>{DiveSitesService.getSeabedCoverName(comp)}</p>
                        ))}
                      </ion-text>
                    </ion-label>
                  </ion-item>
                ) : undefined}
              </ion-list>
            </swiper-slide>

            <swiper-slide class="swiper-slide">
              <div id="map-container">
                <app-map
                  id="map"
                  pageId="dive-site-details"
                  center={this.diveSite}
                  markers={this.markers}
                ></app-map>
              </div>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <ion-grid>
                <ion-row class="ion-text-start">
                  {this.diveSite.divePlans.map((plan) => (
                    <ion-col size-sm="12" size-md="6" size-lg="4">
                      <app-dive-plan-card divePlan={plan} edit={false} />
                    </ion-col>
                  ))}
                </ion-row>
              </ion-grid>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <ion-grid>
                <ion-row class="ion-text-start">
                  {this.diveSite.divingCenters.map((dcId) => (
                    <ion-col size-sm="12" size-md="6" size-lg="4">
                      <app-diving-center-card
                        divingCenterId={dcId}
                        startlocation={this.diveSite}
                      />
                    </ion-col>
                  ))}
                </ion-row>
              </ion-grid>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <app-calendar
                calendarId="dive-site-calendar"
                addEvents={{trips: this.diveTrips}}
              ></app-calendar>
            </swiper-slide>
          </swiper-wrapper>
        </swiper-container>
      </ion-content>,
    ];
  }
}
