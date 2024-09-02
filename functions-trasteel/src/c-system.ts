import * as admin from "firebase-admin";
import {Timestamp} from "firebase-admin/firestore";
import {isEqual, without} from "lodash";
import {
  deleteSplitDoc,
  retrieveAndMergeDoc,
  splitAndStoreDoc,
} from "./c-splitAndStoreDocuments";
//import {logData} from ".";

export const db = admin.firestore();
// update date in system preferences everytime the translations are updated
/* export const updateTranslationsData = functions
  .region("europe-west1")
  .runWith({ memory: "128MB", timeoutSeconds: 60 })
  .firestore.document("/translations/{translationId}")
  .onWrite(async (change, context) => {
    return updateSystemData("translations");
  }); */

export const REGION = "europe-west1";
export const MEMORY = "128MB";
export const TIMEOUT = 120;

export const SYSTEMCOLLECTION = "system";
export const MAPDATACOLLECTION = "mapData";
export const USERROLESCOLLECTION = "userRoles";
export const CHATSCOLLECTIONNAME = "chats";
export const CLIENTSCOLLECTIONNAME = "clients";
export const PREFERENCESDOC = "preferences";
export const TRANSLATIONSDOC = "translations";
export const SETTINGSCOLLECTIONNAME = "settings";
export const ARCHIVECOLLECTIONNAME = "archive";

export const updateSystemData = async (collectionId: string) => {
  const systemRef = db.doc(`/${SYSTEMCOLLECTION}/${PREFERENCESDOC}`);
  const systemDoc = await systemRef.get();
  let system = systemDoc.data();
  const newDoc = system ? false : true;
  system = system ? system : {};
  system.collectionsUpdate = system.collectionsUpdate
    ? system.collectionsUpdate
    : {};
  system.collectionsUpdate[collectionId] = Timestamp.fromDate(new Date());
  if (newDoc) {
    return systemRef.set(system);
  } else {
    return systemRef.update(system);
  }
};

export const updateEditorOf = async (
  collection: string,
  itemId: string,
  item: any,
  previousItem: any
) => {
  let promises: any[] = [];

  if (item) {
    // update or create item
    for (let index = 0; index < Object.keys(item.users).length; index++) {
      const uid = Object.keys(item.users)[index];
      // get all userids of owners and editors
      const userRolesRef = db.doc(`/${USERROLESCOLLECTION}/${uid}`);
      const userRolesDoc = await userRolesRef.get();
      if (userRolesDoc) {
        let userRolesData = userRolesDoc.data();
        // set EditorOf for this user
        if (!userRolesData) {
          userRolesData = {editorOf: {}};
        }
        if (!userRolesData.editorOf) userRolesData.editorOf = {};
        // update
        userRolesData.editorOf[itemId] = {
          collection: collection,
          roles: item.users[uid],
        };
        promises.push(userRolesRef.set(userRolesData));
      }
    }
  }

  // compare users and previous users to find deleted users
  if (previousItem) {
    for (
      let index = 0;
      index < Object.keys(previousItem.users).length;
      index++
    ) {
      const uid = Object.keys(previousItem.users)[index];
      // if item is null -> item has been deleted
      if (!item || !item.users[uid]) {
        // user has been removed
        const userRolesRef = db.doc(`/${USERROLESCOLLECTION}/${uid}`);
        const userRolesDoc = await userRolesRef.get();
        let userRolesData = userRolesDoc.data();
        if (!userRolesData) {
          userRolesData = {editorOf: {}};
        }
        if (!userRolesData.editorOf) userRolesData.editorOf = {};
        if (userRolesData.editorOf[itemId])
          delete userRolesData.editorOf[itemId];
        promises.push(userRolesRef.set(userRolesData));
      }
    }
  }

  return promises;
};

//  updates collections with summary of new/deleted items - like Dive Trips into userDiveTrips
export const updateItemSummary = async (
  collection: string,
  itemId: string,
  item: any,
  previousItem: any,
  itemDetailsFunction: any
) => {
  let promises: any[] = [];
  if (item) {
    // update or create item
    for (let index = 0; index < Object.keys(item.users).length; index++) {
      const uid = Object.keys(item.users)[index];
      // get all userids of owners and editors
      const collectionDocRef = db.doc(`/${collection}/${uid}`);
      const collectionDoc = await collectionDocRef.get();
      let collectionDocData = collectionDoc.data();
      // set EditorOf for this user
      if (!collectionDocData) collectionDocData = {};
      // update
      collectionDocData[itemId] = itemDetailsFunction(item);
      promises.push(collectionDocRef.set(collectionDocData));
    }
  }

  // compare users and previous users to find deleted users
  // valid also if item is deleted
  if (previousItem) {
    for (
      let index = 0;
      index < Object.keys(previousItem.users).length;
      index++
    ) {
      const uid = Object.keys(previousItem.users)[index];
      // if item is null -> item has been deleted
      if (!item || !item.users[uid]) {
        // item or user has been removed
        const collectionDocRef = db.doc(`/${collection}/${uid}`);
        const collectionDoc = await collectionDocRef.get();
        let collectionDocData = collectionDoc.data();
        if (!collectionDocData) {
          collectionDocData = {editorOf: {}};
        }
        if (!collectionDocData.editorOf) collectionDocData.editorOf = {};
        if (collectionDocData[itemId]) delete collectionDocData[itemId];
        promises.push(collectionDocRef.set(collectionDocData));
      }
    }
  }
  return promises;
};

