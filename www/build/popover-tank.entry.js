import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { aR as TankModel, U as UserService, T as TranslationService, aH as GasBlenderService, a4 as DiveToolsService } from './utils-5cd4c7bb.js';
import { l as lodash } from './lodash-68d560b6.js';
import './env-0a7fccce.js';
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
import './map-e64442d7.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const popoverTankCss = "popover-tank .scrollx{display:flex;flex-wrap:nowrap;overflow-x:auto}popover-tank .scrollx .item{flex:0 0 0 0}popover-tank .scrollx ::-webkit-scrollbar{display:none}popover-tank .notification{min-height:20px;height:20px;font-size:0.8em;color:#ea6153;border-width:1px;border-color:#ea6153;padding-left:10px}popover-tank .notification .item-inner{margin-left:0px !important;border-bottom:0px !important}popover-tank .notification .icon{font-size:1.7em;padding-left:6px !important;padding-top:4px !important}";

const PopoverTank = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.hasTrimixlicence = false;
        this.hasReblicence = false;
        this.ccr = false;
        this.stdGasesList = undefined;
        this.parameters = undefined;
        this.tank = undefined;
        this.decoTanks = undefined;
        this.form = undefined;
        this.tanksList = undefined;
    }
    componentWillLoad() {
        if (!this.tank) {
            let newTank = new TankModel();
            newTank.setForDeco(this.decoTanks);
            this.tank = newTank.getTank();
        }
        this.selectedTank = lodash.exports.find(this.tanksList, { name: this.tank.name });
        if (!this.selectedTank)
            this.selectedTank = lodash.exports.find(this.tanksList, {
                name: this.tank.name.toUpperCase(),
            });
        let gas = this.tank.gas;
        if (gas.fO2) {
            //update setpoint according to parameters
            /*if (gas.fO2 == 1) {
              gas.ppO2 = this.parameters.oxygenppO2;
            } else {
              gas.ppO2 = this.parameters.decoppO2;
            }*/
            this.tank.gas = gas;
        }
        this.setForm();
        this.updateStdGasList();
    }
    componentDidLoad() {
        this.scrollGas = this.el.querySelector("#scrollTankGas");
        this.updateStdGasList();
        this.popover = this.el.closest("ion-popover");
        this.setForm();
    }
    async setForm() {
        this.form = this.tank.getForm();
        this.hasTrimixlicence = await UserService.checkLicence("trimix");
        this.hasReblicence = await UserService.checkLicence("reb");
    }
    updateStdGasList() {
        //create gas list
        this.stdGases = [];
        let isStandardGas = false;
        let i = 0, n = 0;
        this.stdGasesList.forEach((gas) => {
            i++;
            let selected = this.tank.gas.O2 === gas.O2 && this.tank.gas.He === gas.He
                ? true
                : false;
            if (selected) {
                isStandardGas = true;
                n = i;
            }
            //update setpoint according to parameters
            /*if (gas.O2 == 100) {
              gas.ppO2 = this.parameters.oxygenppO2;
            } else {
              gas.ppO2 = this.parameters.decoppO2;
            }*/
            this.stdGases.push({
                selected: selected,
                gas: gas.getGas(),
            });
        });
        if (isStandardGas && this.scrollGas) {
            //scroll list to the left at the selected gas
            setTimeout(() => {
                let width = this.scrollGas.scrollWidth;
                let clientWidth = this.scrollGas.clientWidth;
                let pagination = i / (width / clientWidth);
                n = n - pagination;
                n = n < 0 ? 0 : n;
                this.scrollGas.scrollLeft = ((width * n) / i) * 1.15;
            });
        }
    }
    selectStdGas(gas) {
        if (!this.hasTrimixlicence && gas.He > 0) {
            UserService.checkLicence("trimix", true);
            return;
        }
        this.tank.gas = gas;
        this.setForm();
        this.updateStdGasList();
    }
    updateTank() {
        this.tank.setPressure(lodash.exports.toNumber(this.form.pressure));
        this.tank.gas.updateGas(lodash.exports.toNumber(this.form.O2) / 100, lodash.exports.toNumber(this.form.He) / 100, lodash.exports.toNumber(this.form.fromDepth));
        this.updateStdGasList();
    }
    save() {
        this.tank.setTankType(this.selectedTank);
        this.popover.dismiss(this.tank);
    }
    close() {
        this.popover.dismiss();
    }
    inputHandler(event) {
        this.form[event.detail.name] = event.detail.value;
    }
    blurHandler() {
        this.updateTank();
        this.setForm();
    }
    selectTank(ev) {
        this.selectedTank = ev.detail.value;
    }
    render() {
        return [
            h("ion-list", { key: '8e3684825b30d5c1f6b2424ff6dc1e7ca8f3e5cf', style: { marginBottom: "0" } }, h("ion-grid", { key: '9ad2ae94323dc6748924c80a736c46f3100bcd72', class: "ion-no-padding" }, h("ion-row", { key: '694156d89f47ffe286f129547f17010cb094461e' }, h("ion-col", { key: 'c82849be5a6c9b00b8d4a8a7b0ef8e368189a433' }, h("ion-item", { key: '1b34f4b7eb511db5fb2374ed56ceb22b71fded7f' }, h("ion-select", { key: '5c85ae16ed1c40dfff8927f7c34123bcef0a9c0e', label: TranslationService.getTransl("tank", "Tank"), onIonChange: (ev) => this.selectTank(ev), value: this.selectedTank }, this.tanksList.map((tank) => (h("ion-select-option", { value: tank }, tank.name))))))), h("ion-row", { key: '206faaadd42d86bebea164fa15fa7341102d2373' }, h("ion-col", { key: '8292f3b15bb48d47be3ea5e17f43a25c08606f71' }, h("app-form-item", { key: '674f7073fae3b36df51d28a3361b7fdad83dc2d1', "label-tag": "pressure", "label-text": "Pressure", value: this.form.pressure, name: "pressure", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: () => this.blurHandler(), validator: ["required"] }))), h("ion-row", { key: '26bce0634de934a5738ce18b0092d3958fa238a1' }, h("ion-col", { key: '94be627fe78e9843160caa9c0f792531db70ff06' }, h("app-form-item", { key: 'dbf7404b87900d33323a289a3f2dc1751ea5abcc', "label-text": "O2", value: this.form.O2, name: "O2", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: () => this.blurHandler(), validator: [
                    "required",
                    {
                        name: "minmaxvalue",
                        options: { min: 1, max: 100 - this.form.He },
                    },
                ] })), h("ion-col", { key: '698544b0ede269bcd8366c601e026e32ab467790' }, this.hasTrimixlicence ? (h("app-form-item", { "label-text": "He", value: this.form.He, name: "He", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: () => this.blurHandler(), validator: [
                    "required",
                    {
                        name: "minmaxvalue",
                        options: { min: 0, max: 100 - this.form.O2 },
                    },
                ] })) : (h("ion-item", { onClick: () => UserService.checkLicence("trimix", true) }, h("ion-label", null, "He"), this.form.He)))), h("ion-row", { key: '653652f71e9526ff1cab5266d7c175ad7d0987b9' }, h("ion-col", { key: 'ad8748ce9284869a0ecbe7c82dc5f2f8be766b41' }, h("app-form-item", { key: '313c436af9c5283edf95808723c43fe5593ac7e1', "label-tag": "depth", "label-text": "Depth", value: this.form.fromDepth, name: "fromDepth", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: () => this.blurHandler(), validator: ["required"] })), this.ccr ? (h("ion-col", null, this.hasReblicence ? (h("app-form-item", { "label-tag": "pO2-setpoint", "label-text": "pO2 setPoint", value: this.form.ppO2, name: "ppO2", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: () => this.blurHandler(), validator: [
                    {
                        name: "minmaxvalue",
                        options: { min: 0.5, max: 1.6 },
                    },
                ] })) : (h("app-form-item", { "label-tag": "pO2-setpoint", "label-text": "pO2 setPoint", value: this.form.ppO2, onClick: () => UserService.checkLicence("reb", true) })))) : undefined), h("ion-row", { key: 'dd193e5611bb8525b2688fdf8a58e336aee89407', class: "scrollx", id: "scrollTankGas" }, this.stdGases.map((gas) => (h("ion-col", { class: "item" }, h("ion-button", { shape: "round", color: gas.selected ? "secondary" : "primary", onClick: () => this.selectStdGas(gas.gas) }, GasBlenderService.getGasName(gas.gas)))))), h("ion-row", { key: 'e5c950e9eb01434d2d19437a14f3cba1eb525639' }, h("ion-col", { key: '2109d29a4e02be67ec90cbd5e387510e908dfa80' }, h("div", { key: '14c741f5ac94817cad0ec359c690fcf7e25d216a', class: "notification", style: { color: "blue" } }, "MOD: ", this.tank.gas.getMod(), DiveToolsService.depthUnit, " @ ", this.tank.gas.ppO2, " pO2"), h("div", { key: 'fd2b6b48106ef86e644531abd51541903fd2d04a', class: "notification", style: { color: "blue" } }, "pO2: ", this.tank.gas.getpO2atDepth(this.tank.gas.fromDepth, 2), " ", "pO2 @ ", this.tank.gas.fromDepth, DiveToolsService.depthUnit))))),
            h("app-modal-footer", { key: '98f36a84068c969462e3979fa354cc7e1b21c56e', onCancelEmit: () => this.close(), onSaveEmit: () => this.save() }),
        ];
    }
    get el() { return getElement(this); }
};
PopoverTank.style = popoverTankCss;

export { PopoverTank as popover_tank };

//# sourceMappingURL=popover-tank.entry.js.map