import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { j as CustomersService, C as CUSTOMERSCOLLECTION, a2 as mapHeight, F as TrasteelFilterService } from './utils-ced1e260.js';
import { T as TrasteelService } from './services-7994f696.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { E as Environment } from './env-c3ad5e77.js';
import './index-be90eba5.js';
import { p as popoverController } from './overlays-b3ceb97d.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-fe092362.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
import './ionic-global-c07767bf.js';
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

const pageCustomersCss = "page-customers{}";

const PageCustomers = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.markers = [];
        this.customersList = [];
        this.filteredCustomersList = [];
        this.visibleCustomers = [];
        this.loading = true;
        this.titles = [
            { tag: "list", text: "List", disabled: false, badge: 0 },
            { tag: "map", text: "Map", disabled: false, badge: 0 },
        ];
        this.slider = undefined;
        this.updateView = false;
    }
    mapLoadingCompletedHandler() {
        //necessary to recenter map in the correct position
        this.mapElement ? this.mapElement["triggerMapResize"]() : undefined;
    }
    componentWillLoad() {
        CustomersService.customersList$.subscribe(async (list) => {
            this.updateList(list);
            this.loading = false;
            this.updateMarkers();
        });
        this.createPopoverVisibleCustomers();
    }
    filterCustomers(ev) {
        this.filteredCustomersList = ev.detail;
        this.updateMarkers();
    }
    updateMarkers() {
        this.markers = [];
        if (this.filteredCustomersList.length > 0) {
            this.filteredCustomersList.forEach((customer) => {
                if (customer.locations.length > 0) {
                    customer.locations.forEach((location) => {
                        if (location && location.position && location.position.geopoint) {
                            const marker = {
                                collection: CUSTOMERSCOLLECTION,
                                id: customer.id,
                                displayName: customer.fullName,
                                position: location.position,
                                latitude: location.position.geopoint.latitude,
                                longitude: location.position.geopoint.longitude,
                                icon: {
                                    type: "ionicon",
                                    name: "location", //CustomerService.locationsTypes(location.type)[0].locationName,
                                    color: "secondary",
                                    size: "small",
                                },
                                clickFn: () => CustomersService.presentCustomerDetails(customer.id),
                            };
                            this.markers.push(marker);
                        }
                    });
                }
            });
            this.titles[0].badge = this.markers.length;
            this.updateView = !this.updateView;
            if (this.markers.length > 0)
                this.loadMap();
        }
    }
    componentDidLoad() {
        this.slider = new Swiper(".slider-customers-map", {
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
        this.searchToolbar = this.el.querySelector("#searchToolbar");
        this.updateList(this.customersList);
    }
    updateList(list) {
        this.customersList = list;
        this.searchToolbar ? this.searchToolbar.forceFilter(list) : undefined;
        this.updateSlider();
    }
    async loadMap() {
        //reset map height inside slide
        await customElements.whenDefined("app-map");
        this.mapElement = this.el.querySelector("#map");
        this.updateMap(true);
        this.updateSlider();
    }
    updateMap(fit = false) {
        if (this.mapElement) {
            const mapContainer = this.el.querySelector("#map-container");
            mapContainer.setAttribute("style", "height: " + (mapHeight(null) - 40) + "px");
            setTimeout(() => {
                this.mapElement.triggerMapResize();
                fit ? this.mapElement.fitToBounds(this.markers) : undefined;
            });
        }
    }
    mapBoundsChanged(ev) {
        const bounds = ev.detail;
        this.visibleCustomers = [];
        this.filteredCustomersList.forEach((customer) => {
            var positions = customer.getLngLat();
            positions.map((position) => {
                if (bounds.contains(position)) {
                    this.visibleCustomers.push(customer);
                }
            });
        });
        this.titles[1].badge = this.visibleCustomers.length;
        this.popoverVisibleCustomers.componentProps["selectOptions"] =
            this.visibleCustomers;
        this.updateView = !this.updateView;
    }
    async createPopoverVisibleCustomers() {
        this.popoverVisibleCustomers = await popoverController.create({
            component: "popover-select-search",
            componentProps: {
                selectOptions: this.visibleCustomers,
                selectValueText: ["fullName"],
                selectValueId: "id",
                placeholder: "customer",
            },
            trigger: "hover-trigger",
            triggerAction: "hover",
            translucent: true,
            showBackdrop: false,
        });
        this.popoverVisibleCustomers.addEventListener("mouseleave", () => {
            this.popoverVisibleCustomers.dismiss();
        });
        this.popoverVisibleCustomers.onDidDismiss().then((ev) => {
            if (ev && ev.data) {
                CustomersService.presentCustomerDetails(ev.data.id);
            }
            else {
                //render again new popover
                this.createPopoverVisibleCustomers();
            }
        });
    }
    addCustomer() {
        CustomersService.presentCustomerUpdate();
    }
    updateSlider() {
        this.updateView = !this.updateView;
        setTimeout(() => {
            this.updateMap();
            //reset slider height to show address
            this.slider ? this.slider.update() : undefined;
        }, 100);
    }
    render() {
        return [
            h("ion-header", { key: '9d68e5b36a5249d12de741e0617c2ac5020f6573' }, h("app-navbar", { key: '7947dbd61db3fc60d924dcf34175f22aa4cfcb2d', tag: "customers", text: "Customers", color: Environment.getAppColor() }), h("app-search-toolbar", { key: 'a914d1ad048c93cf49bd69a9dc5f1215547a199f', id: "searchToolbar", searchTitle: "customers", list: this.customersList, orderFields: ["fullName"], color: Environment.getAppColor(), placeholder: "Search by name", filterBy: ["fullName"], onFilteredList: (ev) => this.filterCustomers(ev) }), h("app-header-segment-toolbar", { key: '5a94a854df23cd4e26285fb756130485428a25d9', color: Environment.getAppColor(), swiper: this.slider, titles: this.titles, updateBadge: this.updateView, noHeader: true })),
            h("ion-content", { key: 'fbcd091df918daa88512baad64509500d7c87bb8', class: "slides" }, TrasteelService.isCustomerDBAdmin() ? (h("ion-fab", { vertical: "top", horizontal: "end", slot: "fixed", edge: true }, h("ion-fab-button", { size: "small", onClick: () => this.addCustomer(), color: Environment.getAppColor() }, h("ion-icon", { name: "add" })))) : undefined, h("swiper-container", { key: '43f12a5708ec879b3d2f90f44d757b1282c2ab79', class: "slider-customers-map swiper" }, h("swiper-wrapper", { key: '5be1722acf36cf796f34b33a660c816a5aaf0f5d', class: "swiper-wrapper" }, h("swiper-slide", { key: '4be1922661f7a85fa5fccb027dc852b367df362a', class: "swiper-slide" }, h("app-infinite-scroll", { key: 'dec3a4358109eae76dda542212200d0e3a625538', list: this.filteredCustomersList, loading: this.loading, showFields: ["fullName"], orderBy: ["fullName"], returnField: "id", icon: TrasteelFilterService.getMapDocs(CUSTOMERSCOLLECTION).icon
                    .name, onItemClicked: (ev) => CustomersService.presentCustomerDetails(ev.detail), onListChanged: () => {
                    this.updateSlider();
                } })), h("swiper-slide", { key: '15263f19fbc445e65e263e1f20fb10654119e397', class: "swiper-slide" }, h("div", { key: '66a013a49dfcc4f7721087f2f43e166a9b4c4a8a', id: "map-container" }, h("app-map", { key: 'cb85d1742edcd8f646b7139681466604201a0014', id: "map", pageId: "customers-list", markersAsFeature: true, markers: this.markers, onEmitMapBounds: (ev) => this.mapBoundsChanged(ev) })), h("ion-fab", { key: '856d98dcfa083026043dd0fa2432b513e45630dc', vertical: "top", horizontal: "start", slot: "fixed" }, h("ion-fab-button", { key: 'e12c25c4c513dce59a957313e4b372eb4465df18', color: "trasteel", id: "hover-trigger" }, h("ion-badge", { key: 'ac047662f0e81c76420270782a8bdcaa171f06ad', color: "trasteel" }, this.titles[1].badge))))))),
        ];
    }
    get el() { return getElement(this); }
};
PageCustomers.style = pageCustomersCss;

export { PageCustomers as page_customers };

//# sourceMappingURL=page-customers.entry.js.map