import { Component, h, State } from "@stencil/core";
import { alertController } from "@ionic/core";
import { Subscription } from "rxjs";

import { cloneDeep, forEach, orderBy } from "lodash";
import { DiveConfiguration } from "../../../../../interfaces/udive/planner/dive-configuration";
import { TranslationService } from "../../../../../services/common/translations";
import { DivePlan } from "../../../../../services/udive/planner/dive-plan";
import { UserService } from "../../../../../services/common/user";
import { DivePlanModel } from "../../../../../interfaces/udive/planner/dive-plan";
import { DiveStandardsService } from "../../../../../services/udive/planner/dive-standards";
import { DatabaseService } from "../../../../../services/common/database";
import { UserSettings } from "../../../../../interfaces/udive/user/user-settings";
import { RouterService } from "../../../../../services/common/router";
import { DiveToolsService } from "../../../../../services/udive/planner/dive-tools";
import { Environment } from "../../../../../global/env";
// core version + navigation, pagination modules:
import Swiper from "swiper";

@Component({
  tag: "page-dive-planner",
  styleUrl: "page-dive-planner.scss",
})
export class PageDivePlanner {
  plans: Array<DivePlan> = [];
  stdDiveProfile = {
    depth: DiveToolsService.isMetric() ? 30 : 100,
    time: 30,
    fO2: 0.32,
    fHe: 0,
    setpoint: 1.4,
  };
  isLoaded = false;
  stdConfigurations: DiveConfiguration[] = [];
  @State() localPlans: DivePlanModel[] = [];
  userSettings: UserSettings;
  userSettingsSub$: Subscription;
  swiper: Swiper;
  @State() scrollTop = 0;
  maxLocalPlans = 15;

