import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { T as TranslationService } from './utils-5cd4c7bb.js';
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

const appHeaderSegmentToolbarCss = "";

const AppHeaderSegmentToolbar = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.color = undefined;
        this.noHeader = false;
        this.noToolbar = false;
        this.segmentTitles = {};
        this.updateView = true;
        this.segment = 0;
        this.swiper = undefined;
        this.mode = "md";
        this.titles = undefined;
        this.updateBadge = true;
    }
    setSwiper() {
        if (this.swiper) {
            this.swiper.on("slideChange", (ev) => this.slideChanged(ev));
            this.swiper.slideTo(this.segment);
        }
    }
    update() {
        this.updateView = !this.updateView;
    }
    componentWillLoad() {
        this.titles.forEach((title) => {
            this.segmentTitles[title.tag] = TranslationService.getTransl(title.tag, title.text);
        });
    }
    async slideChanged(swiper) {
        this.updateSwiper();
        this.segment = swiper.activeIndex;
    }
    segmentChanged(ev) {
        if (ev.detail.value >= 0) {
            this.segment = ev.detail.value;
            if (this.swiper) {
                this.updateSwiper();
                this.swiper.slideTo(this.segment);
            }
        }
    }
    updateSwiper() {
        if (this.swiper) {
            this.swiper.update();
            this.swiper.updateAutoHeight();
            this.swiper.updateSize();
        }
    }
    renderToolbar() {
        const segment = (h("ion-segment", { mode: this.mode, color: this.color, scrollable: true, onIonChange: (ev) => this.segmentChanged(ev), value: this.segment }, this.titles.map((title, index) => (h("ion-segment-button", { value: index, disabled: title.disabled ? true : false, layout: title.slotIcon && title.slotIcon == "end"
                ? "icon-end"
                : "icon-start" }, h("ion-label", null, this.segmentTitles[title.tag]), title.icon ? h("ion-icon", { name: title.icon }) : undefined, title.badge > 0 ? (h("ion-badge", { color: this.color }, title.badge)) : undefined)))));
        return this.noToolbar ? (segment) : (h("ion-toolbar", { class: "no-safe-padding" }, segment));
    }
    render() {
        return (h(Host, { key: 'a6dd31e52f240f7f5b778268680a885901815f46' }, !this.noHeader && !this.noToolbar ? (h("ion-header", null, this.renderToolbar())) : (this.renderToolbar())));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "swiper": ["setSwiper"],
        "updateBadge": ["update"]
    }; }
};
AppHeaderSegmentToolbar.style = appHeaderSegmentToolbarCss;

export { AppHeaderSegmentToolbar as app_header_segment_toolbar };

//# sourceMappingURL=app-header-segment-toolbar.entry.js.map