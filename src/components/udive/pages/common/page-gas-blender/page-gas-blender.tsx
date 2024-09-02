import {Component, h, State, Element} from "@stencil/core";
import {isPlatform, popoverController, alertController} from "@ionic/core";
import {cloneDeep, find, orderBy, round, toNumber, uniqBy} from "lodash";
import {Gas} from "../../../../../interfaces/udive/planner/gas";
import {Cylinder} from "../../../../../interfaces/udive/planner/cylinder";
import {GasSupply} from "../../../../../interfaces/udive/planner/gas-supply";
import {DiveStandardsService} from "../../../../../services/udive/planner/dive-standards";
import {GasBlenderService} from "../../../../../services/udive/planner/gas-blender";
import {DatabaseService} from "../../../../../services/common/database";
import {TranslationService} from "../../../../../services/common/translations";
import {DiveToolsService} from "../../../../../services/udive/planner/dive-tools";
import {TankModel} from "../../../../../interfaces/udive/planner/tank-model";
import Swiper from "swiper";

@Component({
  tag: "page-gas-blender",
  styleUrl: "page-gas-blender.scss",
})
export class PageGasBlender {
  @Element() el: HTMLElement;
  stdTanks: any;
  tank: TankModel;
  topup: GasSupply;
  topup1: GasSupply;
  start: GasSupply;
  end: GasSupply;
  end_topup: GasSupply;
  end_topup_pres: number;
  volumeUnit = null;
  @State() real_gas: boolean;
  @State() he_first: boolean;
  @State() updateView = true;
  content: HTMLIonContentElement;

  chargeCost: number;
  heCost: number;
  o2Cost: number;
  nxCost: number;
  tmxCost: number;

  ppCost = {
    o2: {volume: 0, cost: 0},
    he: {volume: 0, cost: 0},
    nx: {volume: 0, cost: 0},
    tmx: {volume: 0, cost: 0},
    totCost: 0,
  };
  nbCost = {
    o2: {volume: 0, cost: 0},
    he: {volume: 0, cost: 0},
    nx: {volume: 0, cost: 0},
    tmx: {volume: 0, cost: 0},
    totCost: 0,
  };
  tbCost = {
    o2: {volume: 0, cost: 0},
    he: {volume: 0, cost: 0},
    nx: {volume: 0, cost: 0},
    tmx: {volume: 0, cost: 0},
    totCost: 0,
  };

  stdGases: Array<any>;
  user: any;
  localDoc: string = "page-gas-blender";
  storedConfig: any;

  ppSteps: any;
  nxSteps: any;
  tmxSteps: any;
  idealCapacity: any;
  realCapacity: any;

  allowUpdate = true;
  @State() titles = [
    {tag: "tank", icon: "chevron-forward", slotIcon: "end"},
    {tag: "blend", icon: "chevron-forward", slotIcon: "end"},
    {tag: "cost", icon: "chevron-forward", slotIcon: "end"},
    {tag: "top-up"},
  ];
  @State() slider: Swiper;

  async componentWillLoad() {
    //reset licences and load views
    this.resetDP2licences();
    this.stdGases = [];
    let gases = DiveStandardsService.getStdGases();
    this.stdGases = orderBy(gases, "fromDepth", "asc");
    const tanks = DiveStandardsService.getStdTanks();
    //order and remove duplicates
    this.stdTanks = uniqBy(orderBy(tanks, "volume"), "name");

    //reset stored config in case of change of units
    if (
      this.storedConfig &&
      ((this.storedConfig.servicePressure > 1000 &&
        DiveToolsService.isMetric()) ||
        (this.storedConfig.servicePressure < 1000 &&
          DiveToolsService.isImperial()) ||
        !this.storedConfig.tank)
    ) {
      this.storedConfig = null;
    }
    this.restoreConfiguration();
    this.volumeUnit = DiveToolsService.isMetric() ? "lt" : "cuft";
  }

