import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { D as DatabaseService, q as USERPUBLICPROFILECOLLECTION } from './utils-ced1e260.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
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
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';

const popoverSearchUserCss = "popover-search-user{}popover-search-user ion-list{min-height:300px}";

const PopoverSearchUser = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.showList = [];
        this.searching = false;
        this.noResult = false;
    }
    componentWillLoad() {
        this.popover = this.el.closest("ion-popover");
    }
    async searchUsers(ev) {
        this.noResult = false;
        this.showList = [];
        this.searching = true;
        const query = ev.target.value.toLowerCase();
        const res = await DatabaseService.queryCollection(USERPUBLICPROFILECOLLECTION, ["email"], ["="], [query]);
        res.forEach((doc) => {
            this.showList.push(doc.data());
        });
        if (this.showList.length == 0) {
            this.noResult = true;
        }
        else {
            this.noResult = false;
        }
        this.searching = false;
    }
    addUser(user) {
        this.popover.dismiss(user.uid);
    }
    render() {
        return (h(Host, { key: '0358f965992e8a943218ad2463f6df6ba5c08540' }, h("ion-header", { key: '3b30a85d2c9038f2b221290e88695700b8772dae', translucent: true }, h("ion-toolbar", { key: '2e5df7cff36611b83a3e6332a608f95938acd99e' }, h("ion-title", { key: 'b5d165ef042583cf89e96296d79a019ca0a1744f' }, h("my-transl", { key: '56b94b4189f42fcbdddf1c86f349157d0e0465bb', tag: "search", text: "Search" }))), h("ion-toolbar", { key: 'c10738c790623b35775e828f779f276b25d1c8b2' }, h("ion-searchbar", { key: '87ad35c81440477df78ffca12483b7511edf9f01', onIonBlur: (ev) => this.searchUsers(ev), inputmode: "email", type: "email", placeholder: "email" }))), h("ion-content", { key: '31fd3e011c2e0ffd1ee4d446dd2fa67669a099dd' }, h("ion-list", { key: '5861cbe62d66b7d10f39681df0c8b8c36e269da5' }, this.showList.map((user) => (h("ion-item", { button: true, onClick: () => this.addUser(user) }, user.photoURL ? (h("ion-avatar", { slot: "start" }, h("ion-img", { src: user.photoURL }))) : undefined, h("ion-label", null, user.displayName)))), this.searching ? (h("app-skeletons", { skeleton: "chat" })) : undefined, this.noResult ? (h("ion-item", null, h("ion-label", null, "No Users found!"))) : undefined))));
    }
    get el() { return getElement(this); }
};
PopoverSearchUser.style = popoverSearchUserCss;

export { PopoverSearchUser as popover_search_user };

//# sourceMappingURL=popover-search-user.entry.js.map