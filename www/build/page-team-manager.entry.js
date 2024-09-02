import { r as registerInstance, h } from './index-d515af00.js';
import { E as Environment } from './env-0a7fccce.js';
import { U as UserService } from './utils-5cd4c7bb.js';
import { T as TrasteelService } from './services-05a0dbfb.js';
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
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const pageTeamManagerCss = "page-team-manager{}";

const PageTeamManager = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.usersList = [];
        this.filteredUsersList = [];
        this.loading = true;
        this.updateView = true;
    }
    componentWillLoad() {
        this.usersListSub = UserService.userPublicProfilesList$.subscribe((userProfiles) => {
            this.usersList = userProfiles;
            this.filteredUsersList = this.usersList;
            this.loading = false;
            this.updateView = !this.updateView;
        });
    }
    disconnectedCallback() {
        this.usersListSub.unsubscribe();
    }
    render() {
        return [
            h("ion-header", { key: 'e6e5abdf50a8593f783acaf0648d3ac2f212bf7e' }, h("app-navbar", { key: 'ca21af39c2c92f6a0015f365b779064e8fb406b6', color: Environment.getAppColor(), tag: "teams-manager", text: "Teams Manager" }), h("app-search-toolbar", { key: '3febd972004c4e8b96347d177a32e07c0c86a7eb', searchTitle: "teamManager", list: this.usersList, orderFields: ["displayName", "email"], color: Environment.getAppColor(), placeholder: "Search by name or email", filterBy: ["displayName", "email"], onFilteredList: (ev) => (this.filteredUsersList = ev.detail) })),
            h("ion-content", { key: 'bf34f8151edf3c5a291db90102b29eb4da875798' }, h("ion-list", { key: '1ea9e651afd242159bb2b9461ba3f2f05e4e0e68' }, h("ion-item-divider", { key: 'b4a20fd28f30fd53ebbb609302f37883656161ae' }, "USERS"), h("app-infinite-scroll", { key: '119219f0c62ecfe7b02f6068b6d2a61afd99f2ba', list: this.filteredUsersList, loading: this.loading, showFields: ["displayName", "email"], showFieldsDivider: " - ", groupBy: [], icon: null, onItemClicked: (ev) => TrasteelService.setUserTeams(ev.detail) }))),
        ];
    }
};
PageTeamManager.style = pageTeamManagerCss;

export { PageTeamManager as page_team_manager };

//# sourceMappingURL=page-team-manager.entry.js.map