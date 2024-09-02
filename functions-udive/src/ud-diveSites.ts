import * as functions from "firebase-functions";
import {
  deleteMapData,
  updateEditorOf,
  updateMapData,
  REGION,
  MEMORY,
  TIMEOUT,
} from "./c-system";

export const SITESCOLLECTIONNAME = "diveSites";

export const updateDiveSites = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(SITESCOLLECTIONNAME + "/{diveSiteId}")
  .onWrite(async (change, context) => {
    const diveSiteId = context.params.diveSiteId;
    if (change && change.after && change.after.data()) {
      //update or create
      const diveSite = change.after.data();
      return Promise.all([
        updateEditorOf(
          SITESCOLLECTIONNAME,
          diveSiteId,
          diveSite,
          change.before.data()
        ),
        createMapData(diveSiteId, diveSite),
      ]);
    } else {
      //delete
      return Promise.all([
        updateEditorOf(
          SITESCOLLECTIONNAME,
          diveSiteId,
          null,
          change.before.data()
        ),
        deleteMapData(SITESCOLLECTIONNAME, diveSiteId),
      ]);
    }
  });

const createMapData = async (diveSiteId: string, diveSite: any) => {
  //get configurations  stdName
  const stdNames: any[] = [];
  for (const plan of diveSite.divePlans) {
    stdNames.push(plan.configuration.stdName);
  }

  const doc = {
    displayName: diveSite.displayName,
    photoURL: diveSite.photoURL,
    coverURL: diveSite.coverURL,
    type: diveSite.type,
    divePlans: stdNames,
    divingCenters: diveSite.divingCenters ? diveSite.divingCenters : [],
    position: diveSite.position,
  };
  return updateMapData(SITESCOLLECTIONNAME, diveSiteId, doc);
};
