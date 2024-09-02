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

export const SHAPESCOLLECTIONNAME = "shapes";

export const updateShapes = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(SHAPESCOLLECTIONNAME + "/{id}")
  .onWrite(async (change, context) => {
    const id = context.params.id;
    if (change && change.after && change.after.data()) {
      //update or create
      const datasheet = change.after.data();
      let executePromises: any[] = [];
      /*executePromises = executePromises.concat(updateEditorOf(
         SHAPESCOLLECTIONNAME,
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
         SHAPESCOLLECTIONNAME,
          id,
          null,
          change.before.data()
        ))*/
      executePromises = executePromises.concat(
        await deleteMapData(SHAPESCOLLECTIONNAME, id)
      );
      return await executePromisesInSequence(executePromises);
    }
  });

const createMapData = async (id: string, shape: any) => {
  const doc = {
    shapeTypeId: shape.shapeTypeId,
    shapeName: shape.shapeName,
  };
  return await updateMapData(SHAPESCOLLECTIONNAME, id, doc);
};
