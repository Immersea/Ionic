import { r as registerInstance, h } from './index-d515af00.js';
import { U as UserService, z as UserSettings, D as DatabaseService, aT as USERSETTINGSCOLLECTION, a3 as DiveStandardsService, aE as DiveConfiguration, a6 as DivePlan, R as RouterService, T as TranslationService } from './utils-cbf49763.js';
import { l as lodash } from './lodash-68d560b6.js';
import './index-be90eba5.js';
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

const appUserConfigurationsCss = "app-user-configurations{width:100%}app-user-configurations .card-margins{margin:10px 5px 5px 10px}";

const AppUserConfigurations = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.stdConfigurations = [];
        this.userConfigurations = [];
    }
    componentWillLoad() {
        this.userSub$ = UserService.userSettings$.subscribe((userSettings) => {
            this.userSettings = new UserSettings(userSettings);
            this.loadData();
        });
    }
    componentDidLoad() {
        //check if user is loaded or trigger local user
        if (!this.userSettings) {
            UserService.initLocalUser();
        }
    }
    async loadData() {
        if (!this.userSettings) {
            this.userSettings = new UserSettings(await DatabaseService.getLocalDocument(USERSETTINGSCOLLECTION));
        }
        this.stdConfigurations = DiveStandardsService.getStdConfigurations();
        if (this.userSettings) {
            /*this.userConfigurations = orderBy(
              this.user.userConfigurations,
              "stdName"
            );*/
            this.userConfigurations = this.userSettings.userConfigurations;
        }
        else {
            const localConfigurations = await DatabaseService.getLocalDocument("localconfigurations");
            if (localConfigurations) {
                this.stdConfigurations = [];
                localConfigurations.forEach((conf) => {
                    const model = new DiveConfiguration(conf);
                    this.userConfigurations.push(model);
                });
            }
            else {
                this.userConfigurations =
                    DiveStandardsService.getDivePlansFromConfigurations(this.stdConfigurations);
                DatabaseService.saveLocalDocument("localconfigurations", this.userConfigurations);
            }
        }
    }
    disconnectedCallback() {
        this.userSub$.unsubscribe();
    }
    async viewConfiguration(i) {
        const openModal = await UserService.checkLicence("configs", true);
        if (openModal) {
            const configuration = lodash.exports.cloneDeep(this.userConfigurations[i]);
            const divePlan = new DivePlan();
            divePlan.setConfiguration(configuration);
            const confModal = await RouterService.openModal("modal-dive-configuration", {
                diveDataToShare: {
                    divePlan: divePlan,
                },
            });
            confModal.onDidDismiss().then((updatedConf) => {
                updatedConf = updatedConf.data;
                if (updatedConf) {
                    this.userConfigurations[i] = new DiveConfiguration(updatedConf);
                    this.save();
                }
            });
        }
    }
    async removeConfiguration(event, i) {
        event.stopPropagation();
        const openModal = await UserService.checkLicence("configs", true);
        if (openModal) {
            const confirm = await alertController.create({
                header: TranslationService.getTransl("delete-configuration-header", "Delete configuration?"),
                message: TranslationService.getTransl("delete-configuration-message", "This configuration will be deleted! Are you sure?"),
                buttons: [
                    {
                        text: TranslationService.getTransl("cancel", "Cancel"),
                        role: "cancel",
                        handler: () => { },
                    },
                    {
                        text: TranslationService.getTransl("ok", "OK"),
                        handler: () => {
                            this.userConfigurations.splice(i, 1);
                            this.save();
                        },
                    },
                ],
            });
            confirm.present();
        }
    }
    async addConfiguration() {
        const openModal = await UserService.checkLicence("configs", true);
        if (openModal) {
            let inputs = [];
            lodash.exports.forEach(this.stdConfigurations, (conf, key) => {
                inputs.push({
                    type: "radio",
                    label: conf.stdName + " (standard)",
                    value: conf,
                    checked: key == 0 ? true : false,
                });
            });
            lodash.exports.forEach(this.userConfigurations, (conf) => {
                inputs.push({
                    type: "radio",
                    label: conf.stdName,
                    value: conf,
                    checked: false,
                });
            });
            const alert = await alertController.create({
                header: TranslationService.getTransl("select-standard-configuration", "Select standard configuration"),
                buttons: [
                    {
                        text: TranslationService.getTransl("ok", "OK"),
                        handler: async (data) => {
                            let openModal = await UserService.checkLicence("configs", true);
                            if (openModal) {
                                const configuration = new DiveConfiguration(data);
                                const divePlan = new DivePlan();
                                divePlan.setConfiguration(configuration);
                                const confModal = await RouterService.openModal("modal-dive-configuration", {
                                    diveDataToShare: {
                                        divePlan: divePlan,
                                    },
                                });
                                confModal.onDidDismiss().then((updatedConf) => {
                                    updatedConf = updatedConf.data;
                                    if (updatedConf) {
                                        this.userConfigurations.push(new DiveConfiguration(updatedConf));
                                        this.save();
                                    }
                                });
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
    save() {
        UserService.updateUserConfigurations(this.userConfigurations);
    }
    render() {
        return (h("div", { key: '16c236215538425b76c1e228569a7059c1362345', class: "slider-container" }, h("div", { key: '728b99f9a2a9f6bc48b97a254e04f468f1bf969b', class: "slider-scrollable-container" }, h("ion-grid", { key: '621abc467bef8ae4d8216f6ca2bd8e918762d0cb', class: "ion-no-padding" }, h("ion-row", { key: 'ffc75333c59e40bff7d9617aa193780d85ba231f', class: "ion-text-start ion-no-padding" }, this.userConfigurations.map((conf, i) => (h("ion-col", { "size-sm": "12", "size-md": "6", "size-lg": "4", class: "ion-no-padding" }, h("ion-card", { onClick: () => this.viewConfiguration(i), class: "card-margins" }, h("ion-card-header", null, h("ion-item", { class: "ion-no-padding", lines: "none" }, h("ion-button", { "icon-only": true, slot: "end", color: "danger", fill: "clear", onClick: (ev) => this.removeConfiguration(ev, i) }, h("ion-icon", { name: "trash-bin-outline" })), h("ion-card-title", null, conf.stdName)), h("ion-card-subtitle", null, h("my-transl", { tag: "max-depth", text: "Max Depth" }), ":", conf.maxDepth, " ", conf.parameters.depthUnit)), h("ion-card-content", null, conf.configuration.bottom.length > 0 ? (h("p", null, h("my-transl", { tag: "bottom-tanks", text: "Bottom Tanks" }), ":")) : undefined, conf.configuration.bottom.map((tank) => (h("p", null, tank.name + "->" + tank.gas.toString()))), conf.configuration.deco.length > 0 ? (h("p", null, h("my-transl", { tag: "deco-tanks", text: "Deco Tanks" }), ":")) : undefined, conf.configuration.deco.map((tank) => (h("p", null, tank.name + "->" + tank.gas.toString())))))))), h("ion-col", { key: '92f82cb63445fa23c25595061300c1a43a98b342', "size-sm": "12", "size-md": "6", "size-lg": "4", class: "ion-no-padding" }, h("ion-card", { key: '219d37134a68c291597519d9ee8ba5bfbf339c5d', onClick: () => this.addConfiguration() }, h("ion-card-content", { key: '3cafa4f72b3275998b466dd5b52a1adf6fddb50d', class: "ion-text-center" }, h("ion-icon", { key: 'e48cf1f13b4edd46417c0e9c5dc2976e9d030c4f', name: "add-circle-outline", style: { fontSize: "100px" } })))))))));
    }
};
AppUserConfigurations.style = appUserConfigurationsCss;

export { AppUserConfigurations as app_user_configurations };

//# sourceMappingURL=app-user-configurations.entry.js.map