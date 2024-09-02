import {Validator} from "./validator";
import {
  DIVECENTERSSCOLLECTION,
  DivingCentersService,
} from "../services/udive/divingCenters";
import {
  SERVICECENTERSCOLLECTION,
  ServiceCentersService,
} from "../services/udive/serviceCenters";
import {
  DIVESCHOOLSSCOLLECTION,
  DivingSchoolsService,
} from "../services/udive/divingSchools";
import {
  DIVECOMMUNITIESCOLLECTION,
  DiveCommunitiesService,
} from "../services/udive/diveCommunities";

export function getUniqueIdValidator(type, index?, list?): Validator<string> {
  let uniqueid = true;
  if (type == "list") {
    uniqueid = false;
  }
  return {
    validate: (id: string) => {
      let valid = false;
      if (type === DIVECOMMUNITIESCOLLECTION) {
        valid =
          DiveCommunitiesService.diveCommunitiesList.findIndex(
            (x) => x.id === id
          ) == -1;
      } else if (type === DIVECENTERSSCOLLECTION) {
        valid =
          DivingCentersService.divingCentersList.findIndex(
            (x) => x.id === id
          ) == -1;
      } else if (type === SERVICECENTERSCOLLECTION) {
        valid =
          ServiceCentersService.serviceCentersList.findIndex(
            (x) => x.id === id
          ) == -1;
      } else if (type === DIVESCHOOLSSCOLLECTION) {
        valid =
          DivingSchoolsService.divingSchoolsList.findIndex(
            (x) => x.id === id
          ) == -1;
      } else if (type === "list") {
        valid = list.findIndex((x) => x[index] === id) == -1;
      } else {
        valid = true;
      }
      if (uniqueid) {
        valid = valid && /[a-z0-9-]+/.test(id);
        valid = valid && id.length >= 5 && id.length <= 16;
      }

      return valid;
    },
    errorMessage: {
      tag: "validators-uniqueid",
      text:
        "This Unique ID is not valid or already taken." +
        (uniqueid
          ? "It must be between 5 and 16 characters length and include only letters, numbers or dashes."
          : ""),
    },
  };
}
