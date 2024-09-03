import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-c3ad5e77.js';
import { a4 as DiveToolsService, T as TranslationService } from './utils-ced1e260.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-be90eba5.js';
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
import './overlays-b3ceb97d.js';
import './framework-delegate-779ab78c.js';
import './map-fe092362.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';

const modalTankConfigurationCss = "modal-tank-configuration .scrollx{display:flex;flex-wrap:nowrap;overflow-x:auto}modal-tank-configuration .scrollx .item{flex:0 0 0 0}modal-tank-configuration .scrollx ::-webkit-scrollbar{display:none}modal-tank-configuration input{text-align:right}modal-tank-configuration .fixedLabel{min-width:80% !important;max-width:80% !important}modal-tank-configuration ion-item .item-inner{box-shadow:none !important;border-bottom:1px solid #dedede !important}modal-tank-configuration .item-input .label-md,modal-tank-configuration .item-select .label-md,modal-tank-configuration .item-datetime .label-md{color:rgb(0, 0, 0)}";

const ModalTankConfiguration = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.validForm = {
            name: false,
            depth: false,
            time: false,
            bottom: false,
        };
        this.tank = undefined;
        this.updateView = true;
        this.showSave = false;
    }
    componentWillLoad() { }
    componentDidLoad() {
        this.validateAll();
    }
    save() {
        this.el.closest("ion-modal").dismiss(this.tank);
    }
    close() {
        this.el.closest("ion-modal").dismiss();
    }
    inputHandler(event) {
        this.tank[event.detail.name] = event.detail.value;
        this.validateAll();
    }
    validateAll() {
        this.showSave =
            lodash.exports.isString(this.tank.name) &&
                this.tank.volume > 0.1 &&
                this.tank.no_of_tanks > 0 &&
                this.tank.pressure > 1;
        this.updateView = !this.updateView;
    }
    render() {
        return [
            h("app-navbar", { key: '59588ea9a25de18bf7b768aa02dbe24a4e04a394', tag: "tank-configuration", text: "Tank Configuration", color: Environment.getAppColor(), modal: true }),
            h("ion-content", { key: 'eee9f71dc5af880b3a27723cefa4fdfbbab3567d' }, h("ion-list", { key: '7a57ba36c2c6ff1366bf5cbb3e55a54e8c8491f9' }, h("app-form-item", { key: 'fa968903cf7d89d5686969e96bf7a1d126da3110', "label-tag": "name", "label-text": "Name", value: this.tank.name, name: "name", "input-type": "text", lines: "inset", onFormItemChanged: (ev) => this.inputHandler(ev), validator: ["required"] }), h("app-form-item", { key: '189de0a08df619eeb7e355263aa2d3cb20c1c025', "label-tag": "volume", "label-text": "Volume", appendText: " (lt)", value: this.tank.volume, name: "volume", "input-type": "number", lines: "inset", onFormItemChanged: (ev) => this.inputHandler(ev), validator: [
                    "required",
                    {
                        name: "minvalue",
                        options: { min: 0.1 },
                    },
                ] }), h("app-item-detail", { key: 'f97890f3359f8e72f3578d0b1f931f57aeab952e', labelTag: "volume", labelText: "Volume", appendText: " (cuft)", lines: "inset", alignRight: true, detailText: DiveToolsService.ltToCuFt(this.tank.volume) }), h("ion-item", { key: '07bd6d1715efa075a5f048eb052672bda63c5714' }, h("ion-select", { key: '838706078405f998a6dfc9a42a29a1c407ced2f0', label: TranslationService.getTransl("no_of_tanks", "Number Of Tanks"), interface: "action-sheet", onIonChange: (ev) => this.inputHandler({
                    detail: { name: "no_of_tanks", value: ev.detail.value },
                }), value: this.tank.no_of_tanks }, h("ion-select-option", { key: '78dbc76ddeead32c27244fc1a37b6d10655304e9', value: 1 }, "1"), h("ion-select-option", { key: '06e84df15e38953789306d86fe12c751c01a59e3', value: 2 }, "2"))), h("app-form-item", { key: '842ca0409b4e3a7e2cff36624642eadd1be0c7a3', "label-tag": "pressure", "label-text": "Pressure", appendText: " (bar)", value: this.tank.pressure, name: "pressure", "input-type": "number", lines: "inset", onFormItemChanged: (ev) => this.inputHandler(ev), validator: [
                    "required",
                    {
                        name: "minvalue",
                        options: { min: 1 },
                    },
                ] }), h("app-item-detail", { key: '86eea67d974b6fd1c0358796333a1c0855bf0bdf', "label-tag": "pressure", "label-text": "Pressure", appendText: " (psi)", lines: "inset", alignRight: true, detailText: DiveToolsService.barToPsi(this.tank.pressure) }), h("app-form-item", { key: '753700ef6c16e28e18d97eb6c269e79b57af8636', "label-tag": "for-deco", "label-text": "For Decompression", value: this.tank.forDeco, name: "forDeco", "input-type": "boolean", lines: "inset", onFormItemChanged: (ev) => this.inputHandler(ev) }))),
            h("app-modal-footer", { key: 'e37c48d24ad5fa37cbd75f1772eea1acd0a1ebe1', disableSave: !this.showSave, onCancelEmit: () => this.close(), onSaveEmit: () => this.save() }),
        ];
    }
    get el() { return getElement(this); }
};
ModalTankConfiguration.style = modalTankConfigurationCss;

export { ModalTankConfiguration as modal_tank_configuration };

//# sourceMappingURL=modal-tank-configuration.entry.js.map