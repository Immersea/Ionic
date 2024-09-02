import * as functions from "firebase-functions";
import {
  deleteMapData,
  updateEditorOf,
  updateMapData,
  REGION,
  MEMORY,
  TIMEOUT,
} from "./c-system";

const COLLECTIONNAME = "divingSchools";

export const updateDivingSchools = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(COLLECTIONNAME + "/{divingSchoolId}")
  .onWrite(async (change, context) => {
    const divingSchoolId = context.params.divingSchoolId;
    const divingSchool = change.after.data();
    const previousDivingSchool = change.before.data();
    if (change && change.after && change.after.data()) {
      //update or create
      return Promise.all([
        updateEditorOf(
          COLLECTIONNAME,
          divingSchoolId,
          divingSchool,
          previousDivingSchool
        ),
        createMapData(divingSchoolId, divingSchool),
      ]);
    } else {
      //delete
      return Promise.all([
        updateEditorOf(
          COLLECTIONNAME,
          divingSchoolId,
          null,
          previousDivingSchool
        ),
        deleteMapData(COLLECTIONNAME, divingSchoolId),
      ]);
    }
  });

const createMapData = async (divingSchoolId: string, divingSchool: any) => {
  const doc = {
    displayName: divingSchool.displayName,
    photoURL: divingSchool.photoURL,
    coverURL: divingSchool.coverURL,
    position: divingSchool.position,
    divingCourses: divingSchool.divingCourses,
  };
  return updateMapData(COLLECTIONNAME, divingSchoolId, doc);
};
