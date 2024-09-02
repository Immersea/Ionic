import {Gas} from "./gas";
import {DiveToolsService} from "../../../services/udive/planner/dive-tools";
import {toNumber} from "lodash";

export class GasModel {
  //database fields
  _id: string;
  _rev: string;
  type: string = "std_gas";
  created_at: Date;
  updated_at: Date;

  //model fields;
  deco = false;
  O2: number = 32;
  He: number = 0;
  fromDepth: number = 30;
  ppO2: number = 1.4;
  units: string = "Metric";
  useAsDiluent: boolean = false;

  constructor(doc?) {
    if (doc && doc._id) this._id = doc._id;
    if (doc && doc._rev) this._rev = doc._rev;
    this.type = "std_gas";
    if (doc && doc.created_at) this.created_at = new Date(doc.created_at);
    if (doc && doc.updated_at) this.updated_at = new Date(doc.updated_at);
    //this.permissions = new Permissions(doc && doc.permissions ? doc.permissions:null , null, true) //set public permissions

    if (doc && doc.deco) this.deco = doc.deco;
    if (doc && doc.O2) this.O2 = toNumber(doc.O2);
    if (doc && doc.He) this.He = toNumber(doc.He);
    if (doc && doc.fromDepth) {
      this.fromDepth = toNumber(doc.fromDepth);
    } else {
      this.fromDepth = DiveToolsService.isMetric() ? 30 : 100;
    }
    if (doc && doc.useAsDiluent) this.useAsDiluent = doc.useAsDiluent;
    if (doc && doc.ppO2) this.ppO2 = toNumber(doc.ppO2);
    if (doc && doc.units) {
      this.units = doc.units;
    } else {
      this.units = DiveToolsService.units;
    }
  }

  getGas() {
    return new Gas(
      this.O2 / 100,
      this.He / 100,
      this.fromDepth,
      this.ppO2,
      this.units
    );
  }
}
