import { r as registerInstance, l as createEvent, h, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { a5 as DecoplannerDive, T as TranslationService, d as DiveSitesService, i as DivingCentersService, U as UserService, R as RouterService, B as SystemService, aG as Gas } from './utils-ced1e260.js';
import { E as Environment } from './env-c3ad5e77.js';
import { d as dateFns } from './index-9b61a50b.js';
import { p as popoverController } from './overlays-b3ceb97d.js';
import { a as isPlatform } from './ionic-global-c07767bf.js';
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
import './map-fe092362.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
import './framework-delegate-779ab78c.js';

const appDecoplannerPlanCss = "app-decoplanner-plan{width:100%}";

const AppDecoplannerPlan = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.updateParamsEvent = createEvent(this, "updateParamsEvent", 7);
        this.stdConfigurations = [];
        this.allowSelectConfiguration = false;
        this.showArpc = false;
        this.sitesList = [];
        this.divingCentersList = [];
        this.diveDataToShare = undefined;
        this.planner = false;
        this.segment = "levels";
        this.dive = new DecoplannerDive();
        this.updateView = true;
        this.diveSite = undefined;
    }
    async componentWillLoad() {
        this.diveParamsUpdate();
        this.segmentTitles = {
            location: TranslationService.getTransl("location", "Location"),
            date: TranslationService.getTransl("date", "Date"),
            surface: TranslationService.getTransl("surface-time", "Surface Time"),
            levels: TranslationService.getTransl("levels", "Levels"),
            deco: TranslationService.getTransl("deco-gases", "Deco Gases"),
        };
        this.confSelectOptions = {
            title: TranslationService.getTransl("dive-configurations", "Dive Configurations"),
            subTitle: TranslationService.getTransl("dive-configuration-select", "Select your dive configuration"),
            mode: "md",
        };
        this.sitesList = DiveSitesService.diveSitesList;
        this.divingCentersList = DivingCentersService.divingCentersList;
    }
    diveParamsUpdate() {
        const params = this.diveDataToShare;
        this.divePlan = params.divePlan;
        this.index = params.index;
        //this.licence = params.licence;
        this.stdGases = params.stdGases;
        this.stdDecoGases = params.stdDecoGases;
        this.stdConfigurations = params.stdConfigurations;
        this.user = params.user;
        this.findConfig();
    }
    findDiveSite() {
        if (this.dive.diveSiteId) {
            this.diveSite = this.sitesList.find((site) => site.id === this.dive.diveSiteId);
            this.setSelectDivingCenters();
        }
    }
    async openSearchSite() {
        const popover = await popoverController.create({
            component: "popover-search-dive-site",
            translucent: true,
        });
        popover.onDidDismiss().then((ev) => {
            const siteId = ev.data;
            this.dive.diveSiteId = siteId;
            this.findDiveSite();
        });
        popover.present();
    }
    setSelectDivingCenters() {
        const selectDCElement = this.el.querySelector("#selectDivingCenter");
        const customDCPopoverOptions = {
            header: TranslationService.getTransl("diving-center", "Diving Center"),
        };
        selectDCElement.interfaceOptions = customDCPopoverOptions;
        //remove previously defined options
        const selectDCOptions = Array.from(selectDCElement.getElementsByTagName("ion-select-option"));
        selectDCOptions.map((option) => {
            selectDCElement.removeChild(option);
        });
        if (this.diveSite.divingCenters && this.diveSite.divingCenters.length > 0) {
            selectDCElement.placeholder = TranslationService.getTransl("select", "Select");
            this.diveSite.divingCenters.map((dcId) => {
                const selectOption = document.createElement("ion-select-option");
                const dc = this.divingCentersList.find((dc) => dc.id === dcId);
                selectOption.value = dcId;
                selectOption.textContent = dc.displayName;
                selectDCElement.appendChild(selectOption);
            });
            selectDCElement.disabled = false;
        }
        else {
            selectDCElement.placeholder = TranslationService.getTransl("no-divecenters", "No Diving Centers available for this site");
            this.dive.divingCenterId = "";
            selectDCElement.disabled = true;
        }
        this.updateView = !this.updateView;
    }
    findConfig() {
        //find in std configs
        let findConf = lodash.exports.find(this.stdConfigurations, this.divePlan.configuration);
        if (!findConf) {
            //user changed the configuration - search by name
            findConf = lodash.exports.find(this.stdConfigurations, {
                stdName: this.divePlan.configuration.stdName,
            });
            //add modified configuration in the list
            let updatedConf = lodash.exports.cloneDeep(this.divePlan.configuration);
            updatedConf.stdName = updatedConf.stdName;
            //check if already added in a previous call
            findConf = lodash.exports.find(this.stdConfigurations, { stdName: updatedConf.stdName });
            if (!findConf) {
                this.stdConfigurations.push(updatedConf);
                findConf = updatedConf;
            }
        }
        this.diveConfiguration = findConf;
        this.showArpc =
            this.diveConfiguration.parameters.configuration == "CCR" &&
                ((this.dive.diveSiteId && this.diveDataToShare.showDiveSite) ||
                    this.diveDataToShare.showPositionTab); //show only in log book
        this.parameters = this.divePlan.configuration.parameters;
        if (this.stdDecoGases) {
            this.stdDecoGases.forEach((gas) => {
                //update setpoint according to parameters
                if (gas.O2 == 100) {
                    gas.ppO2 = this.parameters.oxygenppO2;
                }
                else {
                    gas.ppO2 = this.parameters.decoppO2;
                }
            });
        }
        this.dive = this.divePlan.dives[this.index];
        this.updateView = !this.updateView;
    }
    updateParams() {
        this.findConfig();
        this.updateView = !this.updateView;
        this.updateParamsEvent.emit(this.parameters);
    }
    updateDiveConfiguration(conf) {
        let updatedConf = lodash.exports.cloneDeep(conf);
        this.divePlan.setConfiguration(updatedConf);
        this.parameters = this.divePlan.configuration.parameters;
        //reset deco tanks
        this.divePlan.resetDecoTanksWithConfiguration(this.dive, updatedConf);
        this.saveDoc();
    }
    async editDiveConfig() {
        let openModal = await UserService.checkLicence("configs", true);
        if (openModal) {
            const confModal = await RouterService.openModal("modal-dive-configuration", {
                diveDataToShare: this.diveDataToShare,
            });
            confModal.onDidDismiss().then((updatedConf) => {
                updatedConf = updatedConf.data;
                if (updatedConf) {
                    this.updateDiveConfiguration(updatedConf);
                }
            });
        }
    }
    saveDoc() {
        this.updateParams();
        setTimeout(() => {
            SystemService.dismissLoading();
        }, 50);
    }
    async showLoading() {
        await SystemService.presentLoading("updating");
    }
    async reorderItems(reorder) {
        await this.showLoading();
        let element = this.dive.profilePoints[reorder.detail.from];
        this.dive.profilePoints.splice(reorder.detail.from, 1);
        this.dive.profilePoints.splice(reorder.detail.to, 0, element);
        let index = 0;
        this.dive.profilePoints.map((point) => {
            point.index = index++;
            return point;
        });
        reorder.detail.complete(this.dive.profilePoints);
        this.divePlan.updateCalculations();
        this.dive.profilePoints = lodash.exports.orderBy(this.dive.profilePoints, "index");
        this.saveDoc();
    }
    async presentPopover(event, type, index) {
        let page;
        let update = index >= 0 ? true : false;
        let level, gas;
        if (type == "level") {
            page = "popover-level";
            if (update) {
                level = this.dive.profilePoints[index];
                level.index = index;
            }
            if (!update && this.dive.profilePoints.length > 0) {
                //insert standard value
                //get last value of profile points
                level = lodash.exports.last(this.dive.profilePoints);
                level = lodash.exports.cloneDeep(level);
                level.setValue("depth", level.depth - 10);
                level.setValue("time", 10);
                level.setValue("updateGas", false);
            }
            else if (index > 0) {
                level.setValue("updateGas", false);
            }
            else {
                level.setValue("updateGas", true);
            }
        }
        else if (type == "gas") {
            //check deco gases limitation
            if (this.dive.decoGases.length >=
                UserService.userRoles.licences.getUserLimitations().maxDecoGases) {
                UserService.userRoles.licences.presentLicenceLimitation("decogases");
                return;
            }
            page = "popover-gas";
            if (!update) {
                //insert next standard gas
                let decoGasDepths = [];
                for (let i in this.dive.decoGases) {
                    decoGasDepths.push(this.dive.decoGases[i].fromDepth);
                }
                let minDecoGasDepth = lodash.exports.min(decoGasDepths);
                let decoGas = lodash.exports.find(this.stdDecoGases, (gas) => {
                    return gas.fromDepth < minDecoGasDepth;
                });
                if (decoGas) {
                    gas = new Gas(decoGas.O2 / 100, decoGas.He / 100, decoGas.fromDepth, decoGas.ppO2, decoGas.units);
                    gas.setUseAsDiluent(decoGas.useAsDiluent);
                }
            }
            else {
                gas = this.dive.decoGases[index];
            }
        }
        const data = {
            gasProp: gas,
            levelProp: level,
            stdGasesList: this.stdGases,
            stdDecoGases: this.stdDecoGases,
            trimixlicence: UserService.checkLicence("trimix"),
            ccr: this.parameters.configuration == "CCR",
            parameters: this.parameters,
        };
        var cssClass = undefined;
        //make custom popover for capacitor apps
        if (isPlatform("capacitor")) {
            cssClass = "custom-mobile-popover";
            event = null;
        }
        const popover = await popoverController.create({
            component: page,
            event: event,
            translucent: true,
            backdropDismiss: true,
            cssClass: cssClass,
            componentProps: data,
        });
        popover.present();
        popover.onDidDismiss().then(async (updatedData) => {
            updatedData = updatedData.data;
            if (updatedData) {
                await this.showLoading();
                if (type == "level") {
                    if (update) {
                        //update level
                        this.divePlan.updateDiveProfilePoint(this.dive, updatedData.index, updatedData.depth, updatedData.time, updatedData.o2 / 100, updatedData.he / 100, updatedData.setpoint);
                    }
                    else {
                        //add new
                        this.divePlan.addDiveProfilePoint(this.dive, updatedData.depth, updatedData.time, updatedData.o2 / 100, updatedData.he / 100, updatedData.setpoint);
                    }
                }
                else if (type == "gas") {
                    if (update) {
                        //update gas
                        this.divePlan.updateDiveDecoGas(this.dive, index, updatedData.o2 / 100, updatedData.he / 100, updatedData.fromDepth, updatedData.ppO2, updatedData.useAsDiluent);
                    }
                    else {
                        //add new
                        this.divePlan.addDiveDecoGas(this.dive, updatedData.o2 / 100, updatedData.he / 100, updatedData.fromDepth, updatedData.ppO2, updatedData.useAsDiluent);
                    }
                }
                this.saveDoc();
            }
        });
    }
    async addStdDecoGases() {
        await this.showLoading();
        let decoGases = lodash.exports.filter(this.stdDecoGases, (gas) => {
            return gas.fromDepth <= this.dive.getDecoStartDepth(); //return all gases below 74% of max depth
        });
        this.dive.decoGases = [];
        decoGases.forEach((gas) => {
            this.divePlan.addDiveDecoGas(this.dive, gas.O2 / 100, gas.He / 100, gas.fromDepth, gas.ppO2, gas.useAsDiluent);
        });
        this.saveDoc();
    }
    async removeProfilePoint(dive, index) {
        await this.showLoading();
        this.divePlan.removeDiveProfilePoint(dive, index);
        this.saveDoc();
    }
    async removeDecoGas(dive, index) {
        await this.showLoading();
        this.divePlan.removeDiveDecoGas(dive, index);
        this.saveDoc();
    }
    segmentChanged(ev) {
        const segment = ev.detail.value;
        this.segment = segment;
        if (segment == "location" && Environment.isUdive()) {
            setTimeout(() => {
                this.findDiveSite();
            }, 100);
        }
    }
    updateDate(ev) {
        this.dive.date = new Date(ev.detail.value);
    }
    updateParam(param, value) {
        this[param] = value;
        this.updateParams();
    }
    updateSurfaceInterval(value) {
        this.dive.surfaceInterval = value;
        this.divePlan.updateDates();
        this.updateParams();
    }
    updateDiveSite(ev) {
        this.dive.diveSiteId = ev.detail.value;
    }
    updateDivingCenter(ev) {
        this.dive.divingCenterId = ev.detail.value;
    }
    saveArpc(ev) {
        this.dive.arpc = ev.detail;
        this.updateView = !this.updateView;
    }
    render() {
        return [
            h("ion-content", { key: 'e48be58f7cad2e506804e0cb0c415c2c0fdaceba', class: "slide-container" }, h("div", { key: '15a7640a2e32590e4c3a0a76a7f389a596e3b1b5', class: "ion-no-padding" }, h("ion-row", { key: '72cb07f24a08e184a0a323db3b1b95ca32ea8979' }, h("ion-col", { key: '46c79d43ec6c5af73411fd1ea5da9ba3634bd34a' }, h("ion-segment", { key: 'fbc220bcc03052d4dff839b4c72f69daf0fbc20c', mode: "ios", color: Environment.getAppColor(), onIonChange: (ev) => this.segmentChanged(ev), value: this.segment }, (this.dive.diveSiteId && this.diveDataToShare.showDiveSite) ||
                this.diveDataToShare.showPositionTab ? (h("ion-segment-button", { value: "location" }, h("ion-label", null, this.index == 0
                ? Environment.isDecoplanner()
                    ? this.segmentTitles.date
                    : this.segmentTitles.location
                : this.segmentTitles.surface))) : undefined, h("ion-segment-button", { key: 'ea7950d18c510061f88cac92b2d951e42c959970', value: "levels" }, h("ion-label", { key: '61237a764d2eedbe5daf05a7ba374dce67b965f3' }, this.segmentTitles.levels)), h("ion-segment-button", { key: '72f68b78f6a2b1632c10e60cfd3dd84c95d4c5b5', value: "gases", layout: "icon-start" }, h("ion-label", { key: 'dd7d052108d4cce44957139a29a4572cd0fe97b9' }, this.segmentTitles.deco), this.dive.decoGases.length > 0 ? (h("ion-badge", { color: Environment.isDecoplanner() ? "gue-blue" : "planner" }, this.dive.decoGases.length)) : undefined), this.showArpc ? (h("ion-segment-button", { value: "arpc", layout: "icon-start" }, h("ion-label", null, "ARPC"), h("ion-badge", { color: this.dive.arpc && this.dive.arpc.approved
                    ? "success"
                    : "danger" }, h("ion-icon", { style: { fontSize: "10px" }, name: this.dive.arpc && this.dive.arpc.approved
                    ? "checkmark"
                    : "close" })))) : undefined))), this.segment == "location"
                ? [
                    h("ion-row", null, h("ion-col", null, this.index == 0 ? (h("app-form-item", { "label-tag": "dive-date", "label-text": "Dive Date", value: this.dive.date ? this.dive.date.toISOString() : null, name: "tripDate", "input-type": "date", datePresentation: "date-time", lines: "inset", onFormItemChanged: (ev) => this.updateDate(ev) })) : ([
                        h("ion-item", null, h("my-transl", { tag: "dive-date", text: "Dive Date" }), h("ion-note", { slot: "end" }, dateFns.format(this.dive.date, "dd MMM, yyyy HH:mm"))),
                        h("ion-item", null, h("ion-icon", { name: "time", slot: "start" }), h("ion-select", { label: TranslationService.getTransl("surface-interval", "Surface Interval"), onIonChange: (ev) => this.updateSurfaceInterval(ev.detail.value), value: this.dive.surfaceInterval }, h("ion-select-option", { value: 0.5 }, "0:30"), h("ion-select-option", { value: 1 }, "1:00"), h("ion-select-option", { value: 1.5 }, "1:30"), h("ion-select-option", { value: 2 }, "2:00"), h("ion-select-option", { value: 2.5 }, "2:30"), h("ion-select-option", { value: 3 }, "3:00"), h("ion-select-option", { value: 3.5 }, "3:30"), h("ion-select-option", { value: 4 }, "4:00"), h("ion-select-option", { value: 4.5 }, "4:30"), h("ion-select-option", { value: 5 }, "5:00"), h("ion-select-option", { value: 5.5 }, "5:30"), h("ion-select-option", { value: 6 }, "6:00"), h("ion-select-option", { value: 6.5 }, "6:30"), h("ion-select-option", { value: 7 }, "7:00"), h("ion-select-option", { value: 7.5 }, "7:30"), h("ion-select-option", { value: 8 }, "8:00"), h("ion-select-option", { value: 8.5 }, "8:30"), h("ion-select-option", { value: 9 }, "9:00"), h("ion-select-option", { value: 9.5 }, "9:30"), h("ion-select-option", { value: 10 }, "10:00"), h("ion-select-option", { value: 10.5 }, "10:30"), h("ion-select-option", { value: 11 }, "11:00"), h("ion-select-option", { value: 11.5 }, "11:30"), h("ion-select-option", { value: 12 }, "12:00"))),
                    ]))),
                    Environment.isDecoplanner()
                        ? undefined
                        : [
                            h("ion-row", null, h("ion-col", null, h("ion-item", { button: true, onClick: () => this.openSearchSite() }, h("ion-input", { label: TranslationService.getTransl("dive-site", "Dive Site"), labelPlacement: "floating", placeholder: TranslationService.getTransl("select-dive-site", "Select Dive Site"), value: this.diveSite
                                    ? this.diveSite.displayName
                                    : undefined }), h("ion-icon", { slot: "end", name: "search-outline" })))),
                            h("ion-row", null, h("ion-col", null, h("ion-item", null, h("ion-select", { label: TranslationService.getTransl("diving-center", "Diving Center"), labelPlacement: "floating", id: "selectDivingCenter", onIonChange: (ev) => this.updateDivingCenter(ev), disabled: true, value: this.dive.divingCenterId })))),
                        ],
                ]
                : undefined, this.segment == "levels" ? (h("ion-row", null, h("ion-col", null, h("ion-list", { class: "ion-text-wrap" }, h("ion-item", null, h("div", { slot: "end", style: { width: "1.9em" } }, h("ion-button", { "icon-only": true, color: Environment.isDecoplanner() ? "gue-blue" : "planner", fill: "clear", style: { "--padding-start": "0.4em" }, onClick: () => this.editDiveConfig() }, h("ion-icon", { name: "create-outline" }))), h("ion-grid", { class: "ion-text-center ion-no-padding" }, h("ion-row", { class: "ion-justify-content-center  ion-no-padding", onClick: () => this.editDiveConfig() }, h("ion-col", { size: "6" }, h("ion-item", { lines: "none" }, h("my-transl", { tag: "configuration", text: "Configuration" }))), h("ion-col", null, h("ion-item", { lines: "none" }, this.allowSelectConfiguration ? (h("ion-select", { interfaceOptions: this.confSelectOptions, onIonChange: (ev) => this.updateDiveConfiguration(ev.detail.value), class: "select-class", value: this.diveConfiguration.stdName }, this.stdConfigurations.map((conf) => (h("ion-select-option", { value: conf }, conf.stdName))))) : (h("ion-label", { class: "ion-text-end" }, this.diveConfiguration.stdName))))))), h("ion-item", null, h("div", { slot: "end", style: { width: "1.9em" } }, h("ion-button", { "icon-only": true, fill: "clear", color: Environment.isDecoplanner() ? "gue-blue" : "planner", style: {
                    marginTop: "10px",
                    "--padding-start": "0.4em",
                }, onClick: (ev) => this.presentPopover(ev, "level") }, h("ion-icon", { name: "add-circle" }))), h("ion-grid", { class: "ion-text-center" }, h("ion-row", { "small-capitals": true, class: "ion-align-items-center ion-no-padding" }, h("ion-col", null, h("ion-text", { color: "dark" }, h("h6", null, h("my-transl", { tag: "depth", text: "Depth" })))), h("ion-col", null, h("ion-text", { color: "dark" }, h("h6", null, h("my-transl", { tag: "time", text: "Time" })))), h("ion-col", null, h("ion-text", { color: "dark" }, h("h6", null, "O", h("sub", null, "2")))), h("ion-col", null, h("ion-text", { color: "dark" }, h("h6", null, "He"))), this.parameters.configuration == "CCR" ? (h("ion-col", null, h("ion-text", { color: "dark" }, h("h6", null, h("my-transl", { tag: "po2", text: "pO2" }))))) : undefined, h("ion-col", null)))), h("ion-reorder-group", { disabled: false, onIonItemReorder: (ev) => this.reorderItems(ev) }, this.dive.profilePoints.map((level) => (h("ion-item", null, h("ion-reorder", { slot: "end" }), h("ion-grid", { class: "ion-text-center" }, h("ion-row", { class: "ion-align-items-center ion-no-padding" }, h("ion-col", { onClick: (ev) => this.presentPopover(ev, "level", level.index) }, level.depth), h("ion-col", { onClick: (ev) => this.presentPopover(ev, "level", level.index) }, level.time), h("ion-col", { onClick: (ev) => this.presentPopover(ev, "level", level.index) }, level.gas.O2), h("ion-col", { onClick: (ev) => this.presentPopover(ev, "level", level.index) }, level.gas.He), this.parameters.configuration == "CCR" ? (h("ion-col", { onClick: (ev) => this.presentPopover(ev, "level", level.index) }, level.setpoint)) : undefined, h("ion-col", null, h("ion-button", { "icon-only": true, fill: "clear", size: "small", color: "danger", disabled: level.index == 0 &&
                    this.dive.profilePoints.length <= 1, onClick: () => this.removeProfilePoint(this.dive, level.index) }, h("ion-icon", { name: "trash" }))))))))))))) : undefined, this.segment == "gases" ? (h("ion-row", null, h("ion-col", null, h("ion-list", { class: "ion-text-wrap" }, h("ion-item", null, h("ion-grid", { class: "ion-text-center ion-no-padding" }, h("ion-row", { "small-capitals": true, class: "ion-no-padding" }, h("ion-col", null, h("ion-text", { color: "dark" }, h("h6", null, h("my-transl", { tag: "from-depth", text: "from Depth" })))), h("ion-col", null, h("ion-text", { color: "dark" }, h("h6", null, "O", h("sub", null, "2")))), h("ion-col", null, h("ion-text", { color: "dark" }, h("h6", null, "He"))), this.parameters.configuration == "CCR" ? (h("ion-col", null, h("ion-text", { color: "dark" }, h("h6", null, h("my-transl", { tag: "po2", text: "pO2" }))))) : undefined, h("ion-col", { class: "ion-no-padding" }, h("ion-row", { class: "ion-no-padding" }, h("ion-col", { class: "ion-no-padding", size: UserService.userRoles &&
                    UserService.userRoles.licences.unlimited
                    ? "6"
                    : "12" }, h("ion-button", { "icon-only": true, fill: "clear", color: "primary", onClick: (ev) => this.presentPopover(ev, "gas"), style: { marginTop: "10px" } }, h("ion-icon", { name: "add-circle" }))), UserService.userRoles &&
                UserService.userRoles.licences.unlimited ? (h("ion-col", { size: "6", class: "ion-no-padding" }, h("ion-button", { "icon-only": true, fill: "clear", color: "secondary", onClick: () => this.addStdDecoGases(), style: { marginTop: "10px" } }, h("ion-icon", { name: "color-wand" })))) : undefined))))), this.dive.decoGases.map((gas, i) => (h("ion-item", { class: "ion-text-center" }, h("ion-grid", { class: "ion-text-center" }, h("ion-row", { class: "ion-no-padding" }, h("ion-col", { style: { marginTop: "5px" }, onClick: (ev) => this.presentPopover(ev, "gas", i) }, gas.fromDepth), h("ion-col", { style: { marginTop: "5px" }, onClick: (ev) => this.presentPopover(ev, "gas", i) }, gas.O2), h("ion-col", { style: { marginTop: "5px" }, onClick: (ev) => this.presentPopover(ev, "gas", i) }, gas.He), this.parameters.configuration == "CCR" ? (h("ion-col", { style: { marginTop: "5px" }, onClick: (ev) => this.presentPopover(ev, "gas", i) }, gas.ppO2, " ", gas.useAsDiluent ? (h("ion-note", null, "(diluent gas)")) : undefined)) : undefined, h("ion-col", null, h("ion-button", { "icon-only": true, fill: "clear", size: "small", color: "danger", onClick: () => this.removeDecoGas(this.dive, i) }, h("ion-icon", { name: "trash" })))))))))))) : undefined, this.segment == "arpc" ? (h("app-decoplanner-arpc", { diveDataToShare: this.diveDataToShare, planner: this.planner, onSaveArpc: (arpc) => this.saveArpc(arpc) })) : undefined)),
        ];
    }
    get el() { return getElement(this); }
};
AppDecoplannerPlan.style = appDecoplannerPlanCss;

export { AppDecoplannerPlan as app_decoplanner_plan };

//# sourceMappingURL=app-decoplanner-plan.entry.js.map