import {
  Component,
  h,
  Prop,
  State,
  Element,
  Event,
  EventEmitter,
} from "@stencil/core";
import { isPlatform, popoverController } from "@ionic/core";

//import { Config } from '../../../../providers/config';
import { cloneDeep, filter, find, last, min, orderBy } from "lodash";
//import { LicenceCheckProvider } from '../../../../providers/licence-check';
//import { ARPCModel } from '../../../../models/dive/arpc';
import { DecoplannerDive } from "../../../../../interfaces/udive/planner/decoplanner-dive";
import { DivePlan } from "../../../../../services/udive/planner/dive-plan";
import { Gas } from "../../../../../interfaces/udive/planner/gas";
import { GasModel } from "../../../../../interfaces/udive/planner/gas-model";
import { DecoplannerParameters } from "../../../../../interfaces/udive/planner/decoplanner-parameters";
import { DiveConfiguration } from "../../../../../interfaces/udive/planner/dive-configuration";
import { TranslationService } from "../../../../../services/common/translations";
import { UserService } from "../../../../../services/common/user";
import { DiveSitesService } from "../../../../../services/udive/diveSites";
import { MapDataDivingCenter } from "../../../../../interfaces/udive/diving-center/divingCenter";
import { DivingCentersService } from "../../../../../services/udive/divingCenters";
import { SystemService } from "../../../../../services/common/system";
import { RouterService } from "../../../../../services/common/router";
import { MapDataDiveSite } from "../../../../../interfaces/udive/dive-site/diveSite";
import { Environment } from "../../../../../global/env";
import { format } from "date-fns/format";

@Component({
  tag: "app-decoplanner-plan",
  styleUrl: "app-decoplanner-plan.scss",
})
export class AppDecoplannerPlan {
  @Element() el: HTMLElement;
  @Event() updateParamsEvent: EventEmitter<DecoplannerParameters>;

  @Prop() diveDataToShare: any;
  @Prop() planner? = false;
  @State() segment = "levels";
  @State() dive: DecoplannerDive = new DecoplannerDive();
  @State() updateView = true;

  user: any;
  dives: Array<DecoplannerDive>;
  screenWidth: number;
  screenHeight: number;
  index: number;
  divePlan: DivePlan;
  stdGases: Array<GasModel>;
  stdDecoGases: Array<GasModel>;
  stdConfigurations: Array<DiveConfiguration> = [];
  parameters: DecoplannerParameters;
  loading: any;
  confSelectOptions: any;
  diveConfiguration: DiveConfiguration;
  allowSelectConfiguration = false;
  segmentTitles: {
    location: string;
    date: string;
    surface: string;
    levels: string;
    deco: string;
  };
  showArpc = false;
  sitesList: MapDataDiveSite[] = [];
  divingCentersList: MapDataDivingCenter[] = [];
  @State() diveSite: MapDataDiveSite;

  async componentWillLoad() {
    this.diveParamsUpdate();
    this.segmentTitles = {
      location: TranslationService.getTransl("location", "Location"),
      date: TranslationService.getTransl("date", "Date"),
      surface: TranslationService.getTransl("surface-time", "Surface Time"),
      levels: TranslationService.getTransl("levels", "Levels"),
      deco: TranslationService.getTransl("deco-gases", "Deco Gases"),
    };
    this.confSelectOptions = {
      title: TranslationService.getTransl(
        "dive-configurations",
        "Dive Configurations"
      ),
      subTitle: TranslationService.getTransl(
        "dive-configuration-select",
        "Select your dive configuration"
      ),
      mode: "md",
    };
    this.sitesList = DiveSitesService.diveSitesList;
    this.divingCentersList = DivingCentersService.divingCentersList;
  }

  diveParamsUpdate() {
    const params = this.diveDataToShare;
    this.divePlan = params.divePlan;
    this.index = params.index;
    //this.licence = params.licence;
    this.stdGases = params.stdGases;
    this.stdDecoGases = params.stdDecoGases;
    this.stdConfigurations = params.stdConfigurations;
    this.user = params.user;
    this.findConfig();
  }

