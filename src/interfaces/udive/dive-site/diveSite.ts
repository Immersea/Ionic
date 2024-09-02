import {DivePlanModel} from "../planner/dive-plan";
import {LocationIQ} from "../../../components";
import {MapService, Position} from "../../../services/common/map";
import {toNumber} from "lodash";

export class MapDataDiveSite {
  id: string;
  displayName: string;
  photoURL: string;
  coverURL: string;
  position: Position;
  type: string;
  divePlans: string[]; //configuration stdName
  divingCenters: string[]; //ids

  constructor(data) {
    Object.keys(data).forEach((key) => {
      if (key == "position") {
        this.position = null;
        if (data.position)
          this.position = MapService.setPosition(data.position);
      } else {
        this[key] = data[key];
      }
    });
  }
}

export class DiveSite {
  displayName: string;
  photoURL: string;
  coverURL: string;
  position: Position;
  address: LocationIQ;
  type: string;
  description: string;
  information: {
    avgViz: string;
    minDepth: number;
    maxDepth: number;
    entryType: string;
    seabedComposition: string[];
    seabedCover: string[];
    waterTemp: {
      spring: string;
      summer: string;
      autumn: string;
      winter: string;
    };
  };
  divePlans: DivePlanModel[];
  divingCenters: string[];
  users: {
    [id: string]: string[]; //["owner", "editor", etc.]
  };

  constructor(data?) {
    this.displayName = data && data.displayName ? data.displayName : null;
    this.photoURL = data && data.photoURL ? data.photoURL : null;
    this.coverURL = data && data.coverURL ? data.coverURL : null;
    this.type = data && data.type ? data.type : null;
    this.address = data && data.address ? data.address : null;
    this.position = null;
    if (data && data.position) {
      if (data.position) this.position = MapService.setPosition(data.position);
    } else if (this.address && this.address.lat && this.address.lon) {
      //get position from address
      this.position = MapService.getPosition(
        this.address.lat,
        this.address.lon
      );
    }
    this.description = data && data.description ? data.description : null;
    this.information = {
      avgViz: data && data.information.avgViz ? data.information.avgViz : null,
      minDepth:
        data && data.information.minDepth
          ? toNumber(data.information.minDepth)
          : 0,
      maxDepth:
        data && data.information.maxDepth
          ? toNumber(data.information.maxDepth)
          : 0,
      entryType:
        data && data.information.entryType ? data.information.entryType : null,
      seabedComposition:
        data && data.information.seabedComposition
          ? data.information.seabedComposition
          : null,
      seabedCover:
        data && data.information.seabedCover
          ? data.information.seabedCover
          : null,
      waterTemp: {
        spring:
          data && data.information.waterTemp.spring
            ? data.information.waterTemp.spring
            : null,
        summer:
          data && data.information.waterTemp.summer
            ? data.information.waterTemp.summer
            : null,
        autumn:
          data && data.information.waterTemp.autumn
            ? data.information.waterTemp.autumn
            : null,
        winter:
          data && data.information.waterTemp.winter
            ? data.information.waterTemp.winter
            : null,
      },
    };
    this.divePlans = [];
    if (data && data.divePlans.length > 0) {
      data.divePlans.map((plan) => {
        this.divePlans.push(new DivePlanModel(plan));
      });
    }
    this.divingCenters = [];
    if (data && data.divingCenters.length > 0) {
      this.divingCenters = data.divingCenters;
    }
    this.users = {};
    if (data && data.users) {
      Object.keys(data.users).forEach((key) => {
        this.users[key] = data.users[key];
      });
    }
  }

  setAddress(address: LocationIQ) {
    this.address = address;
  }
}
