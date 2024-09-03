import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { ag as ProjectsService, j as CustomersService, F as TrasteelFilterService, P as PROJECTSCOLLECTION } from './utils-cbf49763.js';
import { l as lodash } from './lodash-68d560b6.js';
import { T as TrasteelService } from './services-2650b7f8.js';
import './env-9be68260.js';
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

const pageProjectsCss = "page-projects{}";

const PageProjects = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.projectsList = [];
        this.filteredProjectsList = [];
        this.loading = true;
        this.updateView = true;
    }
    componentWillLoad() {
        ProjectsService.projectsList$.subscribe(async (list) => {
            //replace name of customers
            const customersList = [];
            list.map((item) => {
                const newItem = lodash.exports.cloneDeep(item);
                const customer = CustomersService.getCustomersDetails(item.customerId);
                if (customer) {
                    newItem.customerId = customer.fullName;
                    customersList.push(newItem);
                }
            });
            this.updateList(customersList);
            this.loading = false;
        });
    }
    componentDidLoad() {
        this.searchToolbar = this.el.querySelector("#searchToolbar");
        this.updateList(this.projectsList);
    }
    updateList(list) {
        this.projectsList = list;
        this.searchToolbar
            ? this.searchToolbar.forceFilter(this.projectsList)
            : undefined;
        this.updateView = !this.updateView;
    }
    addProject() {
        ProjectsService.presentProjectUpdate();
    }
    getOptions() {
        if (TrasteelService.isRefraDBAdmin()) {
            return [
                {
                    tag: "delete",
                    text: "Delete",
                    icon: "trash",
                    color: "danger",
                    func: (returnField) => ProjectsService.deleteProject(returnField, false),
                },
                {
                    tag: "duplicate",
                    text: "Duplicate",
                    icon: "duplicate",
                    color: "secondary",
                    func: (returnField) => ProjectsService.duplicateProject(returnField),
                },
                {
                    tag: "edit",
                    text: "Edit",
                    icon: "create",
                    color: "primary",
                    func: (returnField) => ProjectsService.presentProjectUpdate(returnField),
                },
            ];
        }
        else
            return null;
    }
    render() {
        return [
            h("ion-header", { key: '6205130746870eb63eb77a725fad4a39ffd6bc47' }, h("app-navbar", { key: '097a947740e64256e82206c1f9085cd23f772dfe', tag: "projects", text: "Projects", color: "trasteel" }), h("app-search-toolbar", { key: '1e10fc1db8cd4755ad5840477f1fba60691c18f8', id: "searchToolbar", searchTitle: "projects", list: this.projectsList, orderFields: ["customerId", "projectLocalId"], color: "trasteel", placeholder: "Search by customer or project", filterBy: ["customerId", "projectLocalId", "projectDescription"], onFilteredList: (ev) => (this.filteredProjectsList = ev.detail) })),
            h("ion-content", { key: 'df0194fe7808ff2f2643495b579e6c2b194ceed5' }, TrasteelService.isRefraDBAdmin() ? (h("ion-fab", { vertical: "top", horizontal: "end", slot: "fixed", edge: true }, h("ion-fab-button", { size: "small", onClick: () => this.addProject(), color: "trasteel" }, h("ion-icon", { name: "add" })))) : undefined, h("app-infinite-scroll", { key: '19c497c8c57681aa3dd590855e387448f9f8463a', list: this.filteredProjectsList, loading: this.loading, showFields: ["projectLocalId"], showNotes: ["projectDescription"], groupBy: ["customerId"], options: this.getOptions(), returnField: "id", icon: TrasteelFilterService.getMapDocs(PROJECTSCOLLECTION).icon.name, onItemClicked: (ev) => ProjectsService.presentProjectDetails(ev.detail) })),
        ];
    }
    get el() { return getElement(this); }
};
PageProjects.style = pageProjectsCss;

export { PageProjects as page_projects };

//# sourceMappingURL=page-projects.entry.js.map