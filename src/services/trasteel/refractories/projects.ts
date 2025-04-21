import { alertController } from "@ionic/core";
import { DatabaseService, SETTINGSCOLLECTIONNAME } from "../../common/database";
import { TranslationService } from "../../common/translations";
import { TrasteelFilterService } from "../common/trs-db-filter";
import { capitalize, cloneDeep, orderBy } from "lodash";
import { RouterService } from "../../common/router";
import { BehaviorSubject } from "rxjs";
import {
  ApplicationUnit,
  AutoFillCourses,
  BricksAllocationArea,
  MapDataProject,
  Project,
  ProjectCourse,
  ProjectSettings,
  QuantityUnit,
} from "../../../interfaces/trasteel/refractories/projects";
import { ShapesService } from "./shapes";
import {
  AreaShape,
  Shape,
} from "../../../interfaces/trasteel/refractories/shapes";
import { DatasheetsService } from "./datasheets";
import { formatNumber, roundDecimals } from "../../../helpers/utils";
import { UserService } from "../../common/user";
import { SystemService } from "../../common/system";

export const PROJECTSCOLLECTION = "projects";

export class ProjectsController {
  projectsList: MapDataProject[] = [];
  projectsList$: BehaviorSubject<MapDataProject[]> = new BehaviorSubject([]);
  bricksAllocationArea: BricksAllocationArea[] = [];
  applicationUnits: ApplicationUnit[] = [];
  quantityUnits: QuantityUnit[] = [];
  serviceInit = true;

  //initialise this service inside app-root at the start of the app
  init() {
    //init only once
    if (this.serviceInit) {
      this.serviceInit = false;
      TrasteelFilterService.mapDataSub$.subscribe(() => {
        const collection =
          TrasteelFilterService.getCollectionArray(PROJECTSCOLLECTION);
        if (collection && collection.length > 0) {
          this.projectsList = collection;
          this.projectsList$.next(this.projectsList);
        } else {
          this.projectsList$.next([]);
        }
      });
    }
  }

  getMapData(collection) {
    const result = {};
    if (collection && Object.keys(collection)) {
      Object.keys(collection).forEach((item) => {
        result[item] = new MapDataProject(collection[item]);
      });
    }
    return result;
  }

  async presentProjectUpdate(id?) {
    return await RouterService.openModal("modal-project-update", {
      projectId: id,
    });
  }

  async duplicateProject(id) {
    const project = await this.getProject(id);
    return await RouterService.openModal("modal-project-update", {
      duplicateProject: project,
    });
  }

  async presentProjectDetails(id) {
    RouterService.push("/" + PROJECTSCOLLECTION + "/" + id, "forward");
  }

  async getProject(id) {
    const project = new Project(
      await DatabaseService.getDocument(PROJECTSCOLLECTION, id)
    );
    //check if project has missing calculations
    return await this.checkMissingCalculations(project);
  }

  async updateProject(id, project, userId) {
    return DatabaseService.saveItem(id, project, userId, PROJECTSCOLLECTION);
  }

