import { Component, h, Prop, State, Element, Watch } from "@stencil/core";
import { DecoplannerDive } from "../../../../../interfaces/udive/planner/decoplanner-dive";
import { DivePlan } from "../../../../../services/udive/planner/dive-plan";
import { DecoplannerParameters } from "../../../../../interfaces/udive/planner/decoplanner-parameters";
//import { GasBlenderService } from "../../../../services/planner/gas-blender";
//import { DiveConfiguration } from "../../../../interfaces/udive/planner/dive-configuration";

import { cloneDeep, find, forEach, round, sortBy, toNumber } from "lodash";
import { Gas } from "../../../../../interfaces/udive/planner/gas";
import { DiveToolsService } from "../../../../../services/udive/planner/dive-tools";
import { Environment } from "../../../../../global/env";
import { FusionchartsService } from "../../../../../services/common/fusioncharts";
import { TranslationService } from "../../../../../services/common/translations";

@Component({
  tag: "app-decoplanner-gas",
  styleUrl: "app-decoplanner-gas.scss",
})
export class AppDecoplannerGas {
  @Element() el: HTMLElement;

  @Prop() isShown: boolean;
  @Prop() diveDataToShare: any;
  @State() dive: DecoplannerDive = new DecoplannerDive();
  @State() updateView = true;
  @Watch("isShown")
  update() {
    if (this.isShown) this.updateCharts();
  }

  @Watch("diveDataToShare")
  updateDiveDataToShare() {
    this.updateViewParams();
  }

  chartElements = {};
  dives: Array<DecoplannerDive>;
  index: number;
  divePlan: DivePlan;
  parameters: DecoplannerParameters;
  selectedModelGasView = "BUHL";
  showAvailableGas = false;
  models: any = {
    BUHL: {},
    VPM: {},
  };
  charts: any = {
    bottom: [],
    deco: [],
  };
  stages = ["bottom", "deco"];
  aceChart = {
    render: false,
    available: 0,
    runtime: 0,
    error: false,
    chart: null,
  };
  gasRule = 1;
  diveMinGas: any;
  diveUsableGas: any;
  diveTurnGas: any;

