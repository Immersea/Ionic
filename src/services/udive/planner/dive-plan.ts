import {DiveToolsService} from "./dive-tools";
import {DiveBuhlmann} from "./dive-buhlmann";
import {DiveVPM} from "./dive-vpm";
import {ppO2Drop} from "./ppO2-drop";
import {cloneDeep, filter, last, orderBy, round, toNumber} from "lodash";

import {DecoplannerParameters} from "../../../interfaces/udive/planner/decoplanner-parameters";
import {DivePlanModel} from "../../../interfaces/udive/planner/dive-plan";
import {Gas} from "../../../interfaces/udive/planner/gas";
import {Compartment} from "../../../interfaces/udive/planner/compartment";
//import { Permissions } from '../../models/permissions'
import {DiveConfiguration} from "../../../interfaces/udive/planner/dive-configuration";
import {TranslationService} from "../../common/translations";
import {DecoplannerDive} from "../../../interfaces/udive/planner/decoplanner-dive";
import {addHours} from "date-fns";

/*
 * DivePlan
 *
 *   Creates and runs a deco profile
 *
 */

export class DivePlan {
  //database fields
  _id: string;
  _rev: string;
  type: string;
  created_at: Date;
  updated_at: Date;
  permissions: Permissions;

  //provider fields
  public parameters: any;
  public configuration: DiveConfiguration;
  private profilePointDepth: Array<any>;
  private profilePointRT: Array<any>;
  private profilePointMixO2: Array<any>;
  private profilePointMixHe: Array<any>;
  private profilePointMixSetPoint: Array<any>;
  private surfaceIntervals: Array<any>;
  private decomixO2: Array<any>;
  private decomixHe: Array<any>;
  private decomixfromdepth: Array<any>;
  private decomixSetPoint: Array<any>;
  private decomixUseDiluentGas: Array<any>;
  private currentDive: number;
  public dives: Array<DecoplannerDive>;
  public dives_less_time: Array<DecoplannerDive>;
  public dives_more_time: Array<DecoplannerDive>;
  public dives_less_depth: Array<DecoplannerDive>;
  public dives_more_depth: Array<DecoplannerDive>;
  public time_to_add: number = 5; //min
  public depth_to_add: number = 3; //mt
  public VPM: DiveVPM = new DiveVPM();
  public BUHL: DiveBuhlmann = new DiveBuhlmann();

  users: any; //model users
  //private translate: TranslateService;

  //private tissues: Array<any>;

  constructor() {
    this.reset();
  }

  //public setProviders(translate: TranslateService) {
  //    this.translate = translate;
  //}

  public setConfiguration(conf?: DiveConfiguration) {
    if (conf) {
      this.configuration = conf;
      this.setParams(this.configuration.parameters);
    } else {
      this.setParams();
    }
  }

  private reset() {
    this.profilePointDepth = new Array();
    this.profilePointRT = new Array();
    this.profilePointMixO2 = new Array();
    this.profilePointMixHe = new Array();
    this.profilePointMixSetPoint = new Array();
    this.surfaceIntervals = new Array();
    this.decomixO2 = new Array();
    this.decomixHe = new Array();
    this.decomixfromdepth = new Array();
    this.decomixSetPoint = new Array();
    this.decomixUseDiluentGas = new Array();
    this.currentDive = 0;
    this.dives = new Array();
    this.depth_to_add = DiveToolsService.isMetric() ? 3 : 10;
  }

  //set with existing model
  setWithDivePlanModel(model: DivePlanModel) {
    //set new configuration parameters
    if (model.configuration) {
      this.setConfiguration(model.configuration);
    }
    if (model.users) {
      this.users = model.users;
    }

    return this.setDives(model.dives);
  }

  resetDiveWithConfiguration(
    dive,
    selectedConfiguration,
    updateCalculations = true
  ) {
    let stdDiveProfile = {
      depth: DiveToolsService.isMetric() ? 30 : 100,
      time: 30,
      fO2: 0.32,
      fHe: 0,
      setpoint: 1.4,
    };
    //search gas that is not Oxygen (for CCRs)
    let bottomGas = new Gas(stdDiveProfile.fO2, stdDiveProfile.fHe);
    selectedConfiguration.configuration.bottom.forEach((tank) => {
      if (tank.gas.fO2 != 1) {
        bottomGas = tank.gas;
      }
    });
    this.addDiveProfilePoint(
      dive,
      selectedConfiguration.maxDepth,
      selectedConfiguration.maxTime,
      bottomGas.fO2,
      bottomGas.fHe,
      selectedConfiguration.parameters.bottomppO2,
      updateCalculations
    );
    this.resetDecoTanksWithConfiguration(
      dive,
      selectedConfiguration,
      updateCalculations
    );
  }

  resetDecoTanksWithConfiguration(
    dive,
    selectedConfiguration,
    updateCalculations = true
  ) {
    let decoStartDepth = dive.getDecoStartDepth();
    dive.decoGases = [];
    selectedConfiguration.configuration.deco.forEach((deco) => {
      let ppO2 = selectedConfiguration.parameters.decoppO2;
      if (deco.gas.fO2 == 1) {
        ppO2 = selectedConfiguration.parameters.oxygenppO2;
      }
      //check if dive depth is ok for deco gas
      if (deco.gas.fromDepth < decoStartDepth) {
        this.addDiveDecoGas(
          dive,
          deco.gas.fO2,
          deco.gas.fHe,
          deco.gas.fromDepth,
          ppO2,
          deco.gas.useAsDiluent,
          updateCalculations
        );
      }
    });
  }

  addDive(dive?) {
    let diveModel = new DecoplannerDive(dive);
    this.dives.push(diveModel);
    return diveModel;
  }

  removeDive(index) {
    this.dives.splice(index, 1);
    this.updateCalculations();
  }

  resetDiveProfileIndexes(dive) {
    //reset ordering indexes
    let index = 0;
    dive.profilePoints.map((point) => {
      point.index = index++;
      return point;
    });
  }

  addDiveProfilePoint(
    dive,
    depth,
    time,
    fO2,
    fHe,
    setpoint?,
    updateCalculations?
  ) {
    dive.addProfilePoint(depth, time, fO2, fHe, setpoint);
    this.resetDiveProfileIndexes(dive);
    if (updateCalculations) this.updateCalculations();
  }

  updateDiveProfilePoint(dive, index, depth, time, fO2, fHe, setpoint?) {
    dive.updateProfilePoint(index, depth, time, fO2, fHe, setpoint);
    this.resetDiveProfileIndexes(dive);
    this.updateCalculations();
  }

  removeDiveProfilePoint(dive, index) {
    dive.removeProfilePoint(index);
    this.resetDiveProfileIndexes(dive);
    this.updateCalculations();
  }

  addDiveDecoGas(
    dive,
    fO2,
    fHe,
    fromDepth,
    setpoint?,
    useAsDiluent?,
    updateCalculations?
  ) {
    dive.addDecoGas(fO2, fHe, fromDepth, setpoint, useAsDiluent);
    if (updateCalculations) this.updateCalculations();
  }

  updateDiveDecoGas(
    dive,
    index,
    fO2,
    fHe,
    fromDepth,
    setpoint?,
    useAsDiluent?
  ) {
    dive.updateDecoGas(index, fO2, fHe, fromDepth, setpoint, useAsDiluent);
    this.updateCalculations();
  }

  removeDiveDecoGas(dive, index) {
    dive.removeDecoGas(index);
    this.updateCalculations();
  }

  //setup with units
  private setUnits(units) {
    DiveToolsService.setMetric(units === "Metric");
    this.depth_to_add = units === "Metric" ? 3 : 10;
    this.VPM.setUnits(units);
    this.BUHL.setUnits(units);
    //this.deleteAscent();
  }

  setParams(params?, updateCalculations = true) {
    if (this.parameters && this.parameters.units !== params.units) {
      this.convertUnits(params);
    } else {
      this.configuration.parameters = params;
    }
    this.parameters = new DecoplannerParameters(params);
    this.setUnits(this.parameters.units);
    if (updateCalculations) this.updateCalculations();
  }

  convertUnits(params) {
    //convert units for each dive
    const dives = [];
    this.dives.forEach((dive) => {
      dive.convertUnits(params.units);
      dives.push(dive);
    });
    this.dives = dives;
    //convert configuration
    this.configuration.convertUnits(params);
  }

  setDives(dives: Array<any>) {
    this.dives = [];
    dives.forEach((dive: DecoplannerDive) => {
      this.addDive(dive);
    });
    this.setUnits(this.parameters.units);
    return this.updateCalculations();
  }

  updateCalculations() {
    if (
      this.dives &&
      this.dives.length > 0 &&
      this.dives[0].profilePoints.length > 0
    ) {
      //main set of calcualtions
      this.runCalculationsForDives(this.dives);
      return this;
    } else {
      return null;
    }
  }
  private runCalculationsForDives(dives) {
    this.fillVPMData(dives);
    this.showVPMProfiles(dives);
    this.showBUHLProfiles(dives);
  }

  runCalculationsForTables() {
    //convert to number
    this.time_to_add = toNumber(this.time_to_add);
    this.depth_to_add = toNumber(this.depth_to_add);
    //remove 5 minutes from the bottom times
    this.dives_less_time = cloneDeep(this.dives);
    this.dives_less_time = this.dives_less_time.map((dive) => {
      dive.profilePoints.map((point) => {
        point.time =
          point.time > this.time_to_add ? point.time - this.time_to_add : 0;
        return point;
      });
      return dive;
    });
    this.runCalculationsForDives(this.dives_less_time);

    //remove 5 meters from the bottom depth
    this.dives_less_depth = cloneDeep(this.dives);
    this.dives_less_depth = this.dives_less_depth.map((dive) => {
      dive.profilePoints.map((point) => {
        point.depth =
          point.depth > this.depth_to_add ? point.depth - this.depth_to_add : 0;
        return point;
      });
      return dive;
    });
    this.runCalculationsForDives(this.dives_less_depth);

    //add 5 minutes to the bottom times
    this.dives_more_time = cloneDeep(this.dives);
    this.dives_more_time = this.dives_more_time.map((dive) => {
      dive.profilePoints.map((point) => {
        point.time =
          point.time > this.time_to_add ? point.time + this.time_to_add : 0;
        return point;
      });
      return dive;
    });
    this.runCalculationsForDives(this.dives_more_time);

    //add 5 meters to the bottom depth
    this.dives_more_depth = cloneDeep(this.dives);
    this.dives_more_depth = this.dives_more_depth.map((dive) => {
      dive.profilePoints.map((point) => {
        point.depth =
          point.depth > this.depth_to_add ? point.depth + this.depth_to_add : 0;
        return point;
      });
      return dive;
    });
    this.runCalculationsForDives(this.dives_more_depth);
  }

  getDivePlanModel() {
    this.updateDates();
    return new DivePlanModel(this);
  }

  updateDates() {
    //update all dates according to surface time
    for (let i = 0; i < this.dives.length; i++) {
      this.dives[i].date = this.getDateForDive(i);
    }
  }

  public getDateForDive(diveIndex: number) {
    let totalDiveTime = 0;
    for (let i = 0; i < diveIndex; i++) {
      totalDiveTime +=
        (i > 0 ? this.dives[i].surfaceInterval : 0) +
        this.dives[i].getRunTime() / 60;
    }
    if (diveIndex > 0) totalDiveTime += this.dives[diveIndex].surfaceInterval;
    const date = addHours(this.dives[0].date, totalDiveTime);
    return date;
  }

