import {alertController} from "@ionic/core";
import {Environment} from "../../../global/env";
import {TranslationService} from "../../../services/common/translations";
import {DiveToolsService} from "../../../services/udive/planner/dive-tools";
import {DiveConfiguration} from "./dive-configuration";
import {Gas} from "./gas";
import {addDays, differenceInDays} from "date-fns";
import {round, toNumber} from "lodash";

export interface UserLicenceLimitations {
  minO2: number;
  maxO2: number;
  minDecoO2: number;
  maxDecoO2: number;
  maxHe: number;
  maxDepth: number;
  maxDecoGases: number;
  maxDecoTime: number;
}

export class Licences {
  pro: boolean;
  reb: boolean;
  tables: boolean;
  trimix: boolean;
  configs: boolean;
  rec1: boolean;
  rec2: boolean;
  rec3: boolean;
  tech1: boolean;
  tech2: boolean;
  unlimited: boolean;
  trial: {
    level: string;
    duration: number;
    fromDate: Date;
  };

  /*
R1 with nitrox-only, no deco gases.
R2 with nitrox and 30/30 and max 15 min deco; no deco gases
R3 with 21/35, 30/30, 50% and up to 30 min deco
Level 1: Trimix. 60m depth limit. 2 deco gas limit. Max 45 min deco. (But still allow for the "no deco gas" option to work even it that will exceed the time limit)
Level 2: 90m depth limit. 4 deco gas limit. Max 90min deco
*/

  constructor(licences?) {
    this.pro = licences && licences.pro ? true : false;
    this.reb =
      licences && (licences.reb || licences.tech1 || licences.tech2)
        ? true
        : false;
    this.tables = licences && licences.tables ? true : true; //activate
    this.trimix =
      licences &&
      (licences.trimix ||
        licences.rec2 ||
        licences.rec3 ||
        licences.tech1 ||
        licences.tech2)
        ? true
        : false;
    this.configs = licences && licences.configs ? true : true; //activate
    this.rec1 = licences && licences.rec1 ? true : false;
    this.rec2 = licences && licences.rec2 ? true : false;
    this.rec3 = licences && licences.rec3 ? true : false;
    this.tech1 = licences && licences.tech1 ? true : false;
    this.tech2 = licences && licences.tech2 ? true : false;
    this.unlimited = licences && licences.unlimited ? true : false;
    if (licences && licences.trial) {
      var date = new Date(licences.trial);
      if (date.getTime() !== date.getTime()) {
        if (licences.trial.seconds) {
          //Timestamp
          date = new Date(licences.trial.seconds * 1000);
        } else {
          date = new Date();
        }
      }
      this.trial = {
        level: licences.trial.level ? licences.trial.level : null,
        duration: licences.trial.duration
          ? toNumber(licences.trial.duration)
          : 0,
        fromDate: licences.trial.fromDate
          ? new Date(licences.trial.fromDate)
          : null,
      };
      this.trialDays() > 0 ? (this[licences.trial.level] = true) : null; //set the corresponding level during the trial period
    } else {
      this.trial = {
        level: null,
        duration: 0,
        fromDate: null,
      };
    }
  }

  resetDP2licences() {
    this.pro = false;
    this.reb = false;
    this.tables = true; //activate
    this.trimix = false;
    this.configs = true; //activate
    this.rec1 = false;
    this.rec2 = false;
    this.rec3 = false;
    this.tech1 = false;
    this.tech2 = false;
    this.unlimited = false;
    return this;
  }

  hasLicence(licence, withTrial = true) {
    if (!licence) return false;
    let hasLicence = false;
    if (withTrial) {
      //check trimix licence
      if (licence == "trimix") {
        if (
          this.trial.level == "rec2" ||
          this.trial.level == "rec3" ||
          this.trial.level == "tech1" ||
          this.trial.level == "tech2"
        ) {
          licence = this.trial.level;
        }
      } else if (licence == "reb") {
        if (this.trial.level == "tech1" || this.trial.level == "tech2") {
          licence = this.trial.level;
        }
      }
      hasLicence =
        this[licence] ||
        this.pro ||
        this.unlimited ||
        ((this.trial.level === "unlimited" ||
          this.trial.level === "pro" ||
          this.trial.level === licence) &&
          this.trialDays() > 0);
    } else {
      hasLicence = this[licence] || this.pro || this.unlimited;
    }

    //DEVELOPMENT LICENCE
    if (Environment.isDev()) {
      hasLicence = true;
    }

    return hasLicence;
  }

