import { r as registerInstance, l as createEvent, h, j as Host } from './index-d515af00.js';
import { U as UserService, E as UDiveFilterService } from './utils-ced1e260.js';
import { E as Environment } from './env-c3ad5e77.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-fe092362.js';
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
import './customerLocation-d18240cd.js';

const appSearchFilterCss = "app-search-filter{padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}app-search-filter .search-tags{position:absolute;top:calc(env(safe-area-inset-top) + 88px);right:0px;z-index:2}";

const AppSearchFilter = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.searchFilterEmit = createEvent(this, "searchFilterEmit", 7);
        this.tags = [];
        this.types = {
            search: {
                color: "light",
                icon: "search-circle",
            },
            filter: {
                color: "primary",
                icon: "filter",
            },
        };
        this.updateView = true;
        this.hideSearch = false;
        this.hideToolbar = false;
        this.filterButtonTypes = undefined;
    }
    componentWillLoad() {
        this.userSub = UserService.userRoles$.subscribe(() => {
            //update after user is loaded
            this.filterButtonTypes = UDiveFilterService.getMapDocs();
        });
        this.filterButtonTypes = UDiveFilterService.getMapDocs();
    }
    disconnectedCallback() {
        this.userSub.unsubscribe();
        this.tags = [];
        this.searchFilterEmit.emit(this.tags);
    }
    async addTag(tag) {
        this.tags.push(tag);
        this.searchFilterEmit.emit(this.tags);
        if (tag.type == "search")
            this.hideSearch = true;
        this.updateView = !this.updateView;
    }
    async removeTag(i) {
        if (this.tags[i].type == "search")
            this.hideSearch = false;
        this.tags.splice(i, 1);
        this.searchFilterEmit.emit(this.tags);
        this.updateView = !this.updateView;
    }
    searchInputChange(str) {
        const search = { name: str, type: "search" };
        //pass search value to search filter
        this.addTag(search);
    }
    checkButtonEnabled(button) {
        return this.tags.find((el) => el.name == button) != null;
    }
    async removeFilterTag(button) {
        const index = this.tags.findIndex((el) => el.name == button && el.type == "filter");
        this.tags.splice(index, 1);
        this.searchFilterEmit.emit(this.tags);
        this.updateView = !this.updateView;
    }
    render() {
        return (h(Host, { key: '403b0c5197bc98999c77c5ae18b5c7fa050a8c6d' }, !this.hideToolbar ? (h("ion-toolbar", { color: Environment.getAppColor() }, h("ion-grid", null, h("ion-row", { class: "ion-text-center" }, h("ion-col", { size: "1" }, h("ion-menu-button", null)), h("ion-col", null, h("my-transl", { tag: "looking-for", text: "What are you looking for?" })), h("ion-col", { size: "1" })), h("ion-row", null, Object.keys(this.filterButtonTypes).map((button) => (h("ion-col", { class: "ion-no-padding" }, h("ion-tab-button", { color: Environment.getAppColor(), layout: "icon-bottom", onClick: () => !this.checkButtonEnabled(button)
                ? this.addTag({ type: "filter", name: button })
                : this.removeFilterTag(button) }, this.filterButtonTypes[button].icon.type == "ionicon" ? (h("ion-icon", { name: this.filterButtonTypes[button].icon.name, color: this.filterButtonTypes[button].icon.color })) : (h("ion-icon", { class: "map-icon " +
                this.filterButtonTypes[button].icon.name, color: this.filterButtonTypes[button].icon.color })), h("ion-label", { color: this.filterButtonTypes[button].icon.color }, this.filterButtonTypes[button].name))))))))) : ([
            h("ion-fab", { vertical: "top", horizontal: "end", slot: "fixed" }, h("ion-fab-button", { class: "fab-icon" }, h("ion-icon", { name: "filter" })), h("ion-fab-list", { side: "start" }, Object.keys(this.filterButtonTypes).map((button) => (h("ion-fab-button", { style: {
                    "--background": this.filterButtonTypes[button].icon.color,
                }, onClick: () => this.addTag({ type: "filter", name: button }), disabled: this.tags.find((el) => el.name == button) != null }, this.filterButtonTypes[button].icon.type == "ionicon" ? (h("ion-icon", { name: this.filterButtonTypes[button].icon.name })) : (h("ion-icon", { class: "map-icon " + this.filterButtonTypes[button].icon.name }))))))),
        ]), !this.hideSearch ? (h("app-searchbar", { floating: true, onInputChanged: (ev) => this.searchInputChange(ev.detail) })) : undefined, h("div", { key: 'a82fa56184e7b9a5a5e1e223854dc53391d4924e', class: "search-tags" }, h("ion-grid", { key: '65f63ec45e69f53d11ec93aeae94220ae9c4655c', class: "ion-no-padding ion-no-margin ion-text-end" }, this.tags.map((tag, i) => (h("ion-row", null, h("ion-col", null, h("ion-chip", { outline: true, style: {
                background: tag.type == "filter"
                    ? "rgba(var(--ion-color-" +
                        this.filterButtonTypes[tag.name].icon.color +
                        "-contrast-rgb),0.3)"
                    : "#00000050",
            }, color: tag.type == "filter"
                ? this.filterButtonTypes[tag.name].icon.color
                : "light" }, tag.type == "search" ? (h("ion-icon", { name: this.types[tag.type].icon })) : this.filterButtonTypes[tag.name].icon.type ==
            "ionicon" ? (h("ion-icon", { color: this.filterButtonTypes[tag.name].icon.color, name: this.filterButtonTypes[tag.name].icon.name })) : (h("ion-icon", { color: this.filterButtonTypes[tag.name].icon.color, class: "map-icon " +
                this.filterButtonTypes[tag.name].icon.name })), h("ion-label", null, tag.type == "search"
            ? tag.name
            : this.filterButtonTypes[tag.name].name), h("ion-icon", { name: "close-circle", color: tag.type == "filter"
                ? this.filterButtonTypes[tag.name].icon.color
                : "light", onClick: () => this.removeTag(i) }))))))))));
    }
};
AppSearchFilter.style = appSearchFilterCss;

export { AppSearchFilter as app_search_filter };

//# sourceMappingURL=app-search-filter.entry.js.map