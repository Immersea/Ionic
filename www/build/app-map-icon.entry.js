import { r as registerInstance, h } from './index-d515af00.js';
import { N as MapService } from './map-dae4acde.js';
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
import './lodash-68d560b6.js';

const appMapIconCss = "app-map-icon{text-align:center}app-map-icon .bkg{border-radius:10px;background-color:rgba(255, 255, 255, 0.3);padding:5px}app-map-icon .bkg p{padding:0;margin:0}";

const AppMapIcon = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.isAvatar = false;
        this.marker = undefined;
    }
    componentWillLoad() {
        this.isAvatar = this.marker.icon.type === "avatar";
    }
    markerClicked(marker) {
        MapService.markerClicked(marker);
    }
    render() {
        return (h("div", { key: 'a3b5754206482f44d1a486d1532d9ff8e462f91a', class: !this.isAvatar && this.marker.name ? "bkg" : undefined }, this.isAvatar ? (h("ion-chip", { color: this.marker.icon.color, onClick: () => this.markerClicked(this.marker) }, this.marker.icon.url ? (h("ion-avatar", null, h("img", { src: this.marker.icon.url }))) : undefined, h("ion-label", null, this.marker.name))) : ([
            h("ion-icon", { color: this.marker.icon.color, size: this.marker.icon.size, class: this.marker.icon.type == "mapicon"
                    ? "marker map-icon " + this.marker.icon.name
                    : this.marker.icon.type == "udiveicon"
                        ? "marker udive-icon " + this.marker.icon.name
                        : "marker", name: this.marker.icon.type == "ionicon"
                    ? this.marker.icon.name
                    : undefined }),
            this.marker.name ? (h("p", null, h("strong", null, h("ion-text", { style: {
                    color: "var(--" + this.marker.icon.color + "-contrast)",
                } }, this.marker.name)))) : undefined,
        ])));
    }
};
AppMapIcon.style = appMapIconCss;

export { AppMapIcon as app_map_icon };

//# sourceMappingURL=app-map-icon.entry.js.map