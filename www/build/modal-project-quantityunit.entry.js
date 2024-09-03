import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { ag as ProjectsService, aj as QuantityUnit, B as SystemService, T as TranslationService } from './utils-cbf49763.js';
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

const modalProjectQuantityunitCss = "modal-project-quantityunit ion-list{width:100%}";

const ModalQuantityUnit = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.index = 0;
        this.quantityUnits = undefined;
        this.quantityUnit = undefined;
        this.updateView = true;
        this.validQuantityUnit = false;
    }
    async componentWillLoad() {
        await this.loadQuantityUnits();
    }
    async loadQuantityUnits() {
        await ProjectsService.downloadProjectSettings();
        this.quantityUnits = lodash.exports.cloneDeep(ProjectsService.getQuantityUnits());
        if (this.quantityUnits && this.quantityUnits.length > 0) {
            this.quantityUnit = this.quantityUnits[0];
        }
        else {
            //create new and add to list
            this.addQuantityUnit();
        }
        this.validateProject();
    }
    selectType(ev) {
        this.quantityUnit = this.quantityUnits[ev.detail.value];
        this.validateProject();
    }
    handleChange(ev) {
        const n = ev.detail.name;
        let v = ev.detail.value;
        if (n == "familyId") {
            //remove spaces and lowercase
            v = v.replace(/\s+/g, "-").trim().toLowerCase();
        }
        this.quantityUnit[n] = v;
        this.validateProject();
    }
    validateProject() {
        this.validQuantityUnit =
            lodash.exports.isString(this.quantityUnit.quantityUnitId) &&
                lodash.exports.isString(this.quantityUnit.quantityUnitId);
        this.updateView = !this.updateView;
    }
    addQuantityUnit() {
        this.quantityUnit = new QuantityUnit();
        this.quantityUnits.push(this.quantityUnit);
        this.index = this.quantityUnits.length - 1;
    }
    duplicateQuantityUnit() {
        this.quantityUnit = lodash.exports.cloneDeep(this.quantityUnit);
        this.quantityUnit.quantityUnitId =
            this.quantityUnit.quantityUnitId + "_rev.";
        this.quantityUnits.push(this.quantityUnit);
        this.index = this.quantityUnits.length - 1;
    }
    async deleteQuantityUnit() {
        try {
            this.quantityUnits.splice(this.index, 1);
            this.index = 0;
            this.quantityUnit = this.quantityUnits[0];
            this.validateProject();
        }
        catch (error) {
            if (error)
                SystemService.presentAlertError(error);
        }
    }
    async save(dismiss = true) {
        await ProjectsService.uploadProjectSettings("quantityUnit", this.quantityUnits);
        return dismiss ? modalController.dismiss() : true;
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: 'a710b9ffc34e2c0655751de746303ee43e46a3fd' }, h("ion-content", { key: 'f7ae067f800ae6e99925e46c66c44724b4ee9ff0' }, h("ion-grid", { key: '25e345ad3228e137b7e0601573f1c964f3796d1b' }, h("ion-row", { key: '9201f45073a92c89a4d0b390c8d0b74bbb87c50e' }, h("ion-col", { key: 'a1dae88f8f073e9ac7517faf62a828c2d1e86486' }, h("ion-item", { key: '9eab589d3958203957f858064049cb63580aae35', lines: "none" }, h("ion-select", { key: '7c0b1aea440909c752ca4b99b3ad7b1ec9b7e9bd', color: "trasteel", id: "selectType", interface: "action-sheet", label: TranslationService.getTransl("project_quantityunit", "Project Quantity Unit"), disabled: !this.validQuantityUnit, "label-placement": "floating", onIonChange: (ev) => this.selectType(ev), value: this.index ? this.index : 0 }, this.quantityUnits.map((quantityUnit, index) => (h("ion-select-option", { value: index }, quantityUnit.quantityUnitId +
            " | " +
            quantityUnit.quantityUnitName.en)))))), h("ion-col", { key: 'd8c34f0e0c13653f6930a88e707f5618a407aaf6', size: "1", class: "ion-text-center" }, h("ion-button", { key: '686e725edb088958fe99f6eaf0a8c75bdbc43f8c', fill: "clear", disabled: !this.validQuantityUnit, onClick: () => this.addQuantityUnit() }, h("ion-icon", { key: '70e96b85cba33238e5a818a6e89b5bb85a939721', name: "add", slot: "start" }))), h("ion-col", { key: 'f460deb1428d89184d44ee01da08aa9768cbc121', size: "1", class: "ion-text-center" }, h("ion-button", { key: 'c14965f25d0c2c4da4f872c4d6246be7c551b209', fill: "clear", disabled: !this.validQuantityUnit, onClick: () => this.duplicateQuantityUnit() }, h("ion-icon", { key: 'cd62d81384683fdaa719a6862e01abaf1b63e4d0', slot: "start", name: "duplicate" }))), h("ion-col", { key: 'ad5e194597a5e256460cfe3fa0689d5c9aaf77ec', size: "1", class: "ion-text-center" }, h("ion-button", { key: '3b4d77e5dd29b829c0ae3107107cd43ff1f2cfdf', fill: "clear", color: "danger", disabled: this.quantityUnits.length == 0, onClick: () => this.deleteQuantityUnit() }, h("ion-icon", { key: '2e8d4ec2ba2478c6c60d74f9b1efdf8080c59acd', slot: "start", name: "trash" }))))), h("app-form-item", { key: '986d874882147a047e631129f8ffff140474da08', "label-text": "ID", value: this.quantityUnit.quantityUnitId, name: "quantityUnitId", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: [
                "required",
                {
                    name: "uniqueid",
                    options: {
                        type: "list",
                        index: "quantityUnitId",
                        list: ProjectsService.getQuantityUnits(),
                    },
                },
            ] }), h("app-form-item", { key: '01dbec5650cced0084ef73314e5284953626325d', "label-text": "Name", value: this.quantityUnit.quantityUnitName, name: "quantityUnitName", "input-type": "text", multiLanguage: true, "text-rows": "1", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: ["required"] })), h("app-modal-footer", { key: '5c0f4b54b3b83a948efac99be6939f757612002e', color: Environment.getAppColor(), disableSave: !this.validQuantityUnit, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalQuantityUnit.style = modalProjectQuantityunitCss;

export { ModalQuantityUnit as modal_project_quantityunit };

//# sourceMappingURL=modal-project-quantityunit.entry.js.map