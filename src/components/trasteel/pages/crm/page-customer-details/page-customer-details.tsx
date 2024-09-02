import {Component, Element, Prop, State, h} from "@stencil/core";
import {Customer} from "../../../../../interfaces/trasteel/customer/customer";
import {CustomersService} from "../../../../../services/trasteel/crm/customers";
import Swiper from "swiper";
import {
  CustomerConditionCCM,
  CustomerConditionEAF,
  CustomerConditionLF,
  Marker,
} from "../../../../../components";
import {
  fabButtonTopMarginString,
  mapHeight,
} from "../../../../../helpers/utils";
import {RouterService} from "../../../../../services/common/router";
import {SystemService} from "../../../../../services/common/system";
import {TrasteelService} from "../../../../../services/trasteel/common/services";
import {Environment} from "../../../../../global/env";

@Component({
  tag: "page-customer-details",
  styleUrl: "page-customer-details.scss",
})
export class PageCustomerDetails {
  @Element() el: HTMLElement;
  @Prop() itemId: string;
  @State() customer: Customer;
  @State() locationTypeSegment: number = 0;
  markers: Marker[] = [];
  mapElement: HTMLAppMapElement;
  titles = [
    {tag: "information", text: "Information", disabled: false},
    {tag: "locations", text: "Locations", disabled: false},
    {
      tag: "operating-conditions",
      text: "Operating Conditions",
      disabled: false,
    },
    {tag: "map", text: "Map", disabled: false},
  ];
  @State() slider: Swiper;

  async componentWillLoad() {
    await this.loadCustomer();
  }