  private showVPMProfiles(dives) {
    if (this.VPM.runVPM(this, false)) {
      this.runVPMProfiles(dives, false);
    }
    if (this.parameters.configuration != "OC") {
      if (this.VPM.runVPM(this, true)) {
        this.runVPMProfiles(dives, false);
      }
      if (this.VPM.runVPM(this, false)) {
        //run also CCR profile
        this.runVPMProfiles(dives, true);
      }
    }
    return true;
  }

  private runVPMProfiles(dives, CCR = false) {
    for (let currentDiveInt in dives) {
      /*  ----------- VPM ---------------- */
      let currentDive = parseInt(currentDiveInt);
      let dive = dives[currentDiveInt];
      let buhl_dive: any = {};
      let temp;
      let i;
      //let prevmix=0
      //let mix=0;
      let prevsegmentTime = 0,
        segmentTime,
        segmentType,
        prevsegmentDepth = 0,
        segmentDepth = 0,
        prevsegmentfO2 = 0,
        segmentfO2 = 0,
        prevsegmentfHe = 0,
        segmentfHe = 0; //prevsegmentType,
      let otu = 0,
        tmpotu,
        cns = 0,
        tmpcns;
      let ppO23; //let ppO21, ppO22, ppO23//, ppO2min, ppO2max;
      let dive_num = 0;
      //let rmvBottom, rmvDeco;//rmv=0,
      //rmvBottom=this.parameters.rmvBottom;
      //rmvDeco=this.parameters.rmvDeco;
      dive.introText = new Array();
      let trans = TranslationService.getTransl(
        "divewarn",
        "Warning: This program is intended for informational purposes only. The author accepts no responsibility for the results of diving schedules generated by this program. Divers who choose to use this deco schedule do so at their own risk!"
      );
      dive.introText.push(trans);
      dive.configuration = this.parameters.configuration;
      //calculate remaining cns for repetitive dives
      for (dive_num = 0; dive_num < currentDive; dive_num++) {
        prevsegmentDepth = 0;
        prevsegmentTime = 0;
        //prevsegmentType=null;
        for (i = 0; i < 50; i++) {
          if (this.VPM.getProfilePoint(i, 1, dive_num) == -1) break;
          //mix=this.VPM.getProfileGasIndex(i,dive_num);
          /*if (i>0)
                    prevmix=this.VPM.getProfileGasIndex(i-1,dive_num);
                else
                    prevmix=mix;     */

          segmentDepth = this.VPM.getProfilePoint(i, 1, dive_num);
          segmentTime = this.VPM.getProfilePoint(i, 2, dive_num);
          segmentfO2 = this.VPM.getProfilePoint(i, 4, dive_num);
          segmentfHe = this.VPM.getProfilePoint(i, 5, dive_num);
          segmentType = this.VPM.getProfilePoint(i, 6, dive_num);
          if (i == 0) {
            prevsegmentfO2 = segmentfO2;
            prevsegmentfHe = segmentfHe;
            //prevsegmentType="descent";
          } else {
            //skip descent segment
            tmpcns = DiveToolsService.getSegmentCNS(
              prevsegmentDepth,
              segmentDepth,
              prevsegmentfO2,
              segmentfO2,
              -parseFloat(this.parameters.ascentRate),
              parseFloat(this.parameters.descentRate),
              segmentTime - prevsegmentTime,
              this.parameters.units
            );
            if (tmpcns < 0) {
              console.log("Internal ERROR 4\n");
              return false;
            }
            cns += tmpcns;

            prevsegmentDepth = segmentDepth;
            prevsegmentTime = segmentTime;
            prevsegmentfO2 = segmentfO2;
            prevsegmentfHe = segmentfHe;
            //prevsegmentType=segmentType;
          }
        }
        //surface interval
        tmpcns = DiveToolsService.getSegmentCNS(
          segmentDepth,
          0,
          prevsegmentfO2,
          segmentfO2,
          -parseFloat(this.parameters.ascentRate),
          parseFloat(this.parameters.descentRate),
          (2 * segmentDepth) / parseFloat(this.parameters.ascentRate),
          this.parameters.units
        );
        if (tmpcns < 0) {
          console.log("Internal ERROR 4.1\n");
          return false;
        }
        cns += tmpcns;
        cns =
          cns /
          Math.exp((this.surfaceIntervals[dive_num + 1] / 90) * Math.log(2)); // JURE    repetitive dives
      } //next dive

      dive_num = currentDive; // dive to print

      if (dive_num > 0) {
        //dive.introText.push(this.cns_before_the_dive+": "+Math.round(cns*1000)/10+"%");
      }
      let offgassingDepth = parseFloat(
        this.VPM.outputStartOfDecoDepth[dive_num].toFixed(1)
      );

      prevsegmentDepth = 0;
      prevsegmentTime = 0;
      //prevsegmentType="descent";

      buhl_dive.profile = new Array();
      //set totals
      buhl_dive.runtime = 0;
      buhl_dive.decotime = 0;

      //calculate cns for the present dive
      for (i = 0; i < 50; i++) {
        if (this.VPM.getProfilePoint(i, 1, dive_num) == -1) break;

        buhl_dive.profile[i] = {};

        //mix=this.VPM.getProfileGasIndex(i,dive_num);
        /*if (i>0)
                        prevmix=this.VPM.getProfileGasIndex(i-1,dive_num);
                    else
                        prevmix=mix;   */

        segmentDepth = this.VPM.getProfilePoint(i, 1, dive_num);
        temp = parseFloat(segmentDepth.toFixed(1));
        buhl_dive.profile[i].depth = temp;
        segmentTime = this.VPM.getProfilePoint(i, 2, dive_num);
        temp = parseFloat(segmentTime.toFixed(1));
        buhl_dive.profile[i].model = {};
        buhl_dive.profile[i].equal = {};
        buhl_dive.profile[i].s = {};
        buhl_dive.profile[i].linear = {};
        buhl_dive.profile[i].runtime = temp;
        buhl_dive.profile[i].model.runtime = temp;
        buhl_dive.runtime = temp;

        temp = parseFloat(this.VPM.getProfilePoint(i, 3, dive_num).toFixed(1));
        buhl_dive.profile[i].model.stoptime = temp;
        segmentfO2 = this.VPM.getProfilePoint(i, 4, dive_num);
        segmentfHe = this.VPM.getProfilePoint(i, 5, dive_num);
        segmentType = this.VPM.getProfilePoint(i, 6, dive_num);

        buhl_dive.profile[i].gas = new Gas(
          segmentfO2,
          segmentfHe,
          segmentDepth
        );
        if (i == 0) {
          prevsegmentfO2 = segmentfO2;
          prevsegmentfHe = segmentfHe;

          //descent part - take half depth
          segmentDepth = segmentDepth / 2;
        } else if (i == 1) {
          //make descent from 0 to max depth for cns calculations
          prevsegmentfO2 = segmentfO2;
          prevsegmentfHe = segmentfHe;
          prevsegmentDepth = 0;
        }
        // checking ppO2
        //ppO21=Math.round(DiveToolsService.depth2press(prevsegmentDepth)*prevsegmentfO2*100)/100;
        //ppO22=Math.round(DiveToolsService.depth2press(segmentDepth)*prevsegmentfO2*100)/100;
        //check if actual gas for 6mt is oxygen or change setpoint for CCR
        if (
          CCR &&
          DiveToolsService.depth2press(segmentDepth) <= 1.7 &&
          buhl_dive.profile[i].gas.O2 < 95
        ) {
          ppO23 = this.parameters.oxygenppO2;
        } else {
          ppO23 = round(
            DiveToolsService.depth2press(segmentDepth) * segmentfO2,
            2
          );
        }
        //check if ppO2 is coherent with max ppO2 for the depth
        if (ppO23 > round(DiveToolsService.depth2press(segmentDepth) * 1, 2)) {
          ppO23 = round(DiveToolsService.depth2press(segmentDepth) * 1, 2);
        }
        //ppO2min=Math.min(Math.min(ppO21,ppO22),ppO23);
        //ppO2max=Math.max(Math.max(ppO21,ppO22),ppO23);
        buhl_dive.profile[i].ppO2 = ppO23; //+" - "+ppO23+" ";// ppO21+" - "+ppO22+" - "+ppO23+" ";

        /*if (ppO2min < this.parameters.minPPO2)
                        dive.profile[i].ppO2 += " "+this.pp_low+"!";            
                    if ((mix>this.noBottomMix[dive_num]) && (ppO23 > this.parameters.maxPPO2deco))
                        dive.profile[i].ppO2 += " "+this.pp_high+"!";
                    else if ((prevmix>this.noBottomMix[dive_num]) && (Math.max(ppO21,ppO22) > this.parameters.maxPPO2deco)) 
                        dive.profile[i].ppO2 += " "+this.pp_high+"!";
                    else if ((mix<=this.noBottomMix[dive_num]) && (ppO2max > this.parameters.maxPPO2bottom))
                        dive.profile[i].ppO2 += " "+this.pp_high+"!";*/

        //skip descent segment (it is already calculated in the bottom segment)
        if (i > 0) {
          // checking ICD

          let prevsegmentfN2 = 1 - prevsegmentfO2 - prevsegmentfHe;
          let segmentfN2 = 1 - segmentfO2 - segmentfHe;
          if (
            this.parameters.IcdWarning &&
            i >= this.VPM.firstDecoProfilePoint
          ) {
            // ICD flag set and deco zone
            if (
              (prevsegmentfHe != 0 || segmentfHe != 0) &&
              (prevsegmentfN2 != 0 || segmentfN2 != 0)
            ) {
              if (
                prevsegmentfO2 != segmentfO2 ||
                prevsegmentfHe != segmentfHe
              ) {
                // change of gasses
                if (
                  segmentfHe * this.parameters.solubilityHe +
                    segmentfN2 * this.parameters.solubilityN2 >
                  prevsegmentfHe * this.parameters.solubilityHe +
                    prevsegmentfN2 * this.parameters.solubilityN2
                ) {
                  buhl_dive.profile[i].ppO2 += "ICD Warning!";
                }
              }
            }
          }

          tmpotu = DiveToolsService.getSegmentOTU(
            prevsegmentDepth,
            segmentDepth,
            prevsegmentfO2,
            segmentfO2,
            -parseFloat(this.parameters.ascentRate),
            parseFloat(this.parameters.descentRate),
            segmentTime - prevsegmentTime,
            this.parameters.units
          );
          if (tmpotu <= -1) {
            console.log("Internal ERROR 3.1\n");
            return false;
          }
          otu += tmpotu;

          tmpcns = DiveToolsService.getSegmentCNS(
            prevsegmentDepth,
            segmentDepth,
            prevsegmentfO2,
            segmentfO2,
            -parseFloat(this.parameters.ascentRate),
            parseFloat(this.parameters.descentRate),
            segmentTime - prevsegmentTime,
            this.parameters.units
          );
          if (tmpcns < 0) {
            console.log("Internal ERROR 4\n");
            return false;
          }
          cns += tmpcns;
          //dive.profile[i].mix = mix

          prevsegmentDepth = segmentDepth;
          prevsegmentTime = segmentTime;
          prevsegmentfO2 = segmentfO2;
          prevsegmentfHe = segmentfHe;
          //prevsegmentType=segmentType;

          buhl_dive.cns = cns;
          buhl_dive.otu = otu;
        }
        let stage;
        if (segmentType == "first_ascent") {
          //first part of ascent until first stop
          stage = "ascent";
          //rmv=rmvBottom;
        } else if (segmentType == "bottom_ascent") {
          //first part of ascent until first stop
          stage = "bottom_ascent";
          //rmv=rmvBottom;
        } else if (segmentType == "ascent") {
          //deco stops
          stage = "ascent";
          //rmv=rmvDeco*(1+this.parameters.deco_gas_reserve/100);
        } else {
          stage = segmentType;
          //rmv=rmvBottom;
        }

        buhl_dive.profile[i].stage = stage;
        //dive.profile[i].rmv= rmv
      }

      //add offgassing line
      /*dive.profile.push({
                depth:offgassingDepth,
                stage:"offgassing"
            })*/
      dive.offGassingDepth = offgassingDepth;

      //update deco time
      buhl_dive.decotime = 0;
      buhl_dive.profile.forEach((profile) => {
        if (profile.stage == "ascent") {
          buhl_dive.decotime += parseFloat(profile.model.stoptime);
        }
      });
      // new after adding Buhlmann
      //move model profile in "VPM" object
      let result = {
        cns: Math.round(buhl_dive.cns * 100),
        consumption: buhl_dive.consumption,
        decotime: buhl_dive.decotime,
        otu: toNumber(buhl_dive.otu),
        profile: buhl_dive.profile,
        rangeCount: buhl_dive.rangeCount,
        rangeDescr: buhl_dive.rangeDescr,
        rangeShape: buhl_dive.rangeShape,
        rangeSums: buhl_dive.rangeSums,
        runtime: buhl_dive.runtime,
      };

      //insert minimum deco protocol
      result = this.checkMinimumDeco(result);
      //order by runtime
      result.profile = orderBy(result.profile, "runtime", "asc");
      if (CCR) {
        if (!dive.CCR) {
          dive.CCR = {
            BUHL: {},
            VPM: {},
          };
        }
        dive.CCR.VPM = result;
        dive.CCR.VPM = this.insertDepthRanges(dive, "VPM", true);
      } else {
        dive.VPM = result;
        dive.VPM = this.insertDepthRanges(dive, "VPM", false);
        delete dive.CCR;
      }
    }
    return true;
  }

