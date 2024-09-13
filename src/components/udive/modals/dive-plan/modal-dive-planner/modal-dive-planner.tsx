import { Component, h, Prop, State, Element } from "@stencil/core";

import { DecoplannerDive } from "../../../../../interfaces/udive/planner/decoplanner-dive";
import { DivePlan } from "../../../../../services/udive/planner/dive-plan";
//import { Config } from '../../../../../../providers/config';
import { UserRoles } from "../../../../../interfaces/common/user/user-roles";
//import { DataBase } from '../../../../../../providers/database';
import { DecoplannerParameters } from "../../../../../interfaces/udive/planner/decoplanner-parameters";
import { DiveStandardsService } from "../../../../../services/udive/planner/dive-standards";
//import { LicenceCheckProvider } from '../../../../../../providers/licence-check';
import { GasModel } from "../../../../../interfaces/udive/planner/gas-model";
import { filter, orderBy } from "lodash";
//import { DiveConfigurationsModel } from "../../../interfaces/udive/planner/dive-configurations-model";
import { DiveConfiguration } from "../../../../../interfaces/udive/planner/dive-configuration";
//import { Tank } from "../../../interfaces/udive/planner/tank";

import { DivePlanModel } from "../../../../../interfaces/udive/planner/dive-plan";
import { slideHeight } from "../../../../../helpers/utils";
import { UserService } from "../../../../../services/common/user";
import { Environment } from "../../../../../global/env";
import Swiper from "swiper";

@Component({
  tag: "modal-dive-planner",
  styleUrl: "modal-dive-planner.scss",
})
export class ModalDivePlanner {
  @Element() el: HTMLElement;

  loading: any;
  segments: any;
  dives: Array<DecoplannerDive>;
  dive: DecoplannerDive = new DecoplannerDive();
  dive_less_time: DecoplannerDive = new DecoplannerDive();
  dive_more_time: DecoplannerDive = new DecoplannerDive();
  dive_less_depth: DecoplannerDive = new DecoplannerDive();
  dive_more_depth: DecoplannerDive = new DecoplannerDive();
  selectedChartModel = "BUHL";
  selectedModelGasView = "BUHL";
  licences: any;
  divePlan: DivePlan;
  parameters: DecoplannerParameters;
  ranges: any;
  isSaving = false;
  diveDataToShare: any;
  screenHeight: number;
  headerHeight: number;
  chartHeight: number;
  chartTopMargin: number;
  @State() slider: Swiper;
  content: HTMLIonContentElement;

  showLoadingTab = true;

  profileChartDataSource: any;
  profileChartData: any;
  profileChart: any;

  stdGases: Array<GasModel>;
  stdDecoGases: Array<GasModel>;

  @Prop() stdConfigurations: Array<DiveConfiguration> = [];
  @Prop() index: number = 0;
  @Prop() userRoles: UserRoles;
  @Prop() selectedConfiguration: DiveConfiguration;
  @Prop() diveTripData: {
    date: Date;
    diveSiteId: string;
    divingCenterId: string;
  };
  @Prop() divePlanModel: DivePlanModel;
  @Prop() addDive?: boolean = false;
  @Prop() showDiveSite?: boolean = false;
  @Prop() showPositionTab?: boolean = false;
  @Prop() setDate?: boolean = false;

  @State() updateView = true;
  @State() segment: string = "plan";

  @State() showProfiles = false;

