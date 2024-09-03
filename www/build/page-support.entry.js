import { r as registerInstance, h } from './index-d515af00.js';
import { aM as Network, U as UserService } from './utils-ced1e260.js';
import { E as Environment } from './env-c3ad5e77.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-fe092362.js';
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
import './customerLocation-d18240cd.js';

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
            h("ion-header", { key: 'ba90ae7c6f141c2ac6b28869847a5a0a2714c204' }, h("app-navbar", { key: 'c00477b6c453d2509dd2e0429860ea3579df36f3', tag: 'support', text: 'Support', color: Environment.getAppColor() })),
            h("ion-content", { key: '7872f3e3156bf6bcfd5743f2aaae55cd51978bb6', scrollEvents: true, onIonScroll: (ev) => (this.scrollTop = ev.detail.scrollTop) }, h("app-banner", { key: '44d31935bc3b5b12f596ceb12c1477425401a93a', scrollTopValue: this.scrollTop, heightPx: 250, link: 'assets/images/Jarrod-Stargate.jpg' }), h("app-form-item", { key: '08cf5c3ef71b90ecadae9f489d44d76233f6f385', "label-tag": 'email', "label-text": 'Email', name: 'email', lines: 'full', value: this.email.value, "input-type": 'email', onFormItemChanged: (ev) => this.inputHandler(ev), onIsValid: () => this.checkFields(), validator: ["required", "email"] }), h("app-form-item", { key: 'a264cb22bfc3cba15f7f210528770f5baf47d445', "label-tag": 'subject', "label-text": 'Subject', name: 'subject', lines: 'full', value: this.subject.value, "input-type": 'text', onFormItemChanged: (ev) => this.inputHandler(ev), onIsValid: () => this.checkFields(), validator: [
                    "required",
                    {
                        name: "length",
                        options: { min: 5, max: null },
                    },
                ] }), h("app-form-item", { key: '9aaae895c36d8cd04b08e214e3dbf3f8ac162d08', "label-tag": 'text', "label-text": 'Text', name: 'body', lines: 'full', value: this.body.value, "input-type": 'text', "text-rows": '10', onFormItemChanged: (ev) => this.inputHandler(ev), onIsValid: () => this.checkFields(), validator: [
                    "required",
                    {
                        name: "length",
                        options: { min: 10, max: null },
                    },
                ] }), h("ion-button", { key: '90ade6dfcf3e03b17c6cec95d26a84b0c905b485', expand: 'block', href: "mailto:decoplan@gue.com?subject=" +
                    this.emailSubject +
                    "&body=" +
                    this.emailBody, onClick: () => this.messagesent(), disabled: !this.network || !this.send }, h("ion-icon", { key: '28fe965ef80ce66b2008195164d2f50ecef17c2f', name: 'send', slot: 'start' }), h("my-transl", { key: '58825e679475b7ba0c17983e80a89467e39e1623', tag: 'send', text: 'Send' }))),
        ];
    }
};
PageSupport.style = pageSupportCss;

export { PageSupport as page_support };

//# sourceMappingURL=page-support.entry.js.map