import { StorageService } from "../../common/storage";
import { alertController, popoverController } from "@ionic/core";
import { DatabaseService, SETTINGSCOLLECTIONNAME } from "../../common/database";
import { TranslationService } from "../../common/translations";
import { TrasteelFilterService } from "../common/trs-db-filter";
import { orderBy } from "lodash";
import { RouterService } from "../../common/router";
import { BehaviorSubject } from "rxjs";
import {
  AreaShape,
  MapDataShape,
  Shape,
  ShapeFilter,
  ShapeSettings,
  ShapeType,
} from "../../../interfaces/trasteel/refractories/shapes";
import { DocumentReference } from "firebase/firestore";
import { UserService } from "../../common/user";
import { TextMultilanguage } from "../../../components";
import {
  Project,
  ProjectAreaQuality,
  ProjectAreaQualityShape,
} from "../../../interfaces/trasteel/refractories/projects";
import { XLSXExportService } from "./xlsExport";
import { DatasheetsService } from "./datasheets";
import { MapDataDatasheet } from "../../../interfaces/trasteel/refractories/datasheets";
import { FirebaseFilterCondition } from "../../../interfaces/common/system/system";

export const SHAPESCOLLECTION = "shapes";

export class ShapesController {
  shapesList: MapDataShape[] = [];
  shapeTypes: ShapeType[] = [];
  shapesList$: BehaviorSubject<MapDataShape[]> = new BehaviorSubject([]);
  serviceInit = true;

  //initialise this service inside app-root at the start of the app
  init() {
    //init only once
    if (this.serviceInit) {
      this.serviceInit = false;
      this.downloadShapeSettings();
      TrasteelFilterService.mapDataSub$.subscribe(() => {
        const collection =
          TrasteelFilterService.getCollectionArray(SHAPESCOLLECTION);
        if (collection && collection.length > 0) {
          this.shapesList = collection;
          this.shapesList$.next(this.shapesList);
        } else {
          this.shapesList$.next([]);
        }
      });
    }
  }

  getMapData(collection) {
    const result = {};
    if (collection && Object.keys(collection)) {
      Object.keys(collection).forEach((item) => {
        const shape = new MapDataShape(collection[item]);
        result[item] = shape;
      });
    }
    return result;
  }

  async presentShapeUpdate(id?) {
    return await RouterService.openModal("modal-shape-update", {
      shapeId: id,
    });
  }

  async duplicateShape(id) {
    const shape = await this.getShape(id);
    return await RouterService.openModal("modal-shape-update", {
      duplicateShape: { id: id, shape: shape },
    });
  }

  async presentShapeDetails(id) {
    RouterService.push("/" + SHAPESCOLLECTION + "/" + id, "forward");
  }

  async getShape(id): Promise<Shape> {
    const shape = new Shape(
      await DatabaseService.getDocument(SHAPESCOLLECTION, id)
    );
    if (!shape.dwg) {
      this.setDwgForShape(shape);
    }
    return shape;
  }

  getShapeName(id): string {
    return this.shapesList.find((a) => a.id == id)
      ? this.shapesList.find((a) => a.id == id).shapeName
      : id + " missing!";
  }

  async updateShape(id, shape, userId): Promise<DocumentReference> {
    return DatabaseService.saveItem(id, shape, userId, SHAPESCOLLECTION);
  }

