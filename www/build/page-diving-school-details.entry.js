import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { n as DivingSchoolsService, a9 as DiveTripsService, aB as DIVETRIPSCOLLECTION, U as UserService, E as UDiveFilterService, m as DIVESCHOOLSSCOLLECTION, a2 as mapHeight, R as RouterService, ax as fabButtonTopMarginString } from './utils-5cd4c7bb.js';
import { S as Swiper } from './swiper-a30cd476.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-0a7fccce.js';
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
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const pageDivingSchoolDetailsCss = "page-diving-school-details ion-segment-button{--color-checked:var(--ion-color-school-contrast)}";

const PageDivingSchoolDetails = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.admin = false;
        this.markers = [];
        this.dsid = undefined;
        this.divingSchool = undefined;
        this.diveTrips = undefined;
        this.divingCourses = undefined;
        this.titles = [
            { tag: "map" },
            { tag: "information" },
            { tag: "diving-courses" },
            { tag: "team" },
            { tag: "next-trips", text: "Next Dive Trips" },
        ];
        this.slider = undefined;
    }
    async componentWillLoad() {
        //check if admin page or user details page
        if (DivingSchoolsService.selectedDivingSchool) {
            //admin page
            this.admin = true;
            this.dsSubscription =
                DivingSchoolsService.selectedDivingSchool$.subscribe((ds) => {
                    if (ds && ds.displayName) {
                        this.divingSchool = ds;
                        this.dsid = DivingSchoolsService.selectedDivingSchoolId;
                    }
                });
        }
        else {
            this.admin = false;
            delete this.titles[4];
            delete this.titles[3];
            this.divingSchool = await DivingSchoolsService.getDivingSchool(this.dsid);
            this.diveTrips = await DiveTripsService.getTripsSummary(DIVETRIPSCOLLECTION, this.dsid);
        }
        this.userRoles = UserService.userRoles;
        this.divingCourses = await DivingSchoolsService.loadDivingSchoolCourses(this.divingSchool);
        let icon = UDiveFilterService.getMapDocs()[DIVESCHOOLSSCOLLECTION]
            .icon;
        icon.size = "large";
        this.markers.push({
            icon: icon,
            latitude: this.divingSchool.position.geopoint.latitude,
            longitude: this.divingSchool.position.geopoint.longitude,
        });
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-diving-school", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
        });
        //reset map height inside slide
        await customElements.whenDefined("app-map");
        this.mapElement = this.el.querySelector("#map");
        const mapContainer = this.el.querySelector("#map-container");
        mapContainer.setAttribute("style", "height: " + mapHeight(this.divingSchool) + "px"); //-cover photo -slider  - title
        this.mapElement["mapLoaded"]().then(() => {
            this.mapElement.triggerMapResize();
        });
        this.mapElement.triggerMapResize();
    }
    disconnectedCallback() {
        if (this.dsSubscription)
            this.dsSubscription.unsubscribe();
    }
    render() {
        return [
            h("ion-header", { key: '3fbcce28f7d226700785e3be9f2af0fa5a2a3ceb' }, h("app-item-cover", { key: 'e2affefc120fd3ba55ed020d0379d0f5d9df5560', item: this.divingSchool })),
            h("ion-header", { key: '7d51bbd52e391dbf2e00605bd2369d7737e46c6e' }, h("ion-toolbar", { key: '1a4cd2e5544056ac74fa5a6f16b6ea771253f085', color: "school", class: "no-safe-padding" }, this.divingSchool && !this.divingSchool.coverURL
                ? [
                    h("ion-buttons", { slot: "start" }, this.admin ? (h("ion-menu-button", null)) : (h("ion-button", { onClick: () => RouterService.goBack(), "icon-only": true }, h("ion-icon", { name: "arrow-back" })))),
                    h("ion-buttons", { slot: "end" }, this.admin ? (h("ion-button", { onClick: () => DivingSchoolsService.presentDivingSchoolUpdate(this.dsid), "icon-only": true }, h("ion-icon", { name: "create" }))) : undefined),
                ]
                : undefined, h("ion-title", { key: 'de178184d7c4189fd32d442debdf895fd74e1303' }, this.divingSchool.displayName))),
            h("app-header-segment-toolbar", { key: 'd99a4d45d338d06b9c05d10da8edf110d5ca3c5b', color: "school", swiper: this.slider, titles: this.titles }),
            h("ion-content", { key: '5d934e442d90e0b85a6d10626a8b0a22e63f41a8', class: "slides" }, this.divingSchool && this.divingSchool.coverURL ? (h("ion-fab", { vertical: "top", horizontal: "start", slot: "fixed", style: { marginTop: fabButtonTopMarginString(2) } }, this.admin ? (h("ion-fab-button", { class: "fab-icon" }, h("ion-menu-button", null))) : (h("ion-fab-button", { onClick: () => RouterService.goBack(), class: "fab-icon" }, h("ion-icon", { name: "arrow-back-circle-outline" }))))) : undefined, this.admin ? (h("ion-fab", { vertical: "top", horizontal: "end", slot: "fixed", style: { marginTop: fabButtonTopMarginString(2) } }, h("ion-fab-button", { onClick: () => DivingSchoolsService.presentDivingSchoolUpdate(this.dsid), class: "fab-icon" }, h("ion-icon", { name: "create" })))) : undefined, h("swiper-container", { key: 'b9115b52ba46e3b93eca7bce44870c818f4f7bb6', class: "slider-diving-school swiper" }, h("swiper-wrapper", { key: 'f6aded3cd3f8db5bbb55e397369dab4a13d3575c', class: "swiper-wrapper" }, h("swiper-slide", { key: 'c4a5761e7f4a30347165fa6fff4477c62fd66c4e', class: "swiper-slide" }, h("ion-list", { key: 'bd35c434cb1a98b0db1d39f09def2395e698f142', class: "ion-no-padding" }, h("ion-list-header", { key: '4d18593d1a20d0a9d874dde2b671804dc81abfea' }, h("ion-label", { key: 'fcff715facb5eb9f541996b6c2c6895813134296', color: "school" }, h("my-transl", { key: '1f94c2db58c8e6c370535bcc7b20e6a3f591a87c', tag: "general-information", text: "General Information" }))), h("ion-item", { key: '38d8c8ad0fb5c6d209e1daebe5d9565a8fabbbcb' }, h("ion-label", { key: '06b4ffa0559b14a9ed4157496618d20edd65eb14', class: "ion-text-wrap" }, h("ion-text", { key: '0c1101355faf55cc792e784bff2f672ee1b7df5d', color: "dark" }, h("p", { key: 'f91fdb686cab3fe48cee2a78017aa62a157e2ac3' }, this.divingSchool.description)))), this.divingSchool.email ? (h("ion-item", { button: true, href: "mailto:" + this.divingSchool.email }, h("ion-icon", { slot: "start", name: "at-outline" }), h("ion-label", null, this.divingSchool.email))) : undefined, this.divingSchool.phoneNumber ? (h("ion-item", { button: true, href: "tel:" + this.divingSchool.phoneNumber }, h("ion-icon", { slot: "start", name: "call-outline" }), h("ion-label", null, this.divingSchool.phoneNumber))) : undefined, this.divingSchool.website ? (h("ion-item", { button: true, href: "http://" + this.divingSchool.website, target: "_blank" }, h("ion-icon", { slot: "start", name: "link-outline" }), h("ion-label", null, this.divingSchool.website))) : undefined, this.divingSchool.facebook ? (h("ion-item", { button: true, href: "https://www.facebook.com/" + this.divingSchool.facebook, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-facebook" }), h("ion-label", null, this.divingSchool.facebook))) : undefined, this.divingSchool.instagram ? (h("ion-item", { button: true, href: "https://www.instagram.com/" + this.divingSchool.instagram, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-instagram" }), h("ion-label", null, this.divingSchool.instagram))) : undefined, this.divingSchool.twitter ? (h("ion-item", { button: true, href: "https://www.twitter.com/" + this.divingSchool.twitter, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-twitter" }), h("ion-label", null, "@", this.divingSchool.twitter))) : undefined)), h("swiper-slide", { key: 'f15d0a9ac3edf4b8df9f39cf7178b83c4b149033', class: "swiper-slide" }, h("div", { key: 'a6e5f9ae602b8e27054749aa5c81886837ac505f', id: "map-container" }, h("app-map", { key: '698a51d4b0f860c521578383ed0a9ec70ff4bb13', id: "map", pageId: "dive-site-details", center: this.divingSchool, markers: this.markers }))), h("swiper-slide", { key: 'f53a0214278e42492a1b00aec5fb809e5bd9faa7', class: "swiper-slide" }, h("ion-grid", { key: 'e9115623318338f96ffde3ddfe02cee2e22d45fb' }, h("ion-row", { key: '54f5db4f48966e9ee0bdba87fdadf566261238e9', class: "ion-text-start" }, this.divingCourses.divingSchoolCourses.map((course) => (h("ion-col", { "size-sm": "12", "size-md": "6", "size-lg": "4" }, h("app-dive-course-card", { divingCourse: course, edit: false }))))))), this.admin ? (h("swiper-slide", { class: "swiper-slide" }, h("app-users-list", { item: this.divingSchool, show: ["owner", "editor", "instructor"] }))) : (h("swiper-slide", { class: "swiper-slide" }, h("app-calendar", { calendarId: "diving-school-calendar", addEvents: { trips: this.diveTrips } })))))),
            this.admin ? (h("ion-footer", { class: "ion-no-border" }, h("ion-toolbar", null, h("ion-button", { expand: "block", fill: "solid", color: "danger", onClick: () => DivingSchoolsService.deleteDivingSchool(this.dsid) }, h("ion-icon", { slot: "start", name: "trash" }), h("my-transl", { tag: "delete", text: "Delete", isLabel: true }))))) : undefined,
        ];
    }
    get el() { return getElement(this); }
};
PageDivingSchoolDetails.style = pageDivingSchoolDetailsCss;

export { PageDivingSchoolDetails as page_diving_school_details };

//# sourceMappingURL=page-diving-school-details.entry.js.map