import * as functions from "firebase-functions";
import {
  deleteMapData,
  updateMapData,
  REGION,
  MEMORY,
  TIMEOUT,
  executePromisesInSequence,
} from "./c-system";
//import {logData} from ".";

export const DATASHEETSCOLLECTIONNAME = "datasheets";

export const updateDatasheets = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(DATASHEETSCOLLECTIONNAME + "/{id}")
  .onWrite(async (change, context) => {
    const id = context.params.id;
    if (change && change.after && change.after.data()) {
      //update or create
      const datasheet = change.after.data();
      let executePromises: any[] = [];
      /*executePromises = executePromises.concat(updateEditorOf(
         DATASHEETSCOLLECTIONNAME,
          id,
          datasheet,
          change.before.data()
        ))*/
      executePromises = executePromises.concat(
        await createMapData(id, datasheet)
      );
      return await executePromisesInSequence(executePromises);
    } else {
      //delete
      let executePromises: any[] = [];
      /*executePromises = executePromises.concat(updateEditorOf(
         DATASHEETSCOLLECTIONNAME,
          id,
          null,
          change.before.data()
        ))*/
      executePromises = executePromises.concat(
        await deleteMapData(DATASHEETSCOLLECTIONNAME, id)
      );
      return await executePromisesInSequence(executePromises);
    }
  });

const createMapData = async (id: string, datasheet: any) => {
  const doc = {
    familyId: datasheet.familyId,
    techNo: datasheet.techNo,
    revisionNo: datasheet.revisionNo,
    oldProduct: datasheet.oldProduct,
    productName: datasheet.productName,
  };
  return await updateMapData(DATASHEETSCOLLECTIONNAME, id, doc);
};
