import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { p as popoverController } from './overlays-b3ceb97d.js';
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
import './framework-delegate-779ab78c.js';

const popoverFindOldcustomerCss = "popover-find-oldcustomer{}popover-find-oldcustomer ion-list{min-height:300px}popover-find-oldcustomer #project-grid ion-grid{--ion-grid-column-padding:0px}popover-find-oldcustomer .separator{background-color:var(--ion-color-trasteel-tint)}popover-find-oldcustomer #courses-grid .centered{display:flex;align-items:center;justify-content:center;text-align:center}popover-find-oldcustomer #courses-grid ion-grid{--ion-grid-column-padding:2px;border-collapse:collapse;border-style:hidden}popover-find-oldcustomer #courses-grid ion-grid .header{background-color:var(--ion-color-trasteel);font-weight:bold;color:var(--ion-color-trasteel-contrast)}popover-find-oldcustomer #courses-grid ion-grid ion-col{border:1px solid black;border-bottom:0;border-right:0}popover-find-oldcustomer #courses-grid ion-grid ion-col:last-child{border-right:1px solid black}popover-find-oldcustomer #courses-grid ion-grid ion-row:last-child{border-bottom:1px solid black}";

const PopoverFindOldCustomer = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.customersList = undefined;
        this.newCustomer = undefined;
        this.oldCustomer = undefined;
        this.selectedCustomer = undefined;
    }
    componentWillLoad() {
        this.popover = this.el.closest("ion-popover");
        this.selectedCustomer = this.newCustomer;
    }
    handleSelect(ev) {
        this.selectedCustomer = ev.detail.value;
    }
    close() {
        popoverController.dismiss();
    }
    savenew() {
        popoverController.dismiss("new");
    }
    save() {
        popoverController.dismiss(this.selectedCustomer);
    }
    render() {
        return (h(Host, { key: 'c1328eb698927dab6a18863145754126d80ca092' }, h("ion-header", { key: '8902402817424d667198d110f1abcb3731791b78', translucent: true }, h("ion-toolbar", { key: '8a8d7e8ce2a072ef5f0fda49c870f60724ece0d6' }, h("ion-title", { key: '0c6c21cf967caf562cf3f4d609ec8ecd6f52317d' }, "Check customer"))), h("ion-content", { key: '500fc70b706e698aab877d59bce1d3aeee4766d3' }, h("ion-item", { key: 'f6c6f03039c643c197f337ddb7b561dc106aaef4' }, "OLD"), h("ion-item", { key: '2c99757b7e4f6be8676b6b0a2e61a46036fed3b0' }, this.oldCustomer.Full_Customer_Name), h("ion-item", { key: '61ccf4604e71c73871e999acfb22236defeead48' }, "NEW"), h("ion-item", { key: '15c5800a4d48902eacf19cfbe5b9a6ba2f3175b8' }, this.newCustomer ? this.newCustomer.fullName : null), h("ion-item", { key: '8b291f56d5432317397bb68db68766a0379d23db', lines: "none" }, h("ion-select", { key: '1ddb6f08c60ef9ab70e0c0d4902f2470f889e6a4', color: "trasteel", id: "selectOwner", interface: "action-sheet", label: "customers", "label-placement": "floating", onIonChange: (ev) => this.handleSelect(ev), value: this.newCustomer ? this.newCustomer : null }, this.customersList.map((customer) => (h("ion-select-option", { value: customer }, customer.fullName)))))), h("ion-footer", { key: 'e398457d87dd6f6375e98927ce1db1b94418bcef' }, h("app-modal-footer", { key: '9dfc5dbee0cbf25f272baf6ed70e054c79a0a3cc', saveTag: { tag: "ok", text: "ok" }, onCancelEmit: () => this.close(), onSaveEmit: () => this.save() }), h("ion-button", { key: 'e649c5f6640cb5d0ace29d5033f33d10a21d716a', onClick: () => this.savenew() }, "New Customer"))));
    }
    get el() { return getElement(this); }
};
PopoverFindOldCustomer.style = popoverFindOldcustomerCss;

export { PopoverFindOldCustomer as popover_find_oldcustomer };

//# sourceMappingURL=popover-find-oldcustomer.entry.js.map