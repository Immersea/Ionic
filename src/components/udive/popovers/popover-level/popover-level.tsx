import {Component, h, Element, Prop, State} from "@stencil/core";
import {DiveProfilePoint} from "../../../../interfaces/udive/planner/dive-profile-point";
import {GasModel} from "../../../../interfaces/udive/planner/gas-model";
import {GasBlenderService} from "../../../../services/udive/planner/gas-blender";
import {UserService} from "../../../../services/common/user";
import {DiveToolsService} from "../../../../services/udive/planner/dive-tools";
import {alertController} from "@ionic/core";
import {TranslationService} from "../../../../services/common/translations";
import {find, round, toNumber} from "lodash";

@Component({
  tag: "popover-level",
  styleUrl: "popover-level.scss",
})
export class PopoverLevel {
  @Element() el: HTMLElement;
  scrollGas: HTMLElement;

  hasTrimixlicence = true;
  hasReblicence = true;
  @Prop() ccr = false;
  @Prop() parameters: any;
  @Prop() stdGasesList: Array<GasModel>;
  @Prop() levelProp: DiveProfilePoint;
  @Prop() units: string = "Metric";
  stdGases: Array<any>;
  @State() gasWarning: boolean = false;
  @State() ENDWarning: boolean = false;
  popover: HTMLIonPopoverElement;
  updateGas: boolean = true;
  updateNewGas: boolean;

  @State() level: DiveProfilePoint = new DiveProfilePoint();
  @State() form: any;
  @State() updateView = false;

  async componentWillLoad() {
    this.hasTrimixlicence = await UserService.checkLicence("trimix");
    this.hasReblicence = await UserService.checkLicence("reb");
    this.level = new DiveProfilePoint();
    if (this.levelProp.depth) {
      this.level.setGas(this.levelProp.gas.fO2, this.levelProp.gas.fHe);
      this.level.setValue("depth", this.levelProp.depth);
      this.level.setValue("setpoint", this.levelProp.setpoint);
      this.level.setValue("time", this.levelProp.time);
      this.level.setValue("index", this.levelProp.index);
    }
    //this.updateGas = this.levelProp.updateGas;
    this.setForm();
    this.updateStdGasList();
  }

  componentDidLoad() {
    this.scrollGas = this.el.querySelector("#scrollGas");
    this.updateStdGasList();
    this.popover = this.el.closest("ion-popover");
  }

  disconnectedCallback() {
    //check valid gases
    this.setForm();
  }

  async setForm() {
    this.form = this.level.getForm();
    this.hasTrimixlicence = await UserService.checkLicence("trimix");
    this.hasReblicence = await UserService.checkLicence("reb");
  }

  updateStdGasList() {
    //create gas list
    this.stdGases = [];
    let isStandardGas = false;
    let i = 0,
      n = 0;
    this.stdGasesList.forEach((gas) => {
      i++;
      let selected =
        this.level.gas.O2 === gas.O2 && this.level.gas.He === gas.He
          ? true
          : false;
      if (selected) {
        isStandardGas = true;
        n = i;
      }
      //update setpoint according to parameters
      gas.ppO2 = this.parameters.bottomppO2;

      //check user limitations and activate gas
      const gasModel = gas.getGas();
      const active = UserService.userRoles.licences.checkGasLimitations(
        gasModel,
        false
      );
      this.stdGases.push({
        selected: selected,
        active: active,
        gas: gasModel,
      });
    });

    if (isStandardGas && this.scrollGas) {
      //scroll list to the left at the selected gas
      setTimeout(() => {
        //scroll list to the left at the selected gas
        let width = this.scrollGas.scrollWidth;
        let clientWidth = this.scrollGas.clientWidth;
        let pagination = i / (width / clientWidth);
        n = n - pagination;
        n = n < 0 ? 0 : n;
        this.scrollGas.scrollLeft = ((width * n) / i) * 1.15;
      });
    }
    //update only if it's a standard gas and it's allowed to update
    this.updateNewGas = isStandardGas && this.updateGas;
    //check if gas had high pO2
    this.updateWarnings(this.level.depth, this.level.gas.ppO2);
  }

