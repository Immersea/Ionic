import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { U as UserService, w as UserProfile, ag as ProjectsService, j as CustomersService, B as SystemService, R as RouterService, ak as Project, O as DatasheetsService, al as ShapesService, T as TranslationService, am as ProjectAreaQuality, an as ProjectAreaQualityShape, ao as Shape, ap as ProjectCourse, aq as AutoFillCourses, ar as ProjectMass, as as roundDecimals } from './utils-ced1e260.js';
import { E as Environment } from './env-c3ad5e77.js';
import { a as alertController, p as popoverController, m as modalController } from './overlays-b3ceb97d.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
import './ionic-global-c07767bf.js';
import './index-93ceac82.js';
import './helpers-ff3eb5b3.js';
import './ios.transition-4bc5d5e6.js';
import './md.transition-b118d52a.js';
import './cubic-bezier-acda64df.js';
import './index-493838d0.js';
import './gesture-controller-a0857859.js';
import './config-45217ee2.js';
import './theme-6bada181.js';
import './index-f47409f3.js';
import './hardware-back-button-da755485.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-fe092362.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
import './framework-delegate-779ab78c.js';

const modalProjectUpdateCss = "modal-project-update .small{font-size:0.75rem;color:black}modal-project-update .project-grid{--ion-grid-column-padding:0px}modal-project-update .reduce-padding{position:relative;left:-16px}modal-project-update .reduce-padding-top{position:relative;top:-10px;--ion-item-background:rgba(255, 255, 255, 0)}modal-project-update .separator{background-color:var(--ion-color-trasteel-tint);height:3px}modal-project-update .separator ion-col{height:0px !important}modal-project-update .positions-box{margin-top:10px;padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:10px;border:1px solid black}modal-project-update #responsive-grid ion-grid{--ion-grid-padding:5px;--ion-grid-column-padding:0px}modal-project-update #responsive-grid ion-grid .header{background-color:var(--ion-color-trasteel);font-size:0.75rem;font-weight:bold;color:var(--ion-color-trasteel-contrast)}modal-project-update #responsive-grid ion-grid .courseSelected{background-color:var(--ion-color-trasteel-tint)}modal-project-update #responsive-grid ion-grid .emptyCell{background-color:var(--ion-color-trasteel-tint)}modal-project-update #responsive-grid ion-grid .noborder{border:0px}modal-project-update #responsive-grid ion-grid ion-col{align-items:center;justify-content:center;text-align:center}modal-project-update #responsive-grid ion-grid .ext-row{border:1px solid black}modal-project-update #responsive-grid ion-grid .ext-col{border-right:0px solid black}modal-project-update #responsive-grid ion-grid .inner-row1{border-bottom:1px solid black}modal-project-update #responsive-grid ion-grid .inner-row1 .top-border{border-top:0px solid black}modal-project-update #responsive-grid ion-grid .inner-row1 .top-border1{border-top:1px solid black}@media screen and (min-width: 992px){modal-project-update #responsive-grid ion-grid .inner-row1 .top-border{border-top:1px solid black}modal-project-update #responsive-grid ion-grid .inner-row1 .top-border1{border-top:0px solid black}}modal-project-update #responsive-grid ion-grid .inner-row1 .inner-col2{border-right:1px solid black}@media screen and (min-width: 992px){modal-project-update #responsive-grid ion-grid .inner-row1 .inner-col2{border-right:0px solid black}}modal-project-update #responsive-grid ion-grid .inner-row1:last-child{border-bottom:1px solid black}@media screen and (min-width: 992px){modal-project-update #responsive-grid ion-grid .inner-row1:last-child{border-bottom:0px solid black}}modal-project-update #responsive-grid ion-grid .inner-row1a{border-top:0px solid black}modal-project-update #responsive-grid ion-grid .inner-row1a .inner-col1{border-right:0px solid black}modal-project-update #responsive-grid ion-grid .inner-row1a .inner-col1:first-child{border-right:1px solid black}@media screen and (min-width: 992px){modal-project-update #responsive-grid ion-grid .inner-row1a{border-top:1px solid black}modal-project-update #responsive-grid ion-grid .inner-row1a .inner-col1{border-right:1px solid black}}modal-project-update #responsive-grid ion-grid .inner-row1a .inner-col1:last-child{border-right:0px solid black}modal-project-update #responsive-grid ion-grid .inner-row2{border-bottom:1px solid black;border-left:0px solid black}@media screen and (min-width: 992px){modal-project-update #responsive-grid ion-grid .inner-row2{border-left:1px solid black}}modal-project-update #responsive-grid ion-grid .inner-row2:last-child{border-bottom:0px solid black}modal-project-update #responsive-grid ion-grid .inner-col{border-right:1px solid black}modal-project-update #responsive-grid ion-grid .button-no-margin{--padding-top:0px;--padding-bottom:0px;--padding-start:5px;--padding-end:5px}@media screen and (min-width: 1100px){modal-project-update #responsive-grid ion-grid .button-no-margin{--padding-start:10px;--padding-end:10px}}";

