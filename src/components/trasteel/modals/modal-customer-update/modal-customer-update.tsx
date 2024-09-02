import {Component, h, Host, Prop, State, Element} from "@stencil/core";
import {modalController, popoverController} from "@ionic/core";
import {Subscription} from "rxjs";
import Swiper from "swiper";
import {
  Customer,
  CustomerGroup,
} from "../../../../interfaces/trasteel/customer/customer";
import {UserProfile} from "../../../../interfaces/common/user/user-profile";
import {UserService} from "../../../../services/common/user";
import {TranslationService} from "../../../../services/common/translations";
import {
  CUSTOMERSCOLLECTION,
  CustomersService,
} from "../../../../services/trasteel/crm/customers";
import {
  CustomerConditionCCM,
  CustomerConditionEAF,
  CustomerConditionLF,
  CustomerLocation,
} from "../../../../interfaces/trasteel/customer/customerLocation";
import {Environment} from "../../../../global/env";
import {SystemService} from "../../../../services/common/system";
import {RouterService} from "../../../../services/common/router";
import {cloneDeep, isNumber, isString} from "lodash";

@Component({
  tag: "modal-customer-update",
  styleUrl: "modal-customer-update.scss",
})
export class ModalCustomerUpdate {
  @Element() el: HTMLElement;
  @Prop() customerId: string = undefined;
  @State() customer: Customer;
  @State() updateView = true;
  @State() validCustomer = false;
  @State() locationTypeSegment: any = "add";
  saveNewOwner = false;
  titles = [
    {tag: "information", text: "Information", disabled: false},
    {tag: "locations", text: "Locations", disabled: false},
    {
      tag: "operating-conditions",
      text: "Operating Conditions",
      disabled: false,
    },
  ];
  @State() slider: Swiper;
  userProfile: UserProfile;
  userProfileSub$: Subscription;

  async componentWillLoad() {
    this.userProfileSub$ = UserService.userProfile$.subscribe(
      (userProfile: UserProfile) => {
        this.userProfile = new UserProfile(userProfile);
      }
    );
    await this.loadCustomer();
  }

