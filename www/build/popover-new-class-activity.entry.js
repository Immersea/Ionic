import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { l as lodash } from './lodash-68d560b6.js';
import './index-be90eba5.js';
import { T as TranslationService, U as UserService, R as RouterService, aD as DivePlansService } from './utils-ced1e260.js';
import { a as alertController, p as popoverController } from './overlays-b3ceb97d.js';
import './_commonjsHelpers-1a56c7bc.js';
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
import './env-c3ad5e77.js';
import './map-fe092362.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
import './framework-delegate-779ab78c.js';

const popoverNewClassActivityCss = "popover-new-class-activity .validation-error{text-align:center;font-size:0.7rem;color:red}";

const PopoverNewClassActivity = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.typeSelectOptions = [];
        this.stdConfigurations = [];
        this.activity = undefined;
        this.showDiveLocation = true;
        this.updateView = false;
        this.validActivity = false;
    }
    componentWillLoad() {
        this.typeSelectOptions = [
            { tag: "theory", text: TranslationService.getTransl("theory", "Theory") },
            { tag: "dry", text: TranslationService.getTransl("dry", "Dry") },
            {
                tag: "in-water",
                text: TranslationService.getTransl("in-water", "In Water"),
            },
            { tag: "dive", text: TranslationService.getTransl("dive", "Dive") },
        ];
        this.stdConfigurations = lodash.exports.cloneDeep(UserService.userSettings.userConfigurations);
        this.validateActivity();
    }
    validateActivity() {
        this.validActivity =
            lodash.exports.isNumber(this.activity.day) &&
                lodash.exports.isString(this.activity.type) &&
                lodash.exports.isString(this.activity.title.tag) &&
                lodash.exports.isString(this.activity.title.text);
        if (this.activity.type == "dive") {
            this.validActivity =
                this.validActivity && this.activity.divePlan !== null;
        }
        this.updateView = !this.updateView;
    }
    updateDay(day) {
        this.activity.day = day;
        this.validateActivity();
    }
    updateType(type) {
        if (type != "dive" && this.activity.type == "dive") {
            this.activity.divePlan = null;
        }
        this.activity.type = type;
        this.validateActivity();
    }
    updateTitle(ev) {
        let value = ev.detail.value;
        if (ev.detail.name == "tag") {
            value = value.toLowerCase().replace(" ", "-").trim();
        }
        this.activity.title[ev.detail.name] = value;
        this.validateActivity();
    }
    async addDivePlan() {
        let inputs = [];
        lodash.exports.forEach(this.stdConfigurations, (conf, key) => {
            inputs.push({
                type: "radio",
                label: conf.stdName,
                value: key,
                checked: key == 0 ? true : false,
            });
        });
        const alert = await alertController.create({
            header: TranslationService.getTransl("select-standard-configuration", "Select standard configuration"),
            buttons: [
                {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: async (data) => {
                        const openModal = await RouterService.openModal("modal-dive-template", {
                            selectedConfiguration: this.stdConfigurations[data],
                            stdConfigurations: this.stdConfigurations,
                            dive: 0,
                            user: UserService.userProfile,
                        });
                        openModal.onDidDismiss().then((divePlan) => {
                            const dpModal = divePlan.data;
                            if (dpModal) {
                                this.activity.divePlan = dpModal;
                                this.validateActivity();
                                this.updateView = !this.updateView;
                            }
                        });
                    },
                },
                {
                    text: TranslationService.getTransl("cancel", "Cancel"),
                    role: "cancel",
                    cssClass: "secondary",
                },
            ],
            inputs: inputs,
        });
        alert.present();
    }
    async editDivePlan() {
        const modal = await DivePlansService.presentDiveTemplateUpdate(this.activity.divePlan, 0, this.showDiveLocation);
        if (modal) {
            this.activity.divePlan = modal;
            this.updateView = !this.updateView;
        }
    }
    async save() {
        popoverController.dismiss(this.activity);
    }
    cancel() {
        popoverController.dismiss();
    }
    render() {
        return (h(Host, { key: 'd4d0e9be6f45e56fe4e03ad78a47978cbab43dde' }, h("ion-toolbar", { key: '65d9a5e58ef3b21f10d42bfe1686e4845f6ea171' }, h("ion-title", { key: 'e5995dfb099bbe6c679804afea749649367ddbf8' }, h("my-transl", { key: '68826d8c37eb7c06acc9bcd1a7895042bf83566c', tag: "class-activity", text: "Class Activity" }))), h("ion-item", { key: '095b55f83dfaa19dde26e245972bb8fcc4532740' }, h("ion-label", { key: '322cc0a7a0704206b77403c444471b8acf3e4d0d' }, h("my-transl", { key: '40b2cb0891b7a8f2a7ffb933d9f1503a029691de', tag: "class-day", text: "Class Day" })), h("ion-select", { key: '24e0225a18e51339824c67cfa3231522ce3c820a', value: this.activity.day, onIonChange: (ev) => this.updateDay(ev.detail.value), interface: "popover" }, h("ion-select-option", { key: 'e195e28bc66e54edc22d4ce7f0a1a04f2d8d1db0', value: 1 }, "1"), h("ion-select-option", { key: '9a73d626293ee0d17aea184a17846d9099b7a15a', value: 2 }, "2"), h("ion-select-option", { key: 'cd43af2f3c5d3a2e25b5693fad8c12f167ecf9e5', value: 3 }, "3"), h("ion-select-option", { key: 'bb1686c796a766e21f6642655b271af6761d2094', value: 4 }, "4"), h("ion-select-option", { key: 'cfd541b8a6040e073b273c6552f1e4b20533f244', value: 5 }, "5"), h("ion-select-option", { key: '34581e0e2382104fad59fbf0266debbe03ddeba8', value: 6 }, "6"), h("ion-select-option", { key: 'c7c0f1089e2b632bccebf5491bfcc2fa87c974d9', value: 7 }, "7"), h("ion-select-option", { key: 'd4f7aa700b5bfc1b897103337912257eb3a4da28', value: 8 }, "8"), h("ion-select-option", { key: '3e49eff67d9a449b497b9bc8b81a0c8ba2b37095', value: 9 }, "9"), h("ion-select-option", { key: '9ee875abaf290d2e2456828a835dddda8a5fe3ed', value: 10 }, "10"))), h("ion-item", { key: '850f42509dc0b53eb0f8957031e9534213be36b7' }, h("ion-label", { key: 'ae8bb45862a0cd03d55edd10c3c825f3a05c5b96' }, h("my-transl", { key: '5b672aebcc9d228ae67ffe6a1b1b06e503c289fa', tag: "type", text: "Type" })), h("ion-select", { key: '392be81fcd84d087b1f8001755bc0fe9829f4a5c', value: this.activity.type, onIonChange: (ev) => this.updateType(ev.detail.value), interface: "popover" }, this.typeSelectOptions.map((option) => (h("ion-select-option", { value: option.tag }, option.text))))), h("app-form-item", { key: '7e93f0bb9d64c23b4c6be34ee2002061f54178d9', "label-tag": "unique-id", "label-text": "Unique ID", value: this.activity.title.tag, name: "tag", "input-type": "text", onFormItemChanged: (ev) => this.updateTitle(ev), validator: [
                "required",
                {
                    name: "uniqueid",
                    options: { type: null },
                },
            ] }), h("app-form-item", { key: 'fa72667c4ceea9f972ca8fbe8f2fdb0b9f36eb68', "label-tag": "title", "label-text": "Title", value: this.activity.title.text, name: "text", "input-type": "text", onFormItemChanged: (ev) => this.updateTitle(ev), validator: ["required"] }), this.activity.type == "dive" ? (this.activity.divePlan ? (h("ion-item", null, h("ion-label", null, this.activity.divePlan.dives[0]
            .getDiveDetails()
            .map((detail) => (h("p", null, detail)))), h("ion-button", { "icon-only": true, fill: "clear", onClick: () => this.editDivePlan() }, h("ion-icon", { name: "create-outline" })))) : (h("ion-button", { expand: "full", onClick: () => this.addDivePlan() }, "Add Dive Plan"))) : undefined, h("app-modal-footer", { key: 'f6820c730f32ab46e73ebf47a3894d83ece17d0e', disableSave: !this.validActivity, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
PopoverNewClassActivity.style = popoverNewClassActivityCss;

export { PopoverNewClassActivity as popover_new_class_activity };

//# sourceMappingURL=popover-new-class-activity.entry.js.map