  private showBUHLProfiles(dives) {
    //let buhlDives = []

    /*  ----------- BUHL OC ---------------- */
    for (
      let currentDiveInt = 0;
      currentDiveInt < dives.length;
      currentDiveInt++
    ) {
      /*  ----------- BUHL ---------------- */
      let dive = dives[currentDiveInt];
      dive.introText = new Array();
      let trans = TranslationService.getTransl(
        "divewarn",
        "Warning: This program is intended for informational purposes only. The author accepts no responsibility for the results of diving schedules generated by this program. Divers who choose to use this deco schedule do so at their own risk!"
      );
      dive.introText.push(trans);
      dive.configuration = this.parameters.configuration;

      let repetitiveDive = currentDiveInt > 0;
      //add bottom gases to the list
      let gases = cloneDeep(dives[currentDiveInt].decoGases);
      /*let bottomGases = {}
            dives[currentDiveInt].profilePoints.forEach((point)=>{
                bottomGases[point.toString()] = {
                    textGas: point.toString(),
                    fHe: parseInt(point.fHe),
                    fO2: parseInt(point.fO2),
                    fromDepth: parseInt(point.depth)
                }
            })*/
      dive.bottomGases = cloneDeep(dives[currentDiveInt].bottomGases);

      for (let i in dive.bottomGases) {
        const gas = dive.bottomGases[i];
        gases.push(gas);
        //dive.bottomGases.push(bottomGases[i])
      }

      //filter gases by depth descending
      //dive.bottomGases = orderBy(dive.bottomGases, 'fromDepth', 'desc');

      if (repetitiveDive) {
        //insert surface time
        this.BUHL.doSurfaceInterval(this.surfaceIntervals[currentDiveInt]);
      }
      let result = cloneDeep(
        this.BUHL.doDive(
          this.parameters,
          dives[currentDiveInt].profilePoints,
          gases,
          repetitiveDive,
          true,
          currentDiveInt
        )
      );

      dive.BUHL = {
        cns: Math.round(result.oxTox.cns * 100),
        consumption: null,
        decotime: result.decotime,
        otu: parseInt(result.oxTox.otu),
        profile: result.outputSegments,
        rangeCount: null,
        rangeDescr: null,
        rangeShape: null,
        rangeSums: null,
        runtime: parseInt(result.runtime),
      };
      dive.BUHL = this.checkMinimumDeco(dive.BUHL);
      dive.BUHL = this.insertDepthRanges(dive, "BUHL", false);
      //order by runtime
      dive.BUHL.profile = orderBy(dive.BUHL.profile, "runtime", "asc");
    }

    /*  ----------- BUHL CCR ---------------- */
    if (
      this.parameters.configuration == "CCR" ||
      this.parameters.configuration == "pSCR"
    ) {
      for (
        let currentDiveInt = 0;
        currentDiveInt < dives.length;
        currentDiveInt++
      ) {
        /*  ----------- BUHL ---------------- */
        let dive = dives[currentDiveInt];
        let repetitiveDive = currentDiveInt > 0;
        //add bottom gases to the list
        let gases = cloneDeep(dives[currentDiveInt].decoGases);
        dives[currentDiveInt].profilePoints.forEach((point) => {
          const gas = point.gas;
          gases.push(gas);
        });
        if (repetitiveDive) {
          //insert surface time
          this.BUHL.doSurfaceInterval(this.surfaceIntervals[currentDiveInt]);
        }
        let result = cloneDeep(
          this.BUHL.doDive(
            this.parameters,
            dives[currentDiveInt].profilePoints,
            gases,
            repetitiveDive,
            false,
            currentDiveInt
          )
        );
        if (!dive.CCR) {
          dive.CCR = {
            BUHL: {},
            VPM: {},
          };
        }
        dive.CCR.BUHL = {
          cns: Math.round(result.oxTox.cns * 100),
          consumption: null,
          decotime: result.decotime,
          otu: parseInt(result.oxTox.otu),
          profile: result.outputSegments,
          rangeCount: null,
          rangeDescr: null,
          rangeShape: null,
          rangeSums: null,
          runtime: parseInt(result.runtime),
        };
        dive.CCR.BUHL = this.checkMinimumDeco(dive.CCR.BUHL);
        dive.CCR.BUHL = this.insertDepthRanges(dive, "BUHL", true);
        //order by runtime
        dive.CCR.BUHL.profile = orderBy(
          dive.CCR.BUHL.profile,
          "runtime",
          "asc"
        );
        if (this.parameters.configuration == "pSCR") {
          this.pSCRdrop(dive);
        }
      }
    }
    for (
      let currentDiveInt = 0;
      currentDiveInt < dives.length;
      currentDiveInt++
    ) {
      this.calculateConsumptions(dives[currentDiveInt]);
    }
    return true;
  }

  private pSCRdrop(dive) {
    //convert to metric
    let rmvBottom = this.parameters.rmvBottom;
    let o2_consumption = this.parameters.metabolic_o2_consumption;
    if (dive.bottomGases && dive.bottomGases[0]) {
      let gas_fO2 = dive.bottomGases[0].fO2;
      let drop = new ppO2Drop(rmvBottom, o2_consumption);
      dive.backgasHypoxicDepth = drop.hypoxicDepth(gas_fO2 * 100);
    } else {
      dive.backgasHypoxicDepth = 0;
    }
  }
  private roundUpMultiple(num, div) {
    return num + ((div - (num % div)) % div);
  }
  private checkMinimumDeco(dive) {
    if (dive && dive.decotime <= 3) {
      //ascent up to 50% of avg depth
      let step = 3;
      if (this.parameters.units == "Imperial") {
        step = 10;
      }

      //search last bottom profile
      let last_bottom_profile = {
          runtime: null,
          ppO2: null,
          depth: null,
          gas: null,
          mix: null,
        },
        bottom_runtime = 0,
        average_depth = 0,
        updated_profile = [];
      for (let i in dive.profile) {
        let profile = dive.profile[i];
        if (profile.stage == "bottom") {
          last_bottom_profile = profile;
          bottom_runtime += profile.model.stoptime;
          average_depth += profile.model.stoptime * profile.depth;
          updated_profile.push(profile);
        } else if (profile.stage == "ascent") {
          //replace ascent with minimum deco
        } else {
          updated_profile.push(profile);
        }
      }
      dive.profile = updated_profile;
      //calculate weighted depth
      let average_bottom_depth = average_depth / bottom_runtime;
      let half_depth = this.roundUpMultiple(average_bottom_depth / 2, step);

      let runtime = last_bottom_profile.runtime;
      let decotime = 0;
      let ppO2_relative = last_bottom_profile.ppO2 / last_bottom_profile.depth;
      let stop_time = 0.5;
      let actual_depth = last_bottom_profile.depth;
      let first_ascent = true;
      for (let i = half_depth; i > 0; i = i - step) {
        let ascent_time =
          (actual_depth - i) / parseFloat(this.parameters.ascentRate);
        actual_depth = i;
        runtime += ascent_time + stop_time;
        decotime += (first_ascent ? 0 : ascent_time) + stop_time;
        first_ascent = false;
        dive.profile.push({
          depth: i,
          equal: {},
          gas: last_bottom_profile.gas,
          linear: {},
          mix: last_bottom_profile.mix,
          ppO2: Math.round(ppO2_relative * i * 100) / 100,
          rangeShape: "model",
          rmv: this.parameters.rmvDeco,
          runtime: runtime,
          s: {},
          stage: "ascent",
          model: {
            runtime: runtime,
            stoptime: stop_time,
          },
        });
      }

      //update totals
      dive.runtime = runtime;
      dive.decotime = decotime;
    }
    return dive;
  }

