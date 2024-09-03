import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { U as UserService, y as UserRoles, i as DivingCentersService, c as DIVECENTERSSCOLLECTION } from './utils-cbf49763.js';
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

const appUserDivingCentersCss = "app-user-diving-centers{}";

const AppUserDivingCenters = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.dcCollection = [];
        this.userRoles = undefined;
        this.myCenters = [];
    }
    async componentWillLoad() {
        this.userRoles$ = UserService.userRoles$.subscribe(async (userRoles) => {
            if (userRoles && userRoles.uid) {
                this.userRoles = new UserRoles(userRoles);
                this.filterMyCenters();
            }
        });
        //load all dive sites
        this.dcList$ = DivingCentersService.divingCentersList$.subscribe((collection) => {
            this.dcCollection = collection;
            this.filterMyCenters();
        });
    }
    disconnectedCallback() {
        this.userRoles$.unsubscribe();
        this.dcList$.unsubscribe();
    }
    filterMyCenters() {
        this.myCenters = [];
        if (this.dcCollection.length > 0 &&
            this.userRoles &&
            this.userRoles.editorOf) {
            Object.keys(this.userRoles.editorOf).forEach((key) => {
                if (this.userRoles.editorOf[key].collection == DIVECENTERSSCOLLECTION) {
                    let dc = this.dcCollection.find((dc) => dc.id == key);
                    this.myCenters.push(dc);
                }
            });
            this.myCenters = lodash.exports.orderBy(this.myCenters, "displayname");
        }
    }
    update(event, id) {
        event.stopPropagation();
        DivingCentersService.presentDivingCenterUpdate(id);
    }
    render() {
        return (h(Host, { key: '32a6e1313240da81a51e99d108bba43ef51f935a' }, this.myCenters.map((dc) => (h("ion-item", { button: true, onClick: () => DivingCentersService.presentDivingCenterDetails(dc.id), detail: true }, dc.photoURL ? (h("ion-avatar", { slot: "start" }, h("img", { src: dc.photoURL }))) : undefined, h("ion-label", null, dc.displayName), h("ion-button", { fill: "clear", "icon-only": true, slot: "end", onClick: (ev) => this.update(ev, dc.id) }, h("ion-icon", { name: "create", slot: "end" })))))));
    }
};
AppUserDivingCenters.style = appUserDivingCentersCss;

export { AppUserDivingCenters as app_user_diving_centers };

//# sourceMappingURL=app-user-diving-centers.entry.js.map