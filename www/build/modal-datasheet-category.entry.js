import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { E as Environment } from './env-9be68260.js';
import { O as DatasheetsService, Q as DatasheetCategory, B as SystemService } from './utils-cbf49763.js';
import { l as lodash } from './lodash-68d560b6.js';
import { m as modalController } from './overlays-b3ceb97d.js';
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
import './map-dae4acde.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';
import './framework-delegate-779ab78c.js';

const modalDatasheetCategoryCss = "modal-datasheet-category ion-list{width:100%}";

const ModalDatasheetCategory = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.index = 0;
        this.datasheetCategories = undefined;
        this.datasheetCategory = undefined;
        this.updateView = true;
        this.validDatasheetCategory = false;
    }
    async componentWillLoad() {
        await this.loadDatasheetCategories();
    }
    async loadDatasheetCategories() {
        await DatasheetsService.downloadDatasheetSettings();
        this.datasheetCategories = lodash.exports.cloneDeep(DatasheetsService.getDatasheetCategories());
        if (this.datasheetCategories && this.datasheetCategories.length > 0) {
            this.datasheetCategory = this.datasheetCategories[0];
        }
        else {
            //create new and add to list
            this.addDatasheetCategory();
        }
        this.validateDatasheet();
    }
    selectType(ev) {
        this.datasheetCategory = this.datasheetCategories.find((x) => x.categoriesId == ev.detail.value);
        this.validateDatasheet();
    }
    handleChange(ev) {
        const n = ev.detail.name;
        let v = ev.detail.value;
        if (n == "categoriesId") {
            //remove spaces and lowercase
            v = v.replace(/\s+/g, "-").trim().toLowerCase();
        }
        this.datasheetCategory[n] = v;
        this.validateDatasheet();
    }
    validateDatasheet() {
        this.validDatasheetCategory =
            lodash.exports.isString(this.datasheetCategory.categoriesId) &&
                lodash.exports.isString(this.datasheetCategory.categoriesName);
        this.updateView = !this.updateView;
    }
    addDatasheetCategory() {
        this.datasheetCategory = new DatasheetCategory();
        this.datasheetCategories.push(this.datasheetCategory);
        this.index = this.datasheetCategories.length - 1;
    }
    duplicateDatasheetCategory() {
        this.datasheetCategory = lodash.exports.cloneDeep(this.datasheetCategory);
        this.datasheetCategory.categoriesId =
            this.datasheetCategory.categoriesId + "_rev.";
        this.datasheetCategories.push(this.datasheetCategory);
        this.index = this.datasheetCategories.length - 1;
    }
    async deleteDatasheetCategory() {
        try {
            this.datasheetCategories.splice(this.index, 1);
            this.index = 0;
            this.datasheetCategory = this.datasheetCategories[0];
            this.validateDatasheet();
        }
        catch (error) {
            if (error)
                SystemService.presentAlertError(error);
        }
    }
    async save(dismiss = true) {
        await DatasheetsService.uploadDatasheetSettings("category", this.datasheetCategories);
        return dismiss ? modalController.dismiss() : true;
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: '97098fcc5c6efb20958ba923bb24fa0ff6dc11c1' }, h("ion-content", { key: '5f1efd9fe715606b463e6afb0edc2cb874011182' }, h("ion-grid", { key: '37f9742fc4c522210184d598e6b9f36107a20505' }, h("ion-row", { key: '71236853f7e5c2700206f042008c029e9e8856f5' }, h("ion-col", { key: '714d57dc80fdaf1fb5ba84de2a2198c8aecc71d9' }, h("app-select-search", { key: 'd5b650a9a4d122b0b90afc8027f21ee1663bd1c0', color: "trasteel", label: {
                tag: "datasheet_category",
                text: "Datasheet Category",
            }, value: this.index
                ? this.datasheetCategories[this.index].categoriesId
                : this.datasheetCategories[0].categoriesId, lines: "none", "label-placement": "floating", selectFn: (ev) => this.selectType(ev), selectOptions: this.datasheetCategories, selectValueId: "categoriesId", selectValueText: ["categoriesName"], disabled: !this.validDatasheetCategory })), h("ion-col", { key: 'e2809892d702c92d75f9629853601373ba323d30', size: "1", class: "ion-text-center" }, h("ion-button", { key: '1c69ee89f6ea7aa71e0a2b53e160c9c8568d849b', fill: "clear", disabled: !this.validDatasheetCategory, onClick: () => this.addDatasheetCategory() }, h("ion-icon", { key: '18ebf6cdb5241551c08f773dd58425f018cc74ff', name: "add", slot: "start" }))), h("ion-col", { key: 'cd05223c472a9a0e53a2022dc6d0d0ea563b9a75', size: "1", class: "ion-text-center" }, h("ion-button", { key: 'c358648fdd6286e497f606466b18f786317c85dd', fill: "clear", disabled: !this.validDatasheetCategory, onClick: () => this.duplicateDatasheetCategory() }, h("ion-icon", { key: 'ca1bd593fc75c24bad4b65a1ca978dae4fcb61b5', slot: "start", name: "duplicate" }))), h("ion-col", { key: 'f555db2509f9b241dc38eb21ba99268610a615c9', size: "1", class: "ion-text-center" }, h("ion-button", { key: '8369f8d00810ee8072113d36901090bdcad83f9b', fill: "clear", color: "danger", disabled: this.datasheetCategories.length == 0, onClick: () => this.deleteDatasheetCategory() }, h("ion-icon", { key: 'cddde62c99eed7abe70c4054e0f74834d03e9c63', slot: "start", name: "trash" }))))), h("app-form-item", { key: '9923378d5dd3b802a4671fe45c9a3060a0bda4b1', "label-text": "ID", value: this.datasheetCategory.categoriesId, name: "categoriesId", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: [
                "required",
                {
                    name: "uniqueid",
                    options: {
                        type: "list",
                        index: "categoriesId",
                        list: DatasheetsService.getDatasheetCategories(),
                    },
                },
            ] }), h("app-form-item", { key: '127609ab8369a7d546f06e0c7f49a753ccaaaeba', "label-text": "Name", value: this.datasheetCategory.categoriesName, name: "categoriesName", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: ["required"] })), h("app-modal-footer", { key: 'ba1c9a63d7d003398d0a0481eef16f3de8568e22', color: Environment.getAppColor(), disableSave: !this.validDatasheetCategory, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalDatasheetCategory.style = modalDatasheetCategoryCss;

export { ModalDatasheetCategory as modal_datasheet_category };

//# sourceMappingURL=modal-datasheet-category.entry.js.map