import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { aP as DiveProfilePoint, U as UserService, T as TranslationService, a4 as DiveToolsService, aH as GasBlenderService } from './utils-cbf49763.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { a as alertController } from './overlays-b3ceb97d.js';
import './env-9be68260.js';
import './ionic-global-c07767bf.js';
import './map-dae4acde.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
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

const popoverLevelCss = "popover-level .scrollx{display:flex;flex-wrap:nowrap;overflow-x:auto}popover-level .scrollx .item{flex:0 0 0 0}popover-level .scrollx ::-webkit-scrollbar{display:none}popover-level .notification{min-height:20px;height:20px;font-size:0.8em;color:#ea6153;border-width:1px;border-color:#ea6153;padding-left:10px}popover-level .notification .item-inner{margin-left:0px !important;border-bottom:0px !important}popover-level .notification .icon{font-size:1.7em;padding-left:6px !important;padding-top:4px !important}";

const PopoverLevel = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.hasTrimixlicence = true;
        this.hasReblicence = true;
        this.updateGas = true;
        this.ccr = false;
        this.parameters = undefined;
        this.stdGasesList = undefined;
        this.levelProp = undefined;
        this.units = "Metric";
        this.gasWarning = false;
        this.ENDWarning = false;
        this.level = new DiveProfilePoint();
        this.form = undefined;
        this.updateView = false;
    }
    async componentWillLoad() {
        this.hasTrimixlicence = await UserService.checkLicence("trimix");
        this.hasReblicence = await UserService.checkLicence("reb");
        this.level = new DiveProfilePoint();
        if (this.levelProp.depth) {
            this.level.setGas(this.levelProp.gas.fO2, this.levelProp.gas.fHe);
            this.level.setValue("depth", this.levelProp.depth);
            this.level.setValue("setpoint", this.levelProp.setpoint);
            this.level.setValue("time", this.levelProp.time);
            this.level.setValue("index", this.levelProp.index);
        }
        //this.updateGas = this.levelProp.updateGas;
        this.setForm();
        this.updateStdGasList();
    }
    componentDidLoad() {
        this.scrollGas = this.el.querySelector("#scrollGas");
        this.updateStdGasList();
        this.popover = this.el.closest("ion-popover");
    }
    disconnectedCallback() {
        //check valid gases
        this.setForm();
    }
    async setForm() {
        this.form = this.level.getForm();
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
            let selected = this.level.gas.O2 === gas.O2 && this.level.gas.He === gas.He
                ? true
                : false;
            if (selected) {
                isStandardGas = true;
                n = i;
            }
            //update setpoint according to parameters
            gas.ppO2 = this.parameters.bottomppO2;
            //check user limitations and activate gas
            const gasModel = gas.getGas();
            const active = UserService.userRoles.licences.checkGasLimitations(gasModel, false);
            this.stdGases.push({
                selected: selected,
                active: active,
                gas: gasModel,
            });
        });
        if (isStandardGas && this.scrollGas) {
            //scroll list to the left at the selected gas
            setTimeout(() => {
                //scroll list to the left at the selected gas
                let width = this.scrollGas.scrollWidth;
                let clientWidth = this.scrollGas.clientWidth;
                let pagination = i / (width / clientWidth);
                n = n - pagination;
                n = n < 0 ? 0 : n;
                this.scrollGas.scrollLeft = ((width * n) / i) * 1.15;
            });
        }
        //update only if it's a standard gas and it's allowed to update
        this.updateNewGas = isStandardGas && this.updateGas;
        //check if gas had high pO2
        this.updateWarnings(this.level.depth, this.level.gas.ppO2);
    }
    updateWarnings(d, pO2) {
        //check if gas had high pO2
        this.gasWarning = this.level.gas.highPO2WarningatDepthWithTarget(d, pO2);
        this.ENDWarning = this.level.gas.highENDWarningatDepth(this.level.depth);
        this.updateView = !this.updateView;
    }
    setStdGasForDepth() {
        if (!this.hasTrimixlicence) {
            return;
        }
        if (this.updateNewGas) {
            let gas = lodash.exports.find(this.stdGases, (gas) => {
                return gas.gas.fromDepth >= this.level.depth;
            });
            if (gas) {
                gas.selected = true;
                //get setpoint from preferences
                this.level.setValue("setpoint", gas.gas.ppO2);
                if (!this.hasTrimixlicence && gas.He > 0) {
                    gas.gas.He = 0;
                }
                this.level.setGas(gas.gas.O2 / 100, gas.gas.He / 100);
            }
        }
        this.setForm();
    }
    selectStdGas(gas) {
        if (!this.hasTrimixlicence && gas.He > 0) {
            UserService.checkLicence("trimix", true);
            return;
        }
        this.updateNewGas = true;
        //get setpoint from preferences
        this.level.setValue("setpoint", gas.ppO2);
        this.level.setGas(gas.O2 / 100, gas.He / 100);
        this.updateStdGasList();
        this.setForm();
    }
    updateValue(input) {
        this.level.setValue(input, this.form[input]);
        if (input == "depth") {
            this.setStdGasForDepth();
            this.updateStdGasList();
        }
        else if (input == "o2" || input == "he") {
            this.level.setGas(lodash.exports.round(this.form.o2 / 100, 2), lodash.exports.round(this.form.he / 100, 2));
            //check if standard gas
            this.updateStdGasList();
        }
    }
    inputHandler(event) {
        let value = lodash.exports.toNumber(event.detail.value);
        this.form[event.detail.name] = value;
        this.updateValue(event.detail.name);
    }
    blurHandler(event) {
        let value = lodash.exports.toNumber(event.detail.value);
        if (event.detail.name === "depth") {
            //check max depth
            const maxDepth = UserService.userRoles.licences.checkDepthLimitations();
            if (value > maxDepth) {
                value = maxDepth;
            }
        }
        else if (event.detail.name === "o2") {
            //check max O2
            const minO2 = UserService.userRoles.licences.getUserLimitations().minO2;
            const maxO2 = UserService.userRoles.licences.getUserLimitations().maxO2;
            if (value > maxO2) {
                value = maxO2;
            }
            else if (value < minO2) {
                value = minO2;
            }
            //check He value
            if (this.form.he + value > 100) {
                this.form.he = 100 - value;
            }
        }
        else if (event.detail.name === "he") {
            //check max O2
            const maxHe = UserService.userRoles.licences.getUserLimitations().maxHe;
            if (value > maxHe) {
                value = maxHe;
            }
            //check O2 value
            if (this.form.o2 + value > 100) {
                this.form.o2 = 100 - value;
            }
        }
        else if (event.detail.name === "setpoint") {
            value = lodash.exports.toNumber(value);
        }
        this.form[event.detail.name] = value;
        this.updateValue(event.detail.name);
        this.setForm();
        this.updateStdGasList();
    }
    async showpO2Info() {
        const alert = await alertController.create({
            header: "pO2 setpoint",
            message: TranslationService.getTransl("po2-setpoint-info", "The pO2 setpoint is used to update the setpoint of the CCR within the range of this level or deco gas."),
            buttons: [
                {
                    text: TranslationService.getTransl("ok", "OK"),
                },
            ],
        });
        alert.present();
    }
    render() {
        return [
            h("ion-list", { key: '569dce98a10fe099629efc7af8e42df26ecd846e', style: { marginBottom: "0px" } }, h("ion-grid", { key: 'a6e25c618b5a6e48fa6570052b88c29411044828', class: "ion-no-padding" }, h("ion-row", { key: 'ba9ed93c293d0bf6254640190e35b9aeb3e0e911' }, h("ion-col", { key: '3359677175436bb525dd58bc697c8704adcf180d' }, h("app-form-item", { key: '30e2eca6cd646f30ad74956c4712f643e3646d54', "label-tag": "depth", "label-text": "Depth", value: this.form.depth, name: "depth", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: (ev) => this.blurHandler(ev), validator: [
                    "required",
                    {
                        name: "minmaxvalue",
                        options: {
                            min: 1,
                            max: UserService.userRoles.licences.checkDepthLimitations(),
                        },
                    },
                ] })), h("ion-col", { key: '1ee6d0ea7c173e95a7ea89015667fd62248c48c5' }, h("app-form-item", { key: 'e129652290bb87c341ae98f6431bdfa7af68883a', "label-tag": "time", "label-text": "Time", value: this.form.time, name: "time", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: (ev) => this.blurHandler(ev), validator: ["required"] }))), h("ion-row", { key: '4f4388ec746bb0bd23019356fad740aa2d73fb1e' }, h("ion-col", { key: '8430bda4e4d8877ebb83a32bec2e77653dcbb1d4' }, h("ion-row", { key: 'b90a077512743a83b7266c4766090ea7c56b33c3', class: "ion-no-padding" }, h("app-form-item", { key: 'a174cdf17ce118fb78e6e3e436bba21b5aba86c5', "label-text": "O2", value: this.form.o2, name: "o2", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: (ev) => this.blurHandler(ev), forceInvalid: this.gasWarning, validator: [
                    "required",
                    {
                        name: "minmaxvalue",
                        options: {
                            min: UserService.userRoles.licences.getUserLimitations()
                                .minO2,
                            max: UserService.userRoles.licences.getUserLimitations()
                                .maxO2,
                        },
                    },
                ] })), this.gasWarning ? (h("ion-row", { class: "ion-no-padding" }, h("ion-col", null, h("div", { class: "notification" }, h("ion-icon", { name: "warning", "item-start": true }), "High pO2 (", this.level.gas.getpO2atDepth(this.level.depth), ")!")))) : undefined), h("ion-col", { key: '73eeb5267865babaeb3c0ae0641fbc5eb96a110a' }, this.hasTrimixlicence ? ([
                h("ion-row", { class: "ion-no-padding" }, h("app-form-item", { "label-text": "He", value: this.form.he, name: "he", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: (ev) => this.blurHandler(ev), forceInvalid: this.ENDWarning, validator: [
                        "required",
                        {
                            name: "minmaxvalue",
                            options: {
                                min: 0,
                                max: UserService.userRoles.licences.getUserLimitations()
                                    .maxHe,
                            },
                        },
                    ] })),
                this.ENDWarning ? (h("ion-row", { class: "ion-no-padding" }, h("ion-col", null, h("div", { class: "notification" }, h("ion-icon", { name: "warning", "item-start": true }), "High END (", this.level.gas.getEND(this.level.depth), DiveToolsService.depthUnit, ")!")))) : undefined,
            ]) : (h("app-form-item", { "label-text": "He", value: this.form.he, onClick: () => UserService.checkLicence("trimix", true) })))), this.ccr ? (h("ion-row", null, h("ion-col", null, this.hasReblicence ? (h("app-form-item", { "label-tag": "pO2-setpoint", "label-text": "pO2 setPoint", value: this.form.setpoint, name: "setpoint", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: (ev) => this.blurHandler(ev), validator: [
                    {
                        name: "minmaxvalue",
                        options: { min: 0.5, max: 1.6 },
                    },
                ] })) : (h("app-form-item", { "label-tag": "pO2-setpoint", "label-text": "pO2 setPoint", value: this.form.setpoint, onClick: () => UserService.checkLicence("reb", true) }))), h("ion-col", { size: "2", class: "ion-no-padding" }, h("ion-button", { shape: "round", fill: "clear", "icon-only": true, class: "ion-no-padding", onClick: () => this.showpO2Info() }, h("ion-icon", { name: "help-circle-outline" }))))) : undefined, h("ion-row", { key: 'f2e13725ab520e08e432338e7813e7c0b98b7799', class: "scrollx", id: "scrollGas" }, this.stdGases.map((gas) => (h("ion-col", { class: "item" }, h("ion-button", { shape: "round", color: gas.selected ? "secondary" : "primary", disabled: !gas.active, onClick: () => this.selectStdGas(gas.gas) }, GasBlenderService.getGasName(gas.gas)))))), h("ion-row", { key: '367eebb8c1bc29bfe8691d6a2fd9297f0fde4cee' }, h("ion-col", { key: '91fb30d14f4006818b9b30f449759b62b2da92e0' }, h("div", { key: '5825271872037676c86a171356dc254d37130325', class: "notification", style: { color: "blue" } }, "MOD:", " ", this.level.gas.getModF(this.level.gas.fO2, this.level.gas.ppO2), DiveToolsService.depthUnit, " @ ", this.level.gas.ppO2, " pO2"), h("div", { key: '3148325b5e0b512b56c0c0d3d57843ec1217dd2a', class: "notification", style: { color: "blue" } }, "END: ", this.level.gas.getEND(this.level.depth), DiveToolsService.depthUnit, " @ ", this.level.depth, DiveToolsService.depthUnit), h("div", { key: '7563d2429b614a6db106f81ae7b685932dbf8f80', class: "notification", style: { color: "blue" } }, "pO2: ", this.level.gas.getpO2atDepth(this.level.depth), " @", " ", this.level.depth, DiveToolsService.depthUnit))))),
            h("app-modal-footer", { key: '318e9e3286eeb0424318f4b49291eee7120b0964', onCancelEmit: () => this.popover.dismiss(), onSaveEmit: () => this.popover.dismiss(this.form) }),
        ];
    }
    get el() { return getElement(this); }
};
PopoverLevel.style = popoverLevelCss;

export { PopoverLevel as popover_level };

//# sourceMappingURL=popover-level.entry.js.map