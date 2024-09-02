import { r as registerInstance, h } from './index-d515af00.js';
import { U as UserService, B as SystemService, R as RouterService, aw as CallableFunctionsUdiveService, S as SYSTEMCOLLECTION, ax as fabButtonTopMarginString } from './utils-5cd4c7bb.js';
import { l as lodash } from './lodash-68d560b6.js';
import './env-0a7fccce.js';
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
import './map-e64442d7.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const pageAdminAgenciesCss = "page-admin-agencies .cover{height:var(--coverHeight)}";

const PageAdminAgencies = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.selectedAgency = undefined;
        this.selectedAgencyCertifications = [];
        this.isUpdated = false;
        this.updateView = true;
    }
    componentWillLoad() {
        this.userRoles = UserService.userRoles;
        this.systemSub = SystemService.systemPreferences$.subscribe((prefs) => {
            this.agencies = [];
            Object.keys(prefs.divingAgencies).forEach((agencyId) => {
                //set only agencies allowed to this user
                if (this.userRoles.isSuperAdmin() ||
                    this.userRoles.roles.includes(agencyId.toLowerCase() + "-admin")) {
                    const agency = prefs.divingAgencies[agencyId];
                    agency.id = agencyId;
                    this.agencies.push(agency);
                }
            });
            if (!this.selectedAgency)
                this.selectedAgency = lodash.exports.cloneDeep(this.agencies[0]);
            this.createCertificationsArray();
        });
    }
    createCertificationsArray() {
        this.selectedAgencyCertifications = [];
        const certs = [];
        Object.keys(this.selectedAgency.certifications).map((key) => {
            let cert = this.selectedAgency.certifications[key];
            cert.id = key;
            certs.push(cert);
        });
        this.selectedAgencyCertifications = lodash.exports.orderBy(certs, "order");
    }
    disconnectedCallback() {
        this.systemSub.unsubscribe();
    }
    updateAgency(agencyId) {
        this.isUpdated = false;
        this.selectedAgency = lodash.exports.cloneDeep(this.agencies.find((agency) => agency.id == agencyId));
        this.createCertificationsArray();
    }
    handleChange(ev) {
        this.isUpdated = true;
        this.selectedAgency[ev.detail.name] = ev.detail.value;
    }
    async reorderCertifications(reorder) {
        this.isUpdated = true;
        const certs = lodash.exports.cloneDeep(this.selectedAgencyCertifications);
        const itemMove = certs.splice(reorder.detail.from, 1)[0];
        certs.splice(reorder.detail.to, 0, itemMove);
        certs.forEach((cert, order) => {
            cert.order = order;
        });
        reorder.detail.complete(certs);
        this.selectedAgencyCertifications = lodash.exports.orderBy(certs, "order");
    }
    async editCertification(key) {
        this.isUpdated = true;
        let cert = null;
        if (key === undefined) {
            cert = {
                id: null,
                maxDepth: 20,
                name: "",
                order: this.selectedAgencyCertifications
                    ? this.selectedAgencyCertifications.length
                    : 0,
                group: "",
            };
        }
        else {
            cert = lodash.exports.cloneDeep(this.selectedAgencyCertifications[key]);
        }
        const modal = await RouterService.openModal("modal-dive-certification-update", {
            agencyId: this.selectedAgency.id,
            diveCertification: cert,
        });
        modal.onDidDismiss().then((updatedCert) => {
            const cert = updatedCert.data;
            if (cert) {
                if (key === undefined) {
                    this.selectedAgencyCertifications.push(cert);
                }
                else {
                    this.selectedAgencyCertifications[key] = cert;
                }
                this.updateView = !this.updateView;
            }
        });
    }
    updateImageUrls(ev) {
        this.isUpdated = true;
        const imageType = ev.detail.type;
        const url = ev.detail.url;
        if (imageType == "photo") {
            this.selectedAgency.photoURL = url;
        }
        else {
            this.selectedAgency.coverURL = url;
        }
    }
    async save() {
        //update certifications
        this.selectedAgency.certifications = {};
        this.selectedAgencyCertifications.map((cert) => {
            this.selectedAgency.certifications[cert.id] = cert;
        });
        const res = await CallableFunctionsUdiveService.updateDivingAgency(this.selectedAgency.id, this.selectedAgency);
        if (res) {
            this.isUpdated = false;
        }
    }
    cancel() {
        this.isUpdated = false;
        this.updateAgency(this.selectedAgency.id);
    }
    render() {
        return [
            h("ion-header", { key: '8685f3bd5ac31526627d97dc64363875a210e582', class: "cover" }, h("app-upload-cover", { key: 'c7f6c8609c2f96f5000517e123ef8754d3f8359d', item: {
                    collection: SYSTEMCOLLECTION,
                    id: this.selectedAgency.id,
                    photoURL: this.selectedAgency.photoURL,
                    coverURL: this.selectedAgency.coverURL,
                }, onCoverUploaded: (ev) => this.updateImageUrls(ev) })),
            h("ion-content", { key: 'c16b997b505b7d0901b85dfd7679bd02f321484d' }, h("ion-fab", { key: '15b2541d3581ad8b2942ca939c5ddbf88b166a5a', vertical: "top", horizontal: "start", slot: "fixed", style: { marginTop: fabButtonTopMarginString(0) } }, h("ion-menu-button", { key: '034b73f2653e062b9d7ecb420652e8a038e31150', class: "fab-icon" })), h("ion-list", { key: 'f77cffdebb45968bd40821324d6e826c6d16e132' }, this.agencies.length > 0 ? (h("ion-item", null, h("ion-label", null, "Select Diving Agency"), h("ion-select", { value: this.selectedAgency.id, onIonChange: (ev) => this.updateAgency(ev.detail.value), interface: "popover" }, this.agencies.map((agency) => (h("ion-select-option", { value: agency.id }, agency.name)))))) : undefined, h("app-form-item", { key: 'c7407e3e8610fce5f916834acc3ac59c7994fee0', "label-tag": "name", "label-text": "Name", value: this.selectedAgency.name, name: "name", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: '67e9532ae4cadd90f7e57b27ee614952c65405b4', "label-tag": "website", "label-text": "Website", value: this.selectedAgency.website, name: "website", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] })), h("ion-list", { key: '3a74adb9381d73c51d17084c7f22372b35e9a30d' }, h("ion-list-header", { key: 'e173b0bce2ccaab7753c73ce4b4bd1ffc52e8c4d' }, h("ion-label", { key: '5f2f7378173942724a42a2cc1180316eae72f624' }, h("my-transl", { key: '21a5449ad4bfde0434e8ae17eef32acf12aaaa6b', tag: "certifications", text: "Certifications" })), h("ion-button", { key: 'c0ab962df5c1c5612e818c5ceb7d78a1c840b531', "icon-only": true, onClick: () => this.editCertification() }, h("ion-icon", { key: 'a9e823adeb4ec2144d565163570bbc169728e67d', name: "add-circle-outline" }))), h("ion-reorder-group", { key: '870e8d40775a4c0c733f2acc1f1185f2f5724a11', disabled: false, onIonItemReorder: (ev) => this.reorderCertifications(ev) }, this.selectedAgencyCertifications.map((cert, i) => (h("ion-item", null, cert.photoURL ? (h("ion-avatar", { slot: "start" }, h("img", { src: cert.photoURL }))) : undefined, h("ion-reorder", { slot: "end" }), h("ion-label", null, cert.order + 1, ". ", cert.name), h("ion-button", { "icon-only": true, fill: "clear", onClick: () => this.editCertification(i) }, h("ion-icon", { name: "create-outline" })))))))),
            this.isUpdated ? (h("app-modal-footer", { onSaveEmit: () => this.save(), onCancelEmit: () => this.cancel() })) : undefined,
        ];
    }
};
PageAdminAgencies.style = pageAdminAgenciesCss;

export { PageAdminAgencies as page_admin_agencies };

//# sourceMappingURL=page-admin-agencies.entry.js.map