  componentWillLoad() {
    this.userSettingsSub$ = UserService.userSettings$.subscribe(
      (userSettings: UserSettings) => {
        this.userSettings = new UserSettings(userSettings);
        this.loadLocalData();
      }
    );
  }
  componentDidLoad() {
    //check if user is loaded or trigger local user
    if (!this.userSettings) {
      UserService.initLocalUser();
    }
    // init Swiper:
    this.swiper = new Swiper(".swiper", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: true,
    });
  }

  async loadLocalData() {
    if (this.userSettings && this.userSettings.settings) {
      //user loggedin
      this.stdConfigurations = cloneDeep(this.userSettings.userConfigurations);
      //order by name
      this.localPlans = this.userSettings.localPlans;
      this.orderPlans();
    } else {
      //no user loggedin
      const localPlans = await DatabaseService.getLocalDocument("localplans");
      this.stdConfigurations = DiveStandardsService.getStdConfigurations();
      if (localPlans) {
        this.localPlans = [];
        localPlans.forEach((plan) => {
          const model = new DivePlanModel(plan);
          this.localPlans.push(model);
        });
      } else {
        this.localPlans = DiveStandardsService.getDivePlansFromConfigurations(
          this.stdConfigurations
        );
        DatabaseService.saveLocalDocument("localplans", this.localPlans);
      }
      this.orderPlans();
    }
  }

  disconnectedCallback() {
    this.userSettingsSub$.unsubscribe();
  }

  async addDivePlan() {
    if (this.localPlans.length >= this.maxLocalPlans) {
      const alert = await alertController.create({
        header: TranslationService.getTransl("max-plans", "Maximum Plans"),
        message: TranslationService.getTransl(
          "max-plans-descr",
          "You can store a maximum of xxx plans. Use the 'Logbook' for additional plans.",
          { xxx: this.maxLocalPlans }
        ),
        buttons: [
          {
            text: TranslationService.getTransl("ok", "OK"),
          },
        ],
      });
      alert.present();
    } else {
      let inputs = [];
      if (UserService.userProfile && UserService.userProfile) {
        inputs.push({
          type: "radio",
          label: "New Configuration",
          value: -1,
          checked: false,
        });
      }
      forEach(this.stdConfigurations, (conf, key) => {
        inputs.push({
          type: "radio",
          label: conf.stdName,
          value: key,
          checked: key == 0 ? true : false,
        });
      });

      const alert = await alertController.create({
        header: TranslationService.getTransl(
          "select-standard-configuration",
          "Select standard configuration"
        ),
        buttons: [
          {
            text: TranslationService.getTransl("ok", "OK"),
            handler: async (data: any) => {
              if (data > -1) {
                this.addDivePlanWithConf(this.stdConfigurations[data]);
              } else {
                let openModal = await UserService.checkLicence("configs", true);
                if (openModal) {
                  const newConfig =
                    UserService.userSettings.userConfigurations[0];
                  const configuration = new DiveConfiguration(newConfig);
                  configuration.stdName = "";
                  configuration.configuration.bottom = [];
                  configuration.maxDepth = 0;
                  configuration.maxTime = 0;
                  const divePlan = new DivePlan();
                  divePlan.setConfiguration(configuration);
                  const confModal = await RouterService.openModal(
                    "modal-dive-configuration",
                    {
                      diveDataToShare: {
                        divePlan: divePlan,
                        showConfigurations: true,
                      },
                    }
                  );
                  confModal.onDidDismiss().then((updatedConf) => {
                    updatedConf = updatedConf.data;
                    if (updatedConf) {
                      //save new configuration and then open deco planner
                      const newConf = new DiveConfiguration(updatedConf);
                      //put new configuration on top
                      const newArray = [newConf].concat(
                        this.userSettings.userConfigurations
                      );
                      this.userSettings.userConfigurations = newArray;
                      UserService.updateUserConfigurations(
                        this.userSettings.userConfigurations
                      );
                      this.addDivePlanWithConf(newConf);
                    }
                  });
                }
              }
            },
          },
          {
            text: TranslationService.getTransl("cancel", "Cancel"),
            role: "cancel",
            cssClass: "secondary",
          },
        ],
        inputs: inputs,
      });
      alert.present();
    }
  }

  async addDivePlanWithConf(selectedConfiguration: DiveConfiguration) {
    const openModal = await RouterService.openModal("modal-dive-planner", {
      selectedConfiguration: selectedConfiguration,
      stdConfigurations: this.stdConfigurations,
      index: 0,
      user: this.userSettings,
    });
    openModal.onDidDismiss().then((divePlan) => {
      const dpModal = divePlan.data;
      if (dpModal) {
        this.localPlans.push(dpModal);
        this.updatePlans();
      }
    });
  }

  async viewDive(i) {
    const openModal = await RouterService.openModal("modal-dive-planner", {
      addDive: false,
      divePlanModel: this.localPlans[i],
      stdConfigurations: this.stdConfigurations,
      index: 0,
      user: this.userSettings,
    });
    openModal.onDidDismiss().then((divePlan) => {
      const dpModal = divePlan.data;
      if (dpModal) {
        this.localPlans[i] = dpModal;
        this.updatePlans();
      }
    });
  }

  updatePlans() {
    if (this.userSettings && this.userSettings.localPlans) {
      UserService.updateUserLocalPlans(this.localPlans);
    } else {
      DatabaseService.saveLocalDocument("localplans", this.localPlans);
      this.loadLocalData();
    }
  }

  orderPlans() {
    this.localPlans = orderBy(this.localPlans, "configuration.stdName");
  }

  async removeDive(event, i) {
    event.stopPropagation();
    const confirm = await alertController.create({
      header: TranslationService.getTransl(
        "delete-dive-header",
        "Delete dive?"
      ),
      message: TranslationService.getTransl(
        "delete-dive-message",
        "This dive plan will be deleted! Are you sure?"
      ),
      buttons: [
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: () => {
            this.localPlans.splice(i, 1);
            this.updatePlans();
          },
        },
      ],
    });
    confirm.present();
  }

  render() {
    return [
      <app-navbar
        tag='deco-planner'
        text='Deco Planner'
        color={Environment.isDecoplanner() ? "gue-blue" : "planner"}
      ></app-navbar>,
      <ion-content>
        {this.localPlans.length > 0 ? (
          <ion-grid class='ion-no-padding'>
            <ion-row class='ion-no-padding cards-container'>
              {this.localPlans.map((plan, i) => (
                <ion-col
                  size-sm='12'
                  size-md='6'
                  size-lg='4'
                  class='ion-no-padding cards-column'
                >
                  <ion-card onClick={() => this.viewDive(i)} class='card'>
                    <div class='card-content'>
                      <ion-card-header>
                        <ion-card-subtitle>
                          <ion-item lines='none' class='ion-no-padding'>
                            <ion-button
                              icon-only
                              slot='end'
                              color='danger'
                              fill='clear'
                              onClick={(ev) => this.removeDive(ev, i)}
                            >
                              <ion-icon name='trash-bin-outline'></ion-icon>
                            </ion-button>
                            <ion-label>
                              <h1>{plan.configuration.stdName}</h1>
                            </ion-label>
                          </ion-item>
                          {plan.dives[0]
                            .getProfilePointsDetails()
                            .map((detail) => (
                              <p class='ion-text-start'>{detail}</p>
                            ))}
                        </ion-card-subtitle>
                      </ion-card-header>

                      <ion-card-content>
                        {plan.configuration.configuration.bottom.length > 0 ? (
                          <p>
                            <my-transl tag='bottom-tanks' text='Bottom Tanks' />
                            :
                          </p>
                        ) : undefined}
                        {plan.configuration.configuration.bottom.map((tank) => (
                          <p>{tank.name + "->" + tank.gas.toString()}</p>
                        ))}
                        {plan.configuration.configuration.deco.length > 0 ? (
                          <p>
                            <my-transl tag='deco-tanks' text='Deco Tanks' />:
                          </p>
                        ) : undefined}
                        {plan.configuration.configuration.deco.map((tank) => (
                          <p>{tank.name + "->" + tank.gas.toString()}</p>
                        ))}
                      </ion-card-content>
                    </div>
                  </ion-card>
                </ion-col>
              ))}
              {/* Add new card button */}
              <ion-col
                size-sm='12'
                size-md='6'
                size-lg='4'
                class='ion-no-padding cards-column'
              >
                <ion-card
                  class='card add-card'
                  onClick={() => this.addDivePlan()}
                >
                  <ion-card-content class='card-content add-card-content'>
                    <ion-icon
                      name='add-circle-outline'
                      class='add-icon'
                    ></ion-icon>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        ) : undefined}
      </ion-content>,
    ];
  }
}
