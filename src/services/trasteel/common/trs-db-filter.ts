import {DatabaseService, MAPDATACOLLECTION} from "../../common/database";
import {SearchTag, CollectionGroup} from "../../../interfaces/interfaces";
import {TranslationService} from "../../common/translations";
import {each, orderBy} from "lodash";
import {BehaviorSubject} from "rxjs";
import {CUSTOMERSCOLLECTION, CustomersService} from "../crm/customers";
import {SHAPESCOLLECTION, ShapesService} from "../refractories/shapes";
import {
  DATASHEETSCOLLECTION,
  DatasheetsService,
} from "../refractories/datasheets";
import {PROJECTSCOLLECTION, ProjectsService} from "../refractories/projects";
import {CONTACTSCOLLECTION, ContactsService} from "../crm/contacts";
import {USERPUBLICPROFILECOLLECTION, UserService} from "../../common/user";

class TrasteelFilterController {
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
  getMapDocs(id?) {
    let collections = {
      [CUSTOMERSCOLLECTION]: {
        name: TranslationService.getTransl("customers", "Customers"),
        icon: {
          type: "ionicon",
          name: "business-outline",
          color: "trasteel",
        },
        collection: undefined,
        collectionSub$: new BehaviorSubject(<any>[]),
        createMapData: CustomersService.createMapData,
        filteredCollection: {},
        fieldsToQuery: ["fullName"],
        orderBy: ["fullName"],
        query: true,
      },
      [CONTACTSCOLLECTION]: {
        name: TranslationService.getTransl("contacts", "Contacts"),
        icon: {
          type: "ionicon",
          name: "person-outline",
          color: "trasteel",
        },
        collection: undefined,
        collectionSub$: new BehaviorSubject(<any>[]),
        createMapData: ContactsService.createMapData,
        filteredCollection: {},
        fieldsToQuery: ["lastName"],
        orderBy: ["lastName", "firstName"],
        query: true,
      },
      [SHAPESCOLLECTION]: {
        name: TranslationService.getTransl("shapes", "Shapes"),
        icon: {
          type: "ionicon",
          name: "extension-puzzle-outline",
          color: "trasteel",
        },
        collection: undefined,
        collectionSub$: new BehaviorSubject(<any>[]),
        createMapData: ShapesService.createMapData,
        filteredCollection: {},
        fieldsToQuery: ["shapeName"],
        orderBy: ["shapeName"],
        query: true,
      },
      [DATASHEETSCOLLECTION]: {
        name: TranslationService.getTransl("datasheets", "Datasheets"),
        icon: {
          type: "ionicon",
          name: "library-outline",
          color: "trasteel",
        },
        collection: undefined,
        collectionSub$: new BehaviorSubject(<any>[]),
        createMapData: DatasheetsService.createMapData,
        filteredCollection: {},
        fieldsToQuery: ["productName"],
        orderBy: ["productName"],
        query: true,
      },
      [PROJECTSCOLLECTION]: {
        name: TranslationService.getTransl("projects", "Projects"),
        icon: {
          type: "ionicon",
          name: "settings-outline",
          color: "trasteel",
        },
        collection: undefined,
        collectionSub$: new BehaviorSubject(<any>[]),
        createMapData: ProjectsService.createMapData,
        filteredCollection: {},
        fieldsToQuery: ["docsCaption", "projectDescription"],
        orderBy: ["projectDescription"],
        query: true,
      },
      [USERPUBLICPROFILECOLLECTION]: {
        name: TranslationService.getTransl("userprofiles", "User Profiles"),
        icon: {
          type: "ionicon",
          name: "person-outline",
          color: "trasteel",
        },
        collection: undefined,
        collectionSub$: new BehaviorSubject(<any>[]),
        createMapData: UserService.createUserPublicMapData,
        filteredCollection: {},
        fieldsToQuery: ["displayName", "email"],
        orderBy: ["displayName"],
        query: true,
      },
    };
    if (id) {
      return collections[id];
    } else {
      return collections;
    }
  }

  sendMapData() {
    this.mapDataSub$ ? this.mapDataSub$.next(this.mapData) : undefined;
  }

  //updates collections of map data from database - updated at each system update from app-root
  downloadMapData(forceDownload = true) {
    //create all promises to get collection documents
    //download data for Trasteel only if user is loggedin, otherwise no access to documents
    if (this.mapData && UserService.isLoggedin()) {
      Object.keys(this.mapData).map((key) => {
        DatabaseService.getDocument(MAPDATACOLLECTION, key, forceDownload).then(
          (collection) => {
            switch (key) {
              case CUSTOMERSCOLLECTION:
                collection = CustomersService.getMapData(collection);
                break;
              case CONTACTSCOLLECTION:
                collection = ContactsService.getMapData(collection);
                break;
              case SHAPESCOLLECTION:
                collection = ShapesService.getMapData(collection);
                ShapesService.downloadShapeSettings();
                break;
              case DATASHEETSCOLLECTION:
                collection = DatasheetsService.getMapData(collection);
                DatasheetsService.downloadDatasheetSettings();
                break;
              case PROJECTSCOLLECTION:
                collection = ProjectsService.getMapData(collection);
                ProjectsService.downloadProjectSettings();
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
              if (field == "fullName") {
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

  async filterCollection() {}
}

export const TrasteelFilterService = new TrasteelFilterController();
