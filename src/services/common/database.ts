import { firestore } from "../../helpers/firebase";
import {
  DocumentData,
  Firestore,
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  DocumentReference,
  query,
  orderBy,
  limit,
  where,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  setDoc,
  startAt,
  endAt,
  WhereFilterOp,
  CollectionReference,
  Query,
  getDocFromCache,
} from "firebase/firestore";
import { BehaviorSubject, Observable } from "rxjs";
import { compareDates, listDifferences } from "../../helpers/utils";
import { StorageService } from "./storage";
import { USERPROFILECOLLECTION, UserService } from "./user";
import { SystemService } from "./system";
import { Environment } from "../../global/env";
import { Geopoint } from "geofire-common/dist/geofire-common/index.esm.js";
import {
  distanceBetween,
  geohashQueryBounds,
} from "geofire-common/dist/geofire-common/index.esm.js";
import { ProjectsService } from "../trasteel/refractories/projects";
import { DatasheetsService } from "../trasteel/refractories/datasheets";
import { ShapesService } from "../trasteel/refractories/shapes";
import { CustomersService } from "../trasteel/crm/customers";
import { DivingClassesService } from "../udive/divingClasses";
import { ServiceCentersService } from "../udive/serviceCenters";
import { DivingSchoolsService } from "../udive/divingSchools";
import { DiveSitesService } from "../udive/diveSites";
import { DiveCommunitiesService } from "../udive/diveCommunities";
import { DivingCentersService } from "../udive/divingCenters";
import { UDiveFilterService } from "../udive/ud-db-filter";
import { DivePlansService } from "../udive/divePlans";
import { NotificationsService } from "./notifications";
import { UserRoles } from "../../interfaces/common/user/user-roles";
import { UserSettings } from "../../interfaces/udive/user/user-settings";
import { UserProfile } from "../../interfaces/common/user/user-profile";
import { TrasteelFilterService } from "../trasteel/common/trs-db-filter";
import { ContactsService } from "../trasteel/crm/contacts";
//import {UserPlansService} from "../trasteel/crm/user-plans";
import { alertController } from "@ionic/core";
import { CallableFunctionsService } from "./callableFunctions";
import { FirebaseFilterCondition } from "../../interfaces/common/system/system";
import { isEqual, isNumber, toNumber } from "lodash";

export const PUBLICCOLLECTIONNAME = "public";
export const SETTINGSCOLLECTIONNAME = "settings";
export const ARCHIVECOLLECTIONNAME = "archive";
export const MAPDATACOLLECTION = "mapData";

const SHOWLOG = Environment.isDev();

/*
DATABASE EXPLANATIONS
- documents are stored in different collections
- each collection can have a short list of data inside the collection "mapData"
- mapData collection is updated automatically by server functions
- in order to avoid many calls of data, functions update the date of each mapData collection into a single document, stored inside system/preferences/collectionsUpdate
- the app receives continuous updates from the system/preferences/collectionsUpdate field. If it finds out that the last update of a collection is more recent than the local one, then it downloads the update of such collection.
*/

class DatabaseController {
  public db: Firestore;
  public detachListener: Function;
  userProfile: UserProfile;
  userRoles: UserRoles;
  userSettings: UserSettings;
  servicesStarted = false;
  mapDataOfflineDocName = "mapDataOffline";
  collectionOfflineDocName = "collectionOffline";

