import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { B as SystemService, j as CustomersService, R as RouterService, a2 as mapHeight, ax as fabButtonTopMarginString } from './utils-5cd4c7bb.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { T as TrasteelService } from './services-05a0dbfb.js';
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

const pageCustomerDetailsCss = "page-customer-details{}";

const PageCustomerDetails = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.markers = [];
        this.titles = [
            { tag: "information", text: "Information", disabled: false },
            { tag: "locations", text: "Locations", disabled: false },
            {
                tag: "operating-conditions",
                text: "Operating Conditions",
                disabled: false,
            },
            { tag: "map", text: "Map", disabled: false },
        ];
        this.itemId = undefined;
        this.customer = undefined;
        this.locationTypeSegment = 0;
        this.slider = undefined;
    }
    async componentWillLoad() {
        await this.loadCustomer();
    }
    async loadCustomer() {
        await SystemService.presentLoading("loading");
        try {
            this.customer = await CustomersService.getCustomer(this.itemId);
            SystemService.dismissLoading();
            this.markers = [];
            if (this.customer.locations.length > 0) {
                this.customer.locations.forEach((location) => {
                    if (location.position && location.position.geopoint) {
                        const marker = {
                            latitude: location.position.geopoint.latitude,
                            longitude: location.position.geopoint.longitude,
                            icon: {
                                type: "ionicon",
                                name: "location", //CustomersService.locationsTypes(location.type)[0].locationName,
                                color: "secondary",
                                size: "large",
                            },
                        };
                        this.markers.push(marker);
                    }
                });
                if (this.markers.length > 0)
                    this.loadMap();
                this.titles[1].disabled = this.customer.locations.length == 0;
                this.titles[2].disabled = !(this.customer.conditions.EAF.length > 0 ||
                    this.customer.conditions.LF.length > 0 ||
                    this.customer.conditions.CCM.length > 0);
                this.titles[3].disabled =
                    this.customer.locations.length == 0 || this.markers.length == 0;
            }
        }
        catch (error) {
            SystemService.dismissLoading();
            RouterService.goBack();
            SystemService.presentAlertError(error);
        }
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-customer", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
            on: {
                slideChange: () => {
                    this.slider ? this.slider.updateAutoHeight() : null;
                },
            },
        });
        if (this.markers.length > 0)
            this.loadMap();
    }
    async loadMap() {
        //reset map height inside slide
        await customElements.whenDefined("app-map");
        this.mapElement = this.el.querySelector("#map");
        if (this.mapElement) {
            const mapContainer = this.el.querySelector("#map-container");
            mapContainer.setAttribute("style", "height: " + (mapHeight(this.customer) + 20) + "px"); //-cover photo -slider  - title
            setTimeout(() => {
                this.mapElement.triggerMapResize();
                this.mapElement.fitToBounds(this.markers);
            });
        }
        this.updateSlider();
    }
    async editCustomer() {
        const modal = await CustomersService.presentCustomerUpdate(this.itemId);
        //update customer data after modal dismiss
        modal.onDidDismiss().then(() => this.loadCustomer());
    }
    locationTypeSegmentChanged(ev) {
        this.locationTypeSegment = ev.detail.value;
        this.updateSlider();
    }
    async openOperatingCondition(condition, conditionData) {
        await RouterService.openModal("modal-operating-conditions-questionnaire", {
            condition,
            conditionData: conditionData,
            editable: false,
        });
    }
    updateSlider() {
        setTimeout(() => {
            //reset slider height to show address
            this.slider ? this.slider.update() : undefined;
        }, 100);
    }
    render() {
        return [
            this.customer.coverURL || this.customer.photoURL ? (h("ion-header", null, h("app-item-cover", { item: this.customer }))) : undefined,
            h("ion-header", { key: 'ffd90922feceb062a880f90aca36f253d1a0a88a' }, h("app-navbar", { key: '53f1f617e957be9652b26f08a140e19274ea3864', text: this.customer.fullName, color: "trasteel", backButton: this.customer && !this.customer.coverURL && !this.customer.photoURL, rightButtonText: TrasteelService.isCustomerDBAdmin()
                    ? {
                        icon: "create",
                        fill: "outline",
                        tag: "edit",
                        text: "Edit",
                    }
                    : null, rightButtonFc: () => this.editCustomer() })),
            h("app-header-segment-toolbar", { key: 'b16ee820913ee3b5cb6195bbc0862a3928a9eaf9', color: Environment.getAppColor(), swiper: this.slider, titles: this.titles }),
            h("ion-content", { key: 'c1b5e73ced35634388415434085ce7dc943863fd', class: "slides" }, h("ion-fab", { key: '538f3b6751ce7fc29143208882e1ca24e84d61a1', vertical: "top", horizontal: "start", slot: "fixed", style: { marginTop: fabButtonTopMarginString(2) } }, h("ion-fab-button", { key: '92aa9bd72525fc9b75acbdc35d208b981280431e', onClick: () => RouterService.goBack(), class: "fab-icon" }, h("ion-icon", { key: 'c02af5929ef6ec6f088a903e290b035d9a220a44', name: "arrow-back-circle-outline" }))), h("swiper-container", { key: '6d6fb9b849562c03d6abb3440d08ef77094b0d67', class: "slider-customer swiper" }, h("swiper-wrapper", { key: '30007bd97edada651ea80d412c230e345cc31d6a', class: "swiper-wrapper" }, h("swiper-slide", { key: 'bdf35ff97345fce3ec427b9dc45c2391e28f58c2', class: "swiper-slide" }, h("ion-list", { key: '7a56cff9d18043d6a6c6a46b1944ba44db49abc6', class: "ion-no-padding" }, h("app-item-detail", { key: 'a009ac252f4b03317ebad6641b02c2a92a1087e4', lines: "none", labelTag: "plant_type", labelText: "Plant Type", detailText: CustomersService.getCustomerTypes(this.customer.typeId)[0]
                    .typeName }), h("app-item-detail", { key: '6caad5508a2d811cab93a7be4a0b2cd938e6ad18', lines: "none", labelTag: "name", labelText: "Name", detailText: this.customer.fullName }), h("app-item-detail", { key: '6612bd1fa8b22f21b7153eef4e19f7938f20c2d3', lines: "none", labelTag: "local_name", labelText: "Local Name", detailText: this.customer.fullNameOther }), h("app-item-detail", { key: 'a5a830c15319c1659bc0e445dd4507e841292a0f', lines: "none", labelTag: "other_name", labelText: "Other Name", detailText: this.customer.otherPlantName }), h("app-item-detail", { key: 'd1dec9aa38af3eda6a145954312d36b6bf1374e1', lines: "none", labelTag: "other_name", labelText: "Other Local Name", detailText: this.customer.otherPlantNameOther }), h("app-item-detail", { key: '333143a8c9c563c2a755a436de594ec4e415c1b0', lines: "none", labelTag: "short_name", labelText: "Short Name", detailText: this.customer.shortName }), this.customer.group.map((group, index) => (h("app-item-detail", { lines: "none", labelTag: index == 0 ? "group" : null, labelText: index == 0 ? "Group" : null, detailText: group.groupName + " [" + group.groupOwnershipPerc + "%]" }))), h("app-item-detail", { key: '62c83e92ebf20be9b26d204a55e59d8ec85b2997', lines: "none", labelTag: "owner", labelText: "Owner", detailText: this.customer.owner.groupName }), h("app-customer-plant-production", { key: '629f09ead41580994f14982c4b2672a04386d807', customer: this.customer }))), h("swiper-slide", { key: 'c85b5a1cd17e48f063eae3a682a45b068dcf4d55', class: "swiper-slide" }, h("div", { key: '7938fd6c432bf30dabf9a67fc09e08298e515dd0' }, this.customer.locations.length > 0
                ? [
                    h("ion-toolbar", null, h("ion-segment", { mode: "ios", scrollable: true, onIonChange: (ev) => this.locationTypeSegmentChanged(ev), value: this.locationTypeSegment }, this.customer.locations.map((location, index) => (h("ion-segment-button", { value: index, layout: "icon-start" }, h("ion-label", null, CustomersService.getLocationsTypes(location.type)[0].locationName)))))),
                    this.customer.locations.map((location, index) => (h("div", null, this.locationTypeSegment == index ? (h("div", null, h("app-location", { locations: CustomersService.getLocationsTypes(), location: location, slider: this.slider, editable: false }))) : undefined))),
                ]
                : undefined)), h("swiper-slide", { key: '68322057ae8cf002e0c3337fc0d19bd903f68afd', class: "swiper-slide" }, h("ion-list", { key: '061e700060be6baab9dcf1813bd5348c5a4d9536' }, h("ion-item-divider", { key: '73ad6ff93cbfd23352347bfa0ed01caad05d4330' }, "EAF"), this.customer.conditions.EAF.map((condition) => (h("ion-item", { button: true, detail: true, onClick: () => this.openOperatingCondition("EAF", condition) }, h("ion-label", null, new Date(condition.date).toLocaleDateString())))), h("ion-item-divider", { key: 'f386a440c2fb5ac0bb3c8933108e6f48f4372d7d' }, "LF"), this.customer.conditions.LF.map((condition) => (h("ion-item", { button: true, detail: true, onClick: () => this.openOperatingCondition("EAF", condition) }, h("ion-label", null, new Date(condition.date).toLocaleDateString())))), h("ion-item-divider", { key: '72fad9cd4503364348a074d127f69da5a8834b93' }, "CCM"), this.customer.conditions.CCM.map((condition) => (h("ion-item", null, h("ion-label", null, new Date(condition.date).toLocaleDateString())))))), h("swiper-slide", { key: '58b51bf89234930245ea024490f7b7a6f0abf267', class: "swiper-slide" }, this.customer.locations.length > 0 && this.markers.length > 0 ? (h("div", { id: "map-container" }, h("app-map", { id: "map", pageId: "customer-details", center: this.customer.locations[0], markers: this.markers }))) : (h("div", null, h("ion-item", null, "NO MAP AVAILABLE"))))))),
        ];
    }
    get el() { return getElement(this); }
};
PageCustomerDetails.style = pageCustomerDetailsCss;

export { PageCustomerDetails as page_customer_details };

//# sourceMappingURL=page-customer-details.entry.js.map