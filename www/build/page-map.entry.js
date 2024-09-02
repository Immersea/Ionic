import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { E as UDiveFilterService, U as UserService, w as UserProfile, k as SERVICECENTERSCOLLECTION, m as DIVESCHOOLSSCOLLECTION, o as DIVECOMMUNITIESCOLLECTION, c as DIVECENTERSSCOLLECTION, e as DIVESITESCOLLECTION, T as TranslationService, l as ServiceCentersService, n as DivingSchoolsService, p as DiveCommunitiesService, i as DivingCentersService, d as DiveSitesService, q as USERPUBLICPROFILECOLLECTION } from './utils-5cd4c7bb.js';
import './index-be90eba5.js';
import { a as alertController } from './overlays-b3ceb97d.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-0a7fccce.js';
import './ionic-global-c07767bf.js';
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';
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

const pageMapCss = "page-map ion-icon{color:rgba(255, 255, 255, 0.9)}";

const PageMap = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.searchFilters = [];
        this.searchTags = undefined;
        this.markers = [];
        this.userProfile = undefined;
    }
    mapLoadingCompletedHandler() {
        //necessary to recenter map in the correct position
        this.mapElement ? this.mapElement["triggerMapResize"]() : undefined;
    }
    componentWillLoad() {
        this.filterButtonTypes = UDiveFilterService.getMapDocs();
        this.searchFilters = Object.keys(this.filterButtonTypes);
        this.userSub$ = UserService.userProfile$.subscribe((userProfile) => {
            this.userProfile = new UserProfile(userProfile);
        });
    }
    async componentDidLoad() {
        this.filterElement = this.el.getElementsByTagName("app-search-filter")[0];
        await customElements.whenDefined("app-map");
        this.mapElement = this.el.querySelector("app-map");
        this.filter();
    }
    disconnectedCallback() {
        this.userSub$.unsubscribe();
    }
    async addItem(button) {
        let alertMessage = null;
        switch (button) {
            case DIVESITESCOLLECTION:
                alertMessage = {
                    tag: "dive-site",
                    text: "Dive Site",
                };
                break;
            case DIVECENTERSSCOLLECTION:
                alertMessage = {
                    tag: "diving-center",
                    text: "Diving Center",
                };
                break;
            case DIVECOMMUNITIESCOLLECTION:
                alertMessage = {
                    tag: "dive-community",
                    text: "Dive Community",
                };
                break;
            case DIVESCHOOLSSCOLLECTION:
                alertMessage = {
                    tag: "diving-school",
                    text: "Diving School",
                };
                break;
            case SERVICECENTERSCOLLECTION:
                alertMessage = {
                    tag: "service-center",
                    text: "Service Center",
                };
                break;
        }
        const alert = await alertController.create({
            header: TranslationService.getTransl(alertMessage.tag, alertMessage.text),
            message: TranslationService.getTransl("add-item-message", "This will add a new item of type:") +
                " " +
                TranslationService.getTransl(alertMessage.tag, alertMessage.text) +
                ". " +
                TranslationService.getTransl("are-you-sure", "Are you sure?"),
            buttons: [
                {
                    text: TranslationService.getTransl("cancel", "Cancel"),
                    role: "cancel",
                    handler: () => { },
                },
                {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: () => {
                        switch (button) {
                            case DIVESITESCOLLECTION:
                                DiveSitesService.presentDiveSiteUpdate();
                                break;
                            case DIVECENTERSSCOLLECTION:
                                DivingCentersService.presentDivingCenterUpdate();
                                break;
                            case DIVECOMMUNITIESCOLLECTION:
                                DiveCommunitiesService.presentDiveCommunityUpdate();
                                break;
                            case DIVESCHOOLSSCOLLECTION:
                                DivingSchoolsService.presentDivingSchoolUpdate();
                                break;
                            case SERVICECENTERSCOLLECTION:
                                ServiceCentersService.presentServiceCenterUpdate();
                                break;
                        }
                    },
                },
            ],
        });
        alert.present();
    }
    filter(ev) {
        this.searchTags = ev ? ev.detail : [];
        this.mapElement.updateSearchTags(this.searchTags);
        this.mapElement.fitToBounds();
    }
    render() {
        return [
            h("ion-header", { key: '7be44df11dd60c96c7af413cc08e33c80660b7b8' }, h("app-search-filter", { key: '6fe258cdb9a8ae2ce7ab929909745b6905f948ef', onSearchFilterEmit: (ev) => this.filter(ev) })),
            h("ion-content", { key: '901ab2014e77d543d5d070891216cb7368966e23', fullscreen: true }, h("app-map", { key: '22c8318a65ea58ea7e247fbd9f83a4e6b90f92e9', pageId: "map", searchTags: this.searchTags }), this.userProfile && this.userProfile.uid ? (h("ion-fab", { vertical: "bottom", horizontal: "end", slot: "fixed" }, h("ion-fab-button", { class: "fab-icon" }, h("ion-icon", { name: "add-circle" })), h("ion-fab-list", { side: "start" }, this.searchFilters.map((button) => button != USERPUBLICPROFILECOLLECTION ? (h("ion-fab-button", { style: {
                    "--background": this.filterButtonTypes[button].icon.color,
                }, onClick: () => this.addItem(button) }, this.filterButtonTypes[button].icon.type == "ionicon" ? (h("ion-icon", { name: this.filterButtonTypes[button].icon.name })) : (h("ion-icon", { class: "map-icon " + this.filterButtonTypes[button].icon.name })))) : undefined)))) : undefined),
        ];
    }
    get el() { return getElement(this); }
};
PageMap.style = pageMapCss;

export { PageMap as page_map };

//# sourceMappingURL=page-map.entry.js.map