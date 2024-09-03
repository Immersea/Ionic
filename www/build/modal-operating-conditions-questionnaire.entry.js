import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
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
import './framework-delegate-779ab78c.js';

const modalOperatingConditionsQuestionnaireCss = "modal-operating-conditions-questionnaire ion-list{width:100%}";

const ModalOperatingConditionsQuestionnaire = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.condition = undefined;
        this.conditionData = undefined;
        this.editable = false;
    }
    async save() {
        modalController.dismiss(this.conditionData);
    }
    async cancel() {
        modalController.dismiss();
    }
    render() {
        return (h(Host, { key: 'b62201473dc023708edf52bfccd4b4f1d1c697f3' }, h("ion-header", { key: 'b52a9c59aa37e6e53a5634051d79c05511f94284' }, h("ion-toolbar", { key: '36d52194eee80d72e08a52b2302ff83b60ad883d', color: Environment.getAppColor() }, h("ion-title", { key: 'f85220c89f725889be62bc4cfa21b7cba8968ba2' }, this.condition + " operating conditions"))), h("ion-content", { key: '4c885ae75c5b5a4903325c718c77903c2d424e60' }, this.condition == "EAF" ? (h("app-eaf-questionnaire", { conditions: this.conditionData, editable: this.editable, onUpdateEmit: (data) => (this.conditionData = data.detail) })) : this.condition == "LF" ? (h("app-lf-questionnaire", { conditions: this.conditionData, editable: this.editable, onUpdateEmit: (data) => (this.conditionData = data.detail) })) : this.condition == "CCM" ? (h("app-ccm-questionnaire", { conditions: this.conditionData, editable: this.editable, onUpdateEmit: (data) => (this.conditionData = data.detail) })) : undefined), h("app-modal-footer", { key: 'ba48acc97956d93b468167bbd20eb4e149c42ea2', color: Environment.getAppColor(), showSave: this.editable, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalOperatingConditionsQuestionnaire.style = modalOperatingConditionsQuestionnaireCss;

export { ModalOperatingConditionsQuestionnaire as modal_operating_conditions_questionnaire };

//# sourceMappingURL=modal-operating-conditions-questionnaire.entry.js.map