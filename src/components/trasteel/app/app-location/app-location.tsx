import {
  Component,
  h,
  Prop,
  Event,
  EventEmitter,
  Host,
  Element,
  State,
} from "@stencil/core";
import { TranslationService } from "../../../../services/common/translations";
import {
  CustomerLocation,
  CustomerLocationElectrodesData,
  LocationType,
} from "../../../../interfaces/trasteel/customer/customerLocation";
import { MapService } from "../../../../services/common/map";
import { alertController } from "@ionic/core";
import { roundDecimals } from "../../../../helpers/utils";
import { isNumber, toNumber } from "lodash";
import { Environment } from "../../../../global/env";

@Component({
  tag: "app-location",
  styleUrl: "app-location.scss",
})
export class AppLocation {
  @Element() el: HTMLElement;
  @Event() locationSelected: EventEmitter;
  @Event() locationDeleted: EventEmitter;
  @Prop() editable: boolean = true;
  @Prop() location: CustomerLocation;
  @Prop() locations: LocationType[];
  @Prop() slider?: any;
  @State() updateView = false;
  @State() addressText: string;
  @State() locationType: string;
  @State() segment: string;
  @State() electrodeSegment: number = 0;
  segmentTitles: {
    address: string;
    plantConfiguration: string;
    electrodesData: string;
  };

  componentWillLoad() {
    this.segmentTitles = {
      address: TranslationService.getTransl("address", "Address"),
      plantConfiguration: TranslationService.getTransl(
        "plantConfiguration",
        "Plant Configuration"
      ),
      electrodesData: TranslationService.getTransl(
        "electrodesData",
        "Electrodes Data"
      ),
    };
    this.segment = this.editable ? "plantConfiguration" : "address";
  }

  componentDidLoad() {
    if (this.editable) this.setLocationsSelect();
  }

  segmentChanged(ev) {
    if (ev.detail.value) {
      this.segment = ev.detail.value;
      this.updateSlider();
    }
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
    this.locations.map((location) => {
      const selectOption = document.createElement("ion-select-option");
      selectOption.value = location.locationId;
      selectOption.textContent = TranslationService.getTransl(
        location.locationId,
        location.locationName
      );
      selectLocationElement.appendChild(selectOption);
    });
  }

  selectLocationType(ev) {
    this.locationType = ev.detail.value;
    this.location.type = ev.detail.value;
  }

  selectLocation(ev) {
    this.location.location = ev;
    if (isNumber(toNumber(ev.lat)) && isNumber(toNumber(ev.lon))) {
      this.location.position = MapService.getPosition(
        toNumber(ev.lat),
        toNumber(ev.lon)
      );
    }
    this.locationSelected.emit(this.location);
  }

  addElectrode() {
    this.location.electrodesData.push(new CustomerLocationElectrodesData());
    this.electrodeSegment = this.location.electrodesData.length - 1;
    this.handleElectrodeChange();
  }

  electrodeSegmentChanged(ev) {
    if (ev.detail.value !== "add") {
      this.electrodeSegment = ev.detail.value;
      this.handleElectrodeChange();
    }
  }

  handleElectrodeChange() {
    this.updateView = !this.updateView;
    this.updateSlider();
  }

  handleElectrodeItemChange(ev) {
    const n = ev.detail.name;
    const v = ev.detail.value;
    const mmToInch = 0.0393701;
    if (n == "pin_nominal_dia_in_mm") {
      this.location.electrodesData[
        this.electrodeSegment
      ].pin_nominal_dia_in_inches = roundDecimals(v * mmToInch, 1);
    } else if (n == "pin_nominal_dia_in_inches") {
      this.location.electrodesData[
        this.electrodeSegment
      ].pin_nominal_dia_in_mm = roundDecimals(v / mmToInch, 1);
    } else if (n == "dia_in_mm") {
      this.location.electrodesData[this.electrodeSegment].dia_in_inches =
        roundDecimals(v * mmToInch, 0);
    } else if (n == "dia_in_inches") {
      this.location.electrodesData[this.electrodeSegment].dia_in_mm =
        roundDecimals(v / mmToInch, 0);
    } else if (n == "length_in_mm") {
      this.location.electrodesData[this.electrodeSegment].length_in_inches =
        roundDecimals(v * mmToInch, 0);
    } else if (n == "length_in_inches") {
      this.location.electrodesData[this.electrodeSegment].length_in_mm =
        roundDecimals(v / mmToInch, 0);
    }
    this.location.electrodesData[this.electrodeSegment][ev.detail.name] =
      ev.detail.value;
    this.updateSlider();
  }

