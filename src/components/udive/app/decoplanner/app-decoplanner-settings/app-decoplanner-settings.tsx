import { Component, h, Prop, State, Event, EventEmitter } from "@stencil/core";
import { DecoplannerDive } from "../../../../../interfaces/udive/planner/decoplanner-dive";
import { DivePlan } from "../../../../../services/udive/planner/dive-plan";
import { DecoplannerParameters } from "../../../../../interfaces/udive/planner/decoplanner-parameters";
import { Environment } from "../../../../../global/env";
import { toNumber } from "lodash";
import { TranslationService } from "../../../../../services/common/translations";

@Component({
  tag: "app-decoplanner-settings",
  styleUrl: "app-decoplanner-settings.scss",
})
export class AppDecoplannerSettings {
  @Event() updateParamsEvent: EventEmitter<DecoplannerParameters>;
  @Prop({ mutable: true }) diveDataToShare: any;
  @State() dive: DecoplannerDive = new DecoplannerDive();
  @State() updateView = true;

  dives: Array<DecoplannerDive>;
  index: number;
  divePlan: DivePlan;
  parameters: DecoplannerParameters = new DecoplannerParameters();
  @State() ranges: any;
  stdConfigurations: any;
  showConfigurations = false;

  componentWillLoad() {
    this.updateViewParams();
  }

  updateViewParams() {
    let params = this.diveDataToShare;
    this.showConfigurations = params.showConfigurations;
    this.divePlan = params.divePlan;
    this.index = params.index;
    this.dives = this.divePlan.dives;
    this.dive = this.divePlan.dives[this.index];
    this.stdConfigurations = params.stdConfigurations;
    this.parameters = this.divePlan.configuration.parameters;
    this.ranges = this.divePlan.getParamRanges(this.parameters.units);
    this.updateView = !this.updateView;
  }

  updateParam(param, ev) {
    let value = ev.detail ? ev.detail.value : ev.target.value;
    switch (param) {
      case "units":
        this.parameters.setUnits(value);
        this.ranges = this.divePlan.getParamRanges(value);
        break;
      case "config":
        this.parameters.configuration = value;
        break;
      case "laststop":
        this.parameters.lastStop6m20ft = ev.detail.checked;
        break;
      case "conservatism":
        this.parameters.conservatism = value;
        break;
      case "conservatism_bailout":
        this.parameters.conservatism_bailout = value;
        break;
      case "gfLow":
        this.parameters.gfLow = toNumber(value);
        break;
      case "gfHigh":
        this.parameters.gfHigh = toNumber(value);
        break;
      case "gfLow_bailout":
        this.parameters.gfLow_bailout = toNumber(value);
        break;
      case "gfHigh_bailout":
        this.parameters.gfHigh_bailout = toNumber(value);
        break;
      case "descentppO2":
        this.parameters.descentppO2 = toNumber(value);
        break;
      case "bottomppO2":
        this.parameters.bottomppO2 = toNumber(value);
        break;
      case "decoppO2":
        this.parameters.decoppO2 = toNumber(value);
        break;
      case "oxygenppO2":
        this.parameters.oxygenppO2 = toNumber(value);
        break;
      case "pscrGasDivider":
        this.parameters.pscrGasDivider = toNumber(value);
        break;
      case "ace_time":
        this.parameters.ace_time = toNumber(value);
        break;
      case "CCR_o2_consumption":
        this.parameters.CCR_o2_consumption = toNumber(value);
        break;
      case "metabolic_o2_consumption":
        this.parameters.metabolic_o2_consumption = toNumber(value);
        break;
      case "CCR_volume_for_consumption":
        this.parameters.CCR_volume_for_consumption = toNumber(value);
        break;
      case "rmvBottom":
        this.parameters.rmvBottom = toNumber(value);
        break;
      case "rmvDeco":
        this.parameters.rmvDeco = toNumber(value);
        break;
      case "deco_gas_reserve":
        this.parameters.deco_gas_reserve = toNumber(value);
        break;
      case "time_at_bottom_for_min_gas":
        this.parameters.time_at_bottom_for_min_gas = toNumber(value);
        break;
      case "time_at_gas_switch_for_min_gas":
        this.parameters.time_at_gas_switch_for_min_gas = toNumber(value);
        break;
      case "rmvBottom_multiplier_for_min_gas":
        this.parameters.rmvBottom_multiplier_for_min_gas = toNumber(value);
        break;
      case "number_of_divers_for_min_gas":
        this.parameters.number_of_divers_for_min_gas = toNumber(value);
        break;
      case "descentRate":
        this.parameters.descentRate = toNumber(value);
        break;
      case "ascentRate":
        this.parameters.ascentRate = toNumber(value);
        break;
      case "minPPO2":
        this.parameters.minPPO2 = toNumber(value);
        break;
      case "maxPPO2deco":
        this.parameters.maxPPO2deco = toNumber(value);
        break;
      case "maxPPO2bottom":
        this.parameters.maxPPO2bottom = toNumber(value);
        break;
    }
    //this.updateParams();
    this.updateParamsEvent.emit(this.parameters);
  }