const ModalProjectUpdate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.listOfSpecialShapes = ["spout-block", "door-block", "starter-set"];
        this.lastSelectedRowIndex = null;
        this.validProject = false;
        this.titles = [
            { tag: "summary", text: "Summary", disabled: false },
            { tag: "information", text: "Information", disabled: false },
            { tag: "shaped", text: "Shaped", disabled: false },
            { tag: "unshaped", text: "Unshaped", disabled: false },
            { tag: "files", text: "Files", disabled: true },
        ];
        this.projectId = undefined;
        this.duplicateProject = undefined;
        this.project = undefined;
        this.updateView = true;
        this.scrollTop = 0;
        this.allocationAreaSegment = "add";
        this.areaShapes = [];
        this.lastPosition = 1;
        this.positions = [];
        this.previousMassItems = null;
        this.selectedCustomer = undefined;
        this.selectedRows = [];
        this.undoHistory = [];
        this.currentUndoStep = 0;
        this.slider = undefined;
    }
    async componentWillLoad() {
        this.userProfileSub$ = UserService.userProfile$.subscribe((userProfile) => {
            this.userProfile = new UserProfile(userProfile);
        });
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
                const maxRows = this.project.projectAreaQuality[this.allocationAreaSegment].courses
                    .length;
                if (event.key === "canc" || event.key === "Meta") {
                    event.preventDefault();
                    //delete the selected course
                    this.deleteAreaCourse(this.allocationAreaSegment, this.selectedRows[0]);
                }
                else if (event.key === "ArrowDown" || event.key === "Enter") {
                    event.preventDefault();
                    //select next course
                    this.selectedRows[0] =
                        selectedRow < maxRows - 1 ? selectedRow + 1 : maxRows - 1;
                }
                else if (event.key === "ArrowUp") {
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
                const res = await ProjectsService.getProject(this.projectId);
                this.project = res;
                if (this.project.projectAreaQuality.length > 0) {
                    this.allocationAreaSegment = 0;
                }
                this.areaShapes = await ProjectsService.loadShapesForApplication(this.project);
                this.resetPositions();
                //select customer
                this.selectedCustomer = CustomersService.getCustomersDetails(this.project.customerId);
                //check allocation areas
                await ProjectsService.checkBricksAllocationAreasForProject(this.project);
            }
            catch (error) {
                SystemService.dismissLoading();
                RouterService.goBack();
            }
        }
        else {
            this.project = new Project(this.duplicateProject);
            if (this.duplicateProject)
                this.project.projectLocalId = "NEW-" + this.project.projectLocalId;
            this.project.users = {
                [UserService.userRoles.uid]: ["owner"],
            };
        }
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
        const reorderGroup = document.querySelector("ion-reorder-group");
        reorderItems(this.project.projectAreaQuality);
        reorderGroup.addEventListener("ionItemReorder", ({ detail }) => {
            // Finish the reorder and position the item in the DOM based on
            // where the gesture ended. Update the items variable to the
            // new order of items
            this.project.projectAreaQuality = detail.complete(this.project.projectAreaQuality);
            // Reorder the items in the DOM
            reorderItems(this.project.projectAreaQuality);
            // After complete is called the items will be in the new order
            this.validateProject();
        });
        function reorderItems(items) {
            reorderGroup.replaceChildren();
            let reordered = "";
            for (const area of items) {
                reordered += `
        <ion-item>
          <ion-label>
            ${area.bricksAllocationAreaId
                    ? ProjectsService.getBricksAllocationAreas(area.bricksAllocationAreaId)[0].bricksAllocationAreaName.en
                    : null}
          </ion-label>
          <ion-reorder slot="end"></ion-reorder>
        </ion-item>
      `;
            }
            reorderGroup.innerHTML = reordered;
        }
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
            lodash.exports.isString(this.project.projectDescription) &&
                this.project.customerId != null &&
                this.project.docsCaption != null &&
                this.project.projectLocalId != null;
        this.updateSlider();
    }
    async openSelectCustomer() {
        const cust = await CustomersService.openSelectCustomer(this.selectedCustomer);
        if (cust) {
            this.project.customerId = cust.id;
            this.selectedCustomer = cust;
            this.updateUndoHistory();
        }
    }
    async openSelectDataSheet(area, index, mass = false) {
        const ds = await DatasheetsService.openSelectDataSheet(DatasheetsService.getDatasheetsById(area.datasheetId));
        if (ds) {
            const datasheet = await DatasheetsService.getDatasheet(ds.id);
            if (mass) {
                this.project.projectMass[index].datasheetId = ds.id;
                this.project.projectMass[index].density = datasheet.getDensity();
            }
            else {
                this.project.projectAreaQuality[index].datasheetId = ds.id;
                this.project.projectAreaQuality[index].density = datasheet.getDensity();
            }
            this.updateUndoHistory();
            this.updateSlider();
        }
    }
    async openSelectShape(id, index, positionIndex) {
        const sh = await ShapesService.openSelectShape(ShapesService.getShapeById(id));
        if (sh) {
            if (this.project.projectAreaQuality[index].courses.length > 0) {
                const alert = await alertController.create({
                    header: "Change Shape",
                    message: TranslationService.getTransl("recalculate-message", "This will re-calculate all exisiting courses! Are you sure?"),
                    buttons: [
                        {
                            text: TranslationService.getTransl("cancel", "Cancel"),
                            handler: async () => { },
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
            }
            else {
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
        const isSpecial = lodash.exports.some(this.listOfSpecialShapes, (substring) => id.includes(substring));
        let specialShapeVolume = null;
        if (isSpecial) {
            specialShapeVolume = shape.volume;
        }
        this.project.projectAreaQuality[areaIndex].shapes[positionIndex].specialShapeVolume = specialShapeVolume;
        this.areaShapes[areaIndex].shapes[positionIndex] = shape;
    }
    async replaceShape(id, areaIndex, positionIndex) {
        //recalculate all courses
        if (id) {
            await this.setShape(id, areaIndex, positionIndex);
            //recalculate when the shape is new
            ProjectsService.recalculateExistingCourses(this.project, this.areaShapes, areaIndex);
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
    handleCourseRowClick(rowIndex, event) {
        if (event.shiftKey && this.lastSelectedRowIndex !== null) {
            // Previene l'azione predefinita del browser, che sarebbe la selezione del testo
            event.preventDefault();
            this.selectedRows = [];
            const start = Math.min(this.lastSelectedRowIndex, rowIndex);
            const end = Math.max(this.lastSelectedRowIndex, rowIndex);
            for (let i = start; i <= end; i++) {
                this.selectedRows.push(i);
            }
        }
        else {
            this.selectedRows = [rowIndex];
        }
        this.lastSelectedRowIndex = rowIndex;
        this.selectedRows = lodash.exports.orderBy([...this.selectedRows], null, "desc"); // order in descending for update delete operations
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
    }
    async deleteAllocationArea(index) {
        const alert = await alertController.create({
            header: "Delete Area",
            message: "Are you sure you want to delete this area?",
            buttons: [
                {
                    text: TranslationService.getTransl("cancel", "Cancel"),
                    role: "cancel",
                    handler: async () => { },
                },
                {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: async () => {
                        //remove positions
                        for (let posIndex = 0; posIndex < this.project.projectAreaQuality[index].shapes.length; posIndex++) {
                            this.deleteAllocationAreaPosition(index, posIndex);
                        }
                        //delete area
                        this.project.projectAreaQuality.splice(index, 1);
                        this.areaShapes.splice(index, 1);
                        this.allocationAreaSegment =
                            this.project.projectAreaQuality.length > 0 ? 0 : "add";
                        this.updateUndoHistory();
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
    }
    handleAllocationAreaChange(index, ev) {
        this.project.projectAreaQuality[index][ev.detail.name] = ev.detail.value;
        this.updateUndoHistory();
        this.updateSlider();
    }
    handleSpecialShapeVolume(index, positionIndex, ev) {
        const value = lodash.exports.toNumber(ev.detail.value);
        this.project.projectAreaQuality[index].shapes[positionIndex].specialShapeVolume = value;
        this.updateUndoHistory();
        this.updateSlider();
    }
    async handleAllocationAreaPositionChange(index, positionIndex, ev) {
        const value = lodash.exports.toNumber(ev.detail.value);
        const oldShapeValue = this.project.projectAreaQuality[index].shapes[positionIndex];
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
    checkPosition(areaIndex, positionIndex, newPos) {
        return new Promise(async (resolve) => {
            //find shape with same position
            if (this.project.projectAreaQuality[areaIndex].shapes[positionIndex]
                .position != newPos) {
                //check all positions
                let otherShape;
                for (let areaIndex = 0; areaIndex < this.project.projectAreaQuality.length; areaIndex++) {
                    const area = this.project.projectAreaQuality[areaIndex];
                    const sameShapeIndex = area.shapes.findIndex((x) => x.position == newPos);
                    if (sameShapeIndex != -1) {
                        otherShape = this.areaShapes[areaIndex].shapes[sameShapeIndex];
                        break;
                    }
                }
                //check if shape is the same
                let sameShape = false;
                if (otherShape &&
                    otherShape["shapeId"] ==
                        this.areaShapes[areaIndex].shapes[positionIndex]["shapeId"]) {
                    sameShape = true;
                }
                if (sameShape) {
                    //existing position other shape
                    const alert = await alertController.create({
                        header: "Existing position",
                        message: "This position is already present with the same shape.\n Do you want to replace the position?",
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
                }
                else if (otherShape) {
                    //existing position other shape
                    const alert = await alertController.create({
                        header: "Existing position",
                        message: "This position is already present with following shape: " +
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
                }
                else {
                    resolve("new");
                }
            }
            else {
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
        this.positions = lodash.exports.orderBy(this.positions, null, "asc");
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
            : lodash.exports.max(this.positions) + 1;
    }
    addAreaCourses(areaIndex) {
        const course = new ProjectCourse();
        course.courseNumber = this.getNextCourseNumber(areaIndex);
        const lastCourse = this.project.projectAreaQuality[areaIndex].courses[this.project.projectAreaQuality[areaIndex].courses.length - 1];
        if (lastCourse)
            course.innerRadius = lastCourse.innerRadius;
        this.project.projectAreaQuality[areaIndex].courses.push(course);
        //recalculate new added course
        ProjectsService.recalculateExistingCourses(this.project, this.areaShapes, areaIndex, this.project.projectAreaQuality[areaIndex].courses.length - 1);
        this.updateUndoHistory();
        this.updateSlider();
    }
    getNextCourseNumber(index) {
        const max = lodash.exports.maxBy(this.project.projectAreaQuality[index].courses, "courseNumber");
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
                bottom: this.project.projectAreaQuality[index].bricksAllocationAreaId ===
                    "bottom",
            },
            event: null,
            translucent: true,
        });
        popover.onDidDismiss().then(async (ev) => {
            if (ev && ev.data) {
                if (this.project.projectAreaQuality[index].courses.length > 0) {
                    this.checkAutofill(index, ev.data);
                }
                else {
                    ProjectsService.calculateAutofill(this.project, this.areaShapes, index, ev.data);
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
            message: TranslationService.getTransl("auto-fill-message", "This will remove all exisiting courses. Are you sure?"),
            buttons: [
                {
                    text: TranslationService.getTransl("cancel", "Cancel"),
                    handler: async () => { },
                },
                {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: async () => {
                        ProjectsService.calculateAutofill(this.project, this.areaShapes, index, data);
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
            if (!shape.shapeName || shape.shapeTypeId == "su-brick")
                disable = true;
        });
        return disable;
    }
    disableAddCourses(area) {
        let disable = false;
        if (area.shapes.length == 0) {
            disable = true;
        }
        else {
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
            const item = lodash.exports.cloneDeep(this.project.projectAreaQuality[index].courses[courseIndex]);
            positions.push(item.courseNumber);
            item.courseNumber = this.getNextCourseNumber(index);
            this.project.projectAreaQuality[index].courses.push(item);
        });
        let indexes = "";
        lodash.exports.orderBy(positions, null, "asc").forEach((x) => {
            if (x >= 0)
                indexes = indexes + x + ", ";
        });
        indexes = indexes.slice(0, -2);
        SystemService.presentAlert("Duplicate Course(s)", "Positions(s) #" + indexes + " duplicated");
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
            positions.push(this.project.projectAreaQuality[index].courses[courseIndex].courseNumber);
            this.project.projectAreaQuality[index].courses.splice(courseIndex, 1);
        });
        let indexes = "";
        lodash.exports.orderBy(positions, null, "asc").forEach((x) => {
            if (x >= 0)
                indexes = indexes + x + ", ";
        });
        indexes = indexes.slice(0, -2);
        SystemService.presentAlert("Delete Course(s)", "Positions(s) #" + indexes + " deleted");
        this.selectedRows = [];
        this.lastSelectedRowIndex = null;
        this.updateUndoHistory();
        this.updateSlider();
    }
    reorderCourses(index) {
        this.project.projectAreaQuality[index].courses = lodash.exports.orderBy(this.project.projectAreaQuality[index].courses, "courseNumber", "asc");
        this.updateSlider();
    }
    async handleAreaCourse(course, ev, areaIndex, courseIndex) {
        const n = ev.detail.name;
        const v = ev.detail.value;
        //calculate quantities
        if (n == "startAngle" || n == "endAngle" || n == "innerRadius") {
            course[n] = v;
            ProjectsService.recalculateExistingCourses(this.project, this.areaShapes, areaIndex, courseIndex, courseIndex);
        }
        else if (n == "courseNumber") {
            //check duplicate
            if (lodash.exports.some(this.project.projectAreaQuality[areaIndex].courses, [
                "courseNumber",
                v,
            ])) {
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
            }
            else {
                course[n] = v;
            }
        }
        else {
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
        this.undoHistory.push(lodash.exports.cloneDeep(this.project));
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
        this.project.projectMass[index].position = lodash.exports.toNumber(ev.detail.value);
        this.resetPositions();
        this.updateUndoHistory();
        this.updateSlider();
    }
    handleMassChange(index, ev) {
        this.project.projectMass[index][ev.detail.name] = ev.detail.value;
        if (ev.detail.name == "quantity") {
            if (this.project.projectMass[index].quantity > 0) {
                if (this.project.projectMass[index].weightPerUnitKg > 0) {
                    this.project.projectMass[index].totalWeightMT = roundDecimals((this.project.projectMass[index].quantity *
                        this.project.projectMass[index].weightPerUnitKg) /
                        1000, 1);
                }
            }
            else {
                this.project.projectMass[index].totalWeightMT = 0;
                this.project.projectMass[index].quantity = 0;
            }
        }
        else if (ev.detail.name == "weightPerUnitKg") {
            if (this.project.projectMass[index].weightPerUnitKg > 0) {
                if (this.project.projectMass[index].totalWeightMT > 0) {
                    this.project.projectMass[index].quantity = roundDecimals((this.project.projectMass[index].totalWeightMT /
                        this.project.projectMass[index].weightPerUnitKg) *
                        1000, 1);
                }
            }
            else {
                this.project.projectMass[index].totalWeightMT = 0;
                this.project.projectMass[index].quantity = 0;
            }
        }
        else if (ev.detail.name == "totalWeightMT") {
            if (this.project.projectMass[index].totalWeightMT > 0) {
                if (this.project.projectMass[index].weightPerUnitKg > 0) {
                    this.project.projectMass[index].quantity = roundDecimals((this.project.projectMass[index].totalWeightMT /
                        this.project.projectMass[index].weightPerUnitKg) *
                        1000, 1);
                }
            }
            else {
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
        }
        catch (error) {
            if (error)
                SystemService.presentAlertError(error);
        }
    }
    async save(dismiss = true) {
        const doc = await ProjectsService.updateProject(this.projectId, this.project, this.userProfile.uid);
        if (this.projectId) {
            return dismiss ? modalController.dismiss(this.project) : true;
        }
        else {
            this.projectId = doc.id;
            return true;
        }
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: 'e82de6d2a3effcdaf81000d4ce53795c40de87f3' }, h("app-header-segment-toolbar", { key: 'c920152509f16422c958149b4f9fb2faefc46a86', color: Environment.getAppColor(), swiper: this.slider, titles: this.titles, segment: 1 }), h("ion-content", { key: '5727f7e91933c6c7d7b79702ef55db223cd9da0a', class: "slides", onIonScroll: (ev) => (this.scrollTop = ev.detail.scrollTop) }, h("swiper-container", { key: 'e7e9f47e6e799564e26985fac281c15d3eed56f3', class: "slider-edit-project swiper" }, h("swiper-wrapper", { key: '58c00134331eac12d56a66eba70b6a829ba145a9', class: "swiper-wrapper" }, h("swiper-slide", { key: '9bc2fca96113724ca261714b26ae74d5b0a1644b', class: "swiper-slide" }, h("app-page-project-summary", { key: '950207b910a2a3fa8a2852cbe5eff7e6406ed097', project: this.project, areaShapes: this.areaShapes, updateSummary: this.updateView })), h("swiper-slide", { key: '9c3433e44b03b7e0d4345e3f249d3e942a5abba9', class: "swiper-slide" }, h("ion-list", { key: '9f7eaad3b7b152386407f563b7d806b67a33229b', class: "ion-no-padding project-grid" }, h("ion-item", { key: 'ef0e83c518090a2a77d053703e1fd16513821156', button: true, lines: "inset", onClick: () => this.openSelectCustomer() }, h("ion-label", { key: '9fc76308826e24f1f07d55a361ac1ff0b19a9f29' }, h("p", { key: 'b2c6bb3b4455818d4adfd05f8ab78f4314d286de', class: "small" }, h("my-transl", { key: 'd26695d22152b2822db1656a6a9f067365c0cae0', tag: "customer", text: "Customer" }), "*"), h("h2", { key: '2fd6542020b66ddb8f3d0891eb53f56e0149583d' }, this.selectedCustomer
            ? this.selectedCustomer.fullName
            : null))), h("app-form-item", { key: 'b0710b9311ca2f524ad358fb574144522b341aeb', lines: "inset", "label-tag": "project-name", "label-text": "Project Name", value: this.project.projectLocalId, name: "projectLocalId", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: '3c76e3d7da0dd9fde617169558d811a1ed56fef0', lines: "inset", "label-tag": "technical-docs-caption", "label-text": "Technical Docs Caption", value: this.project.docsCaption, name: "docsCaption", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: '79efcf9416b151579ccda102ae61c438d23a4a24', lines: "inset", "label-tag": "project-description", "label-text": "Project Description", value: this.project.projectDescription, name: "projectDescription", "input-type": "text", textRows: 2, onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: '47cb9c6f3a7290c90af6c98ec013da226c8484a9', lines: "inset", "label-tag": "drawing-no", "label-text": "Drawing No.", value: this.project.drawing, name: "drawing", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev) }), h("app-form-item", { key: '5b48d27a4472209da7bbfd72930ee2623528f958', lines: "inset", "label-tag": "sets-no", "label-text": "No. of sets", value: this.project.setsAmount, name: "setsAmount", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev) }), h("ion-item-divider", { key: '2571bdf1729d8f8a77a9adef696af98e3a574ae8' }, h("my-transl", { key: '6b43cd8a088e7ae2f6181db8f3bd07fc2f6d911b', tag: "project-dates", text: "Project Dates" })), h("ion-grid", { key: '1db99d67128e58c8bb6c9b25948a673bc1db7464' }, h("ion-row", { key: '6093ef4439a6e9691ea91e9c7aa2ff07d4bae50f' }, h("ion-col", { key: '482a0d390c398414e3e674abc8d06945076effa0' }, h("app-form-item", { key: '08b293600e2d19759cb9be1bfcd2422c3c106db7', lines: "inset", "label-tag": "drawing-date", "label-text": "Drawing Date", value: this.project.drawingDate, name: "drawingDate", "input-type": "date", "date-presentation": "date", "prefer-wheel": false, onFormItemChanged: (ev) => this.handleChange(ev) })), h("ion-col", { key: 'fbb020bfcb7715c96abf9ebed894e55b14c8dda2' }, h("app-form-item", { key: '762f17c5c2c67fc1b24339620a66f84c4f612b19', lines: "inset", "label-tag": "project-finished-date", "label-text": "Project Finished Date", value: this.project.finishedDate, name: "finishedDate", "input-type": "date", "date-presentation": "date", "prefer-wheel": false, onFormItemChanged: (ev) => this.handleChange(ev) })))), h("ion-item-divider", { key: '43736480fe6f2580e56eecf19a4252947c3f5c1e' }, h("my-transl", { key: '8bc68a005c0e93e30cb1f90f0bb0cb8f004837e3', tag: "other-data", text: "Other Data" })), h("ion-grid", { key: '97d20afb3a6d0698eec11e8345e5aa0ac33d988a' }, h("ion-row", { key: '41bec94da2f67ec13527f817b322d24601996be2' }, h("ion-col", { key: '87838bac97249f9d9fb2c457841679de1921cd2f' }, h("app-form-item", { key: '4736d966d9d2ac5be5524ee1bb12e2228736b84d', "label-tag": "capacity", "label-text": "Capacity", appendText: " (MT)", value: this.project.steelAmount, name: "steelAmount", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev) })), h("ion-col", { key: 'dc6070380a1d0b12150b4c26adcaaaa8f8615000' }, h("app-select-search", { key: 'a03524eb2f1495a2dc7b6f19f238028e455004c3', label: {
                tag: "application-unit",
                text: "Application Unit",
            }, value: this.project && this.project.applicationId
                ? this.project.applicationId
                : null, lines: "inset", selectFn: (ev) => this.selectApplicationUnit(ev), selectOptions: ProjectsService.getApplicationUnits(), selectValueId: "applicationId", selectValueText: ["applicationName", "en"] })))), h("app-form-item", { key: '070d1e304a8416ef45654b76554ab8ccf5dd2a3a', "label-tag": "steel-amount", "label-text": "Steel Amount", appendText: " (MT)", value: this.project.steelAmount, name: "steelAmount", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev) }), h("app-form-item", { key: '74299d9dacdbbb495ea31083996531ab97b45034', "label-tag": "steel-density", "label-text": "Steel Density", appendText: " (g/cm3)", value: this.project.liquidMetalDensity, name: "liquidMetalDensity", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev) }), h("app-form-item", { key: '39e0c2188945ed604ff05928550cdc8bfa37af55', "label-tag": "guaranteed-lifetime", "label-text": "Guaranteed Lifetime", appendText: " (heats)", value: this.project.guaranteedLife, name: "guaranteedLife", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev) })), this.projectId ? (h("ion-footer", { class: "ion-no-border" }, h("ion-toolbar", null, h("ion-button", { expand: "block", fill: "outline", color: "danger", onClick: () => this.deleteProject() }, h("ion-icon", { slot: "start", name: "trash" }), h("my-transl", { tag: "delete", text: "Delete", isLabel: true }))))) : undefined), h("swiper-slide", { key: '4609050f4e93f86aa03a3bbc402d0ad3bde05944', class: "swiper-slide" }, h("div", { key: '329255212c22becf7ed55ee6409938bd6e693f98' }, h("ion-toolbar", { key: '1761359cc62868994091c8233a82c2363a467b26' }, h("ion-grid", { key: '37dec327b9c8513699c845b208f759f7f1f61d70', class: "ion-no-padding" }, h("ion-row", { key: '2cae69afdee86e99cbbb2ddf3791db2c6aa4e8f1' }, h("ion-col", { key: 'f0c95385e50fd89f4fd3502f95ee349255b47b2f', size: "1" }, h("ion-button", { key: 'ef1f6f864b328d3a4478fb2396ef7b7660d21d24', id: "click-trigger", "icon-only": true, fill: "clear", size: "small" }, h("ion-icon", { key: 'b3909c2e61b117383cf3786405ce5e9cbdbf338e', name: "reorder-four", color: "trasteel" })), h("ion-popover", { key: '3ab39cdad64ede0c58b299f4756074d1739d7132', trigger: "click-trigger", "trigger-action": "click" }, h("ion-content", { key: 'e7955294b3f8432eb2a6a69aece693cc9f25f377', class: "ion-padding" }, h("ion-list", { key: 'b8d2531717ca0fedde03485660cc0a63b14c866e' }, h("ion-reorder-group", { key: '6e59b5d9a6a24726074624b635f3fca0148cbb8c', disabled: false }))))), h("ion-col", { key: '909ffe00f5c977f78bdbacc0d7b164225efe387e' }, h("ion-segment", { key: 'd194e8c37658f15a1ec77d9e2f482a5dbc89cf74', mode: "ios", scrollable: true, onIonChange: (ev) => this.allocationAreaSegmentChanged(ev), value: this.allocationAreaSegment }, this.project.projectAreaQuality.map((area, index) => (h("ion-segment-button", { value: index, layout: "icon-start" }, h("ion-label", null, area.bricksAllocationAreaId
            ? ProjectsService.getBricksAllocationAreas(area.bricksAllocationAreaId)[0].bricksAllocationAreaName.en
            : null)))), h("ion-segment-button", { key: '8ced1e795e1a505fc3cfb143c7d219f59e7ef010', value: "add", onClick: () => this.addAllocationArea(), layout: "icon-start" }, h("ion-label", { key: 'bca9c21d541f5b2c11a6908da0748e7898bf11f2' }, "+ " +
            TranslationService.getTransl("add-area", "Add Area")))))))), this.project.projectAreaQuality.map((area, index) => (h("div", null, this.allocationAreaSegment == index ? (h("div", null, h("ion-grid", null, h("ion-row", null, h("ion-col", null, h("app-select-search", { class: "reduce-padding", label: {
                tag: "bricks-allocation-area",
                text: "Bricks Allocation Area",
            }, labelAddText: "*", value: area.bricksAllocationAreaId, lines: "inset", selectFn: (ev) => this.selectAllocationArea(index, ev), selectOptions: ProjectsService.getBricksAllocationAreas(), selectValueId: "bricksAllocationAreaId", selectValueText: [
                "bricksAllocationAreaName",
                "en",
            ] })), h("ion-col", { size: "1" }, h("ion-button", { fill: "clear", color: "danger", "icon-only": true, onClick: () => this.deleteAllocationArea(index) }, h("ion-icon", { name: "trash" })))), h("ion-row", null, h("ion-col", null, h("ion-item", { button: true, lines: "inset", onClick: () => this.openSelectDataSheet(area, index), class: "reduce-padding" }, h("ion-label", null, h("p", { class: "small" }, h("my-transl", { tag: "datasheet", text: "Datasheet" })), h("h2", null, area.datasheetId
            ? DatasheetsService.getDatasheetsById(area.datasheetId).productName
            : "")))), h("ion-col", { size: "4" }, h("app-form-item", { lines: "inset", "label-tag": "density", "label-text": "Density", appendText: " (g/cm3)", value: area.density, name: "density", "input-type": "number", onFormItemChanged: (ev) => this.handleAllocationAreaChange(index, ev) }))), h("ion-row", null, h("ion-col", null, h("app-form-item", { lines: "inset", class: "reduce-padding", "label-tag": "include-safety", "label-text": "Include Safety", appendText: " %", value: area.includeSafety, name: "includeSafety", "input-type": "number", inputStep: "1", onFormItemChanged: (ev) => this.handleAllocationAreaChange(index, ev) })), h("ion-col", { size: "4" }, h("app-form-item", { lines: "inset", "label-tag": "only-for-repair", "label-text": "Only for repair", value: area.onlyForRepair, name: "onlyForRepair", "input-type": "boolean", onFormItemChanged: (ev) => this.handleAllocationAreaChange(index, ev) }))), h("ion-row", null, h("ion-col", null, h("app-form-item", { lines: "inset", class: "reduce-padding", "label-tag": "comments", "label-text": "Comments", value: area.comments, name: "comments", "input-type": "string", onFormItemChanged: (ev) => this.handleAllocationAreaChange(index, ev) }))), h("div", { class: "positions-box ion-no-padding project-grid" }, area.shapes
            ? area.shapes.map((shape, positionIndex) => (h("ion-row", null, h("ion-col", { size: "3" }, h("app-form-item", { showItem: false, "label-tag": positionIndex == 0
                    ? "position"
                    : null, "label-text": positionIndex == 0
                    ? "Position"
                    : null, value: shape.position, name: "position", "input-type": "number", inputStep: "1", debounce: 300, onFormItemChanged: (ev) => this.handleAllocationAreaPositionChange(index, positionIndex, ev), class: "reduce-padding-top" })), h("ion-col", null, h("ion-item", { button: true, lines: "none", onClick: () => this.openSelectShape(area.shapes[positionIndex]
                    .shapeId, index, positionIndex), class: "reduce-padding-top" }, h("ion-label", null, positionIndex == 0 ? (h("p", { style: {
                    color: "black",
                    "font-size": "0.75rem",
                } }, h("my-transl", { tag: "shape", text: "Shape" }))) : null, h("h2", null, area.shapes[positionIndex]
                .shapeId
                ? ShapesService.getShapeById(area.shapes[positionIndex]
                    .shapeId).shapeName
                : "")))), h("ion-col", { size: "2" }, h("app-item-detail", { showItem: false, labelTag: positionIndex == 0 ? "radius" : null, labelText: positionIndex == 0 ? "Radius" : null, appendText: positionIndex == 0 ? " (mm)" : null, detailText: this.areaShapes &&
                    this.areaShapes[index] &&
                    this.areaShapes[index].shapes[positionIndex].radius > 0
                    ? this.areaShapes[index].shapes[positionIndex].radius +
                        (this.areaShapes[index].shapes[positionIndex].radius_max > 0
                            ? "-" +
                                this.areaShapes[index]
                                    .shapes[positionIndex]
                                    .radius_max
                            : "")
                    : "-" })), h("ion-col", { size: "2" }, 
            //check if special shape - add possibility to change the value
            this.areaShapes &&
                this.areaShapes[index] &&
                this.areaShapes[index].shapes[positionIndex] &&
                this.areaShapes[index].shapes[positionIndex]["shapeId"] &&
                lodash.exports.some(this.listOfSpecialShapes, (substring) => this.areaShapes[index].shapes[positionIndex]["shapeId"].includes(substring)) ? (h("app-form-item", { showItem: false, labelTag: positionIndex == 0
                    ? "volume"
                    : null, labelText: positionIndex == 0
                    ? "Volume"
                    : null, appendText: positionIndex == 0
                    ? " (dm3)"
                    : null, value: this.project.projectAreaQuality[index].shapes[positionIndex]
                    .specialShapeVolume > 0
                    ? this.project
                        .projectAreaQuality[index]
                        .shapes[positionIndex]
                        .specialShapeVolume
                    : this.areaShapes[index]
                        .shapes[positionIndex]
                        .volume, "input-type": "number", inputStep: "1", debounce: 300, onFormItemChanged: (ev) => this.handleSpecialShapeVolume(index, positionIndex, ev), class: "reduce-padding-top" })) : (h("app-item-detail", { showItem: false, labelTag: positionIndex == 0
                    ? "weight"
                    : null, labelText: positionIndex == 0
                    ? "Weight"
                    : null, appendText: positionIndex == 0
                    ? " (Kg)"
                    : null, detailText: this.areaShapes &&
                    this.areaShapes[index] &&
                    this.areaShapes[index].shapes[positionIndex].getWeight(area.density) > 0
                    ? this.areaShapes[index].shapes[positionIndex].getWeight(area.density)
                    : "-" }))), area.courses.length == 0 ? (h("ion-col", { size: "1" }, h("ion-button", { fill: "clear", color: "danger", "icon-only": true, onClick: () => this.deleteAllocationAreaPosition(index, positionIndex) }, h("ion-icon", { name: "trash" })))) : undefined)))
            : undefined, area.courses.length == 0 ? (h("ion-row", null, h("ion-col", null, h("ion-button", { expand: "block", fill: "outline", size: "small", color: "trasteel", disabled: this.disableAddPositionButton(index), onClick: () => this.addAllocationAreaPosition(index) }, "+ " +
            TranslationService.getTransl("add-position", "Add position"))))) : undefined), h("ion-row", null, h("ion-col", null, h("ion-button", { expand: "block", fill: "outline", size: "small", color: "trasteel", disabled: this.disableAddCourses(area), onClick: () => this.autoFillCourses(index) }, TranslationService.getTransl("auto-fill", "Auto Fill"))), h("ion-col", null, h("ion-button", { expand: "block", fill: "outline", size: "small", color: "trasteel", disabled: this.disableAddCourses(area), onClick: () => {
                ProjectsService.recalculateExistingCourses(this.project, this.areaShapes, index);
                this.updateSlider();
            } }, TranslationService.getTransl("recalculate", "Re-Calculate"))))), h("div", { id: "responsive-grid" }, h("ion-grid", null, h("ion-row", { class: "header ion-align-items-center ion-justify-content-center ext-row" }, h("ion-col", { size: "11", "size-lg": "11" }, h("ion-row", null, h("ion-col", { size: "12", "size-lg": "4", class: "ext-col" }, h("ion-row", { class: "inner-row1" }, h("ion-col", { size: "3", "size-lg": "3", class: "inner-col" }, h("ion-button", { expand: "full", fill: "clear", size: "small", color: "light", class: "ion-no-padding", onClick: () => this.reorderCourses(index) }, h("ion-label", { color: "light" }, TranslationService.getTransl("course", "Course")), h("ion-icon", { color: "light", slot: "end", name: "swap-vertical-outline" }))), h("ion-col", { size: "3", "size-lg": "3", class: "inner-col" }, h("ion-button", { expand: "full", fill: "clear", color: "light", size: "small", class: "ion-no-padding" }, h("ion-label", { color: "light" }, TranslationService.getTransl("start", "Start") + " °"))), h("ion-col", { size: "3", "size-lg": "3", class: "inner-col" }, h("ion-button", { expand: "full", fill: "clear", color: "light", size: "small", class: "ion-no-padding" }, h("ion-label", { color: "light" }, TranslationService.getTransl("end", "End") + " °"))), h("ion-col", { size: "3", "size-lg": "3", class: "inner-col" }, h("ion-button", { expand: "full", fill: "clear", size: "small", class: "ion-no-padding" }, h("ion-label", { color: "light" }, TranslationService.getTransl("radius", "Radius") + " (mm)"))))), h("ion-col", { size: "12", "size-lg": "8", class: "ext-col" }, h("ion-row", { class: "inner-row2" }, h("ion-col", { size: "2", class: "inner-col" }, "Pos. " +
            area.shapes.map((shape) => shape.position)), h("ion-col", { size: "2", class: "inner-col" }, TranslationService.getTransl("quantity", "Quantity")), h("ion-col", { size: "2", class: "inner-col" }, TranslationService.getTransl("sum", "Sum")), h("ion-col", { size: "2", class: "inner-col" }, TranslationService.getTransl("repair-sets", "Repair Sets")), h("ion-col", { size: "2", class: "inner-col" }, TranslationService.getTransl("weight", "Weight") + " (Kg)"), h("ion-col", { size: "2", class: "inner-col" }, TranslationService.getTransl("row-weight", "Row Weight") + " (Kg)"))))), h("ion-col", { size: "1", "size-lg": "1" }, TranslationService.getTransl("duplicate", "Duplicate") +
            "/" +
            TranslationService.getTransl("delete", "Delete"))), area.courses.map((course, courseIndex) => [
            h("ion-row", { class: "ion-align-items-center ion-justify-content-center ext-row" +
                    (this.selectedRows &&
                        this.selectedRows.includes(courseIndex)
                        ? " courseSelected"
                        : ""), onClick: (ev) => this.handleCourseRowClick(courseIndex, ev) }, h("ion-col", { size: "11", "size-lg": "11" }, h("ion-row", null, h("ion-col", { size: "12", "size-lg": "4", class: "ext-col" }, h("ion-row", { class: "inner-row1" }, h("ion-col", { size: "3", "size-lg": "3", class: "inner-col" }, h("app-form-item", { shortItem: true, value: course.courseNumber, name: "courseNumber", "input-type": "number", inputStep: "1", debounce: 300, onFormItemChanged: (ev) => this.handleAreaCourse(course, ev, index), onFocus: () => this.courseFocus(courseIndex) })), h("ion-col", { size: "3", "size-lg": "3", class: "inner-col" }, h("app-form-item", { shortItem: true, value: course.startAngle, name: "startAngle", "input-type": "number", inputStep: "1", onFormItemChanged: (ev) => this.handleAreaCourse(course, ev, index, courseIndex) })), h("ion-col", { size: "3", "size-lg": "3", class: "inner-col" }, h("app-form-item", { shortItem: true, value: course.endAngle, name: "endAngle", "input-type": "number", inputStep: "1", onFormItemChanged: (ev) => this.handleAreaCourse(course, ev, index, courseIndex) })), h("ion-col", { size: "3", "size-lg": "3", class: "inner-col" }, h("app-form-item", { shortItem: true, value: course.innerRadius, name: "innerRadius", "input-type": "number", inputStep: "1", onFormItemChanged: (ev) => this.handleAreaCourse(course, ev, index, courseIndex) })))), h("ion-col", { size: "12", "size-lg": "8", class: "ext-col" }, area.shapes.map((shape, shapeIndex) => (h("ion-row", { class: "inner-row2" }, h("ion-col", { size: "2", class: "inner-col" }, h("app-item-detail", { showItem: false, detailText: ShapesService.getShapeName(shape.shapeId) })), h("ion-col", { size: "2", class: "inner-col" }, h("app-form-item", { shortItem: true, style: course.quantityShapes
                    .length > 0 &&
                    course.quantityShapes[shapeIndex].quantity < 0
                    ? {
                        "--ion-background-color": "red",
                    }
                    : null, value: course.quantityShapes
                    .length > 0 &&
                    course.quantityShapes[shapeIndex]
                    ? course.quantityShapes[shapeIndex].quantity
                    : 0, name: "quantity", "input-type": "number", inputStep: "1", onFormItemChanged: (ev) => this.handleAreaCourseQuantity(course, shape.shapeId, shapeIndex, ev) })), h("ion-col", { size: "2", class: "inner-col" +
                    (shapeIndex > 0
                        ? " emptyCell"
                        : "") }, h("app-item-detail", { showItem: false, detailText: shapeIndex == 0
                    ? ProjectsService.countTotalQuantity(course)
                    : undefined })), h("ion-col", { size: "2", class: "inner-col" +
                    (shapeIndex > 0
                        ? " emptyCell"
                        : "") }, shapeIndex == 0 ? (h("app-form-item", { shortItem: true, value: course.repairSets, name: "repairSets", "input-type": "number", inputStep: "1", disabled: area.onlyForRepair, onFormItemChanged: (ev) => this.handleAreaCourse(course, ev) })) : undefined), h("ion-col", { size: "2", class: "inner-col" }, h("app-item-detail", { showItem: false, detailText: ProjectsService.getAreaCourseWeightForShape(this.project, this.areaShapes, index, courseIndex, shapeIndex) })), h("ion-col", { size: "2", class: "inner-col" +
                    (shapeIndex > 0
                        ? " emptyCell"
                        : "") }, h("app-item-detail", { showItem: false, detailText: shapeIndex == 0
                    ? ProjectsService.getTotalWeightForCourse(this.project, this.areaShapes, index, courseIndex)
                    : undefined })))))))), h("ion-col", { size: "1", "size-lg": "1" }, h("ion-button", { fill: "clear", color: "primary", "icon-only": true, class: "button-no-margin", onClick: () => this.duplicateAreaCourse(index, courseIndex) }, h("ion-icon", { name: "copy" })), h("ion-button", { fill: "clear", color: "danger", "icon-only": true, class: "button-no-margin", onClick: () => this.deleteAreaCourse(index, courseIndex) }, h("ion-icon", { name: "trash" })))),
            h("ion-row", { class: "separator" }, h("ion-col", null)),
        ])), h("ion-button", { expand: "block", fill: "outline", size: "small", color: "trasteel", disabled: this.disableAddCourses(area), onClick: () => this.addAreaCourses(index) }, "+ " +
            TranslationService.getTransl("add-course", "Add Course"))))) : undefined))))), h("swiper-slide", { key: '670c1d628d2a46025ea13bbecfbc31c4b5aa42f0', class: "swiper-slide" }, h("div", { key: 'a6b451384e50f08e5862df070abc59289b0cdef1' }, h("ion-grid", { key: '51884f746da9e6c7e33d27d079a4c9f68df475f5' }, this.project.projectMass.map((mass, index) => [
            h("ion-row", null, h("ion-col", null, h("app-form-item", { "label-tag": "position", "label-text": "Position", value: mass.position, name: "position", "input-type": "number", onFormItemBlur: (ev) => this.handleMassPositionBlur(index, ev) })), h("ion-col", null, h("app-select-search", { label: {
                    tag: "application-area",
                    text: "Application Area",
                }, labelAddText: "*", value: mass.bricksAllocationAreaId, lines: "inset", selectFn: (ev) => this.selectMassApplicationArea(index, ev), selectOptions: ProjectsService.getBricksAllocationAreas(), selectValueId: "bricksAllocationAreaId", selectValueText: ["bricksAllocationAreaName", "en"] }))),
            h("ion-row", null, h("ion-col", null, h("ion-item", { button: true, lines: "inset", onClick: () => this.openSelectDataSheet(mass, index, true) }, h("ion-label", null, h("p", { class: "small" }, h("my-transl", { tag: "datasheet", text: "Datasheet" })), h("h2", null, mass.datasheetId
                ? DatasheetsService.getDatasheetsById(mass.datasheetId).productName
                : "")))), h("ion-col", null, h("app-form-item", { "label-tag": "density", "label-text": "Density", appendText: " (g/cm3)", value: mass.density, name: "density", "input-type": "number", onFormItemChanged: (ev) => this.handleMassChange(index, ev) }))),
            h("ion-row", null, h("ion-col", null, h("ion-label", null, h("ion-item", { lines: "none" }, h("ion-label", null, h("p", { style: {
                    "font-size": "0.75rem",
                    color: "black",
                    "text-align": "left",
                } }, h("my-transl", { tag: "quantity", text: "Quantity" })), h("h2", { style: {
                    "text-align": "left",
                } }, mass.quantity))))), h("ion-col", null, h("ion-select", { color: "trasteel", id: "selectMassQtyUnit", interface: "action-sheet", label: TranslationService.getTransl("unit", "Unit"), "label-placement": "floating", onIonChange: (ev) => this.selectMassQtyUnit(index, ev), value: mass.quantityUnit }, ProjectsService.getQuantityUnits().map((unit) => (h("ion-select-option", { value: unit.quantityUnitId }, unit.quantityUnitName.en))))), h("ion-col", { size: "1" }, h("p", { style: {
                    "text-align": "center",
                    "font-size": "1.3rem",
                } }, "x")), h("ion-col", null, h("app-form-item", { "label-tag": "weight-per-unit", "label-text": "Weight per Unit", appendText: " (Kg)", value: mass.weightPerUnitKg, name: "weightPerUnitKg", "input-type": "number", onFormItemChanged: (ev) => this.handleMassChange(index, ev) })), h("ion-col", { size: "1" }, h("p", { style: {
                    "text-align": "center",
                    "font-size": "1.3rem",
                } }, "=")), h("ion-col", null, h("app-form-item", { "label-tag": "total-weight", "label-text": "Total Weight", appendText: " (MT)", value: mass.totalWeightMT, name: "totalWeightMT", "input-type": "number", onFormItemChanged: (ev) => this.handleMassChange(index, ev) })), h("ion-col", { size: "1", style: {
                    "text-align": "center",
                } }, h("ion-button", { style: {
                    "padding-top": "12px",
                }, fill: "clear", color: "danger", "icon-only": true, onClick: () => this.deleteProjectMass(index) }, h("ion-icon", { name: "trash" })))),
            h("ion-row", { class: "separator" }, h("ion-col", null)),
        ]), h("ion-row", { key: '79232680fecf866f254a85c7c841d892cfd127e4' }, h("ion-col", { key: '17de57167b85c5b423d2b5e8bfcaf09e6728a035' }, h("ion-button", { key: '4a1b1aeb5d96b43b60fb81f7d115e244aaea51f7', expand: "block", fill: "outline", size: "small", color: "trasteel", onClick: () => this.addProjectMasses() }, "+ " +
            TranslationService.getTransl("add-mass", "Add Mass"))))))), h("swiper-slide", { key: '0af678affc91e33130fd1d6a71de7e40a8fd5584', class: "swiper-slide" }, "FILES - TO BE DONE")))), h("app-modal-footer", { key: '385e0ef1c683916e67aae1591180c9005989b150', color: Environment.getAppColor(), disableSave: !this.validProject, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalProjectUpdate.style = modalProjectUpdateCss;

export { ModalProjectUpdate as modal_project_update };

//# sourceMappingURL=modal-project-update.entry.js.map