import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-0a7fccce.js';
import { O as DatasheetsService, V as DatasheetFamily, B as SystemService } from './utils-5cd4c7bb.js';
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

const modalDatasheetFamilyCss = "modal-datasheet-family ion-list{width:100%}";

const ModalDatasheetFamily = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.index = 0;
        this.datasheetFamilies = undefined;
        this.datasheetFamily = undefined;
        this.updateView = true;
        this.validDatasheetFamily = false;
    }
    async componentWillLoad() {
        await this.loadDatasheetFamilies();
    }
    async loadDatasheetFamilies() {
        await DatasheetsService.downloadDatasheetSettings();
        this.datasheetFamilies = lodash.exports.cloneDeep(DatasheetsService.getDatasheetFamilies());
        if (this.datasheetFamilies && this.datasheetFamilies.length > 0) {
            this.datasheetFamily = this.datasheetFamilies[0];
        }
        else {
            //create new and add to list
            this.addDatasheetFamily();
        }
        this.validateDatasheet();
    }
    selectType(ev) {
        this.datasheetFamily = this.datasheetFamilies.find((x) => x.familyId == ev.detail.value);
        this.validateDatasheet();
    }
    handleChange(ev) {
        const n = ev.detail.name;
        let v = ev.detail.value;
        if (n == "familyId") {
            //remove spaces and lowercase
            v = v.replace(/\s+/g, "-").trim().toLowerCase();
        }
        this.datasheetFamily[n] = v;
        this.validateDatasheet();
    }
    validateDatasheet() {
        this.validDatasheetFamily =
            lodash.exports.isString(this.datasheetFamily.familyId) &&
                lodash.exports.isString(this.datasheetFamily.familyName);
        this.updateView = !this.updateView;
    }
    addDatasheetFamily() {
        this.datasheetFamily = new DatasheetFamily();
        this.datasheetFamilies.push(this.datasheetFamily);
        this.index = this.datasheetFamilies.length - 1;
    }
    duplicateDatasheetFamily() {
        this.datasheetFamily = lodash.exports.cloneDeep(this.datasheetFamily);
        this.datasheetFamily.familyId = this.datasheetFamily.familyId + "_rev.";
        this.datasheetFamilies.push(this.datasheetFamily);
        this.index = this.datasheetFamilies.length - 1;
    }
    async deleteDatasheetFamily() {
        try {
            this.datasheetFamilies.splice(this.index, 1);
            this.index = 0;
            this.datasheetFamily = this.datasheetFamilies[0];
            this.validateDatasheet();
        }
        catch (error) {
            if (error)
                SystemService.presentAlertError(error);
        }
    }
    async save(dismiss = true) {
        await DatasheetsService.uploadDatasheetSettings("family", this.datasheetFamilies);
        return dismiss ? modalController.dismiss() : true;
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: 'a87053adef1d90dfa472f0a25d632d2f6c4a6f82' }, h("ion-content", { key: 'a7a31ed049a52b29f34655b0d41bf79a73520fac' }, h("ion-grid", { key: 'd8bd94be4376648a114e8dd1638e2cd238341196' }, h("ion-row", { key: '541ae3a71ec28429a1db7b614e0b7c883e55f4c4' }, h("ion-col", { key: 'dcbdcd7a4847e28e4e4df804ee1c3c409e637a1e' }, h("app-select-search", { key: '3c653ae4d8235b1d2849a01587a36302bc3f1012', color: "trasteel", label: {
                tag: "datasheet_family",
                text: "Datasheet Family",
            }, value: this.index
                ? this.datasheetFamilies[this.index].familyId
                : this.datasheetFamilies[0].familyId, lines: "none", "label-placement": "floating", selectFn: (ev) => this.selectType(ev), selectOptions: this.datasheetFamilies, selectValueId: "familyId", selectValueText: ["familyName"], disabled: !this.validDatasheetFamily })), h("ion-col", { key: '596382202c7ee81f3a30bc7ccba5b251a70926c4', size: "1", class: "ion-text-center" }, h("ion-button", { key: 'c451080c28bd96dd6049ba8c295dea6cc700bf65', fill: "clear", disabled: !this.validDatasheetFamily, onClick: () => this.addDatasheetFamily() }, h("ion-icon", { key: '968654ddf6303c125360667818034b75a7973cdb', name: "add", slot: "start" }))), h("ion-col", { key: 'e4cd27cdcd2aaa16bb81f9401ce07ce26979cbd2', size: "1", class: "ion-text-center" }, h("ion-button", { key: 'f3eec7aa3757f9bc078684b27fc477848f7f4bfa', fill: "clear", disabled: !this.validDatasheetFamily, onClick: () => this.duplicateDatasheetFamily() }, h("ion-icon", { key: 'd885d9dec9519037295dcead962c3679e4cbe6f3', slot: "start", name: "duplicate" }))), h("ion-col", { key: '814fe4386a23b49e967ea1dcf3b86a8b42ff63fc', size: "1", class: "ion-text-center" }, h("ion-button", { key: '11bef17cf4a290fdf0e8de873d67dac62e87641e', fill: "clear", color: "danger", disabled: this.datasheetFamilies.length == 0, onClick: () => this.deleteDatasheetFamily() }, h("ion-icon", { key: 'f06c1647c1d5ee30b9fe761d06cd110431ae9d0f', slot: "start", name: "trash" }))))), h("app-form-item", { key: 'd0df030dd2d23e60c04a0120877ddf3f5ca057f9', "label-text": "ID", value: this.datasheetFamily.familyId, name: "familyId", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: [
                "required",
                {
                    name: "uniqueid",
                    options: {
                        type: "list",
                        index: "familyId",
                        list: DatasheetsService.getDatasheetFamilies(),
                    },
                },
            ] }), h("app-form-item", { key: '25ce3e36373baca190d85c30015980725b8989eb', "label-text": "Name", value: this.datasheetFamily.familyName, name: "familyName", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: ["required"] })), h("app-modal-footer", { key: '5e26e41b5b2405d24cba6cb0d396bf1dfda82240', color: Environment.getAppColor(), disableSave: !this.validDatasheetFamily, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalDatasheetFamily.style = modalDatasheetFamilyCss;

export { ModalDatasheetFamily as modal_datasheet_family };

//# sourceMappingURL=modal-datasheet-family.entry.js.map