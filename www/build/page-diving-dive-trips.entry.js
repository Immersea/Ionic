import { r as registerInstance, h } from './index-d515af00.js';
import { i as DivingCentersService, a9 as DiveTripsService, c as DIVECENTERSSCOLLECTION } from './utils-ced1e260.js';
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

const pageDivingDiveTripsCss = "page-diving-dive-trips{}";

const PageDivingDiveTrips = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.divingCenter = undefined;
        this.dcId = undefined;
    }
    componentWillLoad() {
        this.dcSubscription = DivingCentersService.selectedDivingCenter$.subscribe((dc) => {
            if (dc && dc.displayName) {
                this.divingCenter = dc;
                this.dcId = DivingCentersService.selectedDivingCenterId;
            }
        });
    }
    disconnectedCallback() {
        if (this.dcSubscription)
            this.dcSubscription.unsubscribe();
    }
    render() {
        return [
            h("app-navbar", { key: '3d04e59f4784d7c04c567da7ea60ac60ad22b56c', color: 'divetrip', tag: 'dive-trips', text: 'Dive trips' }),
            h("ion-content", { key: '299510e762530cd60e5945552e267214858e4dfc' }, h("ion-fab", { key: 'f34e8a6e460b664c9ac173200df6716debaed8d1', horizontal: 'end', vertical: 'top', slot: 'fixed', edge: true }, h("ion-fab-button", { key: 'ff0b459417e48a233b1d64e04b41522224294628', color: 'divetrip', onClick: () => DiveTripsService.presentDiveTripUpdate(DIVECENTERSSCOLLECTION, this.dcId) }, h("ion-icon", { key: 'bb2533df91d383deddaf1408daa9df2b238bb52a', name: 'add' }))), h("ion-list", { key: '27c582fa4050595d67d8d6533485c2ce461ad347' }, h("app-admin-dive-trips", { key: '7b7dbfa181baf5638a3bcaccf951b4dae5a39deb', filterByOrganisierId: this.dcId }))),
        ];
    }
};
PageDivingDiveTrips.style = pageDivingDiveTripsCss;

export { PageDivingDiveTrips as page_diving_dive_trips };

//# sourceMappingURL=page-diving-dive-trips.entry.js.map