  findDiveSite() {
    if (this.dive.diveSiteId) {
      this.diveSite = this.sitesList.find(
        (site) => site.id === this.dive.diveSiteId
      );
      this.setSelectDivingCenters();
    }
  }

  async openSearchSite() {
    const popover = await popoverController.create({
      component: "popover-search-dive-site",
      translucent: true,
    });
    popover.onDidDismiss().then((ev) => {
      const siteId = ev.data;
      this.dive.diveSiteId = siteId;
      this.findDiveSite();
    });
    popover.present();
  }

  setSelectDivingCenters() {
    const selectDCElement: HTMLIonSelectElement = this.el.querySelector(
      "#selectDivingCenter"
    );
    const customDCPopoverOptions = {
      header: TranslationService.getTransl("diving-center", "Diving Center"),
    };

    selectDCElement.interfaceOptions = customDCPopoverOptions;
    //remove previously defined options
    const selectDCOptions = Array.from(
      selectDCElement.getElementsByTagName("ion-select-option")
    );
    selectDCOptions.map((option) => {
      selectDCElement.removeChild(option);
    });
    if (this.diveSite.divingCenters && this.diveSite.divingCenters.length > 0) {
      selectDCElement.placeholder = TranslationService.getTransl(
        "select",
        "Select"
      );
      this.diveSite.divingCenters.map((dcId) => {
        const selectOption = document.createElement("ion-select-option");
        const dc = this.divingCentersList.find((dc) => dc.id === dcId);
        selectOption.value = dcId;
        selectOption.textContent = dc.displayName;
        selectDCElement.appendChild(selectOption);
      });
      selectDCElement.disabled = false;
    } else {
      selectDCElement.placeholder = TranslationService.getTransl(
        "no-divecenters",
        "No Diving Centers available for this site"
      );
      this.dive.divingCenterId = "";
      selectDCElement.disabled = true;
    }
    this.updateView = !this.updateView;
  }

  findConfig() {
    //find in std configs
    let findConf = find(this.stdConfigurations, this.divePlan.configuration);
    if (!findConf) {
      //user changed the configuration - search by name
      findConf = find(this.stdConfigurations, {
        stdName: this.divePlan.configuration.stdName,
      });
      //add modified configuration in the list
      let updatedConf = cloneDeep(this.divePlan.configuration);
      updatedConf.stdName = updatedConf.stdName;
      //check if already added in a previous call
      findConf = find(this.stdConfigurations, { stdName: updatedConf.stdName });
      if (!findConf) {
        this.stdConfigurations.push(updatedConf);
        findConf = updatedConf;
      }
    }
    this.diveConfiguration = findConf;
    this.showArpc =
      this.diveConfiguration.parameters.configuration == "CCR" &&
      ((this.dive.diveSiteId && this.diveDataToShare.showDiveSite) ||
        this.diveDataToShare.showPositionTab); //show only in log book
    this.parameters = this.divePlan.configuration.parameters;
    if (this.stdDecoGases) {
      this.stdDecoGases.forEach((gas) => {
        //update setpoint according to parameters
        if (gas.O2 == 100) {
          gas.ppO2 = this.parameters.oxygenppO2;
        } else {
          gas.ppO2 = this.parameters.decoppO2;
        }
      });
    }
    this.dive = this.divePlan.dives[this.index];
    this.updateView = !this.updateView;
  }

  updateParams() {
    this.findConfig();
    this.updateView = !this.updateView;
    this.updateParamsEvent.emit(this.parameters);
  }

  updateDiveConfiguration(conf) {
    let updatedConf = cloneDeep(conf);
    this.divePlan.setConfiguration(updatedConf);
    this.parameters = this.divePlan.configuration.parameters;
    //reset deco tanks
    this.divePlan.resetDecoTanksWithConfiguration(this.dive, updatedConf);
    this.saveDoc();
  }