  private insertDepthRanges(diveSource, model, CCR) {
    let dive;
    if (CCR) {
      dive = diveSource.CCR ? diveSource.CCR[model] : null;
    } else {
      dive = diveSource[model];
    }
    if (dive && dive.profile) {
      //set profiles different from VPM and add range sums
      let rangeReferenceDepths = [],
        rangeSums = {},
        rangeDepths = [], //array to keep order of depths
        rangeCount = {},
        actualRange = 0,
        profileCount = 1,
        bottomLevels = 0;

      //imperial
      if (this.parameters.units == "Imperial") {
        rangeReferenceDepths = [20, 70, 120, 170, 220, 270, 320, 370];
      } else {
        rangeReferenceDepths = [6, 21, 36, 51, 66, 81, 96, 111];
      }

      let descent = [];
      let bottom = [];
      let ascent = [];
      //check number of bottom levels
      //separate ascent
      dive.profile.forEach((profile) => {
        if (profile.stage == "descent") {
          bottomLevels++;
          descent.push(profile);
        } else if (profile.stage == "bottom") {
          bottomLevels++;
          bottom.push(profile);
        } else if (profile.stage == "ascent") {
          ascent.push(profile);
        } else {
          bottomLevels++;
          ascent.push(profile);
        }
      });
      //order ascent by depth
      ascent = orderBy(ascent, "depth", "desc");
      //reorder dive profile
      dive.profile = [];
      dive.profile = dive.profile.concat(descent, bottom, ascent);

      //shape of the range - model, linear, etc
      dive.rangeShape = {};
      //description of the range - deep, deco, bottom
      dive.rangeDescr = {};

      let bottom_runtime = 0,
        average_depth = 0,
        average_dive_depth = 0,
        total_runtime = 0;
      let startOfDecoZone = diveSource.decoGases.length > 0 ? false : true; //no deco gases, so no deep stops
      dive.profile.forEach((profile) => {
        if (
          profileCount > bottomLevels &&
          (profile.stage == "bottom" || profile.stage == "ascent")
        ) {
          //skip bottom time
          if (rangeReferenceDepths.indexOf(parseInt(profile.depth)) != -1) {
            actualRange = profile.depth;
            rangeDepths.push(profile.depth);
            rangeSums[actualRange] = 0;
            rangeCount[actualRange] = 0;
          }
          if (actualRange == 0) {
            actualRange = profile.depth;
            rangeDepths.push(profile.depth);
            rangeSums[actualRange] = 0;
            rangeCount[actualRange] = 0;
          }
          rangeSums[actualRange] += parseFloat(profile.model.stoptime);

          rangeCount[actualRange]++;

          dive.rangeShape[actualRange] = "model";
          //make descriptions of ranges
          if (profile.ppO2 <= 1.3 && !startOfDecoZone) {
            dive.rangeDescr[actualRange] = TranslationService.getTransl(
              "deep-stops-from",
              "Deep Stops from"
            );
          } else {
            startOfDecoZone = true;
            dive.rangeDescr[actualRange] = TranslationService.getTransl(
              "deco-stops-from",
              "Deco Stops from"
            );
          }
        }

        //calculate average depth
        if (profile.stage == "bottom") {
          average_depth += (profile.runtime - bottom_runtime) * profile.depth;
          //select bottom runtime for next stages
          bottom_runtime = profile.runtime;
        }
        average_dive_depth += (profile.runtime - total_runtime) * profile.depth;
        total_runtime = profile.runtime;

        profile.rangeShape = "model";
        profileCount++;
      });
      //calculate weighted depth
      dive.average_bottom_depth = average_depth / bottom_runtime;
      dive.average_dive_depth = average_dive_depth / total_runtime;

      dive.rangeSums = rangeSums;
      dive.rangeCount = rangeCount;
      //insert other shapes for the ranges
      for (let i in rangeDepths) {
        let range = rangeDepths[i],
          nextRange = rangeDepths[parseInt(i) + 1]
            ? rangeDepths[parseInt(i) + 1]
            : 0,
          step_s = 1,
          step_lin = 1,
          runtime_s,
          runtime_equal,
          runtime_lin,
          steps_lin,
          stop_time_s =
            (runtime_s =
            runtime_equal =
            runtime_lin =
            steps_lin =
              0);
        dive.profile.forEach((profile) => {
          if (profile.depth <= range && profile.depth > nextRange) {
            if (runtime_equal == 0)
              runtime_equal = profile.model.runtime - profile.model.stoptime;
            //equal
            profile.equal.stoptime = rangeSums[range] / rangeCount[range];
            runtime_equal += profile.equal.stoptime;
            profile.equal.runtime = runtime_equal;

            //s
            if (runtime_s == 0) {
              runtime_s = profile.model.runtime - profile.model.stoptime;
            }
            if (step_s == 1 && rangeCount[range] == 5) {
              stop_time_s = rangeSums[range] / 3;
            } else if (step_s == 1 && rangeCount[range] == 4) {
              stop_time_s = rangeSums[range] / 2.6; //for 5 steps -> sum/3
            } else if (step_s == 1 && rangeCount[range] == 3) {
              stop_time_s = rangeSums[range] / 2.3; //for 5 steps -> sum/3
            } else if (step_s == 1) {
              stop_time_s = rangeSums[range] / rangeCount[range];
            }
            if (step_s == 1 || step_s == rangeCount[range]) {
              profile.s.stoptime = stop_time_s;
            } else if (step_s > 1 && rangeCount[range] == 4) {
              profile.s.stoptime = (rangeSums[range] - 2 * stop_time_s) / 2;
            } else if (step_s > 1 && rangeCount[range] == 3) {
              profile.s.stoptime = rangeSums[range] - 2 * stop_time_s;
            } else if (step_s > 1 && rangeCount[range] > 3) {
              profile.s.stoptime = stop_time_s / (rangeCount[range] - 2);
            }
            runtime_s += profile.s.stoptime;
            profile.s.runtime = runtime_s;
            step_s++;

            //linear
            if (runtime_lin == 0) {
              runtime_lin = profile.model.runtime - profile.model.stoptime;
              let count = rangeCount[range];
              while (count > 0) {
                steps_lin += count;
                count--;
              }
            }
            profile.linear.stoptime = (rangeSums[range] / steps_lin) * step_lin;
            runtime_lin += profile.linear.stoptime;
            profile.linear.runtime = runtime_lin;
            step_lin++;
          }
        });
      }
      return dive;
    } else {
      return false;
    }
  }

