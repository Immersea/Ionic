import { StorageService } from "../common/storage";
import { alertController } from "@ionic/core";
import { DatabaseService } from "../common/database";
import { TranslationService } from "../common/translations";
import { DivePlanModel } from "../../interfaces/udive/planner/dive-plan";
import { UserRoles } from "../../interfaces/common/user/user-roles";
import { DiveConfiguration } from "../../interfaces/udive/planner/dive-configuration";
import { cloneDeep, forEach } from "lodash";
import { UserService } from "../common/user";
import { RouterService } from "../common/router";
import { UserProfile } from "../../interfaces/common/user/user-profile";
import { UserSettings } from "../../interfaces/udive/user/user-settings";
import { BehaviorSubject } from "rxjs";
import { DivePlan } from "./planner/dive-plan";
import { SystemService } from "../common/system";

const DIVEPLANSCOLLECTION = "divePlans";

export class DivePlansController {
  userProfile: UserProfile;
  userRoles: UserRoles;
  stdConfigurations: DiveConfiguration[] = [];
  creatingNewDivePlan$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  creatingNewDivePlan = false; //used to show skeleton on pages during the creation of a dive trip
  editingDivePlanId$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  editingDivePlanId: string;

  resetSkeletons() {
    this.setCreatingNewDivePlan(false);
    //this.setEditingDivePlan("");
  }
  setCreatingNewDivePlan(val) {
    this.creatingNewDivePlan = val;
    this.creatingNewDivePlan$.next(this.creatingNewDivePlan);
  }
  //setEditingDivePlan(val) {
  //this.editingDivePlanId = val;
  //this.editingDivePlanId$.next(this.editingDivePlanId);
  //}

  init(
    userProfile: UserProfile,
    userRoles: UserRoles,
    userSettings: UserSettings
  ) {
    if (userProfile) {
      this.userProfile = userProfile;
      this.userRoles = userRoles;
      if (userSettings && userSettings.userConfigurations)
        this.stdConfigurations = cloneDeep(userSettings.userConfigurations);
    }
  }

