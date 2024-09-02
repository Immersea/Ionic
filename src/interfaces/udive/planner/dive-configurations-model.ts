//import { Permissions } from '../permissions'
import {DiveConfiguration} from "./dive-configuration";

export class DiveConfigurationsModel {
  //database fields
  _id: string;
  _rev: string;
  type: string;
  created_at: Date = new Date();
  updated_at: Date = new Date();
  //permissions: Permissions;

  //model fields;
  configurations: Array<DiveConfiguration> = [];

  constructor(doc?) {
    if (doc && doc._id) this._id = doc._id;
    if (doc && doc._rev) this._rev = doc._rev;
    this.type = "dive_configurations";
    if (doc && doc.created_at) this.created_at = new Date(doc.created_at);
    if (doc && doc.updated_at) this.updated_at = new Date(doc.updated_at);
    //this.permissions = new Permissions(doc && doc.permissions ? doc.permissions:null , null, false) //set public permissions

    if (doc && doc.configurations) {
      this.configurations = doc.configurations.map((conf) => {
        return new DiveConfiguration(conf);
      });
    }
  }
}
