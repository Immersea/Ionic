import { r as registerInstance, h } from './index-d515af00.js';
import { E as Environment } from './env-0a7fccce.js';
import { U as UserService } from './utils-5cd4c7bb.js';
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

const pageUserManagerCss = "page-user-manager{}";

const PageUserManager = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.usersList = [];
        this.filteredUsersList = [];
        this.loading = true;
    }
    componentWillLoad() {
        this.usersListSub = UserService.userPublicProfilesList$.subscribe((userProfiles) => {
            this.usersList = userProfiles;
            this.filteredUsersList = this.usersList;
            console.log("filteredUsersList", this.filteredUsersList);
            this.loading = false;
        });
    }
    disconnectedCallback() {
        this.usersListSub.unsubscribe();
    }
    render() {
        return [
            h("ion-header", { key: '141e88b847b2bd9eeb4b54773c78c3daa3c3b8d3' }, h("app-navbar", { key: 'ef3a76ce14711dc75d2425fc46c488abcb1d0775', color: Environment.getAppColor(), tag: "user-manager", text: "User Manager" }), h("app-search-toolbar", { key: '70500b345d89fef456faa4be7a518e28408d849e', searchTitle: "userManager", list: this.usersList, orderFields: ["displayName", "email"], color: Environment.getAppColor(), placeholder: "Search by name or email", filterBy: ["displayName", "email"], onFilteredList: (ev) => (this.filteredUsersList = ev.detail) })),
            h("ion-content", { key: 'cc0ddd4a3ca3f8cdb1d77f141435af49dc8089e9' }, h("ion-list", { key: '48198efd72fbf1737aaeb2cec611eb9a8ee77ed4' }, h("ion-item-divider", { key: '49c915aa95311d16faa05f66e72862e6f63f7770' }, "ACTIONS"), h("ion-item", { key: 'd699bada0fc5102119eee5a94f52dd8b3a77f97c', button: true, onClick: () => UserService.checkUsersMapData() }, h("ion-label", { key: 'a5326791cdfa4b81e1e1b35801525303f2b78e0a' }, "Check User Profiles MapData")), h("ion-item-divider", { key: '8c060bf01bc1d5e63a8b90d72277ee48ea1a0a10' }, "USERS"), h("app-infinite-scroll", { key: '24afd9353fe094725d6ca866f0294a841cda248a', list: this.filteredUsersList, loading: this.loading, showFields: ["displayName", "email"], showFieldsDivider: " - ", returnField: "id", groupBy: [], icon: null, onItemClicked: (ev) => UserService.editUserRoles(ev.detail) }))),
        ];
    }
};
PageUserManager.style = pageUserManagerCss;

export { PageUserManager as page_user_manager };

//# sourceMappingURL=page-user-manager.entry.js.map