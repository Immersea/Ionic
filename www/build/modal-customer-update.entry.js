import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { U as UserService, w as UserProfile, j as CustomersService, K as Customer, T as TranslationService, L as CustomerGroup, R as RouterService, B as SystemService, C as CUSTOMERSCOLLECTION } from './utils-ced1e260.js';
import { C as CustomerLocation, c as CustomerConditionEAF, d as CustomerConditionLF, e as CustomerConditionCCM } from './customerLocation-d18240cd.js';
import { E as Environment } from './env-c3ad5e77.js';
import { l as lodash } from './lodash-68d560b6.js';
import { p as popoverController, m as modalController } from './overlays-b3ceb97d.js';
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
import './map-fe092362.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './framework-delegate-779ab78c.js';

const modalCustomerUpdateCss = "modal-customer-update ion-list{width:100%}";

const ModalCustomerUpdate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.saveNewOwner = false;
        this.titles = [
            { tag: "information", text: "Information", disabled: false },
            { tag: "locations", text: "Locations", disabled: false },
            {
                tag: "operating-conditions",
                text: "Operating Conditions",
                disabled: false,
            },
        ];
        this.customerId = undefined;
        this.customer = undefined;
        this.updateView = true;
        this.validCustomer = false;
        this.locationTypeSegment = "add";
        this.slider = undefined;
    }
    async componentWillLoad() {
        this.userProfileSub$ = UserService.userProfile$.subscribe((userProfile) => {
            this.userProfile = new UserProfile(userProfile);
        });
        await this.loadCustomer();
    }
    async loadCustomer() {
        if (this.customerId) {
            const res = await CustomersService.getCustomer(this.customerId);
            this.customer = res;
            if (this.customer.locations.length > 0)
                this.locationTypeSegment = 0;
        }
        else {
            this.customer = new Customer();
            this.customer.users = {
                [UserService.userRoles.uid]: ["owner"],
            };
        }
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-edit-customer", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
        });
        this.setTypesSelect();
        this.validateCustomer();
    }
    disconnectedCallback() {
        this.userProfileSub$.unsubscribe();
    }
    handleChange(ev) {
        this.customer[ev.detail.name] = ev.detail.value;
        this.validateCustomer();
    }
    handleInformationChange() {
        this.validateCustomer();
    }
    updateParam() {
        this.validateCustomer();
    }
    updateImageUrls(ev) {
        const imageType = ev.detail.type;
        const url = ev.detail.url;
        if (imageType == "photo") {
            this.customer.photoURL = url;
        }
        else {
            this.customer.coverURL = url;
        }
        this.save(false);
    }
    validateCustomer() {
        let checkLocations = true;
        this.customer.locations.forEach((location) => {
            if (location && location.position)
                checkLocations =
                    checkLocations &&
                        lodash.exports.isNumber(location.position.geopoint.latitude) &&
                        lodash.exports.isNumber(location.position.geopoint.longitude);
        });
        this.validCustomer =
            checkLocations &&
                lodash.exports.isString(this.customer.fullName) &&
                this.customer.typeId != null;
    }
    addLocation() {
        this.customer.locations.push(new CustomerLocation());
        this.locationTypeSegment = this.customer.locations.length - 1;
        this.updateSlider();
    }
    updateLocation() {
        this.updateSlider();
    }
    deleteLocation(index) {
        this.customer.locations.splice(index, 1);
        this.updateSlider();
    }
    setTypesSelect() {
        const selectLocationElement = this.el.querySelector("#selectType");
        const customPopoverOptions = {
            header: TranslationService.getTransl("customer_type", "Customer Type"),
        };
        selectLocationElement.interfaceOptions = customPopoverOptions;
        //remove previously defined options
        const selectLocationOptions = Array.from(selectLocationElement.getElementsByTagName("ion-select-option"));
        selectLocationOptions.map((option) => {
            selectLocationElement.removeChild(option);
        });
        selectLocationElement.placeholder = TranslationService.getTransl("select", "Select");
        CustomersService.getCustomerTypes().map((type) => {
            const selectOption = document.createElement("ion-select-option");
            selectOption.value = type.typeId;
            selectOption.textContent = TranslationService.getTransl(type.typeId, type.typeName);
            selectLocationElement.appendChild(selectOption);
        });
    }
    selectType(ev) {
        this.customer.typeId = ev.detail.value;
        this.validateCustomer();
    }
    locationTypeSegmentChanged(ev) {
        if (ev.detail.value !== "add") {
            this.locationTypeSegment = ev.detail.value;
            this.updateView = !this.updateView;
            this.updateSlider();
        }
    }
    selectOwner(ev) {
        this.customer.owner = ev.detail.value;
        this.validateCustomer();
    }
    selectGroupOwner(ev, index) {
        this.customer.group[index] = ev.detail.value;
        this.validateCustomer();
    }
    async editOwner(group, index, del) {
        let owner = new CustomerGroup();
        if (group) {
            if (index >= 0) {
                owner = this.customer.group[index];
                if (del) {
                    this.customer.group.splice(index, 1);
                }
            }
        }
        else {
            owner = this.customer.owner;
        }
        if (!del) {
            //create edit popover
            const popover = await popoverController.create({
                component: "popover-edit-customer-owner",
                translucent: true,
                componentProps: {
                    owner: owner,
                    group: group,
                },
            });
            popover.onDidDismiss().then(async (ev) => {
                const res = ev.data;
                if (res) {
                    if (group) {
                        if (index >= 0) {
                            this.customer.group[index] = res.owner;
                        }
                        else {
                            this.customer.group.push(res.owner);
                        }
                    }
                    else {
                        this.customer.owner = res.owner;
                    }
                    this.saveNewOwner = res.new;
                    this.updateSlider();
                }
            });
            popover.present();
        }
        this.updateSlider();
    }
    updateSlider() {
        this.updateView = !this.updateView;
        //wait for view to update and then reset slider height
        setTimeout(() => {
            this.slider ? this.slider.update() : undefined;
        }, 100);
    }
    async editOperatingCondition(condition, conditionData) {
        const modal = await RouterService.openModal("modal-operating-conditions-questionnaire", {
            condition,
            conditionData: lodash.exports.cloneDeep(conditionData),
            editable: true,
        });
        modal.onDidDismiss().then((result) => {
            result = result.data;
            if (result && conditionData) {
                if (condition == "EAF")
                    conditionData = new CustomerConditionEAF(result);
                else if (condition == "LF")
                    conditionData = new CustomerConditionLF(result);
                else if (condition == "CCM")
                    conditionData = new CustomerConditionCCM(result);
                this.updateSlider();
            }
            else if (result) {
                if (condition == "EAF")
                    this.customer.conditions.EAF.push(new CustomerConditionEAF(result));
                else if (condition == "LF")
                    this.customer.conditions.LF.push(new CustomerConditionLF(result));
                else if (condition == "CCM")
                    this.customer.conditions.CCM.push(new CustomerConditionCCM(result));
                this.updateSlider();
            }
        });
    }
    async deleteCustomer() {
        try {
            await CustomersService.deleteCustomer(this.customerId);
            modalController.dismiss();
        }
        catch (error) {
            if (error)
                SystemService.presentAlertError(error);
        }
    }
    async save(dismiss = true) {
        const doc = await CustomersService.updateCustomer(this.customerId, this.customer, this.userProfile.uid);
        if (this.customerId) {
            return dismiss ? modalController.dismiss() : true;
        }
        else {
            this.customerId = doc.id;
            return true;
        }
    }
    async cancel() {
        modalController.dismiss();
    }
    render() {
        return (h(Host, { key: 'd4748b4af36e74efaf3636f3587f480625473145' }, h("ion-header", { key: 'd2b5f0eb6be281686ab85f42d1022dd41db703a4' }, h("app-upload-cover", { key: '0a3816a10119e17a1a7c0cd4e2a7b0a4d10a7ffc', item: {
                collection: CUSTOMERSCOLLECTION,
                id: this.customerId,
                photoURL: this.customer.photoURL,
                coverURL: this.customer.coverURL,
            }, onCoverUploaded: (ev) => this.updateImageUrls(ev) })), h("app-header-segment-toolbar", { key: '867c928359d137bbfd55f2d719d099025ce9d11d', color: Environment.getAppColor(), swiper: this.slider, titles: this.titles }), h("ion-content", { key: '35e0b5556c075c5625f7ba6da0bbab5a66eaaaca', class: "slides" }, h("swiper-container", { key: '87ca56ec92e22bba3be0e39a84faa199615109d7', class: "slider-edit-customer swiper" }, h("swiper-wrapper", { key: 'f3d98d6501e64eaf584aaafc3de60201882424a2', class: "swiper-wrapper" }, h("swiper-slide", { key: '66dc12982e50e0d52fff6b5bbdf19f6666bd4c4c', class: "swiper-slide" }, h("ion-list", { key: 'fe5d2314acdc4db84dae5cff002a0e7b11ef0ca4', class: "ion-no-padding" }, h("ion-item", { key: '935aaea019e9f68ba48ecdca5593202141c9b85e', lines: "none" }, h("ion-select", { key: '1d4651bce286f4bf301abf9fc467229c36c054c1', color: "trasteel", id: "selectType", interface: "action-sheet", label: TranslationService.getTransl("customer_type", "Customer Type"), "label-placement": "floating", onIonChange: (ev) => this.selectType(ev), value: this.customer && this.customer.typeId
                ? this.customer.typeId
                : null })), h("app-form-item", { key: 'f8a83701ab617588e103415aca5e732d7a966ba5', "label-tag": "name", "label-text": "Name", value: this.customer.fullName, name: "fullName", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: '10e498ac4eec4a4446bc318a74a0325f84e01df8', "label-tag": "local_name", "label-text": "Local Name", value: this.customer.fullNameOther, name: "fullNameOther", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: '4c92d731d58fb74674655731df0e8e24b3ead41f', labelTag: "other_name", labelText: "Other Name", value: this.customer.otherPlantName, name: "otherPlantName", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: 'b8a4950ea69ef5142b2e595391373f4f0f78c77e', labelTag: "other_name", labelText: "Other Local Name", value: this.customer.otherPlantNameOther, name: "otherPlantNameOther", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: 'f94d3bb3bc4ecabe4b46f7868da3da1cdb17eb4f', labelTag: "short_name", labelText: "Short Name", value: this.customer.shortName, name: "shortName", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), this.customer.group.length == 0 ? (h("ion-item", { lines: "none" }, h("ion-label", null, h("h2", null, h("my-transl", { tag: "add_customer_group", text: "Add Customer Group" }))), h("ion-button", { onClick: () => this.editOwner(true), slot: "end" }, "+"))) : undefined, this.customer.group.map((group, index) => (h("ion-item", { lines: "none" }, h("ion-label", null, index == 0 ? (h("ion-note", null, h("my-transl", { tag: "customer_group", text: "Customer Group" }))) : undefined, h("h2", null, group.groupName +
            " [" +
            group.groupOwnershipPerc +
            "%]")), index == this.customer.group.length - 1 ? (h("ion-button", { onClick: () => this.editOwner(true), slot: "end" }, "+")) : undefined, h("ion-button", { slot: "end", "icon-only": true, color: "danger", fill: "clear", onClick: () => {
                this.editOwner(true, index, true);
            } }, h("ion-icon", { name: "trash" })), h("ion-button", { slot: "end", "icon-only": true, fill: "clear", onClick: () => {
                this.editOwner(true, index);
            } }, h("ion-icon", { name: "create" }))))), h("ion-item", { key: '321ab53d74855b6c044db5448d140ca6717faeb9', lines: "none" }, h("ion-label", { key: '9a967173cde5759cff4a5e9bbf7946b180b5b8fd' }, h("ion-note", { key: 'b8a3b674490813a26ef448197d95eac95cb1a503' }, h("my-transl", { key: '85248f9c89b2a8774a37cc05664e7e84a69f6380', tag: "customer_owner", text: "Customer Owner" })), h("h2", { key: 'b01706e32322972e9d65aaddc18739447dea278e' }, this.customer.owner.groupName)), h("ion-button", { key: 'd7879106e22eecdbc47c5bf48820d64c15e664e3', slot: "end", "icon-only": true, fill: "clear", onClick: () => {
                this.editOwner(false);
            } }, h("ion-icon", { key: '7b18e7ca3b3af48afcf2b92b1a44a7ad96ed8494', name: "create" }))), h("app-customer-plant-production", { key: 'b82ee06068e9ec91b76c05558af1814603ff1efb', customer: this.customer, editable: true })), this.customerId ? (h("ion-footer", { class: "ion-no-border" }, h("ion-toolbar", null, h("ion-button", { expand: "block", fill: "outline", color: "danger", onClick: () => this.deleteCustomer() }, h("ion-icon", { slot: "start", name: "trash" }), h("my-transl", { tag: "delete", text: "Delete", isLabel: true }))))) : undefined), h("swiper-slide", { key: 'eb665cb70e3889c0320a092b1bdb3cbdd5d11e6f', class: "swiper-slide" }, h("div", { key: 'ce3bd1ff32667be9bc82b1cdefd84a8e3cd9b813' }, h("ion-toolbar", { key: 'f6338047ba1cc0bc91458e4e22b125a2d299f96d' }, h("ion-segment", { key: '37a5482fe12652caf82704a4e1ce4f32999e829f', mode: "ios", scrollable: true, onIonChange: (ev) => this.locationTypeSegmentChanged(ev), value: this.locationTypeSegment }, this.customer.locations.map((location, index) => (h("ion-segment-button", { value: index, layout: "icon-start" }, h("ion-label", null, CustomersService.getLocationsTypes(location.type)[0].locationName)))), h("ion-segment-button", { key: '88917bb707deb3a7c0999a753a21c3ccb4760d3d', value: "add", onClick: () => this.addLocation(), layout: "icon-start" }, h("ion-label", { key: 'a276c4ba76351ed7037ea8648746c7e4735a344f' }, "+")))), this.customer.locations.map((location, index) => (h("div", null, this.locationTypeSegment == index ? (h("div", null, h("app-location", { locations: CustomersService.getLocationsTypes(), location: location, slider: this.slider, onLocationSelected: () => this.updateLocation(), onLocationDeleted: () => this.deleteLocation(index) }))) : undefined))))), h("swiper-slide", { key: 'ddca763fbe9cfb9723c427eb04b2b543834f5199', class: "swiper-slide" }, h("ion-grid", { key: '463e5b814db02d2b14498fb4d23024ec6aab71be' }, h("ion-row", { key: '8fc33a550ea5652edb9e560f246343a1a313ed0d' }, h("ion-col", { key: 'a22fc73f2bacfd4ecfac10be58d5dd16b78715ac' }, h("ion-button", { key: '93dff0f3d9be9fb6c246d68a160270163586e14c', color: Environment.getAppColor(), onClick: () => this.editOperatingCondition("EAF"), expand: "block" }, h("ion-icon", { key: 'a0cb2cb46e0a21ea2e49f0da544c080eb372564c', name: "add" }), h("ion-label", { key: '9974fd2ed919f2c6dde7eee368b60d8beda050dc' }, "EAF"))), h("ion-col", { key: '98dbc1f715ef155d228d47f2f2e6d44ef8bf2dee' }, h("ion-button", { key: '8ea5b1f07e8a1a8a1edc4a92e8cfe47d0a81025c', color: Environment.getAppColor(), onClick: () => this.editOperatingCondition("LF"), expand: "block" }, h("ion-icon", { key: 'bd588904bcdd12a2be9d49f9c258242a15c502d6', name: "add" }), h("ion-label", { key: 'fca9f33d2c35588fb85df2e04cf275a68a913c07' }, "LF"))), h("ion-col", { key: '2d0b9781f201491a17dde100122d1769941b6bb6' }, h("ion-button", { key: '5f6a6bc94434eb824fc9d3bf5bc457f7aeeb14ab', color: Environment.getAppColor(), onClick: () => this.editOperatingCondition("CCM"), expand: "block" }, h("ion-icon", { key: '05ad247e9bc23c58611f0baf3ccdee06960e5f99', name: "add" }), h("ion-label", { key: '7fe58d986e424541a6dfca76a330b02eddcbdd2a' }, "CCM"))))), h("ion-list", { key: '0edc5b7c013d17c9cd044d90e119c30e97648a32' }, h("ion-item-divider", { key: '475a3e12d6c23a06c6e7ffc6e4c9340af6815ce4' }, "EAF"), this.customer.conditions.EAF.map((condition) => (h("ion-item", { button: true, detail: true, onClick: () => this.editOperatingCondition("EAF", condition) }, h("ion-label", null, new Date(condition.date).toLocaleDateString())))), h("ion-item-divider", { key: 'fbf36021e64ea02efea7bfaeac93715e24beb64a' }, "LF"), this.customer.conditions.LF.map((condition) => (h("ion-item", { button: true, detail: true, onClick: () => this.editOperatingCondition("EAF", condition) }, h("ion-label", null, new Date(condition.date).toLocaleDateString())))), h("ion-item-divider", { key: '18755ea5fca3a0f749c8a72fcaf5ff08bd239b00' }, "CCM"), this.customer.conditions.CCM.map((condition) => (h("ion-item", null, h("ion-label", null, new Date(condition.date).toLocaleDateString()))))))))), h("app-modal-footer", { key: '8caef664a5578db26e2d5eee2ccc4981d6f7db49', color: Environment.getAppColor(), disableSave: !this.validCustomer, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalCustomerUpdate.style = modalCustomerUpdateCss;

export { ModalCustomerUpdate as modal_customer_update };

//# sourceMappingURL=modal-customer-update.entry.js.map