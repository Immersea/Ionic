import {DatabaseService, MAPDATACOLLECTION} from "../common/database";
import {SearchTag, CollectionGroup} from "../../interfaces/interfaces";
import {TranslationService} from "../common/translations";
import {each, orderBy} from "lodash";
import {BehaviorSubject} from "rxjs";
import {USERPUBLICPROFILECOLLECTION, UserService} from "../common/user";
import {DivingClassesService} from "./divingClasses";
import {DiveSitesService, DIVESITESCOLLECTION} from "./diveSites";
import {DIVECENTERSSCOLLECTION, DivingCentersService} from "./divingCenters";
import {DIVESCHOOLSSCOLLECTION, DivingSchoolsService} from "./divingSchools";
import {
  SERVICECENTERSCOLLECTION,
  ServiceCentersService,
} from "./serviceCenters";
import {
  DIVECOMMUNITIESCOLLECTION,
  DiveCommunitiesService,
} from "./diveCommunities";
import {Environment} from "../../global/env";

export const CLIENTSCOLLECTIONNAME = "clients";

class UDiveFilterController {
  database: any;
  mapData: CollectionGroup;
  user: any;
  searchFilters: any[] = [];
  mapDataSub$: BehaviorSubject<CollectionGroup>;

  async init() {
    await TranslationService.init();
    this.mapData = this.getMapDocs();
    this.mapDataSub$ = new BehaviorSubject(this.mapData);
    this.downloadMapData();
  }

  //collects all mapData documents to visualise on the maps or list in the main dashboard
  //add new mapData collections that needs to be loaded at start
  //filteredcollection is used to show points on the map
  getMapDocs(id?): CollectionGroup {
    if (Environment.isUdive()) {
      let collections = {
        divingCenters: {
          name: TranslationService.getTransl(
            "diving-centers",
            "Diving Centers"
          ),
          icon: {
            type: "mapicon",
            name: "map-icon-boating",
            color: "divingcenter",
          },
          collection: undefined,
          collectionSub$: new BehaviorSubject(<any>[]),
          createMapData: () => undefined,
          filteredCollection: {},
          fieldsToQuery: ["displayName", "email"],
          query: true,
        },
        diveCommunities: {
          name: TranslationService.getTransl(
            "dive-communities",
            "Dive Communities"
          ),
          icon: {
            type: "ionicon",
            name: "people-circle",
            color: "divecommunity",
          },
          collection: undefined,
          collectionSub$: new BehaviorSubject(<any>[]),
          createMapData: () => undefined,
          filteredCollection: {},
          fieldsToQuery: ["displayName"],
          query: true,
        },
        diveSites: {
          name: TranslationService.getTransl("diving-sites", "Diving Sites"),
          icon: {
            type: "udiveicon",
            name: "udive-icon-diver",
            color: "divesite",
          },
          collection: undefined,
          collectionSub$: new BehaviorSubject(<any>[]),
          createMapData: () => undefined,
          filteredCollection: {},
          fieldsToQuery: ["displayName", "type"],
          query: true,
        },
        divingSchools: {
          name: TranslationService.getTransl(
            "diving-schools",
            "Diving Schools"
          ),
          icon: {
            type: "ionicon",
            name: "school",
            color: "school",
          },
          collection: undefined,
          collectionSub$: new BehaviorSubject(<any>[]),
          createMapData: () => undefined,
          filteredCollection: {},
          fieldsToQuery: ["displayName", "email", "divingCourses"],
          query: true,
        } /*
        serviceCenters: {
          name: TranslationService.getTransl(
            "service-center",
            "Service Center"
          ),
          icon: {
            type: "ionicon",
            name: "build",
            color: "servicecenter",
          },
          collection: undefined,
          collectionSub$: new BehaviorSubject(<any>[]),
          createMapData: null,
          filteredCollection: {},
          fieldsToQuery: ["displayName", "email"],
          query: true,
        },*/,
      };
      collections = this.getUserProfileCollections(collections);
      if (id) {
        return collections[id];
      } else {
        return collections;
      }
    } else if (Environment.isDecoplanner()) {
      return this.getUserProfileCollections({});
    } else {
      return {};
    }
  }

  getUserProfileCollections(collections) {
    if (this.user && this.user.uid) {
      if (
        Environment.isUdive() ||
        (Environment.isDecoplanner() && UserService.userRoles.isUserAdmin())
      ) {
        //allow inside UDive or only for User Admins in Decoplanner
        collections[USERPUBLICPROFILECOLLECTION] = {
          name: TranslationService.getTransl("divers", "Divers"),
          icon: {
            type: "ionicon",
            name: "person",
            color: "divers",
          },
          collection: undefined,
          collectionSub$: new BehaviorSubject(<any>[]),
          createMapData: () => undefined,
          filteredCollection: {},
          fieldsToQuery: ["displayName", "cards"],
          query: true,
        };
      }
    }
    return collections;
  }

  initUser(user) {
    this.user = user;
    //add publicprofiles to mapData
    this.mapData = this.getMapDocs();
    this.downloadMapData();
  }

  sendMapData() {
    this.mapDataSub$ ? this.mapDataSub$.next(this.mapData) : undefined;
  }

