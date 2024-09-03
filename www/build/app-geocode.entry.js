import { r as registerInstance, l as createEvent, h, j as Host } from './index-d515af00.js';
import { L as LOCATIONIQ_GEOCODE } from './env-c3ad5e77.js';
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

const appGeocodeCss = "app-geocode{}";

const AppGeocode = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.locationsFound = createEvent(this, "locationsFound", 7);
        this.locationSelected = createEvent(this, "locationSelected", 7);
        this.resultFound = false;
        this.showNoResults = false;
        this.address = "";
        this.gotFocus = false;
        this.results = [];
    }
    startTimer() {
        this.resultFound = false;
        //wait for user to finish typing
        this.timer = 1500;
        this.countdown();
    }
    countdown() {
        const timer = setTimeout(() => {
            this.timer -= 1;
            if (this.timer == 0) {
                this.fetchGeocode();
            }
            else {
                clearTimeout(timer);
                this.countdown();
            }
        }, 1);
    }
    async fetchGeocode() {
        if (this.address && this.address.length > 10) {
            const req = "https://eu1.locationiq.com/v1/search.php?limit=10&addressdetails=1&key=" +
                LOCATIONIQ_GEOCODE +
                "&q=" +
                this.address.replace(" ", "+") +
                "&format=json&accept-language=en";
            fetch(req).then(async (response) => {
                if (response.ok) {
                    this.results = await response.json();
                    this.showNoResults = false;
                    this.locationsFound.emit(this.results);
                }
                else {
                    this.results = [];
                    this.showNoResults = true;
                    this.locationsFound.emit(false);
                }
            }, () => {
                this.results = [];
                this.showNoResults = true;
                this.locationsFound.emit(false);
            });
        }
    }
    selectLocation(loc) {
        this.results = [];
        this.address = loc.display_name;
        this.locationSelected.emit(loc);
        this.resultFound = true;
    }
    render() {
        return (h(Host, { key: 'ce1e45dfa11cc66e599327d1873900e6c2b8f688' }, !this.resultFound && this.gotFocus ? (h("ion-list", null, this.address &&
            this.address.length > 0 &&
            this.results.length == 0 &&
            !this.showNoResults ? (h("ion-item", { color: "light" }, h("ion-icon", { name: "navigate-circle-outline", slot: "start" }), h("ion-label", null, h("ion-skeleton-text", { animated: true, style: { width: "60%" } })))) : undefined, this.showNoResults ? (h("ion-item", { color: "danger" }, h("ion-icon", { name: "alert", slot: "start" }), h("ion-label", null, h("my-transl", { tag: "no-locations", text: "No locations found!" })))) : (this.results.map((loc) => (h("ion-item", { button: true, color: "dark", onClick: () => this.selectLocation(loc) }, h("ion-icon", { name: "navigate-circle-outline", slot: "start" }), h("ion-label", null, loc.display_name))))))) : undefined));
    }
    static get watchers() { return {
        "address": ["startTimer"]
    }; }
};
AppGeocode.style = appGeocodeCss;

export { AppGeocode as app_geocode };

//# sourceMappingURL=app-geocode.entry.js.map