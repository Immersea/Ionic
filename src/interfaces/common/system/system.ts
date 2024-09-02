import {Timestamp} from "firebase/firestore";
import {Agency} from "../../udive/diving-class/divingClass";

export interface TranslationTag {
  tag: string;
  text: string;
}

export interface SystemPreference {
  collectionsUpdate: {
    [collectionId: string]: Timestamp;
  };
  divingAgencies: {
    [agencyId: string]: Agency;
  };
  selectOptions: {
    certificationGroups: TranslationTag[];
  };
  productPrices: {
    [productId: string]: number;
  };
}

export class FirebaseFilterCondition {
  field: string;
  fieldName: string;
  valueName: string;
  comparisonField: string;
  operator: "<" | "<=" | ">" | ">=" | ">" | "=";
  value: string | number;
  constructor(data?) {
    this.field = data && data.field ? data.field : null;
    this.fieldName = data && data.fieldName ? data.fieldName : null;
    this.valueName = data && data.valueName ? data.valueName : null;
    this.comparisonField =
      data && data.comparisonField ? data.comparisonField : null;
    this.operator = data && data.operator ? data.operator : "=";
    this.value = data && data.value ? data.value : null;
  }
}
