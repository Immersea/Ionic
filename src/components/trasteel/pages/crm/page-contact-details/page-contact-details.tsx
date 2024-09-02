import {Component, Element, Prop, State, h} from "@stencil/core";
import {Contact} from "../../../../../interfaces/trasteel/contact/contact";
import Swiper from "swiper";
import {TranslationService} from "../../../../../services/common/translations";
import {SystemService} from "../../../../../services/common/system";
import {ContactsService} from "../../../../../services/trasteel/crm/contacts";
import {RouterService} from "../../../../../services/common/router";
import {fabButtonTopMarginString} from "../../../../../helpers/utils";
import {CustomersService} from "../../../../../services/trasteel/crm/customers";
import {TrasteelService} from "../../../../../services/trasteel/common/services";
import {Environment} from "../../../../../global/env";

@Component({
  tag: "page-contact-details",
  styleUrl: "page-contact-details.scss",
})
export class PageContactDetails {
  @Element() el: HTMLElement;
  @Prop() itemId: string;
  @State() contact: Contact;
  @State() segment = "information";

  segmentTitles: {
    information: string;
  };
  @State() slider: Swiper;

  async componentWillLoad() {
    await this.loadContact();
    this.segmentTitles = {
      information: TranslationService.getTransl("information", "Information"),
    };
  }

  async loadContact() {
    await SystemService.presentLoading("loading");
    try {
      this.contact = await ContactsService.getContact(this.itemId);
    } catch (error) {}
    SystemService.dismissLoading();
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-contact", {
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
  }

  async editContact() {
    const modal = await ContactsService.presentContactUpdate(this.itemId);
    //update contact data after modal dismiss
    modal.onDidDismiss().then(() => this.loadContact());
  }

  segmentChanged(ev) {
    if (ev.detail.value) {
      this.segment = ev.detail.value;
      this.slider.update();
      switch (this.segment) {
        case "information":
          this.slider.slideTo(0);
          break;
        default:
          break;
      }
    }
  }

  updateSlider() {
    setTimeout(() => {
      //reset slider height to show address
      this.slider ? this.slider.update() : undefined;
    }, 100);
  }

  render() {
    return [
      this.contact.coverURL || this.contact.photoURL ? (
        <ion-header>
          <app-item-cover item={this.contact}></app-item-cover>
        </ion-header>
      ) : undefined,

      <ion-header>
        <app-navbar
          text={this.contact.lastName + " " + this.contact.firstName}
          color="trasteel"
          backButton={
            this.contact && !this.contact.coverURL && !this.contact.photoURL
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
          rightButtonFc={() => this.editContact()}
        ></app-navbar>
      </ion-header>,
      <ion-header>
        <ion-toolbar>
          <ion-segment
            mode="md"
            color={Environment.getAppColor()}
            scrollable
            onIonChange={(ev) => this.segmentChanged(ev)}
            value={this.segment}
          >
            <ion-segment-button value="information" layout="icon-start">
              <ion-label>{this.segmentTitles.information}</ion-label>
            </ion-segment-button>
          </ion-segment>
        </ion-toolbar>
      </ion-header>,
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
        <swiper-container class="slider-contact swiper">
          <swiper-wrapper class="swiper-wrapper">
            <swiper-slide class="swiper-slide">
              <ion-list class="ion-no-padding">
                <ion-list-header>
                  <my-transl
                    tag="general-information"
                    text="General Information"
                    isLabel
                  />
                </ion-list-header>
                <app-item-detail
                  lines="none"
                  labelTag="customer"
                  labelText="Customer"
                  detailText={
                    this.contact.customerId &&
                    CustomersService.getCustomersDetails(
                      this.contact.customerId
                    )
                      ? CustomersService.getCustomersDetails(
                          this.contact.customerId
                        ).fullName
                      : null
                  }
                ></app-item-detail>
                <app-item-detail
                  lines="none"
                  labelTag="location"
                  labelText="Location"
                  detailText={
                    this.contact.customerLocationId &&
                    CustomersService.getLocationsTypes(
                      this.contact.customerLocationId
                    )
                      ? CustomersService.getLocationsTypes(
                          this.contact.customerLocationId
                        )[0].locationName
                      : null
                  }
                ></app-item-detail>

                <app-form-item
                  label-tag="name"
                  label-text="Name"
                  value={this.contact.firstName}
                  read-only={true}
                ></app-form-item>
                <app-form-item
                  label-tag="surname"
                  label-text="Surname"
                  value={this.contact.lastName}
                  read-only={true}
                ></app-form-item>
                <app-form-item
                  label-tag="work-position"
                  label-text="Work Position"
                  value={this.contact.workPosition}
                  read-only={true}
                ></app-form-item>
                <app-form-item
                  label-tag="office-phone"
                  label-text="Office Phone"
                  value={this.contact.officePhone}
                  read-only={true}
                ></app-form-item>
                <app-form-item
                  label-tag="mobile-phone"
                  label-text="Mobile Phone"
                  value={this.contact.mobilePhone}
                  read-only={true}
                ></app-form-item>
                <app-form-item
                  label-tag="email"
                  label-text="Email"
                  value={this.contact.email}
                  read-only={true}
                ></app-form-item>
              </ion-list>
            </swiper-slide>
          </swiper-wrapper>
        </swiper-container>
      </ion-content>,
    ];
  }
}
