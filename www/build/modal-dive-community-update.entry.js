import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { U as UserService, w as UserProfile, z as UserSettings, p as DiveCommunitiesService, a1 as DiveCommunity, a2 as mapHeight, o as DIVECOMMUNITIESCOLLECTION } from './utils-ced1e260.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { m as modalController } from './overlays-b3ceb97d.js';
import './env-c3ad5e77.js';
import './ionic-global-c07767bf.js';
import './map-fe092362.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
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

const modalDiveCommunityUpdateCss = "modal-dive-community-update ion-list{width:100%}";

const ModalDiveCommunityUpdate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.titles = [
            { tag: "map" },
            { tag: "position" },
            { tag: "information" },
            { tag: "team" },
        ];
        this.stdConfigurations = [];
        this.diveCommunityId = undefined;
        this.diveCommunity = undefined;
        this.updateView = true;
        this.validDiveCommunity = false;
        this.tmpDiveCommunityId = undefined;
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
        await this.loadDiveCommunity();
    }
    async loadDiveCommunity() {
        if (this.diveCommunityId) {
            this.showDCId = false;
            this.tmpDiveCommunityId = this.diveCommunityId;
            this.diveCommunity = await DiveCommunitiesService.getDiveCommunity(this.diveCommunityId);
            this.draggableMarkerPosition = {
                lat: this.diveCommunity.position.geopoint.latitude,
                lon: this.diveCommunity.position.geopoint.longitude,
            };
        }
        else {
            this.showDCId = true;
            this.diveCommunity = new DiveCommunity();
            this.diveCommunity.users = {
                [UserService.userRoles.uid]: ["owner"],
            };
            this.draggableMarkerPosition = {};
        }
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-dive-community-modal", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
        });
        //reset map height inside slide
        await customElements.whenDefined("app-map");
        this.mapElement = this.el.querySelector("#map");
        const mapContainer = this.el.querySelector("#map-container");
        mapContainer.setAttribute("style", "height: " + mapHeight(this.diveCommunity.coverURL, true) + "px"); //-cover photo -slider  - footer
        this.mapElement["mapLoaded"]().then(() => {
            this.mapElement.triggerMapResize();
        });
        this.mapElement.triggerMapResize();
        this.validateDiveCommunity();
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
        this.diveCommunity.setPosition(ev.detail.lat, ev.detail.lon);
        this.validateDiveCommunity();
    }
    updateAddress(ev) {
        this.diveCommunity.setAddress(ev.detail);
    }
    handleChange(ev) {
        if (ev.detail.name == "facebook" ||
            ev.detail.name == "instagram" ||
            ev.detail.name == "twitter" ||
            ev.detail.name == "website" ||
            ev.detail.name == "email") {
            const val = lodash.exports.toLower(ev.detail.value).split(" ").join("-");
            this.diveCommunity[ev.detail.name] = val;
        }
        else if (ev.detail.name == "id") {
            this.setTmpId(ev.detail.value);
        }
        else {
            this.diveCommunity[ev.detail.name] = ev.detail.value;
        }
        this.updateView = !this.updateView;
        this.validateDiveCommunity();
    }
    setTmpId(value) {
        this.tmpDiveCommunityId = lodash.exports.toLower(value)
            .trim()
            .split(" ")
            .join("-")
            .substring(0, 16);
    }
    updateImageUrls(ev) {
        const imageType = ev.detail.type;
        const url = ev.detail.url;
        if (imageType == "photo") {
            this.diveCommunity.photoURL = url;
        }
        else {
            this.diveCommunity.coverURL = url;
        }
    }
    uniqueIdValid(ev) {
        if (ev.detail) {
            this.diveCommunityId = this.tmpDiveCommunityId;
        }
        else {
            this.diveCommunityId = null;
        }
    }
    validateDiveCommunity() {
        this.validDiveCommunity =
            this.diveCommunity.position &&
                lodash.exports.isNumber(this.diveCommunity.position.geopoint.latitude) &&
                lodash.exports.isNumber(this.diveCommunity.position.geopoint.longitude) &&
                lodash.exports.isString(this.diveCommunityId) &&
                lodash.exports.isString(this.diveCommunity.displayName) &&
                lodash.exports.isString(this.diveCommunity.description);
    }
    async save() {
        await DiveCommunitiesService.updateDiveCommunity(this.diveCommunityId, this.diveCommunity, this.userProfile.uid);
        return modalController.dismiss();
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: 'ebb47131b6aaa0c135bfe03686fa8894fca37b3d' }, h("ion-header", { key: 'e5c9bc45e699aa5f0e6dbf2a0c73f7dcb95db760' }, h("app-upload-cover", { key: 'f3dd52e10544b9c56581b50fb25e2fde218991d2', item: {
                collection: DIVECOMMUNITIESCOLLECTION,
                id: this.diveCommunityId,
                photoURL: this.diveCommunity.photoURL,
                coverURL: this.diveCommunity.coverURL,
            }, onCoverUploaded: (ev) => this.updateImageUrls(ev) })), h("app-header-segment-toolbar", { key: '241c9d1fea9aab8b109162e87d0fbae07abff5cc', color: "divecommunities", swiper: this.slider, titles: this.titles }), h("ion-content", { key: '8335e1110aba1c6f4684d88535763d5a7eee3c36', class: "slides" }, h("swiper-container", { key: '4e6a1cf285021aa4b46a469bee6cd06829310373', class: "slider-dive-community-modal swiper" }, h("swiper-wrapper", { key: 'd42098a6d0c596fe398e79bb67db566d97cbf115', class: "swiper-wrapper" }, h("swiper-slide", { key: 'b11b9e0fd8487b70b14ccef12163c260d8dc45d8', class: "swiper-slide" }, h("div", { key: 'db5bb01cbe834a761c840fdb3ebb4b2f983781ed', id: "map-container" }, h("app-map", { key: 'b2d7c708d8d12589570940be75e2852bfc5339b2', id: "map", pageId: "dive-community", draggableMarkerPosition: this.draggableMarkerPosition, onDragMarkerEnd: (ev) => this.updateLocation(ev) }))), h("swiper-slide", { key: '3b3174e2cb830f9d6404f529a50f9a720248ef3a', class: "swiper-slide" }, h("app-coordinates", { key: 'dd9908f00fab913246f606421916a8691c7749bd', coordinates: this.draggableMarkerPosition, onCoordinatesEmit: (ev) => this.updateLocation(ev), onAddressEmit: (ev) => this.updateAddress(ev) })), h("swiper-slide", { key: '30280229986e7af65d9bef87b1f9b8a62160639f', class: "swiper-slide" }, h("ion-list", { key: '62ddf2f564e6fdb1e6df2b8efb392b0b5e14faf0', class: "ion-no-padding" }, h("ion-list-header", { key: '795b881521dcf32f0f4d0b7fddd72dccf87954d7' }, h("my-transl", { key: 'efc8498729e46d282dfedc589b897866f926c332', tag: "general-information", text: "General Information", isLabel: true })), h("app-form-item", { key: '26ae9898fc6e89d357a4e74a892f7e871851f0fb', "label-tag": "name", "label-text": "Name", value: this.diveCommunity.displayName, name: "displayName", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), onFormItemBlur: () => this.setTmpId(this.diveCommunity.displayName), validator: ["required"] }), this.showDCId ? (h("app-form-item", { "label-tag": "unique-id", "label-text": "Unique ID", value: this.tmpDiveCommunityId, name: "id", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), onIsValid: (ev) => this.uniqueIdValid(ev), validator: [
                "required",
                {
                    name: "uniqueid",
                    options: { type: DIVECOMMUNITIESCOLLECTION },
                },
            ] })) : undefined, h("app-form-item", { key: '2ad2e05c0ed0132cb2a19aba8620ae6a2282a780', "label-tag": "description", "label-text": "Description", value: this.diveCommunity.description, name: "description", textRows: 10, "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: '11a7552579c8d8a04ebe8dd08668bbc494d2a76e', "label-tag": "phone", "label-text": "Phone", value: this.diveCommunity.phoneNumber, name: "phoneNumber", "input-type": "tel", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), h("app-form-item", { key: '92367a499cb685c68f98635e262722be9d32392b', "label-tag": "email", "label-text": "Email", value: this.diveCommunity.email, name: "email", "input-type": "email", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["email"] }), h("app-form-item", { key: 'b3e67bf4463134fe68f4334eca9ffbe33990c6fb', "label-tag": "website", "label-text": "Website", value: this.diveCommunity.website, name: "website", "input-type": "url", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), this.diveCommunity.website ? (h("a", { class: "ion-padding-start", href: "http://" + this.diveCommunity.website, target: "_blank" }, "http://" + this.diveCommunity.website)) : undefined, h("app-form-item", { key: '0594c794dfdf08670eb4e2d017112aa1eae3363d', "label-tag": "facebook-id", "label-text": "Facebook ID", value: this.diveCommunity.facebook, name: "facebook", "input-type": "url", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), this.diveCommunity.facebook ? (h("a", { class: "ion-padding-start", href: "https://www.facebook.com/" +
                this.diveCommunity.facebook, target: "_blank" }, "https://www.facebook.com/" +
            this.diveCommunity.facebook)) : undefined, h("app-form-item", { key: 'ab43d16f7cfd22bedaa6fae2e721475d51a90eb2', "label-tag": "instagram-id", "label-text": "Instagram ID", value: this.diveCommunity.instagram, name: "instagram", "input-type": "url", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), this.diveCommunity.instagram ? (h("a", { class: "ion-padding-start", href: "https://www.instagram.com/" +
                this.diveCommunity.instagram, target: "_blank" }, "https://www.instagram.com/" +
            this.diveCommunity.instagram)) : undefined, h("app-form-item", { key: '1c42b4e35ddf7f3554a4bee19aae3c84ac162890', "label-tag": "twitter id", "label-text": "Twitter ID", value: this.diveCommunity.twitter, name: "twitter", "input-type": "url", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), this.diveCommunity.twitter ? (h("a", { class: "ion-padding-start", href: "https://www.twitter.com/" + this.diveCommunity.twitter, target: "_blank" }, "https://www.twitter.com/" + this.diveCommunity.twitter)) : undefined)), h("swiper-slide", { key: '3ea51aee31e7d33270e9deacd26c939698ee147a', class: "swiper-slide" }, h("app-users-list", { key: '8afa2ebf7bf80864d1286385dbb1f7d36bc70e83', item: this.diveCommunity, editable: true, show: ["owner", "editor"] }))))), h("app-modal-footer", { key: '3a358e13ed6c11bfff0e41df63c449a49c63e3da', disableSave: !this.validDiveCommunity, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalDiveCommunityUpdate.style = modalDiveCommunityUpdateCss;

export { ModalDiveCommunityUpdate as modal_dive_community_update };

//# sourceMappingURL=modal-dive-community-update.entry.js.map