  async loadCustomer() {
    if (this.customerId) {
      const res = await CustomersService.getCustomer(this.customerId);
      this.customer = res;
      if (this.customer.locations.length > 0) this.locationTypeSegment = 0;
    } else {
      this.customer = new Customer();
      this.customer.users = {
        [UserService.userRoles.uid]: ["owner"],
      };
    }
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-edit-customer", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
    });
    this.setTypesSelect();
    this.validateCustomer();
  }

  disconnectedCallback() {
    this.userProfileSub$.unsubscribe();
  }

  handleChange(ev) {
    this.customer[ev.detail.name] = ev.detail.value;
    this.validateCustomer();
  }

  handleInformationChange() {
    this.validateCustomer();
  }

  updateParam() {
    this.validateCustomer();
  }

  updateImageUrls(ev) {
    const imageType = ev.detail.type;
    const url = ev.detail.url;
    if (imageType == "photo") {
      this.customer.photoURL = url;
    } else {
      this.customer.coverURL = url;
    }
    this.save(false);
  }

  validateCustomer() {
    let checkLocations = true;
    this.customer.locations.forEach((location) => {
      if (location && location.position)
        checkLocations =
          checkLocations &&
          isNumber(location.position.geopoint.latitude) &&
          isNumber(location.position.geopoint.longitude);
    });
    this.validCustomer =
      checkLocations &&
      isString(this.customer.fullName) &&
      this.customer.typeId != null;
  }

  addLocation() {
    this.customer.locations.push(new CustomerLocation());
    this.locationTypeSegment = this.customer.locations.length - 1;
    this.updateSlider();
  }

  updateLocation() {
    this.updateSlider();
  }

  deleteLocation(index) {
    this.customer.locations.splice(index, 1);
    this.updateSlider();
  }

  setTypesSelect() {
    const selectLocationElement: HTMLIonSelectElement =
      this.el.querySelector("#selectType");
    const customPopoverOptions = {
      header: TranslationService.getTransl("customer_type", "Customer Type"),
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
    CustomersService.getCustomerTypes().map((type) => {
      const selectOption = document.createElement("ion-select-option");
      selectOption.value = type.typeId;
      selectOption.textContent = TranslationService.getTransl(
        type.typeId,
        type.typeName
      );
      selectLocationElement.appendChild(selectOption);
    });
  }

  selectType(ev) {
    this.customer.typeId = ev.detail.value;
    this.validateCustomer();
  }

  locationTypeSegmentChanged(ev) {
    if (ev.detail.value !== "add") {
      this.locationTypeSegment = ev.detail.value;
      this.updateView = !this.updateView;
      this.updateSlider();
    }
  }

  selectOwner(ev) {
    this.customer.owner = ev.detail.value;
    this.validateCustomer();
  }

  selectGroupOwner(ev, index) {
    this.customer.group[index] = ev.detail.value;
    this.validateCustomer();
  }

  async editOwner(group?: boolean, index?: number, del?: boolean) {
    let owner = new CustomerGroup();
    if (group) {
      if (index >= 0) {
        owner = this.customer.group[index];
        if (del) {
          this.customer.group.splice(index, 1);
        }
      }
    } else {
      owner = this.customer.owner;
    }
    if (!del) {
      //create edit popover
      const popover = await popoverController.create({
        component: "popover-edit-customer-owner",
        translucent: true,
        componentProps: {
          owner: owner,
          group: group,
        },
      });

      popover.onDidDismiss().then(async (ev) => {
        const res = ev.data;
        if (res) {
          if (group) {
            if (index >= 0) {
              this.customer.group[index] = res.owner;
            } else {
              this.customer.group.push(res.owner);
            }
          } else {
            this.customer.owner = res.owner;
          }
          this.saveNewOwner = res.new;
          this.updateSlider();
        }
      });
      popover.present();
    }
    this.updateSlider();
  }

  updateSlider() {
    this.updateView = !this.updateView;
    //wait for view to update and then reset slider height
    setTimeout(() => {
      this.slider ? this.slider.update() : undefined;
    }, 100);
  }

  async editOperatingCondition(
    condition: "EAF" | "LF" | "CCM",
    conditionData?:
      | CustomerConditionEAF
      | CustomerConditionLF
      | CustomerConditionCCM
  ) {
    const modal = await RouterService.openModal(
      "modal-operating-conditions-questionnaire",
      {
        condition,
        conditionData: cloneDeep(conditionData),
        editable: true,
      }
    );
    modal.onDidDismiss().then((result) => {
      result = result.data;
      if (result && conditionData) {
        if (condition == "EAF")
          conditionData = new CustomerConditionEAF(result);
        else if (condition == "LF")
          conditionData = new CustomerConditionLF(result);
        else if (condition == "CCM")
          conditionData = new CustomerConditionCCM(result);
        this.updateSlider();
      } else if (result) {
        if (condition == "EAF")
          this.customer.conditions.EAF.push(new CustomerConditionEAF(result));
        else if (condition == "LF")
          this.customer.conditions.LF.push(new CustomerConditionLF(result));
        else if (condition == "CCM")
          this.customer.conditions.CCM.push(new CustomerConditionCCM(result));
        this.updateSlider();
      }
    });
  }

  async deleteCustomer() {
    try {
      await CustomersService.deleteCustomer(this.customerId);
      modalController.dismiss();
    } catch (error) {
      if (error) SystemService.presentAlertError(error);
    }
  }

  async save(dismiss = true) {
    const doc = await CustomersService.updateCustomer(
      this.customerId,
      this.customer,
      this.userProfile.uid
    );
    if (this.customerId) {
      return dismiss ? modalController.dismiss() : true;
    } else {
      this.customerId = doc.id;
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
              collection: CUSTOMERSCOLLECTION,
              id: this.customerId,
              photoURL: this.customer.photoURL,
              coverURL: this.customer.coverURL,
            }}
            onCoverUploaded={(ev) => this.updateImageUrls(ev)}
          ></app-upload-cover>
        </ion-header>
        <app-header-segment-toolbar
          color={Environment.getAppColor()}
          swiper={this.slider}
          titles={this.titles}
        ></app-header-segment-toolbar>
        <ion-content class="slides">
          <swiper-container class="slider-edit-customer swiper">
            <swiper-wrapper class="swiper-wrapper">
              <swiper-slide class="swiper-slide">
                <ion-list class="ion-no-padding">
                  <ion-item lines="none">
                    <ion-select
                      color="trasteel"
                      id="selectType"
                      interface="action-sheet"
                      label={TranslationService.getTransl(
                        "customer_type",
                        "Customer Type"
                      )}
                      label-placement="floating"
                      onIonChange={(ev) => this.selectType(ev)}
                      value={
                        this.customer && this.customer.typeId
                          ? this.customer.typeId
                          : null
                      }
                    ></ion-select>
                  </ion-item>
                  <app-form-item
                    label-tag="name"
                    label-text="Name"
                    value={this.customer.fullName}
                    name="fullName"
                    input-type="text"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag="local_name"
                    label-text="Local Name"
                    value={this.customer.fullNameOther}
                    name="fullNameOther"
                    input-type="text"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    labelTag="other_name"
                    labelText="Other Name"
                    value={this.customer.otherPlantName}
                    name="otherPlantName"
                    input-type="text"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    labelTag="other_name"
                    labelText="Other Local Name"
                    value={this.customer.otherPlantNameOther}
                    name="otherPlantNameOther"
                    input-type="text"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    labelTag="short_name"
                    labelText="Short Name"
                    value={this.customer.shortName}
                    name="shortName"
                    input-type="text"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  {this.customer.group.length == 0 ? (
                    <ion-item lines="none">
                      <ion-label>
                        <h2>
                          <my-transl
                            tag={"add_customer_group"}
                            text={"Add Customer Group"}
                          ></my-transl>
                        </h2>
                      </ion-label>
                      <ion-button
                        onClick={() => this.editOwner(true)}
                        slot="end"
                      >
                        +
                      </ion-button>
                    </ion-item>
                  ) : undefined}
                  {this.customer.group.map((group, index) => (
                    <ion-item lines="none">
                      <ion-label>
                        {index == 0 ? (
                          <ion-note>
                            <my-transl
                              tag={"customer_group"}
                              text={"Customer Group"}
                            ></my-transl>
                          </ion-note>
                        ) : undefined}
                        <h2>
                          {group.groupName +
                            " [" +
                            group.groupOwnershipPerc +
                            "%]"}
                        </h2>
                      </ion-label>
                      {index == this.customer.group.length - 1 ? (
                        <ion-button
                          onClick={() => this.editOwner(true)}
                          slot="end"
                        >
                          +
                        </ion-button>
                      ) : undefined}
                      <ion-button
                        slot="end"
                        icon-only
                        color="danger"
                        fill="clear"
                        onClick={() => {
                          this.editOwner(true, index, true);
                        }}
                      >
                        <ion-icon name="trash"></ion-icon>
                      </ion-button>
                      <ion-button
                        slot="end"
                        icon-only
                        fill="clear"
                        onClick={() => {
                          this.editOwner(true, index);
                        }}
                      >
                        <ion-icon name="create"></ion-icon>
                      </ion-button>
                    </ion-item>
                  ))}
                  <ion-item lines="none">
                    <ion-label>
                      <ion-note>
                        <my-transl
                          tag={"customer_owner"}
                          text={"Customer Owner"}
                        ></my-transl>
                      </ion-note>
                      <h2>{this.customer.owner.groupName}</h2>
                    </ion-label>
                    <ion-button
                      slot="end"
                      icon-only
                      fill="clear"
                      onClick={() => {
                        this.editOwner(false);
                      }}
                    >
                      <ion-icon name="create"></ion-icon>
                    </ion-button>
                  </ion-item>
                  <app-customer-plant-production
                    customer={this.customer}
                    editable={true}
                  ></app-customer-plant-production>
                </ion-list>
                {this.customerId ? (
                  <ion-footer class="ion-no-border">
                    <ion-toolbar>
                      <ion-button
                        expand="block"
                        fill="outline"
                        color="danger"
                        onClick={() => this.deleteCustomer()}
                      >
                        <ion-icon slot="start" name="trash"></ion-icon>
                        <my-transl
                          tag="delete"
                          text="Delete"
                          isLabel
                        ></my-transl>
                      </ion-button>
                    </ion-toolbar>
                  </ion-footer>
                ) : undefined}
              </swiper-slide>
              <swiper-slide class="swiper-slide">
                <div>
                  <ion-toolbar>
                    <ion-segment
                      mode="ios"
                      scrollable
                      onIonChange={(ev) => this.locationTypeSegmentChanged(ev)}
                      value={this.locationTypeSegment}
                    >
                      {this.customer.locations.map((location, index) => (
                        <ion-segment-button value={index} layout="icon-start">
                          <ion-label>
                            {
                              CustomersService.getLocationsTypes(
                                location.type
                              )[0].locationName
                            }
                          </ion-label>
                        </ion-segment-button>
                      ))}
                      <ion-segment-button
                        value="add"
                        onClick={() => this.addLocation()}
                        layout="icon-start"
                      >
                        <ion-label>+</ion-label>
                      </ion-segment-button>
                    </ion-segment>
                  </ion-toolbar>
                  {this.customer.locations.map((location, index) => (
                    <div>
                      {this.locationTypeSegment == index ? (
                        <div>
                          <app-location
                            locations={CustomersService.getLocationsTypes()}
                            location={location}
                            slider={this.slider}
                            onLocationSelected={() => this.updateLocation()}
                            onLocationDeleted={() => this.deleteLocation(index)}
                          ></app-location>
                        </div>
                      ) : undefined}
                    </div>
                  ))}
                </div>
              </swiper-slide>
              {/** operating conditions */}
              <swiper-slide class="swiper-slide">
                <ion-grid>
                  <ion-row>
                    <ion-col>
                      <ion-button
                        color={Environment.getAppColor()}
                        onClick={() => this.editOperatingCondition("EAF")}
                        expand="block"
                      >
                        <ion-icon name="add"></ion-icon>
                        <ion-label>EAF</ion-label>
                      </ion-button>
                    </ion-col>
                    <ion-col>
                      <ion-button
                        color={Environment.getAppColor()}
                        onClick={() => this.editOperatingCondition("LF")}
                        expand="block"
                      >
                        <ion-icon name="add"></ion-icon>
                        <ion-label>LF</ion-label>
                      </ion-button>
                    </ion-col>
                    <ion-col>
                      <ion-button
                        color={Environment.getAppColor()}
                        onClick={() => this.editOperatingCondition("CCM")}
                        expand="block"
                      >
                        <ion-icon name="add"></ion-icon>
                        <ion-label>CCM</ion-label>
                      </ion-button>
                    </ion-col>
                  </ion-row>
                </ion-grid>
                <ion-list>
                  <ion-item-divider>EAF</ion-item-divider>
                  {this.customer.conditions.EAF.map((condition) => (
                    <ion-item
                      button
                      detail={true}
                      onClick={() =>
                        this.editOperatingCondition("EAF", condition)
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
                        this.editOperatingCondition("EAF", condition)
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
            </swiper-wrapper>
          </swiper-container>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          disableSave={!this.validCustomer}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
