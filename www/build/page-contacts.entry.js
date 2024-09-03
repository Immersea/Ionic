import { r as registerInstance, h } from './index-d515af00.js';
import { I as ContactsService, j as CustomersService, F as TrasteelFilterService, r as CONTACTSCOLLECTION } from './utils-cbf49763.js';
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

const pageContactsCss = "page-contacts{}";

const PageContacts = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.contactsList = [];
        this.filteredContactsList = [];
        this.loading = true;
    }
    componentWillLoad() {
        ContactsService.contactsList$.subscribe(async (list) => {
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
            this.contactsList = customersList;
            this.loading = false;
        });
    }
    componentDidLoad() { }
    addContact() {
        ContactsService.presentContactUpdate();
    }
    render() {
        return [
            h("ion-header", { key: '4f7272dc0b330951b2587c3cf0870c77d66bf9e3' }, h("app-navbar", { key: '3a8ce3a7e403cdb3d3fc9e9e2a819833fa5b4bba', tag: "contacts", text: "Contacts", color: "trasteel" }), h("app-search-toolbar", { key: '961fc68045ada0936067a3e24ce40498c621c749', searchTitle: "contacts", list: this.contactsList, orderFields: ["lastName", "firstName"], color: "trasteel", placeholder: "Search by name", filterBy: ["lastName", "firstName", "customerId"], onFilteredList: (ev) => (this.filteredContactsList = ev.detail) })),
            h("ion-content", { key: '537b17c9ce9b65538c1293b3230015d99b969ee0' }, TrasteelService.isCustomerDBAdmin() ? (h("ion-fab", { vertical: "top", horizontal: "end", slot: "fixed", edge: true }, h("ion-fab-button", { onClick: () => this.addContact(), color: "trasteel" }, h("ion-icon", { name: "add" })))) : undefined, h("app-infinite-scroll", { key: 'f8853f6694386c45c9e8180a2f388caa3739cd6f', list: this.filteredContactsList, loading: this.loading, showFields: ["lastName", "firstName"], returnField: "id", groupBy: ["customerId"], icon: TrasteelFilterService.getMapDocs(CONTACTSCOLLECTION).icon.name, onItemClicked: (ev) => ContactsService.presentContactDetails(ev.detail) })),
        ];
    }
};
PageContacts.style = pageContactsCss;

export { PageContacts as page_contacts };

//# sourceMappingURL=page-contacts.entry.js.map