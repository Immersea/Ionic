import { r as registerInstance, l as createEvent, h } from './index-d515af00.js';
import { d as DiveSitesService, aS as distance } from './utils-5cd4c7bb.js';
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

const appDiveSiteCardCss = "app-dive-site-card{width:100%;height:100%}";

const AppDiveSiteCard = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.removeEmit = createEvent(this, "removeEmit", 7);
        this.diveSite = undefined;
        this.startlocation = undefined;
        this.edit = false;
    }
    removeDiveSite(ev) {
        ev.stopPropagation();
        this.removeEmit.emit(this.diveSite.id);
    }
    render() {
        return (h("ion-card", { key: '0c328286351ec24d500c3d062b7863da2ce55015', onClick: () => !this.edit
                ? DiveSitesService.presentDiveSiteDetails(this.diveSite.id)
                : null }, h("app-item-cover", { key: '3b138bd48ec9b13c7d600b9e32e8fd4821077159', item: this.diveSite }), h("ion-card-header", { key: 'b24fa5c6bf982879781daa8023f154c0580706db' }, h("ion-item", { key: '6d52e3a4f30bb0c07f99bb9fe35bca2c60d6bee2', class: 'ion-no-padding', lines: 'none' }, this.edit ? (h("ion-button", { "icon-only": true, slot: 'end', color: 'danger', fill: 'clear', onClick: (ev) => this.removeDiveSite(ev) }, h("ion-icon", { name: 'trash-bin-outline' }))) : undefined, h("ion-card-title", { key: 'b94e36aa23538a130b2c1ab9a2b8fe67de9b1480' }, this.diveSite.displayName)), h("ion-card-subtitle", { key: '8355df4db98f1595d47072c35ed79ec20867f077' }, DiveSitesService.getSiteTypeName(this.diveSite.type)), h("ion-card-content", { key: 'f2bfa9523ce44440d700c87d874911a38c49d629' }, this.startlocation
            ? [
                h("my-transl", { tag: 'distance', text: 'Distance' }),
                ": " +
                    distance(this.startlocation.latitude, this.startlocation.longitude, this.diveSite.position.geopoint.latitude, this.diveSite.position.geopoint.longitude),
            ]
            : undefined))));
    }
};
AppDiveSiteCard.style = appDiveSiteCardCss;

export { AppDiveSiteCard as app_dive_site_card };

//# sourceMappingURL=app-dive-site-card.entry.js.map