import { r as registerInstance, l as createEvent, h, j as Host, k as getElement } from './index-d515af00.js';
import { T as TranslationService, as as roundDecimals } from './utils-cbf49763.js';
import { f as CustomerLocationElectrodesData } from './customerLocation-71248eea.js';
import { N as MapService } from './map-dae4acde.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-9be68260.js';
import { a as alertController } from './overlays-b3ceb97d.js';
import './index-9b61a50b.js';
import './_commonjsHelpers-1a56c7bc.js';
import './user-cards-f5f720bb.js';
import './ionic-global-c07767bf.js';
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

const appLocationCss = "app-location{}";

const AppLocation = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.locationSelected = createEvent(this, "locationSelected", 7);
        this.locationDeleted = createEvent(this, "locationDeleted", 7);
        this.editable = true;
        this.location = undefined;
        this.locations = undefined;
        this.slider = undefined;
        this.updateView = false;
        this.addressText = undefined;
        this.locationType = undefined;
        this.segment = undefined;
        this.electrodeSegment = 0;
    }
    componentWillLoad() {
        this.segmentTitles = {
            address: TranslationService.getTransl("address", "Address"),
            plantConfiguration: TranslationService.getTransl("plantConfiguration", "Plant Configuration"),
            electrodesData: TranslationService.getTransl("electrodesData", "Electrodes Data"),
        };
        this.segment = this.editable ? "plantConfiguration" : "address";
    }
    componentDidLoad() {
        if (this.editable)
            this.setLocationsSelect();
    }
    segmentChanged(ev) {
        if (ev.detail.value) {
            this.segment = ev.detail.value;
            this.updateSlider();
        }
    }
    setLocationsSelect() {
        const selectLocationElement = this.el.querySelector("#selectLocation");
        const customPopoverOptions = {
            header: TranslationService.getTransl("location", "Locations"),
        };
        selectLocationElement.interfaceOptions = customPopoverOptions;
        //remove previously defined options
        const selectLocationOptions = Array.from(selectLocationElement.getElementsByTagName("ion-select-option"));
        selectLocationOptions.map((option) => {
            selectLocationElement.removeChild(option);
        });
        selectLocationElement.placeholder = TranslationService.getTransl("select", "Select");
        this.locations.map((location) => {
            const selectOption = document.createElement("ion-select-option");
            selectOption.value = location.locationId;
            selectOption.textContent = TranslationService.getTransl(location.locationId, location.locationName);
            selectLocationElement.appendChild(selectOption);
        });
    }
    selectLocationType(ev) {
        this.locationType = ev.detail.value;
        this.location.type = ev.detail.value;
    }
    selectLocation(ev) {
        this.location.location = ev;
        if (lodash.exports.isNumber(lodash.exports.toNumber(ev.lat)) && lodash.exports.isNumber(lodash.exports.toNumber(ev.lon))) {
            this.location.position = MapService.getPosition(lodash.exports.toNumber(ev.lat), lodash.exports.toNumber(ev.lon));
        }
        this.locationSelected.emit(this.location);
    }
    addElectrode() {
        this.location.electrodesData.push(new CustomerLocationElectrodesData());
        this.electrodeSegment = this.location.electrodesData.length - 1;
        this.handleElectrodeChange();
    }
    electrodeSegmentChanged(ev) {
        if (ev.detail.value !== "add") {
            this.electrodeSegment = ev.detail.value;
            this.handleElectrodeChange();
        }
    }
    handleElectrodeChange() {
        this.updateView = !this.updateView;
        this.updateSlider();
    }
    handleElectrodeItemChange(ev) {
        const n = ev.detail.name;
        const v = ev.detail.value;
        const mmToInch = 0.0393701;
        if (n == "pin_nominal_dia_in_mm") {
            this.location.electrodesData[this.electrodeSegment].pin_nominal_dia_in_inches = roundDecimals(v * mmToInch, 1);
        }
        else if (n == "pin_nominal_dia_in_inches") {
            this.location.electrodesData[this.electrodeSegment].pin_nominal_dia_in_mm = roundDecimals(v / mmToInch, 1);
        }
        else if (n == "dia_in_mm") {
            this.location.electrodesData[this.electrodeSegment].dia_in_inches =
                roundDecimals(v * mmToInch, 0);
        }
        else if (n == "dia_in_inches") {
            this.location.electrodesData[this.electrodeSegment].dia_in_mm =
                roundDecimals(v / mmToInch, 0);
        }
        else if (n == "length_in_mm") {
            this.location.electrodesData[this.electrodeSegment].length_in_inches =
                roundDecimals(v * mmToInch, 0);
        }
        else if (n == "length_in_inches") {
            this.location.electrodesData[this.electrodeSegment].length_in_mm =
                roundDecimals(v / mmToInch, 0);
        }
        this.location.electrodesData[this.electrodeSegment][ev.detail.name] =
            ev.detail.value;
        this.updateSlider();
    }
    async deleteItem() {
        const alert = await alertController.create({
            header: TranslationService.getTransl("delete-location", "Delete Location"),
            message: TranslationService.getTransl("delete-location-confirm", "Are you sure you want to delete this location?"),
            buttons: [
                {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: async () => {
                        this.locationDeleted.emit(true);
                    },
                },
                {
                    text: TranslationService.getTransl("cancel", "Cancel"),
                    handler: async () => { },
                },
            ],
        });
        alert.present();
    }
    handleLocationChange(ev) {
        this.location[ev.detail.name] = ev.detail.value;
    }
    updateSlider() {
        this.updateView = !this.updateView;
        setTimeout(() => {
            //reset slider height to show address
            this.slider ? this.slider.update() : undefined;
        }, 100);
    }
    render() {
        return (h(Host, { key: 'f3ff6863674b5658ced0c3721d9117d0b2bf5d7a' }, this.editable
            ? [
                h("ion-item", { lines: "none" }, h("ion-select", { color: "trasteel", id: "selectLocation", interface: "action-sheet", label: TranslationService.getTransl("loc_type", "Location Type"), "label-placement": "floating", onIonChange: (ev) => {
                        this.selectLocationType(ev);
                    }, value: this.location && this.location.type
                        ? this.location.type
                        : null }), h("ion-button", { "icon-only": true, fill: "clear", slot: "end", onClick: () => this.deleteItem() }, h("ion-icon", { slot: "icon-only", name: "trash", color: "danger" }))),
                h("app-form-item", { "label-tag": "address", "label-text": "Address", value: this.location &&
                        this.location.location &&
                        this.location.location.display_name
                        ? this.location.location.display_name
                        : null, name: "address", "input-type": "text", lines: "full", onFormLocationSelected: (ev) => this.selectLocation(ev.detail), onFormLocationsFound: () => this.updateSlider(), validator: ["address"] }),
            ]
            : undefined, h("ion-toolbar", { key: 'a385c7f87991d4cdbfb20ea9640db8549d247f82' }, h("ion-segment", { key: 'e0a4ebb43536f6b221e3555804a2e054796704f2', mode: "ios", color: Environment.getAppColor(), scrollable: true, onIonChange: (ev) => this.segmentChanged(ev), value: this.segment }, !this.editable ? (h("ion-segment-button", { value: "address", layout: "icon-start" }, h("ion-label", null, TranslationService.getTransl("address", "Address")))) : undefined, h("ion-segment-button", { key: '2a83ac3286a6b091701225981f06abc00802a7d7', value: "plantConfiguration", layout: "icon-start" }, h("ion-label", { key: 'ea895db4825e3358aea23bf218e299f0379206af' }, this.segmentTitles.plantConfiguration)), h("ion-segment-button", { key: 'c940b1d42e9dbd416a2f7ff10dad82f7dd1a124e', value: "electrodesData", layout: "icon-start" }, h("ion-label", { key: 'aac394a7b58b28f8b2c155498ebf6cc58ef8e0d5' }, this.segmentTitles.electrodesData)))), this.segment == "address" ? (h("div", null, h("app-item-detail", { lines: "none", labelTag: "country", labelText: "Country", detailText: this.location.location.address.country
                ? this.location.location.address.country
                : null }), h("app-item-detail", { lines: "none", labelTag: "state", labelText: "State", detailText: this.location.location.address.state
                ? this.location.location.address.state
                : null }), h("app-item-detail", { lines: "none", labelTag: "county", labelText: "County", detailText: this.location.location.address.county
                ? this.location.location.address.county
                : null }), h("app-item-detail", { lines: "none", labelTag: "city", labelText: "City", detailText: this.location.location.address.city
                ? this.location.location.address.city
                : null }), h("app-item-detail", { lines: "none", labelTag: "suburb", labelText: "Suburb", detailText: this.location.location.address.suburb
                ? this.location.location.address.suburb
                : null }), h("app-item-detail", { lines: "none", labelTag: "postcode", labelText: "Postcode", detailText: this.location.location.address.postcode
                ? this.location.location.address.postcode
                : null }), h("app-item-detail", { lines: "none", labelTag: "road", labelText: "Road", detailText: this.location.location.address.road
                ? this.location.location.address.road
                : null }))) : undefined, this.segment == "plantConfiguration" ? (h("div", null, !this.editable
            ? [
                h("app-item-detail", { lines: "none", labelTag: "gem-wiki-page", labelText: "Gem Wiki Page", detailText: this.location.gem_wiki_page_en
                        ? this.location.gem_wiki_page_en
                        : null }),
                h("app-item-detail", { lines: "none", labelTag: "gem-wiki-page-other", labelText: "Gem Wiki Page Other", detailText: this.location.gem_wiki_page_other
                        ? this.location.gem_wiki_page_other
                        : null }),
            ]
            : undefined, h("app-form-item", { lines: "none", labelTag: "status", labelText: "Status", value: this.location.status ? this.location.status : null, name: "status", "input-type": "text", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "category-steel-product", labelText: "Category Steel Product", value: this.location.category_steel_product
                ? this.location.category_steel_product
                : null, name: "category_steel_product", "input-type": "text", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "steel-product", labelText: "Steel Products", value: this.location.steel_products
                ? this.location.steel_products
                : null, name: "steel_products", "input-type": "text", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "steel_sector_end_users", labelText: "Steel Sector End Users", value: this.location.steel_sector_end_users
                ? this.location.steel_sector_end_users
                : null, name: "steel_sector_end_users", "input-type": "text", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "main-production-equipment", labelText: "Main Production Equipment", value: this.location.main_production_equipment
                ? this.location.main_production_equipment
                : null, name: "main_production_equipment", "input-type": "text", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "main-production-process", labelText: "Main Production Process", value: this.location.main_production_process
                ? this.location.main_production_process
                : null, name: "main_production_process", "input-type": "text", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "detailed-production-equipment", labelText: "Detailed Production Equipment", value: this.location.detailed_production_equipment
                ? this.location.detailed_production_equipment
                : null, name: "detailed_production_equipment", "input-type": "text", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "workforce-size", labelText: "Workforce Size", value: this.location.workforce_size
                ? this.location.workforce_size
                : null, name: "workforce_size", "input-type": "number", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "proposed-date", labelText: "Proposed Date", value: this.location.proposed_date &&
                this.location.proposed_date != "unknown"
                ? this.location.proposed_date
                : null, name: "proposed_date", "input-type": "number", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "construction-date", labelText: "Construction Date", value: this.location.construction_date &&
                this.location.construction_date != "unknown"
                ? this.location.construction_date
                : null, name: "construction_date", "input-type": "number", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "plant-age", labelText: "Plant Age", value: this.location.plant_age ? this.location.plant_age : null, name: "plant_age", "input-type": "number", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "start-date", labelText: "Start Date", value: this.location.start_date && this.location.start_date !== "N/A"
                ? this.location.start_date
                : null, name: "start_date", "input-type": "number", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "closed-date", labelText: "Closed Date", value: this.location.closed_date && this.location.closed_date !== "N/A"
                ? this.location.closed_date
                : null, name: "closed_date", "input-type": "number", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "power-source", labelText: "Power Source", value: this.location.power_source ? this.location.power_source : null, name: "power_source", "input-type": "text", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "met-coal-source", labelText: "Met Coal Source", value: this.location.met_coal_source
                ? this.location.met_coal_source
                : null, name: "met_coal_source", "input-type": "text", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "responsible_steel_certification", labelText: "Responsible Steel Certification", value: this.location.responsible_steel_certification &&
                this.location.responsible_steel_certification !== "N/A"
                ? this.location.responsible_steel_certification
                : null, name: "responsible_steel_certification", "input-type": "boolean", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "ISO_14001", labelText: "ISO 14001", value: this.location.ISO_14001 && this.location.ISO_14001 !== "N/A"
                ? this.location.ISO_14001
                : null, name: "ISO_14001", "input-type": "boolean", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }), h("app-form-item", { lines: "none", labelTag: "ISO_50001", labelText: "ISO 50001", value: this.location.ISO_50001 && this.location.ISO_50001 !== "N/A"
                ? this.location.ISO_50001
                : null, name: "ISO_50001", "input-type": "boolean", readonly: !this.editable, onFormItemChanged: (ev) => this.handleLocationChange(ev) }))) : undefined, this.segment == "electrodesData" ? (h("div", null, h("ion-toolbar", null, h("ion-segment", { mode: "ios", scrollable: true, onIonChange: (ev) => this.electrodeSegmentChanged(ev), value: this.electrodeSegment }, this.location.electrodesData.map((electrode, index) => (h("ion-segment-button", { value: index, layout: "icon-start" }, h("ion-label", null, electrode.application)))), this.editable ? (h("ion-segment-button", { value: "add", onClick: () => this.addElectrode(), layout: "icon-start" }, h("ion-label", null, "+"))) : undefined)), this.location.electrodesData.map((electrode, index) => (h("div", null, this.electrodeSegment == index ? (h("div", null, this.editable
            ? [
                h("ion-item", null, h("ion-select", { color: "trasteel", id: "application", interface: "action-sheet", label: TranslationService.getTransl("application", "Application"), "label-placement": "floating", onIonChange: (ev) => {
                        electrode.application = ev.detail.value;
                        this.handleElectrodeChange();
                    }, value: electrode && electrode.application
                        ? electrode.application
                        : null }, h("ion-select-option", { value: "EAF" }, "EAF"), h("ion-select-option", { value: "LF" }, "LF"))),
                h("app-form-item", { value: electrode && electrode.application
                        ? electrode.application
                        : null, name: "application", "input-type": "text", lines: "full", onFormItemChanged: (ev) => this.handleElectrodeItemChange(ev) }),
            ]
            : undefined, h("app-form-item", { "label-tag": "diameter", "label-text": "Diameter", appendText: " (mm)", value: electrode && electrode.dia_in_mm
                ? electrode.dia_in_mm
                : null, name: "dia_in_mm", readonly: !this.editable, "input-type": "number", lines: "full", onFormItemChanged: (ev) => this.handleElectrodeItemChange(ev) }), h("app-form-item", { "label-tag": "diameter", "label-text": "Diameter", appendText: " (inches)", value: electrode && electrode.dia_in_inches
                ? electrode.dia_in_inches
                : null, name: "dia_in_inches", readonly: !this.editable, "input-type": "number", lines: "full", onFormItemChanged: (ev) => this.handleElectrodeItemChange(ev) }), h("app-form-item", { "label-tag": "length", "label-text": "Length", appendText: " (mm)", value: electrode && electrode.length_in_mm
                ? electrode.length_in_mm
                : null, name: "length_in_mm", readonly: !this.editable, "input-type": "number", lines: "full", onFormItemChanged: (ev) => this.handleElectrodeItemChange(ev) }), h("app-form-item", { "label-tag": "length", "label-text": "Length", appendText: " (inches)", value: electrode && electrode.length_in_inches
                ? electrode.length_in_inches
                : null, name: "length_in_inches", readonly: !this.editable, "input-type": "number", lines: "full", onFormItemChanged: (ev) => this.handleElectrodeItemChange(ev) }), h("app-form-item", { "label-tag": "grade", "label-text": "Grade", value: electrode && electrode.grade ? electrode.grade : null, name: "grade", readonly: !this.editable, "input-type": "text", lines: "full", onFormItemChanged: (ev) => this.handleElectrodeItemChange(ev) }), h("app-form-item", { "label-tag": "pin-nom-dia", "label-text": "Pin Nominal Diameter", appendText: " (mm)", value: electrode && electrode.pin_nominal_dia_in_mm
                ? electrode.pin_nominal_dia_in_mm
                : null, name: "pin_nominal_dia_in_mm", readonly: !this.editable, "input-type": "number", lines: "full", onFormItemChanged: (ev) => this.handleElectrodeItemChange(ev) }), h("app-form-item", { "label-tag": "pin-nom-dia", "label-text": "Pin Nominal Diameter", appendText: " (inches)", value: electrode && electrode.pin_nominal_dia_in_inches
                ? electrode.pin_nominal_dia_in_inches
                : null, name: "pin_nominal_dia_in_inches", readonly: !this.editable, "input-type": "number", lines: "full", onFormItemChanged: (ev) => this.handleElectrodeItemChange(ev) }), h("app-form-item", { "label-tag": "pin-size", "label-text": "Pin Size", appendText: " (mm)", value: electrode && electrode.pin_size_in_mm
                ? electrode.pin_size_in_mm
                : null, name: "pin_size_in_mm", readonly: !this.editable, "input-type": "text", lines: "full", onFormItemChanged: (ev) => this.handleElectrodeItemChange(ev) }), h("app-form-item", { "label-tag": "pin-size", "label-text": "Pin Size", appendText: " (inches)", value: electrode && electrode.pin_size_in_inches
                ? electrode.pin_size_in_inches
                : null, name: "pin_size_in_inches", readonly: !this.editable, "input-type": "text", lines: "full", onFormItemChanged: (ev) => this.handleElectrodeItemChange(ev) }), h("app-form-item", { "label-tag": "tpi", "label-text": "TPI", value: electrode && electrode.TPI ? electrode.TPI : null, name: "TPI", readonly: !this.editable, "input-type": "text", lines: "full", onFormItemChanged: (ev) => this.handleElectrodeItemChange(ev) }), h("app-form-item", { "label-tag": "pin-length-code", "label-text": "Pin Length Code", value: electrode && electrode.pin_length_type_code
                ? electrode.pin_length_type_code
                : null, name: "pin_length_type_code", readonly: !this.editable, "input-type": "text", lines: "full", onFormItemChanged: (ev) => this.handleElectrodeItemChange(ev) }), h("app-form-item", { "label-tag": "pin-length", "label-text": "Pin Length", value: electrode && electrode.pin_length
                ? electrode.pin_length
                : null, name: "pin_length", readonly: !this.editable, "input-type": "text", lines: "full", onFormItemChanged: (ev) => this.handleElectrodeItemChange(ev) }), h("app-form-item", { "label-tag": "dust-groove", "label-text": "Dust Groove", value: electrode && electrode.dust_groove
                ? electrode.dust_groove
                : null, name: "dust_groove", readonly: !this.editable, "input-type": "boolean", lines: "full", onFormItemChanged: (ev) => this.handleElectrodeItemChange(ev) }), h("app-form-item", { "label-tag": "pitch-plug", "label-text": "Pitch Plug", value: electrode && electrode.pitch_plug
                ? electrode.pitch_plug
                : null, name: "pitch_plug", readonly: !this.editable, "input-type": "boolean", lines: "full", onFormItemChanged: (ev) => this.handleElectrodeItemChange(ev) }), h("app-form-item", { "label-tag": "preset", "label-text": "Preset", value: electrode && electrode.preset ? electrode.preset : null, name: "preset", readonly: !this.editable, "input-type": "boolean", lines: "full", onFormItemChanged: (ev) => this.handleElectrodeItemChange(ev) }))) : undefined))))) : undefined));
    }
    get el() { return getElement(this); }
};
AppLocation.style = appLocationCss;

export { AppLocation as app_location };

//# sourceMappingURL=app-location.entry.js.map