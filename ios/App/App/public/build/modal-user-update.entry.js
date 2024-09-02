import { r as registerInstance, h } from './index-d515af00.js';
import { U as UserService, T as TranslationService, x as AuthService, B as SystemService, b as USERPROFILECOLLECTION } from './utils-5cd4c7bb.js';
import './index-be90eba5.js';
import { E as Environment } from './env-0a7fccce.js';
import { l as lodash } from './lodash-68d560b6.js';
import { m as modalController, a as alertController } from './overlays-b3ceb97d.js';
import './map-e64442d7.js';
import './_commonjsHelpers-1a56c7bc.js';
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

const modalUserUpdateCss = "modal-user-update .cover-container{height:var(--coverHeight)}modal-user-update ion-thumbnail{position:relative;margin:-50px auto 0 auto;width:100px;height:100px}modal-user-update ion-thumbnail img{border-radius:50%;padding:0.08em;border:solid 0.25em lightsteelblue;background-color:white}modal-user-update ion-thumbnail ion-button{top:50%;left:50%;margin-right:-50%;transform:translate(-50%, -50%);position:absolute;color:#141414;font-size:24px}modal-user-update .cover{position:relative;background-color:lightblue;background-size:cover;background-position:center;background-repeat:no-repeat;box-shadow:0 4px 8px 0 rgba(0, 0, 0, 0.2);width:100%;height:var(--coverHeight)}modal-user-update .cover ion-button{bottom:5%;left:10%;margin-right:-50%;transform:translate(-50%, -50%);position:absolute;color:#141414;font-size:24px}";

