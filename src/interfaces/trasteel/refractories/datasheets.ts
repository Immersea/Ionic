import {
  cloneDeep,
  escapeRegExp,
  isNumber,
  orderBy,
  startsWith,
  toNumber,
  union,
} from "lodash";
import {Media} from "../../../interfaces/common/media/media";
import {TextMultilanguage} from "../../interfaces";
import {convertTextMultiLanguage, roundDecimals} from "../../../helpers/utils";
import {DatasheetsService} from "../../../services/trasteel/refractories/datasheets";
import {FirebaseFilterCondition} from "../../common/system/system";
import {SystemService} from "../../../services/common/system";

export class DatasheetSettings {
  datasheetMajorFamilies: DatasheetMajorFamily[];
  datasheetFamilies: DatasheetFamily[];
  datasheetCategories: DatasheetCategory[];
  datasheetPropertyTypes: DatasheetPropertyType[];
  datasheetPropertyNames: DatasheetPropertyName[];
  datasheetQualityColorCodes: DatasheetQualityColorCode[];
  constructor(data?) {
    this.datasheetMajorFamilies =
      data && data.datasheetMajorFamilies ? data.datasheetMajorFamilies : [];
    this.datasheetFamilies =
      data && data.datasheetFamilies ? data.datasheetFamilies : [];
    this.datasheetCategories =
      data && data.datasheetCategories ? data.datasheetCategories : [];
    this.datasheetPropertyTypes =
      data && data.datasheetPropertyTypes ? data.datasheetPropertyTypes : [];
    this.datasheetPropertyTypes =
      data && data.datasheetPropertyTypes ? data.datasheetPropertyTypes : [];
    this.datasheetPropertyNames =
      data && data.datasheetPropertyNames ? data.datasheetPropertyNames : [];
    this.datasheetQualityColorCodes =
      data && data.datasheetQualityColorCodes
        ? data.datasheetQualityColorCodes
        : [];
  }
}

export class DatasheetMajorFamily {
  majorFamilyId: string;
  majorFamilyName: string; //BRICKS, etc
  constructor(data?) {
    this.majorFamilyId = data && data.majorFamilyId ? data.majorFamilyId : null;
    this.majorFamilyName =
      data && data.majorFamilyName ? data.majorFamilyName : null;
  }
}

export class DatasheetFamily {
  familyId: string;
  familyName: string; //Magnesia Carbon Bricks, etc.
  constructor(data?) {
    this.familyId = data && data.familyId ? data.familyId : null;
    this.familyName = data && data.familyName ? data.familyName : null;
  }
}

export class DatasheetCategory {
  categoriesId: string;
  categoriesName: string; //EAF, LADLE, etc.
  constructor(data?) {
    this.categoriesId = data && data.categoriesId ? data.categoriesId : null;
    this.categoriesName =
      data && data.categoriesName ? data.categoriesName : null;
  }
}

export class DatasheetPropertyType {
  typeId: string;
  typeName: string;
  typeLeft: TextMultilanguage;
  typeRight: TextMultilanguage;
  typeLimit: TextMultilanguage;
  position: number;
  constructor(data?) {
    this.position = data && data.position ? data.position : 0;
    this.typeId = data && data.typeId ? data.typeId : null;
    this.typeName = data && data.typeName ? data.typeName : null;
    this.typeLeft =
      data && data.typeLeft
        ? convertTextMultiLanguage(data.typeLeft)
        : {en: null};
    this.typeRight =
      data && data.typeRight
        ? convertTextMultiLanguage(data.typeRight)
        : {en: null};
    this.typeLimit =
      data && data.typeLimit
        ? convertTextMultiLanguage(data.typeLimit)
        : {en: null};
  }
}

export class DatasheetPropertyName {
  nameId: string;
  nameName: string;
  nameType: string; //reference to DatasheetProprtyType
  nameDescLeft: TextMultilanguage;
  nameDescRight: TextMultilanguage;
  comments: TextMultilanguage;
  dimension: TextMultilanguage;
  decimals: number;
  position: number;
  constructor(data?) {
    this.nameId = data && data.nameId ? data.nameId : null;
    this.nameName = data && data.nameName ? data.nameName : null;
    this.nameType = data && data.nameType ? data.nameType : null;
    this.nameDescLeft =
      data && data.nameDescLeft
        ? convertTextMultiLanguage(data.nameDescLeft)
        : {en: null};

    this.nameDescRight =
      data && data.nameDescRight
        ? convertTextMultiLanguage(data.nameDescRight)
        : {en: null};
    this.comments =
      data && data.comments
        ? convertTextMultiLanguage(data.comments)
        : {en: null};
    this.dimension =
      data && data.dimension
        ? convertTextMultiLanguage(data.dimension)
        : {en: null};
    this.decimals = data && data.decimals ? toNumber(data.decimals) : 2;
    this.position = data && data.position ? toNumber(data.position) : 1;
  }
}