  private getGasfO2(gas, diveSource) {
    for (let k in diveSource.decoGases) {
      // clear the table
      if (diveSource.decoGases[k].toString() == gas) {
        return diveSource.decoGases[k].fO2;
      }
    }
    for (let k in diveSource.bottomGases) {
      // clear the table
      if (diveSource.bottomGases[k].toString() == gas) {
        return diveSource.bottomGases[k].fO2;
      }
    }
  }
  private calculateConsumptions(diveSource) {
    let models = [];
    let ccr = false,
      pscr = 1;
    if (diveSource.CCR) {
      ccr = true;
      models.push("CCR VPM");
      models.push("CCR BUHL");
    }
    if (this.parameters.configuration == "pSCR") {
      ccr = false;
      pscr = this.parameters.pscrGasDivider;
    }
    if (diveSource.VPM) models.push("VPM");
    if (diveSource.BUHL) models.push("BUHL");

    let maxProfileDepth = 0;
    diveSource.profilePoints.forEach((point) => {
      maxProfileDepth =
        maxProfileDepth < parseInt(point.depth)
          ? parseInt(point.depth)
          : maxProfileDepth;
    });

    //set oxygen used for CCR
    let oxygenCCR = {
      BUHL: 0,
      VPM: 0,
    };

    for (let i in models) {
      let model = models[i];
      let prevsegmentDepth = 0,
        prevsegmentfO2 = 0,
        prevsegmentTime = 0,
        previousStage = "descent",
        prevgas = null,
        dive = null;
      if (model.indexOf("CCR") != -1) {
        dive = diveSource.CCR[model.replace("CCR ", "")];
      } else {
        dive = diveSource[model];
      }
      //reset diveGas values
      let consumption = {};
      for (let k in diveSource.decoGases) {
        // clear the table
        consumption[diveSource.decoGases[k].toString()] = 0;
      }
      for (let k in diveSource.bottomGases) {
        // clear the table
        consumption[diveSource.bottomGases[k].toString()] = 0;
      }
      let profile = null,
        selectedShape = null,
        gas = null,
        rmv = 0,
        //stage = null,
        segmentDepth = null,
        segmentTime = null,
        segmentfO2 = null,
        profileLength = dive.profile.length,
        minGasCompleted = false;
      dive.gasRules = {
        MG: {
          //minimum gas
          Lt: 0,
          cuft: 0,
          time: 0,
        },
        UG: {
          Lt: 0,
          cuft: 0,
          time: 0,
        }, //usable gas
        TG: {
          Lt: 0,
          cuft: 0,
          time: 0,
        },
      };
      let minGas = 0;
      let usableGas = 0;
      let turnGas = 0;

      //get deco gas max depth
      let decoGasesMaxDepth = 0;
      diveSource.decoGases.forEach((gas) => {
        decoGasesMaxDepth =
          gas.fromDepth > decoGasesMaxDepth ? gas.fromDepth : decoGasesMaxDepth;
      });
      for (let k = 0; k <= profileLength; k++) {
        //exclude descent and offgassing lines
        if (!dive.profile[k]) {
          //last ascent to surface
          let stop_time = 0,
            ascent_time =
              (prevsegmentDepth / parseFloat(this.parameters.ascentRate)) * 3,
            run_time = prevsegmentTime + ascent_time;
          if (dive.profile[k - 1] && dive.profile[k - 1].depth > 0) {
            dive.profile[k] = {
              stage: "ascent",
              rangeShape: selectedShape,
              gas: prevgas,
              depth: 0,
              model: {
                stoptime: stop_time,
                runtime: run_time,
              },
              equal: {
                stoptime: stop_time,
                runtime: run_time,
              },
              linear: {
                stoptime: stop_time,
                runtime: run_time,
              },
              s: {
                stoptime: stop_time,
                runtime: run_time,
              },
            };
            dive.runtime += ascent_time;
            dive.profile[k].runtime = dive.runtime;
            dive.decotime += ascent_time;
          }
        }
        if (
          dive.profile[k] &&
          (dive.profile[k].stage == "bottom" ||
            dive.profile[k].stage == "ascent") &&
          diveSource.bottomGases.length > 0
        ) {
          profile = dive.profile[k];
          selectedShape = profile.rangeShape;
          gas = profile.gas;
          rmv =
            dive.profile[k].stage == "bottom"
              ? this.parameters.rmvBottom
              : this.parameters.rmvDeco;
          //stage = profile.stage
          segmentDepth = profile.depth;
          segmentTime = profile[selectedShape].runtime;
          segmentfO2 = this.getGasfO2(gas, diveSource);

          //CCR consumtions
          if (model.indexOf("CCR") != -1) {
            if (!consumption["OxygenCCR"]) consumption["OxygenCCR"] = 0;
            consumption["OxygenCCR"] =
              segmentTime * parseFloat(this.parameters.CCR_o2_consumption);
            if (model.indexOf("BUHL") != -1) {
              oxygenCCR.BUHL = consumption["OxygenCCR"];
            } else {
              oxygenCCR.VPM = consumption["OxygenCCR"];
            }

            //Bottom Gas
            let bottomGas = diveSource.bottomGases[0];
            consumption[bottomGas.toString()] =
              DiveToolsService.depth2press(maxProfileDepth) *
              parseFloat(this.parameters.CCR_volume_for_consumption) *
              3;
          } else {
            let ascSegment = DiveToolsService.getSegmentGas(
              prevsegmentDepth,
              segmentDepth,
              rmv,
              -parseFloat(this.parameters.ascentRate),
              parseFloat(this.parameters.descentRate),
              segmentTime - prevsegmentTime,
              1
            );
            let constSegment = DiveToolsService.getSegmentGas(
              prevsegmentDepth,
              segmentDepth,
              rmv,
              -parseFloat(this.parameters.ascentRate),
              parseFloat(this.parameters.descentRate),
              segmentTime - prevsegmentTime,
              2
            );
            let segment = ascSegment + constSegment;
            //MINIMUM GAS CALCULATIONS
            //console.log("MINIMUM GAS CALCULATIONS",dive.gasRules.MG.Lt)
            //insert min gas
            if (dive.profile[k].stage == "ascent" && !minGasCompleted) {
              if (dive.profile[k].stage != previousStage) {
                //first ascent : add minimum gas at bottom for emergengy
                minGas +=
                  round(
                    DiveToolsService.getSegmentGas(
                      prevsegmentDepth,
                      prevsegmentDepth,
                      this.parameters.rmvBottom,
                      -parseFloat(this.parameters.ascentRate),
                      parseFloat(this.parameters.descentRate),
                      this.parameters.time_at_bottom_for_min_gas,
                      3
                    )
                  ) *
                  toNumber(this.parameters.rmvBottom_multiplier_for_min_gas) *
                  toNumber(this.parameters.number_of_divers_for_min_gas);

                dive.gasRules.MG.time += round(
                  this.parameters.time_at_bottom_for_min_gas
                );
                //console.log("bottom for emergengy",prevsegmentDepth,prevsegmentDepth,this.parameters.time_at_bottom_for_min_gas,dive.gasRules.MG.Lt)
                //ascent to first stop
                minGas +=
                  round(
                    DiveToolsService.getSegmentGas(
                      prevsegmentDepth,
                      segmentDepth,
                      this.parameters.rmvBottom,
                      -parseFloat(this.parameters.ascentRate),
                      parseFloat(this.parameters.descentRate),
                      segmentTime - prevsegmentTime,
                      3
                    )
                  ) *
                  toNumber(this.parameters.rmvBottom_multiplier_for_min_gas) *
                  toNumber(this.parameters.number_of_divers_for_min_gas);
                dive.gasRules.MG.time += round(
                  segmentTime - prevsegmentTime,
                  1
                );
                //console.log("ascent to first stop ",prevsegmentDepth,segmentDepth,dive.gasRules.MG.Lt)
              } else if (segmentDepth > decoGasesMaxDepth) {
                //ascent to other stops until gas change
                minGas +=
                  round(
                    DiveToolsService.getSegmentGas(
                      prevsegmentDepth,
                      segmentDepth,
                      this.parameters.rmvBottom,
                      -parseFloat(this.parameters.ascentRate),
                      parseFloat(this.parameters.descentRate),
                      segmentTime - prevsegmentTime,
                      3
                    )
                  ) *
                  toNumber(this.parameters.rmvBottom_multiplier_for_min_gas) *
                  toNumber(this.parameters.number_of_divers_for_min_gas);
                dive.gasRules.MG.time += round(
                  segmentTime - prevsegmentTime,
                  1
                );
                //console.log("ascent to other stops until gas change",prevsegmentDepth,segmentDepth,dive.gasRules.MG.Lt)
              } else if (!minGasCompleted) {
                //gas change
                minGas +=
                  round(
                    DiveToolsService.getSegmentGas(
                      segmentDepth,
                      segmentDepth,
                      this.parameters.rmvBottom,
                      -parseFloat(this.parameters.ascentRate),
                      parseFloat(this.parameters.descentRate),
                      this.parameters.time_at_gas_switch_for_min_gas,
                      2
                    )
                  ) *
                  toNumber(this.parameters.rmvBottom_multiplier_for_min_gas) *
                  toNumber(this.parameters.number_of_divers_for_min_gas);
                dive.gasRules.MG.time += parseInt(
                  this.parameters.time_at_gas_switch_for_min_gas
                );
                minGasCompleted = true;
                //console.log("gas change",segmentDepth,segmentDepth,dive.gasRules.MG.Lt)
              }
            } else if (dive.profile[k].stage == "bottom") {
              usableGas += round(segment) / pscr;
              dive.gasRules.UG.time += round(segmentTime - prevsegmentTime, 1);
            }

            if (DiveToolsService.isMetric()) {
              dive.gasRules.MG.Lt = minGas;
              dive.gasRules.MG.cuft = round(DiveToolsService.ltToCuFt(minGas));
            } else {
              dive.gasRules.MG.cuft = minGas;
              dive.gasRules.MG.Lt = DiveToolsService.cuFtToLt(minGas);
            }

            if (ccr && dive.profile[k].stage == "bottom") {
              //bailout gas - include CCR consumption for bottom gas
              gas = diveSource.bottomGases[0].toString();
              segment =
                DiveToolsService.depth2press(maxProfileDepth) *
                parseFloat(this.parameters.CCR_volume_for_consumption) *
                3;
              //update UG to CCR
              usableGas = segment;
            }
            consumption[gas] += round(segment) / pscr;
            if (prevsegmentfO2 == 0) {
              prevsegmentfO2 = segmentfO2;
            }
          }

          prevsegmentDepth = segmentDepth;
          prevsegmentTime = segmentTime;
          prevsegmentfO2 = segmentfO2;
          previousStage = dive.profile[k].stage;
          prevgas = gas;
        }
        //set turn gas
        let usableGasParam = 1;
        if (this.parameters.gasRule == "1/1") {
          usableGasParam = 1;
        } else if (this.parameters.gasRule == "1/2") {
          usableGasParam = 2;
        } else if (this.parameters.gasRule == "1/3") {
          usableGasParam = 3;
        }
        turnGas = minGas + round(usableGas / usableGasParam);
        dive.gasRules.TG.time = dive.gasRules.UG.time / usableGasParam;
      }

      if (DiveToolsService.isMetric()) {
        dive.gasRules.UG.Lt = usableGas;
        dive.gasRules.UG.cuft = DiveToolsService.ltToCuFt(usableGas);
        dive.gasRules.TG.Lt = turnGas;
        dive.gasRules.TG.cuft = DiveToolsService.ltToCuFt(turnGas);
      } else {
        dive.gasRules.UG.cuft = usableGas;
        dive.gasRules.UG.Lt = DiveToolsService.cuFtToLt(usableGas);
        dive.gasRules.TG.cuft = turnGas;
        dive.gasRules.TG.Lt = DiveToolsService.cuFtToLt(turnGas);
      }

      //re-order profiles by runtime
      dive.profile = orderBy(dive.profile, "runtime", "asc");

      //write consumptions in order
      dive.consumption = [];
      for (let k in diveSource.bottomGases) {
        // clear the table
        let gas = cloneDeep(diveSource.bottomGases[k]);

        gas.required = minGas + usableGas;
        gas.available = 0;
        gas.deco = false;
        //for CCR update gas used in bailout consumptions
        if (model.indexOf("CCR") != -1) {
          //CCR VPM/BUHL
          gas.used = consumption[diveSource.bottomGases[k].toString()];

          gas.required = gas.used;
        } else if (ccr) {
          //CCR BAILOUT
          for (let i in diveSource.CCR[model.replace("CCR ", "")].consumption) {
            let CCR_gas =
              diveSource.CCR[model.replace("CCR ", "")].consumption[i];
            if (CCR_gas.toString() == gas.toString()) {
              gas.used = CCR_gas.used;
              break;
            } else {
              gas.used = 0;
            }
          }
        } else {
          //OC
          gas.used = consumption[diveSource.bottomGases[k].toString()];
        }
        dive.consumption.push(gas);
      }
      for (let k in diveSource.decoGases) {
        // clear the table
        if (consumption[diveSource.decoGases[k].toString()] > 0) {
          let gas = cloneDeep(diveSource.decoGases[k]);

          gas.required =
            (round(
              consumption[diveSource.decoGases[k].toString()] *
                (1 + this.parameters.deco_gas_reserve / 100) *
                10
            ) /
              10) *
            pscr;
          gas.available = 0;

          gas.deco = true;
          if (model.indexOf("CCR") != -1) {
            //CCR VPM/BUHL
            gas.used = consumption[diveSource.decoGases[k].toString()];
            gas.required = gas.used;
          } else if (ccr) {
            //CCR BAILOUT
            for (let i in diveSource.CCR[model.replace("CCR ", "")]
              .consumption) {
              let CCR_gas =
                diveSource.CCR[model.replace("CCR ", "")].consumption[i];
              if (CCR_gas.toString() == gas.toString()) {
                gas.used = CCR_gas.used;
                break;
              } else {
                gas.used = 0;
              }
            }
          } else {
            //OC
            gas.used = consumption[diveSource.decoGases[k].toString()];
          }
          dive.consumption.push(gas);
        }
      }
      dive.consumption = orderBy(dive.consumption, "fromDepth", "desc");
    }

    //add oxygen for CCR to all models
    if (oxygenCCR.BUHL > 0) {
      for (let i in models) {
        let model = models[i];
        let dive = null;
        if (model.indexOf("CCR") != -1) {
          dive = diveSource.CCR[model.replace("CCR ", "")];
        } else {
          dive = diveSource[model];
        }
        let gas = new Gas(1, 0, DiveToolsService.isMetric() ? 6 : 20, 1.6);
        gas.available = 0;
        if (model.indexOf("BUHL") != -1) {
          gas.used = oxygenCCR.BUHL;
        } else {
          gas.used = oxygenCCR.VPM;
        }

        gas.required = gas.used;
        dive.consumption.push(gas);
      }
    }

    return diveSource;
  }
  /*private updateAvailableGas() {
        let bottomTanks = this.plan.tanks.bottom,
            decoTanks = this.plan.tanks.deco,
            diveConsumptions = this.dives[this.currentDive].VPM.consumption, /////////////////CHECK!!!!!
            convertPressure = 1,
            convertVolume = 1
        //imperial
        if(!this.parameters.metric) {
            convertPressure = DiveToolsService.psiToBar(1)
            convertVolume = DiveToolsService.ltToCuFt(1)
        }
        //reset available liters
        if (bottomTanks && Object.keys(bottomTanks).length>0) {
            for (let k in diveConsumptions) {
                diveConsumptions[k].ltAvailable = 0
            }
            let k
            for (let i in bottomTanks) {
                for (k in diveConsumptions) {
                    if (diveConsumptions[k].gas == bottomTanks[i].gas) {
                        diveConsumptions[k].ltAvailable += bottomTanks[i].bar_start*convertPressure * bottomTanks[i].size
                        break
                    }
                }
            }
            //remove minimum gas to show only usable gas
            diveConsumptions[k].ltAvailable -= this.plan.minGas.Lt
            
            for (let i in decoTanks) {
                for (let k in diveConsumptions) {
                    if (diveConsumptions[k].gas == decoTanks[i].gas) {
                        diveConsumptions[k].ltAvailable += decoTanks[i].bar_start*convertPressure * decoTanks[i].size
                        break
                    }
                }
            }
        
            //insert number of bottom stages for button visualisation
            this.noBottomStages = Object.keys(bottomTanks).length-1
        }
    }*/
  updateRangeShape(model, depth, shape, ccr = false) {
    let dive;
    if (ccr) {
      dive = this.dives[this.currentDive].CCR;
    } else {
      dive = this.dives[this.currentDive];
    }
    dive[model].rangeShape[depth] = shape;
    //change all profile shapes for this range
    let lines_count = dive[model].rangeCount[depth];
    dive[model].profile.map((item) => {
      if (item.depth <= depth && lines_count > 0) {
        item.rangeShape = shape;
        lines_count--;
      }
    });
    this.calculateConsumptions(this.dives[this.currentDive]);
  }
  /*private deleteAscent() {
        this.parameters.altitude_dive_algorithm = "off"
        this.parameters.altitude_of_dive = "0";
        this.parameters.ascent_to_altitude_hours = "12";
        this.parameters.hours_at_altitude_before_dive = "12";
    }*/
  /*
    private refreshDives(decoGasOptions) {
        //add selected deco gases
        let func = this
        if (func.dives.length>0 && func.dives[func.currentDive]) {
            func.dives[func.currentDive].decoGases = new Array()
            for (let key in decoGasOptions) {
                let decoGas = decoGasOptions[key]
                if (decoGas.checked) {
                    func.dives[func.currentDive].decoGases.push({
                        fO2: parseInt(decoGas.fO2),
                        fHe: parseInt(decoGas.fHe),
                        fromDepth: parseInt(decoGas.gasMaxDepth),
                        setpoint:parseFloat(decoGas.setpoint)
                    })
                }
            }
    
            //set gas text fields
            this.dives[this.currentDive].profilePoints.forEach((point) =>{
                point.toString() = DiveToolsService.gasmixToString(point.fO2/100,point.fHe/100)
            })
            this.dives[this.currentDive].decoGases.forEach(function(gas){
                gas.toString() = DiveToolsService.gasmixToString(gas.fO2/100,gas.fHe/100)
            })
    
            //filter gases by depth descending
            this.dives[this.currentDive].decoGases = orderBy(this.dives[this.currentDive].decoGases, "fromDepth", 'desc')
        }
    }*/
  /*
   * only for VPM
   */
  private fillVPMData(dives) {
    //reset VPM parameters
    for (let i = 0; i < this.parameters.MAX_DIVEPONTS; i++)
      for (let j = 0; j < this.parameters.MAX_DIVES; j++) {
        if (!Array.isArray(this.profilePointDepth[i]))
          this.profilePointDepth[i] = new Array();
        this.profilePointDepth[i][j] = -1;
        if (!Array.isArray(this.profilePointRT[i]))
          this.profilePointRT[i] = new Array();
        this.profilePointRT[i][j] = -1;
        if (!Array.isArray(this.profilePointMixO2[i]))
          this.profilePointMixO2[i] = new Array();
        this.profilePointMixO2[i][j] = -1;
        if (!Array.isArray(this.profilePointMixHe[i]))
          this.profilePointMixHe[i] = new Array();
        this.profilePointMixHe[i][j] = -1;
        if (!Array.isArray(this.profilePointMixSetPoint[i]))
          this.profilePointMixSetPoint[i] = new Array();
        this.profilePointMixSetPoint[i][j] = -1;
      }

    for (let i = 0; i < this.parameters.MAX_DECOMIX; i++)
      for (let j = 0; j < this.parameters.MAX_DIVES; j++) {
        if (!Array.isArray(this.decomixO2[i])) this.decomixO2[i] = new Array();
        this.decomixO2[i][j] = -1;
        if (!Array.isArray(this.decomixHe[i])) this.decomixHe[i] = new Array();
        this.decomixHe[i][j] = -1;
        if (!Array.isArray(this.decomixfromdepth[i]))
          this.decomixfromdepth[i] = new Array();
        this.decomixfromdepth[i][j] = -1;
        if (!Array.isArray(this.decomixSetPoint[i]))
          this.decomixSetPoint[i] = new Array();
        this.decomixSetPoint[i][j] = -1;
        if (!Array.isArray(this.decomixUseDiluentGas[i]))
          this.decomixUseDiluentGas[i] = new Array();
        this.decomixUseDiluentGas[i][j] = -1;
      }

    this.surfaceIntervals[0] = -1;
    for (let j = 1; j < this.parameters.MAX_DIVES; j++)
      this.surfaceIntervals[j] = 180;

    for (let dive in dives) {
      let func = this;
      let diveInt = toNumber(dive);
      dives[diveInt].profilePoints.forEach((profilePoint) => {
        func.addProfilePoint(profilePoint, diveInt);
      });
      dives[diveInt].decoGases.forEach((decoGas) => {
        func.addDecoGas(decoGas, diveInt);
      });
      this.addSurfaceInterval(dives[diveInt].surfaceInterval, diveInt);
    }
  }
  private addProfilePoint(profilePoint: any, dive: number) {
    let i;
    for (i in this.profilePointDepth) {
      if (this.profilePointDepth[i][dive] == -1) {
        //found empty spot
        break;
      }
    }
    this.profilePointDepth[i][dive] = parseFloat(profilePoint.depth);
    this.profilePointRT[i][dive] = parseFloat(profilePoint.time);
    this.profilePointMixO2[i][dive] = parseFloat(profilePoint.gas.fO2) * 100;
    this.profilePointMixHe[i][dive] = parseFloat(profilePoint.gas.fHe) * 100;
    this.profilePointMixSetPoint[i][dive] = parseFloat(profilePoint.setpoint);
  }
  private addDecoGas(decoGas: any, dive: number) {
    let i;
    for (i in this.decomixO2) {
      if (this.decomixO2[i][dive] == -1) {
        //found empty spot
        break;
      }
    }
    this.decomixO2[i][dive] = parseFloat(decoGas.fO2) * 100;
    this.decomixHe[i][dive] = parseFloat(decoGas.fHe) * 100;
    this.decomixSetPoint[i][dive] = parseFloat(decoGas.ppO2);
    this.decomixUseDiluentGas[i][dive] = decoGas.useAsDiluent;
    this.decomixfromdepth[i][dive] = parseFloat(decoGas.fromDepth);
  }
  private addSurfaceInterval(surfaceInterval, dive) {
    if (dive > 0) this.surfaceIntervals[dive] = round(surfaceInterval * 60);
  }

