import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { ag as ProjectsService, ai as BricksAllocationArea, B as SystemService, T as TranslationService } from './utils-cbf49763.js';
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

const modalProjectBricksallocationareaCss = "modal-project-bricksallocationarea ion-list{width:100%}";

const ModalBricksAllocationArea = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.index = 0;
        this.bricksAllocationAreas = undefined;
        this.bricksAllocationArea = undefined;
        this.updateView = true;
        this.validBricksAllocationArea = false;
    }
    async componentWillLoad() {
        await this.loadBricksAllocationAreas();
    }
    async loadBricksAllocationAreas() {
        await ProjectsService.downloadProjectSettings();
        this.bricksAllocationAreas = lodash.exports.cloneDeep(ProjectsService.getBricksAllocationAreas());
        if (this.bricksAllocationAreas && this.bricksAllocationAreas.length > 0) {
            this.bricksAllocationArea = this.bricksAllocationAreas[0];
        }
        else {
            //create new and add to list
            this.addBricksAllocationArea();
        }
        this.validateProject();
    }
    selectType(ev) {
        this.bricksAllocationArea = this.bricksAllocationAreas[ev.detail.value];
        this.validateProject();
    }
    handleChange(ev) {
        const n = ev.detail.name;
        let v = ev.detail.value;
        if (n == "familyId") {
            //remove spaces and lowercase
            v = v.replace(/\s+/g, "-").trim().toLowerCase();
        }
        this.bricksAllocationArea[n] = v;
        this.validateProject();
    }
    validateProject() {
        this.validBricksAllocationArea =
            lodash.exports.isString(this.bricksAllocationArea.bricksAllocationAreaId) &&
                lodash.exports.isString(this.bricksAllocationArea.bricksAllocationAreaId);
        this.updateView = !this.updateView;
    }
    addBricksAllocationArea() {
        this.bricksAllocationArea = new BricksAllocationArea();
        this.bricksAllocationAreas.push(this.bricksAllocationArea);
        this.index = this.bricksAllocationAreas.length - 1;
    }
    duplicateBricksAllocationArea() {
        this.bricksAllocationArea = lodash.exports.cloneDeep(this.bricksAllocationArea);
        this.bricksAllocationArea.bricksAllocationAreaId =
            this.bricksAllocationArea.bricksAllocationAreaId + "_rev.";
        this.bricksAllocationAreas.push(this.bricksAllocationArea);
        this.index = this.bricksAllocationAreas.length - 1;
    }
    async deleteBricksAllocationArea() {
        try {
            this.bricksAllocationAreas.splice(this.index, 1);
            this.index = 0;
            this.bricksAllocationArea = this.bricksAllocationAreas[0];
            this.validateProject();
        }
        catch (error) {
            if (error)
                SystemService.presentAlertError(error);
        }
    }
    async save(dismiss = true) {
        await ProjectsService.uploadProjectSettings("bricksAllocationArea", this.bricksAllocationAreas);
        return dismiss ? modalController.dismiss() : true;
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: '92af6f329043f77c7cf6bd901d460186d136972f' }, h("ion-content", { key: '5e4216d59c684d07531a4003a6965c5dd967ef72' }, h("ion-grid", { key: '714a64713e8172831c2ed91f25f95cf751cb6a6c' }, h("ion-row", { key: '9fbd492755fff719ff9862c71cf418b1bcf5a093' }, h("ion-col", { key: '07d2135a486e970f25689d5ab5210a8e9c481044' }, h("ion-item", { key: '4e7e8f294b3a6f4d4b0514b02bd6e094c0c25d58', lines: "none" }, h("ion-select", { key: '5aecf7a84a231c74eaf44330eda44c55c21df5fa', color: "trasteel", id: "selectType", interface: "action-sheet", label: TranslationService.getTransl("project_bricksallocationarea", "Project Bricks Allocation Area"), disabled: !this.validBricksAllocationArea, "label-placement": "floating", onIonChange: (ev) => this.selectType(ev), value: this.index ? this.index : 0 }, this.bricksAllocationAreas.map((bricksAllocationArea, index) => (h("ion-select-option", { value: index }, bricksAllocationArea.bricksAllocationAreaId +
            " | " +
            bricksAllocationArea.bricksAllocationAreaName.en)))))), h("ion-col", { key: '75546428202d47494e8de53856ac0952ea97e8e0', size: "1", class: "ion-text-center" }, h("ion-button", { key: 'f2ec4bd000ea68a1e857ca20bdd99eeba6b6a119', fill: "clear", disabled: !this.validBricksAllocationArea, onClick: () => this.addBricksAllocationArea() }, h("ion-icon", { key: '9bffec05b189aa7a71980cb5d1ee7cc8a18405c7', name: "add", slot: "start" }))), h("ion-col", { key: '5b72496dcc608999bb8fd86477c4e3b8f91eb63c', size: "1", class: "ion-text-center" }, h("ion-button", { key: '20ae3baad9610f0019152529f74ef4f0a143dc09', fill: "clear", disabled: !this.validBricksAllocationArea, onClick: () => this.duplicateBricksAllocationArea() }, h("ion-icon", { key: 'b0afa2787524ea2b6124ef6defa5ead9391667cd', slot: "start", name: "duplicate" }))), h("ion-col", { key: '16e6054383926b9b569efcb9e5eceb8ace1122c0', size: "1", class: "ion-text-center" }, h("ion-button", { key: 'ecb274e80482bc1c5d6fd26e59da2c5faa880523', fill: "clear", color: "danger", disabled: this.bricksAllocationAreas.length == 0, onClick: () => this.deleteBricksAllocationArea() }, h("ion-icon", { key: 'f4f4dfa1dd5a669ac115e21e1ae791d56418607b', slot: "start", name: "trash" }))))), h("app-form-item", { key: 'fe645a36660cb4fe9135ced3545ff9e5b4c2f306', "label-text": "ID", value: this.bricksAllocationArea.bricksAllocationAreaId, name: "bricksAllocationAreaId", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: [
                "required",
                {
                    name: "uniqueid",
                    options: {
                        type: "list",
                        index: "bricksAllocationAreaId",
                        list: ProjectsService.getBricksAllocationAreas(),
                    },
                },
            ] }), h("app-form-item", { key: '0a4a514ec663d56a0c0560d30239702076e7625a', "label-text": "Name", value: this.bricksAllocationArea.bricksAllocationAreaName, name: "bricksAllocationAreaName", "input-type": "text", multiLanguage: true, "text-rows": "1", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: ["required"] })), h("app-modal-footer", { key: '4cffe6ceeed649b24a5c88dde6ff25da4f195942', color: Environment.getAppColor(), disableSave: !this.validBricksAllocationArea, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalBricksAllocationArea.style = modalProjectBricksallocationareaCss;

export { ModalBricksAllocationArea as modal_project_bricksallocationarea };

//# sourceMappingURL=modal-project-bricksallocationarea.entry.js.map