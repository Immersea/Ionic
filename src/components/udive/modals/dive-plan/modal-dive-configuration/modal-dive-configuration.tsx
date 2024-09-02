import {Component, h, Prop, Element, State} from "@stencil/core";
import {popoverController, isPlatform} from "@ionic/core";
import {DivePlan} from "../../../../../services/udive/planner/dive-plan";
import {DiveConfiguration} from "../../../../../interfaces/udive/planner/dive-configuration";
import {GasModel} from "../../../../../interfaces/udive/planner/gas-model";
import {Tank} from "../../../../../interfaces/udive/planner/tank";
import {cloneDeep, filter, indexOf, orderBy, toString} from "lodash";
import {DiveStandardsService} from "../../../../../services/udive/planner/dive-standards";
import {Environment} from "../../../../../global/env";
import {DiveToolsService} from "../../../../../services/udive/planner/dive-tools";
import {UserService} from "../../../../../services/common/user";
//import { LicenceCheckProvider } from '../../../providers/licence-check';

@Component({
  tag: "modal-dive-configuration",
  styleUrl: "modal-dive-configuration.scss",
})
export class ModalDiveConfiguration {
  @Element() el: HTMLElement;
  @Prop() diveDataToShare: any;

  userStdConfigurations: any;
  diveConfig: DiveConfiguration;
  divePlan: DivePlan;
  ranges: any;
  stdConfigurations: Array<DiveConfiguration>;
  bottomTanks: Array<Tank>;
  decoTanks: Array<Tank>;
  bottomGases: Array<GasModel>;
  decoGases: Array<GasModel>;
  screenWidth: number;
  @State() updateView = true;
  validForm = {
    name: false,
    depth: false,
    time: false,
    bottom: false,
  };
  @State() showSave = false;

  componentWillLoad() {
    this.screenWidth = window.screen.width;
    //set private configuration for users
    this.divePlan = this.diveDataToShare.divePlan;
    this.diveConfig = this.divePlan.configuration;
    this.orderTanks();

    this.ranges = this.divePlan.getParamRanges(
      this.diveConfig.parameters.units
    );

    let gases = DiveStandardsService.getStdGases();
    gases = orderBy(gases, "fromDepth", "asc");

    this.bottomGases = filter(gases, {deco: false});
    this.decoGases = filter(gases, {deco: true});

    let tanks = UserService.userSettings.userTanks;
    tanks = orderBy(tanks, "volume");
    const bottomTanks = filter(tanks, {forDeco: false});
    const decoTanks = filter(tanks, {forDeco: true});
    this.bottomTanks = [];
    bottomTanks.forEach((tank) => {
      this.bottomTanks.push(tank.getTank());
    });
    this.decoTanks = [];
    decoTanks.forEach((tank) => {
      this.decoTanks.push(tank.getTank());
    });
    this.stdConfigurations = DiveStandardsService.getStdConfigurations();
    this.userStdConfigurations = cloneDeep(
      UserService.userSettings.userConfigurations
    );
  }

  componentDidLoad() {
    this.validateAll();
  }

  async addTank(event, bottom: boolean, tank?) {
    let data = {
      tank: tank,
      tanksList: null,
      stdGasesList: null,
      ccr: this.diveConfig.parameters.configuration == "CCR",
      parameters: this.diveConfig.parameters,
      decoTanks: !bottom,
    };
    if (bottom) {
      data.tanksList = this.bottomTanks;
      data.stdGasesList = this.bottomGases;
    } else {
      data.tanksList = this.decoTanks;
      data.stdGasesList = this.decoGases;
    }
    var cssClass = undefined;
    //make custom popover for capacitor apps
    if (isPlatform("capacitor")) {
      cssClass = "custom-mobile-popover";
      event = null;
    }
    const popover = await popoverController.create({
      component: "popover-tank",
      event: event,
      translucent: true,
      backdropDismiss: false,
      cssClass: cssClass,
      componentProps: data,
    });
    popover.present();

    popover.onDidDismiss().then((updatedTank: any) => {
      updatedTank = updatedTank.data as Tank;
      if (updatedTank) {
        let config;
        if (bottom) {
          config = this.diveConfig.configuration.bottom;
        } else {
          config = this.diveConfig.configuration.deco;
        }
        if (!tank) {
          config.push(updatedTank);
        } else {
          let index = indexOf(config, tank);
          config.splice(index, 1, updatedTank);
        }
        this.orderTanks();
        this.validateForm("tanks");
      }
    });
  }

  deleteTank(bottom: boolean, index) {
    let config;
    if (bottom) {
      config = this.diveConfig.configuration.bottom;
    } else {
      config = this.diveConfig.configuration.deco;
    }
    config.splice(index, 1);
    this.orderTanks();
  }