  //updates collections of map data from database - updated at each system update from app-root
  downloadMapData(forceDownload = true) {
    //create all promises to get collection documents
    if (this.mapData)
      Object.keys(this.mapData).map((key) => {
        DatabaseService.getDocument(MAPDATACOLLECTION, key, forceDownload).then(
          (collection) => {
            switch (key) {
              case DIVESITESCOLLECTION:
                collection = DiveSitesService.getMapData(collection);
                break;
              case DIVECENTERSSCOLLECTION:
                collection = DivingCentersService.getMapData(collection);
                break;
              case DIVECOMMUNITIESCOLLECTION:
                collection = DiveCommunitiesService.getMapData(collection);
                break;
              case DIVESCHOOLSSCOLLECTION:
                collection = DivingSchoolsService.getMapData(collection);
                break;
              case USERPUBLICPROFILECOLLECTION:
                collection = UserService.getMapData(collection);
                break;
              case SERVICECENTERSCOLLECTION:
                collection = ServiceCentersService.getMapData(collection);
                break;
            }
            this.refreshFilterDocuments(key, collection);
          },
          () => {
            //empty collections
            this.refreshFilterDocuments(key, {});
          }
        );
      });
  }

  filterDocuments(filters: SearchTag[] = []) {
    //check if there is any query filter
    //reset query to all collections
    this.resetDocumentsQuery(
      filters.find((item) => item.type == "filter") == undefined
    );
    this.searchFilters = [];
    if (filters) {
      filters.forEach((filter) => {
        if (filter.type == "filter") {
          //query collections
          this.mapData[filter.name].query = true;
        } else {
          this.searchFilters.push(filter.name);
        }
      });
      Object.keys(this.mapData).map(async (collectionId) => {
        this.refreshFilterDocuments(collectionId);
      });
    }
  }

  //refresh documents after each update of the data
  async refreshFilterDocuments(collectionId, data?) {
    const collection = this.mapData[collectionId];
    if (data) {
      //check received data with local offline
      collection.collection =
        await DatabaseService.checkCollectionWithOfflineData(
          collectionId,
          data
        );
    }
    if (collection.query) {
      if (this.searchFilters.length > 0) {
        collection.filteredCollection = {};
        collection.fieldsToQuery.forEach((field) => {
          each(collection.collection, (document, key) => {
            //search field inside document and filter
            this.searchFilters.forEach((filter) => {
              //string filters
              if (field == "displayName" || field == "email") {
                if (
                  document[field] &&
                  document[field].toLowerCase().search(filter.toLowerCase()) !=
                    -1
                ) {
                  collection.filteredCollection[key] = document;
                }
              }
              //filter for dive sites type
              if (field == "type") {
                //search string in dive site type
                //search in the original tag and also in translation
                if (
                  document[field] &&
                  (document[field].toLowerCase().search(filter.toLowerCase()) >
                    -1 ||
                    DiveSitesService.getSiteTypeName(document[field])
                      .toLowerCase()
                      .search(filter.toLowerCase()) > -1)
                ) {
                  collection.filteredCollection[key] = document;
                }
              }
              //filter for user cards or diving schools courses
              if (field == "cards" || field == "divingCourses") {
                //search string in card agency or certification
                if (document[field] && document[field].length > 0) {
                  document[field].forEach(async (course) => {
                    const details =
                      DivingClassesService.getCourseDetails(course);
                    if (
                      details &&
                      (details.agency.name
                        .toLowerCase()
                        .search(filter.toLowerCase()) > -1 ||
                        details.course.name
                          .toLowerCase()
                          .search(filter.toLowerCase()) > -1)
                    ) {
                      collection.filteredCollection[key] = document;
                    }
                  });
                }
              }
            });
          });
        });
      } else {
        collection.filteredCollection = collection.collection;
      }
    } else {
      //reset previous search
      collection.filteredCollection = {};
    }
    this.sendMapData();
  }

  getCollectionArray(collection): any {
    if (
      this.mapData &&
      this.mapData[collection] &&
      this.mapData[collection].collection
    ) {
      let collectionArray = [];
      Object.keys(this.mapData[collection].collection).forEach((id) => {
        let item = this.mapData[collection].collection[id];
        item.id = id;
        collectionArray.push(item);
      });
      collectionArray = orderBy(
        collectionArray,
        this.getMapDocs(collection).orderBy
      );
      return collectionArray;
    } else {
      return [];
    }
  }

  resetDocumentsQuery(value: boolean) {
    this.mapData = each(this.mapData, (collection) => {
      collection.query = value;
    });
  }

  /*async filterCollections(filters: SearchTag[]) {
    //check if there is any query filter
    //reset query to all collections
    this.resetCollectionsQuery(
      filters.find(item => item.type == "filter") == undefined
    );
    var searchFilters = [];
    filters.forEach(filter => {
      if (filter.type == "filter") {
        //query collections
        this.collectionsToQuery[filter.name].query = true;
      } else {
        searchFilters.push(filter.name);
      }
    });
    var snapshots = [];
    //filter collections
    each(this.collectionsToQuery, collection => {
      if (collection.query) {
        if (searchFilters.length > 0) {
          collection.fieldsToQuery.forEach(field => {
            searchFilters.forEach(filter => {
              const snapshot = collection.collection
                .orderBy(field)
                .startAt(filter)
                .endAt("\uf8ff")
                .get();
              snapshots.push(snapshot);
            });
          });
        } else {
          const snapshot = collection.collection.get();
          snapshots.push(snapshot);
        }
      }
    });
    var queryDB = await Promise.all(snapshots);
    var queryResults = {};
    queryDB.forEach(snapshot => {
      snapshot.forEach(doc => {
        queryResults[doc.id] = doc.data();
      });
    });
    return console.log("queryResults", queryResults);
  }

  resetCollectionsQuery(value: boolean) {
    this.collectionsToQuery = each(this.collectionsToQuery, collection => {
      collection.query = value;
    });
  }*/
}

export const UDiveFilterService = new UDiveFilterController();
