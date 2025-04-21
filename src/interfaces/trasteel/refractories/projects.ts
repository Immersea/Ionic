import { TextMultilanguage } from "../../interfaces";
import { convertTextMultiLanguage, isValidDate } from "../../../helpers/utils";
import { toNumber } from "lodash";

//each shape information
export class Project {
  projectLocalId: string;
  docsCaption: string;
  projectDescription: string;
  drawing: string;
  drawingDate: string;
  finishedDate: string;
  customerId: string;
  setsAmount: number = 1;
  unitCapacity: number;
  applicationId: string; //EAF, LDL, TUN
  guaranteedLife: string;
  steelAmount: number;
  liquidMetalDensity: number = 7.04;
  projectAreaQuality: ProjectAreaQuality[];
  projectMass: ProjectMass[];
  users: {
    [id: string]: string[]; //["owner", "editor", etc.]
  };

  constructor(data?) {
    this.projectLocalId =
      data && data.projectLocalId ? data.projectLocalId : null;
    this.docsCaption = data && data.docsCaption ? data.docsCaption : null;
    this.projectDescription =
      data && data.projectDescription ? data.projectDescription : null;
    this.drawing = data && data.drawing ? data.drawing : null;
    //check dates
    this.drawingDate =
      data && data.drawingDate && isValidDate(data.drawingDate)
        ? new Date(data.drawingDate).toISOString()
        : new Date().toISOString();
    this.finishedDate =
      data && data.finishedDate && isValidDate(data.finishedDate)
        ? new Date(data.finishedDate).toISOString()
        : new Date().toISOString();
    this.customerId = data && data.customerId ? data.customerId : null;
    this.setsAmount = data && data.setsAmount ? toNumber(data.setsAmount) : 1;
    this.unitCapacity = data && data.unitCapacity ? data.unitCapacity : null;
    this.applicationId =
      data && data.applicationId
        ? data.applicationId
        : data && data.applicationUnitId
          ? data.applicationUnitId
          : null;
    this.guaranteedLife =
      data && data.guaranteedLife ? data.guaranteedLife : null;
    this.steelAmount =
      data && data.steelAmount ? toNumber(data.steelAmount) : null;
    this.liquidMetalDensity =
      data && data.liquidMetalDensity
        ? toNumber(data.liquidMetalDensity)
        : 7.04;
    this.projectAreaQuality = [];
    if (data && data.projectAreaQuality) {
      data.projectAreaQuality.forEach((area) => {
        this.projectAreaQuality.push(new ProjectAreaQuality(area));
      });
    }
    this.projectMass = [];
    if (data && data.projectMass) {
      data.projectMass.forEach((mass) => {
        this.projectMass.push(new ProjectMass(mass));
      });
    }
    this.users = {};
    if (data && data.users) {
      Object.keys(data.users).forEach((key) => {
        this.users[key] = data.users[key];
      });
    }
  }
}

export class ProjectAreaQuality {
  bricksAllocationAreaId: string;
  includeSafety: number = 0;
  onlyForRepair: boolean = false;
  datasheetId: string = "";
  density: number = 0;
  palletMarking: string;
  quality: string;
  comments: string;
  shapes: ProjectAreaQualityShape[] = [];
  courses: ProjectCourse[] = [];
  autoFillCourses: AutoFillCourses;
  constructor(data?) {
    if (data) {
      Object.keys(data).forEach((key) => {
        if (key == "courses") {
          this.courses = [];
          if (data.courses)
            data.courses.forEach((course) => {
              this.courses.push(new ProjectCourse(course));
            });
        } else if (key == "onlyForRepair") {
          const n = data[key];
          this.onlyForRepair = n == 1 ? true : n === true ? true : false;
        } else if (key == "density" || key == "includeSafety") {
          this[key] = toNumber(data[key]);
        } else if (key == "autoFillCourses") {
          this[key] = new AutoFillCourses(data[key]);
        } else if (key == "shapes") {
          this.shapes = [];
          data[key].forEach((shape) => {
            if (shape.shapeId !== "other_empty") {
              this.shapes.push(new ProjectAreaQualityShape(shape));
            }
          });
        } else {
          this[key] = data[key];
        }
      });
    }
  }
}

export class ProjectAreaQualityShape {
  position: number;
  shapeId: string;
  specialShapeVolume: number;
  constructor(data?) {
    this.position = data && data.position ? toNumber(data.position) : null;
    this.shapeId =
      data && data.shapeId ? this.validateLegacyShape(data.shapeId) : null;
    this.specialShapeVolume =
      data && data.specialShapeVolume ? toNumber(data.specialShapeVolume) : 0;
  }

  validateLegacyShape(id) {
    //old shapes used non permitted characters in the id
    return id
      .replace(".", "_")
      .replace(".", "_")
      .replace(".", "_")
      .replace("(", "")
      .replace(")", "")
      .replace("[", "")
      .replace("]", "");
  }
}

