import {Component, Element, State, h} from "@stencil/core";
import {
  DatasheetFilter,
  MapDataDatasheet,
} from "../../../../../interfaces/trasteel/refractories/datasheets";
import {
  DATASHEETSCOLLECTION,
  DatasheetsService,
} from "../../../../../services/trasteel/refractories/datasheets";
import {TrasteelFilterService} from "../../../../../services/trasteel/common/trs-db-filter";
import {TrasteelService} from "../../../../../services/trasteel/common/services";
import {cloneDeep, includes, isArray} from "lodash";
import {DatabaseService} from "../../../../../services/common/database";
import {SystemService} from "../../../../../services/common/system";
import Swiper from "swiper";
import {TranslationService} from "../../../../../services/common/translations";

@Component({
  tag: "page-datasheets",
  styleUrl: "page-datasheets.scss",
})
export class PageDatasheets {
  @Element() el: HTMLElement;
  datasheetsList: MapDataDatasheet[] = [];
  @State() filteredDatasheetsList: MapDataDatasheet[] = [];
  nonFilteredDatasheetsList: MapDataDatasheet[] = [];
  @State() loading = true;
  @State() filter: DatasheetFilter = new DatasheetFilter();
  searchToolbar: any;
  @State() slider: Swiper;
  @State() updateView = true;
  @State() showDownload = true;
  @State() basket: MapDataDatasheet[] = [];
  localDocName = "datasheetBasket";

  async componentWillLoad() {
    const filter = await DatabaseService.getLocalDocument("datasheetsFilter");
    this.filter = new DatasheetFilter(filter);
    DatasheetsService.datasheetsList$.subscribe(
      async (list: MapDataDatasheet[]) => {
        this.updateList(list);
        this.nonFilteredDatasheetsList = list;
        this.loading = false;
        this.filterLists();
      }
    );
    const basket = await DatabaseService.getLocalDocument(this.localDocName);
    if (basket) this.basket = basket;
  }

  componentDidLoad() {
    this.searchToolbar = this.el.querySelector(
      "#searchToolbar"
    ) as HTMLAppSearchToolbarElement;
    this.slider = new Swiper(".slider-show-datasheet", {
      speed: 400,
      spaceBetween: 0,
      allowTouchMove: false,
      autoHeight: true,
      slidesPerView: 1,
      on: {
        slideChange: () => {
          this.slider ? this.slider.updateAutoHeight() : null;
        },
      },
    });
    this.downloadDatasheets();
  }

  updateList(list) {
    this.datasheetsList = list;
    this.searchToolbar ? this.searchToolbar.forceFilter(list) : undefined;
    this.updateView = !this.updateView;
  }

  updateSlider() {
    this.updateView = !this.updateView;
    //wait for view to update and then reset slider height
    setTimeout(() => {
      this.slider ? this.slider.update() : undefined;
    }, 100);
  }

  filterDatasheets(list) {
    if (this.filter.oldProduct === true) {
      this.filteredDatasheetsList = cloneDeep(list);
    } else {
      this.filteredDatasheetsList = list.filter((x) => x.oldProduct == false);
    }
  }

  addDatasheet() {
    DatasheetsService.presentDatasheetUpdate();
  }

  getOptions() {
    if (TrasteelService.isRefraDBAdmin()) {
      return [
        {
          tag: "delete",
          text: "Delete",
          icon: "trash",
          color: "danger",
          func: (returnField) =>
            DatasheetsService.deleteDatasheet(returnField, false),
        },
        {
          tag: "revision",
          text: "Revision",
          icon: "duplicate",
          color: "secondary",
          func: (returnField) =>
            DatasheetsService.duplicateDatasheet(returnField, true),
        },
        {
          tag: "copy",
          text: "Copy",
          icon: "copy",
          color: "tertiary",
          func: (returnField) =>
            DatasheetsService.duplicateDatasheet(returnField, false),
        },
        {
          tag: "edit",
          text: "Edit",
          icon: "create",
          color: "primary",
          func: (returnField) =>
            DatasheetsService.presentDatasheetUpdate(returnField),
        },
      ];
    } else return null;
  }

  async openDatasheetFilter() {
    DatabaseService.deleteLocalDocument("filteredDatasheetList");
    this.filter = await DatasheetsService.openDatasheetFilter(this.filter);
    this.filterLists();
  }

  clearDatasheetFilter() {
    this.filter = new DatasheetFilter();
    this.datasheetsList = cloneDeep(this.nonFilteredDatasheetsList);
    DatabaseService.deleteLocalDocument("filteredDatasheetList");
    this.filterLists();
  }

