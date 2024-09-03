import { r as registerInstance, h } from './index-d515af00.js';
import { n as DivingSchoolsService, a9 as DiveTripsService, m as DIVESCHOOLSSCOLLECTION } from './utils-cbf49763.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
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
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';

const pageSchoolDiveTripsCss = "page-diving-school-dive-trips{}";

const PageSchoolDiveTrips = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.divingSchool = undefined;
        this.divingSchoolId = undefined;
    }
    componentWillLoad() {
        this.dsSubscription = DivingSchoolsService.selectedDivingSchool$.subscribe((dc) => {
            if (dc && dc.displayName) {
                this.divingSchool = dc;
                this.divingSchoolId = DivingSchoolsService.selectedDivingSchoolId;
            }
        });
    }
    disconnectedCallback() {
        this.dsSubscription.unsubscribe();
    }
    render() {
        return [
            h("app-navbar", { key: '7ee7092ed4fbd788ab0d11e7901f2eac8a7712a0', color: 'divetrip', tag: 'dive-trips', text: 'Dive trips' }),
            h("ion-content", { key: '205d2cb0139021e2519c4124ca8da2e1c3c3fe8d' }, h("ion-fab", { key: 'b8303ee809deb3fad3c56ebaaeab28c5773b10e2', horizontal: 'end', vertical: 'top', slot: 'fixed', edge: true }, h("ion-fab-button", { key: '36e4bf8b7273305f64e805d9597de0a4ecf27607', color: 'divetrip', onClick: () => DiveTripsService.presentDiveTripUpdate(DIVESCHOOLSSCOLLECTION, this.divingSchoolId) }, h("ion-icon", { key: '5242c82b5ffd915f882a3ae99accfb4ce37efc2f', name: 'add' }))), h("ion-list", { key: '044dd9233403924b626cb122fe6bd491e298a583' }, h("app-admin-dive-trips", { key: 'dbfc4e419db04a9e6af79fe76426681e8a6a2912', filterByOrganisierId: this.divingSchoolId }))),
        ];
    }
};
PageSchoolDiveTrips.style = pageSchoolDiveTripsCss;

export { PageSchoolDiveTrips as page_school_dive_trips };

//# sourceMappingURL=page-school-dive-trips.entry.js.map