  /* end VPM */

  getParamRanges(units?) {
    if (!units) units = this.parameters.units;
    //set ranges for options
    let ranges = {
      conservatism: [0, 1, 2, 3, 4],
      gf: [
        5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
        95, 100,
      ],
      minppO2: [0.15, 0.16, 0.17, 0.18, 0.19, 0.2, 0.21, 0.22, 0.23],
      ppO2: [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6],
      pscrGasDivider: [4, 5, 6, 7, 8, 9, 10],
      CCR_o2_consumption: null,
      CCR_volume_for_consumption: null,
      rmv: null,
      deco_gas_reserve: null,
      time_at_bottom_for_min_gas: null,
      rmvBottom_multiplier_for_min_gas: null,
      number_of_divers_for_min_gas: null,
      descentRate: [],
      ascentRate: [],
      minPPO2: null,
      hhf: [],
    };

    if (units == "Imperial") {
      ranges.CCR_o2_consumption = [
        0.02, 0.023, 0.025, 0.028, 0.035, 0.043, 0.05, 0.056, 0.063, 0.07,
        0.078, 0.085, 0.09, 0.1, 0.105,
      ];
    } else {
      ranges.CCR_o2_consumption = [
        0.5, 0.6, 0.7, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8,
        3.0,
      ];
    }
    if (units == "Imperial") {
      ranges.CCR_volume_for_consumption = [
        0.26, 0.3, 0.33, 0.36, 0.4, 0.43, 0.46, 0.5,
      ];
    } else {
      ranges.CCR_volume_for_consumption = [7, 8, 9, 10, 11, 12, 13, 14];
    }
    if (units == "Imperial") {
      ranges.rmv = [
        0.36, 0.4, 0.43, 0.46, 0.5, 0.53, 0.56, 0.6, 0.63, 0.66, 0.7, 0.73,
        0.76, 0.8, 0.83, 0.86, 0.9, 0.93, 0.96, 1.0, 1.03,
      ];
    } else {
      ranges.rmv = [
        10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
        28, 29, 30,
      ];
    }
    ranges.deco_gas_reserve = [];
    for (let i = 0; i <= 40; i++) {
      ranges.deco_gas_reserve.push(i);
    }
    ranges.time_at_bottom_for_min_gas = [0, 1, 2, 3, 4];
    ranges.rmvBottom_multiplier_for_min_gas = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5];
    ranges.number_of_divers_for_min_gas = [1, 2];
    ranges.descentRate = [];
    if (units == "Imperial") {
      for (let i = 33; i <= 133; i += 3) {
        ranges.descentRate.push(i);
      }
    } else {
      for (let i = 10; i <= 40; i++) {
        ranges.descentRate.push(i);
      }
    }
    ranges.ascentRate = [];
    if (units == "Imperial") {
      for (let i = 3; i <= 50; i += 3) {
        ranges.ascentRate.push(i);
      }
    } else {
      for (let i = 1; i <= 15; i++) {
        ranges.ascentRate.push(i);
      }
    }
    ranges.minPPO2 = [0.15, 0.16, 0.17, 0.18, 0.19, 0.2];

    ranges.hhf = [];
    for (let i = -10; i <= 10; i++) {
      ranges.hhf.push(i);
    }

