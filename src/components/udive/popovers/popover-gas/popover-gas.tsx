import { Component, h, Element, Prop, State } from "@stencil/core";
import { Gas } from "../../../../interfaces/udive/planner/gas";
import { GasModel } from "../../../../interfaces/udive/planner/gas-model";
import { GasBlenderService } from "../../../../services/udive/planner/gas-blender";
import { UserService } from "../../../../services/common/user";
import { DiveToolsService } from "../../../../services/udive/planner/dive-tools";
import { alertController } from "@ionic/core";
import { TranslationService } from "../../../../services/common/translations";
import { filter, last, round, toNumber } from "lodash";

@Component({
  tag: "popover-gas",
  styleUrl: "popover-gas.scss",
})
export class PopoverGas {
  @Element() el: HTMLElement;
  scrollGas: HTMLElement;

  hasTrimixlicence = true;
  hasReblicence = true;
  @Prop() ccr = false;
  @Prop() parameters: any;
  @Prop() stdDecoGases: Array<GasModel>;
  @Prop() gasProp: Gas;
  stdGases: Array<any>;
  @State() gasWarning: boolean = false;
  @State() ENDWarning: boolean = false;
  popover: HTMLIonPopoverElement;

  @State() gas: Gas = new Gas();
  @State() form: any;
  @State() updateView = false;

  async componentWillLoad() {
    this.hasTrimixlicence = await UserService.checkLicence("trimix");
    this.hasReblicence = await UserService.checkLicence("reb");
    this.updateStdGasList();
    if (this.gasProp && this.gasProp.getFO2()) {
      this.gas = this.gasProp;
    } else {
      //select first available gas
      const gas = last(filter(this.stdGases, { active: true }));
      this.gas = gas ? gas["gas"] : new Gas(0.21, 0, 30, 1.2);
    }
    /*if (this.gas.fO2) {
      //update setpoint according to parameters
      if (this.gas.fO2 == 1) {
        this.gas.ppO2 = this.parameters.oxygenppO2;
      } else {
        this.gas.ppO2 = this.parameters.decoppO2;
      }
    }*/
    this.setForm();
    this.updateStdGasList();
  }

  componentDidLoad() {
    this.scrollGas = this.el.querySelector("#scrollGas");
    //update from Depth if Imperial
    this.stdDecoGases.forEach((gas) => {
      if (DiveToolsService.isImperial()) {
        gas.fromDepth =
          round(DiveToolsService.metersToFeet(gas.fromDepth) / 10) * 10;
      }
    });
    this.updateStdGasList();
    this.popover = this.el.closest("ion-popover");
  }

  disconnectedCallback() {
    //check valid gases
    this.setForm();
  }

  async setForm() {
    this.form = this.gas.getForm();
    this.hasTrimixlicence = await UserService.checkLicence("trimix");
    this.hasReblicence = await UserService.checkLicence("reb");
  }

  updateStdGasList() {
    //create gas list
    this.stdGases = [];
    let isStandardGas = false;
    let i = 0,
      n = 0;
    this.stdDecoGases.forEach((gas) => {
      i++;
      let selected =
        this.gas.O2 === gas.O2 && this.gas.He === gas.He ? true : false;
      if (selected) {
        isStandardGas = true;
        n = i;
      }

      //update setpoint according to parameters
      /*if (gas.O2 == 100) {
        gas.ppO2 = this.parameters.oxygenppO2;
      } else {
        gas.ppO2 = this.parameters.decoppO2;
      }*/
      //check user limitations and activate gas
      const gasModel = gas.getGas();
      const active = UserService.userRoles.licences.checkGasLimitations(
        gasModel,
        true
      );

      this.stdGases.push({
        selected: selected,
        active: active,
        gas: gasModel,
      });
    });
    setTimeout(() => {
      if (isStandardGas && this.scrollGas) {
        //scroll list to the left at the selected gas
        let width = this.scrollGas.scrollWidth;
        let clientWidth = this.scrollGas.clientWidth;
        let pagination = i / (width / clientWidth);
        n = n - pagination;
        n = n < 0 ? 0 : n;
        this.scrollGas.scrollLeft = ((width * n) / i) * 1.15;
      }
    });
    //check if gas had high pO2
    this.updateWarnings(this.gas.fromDepth, 1.6); //deco gases so keep 1.6 as limit pO2
  }

