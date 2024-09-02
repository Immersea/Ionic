import { r as registerInstance, h } from './index-d515af00.js';

const pageTrsDashboardCss = "page-trs-dashboard{}";

const PageTrsDashboard = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.companies = [];
    }
    componentWillLoad() { }
    componentDidLoad() { }
    render() {
        return [
            h("ion-header", { key: '2d676f26c3496f38549724ad46b64b6b981aa038' }, h("app-navbar", { key: '2da9d3067e043dfee2aeadbc27c6b4f57d94ceef', tag: "dashboard", text: "Dashboard", color: "trasteel" })),
            h("ion-content", { key: 'b8ad028c7af8b9764dbe041bf3bc59019559c0ac' }, this.companies.length == 0 ? (h("div", null, h("ion-item", null, h("ion-thumbnail", { slot: "start" }, h("ion-skeleton-text", null)), h("ion-label", null, h("h2", null, h("ion-skeleton-text", { animated: true, style: { width: "80%" } })), h("ion-skeleton-text", { animated: true, style: { width: "60%" } }))))) : (h("ion-list", null, this.companies.forEach((company) => [
                h("ion-item-sliding", null, h("ion-item", null, h("ion-thumbnail", { slot: "start" }, h("img", { src: company === null || company === void 0 ? void 0 : company.img })), h("ion-label", null, h("h2", null, company === null || company === void 0 ? void 0 : company.name), h("p", null, company === null || company === void 0 ? void 0 : company.phone))), h("ion-item-options", { side: "start" }, h("ion-item-option", { color: "primary" }, "Mark Favorite")), h("ion-item-options", { side: "end" }, h("ion-item-option", { color: "danger" }, "Delete"))),
            ])))),
        ];
    }
};
PageTrsDashboard.style = pageTrsDashboardCss;

export { PageTrsDashboard as page_trs_dashboard };

//# sourceMappingURL=page-trs-dashboard.entry.js.map