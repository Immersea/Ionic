import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { T as TranslationService, U as UserService, w as UserProfile, a7 as slideHeight, ax as fabButtonTopMarginString, x as AuthService } from './utils-ced1e260.js';
import { E as Environment } from './env-c3ad5e77.js';
import { S as Swiper } from './swiper-a30cd476.js';
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

const pageUserSettingsCss = "page-user-settings .cover-header{margin-top:var(--coverHeight)}page-user-settings ion-segment-button{--color-checked:var(--ion-color-udive-contrast)}page-user-settings .nopaddingtop{padding-top:0px !important}";

const PageUserSettings = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.selectedSegment = "configurations";
        this.userProfile = undefined;
        this.titles = [
            { tag: "user-info", text: "My Info" },
            { tag: "dive-cards" },
            { tag: "user-confs", text: "My Dive Configurations" },
            { tag: "licences" },
            //{tag: "notifications"},
        ];
        this.slider = undefined;
        this.updateView = false;
    }
    componentWillLoad() {
        this.segmentTitles = {
            configurations: TranslationService.getTransl("configurations", "Configurations"),
            tanks: TranslationService.getTransl("tanks", "Tanks"),
        };
        this.userSub$ = UserService.userProfile$.subscribe((userProfile) => {
            this.userProfile = new UserProfile(userProfile);
        });
        this.updateView = !this.updateView;
    }
    async componentDidLoad() {
        this.setSliderHeight();
        //check if user is loaded or trigger local user
        if (!this.userProfile) {
            UserService.initLocalUser();
        }
        this.updateSlider();
    }
    segmentChartChanged(ev) {
        this.selectedSegment = ev.detail.value;
        this.updateSlider();
    }
    updateSlider() {
        this.updateView = !this.updateView;
        setTimeout(() => {
            //reset slider height to show address
            this.slider ? this.slider.update() : undefined;
        }, 100);
    }
    setSliderHeight() {
        this.slider = new Swiper(".slider-user-settings", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: true,
            autoHeight: true,
        });
        //reset sliders height inside slider
        const slideContainers = Array.from(this.el.getElementsByClassName("slide-container"));
        slideContainers.map((container) => {
            container.setAttribute("style", "height: " + slideHeight(this.userProfile) + "px");
        });
    }
    disconnectedCallback() {
        this.userSub$.unsubscribe();
    }
    logScrollStart(ev) {
        this.content = ev.srcElement;
    }
    render() {
        return [
            this.userProfile
                ? [
                    h("ion-header", { class: 'cover-header' }, h("app-user-cover", { showUserDetails: false })),
                    h("app-header-segment-toolbar", { color: Environment.getAppColor(), swiper: this.slider, titles: this.titles }),
                    h("ion-content", { class: 'slides', scrollEvents: true, onIonScrollStart: (ev) => this.logScrollStart(ev) }, h("ion-fab", { vertical: 'top', horizontal: 'start', slot: 'fixed', style: {
                            marginTop: "calc(env(safe-area-inset-top) + " +
                                fabButtonTopMarginString(1) +
                                ")",
                        } }, h("ion-menu-toggle", null, h("ion-fab-button", { color: 'light' }, h("ion-icon", { name: 'menu-outline' })))), h("ion-fab", { vertical: 'top', horizontal: 'end', slot: 'fixed', style: {
                            marginTop: "calc(env(safe-area-inset-top) + " +
                                fabButtonTopMarginString(1) +
                                ")",
                        } }, h("ion-fab-button", { color: 'light', onClick: () => UserService.presentUserUpdate() }, h("ion-icon", { name: 'create-outline' }))), h("swiper-container", { class: 'slider-user-settings swiper' }, h("swiper-wrapper", { class: 'swiper-wrapper' }, h("swiper-slide", { class: 'swiper-slide' }, h("ion-content", { class: 'slide-container' }, h("app-user-cover", { showCover: false }), h("ion-button", { expand: 'block', fill: 'solid', color: 'danger', onClick: () => AuthService.logout() }, h("ion-icon", { slot: 'start', name: 'log-out' }), h("my-transl", { tag: 'logout', text: 'Logout', isLabel: true })))), h("swiper-slide", { class: 'swiper-slide' }, h("app-user-cards", { updateSlider: () => this.updateSlider() })), h("swiper-slide", { class: 'swiper-slide' }, h("div", { class: 'ion-no-padding' }, h("ion-row", null, h("ion-col", null, h("ion-segment", { onIonChange: (ev) => this.segmentChartChanged(ev), color: Environment.getAppColor(), mode: 'ios', value: this.selectedSegment }, h("ion-segment-button", { value: 'configurations' }, h("ion-label", null, this.segmentTitles.configurations)), h("ion-segment-button", { value: 'tanks' }, h("ion-label", null, this.segmentTitles.tanks)))))), this.selectedSegment == "configurations" ? (h("app-user-configurations", null)) : (h("app-user-tanks", null))), h("swiper-slide", { class: 'swiper-slide' }, h("ion-content", { class: 'slide-container' }, h("app-user-licences", null)))))),
                ]
                : undefined,
        ];
    }
    get el() { return getElement(this); }
};
PageUserSettings.style = pageUserSettingsCss;

export { PageUserSettings as page_user_settings };

//# sourceMappingURL=page-user-settings.entry.js.map