import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { T as TranslationService, a9 as DiveTripsService, aa as DiveTrip, U as UserService } from './utils-ced1e260.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { m as modalController } from './overlays-b3ceb97d.js';
import './env-c3ad5e77.js';
import './ionic-global-c07767bf.js';
import './map-fe092362.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
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
import './framework-delegate-779ab78c.js';

const modalDiveTripUpdateCss = "modal-dive-trip-update ion-list{width:100%}modal-dive-trip-update ion-segment-button{--color-checked:var(--ion-color-divetrip-contrast)}";

const ModalDiveTripUpdate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.diveTripId = undefined;
        this.collectionId = undefined;
        this.organiserId = undefined;
        this.diveTrip = undefined;
        this.updateView = true;
        this.validTrip = false;
        this.titles = [{ tag: "dives" }, { tag: "team" }, { tag: "bookings" }];
        this.slider = undefined;
    }
    async componentWillLoad() {
        await this.loadDiveTrip();
        this.placeholder = TranslationService.getTransl("insert-title", "Insert title");
    }
    async loadDiveTrip() {
        if (this.diveTripId) {
            this.diveTrip = await DiveTripsService.getDiveTrip(this.diveTripId);
        }
        else {
            this.diveTrip = new DiveTrip();
            this.diveTrip.organiser = {
                collectionId: this.collectionId,
                id: this.organiserId,
            };
            this.diveTrip.users = {
                [UserService.userRoles.uid]: ["owner"],
            };
        }
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-dive-trip", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
            on: {
                slideChange: () => {
                    this.slider ? this.slider.updateAutoHeight() : null;
                },
            },
        });
        this.validateTrip();
    }
    async addDiveTrip(tripIndex, diveIndex) {
        this.diveTrip = await DiveTripsService.addDiveTrip(this.diveTrip, tripIndex, diveIndex);
        this.validateTrip();
    }
    removeDiveTrip(index) {
        this.diveTrip = DiveTripsService.removeDiveTrip(this.diveTrip, index);
        this.validateTrip();
    }
    removeTripDive(tripIndex, diveIndex) {
        this.diveTrip = DiveTripsService.removeTripDive(this.diveTrip, tripIndex, diveIndex);
        this.updateView = !this.updateView;
    }
    setTitle(ev) {
        this.diveTrip.displayName = ev.target.value;
        this.validateTrip();
    }
    validateTrip() {
        this.diveTrip.tripDives = lodash.exports.orderBy(this.diveTrip.tripDives, "divePlan.dives[0].date");
        this.validTrip =
            lodash.exports.isString(this.diveTrip.displayName) &&
                this.diveTrip.displayName.length > 3 &&
                this.diveTrip.tripDives.length > 0;
        this.updateView = !this.updateView;
    }
    async save() {
        await DiveTripsService.updateDiveTrip(this.diveTripId, this.diveTrip);
        return modalController.dismiss(false);
    }
    async cancel() {
        return modalController.dismiss(true);
    }
    render() {
        return (h(Host, { key: '887190467636ed4eadce843b842d7294babd086c' }, h("ion-header", { key: '49baac88ee3118c0f961f02b2c6967dab37861f7' }, h("ion-toolbar", { key: '123fc6d901cb4c92bc03598a3c50a34ac66e080e', color: "divetrip" }, h("ion-title", { key: '9f4b159fd4a62c95348a750c6fb4df3f25d96882' }, h("ion-input", { key: '26069cedd5e437752df87d65f406266472a0dc44', placeholder: this.placeholder + "...", inputmode: "text", onIonInput: (ev) => this.setTitle(ev), value: this.diveTrip.displayName })))), h("app-header-segment-toolbar", { key: '29c5cf55c5770734adac22d70550c182322b42a0', color: "divetrip", swiper: this.slider, titles: this.titles }), h("ion-content", { key: 'c478b28234ccc25762da7d8a45f135626717be9d', class: "slides" }, h("swiper-container", { key: '769ca18f444a7c8b8367119527ed877043bcc083', class: "slider-dive-trip swiper" }, h("swiper-wrapper", { key: '89f8dc52282a151aaad02b7e4359e83846bc4afd', class: "swiper-wrapper" }, h("swiper-slide", { key: '48e0b2eb428cc2cda49e977b2acb296082feb802', class: "swiper-slide" }, h("ion-grid", { key: '7fab2de24a7204846681ebd894f7ad448f56fda4' }, h("ion-row", { key: '4ae22004e888629c4d566fe319e4bff26e77bb6e', class: "ion-text-start" }, this.diveTrip.tripDives.map((trip, i) => (h("ion-col", { "size-sm": "12", "size-md": "6", "size-lg": "4" }, h("app-dive-trip-card", { tripDive: trip, editable: true, updateView: this.updateView, onAddDiveEmit: () => this.addDiveTrip(i), onRemoveDiveTripEmit: () => this.removeDiveTrip(i), onRemoveTripDiveEmit: (ev) => this.removeTripDive(i, lodash.exports.toNumber(ev.detail)), onUpdateDiveEmit: (ev) => this.addDiveTrip(i, lodash.exports.toNumber(ev.detail)) })))), h("ion-col", { key: '4a504260067b6a23ddbba74fc6989f377c946c8c', "size-sm": "12", "size-md": "6", "size-lg": "4" }, h("ion-card", { key: '1510abb33d2f9f2eef0a5b3f5ed519d682cf339d', onClick: () => this.addDiveTrip() }, h("ion-card-content", { key: '617630204022ec826d62038e9b3d013d08f90b74', class: "ion-text-center" }, h("ion-icon", { key: 'b9e2b3033333b8e6a87e9c0cb345ceab1ad8b9f3', name: "add-circle-outline", style: { fontSize: "130px" } }))))))), h("swiper-slide", { key: 'a54575e2619d6942fbff9bdbd808494fc67c5a0a', class: "swiper-slide" }, h("app-users-list", { key: '75888d14f0f12a604d5985f6a71d7d4ed283b6cd', item: this.diveTrip, editable: true, show: ["owner", "divemaster", "instructor"] })), h("swiper-slide", { key: '41130382563a24fad6652080d42edf0fe490c8ea', class: "swiper-slide" }, h("ion-grid", { key: '997cbdb08d3080593a448d166d794e07587f2903' }, h("ion-row", { key: 'd33ca997cd7d43ec9257da0ff6f7d82382cf0997' }, Object.keys(this.diveTrip.tripDives).map((i) => (h("ion-col", { "size-sm": "12", "size-md": "12", "size-lg": "12" }, h("app-dive-trip-bookings", { diveTrip: this.diveTrip, diveTripId: this.diveTripId, tripDiveIndex: lodash.exports.toNumber(i), editable: true })))))))))), h("app-modal-footer", { key: 'c24b9cfcbda05a7bf7faad74a461de1ea3742161', disableSave: !this.validTrip, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalDiveTripUpdate.style = modalDiveTripUpdateCss;

export { ModalDiveTripUpdate as modal_dive_trip_update };

//# sourceMappingURL=modal-dive-trip-update.entry.js.map