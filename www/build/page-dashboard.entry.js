import { r as registerInstance, h } from './index-d515af00.js';
import { U as UserService } from './utils-cbf49763.js';
import { E as Environment } from './env-9be68260.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-dae4acde.js';
import './index-9b61a50b.js';
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
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';

const pageDashboardCss = "page-dashboard .full-row{min-height:400px;margin-bottom:10px}page-dashboard .half-row{min-height:200px}page-dashboard .col-border{border-radius:10px;-moz-border-radius:10px;-webkit-mask-border-radius:10px;-webkit-border-radius:10px;border:1px solid var(--ion-color-medium)}";

const PageDashboard = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.diveTrips = undefined;
        this.divingClasses = undefined;
        this.divePlans = undefined;
    }
    componentWillLoad() {
        this.divingTripsSub = UserService.userDiveTrips$.subscribe(async (trips) => {
            this.diveTrips = trips;
        });
        this.divingClassesSub = UserService.userDivingClasses$.subscribe(async (classes) => {
            this.divingClasses = classes;
        });
        this.divePlansSub = UserService.userDivePlans$.subscribe(async (plans) => {
            this.divePlans = plans;
        });
    }
    disconnectedCallback() {
        this.divingTripsSub.unsubscribe();
        this.divingClassesSub.unsubscribe();
        this.divePlansSub.unsubscribe();
    }
    render() {
        return [
            h("app-navbar", { key: '0b9e811b91805f00504bd8ad6027e1098b360862', color: Environment.getAppColor(), tag: "dashboard", text: "Dashboard" }),
            h("ion-content", { key: '9240eb96a5169c820fb7168c6d773ea242ce2ee0' }, h("ion-grid", { key: 'abfafb94b3ddc11d2172be22efbf14a208f25305' }, h("ion-row", { key: '450b3c06dae39444b2c756413f556dbfbd1c092f', class: "full-row" }, h("ion-col", { key: '41fe0f4ff6a15996913ad81bf0533099ca7e990d' }, h("app-calendar", { key: '2d5f8ad9d4e39e600f1e6e82825129842fc8f6bf', calendarId: "user-dashboard-calendar", addEvents: {
                    trips: this.diveTrips,
                    classes: this.divingClasses,
                    dives: this.divePlans,
                } }))), h("ion-row", { key: 'dda0434355662941662b0b3f570c3bd655783c6a', class: "full-row" }, h("ion-col", { key: '0aa1265b21c08ad26eb99f11ae3c533e756cd4ee', class: "col-border" }, h("ion-row", { key: 'be3c102f28fc94b99472f40b90eb84406132d0ab', class: "half-row" }, h("ion-col", { key: '3b18cf0186c0a17022c5b5fab2622ca39ebf12c0' }, h("ion-list", { key: 'e0f972c5932aea9f24d806150767bb31439424a4' }, h("ion-list-header", { key: 'c701d8c138856c7d622e1a59a76d7db165e59ad4' }, h("my-transl", { key: 'a9a2a21df5683d9c36f37a24eb4f36d26705e4a6', tag: "my-dive-sites", text: "My Dive Sites", isLabel: true })), h("app-user-dive-sites", { key: '7c3f6c52d74ca181800d3ca15b0025c99a3b4eaf' }))))), h("ion-col", { key: 'a2a49255bf02354a4670bf5f30e6e97c649a8555', class: "col-border" }, h("ion-row", { key: 'f39ddd972b521dc8a639448eecd17f3e83c00ed1', class: "half-row" }, h("ion-col", { key: '448efef341d6ef8a9cbff78f31d941041759bf40' }, h("ion-list", { key: 'd4f5af875cf2d66c7eedcef6a6781d744cc96c07' }, h("ion-list-header", { key: '3b6c295a9d49e381613940de5b4d352a011a213b' }, h("my-transl", { key: '7ae365f4d715962863ea59bf6e34e488b068002c', tag: "my-diving-centers", text: "My Diving Centers", isLabel: true })), h("app-user-diving-centers", { key: 'd46478e18b88c3f004279849c6c93a30c527bd26' })))), h("ion-row", { key: 'f2933432771c194ecc9ba791410d41de4eb48016', class: "half-row" }, h("ion-col", { key: '8432ef35a0b94746ee82ee5a8e577c73cb505d54' }, h("ion-list", { key: '66bcb084b4e1a25c76510e5d2917af309acce032' }, h("ion-list-header", { key: 'fa2ce05759b59d0e47686df4ed4cba5bbb0ade1d' }, h("my-transl", { key: '446b20e6c27b95a8b412f540565706f7ba2f6a07', tag: "my-dive-communities", text: "My Dive Communities", isLabel: true })), h("app-user-dive-communities", { key: 'd59dcc4a0904c9e60e814b8d4b8a7a04e6a7ea88' })))), h("ion-row", { key: 'c58cd165b2ed6144c76464d21d10deced797395d', class: "half-row" }, h("ion-col", { key: '973ea1ca3d38ec66b631dec9f6120e6eb52c7c8c' }, h("ion-list", { key: '827ef4fa55f218783a9fd8584cda9664f6507435' }, h("ion-list-header", { key: '64224c896531f50668230ebc18da41f67cfe0f54' }, h("my-transl", { key: 'e8f58db8fcf7babb7c44cb5930edfdf647fd4609', tag: "my-diving-schools", text: "My Diving Schools", isLabel: true })), h("app-user-diving-schools", { key: '1acf7f3a95e67dc5942a3ba232140ad488486e80' })))), h("ion-row", { key: '6ab45801a4bc51f3c3c7c2927743fb2bf96336d6', class: "half-row" }, h("ion-col", { key: 'bb2e5d536393276b563204e8f9ed432fe908918f' }, h("ion-list", { key: '45dff173e197c37e47f884804d9a09af903ca831' }, h("ion-list-header", { key: '6b74fa2cf1ea8a8a3d1c5a76877e7947577362e4' }, h("my-transl", { key: 'e65dd0961eb87ab84a32b7f7d2262cdb930b439d', tag: "my-service-centers", text: "My Service Centers", isLabel: true })), h("app-user-service-centers", { key: '707aded361234b80f64e172efac4d03a0211942d' })))))))),
        ];
    }
};
PageDashboard.style = pageDashboardCss;

export { PageDashboard as page_dashboard };

//# sourceMappingURL=page-dashboard.entry.js.map