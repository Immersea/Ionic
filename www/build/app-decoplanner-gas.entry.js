import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { a5 as DecoplannerDive, a4 as DiveToolsService, aG as Gas, T as TranslationService } from './utils-5cd4c7bb.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-0a7fccce.js';
import { F as FusionchartsService } from './fusioncharts-4fbd8033.js';
import './map-e64442d7.js';
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
import './customerLocation-bbe1e349.js';

const appDecoplannerGasCss = "app-decoplanner-gas{width:100%}app-decoplanner-gas .color-red{color:#d00000}app-decoplanner-gas .color-green{color:#69bb7b}app-decoplanner-gas .color-yellow{color:#e0a800}app-decoplanner-gas ion-icon{font-size:50px}";

const AppDecoplannerGas = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.chartElements = {};
        this.selectedModelGasView = "BUHL";
        this.showAvailableGas = false;
        this.models = {
            BUHL: {},
            VPM: {},
        };
        this.charts = {
            bottom: [],
            deco: [],
        };
        this.stages = ["bottom", "deco"];
        this.aceChart = {
            render: false,
            available: 0,
            runtime: 0,
            error: false,
            chart: null,
        };
        this.gasRule = 1;
        this.editPlan = true;
        this.isShown = undefined;
        this.diveDataToShare = undefined;
        this.dive = new DecoplannerDive();
        this.updateView = true;
    }
    update() {
        if (this.isShown)
            this.updateCharts();
    }
    updateDiveDataToShare() {
        this.updateViewParams();
    }
    componentWillLoad() {
        this.updateViewParams();
    }
    disconnectedCallback() {
        this.stages.forEach((stage) => {
            this.models.BUHL.configuration[stage].forEach((tank, key) => {
                if (tank.show === true) {
                    let chartId = "chart-" + stage + "-" + key;
                    FusionchartsService.disposeChart(chartId);
                }
            });
        });
        FusionchartsService.disposeChart("chart-container-ace");
    }
    updateViewParams() {
        const params = this.diveDataToShare;
        this.editPlan = params.editPlan == false ? false : true;
        this.divePlan = params.divePlan;
        this.index = params.index;
        this.dives = this.divePlan.dives;
        this.dive = this.divePlan.dives[this.index];
        this.parameters = this.divePlan.configuration.parameters;
        this.aceChart.render = this.parameters.configuration != "OC";
        this.aceChart.available = this.parameters.ace_time;
        this.calculateGas();
        this.createCharts();
    }
    updateGasRule() {
        this.diveMinGas = {
            Lt: this.dive[this.selectedModelGasView].gasRules.MG.Lt,
            cuft: this.dive[this.selectedModelGasView].gasRules.MG.cuft,
            time: this.dive[this.selectedModelGasView].gasRules.MG.time,
        };
        this.diveUsableGas = {
            Lt: this.dive[this.selectedModelGasView].gasRules.UG.Lt,
            cuft: this.dive[this.selectedModelGasView].gasRules.UG.cuft,
            time: this.dive[this.selectedModelGasView].gasRules.UG.time,
        };
        this.diveTurnGas = {
            Lt: this.diveMinGas.Lt + lodash.exports.round(this.diveUsableGas.Lt / this.gasRule),
            cuft: this.diveMinGas.cuft + lodash.exports.round(this.diveUsableGas.cuft / this.gasRule),
            time: this.diveUsableGas.time / this.gasRule,
        };
        this.updateView = !this.updateView;
    }
    calculateGas() {
        let array = ["BUHL", "VPM"];
        this.charts = {
            bottom: [],
            deco: [],
        };
        array.forEach((model) => {
            this.models[model] = {
                gasRules: lodash.exports.cloneDeep(this.dive[model].gasRules),
                consumption: lodash.exports.cloneDeep(this.dive[model].consumption),
                configuration: lodash.exports.cloneDeep(this.divePlan.configuration.configuration),
            };
            //find back gas
            //let totalBottomVolume = 0;
            //let CCR = this.parameters.configuration == "CCR";
            this.models[model].configuration.bottom.forEach((tank) => {
                const bottomStageVolume = DiveToolsService.isMetric()
                    ? 14
                    : DiveToolsService.ltToCuFt(14);
                if (tank.volume < bottomStageVolume) {
                    tank.type = "bottomStage";
                }
                else {
                    tank.type = "backGas";
                }
                //totalBottomVolume += tank.volume;
                const O2StageVolume = DiveToolsService.isMetric()
                    ? 7
                    : DiveToolsService.ltToCuFt(7);
                if (tank.volume < O2StageVolume) {
                    if (tank.gas.fO2 == 1) {
                        tank.type = "CCR_Oxygen";
                    }
                    else {
                        tank.type = "CCR_Diluent";
                    }
                    //totalBottomVolume -= tank.volume;
                }
            });
            //order by volume inverse
            this.models[model].configuration.bottom = lodash.exports.sortBy(this.models[model].configuration.bottom, "volume");
            //order deco starting from Oxygen
            this.models[model].configuration.deco = lodash.exports.sortBy(this.models[model].configuration.deco, "gas.fromDepth");
            this.models[model].consumption = lodash.exports.sortBy(this.models[model].consumption, "fromDepth");
            //calculate available and used volumes
            let decoGasCount = 0;
            lodash.exports.forEach(this.models[model].consumption, (gas) => {
                let required = gas.required;
                let used = gas.used;
                if (!gas.deco) {
                    //bottom gas
                    if (gas.fO2 == 1) {
                        //CCR oxygen
                        this.models[model].configuration.bottom.forEach((tank) => {
                            if (tank.type == "CCR_Oxygen") {
                                tank.available = tank.getGasVolume();
                                tank.used = used;
                                tank.required = used;
                                tank.chartPercent = lodash.exports.round((used / tank.available) * 100);
                                tank.gas = new Gas(gas.fO2, gas.fHe, gas.fromDepth, gas.ppO2, gas.units);
                                tank.show = true;
                                this.aceChart.render = true;
                                let runtime = this.dive.CCR[model].runtime;
                                this.aceChart.runtime = runtime;
                            }
                        });
                    }
                    else {
                        //bottom gas
                        //fill diluent bottle
                        let diluent = lodash.exports.find(this.models[model].configuration.bottom, {
                            type: "CCR_Diluent",
                        });
                        if (diluent) {
                            diluent.available = diluent.getGasVolume();
                            diluent.used = used;
                            diluent.required = used;
                            diluent.chartPercent = lodash.exports.round((used / diluent.available) * 100);
                            used = 0;
                            diluent.show = true;
                        }
                        //fill back gas or bailout
                        this.models[model].configuration.bottom.forEach((tank) => {
                            if (tank.type != "CCR_Oxygen" && tank.type != "CCR_Diluent") {
                                tank.available = tank.getGasVolume();
                                tank.used =
                                    tank.type == "bottomStage" && used > tank.available
                                        ? tank.available
                                        : used;
                                used -= tank.used;
                                tank.required =
                                    tank.type == "bottomStage" && required > tank.available
                                        ? tank.available
                                        : required;
                                tank.chartPercent = lodash.exports.round((tank.required / tank.available) * 100);
                                required -= tank.available;
                                tank.gas = new Gas(gas.fO2, gas.fHe, gas.fromDepth, gas.ppO2, gas.units);
                                tank.show = true;
                            }
                            //set to 0 if extra tank
                            used = used < 0 ? 0 : used;
                            required = required < 0 ? 0 : required;
                        });
                    }
                }
                else {
                    //find deco tank
                    if (this.models[model].configuration.deco[decoGasCount]) {
                        let tank = this.models[model].configuration.deco[decoGasCount];
                        tank.available = tank.getGasVolume();
                        tank.required = gas.required;
                        tank.chartPercent = lodash.exports.round((tank.required / tank.available) * 100);
                        tank.used = gas.used;
                        tank.gas = new Gas(gas.fO2, gas.fHe, gas.fromDepth, gas.ppO2, gas.units);
                        tank.show = true;
                        decoGasCount++;
                    }
                }
            });
        });
        this.updateGasRule();
    }
    async createCharts() {
        //create charts
        let chartData = {
            id: null,
            type: "vled",
            renderAt: null,
            width: 50,
            height: 200,
            dataFormat: "json",
            dataSource: null,
        };
        //create charts
        this.stages.forEach((stage) => {
            this.models.BUHL.configuration[stage].forEach((tank, key) => {
                if (tank.show === true) {
                    let chartId = "chart-" + stage + "-" + key;
                    let containerId = "chart-container-" + stage + "-" + key;
                    this.chartElements[containerId] = null;
                    chartData.id = chartId;
                    chartData.renderAt = containerId;
                    const chart = FusionchartsService.createChart(chartData);
                    this.charts[stage].push({
                        chart,
                        tank,
                    });
                }
            });
        });
        if (this.aceChart.render) {
            let chartId = "chart-ace";
            let containerId = "chart-container-ace";
            this.chartElements[containerId] = null;
            chartData.id = chartId;
            chartData.renderAt = containerId;
            this.aceChart.chart = FusionchartsService.createChart(chartData);
            this.charts.bottom.push(this.aceChart);
        }
        setTimeout(() => this.updateCharts());
    }
    updateCharts() {
        this.refreshChartElements();
        this.stages.forEach((stage) => {
            let dataSource;
            this.models[this.selectedModelGasView].configuration[stage].forEach((tank, key) => {
                if (tank.show === true) {
                    let usedPerc = lodash.exports.round((tank.used / tank.available) * 100);
                    let requiredPerc = lodash.exports.round((tank.required / tank.available) * 100);
                    usedPerc = usedPerc > 100 ? 100 : usedPerc;
                    requiredPerc = requiredPerc > 100 ? 100 : requiredPerc;
                    dataSource = {
                        chart: {
                            manageresize: "1",
                            showTickMarks: false,
                            showTickValues: false,
                            showLimits: false,
                            upperlimit: tank.chartPercent > 100 ? tank.chartPercent : 100,
                            lowerlimit: "0",
                            decimals: "0",
                            ledgap: "0",
                            numberSuffix: "%",
                            ledsize: "1",
                            ledborderthickness: "4",
                            showborder: "0",
                            bgColor: tank.chartPercent > 100 ? "#f55d5d" : "#ffffff",
                            bgAlpha: 100,
                            valueFontColor: tank.chartPercent > 100 ? "#d00000" : "#000000",
                        },
                        colorrange: {
                            color: [
                                {
                                    minvalue: "0",
                                    maxvalue: usedPerc,
                                    code: "99cc00",
                                },
                                {
                                    minvalue: usedPerc,
                                    maxvalue: requiredPerc,
                                    code: "ffcc33",
                                },
                                {
                                    minvalue: requiredPerc,
                                    maxvalue: tank.chartPercent < 100 ? 100 : tank.chartPercent,
                                    code: "cf0000",
                                },
                                {
                                    minvalue: tank.available,
                                    maxvalue: tank.available,
                                    code: "000000",
                                },
                            ],
                        },
                        value: tank.chartPercent,
                    };
                    this.charts[stage][key].tank = tank;
                    this.charts[stage][key].chart.setJSONData(dataSource);
                    if (this.chartElements["chart-container-" + stage + "-" + key] &&
                        this.charts[stage][key].chart)
                        this.charts[stage][key].chart.render();
                }
            });
            if (this.aceChart.render) {
                this.aceChart.runtime =
                    this.dive.CCR[this.selectedModelGasView].runtime;
                let error = this.aceChart.runtime > this.aceChart.available;
                this.aceChart.error = error;
                dataSource.chart.numberSuffix = " min";
                dataSource.chart.upperlimit = error
                    ? this.aceChart.runtime
                    : this.aceChart.available;
                dataSource.chart.bgColor = error ? "#f55d5d" : "#ffffff";
                dataSource.chart.valueFontColor = error ? "#d00000" : "#000000";
                let first = error ? this.aceChart.available : this.aceChart.runtime;
                let second = error ? first : this.aceChart.available;
                let third = error ? this.aceChart.runtime : second;
                dataSource.colorrange.color = [
                    {
                        minvalue: "0",
                        maxvalue: first,
                        code: "99cc00",
                    },
                    {
                        minvalue: first,
                        maxvalue: second,
                        code: "ffffff",
                    },
                    {
                        minvalue: second,
                        maxvalue: third,
                        code: "cf0000",
                    },
                ];
                dataSource.value = this.aceChart.runtime;
                if (this.aceChart.chart) {
                    this.aceChart.chart.setJSONData(dataSource);
                    this.aceChart.chart.render();
                }
            }
        });
        this.updateView = !this.updateView;
    }
    selectGasRule(ev) {
        this.gasRule = lodash.exports.toNumber(ev.detail.value);
        this.updateGasRule();
    }
    refreshChartElements() {
        Object.keys(this.chartElements).forEach((element) => {
            this.chartElements[element] = this.el.querySelector("#" + element);
        });
    }
    segmentChanged(ev) {
        if (ev.detail.value) {
            this.selectedModelGasView = ev.detail.value;
            this.updateCharts();
            this.updateGasRule();
        }
    }
    render() {
        return (h("div", { key: '735bf1fe17eed430749b303b60d9fa83fda7bc4b', class: "slider-container" }, h("div", { key: 'fd72aecbfaaef1ac8b819abc051c758d5b838b14', class: "slider-scrollable-header" }, h("ion-segment", { key: '08dbefd24fffe572c69e96abf4e2fb92184d319b', mode: "ios", color: Environment.getAppColor(), onIonChange: (ev) => this.segmentChanged(ev), value: this.selectedModelGasView }, h("ion-segment-button", { key: '694bbd6e6c2b3bfc033c9185b716e6befb6a0858', value: "BUHL" }, h("ion-label", { key: 'beb7649d79e10d47ed2ccff90e5f686ce743f54b' }, "BUHL")), h("ion-segment-button", { key: 'aafd16ee3e1794c93cbe8086f7ec83798d2a696c', value: "VPM" }, h("ion-label", { key: '9cfb93df34750c51008091db51e129ff2fd88fea' }, "VPM")))), h("div", { key: 'eca7a300df7550c68ff6bd090c79a15874dcb15e', class: "slider-scrollable-container" }, h("ion-list", { key: 'f8423deb594a4d2cf53f85b15eac03d8cfc6a1d7' }, this.editPlan ? (h("ion-item", null, h("ion-select", { label: TranslationService.getTransl("bottom-gas-rule", "Bottom Gas Rule"), onIonChange: (ev) => this.selectGasRule(ev), value: this.gasRule }, h("ion-select-option", { value: 1 }, "All Usable"), h("ion-select-option", { value: 2 }, "Half Usable"), h("ion-select-option", { value: 3 }, "One Third Usable")))) : undefined, h("ion-item", { key: 'a9eb05ba4482964b962205250c0c6a11377eb34e' }, h("ion-label", { key: 'eca81bc5b0e7d791e1af809721876a9da280f424', position: "stacked" }, h("my-transl", { key: '408c6fec0d6de76197c6b707c1b5830e05810571', tag: "minimum-gas", text: "Minimum Gas" })), h("div", { key: '1911c497e34d8c8f178740153164f40c383c81ca', "item-content": true }, h("span", { key: '23e4c354b9c9e4c50c204632c3219c83e4e41d30' }, lodash.exports.round(this.diveMinGas.time, 1), " min /", " ", this.parameters.units != "Imperial" ? (h("span", null, lodash.exports.round(this.diveMinGas.Lt, 1))) : (h("span", null, lodash.exports.round(this.diveMinGas.cuft, 0), " ")), " ", this.parameters.volumeUnit, this.showAvailableGas ? (h("span", null, "/", this.parameters.units != "Imperial" ? (h("span", null, lodash.exports.round(this.diveMinGas.bar, 1))) : (h("span", null, lodash.exports.round(this.diveMinGas.psi, 0), " ")), " ", this.parameters.pressureUnit)) : undefined))), h("ion-item", { key: '190e681ae36360b1123e70592e43d648f033eba9' }, h("ion-label", { key: 'ab6f2e6789df2dad35520a45e06d9f271af30d42', position: "stacked" }, h("my-transl", { key: '6ca225f9e074be2ac2980e2438e32b2829b20614', tag: "usable-gas", text: "Usable Gas" })), h("div", { key: '638d1adbe500cc2321447f595624e8cbbeeb84b6', "item-content": true }, h("span", { key: '4e7f31b349c6df900e104d524f8068423bf082f9' }, lodash.exports.round(this.diveUsableGas.time, 1), " min /", " ", this.parameters.units != "Imperial" ? (h("span", null, lodash.exports.round(this.diveUsableGas.Lt, 1))) : (h("span", null, lodash.exports.round(this.diveUsableGas.cuft, 0), " ")), " ", this.parameters.volumeUnit, this.showAvailableGas ? (h("span", null, "/", this.parameters.units != "Imperial" ? (h("span", null, lodash.exports.round(this.diveUsableGas.bar, 1))) : (h("span", null, lodash.exports.round(this.diveUsableGas.psi, 0))), " ", this.parameters.pressureUnit)) : undefined))), this.diveTurnGas.time < this.diveUsableGas.time ? (h("ion-item", null, h("ion-label", { position: "stacked" }, h("my-transl", { tag: "turn-gas", text: "Turn Gas" })), h("div", { "item-content": true }, h("span", null, lodash.exports.round(this.diveTurnGas.time, 1), " min /", " ", this.parameters.units != "Imperial" ? (h("span", null, lodash.exports.round(this.diveTurnGas.Lt, 1))) : (h("span", null, lodash.exports.round(this.diveTurnGas.cuft, 0), " ")), " ", this.parameters.volumeUnit, this.showAvailableGas ? (h("span", null, "/", this.parameters.units != "Imperial" ? (h("span", null, lodash.exports.round(this.diveTurnGas.bar, 1))) : (h("span", null, lodash.exports.round(this.diveTurnGas.psi, 0))), " ", this.parameters.pressureUnit)) : undefined)))) : undefined, this.stages.map((stage) => (h("div", null, this.models[this.selectedModelGasView].configuration[stage]
            .length > 0 ? (h("ion-list-header", null, h("ion-grid", { class: "ion-no-padding" }, h("ion-row", null, stage == "bottom" ? (h("ion-col", null, h("my-transl", { tag: "bottom", text: "Bottom", isLabel: true }))) : (h("ion-col", null, h("my-transl", { tag: "deco", text: "Deco", isLabel: true }))))))) : undefined, this.models[this.selectedModelGasView].configuration[stage]
            .length > 0 ? (h("ion-grid", null, h("ion-row", { class: "ion-justify-content-center" }, this.charts[stage].map((item, i) => (h("ion-col", { size: "12", "size-sm": true }, item.render ? (h("ion-card", { style: {
                minWidth: "150px",
                background: item.error ? "#f55d5d" : "#ffffff",
            } }, h("ion-card-content", { class: "ion-text-center" }, h("ion-grid", { class: "ion-no-padding" }, h("ion-row", { class: "ion-justify-content-center" }, h("ion-col", { size: "4" }, h("div", { id: "chart-container-ace", style: { height: "200px" } })), h("ion-col", { size: "8" }, h("ion-row", null, h("strong", null, h("my-transl", { tag: "ace", text: "ACE" }))), h("ion-row", null, h("span", null)), h("ion-row", null, h("i", null, h("my-transl", { tag: "available", text: "Available" })), ":"), h("ion-row", null, item.available, " min"), h("ion-row", null, h("i", null, "Required"), h("span", null, ": ")), h("ion-row", null, item.runtime, " min"), item.error ? (h("ion-row", { class: "ion-justify-content-center" }, h("ion-icon", { name: "warning", class: "color-red" }))) : undefined)))))) : undefined, item.tank ? (h("ion-card", { style: {
                minWidth: "150px",
                background: item.tank && item.tank.chartPercent > 100
                    ? "#f55d5d"
                    : "#ffffff",
            } }, h("ion-card-content", { class: "ion-text-center", id: "card-content" }, h("ion-grid", { class: "ion-no-padding" }, h("ion-row", null, h("ion-col", { size: "4" }, h("div", { id: "chart-container-" + stage + "-" + i, style: { height: "200px" } })), h("ion-col", { size: "8" }, h("ion-row", { class: "ion-justify-content-center" }, h("ion-col", null, h("strong", null, item.tank.name, " (", item.tank.gas.toString(), ")"))), h("ion-row", null, h("ion-col", null, h("span", null))), h("ion-row", { class: "ion-justify-content-center" }, h("ion-col", null, h("i", null, h("my-transl", { tag: "available", text: "Available" })), ":", " ", item.tank.chartPercent > 100 ? (h("strong", { class: "color-yellow" }, "100%")) : undefined)), h("ion-row", { class: "ion-justify-content-center" }, h("ion-col", null, item.tank.pressure, this.parameters.pressureUnit, " /", " ", lodash.exports.round(item.tank.getGasVolume(), 0), this.parameters.volumeUnit)), h("ion-row", { class: "ion-justify-content-center" }, h("ion-col", null, h("i", null, h("my-transl", { tag: "required", text: "Required" })), ":", " ", h("strong", { class: item.tank.chartPercent > 100
                ? "color-red"
                : item.tank.chartPercent <= 100
                    ? "color-yellow"
                    : undefined }, lodash.exports.round(item.tank.chartPercent, 0), "%"))), h("ion-row", { class: "ion-justify-content-center" }, h("ion-col", null, lodash.exports.round((item.tank.pressure *
            item.tank.required) /
            item.tank.available, 0), this.parameters.pressureUnit, " /", " ", lodash.exports.round(item.tank.required, 0), this.parameters.volumeUnit)), h("ion-row", { class: "ion-justify-content-center" }, h("ion-col", null, h("i", null, h("my-transl", { tag: "used", text: "Used" })), ":", " ", h("strong", { class: "color-green" }, lodash.exports.round((item.tank.used /
            item.tank.available) *
            100, 0), "%"))), h("ion-row", { class: "ion-justify-content-center" }, h("ion-col", null, lodash.exports.round((item.tank.pressure *
            item.tank.used) /
            item.tank.available, 0), this.parameters.pressureUnit, " /", " ", lodash.exports.round(item.tank.used, 0), this.parameters.volumeUnit)), item.tank.chartPercent > 100 ? (h("ion-row", { class: "ion-justify-content-center" }, h("ion-icon", { name: "warning", class: "color-red" }))) : undefined)))))) : undefined)))))) : undefined)))))));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "isShown": ["update"],
        "diveDataToShare": ["updateDiveDataToShare"]
    }; }
};
AppDecoplannerGas.style = appDecoplannerGasCss;

export { AppDecoplannerGas as app_decoplanner_gas };

//# sourceMappingURL=app-decoplanner-gas.entry.js.map