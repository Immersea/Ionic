import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-9be68260.js';
import { al as ShapesService, O as DatasheetsService } from './utils-cbf49763.js';
import { m as modalController } from './overlays-b3ceb97d.js';
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
import './_commonjsHelpers-1a56c7bc.js';
import './map-dae4acde.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';
import './framework-delegate-779ab78c.js';

const modalSearchListCss = "modal-search-list{}";

const ModalSearchList = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.list = undefined;
        this.searchTitle = undefined;
        this.item = undefined;
        this.showField = undefined;
        this.orderBy = [];
        this.filterBy = undefined;
        this.placeholder = undefined;
        this.filterObject = undefined;
        this.filterPopup = undefined;
        this.filterFunction = undefined;
        this.filteredList = undefined;
    }
    componentWillLoad() {
        this.nonFilteredList = lodash.exports.cloneDeep(this.list);
        this.clearFilterObject = lodash.exports.cloneDeep(this.filterObject);
    }
    async openFilter() {
        this.filterObject = await this.filterPopup(this.filterObject);
        this.list = await this.filterFunction(this.filterObject);
    }
    clearFilter() {
        this.filterObject = lodash.exports.cloneDeep(this.clearFilterObject);
        this.list = lodash.exports.cloneDeep(this.nonFilteredList);
    }
    handleSelect(item) {
        modalController.dismiss(item);
    }
    renderKey(key) {
        let res = null;
        switch (key) {
            case "familyId":
                res = DatasheetsService.getDatasheetFamilies(this.filterObject[key])[0]
                    .familyName;
                break;
            case "majorFamilyId":
                res = DatasheetsService.getDatasheetMajorFamilies(this.filterObject[key])[0].majorFamilyName;
                break;
            case "shapeTypeId":
                res = ShapesService.getShapeTypeName(this.filterObject[key]).en;
                break;
            default:
                res = key + " = " + this.filterObject[key];
                break;
        }
        return res;
    }
    close() {
        modalController.dismiss();
    }
    render() {
        return (h(Host, { key: '3ede88a547cc96f56552322003e29b2469c3d307' }, h("ion-header", { key: '5b5d962f3fb2b3e8545735240dbded3d8d6c7c40' }, h("app-navbar", { key: '067661573b265cc5b3fd7074fe5bb5b8a0fce439', tag: this.searchTitle.tag ? this.searchTitle.tag : "find", text: this.searchTitle.text ? this.searchTitle.text : "Find", color: Environment.getAppColor(), rightButtonText: {
                icon: "close",
                tag: null,
                text: null,
                fill: "clear",
            }, rightButtonFc: this.close }), h("ion-grid", { key: 'c8a3e68ad37f67a22a042d79d4fb4fedfb6a2915', class: "ion-no-padding" }, h("ion-row", { key: 'e8dec34bb9316810f05f0bac040ecd0e0bb0240a', class: "ion-no-padding" }, this.filterObject ? (h("ion-col", { size: "1", class: "ion-no-padding" }, h("ion-toolbar", { color: Environment.getAppColor() }, h("ion-button", { fill: "clear", expand: "full", "icon-only": true, onClick: () => this.openFilter() }, h("ion-icon", { name: "filter", color: "light" }))))) : undefined, h("ion-col", { key: 'eaff7b7627ddec9f696ce08529a9b30e7034c823', size: this.filterObject ? "11" : "12", class: "ion-no-padding" }, h("app-search-toolbar", { key: 'eaa508dad51a7b6ef2b3001433409d7e2d1000c6', list: this.list, orderFields: [this.showField], color: "trasteel", placeholder: this.placeholder ? this.placeholder : "search", filterBy: this.filterBy, onFilteredList: (ev) => (this.filteredList = ev.detail) }))))), h("ion-content", { key: 'acf2e52b7a491a578894b7a30b3f6d8622f0d572' }, this.filterObject && this.filterObject.isActive()
            ? [
                h("ion-breadcrumbs", null, h("ion-button", { "icon-only": true, fill: "clear", onClick: () => this.clearFilter() }, h("ion-icon", { color: "danger", name: "trash" })), h("ion-breadcrumb", null), Object.keys(this.filterObject).map((key) => key != "oldProduct" &&
                    (this.filterObject[key] > 0 ||
                        this.filterObject[key] !== null) ? (h("ion-breadcrumb", null, this.renderKey(key))) : undefined), h("ion-breadcrumb", null)),
            ]
            : undefined, h("app-infinite-scroll", { key: '680996c736c95f52495cfc12bcd98f18e857f4e4', list: this.filteredList, showFields: [this.showField], orderBy: this.orderBy, onItemClicked: (ev) => this.handleSelect(ev.detail) }))));
    }
    get el() { return getElement(this); }
};
ModalSearchList.style = modalSearchListCss;

export { ModalSearchList as modal_search_list };

//# sourceMappingURL=modal-search-list.entry.js.map