  orderTanks() {
    this.diveConfig.configuration.bottom = orderBy(
      this.diveConfig.configuration.bottom,
      "gas.fromDepth"
    );

    this.diveConfig.configuration.deco = orderBy(
      this.diveConfig.configuration.deco,
      "gas.fromDepth"
    );

    this.updateView = !this.updateView;
  }

  updateParams(params) {
    this.divePlan.parameters = params;
  }

  save() {
    this.el.closest("ion-modal").dismiss(this.diveConfig);
  }

  close() {
    this.el.closest("ion-modal").dismiss();
  }

  inputHandler(event: any) {
    this.diveConfig[event.detail.name] = event.detail.value;
  }

  validateAll() {
    this.validForm.name = this.diveConfig.stdName.length >= 3;
    this.validForm.depth = this.diveConfig.maxDepth > 1;
    this.validForm.time = this.diveConfig.maxTime > 1;
    this.validateForm("tanks");
    this.updateView = !this.updateView;
  }

  validateForm(item, valid?) {
    if (item == "name") {
      this.validForm.name = valid;
    } else if (item == "time") {
      this.validForm.time = valid;
    } else if (item == "depth") {
      this.validForm.depth = valid;
    } else {
      this.validForm.bottom = this.bottomTanks.length > 0;
    }
    this.showSave =
      this.validForm.name &&
      this.validForm.time &&
      this.validForm.depth &&
      this.validForm.bottom;
  }

  copyConfiguration(conf) {
    this.diveConfig = conf;
    this.validateAll();
  }

