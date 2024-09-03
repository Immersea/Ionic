import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { aZ as FileSystemService } from './utils-ced1e260.js';
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

const appImageCacheCss = "app-image-cache{transform:inherit;}app-image-cache .cover-main{transform:inherit;position:relative;background-color:var(--ion-color-tint);background-position:center;background-repeat:no-repeat;box-shadow:0 4px 8px 0 rgba(0, 0, 0, 0.2)}app-image-cache .cover-contain{background-size:contain}app-image-cache .cover-fill{background-size:cover}app-image-cache .cover-dimensions{height:100%;width:100%;margin:\"auto\"}";

const AppImageCache = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.resetImageCache = false;
        this.url = undefined;
        this.backgroundCover = true;
        this.backgroundCoverFill = true;
        this._src = null;
    }
    async update() {
        if (this.url)
            this._src = (await FileSystemService.storeAndLoadImage(this.url)).src;
    }
    componentWillLoad() {
        this.update();
    }
    render() {
        return (h(Host, { key: 'b3576d78d256d73bf2c1487dd44dd7c980718753' }, this.backgroundCover ? (this._src ? (h("div", { class: "cover-main cover-dimensions " +
                (this.backgroundCoverFill ? "cover-fill" : "cover-contain"), style: { backgroundImage: "url(" + this._src + ")" } })) : (h("ion-skeleton-text", { class: 'cover-dimensions', animated: true }))) : this._src ? (h("img", { class: 'cover-main', src: this._src.toString() })) : (h("ion-skeleton-text", { animated: true, class: 'cover-dimensions' }))));
    }
    static get watchers() { return {
        "url": ["update"]
    }; }
};
AppImageCache.style = appImageCacheCss;

export { AppImageCache as app_image_cache };

//# sourceMappingURL=app-image-cache.entry.js.map