import * as functions from "firebase-functions";
import {
  deleteMapData,
  updateEditorOf,
  updateMapData,
  REGION,
  MEMORY,
  TIMEOUT,
  db,
} from "./c-system";

import {SITESCOLLECTIONNAME} from "./ud-diveSites";

export const DCCOLLECTIONNAME = "divingCenters";

export const updateDivingCenters = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(DCCOLLECTIONNAME + "/{divingCenterId}")
  .onWrite(async (change, context) => {
    const divingCenterId = context.params.divingCenterId;
    const divingCenter: any = change.after.data();
    const previousDivingCenter = change.before.data();
    if (change && change.after && change.after.data()) {
      //update or create

      return Promise.all([
        updateEditorOf(
          DCCOLLECTIONNAME,
          divingCenterId,
          divingCenter,
          previousDivingCenter
        ),
        updateDiveSitesWithDivingCenter(
          divingCenterId,
          divingCenter.diveSites,
          previousDivingCenter ? previousDivingCenter.diveSites : null
        ),
        createMapData(divingCenterId, divingCenter),
      ]);
    } else {
      //delete
      return Promise.all([
        updateEditorOf(
          DCCOLLECTIONNAME,
          divingCenterId,
          null,
          previousDivingCenter
        ),
        updateDiveSitesWithDivingCenter(
          divingCenterId,
          null,
          previousDivingCenter ? previousDivingCenter.diveSites : null
        ),
        deleteMapData(DCCOLLECTIONNAME, divingCenterId),
      ]);
    }
  });

const updateDiveSitesWithDivingCenter = async (
  divingCenterId: any,
  diveSites: any,
  previousDiveSites: any
) => {
  let promises = [];
  if (diveSites) {
    //update or create item
    promises = diveSites.map(async (diveSiteId: any) => {
      const diveSiteRef = db.doc(`/${SITESCOLLECTIONNAME}/${diveSiteId}`);
      const diveSiteDoc = await diveSiteRef.get();
      const diveSiteData = diveSiteDoc.data();
      if (diveSiteData && !diveSiteData.divingCenters)
        diveSiteData.divingCenters = [];
      //update
      if (
        diveSiteData &&
        !diveSiteData.divingCenters.includes(divingCenterId)
      ) {
        diveSiteData.divingCenters.push(divingCenterId);
        return diveSiteRef.set(diveSiteData);
      } else {
        return true;
      }
    });
  }

  //compare center and previous center to find deleted sites
  if (previousDiveSites) {
    previousDiveSites.map(async (diveSiteId: any) => {
      //if item is null -> item has been deleted
      if (!diveSites || !diveSites.includes(diveSiteId)) {
        //site has been removed
        const diveSiteRef = db.doc(`/${SITESCOLLECTIONNAME}/${diveSiteId}`);
        const diveSiteDoc = await diveSiteRef.get();
        const diveSiteData = diveSiteDoc.data();
        if (diveSiteData) {
          const index = diveSiteData.divingCenters.findIndex(
            (item: any) => item === diveSiteId
          );
          diveSiteData.divingCenters.splice(index, 1);
          promises.push(diveSiteRef.set(diveSiteData));
        }
      }
    });
  }

  return Promise.all(promises);
};

const createMapData = async (divingCenterId: string, divingCenter: any) => {
  const doc = {
    displayName: divingCenter.displayName,
    photoURL: divingCenter.photoURL,
    coverURL: divingCenter.coverURL,
    position: divingCenter.position,
    diveSites: divingCenter.diveSites,
  };
  return updateMapData(DCCOLLECTIONNAME, divingCenterId, doc);
};