  //Initialize all services for each app
  initServices() {
    //start services for user roles updates
    if (!this.userRoles || !isEqual(this.userRoles, UserService.userRoles)) {
      if (UserService.userProfile && UserService.userProfile.uid) {
        this.userProfile = new UserProfile(UserService.userProfile);
      } else {
        this.userProfile = null;
      }
      if (UserService.userRoles && UserService.userRoles.uid) {
        this.userRoles = new UserRoles(UserService.userRoles);
      } else {
        this.userRoles = null;
      }
      if (UserService.userSettings && UserService.userSettings.uid) {
        this.userSettings = new UserSettings(UserService.userSettings);
      } else {
        this.userSettings = null;
      }

      if (
        this.userProfile &&
        this.userRoles &&
        this.userSettings &&
        this.servicesStarted
      ) {
        //init notification
        NotificationsService.init();

        if (Environment.isUdive() || Environment.isDecoplanner()) {
          DivePlansService.init(
            this.userProfile,
            this.userRoles,
            this.userSettings
          );
          //for decoplanner download userprofiles only for admins
          if (Environment.isDecoplanner() && this.userRoles.isUserAdmin()) {
            UDiveFilterService.initUser(this.userProfile);
          } else {
            UDiveFilterService.initUser(this.userProfile);
          }
        } else if (Environment.isTrasteel()) {
          //null
        }

        if (Environment.isUdive()) {
          DivingCentersService.init();
          DiveCommunitiesService.init();
          DiveSitesService.init();
          DivingSchoolsService.init();
          ServiceCentersService.init();
          DivingClassesService.init();
        } else if (Environment.isDecoplanner()) {
          //init nothing
        } else if (Environment.isTrasteel()) {
          CustomersService.init();
          ContactsService.init();
          ShapesService.init();
          DatasheetsService.init();
          ProjectsService.init();
          //UserPlansService.init();
        }
      }
    }
  }

  async forceRefreshMapData() {
    this.refreshMapData();
  }

  refreshMapData(forceRefresh = true) {
    //refresh map data
    if (Environment.isUdive()) {
      UDiveFilterService.downloadMapData(forceRefresh);
    } else if (Environment.isTrasteel()) {
      TrasteelFilterService.downloadMapData(forceRefresh);
    } else {
      //download nothing
    }
  }

  /*
   * FORCE MAPDATA UPDATE FROM DATABASE REAL DATA
   */

  async checkMapData(collectionId, localMapDataList, createMapDataFn) {
    //get all items
    SystemService.presentLoading("please-wait");
    const docs = await DatabaseService.getCollectionDocuments(collectionId);
    let realMapData = {};
    docs.forEach((doc) => {
      if (doc.id != "settings") {
        const data = doc.data();
        realMapData[doc.id] = createMapDataFn(doc.id, data);
        delete realMapData[doc.id].id;
      }
    });
    const localMapDataListObj = {};
    localMapDataList.map((item) => {
      const id = item.id;
      delete item.id;
      //remove rev from productName
      item.productName = item.productName
        ? item.productName.replace(/\s?\(rev[^)]*\)/g, "").trim()
        : null;
      localMapDataListObj[id] = item;
    });
    //get original mapData from server
    const serverMapData = await CallableFunctionsService.retrieveAndMergeDoc(
      MAPDATACOLLECTION,
      collectionId
    );
    const differencesRealVsLocal = listDifferences(
      realMapData,
      localMapDataListObj
    );
    const differencesLocalVsServer = listDifferences(
      localMapDataListObj,
      serverMapData
    );

    console.log(
      "checkMapData differences real vs local",
      Object.keys(realMapData).length - localMapDataList.length,
      Object.keys(differencesRealVsLocal).length,
      differencesRealVsLocal
    );
    console.log(
      "checkMapData differences local vs server",
      Object.keys(localMapDataList).length - Object.keys(serverMapData).length,
      Object.keys(differencesLocalVsServer).length,
      differencesLocalVsServer
    );

