import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { U as UserService, w as UserProfile, z as UserSettings, i as DivingCentersService, ab as DivingCenter, a2 as mapHeight, c as DIVECENTERSSCOLLECTION } from './utils-5cd4c7bb.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { p as popoverController, m as modalController } from './overlays-b3ceb97d.js';
import './env-0a7fccce.js';
import './ionic-global-c07767bf.js';
import './map-e64442d7.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';
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

const modalDivingCenterUpdateCss = "modal-diving-center-update ion-list{width:100%}";

const ModalDivingCenterUpdate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.stdConfigurations = [];
        this.divingCenterId = undefined;
        this.divingCenter = undefined;
        this.segment = "map";
        this.updateView = true;
        this.validDiveCenter = false;
        this.diveSites = undefined;
        this.titles = [
            { tag: "map" },
            { tag: "position" },
            { tag: "information" },
            { tag: "dive-sites", text: "Dive Sites" },
            { tag: "team" },
        ];
        this.tmpDivingCenterId = undefined;
        this.slider = undefined;
        this.showDCId = false;
    }
    async componentWillLoad() {
        this.userProfileSub$ = UserService.userProfile$.subscribe((userProfile) => {
            this.userProfile = new UserProfile(userProfile);
        });
        this.userSettingsSub$ = UserService.userSettings$.subscribe((userSettings) => {
            this.userSettings = new UserSettings(userSettings);
            this.stdConfigurations = lodash.exports.cloneDeep(this.userSettings.userConfigurations);
        });
        await this.loadDivingCenter();
    }
    async loadDivingCenter() {
        if (this.divingCenterId) {
            this.showDCId = false;
            this.tmpDivingCenterId = this.divingCenterId;
            this.divingCenter = await DivingCentersService.getDivingCenter(this.divingCenterId);
            this.draggableMarkerPosition = {
                lat: this.divingCenter.position.geopoint.latitude,
                lon: this.divingCenter.position.geopoint.longitude,
            };
        }
        else {
            this.showDCId = true;
            this.divingCenter = new DivingCenter();
            this.divingCenter.users = {
                [UserService.userRoles.uid]: ["owner"],
            };
            this.draggableMarkerPosition = {};
        }
        this.loadDivingCenterSites();
    }
    loadDivingCenterSites() {
        this.diveSites = DivingCentersService.loadDivingCenterSites(this.divingCenter);
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-diving-center", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
        });
        //reset map height inside slide
        await customElements.whenDefined("app-map");
        this.mapElement = this.el.querySelector("#map");
        const mapContainer = this.el.querySelector("#map-container");
        mapContainer.setAttribute("style", "height: " + mapHeight(this.divingCenter.coverURL, true) + "px"); //-cover photo -slider  - footer
        this.mapElement["mapLoaded"]().then(() => {
            this.mapElement.triggerMapResize();
        });
        this.mapElement.triggerMapResize();
        this.validateDiveCenter();
    }
    disconnectedCallback() {
        this.userProfileSub$.unsubscribe();
        this.userSettingsSub$.unsubscribe();
    }
    updateLocation(ev) {
        this.draggableMarkerPosition = {
            lat: lodash.exports.toNumber(ev.detail.lat),
            lon: lodash.exports.toNumber(ev.detail.lon),
        };
        this.divingCenter.setPosition(ev.detail.lat, ev.detail.lon);
        this.validateDiveCenter();
    }
    updateAddress(ev) {
        this.divingCenter.setAddress(ev.detail);
    }
    handleChange(ev) {
        if (ev.detail.name == "facebook" ||
            ev.detail.name == "instagram" ||
            ev.detail.name == "twitter" ||
            ev.detail.name == "website" ||
            ev.detail.name == "email") {
            const val = lodash.exports.toLower(ev.detail.value).split(" ").join("-");
            this.divingCenter[ev.detail.name] = val;
        }
        else if (ev.detail.name == "id") {
            this.setTmpId(ev.detail.value);
        }
        else {
            this.divingCenter[ev.detail.name] = ev.detail.value;
        }
        this.updateView = !this.updateView;
        this.validateDiveCenter();
    }
    setTmpId(value) {
        this.tmpDivingCenterId = lodash.exports.toLower(value)
            .trim()
            .split(" ")
            .join("-")
            .substring(0, 16);
    }
    updateImageUrls(ev) {
        const imageType = ev.detail.type;
        const url = ev.detail.url;
        if (imageType == "photo") {
            this.divingCenter.photoURL = url;
        }
        else {
            this.divingCenter.coverURL = url;
        }
    }
    uniqueIdValid(ev) {
        if (ev.detail) {
            this.divingCenterId = this.tmpDivingCenterId;
        }
        else {
            this.divingCenterId = null;
        }
    }
    validateDiveCenter() {
        this.validDiveCenter =
            lodash.exports.isNumber(this.divingCenter.position.geopoint.latitude) &&
                lodash.exports.isNumber(this.divingCenter.position.geopoint.longitude) &&
                lodash.exports.isString(this.divingCenterId) &&
                lodash.exports.isString(this.divingCenter.displayName) &&
                lodash.exports.isString(this.divingCenter.description);
    }
    async openAddDiveSite() {
        const popover = await popoverController.create({
            component: "popover-search-dive-site",
            translucent: true,
        });
        popover.onDidDismiss().then((ev) => {
            const siteId = ev.data;
            this.divingCenter.diveSites.push(siteId);
            this.loadDivingCenterSites();
        });
        popover.present();
    }
    removeDiveSite(siteId) {
        const index = this.divingCenter.diveSites.findIndex((id) => id == siteId);
        this.divingCenter.diveSites.splice(index, 1);
        this.loadDivingCenterSites();
    }
    async save() {
        await DivingCentersService.updateDivingCenter(this.divingCenterId, this.divingCenter, this.userProfile.uid);
        return modalController.dismiss();
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: '5a90c9c76adc9a00b46d56ead64cea2c38fe0e28' }, h("ion-header", { key: 'f20c632051cd0aa42858db9541a7b57a68902e8d' }, h("app-upload-cover", { key: 'bee2e57464dd961be96cf227cc30cf7b6b3819b7', item: {
                collection: DIVECENTERSSCOLLECTION,
                id: this.divingCenterId,
                photoURL: this.divingCenter.photoURL,
                coverURL: this.divingCenter.coverURL,
            }, onCoverUploaded: (ev) => this.updateImageUrls(ev) })), h("app-header-segment-toolbar", { key: '43c859e4941cad9ffddba231211258c62b1bc68b', color: "divingcenter", swiper: this.slider, titles: this.titles }), h("ion-content", { key: 'f2ad42301642c42b6f6acc46493e61ca28580b58', class: "slides" }, h("swiper-container", { key: 'eed8c501beafa26912ad226d7bedd536d663a941', class: "slider-diving-center swiper" }, h("swiper-wrapper", { key: 'cdf347a4f1825e542fdd43ef6fb7ed8eb8349fbb', class: "swiper-wrapper" }, h("swiper-slide", { key: '5b5dac9f8d4ebcb6d697eeded536f85e40e8af7f', class: "swiper-slide" }, h("div", { key: '4b5eb8eebe8dfbd24fb592ccc2312855b3bf60c9', id: "map-container" }, h("app-map", { key: '392bfb55af917b06330ac4b49c22bc16a2392554', id: "map", pageId: "diving-center", draggableMarkerPosition: this.draggableMarkerPosition, onDragMarkerEnd: (ev) => this.updateLocation(ev) }))), h("swiper-slide", { key: '26e015354e649194d42400b3cf16048526106d7e', class: "swiper-slide" }, h("app-coordinates", { key: 'd066b6afe45bde4676a549e6a5a5c40688547972', coordinates: this.draggableMarkerPosition, onCoordinatesEmit: (ev) => this.updateLocation(ev), onAddressEmit: (ev) => this.updateAddress(ev) })), h("swiper-slide", { key: 'e21f4363d53a2af65a2d2ef86914ec50f18fcfd9', class: "swiper-slide" }, h("ion-list", { key: 'daa3aac453702863a527be8719ee32f0f6c7c094', class: "ion-no-padding" }, h("ion-list-header", { key: '16d745434d2a03d4e6745450d296a7a0ce1dc0c9' }, h("my-transl", { key: '61cc8de16701fb2e560ff1a1f5bc99552d7efd7a', tag: "general-information", text: "General Information", isLabel: true })), h("app-form-item", { key: 'e1eb8805c0ddf399eee9f91632c2104e0f6f4836', "label-tag": "name", "label-text": "Name", value: this.divingCenter.displayName, name: "displayName", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), onFormItemBlur: () => this.setTmpId(this.divingCenter.displayName), validator: ["required"] }), this.showDCId ? (h("app-form-item", { "label-tag": "unique-id", "label-text": "Unique ID", value: this.tmpDivingCenterId, name: "id", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), onIsValid: (ev) => this.uniqueIdValid(ev), validator: [
                "required",
                {
                    name: "uniqueid",
                    options: { type: DIVECENTERSSCOLLECTION },
                },
            ] })) : undefined, h("app-form-item", { key: 'cc8f4cfbb79b94731862937b9b42ccf415b61c3e', "label-tag": "description", "label-text": "Description", value: this.divingCenter.description, name: "description", textRows: 10, "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: 'd4515184fa61c0961af0e6d19bd2bb0afd869dc6', "label-tag": "phone", "label-text": "Phone", value: this.divingCenter.phoneNumber, name: "phoneNumber", "input-type": "tel", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), h("app-form-item", { key: '7f4246cd3629fdc3c00e45756dae512800fdb212', "label-tag": "email", "label-text": "Email", value: this.divingCenter.email, name: "email", "input-type": "email", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["email"] }), h("app-form-item", { key: '7dd8ca20f7fde32955864251863f3e2e37fe56d8', "label-tag": "website", "label-text": "Website", value: this.divingCenter.website, name: "website", "input-type": "url", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), this.divingCenter.website ? (h("a", { class: "ion-padding-start", href: "http://" + this.divingCenter.website, target: "_blank" }, "http://" + this.divingCenter.website)) : undefined, h("app-form-item", { key: 'd386302d829ffad2af150f43185bf550df16ecd4', "label-tag": "facebook-id", "label-text": "Facebook ID", value: this.divingCenter.facebook, name: "facebook", "input-type": "url", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), this.divingCenter.facebook ? (h("a", { class: "ion-padding-start", href: "https://www.facebook.com/" + this.divingCenter.facebook, target: "_blank" }, "https://www.facebook.com/" + this.divingCenter.facebook)) : undefined, h("app-form-item", { key: '18025fc07e56011ecb77cac9c7566322ea70ae70', "label-tag": "instagram-id", "label-text": "Instagram ID", value: this.divingCenter.instagram, name: "instagram", "input-type": "url", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), this.divingCenter.instagram ? (h("a", { class: "ion-padding-start", href: "https://www.instagram.com/" +
                this.divingCenter.instagram, target: "_blank" }, "https://www.instagram.com/" +
            this.divingCenter.instagram)) : undefined, h("app-form-item", { key: '42c41801b8061f5e26350c66e3f245b924fea216', "label-tag": "twitter id", "label-text": "Twitter ID", value: this.divingCenter.twitter, name: "twitter", "input-type": "url", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), this.divingCenter.twitter ? (h("a", { class: "ion-padding-start", href: "https://www.twitter.com/" + this.divingCenter.twitter, target: "_blank" }, "https://www.twitter.com/" + this.divingCenter.twitter)) : undefined)), h("swiper-slide", { key: '0857871d4201f057aba110b8e92c0a573b77e9c7', class: "swiper-slide" }, h("ion-grid", { key: '4f113f11ebaa5f61c78a04597fbddb84ab2feab2' }, h("ion-row", { key: '49523c50b645b8df651ab07700ccf88b8fe32cd4', class: "ion-text-start" }, this.diveSites.divingCenterSites.map((site) => (h("ion-col", { "size-sm": "12", "size-md": "6", "size-lg": "4" }, h("app-dive-site-card", { diveSite: site, startlocation: this.divingCenter, edit: true, onRemoveEmit: (ev) => this.removeDiveSite(ev.detail.value) })))), h("ion-col", { key: '529d7ee86a25aa22b08a7eaddb95245380d1eaf5', "size-sm": "12", "size-md": "6", "size-lg": "4" }, h("ion-card", { key: '3ca4edae6687993ef620c4c0c1252c642ee34065', onClick: () => this.openAddDiveSite() }, h("ion-card-content", { key: '91991ea48ca1411ab83d011f8bc095ce7af52df8', class: "ion-text-center" }, h("ion-icon", { key: '96a281810e1fcaca22989bca4b52426c65f44a0e', name: "add-circle-outline", style: { fontSize: "130px" } }))))))), h("swiper-slide", { key: 'e2c7b367189b2669975e2a1568e747c97f3772a0', class: "swiper-slide" }, h("app-users-list", { key: '3d58342a836be4accc3bb466b049b2f9d3363380', item: this.divingCenter, editable: true, show: ["owner", "editor"] }))))), h("app-modal-footer", { key: '907c80b96e8e7ba4f9ddeba886170301d72f341d', disableSave: !this.validDiveCenter, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalDivingCenterUpdate.style = modalDivingCenterUpdateCss;

export { ModalDivingCenterUpdate as modal_diving_center_update };

//# sourceMappingURL=modal-diving-center-update.entry.js.map