  async createNewDivePlanWithConfiguration(diveTripData?) {
    if (this.userRoles && this.userRoles.isRegistered()) {
      this.setCreatingNewDivePlan(true);
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
                this.openNewDiveModal(
                  this.stdConfigurations[data],
                  diveTripData
                );
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
                        UserService.userSettings.userConfigurations
                      );
                      UserService.userSettings.userConfigurations = newArray;
                      UserService.updateUserConfigurations(
                        UserService.userSettings.userConfigurations
                      );
                      this.stdConfigurations = cloneDeep(
                        UserService.userSettings.userConfigurations
                      );
                      this.openNewDiveModal(newConf, diveTripData);
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
    } else {
      UserService.notRegisteredUser();
    }
  }

  async openNewDiveModal(selectedConfiguration, diveTripData) {
    const openModal = await RouterService.openModal("modal-dive-planner", {
      selectedConfiguration: selectedConfiguration,
      diveTripData: diveTripData ? diveTripData.dives[0] : null,
      stdConfigurations: this.stdConfigurations,
      index: 0,
      user: this.userProfile,
      showDiveSite: true,
      showPositionTab: true,
    });
    openModal.onDidDismiss().then((divePlan) => {
      const dpModal = divePlan.data;
      if (dpModal) {
        this.updateDivePlan(null, dpModal, this.userProfile.uid);
      }
    });
  }
  async createNewDivePlan(divePlanModel) {
    if (this.userRoles && this.userRoles.isRegistered()) {
      const openModal = await RouterService.openModal("modal-dive-planner", {
        addDive: false,
        divePlanModel: divePlanModel,
        stdConfigurations: this.stdConfigurations,
        index: 0,
        user: this.userProfile,
        showDiveSite: true,
        showPositionTab: true,
        setDate: true,
      });
      openModal.onDidDismiss().then((divePlan) => {
        const dpModal = divePlan.data;
        if (dpModal) {
          this.updateDivePlan(null, dpModal, this.userProfile.uid);
          //switch to logbook
          RouterService.push("/logbook", "root");
        }
      });
    } else {
      UserService.notRegisteredUser();
    }
  }

  async addDiveToPlan(divePlanId, diveId) {
    const divePlan = await this.getDivePlan(divePlanId);
    if (divePlan) {
      //set site for first dive
      const openModal = await RouterService.openModal("modal-dive-planner", {
        addDive: true,
        divePlanModel: divePlan,
        stdConfigurations: this.stdConfigurations,
        index: diveId + 1,
        user: this.userProfile,
        showPositionTab: true,
      });
      openModal.onDidDismiss().then((divePlan) => {
        const dpModal = divePlan.data;
        if (dpModal) {
          this.updateDivePlan(divePlanId, dpModal, this.userProfile.uid);
        }
      });
    }
  }

  async deleteDiveFromPlan(divePlanId, diveId) {
    const divePlan = await this.getDivePlan(divePlanId);
    if (divePlan) {
      const confirm = await alertController.create({
        header: TranslationService.getTransl(
          "delete-dive-header",
          "Delete dive?"
        ),
        message: TranslationService.getTransl(
          "delete-dive-message",
          "This dive will be deleted! Are you sure?"
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
              divePlan.dives.splice(diveId, 1);
              this.updateDivePlan(divePlanId, divePlan, this.userProfile.uid);
            },
          },
        ],
      });
      confirm.present();
    }
  }

  async presentDivePlanUpdate(divePlanId, diveId) {
    //this.setEditingDivePlan(divePlanId);
    const divePlan = await this.getDivePlan(divePlanId);
    if (divePlan) {
      const openModal = await RouterService.openModal("modal-dive-planner", {
        addDive: false,
        divePlanModel: divePlan,
        stdConfigurations: this.stdConfigurations,
        index: diveId,
        user: this.userProfile,
        diveSiteId: divePlan.dives[diveId].diveSiteId,
        showPositionTab: true,
      });
      openModal.onDidDismiss().then((divePlan) => {
        const dpModal = divePlan.data;
        if (dpModal) {
          this.updateDivePlan(divePlanId, dpModal, this.userProfile.uid);
        } else {
          this.resetSkeletons();
        }
      });
    } else {
      RouterService.goBack();
    }
  }

  async presentDivePlanDetails(divePlanId, diveId) {
    RouterService.push(
      "/diveplan/" + divePlanId + "/dive/" + diveId,
      "forward"
    );
  }

  async presentDiveTemplateUpdate(
    divePlan,
    index = 0,
    showPosition = false
  ): Promise<DivePlanModel> {
    return new Promise(async (resolve, reject) => {
      const openModal = await RouterService.openModal("modal-dive-template", {
        addDive: false,
        divePlanModel: divePlan,
        stdConfigurations: this.stdConfigurations,
        dive: index,
        user: this.userProfile,
        showDiveSite: showPosition,
        showPositionTab: showPosition,
      });
      openModal.onDidDismiss().then((divePlan) => {
        const dpModal = divePlan.data;
        if (dpModal) {
          resolve(dpModal);
        } else {
          reject();
        }
      });
    });
  }

  async getDivePlan(id) {
    const divePlan = await DatabaseService.getDocument(DIVEPLANSCOLLECTION, id);
    if (divePlan) return new DivePlanModel(divePlan);
    else return false;
  }

  async updateDivePlan(id, divePlan, userId) {
    await SystemService.presentLoading("updating");
    //check if offline
    let docRef = null;
    if (!id) {
      //set owner of new item
      divePlan.users[userId] = ["owner"];
      docRef = DatabaseService.addDocument(DIVEPLANSCOLLECTION, divePlan);
    } else {
      docRef = DatabaseService.updateDocument(
        DIVEPLANSCOLLECTION,
        id,
        divePlan
      );
    }
    await SystemService.dismissLoading();
    //update lists for offline usage
    setTimeout(() => {
      SystemService.presentLoading("saved", false);
    }, 100);
    if (docRef.id) {
      //add item to collection for offline updating
      DatabaseService.updateCollectionOffline(
        DIVEPLANSCOLLECTION,
        UserService.userDivePlans,
        UserService.userDivePlans$,
        docRef.id,
        this.createOfflineUserDivePlan(divePlan)
      );
    }
    return true;
  }

  createOfflineUserDivePlan(divePlan) {
    const summary = {
      configuration: divePlan.configuration.stdName,
      dives: [],
    };
    divePlan.dives.forEach((dive) => {
      const diveInfo = {
        diveSiteId: dive.diveSiteId,
        date: dive.date,
        profilePoints: dive.profilePoints,
      };
      summary.dives.push(diveInfo);
    });
    return summary;
  }

  /*
  updateOfflineUserDivePlans(docId, divePlan?) {
    if (!divePlan) {
      //delete
      delete this.userDivePlans[docId];
    } else {
      //update
      this.userDivePlans[docId] = {
        configuration: divePlan.configuration.stdName,
        dives: [],
      };
      divePlan.dives.forEach((dive) => {
        let diveInfo = {
          diveSiteId: dive.diveSiteId,
          date: dive.date,
          profilePoints: dive.profilePoints,
        };
        this.userDivePlans[docId].dives.push(diveInfo);
      });
    }

    this.userDivePlans$.next(this.userDivePlans);
  }*/

  async deleteDivePlan(id) {
    const confirm = await alertController.create({
      header: TranslationService.getTransl(
        "delete-dive-plan-header",
        "Delete Dive Plan?"
      ),
      message: TranslationService.getTransl(
        "delete-dive-plan-message",
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
          handler: async () => {
            //this.setEditingDivePlan(id);
            DatabaseService.deleteDocument(DIVEPLANSCOLLECTION, id);
            DatabaseService.updateCollectionOffline(
              DIVEPLANSCOLLECTION,
              UserService.userDivePlans,
              UserService.userDivePlans$,
              id
            );
          },
        },
      ],
    });
    confirm.present();
  }

  async updatePhotoURL(type: string, uid: string, file: any) {
    return StorageService.updatePhotoURL(DIVEPLANSCOLLECTION, type, uid, file);
  }
}
export const DivePlansService = new DivePlansController();