  async filterLists() {
    DatabaseService.saveLocalDocument("datasheetsFilter", this.filter);
    if (this.filter.isActive()) {
      const previousList = await DatabaseService.getLocalDocument(
        "filteredDatasheetList"
      );
      if (!previousList) {
        await SystemService.presentLoading("searching");
        const datasheetsList = await DatasheetsService.filterDatasheets(
          this.filter
        );
        SystemService.dismissLoading();
        if (datasheetsList) {
          this.datasheetsList = datasheetsList;
          DatabaseService.saveLocalDocument(
            "filteredDatasheetList",
            this.datasheetsList
          );
        } else {
          //case when only olDproduct is selected
          this.filterDatasheets(this.nonFilteredDatasheetsList);
        }
      } else {
        this.datasheetsList = previousList;
      }
      this.filterDatasheets(this.datasheetsList);
    } else {
      this.filterDatasheets(this.nonFilteredDatasheetsList);
    }
    this.searchToolbar
      ? this.searchToolbar.forceFilter(this.datasheetsList)
      : undefined;
    this.slider ? this.updateSlider() : undefined;
  }

  makeBreadCrumb(key) {
    if (key == "familyId") {
      const families = DatasheetsService.getDatasheetFamilies(
        this.filter.familyId
      );
      if (families && families.length > 0) return families[0].familyName;
      else return this.filter.familyId;
    } else if (key == "majorFamilyId") {
      const majorFamilies = DatasheetsService.getDatasheetMajorFamilies(
        this.filter.majorFamilyId
      );
      if (majorFamilies && majorFamilies.length > 0)
        return majorFamilies[0].majorFamilyName;
      else return this.filter.majorFamilyId;
    } else if (key == "oldProduct") {
      return this.filter.oldProduct ? "All revs." : "Last Rev.";
    } else if (key == "properties") {
      if (this.filter.properties.length > 0) {
        let bread = "( ";
        this.filter.properties.forEach((property, index) => {
          const name = DatasheetsService.getDatasheetPropertyNames(
            "id",
            property.valueName
          );
          bread +=
            (name && name.length > 0 ? name[0].nameName : property.valueName) +
            property.operator +
            property.value +
            (index < this.filter.properties.length - 1 ? " / " : " )");
        });
        return bread;
      } else return "";
    }
    return null;
  }

  downloadDatasheets() {
    this.showDownload = !this.showDownload;
    this.slider.params.slidesPerView = this.showDownload ? 2 : 1;
    this.updateSlider();
  }

  openDatasheet(datasheetId) {
    if (this.showDownload) {
      const ds = DatasheetsService.getDatasheetsById(datasheetId);
      if (!includes(this.basket, ds)) this.basket.push(ds);
      this.saveBasket();
      this.updateSlider();
    } else {
      DatasheetsService.presentDatasheetDetails(datasheetId);
    }
  }

  async downloadDatasheetsList() {
    const datasheets = [];
    for (const mapDS of this.basket) {
      mapDS["datasheetId"] = mapDS.id;
      datasheets.push(mapDS);
    }
    DatasheetsService.exportDatasheets(datasheets);
    this.downloadDatasheets();
  }

  emptyBasket() {
    this.basket = [];
    this.saveBasket();
  }

  removeItemFromBasket(index) {
    this.basket.splice(index, 1);
    this.saveBasket();
  }

  saveBasket() {
    this.updateView = !this.updateView;
    DatabaseService.saveLocalDocument(this.localDocName, this.basket);
  }

