import * as functions from "firebase-functions";
import {
  deleteMapData,
  updateEditorOf,
  updateMapData,
  REGION,
  MEMORY,
  TIMEOUT,
} from "./c-system";

const COLLECTIONNAME = "serviceCenters";

export const updateServiceCenters = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(COLLECTIONNAME + "/{serviceCenterId}")
  .onWrite(async (change, context) => {
    const serviceCenterId = context.params.serviceCenterId;
    const serviceCenter = change.after.data();
    const previousServiceCenter = change.before.data();
    if (change && change.after && change.after.data()) {
      //update or create
      return Promise.all([
        updateEditorOf(
          COLLECTIONNAME,
          serviceCenterId,
          serviceCenter,
          previousServiceCenter
        ),
        createMapData(serviceCenterId, serviceCenter),
      ]);
    } else {
      //delete
      return Promise.all([
        updateEditorOf(
          COLLECTIONNAME,
          serviceCenterId,
          null,
          previousServiceCenter
        ),
        deleteMapData(COLLECTIONNAME, serviceCenterId),
      ]);
    }
  });

const createMapData = async (serviceCenterId: string, serviceCenter: any) => {
  const doc = {
    displayName: serviceCenter.displayName,
    photoURL: serviceCenter.photoURL,
    coverURL: serviceCenter.coverURL,
    position: serviceCenter.position,
  };
  return updateMapData(COLLECTIONNAME, serviceCenterId, doc);
};
