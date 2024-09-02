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

export const CONTACTSCOLLECTIONNAME = "contacts";

export const updateContacts = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(CONTACTSCOLLECTIONNAME + "/{id}")
  .onWrite(async (change, context) => {
    const id = context.params.id;
    if (change && change.after && change.after.data()) {
      //update or create
      const datasheet = change.after.data();
      let executePromises: any[] = [];
      /*executePromises = executePromises.concat(updateEditorOf(
         CONTACTSCOLLECTIONNAME,
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
         CONTACTSCOLLECTIONNAME,
          id,
          null,
          change.before.data()
        ))*/
      executePromises = executePromises.concat(
        await deleteMapData(CONTACTSCOLLECTIONNAME, id)
      );
      return await executePromisesInSequence(executePromises);
    }
  });

const createMapData = async (id: string, contact: any) => {
  //get contact locations
  const doc = {
    firstName: contact.firstName,
    lastName: contact.lastName,
    customerId: contact.customerId,
    photoURL: contact.photoURL,
    coverURL: contact.coverURL,
  };
  return await updateMapData(CONTACTSCOLLECTIONNAME, id, doc);
};
