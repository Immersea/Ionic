// Import FusionCharts library
import FusionCharts from "fusioncharts";
// Import FusionCharts Charts module
import charts from "fusioncharts/fusioncharts.charts";
import excelexport from "fusioncharts/fusioncharts.excelexport";
import zoomline from "fusioncharts/fusioncharts.zoomline";
import zoomscatter from "fusioncharts/fusioncharts.zoomscatter";
import powercharts from "fusioncharts/fusioncharts.powercharts";
import widgets from "fusioncharts/fusioncharts.widgets";
import fint from "fusioncharts/themes/fusioncharts.theme.fint";
import { FUSIONCHARTSLICENSE } from "../../global/env";

class FusionchartsController {
  constructor() {
    //create Funsioncharts licence and dependencies
    FusionCharts.options["license"](FUSIONCHARTSLICENSE);
    //create charts
    FusionCharts.ready(() => {
      FusionCharts["debugger"].enable(false);
      //load modules
      charts(FusionCharts);
      excelexport(FusionCharts);
      zoomline(FusionCharts);
      zoomscatter(FusionCharts);
      powercharts(FusionCharts);
      fint(FusionCharts);
      widgets(FusionCharts);
    });
  }

  createChart(data) {
    if (data && data.id) {
      this.disposeChart(data);
      const chart = new FusionCharts(data);
      return chart;
    }
  }

  disposeChart(chart: any) {
    if (chart && chart.id && FusionCharts(chart.id)) {
      FusionCharts(chart.id).dispose();
    } else if (chart && FusionCharts(chart)) {
      FusionCharts(chart).dispose();
    }
  }
}

export const FusionchartsService = new FusionchartsController();
