import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { i as DivingCentersService, a9 as DiveTripsService, c as DIVECENTERSSCOLLECTION, U as UserService, E as UDiveFilterService, e as DIVESITESCOLLECTION, a2 as mapHeight, R as RouterService, ax as fabButtonTopMarginString } from './utils-cbf49763.js';
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

const pageDivingCenterDetailsCss = "page-diving-center-details ion-segment-button{--color-checked:var(--ion-color-divingcenter-contrast)}";

const PageDivingCenterDetails = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.admin = false;
        this.markers = [];
        this.dcid = undefined;
        this.divingCenter = undefined;
        this.diveTrips = undefined;
        this.diveSites = undefined;
        this.titles = [
            { tag: "map" },
            { tag: "information" },
            { tag: "dive-sites" },
            { tag: "team" },
            { tag: "next-trips", text: "Next Dive Trips" },
        ];
        this.slider = undefined;
    }
    async componentWillLoad() {
        //check if admin page or user details page
        if (DivingCentersService.selectedDivingCenter) {
            //admin page
            this.admin = true;
            this.dcSubscription =
                DivingCentersService.selectedDivingCenter$.subscribe((dc) => {
                    if (dc && dc.displayName) {
                        this.divingCenter = dc;
                        this.dcid = DivingCentersService.selectedDivingCenterId;
                    }
                });
        }
        else {
            this.admin = false;
            delete this.titles[4];
            delete this.titles[3];
            this.divingCenter = await DivingCentersService.getDivingCenter(this.dcid);
            this.diveTrips = await DiveTripsService.getTripsSummary(DIVECENTERSSCOLLECTION, this.dcid);
        }
        this.userRoles = UserService.userRoles;
        this.diveSites = DivingCentersService.loadDivingCenterSites(this.divingCenter);
        let dcIcon = UDiveFilterService.getMapDocs()[DIVECENTERSSCOLLECTION]
            .icon;
        dcIcon.size = "large";
        this.markers.push({
            icon: dcIcon,
            latitude: this.divingCenter.position.geopoint.latitude,
            longitude: this.divingCenter.position.geopoint.longitude,
        });
        let siteIcon = UDiveFilterService.getMapDocs()[DIVESITESCOLLECTION]
            .icon;
        siteIcon.size = "small";
        this.diveSites.divingCenterSites.forEach((site) => {
            this.markers.push({
                name: site.displayName,
                icon: siteIcon,
                latitude: site.position.geopoint.latitude,
                longitude: site.position.geopoint.longitude,
            });
        });
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-diving-center", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
        });
        //reset map height inside slide
        await customElements.whenDefined("app-map");
        this.mapElement = this.el.querySelector("#map");
        const mapContainer = this.el.querySelector("#map-container");
        mapContainer.setAttribute("style", "height: " + mapHeight(this.divingCenter) + "px"); //-cover photo -slider  - title
        this.mapElement["mapLoaded"]().then(() => {
            //add dive sites lines
            this.setLinesForDiveCenter();
        });
        //add dive sites lines
        this.setLinesForDiveCenter();
    }
    disconnectedCallback() {
        if (this.dcSubscription)
            this.dcSubscription.unsubscribe();
    }
    setLinesForDiveCenter() {
        this.mapElement.triggerMapResize();
        const pointsArray = [this.divingCenter];
        this.diveSites.divingCenterSites.forEach(async (site) => {
            pointsArray.push(site);
            this.mapElement["createLine"](site.id, this.divingCenter, site);
        });
        this.mapElement["fitToBounds"](pointsArray);
    }
    render() {
        return [
            h("ion-header", { key: '4a1def5846750bfac4e9e0d3bd35515ced251a7d' }, h("app-item-cover", { key: '168b1423ae638f6c2f31d06b70d86fc59cacb4da', item: this.divingCenter })),
            h("ion-header", { key: '659854ce429263632802d68bcf4bbad30bd3a4b4' }, h("ion-toolbar", { key: '655a49cdacc53115bc79be338958c8bc2be4576a', color: "divingcenter", class: "no-safe-padding" }, this.divingCenter && !this.divingCenter.coverURL
                ? [
                    h("ion-buttons", { slot: "start" }, this.admin ? (h("ion-menu-button", null)) : (h("ion-button", { onClick: () => RouterService.goBack(), "icon-only": true }, h("ion-icon", { name: "arrow-back" })))),
                    h("ion-buttons", { slot: "end" }, this.admin ? (h("ion-button", { onClick: () => DivingCentersService.presentDivingCenterUpdate(this.dcid), "icon-only": true }, h("ion-icon", { name: "create" }))) : undefined),
                ]
                : undefined, h("ion-title", { key: 'a19c56a3bee486fb4347b9f5742df6d25ba874aa' }, this.divingCenter.displayName))),
            h("app-header-segment-toolbar", { key: '45d845fb7a0f31e080038eda5202fbcd19de3f45', color: "divingcenter", swiper: this.slider, titles: this.titles }),
            h("ion-content", { key: '7903c144eb45b3e80622c54097d0e41c71f3340a', class: "slides" }, this.divingCenter && this.divingCenter.coverURL ? (h("ion-fab", { vertical: "top", horizontal: "start", slot: "fixed", style: { marginTop: fabButtonTopMarginString(2) } }, this.admin ? (h("ion-fab-button", { class: "fab-icon" }, h("ion-menu-button", null))) : (h("ion-fab-button", { onClick: () => RouterService.goBack(), class: "fab-icon" }, h("ion-icon", { name: "arrow-back-circle-outline" }))))) : undefined, this.admin ? (h("ion-fab", { vertical: "top", horizontal: "end", slot: "fixed", style: { marginTop: fabButtonTopMarginString(2) } }, h("ion-fab-button", { onClick: () => DivingCentersService.presentDivingCenterUpdate(this.dcid), class: "fab-icon" }, h("ion-icon", { name: "create" })))) : undefined, h("swiper-container", { key: 'e873d4e7da4952deaefe289d9f28dbb004092e0c', class: "slider-diving-center swiper" }, h("swiper-wrapper", { key: 'efa5e462a82346aa8b209b91bc0393915035d064', class: "swiper-wrapper" }, h("swiper-slide", { key: 'c57516f1082301bdf76d49a1bcdfc41439b3014c', class: "swiper-slide" }, h("ion-list", { key: '9b8e06b82805fc99b9d33287c409fe13ce772e6e', class: "ion-no-padding" }, h("ion-list-header", { key: 'bfd01c7ca4fef3db7b21381b38596aefa360fece' }, h("ion-label", { key: '68dd1567511e31bf3e8881805f26c4645c51289e', color: "divingcenter" }, h("my-transl", { key: '2f87560d4ca9beba5a50a8d6b5c1c63ab1d5b727', tag: "general-information", text: "General Information" }))), h("ion-item", { key: '18103c9490a92d19219152378353c460cdf38d60' }, h("ion-label", { key: '2d56e78eac34e5c2f6fcb2c4a08a655b159e6e7d', class: "ion-text-wrap" }, h("ion-text", { key: 'fd9014a8c9a0a47b0b8f8a746f3e31e7202cb5a2', color: "dark" }, h("p", { key: '30697e558392db3ff89ba261fce9e5045ee0db7d' }, this.divingCenter.description)))), this.divingCenter.email ? (h("ion-item", { button: true, href: "mailto:" + this.divingCenter.email }, h("ion-icon", { slot: "start", name: "at-outline" }), h("ion-label", null, this.divingCenter.email))) : undefined, this.divingCenter.phoneNumber ? (h("ion-item", { button: true, href: "tel:" + this.divingCenter.phoneNumber }, h("ion-icon", { slot: "start", name: "call-outline" }), h("ion-label", null, this.divingCenter.phoneNumber))) : undefined, this.divingCenter.website ? (h("ion-item", { button: true, href: "http://" + this.divingCenter.website, target: "_blank" }, h("ion-icon", { slot: "start", name: "link-outline" }), h("ion-label", null, this.divingCenter.website))) : undefined, this.divingCenter.facebook ? (h("ion-item", { button: true, href: "https://www.facebook.com/" + this.divingCenter.facebook, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-facebook" }), h("ion-label", null, this.divingCenter.facebook))) : undefined, this.divingCenter.instagram ? (h("ion-item", { button: true, href: "https://www.instagram.com/" + this.divingCenter.instagram, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-instagram" }), h("ion-label", null, this.divingCenter.instagram))) : undefined, this.divingCenter.twitter ? (h("ion-item", { button: true, href: "https://www.twitter.com/" + this.divingCenter.twitter, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-twitter" }), h("ion-label", null, "@", this.divingCenter.twitter))) : undefined)), h("swiper-slide", { key: 'ba6a935de62f04ee0a9b149aa59ef762ec67eac8', class: "swiper-slide" }, h("div", { key: 'd2e5f3e29323b73ae35c97805d1902c568824646', id: "map-container" }, h("app-map", { key: '465abf3fca99c3c09704fcedb1d49a1083a06658', id: "map", pageId: "diving-center-details", center: this.divingCenter, markers: this.markers }))), h("swiper-slide", { key: 'a0c20894e59aa41c3d9967ffef1490e6c4c4f805', class: "swiper-slide" }, h("ion-grid", { key: 'd4ba8c45dbd5777f27fdee57b026ec28709590f2' }, h("ion-row", { key: '86073d37a479c9196358bceda1e5adf7de8fc33b', class: "ion-text-start" }, this.diveSites.divingCenterSites.map((site) => (h("ion-col", { "size-sm": "12", "size-md": "6", "size-lg": "4" }, h("app-dive-site-card", { diveSite: site, startlocation: this.divingCenter, edit: false }))))))), this.admin ? (h("swiper-slide", { class: "swiper-slide" }, h("app-users-list", { item: this.divingCenter, show: ["owner", "editor"] }))) : (h("swiper-slide", { class: "swiper-slide" }, h("app-calendar", { calendarId: "diving-center-calendar", addEvents: { trips: this.diveTrips } })))))),
            this.admin ? (h("ion-footer", { class: "ion-no-border" }, h("ion-toolbar", null, h("ion-button", { expand: "block", fill: "solid", color: "danger", onClick: () => DivingCentersService.deleteDivingCenter(this.dcid) }, h("ion-icon", { slot: "start", name: "trash" }), h("my-transl", { tag: "delete", text: "Delete", isLabel: true }))))) : undefined,
        ];
    }
    get el() { return getElement(this); }
};
PageDivingCenterDetails.style = pageDivingCenterDetailsCss;

export { PageDivingCenterDetails as page_diving_center_details };

//# sourceMappingURL=page-diving-center-details.entry.js.map