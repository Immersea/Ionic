import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { aq as AutoFillCourses } from './utils-5cd4c7bb.js';
import { p as popoverController } from './overlays-b3ceb97d.js';
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
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-0a7fccce.js';
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';
import './framework-delegate-779ab78c.js';

const popoverProjectAutofillCss = "popover-project-autofill{}popover-project-autofill ion-list{min-height:300px}popover-project-autofill #project-grid ion-grid{--ion-grid-column-padding:0px}popover-project-autofill .separator{background-color:var(--ion-color-trasteel-tint)}popover-project-autofill #courses-grid .centered{display:flex;align-items:center;justify-content:center;text-align:center}popover-project-autofill #courses-grid ion-grid{--ion-grid-column-padding:2px;border-collapse:collapse;border-style:hidden}popover-project-autofill #courses-grid ion-grid .header{background-color:var(--ion-color-trasteel);font-weight:bold;color:var(--ion-color-trasteel-contrast)}popover-project-autofill #courses-grid ion-grid ion-col{border:1px solid black;border-bottom:0;border-right:0}popover-project-autofill #courses-grid ion-grid ion-col:last-child{border-right:1px solid black}popover-project-autofill #courses-grid ion-grid ion-row:last-child{border-bottom:1px solid black}";

const PopoverProjectAutofill = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.shapes = undefined;
        this.bottom = false;
        this.autoFillCourses = new AutoFillCourses();
        this.width = undefined;
        this.disableSave = true;
    }
    componentWillLoad() {
        this.popover = this.el.closest("ion-popover");
        this.calculateWidth();
    }
    handleAutofill(ev) {
        this.autoFillCourses[ev.detail.name] = ev.detail.value;
        this.calculateWidth();
    }
    calculateWidth() {
        this.width =
            this.autoFillCourses.endAngle - this.autoFillCourses.startAngle;
        this.checkDisableSave();
    }
    handleAutofillShapes(index, ev) {
        this.autoFillCourses.quantityShape[index] = ev.detail.value;
        this.checkDisableSave();
    }
    checkDisableSave() {
        let checkQuantities = 0;
        this.autoFillCourses.quantityShape.forEach((qty) => {
            checkQuantities += qty;
        });
        if (this.autoFillCourses.fromCourse >= 0 &&
            this.autoFillCourses.toCourse >= this.autoFillCourses.fromCourse &&
            (this.autoFillCourses.startRadius > 0 || checkQuantities > 0)) {
            this.disableSave = false;
        }
        else {
            this.disableSave = true;
        }
    }
    close() {
        popoverController.dismiss();
    }
    save() {
        popoverController.dismiss(this.autoFillCourses);
    }
    render() {
        return (h(Host, { key: 'da3515d400118ebef018e07abc8215ac15c2da68' }, h("ion-header", { key: '7217cee5278560222af7ba4c74fc87720a3ef091', translucent: true }, h("ion-toolbar", { key: 'e43d63bb7f594a99aaebefed9e66a33eebd9e1cd' }, h("ion-title", { key: '1b4657024db0e6ff6a77327385f59b7faa5c2d01' }, h("my-transl", { key: '2d0d1fb69ae6cb7c68ca6ed0fba19bd177227f0d', tag: "auto-fill", text: "Auto Fill" })))), h("ion-content", { key: '8debc9097428d695adc66e14d7def46e85b32dad' }, h("ion-list", { key: 'ed2329d4c7cd4ddd5ac2d2a8695c3500207b024e' }, this.bottom
            ? [
                h("app-form-item", { "label-tag": "bottom-radius", "label-text": "Bottom Radius", value: this.autoFillCourses.startRadius, name: "startRadius", "input-type": "number", onFormItemChanged: (ev) => this.handleAutofill(ev) }),
                h("app-form-item", { "label-tag": "repair-sets", "label-text": "Repair Sets", value: this.autoFillCourses.repairSets, name: "repairSets", "input-type": "number", onFormItemChanged: (ev) => this.handleAutofill(ev) }),
            ]
            : [
                h("app-form-item", { "label-tag": "from-course", "label-text": "From Course", value: this.autoFillCourses.fromCourse, name: "fromCourse", "input-type": "number", onFormItemChanged: (ev) => this.handleAutofill(ev) }),
                h("app-form-item", { "label-tag": "to-course", "label-text": "To Course", value: this.autoFillCourses.toCourse, name: "toCourse", "input-type": "number", onFormItemChanged: (ev) => this.handleAutofill(ev) }),
                h("app-form-item", { "label-tag": "step", "label-text": "Step", value: this.autoFillCourses.step, name: "step", "input-type": "number", onFormItemChanged: (ev) => this.handleAutofill(ev) }),
                h("app-form-item", { "label-tag": "layer", "label-text": "Layer", value: this.autoFillCourses.layer, name: "layer", "input-type": "number", onFormItemChanged: (ev) => this.handleAutofill(ev) }),
                h("app-form-item", { "label-tag": "start-angle", "label-text": "Start Angle", appendText: " \u00B0", value: this.autoFillCourses.startAngle, name: "startAngle", "input-type": "number", onFormItemChanged: (ev) => this.handleAutofill(ev) }),
                h("app-form-item", { "label-tag": "end-angle", "label-text": "End Angle", appendText: " \u00B0", value: this.autoFillCourses.endAngle, name: "endAngle", "input-type": "number", onFormItemChanged: (ev) => this.handleAutofill(ev) }),
                h("ion-item", { detail: false, lines: "none" }, h("ion-label", null, h("ion-note", null, h("my-transl", { tag: "width", text: "Width" }), " °")), h("div", { slot: "end" }, h("ion-note", null, this.width))),
                h("app-form-item", { "label-tag": "start-height", "label-text": "Start Height", appendText: " (mm)", value: this.autoFillCourses.startHeight, name: "startHeight", "input-type": "number", onFormItemChanged: (ev) => this.handleAutofill(ev) }),
                h("app-form-item", { "label-tag": "start-radius", "label-text": "Start Radius", appendText: " (mm)", value: this.autoFillCourses.startRadius, name: "startRadius", "input-type": "number", onFormItemChanged: (ev) => this.handleAutofill(ev) }),
                h("app-form-item", { "label-tag": "radius-step", "label-text": "Radius Step", appendText: " (mm)", value: this.autoFillCourses.radiusStep, name: "radiusStep", "input-type": "number", onFormItemChanged: (ev) => this.handleAutofill(ev) }),
                h("app-form-item", { "label-tag": "repair-sets", "label-text": "Repair Sets", value: this.autoFillCourses.repairSets, name: "repairSets", "input-type": "number", onFormItemChanged: (ev) => this.handleAutofill(ev) }),
                this.shapes.map((shape, index) => (h("app-form-item", { "label-text": "Q.ty Pos. " + shape.position, value: this.autoFillCourses.quantityShape[index], name: shape.shapeId, "input-type": "number", onFormItemChanged: (ev) => this.handleAutofillShapes(index, ev) }))),
            ])), h("ion-footer", { key: 'bec817f4489e84baba9b99d3070667b62be96569' }, h("app-modal-footer", { key: '5fcde5e941dbfba279394a1896b8997b6018e702', saveTag: { tag: "auto-fill", text: "Auto Fill" }, disableSave: this.disableSave, onCancelEmit: () => this.close(), onSaveEmit: () => this.save() }))));
    }
    get el() { return getElement(this); }
};
PopoverProjectAutofill.style = popoverProjectAutofillCss;

export { PopoverProjectAutofill as popover_project_autofill };

//# sourceMappingURL=popover-project-autofill.entry.js.map