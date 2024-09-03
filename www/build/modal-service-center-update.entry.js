import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { U as UserService, w as UserProfile, l as ServiceCentersService, at as ServiceCenter, a2 as mapHeight, k as SERVICECENTERSCOLLECTION } from './utils-cbf49763.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { m as modalController } from './overlays-b3ceb97d.js';
import './env-9be68260.js';
import './ionic-global-c07767bf.js';
import './map-dae4acde.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';
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

const modalServiceCenterUpdateCss = "modal-service-center-update ion-list{width:100%}";

const ModalServiceCenterUpdate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.serviceCenterId = undefined;
        this.serviceCenter = undefined;
        this.updateView = true;
        this.validServiceCenter = false;
        this.divingCourses = undefined;
        this.tmpServiceCenterId = undefined;
        this.showSCId = false;
        this.titles = [
            { tag: "map" },
            { tag: "position" },
            { tag: "information" },
            { tag: "team" },
        ];
        this.slider = undefined;
    }
    async componentWillLoad() {
        this.userProfileSub$ = UserService.userProfile$.subscribe((userProfile) => {
            this.userProfile = new UserProfile(userProfile);
        });
        await this.loadServiceCenter();
    }
    async loadServiceCenter() {
        if (this.serviceCenterId) {
            this.serviceCenter = await ServiceCentersService.getServiceCenter(this.serviceCenterId);
            this.draggableMarkerPosition = {
                lat: this.serviceCenter.position.geopoint.latitude,
                lon: this.serviceCenter.position.geopoint.longitude,
            };
        }
        else {
            this.serviceCenter = new ServiceCenter();
            this.draggableMarkerPosition = {};
        }
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-service-center", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
            on: {
                slideChange: () => {
                    this.slider ? this.slider.updateAutoHeight() : null;
                    this.slider.updateSize();
                },
            },
        });
        //reset map height inside slide
        await customElements.whenDefined("app-map");
        this.mapElement = this.el.querySelector("#map");
        const mapContainer = this.el.querySelector("#map-container");
        mapContainer.setAttribute("style", "height: " + mapHeight(this.serviceCenter, true) + "px"); //-cover photo -slider  - footer
        this.mapElement["mapLoaded"]().then(() => {
            this.mapElement.triggerMapResize();
        });
        this.mapElement.triggerMapResize();
        this.validateServiceCenter();
    }
    disconnectedCallback() {
        this.userProfileSub$.unsubscribe();
    }
    updateLocation(ev) {
        this.draggableMarkerPosition = {
            lat: lodash.exports.toNumber(ev.detail.lat),
            lon: lodash.exports.toNumber(ev.detail.lon),
        };
        this.serviceCenter.setPosition(ev.detail.lat, ev.detail.lon);
        this.validateServiceCenter();
    }
    updateAddress(ev) {
        this.serviceCenter.setAddress(ev.detail);
    }
    handleChange(ev) {
        if (ev.detail.name == "facebook" ||
            ev.detail.name == "instagram" ||
            ev.detail.name == "twitter" ||
            ev.detail.name == "website" ||
            ev.detail.name == "email") {
            const val = lodash.exports.toLower(ev.detail.value).split(" ").join("-");
            this.serviceCenter[ev.detail.name] = val;
        }
        else if (ev.detail.name == "id") {
            this.setTmpId(ev.detail.value);
        }
        else {
            this.serviceCenter[ev.detail.name] = ev.detail.value;
        }
        this.updateView = !this.updateView;
        this.validateServiceCenter();
    }
    setTmpId(value) {
        this.tmpServiceCenterId = lodash.exports.toLower(value)
            .trim()
            .split(" ")
            .join("-")
            .substring(0, 16);
    }
    uniqueIdValid(ev) {
        if (ev.detail) {
            this.serviceCenterId = this.tmpServiceCenterId;
        }
        else {
            this.serviceCenterId = null;
        }
    }
    updateImageUrls(ev) {
        const imageType = ev.detail.type;
        const url = ev.detail.url;
        if (imageType == "photo") {
            this.serviceCenter.photoURL = url;
        }
        else {
            this.serviceCenter.coverURL = url;
        }
    }
    validateServiceCenter() {
        this.validServiceCenter =
            lodash.exports.isNumber(this.serviceCenter.position.geopoint.latitude) &&
                lodash.exports.isNumber(this.serviceCenter.position.geopoint.longitude) &&
                lodash.exports.isString(this.serviceCenter.displayName) &&
                lodash.exports.isString(this.serviceCenter.description);
    }
    async save() {
        await ServiceCentersService.updateServiceCenter(this.serviceCenterId, this.serviceCenter, this.userProfile.uid);
        return modalController.dismiss();
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: '69e53fb635a4f48843b643b52097eb34dec8e040' }, h("ion-header", { key: '8e24162395ed04fc8a1905989729e7f68d8ebb6f' }, h("app-upload-cover", { key: '3c0719308c393fed1ad45cedb263ad32e0d9d7aa', item: {
                collection: SERVICECENTERSCOLLECTION,
                id: this.serviceCenterId,
                photoURL: this.serviceCenter.photoURL,
                coverURL: this.serviceCenter.coverURL,
            }, onCoverUploaded: (ev) => this.updateImageUrls(ev) })), h("app-header-segment-toolbar", { key: 'c005fef45c67a6192666cd8be935b283da92f03b', color: "servicecenter", swiper: this.slider, titles: this.titles }), h("ion-content", { key: '7e8950819da83c2aa4d504e6833d8e8947c5132c', class: "slides" }, h("swiper-container", { key: '7c43f77d5c6614efcec9cd0f0fc0f965e2924a75', class: "slider-service-center swiper" }, h("swiper-wrapper", { key: 'cb471064395b1a9bf772e57ba07cc4c3534ca0ce', class: "swiper-wrapper" }, h("swiper-slide", { key: '86d4b4d44e3618e287c3a4cde3a13a74c08aac6e', class: "swiper-slide" }, h("div", { key: 'f03bb70cfc27f56fb3a46da9745318b1798e6287', id: "map-container" }, h("app-map", { key: '5eeb3a9689141c465e9c1fafefa01eec71d07b32', id: "map", pageId: "dive-sites", draggableMarkerPosition: this.draggableMarkerPosition, onDragMarkerEnd: (ev) => this.updateLocation(ev) }))), h("swiper-slide", { key: 'a6c5a03c1ce7d6083bf3558f29fae07d59bb8e94', class: "swiper-slide" }, h("app-coordinates", { key: 'cfa9846ae1cd96e26a7e84580f665d0477debdf9', coordinates: this.draggableMarkerPosition, onCoordinatesEmit: (ev) => this.updateLocation(ev), onAddressEmit: (ev) => this.updateAddress(ev) })), h("swiper-slide", { key: '9160d1917cc14099d04325c9c30d602376d1e44e', class: "swiper-slide" }, h("ion-list", { key: 'b8cb2754169ef265d9c37a008d4c438f09eeef95', class: "ion-no-padding" }, h("ion-list-header", { key: '25ed448d6180141e28e8b3b0f94a54a52a5215b8' }, h("my-transl", { key: '7a4058bccf24b261bc48e4ba12b6189dacf12866', tag: "general-information", text: "General Information", isLabel: true })), h("app-form-item", { key: '7c8044c483a88b47060fe457a7795809f92a6892', "label-tag": "name", "label-text": "Name", value: this.serviceCenter.displayName, name: "displayName", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), this.showSCId ? (h("app-form-item", { "label-tag": "unique-id", "label-text": "Unique ID", value: this.tmpServiceCenterId, name: "id", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), onIsValid: (ev) => this.uniqueIdValid(ev), validator: [
                "required",
                {
                    name: "uniqueid",
                    options: { type: SERVICECENTERSCOLLECTION },
                },
            ] })) : undefined, h("app-form-item", { key: 'bf10b8356e509604e5cc7bea1b8077d8020e070a', "label-tag": "description", "label-text": "Description", value: this.serviceCenter.description, name: "description", textRows: 10, "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: '31c184591d14d264067a11350f6bfb672715c5f8', "label-tag": "phone", "label-text": "Phone", value: this.serviceCenter.phoneNumber, name: "phoneNumber", "input-type": "tel", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), h("app-form-item", { key: '2351f6e894e78ca2f076f6c7cda69d4750f5f51e', "label-tag": "email", "label-text": "Email", value: this.serviceCenter.email, name: "email", "input-type": "email", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["email"] }), h("app-form-item", { key: '2ea4c637114821877812fe9749d14ad247f5e8d7', "label-tag": "website", "label-text": "Website", value: this.serviceCenter.website, name: "website", "input-type": "url", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), this.serviceCenter.website ? (h("a", { class: "ion-padding-start", href: "http://" + this.serviceCenter.website, target: "_blank" }, "http://" + this.serviceCenter.website)) : undefined, h("app-form-item", { key: '6314193176003c499f600acbe6a8393dc5f250ba', "label-tag": "facebook-id", "label-text": "Facebook ID", value: this.serviceCenter.facebook, name: "facebook", "input-type": "url", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), this.serviceCenter.facebook ? (h("a", { class: "ion-padding-start", href: "https://www.facebook.com/" +
                this.serviceCenter.facebook, target: "_blank" }, "https://www.facebook.com/" +
            this.serviceCenter.facebook)) : undefined, h("app-form-item", { key: 'ba567ed145994794a6b91b15b77209b24d15d45a', "label-tag": "instagram-id", "label-text": "Instagram ID", value: this.serviceCenter.instagram, name: "instagram", "input-type": "url", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), this.serviceCenter.instagram ? (h("a", { class: "ion-padding-start", href: "https://www.instagram.com/" +
                this.serviceCenter.instagram, target: "_blank" }, "https://www.instagram.com/" +
            this.serviceCenter.instagram)) : undefined, h("app-form-item", { key: 'f89e53aa721c7e0fba518479c9cc6ba084dba83d', "label-tag": "twitter id", "label-text": "Twitter ID", value: this.serviceCenter.twitter, name: "twitter", "input-type": "url", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), this.serviceCenter.twitter ? (h("a", { class: "ion-padding-start", href: "https://www.twitter.com/" + this.serviceCenter.twitter, target: "_blank" }, "https://www.twitter.com/" + this.serviceCenter.twitter)) : undefined)), h("swiper-slide", { key: '948e8f7847d636167a11a6195fef625707a2d0e5', class: "swiper-slide" }, h("app-users-list", { key: '0de5e48378d7bd2e27e2ad61a0fb9f6ded77d0d7', item: this.serviceCenter, editable: true, show: ["owner", "editor"] }))))), h("app-modal-footer", { key: 'e2b09d73472bfda4bc4124abbce547c62891f569', disableSave: !this.validServiceCenter, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalServiceCenterUpdate.style = modalServiceCenterUpdateCss;

export { ModalServiceCenterUpdate as modal_service_center_update };

//# sourceMappingURL=modal-service-center-update.entry.js.map