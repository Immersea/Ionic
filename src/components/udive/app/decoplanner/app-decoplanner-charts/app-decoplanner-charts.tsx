import {Component, h, Prop, State, Watch, Element} from "@stencil/core";

import {DivePlan} from "../../../../../services/udive/planner/dive-plan";
import {DecoplannerParameters} from "../../../../../interfaces/udive/planner/decoplanner-parameters";
import {orderBy, toString} from "lodash";
import {GasBlenderService} from "../../../../../services/udive/planner/gas-blender";
import {TranslationService} from "../../../../../services/common/translations";

import {DecoplannerDive} from "../../../../../interfaces/udive/planner/decoplanner-dive";
import {Environment} from "../../../../../global/env";
import FusionCharts from "fusioncharts";
import {FusionchartsService} from "../../../../../services/common/fusioncharts";
import {slideHeight} from "../../../../../helpers/utils";
import {DiveToolsService} from "../../../../../services/udive/planner/dive-tools";

@Component({
  tag: "app-decoplanner-charts",
  styleUrl: "app-decoplanner-charts.scss",
})
export class AppDecoplannerCharts {
  @Element() el: HTMLElement;
  @Prop() diveDataToShare: any;
  @State() dive: DecoplannerDive = new DecoplannerDive();
  @State() updateView = true;
  @Prop() isShown: boolean;
  @Watch("isShown")
  update() {
    if (this.isShown) {
      this.createCharts();
    }
  }
  @Watch("diveDataToShare")
  updateDiveDataToShare() {
    this.updateViewParams();
  }

  chartElement: any;
  createThumbNail: any;
  renderedChart = "profile-chart";
  runtimeChartDataSource: any;
  runtimeChartData: any;
  runtimeChart: any;
  profileChartDataSource: any;
  profileChartData: any;
  profileChart: any;
  depthChartDataSet: any;
  depthChartDataSource: any;
  depthChartData: any;
  depthChart: any;
  heatMapDataSet: any;
  heatMapChartData: any;
  heatMapChartDataSource: any;
  heatMapChart: any;
  selectedCCRChart = "CCR";
  showChartFilters = false;

  dives: Array<DecoplannerDive>;
  index: number;
  divePlan: DivePlan;
  parameters: DecoplannerParameters = new DecoplannerParameters();
  tissueData: any;
  resolution = 3;
  chartsData: any;
  selectedCompartments = ["1", "4", "7", "10", "13", "16"]; //,"2","3","4","5","6","7","8","9","10","11","12","13","14","15","16"];
  showCompartments = [];
  selectedSeries = ["ppN2", "ppHe"]; //"maxAmb","mValue"
  showSeries = {
    ppN2: null,
    ppHe: null,
    maxAmb: null,
    mValue: null,
  };
  selectedGas = "N2";
  selectedChartModel = "BUHL";

  screenWidth: number;
  screenHeight: number;

  segmentTitles: {
    profiles: string;
    runtime: string;
    depth: string;
    heatmap: string;
  };

