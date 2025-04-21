/*
*
* Models a single decoplanner dive
*
    [
              {
                  "fHe": 0,
                  "fO2": 50,
                  "fromDepth": 21,
                  "setpoint": 1.4,
                  "textGas": "Nx50"
              },
              {
                  "fHe": 0,
                  "fO2": 100,
                  "fromDepth": 6,
                  "setpoint": 1.6,
                  "textGas": "Oxygen"
              }
          ],
          "profilePoints": [
              {
                  "depth": 65,
                  "fHe": 55,
                  "fO2": 15,
                  "index": 0,
                  "setpoint": 1.2,
                  "textGas": "Tx15/55",
                  "time": 30
              }
          ],
          "surfaceInterval": 3
*/
import { Gas } from "./gas";
import { DiveProfilePoint } from "./dive-profile-point";
import { max, orderBy, reverse, round } from "lodash";
import { ARPCModel } from "./arpc";
import { GasBlenderService } from "../../../services/udive/planner/gas-blender";
import { DiveToolsService } from "../../../services/udive/planner/dive-tools";

export class DecoplannerDive {
  decoGases: Array<Gas> = [];
  bottomGases: Array<Gas> = [];
  profilePoints: Array<DiveProfilePoint> = [];
  surfaceInterval: number = 3;
  VPM: any;
  CCR: any;
  BUHL: any;
  introText: Array<any>;
  offGassingDepth: number;
  selectedModel: string = "BUHL";
  configuration: string = "OC";
  units: string = "Metric";
  arpc: ARPCModel;
  date: Date = new Date();
  diveSiteId: string;
  divingCenterId: string;
  divingSchoolId: string;
  backgasHypoxicDepth: number;

  constructor(dive?: any) {
    if (dive) {
      for (let key in dive) {
        if (key == "profilePoints") {
          dive.profilePoints.forEach((point) => {
            this.addProfilePoint(
              point.depth,
              point.time,
              point.gas.fO2,
              point.gas.fHe,
              point.setpoint
            );
          });
        } else if (key == "decoGases") {
          dive.decoGases.forEach((gas) => {
            let ppO2 = gas.setpoint ? gas.setpoint : gas.ppO2;
            this.addDecoGas(
              gas.fO2,
              gas.fHe,
              gas.fromDepth,
              ppO2,
              gas.useAsDiluent
            );
          });
        } else if (key == "VPM") {
          this.VPM = this.getDiveProfileCalculations(dive.VPM);
        } else if (key == "CCR") {
          this.CCR = {
            BUHL: this.getDiveProfileCalculations(dive.CCR.BUHL),
            VPM: this.getDiveProfileCalculations(dive.CCR.VPM),
          };
        } else if (key == "BUHL") {
          this.BUHL = this.getDiveProfileCalculations(dive.BUHL);
        } else if (key == "surfaceInterval") {
          this.surfaceInterval = dive.surfaceInterval;
        } else if (key == "introText") {
          this.introText = dive.introText;
        } else if (key == "offGassingDepth") {
          this.offGassingDepth = dive.offGassingDepth;
        } else if (key == "selectedModel") {
          this.selectedModel = dive.selectedModel;
        } else if (key == "configuration") {
          this.configuration = dive.configuration;
        } else if (key == "backgasHypoxicDepth") {
          this.backgasHypoxicDepth = dive.backgasHypoxicDepth;
        } else if (key == "arpc") {
          this[key] = new ARPCModel(dive[key]);
        } else if (key == "date") {
          this[key] = new Date(dive.date);
        } else if (key == "units") {
          this.setUnits(dive[key]);
        } else if (
          key == "diveSiteId" ||
          key == "divingCenterId" ||
          key == "divingSchoolId"
        ) {
          this[key] = dive[key];
        }
      }
    }
  }

  getDiveProfileCalculations(doc) {
    doc.profile = doc.profile.map((profile) => {
      profile.gas = new Gas(
        profile.gas.fO2,
        profile.gas.fHe,
        profile.gas.fromDepth,
        profile.gas.ppO2,
        profile.gas.units
      );
      return profile;
    });
    return doc;
  }

  addProfilePoint(depth, time, fO2, fHe, setpoint = 1.2) {
    let gas = new Gas(fO2, fHe, depth, setpoint);
    let profilePoint = new DiveProfilePoint(
      this.profilePoints.length,
      depth,
      time,
      gas,
      setpoint
    );
    this.profilePoints.push(profilePoint);
    this.addBottomGas(fO2, fHe, depth, setpoint);
  }

  updateProfilePoint(index, depth, time, fO2, fHe, setpoint = 1.2) {
    let gas = new Gas(fO2, fHe, depth, setpoint);
    let profilePoint = new DiveProfilePoint(
      this.profilePoints.length,
      depth,
      time,
      gas,
      setpoint
    );
    this.profilePoints[index] = profilePoint;
    this.bottomGases[index] = new Gas(fO2, fHe, depth, setpoint);
  }

  removeProfilePoint(index) {
    this.profilePoints.splice(index, 1);
    this.bottomGases.splice(index, 1);
  }

