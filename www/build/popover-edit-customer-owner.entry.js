import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { L as CustomerGroup, j as CustomersService, T as TranslationService, aO as slugify } from './utils-5cd4c7bb.js';
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
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-0a7fccce.js';
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';
import './framework-delegate-779ab78c.js';

const popoverEditCustomerOwnerCss = "popover-edit-customer-owner{}popover-edit-customer-owner ion-list{min-height:300px}";

const PopoverEditCustomerEwner = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.owner = undefined;
        this.group = false;
        this.updateView = false;
    }
    componentWillLoad() {
        this.popover = this.el.closest("ion-popover");
        this.selectedOwner = new CustomerGroup();
        this.sharePerc = this.owner.groupOwnershipPerc;
        this.custGroups = CustomersService.getCustomerGroups();
        if (this.owner && this.owner.groupId) {
            this.selectedOwner = this.custGroups.find((x) => x.groupId == this.owner.groupId);
            if (!this.selectedOwner) {
                //in case not found in the list
                this.newOwnerName = this.owner.groupName;
            }
        }
    }
    componentDidLoad() {
        this.setOwnersSelect();
        this.updateView = !this.updateView;
    }
    setOwnersSelect() {
        const selectOwnerElement = this.el.querySelector("#selectOwner");
        const customOwnerPopoverOptions = {
            header: TranslationService.getTransl(this.group ? "customer_group" : "customer_owner", this.group ? "Customer Group" : "Customer Owner"),
        };
        selectOwnerElement.interfaceOptions = customOwnerPopoverOptions;
        //remove previously defined options
        const selectOwnerOptions = Array.from(selectOwnerElement.getElementsByTagName("ion-select-option"));
        selectOwnerOptions.map((option) => {
            selectOwnerElement.removeChild(option);
        });
        selectOwnerElement.placeholder = TranslationService.getTransl("select", "Select");
        this.custGroups.map((group) => {
            const selectOption = document.createElement("ion-select-option");
            selectOption.value = group;
            selectOption.textContent = group.groupName;
            selectOwnerElement.appendChild(selectOption);
        });
    }
    handleSelect(ev) {
        this.selectedOwner = ev.detail.value;
    }
    handleChange(ev) {
        this[ev.detail.name] = ev.detail.value;
        this.updateView = !this.updateView;
    }
    close() {
        popoverController.dismiss();
    }
    save() {
        if (this.newOwnerName) {
            this.owner.groupId = slugify(this.newOwnerName);
            this.owner.groupName = this.newOwnerName;
        }
        else {
            this.owner.groupId = this.selectedOwner.groupId;
            this.owner.groupName = this.selectedOwner.groupName;
        }
        this.owner.groupOwnershipPerc = this.sharePerc;
        popoverController.dismiss({
            owner: this.owner,
            new: this.newOwnerName && this.newOwnerName.length > 0,
        });
    }
    render() {
        return (h(Host, { key: 'd28b68d8ca2ac3956975b190522369f216b02140' }, h("ion-header", { key: '633bd675254e4a1b1c613bd7868a306791f0d283', translucent: true }, h("ion-toolbar", { key: '542997869b240bb08ee81b8f4131f6c997242de7' }, h("ion-title", { key: 'e0126b35d0f4a48b13f9dfd8582b84206e509f29' }, "Select Owner/Group"))), h("ion-content", { key: 'b69ca518772af9e100dd75d4bf85ec5cfed82578' }, h("ion-item", { key: '433ccb4b93ff1f0b25a74b8380f19e0e5bc77723', lines: "none" }, h("ion-select", { key: 'e33e9582eef9f306ec7f25a976d3b0460599ed1b', color: "trasteel", id: "selectOwner", interface: "action-sheet", label: "Customer", "label-placement": "floating", disabled: this.newOwnerName && this.newOwnerName.length > 0, onIonChange: (ev) => this.handleSelect(ev), value: this.selectedOwner })), h("ion-item-divider", { key: '7931c5189685de913f3f4c8661cdb01340ca12ae' }, " - or insert new - "), h("app-form-item", { key: 'f522510128916000a658377794d8bcb751aeda6f', lines: "none", "label-tag": "name", "label-text": "Name", value: this.newOwnerName, name: "newOwnerName", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev) }), this.group ? (h("app-form-item", { lines: "full", "label-tag": "share_perc", "label-text": "Share Percentage", value: this.sharePerc, name: "sharePerc", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), validator: [
                {
                    name: "minmaxvalue",
                    options: { min: 0, max: 100 },
                },
            ] })) : undefined), h("ion-footer", { key: '97b9cc300f1d2c96bf5fb64911404a0ebe06939b' }, h("app-modal-footer", { key: '8e8438d6c1b93b1e89b96fc67c3f32aa6cb124d5', saveTag: { tag: "ok", text: "ok" }, onCancelEmit: () => this.close(), onSaveEmit: () => this.save() }))));
    }
    get el() { return getElement(this); }
};
PopoverEditCustomerEwner.style = popoverEditCustomerOwnerCss;

export { PopoverEditCustomerEwner as popover_edit_customer_owner };

//# sourceMappingURL=popover-edit-customer-owner.entry.js.map