import { Component, h, Prop, Element } from "@stencil/core";
import { DiveConfiguration } from "../../../../../interfaces/udive/planner/dive-configuration";
import { UserRoles } from "../../../../../interfaces/common/user/user-roles";
import { DivePlanModel } from "../../../../../interfaces/udive/planner/dive-plan";
import { DivePlan } from "../../../../../services/udive/planner/dive-plan";
import { GasModel } from "../../../../../interfaces/udive/planner/gas-model";
import { DiveStandardsService } from "../../../../../services/udive/planner/dive-standards";
import { filter, orderBy } from "lodash";
import { Environment } from "../../../../../global/env";

@Component({
  tag: "modal-dive-template",
  styleUrl: "modal-dive-template.scss",
})
export class ModalDiveTemplate {
  @Element() el: HTMLElement;
  @Prop() stdConfigurations: Array<DiveConfiguration> = [];
  @Prop() index: number = 0;
  @Prop() userRoles: UserRoles;
  @Prop() selectedConfiguration: DiveConfiguration;
  @Prop() showPositionTab: boolean = false;
  @Prop() divePlanModel: DivePlanModel;
  @Prop() addDive?: boolean = false;
  divePlan: DivePlan;
  diveDataToShare: any;
  updateView = true;

  stdGases: Array<GasModel>;
  stdDecoGases: Array<GasModel>;

  componentWillLoad() {
    //convert into DivePlan provider and start calculations for the dive
    this.divePlan = new DivePlan();
    //this.divePlan.setProviders(this.translate)
    let newPlanModel = this.divePlanModel;
    if (!newPlanModel) {
      //insert new dive plan
      let selectedConfiguration = this.selectedConfiguration;
      //add new dive with selected config
      this.divePlan.setConfiguration(selectedConfiguration);
      let dive = this.divePlan.addDive();
      this.divePlan.resetDiveWithConfiguration(dive, selectedConfiguration);
    } else {
      this.divePlan.setConfiguration(newPlanModel.configuration);
      this.divePlan.setWithDivePlanModel(newPlanModel);
      if (this.addDive) {
        //insert new dive plan
        let dive = this.divePlan.addDive();
        this.divePlan.resetDiveWithConfiguration(
          dive,
          newPlanModel.configuration
        );
        this.index = this.divePlan.dives.length - 1;
      }
    }
    this.stdGases = [];
    this.stdDecoGases = [];
    let gases = [];
    DiveStandardsService.getStdGases().forEach((list) => {
      gases.push(list);
    });
    this.stdGases = filter(gases, { deco: false });
    this.stdGases = orderBy(this.stdGases, "fromDepth", "asc");
    this.stdDecoGases = filter(gases, { deco: true });
    this.stdDecoGases = orderBy(this.stdDecoGases, "fromDepth", "desc");

    this.diveDataToShare = {
      divePlan: this.divePlan,
      dive_less_time: null,
      dive_more_time: null,
      dive_less_depth: null,
      dive_more_depth: null,
      index: this.index,
      stdGases: this.stdGases,
      stdDecoGases: this.stdDecoGases,
      stdConfigurations: this.stdConfigurations,
      user: this.userRoles,
      showDiveSite: this.showPositionTab,
      showPositionTab: this.showPositionTab,
    };
  }

  updateParams(params) {
    this.divePlan.configuration.parameters = params.detail;
    this.updateView = !this.updateView;
  }

  save() {
    this.el.closest("ion-modal").dismiss(this.divePlan.getDivePlanModel());
  }

  close() {
    this.el.closest("ion-modal").dismiss();
  }
  render() {
    return [
      <app-navbar
        tag='deco-planner'
        text='Deco Planner'
        extra-title={this.divePlan.configuration.stdName}
        color={Environment.isDecoplanner() ? "gue-blue" : "planner"}
        modal={true}
      ></app-navbar>,
      <ion-content>
        <app-decoplanner-plan
          diveDataToShare={this.diveDataToShare}
          onUpdateParamsEvent={(params) => this.updateParams(params)}
        />
      </ion-content>,
      <app-modal-footer
        onCancelEmit={() => this.close()}
        onSaveEmit={() => this.save()}
      />,
    ];
  }
}