  trialDays() {
    if (this.trial.fromDate) {
      //let expiry = moment(this.trial.fromDate).add(this.trial.duration, "days");
      //let days = moment.duration(expiry.diff(moment(new Date()))).asDays();
      // Add duration in days to the start date
      const expiry = addDays(this.trial.fromDate, this.trial.duration);

      // Calculate the difference in days from now to the expiry date
      const days = differenceInDays(expiry, new Date());

      return round(days);
    } else {
      return 0;
    }
  }

  check(licence) {
    let hasLicence = true;
    let message;
    if (!this.hasLicence(licence)) {
      hasLicence = false;
      switch (licence) {
        case "trimix":
          message = TranslationService.getTransl(
            "licence-trimix-alert",
            "You need the 'REC2', 'REC3', 'TECH1' or 'TECH2' licence to use He mixes."
          );

          break;
        case "tables":
          message = TranslationService.getTransl(
            "licence-tables-alert",
            "You need the 'TABLES' licence to view and download the decompression tables."
          );
          break;
        case "configs":
          message = TranslationService.getTransl(
            "licence-configurations-alert",
            "You need the 'CONFIGURATIONS' licence to add, delete or edit a dive configuration."
          );
          break;
        case "reb":
          message = TranslationService.getTransl(
            "licence-reb-alert",
            "You need the 'TECH1' or 'TECH2' licence to plan a rebreather dive."
          );
          break;

        case "rec1":
          message = TranslationService.getTransl(
            "licence-reb-alert",
            "You need the 'REC1' licence to plan this dive."
          );
          break;

        case "rec2":
          message = TranslationService.getTransl(
            "licence-reb-alert",
            "You need the 'REC2' licence to plan this dive."
          );
          break;

        case "rec3":
          message = TranslationService.getTransl(
            "licence-reb-alert",
            "You need the 'REC3' licence to plan this dive."
          );
          break;

        case "tech1":
          message = TranslationService.getTransl(
            "licence-reb-alert",
            "You need the 'TECH1' licence to plan this dive."
          );
          break;

        case "tech2":
          message = TranslationService.getTransl(
            "licence-reb-alert",
            "You need the 'TECH2' licence to plan this dive."
          );
          break;

        case "unlimited":
          break;
        case "pro":
          break;
      }
    }
    const lic = {hasLicence: hasLicence, message: message};
    return lic;
  }

  getLicenceLimitations(licence): UserLicenceLimitations {
    //basic licence for non-registered users
    let minO2 = 21;
    let maxO2 = 21;
    let minDecoO2 = 21;
    let maxDecoO2 = 21;
    let maxHe = 0;
    let maxDepth = DiveToolsService.isMetric() ? 15 : 50;
    let maxDecoGases = 0;
    let maxDecoTime = 5;
    switch (licence) {
      case "rec1":
        minO2 = 21;
        maxO2 = 32;
        minDecoO2 = 32;
        maxDecoO2 = 32;
        maxHe = 0;
        maxDepth = DiveToolsService.isMetric() ? 21 : 70;
        maxDecoGases = 0;
        maxDecoTime = 5;
        break;
      case "rec2":
        minO2 = 21;
        maxO2 = 32;
        minDecoO2 = 32;
        maxDecoO2 = 32;
        maxHe = 30;
        maxDepth = DiveToolsService.isMetric() ? 30 : 100;
        maxDecoGases = 0;
        maxDecoTime = 15;
        break;
      case "rec3":
        minO2 = 21;
        maxO2 = 40;
        minDecoO2 = 32;
        maxDecoO2 = 50;
        maxHe = 35;
        maxDepth = DiveToolsService.isMetric() ? 39 : 130;
        maxDecoGases = 1;
        maxDecoTime = 30;
        break;
      case "tech1":
        minO2 = 18;
        maxO2 = 40;
        minDecoO2 = 21;
        maxDecoO2 = 50;
        maxHe = 45;
        maxDepth = DiveToolsService.isMetric() ? 60 : 200;
        maxDecoGases = 1;
        maxDecoTime = 45;
        break;
      case "tech2":
        minO2 = 12;
        maxO2 = 40;
        minDecoO2 = 18;
        maxDecoO2 = 100;
        maxHe = 65;
        maxDepth = DiveToolsService.isMetric() ? 90 : 300;
        maxDecoGases = 3;
        maxDecoTime = 90;
        break;
      case "unlimited" || "pro":
        minO2 = 5;
        maxO2 = 100;
        minDecoO2 = 10;
        maxDecoO2 = 100;
        maxHe = 99;
        maxDepth = DiveToolsService.isMetric() ? 300 : 1000;
        maxDecoGases = 10;
        maxDecoTime = 100000;
    }

    const lim = {
      minO2: minO2,
      maxO2: maxO2,
      minDecoO2: minDecoO2,
      maxDecoO2: maxDecoO2,
      maxHe: maxHe,
      maxDepth: maxDepth,
      maxDecoGases: maxDecoGases,
      maxDecoTime: maxDecoTime,
    };
    return lim;
  }

