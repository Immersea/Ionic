import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { aC as DatasheetFilter, D as DatabaseService, O as DatasheetsService, B as SystemService, F as TrasteelFilterService, s as DATASHEETSCOLLECTION, T as TranslationService } from './utils-ced1e260.js';
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

const pageDatasheetsCss = "page-datasheets{}";

const PageDatasheets = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.datasheetsList = [];
        this.nonFilteredDatasheetsList = [];
        this.localDocName = "datasheetBasket";
        this.filteredDatasheetsList = [];
        this.loading = true;
        this.filter = new DatasheetFilter();
        this.slider = undefined;
        this.updateView = true;
        this.showDownload = true;
        this.basket = [];
    }
    async componentWillLoad() {
        const filter = await DatabaseService.getLocalDocument("datasheetsFilter");
        this.filter = new DatasheetFilter(filter);
        DatasheetsService.datasheetsList$.subscribe(async (list) => {
            this.updateList(list);
            this.nonFilteredDatasheetsList = list;
            this.loading = false;
            this.filterLists();
        });
        const basket = await DatabaseService.getLocalDocument(this.localDocName);
        if (basket)
            this.basket = basket;
    }
    componentDidLoad() {
        this.searchToolbar = this.el.querySelector("#searchToolbar");
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
            this.filteredDatasheetsList = lodash.exports.cloneDeep(list);
        }
        else {
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
                    func: (returnField) => DatasheetsService.deleteDatasheet(returnField, false),
                },
                {
                    tag: "revision",
                    text: "Revision",
                    icon: "duplicate",
                    color: "secondary",
                    func: (returnField) => DatasheetsService.duplicateDatasheet(returnField, true),
                },
                {
                    tag: "copy",
                    text: "Copy",
                    icon: "copy",
                    color: "tertiary",
                    func: (returnField) => DatasheetsService.duplicateDatasheet(returnField, false),
                },
                {
                    tag: "edit",
                    text: "Edit",
                    icon: "create",
                    color: "primary",
                    func: (returnField) => DatasheetsService.presentDatasheetUpdate(returnField),
                },
            ];
        }
        else
            return null;
    }
    async openDatasheetFilter() {
        DatabaseService.deleteLocalDocument("filteredDatasheetList");
        this.filter = await DatasheetsService.openDatasheetFilter(this.filter);
        this.filterLists();
    }
    clearDatasheetFilter() {
        this.filter = new DatasheetFilter();
        this.datasheetsList = lodash.exports.cloneDeep(this.nonFilteredDatasheetsList);
        DatabaseService.deleteLocalDocument("filteredDatasheetList");
        this.filterLists();
    }
    async filterLists() {
        DatabaseService.saveLocalDocument("datasheetsFilter", this.filter);
        if (this.filter.isActive()) {
            const previousList = await DatabaseService.getLocalDocument("filteredDatasheetList");
            if (!previousList) {
                await SystemService.presentLoading("searching");
                const datasheetsList = await DatasheetsService.filterDatasheets(this.filter);
                SystemService.dismissLoading();
                if (datasheetsList) {
                    this.datasheetsList = datasheetsList;
                    DatabaseService.saveLocalDocument("filteredDatasheetList", this.datasheetsList);
                }
                else {
                    //case when only olDproduct is selected
                    this.filterDatasheets(this.nonFilteredDatasheetsList);
                }
            }
            else {
                this.datasheetsList = previousList;
            }
            this.filterDatasheets(this.datasheetsList);
        }
        else {
            this.filterDatasheets(this.nonFilteredDatasheetsList);
        }
        this.searchToolbar
            ? this.searchToolbar.forceFilter(this.datasheetsList)
            : undefined;
        this.slider ? this.updateSlider() : undefined;
    }
    makeBreadCrumb(key) {
        if (key == "familyId") {
            const families = DatasheetsService.getDatasheetFamilies(this.filter.familyId);
            if (families && families.length > 0)
                return families[0].familyName;
            else
                return this.filter.familyId;
        }
        else if (key == "majorFamilyId") {
            const majorFamilies = DatasheetsService.getDatasheetMajorFamilies(this.filter.majorFamilyId);
            if (majorFamilies && majorFamilies.length > 0)
                return majorFamilies[0].majorFamilyName;
            else
                return this.filter.majorFamilyId;
        }
        else if (key == "oldProduct") {
            return this.filter.oldProduct ? "All revs." : "Last Rev.";
        }
        else if (key == "properties") {
            if (this.filter.properties.length > 0) {
                let bread = "( ";
                this.filter.properties.forEach((property, index) => {
                    const name = DatasheetsService.getDatasheetPropertyNames("id", property.valueName);
                    bread +=
                        (name && name.length > 0 ? name[0].nameName : property.valueName) +
                            property.operator +
                            property.value +
                            (index < this.filter.properties.length - 1 ? " / " : " )");
                });
                return bread;
            }
            else
                return "";
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
            if (!lodash.exports.includes(this.basket, ds))
                this.basket.push(ds);
            this.saveBasket();
            this.updateSlider();
        }
        else {
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
            h("ion-header", { key: '41d05719c4f8e6e11db251e8f38baabb0f438cfd' }, h("app-navbar", { key: 'f088e5c51b8458f0dee6d2ba26b191e1df828e09', tag: "datasheets", text: "Data Sheets", color: "trasteel" }), h("ion-grid", { key: 'd1d0690ab0d3ede9881142450e7fc867c2e86158', class: "ion-no-padding" }, h("ion-row", { key: '2c3a0245153fa746ba9d8d1b7e75b68f732328ee', class: "ion-no-padding" }, h("ion-col", { key: '3cd695c52f5dd60242d2974af955ecf5154ed206', size: "1", class: "ion-no-padding" }, h("ion-toolbar", { key: 'e0e9a92e7cbb2fec06c58102944883a2180e7f70', color: "trasteel" }, h("ion-button", { key: 'e8dc442463c39e4b83ece67a5d8d91f196132029', fill: "clear", expand: "full", "icon-only": true, onClick: () => this.openDatasheetFilter() }, h("ion-icon", { key: '0b014f2a1bfe0eb5ec5d2c913ac3b969d5f39d26', name: "filter", color: "light" })))), h("ion-col", { key: 'e5439bb94d10fee1a8b62347fde8a30839debdab', size: "11", class: "ion-no-padding" }, h("app-search-toolbar", { key: '936713f7d0cff3c1c15c5e3829515d88a620c55c', id: "searchToolbar", searchTitle: "datasheets", list: this.datasheetsList, orderFields: ["productName"], color: "trasteel", placeholder: "Search by product, family or tech#", filterBy: ["productName", "familyId", "techNo"], onFilteredList: (ev) => this.filterDatasheets(ev.detail) }))))),
            h("ion-content", { key: '7fb5fea5df809a427abad2abfbce4c4d5a185db9', class: "slides" }, TrasteelService.isRefraDBAdmin() ? (!this.showDownload ? (h("ion-fab", { vertical: "top", horizontal: "end", slot: "fixed", edge: true }, h("ion-fab-button", { size: "small", color: "trasteel" }, h("ion-icon", { name: "chevron-down" })), h("ion-fab-list", { side: "bottom" }, h("ion-fab-button", { onClick: () => this.addDatasheet(), color: "trasteel" }, h("ion-icon", { name: "add" })), h("ion-fab-button", { onClick: () => this.downloadDatasheets(), color: "trasteel" }, h("ion-icon", { name: "download" }))))) : (h("ion-fab", { vertical: "top", horizontal: "end", slot: "fixed", edge: true }, h("ion-fab-button", { onClick: () => this.downloadDatasheets(), size: "small", color: "trasteel" }, h("ion-icon", { name: "close" }))))) : undefined, h("swiper-container", { key: 'df4b5dfc856cec4011a84ea4878e397e251e359b', class: "slider-show-datasheet swiper" }, h("swiper-wrapper", { key: '411ddce6f4587e05a8031450e699ec769ced6c9d', class: "swiper-wrapper" }, h("swiper-slide", { key: 'b0ad13cbacf43588a7bf1c3cb8d1c4100725d3fc', class: "swiper-slide" }, this.filter.isActive()
                ? [
                    h("ion-breadcrumbs", null, h("ion-button", { "icon-only": true, fill: "clear", onClick: () => this.clearDatasheetFilter() }, h("ion-icon", { color: "danger", name: "trash" })), h("ion-breadcrumb", null, "#", this.filteredDatasheetsList.length), Object.keys(this.filter).map((key) => (lodash.exports.isArray(this.filter[key])
                        ? this.filter[key].length > 0
                        : this.filter[key] !== null) ? (h("ion-breadcrumb", null, this.makeBreadCrumb(key))) : undefined), h("ion-breadcrumb", null)),
                ]
                : undefined, h("app-infinite-scroll", { key: 'a6f92d709855583befb5116e924a576acfbf7462', list: this.filteredDatasheetsList, loading: this.loading, showFields: ["productName"], options: this.getOptions(), returnField: "id", icon: TrasteelFilterService.getMapDocs(DATASHEETSCOLLECTION).icon
                    .name, onItemClicked: (ev) => this.openDatasheet(ev.detail), onListChanged: () => {
                    this.updateSlider();
                } })), this.showDownload ? (h("swiper-slide", { class: "swiper-slide" }, h("ion-list", null, this.basket.length == 0 ? (h("ion-item", null, "Click on the datasheets on the left to add to basket")) : (h("ion-grid", null, h("ion-row", null, h("ion-col", null, h("ion-button", { onClick: () => this.downloadDatasheetsList(), expand: "block", fill: "outline", color: "trasteel" }, h("ion-icon", { name: "download", slot: "start" }), h("ion-label", null, TranslationService.getTransl("download", "Download")), h("ion-badge", { slot: "end", color: "trasteel" }, this.basket.length))), h("ion-col", { size: "1" }, h("ion-button", { fill: "clear", "icon-only": true, onClick: () => this.emptyBasket() }, h("ion-icon", { name: "trash", color: "danger" })))))), this.basket.map((ds, index) => (h("ion-item", { color: "light" }, h("ion-label", null, ds.productName), h("ion-button", { slot: "end", fill: "clear", "icon-only": true, onClick: () => this.removeItemFromBasket(index) }, h("ion-icon", { name: "trash", color: "danger" })))))))) : undefined))),
        ];
    }
    get el() { return getElement(this); }
};
PageDatasheets.style = pageDatasheetsCss;

export { PageDatasheets as page_datasheets };

//# sourceMappingURL=page-datasheets.entry.js.map