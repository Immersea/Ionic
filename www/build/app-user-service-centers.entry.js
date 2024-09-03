import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { U as UserService, y as UserRoles, l as ServiceCentersService, k as SERVICECENTERSCOLLECTION } from './utils-ced1e260.js';
import { l as lodash } from './lodash-68d560b6.js';
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

const appUserServiceCentersCss = "app-user-service-centers{}";

const AppUserServiceCenters = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.scCollection = [];
        this.userRoles = undefined;
        this.mySchools = [];
    }
    async componentWillLoad() {
        this.userRoles$ = UserService.userRoles$.subscribe(async (userRoles) => {
            if (userRoles && userRoles.uid) {
                this.userRoles = new UserRoles(userRoles);
                this.filterMyCenters();
            }
        });
        //load all dive sites
        this.scList$ = ServiceCentersService.serviceCentersList$.subscribe((collection) => {
            this.scCollection = collection;
            this.filterMyCenters();
        });
    }
    disconnectedCallback() {
        this.userRoles$.unsubscribe();
        this.scList$.unsubscribe();
    }
    filterMyCenters() {
        this.mySchools = [];
        if (this.scCollection.length > 0 &&
            this.userRoles &&
            this.userRoles.editorOf) {
            Object.keys(this.userRoles.editorOf).forEach((key) => {
                if (this.userRoles.editorOf[key].collection == SERVICECENTERSCOLLECTION) {
                    let ds = this.scCollection.find((ds) => ds.id == key);
                    this.mySchools.push(ds);
                }
            });
            this.mySchools = lodash.exports.orderBy(this.mySchools, "displayname");
        }
    }
    update(event, id) {
        event.stopPropagation();
        ServiceCentersService.presentServiceCenterUpdate(id);
    }
    render() {
        return (h(Host, { key: 'a888c1541c31597cc114276fa477750e8613d01a' }, this.mySchools.map((sc) => (h("ion-item", { button: true, onClick: () => ServiceCentersService.presentServiceCenterDetails(sc.id), detail: true }, sc.photoURL ? (h("ion-avatar", { slot: "start" }, h("img", { src: sc.photoURL }))) : undefined, h("ion-label", null, sc.displayName), h("ion-button", { fill: "clear", "icon-only": true, slot: "end", onClick: (ev) => this.update(ev, sc.id) }, h("ion-icon", { name: "create", slot: "end" })))))));
    }
};
AppUserServiceCenters.style = appUserServiceCentersCss;

export { AppUserServiceCenters as app_user_service_centers };

//# sourceMappingURL=app-user-service-centers.entry.js.map