  @State() titles = [
    { tag: "plan", icon: "chevron-forward", slotIcon: "end" },
    {
      tag: "profile",
      disabled: true,
      icon: "chevron-forward",
      slotIcon: "end",
    },
    { tag: "gas", disabled: true, icon: "chevron-forward", slotIcon: "end" },
    { tag: "charts", disabled: true, icon: "chevron-forward", slotIcon: "end" },
    { tag: "settings", disabled: true },
  ];

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
      if (this.diveTripData) {
        this.divePlan.dives[0].diveSiteId = this.diveTripData.diveSiteId
          ? this.diveTripData.diveSiteId
          : null;
        this.divePlan.dives[0].divingCenterId = this.diveTripData.divingCenterId
          ? this.diveTripData.divingCenterId
          : null;
        this.divePlan.dives[0].date = this.diveTripData.date
          ? new Date(this.diveTripData.date)
          : new Date();
      }
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
        //set dive siteid to previous site
        if (this.index > 0) {
          this.divePlan.dives[this.index].diveSiteId =
            this.divePlan.dives[this.index - 1].diveSiteId;
        }
      }
    }
    //set updated date
    if (this.setDate) {
      this.divePlan.dives[this.index].date = new Date();
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

    this.update();

    this.showLoadingTab = false;
    //this.segment = 1;
    /*setTimeout(() => {
      this.tabsItem.select(this.currentTab);
    });*/
  }

  componentDidLoad() {
    this.slider = new Swiper(".slider-dive-planner", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
    });
    this.setSliderHeight();
  }

  setSliderHeight() {
    this.updateView = !this.updateView;

    //reset sliders height inside slider
    const slideContainers = Array.from(
      this.el.getElementsByClassName("slide-container")
    );
    slideContainers.map((container) => {
      container.setAttribute(
        "style",
        "height: " + slideHeight(null, 3, true) + "px"
      );
    });
    this.slider ? this.slider.updateAutoHeight() : null;
    this.slider ? this.slider.update() : undefined;
  }

  saveDoc(updateView = true) {
    if (updateView) this.update();
    //document is saved on modal dismiss
  }

  updateParams(params) {
    //this.divePlan.configuration.parameters = params.detail;
    this.divePlan.setParams(params.detail, false);
    this.update();
  }

  async update() {
    this.divePlan.updateCalculations();
    this.dives = this.divePlan.dives;
    this.dive = this.divePlan.dives[this.index];
    this.selectedChartModel = this.dive.selectedModel;
    this.selectedModelGasView = this.dive.selectedModel;
    //send updated params to other views
    this.diveDataToShare = {
      divePlan: this.divePlan,
      dive_less_time: this.dive_less_time,
      dive_more_time: this.dive_more_time,
      dive_less_depth: this.dive_less_depth,
      dive_more_depth: this.dive_more_depth,
      index: this.index,
      stdGases: this.stdGases,
      stdDecoGases: this.stdDecoGases,
      stdConfigurations: this.stdConfigurations,
      user: this.userRoles,
      showDiveSite: this.showDiveSite,
      showPositionTab: this.showPositionTab,
    };
    //check user licence limitations
    if (
      this.dive.getDecoTime() >
      UserService.userRoles.licences.getUserLimitations().maxDecoTime
    ) {
      this.showProfiles = false;
      UserService.userRoles.licences.presentLicenceLimitation("decotime");
    } else {
      this.showProfiles = true;
    }
    this.titles[1].disabled = !this.showProfiles;
    this.titles[2].disabled = !this.showProfiles;
    this.titles[3].disabled = !this.showProfiles;
    this.titles[4].disabled = !this.showProfiles;
    this.setSliderHeight();
  }

  save() {
    this.el.closest("ion-modal").dismiss(this.divePlan.getDivePlanModel());
  }

  close() {
    this.el.closest("ion-modal").dismiss();
  }

  scrollToTop() {
    this.content ? this.content.scrollToTop() : undefined;
  }

  logScrollStart(ev) {
    this.content = ev.srcElement;
  }

  render() {
    return [
      <ion-header>
        <app-navbar
          tag='deco-planner'
          text='Deco Planner'
          extra-title={this.divePlan.configuration.stdName}
          color={Environment.isDecoplanner() ? "gue-blue" : "planner"}
          modal={true}
        ></app-navbar>
        <app-header-segment-toolbar
          color={Environment.isDecoplanner() ? "gue-blue" : "planner"}
          swiper={this.slider}
          titles={this.titles}
          updateBadge={this.updateView}
          noHeader
          class='nopaddingtop'
        ></app-header-segment-toolbar>
      </ion-header>,
      <ion-content
        class='slides'
        scrollEvents={true}
        onIonScrollStart={(ev) => this.logScrollStart(ev)}
      >
        <swiper-container class='slider-dive-planner swiper'>
          <swiper-wrapper class='swiper-wrapper'>
            <swiper-slide class='swiper-slide'>
              <app-decoplanner-plan
                diveDataToShare={this.diveDataToShare}
                onUpdateParamsEvent={(params) => this.updateParams(params)}
              />
            </swiper-slide>
            <swiper-slide class='swiper-slide'>
              <app-decoplanner-profile diveDataToShare={this.diveDataToShare} />
            </swiper-slide>
            <swiper-slide class='swiper-slide'>
              <app-decoplanner-gas
                diveDataToShare={this.diveDataToShare}
                isShown={this.segment == "gas"}
              />
            </swiper-slide>
            <swiper-slide class='swiper-slide'>
              <ion-content class='slide-container'>
                <app-decoplanner-charts
                  diveDataToShare={this.diveDataToShare}
                  isShown={this.segment == "charts"}
                />
              </ion-content>
            </swiper-slide>
            <swiper-slide class='swiper-slide'>
              <app-decoplanner-settings
                diveDataToShare={this.diveDataToShare}
                onUpdateParamsEvent={(params) => this.updateParams(params)}
              />
            </swiper-slide>
          </swiper-wrapper>
        </swiper-container>
      </ion-content>,
      <app-modal-footer
        onCancelEmit={() => this.close()}
        onSaveEmit={() => this.save()}
      />,
    ];
  }
}
