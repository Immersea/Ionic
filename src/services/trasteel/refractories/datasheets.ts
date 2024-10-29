import { alertController, popoverController } from "@ionic/core";
import { DatabaseService, SETTINGSCOLLECTIONNAME } from "../../common/database";
import { TranslationService } from "../../common/translations";
import { TrasteelFilterService } from "../common/trs-db-filter";
import { cloneDeep, isNumber, max, orderBy, toNumber, toString } from "lodash";
import { RouterService } from "../../common/router";
import { BehaviorSubject } from "rxjs";
import {
  Datasheet,
  DatasheetCategory,
  DatasheetFamily,
  DatasheetFilter,
  DatasheetMajorFamily,
  DatasheetPropertyName,
  DatasheetPropertyType,
  DatasheetQualityColorCode,
  DatasheetSettings,
  MapDataDatasheet,
} from "../../../interfaces/trasteel/refractories/datasheets";
import { UserService } from "../../common/user";
import {
  Project,
  ProjectAreaQuality,
} from "../../../interfaces/trasteel/refractories/projects";
import { XLSXExportService } from "./xlsExport";
import { FirebaseFilterCondition } from "../../../interfaces/common/system/system";
import { SystemService } from "../../common/system";

export const DATASHEETSCOLLECTION = "datasheets";

export class DatasheetsController {
  datasheetsList: MapDataDatasheet[] = [];
  datasheetMajorFamilies: DatasheetMajorFamily[] = [];
  datasheetFamilies: DatasheetFamily[] = [];
  datasheetCategories: DatasheetCategory[] = [];
  datasheetPropertyTypes: DatasheetPropertyType[] = [];
  datasheetPropertyNames: DatasheetPropertyName[] = [];
  datasheetQualityColorCodes: DatasheetQualityColorCode[] = [];
  datasheetsList$: BehaviorSubject<MapDataDatasheet[]> = new BehaviorSubject(
    []
  );
  serviceInit = true;

  //initialise this service inside app-root at the start of the app
  init() {
    //init only once
    if (this.serviceInit) {
      this.serviceInit = false;
      TrasteelFilterService.mapDataSub$.subscribe(() => {
        const collection =
          TrasteelFilterService.getCollectionArray(DATASHEETSCOLLECTION);
        if (collection && collection.length > 0) {
          this.datasheetsList = collection;
          //update name with OLD product
          this.datasheetsList.forEach((item) => {
            if (item.oldProduct) {
              !item.productName.includes("rev")
                ? (item.productName =
                    item.productName + " (rev." + item.revisionNo + ")")
                : undefined;
            }
          });
          this.datasheetsList$.next(this.datasheetsList);
        } else {
          this.datasheetsList$.next([]);
        }
      });
      this.downloadDatasheetSettings();
    }
  }

  getMapData(collection) {
    const result = {};
    if (collection && Object.keys(collection)) {
      Object.keys(collection).forEach((item) => {
        result[item] = new MapDataDatasheet(collection[item]);
      });
    }
    return result;
  }

  async presentDatasheetUpdate(id?) {
    return await RouterService.openModal("modal-datasheet-update", {
      datasheetId: id,
    });
  }

  async duplicateDatasheet(id, revision) {
    const ds = await this.getDatasheet(id);
    return await RouterService.openModal("modal-datasheet-update", {
      duplicateDatasheet: { id: id, datasheet: ds },
      revision: revision,
    });
  }

  async presentDatasheetDetails(id) {
    RouterService.push("/" + DATASHEETSCOLLECTION + "/" + id, "forward");
  }

  async getDatasheet(id): Promise<Datasheet> {
    const ds = await DatabaseService.getDocument(DATASHEETSCOLLECTION, id);
    const datasheet = new Datasheet(ds);
    return datasheet;
  }

  getDatasheetName(id): string {
    return this.datasheetsList.find((a) => a.id == id)
      ? this.datasheetsList.find((a) => a.id == id).productName
      : id + " missing!";
  }

  async updateDatasheet(id, datasheet, userId) {
    //remove empty properties
    const properties = [];
    datasheet.properties.forEach((property) => {
      if (property.type && property.name) {
        properties.push(property);
      }
    });
    datasheet.properties = properties;
    return DatabaseService.saveItem(
      id,
      datasheet,
      userId,
      DATASHEETSCOLLECTION
    );
  }