  updateWarnings(d, pO2) {
    //check if gas had high pO2
    this.gasWarning = this.level.gas.highPO2WarningatDepthWithTarget(d, pO2);
    this.ENDWarning = this.level.gas.highENDWarningatDepth(this.level.depth);
    this.updateView = !this.updateView;
  }

  setStdGasForDepth() {
    if (!this.hasTrimixlicence) {
      return;
    }
    if (this.updateNewGas) {
      let gas = find(this.stdGases, (gas) => {
        return gas.gas.fromDepth >= this.level.depth;
      });
      if (gas) {
        gas.selected = true;
        //get setpoint from preferences
        this.level.setValue("setpoint", gas.gas.ppO2);
        if (!this.hasTrimixlicence && gas.He > 0) {
          gas.gas.He = 0;
        }
        this.level.setGas(gas.gas.O2 / 100, gas.gas.He / 100);
      }
    }
    this.setForm();
  }

  selectStdGas(gas) {
    if (!this.hasTrimixlicence && gas.He > 0) {
      UserService.checkLicence("trimix", true);
      return;
    }
    this.updateNewGas = true;
    //get setpoint from preferences
    this.level.setValue("setpoint", gas.ppO2);
    this.level.setGas(gas.O2 / 100, gas.He / 100);
    this.updateStdGasList();
    this.setForm();
  }

  updateValue(input: string) {
    this.level.setValue(input, this.form[input]);
    if (input == "depth") {
      this.setStdGasForDepth();
      this.updateStdGasList();
    } else if (input == "o2" || input == "he") {
      this.level.setGas(
        round(this.form.o2 / 100, 2),
        round(this.form.he / 100, 2)
      );
      //check if standard gas
      this.updateStdGasList();
    }
  }

  inputHandler(event: any) {
    let value = toNumber(event.detail.value);
    this.form[event.detail.name] = value;
    this.updateValue(event.detail.name);
  }

