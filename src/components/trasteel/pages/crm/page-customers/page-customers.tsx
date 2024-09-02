import {Component, Element, Listen, State, h} from "@stencil/core";
import {
  CUSTOMERSCOLLECTION,
  CustomersService,
} from "../../../../../services/trasteel/crm/customers";
import {MapDataCustomer} from "../../../../../interfaces/trasteel/customer/customer";
import {TrasteelFilterService} from "../../../../../services/trasteel/common/trs-db-filter";
import {TrasteelService} from "../../../../../services/trasteel/common/services";
import Swiper from "swiper";
import {Marker} from "../../../../../components";
import {mapHeight} from "../../../../../helpers/utils";
import {Environment} from "../../../../../global/env";
import {LngLatBounds} from "mapbox-gl";
import {popoverController} from "@ionic/core";

@Component({
  tag: "page-customers",
  styleUrl: "page-customers.scss",
})
export class PageCustomers {
  @Element() el: HTMLElement;
  @State() customersList: MapDataCustomer[] = [];
  @State() filteredCustomersList: MapDataCustomer[] = [];
  @State() visibleCustomers: MapDataCustomer[] = [];
  @State() loading = true;
  @State() titles = [
    {tag: "list", text: "List", disabled: false, badge: 0},
    {tag: "map", text: "Map", disabled: false, badge: 0},
  ];
  @State() slider: Swiper;
  markers: Marker[] = [];
  mapElement: HTMLAppMapElement;
  searchToolbar: any;
  popoverVisibleCustomers: HTMLIonPopoverElement;

  @State() updateView = false;
  @Listen("mapLoadingCompleted")
  mapLoadingCompletedHandler() {
    //necessary to recenter map in the correct position
    this.mapElement ? this.mapElement["triggerMapResize"]() : undefined;
  }

  componentWillLoad() {
    CustomersService.customersList$.subscribe(
      async (list: MapDataCustomer[]) => {
        this.updateList(list);
        this.loading = false;
        this.updateMarkers();
      }
    );
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
                clickFn: () =>
                  CustomersService.presentCustomerDetails(customer.id),
              };

              this.markers.push(marker);
            }
          });
        }
      });
      this.titles[0].badge = this.markers.length;
      this.updateView = !this.updateView;
      if (this.markers.length > 0) this.loadMap();
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
    if (this.markers.length > 0) this.loadMap();
    this.searchToolbar = this.el.querySelector(
      "#searchToolbar"
    ) as HTMLAppSearchToolbarElement;
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
      mapContainer.setAttribute(
        "style",
        "height: " + (mapHeight(null) - 40) + "px"
      );
      setTimeout(() => {
        this.mapElement.triggerMapResize();
        fit ? this.mapElement.fitToBounds(this.markers) : undefined;
      });
    }
  }

  mapBoundsChanged(ev) {
    const bounds: LngLatBounds = ev.detail;
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
      } else {
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
      <ion-header>
        <app-navbar
          tag="customers"
          text="Customers"
          color={Environment.getAppColor()}
        ></app-navbar>
        <app-search-toolbar
          id="searchToolbar"
          searchTitle="customers"
          list={this.customersList}
          orderFields={["fullName"]}
          color={Environment.getAppColor()}
          placeholder="Search by name"
          filterBy={["fullName"]}
          onFilteredList={(ev) => this.filterCustomers(ev)}
        ></app-search-toolbar>
        <app-header-segment-toolbar
          color={Environment.getAppColor()}
          swiper={this.slider}
          titles={this.titles}
          updateBadge={this.updateView}
          noHeader
        ></app-header-segment-toolbar>
      </ion-header>,
      <ion-content class="slides">
        {TrasteelService.isCustomerDBAdmin() ? (
          <ion-fab vertical="top" horizontal="end" slot="fixed" edge>
            <ion-fab-button
              size="small"
              onClick={() => this.addCustomer()}
              color={Environment.getAppColor()}
            >
              <ion-icon name="add"></ion-icon>
            </ion-fab-button>
          </ion-fab>
        ) : undefined}
        <swiper-container class="slider-customers-map swiper">
          <swiper-wrapper class="swiper-wrapper">
            {/** LIST */}
            <swiper-slide class="swiper-slide">
              <app-infinite-scroll
                list={this.filteredCustomersList}
                loading={this.loading}
                showFields={["fullName"]}
                orderBy={["fullName"]}
                returnField="id"
                icon={
                  TrasteelFilterService.getMapDocs(CUSTOMERSCOLLECTION).icon
                    .name
                }
                onItemClicked={(ev) =>
                  CustomersService.presentCustomerDetails(ev.detail)
                }
                onListChanged={() => {
                  this.updateSlider();
                }}
              ></app-infinite-scroll>
            </swiper-slide>
            {/** MAP */}
            <swiper-slide class="swiper-slide">
              <div id="map-container">
                <app-map
                  id="map"
                  pageId="customers-list"
                  markersAsFeature={true}
                  markers={this.markers}
                  onEmitMapBounds={(ev) => this.mapBoundsChanged(ev)}
                ></app-map>
              </div>
              <ion-fab vertical="top" horizontal="start" slot="fixed">
                <ion-fab-button color="trasteel" id="hover-trigger">
                  <ion-badge color="trasteel">{this.titles[1].badge}</ion-badge>
                </ion-fab-button>
              </ion-fab>
            </swiper-slide>
          </swiper-wrapper>
        </swiper-container>
      </ion-content>,
    ];
  }
}
