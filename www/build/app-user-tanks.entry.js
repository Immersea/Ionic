import { r as registerInstance, h } from './index-d515af00.js';
import { U as UserService, z as UserSettings, D as DatabaseService, aT as USERSETTINGSCOLLECTION, a3 as DiveStandardsService, R as RouterService, aR as TankModel, T as TranslationService, a4 as DiveToolsService } from './utils-5cd4c7bb.js';
import { l as lodash } from './lodash-68d560b6.js';
import './index-be90eba5.js';
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

const appUserTanksCss = "app-user-tanks{width:100%}app-user-tanks .card-margins{margin:10px 5px 5px 10px}";

const AppUserTanks = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.stdTanks = [];
        this.hasUserTanks = true;
        this.userTanks = [];
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
        this.userTanks = this.userSettings.userTanks;
        this.stdTanks = DiveStandardsService.getStdTanks();
        if (lodash.exports.isEqual(this.userTanks, this.stdTanks))
            this.hasUserTanks = false;
    }
    disconnectedCallback() {
        this.userSub$.unsubscribe();
    }
    async viewTank(i) {
        const openModal = await UserService.checkLicence("configs", true);
        if (openModal) {
            const tank = lodash.exports.cloneDeep(this.userTanks[i]);
            const confModal = await RouterService.openModal("modal-tank-configuration", {
                tank: tank,
            });
            confModal.onDidDismiss().then((updatedTank) => {
                if (updatedTank && updatedTank.data) {
                    const tank = updatedTank.data;
                    this.userTanks[i] = new TankModel(tank);
                    this.save();
                }
            });
        }
    }
    async removeTank(event, i) {
        event.stopPropagation();
        const openModal = await UserService.checkLicence("configs", true);
        if (openModal) {
            const confirm = await alertController.create({
                header: TranslationService.getTransl("delete-tank-header", "Delete tank?"),
                message: TranslationService.getTransl("delete-tank-message", "This tank will be deleted! Are you sure?"),
                buttons: [
                    {
                        text: TranslationService.getTransl("cancel", "Cancel"),
                        role: "cancel",
                        handler: () => { },
                    },
                    {
                        text: TranslationService.getTransl("ok", "OK"),
                        handler: () => {
                            this.userTanks.splice(i, 1);
                            this.save();
                        },
                    },
                ],
            });
            confirm.present();
        }
    }
    async addTank() {
        const openModal = await UserService.checkLicence("configs", true);
        if (openModal) {
            let inputs = [];
            lodash.exports.forEach(this.stdTanks, (conf, key) => {
                inputs.push({
                    type: "radio",
                    label: conf.name + (this.hasUserTanks ? " (standard)" : ""),
                    value: conf,
                    checked: key == 0 ? true : false,
                });
            });
            if (this.hasUserTanks)
                lodash.exports.forEach(this.userTanks, (conf) => {
                    inputs.push({
                        type: "radio",
                        label: conf.name,
                        value: conf,
                        checked: false,
                    });
                });
            const alert = await alertController.create({
                header: TranslationService.getTransl("select-standard-tank", "Select standard tank"),
                buttons: [
                    {
                        text: TranslationService.getTransl("ok", "OK"),
                        handler: async (tank) => {
                            let openModal = await UserService.checkLicence("configs", true);
                            if (openModal) {
                                const confModal = await RouterService.openModal("modal-tank-configuration", {
                                    tank: tank,
                                });
                                confModal.onDidDismiss().then((updatedTank) => {
                                    if (updatedTank && updatedTank.data) {
                                        const tank = updatedTank.data;
                                        this.userTanks.push(new TankModel(tank));
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
        UserService.updateUserTanks(this.userTanks);
    }
    render() {
        return (h("div", { key: '89448644dac70c0d151d5b626cc7f5d6988e643d', class: "slider-container" }, h("div", { key: '51a12a61a04bea274b47424d44f712aef5fc619d', class: "slider-scrollable-container" }, h("ion-grid", { key: 'b03174fc58995656c61db27353935c73678ced48', class: "ion-no-padding" }, h("ion-row", { key: 'f7264d570e930b1281a5100f95bff713dd97548c', class: "ion-text-start ion-no-padding" }, this.userTanks.map((tank, i) => (h("ion-col", { "size-sm": "12", "size-md": "6", "size-lg": "4", class: "ion-no-padding" }, h("ion-card", { onClick: () => this.viewTank(i), class: "card-margins" }, h("ion-card-header", null, h("ion-item", { class: "ion-no-padding", lines: "none" }, h("ion-button", { "icon-only": true, slot: "end", color: "danger", fill: "clear", onClick: (ev) => this.removeTank(ev, i) }, h("ion-icon", { name: "trash-bin-outline" })), h("ion-card-title", null, tank.name)), h("ion-card-subtitle", null, TranslationService.getTransl("volume", "Volume") +
            " : " +
            tank.volume +
            " lt" +
            (this.userSettings.settings.units != "Metric"
                ? " / " +
                    DiveToolsService.ltToCuFt(tank.volume) +
                    " cuft"
                : ""))), h("ion-card-content", null, h("ion-grid", null, h("ion-row", null, h("ion-col", null, TranslationService.getTransl("no_of_tanks", "Number Of Tanks") +
            " : " +
            tank.no_of_tanks)), h("ion-row", null, h("ion-col", null, TranslationService.getTransl("pressure", "Pressure") +
            " : " +
            tank.pressure +
            " bar" +
            (this.userSettings.settings.units != "Metric"
                ? " / " +
                    DiveToolsService.barToPsi(tank.pressure) +
                    " psi"
                : ""))), tank.forDeco ? (h("ion-row", null, h("ion-col", null, "(", TranslationService.getTransl("for-deco", "For Decompression"), ")"))) : undefined)))))), h("ion-col", { key: 'e53027261f966746a2ecedc3723d634044d91295', "size-sm": "12", "size-md": "6", "size-lg": "4", class: "ion-no-padding" }, h("ion-card", { key: 'f17bedfe2b63ddcdb70760fd04bf93577875d843', onClick: () => this.addTank() }, h("ion-card-content", { key: 'd21e9707d372b02b4197732a9215dc97bdfc26dc', class: "ion-text-center" }, h("ion-icon", { key: 'c37f3c654ef69c321a505a6ccd1a888a97061a54', name: "add-circle-outline", style: { fontSize: "100px" } })))))))));
    }
};
AppUserTanks.style = appUserTanksCss;

export { AppUserTanks as app_user_tanks };

//# sourceMappingURL=app-user-tanks.entry.js.map