import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { l as ServiceCentersService, U as UserService, E as UDiveFilterService, k as SERVICECENTERSCOLLECTION, a2 as mapHeight, R as RouterService, ax as fabButtonTopMarginString } from './utils-cbf49763.js';
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

const pageServiceCenterDetailsCss = "page-service-center-details ion-segment-button{--color-checked:var(--ion-color-servicecenter-contrast)}";

const PageServiceCenterDetails = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.admin = false;
        this.markers = [];
        this.centerid = undefined;
        this.serviceCenter = undefined;
        this.titles = [{ tag: "map" }, { tag: "information" }, { tag: "team" }];
        this.slider = undefined;
    }
    async componentWillLoad() {
        //check if admin page or user details page
        if (ServiceCentersService.selectedServiceCenter) {
            //admin page
            this.admin = true;
            this.scSubscription =
                ServiceCentersService.selectedServiceCenter$.subscribe((sc) => {
                    if (sc && sc.displayName) {
                        this.serviceCenter = sc;
                        this.centerid = ServiceCentersService.selectedServiceCenterId;
                    }
                });
        }
        else {
            this.admin = false;
            delete this.titles[2];
            this.serviceCenter = await ServiceCentersService.getServiceCenter(this.centerid);
        }
        this.userRoles = UserService.userRoles;
        let icon = UDiveFilterService.getMapDocs()[SERVICECENTERSCOLLECTION]
            .icon;
        icon.size = "large";
        this.markers.push({
            icon: icon,
            latitude: this.serviceCenter.position.geopoint.latitude,
            longitude: this.serviceCenter.position.geopoint.longitude,
        });
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-service-center", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
        });
        //reset map height inside slide
        await customElements.whenDefined("app-map");
        this.mapElement = this.el.querySelector("#map");
        const mapContainer = this.el.querySelector("#map-container");
        mapContainer.setAttribute("style", "height: " + mapHeight(this.serviceCenter) + "px"); //-cover photo -slider  - title
        this.mapElement["mapLoaded"]().then(() => {
            this.mapElement.triggerMapResize();
        });
        this.mapElement.triggerMapResize();
    }
    disconnectedCallback() {
        if (this.scSubscription)
            this.scSubscription.unsubscribe();
    }
    render() {
        return [
            h("ion-header", { key: 'beaf8b4c55fa48711d59ce578440777841bb2523' }, h("app-item-cover", { key: '0c85141218f16ea2a42f62a8c4791c86d9211328', item: this.serviceCenter })),
            h("ion-header", { key: '67fd4f7b9b29a6e84cd696848a5c695843246211' }, h("ion-toolbar", { key: '40b0a7c052bbba53522d9ea920fb61c5608c6f0e', color: "servicecenter", class: "no-safe-padding" }, this.serviceCenter && !this.serviceCenter.coverURL
                ? [
                    h("ion-buttons", { slot: "start" }, this.admin ? (h("ion-menu-button", null)) : (h("ion-button", { onClick: () => RouterService.goBack(), "icon-only": true }, h("ion-icon", { name: "arrow-back" })))),
                    h("ion-buttons", { slot: "end" }, this.admin ? (h("ion-button", { onClick: () => ServiceCentersService.presentServiceCenterUpdate(this.centerid), "icon-only": true }, h("ion-icon", { name: "create" }))) : undefined),
                ]
                : undefined, h("ion-title", { key: '8c2297fd312e3ce6cb8ba44537097abcf9c333dd' }, this.serviceCenter.displayName))),
            h("app-header-segment-toolbar", { key: 'bbc71379f83e2d228dea4a81dba8d786c8b25589', color: "servicecenter", swiper: this.slider, titles: this.titles }),
            h("ion-content", { key: 'af411e3b95960917d7e18591668b2c2927018e8b', class: "slides" }, this.serviceCenter && this.serviceCenter.coverURL ? (h("ion-fab", { vertical: "top", horizontal: "start", slot: "fixed", style: { marginTop: fabButtonTopMarginString(2) } }, this.admin ? (h("ion-fab-button", { class: "fab-icon" }, h("ion-menu-button", null))) : (h("ion-fab-button", { onClick: () => RouterService.goBack(), class: "fab-icon" }, h("ion-icon", { name: "arrow-back-circle-outline" }))))) : undefined, this.admin ? (h("ion-fab", { vertical: "top", horizontal: "end", slot: "fixed", style: { marginTop: fabButtonTopMarginString(2) } }, h("ion-fab-button", { onClick: () => ServiceCentersService.presentServiceCenterUpdate(this.centerid), class: "fab-icon" }, h("ion-icon", { name: "create" })))) : undefined, h("swiper-container", { key: '7e8b33586804d944ada126936446b14db92202e1', class: "slider-service-center swiper" }, h("swiper-wrapper", { key: '545610e7ee3db57b896afd0b78183ebd355dedfe', class: "swiper-wrapper" }, h("swiper-slide", { key: '117cbc903a98af16074e7117824611b2911a40b7', class: "swiper-slide" }, h("ion-list", { key: '07864164605cdc9d67fe51204e032388968031f9', class: "ion-no-padding" }, h("ion-list-header", { key: '4707d29ff000c42ae06a42e6ae48d4d5301d621a' }, h("ion-label", { key: 'be072fc3d9272f16c09104cf665a42e969a13b13', color: "servicecenter" }, h("my-transl", { key: 'aeccb043114beb6be834a9fede54e9d1c4fe4e6c', tag: "general-information", text: "General Information" }))), h("ion-item", { key: '828b1f98fb5c8ce5edb057ed064dce291bbf94a9' }, h("ion-label", { key: '08208734584d733e45e146e34f72994d0dabca22', class: "ion-text-wrap" }, h("ion-text", { key: 'a5e16c40e67458633309a8fd7b86310dae61855f', color: "dark" }, h("p", { key: 'fbf3f70bb0be79d4227c9430e51bf2fbdc18d0cb' }, this.serviceCenter.description)))), this.serviceCenter.email ? (h("ion-item", { button: true, href: "mailto:" + this.serviceCenter.email }, h("ion-icon", { slot: "start", name: "at-outline" }), h("ion-label", null, this.serviceCenter.email))) : undefined, this.serviceCenter.phoneNumber ? (h("ion-item", { button: true, href: "tel:" + this.serviceCenter.phoneNumber }, h("ion-icon", { slot: "start", name: "call-outline" }), h("ion-label", null, this.serviceCenter.phoneNumber))) : undefined, this.serviceCenter.website ? (h("ion-item", { button: true, href: "http://" + this.serviceCenter.website, target: "_blank" }, h("ion-icon", { slot: "start", name: "link-outline" }), h("ion-label", null, this.serviceCenter.website))) : undefined, this.serviceCenter.facebook ? (h("ion-item", { button: true, href: "https://www.facebook.com/" + this.serviceCenter.facebook, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-facebook" }), h("ion-label", null, this.serviceCenter.facebook))) : undefined, this.serviceCenter.instagram ? (h("ion-item", { button: true, href: "https://www.instagram.com/" +
                    this.serviceCenter.instagram, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-instagram" }), h("ion-label", null, this.serviceCenter.instagram))) : undefined, this.serviceCenter.twitter ? (h("ion-item", { button: true, href: "https://www.twitter.com/" + this.serviceCenter.twitter, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-twitter" }), h("ion-label", null, "@", this.serviceCenter.twitter))) : undefined)), h("swiper-slide", { key: '9bbb1b32902560d517eb49aa63bb2936f0dc3169', class: "swiper-slide" }, h("div", { key: 'fa1a14f446cdebd1d253c1de7f9cd142e6f66753', id: "map-container" }, h("app-map", { key: 'd09be9124edd9d653400b637da34bad88e8af097', id: "map", pageId: "dive-site-details", center: this.serviceCenter, markers: this.markers }))), this.admin ? (h("swiper-slide", { class: "swiper-slide" }, h("app-users-list", { item: this.serviceCenter, show: ["owner", "editor"] }))) : undefined))),
            this.admin ? (h("ion-footer", { class: "ion-no-border" }, h("ion-toolbar", null, h("ion-button", { expand: "block", fill: "solid", color: "danger", onClick: () => ServiceCentersService.deleteServiceCenter(this.centerid) }, h("ion-icon", { slot: "start", name: "trash" }), h("my-transl", { tag: "delete", text: "Delete", isLabel: true }))))) : undefined,
        ];
    }
    get el() { return getElement(this); }
};
PageServiceCenterDetails.style = pageServiceCenterDetailsCss;

export { PageServiceCenterDetails as page_service_center_details };

//# sourceMappingURL=page-service-center-details.entry.js.map