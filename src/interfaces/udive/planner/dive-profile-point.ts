/*
 *
 * Models a single profile point of a dive
 *
 */
import { round, toNumber } from "lodash";
import { Gas } from "./gas";
//import { FormBuilder, Validators } from '@angular/forms';
//import { CustomValidators } from '../../components/validators/form-validators'

/*interface ValidationResult {
 [key:string]:boolean;
}*/

export class DiveProfilePoint {
  index: number;
  depth: number;
  gas: Gas;
  setpoint: number;
  time: number;

  constructor(index = 0, depth = 0, time = 0, gas = new Gas(), setpoint = 1.2) {
    this.index = toNumber(index);
    this.depth = toNumber(depth);
    this.gas = gas;
    this.setpoint = toNumber(setpoint);
    this.time = toNumber(time);
  }

  setGas(fO2, fHe) {
    if (fO2 + fHe > 1) {
      fHe = 1 - fO2;
    }
    this.gas = new Gas(fO2, fHe, this.depth, this.setpoint);
  }

  setValue(key, value) {
    if (key == "o2") {
      this.gas.setFO2(round(toNumber(value), 2) / 100);
    } else if (key == "he") {
      this.gas.setFHe(round(toNumber(value), 2) / 100);
    } else if (key != "gas") {
      this[key] = toNumber(value);
    }
  }

  getForm() {
    let form = {
      depth: this.depth,
      time: this.time,
      o2: this.gas.getO2(),
      he: this.gas.getHe(),
      setpoint: this.setpoint,
      index: this.index,
    };
    return form;
  }

  getPresetValues() {
    let value = {
      depth: {
        order: 0,
        value: 0,
        label: "Depth",
        type: "input",
        format: "number", //text, password, email, number, search, tel, and url
      },
      time: {
        order: 1,
        value: 0,
        label: "Time",
        type: "input",
        format: "number",
      },
      O2: {
        order: 2,
        value: 0,
        label: "O2",
        type: "input",
        format: "number",
      },
      He: {
        order: 3,
        value: 0,
        label: "He",
        type: "input",
        format: "number",
      },
      setpoint: {
        order: 4,
        value: 1.2,
        label: "pO2 Set Point",
        type: "input",
        format: "number",
      },
      index: {
        type: "hidden",
      },
    };
    return value;
  }
}