    return ranges;
  }

  /*
   *   get profile and compartments charts data for export to file
   *
   */
  getCompartmentsChartsData(tissues, oc, diveId) {
    let chart = [["runTime", "depth", "profile", "fO2", "fHe", "pO2"]];
    for (let i = 1; i <= 16; i++) {
      chart[0].push("maxAmb_" + i);
      chart[0].push("maxAmbHe_" + i);
      chart[0].push("maxAmbN2_" + i);
      chart[0].push("MV_" + i);
      chart[0].push("MVHe_" + i);
      chart[0].push("MVN2_" + i);
      chart[0].push("mValue_" + i);
      chart[0].push("mValueHe_" + i);
      chart[0].push("mValueN2_" + i);
      chart[0].push("ppHeInspired_" + i);
      chart[0].push("ppN2Inspired_" + i);
      chart[0].push("ppHe_" + i);
      chart[0].push("ppN2_" + i);
      chart[0].push("ssHe_" + i);
      chart[0].push("ssN2_" + i);
    }
    tissues.forEach((compartment) => {
      let data = oc
        ? compartment.compartmentChart
        : compartment.compartmentChartCCR;
      data = filter(cloneDeep(data), {dive: diveId});
      for (let chartItemIndex in data) {
        let item = data[chartItemIndex];
        let index = parseInt(chartItemIndex);

        if (!chart[index + 1]) {
          //set first chart line
          chart[index + 1] = [];
          chart[index + 1].push(item.runTime);
          chart[index + 1].push(item.depth);
          chart[index + 1].push(item.type);
          chart[index + 1].push(item.fO2);
          chart[index + 1].push(item.fHe);
          chart[index + 1].push(item.pO2);
        }
        //insert comparment values
        chart[index + 1].push(item.maxAmb);
        chart[index + 1].push(item.maxAmbHe);
        chart[index + 1].push(item.maxAmbN2);
        chart[index + 1].push(item.MV);
        chart[index + 1].push(item.MVHe);
        chart[index + 1].push(item.MVN2);
        chart[index + 1].push(item.mValue);
        chart[index + 1].push(item.mValueHe);
        chart[index + 1].push(item.mValueN2);
        chart[index + 1].push(item.ppHeInspired);
        chart[index + 1].push(item.ppN2Inspired);
        chart[index + 1].push(item.ppHe);
        chart[index + 1].push(item.ppN2);
        chart[index + 1].push(item.ssHe);
        chart[index + 1].push(item.ssN2);
      }
    });
    return chart;
  }

  getDecoChart(diveId, line = false, zoom = false) {
    //order deco planner by depth reverse
    let dive = this.dives[diveId],
      decochart = [],
      maxRuntime = 0;
    function addChart(model, ccr) {
      let profiles,
        runtimeArray = [],
        lineChartRuntimeArray = [];
      if (ccr) {
        profiles = dive.CCR[model].profile;
      } else {
        profiles = dive[model].profile;
      }

      profiles.sort(function (a, b) {
        if (a.runtime) {
          if (a.runtime > b.runtime) return 1;
          if (a.runtime < b.runtime) return -1;
        }
        return 0;
      });
      //descent
      let runtime = 0,
        previousruntime = 0,
        stoptime = 0,
        depth = 0,
        previousdepth = 0,
        i = 0;
      //first point for deco planner
      runtimeArray.push({x: 0, y: -0});
      lineChartRuntimeArray.push(0);
      for (let k in profiles) {
        let profile = profiles[k];
        if (
          profile.stage != "offgassing" &&
          profile.stage != "descent" &&
          profile.rangeShape &&
          profile[profile.rangeShape].runtime
        ) {
          runtime = profile[profile.rangeShape].runtime;
          stoptime = Math.round(profile[profile.rangeShape].stoptime);
          depth = profile.depth;
          let descent_ascent_time = runtime - stoptime;
          runtimeArray.push({x: descent_ascent_time, y: -depth});
          //create line chart
          for (let i = 1; i <= descent_ascent_time - previousruntime; i++) {
            let descent_depth =
              previousdepth -
              (i * (previousdepth + depth)) /
                (descent_ascent_time - previousruntime);
            lineChartRuntimeArray.push(descent_depth);
          }
          if (stoptime > 0) {
            runtimeArray.push({x: runtime, y: -depth});
            if (maxRuntime < runtime) maxRuntime = runtime;
            i = i + 2;

            //create line chart
            for (let i = 1; i <= stoptime; i++) {
              lineChartRuntimeArray.push(-depth);
            }
          } else {
            i++;
          }

          previousruntime = runtime;
          previousdepth = -depth;
        }
      }
      //redraw deco chart following computer dive profile
      let title = model;
      if (dive.CCR) {
        title = (ccr ? "Reb " : "Bail ") + model;
      }
      if (line && zoom) {
        //return zoomline chart
        return {
          seriesname: title,
          data: lineChartRuntimeArray.join("|"),
        };
      } else if (line && !zoom) {
        //return zoomline chart
        let data = [];
        lineChartRuntimeArray.forEach((item) => {
          data.push({value: item});
        });
        return {
          seriesname: title,
          data: data,
        };
      } else {
        //return zoomscatter chart
        return {
          seriesname: title,
          drawline: 1,
          anchorRadius: 0,
          data: runtimeArray,
        };
      }
    }

    if (dive.VPM) decochart.push(addChart("VPM", false));
    if (dive.BUHL) decochart.push(addChart("BUHL", false));
    if (dive.CCR && dive.CCR.VPM) decochart.push(addChart("VPM", true));
    if (dive.CCR && dive.CCR.BUHL) decochart.push(addChart("BUHL", true));
    let categories = [];
    for (let i = 0; i <= maxRuntime; i++) {
      categories.push(i);
    }
    let response;
    if (line && zoom) {
      response = {
        dataset: decochart,
        categories: categories.join("|"),
        maxruntime: maxRuntime,
      };
    } else if (line && !zoom) {
      let data = [];
      categories.forEach((cat) => {
        data.push({label: cat});
      });
      response = {
        dataset: decochart,
        categories: [
          {
            category: data,
          },
        ],
        maxruntime: maxRuntime,
      };
    } else {
      response = decochart;
    }
    return response;
  }

  getDecoProfileData(diveId) {
    //order deco planner by depth reverse
    let dive = this.dives[diveId],
      chart = [[]],
      modelsToPrint = 0,
      modelToPrint = 0;
    function addData(model, ccr) {
      let profiles;
      if (ccr) {
        profiles = dive.CCR[model].profile;
      } else {
        profiles = dive[model].profile;
      }

      profiles.sort(function (a, b) {
        if (a.runtime) {
          if (a.runtime > b.runtime) return 1;
          if (a.runtime < b.runtime) return -1;
        }
        return 0;
      });
      //descent
      let runtime = 0,
        stoptime = 0,
        depth = 0,
        gas;

      for (let k = 0; k < profiles.length; k++) {
        let profile = profiles[k];
        if (profile.rangeShape && profile[profile.rangeShape].runtime) {
          runtime = profile[profile.rangeShape].runtime;
          stoptime = profile[profile.rangeShape].stoptime;
          depth = profile.depth;
          gas = this.gasBlender.getGasName(profile.gas);
          if (!chart[k + 1]) {
            chart.push([]);
            //create empty lines
            for (let i = 0; i < modelsToPrint * 5; i++) chart[k + 1].push("");
          }
          chart[k + 1][modelToPrint * 5] = "-->";
          chart[k + 1][modelToPrint * 5 + 1] = runtime;
          chart[k + 1][modelToPrint * 5 + 2] = stoptime;
          chart[k + 1][modelToPrint * 5 + 3] = depth;
          chart[k + 1][modelToPrint * 5 + 4] = gas;
        }
      }
    }
    if (dive.CCR && dive.CCR.BUHL) {
      chart[0].push("BUHL CCR");
      chart[0].push("RunTime");
      chart[0].push("Stop Time");
      chart[0].push("Depth");
      chart[0].push("Gas");
      modelsToPrint++;
    }
    if (dive.CCR && dive.CCR.VPM) {
      chart[0].push("VPM CCR");
      chart[0].push("RunTime");
      chart[0].push("Stop Time");
      chart[0].push("Depth");
      chart[0].push("Gas");
      modelsToPrint++;
    }

    if (dive.BUHL) {
      chart[0].push("BUHL");
      chart[0].push("RunTime");
      chart[0].push("Stop Time");
      chart[0].push("Depth");
      chart[0].push("Gas");
      modelsToPrint++;
    }
    if (dive.VPM) {
      chart[0].push("VPM");
      chart[0].push("RunTime");
      chart[0].push("Stop Time");
      chart[0].push("Depth");
      chart[0].push("Gas");
      modelsToPrint++;
    }
    if (dive.CCR && dive.CCR.BUHL) {
      addData("BUHL", true);
      modelToPrint++;
    }
    if (dive.CCR && dive.CCR.VPM) {
      addData("VPM", true);
      modelToPrint++;
    }
    if (dive.BUHL) {
      addData("BUHL", false);
      modelToPrint++;
    }
    if (dive.VPM) {
      addData("VPM", false);
      modelToPrint++;
    }
    return chart;
  }

  getCompartmentChart(
    tissues: any,
    type: string,
    diveId: number,
    resolution = 1,
    oc = true,
    compartments: Array<boolean> = [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ],
    showSeries: any = {
      ppN2: true,
      ppHe: true,
      maxAmb: true,
      mValue: true,
    }
  ) {
    if (!tissues) return null;
    resolution = toNumber(resolution);
    let chartRuntime = false;
    let chartDepth = false;
    let heatMap = false;
    let heatMapHe = false;
    //let heatMapN2 = false;
    if (type == "runtime") {
      chartRuntime = true;
    } else if (type == "depth") {
      chartDepth = true;
    } else if (type == "heatmapHe") {
      heatMap = true;
      heatMapHe = true;
    } else if (type == "heatmapN2") {
      heatMap = true;
      //heatMapN2 = true;
    }
    let series = [];
    let depthSeries = chartRuntime ? true : false;
    let ambientSeries = chartDepth ? true : false;
    for (let i = 0; i < tissues.length; i++) {
      let compartment = tissues[i];
      let serie_depth, serie_ambient;
      if (depthSeries) {
        serie_depth = {
          seriesname: "Dive Profile",
          drawline: 1,
          anchorRadius: 0,
          data: [],
        };
      }
      if (ambientSeries) {
        serie_ambient = {
          seriesname: "Ambient Pressure",
          showRegressionLine: 1,
          regressionLineThickness: 3,
          anchorRadius: 0,
          data: [],
        };
      }
      //add only selected compartments and selected values

      if (compartments[compartment.index]) {
        let serie_ppN2 = {
          seriesname: "Tissue #" + (compartment.index + 1) + " - ppN2",
          drawline: 1,
          anchorRadius: chartDepth ? 0 : 0,
          anchorBorderThickness: 0,
          data: [],
        };
        let serie_ppHe = {
          seriesname: "Tissue #" + (compartment.index + 1) + " - ppHe2",
          drawline: 1,
          anchorRadius: chartDepth ? 0 : 0,
          anchorBorderThickness: 0,
          data: [],
        };
        let serie_maxAmb = {
          seriesname: "Tissue #" + (compartment.index + 1) + " - maxAmb",
          drawline: 1,
          anchorRadius: chartDepth ? 0 : 0,
          anchorBorderThickness: 0,
          data: [],
        };
        let serie_mValue = {
          seriesname: "Tissue #" + (compartment.index + 1) + " - mValue",
          showRegressionLine: 1,
          anchorRadius: 0,
          data: [],
        };
        let serie_mValueHe = {
          seriesname: "Tissue #" + (compartment.index + 1) + " - mValue He",
          showRegressionLine: 1,
          anchorRadius: 0,
          data: [],
        };
        let serie_mValueN2 = {
          seriesname: "Tissue #" + (compartment.index + 1) + " - mValue N2",
          showRegressionLine: 1,
          anchorRadius: 0,
          data: [],
        };
        let serie_ss = [];
        let startAscent = !chartDepth;
        let data = oc
          ? compartment.compartmentChart
          : compartment.compartmentChartCCR;
        data = filter(cloneDeep(data), {dive: diveId});
        for (let index = 0; index < data.length; index += resolution) {
          let item = data[index];
          let x_axis =
            chartRuntime || heatMap ? round(item.runTime, 1) : item.depth;
          //depth series
          if (depthSeries) {
            serie_depth.data.push({
              y: item.depth,
              x: x_axis,
            });
          }
          if (ambientSeries) {
            //check duplicates
            let serie = serie_ambient;
            let lastSerie = last(serie.data) ? last(serie.data) : true;
            let x = x_axis;
            let y = x_axis;
            if (lastSerie && lastSerie["x"] != x && lastSerie["y"] != y) {
              serie.data.push({
                y: y,
                x: x,
              });
            }
          }
          if (
            startAscent ||
            (chartDepth &&
              data[index + resolution] &&
              data[index + resolution].type != "descent" &&
              data[index + resolution].type != "bottom")
          ) {
            startAscent = true;
          }
          if (startAscent) {
            //check duplicates
            let serie = serie_ppN2;
            let lastSerie = last(serie.data) ? last(serie.data) : true;
            let x = x_axis;
            let y = item.ppN2;
            if (lastSerie && lastSerie["x"] != x && lastSerie["y"] != y) {
              serie.data.push({
                y: y,
                x: x,
                index: index,
              });
            }
            serie = serie_ppHe;
            lastSerie = last(serie.data) ? last(serie.data) : true;
            y = item.ppHe;
            if (lastSerie && lastSerie["x"] != x && lastSerie["y"] != y) {
              serie.data.push({
                y: y,
                x: x,
                index: index,
              });
            }
            serie = serie_maxAmb;
            lastSerie = last(serie.data) ? last(serie.data) : true;
            y = item.maxAmb;
            if (lastSerie && lastSerie["x"] != x && lastSerie["y"] != y) {
              serie.data.push({
                y: y,
                x: x,
                index: index,
              });
            }
            let serie1 = serie_mValue;
            lastSerie = last(serie1.data) ? last(serie1.data) : true;
            y = item.mValue;
            if (lastSerie && lastSerie["x"] != x && lastSerie["y"] != y) {
              serie1.data.push({
                y: y,
                x: x,
                index: index,
              });
            }
            serie1 = serie_mValueHe;
            lastSerie = last(serie1.data) ? last(serie1.data) : true;
            y = item.mValueHe;
            if (lastSerie && lastSerie["x"] != x && lastSerie["y"] != y) {
              serie1.data.push({
                y: y,
                x: x,
                index: index,
              });
            }
            serie1 = serie_mValueN2;
            lastSerie = last(serie1.data) ? last(serie1.data) : true;
            y = item.mValueN2;
            if (lastSerie && lastSerie["x"] != x && lastSerie["y"] != y) {
              serie1.data.push({
                y: y,
                x: x,
                index: index,
              });
            }

            let heatMapValue = round(heatMapHe ? item.ssHe : item.ssN2, 1);
            let heatMapText =
              heatMapValue +
              "% (pp" +
              (heatMapHe ? "He" : "N2") +
              ": " +
              round(heatMapHe ? item.ppHe : item.ppN2, 1) +
              ")";
            serie_ss.push({
              rowid: compartment.index.toString(),
              columnid: index.toString(),
              value: heatMapValue,
              showValue: 0,
              time: x_axis,
              depth: item.depth,
              columns: round(data.length / resolution),
              toolText: heatMapText,
            });
          }
        }
        if (depthSeries && chartRuntime) {
          series.push(serie_depth);
        }
        depthSeries = false;
        if (ambientSeries) {
          series.push(serie_ambient);
        }
        ambientSeries = false;
        if (showSeries.ppN2 && !heatMap) {
          series.push(serie_ppN2);
        }
        if (showSeries.ppHe && !heatMap) {
          series.push(serie_ppHe);
        }
        if (showSeries.maxAmb && !heatMap) {
          series.push(serie_maxAmb);
        }
        if (showSeries.mValue && chartDepth) {
          series.push(serie_mValue);
          series.push(serie_mValueHe);
          series.push(serie_mValueN2);
        }
        if (heatMap) {
          series = series.concat(serie_ss);
        }
      }
    }
    return series;
  }

  /*
   * create tissue charts for VPM and computer profiles - BUHL has already internal tissues calculations
   */
  createVPMTissuesFromDives() {
    //init tissues
    let tissues = [];
    for (let c = 0; c < 16; c++) {
      // create and initialise compartments
      tissues[c] = new Compartment(this.BUHL.pref, this.BUHL.getAmbientPress());
    }
    tissues = this.BUHL.setTimeConstants(tissues);
    let func = this;
    //run dive profiles
    function runProfile(oc) {
      for (let i = 0; i < func.dives.length; i++) {
        let rate = func.parameters.descentRate;
        let dive, profile;
        let startDepth = 0;
        dive = oc ? func.dives[i] : func.dives[i].CCR;
        profile = dive.VPM.profile;
        //insert surface interval
        if (i > 0) {
          tissues = func.constDepth(
            tissues,
            0.0,
            func.dives[i].surfaceInterval * 60,
            0.0,
            0.79,
            0.21,
            "surface",
            oc,
            i - 1
          );
        } else {
          //setup tissues
          for (let c = 0; c < 16; c++) {
            tissues[c].setPpHe(0.0); // Set initial ppHe = 0.0
            tissues[c].setPpN2(
              0.79 * (func.BUHL.getAmbientPress() - func.BUHL.pref.getPH2O())
            ); // Set ppN2 = Ambient - ppH2O
          }
        }
        profile.forEach((item) => {
          let fN2 = 1 - item.gas.fO2 - item.gas.fHe;
          if (item.stage == "descent") {
            tissues = func.ascDec(
              tissues,
              startDepth,
              item.depth,
              rate,
              item.gas.fHe,
              fN2,
              item.ppO2,
              oc,
              i
            );
          } else {
            tissues = func.constDepth(
              tissues,
              item.depth,
              item[item.rangeShape].stoptime,
              item.gas.fHe,
              fN2,
              item.ppO2,
              item.stage,
              oc,
              i
            );
          }
          rate = func.parameters.ascentRate;
          startDepth = item.depth;
        });
      }
    }

    if (this.dives[0].CCR) {
      //CCR round
      runProfile(false);
    }
    //OC round
    runProfile(true);

    return tissues;
  }
  createTissuesFromProfile(profile, oc, diveIndex) {
    //init tissues
    let tissues = [];
    for (let c = 0; c < 16; c++) {
      // create and initialise compartments
      tissues[c] = new Compartment(this.BUHL.pref, this.BUHL.getAmbientPress());
      tissues[c].setPpHe(0.0); // Set initial ppHe = 0.0
      tissues[c].setPpN2(
        0.79 * (this.BUHL.getAmbientPress() - this.BUHL.pref.getPH2O())
      ); // Set ppN2 = Ambient - ppH2O
    }
    tissues = this.BUHL.setTimeConstants(tissues);
    let startDepth = 0;
    let rate = this.parameters.descentRate;
    profile.forEach((item) => {
      let fN2 = 1 - item.gas.fO2 - item.gas.fHe;
      if (item.stage == "descent") {
        tissues = this.ascDec(
          tissues,
          startDepth,
          item.depth,
          rate,
          item.gas.fHe,
          fN2,
          item.ppO2,
          oc,
          diveIndex
        );
      } else {
        tissues = this.constDepth(
          tissues,
          item.depth,
          item[item.rangeShape].stoptime,
          item.gas.fHe,
          fN2,
          item.ppO2,
          item.stage,
          oc,
          diveIndex
        );
      }
      rate = this.parameters.ascentRate;
      startDepth = item.depth;
    });
    return tissues;
  }

  /**
   * Constant depth profile. Calls Compartment.constDepth for each compartment to update the this.
   * copied from Buhlmann
   */
  private constDepth(
    tissues,
    depth,
    segTime,
    fHe,
    fN2,
    pO2,
    stage,
    oc,
    diveIndex
  ) {
    let ppHeInspired; // inspired gas pp
    let ppN2Inspired;
    let ppO2Inspired;
    let pInert; // Total inert gas pressure (msw)
    let pAmb =
      (this.BUHL.pref.units == 0
        ? depth
        : depth / this.BUHL.pref.METERS_TO_FEET) + this.BUHL.getAmbientPress(); // Total ambient pressure  (msw)
    let c;

    // Set inspired gas fractions.
    if (pO2 > 0.0) {
      // Rebreather mode
      // Determine pInert by subtracting absolute oxygen pressure (msw) and pH20 (msw)
      // Note that if fHe and fN2 == 0.0 then need to force pp's to zero
      if (fHe + fN2 > 0.0)
        pInert =
          pAmb -
          this.BUHL.pref.getPH2O() -
          pO2 * this.BUHL.pref.getPConversion();
      else pInert = 0.0;

      // Verify that pInert is positive. If the setpoint is close to or less than the depth
      // then there is no inert gas.
      if (pInert > 0.0) {
        ppHeInspired = (pInert * fHe) / (fHe + fN2);
        ppN2Inspired = (pInert * fN2) / (fHe + fN2);
      } else {
        ppHeInspired = 0.0;
        ppN2Inspired = 0.0;
      }
      // Update OxTox model - pO2 in atm NOT msw
      ppO2Inspired = pO2 * this.BUHL.pref.getPConversion(); // Determine ppO2Inspired in msw
    } else {
      //OC or pSCR modes
      ppHeInspired = (pAmb - this.BUHL.pref.getPH2O()) * fHe; //set in msw - to obtain ATA -> /this.pref.getPConversion()
      ppN2Inspired = (pAmb - this.BUHL.pref.getPH2O()) * fN2;
      ppO2Inspired = (pAmb - this.BUHL.pref.getPH2O()) * (1.0 - fHe - fN2);
    }
    // public void constDepth(double ppHeInspired, double ppN2Inspired, double segTime)
    if (segTime > 0) {
      for (c = 0; c < 16; c++) {
        tissues[c].constDepth(
          ppHeInspired,
          ppN2Inspired,
          segTime,
          depth,
          stage,
          1.0 - fHe - fN2,
          fHe,
          oc,
          ppO2Inspired / this.BUHL.pref.getPConversion(),
          diveIndex
        );
      }
    }
    return tissues;
    //console.log("-->CONST: press "+(pAmb-10)+"m, t:"+segTime+" fHe:"+fHe+" fN2:"+fN2+" ppO2:"+pO2+" ppHei:"+ppHeInspired+" ppN2i:"+ppN2Inspired);
  }

  /**
   * Ascend/Descend in profile. Calls this.ascDec to update compartment
   * copied from Buhlmann
   */
  private ascDec(tissues, start, finish, rate, fHe, fN2, pO2, oc, diveIndex) {
    let c;
    let ppHeInspired; // Initial inspired gas pp
    let ppN2Inspired;
    let ppO2Inspired;
    //let pO2InspiredAverage;                  // For oxtox calculations
    let segTime = Math.abs((finish - start) / rate); // derive segment time (mins)
    let rateHe; // Rate of change for each inert gas (msw/min)
    let rateN2;
    let pAmbStart =
      (this.BUHL.pref.units == 0
        ? start
        : start / this.BUHL.pref.METERS_TO_FEET) + this.BUHL.getAmbientPress(); // Starting ambient pressure (msw)
    let pAmbFinish =
      (this.BUHL.pref.units == 0
        ? finish
        : finish / this.BUHL.pref.METERS_TO_FEET) + this.BUHL.getAmbientPress();
    let pInertStart, pInertFinish; //
    if (segTime > 0) {
      // Set inspired gas fractions.
      if (pO2 > 0.0) {
        // Rebreather mode
        // Calculate inert gas partial pressure (msw) == pAmb - pO2 - pH2O
        pInertStart =
          pAmbStart -
          pO2 * this.BUHL.pref.getPConversion() -
          this.BUHL.pref.getPH2O();
        pInertFinish =
          pAmbFinish -
          pO2 * this.BUHL.pref.getPConversion() -
          this.BUHL.pref.getPH2O();
        // Check that it doesn't go less than zero. Could be due to shallow deco or starting on high setpoint
        if (pInertStart < 0.0) pInertStart = 0.0;
        if (pInertFinish < 0.0) pInertFinish = 0.0;
        // Separate into He and N2 components, checking that we are not on pure O2 (or we get an arithmetic error)
        if (fHe + fN2 > 0.0) {
          ppHeInspired = (pInertStart * fHe) / (fHe + fN2);
          ppN2Inspired = (pInertStart * fN2) / (fHe + fN2);
          // Calculate rate of change of each inert gas
          rateHe =
            ((pInertFinish * fHe) / (fHe + fN2) - ppHeInspired) / segTime;
          rateN2 =
            ((pInertFinish * fN2) / (fHe + fN2) - ppN2Inspired) / segTime;
        } else {
          ppHeInspired = 0.0;
          ppN2Inspired = 0.0;
          rateHe = 0.0;
          rateN2 = 0.0;
        }
      } else {
        // Open circuit mode or pSCR (no difference considered for ascent/descent)
        // Calculate He and N2 components
        ppHeInspired = (pAmbStart - this.BUHL.pref.getPH2O()) * fHe;
        ppN2Inspired = (pAmbStart - this.BUHL.pref.getPH2O()) * fN2;
        // Calculate rate of change of each inert gas
        rateHe = rate * fHe;
        rateN2 = rate * fN2;
        // Update OxTox model, use average ppO2
        //pO2InspiredAverage=( (pAmbStart-pAmbFinish)/2 + pAmbFinish -this.BUHL.pref.getPH2O())*(1.0-fHe-fN2)/this.BUHL.pref.getPConversion();
        pO2 = ppO2Inspired;
      }
      for (c = 0; c < 16; c++) {
        tissues[c].ascDec(
          ppHeInspired,
          ppN2Inspired,
          rateHe,
          rateN2,
          segTime,
          start,
          finish,
          oc,
          pO2,
          diveIndex
        );
      }
    }
    return tissues;
  }
}
