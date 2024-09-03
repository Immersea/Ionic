import { r as registerInstance, h } from './index-d515af00.js';
import { B as SystemService, R as RouterService, ag as ProjectsService, j as CustomersService, T as TranslationService, O as DatasheetsService, al as ShapesService } from './utils-cbf49763.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { T as TrasteelService } from './services-2650b7f8.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-9be68260.js';
import './map-dae4acde.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './index-be90eba5.js';
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
import './overlays-b3ceb97d.js';
import './framework-delegate-779ab78c.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';

const pageProjectDetailsCss = "page-project-details ion-grid{--ion-grid-column-padding:0px}page-project-details .separator{background-color:var(--ion-color-trasteel-tint);height:3px}page-project-details .separator ion-col{height:0px !important}page-project-details .positions-box{margin-top:10px;padding-top:5px;padding-right:5px;padding-bottom:5px;padding-left:10px;border:1px solid black}page-project-details #responsive-grid ion-grid{--ion-grid-padding:5px;--ion-grid-column-padding:0px}page-project-details #responsive-grid ion-grid .header{background-color:var(--ion-color-trasteel);font-size:0.75rem;font-weight:bold;color:var(--ion-color-trasteel-contrast)}page-project-details #responsive-grid ion-grid .emptyCell{background-color:var(--ion-color-trasteel-tint)}page-project-details #responsive-grid ion-grid .noborder{border:0px}page-project-details #responsive-grid ion-grid ion-col{align-items:center;justify-content:center;text-align:center}page-project-details #responsive-grid ion-grid .ext-row{border:1px solid black}page-project-details #responsive-grid ion-grid .ext-col{border-right:0px solid black}page-project-details #responsive-grid ion-grid .inner-row1{border-bottom:1px solid black}page-project-details #responsive-grid ion-grid .inner-row1 .top-border{border-top:0px solid black}page-project-details #responsive-grid ion-grid .inner-row1 .top-border1{border-top:1px solid black}@media screen and (min-width: 992px){page-project-details #responsive-grid ion-grid .inner-row1 .top-border{border-top:1px solid black}page-project-details #responsive-grid ion-grid .inner-row1 .top-border1{border-top:0px solid black}}page-project-details #responsive-grid ion-grid .inner-row1 .inner-col2{border-right:1px solid black}@media screen and (min-width: 992px){page-project-details #responsive-grid ion-grid .inner-row1 .inner-col2{border-right:0px solid black}}page-project-details #responsive-grid ion-grid .inner-row1:last-child{border-bottom:1px solid black}@media screen and (min-width: 992px){page-project-details #responsive-grid ion-grid .inner-row1:last-child{border-bottom:0px solid black}}page-project-details #responsive-grid ion-grid .inner-row1a{border-top:0px solid black}page-project-details #responsive-grid ion-grid .inner-row1a .inner-col1{border-right:0px solid black}page-project-details #responsive-grid ion-grid .inner-row1a .inner-col1:first-child{border-right:1px solid black}@media screen and (min-width: 992px){page-project-details #responsive-grid ion-grid .inner-row1a{border-top:1px solid black}page-project-details #responsive-grid ion-grid .inner-row1a .inner-col1{border-right:1px solid black}}page-project-details #responsive-grid ion-grid .inner-row1a .inner-col1:last-child{border-right:0px solid black}page-project-details #responsive-grid ion-grid .inner-row2{border-bottom:1px solid black;border-left:0px solid black}@media screen and (min-width: 992px){page-project-details #responsive-grid ion-grid .inner-row2{border-left:1px solid black}}page-project-details #responsive-grid ion-grid .inner-row2:last-child{border-bottom:0px solid black}page-project-details #responsive-grid ion-grid .inner-col{border-right:1px solid black}page-project-details #responsive-grid ion-grid .button-no-margin{--padding-top:0px;--padding-bottom:0px;--padding-start:5px;--padding-end:5px}@media screen and (min-width: 1100px){page-project-details #responsive-grid ion-grid .button-no-margin{--padding-start:10px;--padding-end:10px}}page-project-details #courses-grid .centered{display:flex;align-items:center;justify-content:center;text-align:center}page-project-details #courses-grid ion-grid{border-collapse:collapse;border-style:hidden}page-project-details #courses-grid ion-grid .header{background-color:var(--ion-color-trasteel);font-weight:bold;color:var(--ion-color-trasteel-contrast)}page-project-details #courses-grid ion-grid .emptyCell{background-color:var(--ion-color-trasteel-tint)}page-project-details #courses-grid ion-grid ion-col{border:1px solid black;border-bottom:0;border-right:0}page-project-details #courses-grid ion-grid ion-col:last-child{border-right:1px solid black}page-project-details #courses-grid ion-grid ion-row:last-child{border-bottom:1px solid black}";

