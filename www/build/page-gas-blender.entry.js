import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { a3 as DiveStandardsService, a4 as DiveToolsService, D as DatabaseService, aG as Gas, aH as GasBlenderService, T as TranslationService } from './utils-cbf49763.js';
import { G as GasSupply, C as Cylinder } from './gas-supply-253aa425.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { a as isPlatform } from './ionic-global-c07767bf.js';
import { p as popoverController, a as alertController } from './overlays-b3ceb97d.js';
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
import './env-9be68260.js';
import './map-dae4acde.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';
import './framework-delegate-779ab78c.js';

const pageGasBlenderCss = "page-gas-blender ion-list{width:100%}page-gas-blender ion-segment-button{--color-checked:var(--ion-color-blender-contrast)}";

const PageGasBlender = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.volumeUnit = null;
        this.ppCost = {
            o2: { volume: 0, cost: 0 },
            he: { volume: 0, cost: 0 },
            nx: { volume: 0, cost: 0 },
            tmx: { volume: 0, cost: 0 },
            totCost: 0,
        };
        this.nbCost = {
            o2: { volume: 0, cost: 0 },
            he: { volume: 0, cost: 0 },
            nx: { volume: 0, cost: 0 },
            tmx: { volume: 0, cost: 0 },
            totCost: 0,
        };
        this.tbCost = {
            o2: { volume: 0, cost: 0 },
            he: { volume: 0, cost: 0 },
            nx: { volume: 0, cost: 0 },
            tmx: { volume: 0, cost: 0 },
            totCost: 0,
        };
        this.localDoc = "page-gas-blender";
        this.allowUpdate = true;
        this.real_gas = undefined;
        this.he_first = undefined;
        this.updateView = true;
        this.titles = [
            { tag: "tank", icon: "chevron-forward", slotIcon: "end" },
            { tag: "blend", icon: "chevron-forward", slotIcon: "end" },
            { tag: "cost", icon: "chevron-forward", slotIcon: "end" },
            { tag: "top-up" },
        ];
        this.slider = undefined;
    }
    async componentWillLoad() {
        //reset licences and load views
        this.resetDP2licences();
        this.stdGases = [];
        let gases = DiveStandardsService.getStdGases();
        this.stdGases = lodash.exports.orderBy(gases, "fromDepth", "asc");
        const tanks = DiveStandardsService.getStdTanks();
        //order and remove duplicates
        this.stdTanks = lodash.exports.uniqBy(lodash.exports.orderBy(tanks, "volume"), "name");
        //reset stored config in case of change of units
        if (this.storedConfig &&
            ((this.storedConfig.servicePressure > 1000 &&
                DiveToolsService.isMetric()) ||
                (this.storedConfig.servicePressure < 1000 &&
                    DiveToolsService.isImperial()) ||
                !this.storedConfig.tank)) {
            this.storedConfig = null;
        }
        this.restoreConfiguration();
        this.volumeUnit = DiveToolsService.isMetric() ? "lt" : "cuft";
    }
    restoreConfiguration() {
        const startConfig = {
            tank: lodash.exports.find(this.stdTanks, (tank) => {
                return tank.name == "s80";
            }),
            chargeCost: 5,
            heCost: DiveToolsService.isMetric() ? 40 : 1.3,
            o2Cost: DiveToolsService.isMetric() ? 25 : 0.85,
            nxCost: DiveToolsService.isMetric() ? 20 : 0.7,
            tmxCost: DiveToolsService.isMetric() ? 20 : 0.8,
            servicePressure: DiveToolsService.isMetric() ? 230 : 3300,
            topup_fO2: 0.21,
            topup_fHe: 0,
            topup_temp: DiveToolsService.isMetric() ? 20 : 68,
            topup1_fO2: 0.32,
            topup1_fHe: 0,
            topup1_temp: DiveToolsService.isMetric() ? 20 : 68,
            start_fO2: 0.21,
            start_fHe: 0.35,
            start_pres: DiveToolsService.isMetric() ? 50 : 750,
            start_temp: DiveToolsService.isMetric() ? 20 : 68,
            end_fO2: 0.15,
            end_fHe: 0.55,
            end_pres: DiveToolsService.isMetric() ? 230 : 3300,
            end_temp: DiveToolsService.isMetric() ? 20 : 68,
            end_topup_pres: DiveToolsService.isMetric() ? 230 : 3300,
            real_gas: true,
            he_first: false,
        };
        this.restoreConfig(startConfig);
    }
    componentDidLoad() {
        this.slider = new Swiper(".slider-gas-blender", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
        });
    }
    async restoreConfig(startConfig) {
        //local config
        this.storedConfig = await DatabaseService.getLocalDocument(this.localDoc);
        let config = this.storedConfig ? this.storedConfig : startConfig;
        this.topup = new GasSupply(new Cylinder(config.tank.volume, config.servicePressure), new Gas(config.topup_fO2, config.topup_fHe), config.servicePressure, !config.real_gas, config.topup_temp);
        this.topup1 = new GasSupply(new Cylinder(config.tank.volume, config.servicePressure), new Gas(config.topup1_fO2, config.topup1_fHe), config.servicePressure, !config.real_gas, config.topup1_temp);
        this.start = new GasSupply(new Cylinder(config.tank.volume, config.servicePressure), new Gas(config.start_fO2, config.start_fHe), config.start_pres, !config.real_gas, config.start_temp);
        this.end = new GasSupply(new Cylinder(config.tank.volume, config.servicePressure), new Gas(config.end_fO2, config.end_fHe), config.end_pres, !config.real_gas, config.end_temp);
        this.end_topup_pres = config.end_topup_pres;
        this.real_gas = config.real_gas;
        this.he_first = config.he_first;
        this.setTank(config.tank, config.servicePressure);
        this.chargeCost = config.chargeCost;
        this.heCost = config.heCost;
        this.o2Cost = config.o2Cost;
        this.nxCost = config.nxCost;
        this.tmxCost = config.tmxCost;
        this.updateView = !this.updateView;
        this.updateBlend();
    }
    setTank(tank, servicePressure) {
        this.tank = tank;
        this.start.setCylinder(new Cylinder(this.tank.volume, servicePressure));
        this.end.setCylinder(new Cylinder(this.tank.volume, servicePressure));
    }
    saveConfig() {
        DatabaseService.saveLocalDocument(this.localDoc, {
            tank: this.tank,
            chargeCost: this.chargeCost,
            heCost: this.heCost,
            o2Cost: this.o2Cost,
            nxCost: this.nxCost,
            tmxCost: this.tmxCost,
            servicePressure: this.start.mCylinder.getServicePressure(),
            topup_fO2: this.topup.getFO2(),
            topup_fHe: this.topup.getFHe(),
            topup_temp: this.topup.getTemperature(),
            start_fO2: this.start.getFO2(),
            start_fHe: this.start.getFHe(),
            start_pres: this.start.getPressure(),
            start_temp: this.start.getTemperature(),
            end_fO2: this.end.getFO2(),
            end_fHe: this.end.getFHe(),
            end_pres: this.end.getPressure(),
            end_temp: this.end.getTemperature(),
            end_topup_pres: this.end_topup_pres,
            real_gas: this.real_gas,
            he_first: this.he_first,
        });
    }
    resetDP2licences() {
        //this.licence.set(this.navCtrl,this.user)
    }
    async presentPopover(event, gas, showBar = true) {
        const page = "popover-gas-blender";
        const data = {
            gasProp: this[gas],
            stdGasesList: this.stdGases,
            showBar: showBar,
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
        popover.onDidDismiss().then((updatedGas) => {
            //if (updatedData === "showTrimixlicence") {
            //this.navCtrl.push("SettingsPage")
            //} else {
            this[gas] = updatedGas.data;
            this.allowUpdate = true;
            this.updateBlend();
            //}
        });
    }
    toggleRealGas() {
        this.real_gas = !this.real_gas;
        this.topup.useIdealGasLaws(!this.real_gas);
        this.start.useIdealGasLaws(!this.real_gas);
        this.end.useIdealGasLaws(!this.real_gas);
        this.updateBlend();
    }
    toggleHeFirst() {
        this.he_first = !this.he_first;
        this.updateBlend();
    }
    updateTopup(ev) {
        this.end_topup_pres = parseInt(ev.detail.value);
        this.allowUpdate = true;
        this.updateBlend();
    }
    changeTank(ev) {
        this.setTank(lodash.exports.find(this.stdTanks, (tank) => {
            return tank.name == ev.detail.value;
        }), this.start.getCylinder().getServicePressure());
        this.updateBlend();
    }
    updateCosts(ev) {
        if (ev && ev.detail) {
            this[ev.detail.name] = ev.detail.value;
        }
        this.calculateCosts();
    }
    calculateCosts() {
        const chargeCost = this.chargeCost > 0 ? lodash.exports.toNumber(this.chargeCost) : 0;
        this.ppCost = {
            o2: { volume: 0, cost: 0 },
            he: { volume: 0, cost: 0 },
            nx: { volume: 0, cost: 0 },
            tmx: { volume: 0, cost: 0 },
            totCost: 0,
        };
        this.nbCost = {
            o2: { volume: 0, cost: 0 },
            he: { volume: 0, cost: 0 },
            nx: { volume: 0, cost: 0 },
            tmx: { volume: 0, cost: 0 },
            totCost: 0,
        };
        this.tbCost = {
            o2: { volume: 0, cost: 0 },
            he: { volume: 0, cost: 0 },
            nx: { volume: 0, cost: 0 },
            tmx: { volume: 0, cost: 0 },
            totCost: 0,
        };
        this.ppCost.totCost = chargeCost;
        this.ppSteps.map((step) => {
            const calc = this.stepCost(this.ppCost, step);
            if (calc.type) {
                this.ppCost[calc.type].volume = lodash.exports.round(calc.volume, 2);
                this.ppCost[calc.type].cost = lodash.exports.round(calc.cost, 2);
                this.ppCost.totCost += calc.cost;
            }
        });
        this.ppCost.totCost = lodash.exports.round(this.ppCost.totCost, 2);
        this.nbCost.totCost = chargeCost;
        this.nxSteps.map((step) => {
            const calc = this.stepCost(this.nbCost, step);
            if (calc.type) {
                this.nbCost[calc.type].volume = lodash.exports.round(calc.volume, 2);
                this.nbCost[calc.type].cost = lodash.exports.round(calc.cost, 2);
                this.nbCost.totCost += calc.cost;
            }
        });
        this.nbCost.totCost = lodash.exports.round(this.nbCost.totCost, 2);
        this.tbCost.totCost = chargeCost;
        this.tmxSteps.map((step) => {
            const calc = this.stepCost(this.tbCost, step);
            if (calc.type) {
                this.tbCost[calc.type].volume = lodash.exports.round(calc.volume, 2);
                this.tbCost[calc.type].cost = lodash.exports.round(calc.cost, 2);
                this.tbCost.totCost += calc.cost;
            }
        });
        this.tbCost.totCost = lodash.exports.round(this.tbCost.totCost, 2);
        this.update();
    }
    stepCost(cost, step) {
        const totVolume = this.real_gas ? this.realCapacity : this.idealCapacity;
        let volume = 0;
        let type = null;
        //use total capacity in proportion with pressures
        if (step.type == "add" || step.type == "topup") {
            if (step.mix.O2 == 100) {
                type = "o2";
                volume = (step.pressToAdd / this.end.getPressure()) * totVolume;
                cost =
                    (volume * this.o2Cost) / (DiveToolsService.isMetric() ? 1000 : 1); //costs for m3 or cuft
            }
            else if (step.mix.He == 100) {
                type = "he";
                volume = (step.pressToAdd / this.end.getPressure()) * totVolume;
                cost =
                    (volume * this.heCost) / (DiveToolsService.isMetric() ? 1000 : 1);
            }
            else if (step.mix.O2 > 0 && step.mix.O2 != 21 && step.mix.He == 0) {
                type = "nx";
                volume = (step.pressToAdd / this.end.getPressure()) * totVolume;
                cost =
                    (volume * this.nxCost) / (DiveToolsService.isMetric() ? 1000 : 1);
            }
            else if (step.mix.O2 > 0 && step.mix.He > 0) {
                type = "tmx";
                volume = (step.pressToAdd / this.end.getPressure()) * totVolume;
                cost =
                    (volume * this.tmxCost) / (DiveToolsService.isMetric() ? 1000 : 1);
            }
        }
        return { type: type, volume: volume, cost: cost };
    }
    async updateBlend() {
        if (this.allowUpdate) {
            // Make Mixes of our gases
            GasBlenderService.mTopup = this.topup.getMix();
            GasBlenderService.have = lodash.exports.cloneDeep(this.start);
            GasBlenderService.want = lodash.exports.cloneDeep(this.end);
            var res = GasBlenderService.solve();
            if (!res) {
                let prompt = await alertController.create({
                    header: TranslationService.getTransl("blend-error-title", "Blend Error"),
                    message: TranslationService.getTransl("blend-error-message", "Sorry! It was not possible to calculate the blend. Try to reduce the start pressure and check if it works."),
                    buttons: [
                        {
                            text: TranslationService.getTransl("ok", "OK"),
                        },
                    ],
                });
                prompt.present();
                this.allowUpdate = false;
                this.restoreConfiguration();
            }
            else {
                this.allowUpdate = true;
                this.ppSteps = GasBlenderService.getPPSteps(this.he_first);
                this.nxSteps = GasBlenderService.getContinuousNxSteps();
                this.tmxSteps = GasBlenderService.getContinuousTmxSteps();
                this.idealCapacity = GasBlenderService.want
                    .getCylinder()
                    .getIdealCapacityAtPressure(GasBlenderService.want.getPressure());
                this.realCapacity = GasBlenderService.want
                    .getCylinder()
                    .getVdwCapacityAtPressure(GasBlenderService.want.getPressure(), GasBlenderService.want.getMix(), GasBlenderService.want.getKTemperature());
                this.end_topup = lodash.exports.cloneDeep(this.start);
                this.end_topup.topup(this.topup1.getMix(), this.end_topup_pres);
                this.calculateCosts();
            }
        }
    }
    update() {
        this.saveConfig();
        this.updateView = !this.updateView;
    }
    logScrollStart(ev) {
        this.content = ev.srcElement;
    }
    render() {
        return [
            h("ion-header", { key: '6dd70a00d1b73a12619b7faf971ff8febdae482e' }, h("app-navbar", { key: '3fa07005ca97edf0aa4015fc60bad9d7cdff17d2', tag: "gas-blender", text: "Gas Blender", color: "blender" })),
            h("app-header-segment-toolbar", { key: '79e1d0cab074306cacd4eddd440e6ca8b30095e4', color: "blender", swiper: this.slider, titles: this.titles }),
            h("ion-content", { key: '990739ae68678e503065c3aa5ae8cccf2b2964b1', class: "slides", scrollEvents: true, onIonScrollStart: (ev) => this.logScrollStart(ev) }, h("swiper-container", { key: 'a5f8513bc2f4cf932d6f22927cbb151f08f974a7', class: "slider-gas-blender swiper" }, h("swiper-wrapper", { key: '71ac5f194fea0722d2f0a73ff00178bb29aae2f8', class: "swiper-wrapper" }, h("swiper-slide", { key: '01d64413707798bca5ddf95154ba2b0e5ce13822', class: "swiper-slide" }, h("ion-list", { key: '81c7af1b7678b020fcf1829f8ef6e3623ff14895', class: "ion-text-wrap" }, h("ion-item", { key: '063914876be7125aaace77ea48f416bfe3ed6958', color: "white" }, h("ion-grid", { key: 'de65c8932402cada7a19e09edb97fae693a5934c', class: "ion-text-center" }, h("ion-row", { key: 'f5f8d4c2169839eebf80bafba9e8ed52225e1bb4' }, h("ion-col", { key: '99b1ea7338035f1d7113f0b6b7c776994acfe9eb', style: { marginTop: "5px" } }, h("b", { key: 'fbc231af1972c94b60fd2f64b91acde00a1e0881' }, DiveToolsService.isMetric() ? "Bar" : "Psi")), h("ion-col", { key: '7078bfbcb4292bbe7dfa90ec8a85fc189611d4ee', style: { marginTop: "5px" } }, h("b", { key: '9aeb09464f5cc910e59eff7df8a079a85506c01a' }, "O", h("sub", { key: '1aab64d43c2bfa53066ad8fc19b7fc4752e5b342' }, "2"))), h("ion-col", { key: 'd192db9ee6980cca0539d16288fcee0c956202a2', style: { marginTop: "5px" } }, h("b", { key: '6782d04ec9be6bd3c0a4daa47e4d65a65eedee0b' }, "He")), h("ion-col", { key: '1d94c59ec0b1d4cf82fc977b1f7a2ceb8719793b', style: { marginTop: "5px" } }, h("b", { key: '6e1de302b1f35d46262c85a94bac8c06e36c43bb' }, "\u00B0", DiveToolsService.isMetric() ? "C" : "F"))))), h("ion-item-divider", { key: '74aeed98a2cac90a3e857714795d69341cbbafc9', color: "white", class: "ion-text-center" }, h("my-transl", { key: '8fe05e5a86fd364862040af7ae015618b613e9be', tag: "topup-gas", text: "Top-Up Gas" })), h("ion-item", { key: 'd18f7fb76bff3fc93e02fdc94a75bb2c2f08884f' }, h("ion-grid", { key: '92bc7a609a9994bd8d22f41af229ee4545524418', class: "ion-text-center" }, h("ion-row", { key: '6e67911e9e62deb6f8285c75a2303923d1829cd3' }, h("ion-col", { key: '2d4157721f42028a44e759d5482a029c58e2eabe', onClick: ($event) => this.presentPopover($event, "topup", false) }), h("ion-col", { key: '3f2ba2f8fc1882bcb3a10f0289034f0636803487', onClick: ($event) => this.presentPopover($event, "topup", false) }, this.topup.getFO2() * 100), h("ion-col", { key: 'b0254a52e9273dfdc628b1c3df3da3c8c589eb56', onClick: ($event) => this.presentPopover($event, "topup", false) }, this.topup.getFHe() * 100), h("ion-col", { key: '5c75983aa11c3ae7ebed59efef6bb76f2b93e9c7', onClick: ($event) => this.presentPopover($event, "topup", false) }, this.topup.getTemperature())))), h("ion-item-divider", { key: '264ab8bdc37c7a13c4a183b75a3a5ece8bdcdaa1', color: "white", class: "ion-text-center" }, h("my-transl", { key: '1fb2eedc8243533c9205cd57f8b9a692669a6dd9', tag: "start-tank", text: "Start Tank" })), h("ion-item", { key: 'bd4284b3575ce64c34b5c25300eab53ce6149a20' }, h("ion-grid", { key: '78c75b379dbe69727e8d991352f4036cc2bafb31', class: "ion-text-center" }, h("ion-row", { key: 'b40af8543c611431b776fc4daad42aa8c7672b07' }, h("ion-col", { key: 'edbbaa3fde12c8ad78584a93d4fdced071d3bd39', onClick: ($event) => this.presentPopover($event, "start") }, this.start.getPressure()), h("ion-col", { key: '35da7e4d5ac1013bebb940a966a3c90205d80d8f', onClick: ($event) => this.presentPopover($event, "start") }, lodash.exports.round(this.start.getFO2() * 100, 0)), h("ion-col", { key: '700d0f5c14d8c36e7800bc8edf61058d4e5bf5f9', onClick: ($event) => this.presentPopover($event, "start") }, lodash.exports.round(this.start.getFHe() * 100, 0)), h("ion-col", { key: '6701e0140f25c70fb3d8cf564d9f7f16e88f5e16', onClick: ($event) => this.presentPopover($event, "start") }, this.start.getTemperature())))), h("ion-item-divider", { key: 'b338278748e88c0d828ef14f29316a3ef8e3f363', color: "white", class: "ion-text-center" }, h("my-transl", { key: '5adecd5b5f02428d80162977d85b1394cf5a21fd', tag: "end-tank", text: "End Tank" })), h("ion-item", { key: '4f84f1a24c72c11b6cfd1c604d7807c6b65fe288' }, h("ion-grid", { key: '3c4cedbcc5937ba44b83d6cad532c221da47648f', class: "ion-text-center" }, h("ion-row", { key: '11ef20e56d4bdb263653f29ae5238327f123147c' }, h("ion-col", { key: '523c75283640d1f493d50eeceaa75209b1516592', onClick: ($event) => this.presentPopover($event, "end") }, this.end.getPressure()), h("ion-col", { key: '63a6be5a4ef6817b8f2e8b8b03d66cb38a0d87f3', onClick: ($event) => this.presentPopover($event, "end") }, lodash.exports.round(this.end.getFO2() * 100, 0)), h("ion-col", { key: '13c47fa1287d016e466bd2c19480e2170deee537', onClick: ($event) => this.presentPopover($event, "end") }, lodash.exports.round(this.end.getFHe() * 100, 0)), h("ion-col", { key: 'cedd5b599ec4a6806f596fe8b6cad0f443173744', onClick: ($event) => this.presentPopover($event, "end") }, this.end.getTemperature())))))), h("swiper-slide", { key: '613ead0601b0d3c5ec823cd0527c60067c696333', class: "swiper-slide" }, h("ion-grid", { key: '66d6d7621d325c498cd419e191496c4365658677' }, h("ion-row", { key: '4f01d2175050e5577bc07daea398c76d2a9eac9b' }, h("ion-list", { key: 'cdf2aff9ff8b46eb82af5637bc395a4a82c70cc5', class: "ion-text-wrap" }, h("ion-grid", { key: '3d187b179fb394552065a7f79d7f0c54a8328e13', class: "ion-text-center" }, h("ion-row", { key: '169cdf3f65e1c1b5829f681bfa4c7950c3103ad0' }, h("ion-col", { key: '2cc916768a055d4d4a4e4cac811cb97b7d0055d9' }, h("ion-item", { key: '3eff6d4e6f122bc1f6392e1395c29449adb47914' }, h("my-transl", { key: '601b5180553b5eb26b7f875b70044029222d79c0', tag: "real-gas", text: "Real gas", isLabel: true }), h("ion-toggle", { key: '984d8bcb7a57d3f0e8c11171038031f9a7bee968', color: "blender", checked: this.real_gas, onIonChange: () => this.toggleRealGas() }))), h("ion-col", { key: 'e19116eab1c1af87891a2441a50c8f27ba10577b' }, h("ion-item", { key: 'c3815e64fd0feca4dee78ad4885d57cd69b9ce52' }, h("my-transl", { key: 'c147e134adcd8e740745e88863d3579ae2b2f55a', tag: "he-first", text: "He first", isLabel: true }), h("ion-toggle", { key: 'a2fd3fc45ce88b280267e56dee86c6b58e2a3ee7', color: "blender", checked: this.he_first, onIonChange: () => this.toggleHeFirst() }))))), h("ion-item", { key: '91366c0e22da503829791198a2faf4106b32b52b', color: "white" }, h("ion-grid", { key: '0d80c8904f80e307ba0526cd52998e6ef0781328', class: "ion-text-center" }, h("ion-row", { key: 'cdce01d3f036635b1fc06a174aef0086eb1ff8b5' }, h("ion-col", { key: '857fbafdb2bfe5bff44dbbe0354fb0b5fca174d4', style: { marginTop: "5px" } }, h("b", { key: 'd3d81ec3406ef6f7de2f65bf7da095b2eebd115e' }, h("my-transl", { key: '74bf43d2c19c5099f0ba82789d0ed8a23403513d', tag: "action", text: "Action" }))), h("ion-col", { key: '5de89a9118729d6eabc6222e96edd0c3e03cbff5', style: { marginTop: "5px" } }, h("b", { key: '9384a99b31d6f5f32716433a805928a884045f90' }, h("my-transl", { key: 'eb9ad44da7ee55d3b02180059a31a848e1d7143c', tag: "start", text: "Start" }))), h("ion-col", { key: 'bea39b2cff4a1a72d2a5979aedb4e97ea47bfade', style: { marginTop: "5px" } }, h("b", { key: '791bbfb0c4dd16c87beefb6de90369f97568e388' }, "+")), h("ion-col", { key: '2c291455cbb80d8ab249d58781837c232ea74ecc', style: { marginTop: "5px" } }, h("b", { key: '2df1a0790c0c0e2f30883bd8cce8f62f57f949f2' }, "="))))), h("ion-item-divider", { key: '0879bb5302a67bbae5b5cdb7a929978e2b0c1ba3', color: "white", class: "ion-text-center" }, h("my-transl", { key: 'd205dd8e42f8de5365013acb7b03ef970725f84e', tag: "partial-pressure-blending", text: "Partial Pressure Blending" })), this.ppSteps.map((step) => (h("ion-item", null, h("ion-grid", { class: "ion-text-center" }, h("ion-row", null, h("ion-col", null, step.blend, " ", GasBlenderService.getGasName(step.mix)), h("ion-col", null, lodash.exports.round(step.startPress, 1)), h("ion-col", null, lodash.exports.round(step.pressToAdd, 1)), h("ion-col", null, lodash.exports.round(step.finalPress, 1))))))), h("ion-item-divider", { key: '053f61fc2663c38f5d421080f997fa8a50818585', color: "white", class: "ion-text-center" }, h("my-transl", { key: '40af9b0362683b61431e856db9d7fd88b1b874ec', tag: "cont-nx-blending", text: "Continuous Nitrox Blending", isLabel: true })), this.nxSteps.map((step) => (h("ion-item", null, h("ion-grid", { class: "ion-text-center" }, h("ion-row", null, h("ion-col", null, step.blend, " ", GasBlenderService.getGasName(step.mix)), h("ion-col", null, lodash.exports.round(step.startPress, 1)), h("ion-col", null, lodash.exports.round(step.pressToAdd, 1)), h("ion-col", null, lodash.exports.round(step.finalPress, 1))))))), h("ion-item-divider", { key: '8ce5e3a349cbfd0d40fc3168c176ce93c52e78e8', color: "white", class: "ion-text-center" }, h("my-transl", { key: '652bfb72dff11ece64f646d20246722964348fe7', tag: "cont-tmx-blending", text: "Continuous Trimix Blending", isLabel: true })), this.tmxSteps.map((step) => (h("ion-item", null, h("ion-grid", { class: "ion-text-center" }, h("ion-row", null, h("ion-col", null, step.blend, " ", GasBlenderService.getGasName(step.mix)), h("ion-col", null, lodash.exports.round(step.startPress, 1)), h("ion-col", null, lodash.exports.round(step.pressToAdd, 1)), h("ion-col", null, lodash.exports.round(step.finalPress, 1))))))))))), h("swiper-slide", { key: '97435c6eafa3e5c1a4a6986e5d1919fb195d8cf0', class: "swiper-slide" }, h("ion-grid", { key: 'ac2dc6b54b6a9c72755b24d5d405d8bd5f7311eb' }, h("ion-row", { key: 'd52c8e7c097a49aa179133ff231874fb0bd1481f' }, h("ion-item", { key: '06bda16ebf2d0bb43b354c9cf26720792aa0e805', style: { width: "100%" } }, h("ion-label", { key: '63213ee65b409d770d065a4edde7b9cba708c78f' }, h("my-transl", { key: '0fc64f548e2873e230f3659ba17abc6bf326fffb', tag: "tank", text: "Tank" })), h("ion-select", { key: 'c7a1125f121d43fafee607cbb4e8b8e96cbd5f1a', interface: "action-sheet", onIonChange: (ev) => this.changeTank(ev), value: this.tank.name }, this.stdTanks.map((tank) => (h("ion-select-option", { value: tank.name }, tank.name)))))), h("ion-row", { key: 'c2e5b5f20f7b2a20f076f73591821ea37d0403a3' }, h("ion-item", { key: 'fe5a442279b22fec49daa7ccb7b97e0aaaeae540', style: { width: "100%" } }, h("ion-row", { key: 'ba900b6ed6e5173d290e2c8f494c277c95a25ad3', style: { width: "100%" } }, h("ion-col", { key: 'e715a4c6dbd6b3640b8bd20b4f5350a907e17f2d' }, TranslationService.getTransl("ideal-capacity", "Ideal Capacity") +
                ": " +
                lodash.exports.round(this.idealCapacity, 0) +
                " " +
                this.volumeUnit), this.real_gas ? (h("ion-col", null, TranslationService.getTransl("real-capacity", "Real Capacity") +
                ": " +
                lodash.exports.round(this.realCapacity, 0) +
                " " +
                this.volumeUnit)) : undefined))), h("ion-row", { key: '42ab94fdedf9d1268b79fb99d4ea0e2ddeb3a286' }, h("ion-col", { key: 'd05c3aac7eaa4ba9c50c0ac5cc525a72bc677f05' }, h("app-form-item", { key: '112b918a4807b061c443d9610c1bb97677329ef2', "label-tag": "he-cost", "label-text": "Helium Cost", appendText: " (unit/" +
                    (DiveToolsService.isMetric() ? "m3" : "cuft") +
                    ")", value: this.heCost, name: "heCost", "input-type": "number", onFormItemChanged: (ev) => this.updateCosts(ev) })), h("ion-col", { key: '924ac3161599fc5b2caea1fc8c442355d618e687' }, h("app-form-item", { key: '2a272145414a145eb431a92ee3e3100f8a866541', "label-tag": "o2-cost", "label-text": "Oxygen Cost", appendText: " (unit/" +
                    (DiveToolsService.isMetric() ? "m3" : "cuft") +
                    ")", value: this.o2Cost, name: "o2Cost", "input-type": "number", onFormItemChanged: (ev) => this.updateCosts(ev) })), h("ion-col", { key: '34dd15d2f4f5c15b885f9e7e53ee7e1c91ecc0f0' }, h("app-form-item", { key: 'a254761b43c84d4acbf99df9c33bb162e15a8e30', "label-tag": "nx-cost", "label-text": "Nitrox Cost", appendText: " (unit/" +
                    (DiveToolsService.isMetric() ? "m3" : "cuft") +
                    ")", value: this.nxCost, name: "nxCost", "input-type": "number", onFormItemChanged: (ev) => this.updateCosts(ev) })), h("ion-col", { key: '92d00def673d31053f0cdb46c6db385167ce2210' }, h("app-form-item", { key: 'd0e6381740349a0abbaf43dabfcd5aced1eb7339', "label-tag": "tmx-cost", "label-text": "Trimix Cost", appendText: " (unit/" +
                    (DiveToolsService.isMetric() ? "m3" : "cuft") +
                    ")", value: this.tmxCost, name: "tmxCost", "input-type": "number", onFormItemChanged: (ev) => this.updateCosts(ev) })), h("ion-col", { key: 'c470b6305a96d83f7df6efb96a966fba3d229da0' }, h("app-form-item", { key: '67fa738aff09ac826f16e962e09e1d376e42f733', "label-tag": "fill-cost", "label-text": "Filling Cost", appendText: " (unit)", value: this.chargeCost, name: "chargeCost", "input-type": "number", onFormItemChanged: (ev) => this.updateCosts(ev) }))), h("ion-row", { key: 'f14a195440ffce8ddc4d4c6f4573b4202103fc9b' }, h("ion-col", { key: '2dcbeda3d68864c0b34dfee860c710b50d6af5cc' }, h("ion-item", { key: 'bdcb4509c44c63d0ee82a3230f66fdba31e68bfc' }, h("ion-grid", { key: '7e071cce48221ed7bc83b6969657ffd016222faa' }, h("ion-row", { key: 'e4cb02d9ba6e22bd315e40b9f656d28385f132c7' }, h("ion-col", { key: 'fb4260cbe7dcb7a39515b3fda0b1bd02d1069e72' }, h("ion-row", { key: '2413bcf74d33a455c9dbdf9def01eb0411fc7a1e' }, h("my-transl", { key: '11c5e09e23b55c97f4d8427475022281b00491d3', tag: "partial-pressure-blending", text: "Partial Pressure Blending" })), this.ppCost.o2.volume > 0 ? (h("ion-row", null, h("ion-note", null, "O2: ", this.ppCost.o2.volume, this.volumeUnit, " / ", this.ppCost.o2.cost, "u"))) : undefined, this.ppCost.he.volume > 0 ? (h("ion-row", null, h("ion-note", null, "He: ", this.ppCost.he.volume, this.volumeUnit, " / ", this.ppCost.he.cost, "u"))) : undefined, this.ppCost.tmx.volume > 0 ? (h("ion-row", null, h("ion-note", null, "Tmx: ", this.ppCost.tmx.volume, this.volumeUnit, " / ", this.ppCost.tmx.cost, "u"))) : undefined, this.ppCost.nx.volume > 0 ? (h("ion-row", null, h("ion-note", null, "Nx: ", this.ppCost.nx.volume, this.volumeUnit, " / ", this.ppCost.nx.cost, "u"))) : undefined), h("ion-col", { key: '063584339651ebd8d59af040fec3dc2212a9370e', size: "4" }, this.ppCost.totCost, "u")))), h("ion-item", { key: '899f028496ae00d3719578259049af2ca2dacd6d' }, h("ion-grid", { key: 'c416b67c4fe7077ce6daa7c665ed0b9b540c546a' }, h("ion-row", { key: 'c48de37ee9d5ec31e8a5574a4811f59badda77d5' }, h("ion-col", { key: 'f48cecb05b188ba314686b8ccecdb7d488a0747f' }, h("ion-row", { key: '389885c83c591f5918b7b9dbd938646bce9de3e3' }, h("my-transl", { key: '67d8ecf4142f47bdaa3c32888b626879e5384f11', tag: "cont-nx-blending", text: "Continuous Nitrox Blending" })), this.nbCost.he.volume > 0 ? (h("ion-row", null, h("ion-note", null, "He: ", this.nbCost.he.volume, this.volumeUnit, " / ", this.nbCost.he.cost, "u"))) : undefined, this.nbCost.nx.volume > 0 ? (h("ion-row", null, h("ion-note", null, "Nx: ", this.nbCost.nx.volume, this.volumeUnit, " / ", this.nbCost.nx.cost, "u"))) : undefined), h("ion-col", { key: '79ae209639e27ab4df1e3de35a74201e87059038', size: "4" }, this.nbCost.totCost, "u")))), h("ion-item", { key: 'eddb3ef9936412d61dcadd03ba9c1a8bc63f2747' }, h("ion-grid", { key: '737fec125ae108cfeea8da380695ba588b722ba9' }, h("ion-row", { key: 'e45d227ddd2f266cd2fe2486845c1fd8cb19d7c3' }, h("ion-col", { key: 'ea6c334b5e7387b7f6b59722ad812f139c9ff5e5' }, h("ion-row", { key: '6ac5ca07cc9a3c1bffd4b63146ab7292107e57f4' }, h("my-transl", { key: '1f9f3b02d91ab3c9644dd591e73fee769af7518f', tag: "cont-tmx-blending", text: "Continuous Trimix Blending" })), this.tbCost.tmx.volume > 0 ? (h("ion-row", null, h("ion-note", null, "Tmx: ", this.tbCost.tmx.volume, this.volumeUnit, " / ", this.tbCost.tmx.cost, "u"))) : undefined), h("ion-col", { key: 'e17ff9ef8abba426695734d59e1a38200c7ce3ab', size: "4" }, this.tbCost.totCost, "u")))))))), h("swiper-slide", { key: '7f22b1600546281d26b905606a4704a73fbfba10', class: "swiper-slide" }, h("ion-list", { key: '3fd5326881365cb08d94459f0a0874b7931efa05', class: "ion-text-wrap" }, h("ion-item", { key: '0b16de136ef671b3217e0dc1b331e0048d098a2d', color: "white" }, h("ion-grid", { key: '33f80efe3039346bab036c38285ba67c81a8868b', class: "ion-text-center" }, h("ion-row", { key: 'da3c42d41bc92611ce14a84f6e3ac54a1182392f' }, h("ion-col", { key: '16a8b4a495c95dd4fda22c616d9a067c58d069eb', style: { marginTop: "5px" } }, h("b", { key: '74e301468f9431c823f0eab7ae44169aabb25606' }, DiveToolsService.isMetric() ? "Bar" : "Psi")), h("ion-col", { key: '0026771306cd53324f68b079de1754146c0fe78e', style: { marginTop: "5px" } }, h("b", { key: 'f0e3c9713ced162fad56f2c184f4436c97d1a724' }, "O", h("sub", { key: 'fdb3078b8d0949c59f630a2709f4019505c4aeab' }, "2"))), h("ion-col", { key: '7dc854fce1f4c971123ca1f3d604e21fa20295df', style: { marginTop: "5px" } }, h("b", { key: '335b0e0c11f649ed9be215f4ce75fd6860525a32' }, "He")), h("ion-col", { key: '82eb7e9387e007209f6fad0e1e16071aeb23245a', style: { marginTop: "5px" } }, h("b", { key: 'aeb549f970bc161e287faeed64f4967bac0501e6' }, "\u00B0", DiveToolsService.isMetric() ? "C" : "F"))))), h("ion-item-divider", { key: 'c5e231c1858c840e8855fb162378420999b1712a', color: "white", class: "ion-text-center" }, h("my-transl", { key: '76097642c2bafcc169d280c01bea91695f8170f1', tag: "topup-gas", text: "Top-Up Gas", isLabel: true })), h("ion-item", { key: 'd431170be27ce776b9ba53d0b9f0cc818504773d' }, h("ion-grid", { key: '732a8fe27586c93c47f70cd3d80a35655ec9e9f6', class: "ion-text-center" }, h("ion-row", { key: '8fa16d0600ff871dd8b3764f7ead9f2f1adec5c8' }, h("ion-col", { key: '502777c2a85842a41c609dac84f73950be832b31', onClick: ($event) => this.presentPopover($event, "topup1", false) }), h("ion-col", { key: '83fdd0c8fd322ca45e29f30ae065d1d2a74e6091', onClick: ($event) => this.presentPopover($event, "topup1", false) }, lodash.exports.round(this.topup1.getFO2() * 100, 0)), h("ion-col", { key: '39d80eb08616ee59a54dc8e386d22a4ead381587', onClick: ($event) => this.presentPopover($event, "topup1", false) }, lodash.exports.round(this.topup1.getFHe() * 100, 0)), h("ion-col", { key: '71490a607eb0d9c896730cf4ad3c66957f53e8e2', onClick: ($event) => this.presentPopover($event, "topup1", false) }, this.topup1.getTemperature())))), h("ion-item-divider", { key: '0d67577b27768029aa83e356f0eb80065789546b', color: "white", class: "ion-text-center" }, h("my-transl", { key: 'b1e1089393bc08b6af6d8b030590dceddd51a56a', tag: "start-tank", text: "Start Tank" })), h("ion-item", { key: '94e47f9cfdf9c6309c7bb6302d9d0b993e7aa24e' }, h("ion-grid", { key: '737aa76d603dbbcd0a296a2c5b1f68cc011ee88d', class: "ion-text-center" }, h("ion-row", { key: '5157b2e2f9963a28605620380688be2cd837b1bd' }, h("ion-col", { key: '47eec004a1c969c0f9f63228b862614ccfbf7c5d', onClick: ($event) => this.presentPopover($event, "start") }, this.start.getPressure()), h("ion-col", { key: 'ae23577ae4454f56816558025f9455b443919a6c', onClick: ($event) => this.presentPopover($event, "start") }, lodash.exports.round(this.start.getFO2() * 100, 0)), h("ion-col", { key: '979bd39d5fbecc99e93e8aea09f63dd31155c2f3', onClick: ($event) => this.presentPopover($event, "start") }, lodash.exports.round(this.start.getFHe() * 100, 0)), h("ion-col", { key: 'bba89499cc02502fde2f70ec0660203de614beab', onClick: ($event) => this.presentPopover($event, "start") }, this.start.getTemperature())))), h("ion-item-divider", { key: 'bfdee0e8b9ebf1d843b9e9d14d7dad0145bf6221', color: "white", class: "ion-text-center" }, h("my-transl", { key: '07801f72065fbbe492b45a037c9e2d212ccb9c77', tag: "end-tank", text: "End Tank" })), h("ion-item", { key: '39fe3a0407b446bbcdd1c23df1b4aaad4a9b5e70' }, h("ion-grid", { key: 'b4b1e4f6d2a33fa0870d94168c0f8facdf66287e', class: "ion-text-center" }, h("ion-row", { key: '20cfc8376346726d397dc45ba98d5a37d47d1956' }, h("ion-col", { key: 'd0d9d7586b4e2dfcfe759beba7d89c23725879bb' }, h("app-form-item", { key: '1fa432537a199ca067a8cdda4b2b602111884f19', value: this.end_topup_pres.toString(), name: "end_topup", "input-type": "number", onFormItemChanged: (ev) => this.updateTopup(ev) })), h("ion-col", { key: '48049ee21f8ab50df0308f9d1761eb24a440aacb', style: {
                    marginTop: "18px",
                } }, this.end_topup.mMix.getO2()), h("ion-col", { key: '4897d8ef0ba851601fe81c9611f304c240d33488', style: {
                    marginTop: "18px",
                } }, this.end_topup.mMix.getHe()), h("ion-col", { key: '0e96e5d88fd0ed7f565a5efa2c51f799d09af718', style: {
                    marginTop: "18px",
                } }, this.end_topup.getTemperature()))))))))),
        ];
    }
    get el() { return getElement(this); }
};
PageGasBlender.style = pageGasBlenderCss;

export { PageGasBlender as page_gas_blender };

//# sourceMappingURL=page-gas-blender.entry.js.map