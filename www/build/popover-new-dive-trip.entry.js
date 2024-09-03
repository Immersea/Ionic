import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { d as DiveSitesService, i as DivingCentersService, T as TranslationService } from './utils-cbf49763.js';
import { l as lodash } from './lodash-68d560b6.js';
import './index-be90eba5.js';
import { p as popoverController } from './overlays-b3ceb97d.js';
import './env-9be68260.js';
import './ionic-global-c07767bf.js';
import './map-dae4acde.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';
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

const popoverNewDiveTripCss = "popover-new-dive-trip .validation-error{text-align:center;font-size:0.7rem;color:red}";

const PopoverNewDiveTrip = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.sitesList = [];
        this.divingCentersList = [];
        this.tripDive = undefined;
        this.diveIndex = undefined;
        this.diveSite = undefined;
        this.updateView = false;
        this.noDivePlans = false;
        this.validTrip = false;
    }
    async componentWillLoad() {
        this.sitesList = DiveSitesService.diveSitesList;
        this.divingCentersList = DivingCentersService.divingCentersList;
    }
    componentDidLoad() {
        //if diveIndex is null -> add new dive - else edit existing dive
        if (this.tripDive && this.diveIndex >= 0) {
            this.participants = this.tripDive.numberOfParticipants;
            this.tripDate = this.tripDive.divePlan.dives[0].date;
            console.log("this.tripDate", this.tripDive, this.tripDate, this.tripDate.toISOString());
            this.diveSite = this.sitesList.find((site) => site.id === this.tripDive.divePlan.dives[this.diveIndex].diveSiteId);
            this.divingCenterId =
                this.tripDive.divePlan.dives[this.diveIndex].divingCenterId;
            this.setSelectDivePlans();
            this.divePlanTitle = this.tripDive.divePlan.title;
            this.divePlanName = this.tripDive.divePlan.configuration
                ? this.tripDive.divePlan.configuration.stdName
                : null;
            this.surfaceInterval =
                this.diveIndex > 0
                    ? this.tripDive.divePlan.dives[this.diveIndex].surfaceInterval
                    : undefined;
            this.validateTrip();
        }
    }
    async openSearchSite() {
        const popover = await popoverController.create({
            component: "popover-search-dive-site",
            translucent: true,
        });
        popover.onDidDismiss().then((ev) => {
            this.divePlanName = null;
            const siteId = ev.data;
            this.diveSite = this.sitesList.find((site) => site.id === siteId);
            this.validateTrip();
            this.setSelectDivePlans();
        });
        popover.present();
    }
    setSelectDivePlans() {
        const selectElement = this.el.querySelector("#selectDivePlans");
        const customPopoverOptions = {
            header: TranslationService.getTransl("dive-profile", "Dive Profile"),
        };
        selectElement.interfaceOptions = customPopoverOptions;
        //remove previously defined options
        const selectOptions = Array.from(selectElement.getElementsByTagName("ion-select-option"));
        selectOptions.map((option) => {
            selectElement.removeChild(option);
        });
        if (this.diveSite.divePlans && this.diveSite.divePlans.length > 0) {
            selectElement.placeholder = TranslationService.getTransl("select", "Select");
            this.diveSite.divePlans.map((plan) => {
                const selectOption = document.createElement("ion-select-option");
                selectOption.value = plan;
                selectOption.textContent = plan;
                selectElement.appendChild(selectOption);
            });
            this.noDivePlans = false;
            selectElement.disabled = false;
        }
        else {
            selectElement.placeholder = TranslationService.getTransl("no-profiles", "No Dive Profiles available for this site");
            selectElement.disabled = true;
            this.noDivePlans = true;
        }
        const selectDCElement = this.el.querySelector("#selectDivingCenter");
        const customDCPopoverOptions = {
            header: TranslationService.getTransl("diving-center", "Diving Center"),
        };
        selectDCElement.interfaceOptions = customDCPopoverOptions;
        //remove previously defined options
        const selectDCOptions = Array.from(selectDCElement.getElementsByTagName("ion-select-option"));
        selectDCOptions.map((option) => {
            selectDCElement.removeChild(option);
        });
        if (this.diveSite.divingCenters && this.diveSite.divingCenters.length > 0) {
            selectDCElement.placeholder = TranslationService.getTransl("select", "Select");
            //add empty selection
            const selectOption = document.createElement("ion-select-option");
            selectOption.value = null;
            selectOption.textContent = "-";
            selectDCElement.appendChild(selectOption);
            this.diveSite.divingCenters.map((dcId) => {
                const selectOption = document.createElement("ion-select-option");
                const dc = this.divingCentersList.find((dc) => dc.id === dcId);
                selectOption.value = dcId;
                selectOption.textContent = dc.displayName;
                selectDCElement.appendChild(selectOption);
            });
            selectDCElement.disabled = false;
        }
        else {
            selectDCElement.placeholder = TranslationService.getTransl("no-divecenters", "No Diving Centers available for this site");
            selectDCElement.disabled = true;
        }
        this.updateView = !this.updateView;
    }
    updateDate(ev) {
        this.tripDate = new Date(ev.detail.value);
        this.validateTrip();
    }
    updateSurfaceInterval(value) {
        this.surfaceInterval = value;
        this.validateTrip();
    }
    updateParticipants(ev) {
        this.participants = lodash.exports.toNumber(ev.detail.value);
        this.validateTrip();
    }
    updateTitle(ev) {
        this.divePlanTitle = ev.detail.value;
        this.validateTrip();
    }
    updateDivePlanName(ev) {
        this.divePlanName = ev.detail.value;
    }
    updateDivingCenter(ev) {
        this.divingCenterId = ev.detail.value;
    }
    validateTrip() {
        //
        this.validTrip =
            ((!this.diveIndex && !this.tripDive) || this.diveIndex === 0
                ? lodash.exports.isDate(this.tripDate) &&
                    lodash.exports.isNumber(this.participants) &&
                    lodash.exports.isString(this.divePlanTitle)
                : lodash.exports.isNumber(this.surfaceInterval)) &&
                this.diveSite &&
                lodash.exports.isString(this.diveSite.id);
        this.updateView = !this.updateView;
    }
    async save() {
        popoverController.dismiss({
            participants: this.participants,
            date: this.tripDate,
            title: this.divePlanTitle,
            diveSiteId: this.diveSite.id,
            divingCenterId: this.divingCenterId,
            divePlanName: this.divePlanName,
            surfaceInterval: this.surfaceInterval,
        });
    }
    cancel() {
        popoverController.dismiss();
    }
    render() {
        return (h(Host, { key: '81f0cf94fd1a6cb8fbbdc2f6d72b1430690cb8f2' }, h("ion-toolbar", { key: '4e1013580bcc5c6fd476977896930c2c95cff837' }, h("ion-title", { key: 'c5244e9ec3d2fc60d5db8aa3e48bfbb0c6d4faf4' }, h("my-transl", { key: 'ca9ea22590010c77fdd47bd2591815e20b186644', tag: "dive-trip", text: "Dive Trip" }))), (!this.diveIndex && !this.tripDive) || this.diveIndex === 0 ? ([
            h("app-form-item", { "label-tag": "date-time", "label-text": "Date/Time", value: this.tripDate ? this.tripDate.toISOString() : null, name: "tripDate", "input-type": "date", datePresentation: "date-time", lines: "inset", onFormItemChanged: (ev) => this.updateDate(ev) }),
            h("app-form-item", { "label-tag": "title", "label-text": "Title", value: this.divePlanTitle, name: "divePlanTitle", "input-type": "text", lines: "inset", onFormItemChanged: (ev) => this.updateTitle(ev) }),
            h("app-form-item", { "label-tag": "number-participants", "label-text": "Max Number of Participants", value: this.participants, name: "participants", "input-type": "number", lines: "inset", onFormItemChanged: (ev) => this.updateParticipants(ev) }),
        ]) : (h("ion-item", null, h("ion-select", { label: TranslationService.getTransl("surface-interval", "Surface Interval"), onIonChange: (ev) => this.updateSurfaceInterval(ev.detail.value), value: this.surfaceInterval }, h("ion-select-option", { value: 0.5 }, "0:30"), h("ion-select-option", { value: 1 }, "1:00"), h("ion-select-option", { value: 1.5 }, "1:30"), h("ion-select-option", { value: 2 }, "2:00"), h("ion-select-option", { value: 2.5 }, "2:30"), h("ion-select-option", { value: 3 }, "3:00"), h("ion-select-option", { value: 3.5 }, "3:30"), h("ion-select-option", { value: 4 }, "4:00"), h("ion-select-option", { value: 4.5 }, "4:30"), h("ion-select-option", { value: 5 }, "5:00"), h("ion-select-option", { value: 5.5 }, "5:30"), h("ion-select-option", { value: 6 }, "6:00"), h("ion-select-option", { value: 6.5 }, "6:30"), h("ion-select-option", { value: 7 }, "7:00"), h("ion-select-option", { value: 7.5 }, "7:30"), h("ion-select-option", { value: 8 }, "8:00"), h("ion-select-option", { value: 8.5 }, "8:30"), h("ion-select-option", { value: 9 }, "9:00"), h("ion-select-option", { value: 9.5 }, "9:30"), h("ion-select-option", { value: 10 }, "10:00"), h("ion-select-option", { value: 10.5 }, "10:30"), h("ion-select-option", { value: 11 }, "11:00"), h("ion-select-option", { value: 11.5 }, "11:30"), h("ion-select-option", { value: 12 }, "12:00")))), h("ion-item", { key: '50544edc317ffe15ff3d0e165e8e5cb4ddd67cf3', button: true, onClick: () => this.openSearchSite() }, h("ion-input", { key: '11a4f0f7d02a5eef56b65b9e4054475bf3d5bbbf', label: TranslationService.getTransl("dive-site", "Dive Site"), "label-placement": "floating", placeholder: TranslationService.getTransl("select-dive-site", "Select Dive Site"), value: this.diveSite ? this.diveSite.displayName : undefined }), h("ion-icon", { key: '806bb73e927628656e03f94252317c148acfb6d0', slot: "end", name: "search-outline" })), h("ion-item", { key: '2110746dccb2de57584e578eb47104233205b111' }, h("ion-select", { key: '749c7f389a46aa1e6dd38b41bea1a1b544be1c25', label: TranslationService.getTransl("dive-profile", "Dive Profile"), id: "selectDivePlans", onIonChange: (ev) => this.updateDivePlanName(ev), disabled: true, value: this.divePlanName })), h("ion-item", { key: 'c0c5c579eb718dfe9fe56bb797d1ce06f98611af' }, h("ion-select", { key: '83b285cb0e90bf779c5749d023f6f138c54cea0a', label: TranslationService.getTransl("diving-center", "Diving Center"), id: "selectDivingCenter", onIonChange: (ev) => this.updateDivingCenter(ev), disabled: true, value: this.divingCenterId })), h("app-modal-footer", { key: '1291313254f150345d26d62988cd36251cf3da9a', disableSave: !this.validTrip, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
PopoverNewDiveTrip.style = popoverNewDiveTripCss;

export { PopoverNewDiveTrip as popover_new_dive_trip };

//# sourceMappingURL=popover-new-dive-trip.entry.js.map