export const updateMapData = async (
  collectionId: string,
  itemId: string,
  item: any
) => {
  return new Promise(async (resolve) => {
    await lockDocument(MAPDATACOLLECTION, collectionId, itemId, true);
    let promises: any[] = [];
    // update map data
    //get mapdata from docSplitRetrieve
    let mapData = await retrieveAndMergeDoc(
      MAPDATACOLLECTION,
      collectionId,
      null,
      null
    );
    const newDoc = mapData ? false : true;
    mapData = mapData ? mapData : {};
    if (newDoc) {
      //new mapData document
      // write new item and update date in system
      mapData[itemId] = item;
      promises = promises.concat(
        await splitAndStoreDoc(
          MAPDATACOLLECTION,
          collectionId,
          null,
          null,
          mapData,
          true
        )
      );
      promises.push(updateSystemData(collectionId));
    } else {
      // compare new item with previous and update only if different
      if (mapData[itemId] && !isEqual(item, mapData[itemId])) {
        // write new item and update date in system
        mapData[itemId] = item;
        promises = promises.concat(
          await splitAndStoreDoc(
            MAPDATACOLLECTION,
            collectionId,
            null,
            null,
            mapData,
            true
          )
        );
        promises.push(updateSystemData(collectionId));
      } else if (!mapData[itemId]) {
        // write new item and update date in system if new
        mapData[itemId] = item;

        promises = promises.concat(
          await splitAndStoreDoc(
            MAPDATACOLLECTION,
            collectionId,
            null,
            null,
            mapData,
            true
          )
        );
        promises.push(updateSystemData(collectionId));
      }
    }
    promises.push(lockDocument(MAPDATACOLLECTION, collectionId, itemId, false));
    resolve(promises);
  });
};

export const deleteMapData = async (
  collectionId: string,
  mapDataId: string
) => {
  return new Promise(async (resolve) => {
    await lockDocument(MAPDATACOLLECTION, collectionId, mapDataId, true);
    let promises: any[] = [];
    //get mapdata from docSplitRetrieve
    let mapData = await retrieveAndMergeDoc(
      MAPDATACOLLECTION,
      collectionId,
      null,
      null
    );
    if (!mapData) {
      mapData = {};
    }
    if (mapData[mapDataId]) {
      delete mapData[mapDataId];
      //check if last element
      if (Object.keys(mapData).length > 0) {
        promises = promises.concat(
          await splitAndStoreDoc(
            MAPDATACOLLECTION,
            collectionId,
            null,
            null,
            mapData,
            true
          )
        );
      } else {
        //delete mapData
        promises = promises.concat(
          await deleteSplitDoc(
            MAPDATACOLLECTION,
            collectionId,
            null,
            null,
            1,
            true
          )
        );
      }
      promises.push(updateSystemData(collectionId));
    }
    promises.push(
      lockDocument(MAPDATACOLLECTION, collectionId, mapDataId, false)
    );
    resolve(promises);
  });
};

const lockDocument = async (
  collectionId: string, //MAPDATA
  docId: string, //CollectionId for mapdata
  subDocId: string, //for document sequence
  lock: boolean
) => {
  return new Promise(async (resolve) => {
    //check locking document
    const docName = collectionId + "-" + docId;
    const docRef = admin.firestore().collection("lockDocuments").doc(docName);
    try {
      // Function to check if the document is locked, with a timeout
      async function waitForUnlock(docRef: any, maxWaitTime: number) {
        const startTime = Date.now();
        let locked = true;
        while (locked) {
          const docSnapshot = await docRef.get();
          const data = docSnapshot.data();
          if (!data || !data.locked) {
            locked = false;
          } else {
            //check sequence
            if (subDocId && data.sequence && subDocId == data.sequence[0]) {
              locked = false;
              return true;
            }
            // Check if maximum wait time has been exceeded
            if (Date.now() - startTime > maxWaitTime) {
              return false; // Indicate that the document did not unlock in time
            }
            // Wait for a short period before checking again (e.g., 1000ms)
            await new Promise((res) => setTimeout(res, 1000));
          }
        }
        return true; // Indicate that the document is unlocked
      }

      // Maximum wait time in milliseconds (e.g., 119 seconds) - max 120 timeout function
      const maxWaitTime = 120000;

      if (lock) {
        // Lock the document
        // Check if the document exists
        const docSnapshot = await docRef.get();
        let locked = {locked: true, sequence: [subDocId]};
        if (docSnapshot.exists) {
          let data = docSnapshot.data();
          if (data && data.sequence) {
            data.locked = true;
            data.sequence.push(subDocId);
          } else {
            data = locked;
          }
          // Document exists, perform an update
          await docRef.update(data);
        } else {
          // Document does not exist, create it
          await docRef.set(locked);
        }
        // Wait until the document is unlocked or the maximum wait time is exceeded
        if (await waitForUnlock(docRef, maxWaitTime)) {
          resolve(null);
        } else {
          throw new Error(
            "Maximum wait time exceeded, aborting operation -> docId:" +
              subDocId
          );
        }
      } else {
        //check if sequence is empty and remove current doc
        const docSnapshot = await docRef.get();
        let data = docSnapshot.data();
        if (data && data.sequence) {
          data.sequence = without(data.sequence, subDocId);
          data.locked = data.sequence.length > 0;
        } else {
          data = {locked: false};
        }
        await docRef.update(data);
        resolve(null);
      }
    } catch (error) {
      console.error("Error:", error);
      // Always release the lock, even if there is an error
      await docRef.update({locked: false});
      resolve(null);
    }
  });
};

export const executePromisesInSequence = async (promises: any[]) => {
  for (const promise of promises) {
    try {
      if (typeof promise === "function") {
        await Promise.resolve(promise());
      } else {
        await Promise.resolve(promise);
      }
    } catch (error) {
      console.error("executePromisesInSequence", error);
    }
  }
  return {message: "Finished"};
};
