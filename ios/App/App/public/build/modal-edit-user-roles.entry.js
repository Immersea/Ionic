import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { D as DatabaseService, af as USERROLESCOLLECTION, y as UserRoles } from './utils-5cd4c7bb.js';
import { E as Environment } from './env-0a7fccce.js';
import { T as TrasteelService } from './services-05a0dbfb.js';
import { m as modalController, b as actionSheetController } from './overlays-b3ceb97d.js';
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
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';
import './framework-delegate-779ab78c.js';

class UDiveServicesController {
    getUserRoles() {
        return ["registered", "translator", "superAdmin"];
    }
}
const UDiveService = new UDiveServicesController();

const modalEditUserRolesCss = "modal-edit-user-roles ion-list{width:100%}";

const ModalEditUserRoles = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.uid = undefined;
        this.userRoles = undefined;
        this.updateView = false;
    }
    async componentWillLoad() {
        const roles = await DatabaseService.getDocument(USERROLESCOLLECTION, this.uid);
        this.userRoles = new UserRoles(roles);
    }
    async save() {
        await DatabaseService.updateDocument(USERROLESCOLLECTION, this.uid, this.userRoles);
        modalController.dismiss();
    }
    async cancel() {
        modalController.dismiss();
    }
    async presentActionSheet() {
        let buttons = [];
        let roles = [];
        if (Environment.isTrasteel()) {
            roles = TrasteelService.getUserRoles();
        }
        else if (Environment.isDecoplanner() || Environment.isUdive()) {
            roles = UDiveService.getUserRoles();
        }
        roles.forEach((role) => {
            if (!this.userRoles.roles.includes(role)) {
                buttons.push({
                    text: role,
                    handler: () => {
                        this.userRoles.roles.push(role);
                        this.updateView = !this.updateView;
                    },
                });
            }
        });
        buttons.push({
            text: "Close",
            icon: "close",
            role: "cancel",
            handler: () => { },
        });
        const actionSheet = await actionSheetController.create({
            header: "Add",
            buttons: buttons,
        });
        await actionSheet.present();
    }
    updateLicense(license, ev) {
        this.userRoles.licences[license] = ev.detail.checked;
        this.updateView = !this.updateView;
    }
    handleChange(ev) {
        if (ev.detail.name == "fromDate") {
            this.userRoles.licences.trial.fromDate = new Date(ev.detail.value);
        }
        else {
            this.userRoles.licences.trial[ev.detail.name] = ev.detail.value;
        }
        this.updateView = !this.updateView;
    }
    deleteRole(index) {
        const el = this.itemSliding.getElementsByClassName("item-sliding-" + index)[0];
        el.closeOpened();
        this.userRoles.roles.splice(index, 1);
        this.updateView = !this.updateView;
    }
    render() {
        return (h(Host, { key: '0ea54a3531c997f8d62412f2a2fe92456794a316' }, h("ion-header", { key: '9ad67a145aea1d592943baca98991c6cd4120df6' }, h("ion-toolbar", { key: '7290c1b99481b81e85a09d3d06cb44d60b15e72d', color: Environment.getAppColor() }, h("ion-title", { key: 'a191af6fdf16fd7074fc0dd45c31b3698937a513' }, "User Roles Manager"))), h("ion-content", { key: '6d23c0e5df067d05428e223c6f3b48143e8a03d2' }, h("ion-list", { key: 'e48abea7d33eadead13cda3e4f503563ce5df88b' }, h("ion-item", { key: '97816ffc3408692549947b7ca6c64415c781d50d' }, "uid: ", this.userRoles.uid), h("ion-item", { key: 'daee167c7e45b33fce39ce7fdcc67699dea3c222' }, "email: ", this.userRoles.email), !Environment.isTrasteel &&
            Object.keys(this.userRoles.licences).length > 0
            ? [
                h("ion-item-divider", null, "User Licences"),
                Object.keys(this.userRoles.licences).map((license) => license == "trial"
                    ? [
                        h("ion-item-divider", null, h("ion-label", null, "Trial")),
                        h("app-form-item", { "label-tag": "duration", "label-text": "Duration", value: this.userRoles.licences.trial.duration, name: "duration", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }),
                        h("app-form-item", { "label-tag": "fromDate", "label-text": "From Date", value: this.userRoles.licences.trial.fromDate !== null
                                ? this.userRoles.licences.trial.fromDate.toISOString()
                                : new Date().toISOString(), name: "fromDate", "input-type": "date", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }),
                        h("app-form-item", { "label-tag": "level", "label-text": "Level", value: this.userRoles.licences.trial.level, name: "level", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }),
                        h("ion-item", null, h("ion-label", null, h("p", null, "Trial Days:", " ", this.userRoles.licences.trialDays()))),
                    ]
                    : [
                        h("ion-item", null, h("ion-label", null, license), h("ion-toggle", { slot: "end", onIonChange: (ev) => this.updateLicense(license, ev), checked: this.userRoles.licences[license] })),
                    ]),
            ]
            : null), h("ion-list", { key: 'aa597fc9b9347e9653629e95c23d389b79a46c47' }, h("ion-item-divider", { key: 'bca845247d9276d23e748f9d07945de46dd1be73' }, "User Roles"), this.userRoles.roles.map((role, index) => (h("ion-item-sliding", { class: "item-sliding-" + index }, h("ion-item", null, h("ion-label", null, role)), h("ion-item-options", null, h("ion-item-option", { color: "danger", onClick: () => this.deleteRole(index) }, "Delete"))))), h("ion-item", { key: 'd77423bf32a6bb3360d9ef3b83920bea77543019', button: true, onClick: () => this.presentActionSheet() }, h("ion-icon", { key: '51e24369742912e8bf29bf39c537b047a3c3ade8', name: "add" }), h("ion-label", { key: 'b9b170d8b6c9698f3c520ec877705193db88b48a' }, "Add")))), h("app-modal-footer", { key: '77a3ba94286289b5ac7c25841451ea065a7ec3ec', color: Environment.getAppColor(), onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get itemSliding() { return getElement(this); }
};
ModalEditUserRoles.style = modalEditUserRolesCss;

export { ModalEditUserRoles as modal_edit_user_roles };

//# sourceMappingURL=modal-edit-user-roles.entry.js.map