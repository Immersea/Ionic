import { r as registerInstance, h } from './index-d515af00.js';
import { aM as Network, U as UserService } from './utils-5cd4c7bb.js';
import { E as Environment } from './env-0a7fccce.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-e64442d7.js';
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
import './customerLocation-bbe1e349.js';

const pageSupportCss = "page-support{}";

const PageSupport = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.email = {
            name: "email",
            valid: false,
            value: "",
        };
        this.subject = {
            name: "subject",
            valid: false,
            value: "",
        };
        this.body = {
            name: "body",
            valid: false,
            value: "",
        };
        this.network = false;
        this.send = false;
        this.scrollTop = 0;
    }
    componentWillLoad() {
        Network.getStatus().then((status) => {
            if (status.connected) {
                this.network = true;
            }
            else {
                this.network = false;
            }
        });
        this.email.value =
            UserService && UserService.userProfile
                ? UserService.userProfile.email
                : "";
        this.email.valid = true;
    }
    inputHandler(event) {
        this[event.detail.name] = event.detail;
    }
    checkFields() {
        if (this.email.valid && this.subject.valid && this.body.valid) {
            this.send = true;
        }
        else {
            this.send = false;
        }
        this.emailSubject = encodeURI("[Mobile Decoplanner support] " + this.subject.value);
        this.emailBody = encodeURI("User:\n" +
            this.email.value +
            (UserService.userProfile && UserService.userProfile.uid
                ? " (id: " + UserService.userProfile.uid + ")"
                : "") +
            "\n\n\nProblem:\n" +
            this.body.value);
    }
    messagesent() {
        this.subject.value = "";
        this.subject.valid = false;
        this.body.value = "";
        this.body.valid = false;
        this.checkFields();
    }
    render() {
        return [
            h("ion-header", { key: '1bb07108acf26b678d1abd2ffd1a491e546322f9' }, h("app-navbar", { key: '4a18b178518bc6ceeb5f1a01ecdce1fa3dbab4cd', tag: "support", text: "Support", color: Environment.getAppColor() })),
            h("ion-content", { key: 'aef94467d06110cf26b0471341b8e98d24edce77', scrollEvents: true, onIonScroll: (ev) => (this.scrollTop = ev.detail.scrollTop) }, h("app-banner", { key: '391577e829adb3c335c8eb36502da3a1968a29eb', scrollTopValue: this.scrollTop, heightPx: 250, link: "./assets/images/Jarrod-Stargate.jpg" }), h("app-form-item", { key: 'f4747c82f4400de9ce2f3b4d150334697a220714', "label-tag": "email", "label-text": "Email", name: "email", lines: "full", value: this.email.value, "input-type": "email", onFormItemChanged: (ev) => this.inputHandler(ev), onIsValid: () => this.checkFields(), validator: ["required", "email"] }), h("app-form-item", { key: '7a5bc003ecda33814da4f9a8108d98e3baf07c02', "label-tag": "subject", "label-text": "Subject", name: "subject", lines: "full", value: this.subject.value, "input-type": "text", onFormItemChanged: (ev) => this.inputHandler(ev), onIsValid: () => this.checkFields(), validator: [
                    "required",
                    {
                        name: "length",
                        options: { min: 5, max: null },
                    },
                ] }), h("app-form-item", { key: 'b566ca168039ea5cf66e6dfa4dd4b7ac179b9027', "label-tag": "text", "label-text": "Text", name: "body", lines: "full", value: this.body.value, "input-type": "text", "text-rows": "10", onFormItemChanged: (ev) => this.inputHandler(ev), onIsValid: () => this.checkFields(), validator: [
                    "required",
                    {
                        name: "length",
                        options: { min: 10, max: null },
                    },
                ] }), h("ion-button", { key: '05838cef29e38eb4d6ee7677b678ec9c217ccdb2', expand: "block", href: "mailto:decoplan@gue.com?subject=" +
                    this.emailSubject +
                    "&body=" +
                    this.emailBody, onClick: () => this.messagesent(), disabled: !this.network || !this.send }, h("ion-icon", { key: 'fdbf214059a8584f7b53e0e39c11918c323858c2', name: "send", slot: "start" }), h("my-transl", { key: '0958fa7e3ac8a073e4fc048db10e7db4b25f66e7', tag: "send", text: "Send" }))),
        ];
    }
};
PageSupport.style = pageSupportCss;

export { PageSupport as page_support };

//# sourceMappingURL=page-support.entry.js.map