  restoreConfiguration() {
    const startConfig = {
      tank: find(this.stdTanks, (tank) => {
        return tank.name == "s80";
      }),
      chargeCost: 5,
      heCost: DiveToolsService.isMetric() ? 40 : 1.3,
      o2Cost: DiveToolsService.isMetric() ? 25 : 0.85,
      nxCost: DiveToolsService.isMetric() ? 20 : 0.7,
      tmxCost: DiveToolsService.isMetric() ? 20 : 0.8,
      servicePressure: DiveToolsService.isMetric() ? 230 : 3300,
      topup_fO2: 0.21,
      topup_fHe: 0,
      topup_temp: DiveToolsService.isMetric() ? 20 : 68,
      topup1_fO2: 0.32,
      topup1_fHe: 0,
      topup1_temp: DiveToolsService.isMetric() ? 20 : 68,
      start_fO2: 0.21,
      start_fHe: 0.35,
      start_pres: DiveToolsService.isMetric() ? 50 : 750,
      start_temp: DiveToolsService.isMetric() ? 20 : 68,
      end_fO2: 0.15,
      end_fHe: 0.55,
      end_pres: DiveToolsService.isMetric() ? 230 : 3300,
      end_temp: DiveToolsService.isMetric() ? 20 : 68,
      end_topup_pres: DiveToolsService.isMetric() ? 230 : 3300,
      real_gas: true,
      he_first: false,
    };

    this.restoreConfig(startConfig);
  }