  editPlan = true;

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
      Lt: this.diveMinGas.Lt + round(this.diveUsableGas.Lt / this.gasRule),
      cuft:
        this.diveMinGas.cuft + round(this.diveUsableGas.cuft / this.gasRule),
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
        gasRules: cloneDeep(this.dive[model].gasRules),
        consumption: cloneDeep(this.dive[model].consumption),
        configuration: cloneDeep(this.divePlan.configuration.configuration),
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
        } else {
          tank.type = "backGas";
        }
        //totalBottomVolume += tank.volume;
        const O2StageVolume = DiveToolsService.isMetric()
          ? 7
          : DiveToolsService.ltToCuFt(7);
        if (tank.volume < O2StageVolume) {
          if (tank.gas.fO2 == 1) {
            tank.type = "CCR_Oxygen";
          } else {
            tank.type = "CCR_Diluent";
          }
          //totalBottomVolume -= tank.volume;
        }
      });
      //order by volume inverse
      this.models[model].configuration.bottom = sortBy(
        this.models[model].configuration.bottom,
        "volume"
      );
      //order deco starting from Oxygen
      this.models[model].configuration.deco = sortBy(
        this.models[model].configuration.deco,
        "gas.fromDepth"
      );
      this.models[model].consumption = sortBy(
        this.models[model].consumption,
        "fromDepth"
      );

      //calculate available and used volumes
      let decoGasCount = 0;
      forEach(this.models[model].consumption, (gas) => {
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
                tank.chartPercent = round((used / tank.available) * 100);
                tank.gas = new Gas(
                  gas.fO2,
                  gas.fHe,
                  gas.fromDepth,
                  gas.ppO2,
                  gas.units
                );
                tank.show = true;
                this.aceChart.render = true;
                let runtime = this.dive.CCR[model].runtime;
                this.aceChart.runtime = runtime;
              }
            });
          } else {
            //bottom gas
            //fill diluent bottle
            let diluent = find(this.models[model].configuration.bottom, {
              type: "CCR_Diluent",
            });
            if (diluent) {
              diluent.available = diluent.getGasVolume();
              diluent.used = used;
              diluent.required = used;
              diluent.chartPercent = round((used / diluent.available) * 100);
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
                tank.chartPercent = round(
                  (tank.required / tank.available) * 100
                );
                required -= tank.available;
                tank.gas = new Gas(
                  gas.fO2,
                  gas.fHe,
                  gas.fromDepth,
                  gas.ppO2,
                  gas.units
                );
                tank.show = true;
              }
              //set to 0 if extra tank
              used = used < 0 ? 0 : used;
              required = required < 0 ? 0 : required;
            });
          }
        } else {
          //find deco tank
          if (this.models[model].configuration.deco[decoGasCount]) {
            let tank = this.models[model].configuration.deco[decoGasCount];
            tank.available = tank.getGasVolume();
            tank.required = gas.required;
            tank.chartPercent = round((tank.required / tank.available) * 100);
            tank.used = gas.used;
            tank.gas = new Gas(
              gas.fO2,
              gas.fHe,
              gas.fromDepth,
              gas.ppO2,
              gas.units
            );
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
      this.models[this.selectedModelGasView].configuration[stage].forEach(
        (tank, key) => {
          if (tank.show === true) {
            let usedPerc = round((tank.used / tank.available) * 100);
            let requiredPerc = round((tank.required / tank.available) * 100);
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
            if (
              this.chartElements["chart-container-" + stage + "-" + key] &&
              this.charts[stage][key].chart
            )
              this.charts[stage][key].chart.render();
          }
        }
      );

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
    this.gasRule = toNumber(ev.detail.value);
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
    return (
      <div class='slider-container'>
        <div class='slider-scrollable-header'>
          <ion-segment
            mode='ios'
            color={Environment.getAppColor()}
            onIonChange={(ev) => this.segmentChanged(ev)}
            value={this.selectedModelGasView}
          >
            <ion-segment-button value='BUHL'>
              <ion-label>BUHL</ion-label>
            </ion-segment-button>
            <ion-segment-button value='VPM'>
              <ion-label>VPM</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>
        <div class='slider-scrollable-container'>
          <ion-list>
            {this.editPlan ? (
              <ion-item>
                <ion-select
                  label={TranslationService.getTransl(
                    "bottom-gas-rule",
                    "Bottom Gas Rule"
                  )}
                  onIonChange={(ev) => this.selectGasRule(ev)}
                  value={this.gasRule}
                >
                  <ion-select-option value={1}>All Usable</ion-select-option>
                  <ion-select-option value={2}>Half Usable</ion-select-option>
                  <ion-select-option value={3}>
                    One Third Usable
                  </ion-select-option>
                </ion-select>
              </ion-item>
            ) : undefined}

            <ion-item>
              <ion-label position='stacked'>
                <my-transl tag='minimum-gas' text='Minimum Gas' />
              </ion-label>
              <div item-content>
                <span>
                  {round(this.diveMinGas.time, 1)} min /{" "}
                  {this.parameters.units != "Imperial" ? (
                    <span>{round(this.diveMinGas.Lt, 1)}</span>
                  ) : (
                    <span>{round(this.diveMinGas.cuft, 0)} </span>
                  )}{" "}
                  {this.parameters.volumeUnit}
                  {this.showAvailableGas ? (
                    <span>
                      /
                      {this.parameters.units != "Imperial" ? (
                        <span>{round(this.diveMinGas.bar, 1)}</span>
                      ) : (
                        <span>{round(this.diveMinGas.psi, 0)} </span>
                      )}{" "}
                      {this.parameters.pressureUnit}
                    </span>
                  ) : undefined}
                </span>
              </div>
            </ion-item>
            <ion-item>
              <ion-label position='stacked'>
                <my-transl tag='usable-gas' text='Usable Gas' />
              </ion-label>
              <div item-content>
                <span>
                  {round(this.diveUsableGas.time, 1)} min /{" "}
                  {this.parameters.units != "Imperial" ? (
                    <span>{round(this.diveUsableGas.Lt, 1)}</span>
                  ) : (
                    <span>{round(this.diveUsableGas.cuft, 0)} </span>
                  )}{" "}
                  {this.parameters.volumeUnit}
                  {this.showAvailableGas ? (
                    <span>
                      /
                      {this.parameters.units != "Imperial" ? (
                        <span>{round(this.diveUsableGas.bar, 1)}</span>
                      ) : (
                        <span>{round(this.diveUsableGas.psi, 0)}</span>
                      )}{" "}
                      {this.parameters.pressureUnit}
                    </span>
                  ) : undefined}
                </span>
              </div>
            </ion-item>
            {this.diveTurnGas.time < this.diveUsableGas.time ? (
              <ion-item>
                <ion-label position='stacked'>
                  <my-transl tag='turn-gas' text='Turn Gas' />
                </ion-label>
                <div item-content>
                  <span>
                    {round(this.diveTurnGas.time, 1)} min /{" "}
                    {this.parameters.units != "Imperial" ? (
                      <span>{round(this.diveTurnGas.Lt, 1)}</span>
                    ) : (
                      <span>{round(this.diveTurnGas.cuft, 0)} </span>
                    )}{" "}
                    {this.parameters.volumeUnit}
                    {this.showAvailableGas ? (
                      <span>
                        /
                        {this.parameters.units != "Imperial" ? (
                          <span>{round(this.diveTurnGas.bar, 1)}</span>
                        ) : (
                          <span>{round(this.diveTurnGas.psi, 0)}</span>
                        )}{" "}
                        {this.parameters.pressureUnit}
                      </span>
                    ) : undefined}
                  </span>
                </div>
              </ion-item>
            ) : undefined}

            {this.stages.map((stage) => (
              <div>
                {this.models[this.selectedModelGasView].configuration[stage]
                  .length > 0 ? (
                  <ion-list-header>
                    <ion-grid class='ion-no-padding'>
                      <ion-row>
                        {stage == "bottom" ? (
                          <ion-col>
                            <my-transl
                              tag='bottom'
                              text='Bottom'
                              isLabel
                            ></my-transl>
                          </ion-col>
                        ) : (
                          <ion-col>
                            <my-transl
                              tag='deco'
                              text='Deco'
                              isLabel
                            ></my-transl>
                          </ion-col>
                        )}
                      </ion-row>
                    </ion-grid>
                  </ion-list-header>
                ) : undefined}
                {this.models[this.selectedModelGasView].configuration[stage]
                  .length > 0 ? (
                  <ion-grid>
                    <ion-row class='ion-justify-content-center'>
                      {this.charts[stage].map((item, i) => (
                        <ion-col size='12' size-sm>
                          {item.render ? (
                            <ion-card
                              style={{
                                minWidth: "150px",
                                background: item.error ? "#f55d5d" : "#ffffff",
                              }}
                            >
                              <ion-card-content class='ion-text-center'>
                                <ion-grid class='ion-no-padding'>
                                  <ion-row class='ion-justify-content-center'>
                                    <ion-col size='4'>
                                      <div
                                        id='chart-container-ace'
                                        style={{ height: "200px" }}
                                      ></div>
                                    </ion-col>
                                    <ion-col size='8'>
                                      <ion-row>
                                        <strong>
                                          <my-transl tag='ace' text='ACE' />
                                        </strong>
                                      </ion-row>
                                      <ion-row>
                                        <span></span>
                                      </ion-row>
                                      <ion-row>
                                        <i>
                                          <my-transl
                                            tag='available'
                                            text='Available'
                                          />
                                        </i>
                                        :
                                      </ion-row>
                                      <ion-row>{item.available} min</ion-row>
                                      <ion-row>
                                        <i>Required</i>
                                        <span>: </span>
                                      </ion-row>
                                      <ion-row>{item.runtime} min</ion-row>
                                      {item.error ? (
                                        <ion-row class='ion-justify-content-center'>
                                          <ion-icon
                                            name='warning'
                                            class='color-red'
                                          ></ion-icon>
                                        </ion-row>
                                      ) : undefined}
                                    </ion-col>
                                  </ion-row>
                                </ion-grid>
                              </ion-card-content>
                            </ion-card>
                          ) : undefined}
                          {item.tank ? (
                            <ion-card
                              style={{
                                minWidth: "150px",
                                background:
                                  item.tank && item.tank.chartPercent > 100
                                    ? "#f55d5d"
                                    : "#ffffff",
                              }}
                            >
                              <ion-card-content
                                class='ion-text-center'
                                id='card-content'
                              >
                                <ion-grid class='ion-no-padding'>
                                  <ion-row>
                                    <ion-col size='4'>
                                      <div
                                        id={
                                          "chart-container-" + stage + "-" + i
                                        }
                                        style={{ height: "200px" }}
                                      ></div>
                                    </ion-col>
                                    <ion-col size='8'>
                                      <ion-row class='ion-justify-content-center'>
                                        <ion-col>
                                          <strong>
                                            {item.tank.name} (
                                            {item.tank.gas.toString()})
                                          </strong>
                                        </ion-col>
                                      </ion-row>
                                      <ion-row>
                                        <ion-col>
                                          <span></span>
                                        </ion-col>
                                      </ion-row>
                                      <ion-row class='ion-justify-content-center'>
                                        <ion-col>
                                          <i>
                                            <my-transl
                                              tag='available'
                                              text='Available'
                                            />
                                          </i>
                                          :{" "}
                                          {item.tank.chartPercent > 100 ? (
                                            <strong class='color-yellow'>
                                              100%
                                            </strong>
                                          ) : undefined}
                                        </ion-col>
                                      </ion-row>
                                      <ion-row class='ion-justify-content-center'>
                                        <ion-col>
                                          {item.tank.pressure}
                                          {this.parameters.pressureUnit} /{" "}
                                          {round(item.tank.getGasVolume(), 0)}
                                          {this.parameters.volumeUnit}
                                        </ion-col>
                                      </ion-row>
                                      <ion-row class='ion-justify-content-center'>
                                        <ion-col>
                                          <i>
                                            <my-transl
                                              tag='required'
                                              text='Required'
                                            />
                                          </i>
                                          :{" "}
                                          <strong
                                            class={
                                              item.tank.chartPercent > 100
                                                ? "color-red"
                                                : item.tank.chartPercent <= 100
                                                  ? "color-yellow"
                                                  : undefined
                                            }
                                          >
                                            {round(item.tank.chartPercent, 0)}%
                                          </strong>
                                        </ion-col>
                                      </ion-row>
                                      <ion-row class='ion-justify-content-center'>
                                        <ion-col>
                                          {round(
                                            (item.tank.pressure *
                                              item.tank.required) /
                                              item.tank.available,
                                            0
                                          )}
                                          {this.parameters.pressureUnit} /{" "}
                                          {round(item.tank.required, 0)}
                                          {this.parameters.volumeUnit}
                                        </ion-col>
                                      </ion-row>
                                      <ion-row class='ion-justify-content-center'>
                                        <ion-col>
                                          <i>
                                            <my-transl tag='used' text='Used' />
                                          </i>
                                          :{" "}
                                          <strong class='color-green'>
                                            {round(
                                              (item.tank.used /
                                                item.tank.available) *
                                                100,
                                              0
                                            )}
                                            %
                                          </strong>
                                        </ion-col>
                                      </ion-row>
                                      <ion-row class='ion-justify-content-center'>
                                        <ion-col>
                                          {round(
                                            (item.tank.pressure *
                                              item.tank.used) /
                                              item.tank.available,
                                            0
                                          )}
                                          {this.parameters.pressureUnit} /{" "}
                                          {round(item.tank.used, 0)}
                                          {this.parameters.volumeUnit}
                                        </ion-col>
                                      </ion-row>
                                      {item.tank.chartPercent > 100 ? (
                                        <ion-row class='ion-justify-content-center'>
                                          <ion-icon
                                            name='warning'
                                            class='color-red'
                                          ></ion-icon>
                                        </ion-row>
                                      ) : undefined}
                                    </ion-col>
                                  </ion-row>
                                </ion-grid>
                              </ion-card-content>
                            </ion-card>
                          ) : undefined}
                        </ion-col>
                      ))}
                    </ion-row>
                  </ion-grid>
                ) : undefined}
              </div>
            ))}
          </ion-list>
        </div>
      </div>
    );
  }
}
