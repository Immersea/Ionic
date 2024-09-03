import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { i as DivingCentersService } from './utils-cbf49763.js';
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

const pageDivingDashboardCss = "page-diving-dashboard{}";

const PageDivingDashboard = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.divingCenter = undefined;
        this.diveTrips = undefined;
        this.dcId = undefined;
    }
    componentWillLoad() {
        this.dcSubscription = DivingCentersService.selectedDivingCenter$.subscribe(async (dc) => {
            if (dc && dc.displayName) {
                this.divingCenter = dc;
                this.dcId = DivingCentersService.selectedDivingCenterId;
            }
        });
        this.divingTripsSub =
            DivingCentersService.selectedDivingCenterTrips$.subscribe(async (trips) => {
                this.diveTrips = trips;
            });
    }
    async componentDidLoad() { }
    disconnectedCallback() {
        this.dcSubscription.unsubscribe();
        this.divingTripsSub.unsubscribe();
    }
    render() {
        return this.divingCenter
            ? [
                h("ion-header", null, h("app-navbar", { tag: "dashboard", text: "Dashboard", color: "divingcenter" })),
                h("ion-content", null, h("app-calendar", { calendarId: "diving-dashboard-calendar", addEvents: { trips: this.diveTrips } })),
            ]
            : undefined;
    }
    get el() { return getElement(this); }
};
PageDivingDashboard.style = pageDivingDashboardCss;

export { PageDivingDashboard as page_diving_dashboard };

//# sourceMappingURL=page-diving-dashboard.entry.js.map