  async loadCustomer() {
    await SystemService.presentLoading("loading");
    try {
      this.customer = await CustomersService.getCustomer(this.itemId);
      SystemService.dismissLoading();
      this.markers = [];
      if (this.customer.locations.length > 0) {
        this.customer.locations.forEach((location) => {
          if (location.position && location.position.geopoint) {
            const marker = {
              latitude: location.position.geopoint.latitude,
              longitude: location.position.geopoint.longitude,
              icon: {
                type: "ionicon",
                name: "location", //CustomersService.locationsTypes(location.type)[0].locationName,
                color: "secondary",
                size: "large",
              },
            };
            this.markers.push(marker);
          }
        });
        if (this.markers.length > 0) this.loadMap();
        this.titles[1].disabled = this.customer.locations.length == 0;
        this.titles[2].disabled = !(
          this.customer.conditions.EAF.length > 0 ||
          this.customer.conditions.LF.length > 0 ||
          this.customer.conditions.CCM.length > 0
        );
        this.titles[3].disabled =
          this.customer.locations.length == 0 || this.markers.length == 0;
      }
    } catch (error) {
      SystemService.dismissLoading();
      RouterService.goBack();
      SystemService.presentAlertError(error);
    }
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-customer", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
      on: {
        slideChange: () => {
          this.slider ? this.slider.updateAutoHeight() : null;
        },
      },
    });
    if (this.markers.length > 0) this.loadMap();
  }

  async loadMap() {
    //reset map height inside slide
    await customElements.whenDefined("app-map");
    this.mapElement = this.el.querySelector("#map");
    if (this.mapElement) {
      const mapContainer = this.el.querySelector("#map-container");
      mapContainer.setAttribute(
        "style",
        "height: " + (mapHeight(this.customer) + 20) + "px"
      ); //-cover photo -slider  - title
      setTimeout(() => {
        this.mapElement.triggerMapResize();
        this.mapElement.fitToBounds(this.markers);
      });
    }
    this.updateSlider();
  }

  async editCustomer() {
    const modal = await CustomersService.presentCustomerUpdate(this.itemId);
    //update customer data after modal dismiss
    modal.onDidDismiss().then(() => this.loadCustomer());
  }

  locationTypeSegmentChanged(ev) {
    this.locationTypeSegment = ev.detail.value;
    this.updateSlider();
  }

  async openOperatingCondition(
    condition: "EAF" | "LF" | "CCM",
    conditionData?:
      | CustomerConditionEAF
      | CustomerConditionLF
      | CustomerConditionCCM
  ) {
    await RouterService.openModal("modal-operating-conditions-questionnaire", {
      condition,
      conditionData: conditionData,
      editable: false,
    });
  }

  updateSlider() {
    setTimeout(() => {
      //reset slider height to show address
      this.slider ? this.slider.update() : undefined;
    }, 100);
  }

  render() {
    return [
      this.customer.coverURL || this.customer.photoURL ? (
        <ion-header>
          <app-item-cover item={this.customer}></app-item-cover>
        </ion-header>
      ) : undefined,
      <ion-header>
        <app-navbar
          text={this.customer.fullName}
          color="trasteel"
          backButton={
            this.customer && !this.customer.coverURL && !this.customer.photoURL
          }
          rightButtonText={
            TrasteelService.isCustomerDBAdmin()
              ? {
                  icon: "create",
                  fill: "outline",
                  tag: "edit",
                  text: "Edit",
                }
              : null
          }
          rightButtonFc={() => this.editCustomer()}
        ></app-navbar>
      </ion-header>,
      <app-header-segment-toolbar
        color={Environment.getAppColor()}
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
        <swiper-container class="slider-customer swiper">
          <swiper-wrapper class="swiper-wrapper">
            <swiper-slide class="swiper-slide">
              <ion-list class="ion-no-padding">
                <app-item-detail
                  lines="none"
                  labelTag="plant_type"
                  labelText="Plant Type"
                  detailText={
                    CustomersService.getCustomerTypes(this.customer.typeId)[0]
                      .typeName
                  }
                ></app-item-detail>
                <app-item-detail
                  lines="none"
                  labelTag="name"
                  labelText="Name"
                  detailText={this.customer.fullName}
                ></app-item-detail>
                <app-item-detail
                  lines="none"
                  labelTag="local_name"
                  labelText="Local Name"
                  detailText={this.customer.fullNameOther}
                ></app-item-detail>
                <app-item-detail
                  lines="none"
                  labelTag="other_name"
                  labelText="Other Name"
                  detailText={this.customer.otherPlantName}
                ></app-item-detail>
                <app-item-detail
                  lines="none"
                  labelTag="other_name"
                  labelText="Other Local Name"
                  detailText={this.customer.otherPlantNameOther}
                ></app-item-detail>
                <app-item-detail
                  lines="none"
                  labelTag="short_name"
                  labelText="Short Name"
                  detailText={this.customer.shortName}
                ></app-item-detail>
                {this.customer.group.map((group, index) => (
                  <app-item-detail
                    lines="none"
                    labelTag={index == 0 ? "group" : null}
                    labelText={index == 0 ? "Group" : null}
                    detailText={
                      group.groupName + " [" + group.groupOwnershipPerc + "%]"
                    }
                  ></app-item-detail>
                ))}
                <app-item-detail
                  lines="none"
                  labelTag="owner"
                  labelText="Owner"
                  detailText={this.customer.owner.groupName}
                ></app-item-detail>
                <app-customer-plant-production
                  customer={this.customer}
                ></app-customer-plant-production>
              </ion-list>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <div>
                {this.customer.locations.length > 0
                  ? [
                      <ion-toolbar>
                        <ion-segment
                          mode="ios"
                          scrollable
                          onIonChange={(ev) =>
                            this.locationTypeSegmentChanged(ev)
                          }
                          value={this.locationTypeSegment}
                        >
                          {this.customer.locations.map((location, index) => (
                            <ion-segment-button
                              value={index}
                              layout="icon-start"
                            >
                              <ion-label>
                                {
                                  CustomersService.getLocationsTypes(
                                    location.type
                                  )[0].locationName
                                }
                              </ion-label>
                            </ion-segment-button>
                          ))}
                        </ion-segment>
                      </ion-toolbar>,
                      this.customer.locations.map((location, index) => (
                        <div>
                          {this.locationTypeSegment == index ? (
                            <div>
                              <app-location
                                locations={CustomersService.getLocationsTypes()}
                                location={location}
                                slider={this.slider}
                                editable={false}
                              ></app-location>
                            </div>
                          ) : undefined}
                        </div>
                      )),
                    ]
                  : undefined}
              </div>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <ion-list>
                <ion-item-divider>EAF</ion-item-divider>
                {this.customer.conditions.EAF.map((condition) => (
                  <ion-item
                    button
                    detail={true}
                    onClick={() =>
                      this.openOperatingCondition("EAF", condition)
                    }
                  >
                    <ion-label>
                      {new Date(condition.date).toLocaleDateString()}
                    </ion-label>
                  </ion-item>
                ))}
                <ion-item-divider>LF</ion-item-divider>
                {this.customer.conditions.LF.map((condition) => (
                  <ion-item
                    button
                    detail={true}
                    onClick={() =>
                      this.openOperatingCondition("EAF", condition)
                    }
                  >
                    <ion-label>
                      {new Date(condition.date).toLocaleDateString()}
                    </ion-label>
                  </ion-item>
                ))}
                <ion-item-divider>CCM</ion-item-divider>
                {this.customer.conditions.CCM.map((condition) => (
                  <ion-item>
                    <ion-label>
                      {new Date(condition.date).toLocaleDateString()}
                    </ion-label>
                  </ion-item>
                ))}
              </ion-list>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              {this.customer.locations.length > 0 && this.markers.length > 0 ? (
                <div id="map-container">
                  <app-map
                    id="map"
                    pageId="customer-details"
                    center={this.customer.locations[0]}
                    markers={this.markers}
                  ></app-map>
                </div>
              ) : (
                <div>
                  <ion-item>NO MAP AVAILABLE</ion-item>
                </div>
              )}
            </swiper-slide>
          </swiper-wrapper>
        </swiper-container>
      </ion-content>,
    ];
  }
}
