import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { U as UserService, y as UserRoles, n as DivingSchoolsService, m as DIVESCHOOLSSCOLLECTION } from './utils-ced1e260.js';
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

const appUserDivingSchoolsCss = "app-user-diving-schools{}";

const AppUserDivingSchools = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.dsCollection = [];
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
        this.dsList$ = DivingSchoolsService.divingSchoolsList$.subscribe((collection) => {
            this.dsCollection = collection;
            this.filterMyCenters();
        });
    }
    disconnectedCallback() {
        this.userRoles$.unsubscribe();
        this.dsList$.unsubscribe();
    }
    filterMyCenters() {
        this.mySchools = [];
        if (this.dsCollection.length > 0 &&
            this.userRoles &&
            this.userRoles.editorOf) {
            Object.keys(this.userRoles.editorOf).forEach((key) => {
                if (this.userRoles.editorOf[key].collection == DIVESCHOOLSSCOLLECTION) {
                    let ds = this.dsCollection.find((ds) => ds.id == key);
                    this.mySchools.push(ds);
                }
            });
            this.mySchools = lodash.exports.orderBy(this.mySchools, "displayname");
        }
    }
    update(event, id) {
        event.stopPropagation();
        DivingSchoolsService.presentDivingSchoolUpdate(id);
    }
    render() {
        return (h(Host, { key: 'fa8709696f504fbdcc00a3a279eeffe62d794fb3' }, this.mySchools.map((dc) => (h("ion-item", { button: true, onClick: () => DivingSchoolsService.presentDivingSchoolDetails(dc.id), detail: true }, dc.photoURL ? (h("ion-avatar", { slot: "start" }, h("img", { src: dc.photoURL }))) : undefined, h("ion-label", null, dc.displayName), h("ion-button", { fill: "clear", "icon-only": true, slot: "end", onClick: (ev) => this.update(ev, dc.id) }, h("ion-icon", { name: "create", slot: "end" })))))));
    }
};
AppUserDivingSchools.style = appUserDivingSchoolsCss;

export { AppUserDivingSchools as app_user_diving_schools };

//# sourceMappingURL=app-user-diving-schools.entry.js.map