import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { U as UserService, R as RouterService, c as DIVECENTERSSCOLLECTION, i as DivingCentersService, m as DIVESCHOOLSSCOLLECTION, n as DivingSchoolsService, k as SERVICECENTERSCOLLECTION, l as ServiceCentersService, a7 as slideHeight, ax as fabButtonTopMarginString } from './utils-5cd4c7bb.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { E as Environment } from './env-0a7fccce.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-e64442d7.js';
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
import './customerLocation-bbe1e349.js';

const pageClientDetailsCss = "page-client-details .cover{height:var(--coverHeight)}page-client-details ion-segment-button{--color-checked:var(--ion-color-clients-contrast)}page-client-details ion-badge{margin-top:-15px;margin-left:10px;font-size:10px}page-client-details app-admin-dive-trips,page-client-details app-admin-diving-classes{width:100%}page-client-details .card-message{width:90%;min-height:150px}page-client-details .card-message ion-title{padding-top:60px}";

const PageClientDetails = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.clientId = undefined;
        this.clientData = undefined;
        this.userProfile = undefined;
        this.counters = {
            classes: 0,
            trips: 0,
            invoices: 0,
        };
        this.titles = [
            { tag: "details" },
            { tag: "dive-trips" },
            { tag: "diving-classes" },
            { tag: "invoices" },
        ];
        this.slider = undefined;
    }
    async componentWillLoad() {
        this.userProfile = await UserService.getPublicProfileUserDetails(this.clientId);
        const url = RouterService.pageTo;
        if (url.includes(DIVECENTERSSCOLLECTION.toLowerCase())) {
            this.clientData =
                DivingCentersService.selectedDivingCenterClients[this.clientId];
            this.organiserId = DivingCentersService.selectedDivingCenterId;
        }
        else if (url.includes(DIVESCHOOLSSCOLLECTION.toLowerCase())) {
            this.clientData =
                DivingSchoolsService.selectedDivingSchoolClients[this.clientId];
            this.organiserId = DivingSchoolsService.selectedDivingSchoolId;
        }
        else if (url.includes(SERVICECENTERSCOLLECTION.toLowerCase())) {
            this.clientData =
                ServiceCentersService.selectedServiceCenterClients[this.clientId];
            this.organiserId = ServiceCentersService.selectedServiceCenterId;
        }
        this.counters = {
            classes: this.clientData.classes
                ? Object.keys(this.clientData.classes).length
                : 0,
            trips: this.clientData.trips
                ? Object.keys(this.clientData.trips).length
                : 0,
            invoices: this.clientData.invoices
                ? Object.keys(this.clientData.invoices).length
                : 0,
        };
        this.titles[1]["badge"] = this.counters.trips;
        this.titles[2]["badge"] = this.counters.classes;
        this.titles[3]["badge"] = this.counters.invoices;
    }
    async componentDidLoad() {
        this.setSliderHeight();
    }
    setSliderHeight() {
        this.slider = new Swiper(".slider-client", {
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
    render() {
        return (h(Host, { key: '713fc62117452c0e0f74ad962faa3e50b342e2f1' }, h("ion-header", { key: '598a260fba44083502ada278163899bcb0388a51', class: "cover" }, h("app-item-cover", { key: '3c5652e02fab67fdb8eaae82de1352b7ef8bf9be', item: this.userProfile })), h("ion-header", { key: '245810e7056d1fae2d8a397ea58987ec387db1ec' }, h("ion-toolbar", { key: '3e53498fb8d507f1e4924e64fa63f9b61f9b631e', color: "clients" }, this.userProfile && !this.userProfile.coverURL
            ? [
                h("ion-buttons", { slot: "start" }, h("ion-button", { onClick: () => RouterService.goBack(), "icon-only": true }, h("ion-icon", { name: "arrow-back" }))),
            ]
            : undefined, h("ion-title", { key: '6b3481130db73a4e021b0ea6d378b6c6f44da8fb' }, this.userProfile.displayName))), h("app-header-segment-toolbar", { key: '309ae492fea6e209b8f27c99ab0f3d29b237ed66', color: Environment.getAppColor(), swiper: this.slider, titles: this.titles }), h("ion-content", { key: '8b6a6250573005e26e44121664c199424df8aeef', class: "slides" }, this.userProfile && this.userProfile.coverURL ? (h("ion-fab", { vertical: "top", horizontal: "start", slot: "fixed", style: { marginTop: fabButtonTopMarginString(2) } }, h("ion-fab-button", { onClick: () => RouterService.goBack(), class: "fab-icon" }, h("ion-icon", { name: "arrow-back-circle-outline" })))) : undefined, h("swiper-container", { key: 'd443d9c2b7d76705ccf4eafc4ba4be8ea9510404', class: "slider-client swiper" }, h("swiper-wrapper", { key: '55fa393fd15a7df77714524fe4c60b00b47c8bbc', class: "swiper-wrapper" }, h("swiper-slide", { key: '4af4a2be2608e67c9115fd57759bb4f7410044f2', class: "swiper-slide" }, h("ion-content", { key: 'afeb3586d2399e1a069ac5b7286b08422145a829', class: "slide-container" }, h("app-public-user", { key: '6678f44c3fe202dac7c0af546c62da8212627f1d', userProfile: this.userProfile }))), h("swiper-slide", { key: 'dd81c25e4af4d5d8ca55e87cd344ac39226ee83c', class: "swiper-slide" }, h("ion-content", { key: '65b822dcc0af5b4eafef6cceb9359b06c9b0b36f', class: "slide-container" }, this.clientData &&
            this.clientData.trips &&
            Object.keys(this.clientData.trips).length > 0 ? (h("app-admin-dive-trips", { filterByOrganisierId: this.organiserId, filterByTrips: this.clientData.trips })) : (h("ion-card", { class: "card-message" }, h("ion-title", null, h("my-transl", { tag: "no-trips", text: "No Diving Trips" })))))), h("swiper-slide", { key: 'da155e627e7737dc896ec6826f40b0bdcc6cf23f', class: "swiper-slide" }, h("ion-content", { key: '0d442e285407b3b39ae450e5dd9c082d9acb561a', class: "slide-container" }, this.clientData &&
            this.clientData.classes &&
            Object.keys(this.clientData.classes).length > 0 ? (h("app-admin-diving-classes", { filterByOrganisierId: this.organiserId, filterByClasses: this.clientData.classes })) : (h("ion-card", { class: "card-message" }, h("ion-title", null, h("my-transl", { tag: "no-classes", text: "No Diving Classes" })))))), h("swiper-slide", { key: '56f91f2d15279010af6264bd05473d3ec24f600b', class: "swiper-slide" }, h("ion-content", { key: '2a6e6569ead0b68ab80bb2cd4b094e8c555f2a58', class: "slide-container" }, this.clientData &&
            this.clientData.invoices &&
            Object.keys(this.clientData.invoices).length > 0 ? (h("app-admin-client-invoices", null)) : (h("ion-card", { class: "card-message" }, h("ion-title", null, h("my-transl", { tag: "no-invoices", text: "No Invoices" })))))))))));
    }
    get el() { return getElement(this); }
};
PageClientDetails.style = pageClientDetailsCss;

export { PageClientDetails as page_client_details };

//# sourceMappingURL=page-client-details.entry.js.map