import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-c3ad5e77.js';
import { O as DatasheetsService, Y as DatasheetPropertyType, B as SystemService } from './utils-ced1e260.js';
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
import './map-fe092362.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
import './framework-delegate-779ab78c.js';

const modalDatasheetPropertytypeCss = "modal-datasheet-propertytype ion-list{width:100%}";

const ModalDatasheetPropertyType = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.index = 0;
        this.datasheetPropertyTypes = undefined;
        this.datasheetPropertyType = undefined;
        this.updateView = true;
        this.validDatasheetPropertyType = false;
    }
    async componentWillLoad() {
        await this.loadDatasheetPropertyTypes();
    }
    async loadDatasheetPropertyTypes() {
        await DatasheetsService.downloadDatasheetSettings();
        this.datasheetPropertyTypes = lodash.exports.cloneDeep(DatasheetsService.getDatasheetPropertyTypes());
        if (this.datasheetPropertyTypes && this.datasheetPropertyTypes.length > 0) {
            this.datasheetPropertyType = this.datasheetPropertyTypes[0];
        }
        else {
            //create new and add to list
            this.addDatasheetPropertyType();
        }
        this.validateDatasheet();
    }
    selectType(ev) {
        this.datasheetPropertyType = this.datasheetPropertyTypes.find((x) => x.typeId == ev.detail.value);
        this.validateDatasheet();
    }
    handleChange(ev) {
        const n = ev.detail.name;
        let v = ev.detail.value;
        if (n == "typeId") {
            //remove spaces and lowercase
            v = v.replace(/\s+/g, "-").trim().toLowerCase();
        }
        this.datasheetPropertyType[n] = v;
        this.validateDatasheet();
    }
    validateDatasheet() {
        this.validDatasheetPropertyType =
            lodash.exports.isString(this.datasheetPropertyType.typeId) &&
                lodash.exports.isString(this.datasheetPropertyType.typeName);
        this.updateView = !this.updateView;
    }
    addDatasheetPropertyType() {
        this.datasheetPropertyType = new DatasheetPropertyType();
        this.datasheetPropertyTypes.push(this.datasheetPropertyType);
        this.index = this.datasheetPropertyTypes.length - 1;
    }
    duplicateDatasheetPropertyType() {
        this.datasheetPropertyType = lodash.exports.cloneDeep(this.datasheetPropertyType);
        this.datasheetPropertyType.typeId =
            this.datasheetPropertyType.typeId + "_rev.";
        this.datasheetPropertyTypes.push(this.datasheetPropertyType);
        this.index = this.datasheetPropertyTypes.length - 1;
    }
    async deleteDatasheetPropertyType() {
        try {
            this.datasheetPropertyTypes.splice(this.index, 1);
            this.index = 0;
            this.datasheetPropertyType = this.datasheetPropertyTypes[0];
            this.validateDatasheet();
        }
        catch (error) {
            if (error)
                SystemService.presentAlertError(error);
        }
    }
    async save(dismiss = true) {
        await DatasheetsService.uploadDatasheetSettings("propertyType", this.datasheetPropertyTypes);
        return dismiss ? modalController.dismiss() : true;
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: 'e7175fe17231d656aeb711fdb84523a3cb39fed4' }, h("ion-content", { key: '022fd50d8047f4769f35a1526837606e16530fbf' }, h("ion-grid", { key: '9dd8677e994fa2a71d99d5fa303f0f98502c4254' }, h("ion-row", { key: '36d85871505e03505d3a5cecb86f292ad43f8463' }, h("ion-col", { key: 'ed024f6c6495812763857b5b6c40f1d8fc1cc949' }, h("app-select-search", { key: '5461cbb54a3334b23eb343605ba3e17c2e235ebe', color: "trasteel", label: {
                tag: "datasheet_major_family",
                text: "Datasheet Major Family",
            }, value: this.index
                ? this.datasheetPropertyTypes[this.index].typeId
                : this.datasheetPropertyTypes[0].typeId, lines: "none", "label-placement": "floating", selectFn: (ev) => this.selectType(ev), selectOptions: this.datasheetPropertyTypes, selectValueId: "typeId", selectValueText: ["typeName"], disabled: !this.validDatasheetPropertyType })), h("ion-col", { key: 'bd5cba8153a7e5eacc2995c9b2ed1923fac7d7cb', size: "1", class: "ion-text-center" }, h("ion-button", { key: 'f48fe1674122a7324754e955f1236cf3d6057d46', fill: "clear", disabled: !this.validDatasheetPropertyType, onClick: () => this.addDatasheetPropertyType() }, h("ion-icon", { key: 'c2cc3c2ddb159b9327e5a21428b68123f865023d', name: "add", slot: "start" }))), h("ion-col", { key: '50780ca9e42fa35c4693794b909ed7208cda27a5', size: "1", class: "ion-text-center" }, h("ion-button", { key: 'f386c7a064948eefea1f7f996ca3a952cd569406', fill: "clear", disabled: !this.validDatasheetPropertyType, onClick: () => this.duplicateDatasheetPropertyType() }, h("ion-icon", { key: '36719c180cd3439509429796f2ab6553458a05dc', slot: "start", name: "duplicate" }))), h("ion-col", { key: 'e059dfa65e5d0f561f7a65907680ecdff81dc62f', size: "1", class: "ion-text-center" }, h("ion-button", { key: 'a5057f00e2afd2ae01b1dc824b1b5a0120ff07e8', fill: "clear", color: "danger", disabled: this.datasheetPropertyTypes.length == 0, onClick: () => this.deleteDatasheetPropertyType() }, h("ion-icon", { key: 'd9373167c43489931e065e0bdc4576e42eb6e932', slot: "start", name: "trash" }))))), h("app-form-item", { key: '8b192ff33f08b0dc7634d25347abef551a16b1e7', "label-text": "ID", value: this.datasheetPropertyType.typeId, name: "typeId", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: [
                "required",
                {
                    name: "uniqueid",
                    options: {
                        type: "list",
                        index: "propertyTypeId",
                        list: DatasheetsService.getDatasheetPropertyTypes(),
                    },
                },
            ] }), h("app-form-item", { key: 'd8f71b5c7ace04f5cfbdd9672d121d81ca637b65', "label-text": "Name", value: this.datasheetPropertyType.typeName, name: "typeName", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: ["required"] }), h("app-form-item", { key: '7487c161cf295889d125f6a9e0de8a9c234fe43c', "label-text": "Value Left Description", value: this.datasheetPropertyType.typeLeft, name: "typeLeft", "input-type": "text", multiLanguage: true, "text-rows": "1", onFormItemChanged: (ev) => this.handleChange(ev) }), h("app-form-item", { key: '5df9a355238c1f629c77134fb125e2521bc19530', "label-text": "Value Right Description", value: this.datasheetPropertyType.typeRight, name: "typeRight", "input-type": "text", multiLanguage: true, "text-rows": "1", onFormItemChanged: (ev) => this.handleChange(ev) }), h("app-form-item", { key: 'c3421f2e261aa671c5f5fe0fd19f9f77d78582d1', "label-text": "Value Limit Description", value: this.datasheetPropertyType.typeLimit, name: "typeLimit", "input-type": "text", multiLanguage: true, "text-rows": "1", onFormItemChanged: (ev) => this.handleChange(ev) })), h("app-modal-footer", { key: '3592dc066a0c8bebadd44ceb832a30487afa6b78', color: Environment.getAppColor(), disableSave: !this.validDatasheetPropertyType, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalDatasheetPropertyType.style = modalDatasheetPropertytypeCss;

export { ModalDatasheetPropertyType as modal_datasheet_propertytype };

//# sourceMappingURL=modal-datasheet-propertytype.entry.js.map