import { Component, Element, State, h } from "@stencil/core";
import {
  SHAPESCOLLECTION,
  ShapesService,
} from "../../../../../services/trasteel/refractories/shapes";
import {
  MapDataShape,
  ShapeFilter,
} from "../../../../../interfaces/trasteel/refractories/shapes";
import { TrasteelFilterService } from "../../../../../services/trasteel/common/trs-db-filter";
import { TrasteelService } from "../../../../../services/trasteel/common/services";
import { cloneDeep, orderBy } from "lodash";
import { DatabaseService } from "../../../../../services/common/database";
import { SystemService } from "../../../../../services/common/system";
import Swiper from "swiper";
import { TranslationService } from "../../../../../services/common/translations";
import { MapDataDatasheet } from "../../../../../interfaces/trasteel/refractories/datasheets";
import { DatasheetsService } from "../../../../../services/trasteel/refractories/datasheets";

@Component({
  tag: "page-shapes",
  styleUrl: "page-shapes.scss",
})
export class PageShapes {
  @Element() el: HTMLElement;
  @State() filteredShapesList: MapDataShape[] = [];
  shapesList: MapDataShape[] = [];
  nonFilteredShapesList: MapDataShape[] = [];
  @State() loading = true;
  @State() filter: ShapeFilter = new ShapeFilter();
  searchToolbar: any;
  @State() slider: Swiper;
  @State() updateView = true;
  @State() showDownload = true;
  @State() activateDownload = false;
  @State() basket: { shape: MapDataShape; datasheet: MapDataDatasheet }[] = [];
  localDocName = "shapeBasket";

  async componentWillLoad() {
    const filter = await DatabaseService.getLocalDocument("shapesFilter");
    this.filter = new ShapeFilter(filter);
    ShapesService.shapesList$.subscribe(async (list: MapDataShape[]) => {
      this.updateList(list);
      this.nonFilteredShapesList = list;
      this.loading = false;
      this.filterLists();
    });
    const basket = await DatabaseService.getLocalDocument(this.localDocName);
    if (basket) {
      this.basket = basket;
      this.basket.forEach((basket) => {
        if (basket.datasheet) {
          this.activateDownload = true;
        } else {
          this.activateDownload = false;
        }
      });
    }
  }

