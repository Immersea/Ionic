import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { a3 as DiveStandardsService, U as UserService, a4 as DiveToolsService } from './utils-cbf49763.js';
import { E as Environment } from './env-9be68260.js';
import { a as isPlatform } from './ionic-global-c07767bf.js';
import { p as popoverController } from './overlays-b3ceb97d.js';
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
import './_commonjsHelpers-1a56c7bc.js';
import './map-dae4acde.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';
import './framework-delegate-779ab78c.js';

const modalDiveConfigurationCss = "modal-dive-configuration .scrollx{display:flex;flex-wrap:nowrap;overflow-x:auto}modal-dive-configuration .scrollx .item{flex:0 0 0 0}modal-dive-configuration .scrollx ::-webkit-scrollbar{display:none}modal-dive-configuration input{text-align:right}modal-dive-configuration .fixedLabel{min-width:80% !important;max-width:80% !important}modal-dive-configuration ion-item .item-inner{box-shadow:none !important;border-bottom:1px solid #dedede !important}modal-dive-configuration .item-input .label-md,modal-dive-configuration .item-select .label-md,modal-dive-configuration .item-datetime .label-md{color:rgb(0, 0, 0)}";

const ModalDiveConfiguration = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.validForm = {
            name: false,
            depth: false,
            time: false,
            bottom: false,
        };
        this.diveDataToShare = undefined;
        this.updateView = true;
        this.showSave = false;
    }
    componentWillLoad() {
        this.screenWidth = window.screen.width;
        //set private configuration for users
        this.divePlan = this.diveDataToShare.divePlan;
        this.diveConfig = this.divePlan.configuration;
        this.orderTanks();
        this.ranges = this.divePlan.getParamRanges(this.diveConfig.parameters.units);
        let gases = DiveStandardsService.getStdGases();
        gases = lodash.exports.orderBy(gases, "fromDepth", "asc");
        this.bottomGases = lodash.exports.filter(gases, { deco: false });
        this.decoGases = lodash.exports.filter(gases, { deco: true });
        let tanks = UserService.userSettings.userTanks;
        tanks = lodash.exports.orderBy(tanks, "volume");
        const bottomTanks = lodash.exports.filter(tanks, { forDeco: false });
        const decoTanks = lodash.exports.filter(tanks, { forDeco: true });
        this.bottomTanks = [];
        bottomTanks.forEach((tank) => {
            this.bottomTanks.push(tank.getTank());
        });
        this.decoTanks = [];
        decoTanks.forEach((tank) => {
            this.decoTanks.push(tank.getTank());
        });
        this.stdConfigurations = DiveStandardsService.getStdConfigurations();
        this.userStdConfigurations = lodash.exports.cloneDeep(UserService.userSettings.userConfigurations);
    }
    componentDidLoad() {
        this.validateAll();
    }
    async addTank(event, bottom, tank) {
        let data = {
            tank: tank,
            tanksList: null,
            stdGasesList: null,
            ccr: this.diveConfig.parameters.configuration == "CCR",
            parameters: this.diveConfig.parameters,
            decoTanks: !bottom,
        };
        if (bottom) {
            data.tanksList = this.bottomTanks;
            data.stdGasesList = this.bottomGases;
        }
        else {
            data.tanksList = this.decoTanks;
            data.stdGasesList = this.decoGases;
        }
        var cssClass = undefined;
        //make custom popover for capacitor apps
        if (isPlatform("capacitor")) {
            cssClass = "custom-mobile-popover";
            event = null;
        }
        const popover = await popoverController.create({
            component: "popover-tank",
            event: event,
            translucent: true,
            backdropDismiss: false,
            cssClass: cssClass,
            componentProps: data,
        });
        popover.present();
        popover.onDidDismiss().then((updatedTank) => {
            updatedTank = updatedTank.data;
            if (updatedTank) {
                let config;
                if (bottom) {
                    config = this.diveConfig.configuration.bottom;
                }
                else {
                    config = this.diveConfig.configuration.deco;
                }
                if (!tank) {
                    config.push(updatedTank);
                }
                else {
                    let index = lodash.exports.indexOf(config, tank);
                    config.splice(index, 1, updatedTank);
                }
                this.orderTanks();
                this.validateForm("tanks");
            }
        });
    }
    deleteTank(bottom, index) {
        let config;
        if (bottom) {
            config = this.diveConfig.configuration.bottom;
        }
        else {
            config = this.diveConfig.configuration.deco;
        }
        config.splice(index, 1);
        this.orderTanks();
    }
    orderTanks() {
        this.diveConfig.configuration.bottom = lodash.exports.orderBy(this.diveConfig.configuration.bottom, "gas.fromDepth");
        this.diveConfig.configuration.deco = lodash.exports.orderBy(this.diveConfig.configuration.deco, "gas.fromDepth");
        this.updateView = !this.updateView;
    }
    updateParams(params) {
        this.divePlan.parameters = params;
    }
    save() {
        this.el.closest("ion-modal").dismiss(this.diveConfig);
    }
    close() {
        this.el.closest("ion-modal").dismiss();
    }
    inputHandler(event) {
        this.diveConfig[event.detail.name] = event.detail.value;
    }
    validateAll() {
        this.validForm.name = this.diveConfig.stdName.length >= 3;
        this.validForm.depth = this.diveConfig.maxDepth > 1;
        this.validForm.time = this.diveConfig.maxTime > 1;
        this.validateForm("tanks");
        this.updateView = !this.updateView;
    }
    validateForm(item, valid) {
        if (item == "name") {
            this.validForm.name = valid;
        }
        else if (item == "time") {
            this.validForm.time = valid;
        }
        else if (item == "depth") {
            this.validForm.depth = valid;
        }
        else {
            this.validForm.bottom = this.bottomTanks.length > 0;
        }
        this.showSave =
            this.validForm.name &&
                this.validForm.time &&
                this.validForm.depth &&
                this.validForm.bottom;
    }
    copyConfiguration(conf) {
        this.diveConfig = conf;
        this.validateAll();
    }
    render() {
        return [
            h("app-navbar", { key: '574ff78cf1fa9c9539cfc0e3e6ac7d2f9082303b', tag: "dive-configuration", text: "Dive Configuration", color: Environment.getAppColor(), modal: true }),
            h("ion-content", { key: '7f1276a7b4ee14ea3afb0d5ebe5738d646c7f6de' }, h("ion-list", { key: 'b234a959107ebaba2007eab98970edb8829a967c' }, h("ion-list-header", { key: 'a5dfd99492e022b4edd11bc973f641aaf6ced82c' }, "Copy from standard configuration"), h("ion-row", { key: '7ee1a72508f8a1f597fb2047e13dfc171c5078b6', class: "scrollx", id: "scrollTankGas" }, this.userStdConfigurations
                ? this.userStdConfigurations.map((conf) => (h("ion-col", { class: "item" }, h("ion-button", { shape: "round", color: Environment.getAppColor(), onClick: () => this.copyConfiguration(conf) }, conf.stdName))))
                : undefined, this.stdConfigurations
                ? this.stdConfigurations.map((conf) => (h("ion-col", { class: "item" }, h("ion-button", { shape: "round", color: "success", onClick: () => this.copyConfiguration(conf) }, "DP-", conf.stdName))))
                : undefined), h("app-form-item", { key: '747cf1415fce52ca331660dc9634863af3ea7f4c', "label-tag": "configuration-name", "label-text": "Configuration Name", value: this.diveConfig.stdName, name: "stdName", "input-type": "text", onFormItemChanged: (ev) => this.inputHandler(ev), validator: ["required"], onIsValid: (ev) => this.validateForm("name", ev.detail) }), h("app-form-item", { key: '5b198da8957841c0f1b336ad62f5237a7b4019bc', "label-tag": "max-depth", "label-text": "Max Depth (xxx)", labelReplace: { xxx: this.diveConfig.parameters.depthUnit }, value: lodash.exports.toString(this.diveConfig.maxDepth), name: "maxDepth", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), validator: [
                    "required",
                    {
                        name: "minvalue",
                        options: { min: 1 },
                    },
                ], onIsValid: (ev) => this.validateForm("depth", ev.detail) }), h("app-form-item", { key: '9778f5d76d3c445b72c9a6412cff988abc25457b', "label-tag": "max-time", "label-text": "Max Time (min)", value: lodash.exports.toString(this.diveConfig.maxTime), name: "maxTime", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), validator: [
                    "required",
                    {
                        name: "minvalue",
                        options: { min: 1 },
                    },
                ], onIsValid: (ev) => this.validateForm("time", ev.detail) }), h("ion-list-header", { key: 'a0ff84ae79e219dcfee19e628122bc02f1ece99c' }, h("my-transl", { key: '3206f76935e5fbed1c43e57b0cf6aae1891741ab', tag: "tanks-configuration", text: "Tank(s) Configuration", isLabel: true })), h("ion-list-header", { key: 'b64bf069158df3c3466998a7dc16e69ca511308d' }, h("ion-grid", { key: '1b9b2556df397ee39096dd222f518efb363d5836', class: "ion-no-padding" }, h("ion-row", { key: 'c117bce879cdbcbc0b1a165e2ff170fe0c5b4d4d' }, h("ion-col", { key: 'bd56ec29fcc0a324b7e2b4090662c1c5ee019b54' }, h("my-transl", { key: '125a4f610a5de64d047d2e5cf470c1ecd378621c', tag: "bottom", text: "Bottom", isLabel: true })), h("ion-col", { key: 'cc856510801040d6e9a383bd0d5ab89c74f07759', size: "1" }, h("ion-row", { key: '38f8db3fedd373bdb6fa60937d7bd1a334e92901', class: "ion-text-center" }, h("ion-button", { key: '2b0d7d5457d613d2a746daa70b679703b2f3e64b', "icon-only": true, fill: "clear", color: "primary", onClick: (ev) => this.addTank(this.screenWidth >= 500 ? ev : null, true) }, h("ion-icon", { key: '86d3bb43d76f8caca47577f0cda0192640c6f046', name: "add-circle" }))))))), this.diveConfig.configuration.bottom.length > 0 ? (h("ion-grid", null, h("ion-row", { class: "ion-text-center" }, this.diveConfig.configuration.bottom.map((tank, i) => (h("ion-col", { size: "12", "size-sm": true }, tank.name ? (h("ion-card", null, h("ion-card-header", { class: "ion-text-center" }, tank.name), h("ion-card-content", { class: "ion-text-center" }, h("p", null, tank.gas.toString()), h("p", null, tank.pressure, DiveToolsService.pressUnit, " / ", tank.getGasVolume(), DiveToolsService.volumeUnit)), h("ion-grid", { class: "ion-no-padding" }, h("ion-row", null, h("ion-col", null, h("ion-button", { "icon-left": true, fill: "clear", size: "small", onClick: (ev) => this.addTank(this.screenWidth >= 500 ? ev : null, true, tank) }, h("ion-icon", { name: "create" }), h("my-transl", { tag: "edit", text: "Edit" }))), h("ion-col", null, h("ion-button", { "icon-left": true, fill: "clear", size: "small", onClick: () => this.deleteTank(true, i) }, h("ion-icon", { name: "trash" }), h("my-transl", { tag: "delete", text: "Delete" }))))))) : undefined)))))) : undefined, h("ion-list-header", { key: 'd994ba881d0200a96463bfa38d8534ff4b7b1f43' }, h("ion-grid", { key: '0f15793c95a0ccb6d1c525263fd9f2f4c54e8721', class: "ion-no-padding" }, h("ion-row", { key: '669b17f1015f59cbbf049c2ab2bd8d9ec11be1cc' }, h("ion-col", { key: '999395f8e4dd0e0192586449c3aef7c24909fa98' }, h("my-transl", { key: 'bfdcacd99844f7cb70d8dda90f95ac095c2b2f7d', tag: "deco", text: "Deco", isLabel: true })), h("ion-col", { key: '1be104ca7c208afa9ca5a6b7113dca067f114cd4', size: "1" }, h("ion-row", { key: 'f23c53fcce6802ced85c390027e62b46dbc94558', class: "ion-text-center" }, h("ion-button", { key: '644dbeb201ed1bb3d7aa56b0ef59dfa48e0f6e75', "icon-only": true, fill: "clear", color: "primary", onClick: (ev) => this.addTank(this.screenWidth >= 500 ? ev : null, false) }, h("ion-icon", { key: '6051227fd05a1ad2955a3549367c0f755d4d25ce', name: "add-circle" }))))))), this.diveConfig.configuration.deco.length > 0 ? (h("ion-grid", { class: "ion-no-padding" }, h("ion-row", { class: "ion-text-center" }, this.diveConfig.configuration.deco.map((tank, i) => (h("ion-col", { size: "12", "size-sm": true }, tank.name ? (h("ion-card", null, h("ion-card-header", { class: "ion-text-center" }, tank.name), h("ion-card-content", { class: "ion-text-center" }, h("p", null, tank.gas.toString()), h("p", null, tank.pressure, DiveToolsService.pressUnit, " / ", tank.getGasVolume(), DiveToolsService.volumeUnit)), h("ion-grid", { class: "ion-no-padding" }, h("ion-row", null, h("ion-col", null, h("ion-button", { "icon-left": true, fill: "clear", size: "small", onClick: (ev) => this.addTank(this.screenWidth >= 500 ? ev : null, false, tank) }, h("ion-icon", { name: "create" }), h("my-transl", { tag: "edit", text: "Edit" }))), h("ion-col", null, h("ion-button", { "icon-left": true, fill: "clear", size: "small", onClick: () => this.deleteTank(false, i) }, h("ion-icon", { name: "trash" }), h("my-transl", { tag: "delete", text: "Delete" }))))))) : undefined)))))) : undefined, h("app-decoplanner-settings", { key: 'fa0313ddae9d6c2b08e21d9c105bae9688d086e1', diveDataToShare: this.diveDataToShare, onUpdateParamsEvent: (params) => this.updateParams(params) }))),
            h("app-modal-footer", { key: '3c435827ab2725f26fab42a75a1370081bb54226', disableSave: !this.showSave, onCancelEmit: () => this.close(), onSaveEmit: () => this.save() }),
        ];
    }
    get el() { return getElement(this); }
};
ModalDiveConfiguration.style = modalDiveConfigurationCss;

export { ModalDiveConfiguration as modal_dive_configuration };

//# sourceMappingURL=modal-dive-configuration.entry.js.map