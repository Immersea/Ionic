import { Component, h, Host, Prop, State, Element } from "@stencil/core";
import { modalController } from "@ionic/core";
import { Subscription } from "rxjs";
import Swiper from "swiper";
import { Contact } from "../../../../interfaces/trasteel/contact/contact";
import { UserProfile } from "../../../../interfaces/common/user/user-profile";
import { UserService } from "../../../../services/common/user";
import { TranslationService } from "../../../../services/common/translations";
import {
  CONTACTSCOLLECTION,
  ContactsService,
} from "../../../../services/trasteel/crm/contacts";
import { Environment } from "../../../../global/env";
import { SystemService } from "../../../../services/common/system";
import { CustomersService } from "../../../../services/trasteel/crm/customers";
import { Customer } from "../../../../interfaces/trasteel/customer/customer";
import { CustomerLocation } from "../../../../components";
import { isString } from "lodash";

@Component({
  tag: "modal-contact-update",
  styleUrl: "modal-contact-update.scss",
})
export class ModalContactUpdate {
  @Element() el: HTMLElement;
  @Prop() contactId: string = undefined;
  @State() contact: Contact;
  customer: Customer;
  @State() customerLocations: CustomerLocation[] = [];
  @State() segment = "information";
  @State() updateView = true;
  @State() validContact = false;

  segmentTitles: {
    information: string;
  };
  @State() slider: Swiper;
  userProfile: UserProfile;
  userProfileSub$: Subscription;

  async componentWillLoad() {
    this.userProfileSub$ = UserService.userProfile$.subscribe(
      (userProfile: UserProfile) => {
        this.userProfile = new UserProfile(userProfile);
      }
    );
    this.segmentTitles = {
      information: TranslationService.getTransl("information", "Information"),
    };
    await this.loadContact();
  }

  async loadContact() {
    if (this.contactId) {
      const res = await ContactsService.getContact(this.contactId);
      this.contact = res;
    } else {
      this.contact = new Contact();
      this.contact.users = {
        [UserService.userRoles.uid]: ["owner"],
      };
    }
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-edit-contact", {
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
    this.validateContact();
  }

  disconnectedCallback() {
    this.userProfileSub$.unsubscribe();
  }

  handleChange(ev) {
    this.contact[ev.detail.name] = ev.detail.value;
    this.validateContact();
  }

  handleInformationChange() {
    this.validateContact();
  }

  selectCustomer(ev) {
    this.contact.customerId = ev.detail.value;
    CustomersService.getCustomer(ev.detail.value).then((customer) => {
      this.customer = customer;
      this.customerLocations = customer.locations;
      this.setLocationsSelect();
    });
    this.validateContact();
  }

  selectCustomerLocation(ev) {
    this.contact.customerLocationId = ev.detail.value;
    this.validateContact();
  }

  setLocationsSelect() {
    const selectLocationElement: HTMLIonSelectElement =
      this.el.querySelector("#selectLocation");
    const customPopoverOptions = {
      header: TranslationService.getTransl("location", "Locations"),
    };
    selectLocationElement.interfaceOptions = customPopoverOptions;
    //remove previously defined options
    const selectLocationOptions = Array.from(
      selectLocationElement.getElementsByTagName("ion-select-option")
    );
    selectLocationOptions.map((option) => {
      selectLocationElement.removeChild(option);
    });
    selectLocationElement.placeholder = TranslationService.getTransl(
      "select",
      "Select"
    );
    this.customerLocations.map((location) => {
      const selectOption = document.createElement("ion-select-option");
      selectOption.value = location.type;

      selectOption.textContent = TranslationService.getTransl(
        location.type,
        CustomersService.getLocationsTypes(location.type)[0].locationName
      );
      selectLocationElement.appendChild(selectOption);
    });
    this.updateSlider();
  }

