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

export const PROJECTSCOLLECTIONNAME = "projects";

export const updateProjects = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(PROJECTSCOLLECTIONNAME + "/{id}")
  .onWrite(async (change, context) => {
    const id = context.params.id;
    if (change && change.after && change.after.data()) {
      //update or create
      const datasheet = change.after.data();
      let executePromises: any[] = [];
      /*executePromises = executePromises.concat(updateEditorOf(
         PROJECTSCOLLECTIONNAME,
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
         PROJECTSCOLLECTIONNAME,
          id,
          null,
          change.before.data()
        ))*/
      executePromises = executePromises.concat(
        await deleteMapData(PROJECTSCOLLECTIONNAME, id)
      );
      return await executePromisesInSequence(executePromises);
    }
  });

const createMapData = async (id: string, project: any) => {
  const doc = {
    projectLocalId: project.projectLocalId,
    projectDescription: project.projectDescription,
    customerId: project.customerId,
  };
  return await updateMapData(PROJECTSCOLLECTIONNAME, id, doc);
};
