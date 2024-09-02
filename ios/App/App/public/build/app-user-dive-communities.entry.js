import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { U as UserService, y as UserRoles, p as DiveCommunitiesService, o as DIVECOMMUNITIESCOLLECTION } from './utils-5cd4c7bb.js';
import { l as lodash } from './lodash-68d560b6.js';
import './env-0a7fccce.js';
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
import './map-e64442d7.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const appUserDiveCommunitiesCss = "app-user-dive-communities{}";

const AppUserDiveCommunities = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.dcCollection = [];
        this.userRoles = undefined;
        this.myCommunities = [];
    }
    async componentWillLoad() {
        this.userRoles$ = UserService.userRoles$.subscribe(async (userRoles) => {
            if (userRoles && userRoles.uid) {
                this.userRoles = new UserRoles(userRoles);
                this.filterMyCenters();
            }
        });
        //load all dive sites
        this.dcList$ = DiveCommunitiesService.diveCommunitiesList$.subscribe((collection) => {
            this.dcCollection = collection;
            this.filterMyCenters();
        });
    }
    disconnectedCallback() {
        this.userRoles$.unsubscribe();
        this.dcList$.unsubscribe();
    }
    filterMyCenters() {
        this.myCommunities = [];
        if (this.dcCollection.length > 0 &&
            this.userRoles &&
            this.userRoles.editorOf) {
            Object.keys(this.userRoles.editorOf).forEach((key) => {
                if (this.userRoles.editorOf[key].collection == DIVECOMMUNITIESCOLLECTION) {
                    let dc = this.dcCollection.find((dc) => dc.id == key);
                    this.myCommunities.push(dc);
                }
            });
            this.myCommunities = lodash.exports.orderBy(this.myCommunities, "displayname");
        }
    }
    update(event, id) {
        event.stopPropagation();
        DiveCommunitiesService.presentDiveCommunityUpdate(id);
    }
    render() {
        return (h(Host, { key: '52feed5dbf1b71f165eabcca2f9ed7c8e0968a2e' }, this.myCommunities.map((dc) => (h("ion-item", { button: true, onClick: () => DiveCommunitiesService.presentDiveCommunityDetails(dc.id), detail: true }, dc.photoURL ? (h("ion-avatar", { slot: "start" }, h("img", { src: dc.photoURL }))) : undefined, h("ion-label", null, dc.displayName), h("ion-button", { fill: "clear", "icon-only": true, slot: "end", onClick: (ev) => this.update(ev, dc.id) }, h("ion-icon", { name: "create", slot: "end" })))))));
    }
};
AppUserDiveCommunities.style = appUserDiveCommunitiesCss;

export { AppUserDiveCommunities as app_user_dive_communities };

//# sourceMappingURL=app-user-dive-communities.entry.js.map