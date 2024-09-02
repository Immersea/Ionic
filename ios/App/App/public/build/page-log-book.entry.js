import { r as registerInstance, h } from './index-d515af00.js';
import { E as Environment } from './env-0a7fccce.js';
import { aD as DivePlansService } from './utils-5cd4c7bb.js';
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

const pageLogBookCss = "page-log-book{}";

const PageLogBook = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    render() {
        return [
            h("app-navbar", { key: '865ed9ca0849e261dee6726f7603ef9c6473f9f0', color: Environment.isDecoplanner() ? "gue-blue" : "planner", tag: 'logbook', text: 'Logbook' }),
            h("ion-content", { key: 'fab02d90ae05d913c6718a08e9c90c84d142568b' }, h("ion-fab", { key: '004762c4be91d0d88846eebc1fb79b413f7f054e', horizontal: 'end', vertical: 'top', slot: 'fixed', edge: true }, h("ion-fab-button", { key: 'eda3cdd59b9cbb259031b45923bd6d92b2359e85', color: Environment.isDecoplanner() ? "gue-blue" : "planner", onClick: () => DivePlansService.createNewDivePlanWithConfiguration() }, h("ion-icon", { key: '0fd10d65bad2b63352588057d9681bb077889391', name: 'add' }))), h("app-user-dive-plans", { key: '3b823583447c0468fa34b1f5f7fb8f01b87904c0' })),
        ];
    }
};
PageLogBook.style = pageLogBookCss;

export { PageLogBook as page_log_book };

//# sourceMappingURL=page-log-book.entry.js.map