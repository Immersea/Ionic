import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { R as RouterService } from './utils-5cd4c7bb.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-0a7fccce.js';
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
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const appNavbarCss = "";

const AppNavbar = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.tag = undefined;
        this.text = undefined;
        this.extraTitle = undefined;
        this.color = "primary";
        this.iconColor = "primary";
        this.modal = false;
        this.backButton = false;
        this.rightButtonText = undefined;
        this.rightButtonFc = undefined;
    }
    componentDidLoad() { }
    render() {
        return (h(Host, { key: 'e215fca3f2329e20aef620fd721ba172b6e90230' }, this.color == "transparent" ? ([
            h("div", null, !this.modal ? (h("ion-fab", { vertical: "top", horizontal: "start", slot: "fixed" }, h("slot", { name: "start" }), h("ion-fab-button", { color: "transparent" }, h("ion-menu-button", { color: this.iconColor })))) : undefined),
            h("slot", { name: "end" }),
        ]) : (h("ion-header", null, h("ion-toolbar", { color: this.color }, h("ion-buttons", { slot: "start" }, !this.modal ? h("ion-menu-button", null) : undefined, this.backButton ? (h("ion-button", { onClick: () => RouterService.goBack() }, h("ion-icon", { name: "chevron-back-outline", slot: "start" }))) : undefined, h("slot", { name: "start" })), h("ion-title", null, this.tag ? (h("my-transl", { tag: this.tag, text: this.text })) : (this.text), this.extraTitle ? " - " + this.extraTitle : undefined), h("ion-buttons", { slot: "end" }, this.rightButtonText ? (h("ion-button", { fill: this.rightButtonText.fill, onClick: () => this.rightButtonFc() }, this.rightButtonText.icon ? (h("ion-icon", { name: this.rightButtonText.icon, slot: "start" })) : undefined, this.rightButtonText.tag ? (h("ion-label", null, h("my-transl", { tag: this.rightButtonText.tag, text: this.rightButtonText.text }))) : undefined)) : undefined, h("slot", { name: "end" })))))));
    }
};
AppNavbar.style = appNavbarCss;

export { AppNavbar as app_navbar };

//# sourceMappingURL=app-navbar.entry.js.map