import * as admin from "firebase-admin";
import _ from "lodash";
//import moment from "moment";
//import functions from "firebase-functions";

export const db = admin.firestore();
//update date in system preferences everytime the translations are updated
/*export const updateTranslationsData = functions
  .region("europe-west1")
  .runWith({ memory: "128MB", timeoutSeconds: 60 })
  .firestore.document("/translations/{translationId}")
  .onWrite(async (change, context) => {
    return updateSystemData("translations");
  });*/

export const REGION = "europe-west1";
export const MEMORY = "128MB";
export const TIMEOUT = 60;

export const SYSTEMCOLLECTION = "system";
export const MAPDATACOLLECTION = "mapData";
export const USERROLESCOLLECTION = "userRoles";
export const CHATSCOLLECTIONNAME = "chats";
export const CLIENTSCOLLECTIONNAME = "clients";
export const PREFERENCESDOC = "preferences";
export const TRANSLATIONSDOC = "translations";
export const SETTINGSCOLLECTIONNAME = "settings";
export const ARCHIVECOLLECTIONNAME = "archive";

export const TRIPSCOLLECTIONNAME = "diveTrips";
export const CLASSESCOLLECTIONNAME = "divingClasses";
export const DIVINGAGENCIESDOC = "divingAgencies";

export const updateSystemData = async (collectionId: string) => {
  const systemRef = db.doc(`/${SYSTEMCOLLECTION}/${PREFERENCESDOC}`);
  const systemDoc = await systemRef.get();
  let system = systemDoc.data();
  const newDoc = system ? false : true;
  system = system ? system : {};
  system.collectionsUpdate = system.collectionsUpdate
    ? system.collectionsUpdate
    : {};
  system.collectionsUpdate[collectionId] = new Date();
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
  const promises: any[] = [];

  if (item) {
    // update or create item
    for (const uid of Object.keys(item.users)) {
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
    for (const uid of Object.keys(previousItem.users)) {
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

  return Promise.all(promises);
};

//updates collections with summary of new/deleted items - like Dive Trips into userDiveTrips
export const updateItemSummary = async (
  collection: string,
  itemId: string,
  item: any,
  previousItem: any,
  itemDetailsFunction: any
) => {
  const promises: any[] = [];
  if (item) {
    // update or create item
    for (const uid of Object.keys(item.users)) {
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
    for (const uid of Object.keys(previousItem.users)) {
      // if item is null -> item has been deleted
      if (!item || !item.users[uid]) {
        // user has been removed
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
  return Promise.all(promises);
};

export const updateMapData = async (
  collectionId: string,
  itemId: string,
  item: any
) => {
  const promises = [];
  // update map data
  const mapDataRef = db.doc(`/${MAPDATACOLLECTION}/` + collectionId);
  const mapDataDoc = await mapDataRef.get();
  let mapData = mapDataDoc.data();
  const newDoc = mapData ? false : true;
  mapData = mapData ? mapData : {};

  if (newDoc) {
    // write new item and update date in system
    mapData[itemId] = item;
    promises.push(mapDataRef.set(mapData));
    promises.push(updateSystemData(collectionId));
  } else {
    // compare new item with previous and update only if different
    if (mapData[itemId] && !_.isEqual(item, mapData[itemId])) {
      // write new item and update date in system
      mapData[itemId] = item;
      promises.push(mapDataRef.update(mapData));
      promises.push(updateSystemData(collectionId));
    } else if (!mapData[itemId]) {
      // write new item and update date in system if new
      mapData[itemId] = item;
      promises.push(mapDataRef.update(mapData));
      promises.push(updateSystemData(collectionId));
    }
  }
  return Promise.all(promises);
};

export const deleteMapData = async (
  collectionId: string,
  mapDataId: string
) => {
  const promises = [];
  const mapDataRef = db.doc(`/${MAPDATACOLLECTION}/${collectionId}`);
  const mapDataDoc = await mapDataRef.get();
  let mapData = mapDataDoc.data();
  if (!mapData) {
    mapData = {};
  }
  if (mapData[mapDataId]) {
    delete mapData[mapDataId];
    //check if last element
    if (Object.keys(mapData).length > 0) {
      promises.push(mapDataRef.set(mapData));
    } else {
      //delete mapData
      promises.push(mapDataRef.delete());
    }
    promises.push(updateSystemData(collectionId));
  }
  return Promise.all(promises);
};

//archive old bookings
/*
  archiveData(
    `/${BEACHESCOLLECTIONNAME}/${beachId}/${BOOKINGSCOLLECTION}/`,
    BOOKINGSCOLLECTION,
    "day",
    "dateFrom",
    true
  )
*/
/*
export const archiveData = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onCall(async (data) => {
    const path = data.path;
    const docName = data.docName;
    const groupByDate = data.groupByDate;
    const groupByField = data.groupByField;
    const archiveByDate = data.archiveByDate;
    return archiveFunction(
      path,
      docName,
      groupByDate,
      groupByField,
      archiveByDate
    );
  });

export const archiveFunction = async (
  path: string,
  docName: string,
  groupByDate: string,
  groupByField: string,
  archiveByDate: boolean
) => {
  //
  //groupByDate = "week" / "month" / "day";
  //groupByField = fieldname to be grouped
  //archiveByDate = true-> group by date / false-> create only archive group
  //current date/week/month is excluded, archive only past dates
  const promises = [];
  const docRef = db.doc(path + docName);
  const doc = await docRef.get();
  //insert id inside each object
  const docData = _.map(doc.data(), (x, key) => {
    x.key = key;
    return x;
  });
  //group ids
  let archive = {};
  archive = _.groupBy(docData, (x) => {
    const date = moment(new Date(x[groupByField]));
    const currentYear = moment(new Date()).year();
    if (groupByDate === "week") {
      const week = date.isoWeek();
      const year = date.year();
      const currentWeek = moment(new Date()).isoWeek();
      if (year >= currentYear && week >= currentWeek) {
        return docName;
      } else {
        if (archiveByDate) {
          return year + "_" + week;
        } else {
          return "archive";
        }
      }
    } else if (groupByDate === "month") {
      const month = date.month();
      const year = date.year();
      const currentMonth = moment(new Date()).month();
      if (year >= currentYear && month >= currentMonth) {
        return docName;
      } else {
        if (archiveByDate) {
          return year + "_" + (month + 1);
        } else {
          return "archive";
        }
      }
    } else {
      const day = date.dayOfYear();
      const year = date.year();
      const currentDay = moment(new Date()).dayOfYear();
      if (year >= currentYear && day >= currentDay) {
        return docName;
      } else {
        if (archiveByDate) {
          return year + "_" + day;
        } else {
          return "archive";
        }
      }
    }
  });
  
  //check if archive[docName] exists otherwise create new empty to delete old archive data
  if (!archive[docName]) {
    archive[docName] = {};
  }

  //save all archives
  for (const date of Object.keys(archive)) {
    //create object from archive array
    archive[date] = _.keyBy(archive[date], "key");
    //remove key
    for (const key of Object.keys(archive[date])) {
      delete archive[date][key].key;
    }
    const archiveDocRef = db.doc(path + date);
    //check if existing data only for archived data
    let dataToSave = {};
    if (date !== docName) {
      const dateDoc = await archiveDocRef.get();
      const dateDocData = dateDoc.data();
      if (dateDocData) {
        dataToSave = dateDocData;
      }
      //update data
      for (const key of Object.keys(archive[date])) {
        dataToSave[key] = archive[date][key];
      }
    } else {
      dataToSave = archive[date];
    }
    dataToSave = archive[date];
    promises.push(archiveDocRef.set(dataToSave));
  }

  return await Promise.all(promises);
};*/
