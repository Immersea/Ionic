/*
 *
 * Models dive parameters
 *
 */

import { isNumber, toNumber } from "lodash";

export class DecoplannerParameters {
  CCR_o2_consumption: number = 2;
  CCR_separate_dil_tank: boolean = false;
  CCR_volume_for_consumption: number = 10;
  IcdWarning: boolean = false;
  MAX_DECOMIX: number = 4;
  MAX_DIVEPONTS: number = 8;
  MAX_DIVES: number = 5;
  altitude_dive_algorithm: string = "off";
  altitude_of_dive: number = 0;
  ascentRate: number = 9;
  ascent_to_altitude_hours: number = 12;
  buhlModel: string = "ZHL16B";
  configuration: string = "OC";
  conservatism: number = 3;
  conservatism_bailout: number = 1;
  critical_volume_algorithm: boolean = true;
  decoStepSize: number = 3;
  deco_gas_reserve: number = 30;
  descentppO2: number = 0.7;
  decoppO2: number = 1.2;
  bottomppO2: number = 1.2;
  oxygenppO2: number = 1.5;
  depthUnit: string = "m";
  descentRate: number = 20;
  gasRule: string = "1/1";
  gfHigh: number = 85;
  gfHigh_bailout: number = 90;
  gfLow: number = 20;
  gfLow_bailout: number = 30;
  hours_at_altitude_before_dive: number = 12;
  lastStop6m20ft: boolean = false;
  maxPPO2bottom: number = 1.4;
  maxPPO2deco: number = 1.6;
  metabolic_o2_consumption: number = 0.8;
  metric: boolean = true;
  minPPO2: number = 0.16;
  number_of_divers_for_min_gas: number = 2;
  pressureUnit: string = "bar";
  pscrGasDivider: number = 6;
  rmvBottom: number = 20;
  rmvBottom_multiplier_for_min_gas: number = 1.5;
  rmvDeco: number = 15;
  selectedModel: string = "BUHL";
  solubilityHe: number = 0.015;
  solubilityN2: number = 0.067;
  time_at_bottom_for_min_gas: number = 2;
  time_at_gas_switch_for_min_gas: number = 2;
  units: string = "Metric";
  volumeUnit: string = "ltr";
  helium_half_time_multiplier: number = 0;
  VPM_gf_high: number = 90;
  VPM_GFS: boolean = false;
  ace_time = 250;

  constructor(params?) {
    if (params) {
      this.setUnits(params.unit ? params.unit : "Metric");
      for (let key in params) {
        //check if number and convert
        if (isNumber(this[key])) {
          this[key] = toNumber(params[key]);
        } else {
          this[key] = params[key];
        }
      }
    } else {
      //TODO set units according to user settings
      this.setUnits("Metric");
    }
  }

  setUnits(units) {
    this.units = units;
    if (units == "Imperial") {
      this.metric = false;
      this.depthUnit = "ft";
      this.volumeUnit = "cuft";
      this.pressureUnit = "psi";
      this.descentRate = 60;
      this.ascentRate = 30;
      this.rmvBottom = 0.7;
      this.rmvDeco = 0.5;
      this.decoStepSize = 10;
      this.metabolic_o2_consumption = 0.028; //cuft/min
      this.CCR_o2_consumption = 0.07; //cuft/min
      this.CCR_volume_for_consumption = 0.36; //volume of CCR lungs and bgv
    } else {
      this.metric = true;
      this.depthUnit = "mt";
      this.volumeUnit = "ltr";
      this.pressureUnit = "bar";
      this.descentRate = 20;
      this.ascentRate = 9;
      this.rmvBottom = 20;
      this.rmvDeco = 15;
      this.decoStepSize = 3;
      this.metabolic_o2_consumption = 0.8; //lt/min
      this.CCR_o2_consumption = 2; //lt/min
      this.CCR_volume_for_consumption = 10; //volume of CCR lungs and bgv
    }
  }
}
