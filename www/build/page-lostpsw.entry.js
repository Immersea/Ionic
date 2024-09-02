import { r as registerInstance, h } from './index-d515af00.js';
import { T as TranslationService, R as RouterService, x as AuthService, B as SystemService, aI as EmailAuthProvider, aJ as GoogleAuthProvider, aK as FacebookAuthProvider } from './utils-5cd4c7bb.js';
import './index-be90eba5.js';
import { E as Environment } from './env-0a7fccce.js';
import { a as alertController } from './overlays-b3ceb97d.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';
import './ionic-global-c07767bf.js';
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

const pageLostpswCss = "page-lostpsw .validation-error{padding-left:18px;font-size:0.7rem;color:red}";

const PageLostpsw = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.email = "";
        this.emailpsw = {
            name: "emailpsw",
            valid: false,
            value: "",
        };
        this.scrollTop = 0;
    }
    componentWillLoad() {
        if (this.email) {
            this.emailpsw = {
                name: "emailpsw",
                valid: true,
                value: this.email,
            };
        }
    }
    async showAlert(message) {
        let header = TranslationService.getTransl("login", "Login");
        let newuser = TranslationService.getTransl("new-user", "Your email is not registered in our systems. Please register to proceed.");
        let google = TranslationService.getTransl("google-registration", "You have previously logged-in through Google registration process. Please click on the related button in the login page to proceed.");
        let facebook = TranslationService.getTransl("facebook-registration", "You have previously logged-in through Facebook registration process. Please click on the related button in the login page to proceed.");
        let pswreset = TranslationService.getTransl("pswreset", "You will receive shortly an email to reset your password. Please follow the instructions and then come back to the login page.");
        let pswreseterror = TranslationService.getTransl("pswreseterror", "There was an error in the reset process. Please try again later.");
        let show_message = "";
        switch (message) {
            case "newuser":
                show_message = newuser;
                break;
            case "google":
                show_message = google;
                break;
            case "facebook":
                show_message = facebook;
                break;
            case "pswreset":
                show_message = pswreset;
                break;
            case "pswreseterror":
                show_message = pswreseterror;
                break;
        }
        const alert = await alertController.create({
            header: header,
            message: show_message,
            buttons: [
                {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: async () => {
                        RouterService.push("/login", "root");
                    },
                },
            ],
        });
        AuthService.dismissLoading();
        alert.present();
    }
    inputHandler(event) {
        this[event.detail.name] = event.detail;
    }
    async checkEmail() {
        SystemService.presentLoading("please-wait");
        const methods = await AuthService.fetchSignInMethodsForEmail(this.emailpsw.value);
        SystemService.dismissLoading();
        if (methods.length == 0) {
            //new user
            SystemService.presentAlertError("newuser");
        }
        else {
            //existing user
            if (methods.indexOf(EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD) != -1) {
                this.sendResetPsw();
            }
            else if (methods.indexOf(GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD) != -1) {
                this.showAlert("google");
            }
            else if (methods.indexOf(FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD) != -1) {
                this.showAlert("facebook");
            }
        }
    }
    sendResetPsw() {
        SystemService.presentLoading("please-wait");
        AuthService.passwordReset(this.emailpsw.value)
            .then(() => {
            SystemService.dismissLoading();
            this.showAlert("pswreset");
        })
            .catch(() => {
            SystemService.dismissLoading();
            this.showAlert("pswreseterror");
        });
    }
    render() {
        return [
            h("app-navbar", { key: '8630d11ed6db198422315e2d1f0f411d968ca189', color: Environment.getAppColor(), tag: "forgot-psw", text: "Forgot Password", "back-button": true }),
            h("ion-content", { key: '7cc89cd4f55c49917944ae5582dcbaf8d40727e2', scrollEvents: true, onIonScroll: (ev) => (this.scrollTop = ev.detail.scrollTop) }, Environment.isUdive() || Environment.isDecoplanner() ? (h("app-banner", { scrollTopValue: this.scrollTop, heightPx: 250, link: "./assets/images/friendship2SM.jpg" })) : undefined, h("ion-grid", { key: '105854bd3e59e30bd45f478e9911ad38ce0d0885' }, h("ion-row", { key: '69686bf99e520c0a6b1349b710dd1b78d9561621' }, h("ion-col", { key: '6b120f6d5c8a362099cc52c125551f94e290308d' }, h("app-form-item", { key: '851d12205045ff48d7f881b02c41bcb1bfdd0e3f', "label-tag": "email", "label-text": "Email", name: "emailpsw", "input-type": "email", onFormItemChanged: (ev) => this.inputHandler(ev), validator: ["required", "email"] }), h("ion-button", { key: 'e76549235af79ee9fe6ba3c01a3ecb12d120a5d5', "margin-top": true, expand: "block", disabled: !this.emailpsw.valid, onClick: () => this.checkEmail() }, h("my-transl", { key: 'ac7e732c283d8432c71dd85774d9e9f3827a41a9', tag: "login-resetpsw", text: "Reset my password" })))))),
        ];
    }
};
PageLostpsw.style = pageLostpswCss;

export { PageLostpsw as page_lostpsw };

//# sourceMappingURL=page-lostpsw.entry.js.map