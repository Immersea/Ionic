import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { a as isPlatform } from './ionic-global-c07767bf.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
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

const appStickySearchCss = "app-sticky-search{z-index:10;position:relative}app-sticky-search ion-searchbar{opacity:1}app-sticky-search ion-row{--background:white;width:100%;margin-top:-10000px;position:fixed;padding-left:10px;padding-right:10px;opacity:0.9}app-sticky-search .searchbar{--background:#fff;--icon-color:var(--ion-color-immersea)}app-sticky-search .padding-ios{padding-left:calc(50px + var(--ion-safe-area-left, 0px));padding-right:0px;transition:0.5s}app-sticky-search .padding-web{padding-left:0px;padding-right:calc(40px + var(--ion-safe-area-right, 0px));transition:0.5s}app-sticky-search .searchbar-div{padding-left:20px;padding-right:20px;padding-top:calc(8px + var(--ion-safe-area-top, 0px));z-index:3;position:sticky;top:0px}app-sticky-search .searchbar-circle{border-style:solid;border-width:1px;border-radius:50px;border-color:var(--ion-color-immersea);--box-shadow:0px 0px;transition:0.5s}app-sticky-search .searchbar-nocircle{--border-radius:5px;transition:0.5s}";

const AppStickySearch = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.top = 100;
        this.scrollTopValue = 0;
        this.placeholderValue = undefined;
    }
    isOutsideView() {
        let rect = this.el.getBoundingClientRect();
        this.top = rect.top;
    }
    render() {
        return (h(Host, { key: 'e3b1d3d540f095b7a1c1a3ea225bc2b5aab44851' }, h("div", { key: '5d5d847198bd266dd95042c040317384b0a9c1a5', class: "searchbar-div" }, h("ion-searchbar", { key: 'ec8f9e3f2ce11241e3b7bcda30bca9d0b9ed511c', class: "searchbar " +
                (this.top < 10
                    ? "searchbar-nocircle" +
                        (isPlatform("ios") ? " padding-ios" : " padding-web")
                    : "searchbar-circle"), placeholder: this.placeholderValue }))));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "scrollTopValue": ["isOutsideView"]
    }; }
};
AppStickySearch.style = appStickySearchCss;

export { AppStickySearch as app_sticky_search };

//# sourceMappingURL=app-sticky-search.entry.js.map