  render() {
    return [
      <ion-header>
        <app-navbar
          tag="datasheets"
          text="Data Sheets"
          color="trasteel"
        ></app-navbar>
        <ion-grid class="ion-no-padding">
          <ion-row class="ion-no-padding">
            <ion-col size="1" class="ion-no-padding">
              <ion-toolbar color="trasteel">
                <ion-button
                  fill="clear"
                  expand="full"
                  icon-only
                  onClick={() => this.openDatasheetFilter()}
                >
                  <ion-icon name="filter" color="light"></ion-icon>
                </ion-button>
              </ion-toolbar>
            </ion-col>
            <ion-col size="11" class="ion-no-padding">
              <app-search-toolbar
                id="searchToolbar"
                searchTitle="datasheets"
                list={this.datasheetsList}
                orderFields={["productName"]}
                color="trasteel"
                placeholder="Search by product, family or tech#"
                filterBy={["productName", "familyId", "techNo"]}
                onFilteredList={(ev) => this.filterDatasheets(ev.detail)}
              ></app-search-toolbar>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-header>,
      <ion-content class="slides">
        {TrasteelService.isRefraDBAdmin() ? (
          !this.showDownload ? (
            <ion-fab vertical="top" horizontal="end" slot="fixed" edge>
              <ion-fab-button size="small" color="trasteel">
                <ion-icon name="chevron-down"></ion-icon>
              </ion-fab-button>
              <ion-fab-list side="bottom">
                <ion-fab-button
                  onClick={() => this.addDatasheet()}
                  color="trasteel"
                >
                  <ion-icon name="add"></ion-icon>
                </ion-fab-button>
                <ion-fab-button
                  onClick={() => this.downloadDatasheets()}
                  color="trasteel"
                >
                  <ion-icon name="download"></ion-icon>
                </ion-fab-button>
              </ion-fab-list>
            </ion-fab>
          ) : (
            <ion-fab vertical="top" horizontal="end" slot="fixed" edge>
              <ion-fab-button
                onClick={() => this.downloadDatasheets()}
                size="small"
                color="trasteel"
              >
                <ion-icon name="close"></ion-icon>
              </ion-fab-button>
            </ion-fab>
          )
        ) : undefined}
        <swiper-container class="slider-show-datasheet swiper">
          <swiper-wrapper class="swiper-wrapper">
            <swiper-slide class="swiper-slide">
              {this.filter.isActive()
                ? [
                    <ion-breadcrumbs>
                      <ion-button
                        icon-only
                        fill="clear"
                        onClick={() => this.clearDatasheetFilter()}
                      >
                        <ion-icon color="danger" name="trash"></ion-icon>
                      </ion-button>
                      <ion-breadcrumb>
                        #{this.filteredDatasheetsList.length}
                      </ion-breadcrumb>
                      {Object.keys(this.filter).map((key) =>
                        (
                          isArray(this.filter[key])
                            ? this.filter[key].length > 0
                            : this.filter[key] !== null
                        ) ? (
                          <ion-breadcrumb>
                            {this.makeBreadCrumb(key)}
                          </ion-breadcrumb>
                        ) : undefined
                      )}
                      <ion-breadcrumb></ion-breadcrumb>
                    </ion-breadcrumbs>,
                  ]
                : undefined}
              <app-infinite-scroll
                list={this.filteredDatasheetsList}
                loading={this.loading}
                showFields={["productName"]}
                options={this.getOptions()}
                returnField="id"
                icon={
                  TrasteelFilterService.getMapDocs(DATASHEETSCOLLECTION).icon
                    .name
                }
                onItemClicked={(ev) => this.openDatasheet(ev.detail)}
                onListChanged={() => {
                  this.updateSlider();
                }}
              ></app-infinite-scroll>
            </swiper-slide>
            {this.showDownload ? (
              <swiper-slide class="swiper-slide">
                <ion-list>
                  {this.basket.length == 0 ? (
                    <ion-item>
                      Click on the datasheets on the left to add to basket
                    </ion-item>
                  ) : (
                    <ion-grid>
                      <ion-row>
                        <ion-col>
                          <ion-button
                            onClick={() => this.downloadDatasheetsList()}
                            expand="block"
                            fill="outline"
                            color="trasteel"
                          >
                            <ion-icon name="download" slot="start"></ion-icon>
                            <ion-label>
                              {TranslationService.getTransl(
                                "download",
                                "Download"
                              )}
                            </ion-label>
                            <ion-badge slot="end" color="trasteel">
                              {this.basket.length}
                            </ion-badge>
                          </ion-button>
                        </ion-col>
                        <ion-col size="1">
                          <ion-button
                            fill="clear"
                            icon-only
                            onClick={() => this.emptyBasket()}
                          >
                            <ion-icon name="trash" color="danger"></ion-icon>
                          </ion-button>
                        </ion-col>
                      </ion-row>
                    </ion-grid>
                  )}
                  {this.basket.map((ds, index) => (
                    <ion-item color="light">
                      <ion-label>{ds.productName}</ion-label>
                      <ion-button
                        slot="end"
                        fill="clear"
                        icon-only
                        onClick={() => this.removeItemFromBasket(index)}
                      >
                        <ion-icon name="trash" color="danger"></ion-icon>
                      </ion-button>
                    </ion-item>
                  ))}
                </ion-list>
              </swiper-slide>
            ) : undefined}
          </swiper-wrapper>
        </swiper-container>
      </ion-content>,
    ];
  }
}
