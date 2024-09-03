import { r as registerInstance, l as createEvent, h, j as Host, k as getElement } from './index-d515af00.js';
import { l as lodash } from './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';

const appInfiniteScrollCss = "app-infinite-scroll .no-select{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}";

const AppInfiniteScroll = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.listChanged = createEvent(this, "listChanged", 7);
        this.itemClicked = createEvent(this, "itemClicked", 7);
        this.list = [];
        this.loading = false;
        this.groupBy = [];
        this.orderBy = [];
        this.returnField = undefined;
        this.showFields = [];
        this.showFieldsDivider = " ";
        this.showNotes = [];
        this.icon = undefined;
        this.options = undefined;
        this.setItems = undefined;
        this.groupedItems = undefined;
        this.updateView = false;
    }
    reset() {
        this.start = 0;
        this.listLength = 50;
        this.setItems = [];
        this.groupedItems = {};
        this.generateItems();
    }
    componentWillLoad() {
        this.reset();
    }
    generateItems(ev) {
        const newItems = [];
        for (let i = this.start; i < this.start + this.listLength; i++) {
            if (this.list[i])
                newItems.push(this.list[i]);
        }
        this.setItems = [...this.setItems, ...newItems];
        this.setItems = this.orderBy
            ? lodash.exports.orderBy(this.setItems, this.orderBy)
            : this.setItems;
        this.start += this.listLength;
        if (this.groupBy.length > 0) {
            const groupedItems = [];
            this.setItems.forEach((item) => {
                const value = item[this.groupBy[0]];
                !groupedItems[value] ? (groupedItems[value] = []) : undefined;
                groupedItems[value].push(item);
            });
            this.groupedItems = groupedItems;
        }
        ev ? ev.target.complete() : null;
        this.listChanged.emit();
    }
    showItem(item) {
        return (h("ion-item-sliding", { class: "no-select" }, h("ion-item", { button: true, detail: true, onClick: () => this.itemClicked.emit(this.returnField ? item[this.returnField] : item) }, item.photoURL ? (h("ion-avatar", { slot: "start" }, h("img", { src: item.photoURL }))) : this.icon ? (h("ion-icon", { slot: "start", name: this.icon })) : undefined, h("ion-label", null, h("h2", null, this.showFields.map((field, index) => {
            return item[field]
                ? item[field] +
                    (index < this.showFields.length - 1
                        ? this.showFieldsDivider
                        : "")
                : "";
        })), this.showNotes.length > 0 ? (h("p", null, this.showNotes.map((field, index) => {
            return item[field]
                ? item[field] +
                    (index < this.showNotes.length - 1
                        ? index < this.showNotes.length - 1
                            ? this.showFieldsDivider
                            : ""
                        : "")
                : "";
        }))) : undefined)), this.options ? (h("ion-item-options", null, this.options.map((option) => (h("ion-item-option", { color: option.color, onClick: () => this.executeOptionFc(option, item) }, option.icon ? (h("ion-icon", { name: option.icon })) : undefined, h("my-transl", { tag: option.tag, text: option.text })))))) : undefined));
    }
    executeOptionFc(option, item) {
        this.listElement = this.el.querySelector("#infinite-scroll-list");
        this.listElement.closeSlidingItems();
        option.func(item[this.returnField]);
    }
    render() {
        return (h(Host, { key: '71123c1ec281781a8a1b69c0db52952bfbabef11' }, this.list.length == 0 ? (h("div", null, this.loading ? (h("ion-item", null, h("ion-thumbnail", { slot: "start" }, h("ion-skeleton-text", null)), h("ion-label", null, h("h2", null, h("ion-skeleton-text", { animated: true, style: { width: "80%" } })), h("p", null, h("ion-skeleton-text", { animated: true, style: { width: "60%" } }))))) : (h("ion-item", null, h("ion-label", null, h("h2", null, "No data available")))))) : ([
            h("ion-list", { id: "infinite-scroll-list" }, this.groupBy.length > 0
                ? Object.keys(this.groupedItems).map((key) => (h("ion-item-group", null, h("ion-item-divider", null, h("ion-label", null, key)), this.groupedItems[key].map((item) => this.showItem(item)))))
                : this.setItems.map((item) => this.showItem(item))),
            h("ion-infinite-scroll", { onIonInfinite: (ev) => {
                    this.generateItems(ev);
                } }, h("ion-infinite-scroll-content", null)),
        ])));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "list": ["reset"]
    }; }
};
AppInfiniteScroll.style = appInfiniteScrollCss;

export { AppInfiniteScroll as app_infinite_scroll };

//# sourceMappingURL=app-infinite-scroll.entry.js.map