import { r as registerInstance, h } from './index-d515af00.js';
import { p as DiveCommunitiesService, a9 as DiveTripsService, o as DIVECOMMUNITIESCOLLECTION } from './utils-ced1e260.js';
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

const pageCommunityDiveTripsCss = "page-community-dive-trips{}";

const PageCommunityDiveTrips = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.diveCommunity = undefined;
        this.dcId = undefined;
    }
    componentWillLoad() {
        this.dcSubscription =
            DiveCommunitiesService.selectedDiveCommunity$.subscribe((dc) => {
                if (dc && dc.displayName) {
                    this.diveCommunity = dc;
                    this.dcId = DiveCommunitiesService.selectedDiveCommunityId;
                }
            });
    }
    disconnectedCallback() {
        if (this.dcSubscription)
            this.dcSubscription.unsubscribe();
    }
    render() {
        return [
            h("app-navbar", { key: '0ebdada582cc7f409a72b8c44574b7e143cca3f9', color: 'divetrip', tag: 'dive-trips', text: 'Dive trips' }),
            h("ion-content", { key: 'd1bc94e4953550791037b13c2b16220050c12301' }, h("ion-fab", { key: 'f5471f1d5da05c00c5147ffb7fd06f5e77f42733', horizontal: 'end', vertical: 'top', slot: 'fixed', edge: true }, h("ion-fab-button", { key: 'f451569e8bfd93e7c58a164fd57bb573e5b247e7', color: 'divetrip', onClick: () => DiveTripsService.presentDiveTripUpdate(DIVECOMMUNITIESCOLLECTION, this.dcId) }, h("ion-icon", { key: 'c0d30ea2c4033414ddff40f044b4c66b2aeab022', name: 'add' }))), h("ion-list", { key: '17bb7af09590e3ff7e2375c9be4936237edf48c9' }, h("app-admin-dive-trips", { key: '136ad1aabb7a2b9aeafd0cd1d1d1fc3033467044', filterByOrganisierId: this.dcId }))),
        ];
    }
};
PageCommunityDiveTrips.style = pageCommunityDiveTripsCss;

export { PageCommunityDiveTrips as page_community_dive_trips };

//# sourceMappingURL=page-community-dive-trips.entry.js.map