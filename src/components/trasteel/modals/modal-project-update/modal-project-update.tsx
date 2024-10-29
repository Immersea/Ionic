import { Component, h, Host, Prop, State, Element } from "@stencil/core";
import {
  alertController,
  modalController,
  popoverController,
} from "@ionic/core";
import {
  cloneDeep,
  isString,
  max,
  maxBy,
  orderBy,
  some,
  toNumber,
} from "lodash";
import { Subscription } from "rxjs";
import Swiper from "swiper";
import { UserProfile } from "../../../../interfaces/common/user/user-profile";
import { UserService } from "../../../../services/common/user";
import { TranslationService } from "../../../../services/common/translations";
import {
  Project,
  ProjectAreaQuality,
  ProjectAreaQualityShape,
  ProjectCourse,
  ProjectMass,
  AutoFillCourses,
} from "../../../../interfaces/trasteel/refractories/projects";
import { ProjectsService } from "../../../../services/trasteel/refractories/projects";
import { Environment } from "../../../../global/env";
import { SystemService } from "../../../../services/common/system";
import { CustomersService } from "../../../../services/trasteel/crm/customers";
import { MapDataCustomer } from "../../../../interfaces/trasteel/customer/customer";
import { DatasheetsService } from "../../../../services/trasteel/refractories/datasheets";
import { ShapesService } from "../../../../services/trasteel/refractories/shapes";
import { Shape } from "../../../../interfaces/trasteel/refractories/shapes";
import { roundDecimals } from "../../../../helpers/utils";
import { RouterService } from "../../../../services/common/router";

@Component({
  tag: "modal-project-update",
  styleUrl: "modal-project-update.scss",
})
export class ModalProjectUpdate {
  @Element() el: HTMLElement;
  @Prop({ mutable: true }) projectId: string = undefined;
  @Prop() duplicateProject: Project = undefined;
  @State() project: Project;
  @State() updateView = true;
  @State() scrollTop = 0;
  @State() allocationAreaSegment: any = "add";
  @State() areaShapes: { areaIndex: number; shapes: Shape[] }[] = [];
  @State() lastPosition = 1;
  @State() positions = [];
  @State() previousMassItems = null;
  @State() selectedCustomer: MapDataCustomer;
  @State() selectedRows: number[] = [];
  @State() undoHistory: Project[] = [];
  @State() currentUndoStep: number = 0;
  listOfSpecialShapes = ["spout-block", "door-block", "starter-set"];

  lastSelectedRowIndex: number = null;
  validProject = false;
  titles = [
    { tag: "summary", text: "Summary", disabled: false },
    { tag: "information", text: "Information", disabled: false },
    { tag: "shaped", text: "Shaped", disabled: false },
    { tag: "unshaped", text: "Unshaped", disabled: false },
    { tag: "files", text: "Files", disabled: true },
  ];
  @State() slider: Swiper;
  userProfile: UserProfile;
  userProfileSub$: Subscription;
  reorderGroup: any;

  async componentWillLoad() {
    this.userProfileSub$ = UserService.userProfile$.subscribe(
      (userProfile: UserProfile) => {
        this.userProfile = new UserProfile(userProfile);
      }
    );
    await this.loadProject();
    this.preventShiftSelect();
    this.checkKeyboardEvent();
  }

