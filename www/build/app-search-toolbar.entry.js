import { r as registerInstance, l as createEvent, h, j as Host, k as getElement } from './index-d515af00.js';
import { E as Environment } from './env-9be68260.js';
import { D as DatabaseService } from './utils-cbf49763.js';
import { l as lodash } from './lodash-68d560b6.js';
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
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';

const appSearchToolbarCss = "";

const TITLE = "app-search-toolbar-";
const AppSearchToolbar = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.filteredList = createEvent(this, "filteredList", 7);
        this.searchString = null;
        this.list = [];
        this.searchTitle = undefined;
        this.orderFields = [];
        this.color = Environment.getAppColor();
        this.placeholder = "Search";
        this.filterBy = undefined;
    }
    //used to force reset a value in case of changes of the "value" on the main DOM
    async forceFilter(list) {
        this.list = list;
        this.filterList();
    }
    async setFocus() {
        const searchbar = this.el.querySelector("ion-searchbar");
        if (searchbar) {
            searchbar.componentOnReady().then(() => {
                setTimeout(() => {
                    searchbar.setFocus();
                }, 500);
            });
        }
    }
    async componentWillLoad() {
        if (this.searchTitle) {
            const search = await DatabaseService.getLocalDocument(TITLE + this.searchTitle);
            if (search) {
                this.searchString = search;
                this.filterList();
            }
        }
        else {
            this.filterList();
        }
    }
    componentDidLoad() {
        this.setFocus();
    }
    filterList() {
        let filterList = [];
        if (this.searchString) {
            const search = lodash.exports.toLower(this.searchString);
            let filters = [];
            this.filterBy.forEach((key) => {
                filters = [
                    ...filters,
                    ...this.list.filter((x) => lodash.exports.includes(lodash.exports.toLower(x[key]), search)),
                ];
            });
            //remove duplicates
            filterList = lodash.exports.uniq(filters);
        }
        else {
            filterList = this.list;
        }
        this.filteredList.emit(lodash.exports.orderBy(filterList, this.orderFields));
    }
    handleSearch(ev) {
        this.searchString = "";
        const target = ev.target;
        if (target) {
            this.searchString = target.value.toLowerCase();
            if (this.searchTitle) {
                DatabaseService.saveLocalDocument(TITLE + this.searchTitle, this.searchString);
            }
        }
        this.filterList();
    }
    render() {
        return (h(Host, { key: '013b1ed435047e085bb56aeebb75deebd5b01adc' }, h("ion-toolbar", { key: '1603989d71ca22524612efde4302c7192d276dcc', color: this.color }, h("ion-searchbar", { key: '4e0e79579cf160dea6bdc8b22349524544ecd137', animated: true, "show-cancel-button": "focus", debounce: 250, value: this.searchString, placeholder: this.placeholder, onIonInput: (ev) => this.handleSearch(ev) }))));
    }
    get el() { return getElement(this); }
};
AppSearchToolbar.style = appSearchToolbarCss;

export { AppSearchToolbar as app_search_toolbar };

//# sourceMappingURL=app-search-toolbar.entry.js.map