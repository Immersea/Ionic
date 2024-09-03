import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { T as TranslationService, B as SystemService, I as ContactsService, ax as fabButtonTopMarginString, R as RouterService, j as CustomersService } from './utils-ced1e260.js';
import { T as TrasteelService } from './services-7994f696.js';
import { E as Environment } from './env-c3ad5e77.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-fe092362.js';
import './index-9b61a50b.js';
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
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';

const pageContactDetailsCss = "page-contact-details{}";

const PageContactDetails = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.itemId = undefined;
        this.contact = undefined;
        this.segment = "information";
        this.slider = undefined;
    }
    async componentWillLoad() {
        await this.loadContact();
        this.segmentTitles = {
            information: TranslationService.getTransl("information", "Information"),
        };
    }
    async loadContact() {
        await SystemService.presentLoading("loading");
        try {
            this.contact = await ContactsService.getContact(this.itemId);
        }
        catch (error) { }
        SystemService.dismissLoading();
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-contact", {
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
    }
    async editContact() {
        const modal = await ContactsService.presentContactUpdate(this.itemId);
        //update contact data after modal dismiss
        modal.onDidDismiss().then(() => this.loadContact());
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
    updateSlider() {
        setTimeout(() => {
            //reset slider height to show address
            this.slider ? this.slider.update() : undefined;
        }, 100);
    }
    render() {
        return [
            this.contact.coverURL || this.contact.photoURL ? (h("ion-header", null, h("app-item-cover", { item: this.contact }))) : undefined,
            h("ion-header", { key: '7233d1ac80e51ecbbd940a320cff70a5eb2b2745' }, h("app-navbar", { key: 'e9c3c19d9fc3a075de4acab47beff895b86eaab7', text: this.contact.lastName + " " + this.contact.firstName, color: "trasteel", backButton: this.contact && !this.contact.coverURL && !this.contact.photoURL, rightButtonText: TrasteelService.isCustomerDBAdmin()
                    ? {
                        icon: "create",
                        fill: "outline",
                        tag: "edit",
                        text: "Edit",
                    }
                    : null, rightButtonFc: () => this.editContact() })),
            h("ion-header", { key: 'e566eacf4b6dbb9196e3c57eb22decdb3121b0ef' }, h("ion-toolbar", { key: '9fb8d50a110aeb677925bf715774912e9555ccaf' }, h("ion-segment", { key: 'e26da315757d9499faf4f9293ef44d5fe2c4d5f2', mode: "md", color: Environment.getAppColor(), scrollable: true, onIonChange: (ev) => this.segmentChanged(ev), value: this.segment }, h("ion-segment-button", { key: 'a039bf78c4584f22a11fe87e7a0dbf8774bf9e10', value: "information", layout: "icon-start" }, h("ion-label", { key: 'd3931d7f3ff94f6cd4d7626c14cd2320639091fa' }, this.segmentTitles.information))))),
            h("ion-content", { key: '06d468c3acf4fbe564b098ea4fd07cd54da31d5b', class: "slides" }, h("ion-fab", { key: '77227907569191ad6f29532cf50dad69f2f907e3', vertical: "top", horizontal: "start", slot: "fixed", style: { marginTop: fabButtonTopMarginString(2) } }, h("ion-fab-button", { key: 'fc64f542bdbbba441fbbe3e504605021e878f4ac', onClick: () => RouterService.goBack(), class: "fab-icon" }, h("ion-icon", { key: 'faf673ce6a3d8c5afcc979c795d6370fac65e4f5', name: "arrow-back-circle-outline" }))), h("swiper-container", { key: 'f4b99f58643ae69a8723ad01baeab4a9efadda42', class: "slider-contact swiper" }, h("swiper-wrapper", { key: 'a279df9d85ebad5419ee60e1af2aac45f75f4b93', class: "swiper-wrapper" }, h("swiper-slide", { key: '7a01808f5a429527768cba73e6a78e9100b6f333', class: "swiper-slide" }, h("ion-list", { key: '3102ddff38365dbf8dbebdfdfd2f3eb762be4fd3', class: "ion-no-padding" }, h("ion-list-header", { key: '5668352eaf1f06edfc813adac15bbede8a6ecaf3' }, h("my-transl", { key: 'dce2289c906c9335352f1ad26573ccb3569e4a76', tag: "general-information", text: "General Information", isLabel: true })), h("app-item-detail", { key: '16cee061ffd0edada8ecb6dfd199aa1cfaafdd69', lines: "none", labelTag: "customer", labelText: "Customer", detailText: this.contact.customerId &&
                    CustomersService.getCustomersDetails(this.contact.customerId)
                    ? CustomersService.getCustomersDetails(this.contact.customerId).fullName
                    : null }), h("app-item-detail", { key: 'd0612fe4bf28dfb0fde4e6936ec88bf95ab3e167', lines: "none", labelTag: "location", labelText: "Location", detailText: this.contact.customerLocationId &&
                    CustomersService.getLocationsTypes(this.contact.customerLocationId)
                    ? CustomersService.getLocationsTypes(this.contact.customerLocationId)[0].locationName
                    : null }), h("app-form-item", { key: '8237b4bb3af02e30838a83d5957cbac058a14665', "label-tag": "name", "label-text": "Name", value: this.contact.firstName, "read-only": true }), h("app-form-item", { key: '28d9f4499f49d5e189f650a92061d0660ef70535', "label-tag": "surname", "label-text": "Surname", value: this.contact.lastName, "read-only": true }), h("app-form-item", { key: 'b2d93ceea4fcd5d2ad29d20842333eb5e9edabf7', "label-tag": "work-position", "label-text": "Work Position", value: this.contact.workPosition, "read-only": true }), h("app-form-item", { key: '5de88cb26ad46b065e6bf6e5d0f59295a936fc0a', "label-tag": "office-phone", "label-text": "Office Phone", value: this.contact.officePhone, "read-only": true }), h("app-form-item", { key: '892139295f801a95b075590b840d0e3e45879aea', "label-tag": "mobile-phone", "label-text": "Mobile Phone", value: this.contact.mobilePhone, "read-only": true }), h("app-form-item", { key: '8b9d7d4dec5f0a7ba29766c5963cbb2fcb89e89a', "label-tag": "email", "label-text": "Email", value: this.contact.email, "read-only": true })))))),
        ];
    }
    get el() { return getElement(this); }
};
PageContactDetails.style = pageContactDetailsCss;

export { PageContactDetails as page_contact_details };

//# sourceMappingURL=page-contact-details.entry.js.map