  updateWarnings(d, pO2) {
    //check if gas had high pO2
    this.gasWarning = this.gas.highPO2WarningatDepthWithTarget(d, pO2);
    this.ENDWarning = this.gas.highENDWarningatDepth(this.gas.fromDepth);
    this.updateView = !this.updateView;
  }

  selectStdGas(gas) {
    if (!this.hasTrimixlicence && gas.He > 0) {
      UserService.checkLicence("trimix", true);
      return;
    }
    this.gas = gas;
    this.setForm();
    this.updateStdGasList();
  }

  updateGas(input: string) {
    if (input == "o2") {
      this.gas.setFO2(round(toNumber(this.form.o2), 2) / 100);
    } else if (input == "he") {
      this.gas.setFHe(round(toNumber(this.form.he), 2) / 100);
    } else if (input == "fromDepth") {
      this.gas.setFromDepth(toNumber(this.form.fromDepth));
    } else if (input == "ppO2") {
      this.gas.ppO2 = toNumber(this.form.ppO2);
    }
    this.updateStdGasList();
  }

  inputHandler(event: any) {
    let value = toNumber(event.detail.value);
    this.form[event.detail.name] = value;
    this.updateGas(event.detail.name);
  }

  blurHandler(event) {
    let value = toNumber(event.detail.value);
    if (event.detail.name === "o2") {
      //check max O2
      const minO2 =
        UserService.userRoles.licences.getUserLimitations().minDecoO2;
      const maxO2 =
        UserService.userRoles.licences.getUserLimitations().maxDecoO2;
      if (value > maxO2) {
        value = maxO2;
      } else if (value < minO2) {
        value = minO2;
      }
      //check He value
      if (this.form.he + value > 100) {
        this.form.he = 100 - value;
      }
    } else if (event.detail.name === "he") {
      //check max O2
      const maxHe = UserService.userRoles.licences.getUserLimitations().maxHe;
      if (value > maxHe) {
        value = maxHe;
      }
      //check O2 value
      if (this.form.o2 + value > 100) {
        this.form.o2 = 100 - value;
      }
    } else if (event.detail.name === "ppO2") {
      value = toNumber(value);
    }
    this.form[event.detail.name] = value;
    this.updateGas(event.detail.name);
    this.setForm();
    this.updateStdGasList();
  }

  setUseAsDiluent(value) {
    this.gas.setUseAsDiluent(value);
    this.setForm();
  }

  async showpO2Info() {
    const alert = await alertController.create({
      header: "pO2 setpoint",
      message: TranslationService.getTransl(
        "po2-setpoint-info",
        "The pO2 setpoint is used to update the setpoint of the CCR within the range of this level or deco gas."
      ),
      buttons: [
        {
          text: TranslationService.getTransl("ok", "OK"),
        },
      ],
    });
    alert.present();
  }

