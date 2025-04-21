import { round, toNumber } from "lodash";
import { DiveToolsService } from "../../../services/udive/planner/dive-tools";
import { DecoplannerParameters } from "./decoplanner-parameters";
import { Tank } from "./tank";

export class DiveConfiguration {
  //model fields;
  parameters: DecoplannerParameters;
  stdName: string;
  diveType: string;
  maxDepth: number;
  maxTime: number;
  configuration: {
    bottom: Array<Tank>;
    deco: Array<Tank>;
  };

  constructor(doc?) {
    if (doc && doc.parameters) {
      this.parameters = new DecoplannerParameters(doc.parameters);
    } else {
      this.parameters = new DecoplannerParameters();
    }
    if (doc && doc.stdName) {
      this.stdName = doc.stdName;
    } else {
      this.stdName = "Rec1";
    }
    if (doc && doc.maxDepth) {
      this.maxDepth = toNumber(doc.maxDepth);
    } else {
      this.maxDepth = this.getDiveTypeDepth(this.diveType);
    }
    if (doc && doc.maxTime) {
      this.maxTime = toNumber(doc.maxTime);
    } else {
      this.maxTime = 30;
    }

    this.configuration = {
      bottom: [],
      deco: [],
    };
    if (doc && doc.configuration) {
      doc.configuration.bottom.forEach((tank) => {
        this.configuration.bottom.push(
          new Tank(
            tank.name,
            tank.volume,
            tank.no_of_tanks,
            tank.gas,
            tank.pressure,
            tank.units
          )
        );
      });
      doc.configuration.deco.forEach((tank) => {
        this.configuration.deco.push(
          new Tank(
            tank.name,
            tank.volume,
            tank.no_of_tanks,
            tank.gas,
            tank.pressure,
            tank.units
          )
        );
      });
    }
  }

  //units according to deco parameters
  getDiveTypes(): any {
    if (this.parameters.metric) {
      return {
        Rec1: 21,
        Rec2: 30,
        Rec3: 39,
        Tec1: 50,
        "Tec1+": 60,
        Tec2: 75,
        "Tec2+": 90,
        pSCR: 130,
        CCR: 130,
      };
    } else {
      return {
        Rec1: 70,
        Rec2: 100,
        Rec3: 130,
        Tec1: 165,
        "Tec1+": 200,
        Tec2: 250,
        "Tec2+": 300,
        pSCR: 430,
        CCR: 430,
      };
    }
  }
  getDiveTypeDepth(type: string): number {
    return this.getDiveTypes()[type];
  }

  convertUnits(parameters) {
    this.parameters = parameters;
    this.configuration.bottom = this.configuration.bottom.map((bottom) => {
      bottom.convertUnit(this.parameters.metric);
      return bottom;
    });
    this.configuration.deco = this.configuration.deco.map((deco) => {
      deco.convertUnit(this.parameters.metric);
      return deco;
    });
    if (this.parameters.metric) {
      this.maxDepth = round(DiveToolsService.feetToMeters(this.maxDepth, 0));
    } else {
      this.maxDepth = round(DiveToolsService.metersToFeet(this.maxDepth, -1));
    }
  }
}
