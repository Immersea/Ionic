import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { U as UserService, y as UserRoles, d as DiveSitesService, e as DIVESITESCOLLECTION } from './utils-cbf49763.js';
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

const appUserDiveSitesCss = "app-user-dive-sites{}";

const AppUserDiveSites = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.sitesCollection = [];
        this.userRoles = undefined;
        this.mySites = [];
    }
    async componentWillLoad() {
        this.userRoles$ = UserService.userRoles$.subscribe(async (userRoles) => {
            if (userRoles && userRoles.uid) {
                this.userRoles = new UserRoles(userRoles);
                this.filterMySites();
            }
        });
        //load all dive sites
        this.diveSitesList$ = DiveSitesService.diveSitesList$.subscribe((collection) => {
            this.sitesCollection = collection;
            this.filterMySites();
        });
    }
    disconnectedCallback() {
        this.userRoles$.unsubscribe();
        this.diveSitesList$.unsubscribe();
    }
    filterMySites() {
        this.mySites = [];
        if (this.sitesCollection.length > 0 &&
            this.userRoles &&
            this.userRoles.editorOf) {
            Object.keys(this.userRoles.editorOf).forEach((key) => {
                if (this.userRoles.editorOf[key].collection == DIVESITESCOLLECTION) {
                    let site = this.sitesCollection.find((site) => site.id == key);
                    this.mySites.push(site);
                }
            });
            this.mySites = lodash.exports.orderBy(this.mySites, "displayname");
        }
    }
    update(event, id) {
        event.stopPropagation();
        DiveSitesService.presentDiveSiteUpdate(id);
    }
    render() {
        return (h(Host, { key: 'ceb8fdd1668bdb2f5a0d866fdb07465c29a88b1d' }, this.mySites.map((site) => (h("ion-item", { button: true, onClick: () => DiveSitesService.presentDiveSiteDetails(site.id), detail: true }, site.photoURL ? (h("ion-avatar", { slot: "start" }, h("img", { src: site.photoURL }))) : undefined, h("ion-label", null, site.displayName), h("ion-button", { fill: "clear", "icon-only": true, slot: "end", onClick: (ev) => this.update(ev, site.id) }, h("ion-icon", { name: "create", slot: "end" })))))));
    }
};
AppUserDiveSites.style = appUserDiveSitesCss;

export { AppUserDiveSites as app_user_dive_sites };

//# sourceMappingURL=app-user-dive-sites.entry.js.map