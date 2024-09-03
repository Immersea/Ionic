import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { aU as DecoplannerParameters, a5 as DecoplannerDive, T as TranslationService, a7 as slideHeight, aH as GasBlenderService, a4 as DiveToolsService } from './utils-cbf49763.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-9be68260.js';
import { F as FusionchartsService, a as FusionCharts } from './fusioncharts-4fbd8033.js';
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

const appDecoplannerChartsCss = "app-decoplanner-charts{width:100%;height:100%}app-decoplanner-charts #chart-container{width:100%;height:100%}";

const AppDecoplannerCharts = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.renderedChart = "profile-chart";
        this.selectedCCRChart = "CCR";
        this.showChartFilters = false;
        this.parameters = new DecoplannerParameters();
        this.resolution = 3;
        this.selectedCompartments = ["1", "4", "7", "10", "13", "16"]; //,"2","3","4","5","6","7","8","9","10","11","12","13","14","15","16"];
        this.showCompartments = [];
        this.selectedSeries = ["ppN2", "ppHe"]; //"maxAmb","mValue"
        this.showSeries = {
            ppN2: null,
            ppHe: null,
            maxAmb: null,
            mValue: null,
        };
        this.selectedGas = "N2";
        this.selectedChartModel = "BUHL";
        this.editPlan = true;
        this.diveDataToShare = undefined;
        this.dive = new DecoplannerDive();
        this.updateView = true;
        this.isShown = undefined;
    }
    update() {
        if (this.isShown) {
            this.createCharts();
        }
    }
    updateDiveDataToShare() {
        this.updateViewParams();
    }
    componentWillLoad() {
        this.screenWidth = window.screen.width;
        this.screenHeight = window.screen.height;
        this.segmentTitles = {
            profiles: TranslationService.getTransl("profiles", "Profiles"),
            runtime: TranslationService.getTransl("runtime", "Runtime"),
            depth: TranslationService.getTransl("depth", "Depth"),
            heatmap: TranslationService.getTransl("heatmap", "Heatmap"),
        };
        this.updateViewParams();
    }
    refreshChartElement() {
        this.chartElement = this.el.querySelector("#chart-container");
    }
    componentDidLoad() {
        if (this.dive && this.dive.profilePoints.length > 0) {
            this.refreshChartElement();
            this.createCharts();
        }
    }
    async createCharts() {
        this.profileChart = FusionchartsService.createChart(this.profileChartData);
        this.runtimeChart = FusionchartsService.createChart(this.runtimeChartData);
        this.depthChart = FusionchartsService.createChart(this.depthChartData);
        this.heatMapChart = FusionchartsService.createChart(this.heatMapChartData);
        this.filterCharts(true);
    }
    disconnectedCallback() {
        //clear created FusionCharts
        FusionchartsService.disposeChart(this.profileChartData);
        FusionchartsService.disposeChart(this.runtimeChartData);
        FusionchartsService.disposeChart(this.depthChartData);
        FusionchartsService.disposeChart(this.heatMapChartData);
    }
    updateViewParams() {
        const params = this.diveDataToShare;
        this.editPlan = params.editPlan == false ? false : true;
        this.divePlan = params.divePlan;
        this.index = params.index;
        this.dives = this.divePlan.dives;
        this.dive = this.divePlan.dives[this.index];
        this.parameters = this.divePlan.configuration.parameters;
        this.selectedCCRChart = this.parameters.configuration;
        this.resetChartData();
    }
    /*
     * create charts
     */
    resetChartData() {
        let oc = this.getTissueData();
        let chartWidth = "100%";
        let chartHeight = slideHeight(null, 4, true);
        let runtimeData = this.divePlan.getCompartmentChart(this.tissueData, "runtime", this.index, this.resolution, oc, this.showCompartments, this.showSeries);
        let vtrendLines = [];
        let trendLines = [];
        let colors = [
            "1abc9c",
            "3498db",
            "e67e22",
            "c0392b",
            "f39c12",
            "2980b9",
            "16a085",
            "27ae60",
            "e74c3c",
            "d35400",
            "2ecc71",
        ];
        let color_selected = 0, diveIndex = 0;
        let previousRuntime = 0, alpha = 15;
        let model = this.selectedChartModel == "BUHL" ? this.dive.BUHL : this.dive.VPM;
        let diveProfile = model.profile;
        if (diveIndex > 0) {
            vtrendLines.push({
                startvalue: previousRuntime,
                endvalue: previousRuntime + this.dive.surfaceInterval * 60,
                alpha: alpha,
                displayValue: TranslationService.getTransl("surface-interval", "Surface Interval"),
                color: colors[color_selected++],
            });
            color_selected = 0;
            previousRuntime += this.dive.surfaceInterval * 60;
        }
        let runtime = model.runtime;
        let gas, newgas, previousEnd = 0, end = 0, maxdepth = 0, maxruntime = 0;
        diveProfile.forEach((profile) => {
            if (!gas)
                gas = profile.gas;
            newgas = GasBlenderService.getGasName(profile.gas);
            if (newgas !== gas || profile.runtime >= runtime) {
                vtrendLines.push({
                    startvalue: previousEnd + previousRuntime,
                    endvalue: (profile.runtime < runtime ? end : runtime) + previousRuntime,
                    alpha: alpha,
                    displayValue: gas,
                    color: colors[color_selected],
                });
                if (colors.length == color_selected) {
                    color_selected = 0;
                }
                else {
                    color_selected++;
                }
                previousEnd = end;
                gas = GasBlenderService.getGasName(profile.gas);
                if (profile.runtime >= runtime) {
                    //repetitive dives
                    diveIndex++;
                    previousRuntime += model.runtime;
                }
                else {
                    trendLines.push({
                        startvalue: -profile.depth,
                        linethickness: 2,
                        displayvalue: newgas,
                        color: colors[color_selected],
                        valueonright: "1",
                        dashed: 0,
                    });
                }
            }
            end = profile.runtime;
            if (profile.depth > maxdepth)
                maxdepth = profile.depth;
        });
        //round maxdepth to next multiple of 3
        let maxdepthDecimals = maxdepth % 3 != 0;
        if (maxdepthDecimals) {
            maxdepth = Math.ceil(maxdepth / 3.0) * 3;
        }
        else {
            maxdepth = Math.ceil((maxdepth + 3) / 3.0) * 3;
        }
        let divLines = Math.ceil(maxdepth / 3) - 1;
        //add avergage depth trendLines
        trendLines.push({
            startvalue: -model.average_bottom_depth,
            linethickness: 1,
            displayvalue: TranslationService.getTransl("avg", "Avg.") +
                " " +
                TranslationService.getTransl("bottom", "bottom"),
            color: colors[8],
            valueonright: "0",
            dashed: 1,
            dashgap: 5,
        });
        trendLines.push({
            startvalue: -this.dive.BUHL.average_dive_depth,
            linethickness: 1,
            displayvalue: TranslationService.getTransl("avg", "Avg.") + " BUHL",
            color: colors[9],
            valueonright: "0",
            dashed: 1,
            dashgap: 5,
        });
        trendLines.push({
            startvalue: -this.dive.VPM.average_dive_depth,
            linethickness: 1,
            displayvalue: TranslationService.getTransl("avg", "Avg.") + " VPM",
            color: colors[10],
            valueonright: "0",
            dashed: 1,
            dashgap: 5,
        });
        let profileData = this.divePlan.getDecoChart(this.index, true, true);
        maxruntime = profileData["maxruntime"];
        //round maxdepth to next multiple of 5
        let steps = 5;
        if (maxruntime > 90)
            steps = 10;
        let maxruntimeDecimals = maxruntime % steps != 0;
        if (maxruntimeDecimals) {
            maxruntime = Math.ceil(maxruntime / steps) * steps;
        }
        else {
            maxruntime = Math.ceil((maxruntime + steps) / steps) * steps;
        }
        let divVLines = Math.ceil(maxruntime / steps) - 1;
        this.profileChartDataSource = {
            chart: {
                theme: "fint",
                caption: TranslationService.getTransl("dive-profiles", "Dive Profiles"),
                subcaption: TranslationService.getTransl("for-diff-models", "for different models"),
                yaxisname: TranslationService.getTransl("depth", "Depth") +
                    ", " +
                    DiveToolsService.depthUnit,
                xaxisname: TranslationService.getTransl("runtime", "Runtime") + ", min",
                rotateYAxisName: "1",
                exportEnabled: 0,
                showBorder: "0",
                bgColor: "#ffffff",
                baseFont: "Helvetica Neue,Arial",
                showCanvasBorder: "0",
                showShadow: "0",
                showAlternateHGridColor: "0",
                canvasBgColor: "#ffffff",
                yaxismaxValue: 0,
                yAxisMinValue: -maxdepth,
                xAxisMaxValue: maxruntime,
                numDivLines: divLines,
                numVDivLines: divVLines,
                labelStep: 5,
                pixelsPerPoint: "0",
                pixelsPerLabel: "30",
                lineThickness: "1",
                compactdatamode: "1",
                dataseparator: "|",
                labelHeight: "30",
                scrollheight: "10",
                flatScrollBars: "1",
                scrollShowButtons: "0",
                scrollColor: "#cccccc",
                legendBgAlpha: "0",
                legendBorderAlpha: "0",
                legendShadow: "0",
                legendItemFontSize: "10",
                legendItemFontColor: "#666666",
                export: { enabled: false },
            },
            categories: [
                {
                    category: profileData["categories"],
                },
            ],
            dataset: profileData["dataset"],
            trendLines: [
                {
                    line: trendLines,
                },
            ],
        };
        this.profileChartData = {
            id: "profile-chart",
            type: "zoomline",
            renderAt: "chart-container",
            width: chartWidth,
            height: chartHeight,
            dataSource: this.profileChartDataSource,
        };
        this.runtimeChartDataSource = {
            chart: {
                theme: "fint",
                caption: TranslationService.getTransl("tissue-saturation-runtime", "Tissue saturation based on the dive runtime"),
                subcaption: "(" + this.selectedChartModel + "-" + this.selectedCCRChart + ")",
                yaxisname: TranslationService.getTransl("depth", "Depth") +
                    ", " +
                    DiveToolsService.depthUnit,
                xaxisname: TranslationService.getTransl("runtime", "Runtime") + ", min",
                rotateYAxisName: "1",
                adjustDiv: 0,
                adjustVDiv: 0,
                numDivLines: divLines,
                numVDivLines: divVLines,
                yAxisMaxValue: maxdepth,
                xAxisMaxValue: maxruntime,
                exportEnabled: 0,
                plotTooltext: "<div id='valueDiv'><b>$seriesName</b>, " +
                    TranslationService.getTransl("time", "Time") +
                    " (min) : <b>$xDataValue</b>, " +
                    TranslationService.getTransl("pressure", "Pressure") +
                    " (" +
                    DiveToolsService.pressUnit +
                    ") :<b>$yDataValue</b></div>",
            },
            dataset: runtimeData,
            vtrendLines: [
                {
                    line: oc ? vtrendLines : [],
                },
            ],
        };
        this.runtimeChartData = {
            id: "runtime-chart",
            type: "zoomscatter",
            renderAt: "chart-container",
            width: chartWidth,
            height: chartHeight,
            dataFormat: "json",
            dataSource: this.runtimeChartDataSource,
        };
        this.depthChartDataSet = this.divePlan.getCompartmentChart(this.tissueData, "depth", this.index, this.resolution, oc, this.showCompartments, this.showSeries);
        //reverse order dataset
        this.depthChartDataSet.map((data) => {
            data.data = lodash.exports.orderBy(data.data, "item", "desc");
            return data;
        });
        this.depthChartDataSource = {
            chart: {
                theme: "fint",
                caption: TranslationService.getTransl("tissue-saturation-depth", "Tissue saturation based on the dive depth"),
                subcaption: "(" + this.selectedChartModel + "-" + this.selectedCCRChart + ")",
                yaxisname: TranslationService.getTransl("pressure", "Pressure") +
                    ", " +
                    DiveToolsService.pressUnit,
                xaxisname: TranslationService.getTransl("depth", "Depth") +
                    ", " +
                    DiveToolsService.depthUnit,
                rotateYAxisName: 1,
                exportEnabled: 0,
                adjustDiv: 0,
                adjustVDiv: 0,
                numDivLines: divLines - (maxdepthDecimals ? 0 : 1),
                numVDivLines: divLines - (maxdepthDecimals ? 0 : 1),
                yAxisMaxValue: maxdepth - (maxdepthDecimals ? 0 : 3),
                xAxisMaxValue: maxdepth - (maxdepthDecimals ? 0 : 3),
                plotTooltext: "<div id='valueDiv'><b>$seriesName</b>, " +
                    TranslationService.getTransl("depth", "Depth") +
                    " (" +
                    DiveToolsService.depthUnit +
                    ") : <b>$xDataValue</b>, " +
                    TranslationService.getTransl("pressure", "Pressure") +
                    " (" +
                    DiveToolsService.pressUnit +
                    ") :<b>$yDataValue</b></div>",
            },
            dataset: this.depthChartDataSet,
        };
        this.depthChartData = {
            id: "depth-chart",
            type: "zoomscatter",
            renderAt: "chart-container",
            width: chartWidth,
            height: chartHeight,
            dataFormat: "json",
            dataSource: this.depthChartDataSource,
        };
        this.heatMapDataSet = this.divePlan.getCompartmentChart(this.tissueData, "heatmap" + this.selectedGas, this.index, this.resolution, oc);
        let rowIds = [];
        for (let i = 0; i <= 15; i++) {
            rowIds.push({
                id: i.toString(),
                label: "Tissue #" + (i + 1),
            });
        }
        let columnIds = [];
        for (let i = 1; i < this.heatMapDataSet[0].columns; i++) {
            columnIds.push({
                id: this.heatMapDataSet[i].columnid.toString(),
                label: this.heatMapDataSet[i].depth.toString(),
            });
        }
        this.heatMapChartDataSource = {
            chart: {
                theme: "fint",
                caption: TranslationService.getTransl("heatmap-tissues", "HeatMap of tissues supersaturation") +
                    " (" +
                    this.selectedGas +
                    ")",
                subcaption: "(" + this.selectedChartModel + "-" + this.selectedCCRChart + ")",
                xAxisName: TranslationService.getTransl("depth", "Depth") +
                    " (" +
                    DiveToolsService.depthUnit +
                    ")",
                yAxisName: TranslationService.getTransl("tissues", "Tissues (Slow -> Fast)"),
                showPlotBorder: 0,
                exportEnabled: 0,
            },
            rows: {
                row: rowIds,
            },
            columns: {
                column: columnIds,
            },
            dataset: [{ data: this.heatMapDataSet }],
            colorRange: {
                gradient: "1",
                minValue: "-100",
                code: "#00ffff",
                startLabel: TranslationService.getTransl("ongassing", "On-Gassing"),
                endLabel: TranslationService.getTransl("offgassing", "Off-Gassing"),
                color: [
                    {
                        code: "#00ffff",
                        minValue: "-100",
                        maxValue: "-80",
                        //"label": "60%"
                    },
                    {
                        code: "#0000ff",
                        minValue: "-80",
                        maxValue: "-40",
                        //"label": "30%"
                    },
                    {
                        code: "#7f00ff",
                        minValue: "-40",
                        maxValue: "-10",
                        //"label": "10%"
                    },
                    {
                        code: "#000",
                        minValue: "-10",
                        maxValue: "-2",
                    },
                    {
                        code: "#000",
                        minValue: "-2",
                        maxValue: "-1",
                    },
                    {
                        code: "#00ff00",
                        minValue: "-1",
                        maxValue: "0",
                        label: TranslationService.getTransl("saturated", "Saturated"),
                        //"label": "20%"
                    },
                    {
                        code: "#00ff00",
                        minValue: "0",
                        maxValue: "10",
                        //"label": "20%"
                    },
                    {
                        code: "#ffff00",
                        minValue: "10",
                        maxValue: "30",
                        //"label": "50%"
                    },
                    {
                        code: "#ff0000",
                        minValue: "30",
                        maxValue: "70",
                        //"label": "100%"
                    },
                    {
                        code: "#b30000",
                        minValue: "70",
                        maxValue: "100",
                        //"label": "100%"
                    },
                    {
                        code: "#ffffff",
                        minValue: "100",
                        maxValue: "120",
                        //"label": "120%"
                    },
                ],
            },
        };
        this.heatMapChartData = {
            id: "heatmap-chart",
            type: "heatmap",
            renderAt: "chart-container",
            width: chartWidth,
            height: chartHeight,
            dataFormat: "json",
            dataSource: this.heatMapChartDataSource,
        };
    }
    filterCharts(render = false) {
        if (this.dive.BUHL) {
            let oc = this.getTissueData();
            //update chart data and filter
            this.chartsData = this.divePlan.getCompartmentsChartsData(this.tissueData, oc, this.index);
            for (let i = 0; i < 16; i++) {
                if (this.selectedCompartments.indexOf((i + 1).toString()) !== -1) {
                    this.showCompartments[i] = true;
                }
                else {
                    this.showCompartments[i] = false;
                }
            }
            if (this.selectedSeries.indexOf("ppN2") !== -1) {
                this.showSeries.ppN2 = true;
            }
            else {
                this.showSeries.ppN2 = false;
            }
            if (this.selectedSeries.indexOf("ppHe") !== -1) {
                this.showSeries.ppHe = true;
            }
            else {
                this.showSeries.ppHe = false;
            }
            if (this.selectedSeries.indexOf("maxAmb") !== -1) {
                this.showSeries.maxAmb = true;
            }
            else {
                this.showSeries.maxAmb = false;
            }
            if (this.selectedSeries.indexOf("mValue") !== -1) {
                this.showSeries.mValue = true;
            }
            else {
                this.showSeries.mValue = false;
            }
            this.resetChartData();
            this.profileChart.setJSONData(this.profileChartDataSource);
            this.runtimeChart.setJSONData(this.runtimeChartDataSource);
            this.depthChart.setJSONData(this.depthChartDataSource);
            this.heatMapChart.setJSONData(this.heatMapChartDataSource);
            if (render && this.runtimeChart) {
                this.renderChart();
            }
        }
    }
    renderChart(chart) {
        this.refreshChartElement();
        if (this.chartElement) {
            if (chart)
                this.renderedChart = chart;
            let chartObj = FusionCharts(this.renderedChart);
            setTimeout(() => {
                chartObj.render();
            });
            this.updateView = !this.updateView;
        }
    }
    fullscreenChart() {
        /*this.showChartFilters = false;
          let cloned_chart = FusionCharts(this.renderedChart).clone();
          //let chartObj = new FusionCharts(cloned_chart);
          let modal = this.modalCtrl.create("ModalChartFullscreen",cloned_chart,{
              enableBackdropDismiss: false
          });
          modal.present();*/
    }
    switchCharts(type) {
        if (type == "CCR") {
            if (this.selectedCCRChart != "OC") {
                this.selectedCCRChart = "OC";
            }
            else {
                this.selectedCCRChart = this.parameters.configuration;
            }
        }
        else {
            if (this.selectedChartModel == "VPM") {
                this.selectedChartModel = "BUHL";
            }
            else {
                this.selectedChartModel = "VPM";
            }
        }
        this.updateView = !this.updateView;
        this.filterCharts(false);
    }
    getTissueData() {
        let tissuesBUHL, tissuesVPM, oc = true;
        if (this.selectedCCRChart == "CCR" || this.selectedCCRChart == "pSCR") {
            oc = false;
        }
        else {
            oc = true;
        }
        tissuesVPM = this.divePlan.createVPMTissuesFromDives();
        tissuesBUHL = this.divePlan.BUHL.tissues;
        this.tissueData =
            this.selectedChartModel == "BUHL" ? tissuesBUHL : tissuesVPM;
        return oc;
    }
    presentFiltersPopover() {
        this.showChartFilters = false;
        /*let params = {
            renderedChart: this.renderedChart,
            selectedCompartments: this.selectedCompartments,
            selectedSeries: this.selectedSeries,
            selectedGas: this.selectedGas,
            resolution: this.resolution
        }
        let popover = this.popoverCtrl.create("PopoverChartsFilters",params,{enableBackdropDismiss:false});
        popover.present({ ev: event});
        popover.onDidDismiss(updatedData => {
            if (updatedData) {
                this.renderedChart = updatedData.renderedChart;
                this.selectedCompartments = updatedData.selectedCompartments;
                this.selectedSeries = updatedData.selectedSeries;
                this.selectedGas = updatedData.selectedGas;
                this.resolution = updatedData.resolution;
                this.filterCharts();
            }
        });*/
    }
    segmentChartChanged(ev) {
        this.renderedChart = ev.detail.value;
        this.renderChart(this.renderedChart);
    }
    render() {
        return [
            h("div", { key: 'e8f650173d41da941ab720cd3b5cbbd42ad3d5a9', class: "ion-no-padding" }, h("ion-row", { key: 'e02dba6c8bc8e7ca96477efa969b9b6aa0984dd7' }, h("ion-col", { key: 'c563c1e706eeed7d2ed55969f667b60315bf44f6' }, h("ion-segment", { key: '6ce1c857249fb2665f692006ebb240e87cf0cdc0', onIonChange: (ev) => this.segmentChartChanged(ev), color: Environment.getAppColor(), mode: "ios", value: this.renderedChart }, h("ion-segment-button", { key: '9b078e3409a3aa09e6ac88534635d17a6840f703', value: "profile-chart" }, h("ion-label", { key: '0c02c071a5c2f87ecfc7a2bc7f07ee76b19cc19a' }, this.segmentTitles.profiles)), h("ion-segment-button", { key: 'c3cac680d8434bb847f50973c4213d6c49e21161', value: "runtime-chart" }, h("ion-label", { key: '57cac70cebdbfbeb908d95ec85f97b2242cf743e' }, this.segmentTitles.runtime)), h("ion-segment-button", { key: 'ec4541c9bc2a6659d245bdd2b39892f988a1a73c', value: "depth-chart" }, h("ion-label", { key: '8d43d744e8cbac5599b8b429e35c62280f060163' }, this.segmentTitles.depth)), h("ion-segment-button", { key: 'b2e273c610fb26081c779c6a189c139132104b22', value: "heatmap-chart" }, h("ion-label", { key: 'e0d80921d53b1fbd0c4463f090b5251baa772e07' }, this.segmentTitles.heatmap)))))),
            h("ion-fab", { key: 'e372577446b512d0a3973a3aeb039fbf70790cf7', vertical: "top", horizontal: "start", slot: "fixed", style: { paddingTop: "50px" } }, h("ion-fab-button", { key: '0559aafadcd346995c6b34819d64314ece7bae55', size: "small" }, h("ion-icon", { key: '6dea9f72128588b68aad25578e313bf6c8272aaa', name: "funnel" })), h("ion-fab-list", { key: '223c130a5bb7bee3f63e2948311a5cca47eb1d70', side: "end", style: { paddingTop: "55px" } }, this.parameters.configuration != "OC" &&
                this.renderedChart !== "profile-chart" ? (h("ion-fab-button", { onClick: () => this.switchCharts("CCR") }, this.selectedCCRChart)) : undefined, this.renderedChart !== "profile-chart" ? (h("ion-fab-button", { onClick: () => this.switchCharts("model") }, this.selectedChartModel == "BUHL" ? "VPM" : "BUHL")) : undefined, h("ion-fab-button", { key: '4de87fe9ec24bf4b060cc8964c79a767d6b68784', onClick: () => this.presentFiltersPopover() }, h("ion-icon", { key: 'd0d3128c7e0190d8f073c2e22bbd00d8b18bf192', name: "options" })))),
            h("div", { key: '867bb7c019daaef9dab7e2fb6858eb128addb4d7', id: "chart-container", style: { height: lodash.exports.toString(this.screenHeight - 150) + "px" } }),
        ];
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "isShown": ["update"],
        "diveDataToShare": ["updateDiveDataToShare"]
    }; }
};
AppDecoplannerCharts.style = appDecoplannerChartsCss;

export { AppDecoplannerCharts as app_decoplanner_charts };

//# sourceMappingURL=app-decoplanner-charts.entry.js.map