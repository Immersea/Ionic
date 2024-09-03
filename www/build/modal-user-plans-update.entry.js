import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { E as Environment } from './env-c3ad5e77.js';
import { U as UserPlans, a as UserPlan, P as PlanOfAction, b as ProductLines } from './user-plans-3e6cb6aa.js';
import { U as UserPlansService } from './user-plans-67602bbd.js';
import { U as UserService, j as CustomersService, T as TranslationService } from './utils-ced1e260.js';
import { l as lodash } from './lodash-68d560b6.js';
import { a as alertController, m as modalController } from './overlays-b3ceb97d.js';
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

const modalUserPlansUpdateCss = "modal-user-plans-update ion-list{width:100%}";

const ModalUserPlansUpdate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.uid = undefined;
        this.userPlans = new UserPlans();
        this.planIndex = undefined;
        this.userPlan = new UserPlan();
        this.validPlan = false;
        this.selectedCustomer = undefined;
        this.updateView = false;
    }
    async componentWillLoad() {
        //apply uid
        if (!this.uid)
            this.uid = UserService.userProfile.uid;
        if (this.planIndex >= 0) {
            this.userPlan = lodash.exports.cloneDeep(this.userPlans.userPlans[this.planIndex]);
            this.selectedCustomer = CustomersService.getCustomersDetails(this.userPlan.customerId);
        }
        else {
            this.userPlan = new UserPlan();
        }
    }
    async componentDidLoad() {
        this.validatePlan();
    }
    async openSelectCustomer() {
        const cust = await CustomersService.openSelectCustomer(this.selectedCustomer);
        if (cust) {
            this.userPlan.customerId = cust.id;
            this.selectedCustomer = cust;
        }
    }
    addAction() {
        this.userPlan.planOfActions.push(new PlanOfAction());
        this.validatePlan();
    }
    handleOtherChange(ev) {
        this.userPlan.otherName = ev.detail.value;
        this.validatePlan();
    }
    handleChange(action, ev) {
        action[ev.detail.name] = ev.detail.value;
        action.updated = new Date().toISOString();
        this.validatePlan();
    }
    removePlan(index) {
        this.userPlan.planOfActions.splice(index, 1);
        this.validatePlan();
    }
    async deletePlan() {
        const alert = await alertController.create({
            header: TranslationService.getTransl("delete-plan", "Delete Plan"),
            message: TranslationService.getTransl("delete-plan-message", "This plan will be deleted! Are you sure?"),
            buttons: [
                {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: async () => {
                        this.save(true);
                    },
                },
                {
                    text: TranslationService.getTransl("cancel", "Cancel"),
                    handler: async () => { },
                },
            ],
        });
        alert.present();
    }
    validatePlan() {
        this.validPlan = true;
        this.validPlan =
            this.validPlan &&
                (this.userPlan.customerId != null || this.userPlan.otherName != null);
        let actions = this.userPlan.planOfActions.length > 0;
        this.userPlan.planOfActions.forEach((action) => {
            actions = actions && action.dueDate != null;
            actions = actions && action.updated != null;
            actions = actions && action.product != null;
            actions = actions && action.plan != null;
            actions = actions && action.situation != null;
        });
        this.validPlan = this.validPlan && actions;
        this.updateView = !this.updateView;
    }
    async save(del = false) {
        if (!this.userPlans.users) {
            this.userPlans.users = {};
            this.userPlans.users[this.uid] = ["owner"];
        }
        if (this.planIndex >= 0 && this.userPlan.planOfActions.length == 0) {
            //delete if no plans
            del = true;
        }
        if (this.planIndex >= 0 && !del) {
            this.userPlans.userPlans[this.planIndex] = this.userPlan;
        }
        else if (del) {
            this.userPlans.userPlans.splice(this.planIndex);
        }
        else {
            this.userPlans.userPlans.push(this.userPlan);
        }
        await UserPlansService.updateUserPlan(this.uid, this.userPlans);
        modalController.dismiss();
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: '4cd1f08a50ba50d676ba736821cfb95ad976d6e3' }, h("ion-header", { key: '24974f52994e212032727d86b78687470b0e4ab9' }, h("ion-toolbar", { key: '286b372a238d09faaa2fbc668f3f9635ed62e5f6', color: "trasteel" }, h("ion-title", { key: '992cd49623402ef2a60e9dbcaa92e6f89265797d' }, h("my-transl", { key: '0f81ef455c998f84b81e896519ff658c7edd2fa5', tag: "plan-of-actions", text: "Plan of Actions" })))), h("ion-content", { key: '33ea8d4acb88f7025a1696e39299148c593931ab' }, h("ion-list", { key: '0f6ada81455e784c123c3a142a6172824f951970' }, this.userPlan.otherName == null ? (h("ion-item", { button: true, lines: "inset", onClick: () => this.openSelectCustomer() }, h("ion-label", null, h("p", { class: "small" }, h("my-transl", { tag: "customer", text: "Customer" }), "*"), h("h2", null, this.selectedCustomer
            ? this.selectedCustomer.fullName
            : null)))) : undefined, this.userPlan.customerId == null &&
            this.userPlan.otherName == null ? (h("ion-item-divider", null, h("ion-label", null, "- or -"))) : undefined, this.userPlan.customerId == null ? (h("app-form-item", { lines: "inset", "label-tag": "other", "label-text": "Other", value: this.userPlan.otherName, name: "otherName", "input-type": "string", onFormItemChanged: (ev) => this.handleOtherChange(ev) })) : undefined, h("ion-button", { key: '260f6c6d4a5f14bb2ed316758a81806497f6496d', color: "trasteel", fill: "outline", expand: "full", disabled: this.userPlan.customerId == null &&
                this.userPlan.otherName == null, onClick: () => {
                this.addAction();
            } }, h("ion-icon", { key: '2e2b43b88516680f4249e179cf73ceda3cc78231', name: "add", slot: "start" }), h("ion-label", { key: '532fb07911822ee33554d66da9299440b3d91e86' }, h("my-transl", { key: 'e6a4e95835cb97dcac3a640927a96016f545acd2', tag: "add-action", text: "Add Action" }))), h("ion-grid", { key: '1b5a1af7b9fc38333d91021c6d0c1f4fc65baefe' }, this.userPlan.planOfActions.map((action, index) => [
            h("ion-row", null, h("ion-col", null, h("ion-select", { color: "trasteel", id: "application", interface: "action-sheet", label: TranslationService.getTransl("product", "Product"), "label-placement": "floating", onIonChange: (ev) => {
                    action.product = ev.detail.value;
                    this.validatePlan();
                }, value: action.product }, Object.keys(ProductLines).map((line) => (h("ion-select-option", { value: line }, ProductLines[line]))))), h("ion-col", { size: "3" }, h("app-form-item", { lines: "inset", "label-tag": "due-date", "label-text": "Due Date", value: action.dueDate, name: "dueDate", "input-type": "date", "date-presentation": "date", onFormItemChanged: (ev) => this.handleChange(action, ev), validator: ["required"] })), h("ion-col", { size: "1" }, h("ion-button", { fill: "clear", "icon-only": true, onClick: () => this.removePlan(index) }, h("ion-icon", { name: "trash", color: "danger" })))),
            h("ion-row", null, h("ion-col", null, h("app-form-item", { lines: "inset", "label-tag": "actual-situation", "label-text": "Actual Situation", value: action.situation, name: "situation", "input-type": "text", textRows: 3, onFormItemChanged: (ev) => this.handleChange(action, ev), validator: ["required"] })), h("ion-col", null, h("app-form-item", { lines: "inset", "label-tag": "plan", "label-text": "Plan", value: action.plan, name: "plan", "input-type": "text", textRows: 3, onFormItemChanged: (ev) => this.handleChange(action, ev), validator: ["required"] }))),
            h("ion-row", null, h("ion-item-divider", null)),
        ])), this.userPlan.planOfActions.length > 0 ? (h("ion-button", { color: "danger", fill: "outline", expand: "full", onClick: () => {
                this.deletePlan();
            } }, h("ion-icon", { name: "trash", slot: "start" }), h("ion-label", null, h("my-transl", { tag: "delete", text: "Delete" })))) : undefined)), h("app-modal-footer", { key: '83bd8d9851644de6b14ef226643857f05e40ad2f', color: Environment.getAppColor(), disableSave: !this.validPlan, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalUserPlansUpdate.style = modalUserPlansUpdateCss;

export { ModalUserPlansUpdate as modal_user_plans_update };

//# sourceMappingURL=modal-user-plans-update.entry.js.map