    const alert = await alertController.create({
      header: "MapData " + collectionId,
      message:
        Object.keys(realMapData).length !== localMapDataList.length
          ? "List: " +
            localMapDataList.length +
            " -> new MapData: " +
            Object.keys(realMapData).length +
            " - Update?"
          : "Same Length! Force Update?",
      buttons: [
        {
          text: "yes",
          handler: async () => {
            this.updateMapData(collectionId, realMapData);
          },
        },
        {
          text: "no",
        },
      ],
    });
    SystemService.dismissLoading();
    alert.present();
  }
  async updateMapData(collectionId, mapData) {
    let res = null;
    try {
      res = CallableFunctionsService.splitAndStoreDoc(
        MAPDATACOLLECTION,
        collectionId,
        null,
        null,
        mapData,
        false
      );
    } catch (error) {
      SystemService.presentAlertError(error);
    }
    try {
      //update system service
      CallableFunctionsService.updateSystemsDoc(collectionId);
    } catch (error) {
      SystemService.presentAlertError(error);
    }
    if (res) {
      SystemService.presentLoading("saved", false);
    } else {
      SystemService.presentLoading("error", false);
    }
  }

  /*
   * UPDATE LOCALLY MAPDATA BEFORE SERVER UPDATE
   */
  async updateMapDataOffline(collectionId: string, id: string, item?: any) {
    //update value in MapData
    if (this.getMapData()[collectionId]) {
      const collection = this.getMapData()[collectionId].collection;
      if (item) {
        const mapData = this.getMapDocs(collectionId).createMapData(id, item);
        //add-update
        collection[id] = mapData;
      } else {
        //delete
        delete collection[id];
      }
      //save reference of deleted or updated item for online updates of MapData
      let offlineDoc = await this.getLocalDocument(this.mapDataOfflineDocName);
      offlineDoc = offlineDoc ? offlineDoc : {};
      offlineDoc[this.getItemLocalName(collectionId, id)] = {
        collectionId: collectionId,
        docId: id,
        status: item ? "updated" : "deleted",
        item: item ? collection[id] : null,
      };

      this.saveLocalDocument(this.mapDataOfflineDocName, offlineDoc);
      //update local data for offline reloads
      this.saveLocalDocument(
        this.getItemLocalName(MAPDATACOLLECTION, collectionId),
        collection
      );
      this.refreshFilterDocuments(collectionId, collection);
    }
  }
  getMapDocs(collectionId) {
    if (Environment.isTrasteel()) {
      return TrasteelFilterService.getMapDocs(collectionId);
    } else {
      return UDiveFilterService.getMapDocs(collectionId);
    }
  }
  getMapData() {
    if (Environment.isTrasteel()) {
      return TrasteelFilterService.mapData;
    } else {
      return UDiveFilterService.mapData;
    }
  }
  updateCollectionOffline(
    collectionId: string,
    collectionData: any,
    collectionObs: any,
    id: string,
    item?: any
  ) {
    console.log("updateCollectionOffline", id, item);
    if (item) {
      collectionData[id] = item;
    } else {
      delete collectionData[id];
    }
    DatabaseService.saveLocalDocument(collectionId, collectionData);
    collectionObs.next(collectionData);
  }

  /*
   * during offline activity the updates are saved in a local document : this.mapDataOfflineDocName : this.collectionOfflineDocName
   * the function checks if the received data from the server already includes the offline activity, otherwise adds it in order not to change the user's screen with unwanted data
   * it also removes the offline data once it founds this inside the server data
   */
  async checkCollectionWithOfflineData(collectionId, data, mapData = true) {
    return new Promise(async (resolve) => {
      let offlineData = await this.getLocalDocument(
        mapData ? this.mapDataOfflineDocName : this.collectionOfflineDocName
      );
      offlineData = offlineData ? offlineData : {};
      //check only if data for the collection has been recently updated from network
      if (
        offlineData["recentUpdate"] &&
        offlineData["recentUpdate"][collectionId]
      ) {
        //scroll all data anche check
        for (const key of Object.keys(offlineData)) {
          const element = offlineData[key];
          if (element.collectionId && collectionId == element.collectionId) {
            const docId = element.docId;
            const status = element.status;
            const item = element.item;
            if (data[docId] && status == "updated") {
              //UPDATED
              //check if mapData does not have the updated item
              data[docId].id = docId;
              const plainData = Object.assign({}, data[docId]);
              if (plainData && isEqual(item, plainData)) {
                //present and equal - remove from local
                Environment.log("updated equal");
                delete offlineData[key];
              } else {
                //add or replace item in MapData
                Environment.log("updated replace");
                data[docId] = item;
              }
            } else {
              //DELETED
              //check if mapData still has the deleted item
              if (data[docId]) {
                //still present - remove
                Environment.log("deleted replace");
                delete data[docId];
              } else {
                //removed from local documents
                Environment.log("deleted equal");
                delete offlineData[key];
              }
            }
          }
          offlineData["recentUpdate"][collectionId] = false;
        }
        await this.saveLocalDocument(
          mapData ? this.mapDataOfflineDocName : this.collectionOfflineDocName,
          offlineData
        );
      }
      resolve(data);
    });
  }

  refreshFilterDocuments(collectionId, collection) {
    if (Environment.isTrasteel()) {
      return TrasteelFilterService.refreshFilterDocuments(
        collectionId,
        collection
      );
    } else {
      return UDiveFilterService.refreshFilterDocuments(
        collectionId,
        collection
      );
    }
  }

  async getCollectionDocuments(
    collectionId: string,
    limitBy?: number,
    orderByField?: string,
    orderByOrder?: "asc" | "desc"
  ): Promise<DocumentData> {
    let dbData = collection(firestore, collectionId);
    let queryData = query(
      dbData,
      orderByField ? orderBy(orderByField, orderByOrder) : null,
      limit ? limit(limitBy) : null
    );
    try {
      return await getDocs(queryData);
    } catch (error) {
      if (SHOWLOG) console.log("reading collection error", collectionId, error);
    }
  }

  async getDocumentObservable(collectionId, docId): Promise<Observable<any>> {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(firestore, collectionId, docId);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          //load first document into observable
          let observable$: BehaviorSubject<any> = new BehaviorSubject(
            docSnap.data()
          );
          //subscribe to document
          onSnapshot(docRef, (res) => {
            if (res.data() && Object.keys(res.data()).length > 0) {
              observable$.next(res.data());
            }
          }); //todo: unsubscribe
          if (SHOWLOG)
            console.log(
              "reading observable from firebase",
              collectionId,
              docId,
              docSnap.data()
            );
          resolve(observable$);
        } else {
          if (SHOWLOG)
            console.log("document does not exist", collectionId, docId);
          reject("document does not exist :" + collectionId + "-" + docId);
        }
      } catch (error) {
        if (SHOWLOG)
          console.log(
            "reading observable from firebase error",
            collectionId,
            docId,
            error
          );
        reject(error);
      }
    });
  }

  async getDocument(collectionId, docId, forceDownload = false) {
    //wait for system preferences to be loaded
    try {
      if (SystemService.systemPreferences) {
        if (
          SystemService.systemPreferences &&
          SystemService.systemPreferences.collectionsUpdate &&
          SystemService.systemPreferences.collectionsUpdate[docId]
        ) {
          //only for mapdata collections
          const localDocName = this.getItemLocalName(collectionId, docId);
          const localDocUpdated = localDocName + "_updated";
          let docUpdated = await this.getLocalDocument(localDocUpdated);
          let docLocal = await this.getLocalDocument(localDocName);
          //check last update date
          if (
            (docUpdated &&
              compareDates(
                docUpdated,
                SystemService.systemPreferences.collectionsUpdate[docId]
              ) < 0) ||
            forceDownload
          ) {
            let doc;
            if (collectionId == MAPDATACOLLECTION) {
              //download Mapdata from split doc service
              doc = await CallableFunctionsService.retrieveAndMergeDoc(
                MAPDATACOLLECTION,
                docId
              );
              //save recent update for offline check
              let offlineData = await this.getLocalDocument(
                this.mapDataOfflineDocName
              );
              offlineData = offlineData ? offlineData : {};
              offlineData["recentUpdate"] = offlineData["recentUpdate"]
                ? offlineData["recentUpdate"]
                : {};
              offlineData["recentUpdate"][docId] = true;
              await this.saveLocalDocument(
                this.mapDataOfflineDocName,
                offlineData
              );
            } else {
              //download other documents as standard
              doc = await this.getFirebaseDocument(collectionId, docId);
            }
            Environment.log("check last update date", [
              collectionId,
              docId,
              doc,
            ]);
            //save locally and update saved date
            if (doc) {
              this.saveLocalDocument(localDocName, doc);
              this.saveLocalDocument(localDocUpdated, new Date());
            }
            return doc;
          } else {
            Environment.log("no change - return local doc", [
              collectionId,
              docId,
              doc,
            ]);
            if (!docLocal) {
              //get document if no local document stored
              const doc = await this.getFirebaseDocument(collectionId, docId);
              //save locally and update saved date
              if (doc) {
                this.saveLocalDocument(localDocName, doc);
                this.saveLocalDocument(localDocUpdated, new Date());
              }
              return doc;
            } else {
              return docLocal;
            }
          }
        } else {
          //if no collection update date
          if (SHOWLOG)
            console.log("no collection update date", collectionId, docId);
          return await this.getFirebaseDocument(collectionId, docId);
        }
      } else {
        return false;
      }
    } catch (error) {
      SystemService.dismissLoading();
      SystemService.presentAlertError(error);
      return false;
    }
  }

  getItemLocalName(collectionId, docId) {
    return collectionId + "_" + docId;
  }

  async getFirebaseDocument(collectionId, docId): Promise<any> {
    function fetchWithTimeout(promise, ms) {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), ms)
      );
      return Promise.race([promise, timeout]);
    }

    function fetchDocumentWithTimeout(docRef) {
      return new Promise(async (resolve, reject) => {
        const network = await SystemService.getNetwork();
        //if no network then get from cache
        let timeoutDuration = 5000;
        if (!network) timeoutDuration = 0;
        try {
          // Try to fetch the document with a timeout
          const docSnap = await fetchWithTimeout(
            getDoc(docRef),
            timeoutDuration
          );

          if (docSnap.exists()) {
            resolve(docSnap.data());
          } else {
            reject({ message: "No such document exists online.", error: null });
          }
        } catch (error) {
          if (error.message === "Request timed out") {
            Environment.log(
              "Fetching document timed out. Attempting to fetch from cache..."
            );
            try {
              const cachedDocSnap = await getDocFromCache(docRef);

              if (cachedDocSnap.exists()) {
                resolve(cachedDocSnap.data());
              } else {
                reject({ message: "No such document in cache.", error: null });
              }
            } catch (cacheError) {
              reject({
                message: "Error fetching document from cache:",
                error: cacheError,
              });
            }
          }
        }
      });
    }
    return new Promise(async (resolve, reject) => {
      if (SHOWLOG)
        console.log("reading document from firebase", collectionId, docId);
      try {
        fetchDocumentWithTimeout(doc(firestore, collectionId, docId)).then(
          (res) => {
            resolve(res);
          },
          (err) => {
            if (SHOWLOG)
              console.log("document reading error1", collectionId, docId, err);
            if (
              err.error.name === "FirebaseError" &&
              err.error.code === "unavailable"
            ) {
              reject("You are offline and the document isn't cached locally.");
            } else {
              reject(err);
            }
          }
        );
      } catch (error) {
        if (SHOWLOG)
          console.log("reading document error2", collectionId, docId, error);
        reject(error);
      }
    });
  }

  async getDocumentsInArea(
    collectionId: string,
    lat: number,
    lng: number,
    radiusInKM: number
  ) {
    // Find cities within 50km of London
    const center = [lat, lng] as Geopoint;
    const radiusInM = radiusInKM * 1000;

    // Each item in 'bounds' represents a startAt/endAt pair. We have to issue
    // a separate query for each pair. There can be up to 9 pairs of bounds
    // depending on overlap, but in most cases there are 4.
    const bounds = geohashQueryBounds(center, radiusInM);
    const promises = [];
    for (const b of bounds) {
      const q = query(
        collection(firestore, collectionId),
        orderBy("position.geohash"),
        startAt(b[0]),
        endAt(b[1])
      );

      promises.push(getDocs(q));
    }

    // Collect all the query results together into a single list
    const snapshots = await Promise.all(promises);

    const matchingDocs = [];
    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        const lat = doc.get("lat");
        const lng = doc.get("lng");

        // We have to filter out a few false positives due to GeoHash
        // accuracy, but most will match
        const distanceInKm = distanceBetween([lat, lng], center);
        const distanceInM = distanceInKm * 1000;
        if (distanceInM <= radiusInM) {
          matchingDocs.push(doc);
        }
      }
    }
    return matchingDocs;
  }

  addDocument(
    collectionId,
    payload
  ): DocumentReference<DocumentData, DocumentData> {
    try {
      // Add a new document with a generated id
      const docRef = doc(collection(firestore, collectionId));
      setDoc(docRef, this.convertPayload(payload));
      //UserService.updateOfflineUserRolesEditorOf("owner", docRef.id);
      return docRef;
    } catch (error) {
      SystemService.presentAlertError(error);
    }
  }

  convertPayload(payload) {
    //check if position and save geopoint
    let position = null;
    if (payload.position && payload.position.geopoint) {
      position = payload.position;
    }
    payload = JSON.parse(JSON.stringify(payload));
    if (position) {
      payload.position = position;
    }
    return payload;
  }

  updateDocument(
    collectionId,
    docId,
    payload
  ): DocumentReference<DocumentData, DocumentData> {
    const docRef = doc(collection(firestore, collectionId), docId);
    payload = this.convertPayload(payload);
    try {
      //await updateDoc(docRef, payload);
      setDoc(docRef, this.convertPayload(payload));
      return docRef;
    } catch (error) {
      console.log("error", error);
      SystemService.presentAlertError(error);
    }
  }

  async updateUserSettingsDocument(uid, docId, payload) {
    const docRef = await doc(
      firestore,
      USERPROFILECOLLECTION,
      uid,
      SETTINGSCOLLECTIONNAME,
      docId
    );
    /*payload = JSON.parse(JSON.stringify(payload));
    try {
      CallableFunctionsService.splitAndStoreDoc(
        USERPROFILECOLLECTION,
        uid,
        SETTINGSCOLLECTIONNAME,
        docId,
        payload,
        false
      );
    } catch (error) {
      Environment.log("updateUserSettingsDocument error", error);
      SystemService.presentAlertError(error);
    }*/
    payload = JSON.parse(JSON.stringify(payload));
    try {
      await updateDoc(docRef, payload);
    } catch (error) {
      //document not created
      try {
        await setDoc(docRef, payload);
      } catch (error) {
        Environment.log("updateUserSettingsDocument error", error);
        SystemService.presentAlertError(error);
      }
    }
    return docRef;
  }

  /*async loadUserSettingsDocument(uid, docId) {
    try {
      const res = CallableFunctionsService.retrieveAndMergeDoc(
        USERPROFILECOLLECTION,
        uid,
        SETTINGSCOLLECTIONNAME,
        docId
      );
      return res;
    } catch (error) {
      Environment.log("loadUserSettingsDocument error", error);
      SystemService.presentAlertError(error);
      return null;
    }
  }*/

  async mergeWithDocument(collectionId, docId, payloadToMerge) {
    const docRef = await doc(firestore, collectionId, docId);
    //convert to general object for Firebase
    const objectPayload = this.convertPayload(payloadToMerge);
    try {
      await updateDoc(docRef, objectPayload);
    } catch (error1) {
      try {
        await setDoc(docRef, objectPayload);
      } catch (error2) {
        if (SHOWLOG)
          console.log(
            "mergeWithDocument error",
            collectionId,
            docId,
            payloadToMerge,
            error1,
            error2
          );
      }
    }
    return docRef;
  }

  async getDocumentCollection(collectionId, docId, subCollectionId, subDocId) {
    if (SHOWLOG)
      console.log(
        "reading document subcollection from firebase",
        collectionId,
        docId,
        subCollectionId,
        subDocId
      );
    try {
      const docRef = await getDoc(
        doc(firestore, collectionId, docId, subCollectionId, subDocId)
      );
      return docRef.data();
    } catch (error) {
      if (SHOWLOG)
        console.log("reading document error", collectionId, docId, error);
      return false;
    }
  }

  async getDocumentCollectionObservable(
    collectionId,
    docId,
    subCollectionId,
    subDocId
  ): Promise<Observable<any>> {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(
        firestore,
        collectionId,
        docId,
        subCollectionId,
        subDocId
      );
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          //load first document into observable
          let observable$: BehaviorSubject<any> = new BehaviorSubject(
            docSnap.data()
          );
          //subscribe to document
          onSnapshot(docRef, (res) => {
            if (res.data() && Object.keys(res.data()).length > 0) {
              observable$.next(res.data());
            }
          }); //todo: unsubscribe
          if (SHOWLOG)
            console.log(
              "reading collection observable from firebase",
              collectionId,
              docId,
              docSnap.data()
            );
          resolve(observable$);
        } else {
          if (SHOWLOG)
            console.log("document does not exist", collectionId, docId);
          reject("document does not exist :" + collectionId + "-" + docId);
        }
      } catch (error) {
        if (SHOWLOG)
          console.log(
            "reading observable from firebase error",
            collectionId,
            docId,
            error
          );
        reject(error);
      }
    });
  }

  async updateDocumentCollection(
    collectionId,
    docId,
    subCollectionId,
    subDocId,
    payload
  ) {
    let docRef = null;
    payload = this.convertPayload(payload);
    if (SHOWLOG)
      console.log(
        "updateDocumentCollection",
        collectionId,
        docId,
        subCollectionId,
        subDocId,
        payload
      );
    if (subDocId) {
      docRef = await doc(
        firestore,
        collectionId,
        docId,
        subCollectionId,
        subDocId
      );
      try {
        await updateDoc(docRef, payload);
      } catch (error) {
        console.log("updateDocumentCollection error", collectionId, docId);
      }
    } else {
      docRef = await addDoc(docRef, payload);
    }
    return docRef;
  }

  async deleteDocumentCollection(
    collectionId,
    docId,
    subCollectionId,
    subDocId
  ) {
    const docRef = await doc(
      firestore,
      collectionId,
      docId,
      subCollectionId,
      subDocId
    );
    try {
      await deleteDoc(docRef);
      this.deleteLocalDocument(docId);
    } catch (error) {
      console.log("deleteDocumentCollection error", collectionId, docId);
    }
    return docRef;
  }

  async deleteDocument(collectionId, docId, showLoading = true): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (showLoading) await SystemService.presentLoading("deleting", true);
      const docRef = doc(firestore, collectionId, docId);
      Environment.log("deleteDocument", [collectionId, docId]);
      try {
        deleteDoc(docRef);
        this.deleteLocalDocument(docId);
        StorageService.deletePhotoURLs(collectionId, docId);
        await SystemService.dismissLoading();
        resolve();
      } catch (error) {
        Environment.log("deleteDocument error", [collectionId, docId]);
        reject(error);
        await SystemService.dismissLoading();
      }
    });
  }

  async saveItem(id, item, userId, collectionId): Promise<DocumentReference> {
    await SystemService.presentLoading("updating");
    //check if offline
    let docRef = null;
    if (!id) {
      //set owner of new item
      item.users[userId] = ["owner"];
      docRef = this.addDocument(collectionId, item);
    } else {
      docRef = this.updateDocument(collectionId, id, item);
    }
    //update locally for faster feedback
    if (docRef.id) {
      //add item to collection for offline updating
      this.updateMapDataOffline(collectionId, docRef.id, item);
    }
    await SystemService.dismissLoading();
    setTimeout(() => {
      SystemService.presentLoading("saved", false);
    }, 100);
    return docRef;
  }

  async deleteItem(collectionId, id) {
    await DatabaseService.deleteDocument(collectionId, id);
    this.updateMapDataOffline(collectionId, id);
  }

  async saveLocalDocument(id: string, doc: any) {
    return localStorage.setItem(id, JSON.stringify(doc));
  }
  async getLocalDocument(id: string) {
    const doc = await localStorage.getItem(id);
    try {
      const parse = JSON.parse(doc);
      return parse;
    } catch (e) {
      return undefined;
    }
  }
  async deleteLocalDocument(id: string) {
    await localStorage.removeItem(id);
  }

  async clearLocalDocuments() {
    await localStorage.clear();
  }
  // Example usage
  // queryCollection('collectionId', ['field1', 'field2'], ['==', '!='], ['value1', 'value2'], 'or').then(results => console.log(results));
  async queryCollection(
    collectionId: string,
    searchFields: string[],
    searchOperators: string[],
    searchStrings: string[],
    logicOperator: "and" | "or" = "or" // Specify if it's 'and' or 'or'
  ) {
    // Map searchOperators to Firestore where filter operators
    const whereOperators: WhereFilterOp[] = searchOperators.map((operator) => {
      switch (operator) {
        case "=":
          return "==";
        case ">":
          return ">";
        case ">=":
          return ">=";
        case "<=":
          return "<=";
        case "<":
          return "<";
        case "!=":
          return "!=";
        default:
          throw new Error(`Unsupported operator: ${operator}`);
      }
    });

    const baseCollection: CollectionReference<DocumentData> = collection(
      firestore,
      collectionId
    );

    if (logicOperator === "and") {
      // Handle 'and' logic by combining all conditions in a single query
      let combinedQuery: Query<DocumentData> = baseCollection;
      for (let i = 0; i < searchFields.length; i++) {
        combinedQuery = query(
          combinedQuery,
          where(searchFields[i], whereOperators[i], searchStrings[i])
        );
      }
      const querySnapshot = await getDocs(combinedQuery);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return results;
    } else if (logicOperator === "or") {
      // Handle 'or' logic by running separate queries and merging results
      const promises = searchFields.map((field, index) => {
        const q = query(
          baseCollection,
          where(field, whereOperators[index], searchStrings[index])
        );
        return getDocs(q);
      });

      const querySnapshots = await Promise.all(promises);

      const results = new Map<string, DocumentData>();
      querySnapshots.forEach((snapshot) => {
        snapshot.forEach((doc) => {
          results.set(doc.id, { id: doc.id, ...doc.data() });
        });
      });

      return Array.from(results.values());
    } else {
      throw new Error(`Unsupported logic operator: ${logicOperator}`);
    }
  }

  // Define the filtering function
  // Function to filter documents based on multiple conditions
  /*// Example usage with multiple conditions
const conditions = [
  { field: 'majorFamilyId', operator: '=', value: 'bricks' },
  { field: 'properties', fieldName: 'name', valueName: 'mgo', operator: '<', value: 12, comparisonField: 'lower' },
  { field: 'properties', fieldName: 'name', valueName: 'al2o3', operator: '>', value: 85, comparisonField: 'lower' }
];

filterDocuments('yourCollectionId', conditions, 'and');  // Replace with your criteria*/
  async filterDocumentsOnConditions(
    collectionId,
    conditions: FirebaseFilterCondition[],
    logicalOperator: "and" | "or" = "and"
  ) {
    try {
      const colRef = collection(firestore, collectionId);
      const q = query(colRef);
      const querySnapshot = await getDocs(q);
      let filteredDocs = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const matches = conditions.map((condition: FirebaseFilterCondition) => {
          if (!condition.fieldName && !condition.valueName) {
            // Top-level field comparison
            const fieldValue = data[condition.field];
            return this.compare(
              fieldValue,
              condition.operator,
              condition.value
            );
          } else {
            // Nested array field comparison
            const properties = data[condition.field];
            if (Array.isArray(properties)) {
              const prop = properties.find(
                (p) => p[condition.fieldName] === condition.valueName
              );
              if (prop) {
                const fieldValue = prop[condition.comparisonField]; // either prop.lower or prop.higher
                return this.compare(
                  fieldValue,
                  condition.operator,
                  condition.value
                );
              }
            }
            return false;
          }
        });

        const match =
          logicalOperator === "and"
            ? matches.every(Boolean)
            : matches.some(Boolean);
        if (match) {
          data.id = doc.id;
          filteredDocs.push(data);
        }
      });

      return filteredDocs;
    } catch (error) {
      console.error("Error filtering documents:", error);
    }
  }
  // Comparison function
  compare(fieldValue, operator, value) {
    if (isNumber(value)) {
      //convert fieldValue
      fieldValue = toNumber(fieldValue);
    }
    switch (operator) {
      case "<":
        return fieldValue < value;
      case "<=":
        return fieldValue <= value;
      case ">":
        return fieldValue > value;
      case ">=":
        return fieldValue >= value;
      case "=":
        return fieldValue === value;
      default:
        return false;
    }
  }

  /*
  async queryCollection(
    collectionId: string,
    search: {
      field: string;
      operator: "!=" | ">" | ">=" | "<" | "<=" | "==";
      value: string | number;
    }[],
    filter: "and" | "or" = "and",
    orderBy = null,
    limit = null
  ) {
    //!=,<,<=,==
    const collectionRef = collection(firestore, collectionId);
    const searchQuery = [];
    search.map((item) => {
      searchQuery.push(where(item.field, item.operator, item.value));
    });
    const ref = query(collectionRef, filter, searchQuery, orderBy, limit);

    return await getDocs(ref);
  }*/
}

export const DatabaseService = new DatabaseController();
