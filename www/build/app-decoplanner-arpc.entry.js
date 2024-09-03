import { r as registerInstance, l as createEvent, h } from './index-d515af00.js';
import './index-be90eba5.js';
import { E as Environment } from './env-9be68260.js';
import { D as DatabaseService, aX as ARPCModel, T as TranslationService } from './utils-cbf49763.js';
import { l as lodash } from './lodash-68d560b6.js';
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
import './map-dae4acde.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';
import './framework-delegate-779ab78c.js';

const appDecoplannerArpcCss = "app-decoplanner-arpc .cell-note{display:flex;justify-content:end;padding:0 20px 0 0}app-decoplanner-arpc .red-color{color:red;font-weight:bold}";

const CELLDATE = "CCR-cell-date";
const AppDecoplannerArpc = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.saveArpc = createEvent(this, "saveArpc", 7);
        this.cellCheckResult = [false, false, false];
        this.diveDataToShare = undefined;
        this.planner = false;
        this.updateView = true;
    }
    async componentWillLoad() {
        const dive = this.diveDataToShare.divePlan.dives[this.diveDataToShare.index];
        const localCellDate = await DatabaseService.getLocalDocument(CELLDATE);
        const cellDate = dive.arpc ? dive.arpc.cellDate : localCellDate;
        this.arpc = dive.arpc ? dive.arpc : new ARPCModel();
        if (!localCellDate)
            this.saveLocalCells();
        cellDate ? (this.arpc.cellDate = cellDate) : undefined;
    }
    approveARPC() {
        this.arpc.checkApproved();
        this.saveArpc.emit(this.arpc);
        this.updateView = !this.updateView;
    }
    inputHandler(event) {
        const name = event.detail.name.split(".");
        const value = event.detail.value;
        if (name.length > 1) {
            if (name[0] == "cellDate") {
                this.arpc[name[0]][name[1]] = value;
                this.saveLocalCells();
            }
            else {
                this.arpc[name[0]][name[1]] = value;
            }
        }
        else {
            this.arpc[name[0]] = value;
        }
        this.approveARPC();
    }
    saveLocalCells() {
        DatabaseService.saveLocalDocument(CELLDATE, this.arpc.cellDate);
    }
    updateParam(param, ev) {
        this.arpc[param] = ev.detail.checked;
        this.approveARPC();
    }
    cellCheck(cellNumber) {
        this.cellCheckResult[cellNumber] = this.arpc.checkCellDate(cellNumber);
        this.approveARPC();
    }
    async checkO2CellmV(cellNum) {
        let difference = this.arpc.airmVRange[cellNum] * 4.76 - this.arpc.o2mVRange[cellNum];
        let showAlert = false, message = "";
        if (difference < -2) {
            showAlert = true;
            message = TranslationService.getTransl("cell-mv-high", "mV reading high! Please check if the loop is open!");
        }
        else if (difference > 2) {
            showAlert = true;
            message = TranslationService.getTransl("cell-mv-low", "mV reading low! Please check O2 supply (valve open, pressure, pinched hose, not analyzed)!");
        }
        let confirm = await alertController.create({
            header: TranslationService.getTransl("error", "Error"),
            message: message,
            buttons: [
                {
                    text: TranslationService.getTransl("cancel", "Cancel"),
                    handler: () => { },
                },
                {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: () => { },
                },
            ],
        });
        if (showAlert)
            confirm.present();
        this.approveARPC();
    }
    render() {
        return (h("div", { key: 'fc1f7e2d560bb67c5f839fc07e92146f9acabbe5', class: "ion-no-padding" }, h("ion-item-divider", { key: 'c7f752fa06a2249c4f5c427bb365361f10878a72' }, h("ion-label", { key: '3f7dda885e26d1cd0c42275f34c4e327e4f28786' }, h("h2", { key: '557be80dc895ace9bccb4c4acc1ddfeb6b7e6de0' }, h("my-transl", { key: '784448ea9c6ae8dbf4551a17c7e81ef4a935daf6', tag: "arpc", text: "ADVANCED REBREATHER PREPARATION CHECKS" })))), h("ion-row", { key: '145db38109427b4e84cb5b34df6c72e9a1ab4c74' }, h("ion-col", { key: 'edb56315c591158129982caa8cc1c2f3cb205494' }, h("ion-item-divider", { key: 'af75b0928e72c5a1be10fb5d0561cce77182e6a6' }, h("ion-label", { key: '29b81c4220394e747efca77a21cbafb531d523bc' }, h("my-transl", { key: 'f113f7375800bfd17239bcda47248bb935586966', tag: "lid-preparation", text: "LID AND CONTROLLER PREPARATION" }))), h("ion-item", { key: '4855e637d97740b9fca6c9753cfd862435f1ee25' }, h("ion-grid", { key: '4be1c5ba47748be72bac9bfd188b8936e8ac9464', "no-padding": true }, h("ion-row", { key: '5814c56d5a53db74b2c23c204108a03e0a0780be' }, h("ion-col", { key: '9f9840351b04445875103273f87ed77b6d99d91a' }, h("my-transl", { key: '8da25b3d219b8f1f779b1579e1ba65991a90d826', tag: "o2-cell-1year", text: "O2 Cells <1 year" }))), h("ion-row", { key: '3d5176945b073d0428817d991381213f08f5626a' }, h("ion-col", { key: '7c928ce2295ee372eb28f4a6e9fdb9a69c4cf007', size: "4" }, h("my-transl", { key: '4939eecfea2f664de92aae7f2eb0d0e21bfe0fa2', tag: "cell", text: "Cell", "append-text": " #1" })), h("ion-col", { key: 'afd10c52d8890a2f1a3e339bb7437a9e6a5d2f06', size: "4" }, h("my-transl", { key: '7e2dafb0a29e358d693bfe046bfaa7288b09ad68', tag: "cell", text: "Cell", "append-text": " #2" })), h("ion-col", { key: 'deb94c59073bf17763515f51da6d3f1cf295a370', size: "4" }, h("my-transl", { key: '2aa88e22a153457ddc31089aa4666541f7b5175a', tag: "cell", text: "Cell", "append-text": " #3" }))), h("ion-row", { key: '198b2145da8aa8a56aed98fef5d850c67766e6e8' }, h("ion-col", { key: '8fea53fedcbebbcb1a9c03baa3a04e33de3467f8', size: "4" }, h("app-form-item", { key: 'ca176c3cd3c5e6b9bffc75dddbf1a7fd17a2f2d4', value: this.arpc.cellDate[0], name: "cellDate.0", "input-type": "date", "date-presentation": "month-year", onFormItemChanged: (ev) => this.inputHandler(ev), maxDate: new Date().getFullYear() +
                "-" +
                (new Date().getMonth() + 1) })), h("ion-col", { key: '8b5e254fc5de2ca38d78f5f0ac1790fd1d9f5fe1', size: "4" }, h("app-form-item", { key: '5ae38576cc5217063a1f0fdcbe710c1551decd16', value: this.arpc.cellDate[1], name: "cellDate.1", "input-type": "date", "date-presentation": "month-year", onFormItemChanged: (ev) => this.inputHandler(ev), maxDate: new Date().getFullYear() +
                "-" +
                (new Date().getMonth() + 1) })), h("ion-col", { key: '757b0af05ecec4f368b0ef55c6e86c05a5b6a01c', size: "4" }, h("app-form-item", { key: '93e3eb1c82685ecf50512150ee2103bda1ccb5b2', value: this.arpc.cellDate[2], name: "cellDate.2", "input-type": "date", "date-presentation": "month-year", onFormItemChanged: (ev) => this.inputHandler(ev), maxDate: new Date().getFullYear() +
                "-" +
                (new Date().getMonth() + 1) }))))), h("ion-item", { key: 'eb9aa364226ba7fe52baad7ce6047577d7446388' }, h("ion-grid", { key: 'b77876d51ebd0bd18a6630682c32c716085b6e24', "no-padding": true }, h("ion-row", { key: '31c97c7da810c768a4db3a26811b2c5968edb583' }, h("ion-col", { key: '131ca9caaa5017091f668cb39ed101e6e250f9b8' }, h("my-transl", { key: 'b4686473064087e03ef0de4b627f331802caa4dd', tag: "air-mv-range", text: "Air mV Range" }), " (9-13mV)")), h("ion-row", { key: '6eb01e72c58909d0cea7f7e175d08a70272b2aae' }, h("ion-col", { key: '94a8dc7bf8463a798fd20c86fc7f7876371b93b0', size: "4" }, h("app-form-item", { key: '7994cd87498788c066759dd597bbccaa7750777e', "label-tag": "cell", "label-text": "Cell", appendText: " #1", value: this.arpc.airmVRange[0], name: "airmVRange.0", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), validator: [
                {
                    name: "minmaxvalue",
                    options: { min: 9, max: 13 },
                },
            ] })), h("ion-col", { key: '2e50bc44471ccc0e07a02d5253ae2d61edcc58cb', size: "4" }, h("app-form-item", { key: '0ec18c158d7cb28d14cfcd3b449646e023ed326e', "label-tag": "cell", "label-text": "Cell", appendText: " #2", value: this.arpc.airmVRange[1], name: "airmVRange.1", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), validator: [
                {
                    name: "minmaxvalue",
                    options: { min: 9, max: 13 },
                },
            ] })), h("ion-col", { key: 'e0224910c4debad20f2602cfe761b5b3cb44fb9e', size: "4" }, h("app-form-item", { key: '682223c400296e28131484854f388cf7fe28cce8', "label-tag": "cell", "label-text": "Cell", appendText: " #3", value: this.arpc.airmVRange[2], name: "airmVRange.2", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), validator: [
                {
                    name: "minmaxvalue",
                    options: { min: 9, max: 13 },
                },
            ] }))))), h("ion-item", { key: '20271263878528bfeb2d723816a76337acdbb6a9' }, h("ion-label", { key: 'da1ec8720835789daab4f93b72788ce303e8c774' }, h("my-transl", { key: 'f1aaf93bedf9aa429e6a0cd30e9f05bca9c5973a', tag: "hud-batt-ok", text: "HUD Batt (red 30sec=Low)" })), h("ion-toggle", { key: '460120a27df5a05720a699bb1132fae3f2f8afd7', color: Environment.getAppColor(), onIonChange: (ev) => this.updateParam("battHUD", ev), checked: this.arpc.battHUD })), h("app-form-item", { key: '3c65c9dd423bbcd6747ab9e01549ad83a30c0eba', "label-tag": "int-batt-ok", "label-text": "INT. Batt (>3.28/1.3V)", labelPosition: "fixed", value: this.arpc.battINT, name: "battINT", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev) }), h("app-form-item", { key: 'bd74c7645cf9c3dceec39318f7aea1757f3339c8', "label-tag": "ext-batt-ok", "label-text": "EXT. Batt (>6.6/8.4V)", labelPosition: "fixed", value: this.arpc.battEXT, name: "battEXT", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev) }), h("ion-item", { key: '3809098590bd78f9113d4893d5f11754e0bf3a58' }, h("ion-label", { key: 'eb4a4cbb8d941fa45c72e39d07e7c0281be21dd8' }, h("my-transl", { key: '7894de6667b4ea4931ff004896a85a7422582b83', tag: "ctrl-setpoints-ok", text: "Ctrl Setpoints, Settings, Gases" })), h("ion-toggle", { key: '13d7d9864ef3e7ad336d36c6d634df60e0d54ee8', color: Environment.getAppColor(), onIonChange: (ev) => this.updateParam("settingsDone", ev), checked: this.arpc.settingsDone })), h("ion-item-divider", { key: '8cf8ddb2060651b3c227007f7ae5b395bcc672b2' }, h("my-transl", { key: '43a9061ae40978a93f32dabe861bf26ced190c20', tag: "scrubber-preparation", text: "SCRUBBER PREPARATION" })), h("app-form-item", { key: '0f7dbbc357d6a27b57e3c500deec709b0ddb556c', "label-tag": "ace-180min", "label-text": "Absorbent Canister Endurance (ACE) (180min nominal)", labelPosition: "fixed", value: this.arpc.scrubberTime, name: "scrubberTime", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), validator: [
                {
                    name: "minmaxvalue",
                    options: { min: 60, max: 300 },
                },
            ] }), h("ion-item", { key: '3aebd343284c0c72d85de16edc92648d6662cc36' }, h("ion-label", { key: '773907c8c5268326f252bb8d660cbc9b77334bcd' }, h("my-transl", { key: 'faa7c29949f035c93a1933edc7617e41e78bf98e', tag: "lid-checks", text: "Lid and Lid O-Ring Checks" })), h("ion-toggle", { key: '67ef15b2147815b023e101eda69dc19f242aa8f7', color: Environment.getAppColor(), onIonChange: (ev) => this.updateParam("lidCheck", ev), checked: this.arpc.lidCheck })), h("ion-item", { key: '53210e0d4c388927b8d796e62a387fb375992197' }, h("ion-label", { key: 'f495ae68803dbfe1f16484512124de236d9fb3ce' }, h("my-transl", { key: '896bef2c557fbc4d35aebb17469953d65d3c82d7', tag: "loop-checks", text: "Loop Valves Checks" })), h("ion-toggle", { key: '5c2bae2b0d2eb1742273b5593e2f2deffa64b3d0', color: Environment.getAppColor(), onIonChange: (ev) => this.updateParam("loopCheck", ev), checked: this.arpc.loopCheck })), h("ion-item", { key: 'c369b192c89f7c3b843f6fa4a72aa89648093fcb' }, h("ion-label", { key: '1e3ad1480d58a43b7cd08403a6a97c0a3e84471d' }, h("my-transl", { key: '4caa541db81c6abd7fed7ab26a337f66d3c2813e', tag: "negative-pressure-test", text: "Negative Pressure Test" })), h("ion-toggle", { key: 'a2ee615d954f8eb735300070ef435a5934f1636e', color: Environment.getAppColor(), onIonChange: (ev) => this.updateParam("negativePressCheck", ev), checked: this.arpc.negativePressCheck })), h("ion-item", { key: '09c2c0ed87d393f1bd5197da4460dd33b296f1c3' }, h("ion-label", { key: 'ee3b28d978ad9f4b809d5848ba37c8bc38249d76' }, h("my-transl", { key: 'aaa9eb0911e51a80a75e4b60f6b44e3f001aa379', tag: "o2-pressure-test", text: "O2 SPG Pressure Test" })), h("ion-toggle", { key: '2b344fd101aede328803ba128a7b464346b62e42', color: Environment.getAppColor(), onIonChange: (ev) => this.updateParam("o2LeakTest", ev), checked: this.arpc.o2LeakTest })), h("ion-item", { key: '1978b2e6d3cd7be7b72470c1f7078549a0848f77' }, h("ion-label", { key: 'c3050f40303d25af2767c7af47ac7b524c11e52a' }, h("my-transl", { key: '0276ca5b88abc7ac3c4bdb92650c25c69ab85a46', tag: "positive-pressure-test", text: "Positive Pressure Test" })), h("ion-toggle", { key: '12f689ff4036c77a4039da64944896e74a32bc5e', color: Environment.getAppColor(), onIonChange: (ev) => this.updateParam("positivePressCheck", ev), checked: this.arpc.positivePressCheck })), h("ion-item", { key: 'fce2214ac5cf39edaa0d3a448db415b0b64b4749' }, h("ion-label", { key: '558f831da862205d142695a28acf6a14c839c4fc' }, h("my-transl", { key: 'fb21b21f96a35e58f3c0abcd8031c8116c3c4b28', tag: "diluent-pressure-test", text: "Diluent SPG Pressure Test" })), h("ion-toggle", { key: 'c82479989b55c19f81f8d83eb5ef2b4a77ffcf7d', color: Environment.getAppColor(), onIonChange: (ev) => this.updateParam("diluentLeakTest", ev), checked: this.arpc.diluentLeakTest })), h("ion-item-divider", { key: '90e22b8e402ef6d95b87317a71a1515c75b0e1fe', class: "lightgrey" }, h("my-transl", { key: '5b674598868ca2e897ded94513a8392ccc5b9e04', tag: "calibration", text: "CALIBRATION" })), h("ion-item", { key: '2fc3b108cda287a06bb393371afb8fb52b39bd75' }, h("ion-label", { key: '9db7ba118cbbcc1c36c1e90492fcaf58ae459b1a' }, h("my-transl", { key: '0f8d76dd0f11e5ec1b7e009c3c53186e1d28d48c', tag: "open-o2-valve", text: "Open O2 Valve" })), h("ion-toggle", { key: 'e0de2bb38633f3296baf61085d037c643fed67bc', color: Environment.getAppColor(), onIonChange: (ev) => this.updateParam("openO2Valve", ev), checked: this.arpc.openO2Valve })), h("ion-item", { key: '41c0a2e963321a5769868474ab7361c730dfe925' }, h("ion-label", { key: 'a8bbcec199294876480836a408c2441f08db1e43' }, h("my-transl", { key: 'ccce3da9c2c1f46fd89f164f46a422e972471a4f', tag: "loop-in-cc", text: "Loop in CC mode" })), h("ion-toggle", { key: '3632fbd1ca71dbde358709f7b396e622bc425419', color: Environment.getAppColor(), onIonChange: (ev) => this.updateParam("loopInCC", ev), checked: this.arpc.loopInCC })), h("ion-item", { key: '62df96a3d43ce07a3cee17019352d03d44fbddef' }, h("ion-label", { key: '18bc0d22617a9701b6a5e962046ee831b89b3747' }, h("my-transl", { key: '19a7750acea60744daa22220f0248d08d0ad8657', tag: "hud-on", text: "Turn HUD on" })), h("ion-toggle", { key: '09db03e1de04bdc02dcc89236cdd12d735ce5bdb', color: Environment.getAppColor(), onIonChange: (ev) => this.updateParam("hudOn", ev), checked: this.arpc.hudOn })), h("ion-item", { key: 'bd302f44f29089eefe03127fda913297c062062d' }, h("ion-label", { key: '457e60086ab53c26e1c70c8123dfda56ea70d53a' }, h("my-transl", { key: '9d601eec3bc93db4359a5e0b2a4189d70c31a703', tag: "calibrate-controller", text: "Calibrate Controller" })), h("ion-toggle", { key: '6d37b11ffde1c59f8c8a2adf5e94ae99f2810900', color: Environment.getAppColor(), onIonChange: (ev) => this.updateParam("calController", ev), checked: this.arpc.calController })), h("ion-item", { key: '969be92c154d8ecda5a732074e4cd6a33eca57b7' }, h("ion-label", { key: 'bf78696fa830b37eb5a76288c3791ecff44743fd' }, h("my-transl", { key: '9abbf8849aacdea88b26c5bd406895a3a3283b7b', tag: "calibrate-hud", text: "Calibrate HUD" })), h("ion-toggle", { key: 'bc0812ceb2dbb7443051152b09ca4533ac81bb41', color: Environment.getAppColor(), onIonChange: (ev) => this.updateParam("calHUD", ev), checked: this.arpc.calHUD })), h("ion-item", { key: 'fedc5a8b3f37ceb3c4c9dadf92b41d902cec8650' }, h("ion-grid", { key: 'e5be4a047c119b22fa53f0220be6511ccec88bcc', "no-padding": true }, h("ion-row", { key: '0ef0e7e120452c63029fccc5102169fb346894ac' }, h("ion-col", { key: '47aea1c45bdc08a9e8a53963e465dc7dab1bbf5c' }, h("my-transl", { key: '5f1778fa43b5ccf23e5972eefe4da9229fb08079', tag: "o2-cal-mv", text: "O2 Calibration mV" }))), h("ion-row", { key: '6c8bdcea582e2d8ecd29f44fef1ca420891f2ad1' }, h("ion-col", { key: '2bbcbd5f3e12de974f8d0c4d08b763778920718a', size: "4" }, h("app-form-item", { key: '0f6d0e62f61481d1ee40cf1f126f213615e0e7ab', "label-tag": "cell", "label-text": "Cell", appendText: " #1", value: this.arpc.o2mVRange[0], name: "o2mVRange.0", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev) })), h("ion-col", { key: '38afadb101ac8061d74ad00c7a172141ea2d3f36', size: "4" }, h("app-form-item", { key: '8b8d7f161e04790e54823db11c430de961289134', "label-tag": "cell", "label-text": "Cell", appendText: " #2", value: this.arpc.o2mVRange[1], name: "o2mVRange.1", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev) })), h("ion-col", { key: '3694cb3a68979a88a67e4f7a620ebba8642c5302', size: "4" }, h("app-form-item", { key: '2490d11703ecb72eb0652465b1d6a72f8cc68b03', "label-tag": "cell", "label-text": "Cell", appendText: " #3", value: this.arpc.o2mVRange[2], name: "o2mVRange.2", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev) }))), h("ion-row", { key: 'd05d3fe83d1da0200dfb3d11126e7f5491258bd5' }, h("ion-col", { key: '963db7d43ea0216e08bc50152f8f4a1418d230e6', size: "4" }, h("ion-note", { key: '3ae923141734f581d8752bdfb2218040a557f659', "no-lines": true, "no-padding": true, "no-margin": true, class: "cell-note " +
                (lodash.exports.round(((this.arpc.o2mVRange[0] -
                    this.arpc.airmVRange[0] * 4.76) /
                    (this.arpc.airmVRange[0] * 4.76)) *
                    100, 2) < -10
                    ? "red-color"
                    : "") }, lodash.exports.round(this.arpc.airmVRange[0] * 4.76, 2), " (", lodash.exports.round(((this.arpc.o2mVRange[0] -
            this.arpc.airmVRange[0] * 4.76) /
            (this.arpc.airmVRange[0] * 4.76)) *
            100, 2), "%)")), h("ion-col", { key: 'b7020f68dc24dc12e83e145cf8c0876ff13093b8', size: "4" }, h("ion-note", { key: '3a182b57eb35d7eb0a8fde1b3f4b8eccdd526d3d', "no-lines": true, "no-padding": true, "no-margin": true, class: "cell-note " +
                (lodash.exports.round(((this.arpc.o2mVRange[1] -
                    this.arpc.airmVRange[1] * 4.76) /
                    (this.arpc.airmVRange[1] * 4.76)) *
                    100, 2) < -10
                    ? "red-color"
                    : "") }, lodash.exports.round(this.arpc.airmVRange[1] * 4.76, 2), " (", lodash.exports.round(((this.arpc.o2mVRange[1] -
            this.arpc.airmVRange[1] * 4.76) /
            (this.arpc.airmVRange[1] * 4.76)) *
            100, 2), "%)")), h("ion-col", { key: '5bc93491ddba07411e942a165aa8c9b2919e3808', size: "4" }, h("ion-note", { key: '0f99093e322e73b346d3ff2f457d6bd497b66516', "no-lines": true, "no-padding": true, "no-margin": true, class: "cell-note " +
                (lodash.exports.round(((this.arpc.o2mVRange[2] -
                    this.arpc.airmVRange[2] * 4.76) /
                    (this.arpc.airmVRange[2] * 4.76)) *
                    100, 2) < -10
                    ? "red-color"
                    : "") }, lodash.exports.round(this.arpc.airmVRange[2] * 4.76, 2), " (", lodash.exports.round(((this.arpc.o2mVRange[2] -
            this.arpc.airmVRange[2] * 4.76) /
            (this.arpc.airmVRange[2] * 4.76)) *
            100, 2), "%)"))))), h("ion-item-divider", { key: '981f621085e58ed85733354199231485a6ec79ca', color: "white", class: "lightgrey" }, h("my-transl", { key: '9e65a1034f01fc5df82fd4a682a3e7681f41f74e', tag: "gas-pressure-status", text: "GAS PRESSURE STATUS" })), h("app-form-item", { key: '2dbd0be1cb7b634070a7f99fd1f73e73030093f1', "label-tag": "o2-ip", "label-text": "O2 IP", appendText: " (7-7.5bar)", labelPosition: "fixed", value: this.arpc.o2IP, name: "o2IP", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), validator: [
                {
                    name: "minmaxvalue",
                    options: { min: 6.5, max: 8 },
                },
            ] }), h("app-form-item", { key: '9f778783e8a5cc8050bd0de018a75a44afdd7ee7', "label-tag": "diluent-ip", "label-text": "Diluent IP", appendText: " (9-10bar)", labelPosition: "fixed", value: this.arpc.dilIP, name: "dilIP", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev), validator: [
                {
                    name: "minmaxvalue",
                    options: { min: 8.5, max: 10.5 },
                },
            ] }), h("app-form-item", { key: '7d8d31a369eeafffed52809a253dbecaa8ba2bd8', "label-tag": "bailout-reserve", "label-text": "Bailout-Reserve", labelPosition: "fixed", value: this.arpc.bailout, name: "bailout", "input-type": "number", onFormItemChanged: (ev) => this.inputHandler(ev) }))), h("ion-row", { key: 'fd92c15ef475666a856f880ed286df9095f513fa' }, h("ion-col", { key: '6beeaf06599028e02a087ae85b534407a6259680' }, h("div", { key: '7ce17126803abd13709095f302b6959af3f59c6a', "text-justify": true }, h("h4", { key: '06018bb6235398a6b4663b7dc7b77383a78228c2' }, "CHAOS (Critical Control Checks conducted during the Pre-Breathe)"), h("p", { key: 'a740ae5abdf2f1f05cb870d5eb04cffb196b878e' }, "During the CHAOS prebreathe, a number of Critical Control Checks (CCC) are conducted."), h("ul", { key: '1d2df0241dc28ec208353cd4714b31d5336563bc' }, h("li", { key: '39eba69693c7451753123825a815ba6e776fbf22' }, "CONTROLLER", h("ul", { key: '5eef422a74995c7f7d279061f5199956288a6302' }, h("li", { key: '9b458fd8c0164fee8b348029e564622f46acb337' }, "Controller operation and display"), h("li", { key: 'd235327828770c7c81af65a325bbac56768153d6' }, "Oxygen sensor operation and pO2 readings"), h("li", { key: '587635f2da6b92dd4326df2531a6205ce46405e1' }, "Solenoid operation"), h("li", { key: '7bbe36da02f4de8ced8cd96bf81b3219c7c3043e' }, "Oxygen supply regulator operation"))), h("li", { key: 'd02b5b717c9d23543c3cbe8599847ab3a9c21cd8' }, "HUD", h("ul", { key: 'ef668deb744b9ee02a96e3ef22b2525cf8c64e8e' }, h("li", { key: '04d25e7d8b51576b0bd83e73e4e8b1ee26794eb7' }, "HUD display, operation and calibration accuracy"))), h("li", { key: 'fcee3d0297474ce856ab85f375b418946db87c38' }, "ADV", h("ul", { key: '849e2e8f04ba9a39f54a5fa89486928507c1934f' }, h("li", { key: '69e167a177b02066f744be1c44bde3f2e068630b' }, "Supply valve status"), h("li", { key: 'e1ec9ff889ed9e5cc5e189df0789b72c77994ee8' }, "ADV operation"), h("li", { key: 'd4668cb52002fc45b81bba6c486f2711d6e749cf' }, "OPV operation"), h("li", { key: '63eb60be408b065f1887176f5956acc53929b72a' }, "Oxygen sensor operation and pO2 readings"), h("li", { key: '87739eda51ecd78a59f9b13793363e64f36ad96d' }, "Solenoid operation"), h("li", { key: '54d96ea9ab3e0ce66edc39680de020b7d15f66e4' }, "Oxygen supply regulator operation"), h("li", { key: '5f86ea1bd1e97a81f0d87d1404b5c6328d9275c4' }, "Diluent supply pressure verification"))), h("li", { key: 'fee576836dbabc59c717b6639160071d92db31b6' }, "OXYGEN", h("ul", { key: '6c39e760d87f18dc5bf4ec8678171f20996187db' }, h("li", { key: '55c0004479ad58b219498df62df133c7b1cace79' }, "Supply valve status"), h("li", { key: 'e44d80876a047d3b633a93af3a1aefd0bc831ecd' }, "MAV operation"), h("li", { key: 'a66813dabd98b4f26d36d214ccf89cb0b8b1638e' }, "Oxygen sensor operation and pO2 readings"), h("li", { key: '5a0369e4ce3f8a47864b55986128e5d81ab8bab6' }, "Oxygen supply pressure verification"))), h("li", { key: '2d39ddd3b251274854d1e1bfc9c0bb17df246275' }, "SYSTEM", h("ul", { key: '579ef338b9ffbe7ce21931ae4051f4168aa20f59' }, h("li", { key: '90f0ae3971354f341919a394dd608c158dd3d720' }, "Controller operation and display"), h("li", { key: '672a27f28c4e809af8b2fd83db2f436c5ac66940' }, "Oxygen sensor operation and pO2 readings"), h("li", { key: '0ce4cdccc237d9038e52b73d1cd552e9928c9705' }, "Solenoid operation"), h("li", { key: '9a7a907a44211aef8c538bab9f37c948e839d371' }, "Oxygen supply regulator operation"), h("li", { key: '11d2b365635553ecddfdf58ac1225c922ce83326' }, "Sofnolime warmup"), h("li", { key: '5230ab4aad2dcdff2f98fcce0e39fa56413d37e0' }, "Scrubber operation (symptoms unlikely)"), h("li", { key: '584576abb71e64ddc67cbf67db0fbffd99d86df8' }, "Loop check valve operation")))), h("h6", { key: 'f4172facc4e59a16d1beb9e1c1002af55bda8f09' }, "C \u2013 Controller"), h("ul", { key: '7cc50606393afae3667a80b4328032afab279a09' }, h("li", { key: 'bf14c64446748b434b3a8e5a6333a225a04747c9' }, "pO2 stable \u00B1 0.7"), h("li", { key: 'c66ace976a4e8c4902b375b04c49da69ab0e1c83' }, "Setpoint switch \u21E8 1.2"), h("li", { key: '17adf5043fb0583d0131b992441e6e40279a2a85' }, "When pO2 increases, setpoint switch \u21E8 0.7")), h("h6", { key: '59ef99e5a4d35207a676c67a1d642ba90eecc07d' }, "H \u2013 HUD"), h("ul", { key: '92a36d617720491474b154f9d805da12ac60f203' }, h("li", { key: '39aaae98527764626ece10d3b966872fc62bcc6f' }, "Corresponds with CONTROLLER pO2\u2019s")), h("h6", { key: '0107397aaf2619110de813a8c456b3ab17570ac3' }, "A \u2013 ADV"), h("ul", { key: 'bde8dfb49ce6603cb4369f5d18c4c7249df50f9b' }, h("li", { key: '279004acb03894614129c963823e039ee22ae11d' }, "Flow check right post"), h("li", { key: '9774a90cad3cf9d3596af18532f34e15ac6c41e1' }, "Locate and keep counter lung OPV in open position using right hand"), h("li", { key: 'a8e86f89afb2781e01d821ae2c8c5f32f38dc6bb' }, "Purge the ADV for five seconds to flush using left hand. Stop purging."), h("li", { key: 'f2b795263f8229d1e75b20e0f53ce6ed3401ee85' }, "When pO2 back at setpoint, release counter lung OPV"), h("li", { key: '8aa1db8b63113ba11f7047fcbc6821f7254fe3c4' }, "Verify diluent pressure")), h("h6", { key: '1dae245f445d42c1e0d59fef70798b6974fbcdda' }, "O \u2013 OXYGEN"), h("ul", { key: '1a50f2f5c19e98b81321168463d7e7c23b9e6a97' }, h("li", { key: 'ad98c0c078027015f1742030522ff868a32579d3' }, "Flow check oxygen cylinder valve"), h("li", { key: 'e83e2052e78578f4cf2b0179f6e5d062fcc621ad' }, "Check oxygen pressure gauge"), h("li", { key: '3755ffc4b58e3acd57ae83ea5ea705d2ec633755' }, "Exhale loop volume through nose"), h("li", { key: 'c0f7f67c4b457aee034cf470c92421615d88e1d6' }, "Add O2 using MAV to compensate for volume exhaled"), h("li", { key: 'bff6e9a71223b24183cb6a8f0c27693c473196da' }, "Repeat three times"), h("li", { key: 'ebc71cec65c4034e870c932a0ddc40c63fec7e3b' }, "Note SPG pressure and pressure fluctuations")), h("h6", { key: '9a22f34fc9de5e822632f2023dc8633d495ca583' }, "S \u2013 SYSTEM STABILITY"), h("ul", { key: '1146418614908170b2f25683b726b71840a5984e' }, h("li", { key: '39e95362b3f83ad7f9d2a9e05affb83a1f304889' }, "Prebreathe the unit for 4 minutes"), h("li", { key: '44f5feef2bc9fa15681f5e90d8600cac997dbf52' }, "Observe system functions and operations"), h("li", { key: '0dab73f04c002dfcdafbf5c29b65ef095f7d2434' }, "Monitor for CO2 symptom onset (unlikely)")))))));
    }
};
AppDecoplannerArpc.style = appDecoplannerArpcCss;

export { AppDecoplannerArpc as app_decoplanner_arpc };

//# sourceMappingURL=app-decoplanner-arpc.entry.js.map