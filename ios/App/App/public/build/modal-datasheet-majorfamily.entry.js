import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-0a7fccce.js';
import { O as DatasheetsService, W as DatasheetMajorFamily, B as SystemService } from './utils-5cd4c7bb.js';
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
import './_commonjsHelpers-1a56c7bc.js';
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';
import './framework-delegate-779ab78c.js';

const modalDatasheetMajorfamilyCss = "modal-datasheet-majorfamily ion-list{width:100%}";

const ModalDatasheetMajorfamily = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.index = 0;
        this.datasheetMajorFamilies = undefined;
        this.datasheetMajorFamily = undefined;
        this.updateView = true;
        this.validDatasheetMajorFamily = false;
    }
    async componentWillLoad() {
        await this.loadDatasheetMajorFamilies();
    }
    async loadDatasheetMajorFamilies() {
        await DatasheetsService.downloadDatasheetSettings();
        this.datasheetMajorFamilies = lodash.exports.cloneDeep(DatasheetsService.getDatasheetMajorFamilies());
        if (this.datasheetMajorFamilies && this.datasheetMajorFamilies.length > 0) {
            this.datasheetMajorFamily = this.datasheetMajorFamilies[0];
        }
        else {
            //create new and add to list
            this.addDatasheetMajorFamily();
        }
        this.validateDatasheet();
    }
    selectType(ev) {
        this.datasheetMajorFamily = this.datasheetMajorFamilies.find((x) => x.majorFamilyId == ev.detail.value);
        this.validateDatasheet();
    }
    handleChange(ev) {
        const n = ev.detail.name;
        let v = ev.detail.value;
        if (n == "majorFamilyId") {
            //remove spaces and lowercase
            v = v.replace(/\s+/g, "-").trim().toLowerCase();
        }
        this.datasheetMajorFamily[n] = v;
        this.validateDatasheet();
    }
    validateDatasheet() {
        this.validDatasheetMajorFamily =
            lodash.exports.isString(this.datasheetMajorFamily.majorFamilyId) &&
                lodash.exports.isString(this.datasheetMajorFamily.majorFamilyName);
        this.updateView = !this.updateView;
    }
    addDatasheetMajorFamily() {
        this.datasheetMajorFamily = new DatasheetMajorFamily();
        this.datasheetMajorFamilies.push(this.datasheetMajorFamily);
        this.index = this.datasheetMajorFamilies.length - 1;
    }
    duplicateDatasheetMajorFamily() {
        this.datasheetMajorFamily = lodash.exports.cloneDeep(this.datasheetMajorFamily);
        this.datasheetMajorFamily.majorFamilyId =
            this.datasheetMajorFamily.majorFamilyId + "_rev.";
        this.datasheetMajorFamilies.push(this.datasheetMajorFamily);
        this.index = this.datasheetMajorFamilies.length - 1;
    }
    async deleteDatasheetMajorFamily() {
        try {
            this.datasheetMajorFamilies.splice(this.index, 1);
            this.index = 0;
            this.datasheetMajorFamily = this.datasheetMajorFamilies[0];
            this.validateDatasheet();
        }
        catch (error) {
            if (error)
                SystemService.presentAlertError(error);
        }
    }
    async save(dismiss = true) {
        await DatasheetsService.uploadDatasheetSettings("majorfamily", this.datasheetMajorFamilies);
        return dismiss ? modalController.dismiss() : true;
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: '5bafa7a653a8d8cec23f9c47c48ac3b3f1389501' }, h("ion-content", { key: '32184f87cd680f0edde61617541c7df198c8f5dc' }, h("ion-grid", { key: 'eb86c710ea33911a0d5d3b6244bb348478cee1b8' }, h("ion-row", { key: '04083cc51f73fdb800a02329b7775ed8e3aab516' }, h("ion-col", { key: '25c740df67379791321d7c8178b7d9d83cc169b3' }, h("app-select-search", { key: 'a2f10cd4887dba1fa50342745c2d0514348d26a4', color: "trasteel", label: {
                tag: "datasheet_major_family",
                text: "Datasheet Major Family",
            }, value: this.index
                ? this.datasheetMajorFamilies[this.index].majorFamilyId
                : this.datasheetMajorFamilies[0].majorFamilyId, lines: "none", "label-placement": "floating", selectFn: (ev) => this.selectType(ev), selectOptions: this.datasheetMajorFamilies, selectValueId: "majorFamilyId", selectValueText: ["majorFamilyName"], disabled: !this.validDatasheetMajorFamily })), h("ion-col", { key: '7b1c1ea02a979cbebc11c3dbaf0890e7f63f9cd7', size: "1", class: "ion-text-center" }, h("ion-button", { key: 'fbf7925adb9be5a35d6eb3c4c779412df84f7b71', fill: "clear", disabled: !this.validDatasheetMajorFamily, onClick: () => this.addDatasheetMajorFamily() }, h("ion-icon", { key: '7545003b645e38aa35b6175fb8aa967a58d58178', name: "add", slot: "start" }))), h("ion-col", { key: '8c92e003760d03029bbf5b013647e88a65cd0145', size: "1", class: "ion-text-center" }, h("ion-button", { key: '3244302f590ee9a156b1d73aba243e0e3a8aef8a', fill: "clear", disabled: !this.validDatasheetMajorFamily, onClick: () => this.duplicateDatasheetMajorFamily() }, h("ion-icon", { key: 'f262d9230b894331bb3f1cfeca700c36195bd7e0', slot: "start", name: "duplicate" }))), h("ion-col", { key: '75e50211e0125065ee7661288817187c71b1e0b2', size: "1", class: "ion-text-center" }, h("ion-button", { key: 'e6b13cfbdaa226d0ab2fd220a2b034529a064e58', fill: "clear", color: "danger", disabled: this.datasheetMajorFamilies.length == 0, onClick: () => this.deleteDatasheetMajorFamily() }, h("ion-icon", { key: 'fb96dcc6001236436f00ef25e74b75673a4d9715', slot: "start", name: "trash" }))))), h("app-form-item", { key: '97275858d11a32f98fae6e56f2afed422a15ffd7', "label-text": "ID", value: this.datasheetMajorFamily.majorFamilyId, name: "majorFamilyId", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: [
                "required",
                {
                    name: "uniqueid",
                    options: {
                        type: "list",
                        index: "majorFamilyId",
                        list: DatasheetsService.getDatasheetMajorFamilies(),
                    },
                },
            ] }), h("app-form-item", { key: '95176abe691457677707d7855dc1ecce58ba262f', "label-text": "Name", value: this.datasheetMajorFamily.majorFamilyName, name: "majorFamilyName", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: ["required"] })), h("app-modal-footer", { key: 'a6215d8b2da76195abab157f2b79027200a76f7e', color: Environment.getAppColor(), disableSave: !this.validDatasheetMajorFamily, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalDatasheetMajorfamily.style = modalDatasheetMajorfamilyCss;

export { ModalDatasheetMajorfamily as modal_datasheet_majorfamily };

//# sourceMappingURL=modal-datasheet-majorfamily.entry.js.map