  async editDiveConfig() {
    let openModal = await UserService.checkLicence("configs", true);
    if (openModal) {
      const confModal = await RouterService.openModal(
        "modal-dive-configuration",
        {
          diveDataToShare: this.diveDataToShare,
        }
      );
      confModal.onDidDismiss().then((updatedConf) => {
        updatedConf = updatedConf.data;
        if (updatedConf) {
          this.updateDiveConfiguration(updatedConf);
        }
      });
    }
  }

  saveDoc() {
    this.updateParams();
    setTimeout(() => {
      SystemService.dismissLoading();
    }, 50);
  }

  async showLoading() {
    await SystemService.presentLoading("updating");
  }
  async reorderItems(reorder) {
    await this.showLoading();
    let element = this.dive.profilePoints[reorder.detail.from];
    this.dive.profilePoints.splice(reorder.detail.from, 1);
    this.dive.profilePoints.splice(reorder.detail.to, 0, element);
    let index = 0;
    this.dive.profilePoints.map((point) => {
      point.index = index++;
      return point;
    });
    reorder.detail.complete(this.dive.profilePoints);
    this.divePlan.updateCalculations();
    this.dive.profilePoints = orderBy(this.dive.profilePoints, "index");
    this.saveDoc();
  }

  async presentPopover(event, type, index?) {
    let page;
    let update = index >= 0 ? true : false;
    let level, gas;
    if (type == "level") {
      page = "popover-level";
      if (update) {
        level = this.dive.profilePoints[index];
        level.index = index;
      }
      if (!update && this.dive.profilePoints.length > 0) {
        //insert standard value
        //get last value of profile points
        level = last(this.dive.profilePoints);
        level = cloneDeep(level);
        level.setValue("depth", level.depth - 10);
        level.setValue("time", 10);
        level.setValue("updateGas", false);
      } else if (index > 0) {
        level.setValue("updateGas", false);
      } else {
        level.setValue("updateGas", true);
      }
    } else if (type == "gas") {
      //check deco gases limitation
      if (
        !update &&
        this.dive.decoGases.length >=
          UserService.userRoles.licences.getUserLimitations().maxDecoGases
      ) {
        UserService.userRoles.licences.presentLicenceLimitation("decogases");
        return;
      }

      page = "popover-gas";
      if (!update) {
        //insert next standard gas
        let decoGasDepths = [];
        for (let i in this.dive.decoGases) {
          decoGasDepths.push(this.dive.decoGases[i].fromDepth);
        }
        let minDecoGasDepth = min(decoGasDepths);
        let decoGas = find(this.stdDecoGases, (gas) => {
          return gas.fromDepth < minDecoGasDepth;
        });
        if (decoGas) {
          gas = new Gas(
            decoGas.O2 / 100,
            decoGas.He / 100,
            decoGas.fromDepth,
            decoGas.ppO2,
            decoGas.units
          );
          gas.setUseAsDiluent(decoGas.useAsDiluent);
        }
      } else {
        gas = this.dive.decoGases[index];
      }
    }
    const data = {
      gasProp: gas,
      levelProp: level,
      stdGasesList: this.stdGases,
      stdDecoGases: this.stdDecoGases,
      trimixlicence: UserService.checkLicence("trimix"),
      ccr: this.parameters.configuration == "CCR",
      parameters: this.parameters,
    };
    var cssClass = undefined;
    //make custom popover for capacitor apps
    if (isPlatform("capacitor")) {
      cssClass = "custom-mobile-popover";
      event = null;
    }
    const popover = await popoverController.create({
      component: page,
      event: event,
      translucent: true,
      backdropDismiss: true,
      cssClass: cssClass,
      componentProps: data,
    });
    popover.present();
    popover.onDidDismiss().then(async (updatedData: any) => {
      updatedData = updatedData.data;
      if (updatedData) {
        await this.showLoading();
        if (type == "level") {
          if (update) {
            //update level
            this.divePlan.updateDiveProfilePoint(
              this.dive,
              updatedData.index,
              updatedData.depth,
              updatedData.time,
              updatedData.o2 / 100,
              updatedData.he / 100,
              updatedData.setpoint
            );
          } else {
            //add new
            this.divePlan.addDiveProfilePoint(
              this.dive,
              updatedData.depth,
              updatedData.time,
              updatedData.o2 / 100,
              updatedData.he / 100,
              updatedData.setpoint
            );
          }
        } else if (type == "gas") {
          if (update) {
            //update gas
            this.divePlan.updateDiveDecoGas(
              this.dive,
              index,
              updatedData.o2 / 100,
              updatedData.he / 100,
              updatedData.fromDepth,
              updatedData.ppO2,
              updatedData.useAsDiluent
            );
          } else {
            //add new
            this.divePlan.addDiveDecoGas(
              this.dive,
              updatedData.o2 / 100,
              updatedData.he / 100,
              updatedData.fromDepth,
              updatedData.ppO2,
              updatedData.useAsDiluent
            );
          }
        }
        this.saveDoc();
      }
    });
  }