  async deleteItem() {
    const alert = await alertController.create({
      header: TranslationService.getTransl(
        "delete-location",
        "Delete Location"
      ),
      message: TranslationService.getTransl(
        "delete-location-confirm",
        "Are you sure you want to delete this location?"
      ),
      buttons: [
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: async () => {
            this.locationDeleted.emit(true);
          },
        },
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          handler: async () => {},
        },
      ],
    });
    alert.present();
  }

  handleLocationChange(ev) {
    this.location[ev.detail.name] = ev.detail.value;
  }

  updateSlider() {
    this.updateView = !this.updateView;
    setTimeout(() => {
      //reset slider height to show address
      this.slider ? this.slider.update() : undefined;
    }, 100);
  }

  render() {
    return (
      <Host>
        {this.editable
          ? [
              <ion-item lines='none'>
                <ion-select
                  color='trasteel'
                  id='selectLocation'
                  interface='action-sheet'
                  label={TranslationService.getTransl(
                    "loc_type",
                    "Location Type"
                  )}
                  label-placement='floating'
                  onIonChange={(ev) => {
                    this.selectLocationType(ev);
                  }}
                  value={
                    this.location && this.location.type
                      ? this.location.type
                      : null
                  }
                ></ion-select>
                <ion-button
                  icon-only
                  fill='clear'
                  slot='end'
                  onClick={() => this.deleteItem()}
                >
                  <ion-icon
                    slot='icon-only'
                    name='trash'
                    color='danger'
                  ></ion-icon>
                </ion-button>
              </ion-item>,
              <app-form-item
                label-tag='address'
                label-text='Address'
                value={
                  this.location &&
                  this.location.location &&
                  this.location.location.display_name
                    ? this.location.location.display_name
                    : null
                }
                name='address'
                input-type='text'
                lines='full'
                onFormLocationSelected={(ev) => this.selectLocation(ev.detail)}
                onFormLocationsFound={() => this.updateSlider()}
                validator={["address"]}
              ></app-form-item>,
            ]
          : undefined}
        <ion-toolbar>
          <ion-segment
            mode='ios'
            color={Environment.getAppColor()}
            scrollable
            onIonChange={(ev) => this.segmentChanged(ev)}
            value={this.segment}
          >
            {!this.editable ? (
              <ion-segment-button value='address' layout='icon-start'>
                <ion-label>
                  {TranslationService.getTransl("address", "Address")}
                </ion-label>
              </ion-segment-button>
            ) : undefined}
            <ion-segment-button value='plantConfiguration' layout='icon-start'>
              <ion-label>{this.segmentTitles.plantConfiguration}</ion-label>
            </ion-segment-button>
            <ion-segment-button value='electrodesData' layout='icon-start'>
              <ion-label>{this.segmentTitles.electrodesData}</ion-label>
            </ion-segment-button>
          </ion-segment>
        </ion-toolbar>
        {this.segment == "address" ? (
          <div>
            <app-item-detail
              lines='none'
              labelTag='country'
              labelText='Country'
              detailText={
                this.location.location.address.country
                  ? this.location.location.address.country
                  : null
              }
            ></app-item-detail>
            <app-item-detail
              lines='none'
              labelTag='state'
              labelText='State'
              detailText={
                this.location.location.address.state
                  ? this.location.location.address.state
                  : null
              }
            ></app-item-detail>
            <app-item-detail
              lines='none'
              labelTag='county'
              labelText='County'
              detailText={
                this.location.location.address.county
                  ? this.location.location.address.county
                  : null
              }
            ></app-item-detail>
            <app-item-detail
              lines='none'
              labelTag='city'
              labelText='City'
              detailText={
                this.location.location.address.city
                  ? this.location.location.address.city
                  : null
              }
            ></app-item-detail>
            <app-item-detail
              lines='none'
              labelTag='suburb'
              labelText='Suburb'
              detailText={
                this.location.location.address.suburb
                  ? this.location.location.address.suburb
                  : null
              }
            ></app-item-detail>
            <app-item-detail
              lines='none'
              labelTag='postcode'
              labelText='Postcode'
              detailText={
                this.location.location.address.postcode
                  ? this.location.location.address.postcode
                  : null
              }
            ></app-item-detail>
            <app-item-detail
              lines='none'
              labelTag='road'
              labelText='Road'
              detailText={
                this.location.location.address.road
                  ? this.location.location.address.road
                  : null
              }
            ></app-item-detail>
          </div>
        ) : undefined}
        {this.segment == "plantConfiguration" ? (
          <div>
            {!this.editable
              ? [
                  <app-item-detail
                    lines='none'
                    labelTag='gem-wiki-page'
                    labelText='Gem Wiki Page'
                    detailText={
                      this.location.gem_wiki_page_en
                        ? this.location.gem_wiki_page_en
                        : null
                    }
                  ></app-item-detail>,
                  <app-item-detail
                    lines='none'
                    labelTag='gem-wiki-page-other'
                    labelText='Gem Wiki Page Other'
                    detailText={
                      this.location.gem_wiki_page_other
                        ? this.location.gem_wiki_page_other
                        : null
                    }
                  ></app-item-detail>,
                ]
              : undefined}
            <app-form-item
              lines='none'
              labelTag='status'
              labelText='Status'
              value={this.location.status ? this.location.status : null}
              name='status'
              input-type='text'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='category-steel-product'
              labelText='Category Steel Product'
              value={
                this.location.category_steel_product
                  ? this.location.category_steel_product
                  : null
              }
              name='category_steel_product'
              input-type='text'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='steel-product'
              labelText='Steel Products'
              value={
                this.location.steel_products
                  ? this.location.steel_products
                  : null
              }
              name='steel_products'
              input-type='text'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='steel_sector_end_users'
              labelText='Steel Sector End Users'
              value={
                this.location.steel_sector_end_users
                  ? this.location.steel_sector_end_users
                  : null
              }
              name='steel_sector_end_users'
              input-type='text'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='main-production-equipment'
              labelText='Main Production Equipment'
              value={
                this.location.main_production_equipment
                  ? this.location.main_production_equipment
                  : null
              }
              name='main_production_equipment'
              input-type='text'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='main-production-process'
              labelText='Main Production Process'
              value={
                this.location.main_production_process
                  ? this.location.main_production_process
                  : null
              }
              name='main_production_process'
              input-type='text'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='detailed-production-equipment'
              labelText='Detailed Production Equipment'
              value={
                this.location.detailed_production_equipment
                  ? this.location.detailed_production_equipment
                  : null
              }
              name='detailed_production_equipment'
              input-type='text'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='workforce-size'
              labelText='Workforce Size'
              value={
                this.location.workforce_size
                  ? this.location.workforce_size
                  : null
              }
              name='workforce_size'
              input-type='number'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='proposed-date'
              labelText='Proposed Date'
              value={
                this.location.proposed_date &&
                this.location.proposed_date != "unknown"
                  ? this.location.proposed_date
                  : null
              }
              name='proposed_date'
              input-type='number'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='construction-date'
              labelText='Construction Date'
              value={
                this.location.construction_date &&
                this.location.construction_date != "unknown"
                  ? this.location.construction_date
                  : null
              }
              name='construction_date'
              input-type='number'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='plant-age'
              labelText='Plant Age'
              value={this.location.plant_age ? this.location.plant_age : null}
              name='plant_age'
              input-type='number'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='start-date'
              labelText='Start Date'
              value={
                this.location.start_date && this.location.start_date !== "N/A"
                  ? this.location.start_date
                  : null
              }
              name='start_date'
              input-type='number'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='closed-date'
              labelText='Closed Date'
              value={
                this.location.closed_date && this.location.closed_date !== "N/A"
                  ? this.location.closed_date
                  : null
              }
              name='closed_date'
              input-type='number'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='power-source'
              labelText='Power Source'
              value={
                this.location.power_source ? this.location.power_source : null
              }
              name='power_source'
              input-type='text'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='met-coal-source'
              labelText='Met Coal Source'
              value={
                this.location.met_coal_source
                  ? this.location.met_coal_source
                  : null
              }
              name='met_coal_source'
              input-type='text'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='responsible_steel_certification'
              labelText='Responsible Steel Certification'
              value={
                this.location.responsible_steel_certification &&
                this.location.responsible_steel_certification !== "N/A"
                  ? this.location.responsible_steel_certification
                  : null
              }
              name='responsible_steel_certification'
              input-type='boolean'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='ISO_14001'
              labelText='ISO 14001'
              value={
                this.location.ISO_14001 && this.location.ISO_14001 !== "N/A"
                  ? this.location.ISO_14001
                  : null
              }
              name='ISO_14001'
              input-type='boolean'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
            <app-form-item
              lines='none'
              labelTag='ISO_50001'
              labelText='ISO 50001'
              value={
                this.location.ISO_50001 && this.location.ISO_50001 !== "N/A"
                  ? this.location.ISO_50001
                  : null
              }
              name='ISO_50001'
              input-type='boolean'
              readonly={!this.editable}
              onFormItemChanged={(ev) => this.handleLocationChange(ev)}
            ></app-form-item>
          </div>
        ) : undefined}
        {this.segment == "electrodesData" ? (
          <div>
            <ion-toolbar>
              <ion-segment
                mode='ios'
                scrollable
                onIonChange={(ev) => this.electrodeSegmentChanged(ev)}
                value={this.electrodeSegment}
              >
                {this.location.electrodesData.map((electrode, index) => (
                  <ion-segment-button value={index} layout='icon-start'>
                    <ion-label>{electrode.application}</ion-label>
                  </ion-segment-button>
                ))}
                {this.editable ? (
                  <ion-segment-button
                    value='add'
                    onClick={() => this.addElectrode()}
                    layout='icon-start'
                  >
                    <ion-label>+</ion-label>
                  </ion-segment-button>
                ) : undefined}
              </ion-segment>
            </ion-toolbar>
            {this.location.electrodesData.map((electrode, index) => (
              <div>
                {this.electrodeSegment == index ? (
                  <div>
                    {this.editable
                      ? [
                          <ion-item>
                            <ion-select
                              color='trasteel'
                              id='application'
                              interface='action-sheet'
                              label={TranslationService.getTransl(
                                "application",
                                "Application"
                              )}
                              label-placement='floating'
                              onIonChange={(ev) => {
                                electrode.application = ev.detail.value;
                                this.handleElectrodeChange();
                              }}
                              value={
                                electrode && electrode.application
                                  ? electrode.application
                                  : null
                              }
                            >
                              <ion-select-option value='EAF'>
                                EAF
                              </ion-select-option>
                              <ion-select-option value='LF'>
                                LF
                              </ion-select-option>
                            </ion-select>
                          </ion-item>,
                          <app-form-item
                            value={
                              electrode && electrode.application
                                ? electrode.application
                                : null
                            }
                            name='application'
                            input-type='text'
                            lines='full'
                            onFormItemChanged={(ev) =>
                              this.handleElectrodeItemChange(ev)
                            }
                          ></app-form-item>,
                        ]
                      : undefined}
                    <app-form-item
                      label-tag='diameter'
                      label-text='Diameter'
                      appendText={" (mm)"}
                      value={
                        electrode && electrode.dia_in_mm
                          ? electrode.dia_in_mm
                          : null
                      }
                      name='dia_in_mm'
                      readonly={!this.editable}
                      input-type='number'
                      lines='full'
                      onFormItemChanged={(ev) =>
                        this.handleElectrodeItemChange(ev)
                      }
                    ></app-form-item>
                    <app-form-item
                      label-tag='diameter'
                      label-text='Diameter'
                      appendText={" (inches)"}
                      value={
                        electrode && electrode.dia_in_inches
                          ? electrode.dia_in_inches
                          : null
                      }
                      name='dia_in_inches'
                      readonly={!this.editable}
                      input-type='number'
                      lines='full'
                      onFormItemChanged={(ev) =>
                        this.handleElectrodeItemChange(ev)
                      }
                    ></app-form-item>
                    <app-form-item
                      label-tag='length'
                      label-text='Length'
                      appendText={" (mm)"}
                      value={
                        electrode && electrode.length_in_mm
                          ? electrode.length_in_mm
                          : null
                      }
                      name='length_in_mm'
                      readonly={!this.editable}
                      input-type='number'
                      lines='full'
                      onFormItemChanged={(ev) =>
                        this.handleElectrodeItemChange(ev)
                      }
                    ></app-form-item>
                    <app-form-item
                      label-tag='length'
                      label-text='Length'
                      appendText={" (inches)"}
                      value={
                        electrode && electrode.length_in_inches
                          ? electrode.length_in_inches
                          : null
                      }
                      name='length_in_inches'
                      readonly={!this.editable}
                      input-type='number'
                      lines='full'
                      onFormItemChanged={(ev) =>
                        this.handleElectrodeItemChange(ev)
                      }
                    ></app-form-item>
                    <app-form-item
                      label-tag='grade'
                      label-text='Grade'
                      value={
                        electrode && electrode.grade ? electrode.grade : null
                      }
                      name='grade'
                      readonly={!this.editable}
                      input-type='text'
                      lines='full'
                      onFormItemChanged={(ev) =>
                        this.handleElectrodeItemChange(ev)
                      }
                    ></app-form-item>
                    <app-form-item
                      label-tag='pin-nom-dia'
                      label-text='Pin Nominal Diameter'
                      appendText={" (mm)"}
                      value={
                        electrode && electrode.pin_nominal_dia_in_mm
                          ? electrode.pin_nominal_dia_in_mm
                          : null
                      }
                      name='pin_nominal_dia_in_mm'
                      readonly={!this.editable}
                      input-type='number'
                      lines='full'
                      onFormItemChanged={(ev) =>
                        this.handleElectrodeItemChange(ev)
                      }
                    ></app-form-item>
                    <app-form-item
                      label-tag='pin-nom-dia'
                      label-text='Pin Nominal Diameter'
                      appendText={" (inches)"}
                      value={
                        electrode && electrode.pin_nominal_dia_in_inches
                          ? electrode.pin_nominal_dia_in_inches
                          : null
                      }
                      name='pin_nominal_dia_in_inches'
                      readonly={!this.editable}
                      input-type='number'
                      lines='full'
                      onFormItemChanged={(ev) =>
                        this.handleElectrodeItemChange(ev)
                      }
                    ></app-form-item>
                    <app-form-item
                      label-tag='pin-size'
                      label-text='Pin Size'
                      appendText={" (mm)"}
                      value={
                        electrode && electrode.pin_size_in_mm
                          ? electrode.pin_size_in_mm
                          : null
                      }
                      name='pin_size_in_mm'
                      readonly={!this.editable}
                      input-type='text'
                      lines='full'
                      onFormItemChanged={(ev) =>
                        this.handleElectrodeItemChange(ev)
                      }
                    ></app-form-item>
                    <app-form-item
                      label-tag='pin-size'
                      label-text='Pin Size'
                      appendText={" (inches)"}
                      value={
                        electrode && electrode.pin_size_in_inches
                          ? electrode.pin_size_in_inches
                          : null
                      }
                      name='pin_size_in_inches'
                      readonly={!this.editable}
                      input-type='text'
                      lines='full'
                      onFormItemChanged={(ev) =>
                        this.handleElectrodeItemChange(ev)
                      }
                    ></app-form-item>
                    <app-form-item
                      label-tag='tpi'
                      label-text='TPI'
                      value={electrode && electrode.TPI ? electrode.TPI : null}
                      name='TPI'
                      readonly={!this.editable}
                      input-type='text'
                      lines='full'
                      onFormItemChanged={(ev) =>
                        this.handleElectrodeItemChange(ev)
                      }
                    ></app-form-item>

                    <app-form-item
                      label-tag='pin-length-code'
                      label-text='Pin Length Code'
                      value={
                        electrode && electrode.pin_length_type_code
                          ? electrode.pin_length_type_code
                          : null
                      }
                      name='pin_length_type_code'
                      readonly={!this.editable}
                      input-type='text'
                      lines='full'
                      onFormItemChanged={(ev) =>
                        this.handleElectrodeItemChange(ev)
                      }
                    ></app-form-item>
                    <app-form-item
                      label-tag='pin-length'
                      label-text='Pin Length'
                      value={
                        electrode && electrode.pin_length
                          ? electrode.pin_length
                          : null
                      }
                      name='pin_length'
                      readonly={!this.editable}
                      input-type='text'
                      lines='full'
                      onFormItemChanged={(ev) =>
                        this.handleElectrodeItemChange(ev)
                      }
                    ></app-form-item>
                    <app-form-item
                      label-tag='dust-groove'
                      label-text='Dust Groove'
                      value={
                        electrode && electrode.dust_groove
                          ? electrode.dust_groove
                          : null
                      }
                      name='dust_groove'
                      readonly={!this.editable}
                      input-type='boolean'
                      lines='full'
                      onFormItemChanged={(ev) =>
                        this.handleElectrodeItemChange(ev)
                      }
                    ></app-form-item>
                    <app-form-item
                      label-tag='pitch-plug'
                      label-text='Pitch Plug'
                      value={
                        electrode && electrode.pitch_plug
                          ? electrode.pitch_plug
                          : null
                      }
                      name='pitch_plug'
                      readonly={!this.editable}
                      input-type='boolean'
                      lines='full'
                      onFormItemChanged={(ev) =>
                        this.handleElectrodeItemChange(ev)
                      }
                    ></app-form-item>
                    <app-form-item
                      label-tag='preset'
                      label-text='Preset'
                      value={
                        electrode && electrode.preset ? electrode.preset : null
                      }
                      name='preset'
                      readonly={!this.editable}
                      input-type='boolean'
                      lines='full'
                      onFormItemChanged={(ev) =>
                        this.handleElectrodeItemChange(ev)
                      }
                    ></app-form-item>
                  </div>
                ) : undefined}
              </div>
            ))}
          </div>
        ) : undefined}
      </Host>
    );
  }
}
