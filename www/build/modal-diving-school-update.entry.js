import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { U as UserService, w as UserProfile, n as DivingSchoolsService, ae as DivingSchool, a2 as mapHeight, m as DIVESCHOOLSSCOLLECTION } from './utils-cbf49763.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { p as popoverController, m as modalController } from './overlays-b3ceb97d.js';
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

const modalDivingSchoolUpdateCss = "modal-diving-school-update ion-list{width:100%}";

const ModalDivingSchoolUpdate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.divingSchoolId = undefined;
        this.divingSchool = undefined;
        this.updateView = true;
        this.validDivingSchool = false;
        this.schoolCourses = [];
        this.tmpDivingSchoolId = undefined;
        this.showDCId = false;
        this.titles = [
            { tag: "map" },
            { tag: "position" },
            { tag: "information" },
            { tag: "diving-courses", text: "Diving Courses" },
            { tag: "team" },
        ];
        this.slider = undefined;
    }
    async componentWillLoad() {
        this.userProfileSub$ = UserService.userProfile$.subscribe((userProfile) => {
            this.userProfile = new UserProfile(userProfile);
        });
        await this.loadDivingSchool();
    }
    async loadDivingSchool() {
        if (this.divingSchoolId) {
            this.divingSchool = await DivingSchoolsService.getDivingSchool(this.divingSchoolId);
            this.draggableMarkerPosition = {
                lat: this.divingSchool.position.geopoint.latitude,
                lon: this.divingSchool.position.geopoint.longitude,
            };
        }
        else {
            this.divingSchool = new DivingSchool();
            this.divingSchool.users = {
                [UserService.userRoles.uid]: ["owner"],
            };
            this.draggableMarkerPosition = {};
        }
        this.loadDivingSchoolCourses();
    }
    async loadDivingSchoolCourses() {
        this.schoolCourses = [];
        //settimeout necessary to refresh cards
        setTimeout(async () => {
            this.divingCourses = await DivingSchoolsService.loadDivingSchoolCourses(this.divingSchool);
            this.divingCourses.divingSchoolCourses.forEach((course) => {
                this.schoolCourses.push(course);
            });
            this.updateView = !this.updateView;
        }, 10);
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-diving-school", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
        });
        //reset map height inside slide
        await customElements.whenDefined("app-map");
        this.mapElement = this.el.querySelector("#map");
        const mapContainer = this.el.querySelector("#map-container");
        mapContainer.setAttribute("style", "height: " + mapHeight(this.divingSchool, true) + "px"); //-cover photo -slider  - footer
        this.mapElement["mapLoaded"]().then(() => {
            this.mapElement.triggerMapResize();
        });
        this.mapElement.triggerMapResize();
        this.validateDiveSchool();
    }
    disconnectedCallback() {
        this.userProfileSub$.unsubscribe();
    }
    updateLocation(ev) {
        this.draggableMarkerPosition = {
            lat: lodash.exports.toNumber(ev.detail.lat),
            lon: lodash.exports.toNumber(ev.detail.lon),
        };
        this.divingSchool.setPosition(ev.detail.lat, ev.detail.lon);
        this.validateDiveSchool();
    }
    updateAddress(ev) {
        this.divingSchool.setAddress(ev.detail);
    }
    handleChange(ev) {
        if (ev.detail.name == "facebook" ||
            ev.detail.name == "instagram" ||
            ev.detail.name == "twitter" ||
            ev.detail.name == "website" ||
            ev.detail.name == "email") {
            const val = lodash.exports.toLower(ev.detail.value).split(" ").join("-");
            this.divingSchool[ev.detail.name] = val;
        }
        else if (ev.detail.name == "id") {
            this.setTmpId(ev.detail.value);
        }
        else {
            this.divingSchool[ev.detail.name] = ev.detail.value;
        }
        this.updateView = !this.updateView;
        this.validateDiveSchool();
    }
    setTmpId(value) {
        this.tmpDivingSchoolId = lodash.exports.toLower(value)
            .trim()
            .split(" ")
            .join("-")
            .substring(0, 16);
    }
    uniqueIdValid(ev) {
        if (ev.detail) {
            this.divingSchoolId = this.tmpDivingSchoolId;
        }
        else {
            this.divingSchoolId = null;
        }
    }
    updateImageUrls(ev) {
        const imageType = ev.detail.type;
        const url = ev.detail.url;
        if (imageType == "photo") {
            this.divingSchool.photoURL = url;
        }
        else {
            this.divingSchool.coverURL = url;
        }
    }
    validateDiveSchool() {
        this.validDivingSchool =
            lodash.exports.isNumber(this.divingSchool.position.geopoint.latitude) &&
                lodash.exports.isNumber(this.divingSchool.position.geopoint.longitude) &&
                lodash.exports.isString(this.divingSchool.displayName) &&
                lodash.exports.isString(this.divingSchool.description);
    }
    async openAddDiveCourse() {
        const popover = await popoverController.create({
            component: "popover-search-diving-course",
            translucent: true,
        });
        popover.onDidDismiss().then((ev) => {
            const course = ev.data;
            if (course && course.certificationId) {
                this.divingSchool.divingCourses.push(course);
                this.loadDivingSchoolCourses();
            }
        });
        popover.present();
    }
    removeDiveCourse(removeCourse) {
        const index = this.divingSchool.divingCourses.findIndex((course) => course.agencyId === removeCourse.agencyId &&
            course.certificationId === removeCourse.certificationId);
        this.divingSchool.divingCourses.splice(index, 1);
        this.loadDivingSchoolCourses();
    }
    async save() {
        await DivingSchoolsService.updateDivingSchool(this.divingSchoolId, this.divingSchool, this.userProfile.uid);
        return modalController.dismiss();
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: 'f1b65e3c91835ff6d6d9ad787434f79339345b47' }, h("ion-header", { key: 'c9baa93e1d564a60dd335ea78733554aa28ad601' }, h("app-upload-cover", { key: '8273d07c4990059c7e352e31db3361203771afbf', item: {
                collection: DIVESCHOOLSSCOLLECTION,
                id: this.divingSchoolId,
                photoURL: this.divingSchool.photoURL,
                coverURL: this.divingSchool.coverURL,
            }, onCoverUploaded: (ev) => this.updateImageUrls(ev) })), h("app-header-segment-toolbar", { key: 'fc255db0b92821aec656c55c0046dbf9c90f8a2a', color: "divingschool", swiper: this.slider, titles: this.titles }), h("ion-content", { key: '86c71d1c5f122f6c1d2f56f716096efe04409a2f', class: "slides" }, h("swiper-container", { key: '723b42fbd629530cb245b17d33ba418d53258e4e', class: "slider-diving-school swiper" }, h("swiper-wrapper", { key: '53550aa70a6f51dba5b09cfd88ffd838216d7a6a', class: "swiper-wrapper" }, h("swiper-slide", { key: '9d5164f0b1921678762ae56e22607007bbe98367', class: "swiper-slide" }, h("div", { key: 'f085def93057228d2cd4e855b244ded5df0a958a', id: "map-container" }, h("app-map", { key: '60b79db5817deccb090549e33849c24886c64515', id: "map", pageId: "dive-sites", draggableMarkerPosition: this.draggableMarkerPosition, onDragMarkerEnd: (ev) => this.updateLocation(ev) }))), h("swiper-slide", { key: '537f2a4b2e36c664bd03582e21e1144b8e846578', class: "swiper-slide" }, h("app-coordinates", { key: '43ffc1758720e4dea73a245d8f92b987aa9b135a', coordinates: this.draggableMarkerPosition, onCoordinatesEmit: (ev) => this.updateLocation(ev), onAddressEmit: (ev) => this.updateAddress(ev) })), h("swiper-slide", { key: 'e15f302b71bd8300274c9c25e91cad6f776ba326', class: "swiper-slide" }, h("ion-list", { key: '9d4614a46f88c826f4f08cb6d56ed9293fdf1652', class: "ion-no-padding" }, h("ion-list-header", { key: '4f0dea25ad37b03703361ee468cbae5149135266' }, h("my-transl", { key: '6b2f378842fa9a168e7089e08a42b03e6008fd83', tag: "general-information", text: "General Information", isLabel: true })), h("app-form-item", { key: '461b5d78df539bebc66f45fc424c523b8fc82151', "label-tag": "name", "label-text": "Name", value: this.divingSchool.displayName, name: "displayName", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), this.showDCId ? (h("app-form-item", { "label-tag": "unique-id", "label-text": "Unique ID", value: this.tmpDivingSchoolId, name: "id", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), onIsValid: (ev) => this.uniqueIdValid(ev), validator: [
                "required",
                {
                    name: "uniqueid",
                    options: { type: DIVESCHOOLSSCOLLECTION },
                },
            ] })) : undefined, h("app-form-item", { key: 'f3fffefcc7cdda23bc14eeaac2d4b6ff44758a5e', "label-tag": "description", "label-text": "Description", value: this.divingSchool.description, name: "description", textRows: 10, "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: '423f1cddf6bf6de1ef4294ac505f18a0ffd3d2d1', "label-tag": "phone", "label-text": "Phone", value: this.divingSchool.phoneNumber, name: "phoneNumber", "input-type": "tel", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), h("app-form-item", { key: 'bb19213b1f6e5fcf8729d019f9aedfa1555e92a6', "label-tag": "email", "label-text": "Email", value: this.divingSchool.email, name: "email", "input-type": "email", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["email"] }), h("app-form-item", { key: 'fb5337bf6e9f1c0ac483eebaa73465fadc5ef758', "label-tag": "website", "label-text": "Website", value: this.divingSchool.website, name: "website", "input-type": "url", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), this.divingSchool.website ? (h("a", { class: "ion-padding-start", href: "http://" + this.divingSchool.website, target: "_blank" }, "http://" + this.divingSchool.website)) : undefined, h("app-form-item", { key: '1838eb2c153cf2b4903e857a1ac57f3115798cbf', "label-tag": "facebook-id", "label-text": "Facebook ID", value: this.divingSchool.facebook, name: "facebook", "input-type": "url", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), this.divingSchool.facebook ? (h("a", { class: "ion-padding-start", href: "https://www.facebook.com/" + this.divingSchool.facebook, target: "_blank" }, "https://www.facebook.com/" + this.divingSchool.facebook)) : undefined, h("app-form-item", { key: 'f7887e2421bdd77a30340dd932bcd389775f5cd6', "label-tag": "instagram-id", "label-text": "Instagram ID", value: this.divingSchool.instagram, name: "instagram", "input-type": "url", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), this.divingSchool.instagram ? (h("a", { class: "ion-padding-start", href: "https://www.instagram.com/" +
                this.divingSchool.instagram, target: "_blank" }, "https://www.instagram.com/" +
            this.divingSchool.instagram)) : undefined, h("app-form-item", { key: '5b4a050002adeb8311a89e320cb0e3b251cf77d3', "label-tag": "twitter id", "label-text": "Twitter ID", value: this.divingSchool.twitter, name: "twitter", "input-type": "url", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), this.divingSchool.twitter ? (h("a", { class: "ion-padding-start", href: "https://www.twitter.com/" + this.divingSchool.twitter, target: "_blank" }, "https://www.twitter.com/" + this.divingSchool.twitter)) : undefined)), h("swiper-slide", { key: '5af4ef4387e47719b82f61acd2639ab17f06f7e3', class: "swiper-slide" }, h("ion-grid", { key: 'd0a2c6588fdf224d6392d4c8f6c208ec53b67ae4' }, h("ion-row", { key: 'e38d3142f03d827d26d42b65b5800f1ab5cde65d', class: "ion-text-start" }, this.schoolCourses.map((course) => (h("ion-col", { "size-sm": "12", "size-md": "6", "size-lg": "4" }, h("app-dive-course-card", { divingCourse: course, edit: true, onRemoveEmit: (ev) => this.removeDiveCourse(ev.detail) })))), h("ion-col", { key: '6c0a0889699628f175342f0f4e5d91622906cd95', "size-sm": "12", "size-md": "6", "size-lg": "4" }, h("ion-card", { key: '943f5f0f8e15d2b902f03a7d5f446c16d6a7af4d', onClick: () => this.openAddDiveCourse() }, h("ion-card-content", { key: '4f8038e1948ef5922037be7c65daff85cd502de8', class: "ion-text-center" }, h("ion-icon", { key: '91f8cf4ee4d850a0323a96c338ac0e7a0f6bdb92', name: "add-circle-outline", style: { fontSize: "130px" } }))))))), h("swiper-slide", { key: 'a57a05afd68172f5b83c49610fa9fea769418c78', class: "swiper-slide" }, h("app-users-list", { key: 'ded366b782674058e611506953f0e60fc3833f0d', item: this.divingSchool, editable: true, show: ["owner", "editor", "instructor"] }))))), h("app-modal-footer", { key: 'fea4024916b90899b064adf37f54dc99ebaecee0', disableSave: !this.validDivingSchool, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalDivingSchoolUpdate.style = modalDivingSchoolUpdateCss;

export { ModalDivingSchoolUpdate as modal_diving_school_update };

//# sourceMappingURL=modal-diving-school-update.entry.js.map