  render() {
    return (
      <div class='slider-container'>
        <ion-list class='slider-scrollable-container'>
          <ion-item-divider>
            <ion-label>
              <my-transl tag='general-settings' text='General Settings' />
            </ion-label>
          </ion-item-divider>
          {!this.divePlan.configuration || this.showConfigurations ? (
            <ion-item>
              <ion-select
                label={TranslationService.getTransl(
                  "configuration",
                  "Configuration"
                )}
                labelPlacement='floating'
                onIonChange={(ev) => this.updateParam("config", ev)}
                value={this.parameters.configuration}
              >
                <ion-select-option value='OC'>OC</ion-select-option>
                <ion-select-option value='pSCR'>pSCR</ion-select-option>
                <ion-select-option value='CCR'>CCR</ion-select-option>
              </ion-select>
            </ion-item>
          ) : undefined}
          {/**
           <ion-item>
            <ion-label>
              <my-transl tag='unit' text='Unit' />
            </ion-label>
            <ion-select
              onIonChange={(ev) => this.updateParam("units", ev)}
              value={this.parameters.units}
            >
              <ion-select-option value='Metric'>Metric</ion-select-option>
              <ion-select-option value='Imperial'>Imperial</ion-select-option>
            </ion-select>
          </ion-item>
           */}
          <ion-item>
            <ion-toggle
              color={Environment.isDecoplanner() ? "gue-blue" : "planner"}
              onIonChange={(ev) => this.updateParam("laststop", ev)}
              checked={this.parameters.lastStop6m20ft}
            >
              <my-transl tag='last-stop' text='Last stop' />{" "}
              {this.parameters.metric ? 6 : 20}
              {this.parameters.depthUnit}
            </ion-toggle>
          </ion-item>
          <ion-item-divider>
            <ion-label>VPM-B</ion-label>
          </ion-item-divider>
          {/*
        <ion-item>
          <ion-label>Critical Volume Algorithm (on/off)</ion-label>
          <ion-toggle [(ngModel)]="parameters.critical_volume_algorithm" (ionChange)="updateParams()"></ion-toggle>
        </ion-item>
        <ion-item>
          <ion-label>GFS (TEST)</ion-label>
          <ion-toggle [(ngModel)]="parameters.VPM_GFS" (ionChange)="updateParams()"></ion-toggle>
        </ion-item>
        <ion-item>
          <ion-label>VPM/GFS Gradient Factor High</ion-label>
          <ion-select [(ngModel)]="parameters.VPM_gf_high" (ionChange)="updateParams()">
            <ion-select-option *ngFor="let gf of ranges.gf">{{gf}}</ion-select-option>
          </ion-select>
        </ion-item>
        */}
          {this.parameters.configuration != "OC" ? (
            <ion-item-divider>
              <ion-label>
                {this.parameters.configuration}{" "}
                <my-transl tag='settings' text='settings' />
              </ion-label>
            </ion-item-divider>
          ) : undefined}

          <ion-item>
            <ion-select
              label={TranslationService.getTransl(
                "conservatism",
                "Conservatism"
              )}
              labelPlacement='floating'
              onIonChange={(ev) => this.updateParam("conservatism", ev)}
              value={this.parameters.conservatism}
            >
              {this.ranges.conservatism.map((conservatism) => (
                <ion-select-option value={conservatism}>
                  {conservatism}
                </ion-select-option>
              ))}
            </ion-select>
          </ion-item>
          {this.parameters.configuration != "OC" ? (
            <ion-item-divider>
              <ion-label>
                <my-transl tag='bailout-settings' text='Bailout settings' />
              </ion-label>
            </ion-item-divider>
          ) : undefined}
          {this.parameters.configuration != "OC" ? (
            <ion-item>
              <ion-select
                label={TranslationService.getTransl(
                  "conservatism",
                  "Conservatism"
                )}
                labelPlacement='floating'
                onIonChange={(ev) =>
                  this.updateParam("conservatism_bailout", ev)
                }
                value={this.parameters.conservatism_bailout}
              >
                {this.ranges.conservatism.map((conservatism) => (
                  <ion-select-option value={conservatism}>
                    {conservatism}
                  </ion-select-option>
                ))}
              </ion-select>
            </ion-item>
          ) : undefined}

          <ion-item-divider>
            <ion-label>BUHLMANN</ion-label>
          </ion-item-divider>
          {/*
        <ion-item *ngIf="renderedChart=='heatmap-chart'">
          <ion-label>Model</ion-label>
          <ion-select [(ngModel)]="parameters.buhlModel" (ionChange)="updateParams()">
            <ion-select-option>ZHL16B</ion-select-option>
            <ion-select-option>ZHL16C</ion-select-option>
          </ion-select>
        </ion-item>*/}
          {this.parameters.configuration != "OC" ? (
            <ion-item-divider>
              <ion-label>
                {this.parameters.configuration}{" "}
                <my-transl tag='settings' text='settings' />
              </ion-label>
            </ion-item-divider>
          ) : undefined}

          <ion-item>
            <ion-select
              label={TranslationService.getTransl(
                "gradient-factor-low",
                "Gradient Factor Low"
              )}
              labelPlacement='floating'
              onIonChange={(ev) => this.updateParam("gfLow", ev)}
              value={this.parameters.gfLow}
            >
              {this.ranges.gf.map((gf) => (
                <ion-select-option value={gf}>{gf}</ion-select-option>
              ))}
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select
              label={TranslationService.getTransl(
                "gradient-factor-high",
                "Gradient Factor High"
              )}
              labelPlacement='floating'
              onIonChange={(ev) => this.updateParam("gfHigh", ev)}
              value={this.parameters.gfHigh}
            >
              {this.ranges.gf.map((gf) => (
                <ion-select-option value={gf}>{gf}</ion-select-option>
              ))}
            </ion-select>
          </ion-item>
          {this.parameters.configuration != "OC"
            ? [
                <ion-item-divider>
                  <ion-label>
                    <my-transl tag='bailout-settings' text='Bailout settings' />
                  </ion-label>
                </ion-item-divider>,
                <ion-item>
                  <ion-select
                    label={TranslationService.getTransl(
                      "gradient-factor-low",
                      "Gradient Factor Low"
                    )}
                    labelPlacement='floating'
                    onIonChange={(ev) => this.updateParam("gfLow_bailout", ev)}
                    value={this.parameters.gfLow_bailout}
                  >
                    {this.ranges.gf.map((gf) => (
                      <ion-select-option value={gf}>{gf}</ion-select-option>
                    ))}
                  </ion-select>
                </ion-item>,
                <ion-item>
                  <ion-select
                    label={TranslationService.getTransl(
                      "gradient-factor-high",
                      "Gradient Factor High"
                    )}
                    labelPlacement='floating'
                    onIonChange={(ev) => this.updateParam("gfHigh_bailout", ev)}
                    value={this.parameters.gfHigh_bailout}
                  >
                    {this.ranges.gf.map((gf) => (
                      <ion-select-option value={gf}>{gf}</ion-select-option>
                    ))}
                  </ion-select>
                </ion-item>,
              ]
            : undefined}
          {/*
    <ion-item-divider>
      (TEST) He vs N2 half times
    </ion-item-divider>
    <ion-item>
      <ion-label>He half time multiplier (0->original model / +10->He=N2 / -10->N2=He)</ion-label>
    </ion-item>
    <ion-item>
      <ion-label>Parameter</ion-label>
      <ion-select [(ngModel)]="parameters.helium_half_time_multiplier" (ionChange)="updateParams()">
        <ion-select-option *ngFor="let hhf of ranges.hhf">{{hhf}}</ion-select-option>
      </ion-select>
    </ion-item>
     */}
          {this.parameters.configuration == "CCR"
            ? [
                <ion-item-divider>
                  <ion-label>
                    <my-transl
                      tag='ppO2-settings'
                      text='ppO2 Standard Settings'
                    />
                  </ion-label>
                </ion-item-divider>,
                <ion-item-divider>
                  <ion-label>
                    <my-transl
                      tag='ppO2-settings-note'
                      text='note: CCR settings from deco gases prevail over these settings'
                    />
                  </ion-label>
                </ion-item-divider>,
                <ion-item>
                  <ion-select
                    label={TranslationService.getTransl(
                      "descent-ppO2-CCR",
                      "Descent ppO2 (CCR)"
                    )}
                    labelPlacement='floating'
                    onIonChange={(ev) => this.updateParam("descentppO2", ev)}
                    value={this.parameters.descentppO2}
                  >
                    {this.ranges.ppO2.map((ppO2) => (
                      <ion-select-option value={ppO2}>{ppO2}</ion-select-option>
                    ))}
                  </ion-select>
                </ion-item>,
                <ion-item>
                  <ion-select
                    label={TranslationService.getTransl(
                      "bottom-ppO2-CCR",
                      "Bottom ppO2 (CCR)"
                    )}
                    labelPlacement='floating'
                    onIonChange={(ev) => this.updateParam("bottomppO2", ev)}
                    value={this.parameters.bottomppO2}
                  >
                    {this.ranges.ppO2.map((ppO2) => (
                      <ion-select-option value={ppO2}>{ppO2}</ion-select-option>
                    ))}
                  </ion-select>
                </ion-item>,
                <ion-item>
                  <ion-select
                    label={TranslationService.getTransl(
                      "deco-ppO2-CCR",
                      "Deco stops ppO2 (CCR)"
                    )}
                    labelPlacement='floating'
                    onIonChange={(ev) => this.updateParam("decoppO2", ev)}
                    value={this.parameters.decoppO2}
                  >
                    {this.ranges.ppO2.map((ppO2) => (
                      <ion-select-option value={ppO2}>{ppO2}</ion-select-option>
                    ))}
                  </ion-select>
                </ion-item>,
                <ion-item>
                  <ion-select
                    label={TranslationService.getTransl(
                      "oxygen-ppO2-CCR",
                      "Oxygen stops ppO2 (CCR)"
                    )}
                    labelPlacement='floating'
                    onIonChange={(ev) => this.updateParam("oxygenppO2", ev)}
                    value={this.parameters.oxygenppO2}
                  >
                    {this.ranges.ppO2.map((ppO2) => (
                      <ion-select-option value={ppO2}>{ppO2}</ion-select-option>
                    ))}
                  </ion-select>
                </ion-item>,
              ]
            : undefined}

          <ion-item-divider>
            <ion-label>
              <my-transl tag='gas' text='Gas' />
            </ion-label>
          </ion-item-divider>
          {this.parameters.configuration == "pSCR" ? (
            <ion-item>
              <ion-select
                label={TranslationService.getTransl(
                  "pSCR-gas-divider",
                  "pSCR Gas Divider"
                )}
                labelPlacement='floating'
                onIonChange={(ev) => this.updateParam("pscrGasDivider", ev)}
                value={this.parameters.pscrGasDivider}
              >
                {this.ranges.pscrGasDivider.map((pscrGasDivider) => (
                  <ion-select-option value={pscrGasDivider}>
                    {pscrGasDivider}
                  </ion-select-option>
                ))}
              </ion-select>
            </ion-item>
          ) : undefined}
          {this.parameters.configuration != "OC" ? (
            <ion-item>
              <ion-input
                label={TranslationService.getTransl(
                  "ace",
                  "ACE (Absorbent Canister Endurance)"
                )}
                labelPlacement='floating'
                type='number'
                value={this.parameters.ace_time}
                class='ion-text-end'
                onIonChange={(ev) => this.updateParam("ace_time", ev)}
              ></ion-input>
            </ion-item>
          ) : undefined}
          {this.parameters.configuration == "CCR" ? (
            <ion-item>
              <ion-select
                label={
                  TranslationService.getTransl(
                    "o2-consumption-ccr",
                    "O2 consumption for CCR"
                  ) +
                  " (" +
                  this.parameters.volumeUnit +
                  "/min)"
                }
                labelPlacement='floating'
                onIonChange={(ev) => this.updateParam("CCR_o2_consumption", ev)}
                value={this.parameters.CCR_o2_consumption}
              >
                {this.ranges.CCR_o2_consumption.map((CCR_o2_consumption) => (
                  <ion-select-option value={CCR_o2_consumption}>
                    {CCR_o2_consumption}
                  </ion-select-option>
                ))}
              </ion-select>
            </ion-item>
          ) : undefined}
          {this.parameters.configuration == "pSCR" ? (
            <ion-item>
              <ion-select
                label={TranslationService.getTransl(
                  "metabolic-o2-consumption",
                  "Metabolic O2 consumption"
                )}
                labelPlacement='floating'
                onIonChange={(ev) =>
                  this.updateParam("metabolic_o2_consumption", ev)
                }
                value={this.parameters.metabolic_o2_consumption}
              >
                {this.ranges.CCR_o2_consumption.map((CCR_o2_consumption) => (
                  <ion-select-option value={CCR_o2_consumption}>
                    {CCR_o2_consumption}
                  </ion-select-option>
                ))}
              </ion-select>
            </ion-item>
          ) : undefined}
          {this.parameters.configuration == "CCR" ? (
            <ion-item>
              <ion-select
                label={
                  TranslationService.getTransl(
                    "volume-CCR-diluent-consumption",
                    "Volume of CCR for diluent consumption"
                  ) +
                  " (" +
                  this.parameters.volumeUnit +
                  ")"
                }
                labelPlacement='floating'
                onIonChange={(ev) =>
                  this.updateParam("CCR_volume_for_consumption", ev)
                }
                value={this.parameters.CCR_volume_for_consumption}
              >
                {this.ranges.CCR_volume_for_consumption.map(
                  (CCR_volume_for_consumption) => (
                    <ion-select-option value={CCR_volume_for_consumption}>
                      {CCR_volume_for_consumption}
                    </ion-select-option>
                  )
                )}
              </ion-select>
            </ion-item>
          ) : undefined}
          {/**
     <!--
    <ion-item *ngIf="parameters.configuration=='CCR'">
      <ion-label>CCR diluent in separate tank</ion-label>
      <ion-toggle [(ngModel)]="parameters.CCR_separate_dil_tank" (ionChange)="updateParams()"></ion-toggle>
    </ion-item>-->
     */}

          <ion-item>
            <ion-select
              label={
                TranslationService.getTransl("SCR-bottom", "SCR Bottom") +
                " (" +
                this.parameters.volumeUnit +
                "/min)"
              }
              labelPlacement='floating'
              onIonChange={(ev) => this.updateParam("rmvBottom", ev)}
              value={this.parameters.rmvBottom}
            >
              {this.ranges.rmv.map((rmv) => (
                <ion-select-option value={rmv}>{rmv}</ion-select-option>
              ))}
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select
              label={
                TranslationService.getTransl("SCR-deco", "SCR Deco") +
                " (" +
                this.parameters.volumeUnit +
                "/min)"
              }
              labelPlacement='floating'
              onIonChange={(ev) => this.updateParam("rmvDeco", ev)}
              value={this.parameters.rmvDeco}
            >
              {this.ranges.rmv.map((rmv) => (
                <ion-select-option value={rmv}>{rmv}</ion-select-option>
              ))}
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select
              label={
                TranslationService.getTransl(
                  "deco-gas-reserve",
                  "Deco Gas Reserve"
                ) + " (%)"
              }
              labelPlacement='floating'
              onIonChange={(ev) => this.updateParam("deco_gas_reserve", ev)}
              value={this.parameters.deco_gas_reserve}
            >
              {this.ranges.deco_gas_reserve.map((deco_gas_reserve) => (
                <ion-select-option value={deco_gas_reserve}>
                  {deco_gas_reserve}
                </ion-select-option>
              ))}
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select
              label={
                TranslationService.getTransl(
                  "time-bottom-mingas",
                  "Time at bottom for Min. Gas"
                ) + " (min)"
              }
              labelPlacement='floating'
              onIonChange={(ev) =>
                this.updateParam(
                  "decotime_at_bottom_for_min_gas_gas_reserve",
                  ev
                )
              }
              value={this.parameters.time_at_bottom_for_min_gas}
            >
              {this.ranges.time_at_bottom_for_min_gas.map(
                (time_at_bottom_for_min_gas) => (
                  <ion-select-option value={time_at_bottom_for_min_gas}>
                    {time_at_bottom_for_min_gas}
                  </ion-select-option>
                )
              )}
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select
              label={
                TranslationService.getTransl(
                  "time-gasswitch-mingas",
                  "Time at gas switch for Min. Gas"
                ) + " (min)"
              }
              labelPlacement='floating'
              onIonChange={(ev) =>
                this.updateParam("time_at_gas_switch_for_min_gas", ev)
              }
              value={this.parameters.time_at_gas_switch_for_min_gas}
            >
              {this.ranges.time_at_bottom_for_min_gas.map(
                (time_at_gas_switch_for_min_gas) => (
                  <ion-select-option value={time_at_gas_switch_for_min_gas}>
                    {time_at_gas_switch_for_min_gas}
                  </ion-select-option>
                )
              )}
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select
              label={
                TranslationService.getTransl(
                  "stress-factor-mingas",
                  "Stress factor for Min. Gas"
                ) + " (x)"
              }
              labelPlacement='floating'
              onIonChange={(ev) =>
                this.updateParam("rmvBottom_multiplier_for_min_gas", ev)
              }
              value={this.parameters.rmvBottom_multiplier_for_min_gas}
            >
              {this.ranges.rmvBottom_multiplier_for_min_gas.map(
                (rmvBottom_multiplier_for_min_gas) => (
                  <ion-select-option value={rmvBottom_multiplier_for_min_gas}>
                    {rmvBottom_multiplier_for_min_gas}
                  </ion-select-option>
                )
              )}
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select
              label={
                TranslationService.getTransl(
                  "number-divers-mingas",
                  "Number of divers for Min. Gas"
                ) + " (#)"
              }
              labelPlacement='floating'
              onIonChange={(ev) =>
                this.updateParam("number_of_divers_for_min_gas", ev)
              }
              value={this.parameters.number_of_divers_for_min_gas}
            >
              {this.ranges.number_of_divers_for_min_gas.map(
                (number_of_divers_for_min_gas) => (
                  <ion-select-option value={number_of_divers_for_min_gas}>
                    {number_of_divers_for_min_gas}
                  </ion-select-option>
                )
              )}
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select
              label={
                TranslationService.getTransl("descent-rate", "Descent Rate") +
                " (" +
                this.parameters.depthUnit +
                "/min)"
              }
              labelPlacement='floating'
              onIonChange={(ev) => this.updateParam("descentRate", ev)}
              value={this.parameters.descentRate}
            >
              {this.ranges.descentRate.map((descentRate) => (
                <ion-select-option value={descentRate}>
                  {descentRate}
                </ion-select-option>
              ))}
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select
              label={
                TranslationService.getTransl("ascent-rate", "Ascent Rate") +
                " (" +
                this.parameters.depthUnit +
                "/min)"
              }
              labelPlacement='floating'
              onIonChange={(ev) => this.updateParam("ascentRate", ev)}
              value={this.parameters.ascentRate}
            >
              {this.ranges.ascentRate.map((ascentRate) => (
                <ion-select-option value={ascentRate}>
                  {ascentRate}
                </ion-select-option>
              ))}
            </ion-select>
          </ion-item>
          {/**
     <ion-item>
      <ion-label>Min ppO2</ion-label>
      <ion-select onIonChange={(ev)=>this.updateParam("minPPO2",ev)}>
    {this.ranges.minPPO2.map(minPPO2 => (
      <ion-select-option selected={this.parameters.minPPO2 == toNumber(minPPO2)}>{minPPO2}</ion-select-option>
    ))}
    </ion-select>
    </ion-item> 
    <ion-item>
      <ion-label>Max ppO2 deco</ion-label>
      <ion-select onIonChange={(ev)=>this.updateParam("maxPPO2deco",ev)}>
    {this.ranges.ppO2.map(ppO2 => (
      <ion-select-option selected={this.parameters.maxPPO2deco == toNumber(ppO2)}>{ppO2}</ion-select-option>
    ))}
    </ion-select>
    </ion-item> 
    <ion-item>
      <ion-label>Max ppO2 bottom</ion-label>
      <ion-select onIonChange={(ev)=>this.updateParam("maxPPO2bottom",ev)}>
    {this.ranges.ppO2.map(ppO2 => (
      <ion-select-option selected={this.parameters.maxPPO2bottom == toNumber(ppO2)}>{ppO2}</ion-select-option>
    ))}
    </ion-select>
    </ion-item>
     */}
        </ion-list>
      </div>
    );
  }
}