  editPlan = true;

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
    let runtimeData = this.divePlan.getCompartmentChart(
      this.tissueData,
      "runtime",
      this.index,
      this.resolution,
      oc,
      this.showCompartments,
      this.showSeries
    );
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
    let color_selected = 0,
      diveIndex = 0;
    let previousRuntime = 0,
      alpha = 15;
    let model =
      this.selectedChartModel == "BUHL" ? this.dive.BUHL : this.dive.VPM;
    let diveProfile = model.profile;
    if (diveIndex > 0) {
      vtrendLines.push({
        startvalue: previousRuntime,
        endvalue: previousRuntime + this.dive.surfaceInterval * 60,
        alpha: alpha,
        displayValue: TranslationService.getTransl(
          "surface-interval",
          "Surface Interval"
        ),
        color: colors[color_selected++],
      });
      color_selected = 0;
      previousRuntime += this.dive.surfaceInterval * 60;
    }
    let runtime = model.runtime;
    let gas,
      newgas,
      previousEnd = 0,
      end = 0,
      maxdepth = 0,
      maxruntime = 0;
    diveProfile.forEach((profile) => {
      if (!gas) gas = profile.gas;
      newgas = GasBlenderService.getGasName(profile.gas);
      if (newgas !== gas || profile.runtime >= runtime) {
        vtrendLines.push({
          startvalue: previousEnd + previousRuntime,
          endvalue:
            (profile.runtime < runtime ? end : runtime) + previousRuntime,
          alpha: alpha,
          displayValue: gas,
          color: colors[color_selected],
        });
        if (colors.length == color_selected) {
          color_selected = 0;
        } else {
          color_selected++;
        }
        previousEnd = end;
        gas = GasBlenderService.getGasName(profile.gas);
        if (profile.runtime >= runtime) {
          //repetitive dives
          diveIndex++;
          previousRuntime += model.runtime;
        } else {
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
      if (profile.depth > maxdepth) maxdepth = profile.depth;
    });

    //round maxdepth to next multiple of 3
    let maxdepthDecimals = maxdepth % 3 != 0;
    if (maxdepthDecimals) {
      maxdepth = Math.ceil(maxdepth / 3.0) * 3;
    } else {
      maxdepth = Math.ceil((maxdepth + 3) / 3.0) * 3;
    }
    let divLines = Math.ceil(maxdepth / 3) - 1;

    //add avergage depth trendLines
    trendLines.push({
      startvalue: -model.average_bottom_depth,
      linethickness: 1,
      displayvalue:
        TranslationService.getTransl("avg", "Avg.") +
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
    if (maxruntime > 90) steps = 10;
    let maxruntimeDecimals = maxruntime % steps != 0;
    if (maxruntimeDecimals) {
      maxruntime = Math.ceil(maxruntime / steps) * steps;
    } else {
      maxruntime = Math.ceil((maxruntime + steps) / steps) * steps;
    }
    let divVLines = Math.ceil(maxruntime / steps) - 1;

    this.profileChartDataSource = {
      chart: {
        theme: "fint",
        caption: TranslationService.getTransl("dive-profiles", "Dive Profiles"),
        subcaption: TranslationService.getTransl(
          "for-diff-models",
          "for different models"
        ),
        yaxisname:
          TranslationService.getTransl("depth", "Depth") +
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
        export: {enabled: false},
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
        caption: TranslationService.getTransl(
          "tissue-saturation-runtime",
          "Tissue saturation based on the dive runtime"
        ),
        subcaption:
          "(" + this.selectedChartModel + "-" + this.selectedCCRChart + ")",
        yaxisname:
          TranslationService.getTransl("depth", "Depth") +
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
        plotTooltext:
          "<div id='valueDiv'><b>$seriesName</b>, " +
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

    this.depthChartDataSet = this.divePlan.getCompartmentChart(
      this.tissueData,
      "depth",
      this.index,
      this.resolution,
      oc,
      this.showCompartments,
      this.showSeries
    );
    //reverse order dataset
    this.depthChartDataSet.map((data) => {
      data.data = orderBy(data.data, "item", "desc");
      return data;
    });
    this.depthChartDataSource = {
      chart: {
        theme: "fint",
        caption: TranslationService.getTransl(
          "tissue-saturation-depth",
          "Tissue saturation based on the dive depth"
        ),
        subcaption:
          "(" + this.selectedChartModel + "-" + this.selectedCCRChart + ")",
        yaxisname:
          TranslationService.getTransl("pressure", "Pressure") +
          ", " +
          DiveToolsService.pressUnit,
        xaxisname:
          TranslationService.getTransl("depth", "Depth") +
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
        plotTooltext:
          "<div id='valueDiv'><b>$seriesName</b>, " +
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

    this.heatMapDataSet = this.divePlan.getCompartmentChart(
      this.tissueData,
      "heatmap" + this.selectedGas,
      this.index,
      this.resolution,
      oc
    );
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
        caption:
          TranslationService.getTransl(
            "heatmap-tissues",
            "HeatMap of tissues supersaturation"
          ) +
          " (" +
          this.selectedGas +
          ")",
        subcaption:
          "(" + this.selectedChartModel + "-" + this.selectedCCRChart + ")",
        xAxisName:
          TranslationService.getTransl("depth", "Depth") +
          " (" +
          DiveToolsService.depthUnit +
          ")",
        yAxisName: TranslationService.getTransl(
          "tissues",
          "Tissues (Slow -> Fast)"
        ),
        showPlotBorder: 0,
        exportEnabled: 0,
      },
      rows: {
        row: rowIds,
      },
      columns: {
        column: columnIds,
      },
      dataset: [{data: this.heatMapDataSet}],
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
      this.chartsData = this.divePlan.getCompartmentsChartsData(
        this.tissueData,
        oc,
        this.index
      );
      for (let i = 0; i < 16; i++) {
        if (this.selectedCompartments.indexOf((i + 1).toString()) !== -1) {
          this.showCompartments[i] = true;
        } else {
          this.showCompartments[i] = false;
        }
      }
      if (this.selectedSeries.indexOf("ppN2") !== -1) {
        this.showSeries.ppN2 = true;
      } else {
        this.showSeries.ppN2 = false;
      }
      if (this.selectedSeries.indexOf("ppHe") !== -1) {
        this.showSeries.ppHe = true;
      } else {
        this.showSeries.ppHe = false;
      }
      if (this.selectedSeries.indexOf("maxAmb") !== -1) {
        this.showSeries.maxAmb = true;
      } else {
        this.showSeries.maxAmb = false;
      }
      if (this.selectedSeries.indexOf("mValue") !== -1) {
        this.showSeries.mValue = true;
      } else {
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

  renderChart(chart?) {
    this.refreshChartElement();
    if (this.chartElement) {
      if (chart) this.renderedChart = chart;
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
      } else {
        this.selectedCCRChart = this.parameters.configuration;
      }
    } else {
      if (this.selectedChartModel == "VPM") {
        this.selectedChartModel = "BUHL";
      } else {
        this.selectedChartModel = "VPM";
      }
    }
    this.updateView = !this.updateView;
    this.filterCharts(false);
  }

  private getTissueData() {
    let tissuesBUHL,
      tissuesVPM,
      oc = true;
    if (this.selectedCCRChart == "CCR" || this.selectedCCRChart == "pSCR") {
      oc = false;
    } else {
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
      <div class="ion-no-padding">
        <ion-row>
          <ion-col>
            <ion-segment
              onIonChange={(ev) => this.segmentChartChanged(ev)}
              color={Environment.getAppColor()}
              mode="ios"
              value={this.renderedChart}
            >
              <ion-segment-button value="profile-chart">
                <ion-label>{this.segmentTitles.profiles}</ion-label>
              </ion-segment-button>
              <ion-segment-button value="runtime-chart">
                <ion-label>{this.segmentTitles.runtime}</ion-label>
              </ion-segment-button>
              <ion-segment-button value="depth-chart">
                <ion-label>{this.segmentTitles.depth}</ion-label>
              </ion-segment-button>
              <ion-segment-button value="heatmap-chart">
                <ion-label>{this.segmentTitles.heatmap}</ion-label>
              </ion-segment-button>
            </ion-segment>
          </ion-col>
        </ion-row>
      </div>,
      <ion-fab
        vertical="top"
        horizontal="start"
        slot="fixed"
        style={{paddingTop: "50px"}}
      >
        <ion-fab-button size="small">
          <ion-icon name="funnel"></ion-icon>
        </ion-fab-button>
        <ion-fab-list side="end" style={{paddingTop: "55px"}}>
          {this.parameters.configuration != "OC" &&
          this.renderedChart !== "profile-chart" ? (
            <ion-fab-button onClick={() => this.switchCharts("CCR")}>
              {this.selectedCCRChart}
            </ion-fab-button>
          ) : undefined}
          {this.renderedChart !== "profile-chart" ? (
            <ion-fab-button onClick={() => this.switchCharts("model")}>
              {this.selectedChartModel == "BUHL" ? "VPM" : "BUHL"}
            </ion-fab-button>
          ) : undefined}

          <ion-fab-button onClick={() => this.presentFiltersPopover()}>
            <ion-icon name="options"></ion-icon>
          </ion-fab-button>
        </ion-fab-list>
      </ion-fab>,
      <div
        id="chart-container"
        style={{height: toString(this.screenHeight - 150) + "px"}}
      ></div>,
    ];
  }
}
