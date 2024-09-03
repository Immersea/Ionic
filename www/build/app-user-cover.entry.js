import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { U as UserService, w as UserProfile, z as UserSettings, x as AuthService } from './utils-cbf49763.js';
import { E as Environment } from './env-9be68260.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-dae4acde.js';
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
import './customerLocation-71248eea.js';

const appUserCoverCss = "app-user-cover{width:100%}app-user-cover ion-grid{height:100%;padding:0}app-user-cover ion-row{align-items:center;text-align:center;height:80%;width:100%}app-user-cover .name{margin-top:20px;font-weight:600;font-size:18pt;color:#777}app-user-cover .info{margin-top:-5px;margin-bottom:5px;font-family:\"Montserrat\", sans-serif;font-size:11pt;color:#aaa}app-user-cover ion-thumbnail{position:relative;margin-top:-100px;margin-bottom:0;width:100px;height:100px}app-user-cover ion-thumbnail img{border-radius:50%;padding:0.08em;border:solid 0.25em lightsteelblue;background-color:white}app-user-cover .cover-main{position:absolute;background-color:lightblue;background-size:cover;background-position:center;background-repeat:no-repeat;box-shadow:0 4px 8px 0 rgba(0, 0, 0, 0.2);margin-top:calc(-1 * var(--coverHeight));height:var(--coverHeight);width:100%}app-user-cover .cover-main ion-button{position:absolute;right:0px}app-user-cover .cover-main ion-menu-button{position:absolute;left:0px;top:0px;color:black;mix-blend-mode:difference}";

const AppUserCover = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.userProfile = undefined;
        this.userSettings = undefined;
        this.tmbPosition = undefined;
        this.showCover = true;
        this.showUserDetails = true;
        this.updateView = false;
    }
    componentWillLoad() {
        if (!this.userProfile) {
            this.userProfileSub$ = UserService.userProfile$.subscribe((userProfile) => {
                this.userProfile = new UserProfile(userProfile);
            });
            this.userSettingsSub$ = UserService.userSettings$.subscribe((userSettings) => {
                this.userSettings = new UserSettings(userSettings);
            });
        }
    }
    componentDidLoad() {
        //check if user is loaded or trigger local user
        if (!this.userProfile) {
            UserService.initLocalUser();
        }
    }
    disconnectedCallback() {
        this.userProfileSub$ ? this.userProfileSub$.unsubscribe() : undefined;
        this.userSettingsSub$ ? this.userSettingsSub$.unsubscribe() : undefined;
    }
    render() {
        return (h(Host, { key: '9140d6ed673a80db912325dab2a7e828f2abe2dc' }, this.showCover && this.userProfile && this.userProfile.uid ? ([
            h("div", { class: 'cover-main', style: {
                    backgroundImage: this.userProfile.coverURL
                        ? "url(" + this.userProfile.coverURL + ")"
                        : "url('./assets/images/friendship2SM.jpg')",
                } }, h("slot", null)),
            h("ion-thumbnail", { style: {
                    marginLeft: this.tmbPosition == "left" ? "10%" : "auto",
                    marginRight: this.tmbPosition == "right" ? "10%" : "auto",
                } }, h("img", { src: this.userProfile.photoURL
                    ? this.userProfile.photoURL
                    : "assets/images/avatar.png", alt: this.userProfile.displayName })),
        ]) : (h("div", { class: 'cover-main', style: {
                backgroundImage: "url('./assets/images/friendship2SM.jpg')",
            } }, h("slot", null))), this.showUserDetails && this.userProfile && this.userProfile.uid ? (h("div", null, h("ion-row", null, h("ion-col", null, h("h1", { class: 'name' }, this.userProfile.displayName))), h("ion-row", null, h("ion-col", null, h("p", { class: 'info' }, h("ion-icon", { name: 'mail' }), " ", this.userProfile.email))), this.userProfile.address ? (h("ion-row", null, h("ion-col", null, h("p", { class: 'info' }, h("ion-icon", { name: 'navigate-outline' }), " ", this.userProfile.address.display_name)))) : undefined, this.userSettings
            ? [
                !Environment.isTrasteel() ? (h("ion-row", null, h("ion-col", null, h("p", { class: 'info' }, h("my-transl", { tag: 'units', text: 'Units' }), ":", " ", this.userSettings.settings.units)))) : undefined,
                h("ion-row", null, h("ion-col", null, h("app-language-picker", { class: 'info', selectedLangCode: this.userSettings.getLanguage() }))),
            ]
            : undefined, this.userProfile.bio ? (h("ion-row", null, h("ion-col", null, h("ion-card", { class: 'info' }, h("ion-card-subtitle", null, h("my-transl", { tag: 'biography', text: 'Biography' })), h("ion-card-content", null, this.userProfile.bio))))) : undefined, h("ion-row", null, h("ion-col", null, h("ion-button", { expand: 'block', color: Environment.getAppColor(), onClick: () => UserService.presentUserUpdate() }, h("ion-icon", { name: 'create', slot: 'start' }), h("ion-label", null, h("my-transl", { tag: 'edit', text: 'Edit' }))))), h("ion-row", null, h("ion-col", { class: 'ion-text-right ion-padding-end' }, h("a", { onClick: () => AuthService.deleteUser() }, h("my-transl", { tag: 'delete-account', text: 'Delete Account' })))))) : undefined));
    }
};
AppUserCover.style = appUserCoverCss;

export { AppUserCover as app_user_cover };

//# sourceMappingURL=app-user-cover.entry.js.map