export class ProjectSettings {
  bricksAllocationArea: BricksAllocationArea[];
  applicationUnits: ApplicationUnit[];
  quantityUnits: QuantityUnit[];
  constructor(data?) {
    this.bricksAllocationArea =
      data && data.bricksAllocationArea ? data.bricksAllocationArea : [];
    this.applicationUnits =
      data && data.applicationUnits ? data.applicationUnits : [];
    this.quantityUnits = data && data.quantityUnits ? data.quantityUnits : [];
  }
}

export class BricksAllocationArea {
  bricksAllocationAreaId: string;
  bricksAllocationAreaName: TextMultilanguage; //Slag line, wall, etc
  constructor(data?) {
    this.bricksAllocationAreaId =
      data && data.bricksAllocationAreaId ? data.bricksAllocationAreaId : null;
    this.bricksAllocationAreaName =
      data && data.bricksAllocationAreaName
        ? convertTextMultiLanguage(data.bricksAllocationAreaName)
        : { en: null };
  }
}

export class ApplicationUnit {
  applicationId: string;
  applicationName: TextMultilanguage; //EAF, etc
  applicationAssociatedGoodsDesc: TextMultilanguage;
  applicationPackingDesc: TextMultilanguage;
  constructor(data?) {
    this.applicationId = data && data.applicationId ? data.applicationId : null;
    this.applicationName =
      data && data.applicationName
        ? convertTextMultiLanguage(data.applicationName)
        : { en: null };
    this.applicationAssociatedGoodsDesc =
      data && data.applicationAssociatedGoodsDesc
        ? convertTextMultiLanguage(data.applicationAssociatedGoodsDesc)
        : { en: null };
    this.applicationPackingDesc =
      data && data.applicationPackingDesc
        ? convertTextMultiLanguage(data.applicationPackingDesc)
        : { en: null };
  }
}

export class QuantityUnit {
  quantityUnitId: string;
  quantityUnitName: TextMultilanguage; //bag, etc
  constructor(data?) {
    this.quantityUnitName =
      data && data.quantityUnitName
        ? convertTextMultiLanguage(data.quantityUnitName)
        : { en: null };
    this.quantityUnitId =
      data && data.quantityUnitId ? data.quantityUnitId : null;
  }
}

export class ProjectCourse {
  courseNumber: number = 0; //sequence number
  layer: number = 0; //layer number
  startAngle: number = 0;
  endAngle: number = 360;
  widthAngle: number = 360;
  height: number = 0;
  innerRadius: number = 0;
  quantityShapes: {
    shapeId: string;
    quantity: number;
  }[] = [];
  repairSets: number = 0;
  constructor(data?) {
    if (data) {
      Object.keys(data).forEach((key) => {
        if (key == "quantityShapes") {
          this.quantityShapes = [];
          data.quantityShapes.forEach((shape) => {
            //check if shape is empty
            if (shape.shapeId !== "other_empty") {
              this.quantityShapes.push({
                shapeId: this.validateLegacyShape(shape.shapeId),
                quantity: toNumber(shape.quantity),
              });
            }
          });
        } else {
          this[key] = toNumber(data[key]);
        }
      });
    }
  }

  validateLegacyShape(id) {
    //old shapes used non permitted characters in the id
    if (id)
      return id
        .replace(".", "_")
        .replace(".", "_")
        .replace(".", "_")
        .replace("(", "")
        .replace(")", "")
        .replace("[", "")
        .replace("]", "");
    else return null;
  }
}

export class ProjectMass {
  position: number; //sequence number
  bricksAllocationAreaId: string;
  datasheetId: string;
  totalWeightMT: number;
  quantity: number;
  density: number;
  quantityUnit: string; //bags, etc.
  weightPerUnitKg: number;
  volume: number;
  constructor(data?) {
    if (data) {
      Object.keys(data).forEach((key) => {
        if (
          key == "bricksAllocationAreaId" ||
          key == "quantityUnit" ||
          key == "datasheetId"
        ) {
          this[key] = data[key];
        } else {
          this[key] = toNumber(data[key]);
        }
      });
    }
  }
}

//Used to fill essential data of the project into the lists
export class MapDataProject {
  id: string;
  projectLocalId: string;
  projectDescription: string;
  customerId: string;
  constructor(data?) {
    if (data) {
      Object.keys(data).forEach((key) => {
        this[key] = data[key];
      });
    }
  }
}

export class AutoFillCourses {
  fromCourse: number = 0;
  toCourse: number;
  courseNumbers: number[];
  step: number = 1;
  layer: number = 0;
  startAngle: number = 0;
  endAngle: number = 360;
  startHeight: number = 0;
  startRadius: number = 0;
  radiusStep: number = 0;
  repairSets: number = 0;
  quantityShape: number[] = [];
  constructor(data?) {
    if (data) {
      Object.keys(data).forEach((key) => {
        this[key] = data[key];
      });
    }
  }
}