const ModalUserUpdate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.uploading = false;
        this.userProfile = undefined;
        this.userSettings = undefined;
        this.updateView = true;
        this.addressText = undefined;
        this.checkEmailPsw = false;
    }
    componentWillLoad() {
        this.settingsSub = UserService.userSettings$.subscribe((settings) => {
            if (settings) {
                this.userSettings = settings;
                this.userSub = UserService.userProfile$.subscribe((profile) => {
                    if (profile) {
                        this.userProfile = profile;
                        this.addressText = this.userProfile.address
                            ? this.userProfile.address.display_name
                            : "";
                    }
                });
            }
        });
    }
    componentDidLoad() {
        //check if user is loaded or trigger local user
        if (!this.userProfile) {
            UserService.initLocalUser();
        }
        this.checkEmailPswRegistration();
    }
    disconnectedCallback() {
        this.settingsSub.unsubscribe();
        this.userSub.unsubscribe();
    }
    async update() {
        this.userProfile.setDisplayName();
        await UserService.updateUserProfile(this.userProfile);
        await UserService.updateUserSettings(this.userSettings);
        return modalController.dismiss();
    }
    async cancel() {
        return modalController.dismiss();
    }
    changeLanguage(langCode) {
        this.userSettings.setLanguage(langCode.detail);
        TranslationService.setLanguage(langCode.detail);
    }
    async changeUnits(ev) {
        this.userSettings.settings.units = ev.detail.value;
        this.userSettings.userConfigurations =
            this.userSettings.userConfigurations.map((conf) => {
                const params = conf.parameters;
                params.setUnits(this.userSettings.settings.units);
                conf.convertUnits(params);
                return conf;
            });
        this.userSettings.localPlans = this.userSettings.localPlans.map((plan) => {
            plan.convertUnits(this.userSettings.settings.units);
            return plan;
        });
    }
    inputHandler(event) {
        if (event.detail.name == "facebook" ||
            event.detail.name == "instagram" ||
            event.detail.name == "twitter" ||
            event.detail.name == "website" ||
            event.detail.name == "email") {
            const val = lodash.exports.toLower(event.detail.value).split(" ").join("-");
            this.userProfile[event.detail.name] = val;
        }
        else {
            this.userProfile[event.detail.name] = event.detail.value;
        }
        this.updateView = !this.updateView;
    }
    selectLocation(location) {
        this.userProfile.address = location;
        this.addressText = location.display_name;
    }
    updateImageUrls(ev) {
        const imageType = ev.detail.type;
        const url = ev.detail.url;
        if (imageType == "photo") {
            this.userProfile.photoURL = url;
        }
        else {
            this.userProfile.coverURL = url;
        }
        this.updateView = !this.updateView;
    }
    async checkEmailPswRegistration() {
        const methods = await AuthService.fetchSignInMethodsForEmail(this.userProfile.email);
        if (methods.includes("password")) {
            this.checkEmailPsw = true;
        }
        else {
            this.checkEmailPsw = false;
        }
    }
    sendResetPsw() {
        SystemService.presentLoading("please-wait");
        AuthService.passwordReset(this.userProfile.email)
            .then(() => {
            SystemService.dismissLoading();
            this.showAlert("pswreset");
        })
            .catch(() => {
            SystemService.dismissLoading();
            this.showAlert("pswreseterror");
        });
    }
    async showAlert(message) {
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
                    handler: async () => { },
                },
            ],
        });
        AuthService.dismissLoading();
        alert.present();
    }
    render() {
        return [
            this.uploading ? h("ion-progress-bar", { type: 'indeterminate' }) : undefined,
            this.userProfile && this.userProfile.uid
                ? [
                    h("ion-header", null, h("div", { class: 'cover-container' }, h("app-upload-cover", { item: {
                            collection: USERPROFILECOLLECTION,
                            id: this.userProfile.uid,
                            photoURL: this.userProfile.photoURL,
                            coverURL: this.userProfile.coverURL,
                        }, onCoverUploaded: (ev) => this.updateImageUrls(ev) }))),
                    h("ion-content", null, h("ion-list", null, h("app-form-item", { "label-tag": 'name', "label-text": 'Name', value: this.userProfile.name, name: 'name', lines: 'inset', "input-type": 'text', onFormItemChanged: (ev) => this.inputHandler(ev), validator: ["required"] }), h("app-form-item", { "label-tag": 'surname', "label-text": 'Surname', lines: 'inset', value: this.userProfile.surname, name: 'surname', "input-type": 'text', onFormItemChanged: (ev) => this.inputHandler(ev), validator: ["required"] }), !Environment.isTrasteel()
                        ? [
                            h("app-form-item", { "label-tag": 'address', "label-text": 'Address', value: this.addressText, name: 'address', lines: 'inset', "input-type": 'text', onFormItemChanged: (ev) => (this.addressText = ev.detail.value), onFormLocationSelected: (ev) => this.selectLocation(ev.detail), validator: ["address"] }),
                            h("app-form-item", { "label-tag": 'biography', "label-text": 'Biography', value: this.userProfile.bio, "text-rows": 4, name: 'bio', lines: 'inset', "input-type": 'text', onFormItemChanged: (ev) => this.inputHandler(ev), validator: [] }),
                            h("app-form-item", { "label-tag": 'phone', "label-text": 'Phone', value: this.userProfile.phoneNumber, name: 'phoneNumber', "input-type": 'tel', lines: 'inset', onFormItemChanged: (ev) => this.inputHandler(ev), validator: [] }),
                            h("app-form-item", { "label-tag": 'email', "label-text": 'Email', value: this.userProfile.email, name: 'email', lines: 'inset', "input-type": 'email', onFormItemChanged: (ev) => this.inputHandler(ev), validator: ["email"] }),
                            h("app-form-item", { "label-tag": 'website', "label-text": 'Website', value: this.userProfile.website, name: 'website', lines: 'inset', "input-type": 'url', onFormItemChanged: (ev) => this.inputHandler(ev), validator: [] }),
                            this.userProfile.website ? (h("a", { class: 'ion-padding-start', href: "http://" + this.userProfile.website, target: '_blank' }, "http://" + this.userProfile.website)) : undefined,
                            h("app-form-item", { "label-tag": 'facebook-id', "label-text": 'Facebook ID', value: this.userProfile.facebook, name: 'facebook', lines: 'inset', "input-type": 'url', onFormItemChanged: (ev) => this.inputHandler(ev), validator: [] }),
                            this.userProfile.facebook ? (h("a", { class: 'ion-padding-start', href: "https://www.facebook.com/" +
                                    this.userProfile.facebook, target: '_blank' }, "https://www.facebook.com/" +
                                this.userProfile.facebook)) : undefined,
                            h("app-form-item", { "label-tag": 'instagram-id', "label-text": 'Instagram ID', value: this.userProfile.instagram, name: 'instagram', lines: 'inset', "input-type": 'url', onFormItemChanged: (ev) => this.inputHandler(ev), validator: [] }),
                            this.userProfile.instagram ? (h("a", { class: 'ion-padding-start', href: "https://www.instagram.com/" +
                                    this.userProfile.instagram, target: '_blank' }, "https://www.instagram.com/" +
                                this.userProfile.instagram)) : undefined,
                            h("app-form-item", { "label-tag": 'twitter id', "label-text": 'Twitter ID', value: this.userProfile.twitter, name: 'twitter', lines: 'inset', "input-type": 'url', onFormItemChanged: (ev) => this.inputHandler(ev), validator: [] }),
                            this.userProfile.twitter ? (h("a", { class: 'ion-padding-start', href: "https://www.twitter.com/" +
                                    this.userProfile.twitter, target: '_blank' }, "https://www.twitter.com/" +
                                this.userProfile.twitter)) : undefined,
                            h("ion-item", { lines: 'inset' }, h("ion-select", { label: TranslationService.getTransl("units", "Units"), onIonChange: (ev) => this.changeUnits(ev), value: this.userSettings.settings.units, interfaceOptions: {
                                    header: TranslationService.getTransl("units", "Units"),
                                    message: TranslationService.getTransl("units-chnage-message", "This will change the units for the whole app! Are you sure?"),
                                    buttons: [
                                        TranslationService.getTransl("OK", "OK"),
                                        TranslationService.getTransl("cancel", "Cancel"),
                                    ],
                                } }, h("ion-select-option", { value: 'Metric' }, "Metric"), h("ion-select-option", { value: 'Imperial' }, "Imperial"))),
                        ]
                        : undefined, h("app-language-picker", { picker: true, selectedLangCode: this.userSettings.getLanguage()
                            ? this.userSettings.getLanguage()
                            : undefined, onLanguageChanged: (lang) => this.changeLanguage(lang) }), this.checkEmailPsw ? (h("ion-button", { color: Environment.getAppColor(), expand: 'block', onClick: () => {
                            this.sendResetPsw();
                        } }, h("my-transl", { tag: 'reset-psw', text: 'Reset Password' }))) : undefined)),
                ]
                : undefined,
            h("app-modal-footer", { key: 'c5fbf4c001c71b38d02b7e71f476f6c1d98c5b7c', onCancelEmit: () => this.cancel(), onSaveEmit: () => this.update() }),
        ];
    }
};
ModalUserUpdate.style = modalUserUpdateCss;

export { ModalUserUpdate as modal_user_update };

//# sourceMappingURL=modal-user-update.entry.js.map