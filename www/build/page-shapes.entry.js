import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { aL as ShapeFilter, D as DatabaseService, al as ShapesService, B as SystemService, O as DatasheetsService, F as TrasteelFilterService, t as SHAPESCOLLECTION, T as TranslationService } from './utils-ced1e260.js';
import { T as TrasteelService } from './services-7994f696.js';
import { l as lodash } from './lodash-68d560b6.js';
import { S as Swiper } from './swiper-a30cd476.js';
import './env-c3ad5e77.js';
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
import './map-fe092362.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';

const pageShapesCss = "page-shapes{}";

const PageShapes = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.shapesList = [];
        this.nonFilteredShapesList = [];
        this.localDocName = "shapeBasket";
        this.filteredShapesList = [];
        this.loading = true;
        this.filter = new ShapeFilter();
        this.slider = undefined;
        this.updateView = true;
        this.showDownload = true;
        this.activateDownload = false;
        this.basket = [];
    }
    async componentWillLoad() {
        const filter = await DatabaseService.getLocalDocument("shapesFilter");
        this.filter = new ShapeFilter(filter);
        ShapesService.shapesList$.subscribe(async (list) => {
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
                }
                else {
                    this.activateDownload = false;
                }
            });
        }
    }
    componentDidLoad() {
        this.searchToolbar = this.el.querySelector("#searchToolbar");
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
        }
        else
            return null;
    }
    async openShapeFilter() {
        DatabaseService.deleteLocalDocument("filteredShapesList");
        this.filter = await ShapesService.openShapeFilter(this.filter);
        this.filterLists();
    }
    clearShapeFilter() {
        this.filter = new ShapeFilter();
        this.shapesList = lodash.exports.cloneDeep(this.nonFilteredShapesList);
        DatabaseService.deleteLocalDocument("filteredShapesList");
        this.filterLists();
    }
    async filterLists() {
        DatabaseService.saveLocalDocument("shapesFilter", this.filter);
        if (this.filter.isActive()) {
            const localShapesList = await DatabaseService.getLocalDocument("filteredShapesList");
            if (!localShapesList) {
                this.loading = true;
                SystemService.presentLoading("searching");
                this.shapesList = await ShapesService.filterShapes(this.filter);
                SystemService.dismissLoading();
                this.filteredShapesList = lodash.exports.cloneDeep(this.shapesList);
                DatabaseService.saveLocalDocument("filteredShapesList", this.filteredShapesList);
                this.loading = false;
            }
            else {
                this.filteredShapesList = localShapesList;
            }
        }
        else {
            this.filteredShapesList = lodash.exports.cloneDeep(this.nonFilteredShapesList);
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
            const shape = ShapesService.getShapeById(shapeId);
            if (!lodash.exports.find(this.basket, { shape }))
                this.basket.push({ shape, datasheet: null });
            this.basket = lodash.exports.orderBy(this.basket, "shape.shapeName");
            this.saveBasket();
        }
        else {
            ShapesService.presentShapeDetails(shapeId);
        }
    }
    async openDataSheet(index) {
        const ds = await DatasheetsService.openSelectDataSheet();
        if (ds) {
            this.basket[index].datasheet = ds;
            //fill empty ds
            this.basket.forEach((basket) => {
                if (!basket.datasheet)
                    basket.datasheet = ds;
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
        }
        else {
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
            h("ion-header", { key: 'f364ad98eaf7443dd3cd9450e11ff69a1aabe0b9' }, h("app-navbar", { key: '48c3c51fbd60463d4f22b08945051560454700ee', tag: "shapes", text: "Shapes", color: "trasteel" }), h("ion-grid", { key: 'e630d6f8b4b9b4edcf2f43a3280a5381ba0c0ff9', class: "ion-no-padding" }, h("ion-row", { key: '96a361fa67583aca9697dfec0c3bce6605aafdb7', class: "ion-no-padding" }, h("ion-col", { key: '7130b6aad376ebde92cc6496ad9803f11d0186d4', size: "1", class: "ion-no-padding" }, h("ion-toolbar", { key: '34deb4dbd56a652003b8276fcd55956b86370b53', color: "trasteel" }, h("ion-button", { key: '71ac5b9eb0756af94ab518aad2280530442fd0cc', fill: "clear", expand: "full", "icon-only": true, onClick: () => this.openShapeFilter() }, h("ion-icon", { key: 'bff8c36c14d0e9980f23477f44b3514ca26a5e6d', name: "filter", color: "light" })))), h("ion-col", { key: '2672d5bf3ad2bb578b5144bbba07fdbcb28614a9', size: "11", class: "ion-no-padding" }, h("app-search-toolbar", { key: '121f157c8af996f26814d5ffda19ea07c14b3da4', id: "searchToolbar", searchTitle: "shapes", list: this.shapesList, orderFields: ["shapeName"], color: "trasteel", placeholder: "Search by shape name", filterBy: ["shapeName", "shapeTypeId"], onFilteredList: (ev) => (this.filteredShapesList = ev.detail) }))))),
            h("ion-content", { key: '34191259ae900b882640b4e722766cf8cc4fbd8e', class: "slides" }, TrasteelService.isRefraDBAdmin() ? (!this.showDownload ? (h("ion-fab", { vertical: "top", horizontal: "end", slot: "fixed", edge: true }, h("ion-fab-button", { size: "small", color: "trasteel" }, h("ion-icon", { name: "chevron-down" })), h("ion-fab-list", { side: "bottom" }, h("ion-fab-button", { onClick: () => this.addShape(), color: "trasteel" }, h("ion-icon", { name: "add" })), h("ion-fab-button", { onClick: () => this.downloadShapes(), color: "trasteel" }, h("ion-icon", { name: "download" }))))) : (h("ion-fab", { vertical: "top", horizontal: "end", slot: "fixed", edge: true }, h("ion-fab-button", { onClick: () => this.downloadShapes(), size: "small", color: "trasteel" }, h("ion-icon", { name: "close" }))))) : undefined, h("swiper-container", { key: '49392dcefd3e261632bc8c9f7a16ea18ed6fef92', class: "slider-show-shape swiper" }, h("swiper-wrapper", { key: 'ee56c4fd2708d9655fad9d8146ed3257d2eb51ca', class: "swiper-wrapper" }, h("swiper-slide", { key: '46beaf37c71c71fe410ca5647f585bf549044faa', class: "swiper-slide" }, this.filter.isActive()
                ? [
                    h("ion-breadcrumbs", null, h("ion-button", { "icon-only": true, fill: "clear", onClick: () => this.clearShapeFilter() }, h("ion-icon", { color: "danger", name: "trash" })), h("ion-breadcrumb", null, this.filteredShapesList.length), Object.keys(this.filter).map((key) => !key.includes("operator") &&
                        (this.filter[key] > 0 || this.filter[key] !== null) ? (h("ion-breadcrumb", null, key != "shapeTypeId"
                        ? key +
                            " " +
                            this.filter[key + "_operator"] +
                            " " +
                            this.filter[key]
                        : ShapesService.getShapeTypeName(this.filter.shapeTypeId)
                            ? ShapesService.getShapeTypeName(this.filter.shapeTypeId).en
                            : null)) : undefined), h("ion-breadcrumb", null)),
                ]
                : undefined, h("app-infinite-scroll", { key: 'f2699df6dd86f39279f2a35fe0065d3333c28f37', list: this.filteredShapesList, loading: this.loading, showFields: ["shapeName"], orderBy: ["shapeName"], options: this.getOptions(), returnField: "id", icon: TrasteelFilterService.getMapDocs(SHAPESCOLLECTION).icon.name, onItemClicked: (ev) => this.openShape(ev.detail), onListChanged: () => {
                    this.updateSlider();
                } })), this.showDownload ? (h("swiper-slide", { class: "swiper-slide" }, h("ion-list", null, this.basket.length == 0 ? (h("ion-item", null, "Click on the shapes on the left to add to basket")) : (h("ion-grid", null, h("ion-row", null, h("ion-col", null, h("ion-button", { onClick: () => this.downloadShapesList(), expand: "block", fill: "outline", color: "trasteel", disabled: !this.activateDownload }, h("ion-icon", { name: "download", slot: "start" }), h("ion-label", null, TranslationService.getTransl("download", "Download")), h("ion-badge", { slot: "end", color: "trasteel" }, this.basket.length))), h("ion-col", { size: "1" }, h("ion-button", { fill: "clear", "icon-only": true, onClick: () => this.emptyBasket() }, h("ion-icon", { name: "trash", color: "danger" })))))), this.basket.map((basket, index) => (h("ion-grid", { class: "ion-no-padding" }, h("ion-row", { class: "ion-no-padding" }, h("ion-col", { class: "ion-no-padding" }, h("ion-item", { color: "light" }, h("ion-label", null, basket.shape.shapeName), h("ion-icon", { slot: "end", name: "arrow-right" }))), h("ion-col", { class: "ion-no-padding" }, h("ion-item", { button: true, color: "light", onClick: () => this.openDataSheet(index) }, h("ion-label", null, basket.datasheet
                ? basket.datasheet.productName
                : "insert datasheet"))), h("ion-col", { size: "2", class: "ion-no-padding" }, h("ion-item", { color: "light" }, h("ion-button", { slot: "end", fill: "clear", "icon-only": true, onClick: () => this.removeItemFromBasket(index) }, h("ion-icon", { name: "trash", color: "danger" }))))))))))) : undefined))),
        ];
    }
    get el() { return getElement(this); }
};
PageShapes.style = pageShapesCss;

export { PageShapes as page_shapes };

//# sourceMappingURL=page-shapes.entry.js.map