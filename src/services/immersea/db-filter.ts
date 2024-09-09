import {DatabaseService, MAPDATACOLLECTION} from "../common/database";
import {SearchTag, CollectionGroup} from "../../interfaces/interfaces";
import {TranslationService} from "../common/translations";
import {each, orderBy, sortBy} from "lodash";
import {BehaviorSubject} from "rxjs";
import {
  IMMERSEALOCATIONSCOLLECTION,
  ImmerseaLocationsService,
} from "./immerseaLocations";

class ImmerseaFilterController {
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

  getMapDocs(): CollectionGroup {
    let collections = {
      immerseaLocations: {
        name: TranslationService.getTransl("location", "Location"),
        icon: {
          type: "ionicon",
          name: "location",
          color: "immersea",
        },
        collection: undefined,
        collectionSub$: new BehaviorSubject(<any>[]),
        createMapData: null,
        filteredCollection: {},
        fieldsToQuery: ["displayName"],
        query: true,
      },
    };

    return collections;
  }

  sendMapData() {
    this.mapDataSub$ ? this.mapDataSub$.next(this.mapData) : undefined;
  }

  //updates collections of map data from database - updated at each system update from app-root
  downloadMapData() {
    //create all promises to get collection documents
    if (this.mapData)
      Object.keys(this.mapData).map((key) => {
        DatabaseService.getDocument(MAPDATACOLLECTION, key).then(
          (collection) => {
            switch (key) {
              case IMMERSEALOCATIONSCOLLECTION:
                collection = ImmerseaLocationsService.getMapData(collection);
                break;
            }
            this.refreshFilterDocuments(key, collection);
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
      Object.keys(this.mapData).map(async (key) => {
        this.refreshFilterDocuments(key);
      });
    }
  }

  //refresh documents after each update of the data
  refreshFilterDocuments(collectionId, data?) {
    const collection = this.mapData[collectionId];
    data ? (collection.collection = data) : undefined;
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
      if (collection == IMMERSEALOCATIONSCOLLECTION) {
        return this.getSortedLocations();
      } else {
        let collectionArray = [];
        Object.keys(this.mapData[collection].collection).forEach((id) => {
          let item = this.mapData[collection].collection[id];
          item.id = id;
          collectionArray.push(item);
        });
        collectionArray = orderBy(collectionArray, "displayName");
        return collectionArray;
      }
    } else {
      return [];
    }
  }

  getSortedLocations(): any {
    if (
      this.mapData &&
      this.mapData["immerseaLocations"] &&
      this.mapData["immerseaLocations"].collection
    ) {
      const sections = {};
      const collection = this.mapData["immerseaLocations"].collection;
      Object.keys(collection).forEach((id) => {
        const item = collection[id];
        item.sections.map((section) => {
          if (!sections[section]) sections[section] = {};
          sections[section][item.id] = item;
        });
      });
      //order items in array
      Object.keys(sections).forEach((section) => {
        const items = sections[section];
        const array = [];
        Object.keys(items).forEach((id) => {
          array.push(items[id]);
        });
        //overwrite with array
        sections[section] = sortBy(array, "order");
      });
      return sections;
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

export const ImmerseaFilterService = new ImmerseaFilterController();