  componentDidLoad() {
    this.slider = new Swiper(".slider-gas-blender", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
    });
  }

  async restoreConfig(startConfig) {
    //local config
    this.storedConfig = await DatabaseService.getLocalDocument(this.localDoc);
    let config = this.storedConfig ? this.storedConfig : startConfig;
    this.topup = new GasSupply(
      new Cylinder(config.tank.volume, config.servicePressure),
      new Gas(config.topup_fO2, config.topup_fHe),
      config.servicePressure,
      !config.real_gas,
      config.topup_temp
    );
    this.topup1 = new GasSupply(
      new Cylinder(config.tank.volume, config.servicePressure),
      new Gas(config.topup1_fO2, config.topup1_fHe),
      config.servicePressure,
      !config.real_gas,
      config.topup1_temp
    );
    this.start = new GasSupply(
      new Cylinder(config.tank.volume, config.servicePressure),
      new Gas(config.start_fO2, config.start_fHe),
      config.start_pres,
      !config.real_gas,
      config.start_temp
    );
    this.end = new GasSupply(
      new Cylinder(config.tank.volume, config.servicePressure),
      new Gas(config.end_fO2, config.end_fHe),
      config.end_pres,
      !config.real_gas,
      config.end_temp
    );
    this.end_topup_pres = config.end_topup_pres;
    this.real_gas = config.real_gas;
    this.he_first = config.he_first;

    this.setTank(config.tank, config.servicePressure);
    this.chargeCost = config.chargeCost;
    this.heCost = config.heCost;
    this.o2Cost = config.o2Cost;
    this.nxCost = config.nxCost;
    this.tmxCost = config.tmxCost;
    this.updateView = !this.updateView;
    this.updateBlend();
  }

  setTank(tank, servicePressure) {
    this.tank = tank;
    this.start.setCylinder(new Cylinder(this.tank.volume, servicePressure));
    this.end.setCylinder(new Cylinder(this.tank.volume, servicePressure));
  }

  saveConfig() {
    DatabaseService.saveLocalDocument(this.localDoc, {
      tank: this.tank,
      chargeCost: this.chargeCost,
      heCost: this.heCost,
      o2Cost: this.o2Cost,
      nxCost: this.nxCost,
      tmxCost: this.tmxCost,
      servicePressure: this.start.mCylinder.getServicePressure(),
      topup_fO2: this.topup.getFO2(),
      topup_fHe: this.topup.getFHe(),
      topup_temp: this.topup.getTemperature(),
      start_fO2: this.start.getFO2(),
      start_fHe: this.start.getFHe(),
      start_pres: this.start.getPressure(),
      start_temp: this.start.getTemperature(),
      end_fO2: this.end.getFO2(),
      end_fHe: this.end.getFHe(),
      end_pres: this.end.getPressure(),
      end_temp: this.end.getTemperature(),
      end_topup_pres: this.end_topup_pres,
      real_gas: this.real_gas,
      he_first: this.he_first,
    });
  }

  resetDP2licences() {
    //this.licence.set(this.navCtrl,this.user)
  }

  async presentPopover(event, gas: string, showBar = true) {
    const page = "popover-gas-blender";
    const data = {
      gasProp: this[gas],
      stdGasesList: this.stdGases,
      showBar: showBar,
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
    popover.onDidDismiss().then((updatedGas) => {
      //if (updatedData === "showTrimixlicence") {
      //this.navCtrl.push("SettingsPage")
      //} else {
      this[gas] = updatedGas.data;
      this.allowUpdate = true;
      this.updateBlend();
      //}
    });
  }

  toggleRealGas() {
    this.real_gas = !this.real_gas;
    this.topup.useIdealGasLaws(!this.real_gas);
    this.start.useIdealGasLaws(!this.real_gas);
    this.end.useIdealGasLaws(!this.real_gas);
    this.updateBlend();
  }

  toggleHeFirst() {
    this.he_first = !this.he_first;
    this.updateBlend();
  }

  updateTopup(ev) {
    this.end_topup_pres = parseInt(ev.detail.value);
    this.allowUpdate = true;
    this.updateBlend();
  }

  changeTank(ev) {
    this.setTank(
      find(this.stdTanks, (tank) => {
        return tank.name == ev.detail.value;
      }),
      this.start.getCylinder().getServicePressure()
    );
    this.updateBlend();
  }

  updateCosts(ev) {
    if (ev && ev.detail) {
      this[ev.detail.name] = ev.detail.value;
    }
    this.calculateCosts();
  }

  calculateCosts() {
    const chargeCost = this.chargeCost > 0 ? toNumber(this.chargeCost) : 0;
    this.ppCost = {
      o2: {volume: 0, cost: 0},
      he: {volume: 0, cost: 0},
      nx: {volume: 0, cost: 0},
      tmx: {volume: 0, cost: 0},
      totCost: 0,
    };
    this.nbCost = {
      o2: {volume: 0, cost: 0},
      he: {volume: 0, cost: 0},
      nx: {volume: 0, cost: 0},
      tmx: {volume: 0, cost: 0},
      totCost: 0,
    };
    this.tbCost = {
      o2: {volume: 0, cost: 0},
      he: {volume: 0, cost: 0},
      nx: {volume: 0, cost: 0},
      tmx: {volume: 0, cost: 0},
      totCost: 0,
    };
    this.ppCost.totCost = chargeCost;
    this.ppSteps.map((step) => {
      const calc = this.stepCost(this.ppCost, step);
      if (calc.type) {
        this.ppCost[calc.type].volume = round(calc.volume, 2);
        this.ppCost[calc.type].cost = round(calc.cost, 2);
        this.ppCost.totCost += calc.cost;
      }
    });
    this.ppCost.totCost = round(this.ppCost.totCost, 2);

    this.nbCost.totCost = chargeCost;
    this.nxSteps.map((step) => {
      const calc = this.stepCost(this.nbCost, step);
      if (calc.type) {
        this.nbCost[calc.type].volume = round(calc.volume, 2);
        this.nbCost[calc.type].cost = round(calc.cost, 2);
        this.nbCost.totCost += calc.cost;
      }
    });
    this.nbCost.totCost = round(this.nbCost.totCost, 2);

    this.tbCost.totCost = chargeCost;
    this.tmxSteps.map((step) => {
      const calc = this.stepCost(this.tbCost, step);
      if (calc.type) {
        this.tbCost[calc.type].volume = round(calc.volume, 2);
        this.tbCost[calc.type].cost = round(calc.cost, 2);
        this.tbCost.totCost += calc.cost;
      }
    });
    this.tbCost.totCost = round(this.tbCost.totCost, 2);

    this.update();
  }

  stepCost(cost, step) {
    const totVolume = this.real_gas ? this.realCapacity : this.idealCapacity;
    let volume = 0;
    let type = null;
    //use total capacity in proportion with pressures
    if (step.type == "add" || step.type == "topup") {
      if (step.mix.O2 == 100) {
        type = "o2";
        volume = (step.pressToAdd / this.end.getPressure()) * totVolume;
        cost =
          (volume * this.o2Cost) / (DiveToolsService.isMetric() ? 1000 : 1); //costs for m3 or cuft
      } else if (step.mix.He == 100) {
        type = "he";
        volume = (step.pressToAdd / this.end.getPressure()) * totVolume;
        cost =
          (volume * this.heCost) / (DiveToolsService.isMetric() ? 1000 : 1);
      } else if (step.mix.O2 > 0 && step.mix.O2 != 21 && step.mix.He == 0) {
        type = "nx";
        volume = (step.pressToAdd / this.end.getPressure()) * totVolume;
        cost =
          (volume * this.nxCost) / (DiveToolsService.isMetric() ? 1000 : 1);
      } else if (step.mix.O2 > 0 && step.mix.He > 0) {
        type = "tmx";
        volume = (step.pressToAdd / this.end.getPressure()) * totVolume;
        cost =
          (volume * this.tmxCost) / (DiveToolsService.isMetric() ? 1000 : 1);
      }
    }
    return {type: type, volume: volume, cost: cost};
  }

  async updateBlend() {
    if (this.allowUpdate) {
      // Make Mixes of our gases
      GasBlenderService.mTopup = this.topup.getMix();

      GasBlenderService.have = cloneDeep(this.start);
      GasBlenderService.want = cloneDeep(this.end);

      var res = GasBlenderService.solve();
      if (!res) {
        let prompt = await alertController.create({
          header: TranslationService.getTransl(
            "blend-error-title",
            "Blend Error"
          ),
          message: TranslationService.getTransl(
            "blend-error-message",
            "Sorry! It was not possible to calculate the blend. Try to reduce the start pressure and check if it works."
          ),
          buttons: [
            {
              text: TranslationService.getTransl("ok", "OK"),
            },
          ],
        });
        prompt.present();
        this.allowUpdate = false;
        this.restoreConfiguration();
      } else {
        this.allowUpdate = true;
        this.ppSteps = GasBlenderService.getPPSteps(this.he_first);
        this.nxSteps = GasBlenderService.getContinuousNxSteps();
        this.tmxSteps = GasBlenderService.getContinuousTmxSteps();
        this.idealCapacity = GasBlenderService.want
          .getCylinder()
          .getIdealCapacityAtPressure(GasBlenderService.want.getPressure());
        this.realCapacity = GasBlenderService.want
          .getCylinder()
          .getVdwCapacityAtPressure(
            GasBlenderService.want.getPressure(),
            GasBlenderService.want.getMix(),
            GasBlenderService.want.getKTemperature()
          );

        this.end_topup = cloneDeep(this.start);
        this.end_topup.topup(this.topup1.getMix(), this.end_topup_pres);
        this.calculateCosts();
      }
    }
  }

  update() {
    this.saveConfig();
    this.updateView = !this.updateView;
  }

  logScrollStart(ev) {
    this.content = ev.srcElement;
  }

  render() {
    return [
      <ion-header>
        <app-navbar
          tag="gas-blender"
          text="Gas Blender"
          color="blender"
        ></app-navbar>
      </ion-header>,
      <app-header-segment-toolbar
        color="blender"
        swiper={this.slider}
        titles={this.titles}
      ></app-header-segment-toolbar>,
      <ion-content
        class="slides"
        scrollEvents={true}
        onIonScrollStart={(ev) => this.logScrollStart(ev)}
      >
        <swiper-container class="slider-gas-blender swiper">
          <swiper-wrapper class="swiper-wrapper">
            <swiper-slide class="swiper-slide">
              <ion-list class="ion-text-wrap">
                <ion-item color="white">
                  <ion-grid class="ion-text-center">
                    <ion-row>
                      <ion-col style={{marginTop: "5px"}}>
                        <b>{DiveToolsService.isMetric() ? "Bar" : "Psi"}</b>
                      </ion-col>
                      <ion-col style={{marginTop: "5px"}}>
                        <b>
                          O<sub>2</sub>
                        </b>
                      </ion-col>
                      <ion-col style={{marginTop: "5px"}}>
                        <b>He</b>
                      </ion-col>
                      <ion-col style={{marginTop: "5px"}}>
                        <b>°{DiveToolsService.isMetric() ? "C" : "F"}</b>
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                </ion-item>
                <ion-item-divider color="white" class="ion-text-center">
                  <my-transl tag="topup-gas" text="Top-Up Gas" />
                </ion-item-divider>
                <ion-item>
                  <ion-grid class="ion-text-center">
                    <ion-row>
                      <ion-col
                        onClick={($event) =>
                          this.presentPopover($event, "topup", false)
                        }
                      ></ion-col>
                      <ion-col
                        onClick={($event) =>
                          this.presentPopover($event, "topup", false)
                        }
                      >
                        {this.topup.getFO2() * 100}
                      </ion-col>
                      <ion-col
                        onClick={($event) =>
                          this.presentPopover($event, "topup", false)
                        }
                      >
                        {this.topup.getFHe() * 100}
                      </ion-col>
                      <ion-col
                        onClick={($event) =>
                          this.presentPopover($event, "topup", false)
                        }
                      >
                        {this.topup.getTemperature()}
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                </ion-item>
                <ion-item-divider color="white" class="ion-text-center">
                  <my-transl tag="start-tank" text="Start Tank" />
                </ion-item-divider>
                <ion-item>
                  <ion-grid class="ion-text-center">
                    <ion-row>
                      <ion-col
                        onClick={($event) =>
                          this.presentPopover($event, "start")
                        }
                      >
                        {this.start.getPressure()}
                      </ion-col>
                      <ion-col
                        onClick={($event) =>
                          this.presentPopover($event, "start")
                        }
                      >
                        {round(this.start.getFO2() * 100, 0)}
                      </ion-col>
                      <ion-col
                        onClick={($event) =>
                          this.presentPopover($event, "start")
                        }
                      >
                        {round(this.start.getFHe() * 100, 0)}
                      </ion-col>
                      <ion-col
                        onClick={($event) =>
                          this.presentPopover($event, "start")
                        }
                      >
                        {this.start.getTemperature()}
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                </ion-item>
                <ion-item-divider color="white" class="ion-text-center">
                  <my-transl tag="end-tank" text="End Tank" />
                </ion-item-divider>
                <ion-item>
                  <ion-grid class="ion-text-center">
                    <ion-row>
                      <ion-col
                        onClick={($event) => this.presentPopover($event, "end")}
                      >
                        {this.end.getPressure()}
                      </ion-col>
                      <ion-col
                        onClick={($event) => this.presentPopover($event, "end")}
                      >
                        {round(this.end.getFO2() * 100, 0)}
                      </ion-col>
                      <ion-col
                        onClick={($event) => this.presentPopover($event, "end")}
                      >
                        {round(this.end.getFHe() * 100, 0)}
                      </ion-col>
                      <ion-col
                        onClick={($event) => this.presentPopover($event, "end")}
                      >
                        {this.end.getTemperature()}
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                </ion-item>
              </ion-list>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <ion-grid>
                <ion-row>
                  <ion-list class="ion-text-wrap">
                    <ion-grid class="ion-text-center">
                      <ion-row>
                        <ion-col>
                          <ion-item>
                            <my-transl tag="real-gas" text="Real gas" isLabel />
                            <ion-toggle
                              color="blender"
                              checked={this.real_gas}
                              onIonChange={() => this.toggleRealGas()}
                            ></ion-toggle>
                          </ion-item>
                        </ion-col>
                        <ion-col>
                          <ion-item>
                            <my-transl tag="he-first" text="He first" isLabel />
                            <ion-toggle
                              color="blender"
                              checked={this.he_first}
                              onIonChange={() => this.toggleHeFirst()}
                            ></ion-toggle>
                          </ion-item>
                        </ion-col>
                      </ion-row>
                    </ion-grid>
                    <ion-item color="white">
                      <ion-grid class="ion-text-center">
                        <ion-row>
                          <ion-col style={{marginTop: "5px"}}>
                            <b>
                              <my-transl tag="action" text="Action" />
                            </b>
                          </ion-col>
                          <ion-col style={{marginTop: "5px"}}>
                            <b>
                              <my-transl tag="start" text="Start" />
                            </b>
                          </ion-col>
                          <ion-col style={{marginTop: "5px"}}>
                            <b>+</b>
                          </ion-col>
                          <ion-col style={{marginTop: "5px"}}>
                            <b>=</b>
                          </ion-col>
                        </ion-row>
                      </ion-grid>
                    </ion-item>
                    <ion-item-divider color="white" class="ion-text-center">
                      <my-transl
                        tag="partial-pressure-blending"
                        text="Partial Pressure Blending"
                      />
                    </ion-item-divider>
                    {this.ppSteps.map((step) => (
                      <ion-item>
                        <ion-grid class="ion-text-center">
                          <ion-row>
                            <ion-col>
                              {step.blend}{" "}
                              {GasBlenderService.getGasName(step.mix)}
                            </ion-col>
                            <ion-col>{round(step.startPress, 1)}</ion-col>
                            <ion-col>{round(step.pressToAdd, 1)}</ion-col>
                            <ion-col>{round(step.finalPress, 1)}</ion-col>
                          </ion-row>
                        </ion-grid>
                      </ion-item>
                    ))}
                    <ion-item-divider color="white" class="ion-text-center">
                      <my-transl
                        tag="cont-nx-blending"
                        text="Continuous Nitrox Blending"
                        isLabel
                      />
                    </ion-item-divider>
                    {this.nxSteps.map((step) => (
                      <ion-item>
                        <ion-grid class="ion-text-center">
                          <ion-row>
                            <ion-col>
                              {step.blend}{" "}
                              {GasBlenderService.getGasName(step.mix)}
                            </ion-col>
                            <ion-col>{round(step.startPress, 1)}</ion-col>
                            <ion-col>{round(step.pressToAdd, 1)}</ion-col>
                            <ion-col>{round(step.finalPress, 1)}</ion-col>
                          </ion-row>
                        </ion-grid>
                      </ion-item>
                    ))}

                    <ion-item-divider color="white" class="ion-text-center">
                      <my-transl
                        tag="cont-tmx-blending"
                        text="Continuous Trimix Blending"
                        isLabel
                      />
                    </ion-item-divider>
                    {this.tmxSteps.map((step) => (
                      <ion-item>
                        <ion-grid class="ion-text-center">
                          <ion-row>
                            <ion-col>
                              {step.blend}{" "}
                              {GasBlenderService.getGasName(step.mix)}
                            </ion-col>
                            <ion-col>{round(step.startPress, 1)}</ion-col>
                            <ion-col>{round(step.pressToAdd, 1)}</ion-col>
                            <ion-col>{round(step.finalPress, 1)}</ion-col>
                          </ion-row>
                        </ion-grid>
                      </ion-item>
                    ))}
                  </ion-list>
                </ion-row>
              </ion-grid>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <ion-grid>
                <ion-row>
                  <ion-item style={{width: "100%"}}>
                    <ion-label>
                      <my-transl tag="tank" text="Tank"></my-transl>
                    </ion-label>

                    <ion-select
                      interface="action-sheet"
                      onIonChange={(ev) => this.changeTank(ev)}
                      value={this.tank.name}
                    >
                      {this.stdTanks.map((tank) => (
                        <ion-select-option value={tank.name}>
                          {tank.name}
                        </ion-select-option>
                      ))}
                    </ion-select>
                  </ion-item>
                </ion-row>
                <ion-row>
                  <ion-item style={{width: "100%"}}>
                    <ion-row style={{width: "100%"}}>
                      <ion-col>
                        {TranslationService.getTransl(
                          "ideal-capacity",
                          "Ideal Capacity"
                        ) +
                          ": " +
                          round(this.idealCapacity, 0) +
                          " " +
                          this.volumeUnit}
                      </ion-col>
                      {this.real_gas ? (
                        <ion-col>
                          {TranslationService.getTransl(
                            "real-capacity",
                            "Real Capacity"
                          ) +
                            ": " +
                            round(this.realCapacity, 0) +
                            " " +
                            this.volumeUnit}
                        </ion-col>
                      ) : undefined}
                    </ion-row>
                  </ion-item>
                </ion-row>
                <ion-row>
                  <ion-col>
                    <app-form-item
                      label-tag="he-cost"
                      label-text="Helium Cost"
                      appendText={
                        " (unit/" +
                        (DiveToolsService.isMetric() ? "m3" : "cuft") +
                        ")"
                      }
                      value={this.heCost}
                      name="heCost"
                      input-type="number"
                      onFormItemChanged={(ev) => this.updateCosts(ev)}
                    ></app-form-item>
                  </ion-col>
                  <ion-col>
                    <app-form-item
                      label-tag="o2-cost"
                      label-text="Oxygen Cost"
                      appendText={
                        " (unit/" +
                        (DiveToolsService.isMetric() ? "m3" : "cuft") +
                        ")"
                      }
                      value={this.o2Cost}
                      name="o2Cost"
                      input-type="number"
                      onFormItemChanged={(ev) => this.updateCosts(ev)}
                    ></app-form-item>
                  </ion-col>
                  <ion-col>
                    <app-form-item
                      label-tag="nx-cost"
                      label-text="Nitrox Cost"
                      appendText={
                        " (unit/" +
                        (DiveToolsService.isMetric() ? "m3" : "cuft") +
                        ")"
                      }
                      value={this.nxCost}
                      name="nxCost"
                      input-type="number"
                      onFormItemChanged={(ev) => this.updateCosts(ev)}
                    ></app-form-item>
                  </ion-col>
                  <ion-col>
                    <app-form-item
                      label-tag="tmx-cost"
                      label-text="Trimix Cost"
                      appendText={
                        " (unit/" +
                        (DiveToolsService.isMetric() ? "m3" : "cuft") +
                        ")"
                      }
                      value={this.tmxCost}
                      name="tmxCost"
                      input-type="number"
                      onFormItemChanged={(ev) => this.updateCosts(ev)}
                    ></app-form-item>
                  </ion-col>
                  <ion-col>
                    <app-form-item
                      label-tag="fill-cost"
                      label-text="Filling Cost"
                      appendText={" (unit)"}
                      value={this.chargeCost}
                      name="chargeCost"
                      input-type="number"
                      onFormItemChanged={(ev) => this.updateCosts(ev)}
                    ></app-form-item>
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col>
                    <ion-item>
                      <ion-grid>
                        <ion-row>
                          <ion-col>
                            <ion-row>
                              <my-transl
                                tag="partial-pressure-blending"
                                text="Partial Pressure Blending"
                              />
                            </ion-row>
                            {this.ppCost.o2.volume > 0 ? (
                              <ion-row>
                                <ion-note>
                                  O2: {this.ppCost.o2.volume}
                                  {this.volumeUnit} / {this.ppCost.o2.cost}u
                                </ion-note>
                              </ion-row>
                            ) : undefined}
                            {this.ppCost.he.volume > 0 ? (
                              <ion-row>
                                <ion-note>
                                  He: {this.ppCost.he.volume}
                                  {this.volumeUnit} / {this.ppCost.he.cost}u
                                </ion-note>
                              </ion-row>
                            ) : undefined}
                            {this.ppCost.tmx.volume > 0 ? (
                              <ion-row>
                                <ion-note>
                                  Tmx: {this.ppCost.tmx.volume}
                                  {this.volumeUnit} / {this.ppCost.tmx.cost}u
                                </ion-note>
                              </ion-row>
                            ) : undefined}
                            {this.ppCost.nx.volume > 0 ? (
                              <ion-row>
                                <ion-note>
                                  Nx: {this.ppCost.nx.volume}
                                  {this.volumeUnit} / {this.ppCost.nx.cost}u
                                </ion-note>
                              </ion-row>
                            ) : undefined}
                          </ion-col>
                          <ion-col size="4">{this.ppCost.totCost}u</ion-col>
                        </ion-row>
                      </ion-grid>
                    </ion-item>
                    <ion-item>
                      <ion-grid>
                        <ion-row>
                          <ion-col>
                            <ion-row>
                              <my-transl
                                tag="cont-nx-blending"
                                text="Continuous Nitrox Blending"
                              />
                            </ion-row>
                            {this.nbCost.he.volume > 0 ? (
                              <ion-row>
                                <ion-note>
                                  He: {this.nbCost.he.volume}
                                  {this.volumeUnit} / {this.nbCost.he.cost}u
                                </ion-note>
                              </ion-row>
                            ) : undefined}
                            {this.nbCost.nx.volume > 0 ? (
                              <ion-row>
                                <ion-note>
                                  Nx: {this.nbCost.nx.volume}
                                  {this.volumeUnit} / {this.nbCost.nx.cost}u
                                </ion-note>
                              </ion-row>
                            ) : undefined}
                          </ion-col>
                          <ion-col size="4">{this.nbCost.totCost}u</ion-col>
                        </ion-row>
                      </ion-grid>
                    </ion-item>
                    <ion-item>
                      <ion-grid>
                        <ion-row>
                          <ion-col>
                            <ion-row>
                              <my-transl
                                tag="cont-tmx-blending"
                                text="Continuous Trimix Blending"
                              />
                            </ion-row>
                            {this.tbCost.tmx.volume > 0 ? (
                              <ion-row>
                                <ion-note>
                                  Tmx: {this.tbCost.tmx.volume}
                                  {this.volumeUnit} / {this.tbCost.tmx.cost}u
                                </ion-note>
                              </ion-row>
                            ) : undefined}
                          </ion-col>
                          <ion-col size="4">{this.tbCost.totCost}u</ion-col>
                        </ion-row>
                      </ion-grid>
                    </ion-item>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <ion-list class="ion-text-wrap">
                <ion-item color="white">
                  <ion-grid class="ion-text-center">
                    <ion-row>
                      <ion-col style={{marginTop: "5px"}}>
                        <b>{DiveToolsService.isMetric() ? "Bar" : "Psi"}</b>
                      </ion-col>
                      <ion-col style={{marginTop: "5px"}}>
                        <b>
                          O<sub>2</sub>
                        </b>
                      </ion-col>
                      <ion-col style={{marginTop: "5px"}}>
                        <b>He</b>
                      </ion-col>
                      <ion-col style={{marginTop: "5px"}}>
                        <b>°{DiveToolsService.isMetric() ? "C" : "F"}</b>
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                </ion-item>
                <ion-item-divider color="white" class="ion-text-center">
                  <my-transl tag="topup-gas" text="Top-Up Gas" isLabel />
                </ion-item-divider>
                <ion-item>
                  <ion-grid class="ion-text-center">
                    <ion-row>
                      <ion-col
                        onClick={($event) =>
                          this.presentPopover($event, "topup1", false)
                        }
                      ></ion-col>
                      <ion-col
                        onClick={($event) =>
                          this.presentPopover($event, "topup1", false)
                        }
                      >
                        {round(this.topup1.getFO2() * 100, 0)}
                      </ion-col>
                      <ion-col
                        onClick={($event) =>
                          this.presentPopover($event, "topup1", false)
                        }
                      >
                        {round(this.topup1.getFHe() * 100, 0)}
                      </ion-col>
                      <ion-col
                        onClick={($event) =>
                          this.presentPopover($event, "topup1", false)
                        }
                      >
                        {this.topup1.getTemperature()}
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                </ion-item>
                <ion-item-divider color="white" class="ion-text-center">
                  <my-transl tag="start-tank" text="Start Tank" />
                </ion-item-divider>
                <ion-item>
                  <ion-grid class="ion-text-center">
                    <ion-row>
                      <ion-col
                        onClick={($event) =>
                          this.presentPopover($event, "start")
                        }
                      >
                        {this.start.getPressure()}
                      </ion-col>
                      <ion-col
                        onClick={($event) =>
                          this.presentPopover($event, "start")
                        }
                      >
                        {round(this.start.getFO2() * 100, 0)}
                      </ion-col>
                      <ion-col
                        onClick={($event) =>
                          this.presentPopover($event, "start")
                        }
                      >
                        {round(this.start.getFHe() * 100, 0)}
                      </ion-col>
                      <ion-col
                        onClick={($event) =>
                          this.presentPopover($event, "start")
                        }
                      >
                        {this.start.getTemperature()}
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                </ion-item>
                <ion-item-divider color="white" class="ion-text-center">
                  <my-transl tag="end-tank" text="End Tank" />
                </ion-item-divider>
                <ion-item>
                  <ion-grid class="ion-text-center">
                    <ion-row>
                      <ion-col>
                        <app-form-item
                          value={this.end_topup_pres.toString()}
                          name="end_topup"
                          input-type="number"
                          onFormItemChanged={(ev) => this.updateTopup(ev)}
                        ></app-form-item>
                      </ion-col>
                      <ion-col
                        style={{
                          marginTop: "18px",
                        }}
                      >
                        {this.end_topup.mMix.getO2()}
                      </ion-col>
                      <ion-col
                        style={{
                          marginTop: "18px",
                        }}
                      >
                        {this.end_topup.mMix.getHe()}
                      </ion-col>
                      <ion-col
                        style={{
                          marginTop: "18px",
                        }}
                      >
                        {this.end_topup.getTemperature()}
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                </ion-item>
              </ion-list>
            </swiper-slide>
          </swiper-wrapper>
        </swiper-container>
      </ion-content>,
    ];
  }
}
