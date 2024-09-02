import {Media} from "../../../interfaces/common/media/media";
import {convertTextMultiLanguage, roundDecimals} from "../../../helpers/utils";
import {TextMultilanguage} from "../../interfaces";
import {toNumber} from "lodash";

export class ShapeFilter {
  shapeTypeId: string;
  shapeTypeId_operator = "=";
  H: number; //dimensions
  H_operator: "<" | "<=" | "=" | ">" | ">=";
  A: number;
  A_operator: "<" | "<=" | "=" | ">" | ">=";
  B: number;
  B_operator: "<" | "<=" | "=" | ">" | ">=";
  L: number;
  L_operator: "<" | "<=" | "=" | ">" | ">=";

  constructor(data?) {
    this.shapeTypeId = data && data.shapeTypeId ? data.shapeTypeId : null;
    this.H = data && data.H ? toNumber(data.H) : null;
    this.H_operator = data && data.H_operator ? data.H_operator : "=";
    this.L = data && data.L ? toNumber(data.L) : null;
    this.L_operator = data && data.L_operator ? data.L_operator : "=";
    this.A = data && data.A ? toNumber(data.A) : null;
    this.A_operator = data && data.A_operator ? data.A_operator : "=";
    this.B = data && data.B ? toNumber(data.B) : null;
    this.B_operator = data && data.B_operator ? data.B_operator : "=";
  }

  isActive() {
    return (
      this.shapeTypeId != null ||
      this.H > 0 ||
      this.A > 0 ||
      this.L > 0 ||
      this.B > 0
    );
  }
}

//each shape information
export class Shape {
  shapeTypeId: string;
  shapeName: string; //MK10/30, etc,
  shapeShortName: string;
  H: number; //dimensions
  H1: number;
  H2: number;
  A: number;
  A1: number;
  B: number;
  B1: number;
  L: number;
  L1: number;
  La: number;
  Lb: number;
  ANG: number;
  ANG1: number;
  D: number;
  Di: number;
  De: number;
  D1: number;
  D2: number;
  D3: number;
  D4: number;
  N: number;
  radius: number;
  radius_max: number;
  volume: number;
  decimals: number;
  dwg: Media; //reference to storage files
  produce: boolean;
  users: {
    [id: string]: string[]; //["owner", "editor", etc.]
  };

  constructor(data?) {
    this.shapeTypeId = data && data.shapeTypeId ? data.shapeTypeId : null;
    this.shapeName = data && data.shapeName ? data.shapeName : null;
    this.shapeShortName =
      data && data.shapeShortName ? data.shapeShortName : null;
    this.produce = data && data.produce ? true : false;
    this.H = data && data.H ? toNumber(data.H) : null;
    this.H1 = data && data.H1 ? toNumber(data.H1) : null;
    this.H2 = data && data.H2 ? toNumber(data.H2) : null;
    this.L = data && data.L ? toNumber(data.L) : null;
    this.L1 = data && data.L1 ? toNumber(data.L1) : null;
    this.A = data && data.A ? toNumber(data.A) : null;
    this.A1 = data && data.A1 ? toNumber(data.A1) : null;
    this.B = data && data.B ? toNumber(data.B) : null;
    this.B1 = data && data.B1 ? toNumber(data.B1) : null;
    this.La = data && data.La ? toNumber(data.La) : null;
    this.Lb = data && data.Lb ? toNumber(data.Lb) : null;
    this.ANG = data && data.ANG ? toNumber(data.ANG) : null;
    this.ANG1 = data && data.ANG1 ? toNumber(data.ANG1) : null;
    this.D = data && data.D ? toNumber(data.D) : null;
    this.Di = data && data.Di ? toNumber(data.Di) : null;
    this.De = data && data.De ? toNumber(data.De) : null;
    this.D1 = data && data.D1 ? toNumber(data.D1) : null;
    this.D2 = data && data.D2 ? toNumber(data.D2) : null;
    this.D3 = data && data.D3 ? toNumber(data.D3) : null;
    this.D4 = data && data.D4 ? toNumber(data.D4) : null;
    this.N = data && data.N ? toNumber(data.N) : null;
    this.radius = data && data.radius ? toNumber(data.radius) : null;
    this.radius_max =
      data && data.radius_max ? toNumber(data.radius_max) : null;
    this.volume = data && data.volume ? toNumber(data.volume) : null;
    this.decimals = data && data.decimals ? toNumber(data.decimals) : 2;
    this.dwg = data && data.dwg ? new Media(data.dwg) : null;
    this.users = {};
    if (data && data.users) {
      Object.keys(data.users).forEach((key) => {
        this.users[key] = data.users[key];
      });
    }
  }

  getWeight(density): number {
    return density > 0
      ? roundDecimals(this.getVolume() * parseFloat(density), this.decimals)
      : 0;
  }

  getWeightForVolume(volume, density): number {
    return density > 0
      ? roundDecimals(parseFloat(volume) * parseFloat(density), this.decimals)
      : 0;
  }

  getVolume(): number {
    return roundDecimals(
      ((((this.A + this.B) * this.L) / 2) * this.H) / 1000000,
      this.decimals
    );
  }

  getInternalRadius(): number {
    if (this.A > 0 && this.B > 0 && this.H > 0 && this.L > 0) {
      const n = (this.B * this.H) / (this.A - this.B);
      return roundDecimals(n, 0);
    }
    return 0;
  }

  getExternalRadius(): number {
    if (this.A > 0 && this.B > 0 && this.H > 0 && this.L > 0) {
      const n = (this.A * this.H) / (this.A - this.B);
      return roundDecimals(n, 0);
    }
    return 0;
  }

  getDimensions(): string {
    return this.L + "x" + this.H + "x" + this.A + "/" + this.B;
  }
}

export class ShapeSettings {
  shapeTypes: ShapeType[];
  constructor(data?) {
    this.shapeTypes = data && data.shapeTypes ? data.shapeTypes : [];
  }
}

export class ShapeType {
  position: number;
  typeId: string;
  typeName: TextMultilanguage;
  decimals: number;
  dwg: Media;
  constructor(data?: ShapeType) {
    this.position = data && data.position ? toNumber(data.position) : 1;
    this.typeId = data && data.typeId ? data.typeId : "";
    this.typeName =
      data && data.typeName
        ? convertTextMultiLanguage(data.typeName)
        : {en: null};
    this.decimals = data && data.decimals ? data.decimals : 2;
    this.dwg = data && data.dwg ? new Media(data.dwg) : new Media();
  }
}

export class AreaShape {
  areaIndex: number;
  shapes: Shape[];
  constructor(data?) {
    this.areaIndex = data && data.areaIndex >= 0 ? data.areaIndex : null;
    this.shapes = data && data.shapes ? data.shapes : [];
  }
}

//Used to fill essential data of the shapes into the lists
export class MapDataShape {
  id: string;
  shapeTypeId: string;
  shapeName: string;
  constructor(data?) {
    if (data) {
      Object.keys(data).forEach((key) => {
        this[key] = data[key];
      });
    }
  }
}
