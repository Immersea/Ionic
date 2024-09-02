import {DiveConfiguration} from "../planner/dive-configuration";
import {DivePlanModel} from "../planner/dive-plan";
import {DiveStandardsService} from "../../../services/udive/planner/dive-standards";
import {DiveToolsService} from "../../../services/udive/planner/dive-tools";
import {TankModel} from "../planner/tank-model";

export class UserSettings {
  uid: string;
  settings: {language: string; units: string};
  userConfigurations: DiveConfiguration[] = [];
  localPlans: DivePlanModel[] = [];
  userTanks: TankModel[] = [];
  chatsLastRead: {
    [chatId: string]: string;
  };

  constructor(data) {
    this.uid = data ? data.uid : null;
    this.settings = {
      language:
        data && data.settings && data.settings.language
          ? data.settings.language
          : "en",
      units:
        data && data.settings && data.settings.units
          ? data.settings.units
          : "Metric",
    };

    //set Divetools to user units
    DiveToolsService.setMetric(this.settings.units === "Metric");
    var configurations =
      data && data.userConfigurations
        ? data.userConfigurations
        : DiveStandardsService.getStdConfigurations();
    configurations.forEach((conf) => {
      //create first set of user configurations
      this.userConfigurations.push(new DiveConfiguration(conf));
    });

    //setup user plans
    if (data && data.localPlans && data.localPlans.length > 0) {
      data.localPlans.forEach((plan) => {
        const model = new DivePlanModel(plan);
        this.localPlans.push(model);
      });
    } else {
      this.localPlans =
        DiveStandardsService.getDivePlansFromConfigurations(configurations);
    }

    //setup user tanks
    if (data && data.userTanks && data.userTanks.length > 0) {
      data.userTanks.forEach((tank) => {
        const tankModel = new TankModel(tank);
        this.userTanks.push(tankModel);
      });
    } else {
      this.userTanks = DiveStandardsService.getStdTanks();
    }

    this.chatsLastRead = data && data.chatsLastRead ? data.chatsLastRead : null;
  }

  getLanguage() {
    return this.settings.language;
  }

  setLanguage(lang) {
    this.settings.language = lang;
  }
}