  async addStdDecoGases() {
    await this.showLoading();

    let decoGases = filter(this.stdDecoGases, (gas) => {
      return gas.fromDepth <= this.dive.getDecoStartDepth(); //return all gases below 74% of max depth
    });
    this.dive.decoGases = [];
    decoGases.forEach((gas) => {
      this.divePlan.addDiveDecoGas(
        this.dive,
        gas.O2 / 100,
        gas.He / 100,
        gas.fromDepth,
        gas.ppO2,
        gas.useAsDiluent
      );
    });
    this.saveDoc();
  }

  async removeProfilePoint(dive, index) {
    await this.showLoading();
    this.divePlan.removeDiveProfilePoint(dive, index);
    this.saveDoc();
  }

  async removeDecoGas(dive, index) {
    await this.showLoading();
    this.divePlan.removeDiveDecoGas(dive, index);
    this.saveDoc();
  }

  segmentChanged(ev) {
    const segment = ev.detail.value;
    this.segment = segment;
    if (segment == "location" && Environment.isUdive()) {
      setTimeout(() => {
        this.findDiveSite();
      }, 100);
    }
  }

  updateDate(ev) {
    this.dive.date = new Date(ev.detail.value);
  }

  updateParam(param, value) {
    this[param] = value;
    this.updateParams();
  }

  updateSurfaceInterval(value) {
    this.dive.surfaceInterval = value;
    this.divePlan.updateDates();
    this.updateParams();
  }

  updateDiveSite(ev) {
    this.dive.diveSiteId = ev.detail.value;
  }

  updateDivingCenter(ev) {
    this.dive.divingCenterId = ev.detail.value;
  }

  saveArpc(ev) {
    this.dive.arpc = ev.detail;
    this.updateView = !this.updateView;
  }