  componentDidLoad() {
    this.searchToolbar = this.el.querySelector(
      "#searchToolbar"
    ) as HTMLAppSearchToolbarElement;
    this.slider = new Swiper(".slider-show-shape", {
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
    this.downloadShapes();
  }

  updateList(list) {
    this.shapesList = list;
    this.searchToolbar ? this.searchToolbar.forceFilter(list) : undefined;
    this.updateSlider();
  }

  updateSlider() {
    this.updateView = !this.updateView;
    //wait for view to update and then reset slider height
    setTimeout(() => {
      this.slider ? this.slider.update() : undefined;
    }, 100);
  }

  addShape() {
    ShapesService.presentShapeUpdate();
  }

  getOptions() {
    if (TrasteelService.isRefraDBAdmin()) {
      return [
        {
          tag: "delete",
          text: "Delete",
          icon: "trash",
          color: "danger",
          func: (returnField) => ShapesService.deleteShape(returnField, false),
        },
        {
          tag: "duplicate",
          text: "Duplicate",
          icon: "duplicate",
          color: "secondary",
          func: (returnField) => ShapesService.duplicateShape(returnField),
        },
        {
          tag: "edit",
          text: "Edit",
          icon: "create",
          color: "primary",
          func: (returnField) => ShapesService.presentShapeUpdate(returnField),
        },
      ];
    } else return null;
  }

  async openShapeFilter() {
    DatabaseService.deleteLocalDocument("filteredShapesList");
    this.filter = await ShapesService.openShapeFilter(this.filter);
    this.filterLists();
  }

  clearShapeFilter() {
    this.filter = new ShapeFilter();
    this.shapesList = cloneDeep(this.nonFilteredShapesList);
    DatabaseService.deleteLocalDocument("filteredShapesList");
    this.filterLists();
  }

  async filterLists() {
    DatabaseService.saveLocalDocument("shapesFilter", this.filter);
    if (this.filter.isActive()) {
      const localShapesList =
        await DatabaseService.getLocalDocument("filteredShapesList");
      if (!localShapesList) {
        this.loading = true;
        SystemService.presentLoading("searching");
        this.shapesList = await ShapesService.filterShapes(this.filter);
        SystemService.dismissLoading();
        this.filteredShapesList = cloneDeep(this.shapesList);
        DatabaseService.saveLocalDocument(
          "filteredShapesList",
          this.filteredShapesList
        );
        this.loading = false;
      } else {
        this.filteredShapesList = localShapesList;
      }
    } else {
      this.filteredShapesList = cloneDeep(this.nonFilteredShapesList);
    }
    this.searchToolbar
      ? this.searchToolbar.forceFilter(this.shapesList)
      : undefined;
    this.slider ? this.updateSlider() : undefined;
  }

  downloadShapes() {
    this.showDownload = !this.showDownload;
    this.slider.params.slidesPerView = this.showDownload ? 2 : 1;
    this.updateSlider();
  }

  openShape(shapeId) {
    if (this.showDownload) {
      const shape = cloneDeep(ShapesService.getShapeById(shapeId));
      //if (!find(this.basket, {shape}))
      this.basket.push({ shape, datasheet: null });
      this.basket = orderBy(this.basket, "shape.shapeName");
      this.saveBasket();
    } else {
      ShapesService.presentShapeDetails(shapeId);
    }
  }

  async openDataSheet(index) {
    const ds = await DatasheetsService.openSelectDataSheet();
    if (ds) {
      this.basket[index].datasheet = ds;
      //fill empty ds
      this.basket.forEach((basket) => {
        if (!basket.datasheet) basket.datasheet = ds;
      });
      this.activateDownload = true;
      this.saveBasket();
    }
  }

  async downloadShapesList() {
    ShapesService.exportShapes(this.basket, "en");
    this.downloadShapes();
  }

  emptyBasket() {
    this.basket = [];
    this.activateDownload = false;
    this.saveBasket();
  }

  removeItemFromBasket(index) {
    if (this.basket.length == 1) {
      this.emptyBasket();
    } else {
      this.basket.splice(index, 1);
      this.saveBasket();
    }
  }

  saveBasket() {
    this.updateSlider();
    DatabaseService.saveLocalDocument(this.localDocName, this.basket);
  }

  render() {
    return [
      <ion-header>
        <app-navbar tag='shapes' text='Shapes' color='trasteel'></app-navbar>
        <ion-grid class='ion-no-padding'>
          <ion-row class='ion-no-padding'>
            <ion-col size='1' class='ion-no-padding'>
              <ion-toolbar color='trasteel'>
                <ion-button
                  fill='clear'
                  expand='full'
                  icon-only
                  onClick={() => this.openShapeFilter()}
                >
                  <ion-icon name='filter' color='light'></ion-icon>
                </ion-button>
              </ion-toolbar>
            </ion-col>
            <ion-col size='11' class='ion-no-padding'>
              <app-search-toolbar
                id='searchToolbar'
                searchTitle='shapes'
                list={this.shapesList}
                orderFields={["shapeName"]}
                color='trasteel'
                placeholder='Search by shape name'
                filterBy={["shapeName", "shapeTypeId"]}
                onFilteredList={(ev) => (this.filteredShapesList = ev.detail)}
              ></app-search-toolbar>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-header>,
      <ion-content class='slides'>
        {TrasteelService.isRefraDBAdmin() ? (
          !this.showDownload ? (
            <ion-fab vertical='top' horizontal='end' slot='fixed' edge>
              <ion-fab-button size='small' color='trasteel'>
                <ion-icon name='chevron-down'></ion-icon>
              </ion-fab-button>
              <ion-fab-list side='bottom'>
                <ion-fab-button
                  onClick={() => this.addShape()}
                  color='trasteel'
                >
                  <ion-icon name='add'></ion-icon>
                </ion-fab-button>
                <ion-fab-button
                  onClick={() => this.downloadShapes()}
                  color='trasteel'
                >
                  <ion-icon name='download'></ion-icon>
                </ion-fab-button>
              </ion-fab-list>
            </ion-fab>
          ) : (
            <ion-fab vertical='top' horizontal='end' slot='fixed' edge>
              <ion-fab-button
                onClick={() => this.downloadShapes()}
                size='small'
                color='trasteel'
              >
                <ion-icon name='close'></ion-icon>
              </ion-fab-button>
            </ion-fab>
          )
        ) : undefined}
        <swiper-container class='slider-show-shape swiper'>
          <swiper-wrapper class='swiper-wrapper'>
            <swiper-slide class='swiper-slide'>
              {this.filter.isActive()
                ? [
                    <ion-breadcrumbs>
                      <ion-button
                        icon-only
                        fill='clear'
                        onClick={() => this.clearShapeFilter()}
                      >
                        <ion-icon color='danger' name='trash'></ion-icon>
                      </ion-button>
                      <ion-breadcrumb>
                        {this.filteredShapesList.length}
                      </ion-breadcrumb>
                      {Object.keys(this.filter).map((key) =>
                        !key.includes("operator") &&
                        (this.filter[key] > 0 || this.filter[key] !== null) ? (
                          <ion-breadcrumb>
                            {key != "shapeTypeId"
                              ? key +
                                " " +
                                this.filter[key + "_operator"] +
                                " " +
                                this.filter[key]
                              : ShapesService.getShapeTypeName(
                                    this.filter.shapeTypeId
                                  )
                                ? ShapesService.getShapeTypeName(
                                    this.filter.shapeTypeId
                                  ).en
                                : null}
                          </ion-breadcrumb>
                        ) : undefined
                      )}
                      <ion-breadcrumb></ion-breadcrumb>
                    </ion-breadcrumbs>,
                  ]
                : undefined}

              <app-infinite-scroll
                list={this.filteredShapesList}
                loading={this.loading}
                showFields={["shapeName"]}
                orderBy={["shapeName"]}
                options={this.getOptions()}
                returnField='id'
                icon={
                  TrasteelFilterService.getMapDocs(SHAPESCOLLECTION).icon.name
                }
                onItemClicked={(ev) => this.openShape(ev.detail)}
                onListChanged={() => {
                  this.updateSlider();
                }}
              ></app-infinite-scroll>
            </swiper-slide>
            {this.showDownload ? (
              <swiper-slide class='swiper-slide'>
                <ion-list>
                  {this.basket.length == 0 ? (
                    <ion-item>
                      Click on the shapes on the left to add to basket
                    </ion-item>
                  ) : (
                    <ion-grid>
                      <ion-row>
                        <ion-col>
                          <ion-button
                            onClick={() => this.downloadShapesList()}
                            expand='block'
                            fill='outline'
                            color='trasteel'
                            disabled={!this.activateDownload}
                          >
                            <ion-icon name='download' slot='start'></ion-icon>
                            <ion-label>
                              {TranslationService.getTransl(
                                "download",
                                "Download"
                              )}
                            </ion-label>
                            <ion-badge slot='end' color='trasteel'>
                              {this.basket.length}
                            </ion-badge>
                          </ion-button>
                        </ion-col>
                        <ion-col size='1'>
                          <ion-button
                            fill='clear'
                            icon-only
                            onClick={() => this.emptyBasket()}
                          >
                            <ion-icon name='trash' color='danger'></ion-icon>
                          </ion-button>
                        </ion-col>
                      </ion-row>
                    </ion-grid>
                  )}
                  {this.basket.map((basket, index) => (
                    <ion-grid class='ion-no-padding'>
                      <ion-row class='ion-no-padding'>
                        <ion-col class='ion-no-padding'>
                          <ion-item color='light'>
                            <ion-label>{basket.shape.shapeName}</ion-label>
                            <ion-icon slot='end' name='arrow-right'></ion-icon>
                          </ion-item>
                        </ion-col>
                        <ion-col class='ion-no-padding'>
                          <ion-item
                            button
                            color='light'
                            onClick={() => this.openDataSheet(index)}
                          >
                            <ion-label>
                              {basket.datasheet
                                ? basket.datasheet.productName
                                : "insert datasheet"}
                            </ion-label>
                          </ion-item>
                        </ion-col>
                        <ion-col size='2' class='ion-no-padding'>
                          <ion-item color='light'>
                            <ion-button
                              slot='end'
                              fill='clear'
                              icon-only
                              onClick={() => this.removeItemFromBasket(index)}
                            >
                              <ion-icon name='trash' color='danger'></ion-icon>
                            </ion-button>
                          </ion-item>
                        </ion-col>
                      </ion-row>
                    </ion-grid>
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