  updateParam() {
    this.validateContact();
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

  updateImageUrls(ev) {
    const imageType = ev.detail.type;
    const url = ev.detail.url;
    if (imageType == "photo") {
      this.contact.photoURL = url;
    } else {
      this.contact.coverURL = url;
    }
    this.save(false);
  }

  validateContact() {
    let checkLocations = true;

    this.validContact =
      checkLocations &&
      isString(this.contact.firstName) &&
      isString(this.contact.lastName) &&
      isString(this.contact.customerId);
  }

  updateSlider() {
    this.updateView = !this.updateView;
    //wait for view to update and then reset slider height
    setTimeout(() => {
      this.slider ? this.slider.update() : undefined;
    }, 100);
  }

  async deleteContact() {
    try {
      await ContactsService.deleteContact(this.contactId);
      modalController.dismiss();
    } catch (error) {
      SystemService.presentAlertError(error);
    }
  }

  async save(dismiss = true) {
    const doc = await ContactsService.updateContact(
      this.contactId,
      this.contact,
      this.userProfile.uid
    );
    if (this.contactId) {
      return dismiss ? modalController.dismiss() : true;
    } else {
      this.contactId = doc.id;
      return true;
    }
  }

  async cancel() {
    modalController.dismiss();
  }

  render() {
    return (
      <Host>
        <ion-header>
          <app-upload-cover
            item={{
              collection: CONTACTSCOLLECTION,
              id: this.contactId,
              photoURL: this.contact.photoURL,
              coverURL: this.contact.coverURL,
            }}
            onCoverUploaded={(ev) => this.updateImageUrls(ev)}
          ></app-upload-cover>
        </ion-header>
        <ion-header>
          <ion-toolbar>
            <ion-segment
              mode='md'
              color={Environment.getAppColor()}
              scrollable
              onIonChange={(ev) => this.segmentChanged(ev)}
              value={this.segment}
            >
              <ion-segment-button value='information' layout='icon-start'>
                <ion-label>{this.segmentTitles.information}</ion-label>
              </ion-segment-button>
            </ion-segment>
          </ion-toolbar>
        </ion-header>
        <ion-content class='slides'>
          <swiper-container class='slider-edit-contact swiper'>
            <swiper-wrapper class='swiper-wrapper'>
              <swiper-slide class='swiper-slide'>
                <ion-list class='ion-no-padding'>
                  <ion-list-header>
                    <my-transl
                      tag='general-information'
                      text='General Information'
                      isLabel
                    />
                  </ion-list-header>
                  <ion-item lines='none'>
                    <ion-select
                      color='trasteel'
                      id='selectCustomer'
                      interface='action-sheet'
                      label={TranslationService.getTransl(
                        "customer",
                        "Customer"
                      )}
                      label-placement='floating'
                      onIonChange={(ev) => this.selectCustomer(ev)}
                      value={
                        this.contact && this.contact.customerId
                          ? this.contact.customerId
                          : null
                      }
                    >
                      {CustomersService.customersList.map((customer) => (
                        <ion-select-option value={customer.id}>
                          {customer.fullName}
                        </ion-select-option>
                      ))}
                    </ion-select>
                  </ion-item>
                  <ion-item lines='none'>
                    <ion-select
                      color='trasteel'
                      id='selectLocation'
                      interface='action-sheet'
                      label={TranslationService.getTransl(
                        "location",
                        "Location"
                      )}
                      label-placement='floating'
                      onIonChange={(ev) => this.selectCustomerLocation(ev)}
                      value={
                        this.contact && this.contact.customerLocationId
                          ? this.contact.customerLocationId
                          : null
                      }
                    ></ion-select>
                  </ion-item>
                  <app-form-item
                    label-tag='name'
                    label-text='Name'
                    value={this.contact.firstName}
                    name='firstName'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag='surname'
                    label-text='Surname'
                    value={this.contact.lastName}
                    name='lastName'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag='work-position'
                    label-text='Work Position'
                    value={this.contact.workPosition}
                    name='workPosition'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag='office-phone'
                    label-text='Office Phone'
                    value={this.contact.officePhone}
                    name='officePhone'
                    input-type='tel'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                  ></app-form-item>
                  <app-form-item
                    label-tag='mobile-phone'
                    label-text='Mobile Phone'
                    value={this.contact.mobilePhone}
                    name='mobilePhone'
                    input-type='tel'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                  ></app-form-item>
                  <app-form-item
                    label-tag='email'
                    label-text='Email'
                    value={this.contact.email}
                    name='email'
                    input-type='email'
                    input-form-mode='email'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                  ></app-form-item>
                </ion-list>
                {this.contactId ? (
                  <ion-footer class='ion-no-border'>
                    <ion-toolbar>
                      <ion-button
                        expand='block'
                        fill='outline'
                        color='danger'
                        onClick={() => this.deleteContact()}
                      >
                        <ion-icon slot='start' name='trash'></ion-icon>
                        <my-transl
                          tag='delete'
                          text='Delete'
                          isLabel
                        ></my-transl>
                      </ion-button>
                    </ion-toolbar>
                  </ion-footer>
                ) : undefined}
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          disableSave={!this.validContact}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