  render() {
    return [
      <ion-list style={{ marginBottom: "0px" }}>
        <ion-grid class='ion-no-padding'>
          <ion-row>
            <ion-col>
              <ion-row class='ion-no-padding'>
                <app-form-item
                  label-text='O2'
                  value={this.form.o2}
                  name='o2'
                  input-type='number'
                  onFormItemChanged={(ev) => this.inputHandler(ev)}
                  onFormItemBlur={(ev) => this.blurHandler(ev)}
                  forceInvalid={this.gasWarning}
                  validator={[
                    "required",
                    {
                      name: "minmaxvalue",
                      options: {
                        min: UserService.userRoles.licences.getUserLimitations()
                          .minDecoO2,
                        max: UserService.userRoles.licences.getUserLimitations()
                          .maxDecoO2,
                      },
                    },
                  ]}
                ></app-form-item>
              </ion-row>
              {this.gasWarning ? (
                <ion-row class='ion-no-padding'>
                  <ion-col>
                    <div class='notification'>
                      <ion-icon name='warning' item-start></ion-icon>
                      High pO2 ({this.gas.getpO2atDepth(this.gas.fromDepth)}
                      )!
                    </div>
                  </ion-col>
                </ion-row>
              ) : undefined}
            </ion-col>
            <ion-col>
              {this.hasTrimixlicence ? (
                [
                  <ion-row class='ion-no-padding'>
                    <app-form-item
                      label-text='He'
                      value={this.form.he}
                      name='he'
                      input-type='number'
                      onFormItemChanged={(ev) => this.inputHandler(ev)}
                      onFormItemBlur={(ev) => this.blurHandler(ev)}
                      forceInvalid={this.ENDWarning}
                      validator={[
                        "required",
                        {
                          name: "minmaxvalue",
                          options: {
                            min: 0,
                            max: UserService.userRoles.licences.getUserLimitations()
                              .maxHe,
                          },
                        },
                      ]}
                    ></app-form-item>
                  </ion-row>,
                  this.ENDWarning ? (
                    <ion-row class='ion-no-padding'>
                      <ion-col>
                        <div class='notification'>
                          <ion-icon name='warning' item-start></ion-icon>
                          High END ({this.gas.getEND(this.gas.fromDepth)}
                          {DiveToolsService.depthUnit})!
                        </div>
                      </ion-col>
                    </ion-row>
                  ) : undefined,
                ]
              ) : (
                <app-form-item
                  label-text='He'
                  value={this.form.he}
                  onClick={() => UserService.checkLicence("trimix", true)}
                ></app-form-item>
              )}
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <app-form-item
                label-tag='from-depth'
                label-text='From Depth'
                value={this.form.fromDepth}
                name='fromDepth'
                input-type='number'
                onFormItemChanged={(ev) => this.inputHandler(ev)}
                onFormItemBlur={(ev) => this.blurHandler(ev)}
                validator={["required"]}
              ></app-form-item>
            </ion-col>
          </ion-row>
          {this.ccr
            ? [
                <ion-row>
                  <ion-col>
                    {this.hasReblicence ? (
                      <app-form-item
                        label-tag='pO2-setpoint'
                        label-text='pO2 setPoint'
                        value={this.form.ppO2}
                        name='ppO2'
                        input-type='number'
                        onFormItemChanged={(ev) => this.inputHandler(ev)}
                        onFormItemBlur={(ev) => this.blurHandler(ev)}
                        validator={[
                          {
                            name: "minmaxvalue",
                            options: { min: 0.5, max: 1.6 },
                          },
                        ]}
                      ></app-form-item>
                    ) : (
                      <app-form-item
                        label-tag='pO2-setpoint'
                        label-text='pO2 setPoint'
                        value={this.form.ppO2}
                        onClick={() => UserService.checkLicence("reb", true)}
                      ></app-form-item>
                    )}
                  </ion-col>
                  <ion-col size='2' class='ion-no-padding'>
                    <ion-button
                      shape='round'
                      fill='clear'
                      icon-only
                      class='ion-no-padding'
                      onClick={() => this.showpO2Info()}
                    >
                      <ion-icon name='help-circle-outline'></ion-icon>
                    </ion-button>
                  </ion-col>
                </ion-row>,
                <ion-row class='ion-no-padding'>
                  <ion-item style={{ width: "100%" }}>
                    <ion-label>
                      <my-transl
                        tag='use-as-diluent'
                        text='Use as diluent gas'
                      ></my-transl>
                    </ion-label>
                    <ion-toggle
                      color='gue-blue'
                      slot='end'
                      onIonChange={(ev) =>
                        this.setUseAsDiluent(ev.detail.checked)
                      }
                      checked={this.gas.getUseAsDiluent()}
                    ></ion-toggle>
                  </ion-item>
                </ion-row>,
              ]
            : undefined}

          <ion-row class='scrollx' id='scrollGas'>
            {this.stdGases.map((gas) => (
              <ion-col class='item'>
                <ion-button
                  shape='round'
                  color={gas.selected ? "secondary" : "primary"}
                  disabled={!gas.active}
                  onClick={() => this.selectStdGas(gas.gas)}
                >
                  {GasBlenderService.getGasName(gas.gas)}
                </ion-button>
              </ion-col>
            ))}
          </ion-row>
          <ion-row>
            <ion-col>
              <div class='notification' style={{ color: "blue" }}>
                MOD: {this.gas.getModF(this.gas.fO2, this.gas.ppO2)}
                {DiveToolsService.depthUnit} @ {this.gas.ppO2} pO2
              </div>
              <div class='notification' style={{ color: "blue" }}>
                pO2: {this.gas.getpO2atDepth(this.gas.fromDepth)} @{" "}
                {this.gas.fromDepth}
                {DiveToolsService.depthUnit}
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-list>,
      <app-modal-footer
        onCancelEmit={() => this.popover.dismiss()}
        onSaveEmit={() => this.popover.dismiss(this.form)}
      />,
    ];
  }
}
