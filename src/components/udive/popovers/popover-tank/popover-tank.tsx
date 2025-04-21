import { Component, h, Element, Prop, State } from "@stencil/core";
import { GasModel } from "../../../../interfaces/udive/planner/gas-model";
import { Tank } from "../../../../interfaces/udive/planner/tank";
import { TankModel } from "../../../../interfaces/udive/planner/tank-model";
import { GasBlenderService } from "../../../../services/udive/planner/gas-blender";
import { UserService } from "../../../../services/common/user";
import { DiveToolsService } from "../../../../services/udive/planner/dive-tools";
import { find, toNumber } from "lodash";
import { TranslationService } from "../../../../services/common/translations";

@Component({
  tag: "popover-tank",
  styleUrl: "popover-tank.scss",
})
export class PopoverTank {
  @Element() el: HTMLElement;
  scrollGas: HTMLElement;
  hasTrimixlicence = false;
  hasReblicence = false;
  @Prop() ccr = false;
  stdGases: Array<any>;
  @Prop() stdGasesList: Array<GasModel>;
  @Prop() parameters: any;
  @Prop() tank: Tank;
  @Prop() decoTanks: boolean;
  popover: HTMLIonPopoverElement;
  @State() form: any;

  selectedTank: TankModel;
  @Prop() tanksList: Array<any>;

  componentWillLoad() {
    if (!this.tank) {
      let newTank = new TankModel();
      newTank.setForDeco(this.decoTanks);
      this.tank = newTank.getTank();
    }
    this.selectedTank = find(this.tanksList, { name: this.tank.name });
    if (!this.selectedTank)
      this.selectedTank = find(this.tanksList, {
        name: this.tank.name.toUpperCase(),
      });
    let gas = this.tank.gas;
    if (gas.fO2) {
      //update setpoint according to parameters
      /*if (gas.fO2 == 1) {
        gas.ppO2 = this.parameters.oxygenppO2;
      } else {
        gas.ppO2 = this.parameters.decoppO2;
      }*/
      this.tank.gas = gas;
    }
    this.setForm();
    this.updateStdGasList();
  }

  componentDidLoad() {
    this.scrollGas = this.el.querySelector("#scrollTankGas");
    this.updateStdGasList();
    this.popover = this.el.closest("ion-popover");
    this.setForm();
  }

  async setForm() {
    this.form = this.tank.getForm();
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
        this.tank.gas.O2 === gas.O2 && this.tank.gas.He === gas.He
          ? true
          : false;
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
      this.stdGases.push({
        selected: selected,
        gas: gas.getGas(),
      });
    });

    if (isStandardGas && this.scrollGas) {
      //scroll list to the left at the selected gas
      setTimeout(() => {
        let width = this.scrollGas.scrollWidth;
        let clientWidth = this.scrollGas.clientWidth;
        let pagination = i / (width / clientWidth);
        n = n - pagination;
        n = n < 0 ? 0 : n;
        this.scrollGas.scrollLeft = ((width * n) / i) * 1.15;
      });
    }
  }

  selectStdGas(gas) {
    if (!this.hasTrimixlicence && gas.He > 0) {
      UserService.checkLicence("trimix", true);
      return;
    }
    this.tank.gas = gas;
    this.setForm();
    this.updateStdGasList();
  }

  updateTank() {
    this.tank.setPressure(toNumber(this.form.pressure));
    this.tank.gas.updateGas(
      toNumber(this.form.O2) / 100,
      toNumber(this.form.He) / 100,
      toNumber(this.form.fromDepth)
    );
    this.updateStdGasList();
  }

  save() {
    this.tank.setTankType(this.selectedTank);
    this.popover.dismiss(this.tank);
  }

  close() {
    this.popover.dismiss();
  }

  inputHandler(event: any) {
    this.form[event.detail.name] = event.detail.value;
  }

  blurHandler() {
    this.updateTank();
    this.setForm();
  }

  selectTank(ev) {
    this.selectedTank = ev.detail.value;
  }

  render() {
    return [
      <ion-list style={{ marginBottom: "0" }}>
        <ion-grid class='ion-no-padding'>
          <ion-row>
            <ion-col>
              <ion-item>
                <ion-select
                  label={TranslationService.getTransl("tank", "Tank")}
                  onIonChange={(ev) => this.selectTank(ev)}
                  value={this.selectedTank}
                >
                  {this.tanksList.map((tank) => (
                    <ion-select-option value={tank}>
                      {tank.name}
                    </ion-select-option>
                  ))}
                </ion-select>
              </ion-item>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <app-form-item
                label-tag='pressure'
                label-text='Pressure'
                value={this.form.pressure}
                name='pressure'
                input-type='number'
                onFormItemChanged={(ev) => this.inputHandler(ev)}
                onFormItemBlur={() => this.blurHandler()}
                validator={["required"]}
              ></app-form-item>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <app-form-item
                label-text='O2'
                value={this.form.O2}
                name='O2'
                input-type='number'
                onFormItemChanged={(ev) => this.inputHandler(ev)}
                onFormItemBlur={() => this.blurHandler()}
                validator={[
                  "required",
                  {
                    name: "minmaxvalue",
                    options: { min: 1, max: 100 - this.form.He },
                  },
                ]}
              ></app-form-item>
            </ion-col>
            <ion-col>
              {this.hasTrimixlicence ? (
                <app-form-item
                  label-text='He'
                  value={this.form.He}
                  name='He'
                  input-type='number'
                  onFormItemChanged={(ev) => this.inputHandler(ev)}
                  onFormItemBlur={() => this.blurHandler()}
                  validator={[
                    "required",
                    {
                      name: "minmaxvalue",
                      options: { min: 0, max: 100 - this.form.O2 },
                    },
                  ]}
                ></app-form-item>
              ) : (
                <ion-item
                  onClick={() => UserService.checkLicence("trimix", true)}
                >
                  <ion-label>He</ion-label>
                  {this.form.He}
                </ion-item>
              )}
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <app-form-item
                label-tag='depth'
                label-text='Depth'
                value={this.form.fromDepth}
                name='fromDepth'
                input-type='number'
                onFormItemChanged={(ev) => this.inputHandler(ev)}
                onFormItemBlur={() => this.blurHandler()}
                validator={["required"]}
              ></app-form-item>
            </ion-col>
            {this.ccr ? (
              <ion-col>
                {this.hasReblicence ? (
                  <app-form-item
                    label-tag='pO2-setpoint'
                    label-text='pO2 setPoint'
                    value={this.form.ppO2}
                    name='ppO2'
                    input-type='number'
                    onFormItemChanged={(ev) => this.inputHandler(ev)}
                    onFormItemBlur={() => this.blurHandler()}
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
            ) : undefined}
          </ion-row>
          <ion-row class='scrollx' id='scrollTankGas'>
            {this.stdGases.map((gas) => (
              <ion-col class='item'>
                <ion-button
                  shape='round'
                  color={gas.selected ? "secondary" : "primary"}
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
                MOD: {this.tank.gas.getMod()}
                {DiveToolsService.depthUnit} @ {this.tank.gas.ppO2} pO2
              </div>
              <div class='notification' style={{ color: "blue" }}>
                pO2: {this.tank.gas.getpO2atDepth(this.tank.gas.fromDepth, 2)}{" "}
                pO2 @ {this.tank.gas.fromDepth}
                {DiveToolsService.depthUnit}
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-list>,
      <app-modal-footer
        onCancelEmit={() => this.close()}
        onSaveEmit={() => this.save()}
      />,
    ];
  }
}
