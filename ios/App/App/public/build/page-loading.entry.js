import { r as registerInstance, h } from './index-d515af00.js';
import { E as Environment } from './env-0a7fccce.js';
import { B as SystemService } from './utils-5cd4c7bb.js';
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

const pageLoadingCss = "page-loading{}page-loading .loading-svg{width:200px;height:200px;position:absolute;top:50%;left:50%;margin-left:-100px;margin-top:-120px;}page-loading .loading-spinner{width:50px;height:50px;position:absolute;top:50%;left:50%;margin-top:100px;margin-left:-25px;}page-loading .loading-title{height:20px;width:100%;color:var(--ion-text-color);position:absolute;top:50%;margin-top:-190px}page-loading .loading-subtitle{height:20px;width:100%;color:var(--ion-text-color);position:absolute;top:50%;margin-top:-160px}page-loading .loading-logo{position:absolute;top:35%;left:40%}page-loading .loading-alert{height:20px;width:100%;color:var(--ion-text-color);position:absolute;top:80%;margin-top:-190px}page-loading .loading-alert1{height:20px;width:100%;color:var(--ion-text-color);position:absolute;top:85%;margin-top:-190px}";

const PageLoading = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.newUserRegistration = false;
        this.checkingEmail = false;
        this.network = undefined;
    }
    componentWillLoad() {
        SystemService.getNetworkStatus().then((networkObservable) => {
            const obs = networkObservable.subscribe((status) => {
                this.network = status;
                setTimeout(() => {
                    if (status)
                        obs.unsubscribe();
                });
            });
        });
    }
    render() {
        return [
            h("div", { key: 'a5a317a0b27039f11588e6af890398f93e95fd7a' }, false //old logo
                ? [
                    h("div", { class: "loading-logo", style: {
                            visibility: "visible",
                        } }, h("h1", null, Environment.getAppTitle())),
                    h("img", { src: "./assets/css/loader.svg", class: "loading-svg", alt: "Loading...", style: { visibility: "visible" } }),
                ]
                : undefined, h("ion-title", { key: 'ad82af4eb940d116a32785e117c8d450cfe918f2', class: "loading-title ion-text-center", size: "large" }, Environment.getAppTitle()), h("ion-title", { key: '887233850c20ff48cd9110b729c967da0d82cadf', class: "loading-subtitle ion-text-center", size: "small" }, Environment.getAppSubTitle()), h("img", { key: '6435118f828700b1166974336c01d357ede5e932', src: "./assets/images/" + Environment.getAppLogo(), class: "loading-svg", alt: "Loading...", style: { visibility: "visible" } }), this.network ? (h("ion-spinner", { class: "loading-spinner", name: "crescent" })) : ([
                h("ion-title", { class: "loading-alert ion-text-center", size: "large" }, "NETWORK NOT AVAILABLE"),
                h("ion-title", { class: "loading-alert1 ion-text-center", size: "large" }, "PLEASE TRY AGAIN LATER"),
            ])),
        ];
    }
};
PageLoading.style = pageLoadingCss;

export { PageLoading as page_loading };

//# sourceMappingURL=page-loading.entry.js.map