const PageProjectDetails = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.titles = [
            { tag: "summary", text: "Summary" },
            { tag: "information", text: "Information" },
            { tag: "shaped", text: "Shaped", disabled: false },
            { tag: "unshaped", text: "Unshaped", disabled: false },
            { tag: "files", text: "Files", disabled: true },
        ];
        this.itemId = undefined;
        this.project = undefined;
        this.updateView = true;
        this.updateSummary = true;
        this.allocationAreaSegment = 0;
        this.areaShapes = [];
        this.slider = undefined;
    }
    async componentWillLoad() {
        if (this.itemId) {
            await this.loadProject();
        }
        else {
            SystemService.dismissLoading();
            SystemService.presentAlertError("No Item Id");
            RouterService.goBack();
        }
    }
    async loadProject(project) {
        try {
            project
                ? (this.project = project)
                : (this.project = await ProjectsService.getProject(this.itemId));
            this.areaShapes = await ProjectsService.loadShapesForApplication(this.project);
            //check allocation areas
            await ProjectsService.checkBricksAllocationAreasForProject(this.project);
            this.updateSummary = !this.updateSummary;
            this.titles[2].disabled = this.project.projectAreaQuality.length == 0;
            this.titles[3].disabled = this.project.projectMass.length == 0;
            this.updateSlider();
        }
        catch (error) {
            SystemService.dismissLoading();
            RouterService.goBack();
            SystemService.presentAlertError(error);
        }
    }
    async componentDidLoad() {
        SystemService.dismissLoading();
        this.slider = new Swiper(".slider-detail-project", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
            on: {
                slideChange: () => {
                    this.slider ? this.slider.updateAutoHeight() : null;
                },
            },
        });
    }
    allocationAreaSegmentChanged(ev) {
        this.allocationAreaSegment = ev.detail.value;
        this.updateSlider();
    }
    updateSlider() {
        this.updateView = !this.updateView;
        //wait for view to update and then reset slider height
        setTimeout(() => {
            this.slider ? this.slider.update() : undefined;
        }, 100);
    }
    async editProject(item) {
        const modal = await ProjectsService.presentProjectUpdate(item ? item : this.itemId);
        //update customer data after modal dismiss
        modal.onDidDismiss().then((project) => this.loadProject(project.data));
    }
    render() {
        return [
            h("ion-header", { key: '12ace5b05aa07880eb61c5d74786886a9960461a' }, h("app-navbar", { key: '3b56cf1eb6ce8044f472ab4953dcd5527cde3d23', text: this.project.projectLocalId, color: "trasteel", backButton: true, rightButtonText: TrasteelService.isRefraDBAdmin()
                    ? {
                        icon: "create",
                        fill: "outline",
                        tag: "edit",
                        text: "Edit",
                    }
                    : null, rightButtonFc: () => this.editProject() })),
            h("app-header-segment-toolbar", { key: 'c0bff9cbec61749a6420afe74f29dcbfecf1773b', color: Environment.getAppColor(), swiper: this.slider, titles: this.titles, noToolbar: true }),
            h("ion-content", { key: 'cb35d452bb9975d6818dba904fdd0a68e237a91a', class: "slides" }, h("swiper-container", { key: '2a9455e56ca5e14be6a659d44463da0a7e3022e3', class: "slider-detail-project swiper" }, h("swiper-wrapper", { key: '559106bd9ab41a121eb178d71d4267c739888e6a', class: "swiper-wrapper" }, h("swiper-slide", { key: '96cb8a1164abf40eb4ffbe0b7814245b635ac1fa', class: "swiper-slide" }, h("app-page-project-summary", { key: '3a269858c7038a0a75c77e66062987d698ea463a', project: this.project, areaShapes: this.areaShapes, updateSummary: this.updateSummary })), h("swiper-slide", { key: 'ef4ecba76791ad4e2c3fd70b51f8b67ef5154e2e', class: "swiper-slide" }, h("ion-list", { key: 'bb13a28253bc4425421086cd112b6f172ec1a37b', class: "ion-no-padding", id: "project-grid" }, h("app-item-detail", { key: '16e5805e7f871e14d2116d52baf4591972afe56b', lines: "none", "label-tag": "customer", "label-text": "Customer", detailText: this.project.customerId
                    ? CustomersService.getCustomersDetails(this.project.customerId)
                        ? CustomersService.getCustomersDetails(this.project.customerId).fullName
                        : null
                    : null }), h("app-item-detail", { key: '881efb58e5f6f812d45768654870bd7debc8802a', lines: "none", "label-tag": "project-name", "label-text": "Project Name", detailText: this.project.projectLocalId }), h("app-item-detail", { key: '991bf7e9442b9c843235d01ab8c18c625551802f', lines: "none", "label-tag": "technical-docs-caption", "label-text": "Technical Docs Caption", detailText: this.project.docsCaption }), h("app-item-detail", { key: '110dea264eeb8e76671e9c17af6c24f622932a87', lines: "none", "label-tag": "project-description", "label-text": "Project Description", detailText: this.project.projectDescription }), h("app-item-detail", { key: 'e819d604c08466517f3200801e692ec169cc94db', lines: "none", "label-tag": "drawing-no", "label-text": "Drawing No.", detailText: this.project.drawing }), h("ion-grid", { key: '2889d7e1637d187db6e49b95f2289f288709c3a0' }, h("ion-row", { key: '06e7b65d1b7a37d227c67398467cf692169fe2d0' }, h("ion-col", { key: '0d4b96c81c1d4f3566474249b58692a54a47f424' }, h("app-item-detail", { key: '44df80ef60e57bb08648271f357467a4e4671f2c', lines: "none", "label-tag": "drawing-date", "label-text": "Drawing Date", detailText: this.project.drawingDate, isDate: true })), h("ion-col", { key: '72cd200267c757c633921b6627591b32c31aafac' }, h("app-item-detail", { key: '5223be79662619fdc7dae308bd3cbee3e032b67d', lines: "none", "label-tag": "project-finished-date", "label-text": "Project Finished Date", detailText: this.project.finishedDate, isDate: true })))), h("ion-grid", { key: '3fcf21a74bc67907008e161f1fb4490c827ee5f2' }, h("ion-row", { key: '5a7c4613467f9629dcb5db2765e13c2ea1ec1969' }, h("ion-col", { key: 'a799f014d4f846a9bb750c01145b69e669be50ff' }, h("app-item-detail", { key: '5e3a9c9b394f58d4112defc372517d90ade939da', lines: "none", "label-tag": "capacity", "label-text": "Capacity", detailText: lodash.exports.toString(this.project.steelAmount) })), h("ion-col", { key: 'ff12b764239c647fc2b496392afa182a2eb51f2f' }, h("app-item-detail", { key: '0f689e7969fbd107dbe5d6b3b783723b46862553', lines: "none", "label-tag": "application-unit", "label-text": "Application Unit", detailText: ProjectsService.getApplicationUnits(this.project.applicationId)[0].applicationName.en })))), h("app-item-detail", { key: '9e7151f71b4b653c1fa331e0112287c640dca055', lines: "none", "label-tag": "steel-amount", "label-text": "Steel Amount", detailText: lodash.exports.toString(this.project.steelAmount) }), h("app-item-detail", { key: '05f6a2e4bd3a4030dd09de9067e05d230a526132', lines: "none", "label-tag": "steel-density", "label-text": "Steel Density", appendText: " (g/sm3)", detailText: lodash.exports.toString(this.project.liquidMetalDensity) }), h("app-item-detail", { key: 'ff6ba81a4ccf1f615ec4d59a1f095b5094598bf1', lines: "none", "label-tag": "guaranteed-lifetime", "label-text": "Guaranteed Lifetime", appendText: " (heats)", detailText: this.project.guaranteedLife }))), h("swiper-slide", { key: '38f101774215ef15c681ed3570384516eeef7fc9', class: "swiper-slide" }, h("div", { key: '5b763b6f58172620160506f665ccbacc737c25f4' }, h("ion-toolbar", { key: '58001fe032628becd34842bb5c6a29c0a8585191' }, h("ion-segment", { key: '1ee6719e9154b2a5b2754cd565660872f660c468', mode: "ios", scrollable: true, onIonChange: (ev) => this.allocationAreaSegmentChanged(ev), value: this.allocationAreaSegment }, this.project.projectAreaQuality.map((area, index) => (h("ion-segment-button", { value: index, layout: "icon-start" }, h("ion-label", null, (area.bricksAllocationAreaId
                ? ProjectsService.getBricksAllocationAreas(area.bricksAllocationAreaId)[0].bricksAllocationAreaName.en
                : "") +
                (area.onlyForRepair
                    ? " (" +
                        TranslationService.getTransl("repair", "Repair") +
                        ")"
                    : ""))))))), this.project.projectAreaQuality.map((area, index) => (h("div", null, this.allocationAreaSegment == index ? (h("div", null, h("ion-grid", null, h("ion-row", null, h("ion-col", null, h("app-item-detail", { showItem: false, "label-tag": "bricks-allocation-area", "label-text": "Bricks Allocation Area", detailText: ProjectsService.getBricksAllocationAreas(area.bricksAllocationAreaId)[0].bricksAllocationAreaName.en }))), h("ion-row", null, h("ion-col", null, h("app-item-detail", { showItem: false, "label-tag": "quality", "label-text": "Quality", detailText: DatasheetsService.getDatasheetName(area.datasheetId) })), h("ion-col", { size: "4" }, h("app-item-detail", { showItem: false, "label-tag": "density", "label-text": "Density", appendText: " (g/cm3)", detailText: lodash.exports.toString(area.density) }))), h("ion-row", null, h("ion-col", null, h("app-item-detail", { showItem: false, "label-tag": "include-safety", "label-text": "Include Safety", appendText: " %", detailText: lodash.exports.toString(area.includeSafety) })), h("ion-col", { size: "4" }, h("app-item-detail", { showItem: false, "label-tag": "only-for-repair", "label-text": "Only for repair", detailText: area.onlyForRepair }))), h("ion-row", null, h("ion-col", null, h("app-item-detail", { showItem: false, "label-tag": "comments", "label-text": "Comments", detailText: lodash.exports.toString(area.comments) }))), h("div", { class: "positions-box" }, area.shapes
                ? area.shapes.map((shape, positionIndex) => (h("ion-row", null, h("ion-col", { size: "3" }, h("app-item-detail", { showItem: false, "label-tag": positionIndex == 0 ? "position" : null, "label-text": positionIndex == 0 ? "Position" : null, detailText: lodash.exports.toString(shape.position) })), h("ion-col", null, h("app-item-detail", { showItem: false, labelTag: positionIndex == 0 ? "shape" : null, labelText: positionIndex == 0 ? "Shape" : null, detailText: ShapesService.getShapeName(area.shapes[positionIndex].shapeId) })), h("ion-col", { size: "2" }, h("app-item-detail", { showItem: false, labelTag: positionIndex == 0 ? "radius" : null, labelText: positionIndex == 0 ? "Radius" : null, appendText: positionIndex == 0 ? " (mm)" : null, detailText: this.areaShapes &&
                        this.areaShapes[index] &&
                        this.areaShapes[index].shapes[positionIndex].radius > 0
                        ? this.areaShapes[index].shapes[positionIndex].radius
                        : "-" })), h("ion-col", { size: "2" }, h("app-item-detail", { showItem: false, labelTag: positionIndex == 0 ? "weight" : null, labelText: positionIndex == 0 ? "Weight" : null, appendText: positionIndex == 0 ? " (Kg)" : null, detailText: this.areaShapes &&
                        this.areaShapes[index]
                        ? this.project.projectAreaQuality[index].shapes[positionIndex]
                            .specialShapeVolume > 0
                            ? this.areaShapes[index].shapes[positionIndex].getWeightForVolume(this.project
                                .projectAreaQuality[index]
                                .shapes[positionIndex]
                                .specialShapeVolume, area.density)
                            : this.areaShapes[index].shapes[positionIndex].getWeight(area.density)
                        : "-" })))))
                : undefined)), h("div", { id: "responsive-grid" }, h("ion-grid", null, h("ion-row", { class: "header ion-align-items-center ion-justify-content-center ext-row" }, h("ion-col", { size: "12", "size-lg": "12" }, h("ion-row", null, h("ion-col", { size: "12", "size-lg": "4", class: "ext-col" }, h("ion-row", { class: "inner-row1" }, h("ion-col", { size: "3", "size-lg": "3", class: "inner-col" }, TranslationService.getTransl("course", "Course")), h("ion-col", { size: "3", "size-lg": "3", class: "inner-col" }, TranslationService.getTransl("start", "Start") + " °"), h("ion-col", { size: "3", "size-lg": "3", class: "inner-col" }, TranslationService.getTransl("end", "End") + " °"), h("ion-col", { size: "3", "size-lg": "3", class: "inner-col" }, TranslationService.getTransl("radius", "Radius") + " (mm)"))), h("ion-col", { size: "12", "size-lg": "8", class: "ext-col" }, h("ion-row", { class: "inner-row2" }, h("ion-col", { size: "2", class: "inner-col" }, "Pos. " +
                area.shapes.map((shape) => shape.position)), h("ion-col", { size: "2", class: "inner-col" }, TranslationService.getTransl("quantity", "Quantity")), h("ion-col", { size: "2", class: "inner-col" }, TranslationService.getTransl("sum", "Sum")), h("ion-col", { size: "2", class: "inner-col" }, TranslationService.getTransl("repair-sets", "Repair Sets")), h("ion-col", { size: "2", class: "inner-col" }, TranslationService.getTransl("weight", "Weight") + " (Kg)"), h("ion-col", { size: "2", class: "inner-col" }, TranslationService.getTransl("row-weight", "Row Weight") + " (Kg)")))))), area.courses.map((course, courseIndex) => [
                h("ion-row", { class: "ion-align-items-center ion-justify-content-center ext-row" }, h("ion-col", { size: "12", "size-lg": "12" }, h("ion-row", null, h("ion-col", { size: "12", "size-lg": "4", class: "ext-col" }, h("ion-row", { class: "inner-row1" }, h("ion-col", { size: "3", "size-lg": "3", class: "inner-col" }, course.courseNumber), h("ion-col", { size: "3", "size-lg": "3", class: "inner-col" }, course.startAngle), h("ion-col", { size: "3", "size-lg": "3", class: "inner-col" }, course.endAngle), h("ion-col", { size: "3", "size-lg": "3", class: "inner-col" }, course.innerRadius))), h("ion-col", { size: "12", "size-lg": "8", class: "ext-col" }, area.shapes.map((shape, shapeIndex) => (h("ion-row", { class: "inner-row2" }, h("ion-col", { size: "2", class: "inner-col" }, ShapesService.getShapeName(shape.shapeId)), h("ion-col", { size: "2", class: "inner-col" }, course.quantityShapes.length > 0 &&
                    course.quantityShapes[shapeIndex]
                    ? course.quantityShapes[shapeIndex].quantity
                    : 0), h("ion-col", { size: "2", class: "inner-col" +
                        (shapeIndex > 0
                            ? " emptyCell"
                            : "") }, shapeIndex == 0
                    ? ProjectsService.countTotalQuantity(course)
                    : undefined), h("ion-col", { size: "2", class: "inner-col" +
                        (shapeIndex > 0
                            ? " emptyCell"
                            : "") }, shapeIndex == 0
                    ? course.repairSets
                    : undefined), h("ion-col", { size: "2", class: "inner-col" }, ProjectsService.getAreaCourseWeightForShape(this.project, this.areaShapes, index, courseIndex, shapeIndex)), h("ion-col", { size: "2", class: "inner-col" +
                        (shapeIndex > 0
                            ? " emptyCell"
                            : "") }, shapeIndex == 0
                    ? ProjectsService.getTotalWeightForCourse(this.project, this.areaShapes, index, courseIndex)
                    : undefined)))))))),
                h("ion-row", { class: "separator" }, h("ion-col", null)),
            ]))))) : undefined))))), h("swiper-slide", { key: '0491ecdb7b0be62a222257e09fe548b9383e2f70', class: "swiper-slide" }, h("div", { key: '5b6052a34c9476dd6b8e19118ddfe918de12b7ac' }, h("ion-grid", { key: '1f1a20a673bd3821fe187aec92cbffc452d15b9d' }, this.project.projectMass.map((mass) => [
                h("ion-row", { style: { "padding-left": "16px", "padding-right": "16px" } }, h("ion-col", null, h("app-item-detail", { showItem: false, "label-tag": "position", "label-text": "Position", detailText: lodash.exports.toString(mass.position) })), h("ion-col", null, h("app-item-detail", { showItem: false, "label-tag": "application-area", "label-text": "Application Area", detailText: ProjectsService.getBricksAllocationAreas(mass.bricksAllocationAreaId)[0].bricksAllocationAreaName.en }))),
                h("ion-row", { style: { "padding-left": "16px", "padding-right": "16px" } }, h("ion-col", null, h("app-item-detail", { showItem: false, "label-tag": "quality", "label-text": "Quality", detailText: DatasheetsService.getDatasheetName(mass.datasheetId) })), h("ion-col", null, h("app-item-detail", { showItem: false, "label-tag": "density", "label-text": "Density", appendText: " (g/cm3)", detailText: mass.density }))),
                h("ion-row", { style: { "padding-left": "16px", "padding-right": "16px" } }, h("ion-col", null, h("app-item-detail", { showItem: false, "label-tag": "quantity", "label-text": "Quantity", detailText: lodash.exports.toString(mass.quantity) })), h("ion-col", null, h("app-item-detail", { showItem: false, "label-tag": "unit", "label-text": "Unit", detailText: mass.quantityUnit
                        ? ProjectsService.getQuantityUnits(mass.quantityUnit)[0].quantityUnitName.en
                        : "" })), h("ion-col", { size: "1" }, h("p", { style: {
                        "text-align": "center",
                        "font-size": "1.3rem",
                    } }, "x")), h("ion-col", null, h("app-item-detail", { showItem: false, "label-tag": "weight-per-unit", "label-text": "Weight per Unit", appendText: " (Kg)", detailText: mass.weightPerUnitKg })), h("ion-col", { size: "1" }, h("p", { style: {
                        "text-align": "center",
                        "font-size": "1.3rem",
                    } }, "=")), h("ion-col", null, h("app-item-detail", { showItem: false, "label-tag": "total-weight", "label-text": "Total Weight", appendText: " (MT)", detailText: mass.totalWeightMT }))),
                h("ion-row", { class: "separator" }, h("ion-col", null)),
            ])))), h("swiper-slide", { key: 'bd7e5de35bc478d2de00b8db2e527bf1b6125de2', class: "swiper-slide" }, "file - to do")))),
        ];
    }
};
PageProjectDetails.style = pageProjectDetailsCss;

export { PageProjectDetails as page_project_details };

//# sourceMappingURL=page-project-details.entry.js.map