import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { U as UserService, w as UserProfile, a7 as slideHeight, al as ShapesService, ag as ProjectsService, O as DatasheetsService, ax as fabButtonTopMarginString, x as AuthService, F as TrasteelFilterService, t as SHAPESCOLLECTION, s as DATASHEETSCOLLECTION, P as PROJECTSCOLLECTION } from './utils-ced1e260.js';
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

const pageTrsUserSettingsCss = "page-trs-user-settings .cover{height:var(--coverHeight)}page-trs-user-settings .nopaddingtop{padding-top:0px !important}";

const PageTrsUserSettings = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.titles = [
            { tag: "user-info", text: "My Info" },
            { tag: "admin", text: "Administration" },
        ];
        this.userProfile = undefined;
        this.userRoles = undefined;
        this.slider = undefined;
        this.updateView = false;
    }
    componentWillLoad() {
        this.userSub$ = UserService.userProfile$.subscribe((userProfile) => {
            this.userProfile = new UserProfile(userProfile);
            this.userRoles = UserService.userRoles;
        });
    }
    async componentDidLoad() {
        this.setSliderHeight();
        //check if user is loaded or trigger local user
        if (!this.userProfile) {
            UserService.initLocalUser();
        }
        this.updateSlider();
    }
    setSliderHeight() {
        this.slider = new Swiper(".slider-user-settings", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
        });
        //reset sliders height inside slider
        if (this.userProfile.photoURL || this.userProfile.coverURL) {
            const slideContainers = Array.from(this.el.getElementsByClassName("slide-container"));
            slideContainers.map((container) => {
                container.setAttribute("style", "height: " + (slideHeight(this.userProfile) - 190) + "px");
            });
        }
    }
    disconnectedCallback() {
        this.userSub$.unsubscribe();
    }
    updateSlider() {
        this.updateView = !this.updateView;
        //wait for view to update and then reset slider height
        setTimeout(() => {
            this.slider ? this.slider.update() : undefined;
        }, 100);
        this.scrollToTop();
    }
    scrollToTop() {
        this.content ? this.content.scrollToTop() : undefined;
    }
    logScrollStart(ev) {
        this.content = ev.srcElement;
    }
    checkShapesMapData() {
        ShapesService.checkMapData();
    }
    checkProjectsMapData() {
        ProjectsService.checkMapData();
    }
    checkDatasheetsMapData() {
        DatasheetsService.checkMapData();
    }
    render() {
        return [
            this.userProfile
                ? [
                    this.userProfile.coverURL || this.userProfile.photoURL ? (h("ion-header", { class: "cover" }, h("app-user-cover", { showUserDetails: false }))) : (h("app-navbar", { color: Environment.getAppColor(), tag: "settings", text: "Settings" })),
                    h("app-header-segment-toolbar", { color: Environment.getAppColor(), swiper: this.slider, titles: this.titles, class: "nopaddingtop" }),
                    h("ion-content", { class: "slides", scrollEvents: true, onIonScrollStart: (ev) => this.logScrollStart(ev) }, this.userProfile.coverURL || this.userProfile.photoURL
                        ? [
                            h("ion-fab", { vertical: "top", horizontal: "start", slot: "fixed", style: {
                                    marginTop: "calc(env(safe-area-inset-top) + " +
                                        fabButtonTopMarginString(1) +
                                        ")",
                                } }, h("ion-menu-toggle", null, h("ion-fab-button", { color: "light" }, h("ion-icon", { name: "menu-outline" })))),
                            h("ion-fab", { vertical: "top", horizontal: "end", slot: "fixed", style: {
                                    marginTop: "calc(env(safe-area-inset-top) + " +
                                        fabButtonTopMarginString(1) +
                                        ")",
                                } }, h("ion-fab-button", { color: "light", onClick: () => UserService.presentUserUpdate() }, h("ion-icon", { name: "create-outline" }))),
                        ]
                        : undefined, h("swiper-container", { class: "slider-user-settings swiper" }, h("swiper-wrapper", { class: "swiper-wrapper" }, h("swiper-slide", { class: "swiper-slide" }, h("app-user-cover", { showCover: false }), h("ion-footer", { class: "ion-no-border" }, h("ion-toolbar", null, h("ion-button", { expand: "block", fill: "solid", color: "danger", onClick: () => AuthService.logout() }, h("ion-icon", { slot: "start", name: "log-out" }), h("my-transl", { tag: "logout", text: "Logout", isLabel: true }))))), h("swiper-slide", { class: "swiper-slide" }, h("ion-list", null, this.userRoles.isSuperAdmin()
                        ? [
                            h("ion-item-divider", null, h("ion-label", null, "SuperAdmin")),
                            h("ion-item", { button: true, onClick: () => this.checkShapesMapData() }, h("ion-label", null, "Check Shapes MapData")),
                            h("ion-item", { button: true, onClick: () => this.checkDatasheetsMapData() }, h("ion-label", null, "Check Datasheets MapData")),
                            h("ion-item", { button: true, onClick: () => this.checkProjectsMapData() }, h("ion-label", null, "Check Projects MapData")),
                        ]
                        : undefined, h("ion-item-divider", null, h("ion-label", null, "Shapes")), h("ion-item", { button: true, onClick: () => ShapesService.editShapeTypes() }, h("ion-icon", { name: TrasteelFilterService.getMapDocs(SHAPESCOLLECTION)
                            .icon.name, slot: "start" }), h("ion-label", null, "Edit Types")), h("ion-item-divider", null, h("ion-label", null, "Datasheets")), h("ion-item", { button: true, onClick: () => DatasheetsService.editDatasheetSettings("majorfamily") }, h("ion-icon", { name: TrasteelFilterService.getMapDocs(DATASHEETSCOLLECTION).icon.name, slot: "start" }), h("ion-label", null, "Edit Major Families")), h("ion-item", { button: true, onClick: () => DatasheetsService.editDatasheetSettings("family") }, h("ion-icon", { name: TrasteelFilterService.getMapDocs(DATASHEETSCOLLECTION).icon.name, slot: "start" }), h("ion-label", null, "Edit Families")), h("ion-item", { button: true, onClick: () => DatasheetsService.editDatasheetSettings("category") }, h("ion-icon", { name: TrasteelFilterService.getMapDocs(DATASHEETSCOLLECTION).icon.name, slot: "start" }), h("ion-label", null, "Edit Categories")), h("ion-item", { button: true, onClick: () => DatasheetsService.editDatasheetSettings("propertyType") }, h("ion-icon", { name: TrasteelFilterService.getMapDocs(DATASHEETSCOLLECTION).icon.name, slot: "start" }), h("ion-label", null, "Edit Property Types")), h("ion-item", { button: true, onClick: () => DatasheetsService.editDatasheetSettings("propertyName") }, h("ion-icon", { name: TrasteelFilterService.getMapDocs(DATASHEETSCOLLECTION).icon.name, slot: "start" }), h("ion-label", null, "Edit Property Names")), h("ion-item", { button: true, onClick: () => DatasheetsService.editDatasheetSettings("qualityColorCode") }, h("ion-icon", { name: TrasteelFilterService.getMapDocs(DATASHEETSCOLLECTION).icon.name, slot: "start" }), h("ion-label", null, "Edit Quality Color Codes")), h("ion-item-divider", null, h("ion-label", null, "Projects")), h("ion-item", { button: true, onClick: () => ProjectsService.editProjectSettings("bricksAllocationArea") }, h("ion-icon", { name: TrasteelFilterService.getMapDocs(PROJECTSCOLLECTION)
                            .icon.name, slot: "start" }), h("ion-label", null, "Edit Bricks Allocation Areas")), h("ion-item", { button: true, onClick: () => ProjectsService.editProjectSettings("applicationUnit") }, h("ion-icon", { name: TrasteelFilterService.getMapDocs(PROJECTSCOLLECTION)
                            .icon.name, slot: "start" }), h("ion-label", null, "Edit Application Units")), h("ion-item", { button: true, onClick: () => ProjectsService.editProjectSettings("quantityUnit") }, h("ion-icon", { name: TrasteelFilterService.getMapDocs(PROJECTSCOLLECTION)
                            .icon.name, slot: "start" }), h("ion-label", null, "Edit Quantity Units"))))))),
                ]
                : undefined,
        ];
    }
    get el() { return getElement(this); }
};
PageTrsUserSettings.style = pageTrsUserSettingsCss;

export { PageTrsUserSettings as page_trs_user_settings };

//# sourceMappingURL=page-trs-user-settings.entry.js.map