import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { p as DiveCommunitiesService, a9 as DiveTripsService, o as DIVECOMMUNITIESCOLLECTION, U as UserService, E as UDiveFilterService, a2 as mapHeight, ax as fabButtonTopMarginString } from './utils-cbf49763.js';
import { S as Swiper } from './swiper-a30cd476.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-9be68260.js';
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
import './map-dae4acde.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';

const pageDiveCommunityDetailsCss = "page-dive-community-details ion-segment-button{--color-checked:var(--ion-color-divecommunity-contrast)}";

const PageDiveCommunityDetails = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.admin = false;
        this.markers = [];
        this.dcid = undefined;
        this.diveCommunity = undefined;
        this.diveTrips = undefined;
        this.titles = [
            { tag: "information" },
            { tag: "map" },
            { tag: "next-trips", text: "Next Dive Trips" },
            { tag: "team" },
        ];
        this.slider = undefined;
    }
    async componentWillLoad() {
        //check if admin page or user details page
        if (DiveCommunitiesService.selectedDiveCommunity) {
            //admin page
            this.admin = true;
            this.dcSubscription =
                DiveCommunitiesService.selectedDiveCommunity$.subscribe((dc) => {
                    if (dc && dc.displayName) {
                        this.diveCommunity = dc;
                        this.dcid = DiveCommunitiesService.selectedDiveCommunityId;
                    }
                });
        }
        else {
            this.admin = false;
            this.diveCommunity = await DiveCommunitiesService.getDiveCommunity(this.dcid);
            this.diveTrips = await DiveTripsService.getTripsSummary(DIVECOMMUNITIESCOLLECTION, this.dcid);
            delete this.titles[3];
            delete this.titles[2];
        }
        this.userRoles = UserService.userRoles;
        let dcIcon = UDiveFilterService.getMapDocs()[DIVECOMMUNITIESCOLLECTION]
            .icon;
        dcIcon.size = "large";
        this.markers.push({
            icon: dcIcon,
            latitude: this.diveCommunity.position.geopoint.latitude,
            longitude: this.diveCommunity.position.geopoint.longitude,
        });
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-dive-community", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
        });
        //reset map height inside slide
        await customElements.whenDefined("app-map");
        this.mapElement = this.el.querySelector("#map");
        const mapContainer = this.el.querySelector("#map-container");
        mapContainer.setAttribute("style", "height: " + mapHeight(this.diveCommunity) + "px"); //-cover photo -slider  - title
    }
    disconnectedCallback() {
        if (this.dcSubscription)
            this.dcSubscription.unsubscribe();
    }
    render() {
        return [
            h("ion-header", { key: '6e19ac7f3fb26cf5d6060e0d6664e30412bd6113' }, h("app-item-cover", { key: '4f5f6faf56a730e2417237eb5081084af7600b57', item: this.diveCommunity })),
            h("ion-header", { key: 'a63e535c1bc46791692ee2cc7c26abdbbc8063ff' }, h("ion-toolbar", { key: '1fb751ab049572439502464a7d15a1ec45f08339', color: "divecommunity", class: "no-safe-padding" }, h("ion-title", { key: '7c7a7943402175c0f2ae1904303539ca73c34a33' }, this.diveCommunity.displayName)), h("app-header-segment-toolbar", { key: 'ab4c70030f7cd44c8aa3d4d2779e0452ac75078f', color: "divecommunity", swiper: this.slider, titles: this.titles, noHeader: true })),
            h("ion-content", { key: 'cf1b08b20c0014ae787891b42ca187b03f1d8bc2', class: "slides" }, this.admin ? (h("ion-fab", { vertical: "top", horizontal: "end", slot: "fixed", style: { marginTop: fabButtonTopMarginString(2) } }, h("ion-fab-button", { onClick: () => DiveCommunitiesService.presentDiveCommunityUpdate(this.dcid), class: "fab-icon" }, h("ion-icon", { name: "create" })))) : undefined, h("swiper-container", { key: '6b87ab90fa1314a9f091af0689e364956fa9e3ed', class: "slider-dive-community swiper" }, h("swiper-wrapper", { key: 'b754610714b162e0b7dc631fe785130b09e03e37', class: "swiper-wrapper" }, h("swiper-slide", { key: '73b1b87ccf66ab2dffaca2c35d927f5409a64ed6', class: "swiper-slide" }, h("ion-list", { key: '660ccf7047752e5aea2593200d2b6afddf554813', class: "ion-no-padding" }, h("ion-list-header", { key: '6c11aaff0927253ffd23088934be4a6a83af3ae2' }, h("ion-label", { key: '52bb852109b76d372622cae1193df62e113e70d6', color: "divingcenter" }, h("my-transl", { key: '1054cbf929d8cb289301a6b2282f6ece2b49069e', tag: "general-information", text: "General Information" }))), h("ion-item", { key: '862281724fc8d3b6d42cefd1ac59a6bb91d4731a' }, h("ion-label", { key: '7956b357905d7d3c267366c304cccffcddb20dcf', class: "ion-text-wrap" }, h("ion-text", { key: '8c562925491b02211fd19c6bdc439ef60dd44c09', color: "dark" }, h("p", { key: '46f79a12a6a9704567fb749b1328dfef916b978e' }, this.diveCommunity.description)))), this.diveCommunity.email ? (h("ion-item", { button: true, href: "mailto:" + this.diveCommunity.email }, h("ion-icon", { slot: "start", name: "at-outline" }), h("ion-label", null, this.diveCommunity.email))) : undefined, this.diveCommunity.phoneNumber ? (h("ion-item", { button: true, href: "tel:" + this.diveCommunity.phoneNumber }, h("ion-icon", { slot: "start", name: "call-outline" }), h("ion-label", null, this.diveCommunity.phoneNumber))) : undefined, this.diveCommunity.website ? (h("ion-item", { button: true, href: "http://" + this.diveCommunity.website, target: "_blank" }, h("ion-icon", { slot: "start", name: "link-outline" }), h("ion-label", null, this.diveCommunity.website))) : undefined, this.diveCommunity.facebook ? (h("ion-item", { button: true, href: "https://www.facebook.com/" + this.diveCommunity.facebook, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-facebook" }), h("ion-label", null, this.diveCommunity.facebook))) : undefined, this.diveCommunity.instagram ? (h("ion-item", { button: true, href: "https://www.instagram.com/" +
                    this.diveCommunity.instagram, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-instagram" }), h("ion-label", null, this.diveCommunity.instagram))) : undefined, this.diveCommunity.twitter ? (h("ion-item", { button: true, href: "https://www.twitter.com/" + this.diveCommunity.twitter, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-twitter" }), h("ion-label", null, "@", this.diveCommunity.twitter))) : undefined)), h("swiper-slide", { key: '5ee297ca39599934588bc80bfe89daf1bd179a3d', class: "swiper-slide" }, h("div", { key: 'e45d71128c2847f98520076a249bc9c7c8839fb6', id: "map-container" }, h("app-map", { key: 'e54a2dd6513f84501b2ad777ef753db11a00b33e', id: "map", pageId: "dive-community-details", center: this.diveCommunity, markers: this.markers }))), h("swiper-slide", { key: '1926b04b1e17c4781961d11861b7e3e00e07cca3', class: "swiper-slide" }, h("app-calendar", { key: 'd2ecf85166188a20bc82426f93f3628195fafb62', calendarId: "community-calendar", addEvents: { trips: this.diveTrips } })), this.admin ? (h("swiper-slide", { class: "swiper-slide" }, h("app-users-list", { item: this.diveCommunity, show: ["owner", "editor"] }))) : undefined))),
            this.admin ? (h("ion-footer", { class: "ion-no-border" }, h("ion-toolbar", null, h("ion-button", { expand: "block", fill: "solid", color: "danger", onClick: () => DiveCommunitiesService.deleteDiveCommunity(this.dcid) }, h("ion-icon", { slot: "start", name: "trash" }), h("my-transl", { tag: "delete", text: "Delete", isLabel: true }))))) : undefined,
        ];
    }
    get el() { return getElement(this); }
};
PageDiveCommunityDetails.style = pageDiveCommunityDetailsCss;

export { PageDiveCommunityDetails as page_dive_community_details };

//# sourceMappingURL=page-dive-community-details.entry.js.map