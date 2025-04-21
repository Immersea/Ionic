import { Component, h, Prop, State, Element } from "@stencil/core";
import { UserRoles } from "../../../../../interfaces/common/user/user-roles";
import { UserService } from "../../../../../services/common/user";
import { DivePlansService } from "../../../../../services/udive/divePlans";
import { DecoplannerDive } from "../../../../../interfaces/udive/planner/decoplanner-dive";
import { DiveSitesService } from "../../../../../services/udive/diveSites";
import { DivePlan } from "../../../../../services/udive/planner/dive-plan";
import { MapDataDiveSite } from "../../../../../interfaces/udive/dive-site/diveSite";
import { RouterService } from "../../../../../services/common/router";
import { Environment } from "../../../../../global/env";
import Swiper from "swiper";
import { format } from "date-fns";
import { toNumber } from "lodash";

@Component({
  tag: "page-dive-plan-details",
  styleUrl: "page-dive-plan-details.scss",
})
export class PageDivePlanDetails {
  @Element() el: HTMLElement;
  @Prop() planid: string;
  @Prop() diveid: number;
  @State() divePlan: DivePlan;
  dive: DecoplannerDive;
  diveSite: MapDataDiveSite;
  @State() segment = "plan";
  @State() segmentNum = 0;
  titles = [
    { tag: "plan", text: "Plan", disabled: false },
    { tag: "profile", text: "Profile", disabled: false },
    { tag: "gas", text: "Gas", disabled: false },
    { tag: "charts", text: "Charts", disabled: false },
  ];
  @State() slider: Swiper;
  userRoles: UserRoles;
  diveDataToShare: any;

  async componentWillLoad() {
    let divePlanModel = await DivePlansService.getDivePlan(this.planid);
    if (divePlanModel) {
      this.divePlan = new DivePlan();
      this.divePlan.setConfiguration(divePlanModel.configuration);
      this.divePlan.setWithDivePlanModel(divePlanModel);
      this.diveid = toNumber(this.diveid);
      this.dive = this.divePlan.dives[this.diveid];
      this.getDiveSitesDetails();
      this.userRoles = UserService.userRoles;
      //send updated params to other views
      this.diveDataToShare = {
        divePlan: this.divePlan,
        index: this.diveid,
        user: this.userRoles,
        editPlan: false,
        diveSite: this.diveSite,
      };
    } else {
      RouterService.goBack();
    }
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-dive-plan", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: true,
      autoHeight: true,
    });
  }

  getDiveSitesDetails() {
    if (this.dive.diveSiteId) {
      this.diveSite = DiveSitesService.getDiveSitesDetails(
        this.dive.diveSiteId
      );
    }
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar
          color={Environment.isDecoplanner() ? "gue-blue" : "planner"}
        >
          <ion-buttons slot='start'>
            <ion-button onClick={() => RouterService.goBack()} icon-only>
              <ion-icon name='arrow-back'></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>
            {format(this.dive.date, "PP")}
            {this.diveSite ? " - " + this.diveSite.displayName : undefined}
            {" - " + this.divePlan.configuration.stdName}
          </ion-title>
        </ion-toolbar>
      </ion-header>,
      this.diveSite && (this.diveSite.coverURL || this.diveSite.photoURL) ? (
        <ion-header style={{ height: "var(--coverHeight)" }}>
          <app-item-cover item={this.diveSite} />
        </ion-header>
      ) : undefined,
      <app-header-segment-toolbar
        color={Environment.isDecoplanner() ? "gue-blue" : "planner"}
        swiper={this.slider}
        titles={this.titles}
      ></app-header-segment-toolbar>,
      <ion-content class='slides'>
        <swiper-container class='slider-dive-plan swiper'>
          <swiper-wrapper class='swiper-wrapper'>
            <swiper-slide class='swiper-slide'>
              <app-decoplanner-showplan
                diveDataToShare={this.diveDataToShare}
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
              <app-decoplanner-charts
                diveDataToShare={this.diveDataToShare}
                isShown={this.segment == "charts"}
              />
            </swiper-slide>
          </swiper-wrapper>
        </swiper-container>
      </ion-content>,
    ];
  }
}