  getUserLimitations(): UserLicenceLimitations {
    if (this.hasLicence("unlimited") || this.hasLicence("pro")) {
      return this.getLicenceLimitations("unlimited");
    } else if (this.hasLicence("tech2")) {
      return this.getLicenceLimitations("tech2");
    } else if (this.hasLicence("tech1")) {
      return this.getLicenceLimitations("tech1");
    } else if (this.hasLicence("rec3")) {
      return this.getLicenceLimitations("rec3");
    } else if (this.hasLicence("rec2")) {
      return this.getLicenceLimitations("rec2");
    } else if (this.hasLicence("rec1")) {
      return this.getLicenceLimitations("rec1");
    } else {
      return this.getLicenceLimitations("nolicence");
    }
  }

  checkGasLimitations(gas: Gas, isDeco) {
    const lim = this.getUserLimitations();
    if (isDeco) {
      if (
        gas.O2 > lim.maxDecoO2 ||
        gas.O2 < lim.minDecoO2 ||
        gas.He > lim.maxHe
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      if (gas.O2 > lim.maxO2 || gas.O2 < lim.minO2 || gas.He > lim.maxHe) {
        return false;
      } else {
        return true;
      }
    }
  }

  checkDepthLimitations() {
    const lim = this.getUserLimitations();
    return lim.maxDepth;
  }

  //check licences for user
  checkUserlicencesForConfigs(configurations): Array<DiveConfiguration> {
    //check licence for rebreathers
    let stdConfs = [];
    let returnConfs = [];
    if (!this.check("reb")) {
      configurations.forEach((conf) => {
        if (conf.parameters.configuration == "OC") {
          stdConfs.push(conf);
        }
      });
    } else {
      stdConfs = configurations;
    }
    //check licence for trimix
    if (!this.check("trimix")) {
      //set all std gases with He = 0
      stdConfs.forEach((conf) => {
        let bottomTanks = conf.configuration.bottom.map((tank) => {
          tank.gas.setFHe(0);
          return tank;
        });
        let decoTanks = conf.configuration.deco.map((tank) => {
          tank.gas.setFHe(0);
          return tank;
        });
        conf.configuration.bottom = bottomTanks;
        conf.configuration.deco = decoTanks;

        returnConfs.push(conf);
      });
    } else {
      returnConfs = stdConfs;
    }
    return returnConfs;
  }

  async presentLicenceLimitation(type) {
    let header = TranslationService.getTransl(
      "licence-limitation",
      "Licence limitation"
    );
    let message = TranslationService.getTransl(
      "licence-limitation-message",
      "You need a higher licence"
    );
    if (type === "decogases") {
      message = TranslationService.getTransl(
        "licence-limitation-message-decogases",
        "You need a higher licence to add more deco gases"
      );
    } else if (type === "decotime") {
      message = TranslationService.getTransl(
        "licence-limitation-message-decotime",
        "The calculated deco time exceeds your actual licence level. Please change the dive parameters or upgrade your licence."
      );
    }

    const alert = await alertController.create({
      header: header,
      message: message,
      buttons: [
        {
          text: TranslationService.getTransl("ok", "OK"),
        },
      ],
    });
    alert.present();
  }
}
