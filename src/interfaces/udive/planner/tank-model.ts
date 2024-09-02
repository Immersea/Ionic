import {Gas} from "./gas";
import {Tank} from "./tank";
import {DiveToolsService} from "../../../services/udive/planner/dive-tools";
import {toNumber} from "lodash";

export class TankModel {
  //model fields;
  name: string = "s80";
  volume: number = DiveToolsService.isImperial()
    ? DiveToolsService.ltToCuFt(11.1)
    : 11.1;
  no_of_tanks: number = 1;
  forDeco: boolean = false;
  pressure: number = DiveToolsService.isImperial() ? 3000 : 200;
  units: string = DiveToolsService.units;
  gas: Gas;

  constructor(doc?) {
    if (doc && doc.name) this.name = doc.name;
    if (doc && doc.volume) this.volume = toNumber(doc.volume);
    if (doc && doc.no_of_tanks) this.no_of_tanks = toNumber(doc.no_of_tanks);
    if (doc && doc.forDeco) this.forDeco = doc.forDeco;
    if (doc && doc.pressure) {
      this.pressure = doc.pressure;
    }
    if (doc && doc.gas) this.setGas(doc.gas);
    if (doc && doc.units) this.units = doc.units;
  }

  setGas(gas: Gas) {
    this.gas = gas;
  }

  setForDeco(forDeco: boolean) {
    this.forDeco = forDeco;
  }

  getTank() {
    return new Tank(
      this.name,
      this.volume,
      this.no_of_tanks,
      this.gas,
      this.pressure,
      this.units
    );
  }
}
