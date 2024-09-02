import {Component, h, State} from "@stencil/core";
import {
  UserService,
  USERSETTINGSCOLLECTION,
} from "../../../../../services/common/user";
import {Subscription} from "rxjs";
import {DatabaseService} from "../../../../../services/common/database";
import {DiveStandardsService} from "../../../../../services/udive/planner/dive-standards";
import {cloneDeep, forEach, isEqual} from "lodash";
import {alertController} from "@ionic/core";
import {TranslationService} from "../../../../../services/common/translations";
import {UserSettings} from "../../../../../interfaces/udive/user/user-settings";
import {RouterService} from "../../../../../services/common/router";
import {DiveToolsService} from "../../../../../services/udive/planner/dive-tools";
import {TankModel} from "../../../../../interfaces/udive/planner/tank-model";

@Component({
  tag: "app-user-tanks",
  styleUrl: "app-user-tanks.scss",
})
export class AppUserTanks {
  @State() userTanks: TankModel[] = [];
  stdTanks: TankModel[] = [];
  loading: any;
  userSettings: UserSettings;
  userSub$: Subscription;
  hasUserTanks = true;

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
    this.userTanks = this.userSettings.userTanks;
    this.stdTanks = DiveStandardsService.getStdTanks();
    if (isEqual(this.userTanks, this.stdTanks)) this.hasUserTanks = false;
  }

  disconnectedCallback() {
    this.userSub$.unsubscribe();
  }

  async viewTank(i) {
    const openModal = await UserService.checkLicence("configs", true);

    if (openModal) {
      const tank = cloneDeep(this.userTanks[i]);
      const confModal = await RouterService.openModal(
        "modal-tank-configuration",
        {
          tank: tank,
        }
      );
      confModal.onDidDismiss().then((updatedTank) => {
        if (updatedTank && updatedTank.data) {
          const tank = updatedTank.data;
          this.userTanks[i] = new TankModel(tank);
          this.save();
        }
      });
    }
  }

  async removeTank(event, i) {
    event.stopPropagation();
    const openModal = await UserService.checkLicence("configs", true);
    if (openModal) {
      const confirm = await alertController.create({
        header: TranslationService.getTransl(
          "delete-tank-header",
          "Delete tank?"
        ),
        message: TranslationService.getTransl(
          "delete-tank-message",
          "This tank will be deleted! Are you sure?"
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
              this.userTanks.splice(i, 1);
              this.save();
            },
          },
        ],
      });
      confirm.present();
    }
  }

  async addTank() {
    const openModal = await UserService.checkLicence("configs", true);
    if (openModal) {
      let inputs = [];
      forEach(this.stdTanks, (conf, key) => {
        inputs.push({
          type: "radio",
          label: conf.name + (this.hasUserTanks ? " (standard)" : ""),
          value: conf,
          checked: key == 0 ? true : false,
        });
      });
      if (this.hasUserTanks)
        forEach(this.userTanks, (conf) => {
          inputs.push({
            type: "radio",
            label: conf.name,
            value: conf,
            checked: false,
          });
        });
      const alert = await alertController.create({
        header: TranslationService.getTransl(
          "select-standard-tank",
          "Select standard tank"
        ),
        buttons: [
          {
            text: TranslationService.getTransl("ok", "OK"),
            handler: async (tank: any) => {
              let openModal = await UserService.checkLicence("configs", true);
              if (openModal) {
                const confModal = await RouterService.openModal(
                  "modal-tank-configuration",
                  {
                    tank: tank,
                  }
                );
                confModal.onDidDismiss().then((updatedTank) => {
                  if (updatedTank && updatedTank.data) {
                    const tank = updatedTank.data;
                    this.userTanks.push(new TankModel(tank));
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
    UserService.updateUserTanks(this.userTanks);
  }

  render() {
    return (
      <div class="slider-container">
        <div class="slider-scrollable-container">
          <ion-grid class="ion-no-padding">
            <ion-row class="ion-text-start ion-no-padding">
              {this.userTanks.map((tank, i) => (
                <ion-col
                  size-sm="12"
                  size-md="6"
                  size-lg="4"
                  class="ion-no-padding"
                >
                  <ion-card
                    onClick={() => this.viewTank(i)}
                    class="card-margins"
                  >
                    <ion-card-header>
                      <ion-item class="ion-no-padding" lines="none">
                        <ion-button
                          icon-only
                          slot="end"
                          color="danger"
                          fill="clear"
                          onClick={(ev) => this.removeTank(ev, i)}
                        >
                          <ion-icon name="trash-bin-outline"></ion-icon>
                        </ion-button>

                        <ion-card-title>{tank.name}</ion-card-title>
                      </ion-item>

                      <ion-card-subtitle>
                        {TranslationService.getTransl("volume", "Volume") +
                          " : " +
                          tank.volume +
                          " lt" +
                          (this.userSettings.settings.units != "Metric"
                            ? " / " +
                              DiveToolsService.ltToCuFt(tank.volume) +
                              " cuft"
                            : "")}
                      </ion-card-subtitle>
                    </ion-card-header>

                    <ion-card-content>
                      <ion-grid>
                        <ion-row>
                          <ion-col>
                            {TranslationService.getTransl(
                              "no_of_tanks",
                              "Number Of Tanks"
                            ) +
                              " : " +
                              tank.no_of_tanks}
                          </ion-col>
                        </ion-row>
                        <ion-row>
                          <ion-col>
                            {TranslationService.getTransl(
                              "pressure",
                              "Pressure"
                            ) +
                              " : " +
                              tank.pressure +
                              " bar" +
                              (this.userSettings.settings.units != "Metric"
                                ? " / " +
                                  DiveToolsService.barToPsi(tank.pressure) +
                                  " psi"
                                : "")}
                          </ion-col>
                        </ion-row>
                        {tank.forDeco ? (
                          <ion-row>
                            <ion-col>
                              (
                              {TranslationService.getTransl(
                                "for-deco",
                                "For Decompression"
                              )}
                              )
                            </ion-col>
                          </ion-row>
                        ) : undefined}
                      </ion-grid>
                    </ion-card-content>
                  </ion-card>
                </ion-col>
              ))}
              <ion-col
                size-sm="12"
                size-md="6"
                size-lg="4"
                class="ion-no-padding"
              >
                <ion-card onClick={() => this.addTank()}>
                  <ion-card-content class="ion-text-center">
                    <ion-icon
                      name="add-circle-outline"
                      style={{fontSize: "100px"}}
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