  render() {
    return [
      <app-navbar
        tag="dive-configuration"
        text="Dive Configuration"
        color={Environment.getAppColor()}
        modal={true}
      ></app-navbar>,

      <ion-content>
        <ion-list>
          <ion-list-header>Copy from standard configuration</ion-list-header>
          <ion-row class="scrollx" id="scrollTankGas">
            {this.userStdConfigurations
              ? this.userStdConfigurations.map((conf) => (
                  <ion-col class="item">
                    <ion-button
                      shape="round"
                      color={Environment.getAppColor()}
                      onClick={() => this.copyConfiguration(conf)}
                    >
                      {conf.stdName}
                    </ion-button>
                  </ion-col>
                ))
              : undefined}
            {this.stdConfigurations
              ? this.stdConfigurations.map((conf) => (
                  <ion-col class="item">
                    <ion-button
                      shape="round"
                      color="success"
                      onClick={() => this.copyConfiguration(conf)}
                    >
                      DP-{conf.stdName}
                    </ion-button>
                  </ion-col>
                ))
              : undefined}
          </ion-row>
          <app-form-item
            label-tag="configuration-name"
            label-text="Configuration Name"
            value={this.diveConfig.stdName}
            name="stdName"
            input-type="text"
            onFormItemChanged={(ev) => this.inputHandler(ev)}
            validator={["required"]}
            onIsValid={(ev) => this.validateForm("name", ev.detail)}
          ></app-form-item>
          <app-form-item
            label-tag="max-depth"
            label-text="Max Depth (xxx)"
            labelReplace={{xxx: this.diveConfig.parameters.depthUnit}}
            value={toString(this.diveConfig.maxDepth)}
            name="maxDepth"
            input-type="number"
            onFormItemChanged={(ev) => this.inputHandler(ev)}
            validator={[
              "required",
              {
                name: "minvalue",
                options: {min: 1},
              },
            ]}
            onIsValid={(ev) => this.validateForm("depth", ev.detail)}
          ></app-form-item>
          <app-form-item
            label-tag="max-time"
            label-text="Max Time (min)"
            value={toString(this.diveConfig.maxTime)}
            name="maxTime"
            input-type="number"
            onFormItemChanged={(ev) => this.inputHandler(ev)}
            validator={[
              "required",
              {
                name: "minvalue",
                options: {min: 1},
              },
            ]}
            onIsValid={(ev) => this.validateForm("time", ev.detail)}
          ></app-form-item>
          <ion-list-header>
            <my-transl
              tag="tanks-configuration"
              text="Tank(s) Configuration"
              isLabel
            />
          </ion-list-header>
          <ion-list-header>
            <ion-grid class="ion-no-padding">
              <ion-row>
                <ion-col>
                  <my-transl tag="bottom" text="Bottom" isLabel />
                </ion-col>
                <ion-col size="1">
                  <ion-row class="ion-text-center">
                    <ion-button
                      icon-only
                      fill="clear"
                      color="primary"
                      onClick={(ev) =>
                        this.addTank(this.screenWidth >= 500 ? ev : null, true)
                      }
                    >
                      <ion-icon name="add-circle"></ion-icon>
                    </ion-button>
                  </ion-row>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-list-header>
          {this.diveConfig.configuration.bottom.length > 0 ? (
            <ion-grid>
              <ion-row class="ion-text-center">
                {this.diveConfig.configuration.bottom.map((tank, i) => (
                  <ion-col size="12" size-sm>
                    {tank.name ? (
                      <ion-card>
                        <ion-card-header class="ion-text-center">
                          {tank.name}
                        </ion-card-header>
                        <ion-card-content class="ion-text-center">
                          <p>{tank.gas.toString()}</p>
                          <p>
                            {tank.pressure}
                            {DiveToolsService.pressUnit} / {tank.getGasVolume()}
                            {DiveToolsService.volumeUnit}
                          </p>
                        </ion-card-content>
                        <ion-grid class="ion-no-padding">
                          <ion-row>
                            <ion-col>
                              <ion-button
                                icon-left
                                fill="clear"
                                size="small"
                                onClick={(ev) =>
                                  this.addTank(
                                    this.screenWidth >= 500 ? ev : null,
                                    true,
                                    tank
                                  )
                                }
                              >
                                <ion-icon name="create"></ion-icon>
                                <my-transl tag="edit" text="Edit" />
                              </ion-button>
                            </ion-col>
                            <ion-col>
                              <ion-button
                                icon-left
                                fill="clear"
                                size="small"
                                onClick={() => this.deleteTank(true, i)}
                              >
                                <ion-icon name="trash"></ion-icon>
                                <my-transl tag="delete" text="Delete" />
                              </ion-button>
                            </ion-col>
                          </ion-row>
                        </ion-grid>
                      </ion-card>
                    ) : undefined}
                  </ion-col>
                ))}
              </ion-row>
            </ion-grid>
          ) : undefined}

          <ion-list-header>
            <ion-grid class="ion-no-padding">
              <ion-row>
                <ion-col>
                  <my-transl tag="deco" text="Deco" isLabel />
                </ion-col>
                <ion-col size="1">
                  <ion-row class="ion-text-center">
                    <ion-button
                      icon-only
                      fill="clear"
                      color="primary"
                      onClick={(ev) =>
                        this.addTank(this.screenWidth >= 500 ? ev : null, false)
                      }
                    >
                      <ion-icon name="add-circle"></ion-icon>
                    </ion-button>
                  </ion-row>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-list-header>
          {this.diveConfig.configuration.deco.length > 0 ? (
            <ion-grid class="ion-no-padding">
              <ion-row class="ion-text-center">
                {this.diveConfig.configuration.deco.map((tank, i) => (
                  <ion-col size="12" size-sm>
                    {tank.name ? (
                      <ion-card>
                        <ion-card-header class="ion-text-center">
                          {tank.name}
                        </ion-card-header>
                        <ion-card-content class="ion-text-center">
                          <p>{tank.gas.toString()}</p>
                          <p>
                            {tank.pressure}
                            {DiveToolsService.pressUnit} / {tank.getGasVolume()}
                            {DiveToolsService.volumeUnit}
                          </p>
                        </ion-card-content>
                        <ion-grid class="ion-no-padding">
                          <ion-row>
                            <ion-col>
                              <ion-button
                                icon-left
                                fill="clear"
                                size="small"
                                onClick={(ev) =>
                                  this.addTank(
                                    this.screenWidth >= 500 ? ev : null,
                                    false,
                                    tank
                                  )
                                }
                              >
                                <ion-icon name="create"></ion-icon>
                                <my-transl tag="edit" text="Edit" />
                              </ion-button>
                            </ion-col>
                            <ion-col>
                              <ion-button
                                icon-left
                                fill="clear"
                                size="small"
                                onClick={() => this.deleteTank(false, i)}
                              >
                                <ion-icon name="trash"></ion-icon>
                                <my-transl tag="delete" text="Delete" />
                              </ion-button>
                            </ion-col>
                          </ion-row>
                        </ion-grid>
                      </ion-card>
                    ) : undefined}
                  </ion-col>
                ))}
              </ion-row>
            </ion-grid>
          ) : undefined}
          <app-decoplanner-settings
            diveDataToShare={this.diveDataToShare}
            onUpdateParamsEvent={(params) => this.updateParams(params)}
          />
        </ion-list>
      </ion-content>,
      <app-modal-footer
        disableSave={!this.showSave}
        onCancelEmit={() => this.close()}
        onSaveEmit={() => this.save()}
      />,
    ];
  }
}
