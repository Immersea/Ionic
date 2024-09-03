import { r as registerInstance, h } from './index-d515af00.js';
import { a5 as DecoplannerDive } from './utils-ced1e260.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-c3ad5e77.js';
import './index-be90eba5.js';
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
import './overlays-b3ceb97d.js';
import './framework-delegate-779ab78c.js';
import './map-fe092362.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';

const appDecoplannerShowplanCss = "app-decoplanner-showplan{width:100%}";

const AppDecoplannerShowPlan = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.diveDataToShare = undefined;
        this.planner = false;
        this.dive = new DecoplannerDive();
        this.updateView = true;
    }
    async componentWillLoad() {
        this.diveParamsUpdate();
    }
    diveParamsUpdate() {
        const params = this.diveDataToShare;
        this.divePlan = params.divePlan;
        this.diveSite = params.diveSite;
        this.diveConfiguration = this.divePlan.configuration;
        this.index = params.index;
        this.dive = this.divePlan.dives[this.index];
        this.parameters = this.diveConfiguration.parameters;
        this.user = params.user;
    }
    render() {
        return (h("div", { key: 'c69ae35c57a5d654d8783d4b8be929b391159f57', class: "ion-no-padding" }, h("ion-list", { key: '7dc90224cd398fff118cd15d116912fc61642087', class: "ion-text-wrap" }, h("ion-item-divider", { key: '4fba2011138960ca1bbab6d97d086f8f1a808c8c' }, h("ion-label", { key: '1e2f2d76663f17e3b16aa4ff643bd7c171089e5e' }, h("ion-text", { key: '972cd77c26237e8579fe78227086f802eaac569c', color: "dark" }, h("h2", { key: '8145211a65babad9bd600429dcdcbdfe7a277eeb' }, h("my-transl", { key: '90af90fce86c0c7a0d181cb4d41c2fea78ae783c', tag: "configuration", text: "Configuration" })))), h("ion-button", { key: '1bfb8cba274cec7535e8b18885182143cd6599d6', slot: "end", fill: "clear" }, this.diveConfiguration.stdName)), this.diveSite ? (h("ion-item-divider", null, h("ion-label", null, h("ion-text", { color: "dark" }, h("h2", null, h("my-transl", { tag: "dive-site", text: "Dive Site" })))), h("ion-button", { slot: "end", fill: "clear" }, this.diveSite.displayName))) : undefined, h("ion-item", { key: '188abb637ecb6f2264dfcf896d8b6d058d0a1eb5' }, h("ion-grid", { key: 'fc37498fc231f4bd802fe59cbae56093aabab65a', class: "ion-text-center" }, h("ion-row", { key: '65288de63b7077e0202a14685717892c442cfc1c', class: "ion-text-capitalize" }, h("ion-col", { key: '2ab5d1c0e2aa3525bbb9e278e6a877423621c0db' }, h("ion-text", { key: '192c8ecfeb571823161f220ea9d4237d16632fff', color: "dark" }, h("h6", { key: '32a7478e23b299b0ec4d5b2354bcbd68b8981d84' }, h("my-transl", { key: '938313a62707bed3d0eccae622b799b2dc9581c9', tag: "depth", text: "Depth" })))), h("ion-col", { key: '2c99ca98021b434dda3bd8ffccb1069739589936' }, h("ion-text", { key: 'd0f61679d31b203521e1591f8e0a5a35fe0cebbb', color: "dark" }, h("h6", { key: 'db0b3ba3d0fbc26aa67327fc3e8a15c9daa1892a' }, h("my-transl", { key: '8e678899e38fb139c7a44844223e36312ba57841', tag: "time", text: "Time" })))), h("ion-col", { key: '81ae44cea6d102e59f5d21143e6c8a8ee27ce59f' }, h("ion-text", { key: 'bbb6d78d6941d27ec240a23fd69d28e46204ab83', color: "dark" }, h("h6", { key: 'd3c47a42a19f1db0ac1f6ce7ff25467e6fd82d31' }, "O", h("sub", { key: 'b082b3ac022e2027ba7901a1a86f42d0c5883e62' }, "2")))), h("ion-col", { key: '81bf12523bbc84be2efdf9702ddbfcb85afd940b' }, h("ion-text", { key: '164d4154ef77baa27e918901af1c08dce022b313', color: "dark" }, h("h6", { key: 'd7f629234c8b8ba39df1fc363698e539c76e1489' }, "He"))), this.parameters.configuration == "CCR" ? (h("ion-col", null, h("ion-text", { color: "dark" }, h("h6", null, h("my-transl", { tag: "po2", text: "pO2" }))))) : undefined))), h("ion-item-group", { key: 'ad4f5392b7a8b0f1c017c5ff20d5ff1b5a4a30ab' }, this.dive.profilePoints.map((level) => (h("ion-item", null, h("ion-reorder", { slot: "end" }), h("ion-grid", { class: "ion-text-center" }, h("ion-row", null, h("ion-col", null, level.depth), h("ion-col", null, level.time), h("ion-col", null, level.gas.O2), h("ion-col", null, level.gas.He), this.parameters.configuration == "CCR" ? (h("ion-col", null, level.setpoint)) : undefined))))))), this.dive.decoGases.length > 0 ? (h("ion-list", { class: "ion-text-wrap" }, h("ion-item-divider", null, h("ion-label", null, h("ion-text", { color: "dark" }, h("h6", null, h("my-transl", { tag: "deco-gases", text: "Deco gases" }))))), h("ion-item", { class: "ion-text-center" }, h("ion-grid", { class: "ion-text-center" }, h("ion-row", null, h("ion-col", null, h("ion-text", { color: "dark" }, h("h6", null, h("my-transl", { tag: "from-depth", text: "from Depth" })))), h("ion-col", null, h("ion-text", { color: "dark" }, h("h6", null, "O", h("sub", null, "2")))), h("ion-col", null, h("ion-text", { color: "dark" }, h("h6", null, "He"))), this.parameters.configuration == "CCR" ? (h("ion-col", null, h("ion-text", { color: "dark" }, h("h6", null, h("my-transl", { tag: "po2", text: "pO2" }))))) : undefined))), this.dive.decoGases.map((gas) => (h("ion-item", { class: "ion-text-center" }, h("ion-grid", { class: "ion-text-center" }, h("ion-row", null, h("ion-col", null, gas.fromDepth), h("ion-col", null, gas.O2), h("ion-col", null, gas.He), this.parameters.configuration == "CCR" ? (h("ion-col", null, gas.ppO2)) : undefined))))))) : undefined));
    }
};
AppDecoplannerShowPlan.style = appDecoplannerShowplanCss;

export { AppDecoplannerShowPlan as app_decoplanner_showplan };

//# sourceMappingURL=app-decoplanner-showplan.entry.js.map