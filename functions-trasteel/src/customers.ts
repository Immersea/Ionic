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

export const CUSTOMERSCOLLECTIONNAME = "customers";

export const updateCustomers = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(CUSTOMERSCOLLECTIONNAME + "/{id}")
  .onWrite(async (change, context) => {
    const id = context.params.id;
    if (change && change.after && change.after.data()) {
      //update or create
      const datasheet = change.after.data();
      let executePromises: any[] = [];
      /*executePromises = executePromises.concat(updateEditorOf(
         CUSTOMERSCOLLECTIONNAME,
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
         CUSTOMERSCOLLECTIONNAME,
          id,
          null,
          change.before.data()
        ))*/
      executePromises = executePromises.concat(
        await deleteMapData(CUSTOMERSCOLLECTIONNAME, id)
      );
      return await executePromisesInSequence(executePromises);
    }
  });

const createMapData = async (id: string, customer: any) => {
  //get customer locations
  const locations: any[] = [];
  customer.locations.forEach((location: any) => {
    locations.push({
      type: location.type,
      country: location.location.address.country,
      position: location.position,
    });
  });
  const doc = {
    fullName: customer.fullName,
    photoURL: customer.photoURL,
    locations: locations,
  };
  return await updateMapData(CUSTOMERSCOLLECTIONNAME, id, doc);
};
