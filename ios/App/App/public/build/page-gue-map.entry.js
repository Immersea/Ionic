import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { E as UDiveFilterService, U as UserService, w as UserProfile, o as DIVECOMMUNITIESCOLLECTION, T as TranslationService, p as DiveCommunitiesService } from './utils-5cd4c7bb.js';
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

const pageGueMapCss = "page-gue-map ion-icon{color:rgba(255, 255, 255, 0.9)}";

const PageGueMap = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.searchFilters = [];
        this.searchTags = undefined;
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
        await customElements.whenDefined("app-map");
        this.mapElement = this.el.querySelector("app-map");
        this.filter();
    }
    async addItem(button) {
        let alertMessage = null;
        switch (button) {
            case DIVECOMMUNITIESCOLLECTION:
                alertMessage = {
                    tag: "dive-community",
                    text: "Dive Community",
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
                            case DIVECOMMUNITIESCOLLECTION:
                                DiveCommunitiesService.presentDiveCommunityUpdate();
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
    }
    render() {
        return [
            h("ion-content", { key: 'b5d758fecdad4f55dc916437b566b8178fd8035e', fullscreen: true }, h("app-map", { key: '91f6f9aaccb865bed12b9702d0c073789b42adaf', pageId: "map", searchTags: this.searchTags }), this.userProfile &&
                this.userProfile.uid &&
                UserService.userRoles.isAgencyAdmin() ? (h("ion-fab", { vertical: "bottom", horizontal: "end", slot: "fixed" }, h("ion-fab-button", { class: "fab-icon", onClick: () => this.addItem(DIVECOMMUNITIESCOLLECTION) }, h("ion-icon", { name: "add-circle" })))) : undefined),
        ];
    }
    get el() { return getElement(this); }
};
PageGueMap.style = pageGueMapCss;

export { PageGueMap as page_gue_map };

//# sourceMappingURL=page-gue-map.entry.js.map