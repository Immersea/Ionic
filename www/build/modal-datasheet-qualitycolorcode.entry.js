import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { O as DatasheetsService, Z as DatasheetQualityColorCode, B as SystemService, T as TranslationService } from './utils-cbf49763.js';
import { E as Environment } from './env-9be68260.js';
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
import './map-dae4acde.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';
import './framework-delegate-779ab78c.js';

const modalDatasheetQualitycolorcodeCss = "modal-datasheet-qualitycolorcode ion-list{width:100%}";

const ModalDatasheetQualityColorCode = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.index = 0;
        this.datasheetQualityColorCodes = undefined;
        this.datasheetQualityColorCode = undefined;
        this.updateView = true;
        this.validDatasheetQualityColorCode = false;
    }
    async componentWillLoad() {
        await this.loadDatasheetQualityColorCodes();
    }
    async loadDatasheetQualityColorCodes() {
        await DatasheetsService.downloadDatasheetSettings();
        this.datasheetQualityColorCodes = lodash.exports.cloneDeep(DatasheetsService.getDatasheetQualityColorCodes());
        if (this.datasheetQualityColorCodes &&
            this.datasheetQualityColorCodes.length > 0) {
            this.datasheetQualityColorCode = this.datasheetQualityColorCodes[0];
        }
        else {
            //create new and add to list
            this.addDatasheetQualityColorCode();
        }
        this.validateDatasheet();
    }
    selectType(ev) {
        this.datasheetQualityColorCode =
            this.datasheetQualityColorCodes[ev.detail.value];
        this.validateDatasheet();
    }
    handleChange(ev) {
        const n = ev.detail.name;
        let v = ev.detail.value;
        if (n == "qualityColorCodeId") {
            //remove spaces and lowercase
            v = v.replace(/\s+/g, "-").trim().toLowerCase();
        }
        this.datasheetQualityColorCode[n] = v;
        this.validateDatasheet();
    }
    validateDatasheet() {
        this.validDatasheetQualityColorCode =
            lodash.exports.isString(this.datasheetQualityColorCode.qualityColorCodeId) &&
                lodash.exports.isString(this.datasheetQualityColorCode.qualityColorCodePicture);
        this.updateView = !this.updateView;
    }
    addDatasheetQualityColorCode() {
        this.datasheetQualityColorCode = new DatasheetQualityColorCode();
        this.datasheetQualityColorCodes.push(this.datasheetQualityColorCode);
        this.index = this.datasheetQualityColorCodes.length - 1;
    }
    duplicateDatasheetQualityColorCode() {
        this.datasheetQualityColorCode = lodash.exports.cloneDeep(this.datasheetQualityColorCode);
        this.datasheetQualityColorCode.qualityColorCodeId =
            this.datasheetQualityColorCode.qualityColorCodeId + "_rev.";
        this.datasheetQualityColorCodes.push(this.datasheetQualityColorCode);
        this.index = this.datasheetQualityColorCodes.length - 1;
    }
    async deleteDatasheetQualityColorCode() {
        try {
            this.datasheetQualityColorCodes.splice(this.index, 1);
            this.index = 0;
            this.datasheetQualityColorCode = this.datasheetQualityColorCodes[0];
            this.validateDatasheet();
        }
        catch (error) {
            if (error)
                SystemService.presentAlertError(error);
        }
    }
    async save(dismiss = true) {
        await DatasheetsService.uploadDatasheetSettings("qualityColorCode", this.datasheetQualityColorCodes);
        return dismiss ? modalController.dismiss() : true;
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: 'e1b356ba2aa35f979fab09591bd126c99d8bf535' }, h("ion-content", { key: '7c06a89ebda806b10e5a521d99c5fd17a4cb9ea2' }, h("ion-grid", { key: '6d60c64b17d0b9ec986515bcd2016f5aa3f7f28a' }, h("ion-row", { key: '79f40cef17e78b7682e980f2c9e43c732317c0d4' }, h("ion-col", { key: 'c0c1b6eaca7579dc7e0e97c12e9c8486a6af4290' }, h("ion-item", { key: 'f3b52841fcc2987e4b40b9601bef617ef096e85d', lines: "none" }, h("ion-select", { key: 'd8392ba302f4d2091ce631847c6f42e7dd537a0d', color: "trasteel", id: "selectType", interface: "action-sheet", label: TranslationService.getTransl("datasheet_qualityColorCode", "Datasheet QualityColorCode"), disabled: !this.validDatasheetQualityColorCode, "label-placement": "floating", onIonChange: (ev) => this.selectType(ev), value: this.index ? this.index : 0 }, this.datasheetQualityColorCodes.map((datasheetQualityColorCode, index) => (h("ion-select-option", { value: index }, datasheetQualityColorCode.qualityColorCodeId +
            " | " +
            datasheetQualityColorCode.qualityColorCodePicture)))))), h("ion-col", { key: '71ee7411a0b01e36a8c5031ba8a84892c05aa92e', size: "1", class: "ion-text-center" }, h("ion-button", { key: '1c0f9ffe7e1735a1319194aea629ebbf58837e27', fill: "clear", disabled: !this.validDatasheetQualityColorCode, onClick: () => this.addDatasheetQualityColorCode() }, h("ion-icon", { key: '618db25c2034674a3bb3876f779919077f6f3177', name: "add", slot: "start" }))), h("ion-col", { key: '5d0995c5c10a6bc93b42f00b5fc093b44f1d4112', size: "1", class: "ion-text-center" }, h("ion-button", { key: '970bc5d4c75cfb4c47c927818c1f15eaadbb11ec', fill: "clear", disabled: !this.validDatasheetQualityColorCode, onClick: () => this.duplicateDatasheetQualityColorCode() }, h("ion-icon", { key: 'd6173c070108372022aad9f4df9ffc7c231635e5', slot: "start", name: "duplicate" }))), h("ion-col", { key: '7d33d747c55bca9925be0cfe3b925c00f1caa8b0', size: "1", class: "ion-text-center" }, h("ion-button", { key: '1fe6ef7c47cc16799cc086ed10778c4262d3bb16', fill: "clear", color: "danger", disabled: this.datasheetQualityColorCodes.length == 0, onClick: () => this.deleteDatasheetQualityColorCode() }, h("ion-icon", { key: 'fcb0183b42aa33cbe2d6064351d828b6851619e9', slot: "start", name: "trash" }))))), h("app-form-item", { key: '3e40ce76471c857921a57fe9ba93c0ccf10d035c', "label-text": "ID", value: this.datasheetQualityColorCode.qualityColorCodeId, name: "qualityColorCodeId", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: [
                "required",
                {
                    name: "uniqueid",
                    options: {
                        type: "list",
                        index: "qualityColorCodeId",
                        list: DatasheetsService.getDatasheetQualityColorCodes(),
                    },
                },
            ] }), h("app-form-item", { key: '498d81809a8c066fa79e607e6812846c5f7b758f', "label-text": "Name", value: this.datasheetQualityColorCode.qualityColorCodePicture, name: "qualityColorCodePicture", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: ["required"] })), h("app-modal-footer", { key: '099027fe6e1739ae17fc50131adf0bb019743203', color: Environment.getAppColor(), disableSave: !this.validDatasheetQualityColorCode, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalDatasheetQualityColorCode.style = modalDatasheetQualitycolorcodeCss;

export { ModalDatasheetQualityColorCode as modal_datasheet_qualitycolorcode };

//# sourceMappingURL=modal-datasheet-qualitycolorcode.entry.js.map