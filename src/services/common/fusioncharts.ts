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

class FusionchartsController {
  constructor() {
    //create Funsioncharts licence and dependencies
    FusionCharts.options["license"]({
      key: "8gG1kvdC8B2E6C2E3F2E2D2B3C1B5D6D3H-9jI-8G2C9uuyerF2D1iC-21hD1B5D1B2C2A17A10A12A4A4C5D2E3H4B3B2B-31bbA3C4E3rH2C1C5gjC-13D2D5F1H-8H-7lB8A5C7oqsH4G1B8D3B6E2F6D1D3G4F2tC-16D-13B2A3ME2B-7ziA2D4E1xkB4e1B2B11aarA4B2C3A1E1A1D3A6E1C4D1D4D4J2h==",
      creditLabel: false,
    });
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
