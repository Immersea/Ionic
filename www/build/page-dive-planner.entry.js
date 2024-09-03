import { r as registerInstance, h } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { a4 as DiveToolsService, U as UserService, z as UserSettings, D as DatabaseService, a3 as DiveStandardsService, a0 as DivePlanModel, T as TranslationService, aE as DiveConfiguration, a6 as DivePlan, R as RouterService } from './utils-cbf49763.js';
import { E as Environment } from './env-9be68260.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { a as alertController } from './overlays-b3ceb97d.js';
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

const pageDivePlannerCss = "page-dive-planner{}page-dive-planner .card-margins{margin:10px 5px 5px 10px}";

const PageDivePlanner = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.plans = [];
        this.stdDiveProfile = {
            depth: DiveToolsService.isMetric() ? 30 : 100,
            time: 30,
            fO2: 0.32,
            fHe: 0,
            setpoint: 1.4,
        };
        this.isLoaded = false;
        this.stdConfigurations = [];
        this.localPlans = [];
        this.scrollTop = 0;
    }
    componentWillLoad() {
        this.userSettingsSub$ = UserService.userSettings$.subscribe((userSettings) => {
            this.userSettings = new UserSettings(userSettings);
            this.loadLocalData();
        });
    }
    componentDidLoad() {
        //check if user is loaded or trigger local user
        if (!this.userSettings) {
            UserService.initLocalUser();
        }
        // init Swiper:
        this.swiper = new Swiper(".swiper", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: true,
        });
    }
    async loadLocalData() {
        if (this.userSettings && this.userSettings.settings) {
            //user loggedin
            this.stdConfigurations = lodash.exports.cloneDeep(this.userSettings.userConfigurations);
            //order by name
            this.localPlans = this.userSettings.localPlans;
            this.orderPlans();
        }
        else {
            //no user loggedin
            const localPlans = await DatabaseService.getLocalDocument("localplans");
            this.stdConfigurations = DiveStandardsService.getStdConfigurations();
            if (localPlans) {
                this.localPlans = [];
                localPlans.forEach((plan) => {
                    const model = new DivePlanModel(plan);
                    this.localPlans.push(model);
                });
            }
            else {
                this.localPlans = DiveStandardsService.getDivePlansFromConfigurations(this.stdConfigurations);
                DatabaseService.saveLocalDocument("localplans", this.localPlans);
            }
            this.orderPlans();
        }
    }
    disconnectedCallback() {
        this.userSettingsSub$.unsubscribe();
    }
    async addDivePlan() {
        const maxLocalPlans = 15;
        if (this.localPlans.length >= maxLocalPlans) {
            const alert = await alertController.create({
                header: TranslationService.getTransl("max-plans", "Maximum Plans"),
                message: TranslationService.getTransl("max-plans-descr", "You can store a maximum of xxx plans. Use the 'Logbook' for additional plans.", { xxx: maxLocalPlans }),
                buttons: [
                    {
                        text: TranslationService.getTransl("ok", "OK"),
                    },
                ],
            });
            alert.present();
        }
        else {
            let inputs = [];
            if (UserService.userProfile && UserService.userProfile) {
                inputs.push({
                    type: "radio",
                    label: "New Configuration",
                    value: -1,
                    checked: false,
                });
            }
            lodash.exports.forEach(this.stdConfigurations, (conf, key) => {
                inputs.push({
                    type: "radio",
                    label: conf.stdName,
                    value: key,
                    checked: key == 0 ? true : false,
                });
            });
            const alert = await alertController.create({
                header: TranslationService.getTransl("select-standard-configuration", "Select standard configuration"),
                buttons: [
                    {
                        text: TranslationService.getTransl("ok", "OK"),
                        handler: async (data) => {
                            if (data > -1) {
                                this.addDivePlanWithConf(this.stdConfigurations[data]);
                            }
                            else {
                                let openModal = await UserService.checkLicence("configs", true);
                                if (openModal) {
                                    const newConfig = UserService.userSettings.userConfigurations[0];
                                    const configuration = new DiveConfiguration(newConfig);
                                    configuration.stdName = "";
                                    configuration.configuration.bottom = [];
                                    configuration.maxDepth = 0;
                                    configuration.maxTime = 0;
                                    const divePlan = new DivePlan();
                                    divePlan.setConfiguration(configuration);
                                    const confModal = await RouterService.openModal("modal-dive-configuration", {
                                        diveDataToShare: {
                                            divePlan: divePlan,
                                            showConfigurations: true,
                                        },
                                    });
                                    confModal.onDidDismiss().then((updatedConf) => {
                                        updatedConf = updatedConf.data;
                                        if (updatedConf) {
                                            //save new configuration and then open deco planner
                                            const newConf = new DiveConfiguration(updatedConf);
                                            //put new configuration on top
                                            const newArray = [newConf].concat(this.userSettings.userConfigurations);
                                            this.userSettings.userConfigurations = newArray;
                                            UserService.updateUserConfigurations(this.userSettings.userConfigurations);
                                            this.addDivePlanWithConf(newConf);
                                        }
                                    });
                                }
                            }
                        },
                    },
                    {
                        text: TranslationService.getTransl("cancel", "Cancel"),
                        role: "cancel",
                        cssClass: "secondary",
                    },
                ],
                inputs: inputs,
            });
            alert.present();
        }
    }
    async addDivePlanWithConf(selectedConfiguration) {
        const openModal = await RouterService.openModal("modal-dive-planner", {
            selectedConfiguration: selectedConfiguration,
            stdConfigurations: this.stdConfigurations,
            index: 0,
            user: this.userSettings,
        });
        openModal.onDidDismiss().then((divePlan) => {
            const dpModal = divePlan.data;
            if (dpModal) {
                this.localPlans.push(dpModal);
                this.updatePlans();
            }
        });
    }
    async viewDive(i) {
        const openModal = await RouterService.openModal("modal-dive-planner", {
            addDive: false,
            divePlanModel: this.localPlans[i],
            stdConfigurations: this.stdConfigurations,
            index: 0,
            user: this.userSettings,
        });
        openModal.onDidDismiss().then((divePlan) => {
            const dpModal = divePlan.data;
            if (dpModal) {
                this.localPlans[i] = dpModal;
                this.updatePlans();
            }
        });
    }
    updatePlans() {
        if (this.userSettings && this.userSettings.localPlans) {
            UserService.updateUserLocalPlans(this.localPlans);
        }
        else {
            DatabaseService.saveLocalDocument("localplans", this.localPlans);
            this.loadLocalData();
        }
    }
    orderPlans() {
        this.localPlans = lodash.exports.orderBy(this.localPlans, "configuration.stdName");
    }
    async removeDive(event, i) {
        event.stopPropagation();
        const confirm = await alertController.create({
            header: TranslationService.getTransl("delete-dive-header", "Delete dive?"),
            message: TranslationService.getTransl("delete-dive-message", "This dive plan will be deleted! Are you sure?"),
            buttons: [
                {
                    text: TranslationService.getTransl("cancel", "Cancel"),
                    role: "cancel",
                    handler: () => { },
                },
                {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: () => {
                        this.localPlans.splice(i, 1);
                        this.updatePlans();
                    },
                },
            ],
        });
        confirm.present();
    }
    render() {
        return [
            h("app-navbar", { key: 'a15e5f61ffb0bb1f7e1b7b50ca44607340324f7b', tag: 'deco-planner', text: 'Deco Planner', color: Environment.isDecoplanner() ? "gue-blue" : "planner" }),
            h("ion-content", { key: '08f8cadbcce3e3f38c4fdde60c760f502de79f85' }, h("ion-fab", { key: '4c33983221a111c2cc182f5cf77307ef27765f32', vertical: 'top', horizontal: 'end', slot: 'fixed', edge: true }, h("ion-fab-button", { key: '3f55abac8f0c2f6ec71f3b86853c0f8554382149', onClick: () => this.addDivePlan(), color: Environment.isDecoplanner() ? "gue-blue" : "planner" }, h("ion-icon", { key: '97da6c1984e08939a2a148cedffaa99cbfb397eb', name: 'add' }))), this.localPlans.length > 0 ? (h("ion-grid", { class: 'ion-no-padding' }, h("ion-row", { class: 'ion-no-padding' }, this.localPlans.map((plan, i) => (h("ion-col", { "size-sm": '12', "size-md": '6', "size-lg": '4', class: 'ion-no-padding' }, h("ion-card", { onClick: () => this.viewDive(i), class: 'card-margins' }, h("ion-card-header", null, h("ion-card-subtitle", null, h("ion-item", { lines: 'none', class: 'ion-no-padding' }, h("ion-button", { "icon-only": true, slot: 'end', color: 'danger', fill: 'clear', onClick: (ev) => this.removeDive(ev, i) }, h("ion-icon", { name: 'trash-bin-outline' })), h("ion-label", null, h("h1", null, plan.configuration.stdName))), plan.dives[0]
                .getProfilePointsDetails()
                .map((detail) => (h("p", { class: 'ion-text-start' }, detail))))), h("ion-card-content", null, plan.configuration.configuration.bottom.length > 0 ? (h("p", null, h("my-transl", { tag: 'bottom-tanks', text: 'Bottom Tanks' }), ":")) : undefined, plan.configuration.configuration.bottom.map((tank) => (h("p", null, tank.name + "->" + tank.gas.toString()))), plan.configuration.configuration.deco.length > 0 ? (h("p", null, h("my-transl", { tag: 'deco-tanks', text: 'Deco Tanks' }), ":")) : undefined, plan.configuration.configuration.deco.map((tank) => (h("p", null, tank.name + "->" + tank.gas.toString()))))))))))) : undefined),
        ];
    }
};
PageDivePlanner.style = pageDivePlannerCss;

export { PageDivePlanner as page_dive_planner };

//# sourceMappingURL=page-dive-planner.entry.js.map