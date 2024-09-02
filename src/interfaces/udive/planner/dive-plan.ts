import { DecoplannerDive } from "./decoplanner-dive";
//import { Permissions } from '../permissions'
import { DiveConfiguration } from "./dive-configuration";

export class DivePlanModel {
  //Model fields
  dives: Array<DecoplannerDive> = [];
  title: string;
  configuration: DiveConfiguration;
  users: {
    [id: string]: string[]; //["owner", "editor", etc.]
  };

  constructor(doc: any) {
    if (doc.configuration) {
      this.setConfiguration(doc.configuration);
    }
    if (doc.dives && doc.dives.length > 0) {
      doc.dives.forEach((dive) => {
        this.addDive(dive);
      });
    }

    if (doc.title) {
      this.title = doc.title;
    }

    this.users = {};
    if (doc.users) {
      this.users = doc.users;
    }
  }

  addDive(dive?) {
    //set unit for each dive
    const decoplannerDive = new DecoplannerDive(dive);
    decoplannerDive.setUnits(this.configuration.parameters.units);
    this.dives.push(decoplannerDive);
  }

  updateDive(index, dive) {
    //set unit for the dive
    const decoplannerDive = new DecoplannerDive(dive);
    decoplannerDive.setUnits(this.configuration.parameters.units);
    this.dives[index] = decoplannerDive;
  }

  setConfiguration(conf) {
    this.configuration = new DiveConfiguration(conf);
  }

  convertUnits(units) {
    this.configuration.parameters.setUnits(units);
    this.configuration.convertUnits(this.configuration.parameters);
    this.dives = this.dives.map((dive) => {
      dive.convertUnits(units);
      return dive;
    });
  }
}
