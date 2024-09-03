import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { U as UserService, w as UserProfile, T as TranslationService, I as ContactsService, J as Contact, j as CustomersService, B as SystemService, r as CONTACTSCOLLECTION } from './utils-ced1e260.js';
import { E as Environment } from './env-c3ad5e77.js';
import { l as lodash } from './lodash-68d560b6.js';
import { m as modalController } from './overlays-b3ceb97d.js';
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
import './customerLocation-d18240cd.js';
import './framework-delegate-779ab78c.js';

const modalContactUpdateCss = "modal-contact-update ion-list{width:100%}";

const ModalContactUpdate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.contactId = undefined;
        this.contact = undefined;
        this.customerLocations = [];
        this.segment = "information";
        this.updateView = true;
        this.validContact = false;
        this.slider = undefined;
    }
    async componentWillLoad() {
        this.userProfileSub$ = UserService.userProfile$.subscribe((userProfile) => {
            this.userProfile = new UserProfile(userProfile);
        });
        this.segmentTitles = {
            information: TranslationService.getTransl("information", "Information"),
        };
        await this.loadContact();
    }
    async loadContact() {
        if (this.contactId) {
            const res = await ContactsService.getContact(this.contactId);
            this.contact = res;
        }
        else {
            this.contact = new Contact();
            this.contact.users = {
                [UserService.userRoles.uid]: ["owner"],
            };
        }
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-edit-contact", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
            on: {
                slideChange: () => {
                    this.slider ? this.slider.updateAutoHeight() : null;
                },
            },
        });
        this.validateContact();
    }
    disconnectedCallback() {
        this.userProfileSub$.unsubscribe();
    }
    handleChange(ev) {
        this.contact[ev.detail.name] = ev.detail.value;
        this.validateContact();
    }
    handleInformationChange() {
        this.validateContact();
    }
    selectCustomer(ev) {
        this.contact.customerId = ev.detail.value;
        CustomersService.getCustomer(ev.detail.value).then((customer) => {
            this.customer = customer;
            this.customerLocations = customer.locations;
            this.setLocationsSelect();
        });
        this.validateContact();
    }
    selectCustomerLocation(ev) {
        this.contact.customerLocationId = ev.detail.value;
        this.validateContact();
    }
    setLocationsSelect() {
        const selectLocationElement = this.el.querySelector("#selectLocation");
        const customPopoverOptions = {
            header: TranslationService.getTransl("location", "Locations"),
        };
        selectLocationElement.interfaceOptions = customPopoverOptions;
        //remove previously defined options
        const selectLocationOptions = Array.from(selectLocationElement.getElementsByTagName("ion-select-option"));
        selectLocationOptions.map((option) => {
            selectLocationElement.removeChild(option);
        });
        selectLocationElement.placeholder = TranslationService.getTransl("select", "Select");
        this.customerLocations.map((location) => {
            const selectOption = document.createElement("ion-select-option");
            selectOption.value = location.type;
            selectOption.textContent = TranslationService.getTransl(location.type, CustomersService.getLocationsTypes(location.type)[0].locationName);
            selectLocationElement.appendChild(selectOption);
        });
        this.updateSlider();
    }
    updateParam() {
        this.validateContact();
    }
    segmentChanged(ev) {
        if (ev.detail.value) {
            this.segment = ev.detail.value;
            this.slider.update();
            switch (this.segment) {
                case "information":
                    this.slider.slideTo(0);
                    break;
                default:
                    break;
            }
        }
    }
    updateImageUrls(ev) {
        const imageType = ev.detail.type;
        const url = ev.detail.url;
        if (imageType == "photo") {
            this.contact.photoURL = url;
        }
        else {
            this.contact.coverURL = url;
        }
        this.save(false);
    }
    validateContact() {
        let checkLocations = true;
        this.validContact =
            checkLocations &&
                lodash.exports.isString(this.contact.firstName) &&
                lodash.exports.isString(this.contact.lastName) &&
                lodash.exports.isString(this.contact.customerId);
    }
    updateSlider() {
        this.updateView = !this.updateView;
        //wait for view to update and then reset slider height
        setTimeout(() => {
            this.slider ? this.slider.update() : undefined;
        }, 100);
    }
    async deleteContact() {
        try {
            await ContactsService.deleteContact(this.contactId);
            modalController.dismiss();
        }
        catch (error) {
            SystemService.presentAlertError(error);
        }
    }
    async save(dismiss = true) {
        const doc = await ContactsService.updateContact(this.contactId, this.contact, this.userProfile.uid);
        if (this.contactId) {
            return dismiss ? modalController.dismiss() : true;
        }
        else {
            this.contactId = doc.id;
            return true;
        }
    }
    async cancel() {
        modalController.dismiss();
    }
    render() {
        return (h(Host, { key: '6f6956f65cc2991f8578ff4e9482b0ded558d995' }, h("ion-header", { key: '3c6911cdb4e831e2262c3fa983b03f0545fb1409' }, h("app-upload-cover", { key: 'c2d70938f4ccf1384d3685b9238541a0f9e567d8', item: {
                collection: CONTACTSCOLLECTION,
                id: this.contactId,
                photoURL: this.contact.photoURL,
                coverURL: this.contact.coverURL,
            }, onCoverUploaded: (ev) => this.updateImageUrls(ev) })), h("ion-header", { key: 'b6d7ce0c8f5c3c1952b55463981ab343d1ef1045' }, h("ion-toolbar", { key: '083982c3c46c55b79c6c954e53c157d03cbb7b6d' }, h("ion-segment", { key: 'de2bb032feffb3313600bd93ade95b29b8d15022', mode: "md", color: Environment.getAppColor(), scrollable: true, onIonChange: (ev) => this.segmentChanged(ev), value: this.segment }, h("ion-segment-button", { key: 'b592104b3349ea959e5a38b609d37592a725a44b', value: "information", layout: "icon-start" }, h("ion-label", { key: '52a40ce961282e5c50fa29c7f60a388220880d19' }, this.segmentTitles.information))))), h("ion-content", { key: 'bccdb58b05efd5f53d6cce8a674e49836e0ddc4a', class: "slides" }, h("swiper-container", { key: '20195d076230892de3bbf62cefaa0411576825b2', class: "slider-edit-contact swiper" }, h("swiper-wrapper", { key: '36196c13d4b5bd9af1f6ee07e1bd0077527b20df', class: "swiper-wrapper" }, h("swiper-slide", { key: 'c868aba07738b94a6361284f3fe63ad74cecfe74', class: "swiper-slide" }, h("ion-list", { key: '93a64ad58ce41260907ca1bb4f9b570c74c64e52', class: "ion-no-padding" }, h("ion-list-header", { key: 'f84e28a49c896ddff1deeb548b8df3eb0378372d' }, h("my-transl", { key: '4fdf7f92502f3bc5bdf472f44672d9f53f0e7492', tag: "general-information", text: "General Information", isLabel: true })), h("ion-item", { key: '8d184654811f073e7e05365e52d1d4878302df08', lines: "none" }, h("ion-select", { key: '3f235eea885f365711135b3c01864c356ed5c91d', color: "trasteel", id: "selectCustomer", interface: "action-sheet", label: TranslationService.getTransl("customer", "Customer"), "label-placement": "floating", onIonChange: (ev) => this.selectCustomer(ev), value: this.contact && this.contact.customerId
                ? this.contact.customerId
                : null }, CustomersService.customersList.map((customer) => (h("ion-select-option", { value: customer.id }, customer.fullName))))), h("ion-item", { key: '18e124766d47fcb8d24c728b094f4909e23b7d4b', lines: "none" }, h("ion-select", { key: '89c0152d58058407aae37543609a5285aa4a130b', color: "trasteel", id: "selectLocation", interface: "action-sheet", label: TranslationService.getTransl("location", "Location"), "label-placement": "floating", onIonChange: (ev) => this.selectCustomerLocation(ev), value: this.contact && this.contact.customerLocationId
                ? this.contact.customerLocationId
                : null })), h("app-form-item", { key: 'b4e9b2a8c2d56b31382146e0d5d4acc34f8ea03f', "label-tag": "name", "label-text": "Name", value: this.contact.firstName, name: "firstName", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: '9a1409793ad6d19b14987ef24dbacdc8deee4bcb', "label-tag": "surname", "label-text": "Surname", value: this.contact.lastName, name: "lastName", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: 'b5388b7fda005272a8d0178b6b9004d408a2f0f1', "label-tag": "work-position", "label-text": "Work Position", value: this.contact.workPosition, name: "workPosition", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: 'f9ca371210aea0bdc1704f5ec297dbe845a619e7', "label-tag": "office-phone", "label-text": "Office Phone", value: this.contact.officePhone, name: "officePhone", "input-type": "tel", onFormItemChanged: (ev) => this.handleChange(ev) }), h("app-form-item", { key: '3c28789bd9e69d1ddad52b6fc1aad9d59676c5e2', "label-tag": "mobile-phone", "label-text": "Mobile Phone", value: this.contact.mobilePhone, name: "mobilePhone", "input-type": "tel", onFormItemChanged: (ev) => this.handleChange(ev) }), h("app-form-item", { key: '151c80657c33c1765d017fa494964e998ad02b73', "label-tag": "email", "label-text": "Email", value: this.contact.email, name: "email", "input-type": "email", "input-form-mode": "email", onFormItemChanged: (ev) => this.handleChange(ev) })), this.contactId ? (h("ion-footer", { class: "ion-no-border" }, h("ion-toolbar", null, h("ion-button", { expand: "block", fill: "outline", color: "danger", onClick: () => this.deleteContact() }, h("ion-icon", { slot: "start", name: "trash" }), h("my-transl", { tag: "delete", text: "Delete", isLabel: true }))))) : undefined)))), h("app-modal-footer", { key: 'f5a766eab5091a14749ccf0ac23202df8b5f78ec', color: Environment.getAppColor(), disableSave: !this.validContact, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalContactUpdate.style = modalContactUpdateCss;

export { ModalContactUpdate as modal_contact_update };

//# sourceMappingURL=modal-contact-update.entry.js.map