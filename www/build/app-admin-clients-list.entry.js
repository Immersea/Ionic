import { r as registerInstance, h } from './index-d515af00.js';
import { k as SERVICECENTERSCOLLECTION, l as ServiceCentersService, c as DIVECENTERSSCOLLECTION, i as DivingCentersService, m as DIVESCHOOLSSCOLLECTION, n as DivingSchoolsService, U as UserService, T as TranslationService, A as ADMINROUTE } from './utils-cbf49763.js';
import { l as lodash } from './lodash-68d560b6.js';
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

const appAdminClientsListCss = "app-admin-clients-list{}";

const AppAdminClientsList = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.admin = undefined;
        this.clientsFilteredList = undefined;
    }
    async filterClients(ev) {
        this.filter = ev ? (ev.target ? ev.target.value : ev) : null;
        if (this.filter) {
            this.clientsFilteredList = this.clientsList.filter((client) => client.displayName.toLowerCase().includes(this.filter.toLowerCase()));
        }
        else {
            this.clientsFilteredList = this.clientsList;
        }
    }
    async componentWillLoad() {
        let sub = null;
        switch (this.admin.collectionId) {
            case DIVESCHOOLSSCOLLECTION:
                sub = DivingSchoolsService.selectedDivingSchoolClients$;
                this.type = DIVESCHOOLSSCOLLECTION.toLowerCase();
                this.id = DivingSchoolsService.selectedDivingSchoolId;
                this.customersUrl = "members";
                break;
            case DIVECENTERSSCOLLECTION:
                sub = DivingCentersService.selectedDivingCenterClients$;
                this.type = DIVECENTERSSCOLLECTION.toLowerCase();
                this.id = DivingCentersService.selectedDivingCenterId;
                this.customersUrl = "customers";
                break;
            case SERVICECENTERSCOLLECTION:
                sub = ServiceCentersService.selectedServiceCenterClients$;
                this.type = SERVICECENTERSCOLLECTION.toLowerCase();
                this.id = ServiceCentersService.selectedServiceCenterId;
                this.customersUrl = "customers";
                break;
        }
        this.clientsSub = sub.subscribe(async (clients) => {
            this.clients = clients;
            const list = [];
            if (clients) {
                for (let clientId of Object.keys(this.clients)) {
                    list.push(await UserService.getMapDataUserDetails(clientId));
                }
            }
            this.clientsList = lodash.exports.orderBy(list, "displayName");
            this.filterClients(this.filter);
        });
    }
    disconnectedCallback() {
        this.clientsSub.unsubscribe();
    }
    render() {
        return [
            h("ion-header", { key: '21b1f168dffde05d98643ceac06e76d652be8d00' }, h("ion-toolbar", { key: 'c9335bdc79bb22d3dea576c526835d786b04a01c', color: "clients" }, h("ion-searchbar", { key: '959d7febcaed11dd672f6ceada3f9523a052b568', animated: true, placeholder: TranslationService.getTransl("search", "Search"), onIonInput: (ev) => this.filterClients(ev) }))),
            h("ion-content", { key: 'd40612e84aaaf191ab9c34fa9b458c836ec69802' }, h("ion-list", { key: 'da4efcfb6e1ff958db36f071d961274377dac20e' }, this.clientsFilteredList.map((client) => (h("ion-item", { button: true, detail: true, href: "/" +
                    ADMINROUTE +
                    "/" +
                    this.type +
                    "/" +
                    this.id +
                    "/" +
                    this.customersUrl +
                    "/" +
                    client.id }, client.photoURL ? (h("ion-avatar", { slot: "start" }, h("img", { src: client.photoURL }))) : (h("ion-icon", { slot: "start", name: "person" })), h("ion-label", null, client.displayName)))))),
        ];
    }
};
AppAdminClientsList.style = appAdminClientsListCss;

export { AppAdminClientsList as app_admin_clients_list };

//# sourceMappingURL=app-admin-clients-list.entry.js.map