  async deleteDatasheet(id, goBack = true): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const confirm = await alertController.create({
        header: TranslationService.getTransl(
          "delete-datasheet-header",
          "Delete Datasheet?"
        ),
        message: TranslationService.getTransl(
          "delete-datasheet-message",
          "This datasheet will be deleted! Are you sure?"
        ),
        buttons: [
          {
            text: TranslationService.getTransl("cancel", "Cancel"),
            role: "cancel",
            handler: () => {
              reject();
            },
          },
          {
            text: TranslationService.getTransl("ok", "OK"),
            handler: async () => {
              DatabaseService.deleteItem(DATASHEETSCOLLECTION, id);
              if (goBack) RouterService.goBack();
              resolve(null);
            },
          },
        ],
      });
      confirm.present();
    });
  }

  getDatasheetsDetails(familyId: string): MapDataDatasheet {
    if (this.datasheetsList.length > 0) {
      return this.datasheetsList.find(
        (datasheet) => datasheet.familyId == familyId
      );
    } else {
      return null;
    }
  }

  getDatasheetsById(datasheetId: string): MapDataDatasheet {
    if (this.datasheetsList.length > 0) {
      return this.datasheetsList.find(
        (datasheet) => datasheet.id == datasheetId
      );
    } else {
      return null;
    }
  }

  exportDatasheets(datasheets: Datasheet[]) {
    const project = new Project();
    project.projectLocalId = "export";
    datasheets.forEach((datasheet) => {
      const projectAreaQuality = new ProjectAreaQuality();
      projectAreaQuality.datasheetId = datasheet["datasheetId"];
      project.projectAreaQuality.push(projectAreaQuality);
    });
    XLSXExportService.exportDatasheets(project);
  }

  async checkMapData() {
    DatabaseService.checkMapData(
      DATASHEETSCOLLECTION,
      this.datasheetsList,
      (id, datasheet) => this.createMapData(id, datasheet)
    );
  }

  createMapData(id, datasheet: Datasheet) {
    return new MapDataDatasheet({
      id: id,
      familyId: datasheet.familyId,
      techNo: datasheet.techNo,
      revisionNo: datasheet.revisionNo,
      oldProduct: datasheet.oldProduct,
      productName: datasheet.productName,
    });
  }

  async openSelectDataSheet(selectedItem?): Promise<MapDataDatasheet> {
    return new Promise(async (resolve) => {
      const modal = await RouterService.openModal("modal-search-list", {
        list: this.datasheetsList.filter((x) => x.oldProduct == false),
        searchTitle: { tag: "datasheet", text: "Datasheet" },
        item: selectedItem,
        showField: "productName",
        filterBy: ["productName", "familyId", "techNo", "majorFamilyId"],
        orderBy: ["productName"],
        placeholder: "Search by product, family or tech#",
        filterObject: new DatasheetFilter(),
        filterPopup: this.openDatasheetFilter,
        filterFunction: this.filterDatasheets,
      });
      modal.onDidDismiss().then(async (ev) => {
        if (ev) {
          resolve(ev.data);
        }
      });
      modal.present();
    });
  }

  getMaxDatasheetTechNo(): string {
    const techNos = [];
    this.datasheetsList.forEach((list) => {
      const num = list.techNo;
      if (isNumber(toNumber(num))) {
        techNos.push(toNumber(num));
      }
    });
    const maxVal = max(techNos) + 1;
    return maxVal ? toString(maxVal) : null;
  }

  async openDatasheetFilter(filter: DatasheetFilter): Promise<DatasheetFilter> {
    return new Promise(async (resolve, reject) => {
      const popover = await popoverController.create({
        component: "popover-datasheets-filter",
        componentProps: { filter },
        event: null,
        translucent: true,
      });
      popover.onDidDismiss().then(async (ev) => {
        if (ev && ev.data) {
          resolve(ev.data);
        } else {
          reject();
        }
      });
      popover.present();
    });
  }

  async filterDatasheets(filter: DatasheetFilter): Promise<MapDataDatasheet[]> {
    const searchFields = [];
    const searchOperators = [];
    const searchStrings = [];
    Object.keys(filter).map((key) => {
      if (
        key != "oldProduct" &&
        key != "properties" &&
        (filter[key] != null || filter[key] > 0)
      ) {
        searchFields.push(key);
        searchOperators.push("=");
        searchStrings.push(filter[key]);
      }
    });
    if (filter.properties.length == 0) {
      //basic search
      if (searchFields.length > 0) {
        const datasheets = await DatabaseService.queryCollection(
          DATASHEETSCOLLECTION,
          searchFields,
          searchOperators,
          searchStrings
        );
        const mapDataDatasheet = [];
        datasheets.forEach((ds) => {
          const datasheet = new Datasheet(ds);
          mapDataDatasheet.push(
            DatasheetsService.createMapData(ds.id, datasheet)
          );
        });
        return mapDataDatasheet;
      } else {
        return null;
      }
    } else {
      //advanced search
      const firebaseFilters = cloneDeep(filter.properties);
      if (filter.majorFamilyId) {
        firebaseFilters.push(
          new FirebaseFilterCondition({
            field: "majorFamilyId",
            operator: "=",
            value: filter.majorFamilyId,
          })
        );
      }
      if (filter.familyId) {
        firebaseFilters.push(
          new FirebaseFilterCondition({
            field: "familyId",
            operator: "=",
            value: filter.familyId,
          })
        );
      }
      const res = await DatabaseService.filterDocumentsOnConditions(
        DATASHEETSCOLLECTION,
        firebaseFilters
      );
      const filteredMapDataDatasheets = [];
      if (res && res.length > 0) {
        res.forEach((ds) => {
          filteredMapDataDatasheets.push(new MapDataDatasheet(ds));
        });
      }
      return orderBy(filteredMapDataDatasheets, "productName");
    }
  }

  /*
  SUB-COLLECTIONS & SETTINGS
  */

  async downloadDatasheetSettings(
    showLoading = false
  ): Promise<DatasheetSettings> {
    let settings = new DatasheetSettings();
    if (UserService.isLoggedin()) {
      //download if user logged in
      try {
        if (showLoading)
          SystemService.replaceLoadingMessage(
            "Downloading datasheet settings..."
          );
        settings = await DatabaseService.getDocument(
          DATASHEETSCOLLECTION,
          SETTINGSCOLLECTIONNAME
        );
      } catch (error) {}
    }
    const datasheetMajorFamilies = [];
    if (settings.datasheetMajorFamilies)
      settings.datasheetMajorFamilies.forEach((datasheetMajorFamily) => {
        datasheetMajorFamilies.push(
          new DatasheetMajorFamily(datasheetMajorFamily)
        );
      });
    this.datasheetMajorFamilies = orderBy(datasheetMajorFamilies, [
      "majorFamilyName",
    ]);
    const datasheetFamilies = [];
    if (settings.datasheetFamilies)
      settings.datasheetFamilies.forEach((datasheetFamily) => {
        datasheetFamilies.push(new DatasheetFamily(datasheetFamily));
      });
    this.datasheetFamilies = orderBy(datasheetFamilies, ["familyName"]);
    const datasheetCategories = [];
    if (settings.datasheetCategories)
      settings.datasheetCategories.forEach((datasheetCategory) => {
        datasheetCategories.push(new DatasheetCategory(datasheetCategory));
      });
    this.datasheetCategories = orderBy(datasheetCategories, ["categoriesName"]);
    const datasheetPropertyTypes = [];
    if (settings.datasheetPropertyTypes)
      settings.datasheetPropertyTypes.forEach((datasheetPropertyType) => {
        datasheetPropertyTypes.push(
          new DatasheetPropertyType(datasheetPropertyType)
        );
      });
    this.datasheetPropertyTypes = orderBy(datasheetPropertyTypes, ["typeName"]);
    const datasheetPropertyNames = [];
    if (settings.datasheetPropertyNames)
      settings.datasheetPropertyNames.forEach((datasheetPropertyName) => {
        datasheetPropertyNames.push(
          new DatasheetPropertyName(datasheetPropertyName)
        );
      });
    this.datasheetPropertyNames = orderBy(datasheetPropertyNames, [
      "position",
      "nameName",
    ]);
    const datasheetQualityColorCodes = [];
    if (settings.datasheetQualityColorCodes)
      settings.datasheetQualityColorCodes.forEach(
        (datasheetQualityColorCode) => {
          datasheetQualityColorCodes.push(
            new DatasheetQualityColorCode(datasheetQualityColorCode)
          );
        }
      );
    this.datasheetQualityColorCodes = orderBy(datasheetQualityColorCodes, [
      "qualityColorCodeName",
    ]);
    return settings;
  }

  getDatasheetMajorFamilies(id?): DatasheetMajorFamily[] {
    if (id) {
      const datasheetMajorFamilies = this.datasheetMajorFamilies.find(
        (x) => x.majorFamilyId == id
      );
      return datasheetMajorFamilies ? [datasheetMajorFamilies] : null;
    } else {
      return orderBy(this.datasheetMajorFamilies, ["majorFamilyName"], "asc");
    }
  }

  getDatasheetFamilies(id?): DatasheetFamily[] {
    if (this.datasheetFamilies)
      if (id) {
        const datasheetFamilies = this.datasheetFamilies.find(
          (x) => x.familyId == id
        );
        return datasheetFamilies ? [datasheetFamilies] : null;
      } else {
        return orderBy(this.datasheetFamilies, ["familyName"], "asc");
      }
  }

  getDatasheetCategories(id?): DatasheetCategory[] {
    if (id) {
      const datasheetCategories = this.datasheetCategories.find(
        (x) => x.categoriesId == id
      );
      return datasheetCategories ? [datasheetCategories] : null;
    } else {
      return orderBy(this.datasheetCategories, ["categoriesName"], "asc");
    }
  }

  getDatasheetPropertyTypes(id?): DatasheetPropertyType[] {
    if (id) {
      const datasheetPropertyTypes = this.datasheetPropertyTypes.find(
        (x) => x.typeId == id
      );
      return datasheetPropertyTypes ? [datasheetPropertyTypes] : null;
    } else {
      return orderBy(this.datasheetPropertyTypes, ["typeName"], "asc");
    }
  }

  getDatasheetPropertyNames(
    id?: "type" | "id",
    value?
  ): DatasheetPropertyName[] {
    if (id && id == "type") {
      return this.datasheetPropertyNames.filter((x) => x.nameType == value);
    } else if (id && id == "id") {
      const datasheetPropertyNames = this.datasheetPropertyNames.find(
        (x) => x.nameId == value
      );
      return datasheetPropertyNames ? [datasheetPropertyNames] : null;
    } else {
      return orderBy(this.datasheetPropertyNames, ["nameName"], "asc");
    }
  }

  getDatasheetQualityColorCodes(id?): DatasheetQualityColorCode[] {
    if (id) {
      return [
        this.datasheetQualityColorCodes.find((x) => x.qualityColorCodeId == id),
      ];
    } else {
      return orderBy(
        this.datasheetQualityColorCodes,
        ["qualityColorCodeName"],
        "asc"
      );
    }
  }

  async editDatasheetSettings(
    setting:
      | "majorfamily"
      | "family"
      | "category"
      | "propertyType"
      | "propertyName"
      | "qualityColorCode"
  ) {
    let modal = null;
    switch (setting) {
      case "majorfamily":
        modal = "modal-datasheet-majorfamily";
        break;
      case "family":
        modal = "modal-datasheet-family";
        break;
      case "category":
        modal = "modal-datasheet-category";
        break;
      case "propertyType":
        modal = "modal-datasheet-propertytype";
        break;
      case "propertyName":
        modal = "modal-datasheet-propertyname";
        break;
      case "qualityColorCode":
        modal = "modal-datasheet-qualitycolorcode";
        break;
    }
    return await RouterService.openModal(modal);
  }

  async uploadDatasheetSettings(
    setting?:
      | "majorfamily"
      | "family"
      | "category"
      | "propertyType"
      | "propertyName"
      | "qualityColorCode",
    data?
  ) {
    if (setting) {
      switch (setting) {
        case "majorfamily":
          this.datasheetMajorFamilies = data;
          break;
        case "family":
          this.datasheetFamilies = data;
          break;
        case "category":
          this.datasheetCategories = data;
          break;
        case "propertyType":
          this.datasheetPropertyTypes = data;
          break;
        case "propertyName":
          this.datasheetPropertyNames = data;
          break;
        case "qualityColorCode":
          this.datasheetQualityColorCodes = data;
          break;
      }
    }
    const settings = new DatasheetSettings();
    settings.datasheetMajorFamilies = this.datasheetMajorFamilies;
    settings.datasheetFamilies = this.datasheetFamilies;
    settings.datasheetCategories = this.datasheetCategories;
    settings.datasheetPropertyTypes = this.datasheetPropertyTypes;
    settings.datasheetPropertyNames = this.datasheetPropertyNames;
    settings.datasheetMajorFamilies = this.datasheetMajorFamilies;
    settings.datasheetQualityColorCodes = this.datasheetQualityColorCodes;

    await DatabaseService.updateDocument(
      DATASHEETSCOLLECTION,
      SETTINGSCOLLECTIONNAME,
      settings
    );
  }
}
export const DatasheetsService = new DatasheetsController();
