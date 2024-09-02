import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { aG as Gas, U as UserService, a4 as DiveToolsService, T as TranslationService, aH as GasBlenderService } from './utils-5cd4c7bb.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { a as alertController } from './overlays-b3ceb97d.js';
import './env-0a7fccce.js';
import './ionic-global-c07767bf.js';
import './map-e64442d7.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';
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

const popoverGasCss = "popover-gas{}popover-gas .scrollx{display:flex;flex-wrap:nowrap;overflow-x:auto}popover-gas .scrollx .item{flex:0 0 0 0}popover-gas .scrollx ::-webkit-scrollbar{display:none}popover-gas .notification{min-height:20px;height:20px;font-size:0.8em;color:#ea6153;border-width:1px;border-color:#ea6153;padding-left:10px}popover-gas .notification .item-inner{margin-left:0px !important;border-bottom:0px !important}popover-gas .notification .icon{font-size:1.7em;padding-left:6px !important;padding-top:4px !important}";

const PopoverGas = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.hasTrimixlicence = true;
        this.hasReblicence = true;
        this.ccr = false;
        this.parameters = undefined;
        this.stdDecoGases = undefined;
        this.gasProp = undefined;
        this.gasWarning = false;
        this.ENDWarning = false;
        this.gas = new Gas();
        this.form = undefined;
        this.updateView = false;
    }
    async componentWillLoad() {
        this.hasTrimixlicence = await UserService.checkLicence("trimix");
        this.hasReblicence = await UserService.checkLicence("reb");
        this.updateStdGasList();
        if (this.gasProp && this.gasProp.getFO2()) {
            this.gas = this.gasProp;
        }
        else {
            //select first available gas
            const gas = lodash.exports.last(lodash.exports.filter(this.stdGases, { active: true }));
            this.gas = gas ? gas["gas"] : new Gas(0.21, 0, 30, 1.2);
        }
        /*if (this.gas.fO2) {
          //update setpoint according to parameters
          if (this.gas.fO2 == 1) {
            this.gas.ppO2 = this.parameters.oxygenppO2;
          } else {
            this.gas.ppO2 = this.parameters.decoppO2;
          }
        }*/
        this.setForm();
        this.updateStdGasList();
    }
    componentDidLoad() {
        this.scrollGas = this.el.querySelector("#scrollGas");
        //update from Depth if Imperial
        this.stdDecoGases.forEach((gas) => {
            if (DiveToolsService.isImperial()) {
                gas.fromDepth =
                    lodash.exports.round(DiveToolsService.metersToFeet(gas.fromDepth) / 10) * 10;
            }
        });
        this.updateStdGasList();
        this.popover = this.el.closest("ion-popover");
    }
    disconnectedCallback() {
        //check valid gases
        this.setForm();
    }
    async setForm() {
        this.form = this.gas.getForm();
        this.hasTrimixlicence = await UserService.checkLicence("trimix");
        this.hasReblicence = await UserService.checkLicence("reb");
    }
    updateStdGasList() {
        //create gas list
        this.stdGases = [];
        let isStandardGas = false;
        let i = 0, n = 0;
        this.stdDecoGases.forEach((gas) => {
            i++;
            let selected = this.gas.O2 === gas.O2 && this.gas.He === gas.He ? true : false;
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
            //check user limitations and activate gas
            const gasModel = gas.getGas();
            const active = UserService.userRoles.licences.checkGasLimitations(gasModel, false);
            this.stdGases.push({
                selected: selected,
                active: active,
                gas: gasModel,
            });
        });
        setTimeout(() => {
            if (isStandardGas && this.scrollGas) {
                //scroll list to the left at the selected gas
                let width = this.scrollGas.scrollWidth;
                let clientWidth = this.scrollGas.clientWidth;
                let pagination = i / (width / clientWidth);
                n = n - pagination;
                n = n < 0 ? 0 : n;
                this.scrollGas.scrollLeft = ((width * n) / i) * 1.15;
            }
        });
        //check if gas had high pO2
        this.updateWarnings(this.gas.fromDepth, 1.6); //deco gases so keep 1.6 as limit pO2
    }
    updateWarnings(d, pO2) {
        //check if gas had high pO2
        this.gasWarning = this.gas.highPO2WarningatDepthWithTarget(d, pO2);
        this.ENDWarning = this.gas.highENDWarningatDepth(this.gas.fromDepth);
        this.updateView = !this.updateView;
    }
    selectStdGas(gas) {
        if (!this.hasTrimixlicence && gas.He > 0) {
            UserService.checkLicence("trimix", true);
            return;
        }
        this.gas = gas;
        this.setForm();
        this.updateStdGasList();
    }
    updateGas(input) {
        if (input == "o2") {
            this.gas.setFO2(lodash.exports.round(lodash.exports.toNumber(this.form.o2), 2) / 100);
        }
        else if (input == "he") {
            this.gas.setFHe(lodash.exports.round(lodash.exports.toNumber(this.form.he), 2) / 100);
        }
        else if (input == "fromDepth") {
            this.gas.setFromDepth(lodash.exports.toNumber(this.form.fromDepth));
        }
        else if (input == "ppO2") {
            this.gas.ppO2 = lodash.exports.toNumber(this.form.ppO2);
        }
        this.updateStdGasList();
    }
    inputHandler(event) {
        let value = lodash.exports.toNumber(event.detail.value);
        this.form[event.detail.name] = value;
        this.updateGas(event.detail.name);
    }
    blurHandler(event) {
        let value = lodash.exports.toNumber(event.detail.value);
        if (event.detail.name === "o2") {
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
        else if (event.detail.name === "ppO2") {
            value = lodash.exports.toNumber(value);
        }
        this.form[event.detail.name] = value;
        this.updateGas(event.detail.name);
        this.setForm();
        this.updateStdGasList();
    }
    setUseAsDiluent(value) {
        this.gas.setUseAsDiluent(value);
        this.setForm();
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
            h("ion-list", { key: '0ed69f43fcc28e6d7ea6abbec081fd15ca9ccdc5', style: { marginBottom: "0px" } }, h("ion-grid", { key: 'f647117ac364a00e1bf134b8458cc554c94cfb0d', class: "ion-no-padding" }, h("ion-row", { key: '7ea0a611c92b045e31f76d589d7f5a36857583ca' }, h("ion-col", { key: 'f52ab23d424c7e7c17df4e99a8318ed65d78d7fe' }, h("ion-row", { key: 'ced3cc0972c3e6a257ebcbedc363e0cec1989246', class: "ion-no-padding" }, h("app-form-item", { key: '87e170cbef8f88d72f0b1c0f63f8004ae8d7943a', "label-text": "O2", value: this.form.o2, name: "o2", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: (ev) => this.blurHandler(ev), forceInvalid: this.gasWarning, validator: [
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
                ] })), this.gasWarning ? (h("ion-row", { class: "ion-no-padding" }, h("ion-col", null, h("div", { class: "notification" }, h("ion-icon", { name: "warning", "item-start": true }), "High pO2 (", this.gas.getpO2atDepth(this.gas.fromDepth), ")!")))) : undefined), h("ion-col", { key: '761d74c2de02c0f64b363c169326e7fa2f89a9ee' }, this.hasTrimixlicence ? ([
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
                this.ENDWarning ? (h("ion-row", { class: "ion-no-padding" }, h("ion-col", null, h("div", { class: "notification" }, h("ion-icon", { name: "warning", "item-start": true }), "High END (", this.gas.getEND(this.gas.fromDepth), DiveToolsService.depthUnit, ")!")))) : undefined,
            ]) : (h("app-form-item", { "label-text": "He", value: this.form.he, onClick: () => UserService.checkLicence("trimix", true) })))), h("ion-row", { key: '6efc47201494f2ce181923ba354b235bbafb8dad' }, h("ion-col", { key: 'dd3e169d76031ab3fde0ad92091f496d1931f654' }, h("app-form-item", { key: '3a10267fd10e9a30fb3a8111a3798226cec77d15', "label-tag": "from-depth", "label-text": "From Depth", value: this.form.fromDepth, name: "fromDepth", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: (ev) => this.blurHandler(ev), validator: ["required"] }))), this.ccr
                ? [
                    h("ion-row", null, h("ion-col", null, this.hasReblicence ? (h("app-form-item", { "label-tag": "pO2-setpoint", "label-text": "pO2 setPoint", value: this.form.ppO2, name: "ppO2", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: (ev) => this.blurHandler(ev), validator: [
                            {
                                name: "minmaxvalue",
                                options: { min: 0.5, max: 1.6 },
                            },
                        ] })) : (h("app-form-item", { "label-tag": "pO2-setpoint", "label-text": "pO2 setPoint", value: this.form.ppO2, onClick: () => UserService.checkLicence("reb", true) }))), h("ion-col", { size: "2", class: "ion-no-padding" }, h("ion-button", { shape: "round", fill: "clear", "icon-only": true, class: "ion-no-padding", onClick: () => this.showpO2Info() }, h("ion-icon", { name: "help-circle-outline" })))),
                    h("ion-row", { class: "ion-no-padding" }, h("ion-item", { style: { width: "100%" } }, h("ion-label", null, h("my-transl", { tag: "use-as-diluent", text: "Use as diluent gas" })), h("ion-toggle", { color: "gue-blue", slot: "end", onIonChange: (ev) => this.setUseAsDiluent(ev.detail.checked), checked: this.gas.getUseAsDiluent() }))),
                ]
                : undefined, h("ion-row", { key: 'c4d3fed371b17f535be67c4aac0d2c7ece0a20a7', class: "scrollx", id: "scrollGas" }, this.stdGases.map((gas) => (h("ion-col", { class: "item" }, h("ion-button", { shape: "round", color: gas.selected ? "secondary" : "primary", disabled: !gas.active, onClick: () => this.selectStdGas(gas.gas) }, GasBlenderService.getGasName(gas.gas)))))), h("ion-row", { key: 'ae13cc2224bc209f7884bf69156fd739eef28932' }, h("ion-col", { key: 'beae886bdc5b65935e08aa25f51145bc57730898' }, h("div", { key: 'f10f15bdc5ea403f11029a77db705529faceb256', class: "notification", style: { color: "blue" } }, "MOD: ", this.gas.getModF(this.gas.fO2, this.gas.ppO2), DiveToolsService.depthUnit, " @ ", this.gas.ppO2, " pO2"), h("div", { key: 'dc5dc1700b42aab431c64654e8dfcea492124c6e', class: "notification", style: { color: "blue" } }, "pO2: ", this.gas.getpO2atDepth(this.gas.fromDepth), " @", " ", this.gas.fromDepth, DiveToolsService.depthUnit))))),
            h("app-modal-footer", { key: '31b86ff66240d5dfb53546c755f0fb4e83e5dd1a', onCancelEmit: () => this.popover.dismiss(), onSaveEmit: () => this.popover.dismiss(this.form) }),
        ];
    }
    get el() { return getElement(this); }
};
PopoverGas.style = popoverGasCss;

export { PopoverGas as popover_gas };

//# sourceMappingURL=popover-gas.entry.js.map