export class DatasheetQualityColorCode {
  qualityColorCodeId: string;
  qualityColorCodePicture: string;
  constructor(data?) {
    this.qualityColorCodeId =
      data && data.qualityColorCodeId ? data.qualityColorCodeId : null;
    this.qualityColorCodePicture =
      data && data.qualityColorCodePicture
        ? data.qualityColorCodePicture
        : null;
  }
}

export class DatasheetProperty {
  position: number; //from main property
  type: string; //Chemical, Physical, etc
  name: string; //MgO %, CaO %, etc
  typical: number;
  prefix: number;
  lower: number;
  higher: number;
  show: boolean = true;
  constructor(data?) {
    this.position =
      data && isNumber(toNumber(data.position)) ? toNumber(data.position) : 0;
    this.type = data && data.type ? data.type : null;
    this.name = data && data.name ? data.name : null;
    this.typical =
      data && isNumber(toNumber(data.typical)) && toNumber(data.typical) > 0
        ? toNumber(data.typical)
        : null;
    this.prefix = data && data.prefix ? data.prefix : null;
    this.lower =
      data && isNumber(toNumber(data.lower)) && toNumber(data.lower) >= 0
        ? toNumber(data.lower)
        : null;
    this.higher =
      data && isNumber(toNumber(data.higher)) && toNumber(data.higher) > 0
        ? toNumber(data.higher)
        : null;
    this.show =
      data && data.show == true
        ? true
        : data && data.show == false
          ? false
          : true;
  }
}

//each datasheet information
export class Datasheet {
  majorFamilyId: string;
  familyId: string;
  categoriesId: string;
  sequentialId: string;
  techNo: string;
  qualityPrefix: string;
  productName: string;
  qualityColorCodeId: string;
  classification: TextMultilanguage;
  application: TextMultilanguage;
  properties: DatasheetProperty[];
  producerName: string;
  producerReferenceQuality: string;
  competitorReferenceQuality: string;
  comments: string;
  performanceComments: string;
  revisionNo: number;
  issuedOnDate: string;
  oldProduct: boolean;
  files: Media[]; //TODO : add file url references
  users: {
    [id: string]: string[]; //["owner", "editor", etc.]
  };

  constructor(data?) {
    this.majorFamilyId = data && data.majorFamilyId ? data.majorFamilyId : null;
    this.familyId = data && data.familyId ? data.familyId : null;
    this.categoriesId = data && data.categoriesId ? data.categoriesId : null;
    this.sequentialId = data && data.sequentialId ? data.sequentialId : null;
    this.techNo = data && data.techNo ? data.techNo : null;
    this.qualityPrefix = data && data.qualityPrefix ? data.qualityPrefix : null;
    this.productName = data && data.productName ? data.productName : null;
    this.qualityColorCodeId =
      data && data.qualityColorCodeId ? data.qualityColorCodeId : null;
    this.classification =
      data && data.classification
        ? convertTextMultiLanguage(data.classification)
        : {en: null};
    //fix old db import error
    data && data.Value_Type_Left
      ? (this.classification = convertTextMultiLanguage(data.Value_Type_Left))
      : undefined;
    this.application =
      data && data.application
        ? convertTextMultiLanguage(data.application)
        : {en: null};
    //fix old db import error
    data && data.Value_Type_Right
      ? (this.application = convertTextMultiLanguage(data.Value_Type_Right))
      : undefined;
    let properties = [];
    if (data && data.properties) {
      data.properties.forEach((property) => {
        properties.push(new DatasheetProperty(property));
      });
    }
    this.orderProperties(properties);
    this.producerName = data && data.producerName ? data.producerName : null;
    this.producerReferenceQuality =
      data && data.producerReferenceQuality
        ? data.producerReferenceQuality
        : null;
    this.competitorReferenceQuality =
      data && data.competitorReferenceQuality
        ? data.competitorReferenceQuality
        : null;
    this.comments = data && data.comments ? data.comments : null;
    this.performanceComments =
      data && data.performanceComments ? data.performanceComments : null;
    this.revisionNo = data && data.revisionNo ? toNumber(data.revisionNo) : 0;
    this.issuedOnDate =
      data && data.issuedOnDate ? data.issuedOnDate : new Date().toISOString();
    this.oldProduct = data && data.oldProduct ? data.oldProduct : false;
    this.files = data && data.files ? data.files : [];
    this.users = {};
    if (data && data.users) {
      Object.keys(data.users).forEach((key) => {
        this.users[key] = data.users[key];
      });
    }
  }

  orderProperties(properties) {
    this.properties = orderBy(properties, ["type", "position", "name"], "asc");
  }