  addDecoGas(fO2, fHe, fromDepth, setpoint = 1.4, useAsDiluent = false) {
    let gas = new Gas(fO2, fHe, fromDepth, setpoint);
    gas.setUseAsDiluent(useAsDiluent);
    this.decoGases.push(gas);
    this.decoGases = orderBy(this.decoGases, "fromDepth", "desc");
  }

  updateDecoGas(
    index,
    fO2,
    fHe,
    fromDepth,
    setpoint = 1.4,
    useAsDiluent = false
  ) {
    let gas = new Gas(fO2, fHe, fromDepth, setpoint);
    gas.setUseAsDiluent(useAsDiluent);
    this.decoGases[index] = gas;
    this.decoGases = orderBy(this.decoGases, "fromDepth", "desc");
  }

  removeDecoGas(index) {
    this.decoGases.splice(index, 1);
  }

  //bottom gases have same index of profile points
  private addBottomGas(fO2, fHe, fromDepth, setpoint = 1.2) {
    let gas = new Gas(fO2, fHe, fromDepth, setpoint);
    this.bottomGases.push(gas);
    this.bottomGases = orderBy(this.bottomGases, "fromDepth", "desc");
  }

  /*private removeBottomGas(index) {
        this.bottomGases.splice(index,1);
    }*/

  getDiveDetails() {
    let details = [];
    details.push(this.configuration);
    this.profilePoints.forEach((point) => {
      details.push(
        point.time +
          "min @ " +
          point.depth +
          (this.units === "Metric" ? "m" : "ft") +
          " (" +
          GasBlenderService.getGasName(point.gas) +
          ")"
      );
    });
    this.decoGases.forEach((gas) => {
      if (this.configuration == "CCR") {
        //details.push("pO2:"+gas.ppO2+" --> "+gas.getFromDepth()+"m")
      } else {
        details.push(
          GasBlenderService.getGasName(gas) +
            " --> " +
            gas.getFromDepth() +
            (this.units === "Metric" ? "m" : "ft")
        );
      }
    });
    return details;
  }

  getProfilePointsDetails() {
    let details = [];
    this.profilePoints.forEach((point) => {
      details.push(
        point.time +
          "min @ " +
          point.depth +
          (this.units === "Metric" ? "m" : "ft") +
          " (" +
          GasBlenderService.getGasName(point.gas) +
          ")"
      );
    });
    return details;
  }

  getDecoTime() {
    let data = this.CCR
      ? this.CCR[this.selectedModel]
      : this[this.selectedModel];
    if (data) {
      return round(data.decotime, 1);
    }
  }
  getRunTime() {
    let data = this.CCR
      ? this.CCR[this.selectedModel]
      : this[this.selectedModel];
    if (data) {
      return round(data.runtime, 1);
    }
  }

  getMaxDepth() {
    let profileDepths = [];
    for (let i in this.profilePoints) {
      profileDepths.push(this.profilePoints[i].depth);
    }
    return max(profileDepths);
  }

  getDecoStartDepth() {
    return this.getMaxDepth() * 0.74;
  }

  getDecoProfileUnder(depth) {
    let details = [];
    let data = this.CCR
      ? this.CCR[this.selectedModel]
      : this[this.selectedModel];
    if (data) {
      data.profile.forEach((point) => {
        if (point.depth <= depth && point.depth != 0) {
          details.push(
            round(point[point.rangeShape].stoptime, 1) +
              "min @ " +
              round(point.depth, 1) +
              (this.units === "Metric" ? "m" : "ft")
          );
        }
      });
    }
    return details;
  }

  getDecoProfileGroups() {
    let details = [];
    let data = this.CCR
      ? this.CCR[this.selectedModel]
      : this[this.selectedModel];
    if (data) {
      let depths = reverse(Object.keys(data.rangeDescr));
      depths.forEach((depth) => {
        details.push(
          data.rangeDescr[depth] +
            " " +
            depth +
            (this.units === "Metric" ? "m" : "ft") +
            " -> " +
            round(data.rangeSums[depth]) +
            "min"
        );
      });
    }
    return details;
  }

  setUnits(units) {
    this.units = units;
    //scroll all points and gases to set unit
    this.profilePoints = this.profilePoints.map((point) => {
      point.gas.units = units;
      return point;
    });
    this.bottomGases = this.bottomGases.map((gas) => {
      gas.units = units;
      return gas;
    });
    this.decoGases = this.decoGases.map((gas) => {
      gas.units = units;
      return gas;
    });
  }

  convertUnits(units) {
    if (this.units !== units) {
      this.profilePoints = this.profilePoints.map((point) => {
        point.depth =
          units == "Metric"
            ? DiveToolsService.feetToMeters(point.depth, 0)
            : DiveToolsService.metersToFeet(point.depth, -1);
        point.gas = point.gas.convertUnit(units == "Metric");
        return point;
      });
      this.bottomGases = this.bottomGases.map((gas) => {
        gas.convertUnit(units == "Metric");
        return gas;
      });
      this.decoGases = this.decoGases.map((gas) => {
        gas.convertUnit(units == "Metric");
        return gas;
      });
      this.units = units;
    }
  }
}
