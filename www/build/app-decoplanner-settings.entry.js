import { r as registerInstance, l as createEvent, h } from './index-d515af00.js';
import { aU as DecoplannerParameters, a5 as DecoplannerDive, T as TranslationService } from './utils-cbf49763.js';
import { E as Environment } from './env-9be68260.js';
import { l as lodash } from './lodash-68d560b6.js';
import './map-dae4acde.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
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
import './customerLocation-71248eea.js';

const appDecoplannerSettingsCss = "app-decoplanner-settings{width:100%}app-decoplanner-settings .item-input .label-md,app-decoplanner-settings .item-select .label-md,app-decoplanner-settings .item-datetime .label-md{color:rgb(0, 0, 0)}app-decoplanner-settings input{text-align:right}app-decoplanner-settings .fixedLabel{min-width:80% !important;max-width:80% !important}app-decoplanner-settings ion-item .item-inner{box-shadow:none !important;border-bottom:1px solid #dedede !important}app-decoplanner-settings .item-input .label-md,app-decoplanner-settings .item-select .label-md,app-decoplanner-settings .item-datetime .label-md{color:rgb(0, 0, 0)}app-decoplanner-settings .slider-scrollable-container{padding-top:0px}";

const AppDecoplannerSettings = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.updateParamsEvent = createEvent(this, "updateParamsEvent", 7);
        this.parameters = new DecoplannerParameters();
        this.showConfigurations = false;
        this.diveDataToShare = undefined;
        this.dive = new DecoplannerDive();
        this.updateView = true;
        this.ranges = undefined;
    }
    componentWillLoad() {
        this.updateViewParams();
    }
    updateViewParams() {
        let params = this.diveDataToShare;
        this.showConfigurations = params.showConfigurations;
        this.divePlan = params.divePlan;
        this.index = params.index;
        this.dives = this.divePlan.dives;
        this.dive = this.divePlan.dives[this.index];
        this.stdConfigurations = params.stdConfigurations;
        this.parameters = this.divePlan.configuration.parameters;
        this.ranges = this.divePlan.getParamRanges(this.parameters.units);
        this.updateView = !this.updateView;
    }
    updateParam(param, ev) {
        let value = ev.detail ? ev.detail.value : ev.target.value;
        switch (param) {
            case "units":
                this.parameters.setUnits(value);
                this.ranges = this.divePlan.getParamRanges(value);
                break;
            case "config":
                this.parameters.configuration = value;
                break;
            case "laststop":
                this.parameters.lastStop6m20ft = ev.detail.checked;
                break;
            case "conservatism":
                this.parameters.conservatism = value;
                break;
            case "conservatism_bailout":
                this.parameters.conservatism_bailout = value;
                break;
            case "gfLow":
                this.parameters.gfLow = lodash.exports.toNumber(value);
                break;
            case "gfHigh":
                this.parameters.gfHigh = lodash.exports.toNumber(value);
                break;
            case "gfLow_bailout":
                this.parameters.gfLow_bailout = lodash.exports.toNumber(value);
                break;
            case "gfHigh_bailout":
                this.parameters.gfHigh_bailout = lodash.exports.toNumber(value);
                break;
            case "descentppO2":
                this.parameters.descentppO2 = lodash.exports.toNumber(value);
                break;
            case "bottomppO2":
                this.parameters.bottomppO2 = lodash.exports.toNumber(value);
                break;
            case "decoppO2":
                this.parameters.decoppO2 = lodash.exports.toNumber(value);
                break;
            case "oxygenppO2":
                this.parameters.oxygenppO2 = lodash.exports.toNumber(value);
                break;
            case "pscrGasDivider":
                this.parameters.pscrGasDivider = lodash.exports.toNumber(value);
                break;
            case "ace_time":
                this.parameters.ace_time = lodash.exports.toNumber(value);
                break;
            case "CCR_o2_consumption":
                this.parameters.CCR_o2_consumption = lodash.exports.toNumber(value);
                break;
            case "metabolic_o2_consumption":
                this.parameters.metabolic_o2_consumption = lodash.exports.toNumber(value);
                break;
            case "CCR_volume_for_consumption":
                this.parameters.CCR_volume_for_consumption = lodash.exports.toNumber(value);
                break;
            case "rmvBottom":
                this.parameters.rmvBottom = lodash.exports.toNumber(value);
                break;
            case "rmvDeco":
                this.parameters.rmvDeco = lodash.exports.toNumber(value);
                break;
            case "deco_gas_reserve":
                this.parameters.deco_gas_reserve = lodash.exports.toNumber(value);
                break;
            case "time_at_bottom_for_min_gas":
                this.parameters.time_at_bottom_for_min_gas = lodash.exports.toNumber(value);
                break;
            case "time_at_gas_switch_for_min_gas":
                this.parameters.time_at_gas_switch_for_min_gas = lodash.exports.toNumber(value);
                break;
            case "rmvBottom_multiplier_for_min_gas":
                this.parameters.rmvBottom_multiplier_for_min_gas = lodash.exports.toNumber(value);
                break;
            case "number_of_divers_for_min_gas":
                this.parameters.number_of_divers_for_min_gas = lodash.exports.toNumber(value);
                break;
            case "descentRate":
                this.parameters.descentRate = lodash.exports.toNumber(value);
                break;
            case "ascentRate":
                this.parameters.ascentRate = lodash.exports.toNumber(value);
                break;
            case "minPPO2":
                this.parameters.minPPO2 = lodash.exports.toNumber(value);
                break;
            case "maxPPO2deco":
                this.parameters.maxPPO2deco = lodash.exports.toNumber(value);
                break;
            case "maxPPO2bottom":
                this.parameters.maxPPO2bottom = lodash.exports.toNumber(value);
                break;
        }
        //this.updateParams();
        this.updateParamsEvent.emit(this.parameters);
    }
    render() {
        return (h("div", { key: 'c6422eb5fe4244053c3df79fc71f8fa1194caa88', class: "slider-container" }, h("ion-list", { key: 'fb7e4231e0d558339438fec03cae781497eb104f', class: "slider-scrollable-container" }, h("ion-item-divider", { key: 'b83a2c3232ca7e47c4f623a0ecbb1cc5a05c83d9' }, h("ion-label", { key: '88ca90d445587a4dd56ba901aac8da2994221f3c' }, h("my-transl", { key: '7d804ff5ede10cbbb1b9cba23590db035a0fdca9', tag: "general-settings", text: "General Settings" }))), !this.divePlan.configuration || this.showConfigurations ? (h("ion-item", null, h("ion-select", { label: TranslationService.getTransl("configuration", "Configuration"), labelPlacement: "floating", onIonChange: (ev) => this.updateParam("config", ev), value: this.parameters.configuration }, h("ion-select-option", { value: "OC" }, "OC"), h("ion-select-option", { value: "pSCR" }, "pSCR"), h("ion-select-option", { value: "CCR" }, "CCR")))) : undefined, h("ion-item", { key: 'dffb1ffe85a23a016eea36f8a2102bcd4eb81b1a' }, h("ion-toggle", { key: 'ca2c8455d0a874528541129c3e985daac5d75db4', color: Environment.isDecoplanner() ? "gue-blue" : "planner", onIonChange: (ev) => this.updateParam("laststop", ev), checked: this.parameters.lastStop6m20ft }, h("my-transl", { key: 'cdf97475cea77ddd193853083a84cbfe08cb24b6', tag: "last-stop", text: "Last stop" }), " ", this.parameters.metric ? 6 : 20, this.parameters.depthUnit)), h("ion-item-divider", { key: 'b56430dba9c590d722b88591f0b3e4891c385d46' }, h("ion-label", { key: '24bca1172cf4dd92d93752bf116de77ef59ee055' }, "VPM-B")), this.parameters.configuration != "OC" ? (h("ion-item-divider", null, h("ion-label", null, this.parameters.configuration, " ", h("my-transl", { tag: "settings", text: "settings" })))) : undefined, h("ion-item", { key: 'a2371a9ae304714a3bf18e8ef6bb4c528d6c5abd' }, h("ion-select", { key: '25f5011c8e9c4a7b0de784abc06fd20643749fe0', label: TranslationService.getTransl("conservatism", "Conservatism"), labelPlacement: "floating", onIonChange: (ev) => this.updateParam("conservatism", ev), value: this.parameters.conservatism }, this.ranges.conservatism.map((conservatism) => (h("ion-select-option", { value: conservatism }, conservatism))))), this.parameters.configuration != "OC" ? (h("ion-item-divider", null, h("ion-label", null, h("my-transl", { tag: "bailout-settings", text: "Bailout settings" })))) : undefined, this.parameters.configuration != "OC" ? (h("ion-item", null, h("ion-select", { label: TranslationService.getTransl("conservatism", "Conservatism"), labelPlacement: "floating", onIonChange: (ev) => this.updateParam("conservatism_bailout", ev), value: this.parameters.conservatism_bailout }, this.ranges.conservatism.map((conservatism) => (h("ion-select-option", { value: conservatism }, conservatism)))))) : undefined, h("ion-item-divider", { key: '7fb1f74879da31844ad83ffaee06905b806e2c05' }, h("ion-label", { key: '34b20b35a88492632e34347f212ac2cdbd56e2b6' }, "BUHLMANN")), this.parameters.configuration != "OC" ? (h("ion-item-divider", null, h("ion-label", null, this.parameters.configuration, " ", h("my-transl", { tag: "settings", text: "settings" })))) : undefined, h("ion-item", { key: 'c94d1f723d48269062f4fbc587fa4abe306e97d0' }, h("ion-select", { key: '3eec18f17bd985f7ede557bf25d50294eb8cbb9e', label: TranslationService.getTransl("gradient-factor-low", "Gradient Factor Low"), labelPlacement: "floating", onIonChange: (ev) => this.updateParam("gfLow", ev), value: this.parameters.gfLow }, this.ranges.gf.map((gf) => (h("ion-select-option", { value: gf }, gf))))), h("ion-item", { key: 'bc84933d14681d75d4483003cc5e821d8457d4e7' }, h("ion-select", { key: '55c97d174fa7567c678490dfed17d8c890c47994', label: TranslationService.getTransl("gradient-factor-high", "Gradient Factor High"), labelPlacement: "floating", onIonChange: (ev) => this.updateParam("gfHigh", ev), value: this.parameters.gfHigh }, this.ranges.gf.map((gf) => (h("ion-select-option", { value: gf }, gf))))), this.parameters.configuration != "OC"
            ? [
                h("ion-item-divider", null, h("ion-label", null, h("my-transl", { tag: "bailout-settings", text: "Bailout settings" }))),
                h("ion-item", null, h("ion-select", { label: TranslationService.getTransl("gradient-factor-low", "Gradient Factor Low"), labelPlacement: "floating", onIonChange: (ev) => this.updateParam("gfLow_bailout", ev), value: this.parameters.gfLow_bailout }, this.ranges.gf.map((gf) => (h("ion-select-option", { value: gf }, gf))))),
                h("ion-item", null, h("ion-select", { label: TranslationService.getTransl("gradient-factor-high", "Gradient Factor High"), labelPlacement: "floating", onIonChange: (ev) => this.updateParam("gfHigh_bailout", ev), value: this.parameters.gfHigh_bailout }, this.ranges.gf.map((gf) => (h("ion-select-option", { value: gf }, gf))))),
            ]
            : undefined, this.parameters.configuration == "CCR"
            ? [
                h("ion-item-divider", null, h("ion-label", null, h("my-transl", { tag: "ppO2-settings", text: "ppO2 Standard Settings" }))),
                h("ion-item-divider", null, h("ion-label", null, h("my-transl", { tag: "ppO2-settings-note", text: "note: CCR settings from deco gases prevail over these settings" }))),
                h("ion-item", null, h("ion-select", { label: TranslationService.getTransl("descent-ppO2-CCR", "Descent ppO2 (CCR)"), labelPlacement: "floating", onIonChange: (ev) => this.updateParam("descentppO2", ev), value: this.parameters.descentppO2 }, this.ranges.ppO2.map((ppO2) => (h("ion-select-option", { value: ppO2 }, ppO2))))),
                h("ion-item", null, h("ion-select", { label: TranslationService.getTransl("bottom-ppO2-CCR", "Bottom ppO2 (CCR)"), labelPlacement: "floating", onIonChange: (ev) => this.updateParam("bottomppO2", ev), value: this.parameters.bottomppO2 }, this.ranges.ppO2.map((ppO2) => (h("ion-select-option", { value: ppO2 }, ppO2))))),
                h("ion-item", null, h("ion-select", { label: TranslationService.getTransl("deco-ppO2-CCR", "Deco stops ppO2 (CCR)"), labelPlacement: "floating", onIonChange: (ev) => this.updateParam("decoppO2", ev), value: this.parameters.decoppO2 }, this.ranges.ppO2.map((ppO2) => (h("ion-select-option", { value: ppO2 }, ppO2))))),
                h("ion-item", null, h("ion-select", { label: TranslationService.getTransl("oxygen-ppO2-CCR", "Oxygen stops ppO2 (CCR)"), labelPlacement: "floating", onIonChange: (ev) => this.updateParam("oxygenppO2", ev), value: this.parameters.oxygenppO2 }, this.ranges.ppO2.map((ppO2) => (h("ion-select-option", { value: ppO2 }, ppO2))))),
            ]
            : undefined, h("ion-item-divider", { key: '8facca291104e9379a53370a7b004bd54d6ed83c' }, h("ion-label", { key: 'd894750e482fd8b70e2a4fd48fe4ec92dac3c591' }, h("my-transl", { key: '4b9b96f74eb99de873c5a9af89e1e5b59081b96f', tag: "gas", text: "Gas" }))), this.parameters.configuration == "pSCR" ? (h("ion-item", null, h("ion-select", { label: TranslationService.getTransl("pSCR-gas-divider", "pSCR Gas Divider"), labelPlacement: "floating", onIonChange: (ev) => this.updateParam("pscrGasDivider", ev), value: this.parameters.pscrGasDivider }, this.ranges.pscrGasDivider.map((pscrGasDivider) => (h("ion-select-option", { value: pscrGasDivider }, pscrGasDivider)))))) : undefined, this.parameters.configuration != "OC" ? (h("ion-item", null, h("ion-input", { label: TranslationService.getTransl("ace", "ACE (Absorbent Canister Endurance)"), labelPlacement: "floating", type: "number", value: this.parameters.ace_time, class: "ion-text-end", onIonChange: (ev) => this.updateParam("ace_time", ev) }))) : undefined, this.parameters.configuration == "CCR" ? (h("ion-item", null, h("ion-select", { label: TranslationService.getTransl("o2-consumption-ccr", "O2 consumption for CCR") +
                " (" +
                this.parameters.volumeUnit +
                "/min)", labelPlacement: "floating", onIonChange: (ev) => this.updateParam("CCR_o2_consumption", ev), value: this.parameters.CCR_o2_consumption }, this.ranges.CCR_o2_consumption.map((CCR_o2_consumption) => (h("ion-select-option", { value: CCR_o2_consumption }, CCR_o2_consumption)))))) : undefined, this.parameters.configuration == "pSCR" ? (h("ion-item", null, h("ion-select", { label: TranslationService.getTransl("metabolic-o2-consumption", "Metabolic O2 consumption"), labelPlacement: "floating", onIonChange: (ev) => this.updateParam("metabolic_o2_consumption", ev), value: this.parameters.metabolic_o2_consumption }, this.ranges.CCR_o2_consumption.map((CCR_o2_consumption) => (h("ion-select-option", { value: CCR_o2_consumption }, CCR_o2_consumption)))))) : undefined, this.parameters.configuration == "CCR" ? (h("ion-item", null, h("ion-select", { label: TranslationService.getTransl("volume-CCR-diluent-consumption", "Volume of CCR for diluent consumption") +
                " (" +
                this.parameters.volumeUnit +
                ")", labelPlacement: "floating", onIonChange: (ev) => this.updateParam("CCR_volume_for_consumption", ev), value: this.parameters.CCR_volume_for_consumption }, this.ranges.CCR_volume_for_consumption.map((CCR_volume_for_consumption) => (h("ion-select-option", { value: CCR_volume_for_consumption }, CCR_volume_for_consumption)))))) : undefined, h("ion-item", { key: '16498c384305db1b6ddd6f0d1306ade70ff30b63' }, h("ion-select", { key: '0a05eb320eb6d6358d7e886ece81327487d24de1', label: TranslationService.getTransl("SCR-bottom", "SCR Bottom") +
                " (" +
                this.parameters.volumeUnit +
                "/min)", labelPlacement: "floating", onIonChange: (ev) => this.updateParam("rmvBottom", ev), value: this.parameters.rmvBottom }, this.ranges.rmv.map((rmv) => (h("ion-select-option", { value: rmv }, rmv))))), h("ion-item", { key: '0b4b4ab4a2afc8c0b11232bf7e1a4dea56a53153' }, h("ion-select", { key: '8ca7310d23ff596d39bf47554f8995dfb28b2218', label: TranslationService.getTransl("SCR-deco", "SCR Deco") +
                " (" +
                this.parameters.volumeUnit +
                "/min)", labelPlacement: "floating", onIonChange: (ev) => this.updateParam("rmvDeco", ev), value: this.parameters.rmvDeco }, this.ranges.rmv.map((rmv) => (h("ion-select-option", { value: rmv }, rmv))))), h("ion-item", { key: 'ccddc3ef27c84b1b0a21c216555aa9ae4006cde5' }, h("ion-select", { key: 'a50d81640aebfdc3fd88b4c50404582f682ebdce', label: TranslationService.getTransl("deco-gas-reserve", "Deco Gas Reserve") + " (%)", labelPlacement: "floating", onIonChange: (ev) => this.updateParam("deco_gas_reserve", ev), value: this.parameters.deco_gas_reserve }, this.ranges.deco_gas_reserve.map((deco_gas_reserve) => (h("ion-select-option", { value: deco_gas_reserve }, deco_gas_reserve))))), h("ion-item", { key: '981b6ded3e61fc276796e4af32bdbcc7dd12de3e' }, h("ion-select", { key: '043fb9f6b8e2e0d40cfa9d4597fbf29bf20aa504', label: TranslationService.getTransl("time-bottom-mingas", "Time at bottom for Min. Gas") + " (min)", labelPlacement: "floating", onIonChange: (ev) => this.updateParam("decotime_at_bottom_for_min_gas_gas_reserve", ev), value: this.parameters.time_at_bottom_for_min_gas }, this.ranges.time_at_bottom_for_min_gas.map((time_at_bottom_for_min_gas) => (h("ion-select-option", { value: time_at_bottom_for_min_gas }, time_at_bottom_for_min_gas))))), h("ion-item", { key: '643cbb217338d593982ebd07969868a1da733102' }, h("ion-select", { key: '6addcaeb8eb5cfc7ff60742bddc8788f53ead94c', label: TranslationService.getTransl("time-gasswitch-mingas", "Time at gas switch for Min. Gas") + " (min)", labelPlacement: "floating", onIonChange: (ev) => this.updateParam("time_at_gas_switch_for_min_gas", ev), value: this.parameters.time_at_gas_switch_for_min_gas }, this.ranges.time_at_bottom_for_min_gas.map((time_at_gas_switch_for_min_gas) => (h("ion-select-option", { value: time_at_gas_switch_for_min_gas }, time_at_gas_switch_for_min_gas))))), h("ion-item", { key: 'f114fe203f1c38c75c843d734d05f5ce6313e0e4' }, h("ion-select", { key: '02190dbab1d1fdfee2f6eae88963fc160ca81324', label: TranslationService.getTransl("stress-factor-mingas", "Stress factor for Min. Gas") + " (x)", labelPlacement: "floating", onIonChange: (ev) => this.updateParam("rmvBottom_multiplier_for_min_gas", ev), value: this.parameters.rmvBottom_multiplier_for_min_gas }, this.ranges.rmvBottom_multiplier_for_min_gas.map((rmvBottom_multiplier_for_min_gas) => (h("ion-select-option", { value: rmvBottom_multiplier_for_min_gas }, rmvBottom_multiplier_for_min_gas))))), h("ion-item", { key: '8090265caaf3949283745682676c1bdb660ea450' }, h("ion-select", { key: '83dcf50b75b23c42135e940f2f4a8197bedf562f', label: TranslationService.getTransl("number-divers-mingas", "Number of divers for Min. Gas") + " (#)", labelPlacement: "floating", onIonChange: (ev) => this.updateParam("number_of_divers_for_min_gas", ev), value: this.parameters.number_of_divers_for_min_gas }, this.ranges.number_of_divers_for_min_gas.map((number_of_divers_for_min_gas) => (h("ion-select-option", { value: number_of_divers_for_min_gas }, number_of_divers_for_min_gas))))), h("ion-item", { key: 'cd47927d729a64d4f67e551fc17ea5215d23ef5a' }, h("ion-select", { key: '007f5309c7593ce0ae807519ce9f7d6e805ea74f', label: TranslationService.getTransl("descent-rate", "Descent Rate") +
                " (" +
                this.parameters.depthUnit +
                "/min)", labelPlacement: "floating", onIonChange: (ev) => this.updateParam("descentRate", ev), value: this.parameters.descentRate }, this.ranges.descentRate.map((descentRate) => (h("ion-select-option", { value: descentRate }, descentRate))))), h("ion-item", { key: 'b3d9292d9857dd102f46cb49d140f7e253b29d79' }, h("ion-select", { key: 'db187d4c25ce02e795c97ce88bb21a7a3b43b8d1', label: TranslationService.getTransl("ascent-rate", "Ascent Rate") +
                " (" +
                this.parameters.depthUnit +
                "/min)", labelPlacement: "floating", onIonChange: (ev) => this.updateParam("ascentRate", ev), value: this.parameters.ascentRate }, this.ranges.ascentRate.map((ascentRate) => (h("ion-select-option", { value: ascentRate }, ascentRate))))))));
    }
};
AppDecoplannerSettings.style = appDecoplannerSettingsCss;

export { AppDecoplannerSettings as app_decoplanner_settings };

//# sourceMappingURL=app-decoplanner-settings.entry.js.map