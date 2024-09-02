import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { a4 as DiveToolsService, aG as Gas, U as UserService, aH as GasBlenderService } from './utils-5cd4c7bb.js';
import { G as GasSupply, C as Cylinder } from './gas-supply-842ac725.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { p as popoverController } from './overlays-b3ceb97d.js';
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

const popoverGasBlenderCss = "popover-gas-blender{}popover-gas-blender .scrollx{display:flex;flex-wrap:nowrap;overflow-x:auto}popover-gas-blender .scrollx .item{flex:0 0 0 0}popover-gas-blender .scrollx ::-webkit-scrollbar{display:none}";

const PopoverGasBlender = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.maxPressure = DiveToolsService.isMetric() ? 300 : 4300;
        this.maxTemperature = DiveToolsService.isMetric() ? 60 : 140;
        this.gasProp = undefined;
        this.stdGasesList = undefined;
        this.showBar = true;
        this.hasTrimixlicence = true;
        this.gas = new GasSupply(new Cylinder(10, DiveToolsService.isMetric() ? 200 : 3000), new Gas(0.21, 0), DiveToolsService.isMetric() ? 200 : 3000, false, DiveToolsService.isMetric() ? 20 : 68);
        this.form = undefined;
    }
    async componentWillLoad() {
        this.hasTrimixlicence = await UserService.checkLicence("trimix");
        if (this.gasProp && this.gasProp.getFO2()) {
            this.gas = this.gasProp;
        }
        this.setForm();
        this.updateStdGasList();
    }
    componentDidLoad() {
        this.scrollGas = this.el.querySelector("#scrollGas");
        this.updateStdGasList();
    }
    disconnectedCallback() {
        //check valid gases
        this.setForm();
    }
    save() {
        popoverController.dismiss(this.gas);
    }
    async setForm() {
        this.form = this.gas.getForm();
        this.hasTrimixlicence = await UserService.checkLicence("trimix");
    }
    updateStdGasList() {
        //create gas list
        this.stdGases = [];
        var isStandardGas = false;
        var i = 0;
        var n = 0;
        this.stdGasesList.forEach((gas) => {
            i++;
            let selected = this.gas.mMix.O2 === gas.O2 && this.gas.mMix.He === gas.He
                ? true
                : false;
            if (selected) {
                isStandardGas = true;
                n = i;
            }
            this.stdGases.push({
                selected: selected,
                gas: gas.getGas(),
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
    }
    selectStdGas(gas) {
        if (!this.hasTrimixlicence && gas.He > 0) {
            UserService.checkLicence("trimix", true);
            return;
        }
        this.gas.setMix(new Gas(lodash.exports.round(gas.fO2, 3), lodash.exports.round(gas.fHe, 3), gas.fromDepth, gas.ppO2, gas.units));
        this.setForm();
        this.updateStdGasList();
    }
    inputHandler(event) {
        this.form[event.detail.name] = event.detail.value;
    }
    blurHandler(event) {
        this.updateGas(event.detail.name);
        if (event.detail.name == "bar") {
            this.gas.setPressure(lodash.exports.toNumber(this.form.bar) > this.maxPressure
                ? this.maxPressure
                : lodash.exports.toNumber(this.form.bar));
        }
        else if (event.detail.name == "temp") {
            this.gas.setTemperature(lodash.exports.toNumber(this.form.temp) > this.maxTemperature
                ? this.maxTemperature
                : lodash.exports.toNumber(this.form.temp));
        }
        this.setForm();
    }
    updateGas(input) {
        if (input == "o2") {
            this.gas.mMix.setFO2(lodash.exports.round(lodash.exports.toNumber(this.form.o2), 2) / 100);
        }
        else if (input == "he") {
            this.gas.mMix.setFHe(lodash.exports.round(lodash.exports.toNumber(this.form.he), 2) / 100);
        }
        else if (input == "bar") {
            this.gas.setPressure(lodash.exports.toNumber(this.form.bar));
        }
        else if (input == "temp") {
            this.gas.setTemperature(lodash.exports.toNumber(this.form.temp));
        }
        this.updateStdGasList();
    }
    render() {
        return (h(Host, { key: '2290e2b7d7afd851a0dcb654254afca544aefa9b' }, h("ion-list", { key: '27b084d34593bf40e15b1c44eee1304b602633f7' }, h("ion-grid", { key: 'a65286e7beccf5b15e6534923306f462234d783a', class: "ion-no-padding" }, h("ion-row", { key: '50101084a31ae1160da07d4256e898c93243be79' }, h("ion-col", { key: 'ad714f89c096e370cd1b2415a9e1b679a2b3f2a0', size: "6" }, h("app-form-item", { key: 'c5cac7fb82dc3ca5dceb4d27255242c8040d05b3', "label-tag": "o2", "label-text": "O2", value: this.form.o2, name: "o2", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: (ev) => this.blurHandler(ev), validator: [
                "required",
                {
                    name: "minmaxvalue",
                    options: { min: 0, max: 100 - this.form.he },
                },
            ] })), h("ion-col", { key: '832f748d951cad8d6d8fa0abeb34089938424984', size: "6" }, this.hasTrimixlicence ? (h("app-form-item", { "label-text": "He", value: this.form.he, name: "he", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: (ev) => this.blurHandler(ev), validator: [
                "required",
                {
                    name: "minmaxvalue",
                    options: { min: 0, max: 100 - this.form.o2 },
                },
            ] })) : (h("app-form-item", { "label-text": "He", value: this.form.he, onClick: () => UserService.checkLicence("trimix", true) })))), h("ion-row", { key: '7b2f49617afd14479ce5bcfce00cfa9a970aef60' }, h("ion-col", { key: '37702cc62faea61db3d7b02cc3e185e26d9c2343', size: "6" }, h("app-form-item", { key: '4822818c58473bc08bde0625f0a32c7b4089d318', "label-tag": "pressure", "label-text": "Pressure", appendText: " (" + DiveToolsService.pressUnit + ")", value: this.form.bar, name: "bar", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: (ev) => this.blurHandler(ev), validator: [
                "required",
                {
                    name: "minmaxvalue",
                    options: { min: 1, max: this.maxPressure },
                },
            ] })), h("ion-col", { key: '388807328831ca7b3afa1d31198ee62f66737bfc', size: "6" }, h("app-form-item", { key: 'ef53f328c724da111d53a86dc6baf4f6627cb69d', "label-tag": "temperature", "label-text": "Temperature", appendText: " (" + (DiveToolsService.isMetric() ? "°C" : "°F") + ")", value: this.form.temp, name: "temp", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), onFormItemBlur: (ev) => this.blurHandler(ev), validator: [
                "required",
                {
                    name: "minmaxvalue",
                    options: { min: 0, max: this.maxTemperature },
                },
            ] }))), h("ion-row", { key: '68156855bb7551504e73a6707460b739508ab728', class: "scrollx", id: "scrollGas" }, this.stdGases.map((gas) => (h("ion-col", { class: "item" }, h("ion-button", { shape: "round", color: gas.selected ? "secondary" : "primary", onClick: () => this.selectStdGas(gas.gas) }, GasBlenderService.getGasName(gas.gas)))))), h("ion-row", { key: '3cd1c19096c9bee1ef409a947ee8f2fd7c1483d3' }, h("ion-col", { key: 'df527d6c67db79dac2fd4d330628645d47caa6b6', class: "item" }, h("ion-button", { key: '6d148a7d9d2f632ed25569cfac30b5f528a7c159', expand: "block", fill: "outline", size: "small", color: "success", onClick: () => this.save() }, h("my-transl", { key: '08a52f01dffa4195469d6a540a4a8f2466988bfd', tag: "save", text: "Save" }))))))));
    }
    get el() { return getElement(this); }
};
PopoverGasBlender.style = popoverGasBlenderCss;

export { PopoverGasBlender as popover_gas_blender };

//# sourceMappingURL=popover-gas-blender.entry.js.map