  orderPropertiesForExport() {
    //first Chemical Raw, then Chemical, then Physical
    //order properties by value, with BD, AP, CCS and then the others
    const propertiesWithDecimals = [];
    cloneDeep(this.properties).forEach((property) => {
      const propertyName = DatasheetsService.getDatasheetPropertyNames(
        "id",
        property.name
      )[0];
      const decimals = propertyName ? propertyName.decimals : 2;
      if (property.typical) {
        property.typical = roundDecimals(property.typical, decimals);
      }
      if (property.higher) {
        property.higher = roundDecimals(property.higher, decimals);
      }
      if (property.lower) {
        property.lower = roundDecimals(property.lower, decimals);
      }
      const regex = new RegExp(`${escapeRegExp("-")}(.*?)${escapeRegExp("c")}`);
      const match = property.name.match(regex);
      const dataSheetProperty = DatasheetsService.getDatasheetPropertyNames(
        "id",
        property.name
      )[0];
      const comment = SystemService.getValueForLanguage(
        dataSheetProperty.comments,
        "en"
      );
      property["comment"] = comment;
      const temp =
        match && match[1] && !isNaN(toNumber(match[1]))
          ? toNumber(match[1])
          : 0;
      property["temp"] = temp;
      let values = [property.lower, property.typical, property.higher].filter(
        (num) => num > 0
      );
      property["minValue"] = Math.min(...values);
      property.position = dataSheetProperty.position;
      propertiesWithDecimals.push(property);
    });
    const orderByItemsPhysical = ["position", "name", "comment", "minValue"];
    const orderByItemsChemical = ["position", "minValue"];
    const chemical = orderBy(
      propertiesWithDecimals.filter((x) => x.type == "chemical"),
      orderByItemsChemical,
      ["asc", "desc"]
    );
    const chemical_raw = orderBy(
      propertiesWithDecimals.filter((x) => x.type == "chemical-raw"),
      orderByItemsChemical,
      ["asc", "desc"]
    );
    const physical = propertiesWithDecimals.filter((x) => x.type == "physical");
    let physical_ordered = [];
    const BD = physical.find((x) => startsWith(x.name, "bd-"));
    const AP = physical.find((x) => x.name == "ap");
    const CCS = physical.find((x) => startsWith(x.name, "ccs-"));
    if (BD) physical_ordered.push(BD);
    if (AP) physical_ordered.push(AP);
    if (CCS) physical_ordered.push(CCS);
    let physical_others = [];
    physical.forEach((value) => {
      if (
        !startsWith(value.name, "bd-") &&
        value.name !== "ap" &&
        !startsWith(value.name, "ccs-")
      ) {
        physical_others.push(value);
      }
    });
    physical_others = orderBy(physical_others, orderByItemsPhysical, [
      "asc",
      "asc",
      "asc",
      "desc",
    ]);
    physical_ordered = physical_ordered.concat(physical_others);
    const physical_raw = propertiesWithDecimals.filter(
      (x) => x.type == "physical-raw"
    );
    const others = orderBy(
      propertiesWithDecimals.filter(
        (x) =>
          x.type != "chemical" &&
          x.type != "chemical-raw" &&
          x.type != "physical" &&
          x.type != "physical-raw"
      ),
      orderByItemsPhysical,
      ["asc", "asc", "asc", "desc"]
    );
    const orderedProperties = union(
      chemical_raw,
      chemical,
      physical_ordered,
      physical_raw,
      others
    );
    return orderedProperties;
  }

  getDensity(): number {
    const densityProperty = this.properties.find((x) => x.name.includes("bd"));
    if (densityProperty) {
      if (densityProperty.typical) {
        return densityProperty.typical;
      }
      if (densityProperty.lower) {
        return densityProperty.lower;
      }
      if (densityProperty.higher) {
        return densityProperty.higher;
      }
      return 0;
    }
  }
}

export class DatasheetFilter {
  majorFamilyId: string;
  familyId: string;
  oldProduct: boolean = false;
  properties: FirebaseFilterCondition[];

  constructor(data?) {
    this.majorFamilyId = data && data.majorFamilyId ? data.majorFamilyId : null;
    this.familyId = data && data.familyId ? data.familyId : null;
    this.oldProduct = data && data.oldProduct ? true : false;
    const properties = [];
    if (data && data.properties) {
      data.properties.forEach((property) => {
        properties.push(new FirebaseFilterCondition(property));
      });
    }
    this.properties = properties;
  }

  isActive() {
    return (
      this.familyId != null ||
      this.majorFamilyId != null ||
      this.oldProduct == true ||
      this.properties.length > 0
    );
  }
}

//Used to fill essential data of the datasheets into the lists
export class MapDataDatasheet {
  id: string;
  familyId: string;
  techNo: string;
  revisionNo: number;
  oldProduct: boolean = false;
  productName: string;
  constructor(data?) {
    if (data) {
      Object.keys(data).forEach((key) => {
        if (key == "oldProduct") {
          this.oldProduct = data.oldProduct ? true : false;
        } else if (key == "revisionNo") {
          this[key] = toNumber(data[key]);
        } else this[key] = data[key];
      });
    }
  }
}