  async deleteShape(id, goBack = true): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const confirm = await alertController.create({
        header: TranslationService.getTransl(
          "delete-shape-header",
          "Delete Shape?"
        ),
        message: TranslationService.getTransl(
          "delete-shape-message",
          "This shape will be deleted! Are you sure?"
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
              try {
                DatabaseService.deleteItem(SHAPESCOLLECTION, id);
                if (goBack) RouterService.goBack();
                resolve(null);
              } catch (error) {
                reject(error);
              }
            },
          },
        ],
      });
      confirm.present();
    });
  }

  async updatePhotoURL(type: string, uid: string, file: any) {
    return StorageService.updatePhotoURL(SHAPESCOLLECTION, type, uid, file);
  }

  getShapeById(id: string): MapDataShape {
    if (this.shapesList.length > 0) {
      return this.shapesList.find((shape) => shape.id == id);
    } else {
      return null;
    }
  }

  getShapesDetails(shapeTypeId: string, shapeName: string): MapDataShape {
    if (this.shapesList.length > 0) {
      return this.shapesList.find(
        (shape) =>
          shape.shapeTypeId == shapeTypeId && shape.shapeName == shapeName
      );
    } else {
      return null;
    }
  }

  async checkMapData() {
    DatabaseService.checkMapData(
      SHAPESCOLLECTION,
      this.shapesList,
      (id, shape) => this.createMapData(id, shape)
    );
  }

  createMapData(id, shape: Shape) {
    return new MapDataShape({
      id: id,
      shapeTypeId: shape.shapeTypeId,
      shapeName: shape.shapeName,
    });
  }

  async openSelectShape(selectedItem): Promise<MapDataShape> {
    return new Promise(async (resolve) => {
      const modal = await RouterService.openModal("modal-search-list", {
        list: this.shapesList,
        item: selectedItem,
        showField: "shapeName",
        filterBy: ["shapeName", "shapeTypeId"],
        orderBy: ["shapeName"],
        searchTitle: { tag: "shapes", text: "Shapes" },
        placeholder: "Search by shape name or type",
        filterObject: new ShapeFilter(),
        filterPopup: this.openShapeFilter,
        filterFunction: this.filterShapes,
      });
      modal.onDidDismiss().then(async (ev) => {
        if (ev) {
          resolve(ev.data);
        }
      });
      modal.present();
    });
  }

  async openShapeFilter(filter: ShapeFilter): Promise<ShapeFilter> {
    return new Promise(async (resolve, reject) => {
      const popover = await popoverController.create({
        component: "popover-shapes-filter",
        componentProps: { filter },
        cssClass: "popover-shapes-filter",
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

  async filterShapes(filter: ShapeFilter): Promise<MapDataShape[]> {
    /*const searchFields = [];
    const searchOperators = [];
    const searchStrings = [];
    Object.keys(filter).map((key) => {
      if (
        (!key.includes("operator") && filter[key] != null) ||
        filter[key] > 0
      ) {
        searchFields.push(key);
        searchOperators.push(filter[key + "_operator"]);
        searchStrings.push(filter[key]);
      }
    });
    const shapes = await DatabaseService.queryCollection(
      SHAPESCOLLECTION,
      searchFields,
      searchOperators,
      searchStrings,
      "and"
    );*/
    const filterConditions = [];
    Object.keys(filter).map((key) => {
      if (
        (!key.includes("operator") && filter[key] != null) ||
        filter[key] > 0
      ) {
        filterConditions.push(
          new FirebaseFilterCondition({
            field: key,
            operator: filter[key + "_operator"],
            value: filter[key],
          })
        );
      }
    });
    const shapes = await DatabaseService.filterDocumentsOnConditions(
      SHAPESCOLLECTION,
      filterConditions,
      "and"
    );

    const mapDataShapes = [];
    shapes.forEach((shape) => {
      const sh = new Shape(shape);
      mapDataShapes.push(ShapesService.createMapData(shape.id, sh));
    });
    return mapDataShapes;
  }

  async setDwgForShape(shape) {
    //copy shape type standard drawing
    const shapeTypes = await ShapesService.getShapeTypes(shape.shapeTypeId);
    if (shapeTypes && shapeTypes.length > 0) {
      shape.dwg = shapeTypes[0].dwg;
      shape.decimals =
        shape.decimals >= 0 ? shape.decimals : shapeTypes[0].decimals;
    }
  }

  async exportShapes(
    basket: { shape: MapDataShape; datasheet: MapDataDatasheet }[],
    lang
  ) {
    const project = new Project();
    project.projectLocalId = "export";
    const shapeAreas = [];

    for (let index = 0; index < basket.length; index++) {
      const projectAreaQuality = new ProjectAreaQuality();
      const item = basket[index];
      const shape = await ShapesService.getShape(item.shape.id);
      shape["shapeId"] = item.shape.id;
      const datasheet = await DatasheetsService.getDatasheet(item.datasheet.id);
      const density = datasheet.getDensity();
      const projectAreaQualityShape = new ProjectAreaQualityShape();
      projectAreaQualityShape.position = index + 1;
      projectAreaQualityShape.shapeId = shape["shapeId"];
      projectAreaQuality.shapes.push(projectAreaQualityShape);
      projectAreaQuality.datasheetId = item.datasheet.id;
      projectAreaQuality.density = density;
      const shapeArea = new AreaShape();
      shapeArea.areaIndex = index;
      shapeArea.shapes.push(shape);
      shapeAreas.push(shapeArea);
      project.projectAreaQuality.push(projectAreaQuality);
    }
    XLSXExportService.exportShapes(project, shapeAreas, lang);
  }

  /*async convertAllShapes() {
    const shapes =
      await DatabaseService.getCollectionDocuments(SHAPESCOLLECTION);
    console.log("shapes.docs", shapes.docs);
    for (let index = 0; index < shapes.docs.length; index++) {
      const doc = shapes.docs[index];
      const data = doc.data();
      if (isString(data.H)) {
        const shape = new Shape(doc.data());
        console.log("shape", shape);
        const res = await this.updateShape(
          doc.id,
          shape,
          UserService.userProfile.uid
        );
        console.log("res", res.id);
      } else {
        console.log(doc.id, "ok");
      }
    }
  }*/

  /* 
  SHAPE SETTINGS
  */

  getShapeTypes(id?): Promise<ShapeType[]> {
    return new Promise(async (resolve) => {
      if (this.shapeTypes && this.shapeTypes.length == 0) {
        await this.downloadShapeSettings();
      }
      if (id) {
        const type = this.shapeTypes.find((x) => x.typeId == id);
        resolve(type ? [type] : null);
      } else {
        resolve(orderBy(this.shapeTypes, ["typeName.en"], "asc"));
      }
    });
  }
  getShapeTypeName(id): TextMultilanguage {
    const type = this.shapeTypes.find((x) => x.typeId == id);
    return type ? type.typeName : { en: id };
  }

  async editShapeTypes() {
    return await RouterService.openModal("modal-shape-type");
  }

  async downloadShapeSettings(): Promise<ShapeSettings> {
    let settings = new ShapeSettings();
    if (UserService.isLoggedin()) {
      //download if user logged in
      try {
        settings = await DatabaseService.getDocument(
          SHAPESCOLLECTION,
          SETTINGSCOLLECTIONNAME
        );
      } catch (error) {}
    }
    const types = [];
    settings.shapeTypes.forEach((shape) => {
      types.push(new ShapeType(shape));
    });
    this.shapeTypes = orderBy(types, ["typeName.en"]);
    return settings;
  }

  async uploadShapeSettings() {
    await DatabaseService.updateDocument(
      SHAPESCOLLECTION,
      SETTINGSCOLLECTIONNAME,
      { shapeTypes: this.shapeTypes }
    );
  }

  async uploadShapeTypes(shapeTypes: ShapeType[]) {
    this.shapeTypes = shapeTypes;
    await this.uploadShapeSettings();
  }
}
export const ShapesService = new ShapesController();
