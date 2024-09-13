import { Component, h, State } from "@stencil/core";
import {
  UserService,
  USERSETTINGSCOLLECTION,
} from "../../../../../services/common/user";
import { DiveConfiguration } from "../../../../../interfaces/udive/planner/dive-configuration";
import { Subscription } from "rxjs";
import { DatabaseService } from "../../../../../services/common/database";
import { DiveStandardsService } from "../../../../../services/udive/planner/dive-standards";
import { cloneDeep, forEach } from "lodash";
import { alertController } from "@ionic/core";
import { DivePlan } from "../../../../../services/udive/planner/dive-plan";
import { TranslationService } from "../../../../../services/common/translations";
import { UserSettings } from "../../../../../interfaces/udive/user/user-settings";
import { RouterService } from "../../../../../services/common/router";

@Component({
  tag: "app-user-configurations",
  styleUrl: "app-user-configurations.scss",
})
export class AppUserConfigurations {
  @State() userConfigurations: DiveConfiguration[] = [];
  stdConfigurations: DiveConfiguration[] = [];
  loading: any;
  userSettings: UserSettings;
  userSub$: Subscription;

  componentWillLoad() {
    this.userSub$ = UserService.userSettings$.subscribe(
      (userSettings: UserSettings) => {
        this.userSettings = new UserSettings(userSettings);
        this.loadData();
      }
    );
  }
  componentDidLoad() {
    //check if user is loaded or trigger local user
    if (!this.userSettings) {
      UserService.initLocalUser();
    }
  }

  async loadData() {
    if (!this.userSettings) {
      this.userSettings = new UserSettings(
        await DatabaseService.getLocalDocument(USERSETTINGSCOLLECTION)
      );
    }
    this.stdConfigurations = DiveStandardsService.getStdConfigurations();
    if (this.userSettings) {
      /*this.userConfigurations = orderBy(
        this.user.userConfigurations,
        "stdName"
      );*/
      this.userConfigurations = this.userSettings.userConfigurations;
    } else {
      const localConfigurations = await DatabaseService.getLocalDocument(
        "localconfigurations"
      );
      if (localConfigurations) {
        this.stdConfigurations = [];
        localConfigurations.forEach((conf) => {
          const model = new DiveConfiguration(conf);
          this.userConfigurations.push(model);
        });
      } else {
        this.userConfigurations =
          DiveStandardsService.getDivePlansFromConfigurations(
            this.stdConfigurations
          );
        DatabaseService.saveLocalDocument(
          "localconfigurations",
          this.userConfigurations
        );
      }
    }
  }

  disconnectedCallback() {
    this.userSub$.unsubscribe();
  }

  async viewConfiguration(i) {
    const openModal = await UserService.checkLicence("configs", true);

    if (openModal) {
      const configuration = cloneDeep(this.userConfigurations[i]);
      const divePlan = new DivePlan();
      divePlan.setConfiguration(configuration);
      const confModal = await RouterService.openModal(
        "modal-dive-configuration",
        {
          diveDataToShare: {
            divePlan: divePlan,
          },
        }
      );
      confModal.onDidDismiss().then((updatedConf) => {
        updatedConf = updatedConf.data;
        if (updatedConf) {
          this.userConfigurations[i] = new DiveConfiguration(updatedConf);
          this.save();
        }
      });
    }
  }

  async removeConfiguration(event, i) {
    event.stopPropagation();
    const openModal = await UserService.checkLicence("configs", true);
    if (openModal) {
      const confirm = await alertController.create({
        header: TranslationService.getTransl(
          "delete-configuration-header",
          "Delete configuration?"
        ),
        message: TranslationService.getTransl(
          "delete-configuration-message",
          "This configuration will be deleted! Are you sure?"
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
              this.userConfigurations.splice(i, 1);
              this.save();
            },
          },
        ],
      });
      confirm.present();
    }
  }

  async addConfiguration() {
    const openModal = await UserService.checkLicence("configs", true);
    if (openModal) {
      let inputs = [];
      forEach(this.stdConfigurations, (conf, key) => {
        inputs.push({
          type: "radio",
          label: conf.stdName + " (standard)",
          value: conf,
          checked: key == 0 ? true : false,
        });
      });
      forEach(this.userConfigurations, (conf) => {
        inputs.push({
          type: "radio",
          label: conf.stdName,
          value: conf,
          checked: false,
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
              let openModal = await UserService.checkLicence("configs", true);
              if (openModal) {
                const configuration = new DiveConfiguration(data);
                const divePlan = new DivePlan();
                divePlan.setConfiguration(configuration);
                const confModal = await RouterService.openModal(
                  "modal-dive-configuration",
                  {
                    diveDataToShare: {
                      divePlan: divePlan,
                    },
                  }
                );
                confModal.onDidDismiss().then((updatedConf) => {
                  updatedConf = updatedConf.data;
                  if (updatedConf) {
                    this.userConfigurations.push(
                      new DiveConfiguration(updatedConf)
                    );
                    this.save();
                  }
                });
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

  save() {
    UserService.updateUserConfigurations(this.userConfigurations);
  }

  render() {
    return (
      <div class='slider-container'>
        <div class='slider-scrollable-container'>
          <ion-grid class='ion-no-padding'>
            <ion-row class='ion-text-start ion-no-padding cards-container'>
              {this.userConfigurations.map((conf, i) => (
                <ion-col
                  size-sm='12'
                  size-md='6'
                  size-lg='4'
                  class='ion-no-padding cards-column'
                >
                  <ion-card
                    onClick={() => this.viewConfiguration(i)}
                    class='card'
                  >
                    <div class='card-content'>
                      <ion-card-header>
                        <ion-item class='ion-no-padding' lines='none'>
                          <ion-button
                            icon-only
                            slot='end'
                            color='danger'
                            fill='clear'
                            onClick={(ev) => this.removeConfiguration(ev, i)}
                          >
                            <ion-icon name='trash-bin-outline'></ion-icon>
                          </ion-button>

                          <ion-card-title>{conf.stdName}</ion-card-title>
                        </ion-item>

                        <ion-card-subtitle>
                          <my-transl tag='max-depth' text='Max Depth' />:
                          {conf.maxDepth} {conf.parameters.depthUnit}
                        </ion-card-subtitle>
                      </ion-card-header>

                      <ion-card-content>
                        {conf.configuration.bottom.length > 0 ? (
                          <p>
                            <my-transl tag='bottom-tanks' text='Bottom Tanks' />
                            :
                          </p>
                        ) : undefined}
                        {conf.configuration.bottom.map((tank) => (
                          <p>{tank.name + "->" + tank.gas.toString()}</p>
                        ))}
                        {conf.configuration.deco.length > 0 ? (
                          <p>
                            <my-transl tag='deco-tanks' text='Deco Tanks' />:
                          </p>
                        ) : undefined}
                        {conf.configuration.deco.map((tank) => (
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
                  onClick={() => this.addConfiguration()}
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
        </div>
      </div>
    );
  }
}