  blurHandler(event) {
    let value = toNumber(event.detail.value);
    if (event.detail.name === "depth") {
      //check max depth
      const maxDepth = UserService.userRoles.licences.checkDepthLimitations();
      if (value > maxDepth) {
        value = maxDepth;
      }
    } else if (event.detail.name === "o2") {
      //check max O2
      const minO2 = UserService.userRoles.licences.getUserLimitations().minO2;
      const maxO2 = UserService.userRoles.licences.getUserLimitations().maxO2;
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
    } else if (event.detail.name === "setpoint") {
      value = toNumber(value);
    }
    this.form[event.detail.name] = value;
    this.updateValue(event.detail.name);
    this.setForm();
    this.updateStdGasList();
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
      <ion-list style={{marginBottom: "0px"}}>
        <ion-grid class="ion-no-padding">
          <ion-row>
            <ion-col>
              <app-form-item
                label-tag="depth"
                label-text="Depth"
                value={this.form.depth}
                name="depth"
                input-type="number"
                onFormItemChanged={(ev) => this.inputHandler(ev)}
                onFormItemBlur={(ev) => this.blurHandler(ev)}
                validator={[
                  "required",
                  {
                    name: "minmaxvalue",
                    options: {
                      min: 1,
                      max: UserService.userRoles.licences.checkDepthLimitations(),
                    },
                  },
                ]}
              ></app-form-item>
            </ion-col>
            <ion-col>
              <app-form-item
                label-tag="time"
                label-text="Time"
                value={this.form.time}
                name="time"
                input-type="number"
                onFormItemChanged={(ev) => this.inputHandler(ev)}
                onFormItemBlur={(ev) => this.blurHandler(ev)}
                validator={["required"]}
              ></app-form-item>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ion-row class="ion-no-padding">
                <app-form-item
                  label-text="O2"
                  value={this.form.o2}
                  name="o2"
                  input-type="number"
                  onFormItemChanged={(ev) => this.inputHandler(ev)}
                  onFormItemBlur={(ev) => this.blurHandler(ev)}
                  forceInvalid={this.gasWarning}
                  validator={[
                    "required",
                    {
                      name: "minmaxvalue",
                      options: {
                        min: UserService.userRoles.licences.getUserLimitations()
                          .minO2,
                        max: UserService.userRoles.licences.getUserLimitations()
                          .maxO2,
                      },
                    },
                  ]}
                ></app-form-item>
              </ion-row>
              {this.gasWarning ? (
                <ion-row class="ion-no-padding">
                  <ion-col>
                    <div class="notification">
                      <ion-icon name="warning" item-start></ion-icon>
                      High pO2 ({this.level.gas.getpO2atDepth(this.level.depth)}
                      )!
                    </div>
                  </ion-col>
                </ion-row>
              ) : undefined}
            </ion-col>
            <ion-col>
              {this.hasTrimixlicence ? (
                [
                  <ion-row class="ion-no-padding">
                    <app-form-item
                      label-text="He"
                      value={this.form.he}
                      name="he"
                      input-type="number"
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
                    <ion-row class="ion-no-padding">
                      <ion-col>
                        <div class="notification">
                          <ion-icon name="warning" item-start></ion-icon>
                          High END ({this.level.gas.getEND(this.level.depth)}
                          {DiveToolsService.depthUnit})!
                        </div>
                      </ion-col>
                    </ion-row>
                  ) : undefined,
                ]
              ) : (
                <app-form-item
                  label-text="He"
                  value={this.form.he}
                  onClick={() => UserService.checkLicence("trimix", true)}
                ></app-form-item>
              )}
            </ion-col>
          </ion-row>
          {this.ccr ? (
            <ion-row>
              <ion-col>
                {this.hasReblicence ? (
                  <app-form-item
                    label-tag="pO2-setpoint"
                    label-text="pO2 setPoint"
                    value={this.form.setpoint}
                    name="setpoint"
                    input-type="number"
                    onFormItemChanged={(ev) => this.inputHandler(ev)}
                    onFormItemBlur={(ev) => this.blurHandler(ev)}
                    validator={[
                      {
                        name: "minmaxvalue",
                        options: {min: 0.5, max: 1.6},
                      },
                    ]}
                  ></app-form-item>
                ) : (
                  <app-form-item
                    label-tag="pO2-setpoint"
                    label-text="pO2 setPoint"
                    value={this.form.setpoint}
                    onClick={() => UserService.checkLicence("reb", true)}
                  ></app-form-item>
                )}
              </ion-col>
              <ion-col size="2" class="ion-no-padding">
                <ion-button
                  shape="round"
                  fill="clear"
                  icon-only
                  class="ion-no-padding"
                  onClick={() => this.showpO2Info()}
                >
                  <ion-icon name="help-circle-outline"></ion-icon>
                </ion-button>
              </ion-col>
            </ion-row>
          ) : undefined}

          <ion-row class="scrollx" id="scrollGas">
            {this.stdGases.map((gas) => (
              <ion-col class="item">
                <ion-button
                  shape="round"
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
              <div class="notification" style={{color: "blue"}}>
                MOD:{" "}
                {this.level.gas.getModF(
                  this.level.gas.fO2,
                  this.level.gas.ppO2
                )}
                {DiveToolsService.depthUnit} @ {this.level.gas.ppO2} pO2
              </div>
              <div class="notification" style={{color: "blue"}}>
                END: {this.level.gas.getEND(this.level.depth)}
                {DiveToolsService.depthUnit} @ {this.level.depth}
                {DiveToolsService.depthUnit}
              </div>
              <div class="notification" style={{color: "blue"}}>
                pO2: {this.level.gas.getpO2atDepth(this.level.depth)} @{" "}
                {this.level.depth}
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
