import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { O as DatasheetsService, aN as FirebaseFilterCondition, T as TranslationService } from './utils-ced1e260.js';
import { l as lodash } from './lodash-68d560b6.js';
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
import './env-c3ad5e77.js';
import './map-fe092362.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
import './framework-delegate-779ab78c.js';

const popoverDatasheetsFilterCss = "popover-datasheets-filter{}popover-datasheets-filter ion-list{min-height:300px}";

const PopoverDatasheetsFilter = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.filter = undefined;
        this.showBaseFilter = true;
        this.propertyNames = [];
        this.newFilterCondition = undefined;
        this.showAddNewProperty = false;
        this.updateView = false;
    }
    componentWillLoad() {
        this.popover = this.el.closest("ion-popover");
        this.datasheetMajorFamilies = DatasheetsService.getDatasheetMajorFamilies();
        this.datasheetFamilies = DatasheetsService.getDatasheetFamilies();
        this.propertyNames = DatasheetsService.getDatasheetPropertyNames();
        this.resetNewFilterCondition();
    }
    resetNewFilterCondition() {
        this.newFilterCondition = new FirebaseFilterCondition({
            field: "properties",
            fieldName: "name",
            valueName: "mgo",
            comparisonField: "lower",
        });
        this.validateProperty();
    }
    deleteCondition(index) {
        this.filter.properties.splice(index, 1);
        this.updateView = !this.updateView;
    }
    handleFilter(ev) {
        this.filter[ev.detail.name] = ev.detail.value;
    }
    handleMajorFamilySelect(ev) {
        this.filter.majorFamilyId = ev.detail.value;
    }
    handleFamilySelect(ev) {
        this.filter.familyId = ev.detail.value;
    }
    segmentChanged(ev) {
        if (ev.detail.value == "base") {
            this.showBaseFilter = true;
        }
        else {
            this.showBaseFilter = false;
        }
    }
    selectPropertyName(ev) {
        this.newFilterCondition.valueName = ev.detail.value;
        this.validateProperty();
    }
    selectOperator(ev) {
        this.newFilterCondition.operator = ev.detail.value;
        this.validateProperty();
    }
    selectValue(ev) {
        this.newFilterCondition.value = ev.detail.value;
        this.validateProperty();
    }
    addNewProperty() {
        this.filter.properties.push(lodash.exports.cloneDeep(this.newFilterCondition));
        this.resetNewFilterCondition();
    }
    validateProperty() {
        this.showAddNewProperty =
            lodash.exports.isString(this.newFilterCondition.field) &&
                lodash.exports.isString(this.newFilterCondition.fieldName) &&
                lodash.exports.isString(this.newFilterCondition.operator) &&
                lodash.exports.isString(this.newFilterCondition.valueName) &&
                !lodash.exports.isNull(this.newFilterCondition.value);
    }
    close() {
        popoverController.dismiss();
    }
    save() {
        popoverController.dismiss(this.filter);
    }
    render() {
        return (h(Host, { key: 'bdead093938df3fdbd7bb7023f66050044edcca3' }, h("ion-header", { key: 'c08a599a12a3ba01ac1cde7a802eaaf7cb301984', translucent: true }, h("ion-toolbar", { key: 'e842231cbdb2b42eff7cacba90b4bf9d3d895566' }, h("ion-title", { key: '22e40e1073b403c01fa0b7d13909860532d2b7bb' }, "Filter Datasheets"))), h("ion-content", { key: '62b3c63abf5005482bc64ff5a879d14c7d6bec0d' }, h("ion-segment", { key: '82ce3a41d1107aa69a7d891438852e81d6f387a1', mode: "ios", color: "trasteel", onIonChange: (ev) => this.segmentChanged(ev), value: "base" }, h("ion-segment-button", { key: '27263ed54cd8e10003f5c9c7425ef282fb81e206', value: "base" }, h("ion-label", { key: '3a7fc6acadbb90e94104621e860e8973e08c55e6' }, "Base")), h("ion-segment-button", { key: '63b05ce5739028c8b729303210dfbae432d188e8', value: "advanced" }, h("ion-label", { key: 'c50b29bb03694b280567e65aaf04f1bf06fc098c' }, "Advanced"))), h("ion-list", { key: '174ea203f4f353bb140a14114e5e274aa086dc6e' }, this.showBaseFilter
            ? [
                h("ion-item", null, h("ion-select", { color: "trasteel", interface: "action-sheet", label: TranslationService.getTransl("majorFamily", "Major Family"), "label-placement": "floating", onIonChange: (ev) => this.handleMajorFamilySelect(ev), value: this.filter.majorFamilyId }, this.datasheetMajorFamilies.map((type) => (h("ion-select-option", { value: type.majorFamilyId }, type.majorFamilyName))))),
                h("ion-item", null, h("ion-select", { color: "trasteel", interface: "action-sheet", label: TranslationService.getTransl("family", "Family"), "label-placement": "floating", onIonChange: (ev) => this.handleFamilySelect(ev), value: this.filter.familyId }, this.datasheetFamilies.map((type) => (h("ion-select-option", { value: type.familyId }, type.familyName))))),
                h("app-form-item", { "label-text": "Show Old Products", value: this.filter.oldProduct, name: "oldProduct", "input-type": "boolean", onFormItemChanged: (ev) => this.handleFilter(ev) }),
            ]
            : [
                h("ion-grid", null, h("ion-row", null, h("ion-col", null, h("app-select-search", { color: "trasteel", value: this.newFilterCondition.valueName, lines: "none", disabled: this.propertyNames.length == 0, selectFn: (ev) => this.selectPropertyName(ev), selectOptions: this.propertyNames, selectValueId: "nameId", selectValueText: ["nameName"] })), h("ion-col", { size: "3" }, h("ion-item", { lines: "none" }, h("ion-select", { color: "trasteel", interface: "action-sheet", onIonChange: (ev) => this.selectOperator(ev), value: this.newFilterCondition.operator }, h("ion-select-option", { value: ">=" }, h("ion-label", null, ">=")), h("ion-select-option", { value: ">" }, h("ion-label", null, ">")), h("ion-select-option", { value: "=" }, h("ion-label", null, "=")), h("ion-select-option", { value: "<" }, h("ion-label", null, "<")), h("ion-select-option", { value: "<=" }, h("ion-label", null, "<=")))))), h("ion-row", null, h("ion-col", null, h("app-form-item", { value: this.newFilterCondition.value, name: "typical", "input-type": "number", onFormItemChanged: (ev) => this.selectValue(ev) })), h("ion-col", { size: "3" }, h("ion-button", { "icon-only": true, fill: "outline", onClick: () => this.addNewProperty(), disabled: !this.showAddNewProperty }, h("ion-icon", { name: "add", color: "primary" }))))),
                h("ion-item-divider", null, h("ion-label", null, "Conditions")),
                this.filter.properties.map((property, index) => (h("ion-item", null, h("ion-label", null, DatasheetsService.getDatasheetPropertyNames("id", property.valueName)[0].nameName +
                    " " +
                    property.operator +
                    " " +
                    property.value), h("ion-button", { "icon-only": true, fill: "clear", onClick: () => this.deleteCondition(index) }, h("ion-icon", { name: "trash", color: "danger" }))))),
            ])), h("ion-footer", { key: 'e74b2b2336bdfb3bd0f3e477a47e5e7baf2161b8' }, h("app-modal-footer", { key: '9f0d5b27ceb9cc4fafba4fdd34874a03849f3e50', saveTag: { tag: "filter", text: "Filter" }, onCancelEmit: () => this.close(), onSaveEmit: () => this.save() }))));
    }
    get el() { return getElement(this); }
};
PopoverDatasheetsFilter.style = popoverDatasheetsFilterCss;

export { PopoverDatasheetsFilter as popover_datasheets_filter };

//# sourceMappingURL=popover-datasheets-filter.entry.js.map