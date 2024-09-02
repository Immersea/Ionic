import {alertController} from "@ionic/core";
import {Component, Event, EventEmitter, h, Prop, State} from "@stencil/core";
import {Environment} from "../../../../../global/env";
import {ARPCModel} from "../../../../../interfaces/udive/planner/arpc";
import {DatabaseService} from "../../../../../services/common/database";
import {TranslationService} from "../../../../../services/common/translations";
import {round} from "lodash";

const CELLDATE = "CCR-cell-date";
@Component({
  tag: "app-decoplanner-arpc",
  styleUrl: "app-decoplanner-arpc.scss",
})
export class AppDecoplannerArpc {
  @Event() saveArpc: EventEmitter<ARPCModel>;

  @Prop() diveDataToShare: any;
  @Prop() planner? = false;
  @State() updateView = true;
  arpc: ARPCModel;
  cellCheckResult: Array<boolean> = [false, false, false];

  async componentWillLoad() {
    const dive =
      this.diveDataToShare.divePlan.dives[this.diveDataToShare.index];
    const localCellDate = await DatabaseService.getLocalDocument(CELLDATE);
    const cellDate = dive.arpc ? dive.arpc.cellDate : localCellDate;
    this.arpc = dive.arpc ? dive.arpc : new ARPCModel();
    if (!localCellDate) this.saveLocalCells();
    cellDate ? (this.arpc.cellDate = cellDate) : undefined;
  }

  approveARPC() {
    this.arpc.checkApproved();
    this.saveArpc.emit(this.arpc);
    this.updateView = !this.updateView;
  }

  inputHandler(event: any) {
    const name = event.detail.name.split(".");
    const value = event.detail.value;
    if (name.length > 1) {
      if (name[0] == "cellDate") {
        this.arpc[name[0]][name[1]] = value;
        this.saveLocalCells();
      } else {
        this.arpc[name[0]][name[1]] = value;
      }
    } else {
      this.arpc[name[0]] = value;
    }
    this.approveARPC();
  }

  saveLocalCells() {
    DatabaseService.saveLocalDocument(CELLDATE, this.arpc.cellDate);
  }

  updateParam(param, ev) {
    this.arpc[param] = ev.detail.checked;
    this.approveARPC();
  }

  cellCheck(cellNumber) {
    this.cellCheckResult[cellNumber] = this.arpc.checkCellDate(cellNumber);
    this.approveARPC();
  }

