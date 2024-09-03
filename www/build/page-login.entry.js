import { r as registerInstance, h } from './index-d515af00.js';
import { B as SystemService, x as AuthService, T as TranslationService, D as DatabaseService, R as RouterService } from './utils-ced1e260.js';
import './index-be90eba5.js';
import { E as Environment } from './env-c3ad5e77.js';
import { l as lodash } from './lodash-68d560b6.js';
import { a as alertController } from './overlays-b3ceb97d.js';
import { a as isPlatform } from './ionic-global-c07767bf.js';
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

const pageLoginCss = "page-login{}page-login .apple{--background:black}page-login .facebook{--background:var(--facebook-color)}page-login .google{--background:var(--google-color)}page-login .validation-error{padding-left:18px;font-size:0.7rem;color:red}page-login .small{font-size:0.8rem;color:var(--ion-color-tint)}page-login .centered{align-items:center;justify-content:center;text-align:center}";

const PageLogin = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.newUserRegistration = false;
        this.email = {
            name: "email",
            valid: false,
            value: "",
        };
        this.emailpsw = {
            name: "emailpsw",
            valid: false,
            value: "",
        };
        this.psw = {
            name: "psw",
            valid: false,
            value: "",
        };
        this.retypepsw = {
            name: "retypepsw",
            valid: true,
            value: "",
        };
        this.passwordCheck = true;
        this.trasteelLogin = false;
        this.disablePswFields = false;
        this.disableEmailLinkFields = false;
        this.disableGoogle = false;
        this.disableFacebook = true;
        this.disableApple = false;
        this.network = false;
        this.scrollTop = 0;
        this.checkingEmail = false;
    }
    componentWillLoad() {
        SystemService.getNetworkStatus().then((networkObservable) => {
            networkObservable.subscribe((status) => {
                this.network = status;
            });
        });
        this.trasteelLogin = Environment.isTrasteel();
    }
    async sendLink() {
        try {
            await AuthService.sendEmailLink(this.email.value.trim());
            this.email.value = "";
            this.showAlert(false);
        }
        catch (error) {
            this.showAlert(error);
        }
    }
    async googleLogin() {
        try {
            await AuthService.google();
        }
        catch (error) {
            this.showAlert(error);
        }
    }
    async facebookLogin() {
        try {
            await AuthService.facebook();
        }
        catch (error) {
            this.showAlert(error);
        }
    }
    async appleLogin() {
        const alert = await alertController.create({
            header: TranslationService.getTransl("login", "Login"),
            message: TranslationService.getTransl("apple-login-message", "In order to login with the same Apple account also with other devices, it is necessary to share your original email address."),
            buttons: [
                {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: async () => {
                        try {
                            await AuthService.apple();
                        }
                        catch (error) {
                            this.showAlert(error);
                        }
                    },
                },
                {
                    text: TranslationService.getTransl("cancel", "Cancel"),
                },
            ],
        });
        alert.present();
    }
    async loginWithEmail() {
        try {
            await AuthService.signInWithEmailPsw(this.email.valid ? this.email.value.trim() : this.emailpsw.value.trim(), this.psw.value);
            //check if signedin with link
            const email = await DatabaseService.getLocalDocument("emailForSignIn");
            if (email) {
                this.emailpsw.value = "";
                this.psw.value = "";
                this.showAlert(false);
            }
            else {
                AuthService.dismissLoading();
            }
        }
        catch (error) {
            this.showAlert(error);
        }
    }
    forgotPsw() {
        //RouterService.push("/forgotpsw", "forward");
        SystemService.presentLoading("please-wait");
        const email = this.email.value ? this.email.value : this.emailpsw.value;
        AuthService.passwordReset(email)
            .then(() => {
            SystemService.dismissLoading();
            this.showPswResetAlert("pswreset");
        })
            .catch(() => {
            SystemService.dismissLoading();
            this.showPswResetAlert("pswreseterror");
        });
    }
    async showAlert(error) {
        let header = TranslationService.getTransl("login", "Login");
        let message_error = TranslationService.getTransl("login-error", "There was an error in the login process. Please try again later.");
        let message_ok = TranslationService.getTransl("registration-success-email", "The registration/login has been completed! You will now receive a link in your email to complete the login process. If you don't receive the email within 1 minute please check in your spam folder.");
        if (error) {
            Environment.log("registration/login error", [error]);
            switch (error.code) {
                case "auth/popup-blocked":
                    message_error = TranslationService.getTransl("popup-error", "You should allow popup windows in the browser's preferences in order to complete the login process.");
                    break;
                case "auth/account-exists-with-different-credential":
                    if (error.email) {
                        this.emailpsw.value = error.email;
                        this.checkEmail();
                    }
                    message_error = TranslationService.getTransl("popup-error-existing-account", "You have already logged in with this email using another Sign-In method. Insert your email in the 'Email' field to check your exisiting method.");
                    break;
                case "auth/missing-or-invalid-nonce":
                    if (error.email) {
                        this.emailpsw.value = error.email;
                        this.checkEmail();
                    }
                    message_error = TranslationService.getTransl("popup-error-duplicate-credential", "Duplicate credential received. Please try again with a new credential.");
                    break;
                default:
                    message_error += error.message ? " (" + error.message + ")" : "";
            }
        }
        const alert = await alertController.create({
            header: header,
            message: error ? message_error : message_ok,
            buttons: [
                {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: async () => {
                        RouterService.push("/", "root");
                    },
                },
            ],
        });
        AuthService.dismissLoading();
        alert.present();
    }
    async showPswResetAlert(message) {
        let header = TranslationService.getTransl("login", "Login");
        let pswreset = TranslationService.getTransl("pswreset", "You will receive shortly an email to reset your password. Please follow the instructions and then come back to the login page.");
        let pswreseterror = TranslationService.getTransl("pswreseterror", "There was an error in the reset process. Please try again later.");
        let show_message = "";
        switch (message) {
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
                },
            ],
        });
        AuthService.dismissLoading();
        alert.present();
    }
    inputHandler(event) {
        this[event.detail.name] = event.detail;
        if (event.detail.name == "retypepsw") {
            this.checkRetypePassword();
        }
        else if (event.detail.name == "emailpsw" ||
            event.detail.name == "email") {
            this.psw.value = "";
            this.psw.valid = true;
            this.retypepsw.valid = true;
            this.retypepsw.value = "";
            // Function to validate email using regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            //check email address
            const email = lodash.exports.toLower(event.detail.value);
            this.email.value = lodash.exports.toLower(email);
            this.emailpsw.value = this.email.value;
            if (Environment.isTrasteel() && event.detail.name == "email") {
                if ((!this.email.value.includes("@trasteel.com") &&
                    !this.email.value.includes("@trasteelnetwork.com") &&
                    !this.email.value.includes("@o-range.tech") &&
                    !this.email.value.includes("@ipermediastudio.it")) ||
                    !emailRegex.test(this.email.value)) {
                    this.email.valid = false;
                    this.emailpsw.valid = false;
                }
                else {
                    this.email.valid = true;
                    this.emailpsw.valid = true;
                }
            }
            else {
                //check email field
                if (emailRegex.test(this.email.value)) {
                    this.email.valid = true;
                    this.emailpsw.valid = true;
                }
                else {
                    this.email.valid = false;
                    this.emailpsw.valid = false;
                }
            }
            this.checkEmail();
        }
    }
    async checkEmail() {
        if (!this.checkingEmail) {
            this.checkingEmail = true;
            if (this.emailpsw.valid) {
                await SystemService.presentLoading("searching");
                const methods = await AuthService.fetchSignInMethodsForEmail(this.emailpsw.value);
                this.disablePswFields = false;
                this.disableEmailLinkFields = false;
                this.disableGoogle = false;
                this.disableFacebook = true; //false;
                this.disableApple = false;
                if (methods.length == 0) {
                    //new user
                    this.newUserRegistration = true;
                    //this.retypepsw.valid = false;
                }
                else {
                    this.newUserRegistration = false;
                    //this.retypepsw.valid = true;
                    //enable password fields for emailLink and Password methods
                    this.disablePswFields = !methods.includes("password");
                    this.disableEmailLinkFields = !methods.includes("emailLink");
                    this.disableFacebook = true; //!methods.includes("facebook.com");
                    this.disableApple = !methods.includes("apple.com");
                    this.disableGoogle = !methods.includes("google.com");
                    /*if (methods.includes("facebook.com")) {
                      //remove facebook login and allow google or psw
                      this.disablePswFields = true;
                      this.disableGoogle = false;
                    }
                    if (methods.includes("apple.com") && isPlatform("android")) {
                      //alert user for Apple
                      const alert = await alertController.create({
                        header: TranslationService.getTransl("login", "Login"),
                        message: TranslationService.getTransl(
                          "apple-login-error",
                          "You previously logged-in using Apple Login. This service is not available on Android devices."
                        ),
                        buttons: [
                          {
                            text: TranslationService.getTransl("ok", "OK"),
                          },
                        ],
                      });
                      alert.present();
                    }*/
                }
                await SystemService.dismissLoading();
            }
            else {
                this.newUserRegistration = false;
                //this.retypepsw.valid = true;
                this.disablePswFields = false;
                this.disableGoogle = false;
                this.disableFacebook = true;
                this.disableApple = false;
            }
            if (this.newUserRegistration)
                this.checkRetypePassword();
            this.checkingEmail = false;
        }
    }
    checkRetypePassword() {
        this.passwordCheck = this.psw.value == this.retypepsw.value;
    }
    render() {
        return [
            h("app-navbar", { key: '7b0a564b9c69be451ea9d2e809bf46b757ed6607', color: Environment.getAppColor(), tag: 'login', text: 'Login' }),
            h("ion-content", { key: 'e9cd4bd88455ccee2094bfd96f2c5dc5b0b7d086', scrollEvents: true, onIonScroll: (ev) => (this.scrollTop = ev.detail.scrollTop) }, Environment.isUdive() || Environment.isDecoplanner() ? (h("app-banner", { scrollTopValue: this.scrollTop, heightPx: 250, link: './assets/images/friendship2SM.jpg' })) : undefined, h("ion-grid", { key: '6cf0022a47ff99fbb1cb96c2d7620accbef08f41' }, !this.network ? (h("ion-row", null, h("ion-col", null, h("ion-item", { color: 'danger' }, h("ion-icon", { name: 'warning', slot: 'start' }), h("ion-label", null, h("my-transl", { tag: 'no-network', text: 'Network not available!' })))))) : undefined, h("ion-row", { key: 'c3a8c690b1acdb214e2203ed65afc495dd9aedd0' }, h("ion-col", { key: 'e621a166eb89decc64b900cb345dc794efdd660d' }, this.trasteelLogin ? ([
                h("app-form-item", { "label-tag": 'email', "label-text": 'Email', name: 'email', lines: 'full', "input-type": 'email', onFormItemChanged: (ev) => this.inputHandler(ev), disabled: !this.network, debounce: 500, validator: ["required", "email"] }),
                h("ion-text", { class: 'ion-padding-start small' }, "Only emails @trasteel.com or @trasteelnetwork.com are accepted."),
                !this.disableEmailLinkFields
                    ? [
                        h("ion-button", { "margin-top": true, expand: 'block', disabled: !this.email.valid || !this.network, onClick: () => this.sendLink() }, h("my-transl", { tag: 'login-email', text: (this.newUserRegistration
                                ? "Register"
                                : "Login") + " with Email Link" })),
                        !this.disablePswFields
                            ? [
                                h("ion-item-divider", null),
                                h("ion-item-divider", null, h("ion-label", null, h("p", { class: 'centered' }, "- or type password -"))),
                            ]
                            : undefined,
                    ]
                    : undefined,
            ]) : (h("app-form-item", { "label-tag": 'email', "label-text": 'Email', name: 'emailpsw', lines: 'full', "input-type": 'email', onFormItemChanged: (ev) => this.inputHandler(ev), disabled: !this.network, debounce: 500, validator: ["required", "email"] })), !this.disablePswFields
                ? [
                    h("app-form-item", { "label-tag": 'password', "label-text": 'Password', name: 'psw', lines: 'full', "input-type": 'password', onFormItemChanged: (ev) => this.inputHandler(ev), disabled: !this.network, validator: ["required"] }),
                    this.newUserRegistration ? (h("app-form-item", { "label-tag": 'retype-password', "label-text": 'Re-type Password', name: 'retypepsw', lines: 'full', "input-type": 'password', onFormItemChanged: (ev) => this.inputHandler(ev), disabled: !this.network, validator: ["required"] })) : undefined,
                    !this.passwordCheck ? (h("my-transl", { class: 'validation-error', tag: 'password-error', text: 'Passwords are not the same' })) : undefined,
                    h("ion-button", { "margin-top": true, expand: 'block', disabled: !this.emailpsw.valid ||
                            !this.psw.valid ||
                            !this.retypepsw.valid ||
                            !this.network ||
                            !this.passwordCheck, onClick: () => this.loginWithEmail() }, !this.emailpsw.valid && !this.newUserRegistration
                        ? TranslationService.getTransl("login-emailpsw", "Login/Register with Email and Password")
                        : this.newUserRegistration
                            ? TranslationService.getTransl("register-emailpsw", "Register with Email and Password")
                            : TranslationService.getTransl("login-only-emailpsw", "Login with Email and Password")),
                ]
                : undefined)), !this.disablePswFields &&
                !this.newUserRegistration &&
                this.emailpsw.valid ? (h("ion-row", null, h("ion-col", { class: 'ion-text-right' }, h("a", { onClick: () => this.forgotPsw() }, h("my-transl", { tag: 'forgot-psw', text: 'Forgot password' }))))) : undefined, !this.trasteelLogin
                ? [
                    h("ion-row", null, h("ion-col", { class: 'ion-text-center' }, !this.disablePswFields &&
                        !this.disableGoogle &&
                        !this.disableFacebook &&
                        !this.disableApple ? (h("p", null, "- or -")) : undefined)),
                    !this.disableGoogle ? (h("ion-row", null, h("ion-col", null, h("ion-button", { expand: 'block', onClick: () => this.googleLogin(), disabled: !this.network, class: 'google' }, h("ion-icon", { name: 'logo-google', slot: 'start' }), (this.newUserRegistration ? "Register" : "Login") +
                        " with Google")))) : undefined,
                    !this.disableFacebook ? (h("ion-row", null, h("ion-col", null, h("ion-button", { expand: 'block', onClick: () => this.facebookLogin(), disabled: !this.network, class: 'facebook' }, h("ion-icon", { name: 'logo-facebook', slot: 'start' }), (this.newUserRegistration ? "Register" : "Login") +
                        " with Facebook")))) : undefined,
                    !this.disableApple && !isPlatform("android") ? (h("ion-row", null, h("ion-col", null, h("ion-button", { expand: 'block', onClick: () => this.appleLogin(), disabled: !this.network, class: 'apple' }, h("ion-icon", { name: 'logo-apple', slot: 'start' }), (this.newUserRegistration ? "Register" : "Login") +
                        " with Apple")))) : undefined,
                ]
                : undefined)),
        ];
    }
};
PageLogin.style = pageLoginCss;

export { PageLogin as page_login };

//# sourceMappingURL=page-login.entry.js.map