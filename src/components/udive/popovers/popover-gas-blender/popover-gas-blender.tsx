import { Component, h, Host, Prop, Element, State } from "@stencil/core";

import { Gas } from "../../../../interfaces/udive/planner/gas";
import { Cylinder } from "../../../../interfaces/udive/planner/cylinder";
import { GasSupply } from "../../../../interfaces/udive/planner/gas-supply";
import { GasModel } from "../../../../interfaces/udive/planner/gas-model";
import { GasBlenderService } from "../../../../services/udive/planner/gas-blender";
import { UserService } from "../../../../services/common/user";
import { DiveToolsService } from "../../../../services/udive/planner/dive-tools";
import { popoverController } from "@ionic/core";
import { round, toNumber } from "lodash";

@Component({
  tag: "popover-gas-blender",
  styleUrl: "popover-gas-blender.scss",
})
export class PopoverGasBlender {
  @Element() el: HTMLElement;

  @Prop() gasProp: any;
  @Prop() stdGasesList: Array<GasModel>;
  @Prop() showBar: boolean = true;
  @Prop() hasTrimixlicence: boolean = true;

  scrollGas: HTMLElement;

  @State() gas: GasSupply = new GasSupply(
    new Cylinder(10, DiveToolsService.isMetric() ? 200 : 3000),
    new Gas(0.21, 0),
    DiveToolsService.isMetric() ? 200 : 3000,
    false,
    DiveToolsService.isMetric() ? 20 : 68
  );
  @State() form: any;
  stdGases: Array<any>;

  maxPressure = DiveToolsService.isMetric() ? 300 : 4300;
  maxTemperature = DiveToolsService.isMetric() ? 60 : 140;

  async componentWillLoad() {
    this.hasTrimixlicence = await UserService.checkLicence("trimix");
    if (this.gasProp && this.gasProp.getFO2()) {
      this.gas = this.gasProp;
    }
    this.setForm();
    this.updateStdGasList();
  }

  componentDidLoad() {
    this.scrollGas = this.el.querySelector("#scrollGas");
    this.updateStdGasList();
  }

  disconnectedCallback() {
    //check valid gases
    this.setForm();
  }

  save() {
    popoverController.dismiss(this.gas);
  }

  async setForm() {
    this.form = this.gas.getForm();
    this.hasTrimixlicence = await UserService.checkLicence("trimix");
  }

  updateStdGasList() {
    //create gas list
    this.stdGases = [];
    var isStandardGas = false;
    var i = 0;
    var n = 0;
    this.stdGasesList.forEach((gas) => {
      i++;
      let selected =
        this.gas.mMix.O2 === gas.O2 && this.gas.mMix.He === gas.He
          ? true
          : false;
      if (selected) {
        isStandardGas = true;
        n = i;
      }
      this.stdGases.push({
        selected: selected,
        gas: gas.getGas(),
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
  }

  selectStdGas(gas) {
    if (!this.hasTrimixlicence && gas.He > 0) {
      UserService.checkLicence("trimix", true);
      return;
    }
    this.gas.setMix(
      new Gas(
        round(gas.fO2, 3),
        round(gas.fHe, 3),
        gas.fromDepth,
        gas.ppO2,
        gas.units
      )
    );
    this.setForm();
    this.updateStdGasList();
  }

  inputHandler(event: any) {
    this.form[event.detail.name] = event.detail.value;
  }

  blurHandler(event: any) {
    this.updateGas(event.detail.name);
    if (event.detail.name == "bar") {
      this.gas.setPressure(
        toNumber(this.form.bar) > this.maxPressure
          ? this.maxPressure
          : toNumber(this.form.bar)
      );
    } else if (event.detail.name == "temp") {
      this.gas.setTemperature(
        toNumber(this.form.temp) > this.maxTemperature
          ? this.maxTemperature
          : toNumber(this.form.temp)
      );
    }
    this.setForm();
  }

  updateGas(input: string) {
    if (input == "o2") {
      this.gas.mMix.setFO2(round(toNumber(this.form.o2), 2) / 100);
    } else if (input == "he") {
      this.gas.mMix.setFHe(round(toNumber(this.form.he), 2) / 100);
    } else if (input == "bar") {
      this.gas.setPressure(toNumber(this.form.bar));
    } else if (input == "temp") {
      this.gas.setTemperature(toNumber(this.form.temp));
    }
    this.updateStdGasList();
  }

  render() {
    return (
      <Host>
        <ion-list>
          <ion-grid class='ion-no-padding'>
            <ion-row>
              <ion-col size='6'>
                <app-form-item
                  label-tag='o2'
                  label-text='O2'
                  value={this.form.o2}
                  name='o2'
                  input-type='number'
                  onFormItemChanged={(ev) => this.inputHandler(ev)}
                  onFormItemBlur={(ev) => this.blurHandler(ev)}
                  validator={[
                    "required",
                    {
                      name: "minmaxvalue",
                      options: { min: 0, max: 100 - this.form.he },
                    },
                  ]}
                ></app-form-item>
              </ion-col>
              <ion-col size='6'>
                {this.hasTrimixlicence ? (
                  <app-form-item
                    label-text='He'
                    value={this.form.he}
                    name='he'
                    input-type='number'
                    onFormItemChanged={(ev) => this.inputHandler(ev)}
                    onFormItemBlur={(ev) => this.blurHandler(ev)}
                    validator={[
                      "required",
                      {
                        name: "minmaxvalue",
                        options: { min: 0, max: 100 - this.form.o2 },
                      },
                    ]}
                  ></app-form-item>
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
              <ion-col size='6'>
                <app-form-item
                  label-tag='pressure'
                  label-text='Pressure'
                  appendText={" (" + DiveToolsService.pressUnit + ")"}
                  value={this.form.bar}
                  name='bar'
                  input-type='number'
                  onFormItemChanged={(ev) => this.inputHandler(ev)}
                  onFormItemBlur={(ev) => this.blurHandler(ev)}
                  validator={[
                    "required",
                    {
                      name: "minmaxvalue",
                      options: { min: 1, max: this.maxPressure },
                    },
                  ]}
                ></app-form-item>
              </ion-col>
              <ion-col size='6'>
                <app-form-item
                  label-tag='temperature'
                  label-text='Temperature'
                  appendText={
                    " (" + (DiveToolsService.isMetric() ? "°C" : "°F") + ")"
                  }
                  value={this.form.temp}
                  name='temp'
                  input-type='number'
                  onFormItemChanged={(ev) => this.inputHandler(ev)}
                  onFormItemBlur={(ev) => this.blurHandler(ev)}
                  validator={[
                    "required",
                    {
                      name: "minmaxvalue",
                      options: { min: 0, max: this.maxTemperature },
                    },
                  ]}
                ></app-form-item>
              </ion-col>
            </ion-row>

            <ion-row class='scrollx' id='scrollGas'>
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
              <ion-col class='item'>
                <ion-button
                  expand='block'
                  fill='outline'
                  size='small'
                  color='success'
                  onClick={() => this.save()}
                >
                  <my-transl tag='save' text='Save' />
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-list>
      </Host>
    );
  }
}
