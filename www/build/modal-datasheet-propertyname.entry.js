import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { O as DatasheetsService, X as DatasheetPropertyName, B as SystemService, T as TranslationService } from './utils-5cd4c7bb.js';
import { E as Environment } from './env-0a7fccce.js';
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

const modalDatasheetPropertynameCss = "modal-datasheet-propertyname ion-list{width:100%}";

const ModalDatasheetPropertyName = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.index = 0;
        this.datasheetPropertyNames = undefined;
        this.datasheetPropertyName = undefined;
        this.updateView = true;
        this.validDatasheetPropertyName = false;
    }
    async componentWillLoad() {
        await this.loadDatasheetPropertyNames();
    }
    async loadDatasheetPropertyNames() {
        await DatasheetsService.downloadDatasheetSettings();
        this.datasheetPropertyNames = lodash.exports.cloneDeep(DatasheetsService.getDatasheetPropertyNames());
        if (this.datasheetPropertyNames && this.datasheetPropertyNames.length > 0) {
            this.datasheetPropertyName = this.datasheetPropertyNames[0];
        }
        else {
            //create new and add to list
            this.addDatasheetPropertyName();
        }
        this.validateDatasheet();
    }
    selectType(ev) {
        //find property by id
        const id = ev.detail.value;
        this.datasheetPropertyName = this.datasheetPropertyNames.find((x) => x.nameId == id);
        this.validateDatasheet();
    }
    selectPropertyType(ev) {
        this.datasheetPropertyName.nameType = ev.detail.value;
        this.validateDatasheet();
    }
    handleChange(ev) {
        const n = ev.detail.name;
        let v = ev.detail.value;
        if (n == "nameId") {
            //remove spaces and lowercase
            v = v.replace(/\s+/g, "-").trim().toLowerCase();
        }
        this.datasheetPropertyName[n] = v;
        this.validateDatasheet();
    }
    validateDatasheet() {
        this.validDatasheetPropertyName =
            lodash.exports.isString(this.datasheetPropertyName.nameId) &&
                lodash.exports.isString(this.datasheetPropertyName.nameName) &&
                //isString(this.datasheetPropertyName.nameType) &&
                lodash.exports.isNumber(this.datasheetPropertyName.position) &&
                lodash.exports.isNumber(this.datasheetPropertyName.decimals);
        this.updateView = !this.updateView;
    }
    addDatasheetPropertyName() {
        this.datasheetPropertyName = new DatasheetPropertyName();
        this.datasheetPropertyNames.push(this.datasheetPropertyName);
        this.index = this.datasheetPropertyNames.length - 1;
    }
    duplicateDatasheetPropertyName() {
        this.datasheetPropertyName = lodash.exports.cloneDeep(this.datasheetPropertyName);
        this.datasheetPropertyName.nameId =
            this.datasheetPropertyName.nameId + "_rev.";
        this.datasheetPropertyNames.push(this.datasheetPropertyName);
        this.index = this.datasheetPropertyNames.length - 1;
    }
    async deleteDatasheetPropertyName() {
        try {
            this.datasheetPropertyNames.splice(this.index, 1);
            this.index = 0;
            this.datasheetPropertyName = this.datasheetPropertyNames[0];
            this.validateDatasheet();
        }
        catch (error) {
            if (error)
                SystemService.presentAlertError(error);
        }
    }
    async save(dismiss = true) {
        await DatasheetsService.uploadDatasheetSettings("propertyName", this.datasheetPropertyNames);
        return dismiss ? modalController.dismiss() : true;
    }
    async cancel() {
        return modalController.dismiss();
    }
    checkComments() {
        this.datasheetPropertyNames.map((property) => {
            // Split the input string by the startString
            const startSplit = lodash.exports.split(property.nameName, "(");
            // If the startString is not found, return null
            if (startSplit.length < 2) {
                return null;
            }
            // Take the part after the startString
            const afterStart = startSplit[1];
            // Split the remaining string by the endString
            const endSplit = lodash.exports.split(afterStart, "°C");
            // If the endString is not found, return null
            if (endSplit.length < 2) {
                return null;
            }
            // The desired substring is the first part before the endString
            if (endSplit[0]) {
            }
        });
    }
    render() {
        return (h(Host, { key: 'f3b13f3799fee2526a7d6e833c1dfef07e436b4d' }, h("ion-content", { key: 'e31545f624e32030b597a8f9bc4523b142c31af5' }, h("ion-grid", { key: '1e6b7cc4f7afa7b867106fa8e931a0b8a7bd3528' }, h("ion-row", { key: '7c34b27190598a22890d6d5cb47b210b771e9c61' }, h("ion-col", { key: 'b0f20c19ae550f468ca9ccc46c118c1d8b682b32' }, h("app-select-search", { key: 'b16fa98ecd780f8a841eff34b443e01e649d74d2', color: "trasteel", label: {
                tag: "datasheet_propertyName",
                text: "Datasheet Property Name",
            }, value: this.index
                ? this.datasheetPropertyNames[this.index].nameId
                : this.datasheetPropertyNames[0].nameId, lines: "none", selectFn: (ev) => this.selectType(ev), selectOptions: this.datasheetPropertyNames, selectValueId: "nameId", selectValueText: ["nameName"], disabled: !this.validDatasheetPropertyName })), h("ion-col", { key: '116ed80691c01adc83e84760e143b1029c84f4ed', size: "1", class: "ion-text-center" }, h("ion-button", { key: '0119068e8947a89082ebabfebff42b4b96845895', fill: "clear", disabled: !this.validDatasheetPropertyName, onClick: () => this.addDatasheetPropertyName() }, h("ion-icon", { key: '1fc2fcfa4529de0f3cc4d1298485b601c03d753a', name: "add", slot: "start" }))), h("ion-col", { key: 'af4ea19edc8b2068d774e7119af2e6a4ef2b8963', size: "1", class: "ion-text-center" }, h("ion-button", { key: '5c040540f4ccd2657c9141c9e79b5597c662ea8e', fill: "clear", disabled: !this.validDatasheetPropertyName, onClick: () => this.duplicateDatasheetPropertyName() }, h("ion-icon", { key: '241fc228df167937b79d3215d6b6ab73a05d83ea', slot: "start", name: "duplicate" }))), h("ion-col", { key: '486a3accb31c28c6ed95e5aa48f9b470f04d52f6', size: "1", class: "ion-text-center" }, h("ion-button", { key: 'fee39c31921389b81d026605f2ab10ec0616e5ac', fill: "clear", color: "danger", disabled: this.datasheetPropertyNames.length == 0, onClick: () => this.deleteDatasheetPropertyName() }, h("ion-icon", { key: '6f1989d254b68d7757bf71cb54543e5ec5a62785', slot: "start", name: "trash" }))))), h("ion-item", { key: 'a11bf4cc08087b2b5ac9ae818c10e5f6157a359d', lines: "none" }, h("ion-select", { key: '0322c6b63d9dac1697cc05fff9fb8b840d56f3f6', color: "trasteel", id: "selectType", interface: "action-sheet", label: TranslationService.getTransl("datasheet_propertyType", "Datasheet Property Type"), "label-placement": "floating", onIonChange: (ev) => this.selectPropertyType(ev) }, DatasheetsService.datasheetPropertyTypes.map((datasheetPropertyType) => (h("ion-select-option", { value: datasheetPropertyType.typeId }, datasheetPropertyType.typeName))))), h("app-form-item", { key: '5a300860a519b147bf4382a1101d03fc21e5fb4e', "label-text": "Position", value: this.datasheetPropertyName.position, name: "position", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: ["required"] }), h("app-form-item", { key: '2bd4522b4875edbc0a8dbc93412bc2b48485d179', "label-text": "ID", value: this.datasheetPropertyName.nameId, name: "nameId", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: [
                "required",
                {
                    name: "uniqueid",
                    options: {
                        type: "list",
                        index: "nameId",
                        list: DatasheetsService.getDatasheetPropertyNames(),
                    },
                },
            ] }), h("app-form-item", { key: '891982b94395661ce2a8485ec87ffd094f7f8dfe', "label-text": "Name", value: this.datasheetPropertyName.nameName, name: "nameName", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: ["required"] }), h("app-form-item", { key: 'c430ca36af407c8f4d1e40cb6a264e4586c27f15', "label-text": "Decimals", value: this.datasheetPropertyName.decimals, name: "decimals", "input-type": "number", inputStep: "1", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: ["required"] }), h("app-form-item", { key: '9d91d0b3a7f2cf581e500d2ad5a3c71a8703c23d', "label-text": "Description Left", value: this.datasheetPropertyName.nameDescLeft, name: "nameDescLeft", "input-type": "text", multiLanguage: true, "text-rows": "1", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "floating" }), h("app-form-item", { key: '8a9481f9044b4985ca48eebbc7fe039503fc1af2', "label-text": "Description Right", value: this.datasheetPropertyName.nameDescRight, name: "nameDescRight", "input-type": "text", multiLanguage: true, "text-rows": "1", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "floating" }), h("app-form-item", { key: 'fa2bf14c6bcc2c7c28c54ba434614e3b879c527f', "label-text": "Comments", value: this.datasheetPropertyName.comments, name: "comments", "input-type": "text", multiLanguage: true, "text-rows": "1", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "floating" }), h("app-form-item", { key: '0e9cb4192383babbc4f09d16adf6e00b5179b635', "label-text": "Dimension", value: this.datasheetPropertyName.dimension, name: "dimension", "input-type": "text", multiLanguage: true, "text-rows": "1", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "floating" })), h("app-modal-footer", { key: 'ba9ade78b666a9aa9d7ef64a2491f946af6173d4', color: Environment.getAppColor(), disableSave: !this.validDatasheetPropertyName, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalDatasheetPropertyName.style = modalDatasheetPropertynameCss;

export { ModalDatasheetPropertyName as modal_datasheet_propertyname };

//# sourceMappingURL=modal-datasheet-propertyname.entry.js.map