  async deleteProject(id, goBack = true): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const confirm = await alertController.create({
        header: TranslationService.getTransl(
          "delete-project-header",
          "Delete Project?"
        ),
        message: TranslationService.getTransl(
          "delete-project-message",
          "This project will be deleted! Are you sure?"
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
              DatabaseService.deleteItem(PROJECTSCOLLECTION, id);
              if (goBack) RouterService.goBack();
              resolve(null);
            },
          },
        ],
      });
      confirm.present();
    });
  }

  getProjectsDetails(projectId: string): MapDataProject {
    if (this.projectsList.length > 0) {
      return this.projectsList.find((project) => project.id == projectId);
    } else {
      return null;
    }
  }

  createMapData(id, project: Project) {
    return new MapDataProject({
      id: id,
      projectLocalId: project.projectLocalId,
      projectDescription: project.projectDescription,
      customerId: project.customerId,
    });
  }

  async loadShapesForApplication(
    project,
    showLoading = false
  ): Promise<AreaShape[]> {
    return new Promise(async (resolve) => {
      const areaShapes = [];
      for (let index = 0; index < project.projectAreaQuality.length; index++) {
        const areaQuality = project.projectAreaQuality[index];
        areaShapes.push(
          new AreaShape({
            areaIndex: index,
            shapes: [],
          })
        );
        for (
          let positionIndex = 0;
          positionIndex < areaQuality.shapes.length;
          positionIndex++
        ) {
          const shape = areaQuality.shapes[positionIndex];
          if (showLoading) {
            SystemService.replaceLoadingMessage(
              "Loading " + shape.shapeId + "..."
            );
          }
          const shapeValue = await ShapesService.getShape(shape.shapeId);
          shapeValue["shapeId"] = shape.shapeId;
          areaShapes[index].shapes.push(shapeValue);
        }
      }
      resolve(areaShapes);
    });
  }

  async checkBricksAllocationAreasForProject(project) {
    //used as reverse check for old DB projects, in case an area os a project was missing from the list of areas
    let areas = ProjectsService.getBricksAllocationAreas();
    for (let index = 0; index < project.projectAreaQuality.length; index++) {
      const area = project.projectAreaQuality[index];
      const bricksArea = ProjectsService.getBricksAllocationAreas(
        area.bricksAllocationAreaId
      );
      if (!bricksArea) {
        //missing area - add
        const newArea = new BricksAllocationArea({
          bricksAllocationAreaId: area.bricksAllocationAreaId,
          bricksAllocationAreaName: {
            en: capitalize(
              area.bricksAllocationAreaId
                .replace(/-+/g, " ")
                .replace(/_+/g, " ")
            ),
          },
        });
        areas.push(newArea);
        await this.uploadProjectSettings("bricksAllocationArea", areas);
      }
    }
  }

  createProjectSummary(
    project: Project,
    areaShapes,
    numberOfSets: number,
    includeBasic: boolean,
    includeRepair: boolean,
    includeMasses: boolean,
    groupBy: "position" | "brickQuality" = "position"
  ) {
    const weightDecimals = 2;
    const pcsDecimals = 0;
    let projectSummary = [];
    let qtyPerSetPcsTotal = 0;
    let qtyPerSetMTTotal = 0;
    let qtyPerSetPcsRepairTotal = 0;
    let qtyPerSetMTRepairTotal = 0;
    project.projectAreaQuality.forEach((area, index) => {
      area.shapes.forEach((shape, positionIndex) => {
        const shapeItem = areaShapes[index].shapes[positionIndex];
        let qtyPerSet = 0;
        let qtyPerSetRepair = 0;
        //calculate qty
        area.courses.forEach((course) => {
          course.quantityShapes.forEach((qtyShape) => {
            if (qtyShape.shapeId == shape.shapeId) {
              qtyPerSet +=
                includeBasic && !area.onlyForRepair
                  ? (qtyShape.quantity *
                      (100 + (area.includeSafety ? area.includeSafety : 0))) /
                    100
                  : 0; /*+
                    (includeRepair
                      ? ((area.onlyForRepair
                          ? 1
                          : course.repairSets
                            ? course.repairSets
                            : 0) *
                          qtyShape.quantity *
                          (100 +
                            (area.includeSafety ? area.includeSafety : 0))) /
                        100
                      : 0);*/

              qtyPerSetRepair += includeRepair
                ? ((area.onlyForRepair
                    ? 1
                    : course.repairSets
                      ? course.repairSets
                      : 0) *
                    qtyShape.quantity *
                    (100 + (area.includeSafety ? area.includeSafety : 0))) /
                  100
                : 0;
            }
          });
        });
        qtyPerSet = roundDecimals(qtyPerSet, pcsDecimals);
        qtyPerSetRepair = roundDecimals(qtyPerSetRepair, pcsDecimals);
        qtyPerSetPcsTotal += qtyPerSet;
        qtyPerSetPcsRepairTotal += qtyPerSetRepair;
        let unitWeight = 0;
        //check if special shape
        if (shape.specialShapeVolume > 0) {
          unitWeight = shapeItem
            ? shapeItem.getWeightForVolume(
                shape.specialShapeVolume,
                area.density
              )
            : 0;
        } else {
          unitWeight = shapeItem ? shapeItem.getWeight(area.density) : 0;
        }
        const qtyPerSetMT = roundDecimals(
          (qtyPerSet * unitWeight) / 1000,
          weightDecimals
        );
        const qtyPerSetMTRepair = roundDecimals(
          (qtyPerSetRepair * unitWeight) / 1000,
          weightDecimals
        );
        qtyPerSetMTTotal += qtyPerSetMT;
        qtyPerSetMTRepairTotal += qtyPerSetMTRepair;
        projectSummary.push({
          areaIndex: index,
          areaId: area.bricksAllocationAreaId,
          area: area.bricksAllocationAreaId
            ? ProjectsService.getBricksAllocationAreas(
                area.bricksAllocationAreaId
              )[0].bricksAllocationAreaName.en
            : "" /*+
            (area.onlyForRepair
              ? " (" + TranslationService.getTransl("repair", "Repair") + ")"
              : "")*/,
          position: shape.position,
          quality: area.datasheetId
            ? DatasheetsService.datasheetsList.find(
                (a) => a.id == area.datasheetId
              ).productName
            : null,
          datasheetId: area.datasheetId,
          techNo: area.datasheetId
            ? DatasheetsService.datasheetsList.find(
                (a) => a.id == area.datasheetId
              ).techNo
            : null,
          shape: shape.shapeId
            ? shapeItem && shapeItem.shapeName
              ? shapeItem.shapeName
              : null
            : null,
          includeSafety: area.includeSafety,
          weightPerPiece: formatNumber(unitWeight),
          qtyPerSetPcs: formatNumber(qtyPerSet),
          qtyPerSetMT: formatNumber(qtyPerSetMT),
          weightPerPiece_num: unitWeight,
          qtyPerSetPcs_num: qtyPerSet,
          qtyPerSetMT_num: qtyPerSetMT,
          qtyTotPcs: formatNumber(qtyPerSet * numberOfSets),
          qtyTotMT: formatNumber(qtyPerSetMT * numberOfSets),
          mass: false,
          onlyForRepair: area.onlyForRepair,
        });
        if (qtyPerSetRepair > 0) {
          //add repair field
          projectSummary.push({
            areaIndex: index,
            areaId: area.bricksAllocationAreaId + "_*repair*_",
            area:
              (area.bricksAllocationAreaId
                ? ProjectsService.getBricksAllocationAreas(
                    area.bricksAllocationAreaId
                  )[0].bricksAllocationAreaName.en
                : "") +
              " (" +
              TranslationService.getTransl("repair", "Repair") +
              ")",
            position: shape.position,
            quality: area.datasheetId
              ? DatasheetsService.datasheetsList.find(
                  (a) => a.id == area.datasheetId
                ).productName
              : null,
            datasheetId: area.datasheetId,
            techNo: area.datasheetId
              ? DatasheetsService.datasheetsList.find(
                  (a) => a.id == area.datasheetId
                ).techNo
              : null,
            shape: shape.shapeId ? shapeItem.shapeName : null,
            includeSafety: area.includeSafety,
            weightPerPiece: formatNumber(unitWeight),
            qtyPerSetPcs: formatNumber(qtyPerSetRepair),
            qtyPerSetMT: formatNumber(qtyPerSetMTRepair),
            weightPerPiece_num: unitWeight,
            qtyPerSetPcs_num: qtyPerSetRepair,
            qtyPerSetMT_num: qtyPerSetMTRepair,
            qtyTotPcs: formatNumber(qtyPerSetRepair * numberOfSets),
            qtyTotMT: formatNumber(qtyPerSetMTRepair * numberOfSets),
            mass: false,
            onlyForRepair: true,
          });
        }
      });
    });
    if (includeMasses) {
      project.projectMass.forEach((mass, index) => {
        const qtyPerSet = mass.weightPerUnitKg;
        qtyPerSetPcsTotal += qtyPerSet;
        const qtyPerSetMT = roundDecimals(
          (mass.quantity * mass.weightPerUnitKg) / 1000,
          weightDecimals
        );
        qtyPerSetMTTotal += qtyPerSetMT;
        projectSummary.push({
          areaIndex: index,
          areaId: mass.bricksAllocationAreaId,
          area: mass.bricksAllocationAreaId
            ? ProjectsService.getBricksAllocationAreas(
                mass.bricksAllocationAreaId
              )[0].bricksAllocationAreaName.en
            : null,
          position: mass.position,
          quality: mass.datasheetId
            ? DatasheetsService.datasheetsList.find(
                (a) => a.id == mass.datasheetId
              )
              ? DatasheetsService.datasheetsList.find(
                  (a) => a.id == mass.datasheetId
                ).productName
              : null
            : null,
          shape: mass.quantityUnit
            ? ProjectsService.getQuantityUnits(mass.quantityUnit)[0]
                .quantityUnitName.en
            : TranslationService.getTransl("mass", "Mass"),
          weightPerPiece: formatNumber(mass.weightPerUnitKg),
          qtyPerSetPcs: formatNumber(roundDecimals(qtyPerSet, pcsDecimals)),
          qtyPerSetMT: formatNumber(roundDecimals(qtyPerSetMT, weightDecimals)),
          weightPerPiece_num: mass.weightPerUnitKg,
          qtyPerSetPcs_num: roundDecimals(qtyPerSet, pcsDecimals),
          qtyPerSetMT_num: roundDecimals(qtyPerSetMT, weightDecimals),
          qtyTotPcs: formatNumber(qtyPerSet * numberOfSets),
          qtyTotMT: formatNumber(
            roundDecimals(qtyPerSetMT * numberOfSets, weightDecimals)
          ),
          mass: true,
        });
      });
    }
    //group areas with same position, quality and shape
    const groupedProjectSummary = {};
    let groups = [];
    if (groupBy == "position") {
      groups = ["areaId", "position", "quality", "shape"];
    } else if (groupBy == "brickQuality") {
      groups = ["quality", "shape"];
    }
    projectSummary.forEach((summary) => {
      let index = "";
      groups.forEach((group) => {
        index += summary[group] + "-";
      });
      if (!groupedProjectSummary[index]) {
        groupedProjectSummary[index] = cloneDeep(summary);
      } else {
        //sum values
        groupedProjectSummary[index].qtyPerSetMT_num = roundDecimals(
          groupedProjectSummary[index].qtyPerSetMT_num +
            summary.qtyPerSetMT_num,
          weightDecimals
        );
        groupedProjectSummary[index].qtyPerSetMT = formatNumber(
          groupedProjectSummary[index].qtyPerSetMT_num
        );
        groupedProjectSummary[index].qtyPerSetPcs_num = roundDecimals(
          groupedProjectSummary[index].qtyPerSetPcs_num +
            summary.qtyPerSetPcs_num,
          pcsDecimals
        );
        groupedProjectSummary[index].qtyPerSetPcs = formatNumber(
          groupedProjectSummary[index].qtyPerSetPcs_num
        );
        groupedProjectSummary[index].qtyTotMT = formatNumber(
          roundDecimals(
            groupedProjectSummary[index].qtyPerSetMT_num * numberOfSets,
            weightDecimals
          )
        );
        groupedProjectSummary[index].qtyTotPcs = formatNumber(
          groupedProjectSummary[index].qtyPerSetPcs_num * numberOfSets
        );
      }
    });
    //convert grouped summary to array
    projectSummary = orderBy(Object.values(groupedProjectSummary), "position");

    return {
      projectSummary: projectSummary,
      totals: {
        qtyPerSetPcs: formatNumber(qtyPerSetPcsTotal + qtyPerSetPcsRepairTotal),
        qtyPerSetMT: formatNumber(
          roundDecimals(
            qtyPerSetMTTotal + qtyPerSetMTRepairTotal,
            weightDecimals
          )
        ),
        qtyPcs: formatNumber(
          (qtyPerSetPcsTotal + qtyPerSetPcsRepairTotal) * project.setsAmount
        ),
        qtyMT: formatNumber(
          roundDecimals(
            (qtyPerSetMTTotal + qtyPerSetMTRepairTotal) * project.setsAmount,
            weightDecimals
          )
        ),
      },
    };
  }

  async checkMapData() {
    DatabaseService.checkMapData(
      PROJECTSCOLLECTION,
      this.projectsList,
      (id, project) => this.createMapData(id, project)
    );
  }

  /*
  SUB-COLLECTIONS & SETTINGS
  */

  async downloadProjectSettings(): Promise<ProjectSettings> {
    return new Promise(async (resolve) => {
      let settings = new ProjectSettings();
      if (UserService.isLoggedin()) {
        //download if user logged in
        try {
          settings = await DatabaseService.getDocument(
            PROJECTSCOLLECTION,
            SETTINGSCOLLECTIONNAME
          );
        } catch (error) {}
      }
      const bricksAllocationArea = [];
      if (settings.bricksAllocationArea)
        settings.bricksAllocationArea.forEach((area) => {
          bricksAllocationArea.push(new BricksAllocationArea(area));
        });
      this.bricksAllocationArea = orderBy(bricksAllocationArea, [
        "bricksAllocationAreaName.en",
      ]);
      const applicationUnits = [];
      if (settings.applicationUnits)
        settings.applicationUnits.forEach((applicationUnit) => {
          applicationUnits.push(new ApplicationUnit(applicationUnit));
        });
      this.applicationUnits = orderBy(applicationUnits, ["applicationName.en"]);
      const quantityUnits = [];
      if (settings.quantityUnits)
        settings.quantityUnits.forEach((quantityUnit) => {
          quantityUnits.push(new QuantityUnit(quantityUnit));
        });
      this.quantityUnits = orderBy(quantityUnits, ["quantityUnitName.en"]);
      resolve(settings);
    });
  }

  getBricksAllocationAreas(id?): BricksAllocationArea[] {
    if (id) {
      const bricksAllocationArea = this.bricksAllocationArea.find(
        (x) => x.bricksAllocationAreaId == id
      );
      return bricksAllocationArea
        ? [bricksAllocationArea]
        : [
            new BricksAllocationArea({
              bricksAllocationAreaName: { en: id },
              bricksAllocationAreaId: id,
            }),
          ];
    } else {
      return orderBy(
        this.bricksAllocationArea,
        ["bricksAllocationAreaName.en"],
        "asc"
      );
    }
  }

  getApplicationUnits(id?): ApplicationUnit[] {
    if (id) {
      const applicationUnits = this.applicationUnits.find(
        (x) => x.applicationId == id
      );
      return applicationUnits
        ? [applicationUnits]
        : [
            new ApplicationUnit({
              applicationName: { en: id },
              applicationId: id,
            }),
          ];
    } else {
      return orderBy(this.applicationUnits, ["applicationName.en"], "asc");
    }
  }

  getQuantityUnits(id?): QuantityUnit[] {
    if (id) {
      const quantityUnits = this.quantityUnits.find(
        (x) => x.quantityUnitId == id
      );
      return quantityUnits
        ? [quantityUnits]
        : [
            new QuantityUnit({
              quantityUnitName: { en: id },
              quantityUnitId: id,
            }),
          ];
    } else {
      return orderBy(this.quantityUnits, ["quantityUnitName.en"], "asc");
    }
  }

  async editProjectSettings(
    setting: "bricksAllocationArea" | "applicationUnit" | "quantityUnit"
  ) {
    let modal = null;
    switch (setting) {
      case "bricksAllocationArea":
        modal = "modal-project-bricksallocationarea";
        break;
      case "applicationUnit":
        modal = "modal-project-applicationunit";
        break;
      case "quantityUnit":
        modal = "modal-project-quantityunit";
        break;
    }
    return await RouterService.openModal(modal);
  }

  async uploadProjectSettings(
    setting?: "bricksAllocationArea" | "applicationUnit" | "quantityUnit",
    data?
  ) {
    await this.downloadProjectSettings();
    if (setting) {
      switch (setting) {
        case "bricksAllocationArea":
          this.bricksAllocationArea = data;
          break;
        case "applicationUnit":
          this.applicationUnits = data;
          break;
        case "quantityUnit":
          this.quantityUnits = data;
          break;
      }
    }
    const settings = new ProjectSettings();
    settings.bricksAllocationArea = this.bricksAllocationArea;
    settings.applicationUnits = this.applicationUnits;
    settings.quantityUnits = this.quantityUnits;
    await DatabaseService.updateDocument(
      PROJECTSCOLLECTION,
      SETTINGSCOLLECTIONNAME,
      settings
    );
  }

  /*
  calculations
  */

  countTotalQuantity(course: ProjectCourse) {
    let value = 0;
    course.quantityShapes.forEach((shape) => {
      value += shape.quantity;
    });
    return value;
  }

  getAreaCourseWeightForShape(
    project,
    areaShapes,
    areaIndex,
    courseIndex,
    shapeIndex
  ) {
    const course = project.projectAreaQuality[areaIndex].courses[courseIndex];
    //check if special shape
    let unitWeight = 0;
    if (
      project.projectAreaQuality[areaIndex].shapes[shapeIndex]
        .specialShapeVolume > 0
    ) {
      unitWeight = areaShapes[areaIndex].shapes[shapeIndex]
        ? areaShapes[areaIndex].shapes[shapeIndex].getWeightForVolume(
            project.projectAreaQuality[areaIndex].shapes[shapeIndex]
              .specialShapeVolume,
            project.projectAreaQuality[areaIndex].density
          )
        : 0;
    } else {
      unitWeight = areaShapes[areaIndex].shapes[shapeIndex]
        ? areaShapes[areaIndex].shapes[shapeIndex].getWeight(
            project.projectAreaQuality[areaIndex].density
          )
        : 0;
    }
    const v =
      unitWeight *
      (course.repairSets ? course.repairSets + 1 : 1) *
      (course.quantityShapes[shapeIndex] &&
      course.quantityShapes[shapeIndex].quantity
        ? course.quantityShapes[shapeIndex].quantity
        : 0);
    return roundDecimals(v, 1);
  }

  getTotalWeightForCourse(project, areaShapes, areaIndex, courseIndex) {
    let value = 0;
    for (
      let shapeIndex = 0;
      shapeIndex <
      project.projectAreaQuality[areaIndex].courses[courseIndex].quantityShapes
        .length;
      shapeIndex++
    ) {
      value += this.getAreaCourseWeightForShape(
        project,
        areaShapes,
        areaIndex,
        courseIndex,
        shapeIndex
      );
    }
    return roundDecimals(value, 1);
  }

  calculateBricks(
    shapes: Shape[],
    R: number,
    alpha: number = 360
  ): [number, number] {
    //possible only for first 2 shapes
    if (shapes[0].shapeTypeId == "su-brick") {
      //SU SHAPES
      if (R > 0 && R >= shapes[0].radius && R <= shapes[0].radius_max) {
        const n_mattoni_a1 = Math.round(
          (2 * 3.14 * (R + shapes[0].H)) / shapes[0].A
        );
        const n_mattoni_a2 = Math.round(
          (2 * 3.14 * (R + shapes[0].H)) / shapes[0].A
        );
        /*const n_mattoni = roundDecimals(
        (2 * 3.14 * (R )) / shapes[0].A,
        0
      );
      const confronto = (2 * 3.14 * R) / n_mattoni;
      if (confronto <= shapes[0].B && R > 0) {
        return [n_mattoni, 0];
      } else {
        return [-1, 0];
      }*/
        const n_mattoni =
          n_mattoni_a1 > n_mattoni_a2 ? n_mattoni_a1 : n_mattoni_a2;
        return [roundDecimals(n_mattoni, 0), 0];
      } else {
        return [-1, 0];
      }
    } else {
      //OTHER SHAPES
      const shape1 = shapes[0];
      if (shapes[1]) {
        //calculate courses
        const shape2 = shapes[1];
        if (
          shape1.A > 0 &&
          shape1.B > 0 &&
          shape1.H > 0 &&
          shape1.L > 0 &&
          shape2.A > 0 &&
          shape2.B > 0 &&
          shape2.H > 0 &&
          shape2.L > 0
        ) {
          const rect = shape1.A == shape1.B || shape2.A == shape2.B;
          const n1 =
            (((alpha * 6.28) / 360) * shape1.H) / (shape1.A - shape1.B);
          const r1 =
            shape1.radius > 0 ? shape1.radius : shape1.getInternalRadius();
          const n2 =
            (((alpha * 6.28) / 360) * shape2.H) / (shape2.A - shape2.B);
          const r2 =
            shape2.radius > 0 ? shape2.radius : shape2.getInternalRadius();
          let nx1 = 0;
          let nx2 = 0;
          if (rect) {
            //formato rastremato e rettangolo
            nx1 =
              (((4 * 3.14 * (R - r2)) / (shape1.A + shape1.B)) * alpha) / 360;
            nx2 = (((alpha * 6.28) / 360) * shape2.H) / (shape2.A - shape2.B);
          } else {
            //due rastremati
            nx1 = (n1 * (r2 - R)) / (r2 - r1);
            nx2 = (n2 * (R - r1)) / (r2 - r1);
          }
          return [Math.round(nx1), Math.round(nx2)];
        } else {
          return [0, 0];
        }
      } else {
        //calculate bottom
        const area = 3.14 * R * R;
        const brickArea = shape1.A * shape1.B;
        const bricks = area / brickArea;
        return [Math.ceil(bricks), 0];
      }
    }
  }

  //some calculations from old projects are missing, when quantity is 0
  async checkMissingCalculations(project: Project): Promise<Project> {
    return new Promise(async (resolve) => {
      //check if all courses have zero quantity
      let areasToRecalculate = [];
      project.projectAreaQuality.forEach(async (area, index) => {
        let quanitySum = 0;
        for (const course of area.courses) {
          course.quantityShapes.forEach((qty) => {
            quanitySum += qty.quantity;
          });
        }
        if (quanitySum == 0) areasToRecalculate.push(index);
      });
      //some areas have zero quantities
      if (areasToRecalculate.length > 0) {
        const areaShapes = await this.loadShapesForApplication(project);
        areasToRecalculate.forEach((areaIndex) => {
          this.recalculateExistingCourses(project, areaShapes, areaIndex);
        });
      }
      resolve(project);
    });
  }

  recalculateExistingCourses(
    project,
    areaShapes,
    areaIndex,
    fromCourse = 0,
    toCourse?
  ) {
    if (!toCourse) {
      toCourse = project.projectAreaQuality[areaIndex].courses.length - 1;
    }
    //recalculate each course
    for (let courseIndex = fromCourse; courseIndex <= toCourse; courseIndex++) {
      const course = project.projectAreaQuality[areaIndex].courses[courseIndex];
      const autoFillCourse = new AutoFillCourses({
        fromCourse: courseIndex,
        toCourse: courseIndex,
        courseNumbers: [course.courseNumber], //keep course number
        step: 1,
        layer: course.layer ? course.layer : 0,
        startAngle: course.startAngle ? course.startAngle : 0,
        endAngle: course.endAngle ? course.endAngle : 360,
        startHeight: course.height ? course.height : 0,
        startRadius: course.innerRadius,
      });
      this.calculateAutofill(
        project,
        areaShapes,
        areaIndex,
        autoFillCourse,
        false
      );
    }
  }

  calculateAutofill(
    project: Project,
    areaShapes: AreaShape[],
    areaIndex: number,
    data: AutoFillCourses,
    replaceAllData = true
  ) {
    if (replaceAllData)
      project.projectAreaQuality[areaIndex].autoFillCourses = data;
    let checkQuantities = 0;
    data.quantityShape.forEach((qty) => {
      checkQuantities += qty;
    });
    const projectArea = project.projectAreaQuality[areaIndex];
    const shape1 = areaShapes[areaIndex].shapes[0];
    if (replaceAllData) projectArea.courses = [];
    if (checkQuantities > 0) {
      //no calculation, just add fix numbers
      if (data.step < 1) data.step = 1;
      for (let k = 0; k <= data.toCourse - data.fromCourse; k = k + data.step) {
        const courseNumber =
          data.courseNumbers && data.courseNumbers.length > 0
            ? data.courseNumbers[k]
            : data.fromCourse + k;
        const innerRadius =
          data.startRadius + roundDecimals(data.radiusStep * k, 2);
        const course = new ProjectCourse();
        course.courseNumber = courseNumber;
        course.repairSets = data.repairSets;
        course.startAngle = data.startAngle;
        course.endAngle = data.endAngle;
        course.widthAngle = data.endAngle - data.startAngle;
        course.height = data.startHeight + roundDecimals(shape1.H * k, 1);
        course.innerRadius = innerRadius;
        course.layer = data.layer;
        const qts = [];
        for (
          let shapeIndex = 0;
          shapeIndex < project.projectAreaQuality[areaIndex].shapes.length;
          shapeIndex++
        ) {
          qts.push({
            shapeId:
              project.projectAreaQuality[areaIndex].shapes[shapeIndex].shapeId,
            quantity: data.quantityShape[shapeIndex],
          });
        }
        course.quantityShapes = qts;
        projectArea.courses.push(course);
      }
    } else {
      //calculate values for bottom and each course
      if (
        project.projectAreaQuality[areaIndex].bricksAllocationAreaId ===
        "bottom"
      ) {
        //calculate bottom
        const courseNumber =
          data.courseNumbers && data.courseNumbers.length > 0
            ? data.courseNumbers[0]
            : 0;

        let qty = ProjectsService.calculateBricks(
          [shape1, null],
          data.startRadius
        );
        const course = new ProjectCourse();
        course.courseNumber = courseNumber;
        course.repairSets = data.repairSets;
        course.startAngle = data.startAngle;
        course.endAngle = data.endAngle;
        course.widthAngle = data.endAngle - data.startAngle;
        course.height = 0;
        course.innerRadius = data.startRadius;
        course.layer = data.layer;
        course.quantityShapes = [
          {
            shapeId: project.projectAreaQuality[areaIndex].shapes[0].shapeId,
            quantity: qty[0],
          },
        ];
        if (project.projectAreaQuality[areaIndex].shapes.length > 1) {
          //add other shapes with 0 qty
          for (
            let i = 1;
            i <= project.projectAreaQuality[areaIndex].shapes.length - 1;
            i++
          ) {
            course.quantityShapes.push({
              shapeId: project.projectAreaQuality[areaIndex].shapes[i].shapeId,
              quantity: 0,
            });
          }
        }
        if (replaceAllData) {
          //reset all courses
          projectArea.courses.push(course);
        } else {
          //replace only selected course
          projectArea.courses[data.fromCourse] = course;
        }
      } else {
        //calculate courses
        const shape2 = areaShapes[areaIndex].shapes[1];
        let invertShapes = false;
        if (shape2) {
          if (shape1.A - shape1.B > shape2.A - shape2.B) {
            invertShapes = true;
          }
        }
        if (data.step < 1) data.step = 1;
        for (
          let k = 0;
          k <= data.toCourse - data.fromCourse;
          k = k + data.step
        ) {
          const courseNumber =
            data.courseNumbers && data.courseNumbers.length > 0
              ? data.courseNumbers[k]
              : data.fromCourse + k;
          const innerRadius =
            data.startRadius + roundDecimals(data.radiusStep * k, 2);
          const qty = ProjectsService.calculateBricks(
            invertShapes ? [shape2, shape1] : [shape1, shape2],
            innerRadius,
            Math.abs(data.endAngle - data.startAngle)
          );
          const course = new ProjectCourse();
          course.courseNumber = courseNumber;
          course.repairSets = data.repairSets;
          course.startAngle = data.startAngle;
          course.endAngle = data.endAngle;
          course.widthAngle = data.endAngle - data.startAngle;
          course.height = data.startHeight + roundDecimals(shape1.H * k, 1);
          course.innerRadius = innerRadius;
          course.layer = data.layer;
          if (shape2) {
            course.quantityShapes = [
              {
                shapeId:
                  project.projectAreaQuality[areaIndex].shapes[0].shapeId,
                quantity: invertShapes ? qty[1] : qty[0],
              },
              {
                shapeId:
                  project.projectAreaQuality[areaIndex].shapes[1].shapeId,
                quantity: invertShapes ? qty[0] : qty[1],
              },
            ];
          } else {
            course.quantityShapes = [
              {
                shapeId:
                  project.projectAreaQuality[areaIndex].shapes[0].shapeId,
                quantity: qty[0],
              },
            ];
          }

          if (project.projectAreaQuality[areaIndex].shapes.length > 2) {
            //add other shapes with 0 qty
            for (
              let i = 2;
              i <= project.projectAreaQuality[areaIndex].shapes.length - 1;
              i++
            ) {
              course.quantityShapes.push({
                shapeId:
                  project.projectAreaQuality[areaIndex].shapes[i].shapeId,
                quantity: 0,
              });
            }
          }
          if (replaceAllData) {
            //reset all courses
            projectArea.courses.push(course);
          } else {
            //replace only selected course
            projectArea.courses[data.fromCourse] = course;
          }
        }
      }
    }
  }
}
export const ProjectsService = new ProjectsController();