  async checkO2CellmV(cellNum) {
    let difference =
      this.arpc.airmVRange[cellNum] * 4.76 - this.arpc.o2mVRange[cellNum];
    let showAlert = false,
      message = "";
    if (difference < -2) {
      showAlert = true;
      message = TranslationService.getTransl(
        "cell-mv-high",
        "mV reading high! Please check if the loop is open!"
      );
    } else if (difference > 2) {
      showAlert = true;
      message = TranslationService.getTransl(
        "cell-mv-low",
        "mV reading low! Please check O2 supply (valve open, pressure, pinched hose, not analyzed)!"
      );
    }

    let confirm = await alertController.create({
      header: TranslationService.getTransl("error", "Error"),
      message: message,
      buttons: [
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          handler: () => {},
        },
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: () => {},
        },
      ],
    });
    if (showAlert) confirm.present();
    this.approveARPC();
  }

  render() {
    return (
      <div class="ion-no-padding">
        <ion-item-divider>
          <ion-label>
            <h2>
              <my-transl
                tag="arpc"
                text="ADVANCED REBREATHER PREPARATION CHECKS"
              />
            </h2>
          </ion-label>
        </ion-item-divider>
        <ion-row>
          <ion-col>
            <ion-item-divider>
              <ion-label>
                <my-transl
                  tag="lid-preparation"
                  text="LID AND CONTROLLER PREPARATION"
                />
              </ion-label>
            </ion-item-divider>
            <ion-item>
              <ion-grid no-padding>
                <ion-row>
                  <ion-col>
                    <my-transl tag="o2-cell-1year" text="O2 Cells <1 year" />
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col size="4">
                    <my-transl
                      tag="cell"
                      text="Cell"
                      append-text=" #1"
                    ></my-transl>
                  </ion-col>
                  <ion-col size="4">
                    <my-transl
                      tag="cell"
                      text="Cell"
                      append-text=" #2"
                    ></my-transl>
                  </ion-col>
                  <ion-col size="4">
                    <my-transl
                      tag="cell"
                      text="Cell"
                      append-text=" #3"
                    ></my-transl>
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col size="4">
                    <app-form-item
                      value={this.arpc.cellDate[0]}
                      name="cellDate.0"
                      input-type="date"
                      date-presentation="month-year"
                      onFormItemChanged={(ev) => this.inputHandler(ev)}
                      maxDate={
                        new Date().getFullYear() +
                        "-" +
                        (new Date().getMonth() + 1)
                      }
                    ></app-form-item>
                  </ion-col>
                  <ion-col size="4">
                    <app-form-item
                      value={this.arpc.cellDate[1]}
                      name="cellDate.1"
                      input-type="date"
                      date-presentation="month-year"
                      onFormItemChanged={(ev) => this.inputHandler(ev)}
                      maxDate={
                        new Date().getFullYear() +
                        "-" +
                        (new Date().getMonth() + 1)
                      }
                    ></app-form-item>
                  </ion-col>
                  <ion-col size="4">
                    <app-form-item
                      value={this.arpc.cellDate[2]}
                      name="cellDate.2"
                      input-type="date"
                      date-presentation="month-year"
                      onFormItemChanged={(ev) => this.inputHandler(ev)}
                      maxDate={
                        new Date().getFullYear() +
                        "-" +
                        (new Date().getMonth() + 1)
                      }
                    ></app-form-item>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </ion-item>
            <ion-item>
              <ion-grid no-padding>
                <ion-row>
                  <ion-col>
                    <my-transl
                      tag="air-mv-range"
                      text="Air mV Range"
                    ></my-transl>
                    {" (9-13mV)"}
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col size="4">
                    <app-form-item
                      label-tag="cell"
                      label-text="Cell"
                      appendText=" #1"
                      value={this.arpc.airmVRange[0]}
                      name="airmVRange.0"
                      input-type="number"
                      onFormItemChanged={(ev) => this.inputHandler(ev)}
                      validator={[
                        {
                          name: "minmaxvalue",
                          options: {min: 9, max: 13},
                        },
                      ]}
                    ></app-form-item>
                  </ion-col>
                  <ion-col size="4">
                    <app-form-item
                      label-tag="cell"
                      label-text="Cell"
                      appendText=" #2"
                      value={this.arpc.airmVRange[1]}
                      name="airmVRange.1"
                      input-type="number"
                      onFormItemChanged={(ev) => this.inputHandler(ev)}
                      validator={[
                        {
                          name: "minmaxvalue",
                          options: {min: 9, max: 13},
                        },
                      ]}
                    ></app-form-item>
                  </ion-col>
                  <ion-col size="4">
                    <app-form-item
                      label-tag="cell"
                      label-text="Cell"
                      appendText=" #3"
                      value={this.arpc.airmVRange[2]}
                      name="airmVRange.2"
                      input-type="number"
                      onFormItemChanged={(ev) => this.inputHandler(ev)}
                      validator={[
                        {
                          name: "minmaxvalue",
                          options: {min: 9, max: 13},
                        },
                      ]}
                    ></app-form-item>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </ion-item>
            <ion-item>
              <ion-label>
                <my-transl tag="hud-batt-ok" text="HUD Batt (red 30sec=Low)" />
              </ion-label>
              <ion-toggle
                color={Environment.getAppColor()}
                onIonChange={(ev) => this.updateParam("battHUD", ev)}
                checked={this.arpc.battHUD}
              ></ion-toggle>
            </ion-item>
            <app-form-item
              label-tag="int-batt-ok"
              label-text="INT. Batt (>3.28/1.3V)"
              labelPosition="fixed"
              value={this.arpc.battINT}
              name="battINT"
              input-type="number"
              onFormItemChanged={(ev) => this.inputHandler(ev)}
            ></app-form-item>
            <app-form-item
              label-tag="ext-batt-ok"
              label-text="EXT. Batt (>6.6/8.4V)"
              labelPosition="fixed"
              value={this.arpc.battEXT}
              name="battEXT"
              input-type="number"
              onFormItemChanged={(ev) => this.inputHandler(ev)}
            ></app-form-item>
            <ion-item>
              <ion-label>
                <my-transl
                  tag="ctrl-setpoints-ok"
                  text="Ctrl Setpoints, Settings, Gases"
                />
              </ion-label>
              <ion-toggle
                color={Environment.getAppColor()}
                onIonChange={(ev) => this.updateParam("settingsDone", ev)}
                checked={this.arpc.settingsDone}
              ></ion-toggle>
            </ion-item>
            <ion-item-divider>
              <my-transl
                tag="scrubber-preparation"
                text="SCRUBBER PREPARATION"
              />
            </ion-item-divider>
            <app-form-item
              label-tag="ace-180min"
              label-text="Absorbent Canister Endurance (ACE) (180min nominal)"
              labelPosition="fixed"
              value={this.arpc.scrubberTime}
              name="scrubberTime"
              input-type="number"
              onFormItemChanged={(ev) => this.inputHandler(ev)}
              validator={[
                {
                  name: "minmaxvalue",
                  options: {min: 60, max: 300},
                },
              ]}
            ></app-form-item>
            <ion-item>
              <ion-label>
                <my-transl tag="lid-checks" text="Lid and Lid O-Ring Checks" />
              </ion-label>
              <ion-toggle
                color={Environment.getAppColor()}
                onIonChange={(ev) => this.updateParam("lidCheck", ev)}
                checked={this.arpc.lidCheck}
              ></ion-toggle>
            </ion-item>
            <ion-item>
              <ion-label>
                <my-transl tag="loop-checks" text="Loop Valves Checks" />
              </ion-label>
              <ion-toggle
                color={Environment.getAppColor()}
                onIonChange={(ev) => this.updateParam("loopCheck", ev)}
                checked={this.arpc.loopCheck}
              ></ion-toggle>
            </ion-item>
            <ion-item>
              <ion-label>
                <my-transl
                  tag="negative-pressure-test"
                  text="Negative Pressure Test"
                />
              </ion-label>
              <ion-toggle
                color={Environment.getAppColor()}
                onIonChange={(ev) => this.updateParam("negativePressCheck", ev)}
                checked={this.arpc.negativePressCheck}
              ></ion-toggle>
            </ion-item>
            <ion-item>
              <ion-label>
                <my-transl tag="o2-pressure-test" text="O2 SPG Pressure Test" />
              </ion-label>
              <ion-toggle
                color={Environment.getAppColor()}
                onIonChange={(ev) => this.updateParam("o2LeakTest", ev)}
                checked={this.arpc.o2LeakTest}
              ></ion-toggle>
            </ion-item>
            <ion-item>
              <ion-label>
                <my-transl
                  tag="positive-pressure-test"
                  text="Positive Pressure Test"
                />
              </ion-label>
              <ion-toggle
                color={Environment.getAppColor()}
                onIonChange={(ev) => this.updateParam("positivePressCheck", ev)}
                checked={this.arpc.positivePressCheck}
              ></ion-toggle>
            </ion-item>
            <ion-item>
              <ion-label>
                <my-transl
                  tag="diluent-pressure-test"
                  text="Diluent SPG Pressure Test"
                />
              </ion-label>
              <ion-toggle
                color={Environment.getAppColor()}
                onIonChange={(ev) => this.updateParam("diluentLeakTest", ev)}
                checked={this.arpc.diluentLeakTest}
              ></ion-toggle>
            </ion-item>
            <ion-item-divider class="lightgrey">
              <my-transl tag="calibration" text="CALIBRATION" />
            </ion-item-divider>
            <ion-item>
              <ion-label>
                <my-transl tag="open-o2-valve" text="Open O2 Valve" />
              </ion-label>
              <ion-toggle
                color={Environment.getAppColor()}
                onIonChange={(ev) => this.updateParam("openO2Valve", ev)}
                checked={this.arpc.openO2Valve}
              ></ion-toggle>
            </ion-item>
            <ion-item>
              <ion-label>
                <my-transl tag="loop-in-cc" text="Loop in CC mode" />
              </ion-label>
              <ion-toggle
                color={Environment.getAppColor()}
                onIonChange={(ev) => this.updateParam("loopInCC", ev)}
                checked={this.arpc.loopInCC}
              ></ion-toggle>
            </ion-item>
            <ion-item>
              <ion-label>
                <my-transl tag="hud-on" text="Turn HUD on" />
              </ion-label>
              <ion-toggle
                color={Environment.getAppColor()}
                onIonChange={(ev) => this.updateParam("hudOn", ev)}
                checked={this.arpc.hudOn}
              ></ion-toggle>
            </ion-item>
            <ion-item>
              <ion-label>
                <my-transl
                  tag="calibrate-controller"
                  text="Calibrate Controller"
                />
              </ion-label>
              <ion-toggle
                color={Environment.getAppColor()}
                onIonChange={(ev) => this.updateParam("calController", ev)}
                checked={this.arpc.calController}
              ></ion-toggle>
            </ion-item>
            <ion-item>
              <ion-label>
                <my-transl tag="calibrate-hud" text="Calibrate HUD" />
              </ion-label>
              <ion-toggle
                color={Environment.getAppColor()}
                onIonChange={(ev) => this.updateParam("calHUD", ev)}
                checked={this.arpc.calHUD}
              ></ion-toggle>
            </ion-item>
            <ion-item>
              <ion-grid no-padding>
                <ion-row>
                  <ion-col>
                    <my-transl tag="o2-cal-mv" text="O2 Calibration mV" />
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col size="4">
                    <app-form-item
                      label-tag="cell"
                      label-text="Cell"
                      appendText=" #1"
                      value={this.arpc.o2mVRange[0]}
                      name="o2mVRange.0"
                      input-type="number"
                      onFormItemChanged={(ev) => this.inputHandler(ev)}
                    ></app-form-item>
                  </ion-col>
                  <ion-col size="4">
                    <app-form-item
                      label-tag="cell"
                      label-text="Cell"
                      appendText=" #2"
                      value={this.arpc.o2mVRange[1]}
                      name="o2mVRange.1"
                      input-type="number"
                      onFormItemChanged={(ev) => this.inputHandler(ev)}
                    ></app-form-item>
                  </ion-col>
                  <ion-col size="4">
                    <app-form-item
                      label-tag="cell"
                      label-text="Cell"
                      appendText=" #3"
                      value={this.arpc.o2mVRange[2]}
                      name="o2mVRange.2"
                      input-type="number"
                      onFormItemChanged={(ev) => this.inputHandler(ev)}
                    ></app-form-item>
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col size="4">
                    <ion-note
                      no-lines
                      no-padding
                      no-margin
                      class={
                        "cell-note " +
                        (round(
                          ((this.arpc.o2mVRange[0] -
                            this.arpc.airmVRange[0] * 4.76) /
                            (this.arpc.airmVRange[0] * 4.76)) *
                            100,
                          2
                        ) < -10
                          ? "red-color"
                          : "")
                      }
                    >
                      {round(this.arpc.airmVRange[0] * 4.76, 2)} (
                      {round(
                        ((this.arpc.o2mVRange[0] -
                          this.arpc.airmVRange[0] * 4.76) /
                          (this.arpc.airmVRange[0] * 4.76)) *
                          100,
                        2
                      )}
                      %)
                    </ion-note>
                  </ion-col>
                  <ion-col size="4">
                    <ion-note
                      no-lines
                      no-padding
                      no-margin
                      class={
                        "cell-note " +
                        (round(
                          ((this.arpc.o2mVRange[1] -
                            this.arpc.airmVRange[1] * 4.76) /
                            (this.arpc.airmVRange[1] * 4.76)) *
                            100,
                          2
                        ) < -10
                          ? "red-color"
                          : "")
                      }
                    >
                      {round(this.arpc.airmVRange[1] * 4.76, 2)} (
                      {round(
                        ((this.arpc.o2mVRange[1] -
                          this.arpc.airmVRange[1] * 4.76) /
                          (this.arpc.airmVRange[1] * 4.76)) *
                          100,
                        2
                      )}
                      %)
                    </ion-note>
                  </ion-col>
                  <ion-col size="4">
                    <ion-note
                      no-lines
                      no-padding
                      no-margin
                      class={
                        "cell-note " +
                        (round(
                          ((this.arpc.o2mVRange[2] -
                            this.arpc.airmVRange[2] * 4.76) /
                            (this.arpc.airmVRange[2] * 4.76)) *
                            100,
                          2
                        ) < -10
                          ? "red-color"
                          : "")
                      }
                    >
                      {round(this.arpc.airmVRange[2] * 4.76, 2)} (
                      {round(
                        ((this.arpc.o2mVRange[2] -
                          this.arpc.airmVRange[2] * 4.76) /
                          (this.arpc.airmVRange[2] * 4.76)) *
                          100,
                        2
                      )}
                      %)
                    </ion-note>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </ion-item>
            <ion-item-divider color="white" class="lightgrey">
              <my-transl tag="gas-pressure-status" text="GAS PRESSURE STATUS" />
            </ion-item-divider>
            <app-form-item
              label-tag="o2-ip"
              label-text="O2 IP"
              appendText=" (7-7.5bar)"
              labelPosition="fixed"
              value={this.arpc.o2IP}
              name="o2IP"
              input-type="number"
              onFormItemChanged={(ev) => this.inputHandler(ev)}
              validator={[
                {
                  name: "minmaxvalue",
                  options: {min: 6.5, max: 8},
                },
              ]}
            ></app-form-item>
            <app-form-item
              label-tag="diluent-ip"
              label-text="Diluent IP"
              appendText=" (9-10bar)"
              labelPosition="fixed"
              value={this.arpc.dilIP}
              name="dilIP"
              input-type="number"
              onFormItemChanged={(ev) => this.inputHandler(ev)}
              validator={[
                {
                  name: "minmaxvalue",
                  options: {min: 8.5, max: 10.5},
                },
              ]}
            ></app-form-item>
            <app-form-item
              label-tag="bailout-reserve"
              label-text="Bailout-Reserve"
              labelPosition="fixed"
              value={this.arpc.bailout}
              name="bailout"
              input-type="number"
              onFormItemChanged={(ev) => this.inputHandler(ev)}
            ></app-form-item>
          </ion-col>
        </ion-row>

        <ion-row>
          <ion-col>
            <div text-justify>
              <h4>
                CHAOS (Critical Control Checks conducted during the Pre-Breathe)
              </h4>
              <p>
                During the CHAOS prebreathe, a number of Critical Control Checks
                (CCC) are conducted.
              </p>
              <ul>
                <li>
                  CONTROLLER
                  <ul>
                    <li>Controller operation and display</li>
                    <li>Oxygen sensor operation and pO2 readings</li>
                    <li>Solenoid operation</li>
                    <li>Oxygen supply regulator operation</li>
                  </ul>
                </li>
                <li>
                  HUD
                  <ul>
                    <li>HUD display, operation and calibration accuracy</li>
                  </ul>
                </li>
                <li>
                  ADV
                  <ul>
                    <li>Supply valve status</li>
                    <li>ADV operation</li>
                    <li>OPV operation</li>
                    <li>Oxygen sensor operation and pO2 readings</li>
                    <li>Solenoid operation</li>
                    <li>Oxygen supply regulator operation</li>
                    <li>Diluent supply pressure verification</li>
                  </ul>
                </li>
                <li>
                  OXYGEN
                  <ul>
                    <li>Supply valve status</li>
                    <li>MAV operation</li>
                    <li>Oxygen sensor operation and pO2 readings</li>
                    <li>Oxygen supply pressure verification</li>
                  </ul>
                </li>
                <li>
                  SYSTEM
                  <ul>
                    <li>Controller operation and display</li>
                    <li>Oxygen sensor operation and pO2 readings</li>
                    <li>Solenoid operation</li>
                    <li>Oxygen supply regulator operation</li>
                    <li>Sofnolime warmup</li>
                    <li>Scrubber operation (symptoms unlikely)</li>
                    <li>Loop check valve operation</li>
                  </ul>
                </li>
              </ul>
              <h6>C – Controller</h6>
              <ul>
                <li>pO2 stable ± 0.7</li>
                <li>Setpoint switch ⇨ 1.2</li>
                <li>When pO2 increases, setpoint switch ⇨ 0.7</li>
              </ul>
              <h6>H – HUD</h6>
              <ul>
                <li>Corresponds with CONTROLLER pO2’s</li>
              </ul>
              <h6>A – ADV</h6>
              <ul>
                <li>Flow check right post</li>
                <li>
                  Locate and keep counter lung OPV in open position using right
                  hand
                </li>
                <li>
                  Purge the ADV for five seconds to flush using left hand. Stop
                  purging.
                </li>
                <li>When pO2 back at setpoint, release counter lung OPV</li>
                <li>Verify diluent pressure</li>
              </ul>
              <h6>O – OXYGEN</h6>
              <ul>
                <li>Flow check oxygen cylinder valve</li>
                <li>Check oxygen pressure gauge</li>
                <li>Exhale loop volume through nose</li>
                <li>Add O2 using MAV to compensate for volume exhaled</li>
                <li>Repeat three times</li>
                <li>Note SPG pressure and pressure fluctuations</li>
              </ul>
              <h6>S – SYSTEM STABILITY</h6>
              <ul>
                <li>Prebreathe the unit for 4 minutes</li>
                <li>Observe system functions and operations</li>
                <li>Monitor for CO2 symptom onset (unlikely)</li>
              </ul>
            </div>
          </ion-col>
        </ion-row>
      </div>
    );
  }
}