  checkKeyboardEvent() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "canc") {
        //prevent deleting the focused input with canc
        event.preventDefault();
      }
      if (event.key === "Escape") {
        //prevent deleting the focused input with canc
        event.preventDefault();
        this.undo();
      }
    });
    document.addEventListener("keyup", (event) => {
      if (this.allocationAreaSegment >= 0 && this.selectedRows.length > 0) {
        //area is selected and row is selected
        const selectedRow = this.selectedRows[0];
        const maxRows =
          this.project.projectAreaQuality[this.allocationAreaSegment].courses
            .length;
        if (event.key === "canc" || event.key === "Meta") {
          event.preventDefault();
          //delete the selected course
          this.deleteAreaCourse(
            this.allocationAreaSegment,
            this.selectedRows[0]
          );
        } else if (event.key === "ArrowDown" || event.key === "Enter") {
          event.preventDefault();
          //select next course
          this.selectedRows[0] =
            selectedRow < maxRows - 1 ? selectedRow + 1 : maxRows - 1;
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          //select next course
          this.selectedRows[0] = selectedRow > 0 ? selectedRow - 1 : 0;
        }
        this.updateSlider();
      }
    });
  }

  courseFocus(courseIndex) {
    this.selectedRows = [courseIndex];
    this.updateSlider();
  }

  async loadProject() {
    await ProjectsService.downloadProjectSettings();

    if (this.projectId) {
      try {
        SystemService.replaceLoadingMessage("Loading project...");
        const res = await ProjectsService.getProject(this.projectId);
        this.project = res;
      } catch (error) {
        SystemService.dismissLoading();
        RouterService.goBack();
      }
    } else {
      //duplicate project
      this.project = new Project(this.duplicateProject);
      if (this.duplicateProject)
        this.project.projectLocalId = "NEW-" + this.project.projectLocalId;

      this.project.users = {
        [UserService.userRoles.uid]: ["owner"],
      };
    }
    if (this.project.projectAreaQuality.length > 0) {
      this.allocationAreaSegment = 0;
    }
    SystemService.replaceLoadingMessage("Loading Shapes...");
    this.areaShapes = await ProjectsService.loadShapesForApplication(
      this.project,
      true
    );
    this.resetPositions();
    //select customer
    this.selectedCustomer = CustomersService.getCustomersDetails(
      this.project.customerId
    );
    //check allocation areas
    await ProjectsService.checkBricksAllocationAreasForProject(this.project);
    this.updateUndoHistory();
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-edit-project", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
    });
    if (this.project.projectDescription) {
      //update and validate
      setTimeout(() => {
        this.validateProject();
      });
    }
    this.reorderGroup = document.querySelector("ion-reorder-group");
    this.reorderItems();

    this.reorderGroup.addEventListener("ionItemReorder", ({ detail }) => {
      // Finish the reorder and position the item in the DOM based on
      // where the gesture ended. Update the items variable to the
      // new order of items
      this.project.projectAreaQuality = detail.complete(
        this.project.projectAreaQuality
      );
      // After complete is called the items will be in the new order
      // Reorder the items in the DOM
      this.reorderItems();
    });
  }

  reorderItems() {
    const items = this.project.projectAreaQuality;
    this.reorderGroup.replaceChildren();
    let reordered = "";
    for (const area of items) {
      reordered += `
      <ion-item>
        <ion-label>
          ${
            area.bricksAllocationAreaId
              ? ProjectsService.getBricksAllocationAreas(
                  area.bricksAllocationAreaId
                )[0].bricksAllocationAreaName.en
              : null
          }
        </ion-label>
        <ion-reorder slot="end"></ion-reorder>
      </ion-item>
    `;
    }
    this.reorderGroup.innerHTML = reordered;
    this.validateProject();
  }

  disconnectedCallback() {
    this.userProfileSub$.unsubscribe();
  }

  handleChange(ev) {
    this.project[ev.detail.name] = ev.detail.value;
    this.updateUndoHistory();
    this.validateProject();
  }

  validateProject() {
    this.validProject =
      isString(this.project.projectDescription) &&
      this.project.customerId != null &&
      this.project.docsCaption != null &&
      this.project.projectLocalId != null;

    this.updateSlider();
  }

  async openSelectCustomer() {
    const cust = await CustomersService.openSelectCustomer(
      this.selectedCustomer
    );
    if (cust) {
      this.project.customerId = cust.id;
      this.selectedCustomer = cust;
      this.updateUndoHistory();
    }
  }

  async openSelectDataSheet(area, index, mass = false) {
    const ds = await DatasheetsService.openSelectDataSheet(
      DatasheetsService.getDatasheetsById(area.datasheetId)
    );
    if (ds) {
      const datasheet = await DatasheetsService.getDatasheet(ds.id);
      if (mass) {
        this.project.projectMass[index].datasheetId = ds.id;
        this.project.projectMass[index].density = datasheet.getDensity();
      } else {
        this.project.projectAreaQuality[index].datasheetId = ds.id;
        this.project.projectAreaQuality[index].density = datasheet.getDensity();
      }
      this.updateUndoHistory();
      this.updateSlider();
    }
  }

  async openSelectShape(id, index, positionIndex) {
    const sh = await ShapesService.openSelectShape(
      ShapesService.getShapeById(id)
    );
    if (sh) {
      if (this.project.projectAreaQuality[index].courses.length > 0) {
        const alert = await alertController.create({
          header: "Change Shape",
          message: TranslationService.getTransl(
            "recalculate-message",
            "This will re-calculate all exisiting courses! Are you sure?"
          ),
          buttons: [
            {
              text: TranslationService.getTransl("cancel", "Cancel"),
              handler: async () => {},
            },
            {
              text: TranslationService.getTransl("ok", "OK"),
              handler: async () => {
                this.replaceShape(sh.id, index, positionIndex);
              },
            },
          ],
        });
        alert.present();
      } else {
        await this.setShape(sh.id, index, positionIndex);
        this.updateUndoHistory();
        this.updateSlider();
      }
    }
  }

  async setShape(id, areaIndex, positionIndex) {
    const shape = await ShapesService.getShape(id);
    shape["shapeId"] = id;
    this.project.projectAreaQuality[areaIndex].shapes[positionIndex].shapeId =
      id;
    const isSpecial = some(this.listOfSpecialShapes, (substring) =>
      id.includes(substring)
    );
    let specialShapeVolume = null;
    if (isSpecial) {
      specialShapeVolume = shape.volume;
    }
    this.project.projectAreaQuality[areaIndex].shapes[
      positionIndex
    ].specialShapeVolume = specialShapeVolume;
    this.areaShapes[areaIndex].shapes[positionIndex] = shape;
  }

  async replaceShape(id, areaIndex, positionIndex) {
    //recalculate all courses
    if (id) {
      await this.setShape(id, areaIndex, positionIndex);
      //recalculate when the shape is new
      ProjectsService.recalculateExistingCourses(
        this.project,
        this.areaShapes,
        areaIndex
      );
    }
    this.updateUndoHistory();
    this.updateSlider();
  }

  selectCustomer(ev) {
    this.project.customerId = ev.detail.value;
    this.validateProject();
  }

  /* 
  *
  PROJECTS AREA COURSES 
  *
  */

  handleCourseRowClick(rowIndex: number, event: MouseEvent) {
    if (event.shiftKey && this.lastSelectedRowIndex !== null) {
      // Previene l'azione predefinita del browser, che sarebbe la selezione del testo
      event.preventDefault();
      this.selectedRows = [];
      const start = Math.min(this.lastSelectedRowIndex, rowIndex);
      const end = Math.max(this.lastSelectedRowIndex, rowIndex);
      for (let i = start; i <= end; i++) {
        this.selectedRows.push(i);
      }
    } else {
      this.selectedRows = [rowIndex];
    }
    this.lastSelectedRowIndex = rowIndex;
    this.selectedRows = orderBy([...this.selectedRows], null, "desc"); // order in descending for update delete operations
    this.updateUndoHistory();
    this.updateSlider();
  }

  addAllocationArea() {
    this.project.projectAreaQuality.push(new ProjectAreaQuality());
    this.areaShapes.push({
      areaIndex: this.project.projectAreaQuality.length - 1,
      shapes: [],
    });
    this.allocationAreaSegment = this.project.projectAreaQuality.length - 1;
    this.updateUndoHistory();
    this.updateSlider();
    this.reorderItems();
  }

  selectApplicationUnit(ev) {
    this.project.applicationId = ev.detail.value;
    this.updateUndoHistory();
    this.validateProject();
  }

  allocationAreaSegmentChanged(ev) {
    if (ev.detail.value !== "add") {
      this.allocationAreaSegment = ev.detail.value;
    }
    this.lastSelectedRowIndex = null;
    this.selectedRows = [];
    this.updateUndoHistory();
    this.updateSlider();
    this.reorderItems();
  }

  async deleteAllocationArea(index) {
    const alert = await alertController.create({
      header: "Delete Area",
      message: "Are you sure you want to delete this area?",
      buttons: [
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          role: "cancel",
          handler: async () => {},
        },
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: async () => {
            //remove positions
            for (
              let posIndex = 0;
              posIndex < this.project.projectAreaQuality[index].shapes.length;
              posIndex++
            ) {
              this.deleteAllocationAreaPosition(index, posIndex);
            }
            //delete area
            this.project.projectAreaQuality.splice(index, 1);
            this.areaShapes.splice(index, 1);
            this.allocationAreaSegment =
              this.project.projectAreaQuality.length > 0 ? 0 : "add";
            this.updateUndoHistory();
            this.reorderItems();
          },
        },
      ],
    });
    alert.present();
  }

  async addAllocationAreaPosition(index) {
    const areaShape = new ProjectAreaQualityShape();
    areaShape.position = this.lastPosition;
    this.project.projectAreaQuality[index].shapes.push(areaShape);
    const shape = new Shape();
    this.areaShapes[index].shapes.push(shape);
    this.resetPositions();
    this.updateUndoHistory();
    this.updateSlider();
  }

  deleteAllocationAreaPosition(index, positionIndex) {
    //const areaShape =
    //this.project.projectAreaQuality[index].shapes[positionIndex];
    //this.removePosition(areaShape.position);
    this.project.projectAreaQuality[index].shapes.splice(positionIndex, 1);
    this.resetPositions();
    this.updateUndoHistory();
    this.updateSlider();
  }

  selectAllocationArea(index, ev) {
    this.project.projectAreaQuality[index].bricksAllocationAreaId =
      ev.detail.value;
    this.updateUndoHistory();
    this.updateSlider();
    this.reorderItems();
  }

  handleAllocationAreaChange(index, ev) {
    this.project.projectAreaQuality[index][ev.detail.name] = ev.detail.value;
    this.updateUndoHistory();
    this.updateSlider();
    this.reorderItems();
  }

  handleSpecialShapeVolume(index, positionIndex, ev) {
    const value = toNumber(ev.detail.value);
    this.project.projectAreaQuality[index].shapes[
      positionIndex
    ].specialShapeVolume = value;
    this.updateUndoHistory();
    this.updateSlider();
  }

  async handleAllocationAreaPositionChange(index, positionIndex, ev) {
    const value = toNumber(ev.detail.value);
    const oldShapeValue =
      this.project.projectAreaQuality[index].shapes[positionIndex];
    const apply = await this.checkPosition(index, positionIndex, value);
    switch (apply) {
      case "same":
        //do nothing
        break;
      case "keep":
        this.project.projectAreaQuality[index].shapes[positionIndex] =
          oldShapeValue;
        //reset value of app-form-item
        ev.target["forceResetValue"](oldShapeValue.position);
        break;
      case "new":
        //add new
        this.project.projectAreaQuality[index].shapes[positionIndex].position =
          value;
        break;
      case "replace":
        //replace with position with the same shape
        this.project.projectAreaQuality[index].shapes[positionIndex].position =
          value;
        this.replaceShape(null, index, positionIndex);
        break;
      default:
        //replace with new shape
        this.project.projectAreaQuality[index].shapes[positionIndex].position =
          value;
        this.replaceShape(apply.shapeId, index, positionIndex);
        break;
    }
    this.updateUndoHistory();
    this.resetPositions();
    this.updateSlider();
  }

  //check position
  checkPosition(areaIndex, positionIndex, newPos): Promise<any> {
    return new Promise(async (resolve) => {
      //find shape with same position
      if (
        this.project.projectAreaQuality[areaIndex].shapes[positionIndex]
          .position != newPos
      ) {
        //check all positions
        let otherShape: Shape;
        for (
          let areaIndex = 0;
          areaIndex < this.project.projectAreaQuality.length;
          areaIndex++
        ) {
          const area = this.project.projectAreaQuality[areaIndex];
          const sameShapeIndex = area.shapes.findIndex(
            (x) => x.position == newPos
          );
          if (sameShapeIndex != -1) {
            otherShape = this.areaShapes[areaIndex].shapes[sameShapeIndex];
            break;
          }
        }
        //check if shape is the same
        let sameShape = false;
        if (
          otherShape &&
          otherShape["shapeId"] ==
            this.areaShapes[areaIndex].shapes[positionIndex]["shapeId"]
        ) {
          sameShape = true;
        }
        if (sameShape) {
          //existing position other shape
          const alert = await alertController.create({
            header: "Existing position",
            message:
              "This position is already present with the same shape.\n Do you want to replace the position?",
            buttons: [
              {
                text: TranslationService.getTransl("ok", "OK"),
                handler: async () => {
                  resolve("replace");
                },
              },
              {
                text: TranslationService.getTransl("cancel", "Cancel"),
                handler: async () => {
                  resolve("keep");
                },
              },
            ],
          });
          alert.present();
        } else if (otherShape) {
          //existing position other shape
          const alert = await alertController.create({
            header: "Existing position",
            message:
              "This position is already present with following shape: " +
              otherShape.shapeName +
              "\n Do you want to use/replace with the same shape and recalculate all?",
            buttons: [
              {
                text: TranslationService.getTransl("ok", "OK"),
                handler: async () => {
                  resolve(sameShape);
                },
              },
              {
                text: TranslationService.getTransl("cancel", "Cancel"),
                handler: async () => {
                  resolve("keep");
                },
              },
            ],
          });
          alert.present();
        } else {
          resolve("new");
        }
      } else {
        resolve("same");
      }
    });
  }

  resetPositions() {
    this.positions = [];
    this.project.projectAreaQuality.forEach((area) => {
      area.shapes.forEach((position) => {
        const pos = position.position;
        if (!this.positions.includes(pos)) {
          this.positions.push(pos);
        }
      });
    });
    this.project.projectMass.forEach((mass) => {
      const pos = mass.position;
      if (!this.positions.includes(pos)) {
        this.positions.push(pos);
      }
    });
    // Sort the array
    this.positions = orderBy(this.positions, null, "asc");
    //update last Position

    // Initialize variables to track the empty positions and maximum number
    let firstEmptyPosition = null;
    // Iterate through the sorted array to find gaps
    for (let i = 1; i < this.positions.length; i++) {
      const current = this.positions[i];
      const previous = this.positions[i - 1];
      // Check if there's a gap between previous and current
      if (current - previous > 1) {
        const gapStart = previous + 1;
        // Set the first empty position if not already set
        if (firstEmptyPosition === null) {
          firstEmptyPosition = gapStart;
          break;
        }
      }
    }
    this.lastPosition = firstEmptyPosition
      ? firstEmptyPosition
      : max(this.positions) + 1;
  }

  addAreaCourses(areaIndex) {
    const course = new ProjectCourse();
    course.courseNumber = this.getNextCourseNumber(areaIndex);
    const lastCourse =
      this.project.projectAreaQuality[areaIndex].courses[
        this.project.projectAreaQuality[areaIndex].courses.length - 1
      ];
    if (lastCourse) course.innerRadius = lastCourse.innerRadius;
    this.project.projectAreaQuality[areaIndex].courses.push(course);
    //recalculate new added course
    ProjectsService.recalculateExistingCourses(
      this.project,
      this.areaShapes,
      areaIndex,
      this.project.projectAreaQuality[areaIndex].courses.length - 1
    );
    this.updateUndoHistory();
    this.updateSlider();
  }

  getNextCourseNumber(index) {
    const max = maxBy(
      this.project.projectAreaQuality[index].courses,
      "courseNumber"
    );
    return max ? max.courseNumber + 1 : 1;
  }

  async autoFillCourses(index) {
    const popover = await popoverController.create({
      component: "popover-project-autofill",
      componentProps: {
        autoFillCourses: this.project.projectAreaQuality[index].autoFillCourses
          ? this.project.projectAreaQuality[index].autoFillCourses
          : new AutoFillCourses(),
        shapes: this.project.projectAreaQuality[index].shapes,
        bottom:
          this.project.projectAreaQuality[index].bricksAllocationAreaId ===
          "bottom",
      },
      event: null,
      translucent: true,
    });
    popover.onDidDismiss().then(async (ev) => {
      if (ev && ev.data) {
        if (this.project.projectAreaQuality[index].courses.length > 0) {
          this.checkAutofill(index, ev.data);
        } else {
          ProjectsService.calculateAutofill(
            this.project,
            this.areaShapes,
            index,
            ev.data
          );
          this.updateUndoHistory();
          this.updateSlider();
        }
      }
    });
    popover.present();
  }

  async checkAutofill(index, data) {
    const alert = await alertController.create({
      header: "Auto Fill",
      message: TranslationService.getTransl(
        "auto-fill-message",
        "This will remove all exisiting courses. Are you sure?"
      ),
      buttons: [
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          handler: async () => {},
        },
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: async () => {
            ProjectsService.calculateAutofill(
              this.project,
              this.areaShapes,
              index,
              data
            );
            this.updateSlider();
          },
        },
      ],
    });
    alert.present();
  }

  disableAddPositionButton(index) {
    const shapes = this.areaShapes[index].shapes;
    let disable = false;
    shapes.forEach((shape) => {
      if (!shape.shapeName || shape.shapeTypeId == "su-brick") disable = true;
    });
    return disable;
  }

  disableAddCourses(area: ProjectAreaQuality) {
    let disable = false;
    if (area.shapes.length == 0) {
      disable = true;
    } else {
      area.shapes.forEach((shape) => {
        disable = disable || shape.shapeId == null;
      });
    }
    return disable;
  }

  preventShiftSelect() {
    // Aggiungi un listener per l'evento 'mousedown' sul documento
    document.addEventListener("mousedown", function (e) {
      // Controlla se il tasto Shift è premuto durante il click
      if (e.shiftKey) {
        // Previene l'azione predefinita del browser, che potrebbe includere la selezione del testo
        e.preventDefault();
      }
    });
  }

  duplicateAreaCourse(index, courseIndex) {
    if (!this.selectedRows || this.selectedRows.length == 0) {
      this.selectedRows = [courseIndex];
    }
    const positions = [];
    this.selectedRows.forEach((courseIndex) => {
      const item = cloneDeep(
        this.project.projectAreaQuality[index].courses[courseIndex]
      );
      positions.push(item.courseNumber);
      item.courseNumber = this.getNextCourseNumber(index);
      this.project.projectAreaQuality[index].courses.push(item);
    });

    let indexes = "";
    orderBy(positions, null, "asc").forEach((x) => {
      if (x >= 0) indexes = indexes + x + ", ";
    });
    indexes = indexes.slice(0, -2);
    SystemService.presentAlert(
      "Duplicate Course(s)",
      "Positions(s) #" + indexes + " duplicated"
    );
    this.updateUndoHistory();
    this.updateSlider();
  }

  deleteAreaCourse(index, courseIndex) {
    if (!this.selectedRows || this.selectedRows.length == 0) {
      this.selectedRows = [courseIndex];
    }
    const positions = [];
    this.selectedRows.forEach((courseIndex) => {
      //delete course
      positions.push(
        this.project.projectAreaQuality[index].courses[courseIndex].courseNumber
      );
      this.project.projectAreaQuality[index].courses.splice(courseIndex, 1);
    });
    let indexes = "";
    orderBy(positions, null, "asc").forEach((x) => {
      if (x >= 0) indexes = indexes + x + ", ";
    });
    indexes = indexes.slice(0, -2);
    SystemService.presentAlert(
      "Delete Course(s)",
      "Positions(s) #" + indexes + " deleted"
    );
    this.selectedRows = [];
    this.lastSelectedRowIndex = null;
    this.updateUndoHistory();
    this.updateSlider();
  }

  reorderCourses(index) {
    this.project.projectAreaQuality[index].courses = orderBy(
      this.project.projectAreaQuality[index].courses,
      "courseNumber",
      "asc"
    );
    this.updateSlider();
  }

  async handleAreaCourse(
    course: ProjectCourse,
    ev,
    areaIndex?: number,
    courseIndex?: number
  ) {
    const n = ev.detail.name;
    const v = ev.detail.value;
    //calculate quantities
    if (n == "startAngle" || n == "endAngle" || n == "innerRadius") {
      course[n] = v;
      ProjectsService.recalculateExistingCourses(
        this.project,
        this.areaShapes,
        areaIndex,
        courseIndex,
        courseIndex
      );
    } else if (n == "courseNumber") {
      //check duplicate
      if (
        some(this.project.projectAreaQuality[areaIndex].courses, [
          "courseNumber",
          v,
        ])
      ) {
        const prev = course[n];
        const alert = await alertController.create({
          header: "Existing course",
          message: "This course is already exisiting!",
          buttons: [
            {
              text: TranslationService.getTransl("ok", "OK"),
              handler: async () => {
                ev.target["forceResetValue"](prev);
              },
            },
          ],
        });
        alert.present();
      } else {
        course[n] = v;
      }
    } else {
      course[n] = v;
    }
    this.updateUndoHistory();
    this.updateView = !this.updateView;
  }

  handleAreaCourseQuantity(course, shapeId, shapeIndex, ev) {
    course.quantityShapes[shapeIndex] = {
      shapeId: shapeId,
      quantity: ev.detail.value,
    };
    this.updateUndoHistory();
    this.updateView = !this.updateView;
  }

  updateUndoHistory() {
    this.undoHistory.push(cloneDeep(this.project));
    this.currentUndoStep = this.undoHistory.length - 1;
  }

  undo() {
    //first undo is the original project
    if (this.currentUndoStep > 0) {
      this.undoHistory = this.undoHistory.slice(0, this.currentUndoStep);
      this.currentUndoStep -= 1;
    }
    this.project = this.undoHistory[this.currentUndoStep];
    this.updateSlider();
  }

  /* 
  *
  PROJECT MASSES 
  *
  */

  async addProjectMasses() {
    const mass = new ProjectMass();
    mass.position = this.lastPosition; //await this.updatePostion();
    this.project.projectMass.push(mass);
    this.updateUndoHistory();
    this.updateSlider();
  }

  async handleMassPositionBlur(index, ev) {
    //remove previous position
    //this.removePosition(this.project.projectMass[index].position);
    //let v = await this.updatePostion(ev.detail.value);
    this.project.projectMass[index].position = toNumber(ev.detail.value);
    this.resetPositions();
    this.updateUndoHistory();
    this.updateSlider();
  }

  handleMassChange(index, ev) {
    this.project.projectMass[index][ev.detail.name] = ev.detail.value;
    if (ev.detail.name == "quantity") {
      if (this.project.projectMass[index].quantity > 0) {
        if (this.project.projectMass[index].weightPerUnitKg > 0) {
          this.project.projectMass[index].totalWeightMT = roundDecimals(
            (this.project.projectMass[index].quantity *
              this.project.projectMass[index].weightPerUnitKg) /
              1000,
            1
          );
        }
      } else {
        this.project.projectMass[index].totalWeightMT = 0;
        this.project.projectMass[index].quantity = 0;
      }
    } else if (ev.detail.name == "weightPerUnitKg") {
      if (this.project.projectMass[index].weightPerUnitKg > 0) {
        if (this.project.projectMass[index].totalWeightMT > 0) {
          this.project.projectMass[index].quantity = roundDecimals(
            (this.project.projectMass[index].totalWeightMT /
              this.project.projectMass[index].weightPerUnitKg) *
              1000,
            1
          );
        }
      } else {
        this.project.projectMass[index].totalWeightMT = 0;
        this.project.projectMass[index].quantity = 0;
      }
    } else if (ev.detail.name == "totalWeightMT") {
      if (this.project.projectMass[index].totalWeightMT > 0) {
        if (this.project.projectMass[index].weightPerUnitKg > 0) {
          this.project.projectMass[index].quantity = roundDecimals(
            (this.project.projectMass[index].totalWeightMT /
              this.project.projectMass[index].weightPerUnitKg) *
              1000,
            1
          );
        }
      } else {
        this.project.projectMass[index].quantity = 0;
        this.project.projectMass[index].weightPerUnitKg = 0;
      }
    }
    this.previousMassItems = ev.detail.name;
    this.updateUndoHistory();
    this.updateSlider();
  }

  selectMassApplicationArea(index, ev) {
    this.project.projectMass[index].bricksAllocationAreaId = ev.detail.value;
    this.updateUndoHistory();
    this.updateSlider();
  }

  selectMassQtyUnit(index, ev) {
    this.project.projectMass[index].quantityUnit = ev.detail.value;
    this.updateUndoHistory();
    this.updateSlider();
  }

  deleteProjectMass(index) {
    //this.removePosition(this.project.projectMass[index].position);
    this.project.projectMass.splice(index, 1);
    this.resetPositions();
    this.updateUndoHistory();
    this.updateSlider();
  }

  /* 
  *
  COMMON 
  *
  */

  updateSlider() {
    this.updateView = !this.updateView;
    //wait for view to update and then reset slider height
    setTimeout(() => {
      this.slider ? this.slider.update() : undefined;
    }, 100);
  }

  async deleteProject() {
    try {
      await ProjectsService.deleteProject(this.projectId);
      modalController.dismiss();
    } catch (error) {
      if (error) SystemService.presentAlertError(error);
    }
  }

  async save(dismiss = true) {
    const doc = await ProjectsService.updateProject(
      this.projectId,
      this.project,
      this.userProfile.uid
    );
    if (this.projectId) {
      return dismiss ? modalController.dismiss(this.project) : true;
    } else {
      this.projectId = doc.id;
      return true;
    }
  }

  async cancel() {
    return modalController.dismiss();
  }

  render() {
    return (
      <Host>
        <app-header-segment-toolbar
          color={Environment.getAppColor()}
          swiper={this.slider}
          titles={this.titles}
          segment={1}
        ></app-header-segment-toolbar>
        <ion-content
          class='slides'
          onIonScroll={(ev) => (this.scrollTop = ev.detail.scrollTop)}
        >
          <swiper-container class='slider-edit-project swiper'>
            <swiper-wrapper class='swiper-wrapper'>
              {/** SUMMARY */}
              <swiper-slide class='swiper-slide'>
                <app-page-project-summary
                  project={this.project}
                  areaShapes={this.areaShapes}
                  updateSummary={this.updateView}
                ></app-page-project-summary>
              </swiper-slide>
              {/** INFORMATION */}
              <swiper-slide class='swiper-slide'>
                <ion-list class='ion-no-padding project-grid'>
                  <ion-item
                    button
                    lines='inset'
                    onClick={() => this.openSelectCustomer()}
                  >
                    <ion-label>
                      <p class='small'>
                        <my-transl tag='customer' text='Customer'></my-transl>*
                      </p>
                      <h2>
                        {this.selectedCustomer
                          ? this.selectedCustomer.fullName
                          : null}
                      </h2>
                    </ion-label>
                  </ion-item>
                  <app-form-item
                    lines='inset'
                    label-tag='project-name'
                    label-text='Project Name'
                    value={this.project.projectLocalId}
                    name='projectLocalId'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    lines='inset'
                    label-tag='technical-docs-caption'
                    label-text='Technical Docs Caption'
                    value={this.project.docsCaption}
                    name='docsCaption'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    lines='inset'
                    label-tag='project-description'
                    label-text='Project Description'
                    value={this.project.projectDescription}
                    name='projectDescription'
                    input-type='text'
                    textRows={2}
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    lines='inset'
                    label-tag='drawing-no'
                    label-text='Drawing No.'
                    value={this.project.drawing}
                    name='drawing'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                  ></app-form-item>
                  <app-form-item
                    lines='inset'
                    label-tag='sets-no'
                    label-text='No. of sets'
                    value={this.project.setsAmount}
                    name='setsAmount'
                    input-type='number'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                  ></app-form-item>
                  <ion-item-divider>
                    <my-transl
                      tag='project-dates'
                      text='Project Dates'
                    ></my-transl>
                  </ion-item-divider>
                  <ion-grid>
                    <ion-row>
                      <ion-col>
                        <app-form-item
                          lines='inset'
                          label-tag='drawing-date'
                          label-text='Drawing Date'
                          value={this.project.drawingDate}
                          name='drawingDate'
                          input-type='date'
                          date-presentation='date'
                          prefer-wheel={false}
                          onFormItemChanged={(ev) => this.handleChange(ev)}
                        ></app-form-item>
                      </ion-col>
                      <ion-col>
                        <app-form-item
                          lines='inset'
                          label-tag='project-finished-date'
                          label-text='Project Finished Date'
                          value={this.project.finishedDate}
                          name='finishedDate'
                          input-type='date'
                          date-presentation='date'
                          prefer-wheel={false}
                          onFormItemChanged={(ev) => this.handleChange(ev)}
                        ></app-form-item>
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                  <ion-item-divider>
                    <my-transl tag='other-data' text='Other Data'></my-transl>
                  </ion-item-divider>
                  <ion-grid>
                    <ion-row>
                      <ion-col>
                        <app-form-item
                          label-tag='capacity'
                          label-text='Capacity'
                          appendText=' (MT)'
                          value={this.project.steelAmount}
                          name='steelAmount'
                          input-type='number'
                          onFormItemChanged={(ev) => this.handleChange(ev)}
                        ></app-form-item>
                      </ion-col>
                      <ion-col>
                        <app-select-search
                          label={{
                            tag: "application-unit",
                            text: "Application Unit",
                          }}
                          value={
                            this.project && this.project.applicationId
                              ? this.project.applicationId
                              : null
                          }
                          lines='inset'
                          selectFn={(ev) => this.selectApplicationUnit(ev)}
                          selectOptions={ProjectsService.getApplicationUnits()}
                          selectValueId='applicationId'
                          selectValueText={["applicationName", "en"]}
                        ></app-select-search>
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                  <app-form-item
                    label-tag='steel-amount'
                    label-text='Steel Amount'
                    appendText=' (MT)'
                    value={this.project.steelAmount}
                    name='steelAmount'
                    input-type='number'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                  ></app-form-item>
                  <app-form-item
                    label-tag='steel-density'
                    label-text='Steel Density'
                    appendText=' (g/cm3)'
                    value={this.project.liquidMetalDensity}
                    name='liquidMetalDensity'
                    input-type='number'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                  ></app-form-item>
                  <app-form-item
                    label-tag='guaranteed-lifetime'
                    label-text='Guaranteed Lifetime'
                    appendText=' (heats)'
                    value={this.project.guaranteedLife}
                    name='guaranteedLife'
                    input-type='number'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                  ></app-form-item>
                </ion-list>
                {this.projectId ? (
                  <ion-footer class='ion-no-border'>
                    <ion-toolbar>
                      <ion-button
                        expand='block'
                        fill='outline'
                        color='danger'
                        onClick={() => this.deleteProject()}
                      >
                        <ion-icon slot='start' name='trash'></ion-icon>
                        <my-transl
                          tag='delete'
                          text='Delete'
                          isLabel
                        ></my-transl>
                      </ion-button>
                    </ion-toolbar>
                  </ion-footer>
                ) : undefined}
              </swiper-slide>
              {/** SHAPED */}
              <swiper-slide class='swiper-slide'>
                <div>
                  <ion-toolbar>
                    <ion-grid class='ion-no-padding'>
                      <ion-row>
                        <ion-col size='1'>
                          <ion-button
                            id='click-trigger'
                            icon-only
                            fill='clear'
                            size='small'
                          >
                            <ion-icon
                              name='reorder-four'
                              color='trasteel'
                            ></ion-icon>
                          </ion-button>
                          <ion-popover
                            trigger='click-trigger'
                            trigger-action='click'
                          >
                            <ion-content class='ion-padding'>
                              <ion-list>
                                <ion-reorder-group
                                  disabled={false}
                                ></ion-reorder-group>
                              </ion-list>
                            </ion-content>
                          </ion-popover>
                        </ion-col>
                        <ion-col>
                          <ion-segment
                            mode='ios'
                            scrollable
                            onIonChange={(ev) =>
                              this.allocationAreaSegmentChanged(ev)
                            }
                            value={this.allocationAreaSegment}
                          >
                            {this.project.projectAreaQuality.map(
                              (area, index) => (
                                <ion-segment-button
                                  value={index}
                                  layout='icon-start'
                                >
                                  <ion-label>
                                    {area.bricksAllocationAreaId
                                      ? ProjectsService.getBricksAllocationAreas(
                                          area.bricksAllocationAreaId
                                        )[0].bricksAllocationAreaName.en
                                      : null}
                                  </ion-label>
                                </ion-segment-button>
                              )
                            )}
                            <ion-segment-button
                              value='add'
                              onClick={() => this.addAllocationArea()}
                              layout='icon-start'
                            >
                              <ion-label>
                                {"+ " +
                                  TranslationService.getTransl(
                                    "add-area",
                                    "Add Area"
                                  )}
                              </ion-label>
                            </ion-segment-button>
                          </ion-segment>
                        </ion-col>
                      </ion-row>
                    </ion-grid>
                  </ion-toolbar>
                  {this.project.projectAreaQuality.map((area, index) => (
                    <div>
                      {this.allocationAreaSegment == index ? (
                        <div>
                          <ion-grid>
                            <ion-row>
                              <ion-col>
                                <app-select-search
                                  class='reduce-padding'
                                  label={{
                                    tag: "bricks-allocation-area",
                                    text: "Bricks Allocation Area",
                                  }}
                                  labelAddText='*'
                                  value={area.bricksAllocationAreaId}
                                  lines='inset'
                                  selectFn={(ev) =>
                                    this.selectAllocationArea(index, ev)
                                  }
                                  selectOptions={ProjectsService.getBricksAllocationAreas()}
                                  selectValueId='bricksAllocationAreaId'
                                  selectValueText={[
                                    "bricksAllocationAreaName",
                                    "en",
                                  ]}
                                ></app-select-search>
                              </ion-col>
                              <ion-col size='1'>
                                <ion-button
                                  fill='clear'
                                  color='danger'
                                  icon-only
                                  onClick={() =>
                                    this.deleteAllocationArea(index)
                                  }
                                >
                                  <ion-icon name='trash'></ion-icon>
                                </ion-button>
                              </ion-col>
                            </ion-row>
                            <ion-row>
                              <ion-col>
                                <ion-item
                                  button
                                  lines='inset'
                                  onClick={() =>
                                    this.openSelectDataSheet(area, index)
                                  }
                                  class='reduce-padding'
                                >
                                  <ion-label>
                                    <p class='small'>
                                      <my-transl
                                        tag='datasheet'
                                        text='Datasheet'
                                      ></my-transl>
                                    </p>
                                    <h2>
                                      {area.datasheetId
                                        ? DatasheetsService.getDatasheetsById(
                                            area.datasheetId
                                          ).productName
                                        : ""}
                                    </h2>
                                  </ion-label>
                                </ion-item>
                              </ion-col>
                              <ion-col size='4'>
                                <app-form-item
                                  lines='inset'
                                  label-tag='density'
                                  label-text='Density'
                                  appendText=' (g/cm3)'
                                  value={area.density}
                                  name='density'
                                  input-type='number'
                                  onFormItemChanged={(ev) =>
                                    this.handleAllocationAreaChange(index, ev)
                                  }
                                ></app-form-item>
                              </ion-col>
                            </ion-row>
                            <ion-row>
                              <ion-col>
                                <app-form-item
                                  lines='inset'
                                  class='reduce-padding'
                                  label-tag='include-safety'
                                  label-text='Include Safety'
                                  appendText={" %"}
                                  value={area.includeSafety}
                                  name='includeSafety'
                                  input-type='number'
                                  inputStep='1'
                                  onFormItemChanged={(ev) =>
                                    this.handleAllocationAreaChange(index, ev)
                                  }
                                ></app-form-item>
                              </ion-col>
                              <ion-col size='4'>
                                <app-form-item
                                  lines='inset'
                                  label-tag='only-for-repair'
                                  label-text='Only for repair'
                                  value={area.onlyForRepair}
                                  name='onlyForRepair'
                                  input-type='boolean'
                                  onFormItemChanged={(ev) =>
                                    this.handleAllocationAreaChange(index, ev)
                                  }
                                ></app-form-item>
                              </ion-col>
                            </ion-row>
                            <ion-row>
                              <ion-col>
                                <app-form-item
                                  lines='inset'
                                  class='reduce-padding'
                                  label-tag='comments'
                                  label-text='Comments'
                                  value={area.comments}
                                  name='comments'
                                  input-type='string'
                                  onFormItemChanged={(ev) =>
                                    this.handleAllocationAreaChange(index, ev)
                                  }
                                ></app-form-item>
                              </ion-col>
                            </ion-row>
                            <div class='positions-box ion-no-padding project-grid'>
                              {area.shapes
                                ? area.shapes.map((shape, positionIndex) => (
                                    <ion-row>
                                      <ion-col size='3'>
                                        <app-form-item
                                          showItem={false}
                                          label-tag={
                                            positionIndex == 0
                                              ? "position"
                                              : null
                                          }
                                          label-text={
                                            positionIndex == 0
                                              ? "Position"
                                              : null
                                          }
                                          value={shape.position}
                                          name='position'
                                          input-type='number'
                                          inputStep='1'
                                          debounce={300}
                                          onFormItemChanged={(ev) =>
                                            this.handleAllocationAreaPositionChange(
                                              index,
                                              positionIndex,
                                              ev
                                            )
                                          }
                                          class='reduce-padding-top'
                                        ></app-form-item>
                                      </ion-col>
                                      <ion-col>
                                        <ion-item
                                          button
                                          lines='none'
                                          onClick={() =>
                                            this.openSelectShape(
                                              area.shapes[positionIndex]
                                                .shapeId,
                                              index,
                                              positionIndex
                                            )
                                          }
                                          class='reduce-padding-top'
                                        >
                                          <ion-label>
                                            {positionIndex == 0 ? (
                                              <p
                                                style={{
                                                  color: "black",
                                                  "font-size": "0.75rem",
                                                }}
                                              >
                                                <my-transl
                                                  tag='shape'
                                                  text='Shape'
                                                ></my-transl>
                                              </p>
                                            ) : null}

                                            <h2>
                                              {area.shapes[positionIndex]
                                                .shapeId
                                                ? ShapesService.getShapeById(
                                                    area.shapes[positionIndex]
                                                      .shapeId
                                                  ).shapeName
                                                : ""}
                                            </h2>
                                          </ion-label>
                                        </ion-item>
                                      </ion-col>
                                      <ion-col size='2'>
                                        <app-item-detail
                                          showItem={false}
                                          labelTag={
                                            positionIndex == 0 ? "radius" : null
                                          }
                                          labelText={
                                            positionIndex == 0 ? "Radius" : null
                                          }
                                          appendText={
                                            positionIndex == 0 ? " (mm)" : null
                                          }
                                          detailText={
                                            this.areaShapes &&
                                            this.areaShapes[index] &&
                                            this.areaShapes[index].shapes[
                                              positionIndex
                                            ] &&
                                            this.areaShapes[index].shapes[
                                              positionIndex
                                            ].radius > 0
                                              ? this.areaShapes[index].shapes[
                                                  positionIndex
                                                ].radius +
                                                (this.areaShapes[index].shapes[
                                                  positionIndex
                                                ].radius_max > 0
                                                  ? "-" +
                                                    this.areaShapes[index]
                                                      .shapes[positionIndex]
                                                      .radius_max
                                                  : "")
                                              : "-"
                                          }
                                        ></app-item-detail>
                                      </ion-col>
                                      <ion-col size='2'>
                                        {
                                          //check if special shape - add possibility to change the value
                                          this.areaShapes &&
                                          this.areaShapes[index] &&
                                          this.areaShapes[index].shapes[
                                            positionIndex
                                          ] &&
                                          this.areaShapes[index].shapes[
                                            positionIndex
                                          ]["shapeId"] &&
                                          some(
                                            this.listOfSpecialShapes,
                                            (substring) =>
                                              this.areaShapes[index].shapes[
                                                positionIndex
                                              ]["shapeId"].includes(substring)
                                          ) ? (
                                            <app-form-item
                                              showItem={false}
                                              labelTag={
                                                positionIndex == 0
                                                  ? "volume"
                                                  : null
                                              }
                                              labelText={
                                                positionIndex == 0
                                                  ? "Volume"
                                                  : null
                                              }
                                              appendText={
                                                positionIndex == 0
                                                  ? " (dm3)"
                                                  : null
                                              }
                                              value={
                                                this.project.projectAreaQuality[
                                                  index
                                                ].shapes[positionIndex]
                                                  .specialShapeVolume > 0
                                                  ? this.project
                                                      .projectAreaQuality[index]
                                                      .shapes[positionIndex]
                                                      .specialShapeVolume
                                                  : this.areaShapes[index]
                                                      .shapes[positionIndex]
                                                      .volume
                                              }
                                              input-type='number'
                                              inputStep='1'
                                              debounce={300}
                                              onFormItemChanged={(ev) =>
                                                this.handleSpecialShapeVolume(
                                                  index,
                                                  positionIndex,
                                                  ev
                                                )
                                              }
                                              class='reduce-padding-top'
                                            ></app-form-item>
                                          ) : (
                                            <app-item-detail
                                              showItem={false}
                                              labelTag={
                                                positionIndex == 0
                                                  ? "weight"
                                                  : null
                                              }
                                              labelText={
                                                positionIndex == 0
                                                  ? "Weight"
                                                  : null
                                              }
                                              appendText={
                                                positionIndex == 0
                                                  ? " (Kg)"
                                                  : null
                                              }
                                              detailText={
                                                this.areaShapes &&
                                                this.areaShapes[index] &&
                                                this.areaShapes[index].shapes[
                                                  positionIndex
                                                ] &&
                                                this.areaShapes[index].shapes[
                                                  positionIndex
                                                ].getWeight(area.density) > 0
                                                  ? this.areaShapes[
                                                      index
                                                    ].shapes[
                                                      positionIndex
                                                    ].getWeight(area.density)
                                                  : "-"
                                              }
                                            ></app-item-detail>
                                          )
                                        }
                                      </ion-col>
                                      {area.courses.length == 0 ? (
                                        <ion-col size='1'>
                                          <ion-button
                                            fill='clear'
                                            color='danger'
                                            icon-only
                                            onClick={() =>
                                              this.deleteAllocationAreaPosition(
                                                index,
                                                positionIndex
                                              )
                                            }
                                          >
                                            <ion-icon name='trash'></ion-icon>
                                          </ion-button>
                                        </ion-col>
                                      ) : undefined}
                                    </ion-row>
                                  ))
                                : undefined}
                              {area.courses.length == 0 ? (
                                <ion-row>
                                  <ion-col>
                                    <ion-button
                                      expand='block'
                                      fill='outline'
                                      size='small'
                                      color='trasteel'
                                      disabled={this.disableAddPositionButton(
                                        index
                                      )}
                                      onClick={() =>
                                        this.addAllocationAreaPosition(index)
                                      }
                                    >
                                      {"+ " +
                                        TranslationService.getTransl(
                                          "add-position",
                                          "Add position"
                                        )}
                                    </ion-button>
                                  </ion-col>
                                </ion-row>
                              ) : undefined}
                            </div>
                            <ion-row>
                              <ion-col>
                                <ion-button
                                  expand='block'
                                  fill='outline'
                                  size='small'
                                  color='trasteel'
                                  disabled={this.disableAddCourses(area)}
                                  onClick={() => this.autoFillCourses(index)}
                                >
                                  {TranslationService.getTransl(
                                    "auto-fill",
                                    "Auto Fill"
                                  )}
                                </ion-button>
                              </ion-col>
                              <ion-col>
                                <ion-button
                                  expand='block'
                                  fill='outline'
                                  size='small'
                                  color='trasteel'
                                  disabled={this.disableAddCourses(area)}
                                  onClick={() => {
                                    ProjectsService.recalculateExistingCourses(
                                      this.project,
                                      this.areaShapes,
                                      index
                                    );
                                    this.updateSlider();
                                  }}
                                >
                                  {TranslationService.getTransl(
                                    "recalculate",
                                    "Re-Calculate"
                                  )}
                                </ion-button>
                              </ion-col>
                            </ion-row>
                          </ion-grid>
                          <div id='responsive-grid'>
                            <ion-grid>
                              <ion-row class='header ion-align-items-center ion-justify-content-center ext-row'>
                                <ion-col size='11' size-lg='11'>
                                  <ion-row>
                                    <ion-col
                                      size='12'
                                      size-lg='4'
                                      class='ext-col'
                                    >
                                      <ion-row class='inner-row1'>
                                        <ion-col
                                          size='3'
                                          size-lg='3'
                                          class='inner-col'
                                        >
                                          <ion-button
                                            expand='full'
                                            fill='clear'
                                            size='small'
                                            color='light'
                                            class='ion-no-padding'
                                            onClick={() =>
                                              this.reorderCourses(index)
                                            }
                                          >
                                            <ion-label color='light'>
                                              {TranslationService.getTransl(
                                                "course",
                                                "Course"
                                              )}
                                            </ion-label>
                                            <ion-icon
                                              color='light'
                                              slot='end'
                                              name='swap-vertical-outline'
                                            ></ion-icon>
                                          </ion-button>
                                        </ion-col>
                                        <ion-col
                                          size='3'
                                          size-lg='3'
                                          class='inner-col'
                                        >
                                          <ion-button
                                            expand='full'
                                            fill='clear'
                                            color='light'
                                            size='small'
                                            class='ion-no-padding'
                                          >
                                            <ion-label color='light'>
                                              {TranslationService.getTransl(
                                                "start",
                                                "Start"
                                              ) + " °"}
                                            </ion-label>
                                          </ion-button>
                                        </ion-col>
                                        <ion-col
                                          size='3'
                                          size-lg='3'
                                          class='inner-col'
                                        >
                                          <ion-button
                                            expand='full'
                                            fill='clear'
                                            color='light'
                                            size='small'
                                            class='ion-no-padding'
                                          >
                                            <ion-label color='light'>
                                              {TranslationService.getTransl(
                                                "end",
                                                "End"
                                              ) + " °"}
                                            </ion-label>
                                          </ion-button>
                                        </ion-col>
                                        <ion-col
                                          size='3'
                                          size-lg='3'
                                          class='inner-col'
                                        >
                                          <ion-button
                                            expand='full'
                                            fill='clear'
                                            size='small'
                                            class='ion-no-padding'
                                          >
                                            <ion-label color='light'>
                                              {TranslationService.getTransl(
                                                "radius",
                                                "Radius"
                                              ) + " (mm)"}
                                            </ion-label>
                                          </ion-button>
                                        </ion-col>
                                      </ion-row>
                                    </ion-col>
                                    <ion-col
                                      size='12'
                                      size-lg='8'
                                      class='ext-col'
                                    >
                                      <ion-row class='inner-row2'>
                                        <ion-col size='2' class='inner-col'>
                                          {"Pos. " +
                                            area.shapes.map(
                                              (shape) => shape.position
                                            )}
                                        </ion-col>
                                        <ion-col size='2' class='inner-col'>
                                          {TranslationService.getTransl(
                                            "quantity",
                                            "Quantity"
                                          )}
                                        </ion-col>
                                        <ion-col size='2' class='inner-col'>
                                          {TranslationService.getTransl(
                                            "sum",
                                            "Sum"
                                          )}
                                        </ion-col>
                                        <ion-col size='2' class='inner-col'>
                                          {TranslationService.getTransl(
                                            "repair-sets",
                                            "Repair Sets"
                                          )}
                                        </ion-col>
                                        <ion-col size='2' class='inner-col'>
                                          {TranslationService.getTransl(
                                            "weight",
                                            "Weight"
                                          ) + " (Kg)"}
                                        </ion-col>
                                        <ion-col size='2' class='inner-col'>
                                          {TranslationService.getTransl(
                                            "row-weight",
                                            "Row Weight"
                                          ) + " (Kg)"}
                                        </ion-col>
                                      </ion-row>
                                    </ion-col>
                                  </ion-row>
                                </ion-col>
                                <ion-col size='1' size-lg='1'>
                                  {TranslationService.getTransl(
                                    "duplicate",
                                    "Duplicate"
                                  ) +
                                    "/" +
                                    TranslationService.getTransl(
                                      "delete",
                                      "Delete"
                                    )}
                                </ion-col>
                              </ion-row>
                              {/** COURSES ROWS */}
                              {area.courses.map((course, courseIndex) => [
                                <ion-row
                                  class={
                                    "ion-align-items-center ion-justify-content-center ext-row" +
                                    (this.selectedRows &&
                                    this.selectedRows.includes(courseIndex)
                                      ? " courseSelected"
                                      : "")
                                  }
                                  onClick={(ev) =>
                                    this.handleCourseRowClick(courseIndex, ev)
                                  }
                                >
                                  <ion-col size='11' size-lg='11'>
                                    <ion-row>
                                      <ion-col
                                        size='12'
                                        size-lg='4'
                                        class='ext-col'
                                      >
                                        <ion-row class='inner-row1'>
                                          <ion-col
                                            size='3'
                                            size-lg='3'
                                            class='inner-col'
                                          >
                                            <app-form-item
                                              shortItem
                                              value={course.courseNumber}
                                              name='courseNumber'
                                              input-type='number'
                                              inputStep='1'
                                              debounce={300}
                                              onFormItemChanged={(ev) =>
                                                this.handleAreaCourse(
                                                  course,
                                                  ev,
                                                  index
                                                )
                                              }
                                              onFocus={() =>
                                                this.courseFocus(courseIndex)
                                              }
                                            ></app-form-item>
                                          </ion-col>
                                          <ion-col
                                            size='3'
                                            size-lg='3'
                                            class='inner-col'
                                          >
                                            <app-form-item
                                              shortItem
                                              value={course.startAngle}
                                              name='startAngle'
                                              input-type='number'
                                              inputStep='1'
                                              onFormItemChanged={(ev) =>
                                                this.handleAreaCourse(
                                                  course,
                                                  ev,
                                                  index,
                                                  courseIndex
                                                )
                                              }
                                            ></app-form-item>
                                          </ion-col>
                                          <ion-col
                                            size='3'
                                            size-lg='3'
                                            class='inner-col'
                                          >
                                            <app-form-item
                                              shortItem
                                              value={course.endAngle}
                                              name='endAngle'
                                              input-type='number'
                                              inputStep='1'
                                              onFormItemChanged={(ev) =>
                                                this.handleAreaCourse(
                                                  course,
                                                  ev,
                                                  index,
                                                  courseIndex
                                                )
                                              }
                                            ></app-form-item>
                                          </ion-col>
                                          <ion-col
                                            size='3'
                                            size-lg='3'
                                            class='inner-col'
                                          >
                                            <app-form-item
                                              shortItem
                                              value={course.innerRadius}
                                              name='innerRadius'
                                              input-type='number'
                                              inputStep='1'
                                              onFormItemChanged={(ev) =>
                                                this.handleAreaCourse(
                                                  course,
                                                  ev,
                                                  index,
                                                  courseIndex
                                                )
                                              }
                                            ></app-form-item>
                                          </ion-col>
                                        </ion-row>
                                      </ion-col>
                                      <ion-col
                                        size='12'
                                        size-lg='8'
                                        class='ext-col'
                                      >
                                        {area.shapes.map(
                                          (shape, shapeIndex) => (
                                            <ion-row class='inner-row2'>
                                              <ion-col
                                                size='2'
                                                class='inner-col'
                                              >
                                                <app-item-detail
                                                  showItem={false}
                                                  detailText={ShapesService.getShapeName(
                                                    shape.shapeId
                                                  )}
                                                ></app-item-detail>
                                              </ion-col>
                                              <ion-col
                                                size='2'
                                                class='inner-col'
                                              >
                                                <app-form-item
                                                  shortItem
                                                  style={
                                                    course.quantityShapes
                                                      .length > 0 &&
                                                    course.quantityShapes[
                                                      shapeIndex
                                                    ].quantity < 0
                                                      ? {
                                                          "--ion-background-color":
                                                            "red",
                                                        }
                                                      : null
                                                  }
                                                  value={
                                                    course.quantityShapes
                                                      .length > 0 &&
                                                    course.quantityShapes[
                                                      shapeIndex
                                                    ]
                                                      ? course.quantityShapes[
                                                          shapeIndex
                                                        ].quantity
                                                      : 0
                                                  }
                                                  name='quantity'
                                                  input-type='number'
                                                  inputStep='1'
                                                  onFormItemChanged={(ev) =>
                                                    this.handleAreaCourseQuantity(
                                                      course,
                                                      shape.shapeId,
                                                      shapeIndex,
                                                      ev
                                                    )
                                                  }
                                                ></app-form-item>
                                              </ion-col>
                                              <ion-col
                                                size='2'
                                                class={
                                                  "inner-col" +
                                                  (shapeIndex > 0
                                                    ? " emptyCell"
                                                    : "")
                                                }
                                              >
                                                <app-item-detail
                                                  showItem={false}
                                                  detailText={
                                                    shapeIndex == 0
                                                      ? ProjectsService.countTotalQuantity(
                                                          course
                                                        )
                                                      : undefined
                                                  }
                                                ></app-item-detail>
                                              </ion-col>
                                              <ion-col
                                                size='2'
                                                class={
                                                  "inner-col" +
                                                  (shapeIndex > 0
                                                    ? " emptyCell"
                                                    : "")
                                                }
                                              >
                                                {shapeIndex == 0 ? (
                                                  <app-form-item
                                                    shortItem
                                                    value={course.repairSets}
                                                    name='repairSets'
                                                    input-type='number'
                                                    inputStep='1'
                                                    disabled={
                                                      area.onlyForRepair
                                                    }
                                                    onFormItemChanged={(ev) =>
                                                      this.handleAreaCourse(
                                                        course,
                                                        ev
                                                      )
                                                    }
                                                  ></app-form-item>
                                                ) : undefined}
                                              </ion-col>
                                              <ion-col
                                                size='2'
                                                class='inner-col'
                                              >
                                                <app-item-detail
                                                  showItem={false}
                                                  detailText={ProjectsService.getAreaCourseWeightForShape(
                                                    this.project,
                                                    this.areaShapes,
                                                    index,
                                                    courseIndex,
                                                    shapeIndex
                                                  )}
                                                ></app-item-detail>
                                              </ion-col>
                                              <ion-col
                                                size='2'
                                                class={
                                                  "inner-col" +
                                                  (shapeIndex > 0
                                                    ? " emptyCell"
                                                    : "")
                                                }
                                              >
                                                <app-item-detail
                                                  showItem={false}
                                                  detailText={
                                                    shapeIndex == 0
                                                      ? ProjectsService.getTotalWeightForCourse(
                                                          this.project,
                                                          this.areaShapes,
                                                          index,
                                                          courseIndex
                                                        )
                                                      : undefined
                                                  }
                                                ></app-item-detail>
                                              </ion-col>
                                            </ion-row>
                                          )
                                        )}
                                      </ion-col>
                                    </ion-row>
                                  </ion-col>
                                  <ion-col size='1' size-lg='1'>
                                    <ion-button
                                      fill='clear'
                                      color='primary'
                                      icon-only
                                      class='button-no-margin'
                                      onClick={() =>
                                        this.duplicateAreaCourse(
                                          index,
                                          courseIndex
                                        )
                                      }
                                    >
                                      <ion-icon name='copy'></ion-icon>
                                    </ion-button>
                                    <ion-button
                                      fill='clear'
                                      color='danger'
                                      icon-only
                                      class='button-no-margin'
                                      onClick={() =>
                                        this.deleteAreaCourse(
                                          index,
                                          courseIndex
                                        )
                                      }
                                    >
                                      <ion-icon name='trash'></ion-icon>
                                    </ion-button>
                                  </ion-col>
                                </ion-row>,
                                <ion-row class='separator'>
                                  <ion-col></ion-col>
                                </ion-row>,
                              ])}
                            </ion-grid>

                            <ion-button
                              expand='block'
                              fill='outline'
                              size='small'
                              color='trasteel'
                              disabled={this.disableAddCourses(area)}
                              onClick={() => this.addAreaCourses(index)}
                            >
                              {"+ " +
                                TranslationService.getTransl(
                                  "add-course",
                                  "Add Course"
                                )}
                            </ion-button>
                          </div>
                        </div>
                      ) : undefined}
                    </div>
                  ))}
                </div>
              </swiper-slide>
              {/** UNSHAPED */}
              <swiper-slide class='swiper-slide'>
                <div>
                  <ion-grid>
                    {this.project.projectMass.map((mass, index) => [
                      <ion-row>
                        <ion-col>
                          <app-form-item
                            label-tag='position'
                            label-text='Position'
                            value={mass.position}
                            name='position'
                            input-type='number'
                            onFormItemBlur={(ev) =>
                              this.handleMassPositionBlur(index, ev)
                            }
                          ></app-form-item>
                        </ion-col>
                        <ion-col>
                          <app-select-search
                            label={{
                              tag: "application-area",
                              text: "Application Area",
                            }}
                            labelAddText='*'
                            value={mass.bricksAllocationAreaId}
                            lines='inset'
                            selectFn={(ev) =>
                              this.selectMassApplicationArea(index, ev)
                            }
                            selectOptions={ProjectsService.getBricksAllocationAreas()}
                            selectValueId='bricksAllocationAreaId'
                            selectValueText={["bricksAllocationAreaName", "en"]}
                          ></app-select-search>
                        </ion-col>
                      </ion-row>,
                      <ion-row>
                        <ion-col>
                          <ion-item
                            button
                            lines='inset'
                            onClick={() =>
                              this.openSelectDataSheet(mass, index, true)
                            }
                          >
                            <ion-label>
                              <p class='small'>
                                <my-transl
                                  tag='datasheet'
                                  text='Datasheet'
                                ></my-transl>
                              </p>
                              <h2>
                                {mass.datasheetId
                                  ? DatasheetsService.getDatasheetsById(
                                      mass.datasheetId
                                    ).productName
                                  : ""}
                              </h2>
                            </ion-label>
                          </ion-item>
                        </ion-col>
                        <ion-col>
                          <app-form-item
                            label-tag='density'
                            label-text='Density'
                            appendText=' (g/cm3)'
                            value={mass.density}
                            name='density'
                            input-type='number'
                            onFormItemChanged={(ev) =>
                              this.handleMassChange(index, ev)
                            }
                          ></app-form-item>
                        </ion-col>
                      </ion-row>,
                      <ion-row>
                        <ion-col>
                          <ion-label>
                            <ion-item lines='none'>
                              <ion-label>
                                <p
                                  style={{
                                    "font-size": "0.75rem",
                                    color: "black",
                                    "text-align": "left",
                                  }}
                                >
                                  <my-transl
                                    tag='quantity'
                                    text='Quantity'
                                  ></my-transl>
                                </p>
                                <h2
                                  style={{
                                    "text-align": "left",
                                  }}
                                >
                                  {mass.quantity}
                                </h2>
                              </ion-label>
                            </ion-item>
                          </ion-label>
                        </ion-col>
                        <ion-col>
                          <ion-select
                            color='trasteel'
                            id='selectMassQtyUnit'
                            interface='action-sheet'
                            label={TranslationService.getTransl("unit", "Unit")}
                            label-placement='floating'
                            onIonChange={(ev) =>
                              this.selectMassQtyUnit(index, ev)
                            }
                            value={mass.quantityUnit}
                          >
                            {ProjectsService.getQuantityUnits().map((unit) => (
                              <ion-select-option value={unit.quantityUnitId}>
                                {unit.quantityUnitName.en}
                              </ion-select-option>
                            ))}
                          </ion-select>
                        </ion-col>
                        <ion-col size='1'>
                          <p
                            style={{
                              "text-align": "center",
                              "font-size": "1.3rem",
                            }}
                          >
                            x
                          </p>
                        </ion-col>
                        <ion-col>
                          <app-form-item
                            label-tag='weight-per-unit'
                            label-text='Weight per Unit'
                            appendText=' (Kg)'
                            value={mass.weightPerUnitKg}
                            name='weightPerUnitKg'
                            input-type='number'
                            onFormItemChanged={(ev) =>
                              this.handleMassChange(index, ev)
                            }
                          ></app-form-item>
                        </ion-col>
                        <ion-col size='1'>
                          <p
                            style={{
                              "text-align": "center",
                              "font-size": "1.3rem",
                            }}
                          >
                            =
                          </p>
                        </ion-col>
                        <ion-col>
                          <app-form-item
                            label-tag='total-weight'
                            label-text='Total Weight'
                            appendText=' (MT)'
                            value={mass.totalWeightMT}
                            name='totalWeightMT'
                            input-type='number'
                            onFormItemChanged={(ev) =>
                              this.handleMassChange(index, ev)
                            }
                          ></app-form-item>
                        </ion-col>
                        <ion-col
                          size='1'
                          style={{
                            "text-align": "center",
                          }}
                        >
                          <ion-button
                            style={{
                              "padding-top": "12px",
                            }}
                            fill='clear'
                            color='danger'
                            icon-only
                            onClick={() => this.deleteProjectMass(index)}
                          >
                            <ion-icon name='trash'></ion-icon>
                          </ion-button>
                        </ion-col>
                      </ion-row>,
                      <ion-row class='separator'>
                        <ion-col></ion-col>
                      </ion-row>,
                    ])}
                    <ion-row>
                      <ion-col>
                        <ion-button
                          expand='block'
                          fill='outline'
                          size='small'
                          color='trasteel'
                          onClick={() => this.addProjectMasses()}
                        >
                          {"+ " +
                            TranslationService.getTransl(
                              "add-mass",
                              "Add Mass"
                            )}
                        </ion-button>
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                </div>
              </swiper-slide>
              {/** FILES */}
              <swiper-slide class='swiper-slide'>
                FILES - TO BE DONE
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          disableSave={!this.validProject}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
