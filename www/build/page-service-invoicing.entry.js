import { r as registerInstance, h } from './index-d515af00.js';
import { l as ServiceCentersService } from './utils-ced1e260.js';
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

const pageServiceInvoicingCss = "page-service-invoicing{}";

const PageServiceInvoicing = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.serviceCenter = undefined;
    }
    componentWillLoad() {
        this.scSubscription =
            ServiceCentersService.selectedServiceCenter$.subscribe((sc) => {
                if (sc && sc.displayName) {
                    this.serviceCenter = sc;
                    this.scId = ServiceCentersService.selectedServiceCenterId;
                }
            });
    }
    disconnectedCallback() {
        if (this.scSubscription)
            this.scSubscription.unsubscribe();
    }
    render() {
        return this.serviceCenter
            ? [
                h("ion-header", null, h("app-navbar", { tag: 'invoicing', text: 'Invoicing', color: 'documents' })),
                h("ion-content", null, "Coming soon!"),
            ]
            : undefined;
    }
};
PageServiceInvoicing.style = pageServiceInvoicingCss;

export { PageServiceInvoicing as page_service_invoicing };

//# sourceMappingURL=page-service-invoicing.entry.js.map