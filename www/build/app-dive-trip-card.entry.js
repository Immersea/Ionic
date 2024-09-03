import { r as registerInstance, l as createEvent, h, k as getElement } from './index-d515af00.js';
import { U as UserService, d as DiveSitesService, i as DivingCentersService, aD as DivePlansService, T as TranslationService } from './utils-ced1e260.js';
import { d as dateFns } from './index-9b61a50b.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-c3ad5e77.js';
import './map-fe092362.js';
import './_commonjsHelpers-1a56c7bc.js';
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
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';

const appDiveTripCardCss = "app-dive-trip-card{width:100%;height:100%}";

const AppDiveTripCard = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.updateDiveEmit = createEvent(this, "updateDiveEmit", 7);
        this.addDiveEmit = createEvent(this, "addDiveEmit", 7);
        this.removeDiveTripEmit = createEvent(this, "removeDiveTripEmit", 7);
        this.removeTripDiveEmit = createEvent(this, "removeTripDiveEmit", 7);
        this.diveSites = [];
        this.divingCenters = [];
        this.tripDive = undefined;
        this.editable = false;
        this.updateView = false;
        this.segment = 0;
        this.loogBookButton = undefined;
    }
    update() {
        this.findDiveSites();
    }
    componentWillLoad() {
        this.findDiveSites();
        this.userSub = UserService.userProfile$.subscribe((user) => {
            this.userId = user && user.uid ? user.uid : null;
            this.activateLogbook();
        });
        this.userId =
            UserService.userProfile && UserService.userProfile.uid
                ? UserService.userProfile.uid
                : null;
        this.activateLogbook();
    }
    activateLogbook() {
        this.loogBookButton = false;
        this.tripDive.bookings.map((booking) => {
            if (booking.uid == this.userId) {
                this.loogBookButton = true;
            }
        });
    }
    findDiveSites() {
        this.diveSites = [];
        this.divingCenters = [];
        this.tripDive.divePlan.dives.forEach((dive) => {
            this.diveSites.push(DiveSitesService.diveSitesList.find((site) => site.id === dive.diveSiteId));
            this.divingCenters.push(DivingCentersService.divingCentersList.find((dc) => dc.id === dive.divingCenterId));
        });
    }
    updateDivePlan(ev, index) {
        ev.stopPropagation();
        this.updateDiveEmit.emit(index);
    }
    removeDiveTrip() {
        this.removeDiveTripEmit.emit();
    }
    addDivePlan() {
        this.addDiveEmit.emit();
    }
    removeDivePlan(ev, i) {
        ev.stopPropagation();
        this.segment = this.segment - 1;
        this.removeTripDiveEmit.emit(i);
    }
    segmentChanged(ev) {
        if (ev.detail.value) {
            this.segment = lodash.exports.toNumber(ev.detail.value);
        }
    }
    createDivePlan(plan) {
        if (plan.configuration) {
            DivePlansService.createNewDivePlan(plan);
        }
        else {
            //dummy plan
            DivePlansService.createNewDivePlanWithConfiguration(plan);
        }
    }
    render() {
        return (h("ion-card", { key: '509cfd9d3adfd304482cf0885b9a7b483e95acce' }, h("ion-card-header", { key: 'a9f3ee5bf3847022813ff2fbb07ece04ed69599d' }, h("ion-card-title", { key: 'ae9da0e78c20ccfa44612d81771dbaeda0267715' }, h("ion-item", { key: 'c7ff1a73f1ec7a4ce3845f6ecad0b632bb6b3c1a', class: "ion-no-padding", lines: "none" }, h("ion-label", { key: '26783fdf4ddab92706e1742dd6217b09bb2e2fa8' }, dateFns.format(this.tripDive.divePlan.dives[0].date, "PP")), this.editable
            ? [
                h("ion-button", { "icon-only": true, slot: "end", color: "danger", fill: "clear", onClick: () => this.removeDiveTrip() }, h("ion-icon", { name: "trash-bin-outline" })),
                h("ion-button", { "icon-only": true, slot: "end", color: "divetrip", fill: "clear", onClick: () => this.addDivePlan() }, h("ion-icon", { name: "add-circle" })),
            ]
            : undefined)), h("ion-card-subtitle", { key: '0c74d4c337384fdea3d13704f8a0c94a16dd5dac' }, this.tripDive.divePlan.title +
            " -> " +
            TranslationService.getTransl("max-participants", "Max xxx participants", { xxx: this.tripDive.numberOfParticipants }))), h("ion-card-content", { key: '2ee2dce41e2da436210a154e74ae62ee1aa1f110' }, this.tripDive.divePlan.dives.length > 1 ? (h("ion-toolbar", null, h("ion-segment", { mode: "md", color: Environment.getAppColor(), onIonChange: (ev) => this.segmentChanged(ev), value: this.segment.toString() }, Object.keys(this.tripDive.divePlan.dives).map((i) => (h("ion-segment-button", { value: i }, h("ion-label", null, h("my-transl", { tag: "dive", text: "Dive" }), " " +
            (lodash.exports.toNumber(i) + 1) +
            ": " +
            dateFns.format(this.tripDive.divePlan.dives[i].date, "p")))))))) : undefined, h("ion-card", { key: '85475f307ad0a06d1904356d179fc2bd65bf867f' }, this.diveSites[this.segment] ? (h("app-item-cover", { item: this.diveSites[this.segment] })) : undefined, h("ion-card-header", { key: '9b33374ba1b47c2b633c169ef487016018d3bd49' }, h("ion-card-subtitle", { key: '76f3497f104fa9e3003c1dca018039f15f6782e0' }, this.diveSites[this.segment] ? (h("h2", null, this.diveSites[this.segment].displayName)) : undefined, this.divingCenters[this.segment] ? (h("h3", null, this.divingCenters[this.segment].displayName)) : undefined), h("ion-card-title", { key: '97b9c939295c100b82d737a4efeefdd75705291b' }, h("ion-item", { key: 'bb07b83805980a68dcfd6476baff36c2e011594f', class: "ion-no-padding", lines: "none" }, h("ion-label", { key: '6e00dceef8e507a112f908fb2c621b7948cef9c9' }, dateFns.format(this.tripDive.divePlan.dives[this.segment].date, "p")), this.editable
            ? [
                this.segment > 0 ? (h("ion-button", { "icon-only": true, slot: "end", color: "danger", fill: "clear", onClick: (ev) => this.removeDivePlan(ev, this.segment) }, h("ion-icon", { name: "trash-bin-outline" }))) : undefined,
                h("ion-button", { "icon-only": true, slot: "end", color: "primary", fill: "clear", onClick: (ev) => this.updateDivePlan(ev, this.segment) }, h("ion-icon", { name: "create" })),
            ]
            : undefined))), this.tripDive.divePlan.configuration ? (h("ion-card-content", null, this.tripDive.divePlan.dives[this.segment]
            .getProfilePointsDetails()
            .map((detail) => (h("p", { class: "ion-text-start" }, detail))))) : undefined)), !this.editable && this.loogBookButton ? (h("ion-button", { expand: "full", color: "secondary", onClick: () => this.createDivePlan(this.tripDive.divePlan) }, this.tripDive.divePlan.dives.length == 1 ? (h("my-transl", { tag: "log-dive", text: "Log Dive" })) : (h("my-transl", { tag: "log-dives", text: "Log Dives" })))) : undefined));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "updateView": ["update"]
    }; }
};
AppDiveTripCard.style = appDiveTripCardCss;

export { AppDiveTripCard as app_dive_trip_card };

//# sourceMappingURL=app-dive-trip-card.entry.js.map