import { r as registerInstance, h } from './index-d515af00.js';
import { i as DivingCentersService, aS as distance } from './utils-5cd4c7bb.js';
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

const appDivingCenterCardCss = "app-diving-center-card{width:100%;height:100%}";

const AppDivingCenterCard = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.divingCenterId = undefined;
        this.startlocation = undefined;
        this.divingCenter = undefined;
    }
    componentWillLoad() {
        this.divingCenter = DivingCentersService.divingCentersList.find((item) => item.id == this.divingCenterId);
    }
    render() {
        return (h("ion-card", { key: '626b17c5265780cc82d19878215b283fbcc12dc0', onClick: () => DivingCentersService.presentDivingCenterDetails(this.divingCenterId) }, h("app-item-cover", { key: '7c4923be845f5ca100887e0ceb8b65aaa9bc9f91', item: this.divingCenter }), h("ion-card-header", { key: 'a4a6df97c9c4d3516852fccddb0576de77079741' }, h("ion-item", { key: 'ae0eb8a2e006f666d3fd324e79738d5ec5849f9c', class: 'ion-no-padding', lines: 'none' }, h("ion-card-title", { key: 'bdb005c0f396fca24c14ce09e7c2664f200dcf15' }, this.divingCenter.displayName)), h("ion-card-content", { key: '740dfd23d2188e5a3bfc3d295e9e989af2e134f3' }, this.startlocation
            ? [
                h("my-transl", { tag: 'distance', text: 'Distance' }),
                ": " +
                    distance(this.startlocation.latitude, this.startlocation.longitude, this.divingCenter.position.geopoint.latitude, this.divingCenter.position.geopoint.longitude),
            ]
            : undefined))));
    }
};
AppDivingCenterCard.style = appDivingCenterCardCss;

export { AppDivingCenterCard as app_diving_center_card };

//# sourceMappingURL=app-diving-center-card.entry.js.map