import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { B as SystemService, a0 as DivePlanModel, S as SYSTEMCOLLECTION } from './utils-5cd4c7bb.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { E as Environment } from './env-0a7fccce.js';
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
import './_commonjsHelpers-1a56c7bc.js';
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';
import './framework-delegate-779ab78c.js';

const modalDiveCertificationUpdateCss = "modal-dive-certification-update ion-list{width:100%}";

const ModalDiveCertificationUpdate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.agencyId = undefined;
        this.diveCertification = undefined;
        this.validCert = false;
        this.newCert = false;
        this.updateView = false;
        this.titles = [{ tag: "details" }, { tag: "schedule" }];
        this.slider = undefined;
    }
    async componentWillLoad() {
        this.newCert = !this.diveCertification.id;
        this.certGroups =
            SystemService.systemPreferences.selectOptions.certificationGroups;
        //convert diveplans to models
        if (this.diveCertification.activities)
            this.diveCertification.activities = this.diveCertification.activities.map((activity) => {
                if (activity.divePlan)
                    activity.divePlan = new DivePlanModel(activity.divePlan);
                return activity;
            });
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-dive-cert", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: true,
            autoHeight: true,
        });
        this.validateCert();
    }
    handleCertChange(ev) {
        if (ev.detail.name == "maxDepth" || ev.detail.name == "numberOfStudents") {
            this.diveCertification[ev.detail.name] = lodash.exports.toNumber(ev.detail.value);
        }
        else {
            this.diveCertification[ev.detail.name] = ev.detail.value;
        }
        this.validateCert();
    }
    updateCertGroup(group) {
        this.diveCertification.group = group;
        this.validateCert();
    }
    uniqueIdValid(ev) {
        this.validCert = this.validCert && ev.detail;
    }
    updateImageUrls(ev) {
        const imageType = ev.detail.type;
        const url = ev.detail.url;
        if (imageType == "photo") {
            this.diveCertification.photoURL = url;
        }
        else {
            this.diveCertification.coverURL = url;
        }
    }
    validateCert() {
        this.validCert =
            lodash.exports.isString(this.diveCertification.id) &&
                lodash.exports.isString(this.diveCertification.name) &&
                this.diveCertification.numberOfStudents > 0 &&
                this.diveCertification.maxDepth > 0;
    }
    async save() {
        return modalController.dismiss(this.diveCertification);
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: 'b82f1f9681856c6f93a72615a9334159c92da738' }, h("ion-header", { key: 'ee2e7e2022864b9ea6544e6428a4dcfcffb9fffc' }, this.diveCertification.id ? (h("app-upload-cover", { item: {
                collection: SYSTEMCOLLECTION,
                id: this.agencyId + "-" + this.diveCertification.id,
                photoURL: this.diveCertification.photoURL,
                coverURL: this.diveCertification.coverURL,
            }, onCoverUploaded: (ev) => this.updateImageUrls(ev) })) : undefined), h("app-header-segment-toolbar", { key: '07ec075829ffedb2e1bbc5311c61672ac404a146', color: Environment.getAppColor(), swiper: this.slider, titles: this.titles }), h("ion-content", { key: '2d8e5d0b72058d484645bb8be2de1f8ccd531d44', class: "slides" }, h("swiper-container", { key: '9b5d8acf91975dbc8bea1430bfb572b389f5d673', class: "slider-dive-cert swiper" }, h("swiper-wrapper", { key: '0183505b1e2e6758879a11b6760ab201aaea4932', class: "swiper-wrapper" }, h("swiper-slide", { key: '3a17c0b9efe01fc5ed74e3e69c9f51a5ccf5fea2', class: "swiper-slide" }, h("ion-list", { key: 'f7b9c1ccf093fb337c8e7f4a8f8c8612dd81758e' }, h("app-form-item", { key: '9cc14a6cb3b5921868f61854f0d21724afe3d681', "label-tag": "unique-id", "label-text": "Unique ID", value: this.diveCertification.id, disabled: !this.newCert, name: "id", "input-type": "text", onFormItemChanged: (ev) => this.handleCertChange(ev), onIsValid: (ev) => this.uniqueIdValid(ev), validator: [
                "required",
                {
                    name: "uniqueid",
                    options: { type: null },
                },
            ] }), h("app-form-item", { key: '491cfbd4afe564d6f6ce0baad5f5f77b64ddcd68', "label-tag": "name", "label-text": "Name", value: this.diveCertification.name, name: "name", "input-type": "text", onFormItemChanged: (ev) => this.handleCertChange(ev), validator: ["required"] }), h("app-form-item", { key: '8b74302304d6fccf39209cddecd14f3805a84396', "label-tag": "max-depth", "label-text": "Max. Depth", value: lodash.exports.toString(this.diveCertification.maxDepth), name: "maxDepth", "input-type": "number", onFormItemChanged: (ev) => this.handleCertChange(ev), validator: ["required"] }), h("app-form-item", { key: '581fe4e6ad21a23f4a7ab9ea8c427f870289429a', "label-tag": "max-students", "label-text": "Max. number of students", value: lodash.exports.toString(this.diveCertification.numberOfStudents), name: "numberOfStudents", "input-type": "number", onFormItemChanged: (ev) => this.handleCertChange(ev), validator: ["required"] }), h("ion-item", { key: '9d545d057c87172cc8b00b022b6940d65864693f' }, h("ion-label", { key: '7f9fd35001b12b3384b1d0e1812e60ed5560b8b4' }, "Certification Group"), h("ion-select", { key: 'cf728d617e23a79fc53b04c81938a6187ebd5c74', value: this.diveCertification.group, onIonChange: (ev) => this.updateCertGroup(ev.detail.value), interface: "popover" }, this.certGroups.map((group) => (h("ion-select-option", { value: group.tag }, group.text))))))), h("swiper-slide", { key: '7b3e42019101e4f52d8f12a64a85b6e4f2577929', class: "swiper-slide" }, h("app-dive-course-activities", { key: '5552de6e33633b5c62eb111d8fb1e84926789c5c', schedule: this.diveCertification.activities, showDiveLocation: false, onScheduleEmit: (ev) => (this.diveCertification.activities = ev.detail), editable: true }))))), h("app-modal-footer", { key: 'b7cfcb7bd28f6ef335570195b9f1bee070ff7259', disableSave: !this.validCert, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalDiveCertificationUpdate.style = modalDiveCertificationUpdateCss;

export { ModalDiveCertificationUpdate as modal_dive_certification_update };

//# sourceMappingURL=modal-dive-certification-update.entry.js.map