  render() {
    return [
      <ion-content class='slide-container'>
        <div class='ion-no-padding'>
          <ion-row>
            <ion-col>
              <ion-segment
                mode='ios'
                color={Environment.getAppColor()}
                onIonChange={(ev) => this.segmentChanged(ev)}
                value={this.segment}
              >
                {(this.dive.diveSiteId && this.diveDataToShare.showDiveSite) ||
                this.diveDataToShare.showPositionTab ? (
                  <ion-segment-button value='location'>
                    <ion-label>
                      {this.index == 0
                        ? Environment.isDecoplanner()
                          ? this.segmentTitles.date
                          : this.segmentTitles.location
                        : this.segmentTitles.surface}
                    </ion-label>
                  </ion-segment-button>
                ) : undefined}

                <ion-segment-button value='levels'>
                  <ion-label>{this.segmentTitles.levels}</ion-label>
                </ion-segment-button>
                <ion-segment-button value='gases' layout='icon-start'>
                  <ion-label>{this.segmentTitles.deco}</ion-label>
                  {this.dive.decoGases.length > 0 ? (
                    <ion-badge
                      color={
                        Environment.isDecoplanner() ? "gue-blue" : "planner"
                      }
                    >
                      {this.dive.decoGases.length}
                    </ion-badge>
                  ) : undefined}
                </ion-segment-button>
                {this.showArpc ? (
                  <ion-segment-button value='arpc' layout='icon-start'>
                    <ion-label>ARPC</ion-label>
                    <ion-badge
                      color={
                        this.dive.arpc && this.dive.arpc.approved
                          ? "success"
                          : "danger"
                      }
                    >
                      <ion-icon
                        style={{ fontSize: "10px" }}
                        name={
                          this.dive.arpc && this.dive.arpc.approved
                            ? "checkmark"
                            : "close"
                        }
                      ></ion-icon>
                    </ion-badge>
                  </ion-segment-button>
                ) : undefined}
              </ion-segment>
            </ion-col>
          </ion-row>
          {this.segment == "location"
            ? [
                <ion-row>
                  <ion-col>
                    {this.index == 0 ? (
                      <app-form-item
                        label-tag='dive-date'
                        label-text='Dive Date'
                        value={
                          this.dive.date ? this.dive.date.toISOString() : null
                        }
                        name='tripDate'
                        input-type='date'
                        datePresentation='date-time'
                        lines='inset'
                        onFormItemChanged={(ev) => this.updateDate(ev)}
                      ></app-form-item>
                    ) : (
                      [
                        <ion-item>
                          <my-transl tag='dive-date' text='Dive Date' />
                          <ion-note slot='end'>
                            {format(this.dive.date, "dd MMM, yyyy HH:mm")}
                          </ion-note>
                        </ion-item>,
                        <ion-item>
                          <ion-icon name='time' slot='start'></ion-icon>
                          <ion-select
                            label={TranslationService.getTransl(
                              "surface-interval",
                              "Surface Interval"
                            )}
                            onIonChange={(ev) =>
                              this.updateSurfaceInterval(ev.detail.value)
                            }
                            value={this.dive.surfaceInterval}
                          >
                            <ion-select-option value={0.5}>
                              0:30
                            </ion-select-option>
                            <ion-select-option value={1}>
                              1:00
                            </ion-select-option>
                            <ion-select-option value={1.5}>
                              1:30
                            </ion-select-option>
                            <ion-select-option value={2}>
                              2:00
                            </ion-select-option>
                            <ion-select-option value={2.5}>
                              2:30
                            </ion-select-option>
                            <ion-select-option value={3}>
                              3:00
                            </ion-select-option>
                            <ion-select-option value={3.5}>
                              3:30
                            </ion-select-option>
                            <ion-select-option value={4}>
                              4:00
                            </ion-select-option>
                            <ion-select-option value={4.5}>
                              4:30
                            </ion-select-option>
                            <ion-select-option value={5}>
                              5:00
                            </ion-select-option>
                            <ion-select-option value={5.5}>
                              5:30
                            </ion-select-option>
                            <ion-select-option value={6}>
                              6:00
                            </ion-select-option>
                            <ion-select-option value={6.5}>
                              6:30
                            </ion-select-option>
                            <ion-select-option value={7}>
                              7:00
                            </ion-select-option>
                            <ion-select-option value={7.5}>
                              7:30
                            </ion-select-option>
                            <ion-select-option value={8}>
                              8:00
                            </ion-select-option>
                            <ion-select-option value={8.5}>
                              8:30
                            </ion-select-option>
                            <ion-select-option value={9}>
                              9:00
                            </ion-select-option>
                            <ion-select-option value={9.5}>
                              9:30
                            </ion-select-option>
                            <ion-select-option value={10}>
                              10:00
                            </ion-select-option>
                            <ion-select-option value={10.5}>
                              10:30
                            </ion-select-option>
                            <ion-select-option value={11}>
                              11:00
                            </ion-select-option>
                            <ion-select-option value={11.5}>
                              11:30
                            </ion-select-option>
                            <ion-select-option value={12}>
                              12:00
                            </ion-select-option>
                          </ion-select>
                        </ion-item>,
                      ]
                    )}
                  </ion-col>
                </ion-row>,
                Environment.isDecoplanner()
                  ? undefined
                  : [
                      <ion-row>
                        <ion-col>
                          <ion-item
                            button
                            onClick={() => this.openSearchSite()}
                          >
                            <ion-input
                              label={TranslationService.getTransl(
                                "dive-site",
                                "Dive Site"
                              )}
                              labelPlacement='floating'
                              placeholder={TranslationService.getTransl(
                                "select-dive-site",
                                "Select Dive Site"
                              )}
                              value={
                                this.diveSite
                                  ? this.diveSite.displayName
                                  : undefined
                              }
                            ></ion-input>
                            <ion-icon
                              slot='end'
                              name='search-outline'
                            ></ion-icon>
                          </ion-item>
                        </ion-col>
                      </ion-row>,
                      <ion-row>
                        <ion-col>
                          <ion-item>
                            <ion-select
                              label={TranslationService.getTransl(
                                "diving-center",
                                "Diving Center"
                              )}
                              labelPlacement='floating'
                              id='selectDivingCenter'
                              onIonChange={(ev) => this.updateDivingCenter(ev)}
                              disabled={true}
                              value={this.dive.divingCenterId}
                            ></ion-select>
                          </ion-item>
                        </ion-col>
                      </ion-row>,
                    ],
              ]
            : undefined}
          {this.segment == "levels" ? (
            <ion-row>
              <ion-col>
                <ion-list class='ion-text-wrap'>
                  <ion-item>
                    <div slot='end' style={{ width: "1.9em" }}>
                      <ion-button
                        icon-only
                        color={
                          Environment.isDecoplanner() ? "gue-blue" : "planner"
                        }
                        fill='clear'
                        style={{ "--padding-start": "0.4em" }}
                        onClick={() => this.editDiveConfig()}
                      >
                        <ion-icon name='create-outline'></ion-icon>
                      </ion-button>
                    </div>
                    <ion-grid class='ion-text-center ion-no-padding'>
                      <ion-row
                        class='ion-justify-content-center  ion-no-padding'
                        onClick={() => this.editDiveConfig()}
                      >
                        <ion-col size='6'>
                          <ion-item lines='none'>
                            <my-transl
                              tag='configuration'
                              text='Configuration'
                            />
                          </ion-item>
                        </ion-col>

                        <ion-col>
                          <ion-item lines='none'>
                            {this.allowSelectConfiguration ? (
                              <ion-select
                                interfaceOptions={this.confSelectOptions}
                                onIonChange={(ev) =>
                                  this.updateDiveConfiguration(ev.detail.value)
                                }
                                class='select-class'
                                value={this.diveConfiguration.stdName}
                              >
                                {this.stdConfigurations.map((conf) => (
                                  <ion-select-option value={conf}>
                                    {conf.stdName}
                                  </ion-select-option>
                                ))}
                              </ion-select>
                            ) : (
                              <ion-label class='ion-text-end'>
                                {this.diveConfiguration.stdName}
                              </ion-label>
                            )}
                          </ion-item>
                        </ion-col>
                      </ion-row>
                    </ion-grid>
                  </ion-item>

                  <ion-item>
                    <div slot='end' style={{ width: "1.9em" }}>
                      <ion-button
                        icon-only
                        fill='clear'
                        color={
                          Environment.isDecoplanner() ? "gue-blue" : "planner"
                        }
                        style={{
                          marginTop: "10px",
                          "--padding-start": "0.4em",
                        }}
                        onClick={(ev) => this.presentPopover(ev, "level")}
                      >
                        <ion-icon name='add-circle'></ion-icon>
                      </ion-button>
                    </div>
                    <ion-grid class='ion-text-center'>
                      <ion-row
                        small-capitals
                        class='ion-align-items-center ion-no-padding'
                      >
                        <ion-col>
                          <ion-text color='dark'>
                            <h6>
                              <my-transl tag='depth' text='Depth' />
                            </h6>
                          </ion-text>
                        </ion-col>
                        <ion-col>
                          <ion-text color='dark'>
                            <h6>
                              <my-transl tag='time' text='Time' />
                            </h6>
                          </ion-text>
                        </ion-col>
                        <ion-col>
                          <ion-text color='dark'>
                            <h6>
                              O<sub>2</sub>
                            </h6>
                          </ion-text>
                        </ion-col>
                        <ion-col>
                          <ion-text color='dark'>
                            <h6>He</h6>
                          </ion-text>
                        </ion-col>
                        {this.parameters.configuration == "CCR" ? (
                          <ion-col>
                            <ion-text color='dark'>
                              <h6>
                                <my-transl tag='po2' text='pO2' />
                              </h6>
                            </ion-text>
                          </ion-col>
                        ) : undefined}

                        <ion-col></ion-col>
                      </ion-row>
                    </ion-grid>
                  </ion-item>
                  <ion-reorder-group
                    disabled={false}
                    onIonItemReorder={(ev) => this.reorderItems(ev)}
                  >
                    {this.dive.profilePoints.map((level) => (
                      <ion-item>
                        <ion-reorder slot='end'></ion-reorder>
                        <ion-grid class='ion-text-center'>
                          <ion-row class='ion-align-items-center ion-no-padding'>
                            <ion-col
                              onClick={(ev) =>
                                this.presentPopover(ev, "level", level.index)
                              }
                            >
                              {level.depth}
                            </ion-col>
                            <ion-col
                              onClick={(ev) =>
                                this.presentPopover(ev, "level", level.index)
                              }
                            >
                              {level.time}
                            </ion-col>
                            <ion-col
                              onClick={(ev) =>
                                this.presentPopover(ev, "level", level.index)
                              }
                            >
                              {level.gas.O2}
                            </ion-col>
                            <ion-col
                              onClick={(ev) =>
                                this.presentPopover(ev, "level", level.index)
                              }
                            >
                              {level.gas.He}
                            </ion-col>
                            {this.parameters.configuration == "CCR" ? (
                              <ion-col
                                onClick={(ev) =>
                                  this.presentPopover(ev, "level", level.index)
                                }
                              >
                                {level.setpoint}
                              </ion-col>
                            ) : undefined}

                            <ion-col>
                              <ion-button
                                icon-only
                                fill='clear'
                                size='small'
                                color='danger'
                                disabled={
                                  level.index == 0 &&
                                  this.dive.profilePoints.length <= 1
                                }
                                onClick={() =>
                                  this.removeProfilePoint(
                                    this.dive,
                                    level.index
                                  )
                                }
                              >
                                <ion-icon name='trash'></ion-icon>
                              </ion-button>
                            </ion-col>
                          </ion-row>
                        </ion-grid>
                      </ion-item>
                    ))}
                  </ion-reorder-group>
                </ion-list>
              </ion-col>
            </ion-row>
          ) : undefined}
          {this.segment == "gases" ? (
            <ion-row>
              <ion-col>
                <ion-list class='ion-text-wrap'>
                  <ion-item>
                    <ion-grid class='ion-text-center ion-no-padding'>
                      <ion-row small-capitals class='ion-no-padding'>
                        <ion-col>
                          <ion-text color='dark'>
                            <h6>
                              <my-transl tag='from-depth' text='from Depth' />
                            </h6>
                          </ion-text>
                        </ion-col>
                        <ion-col>
                          <ion-text color='dark'>
                            <h6>
                              O<sub>2</sub>
                            </h6>
                          </ion-text>
                        </ion-col>
                        <ion-col>
                          <ion-text color='dark'>
                            <h6>He</h6>
                          </ion-text>
                        </ion-col>
                        {this.parameters.configuration == "CCR" ? (
                          <ion-col>
                            <ion-text color='dark'>
                              <h6>
                                <my-transl tag='po2' text='pO2' />
                              </h6>
                            </ion-text>
                          </ion-col>
                        ) : undefined}

                        <ion-col class='ion-no-padding'>
                          <ion-row class='ion-no-padding'>
                            <ion-col
                              class='ion-no-padding'
                              size={
                                UserService.userRoles &&
                                UserService.userRoles.licences.unlimited
                                  ? "6"
                                  : "12"
                              }
                            >
                              <ion-button
                                icon-only
                                fill='clear'
                                color='primary'
                                onClick={(ev) => this.presentPopover(ev, "gas")}
                                style={{ marginTop: "10px" }}
                              >
                                <ion-icon name='add-circle'></ion-icon>
                              </ion-button>
                            </ion-col>
                            {UserService.userRoles &&
                            UserService.userRoles.licences.unlimited ? (
                              <ion-col size='6' class='ion-no-padding'>
                                <ion-button
                                  icon-only
                                  fill='clear'
                                  color='secondary'
                                  onClick={() => this.addStdDecoGases()}
                                  style={{ marginTop: "10px" }}
                                >
                                  <ion-icon name='color-wand'></ion-icon>
                                </ion-button>
                              </ion-col>
                            ) : undefined}
                          </ion-row>
                        </ion-col>
                      </ion-row>
                    </ion-grid>
                  </ion-item>
                  {this.dive.decoGases.map((gas, i) => (
                    <ion-item class='ion-text-center'>
                      <ion-grid class='ion-text-center'>
                        <ion-row class='ion-no-padding'>
                          <ion-col
                            style={{ marginTop: "5px" }}
                            onClick={(ev) => this.presentPopover(ev, "gas", i)}
                          >
                            {gas.fromDepth}
                          </ion-col>
                          <ion-col
                            style={{ marginTop: "5px" }}
                            onClick={(ev) => this.presentPopover(ev, "gas", i)}
                          >
                            {gas.O2}
                          </ion-col>
                          <ion-col
                            style={{ marginTop: "5px" }}
                            onClick={(ev) => this.presentPopover(ev, "gas", i)}
                          >
                            {gas.He}
                          </ion-col>
                          {this.parameters.configuration == "CCR" ? (
                            <ion-col
                              style={{ marginTop: "5px" }}
                              onClick={(ev) =>
                                this.presentPopover(ev, "gas", i)
                              }
                            >
                              {gas.ppO2}{" "}
                              {gas.useAsDiluent ? (
                                <ion-note>(diluent gas)</ion-note>
                              ) : undefined}
                            </ion-col>
                          ) : undefined}

                          <ion-col>
                            <ion-button
                              icon-only
                              fill='clear'
                              size='small'
                              color='danger'
                              onClick={() => this.removeDecoGas(this.dive, i)}
                            >
                              <ion-icon name='trash'></ion-icon>
                            </ion-button>
                          </ion-col>
                        </ion-row>
                      </ion-grid>
                    </ion-item>
                  ))}
                </ion-list>
              </ion-col>
            </ion-row>
          ) : undefined}
          {this.segment == "arpc" ? (
            <app-decoplanner-arpc
              diveDataToShare={this.diveDataToShare}
              planner={this.planner}
              onSaveArpc={(arpc) => this.saveArpc(arpc)}
            ></app-decoplanner-arpc>
          ) : undefined}
        </div>
      </ion-content>,
    ];
  }
}
