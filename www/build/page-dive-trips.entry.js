import { r as registerInstance, h } from './index-d515af00.js';
import { a9 as DiveTripsService, b as USERPROFILECOLLECTION, U as UserService } from './utils-5cd4c7bb.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
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
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const pageDiveTripsCss = "page-dive-trips{}";

const PageDiveTrips = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    render() {
        return [
            h("app-navbar", { key: 'bcea9fbfd8222302d19544d71ded3dbe5ea84a0c', color: 'divetrip', tag: 'dive-trips', text: 'Dive trips' }),
            h("ion-content", { key: '9166e506a1f28b750b0f15deab19d0bf703cc185' }, h("ion-fab", { key: '109ae6194b4c4bb7aca6d709be5cf25369815d66', horizontal: 'end', vertical: 'top', slot: 'fixed', edge: true }, h("ion-fab-button", { key: 'b60c77ab2bec267ce9aabbed104b6478e8ed517b', color: 'divetrip', onClick: () => DiveTripsService.presentDiveTripUpdate(USERPROFILECOLLECTION, UserService.userRoles.uid) }, h("ion-icon", { key: '4cc419fd990a57e56bea80bf6d7e0c0998e4d84b', name: 'add' }))), h("ion-list", { key: '992af79ed7bdc6835f0b8de60ba6c0fec124fb4c' }, h("app-admin-dive-trips", { key: 'c09d281e36d9ad229e052d99acdd7cb88f192d9c' }))),
        ];
    }
};
PageDiveTrips.style = pageDiveTripsCss;

export { PageDiveTrips as page_dive_trips };

//# sourceMappingURL=page-dive-trips.entry.js.map