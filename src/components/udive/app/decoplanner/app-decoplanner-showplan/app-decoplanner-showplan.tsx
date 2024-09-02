import {Component, h, Prop, State} from "@stencil/core";
import {DecoplannerDive} from "../../../../../interfaces/udive/planner/decoplanner-dive";
import {DivePlan} from "../../../../../services/udive/planner/dive-plan";
import {DecoplannerParameters} from "../../../../../interfaces/udive/planner/decoplanner-parameters";
import {DiveConfiguration} from "../../../../../interfaces/udive/planner/dive-configuration";

@Component({
  tag: "app-decoplanner-showplan",
  styleUrl: "app-decoplanner-showplan.scss",
})
export class AppDecoplannerShowPlan {
  @Prop() diveDataToShare: any;
  @Prop() planner? = false;
  @State() dive: DecoplannerDive = new DecoplannerDive();
  @State() updateView = true;

  user: any;
  dives: Array<DecoplannerDive>;
  screenWidth: number;
  screenHeight: number;
  index: number;
  divePlan: DivePlan;
  parameters: DecoplannerParameters;
  loading: any;
  diveConfiguration: DiveConfiguration;
  diveSite: any;

  async componentWillLoad() {
    this.diveParamsUpdate();
  }

  diveParamsUpdate() {
    const params = this.diveDataToShare;
    this.divePlan = params.divePlan;
    this.diveSite = params.diveSite;
    this.diveConfiguration = this.divePlan.configuration;
    this.index = params.index;
    this.dive = this.divePlan.dives[this.index];
    this.parameters = this.diveConfiguration.parameters;
    this.user = params.user;
  }

  render() {
    return (
      <div class="ion-no-padding">
        <ion-list class="ion-text-wrap">
          <ion-item-divider>
            <ion-label>
              <ion-text color="dark">
                <h2>
                  <my-transl tag="configuration" text="Configuration" />
                </h2>
              </ion-text>
            </ion-label>
            <ion-button slot="end" fill="clear">
              {this.diveConfiguration.stdName}
            </ion-button>
          </ion-item-divider>
          {this.diveSite ? (
            <ion-item-divider>
              <ion-label>
                <ion-text color="dark">
                  <h2>
                    <my-transl tag="dive-site" text="Dive Site" />
                  </h2>
                </ion-text>
              </ion-label>
              <ion-button slot="end" fill="clear">
                {this.diveSite.displayName}
              </ion-button>
            </ion-item-divider>
          ) : undefined}
          <ion-item>
            <ion-grid class="ion-text-center">
              <ion-row class="ion-text-capitalize">
                <ion-col>
                  <ion-text color="dark">
                    <h6>
                      <my-transl tag="depth" text="Depth" />
                    </h6>
                  </ion-text>
                </ion-col>
                <ion-col>
                  <ion-text color="dark">
                    <h6>
                      <my-transl tag="time" text="Time" />
                    </h6>
                  </ion-text>
                </ion-col>
                <ion-col>
                  <ion-text color="dark">
                    <h6>
                      O<sub>2</sub>
                    </h6>
                  </ion-text>
                </ion-col>
                <ion-col>
                  <ion-text color="dark">
                    <h6>He</h6>
                  </ion-text>
                </ion-col>
                {this.parameters.configuration == "CCR" ? (
                  <ion-col>
                    <ion-text color="dark">
                      <h6>
                        <my-transl tag="po2" text="pO2" />
                      </h6>
                    </ion-text>
                  </ion-col>
                ) : undefined}
              </ion-row>
            </ion-grid>
          </ion-item>
          <ion-item-group>
            {this.dive.profilePoints.map((level) => (
              <ion-item>
                <ion-reorder slot="end"></ion-reorder>
                <ion-grid class="ion-text-center">
                  <ion-row>
                    <ion-col>{level.depth}</ion-col>
                    <ion-col>{level.time}</ion-col>
                    <ion-col>{level.gas.O2}</ion-col>
                    <ion-col>{level.gas.He}</ion-col>
                    {this.parameters.configuration == "CCR" ? (
                      <ion-col>{level.setpoint}</ion-col>
                    ) : undefined}
                  </ion-row>
                </ion-grid>
              </ion-item>
            ))}
          </ion-item-group>
        </ion-list>
        {this.dive.decoGases.length > 0 ? (
          <ion-list class="ion-text-wrap">
            <ion-item-divider>
              <ion-label>
                <ion-text color="dark">
                  <h6>
                    <my-transl tag="deco-gases" text="Deco gases" />
                  </h6>
                </ion-text>
              </ion-label>
            </ion-item-divider>
            <ion-item class="ion-text-center">
              <ion-grid class="ion-text-center">
                <ion-row>
                  <ion-col>
                    <ion-text color="dark">
                      <h6>
                        <my-transl tag="from-depth" text="from Depth" />
                      </h6>
                    </ion-text>
                  </ion-col>
                  <ion-col>
                    <ion-text color="dark">
                      <h6>
                        O<sub>2</sub>
                      </h6>
                    </ion-text>
                  </ion-col>
                  <ion-col>
                    <ion-text color="dark">
                      <h6>He</h6>
                    </ion-text>
                  </ion-col>
                  {this.parameters.configuration == "CCR" ? (
                    <ion-col>
                      <ion-text color="dark">
                        <h6>
                          <my-transl tag="po2" text="pO2" />
                        </h6>
                      </ion-text>
                    </ion-col>
                  ) : undefined}
                </ion-row>
              </ion-grid>
            </ion-item>
            {this.dive.decoGases.map((gas) => (
              <ion-item class="ion-text-center">
                <ion-grid class="ion-text-center">
                  <ion-row>
                    <ion-col>{gas.fromDepth}</ion-col>
                    <ion-col>{gas.O2}</ion-col>
                    <ion-col>{gas.He}</ion-col>
                    {this.parameters.configuration == "CCR" ? (
                      <ion-col>{gas.ppO2}</ion-col>
                    ) : undefined}
                  </ion-row>
                </ion-grid>
              </ion-item>
            ))}
          </ion-list>
        ) : undefined}
      </div>
    );
  }
}
