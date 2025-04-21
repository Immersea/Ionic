import {
  Component,
  h,
  Prop,
  State,
  Event,
  EventEmitter,
  Watch,
} from "@stencil/core";
import { DecoplannerDive } from "../../../../../interfaces/udive/planner/decoplanner-dive";
import { DivePlan } from "../../../../../services/udive/planner/dive-plan";
//import { Config } from '../../../../providers/config';
//import { DataBase } from '../../../../providers/database';
import { DecoplannerParameters } from "../../../../../interfaces/udive/planner/decoplanner-parameters";
import { GasBlenderService } from "../../../../../services/udive/planner/gas-blender";
import { TranslationService } from "../../../../../services/common/translations";
import { UserService } from "../../../../../services/common/user";
import { SystemService } from "../../../../../services/common/system";
import { round, toNumber, toString } from "lodash";
import { Environment } from "../../../../../global/env";
//import { GoogleSheetProvider } from '../../../../providers/google-sheet';
//import { GoogleSheet } from '../../../../models/google/google-sheet'
//import { GoogleSpreadSheet } from '../../../../models/google/google-spreadsheet'
//import { LicenceCheckProvider } from '../../../../providers/licence-check';
//import { GasBlenderService } from "../../../../services/planner/gas-blender";

//const SHEETTITLE = "DecoPlanner";

@Component({
  tag: "app-decoplanner-profile",
  styleUrl: "app-decoplanner-profile.scss",
})
export class AppDecoplannerProfile {
  @Event() runTableCalculations: EventEmitter;

  @Prop() diveDataToShare: any;
  @State() selectedModelView: string = "BUHL";
  @State() selectedCCRSegmentView: string;
  @State() updateView = true;
  @State() showCCRRange: any;
  @State() selectedCCRView: any;

  @Watch("diveDataToShare")
  updateDiveDataToShare() {
    this.updateViewParams();
  }

  showRange = {
    VPM: {},
    BUHL: {},
    CCR: {
      BUHL: {},
      VPM: {},
    },
  };
  dives: Array<DecoplannerDive>;
  dive: DecoplannerDive = new DecoplannerDive();
  dive_less_time: DecoplannerDive = new DecoplannerDive();
  dive_more_time: DecoplannerDive = new DecoplannerDive();
  dive_less_depth: DecoplannerDive = new DecoplannerDive();
  dive_more_depth: DecoplannerDive = new DecoplannerDive();
  index: number;
  divePlan: DivePlan;

  parameters: DecoplannerParameters;
  //userSpreadSheet: GoogleSpreadSheet;
  //decoplannerSheet: GoogleSheet;
  selectedChartModel = "BUHL";
  selectedCCRChart = "CCR";
  tissueData: any;
  actualConfiguration: string;

  editPlan = true;

  componentWillLoad() {
    this.updateViewParams();
  }

  async runTablesCalc(selectedModelView) {
    if (selectedModelView == "tables" && this.editPlan) {
      //update table calculations
      await SystemService.presentLoading("calculating");
      this.divePlan.runCalculationsForTables();
      this.dive_less_time = this.divePlan.dives_less_time[this.index];
      this.dive_more_time = this.divePlan.dives_more_time[this.index];
      this.dive_less_depth = this.divePlan.dives_less_depth[this.index];
      this.dive_more_depth = this.divePlan.dives_more_depth[this.index];
      SystemService.dismissLoading();
      this.updateView = !this.updateView;
    }
  }

  updateViewParams() {
    const params = this.diveDataToShare;
    this.editPlan = params.editPlan == false ? false : true;
    this.divePlan = params.divePlan;
    this.index = params.index;
    this.dives = this.divePlan.dives;
    this.dive = this.divePlan.dives[this.index];
    this.parameters = this.divePlan.configuration.parameters;
    this.selectedCCRChart = this.parameters.configuration;
    this.selectedCCRSegmentView = this.parameters.configuration;
    this.setRanges();
    this.switchCCRView();
    this.selectedModelView = "BUHL";
  }

  updateTables() {
    this.runTablesCalc("tables");
  }

  async checkLicence() {
    if (
      this.selectedModelView == "tables" &&
      !(await UserService.checkLicence(this.selectedModelView))
    ) {
      setTimeout(() => {
        this.selectedModelView = "BUHL";
      }, 2000);
    }
  }

  /*
   * export to google sheets
   
  saveDecoPlannerSheet() {
    //trigger check licence in tabs
    if (this.licence.check("tables",true)) {
      let actionSheet = this.actionSheetCtrl.create({
        title: 'Export data',
        buttons: [
            {
                text: 'Dive Profile & Tables',
                handler: () => {
                    this.saveToGoogle(false);
                }
            },{
                text: 'Complete Model data ('+this.selectedModelView+'-'+this.selectedCCRSegmentView+')',
                handler: () => {
                    this.saveToGoogle(true);
                }
            },{
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                    
                }
            }
        ]
      });
      actionSheet.present();
    }
   
  }*/
  /*
  private saveToGoogle(model:boolean) {
    
    let loading = this.loadingCtrl.create({
        content: this.translate.instant("Uploading")+' '+this.selectedModelView+'-'+this.selectedCCRSegmentView+' '+this.translate.instant("data to Google Spreadsheets. Please wait")
    });
    loading.present();
    //create new sheet
    this.googleSheet.isAvailable.subscribe(()=>{
        this.googleSheet.getUserSheet().then((spreadsheet)=>{
                this.userSpreadSheet = spreadsheet;
                let title = this.translate.instant("Dive Profiles")
                if (model) {
                    title = this.selectedModelView +'-'+this.selectedCCRSegmentView
                }
                let sheetProperties = new GoogleSheet({properties:{
                    title:SHEETTITLE + "-" + title,
                    gridProperties: {
                        frozenRowCount: 1,
                        frozenColumnCount: model ? 5 : 0
                    }
                }})
                this.googleSheet.getSheet(spreadsheet,sheetProperties).then((sheet)=>{
                    //clean sheet values 
                    this.decoplannerSheet = sheet;
                    this.googleSheet.resetValues(this.userSpreadSheet,this.decoplannerSheet).then(res=>{
                        this.selectedChartModel = this.selectedModelView;
                        this.selectedCCRChart = this.selectedCCRSegmentView;
                        let oc = this.getTissueData();
                        let data
                        if (model) {
                            data = this.divePlan.getCompartmentsChartsData(this.tissueData,oc,this.index);
                        } else {
                            data = this.divePlan.getDecoProfileData(this.index)
                        }
                        this.googleSheet.updateValues(this.userSpreadSheet,this.decoplannerSheet,data).then(res=>{
                            loading.dismiss();
                            let link = this.userSpreadSheet.spreadsheetUrl;
                            let confirm = this.alertCtrl.create({
                                title: this.translate.instant('Google Spreadsheet created!'),
                                message: this.translate.instant("All data has been exported to your personal Google Spreadsheet at the following link")+' <br><a href="'+link+'" target="_blank">'+link+'</a>',
                                buttons: [
                                {
                                    text: this.translate.instant('OK'),
                                    handler: () => {
                                    }
                                }]
                            });
                            confirm.present();
                        }, err=>{loading.dismiss();console.log("Error",err)})
                    }, err=>{loading.dismiss();console.log("Error",err)})
                }, err=>{loading.dismiss();console.log("Error",err)})
            }, err=> {loading.dismiss();console.log("Error",err)})   
        }, err=>{
        //not available - request token
        this.googleSheet.getToken();
        loading.dismiss()
        let confirm = this.alertCtrl.create({
          title: this.translate.instant('Google Spreadsheet error!'),
          message: this.translate.instant("There was a problem in the uploading. Please try again later!"),
          buttons: [
          {
              text: this.translate.instant('OK'),
              handler: () => {
              }
          }]
        });
        confirm.present();

    })
  }*/

  /*
   * range setup for accordion lists
   */
  setRanges() {
    if (this.dive && this.dive.profilePoints.length > 0) {
      //update visualisation of charts
      if (
        !this.actualConfiguration ||
        this.actualConfiguration != this.parameters.configuration
      ) {
        //update configuration and chart views
        this.selectedCCRChart = this.parameters.configuration;
        this.selectedCCRSegmentView = this.parameters.configuration;
        this.actualConfiguration = this.parameters.configuration;
        this.switchCCRView();
      }
      //update ranges
      if (
        this.dive &&
        this.dive.VPM &&
        this.dive.VPM.rangeSums &&
        this.dive.BUHL.rangeSums
      ) {
        this.showRange = {
          VPM: {},
          BUHL: {},
          CCR: {
            BUHL: {},
            VPM: {},
          },
        };
        const show = true;
        for (var depth in this.dive.VPM.rangeSums) {
          this.showRange.VPM[depth] = show;
        }

        for (var depth in this.dive.BUHL.rangeSums) {
          this.showRange.BUHL[depth] = show;
        }
        if (this.dive.CCR) {
          for (var depth in this.dive.CCR.VPM.rangeSums) {
            this.showRange.CCR.VPM[depth] = show;
          }
          for (var depth in this.dive.CCR.BUHL.rangeSums) {
            this.showRange.CCR.BUHL[depth] = show;
          }
        }
      }
      this.switchCCRView();
    }
  }

  toggleRange(model, range, ccr) {
    if (ccr != "OC") {
      this.showRange.CCR[model][range] = !this.showRange.CCR[model][range];
    } else {
      this.showRange[model][range] = !this.showRange[model][range];
    }
    this.switchCCRView();
  }

  isRangeShown(model, depth, stage) {
    let show = true;
    if (stage == "ascent") {
      for (let rangeDepth in this.showCCRRange[model]) {
        if (depth <= parseInt(rangeDepth)) {
          show = this.showCCRRange[model][rangeDepth];
          break;
        }
      }
    }

    return show;
  }

  /*private getTissueData() {
    let tissuesBUHL, tissuesVPM, oc = true;
    if (this.selectedCCRChart == "CCR" || this.selectedCCRChart == "pSCR") {
        //create CCR model from tissues
        //tissuesVPM = this.divePlan.createTissuesFromProfile(this.dive.CCR.VPM.profile,false)
        oc = false;
    } else {
        //create CCR model from tissues 
        //tissuesVPM = this.divePlan.createTissuesFromProfile(this.dive.VPM.profile,true)
        oc = true;
    }
    tissuesVPM = this.divePlan.createVPMTissuesFromDives();
    tissuesBUHL = this.divePlan.BUHL.tissues
    this.tissueData = this.selectedChartModel == "BUHL" ? tissuesBUHL : tissuesVPM
    return oc
  }*/

  switchCCRView(ev?) {
    if (ev) this.selectedCCRSegmentView = ev.detail.value;
    if (this.selectedCCRSegmentView == "OC") {
      this.selectedCCRView = this.dive;
      this.showCCRRange = this.showRange;
    } else {
      this.selectedCCRView = this.dive.CCR;
      this.showCCRRange = this.showRange.CCR;
    }
    this.updateView = !this.updateView;
  }

  updateSelectedModel(ev) {
    this.dive.selectedModel = ev.detail.value;
    this.dive_less_time.selectedModel = this.dive.selectedModel;
    this.dive_more_time.selectedModel = this.dive.selectedModel;
    this.dive_less_depth.selectedModel = this.dive.selectedModel;
    this.dive_more_depth.selectedModel = this.dive.selectedModel;
    this.updateView = !this.updateView;
  }

  segmentChanged(ev) {
    if (ev.detail.value) {
      this.selectedModelView = ev.detail.value;
      //this.checkLicence(this.selectedModelView);
      this.runTablesCalc(this.selectedModelView);
    }
    this.updateView = !this.updateView;
  }

  rangeSegmentChanged(ev, depth) {
    if (ev.detail.value) {
      this.selectedCCRView[this.selectedModelView].rangeShape[depth] =
        ev.detail.value;
      this.divePlan.updateRangeShape(
        this.selectedModelView,
        depth,
        this.selectedCCRView[this.selectedModelView].rangeShape[depth],
        this.selectedCCRSegmentView != "OC"
      );
    }
    this.updateView = !this.updateView;
  }

  render() {
    return [
      <div class='slider-container'>
        <div class='slider-scrollable-header'>
          <ion-segment
            mode='ios'
            color={Environment.getAppColor()}
            onIonChange={(ev) => this.segmentChanged(ev)}
            value={this.selectedModelView}
          >
            <ion-segment-button value='BUHL'>
              <ion-label>BUHL</ion-label>
            </ion-segment-button>
            <ion-segment-button value='VPM'>
              <ion-label>VPM</ion-label>
            </ion-segment-button>
            {this.editPlan ? (
              <ion-segment-button value='tables'>
                <ion-label>
                  {TranslationService.getTransl("tables", "TABLES")}
                </ion-label>
              </ion-segment-button>
            ) : undefined}
          </ion-segment>
        </div>

        <div class='slider-scrollable-container'>
          {this.selectedModelView == "tables" ? (
            [
              <ion-row align-items-center>
                {/* MAIN */}
                <ion-col size='12' size-sm>
                  <ion-card>
                    <ion-card-header>
                      <ion-segment
                        onIonChange={(ev) => this.updateSelectedModel(ev)}
                        mode='ios'
                        color={Environment.getAppColor()}
                        value={this.dive.selectedModel}
                      >
                        <ion-segment-button value='BUHL'>
                          <ion-label>BUHL</ion-label>
                        </ion-segment-button>
                        <ion-segment-button value='VPM'>
                          <ion-label>VPM</ion-label>
                        </ion-segment-button>
                      </ion-segment>
                    </ion-card-header>
                    <ion-card-content>
                      <p class='ion-text-start ion-padding-start'>
                        <my-transl tag='runtime' text='Runtime' />:{" "}
                        {this.dive.getRunTime()}
                      </p>
                      <p class='ion-text-start ion-padding-start'>
                        <my-transl tag='deco-time' text='Deco time' />:{" "}
                        {this.dive.getDecoTime()}
                      </p>
                      {this.dive.getProfilePointsDetails().map((detail) => (
                        <p class='ion-text-start ion-padding-start'>{detail}</p>
                      ))}
                      {this.dive.getDecoProfileGroups().map((detail) => (
                        <p class='ion-text-start ion-padding-start'>{detail}</p>
                      ))}
                    </ion-card-content>
                  </ion-card>
                </ion-col>
                {/* setup depth */}
                <ion-col size='12' size-sm>
                  <ion-card>
                    <ion-card-content>
                      <app-form-item
                        label-tag='time-diff'
                        label-text='Time diff. (min)'
                        value={toString(this.divePlan.time_to_add)}
                        name='depth'
                        input-type='number'
                        onFormItemChanged={(ev) =>
                          (this.divePlan.time_to_add = toNumber(
                            ev.detail.value
                          ))
                        }
                        onFormItemBlur={() => this.updateTables()}
                      ></app-form-item>
                      <app-form-item
                        label-tag='depth-diff'
                        label-text={
                          "Depth diff. (" + this.parameters.depthUnit + ")"
                        }
                        value={toString(this.divePlan.depth_to_add)}
                        name='depth'
                        input-type='number'
                        onFormItemChanged={(ev) =>
                          (this.divePlan.depth_to_add = toNumber(
                            ev.detail.value
                          ))
                        }
                        onFormItemBlur={() => this.updateTables()}
                      ></app-form-item>
                    </ion-card-content>
                  </ion-card>
                </ion-col>
              </ion-row>,
              <ion-row align-items-center>
                {/* -5 min */}
                <ion-col size='12' size-sm>
                  <ion-card>
                    <ion-card-header>
                      -{this.divePlan.time_to_add}min
                    </ion-card-header>
                    <ion-card-content>
                      <ion-note>
                        -1 min <my-transl tag='bottom' text='bottom' /> ={" "}
                        {round(
                          (this.dive_less_time.getDecoTime() -
                            this.dive.getDecoTime()) /
                            this.divePlan.time_to_add,
                          1
                        )}{" "}
                        min deco
                      </ion-note>
                      <p class='ion-text-start ion-padding-start'>
                        <my-transl tag='runtime' text='Runtime' />:{" "}
                        {this.dive_less_time.getRunTime()}
                      </p>
                      <p class='ion-text-start ion-padding-start'>
                        <my-transl tag='decotime' text='Deco time' />:{" "}
                        {this.dive_less_time.getDecoTime()}
                      </p>
                      {this.dive_less_time
                        .getProfilePointsDetails()
                        .map((detail) => (
                          <p class='ion-text-start ion-padding-start'>
                            {detail}
                          </p>
                        ))}
                      {this.dive_less_time
                        .getDecoProfileGroups()
                        .map((detail) => (
                          <p class='ion-text-start ion-padding-start'>
                            {detail}
                          </p>
                        ))}
                    </ion-card-content>
                  </ion-card>
                </ion-col>
                {/* +5 min */}
                <ion-col size='12' size-sm>
                  <ion-card>
                    <ion-card-header>
                      +{this.divePlan.time_to_add}min
                    </ion-card-header>
                    <ion-card-content>
                      <ion-note>
                        +1 min <my-transl tag='bottom' text='bottom' /> ={" +"}
                        {round(
                          (this.dive_more_time.getDecoTime() -
                            this.dive.getDecoTime()) /
                            this.divePlan.time_to_add,
                          1
                        )}{" "}
                        min deco
                      </ion-note>
                      <p class='ion-text-start ion-padding-start'>
                        <my-transl tag='runtime' text='Runtime' />:{" "}
                        {this.dive_more_time.getRunTime()}
                      </p>
                      <p class='ion-text-start ion-padding-start'>
                        <my-transl tag='decotime' text='Deco time' />:{" "}
                        {this.dive_more_time.getDecoTime()}
                      </p>
                      {this.dive_more_time
                        .getProfilePointsDetails()
                        .map((detail) => (
                          <p class='ion-text-start ion-padding-start'>
                            {detail}
                          </p>
                        ))}
                      {this.dive_more_time
                        .getDecoProfileGroups()
                        .map((detail) => (
                          <p class='ion-text-start ion-padding-start'>
                            {detail}
                          </p>
                        ))}
                    </ion-card-content>
                  </ion-card>
                </ion-col>
              </ion-row>,

              <ion-row align-items-center>
                {/* -3 mt */}
                <ion-col size='12' size-sm>
                  <ion-card>
                    <ion-card-header>
                      -{this.divePlan.depth_to_add}
                      {this.parameters.depthUnit}
                    </ion-card-header>
                    <ion-card-content>
                      <ion-note>
                        -1 {this.parameters.depthUnit}{" "}
                        <my-transl tag='depth' text='depth' /> ={" "}
                        {round(
                          (this.dive_less_depth.getDecoTime() -
                            this.dive.getDecoTime()) /
                            this.divePlan.depth_to_add,
                          1
                        )}{" "}
                        min deco
                      </ion-note>
                      <p class='ion-text-start ion-padding-start'>
                        <my-transl tag='runtime' text='Runtime' />:{" "}
                        {this.dive_less_depth.getRunTime()}
                      </p>
                      <p class='ion-text-start ion-padding-start'>
                        <my-transl tag='decotime' text='Deco time' />:{" "}
                        {this.dive_less_depth.getDecoTime()}
                      </p>
                      {this.dive_less_depth
                        .getProfilePointsDetails()
                        .map((detail) => (
                          <p class='ion-text-start ion-padding-start'>
                            {detail}
                          </p>
                        ))}
                      {this.dive_less_depth
                        .getDecoProfileGroups()
                        .map((detail) => (
                          <p class='ion-text-start ion-padding-start'>
                            {detail}
                          </p>
                        ))}
                    </ion-card-content>
                  </ion-card>
                </ion-col>
                {/* +3 mt */}
                <ion-col size='12' size-sm>
                  <ion-card>
                    <ion-card-header>
                      +{this.divePlan.depth_to_add}
                      {this.parameters.depthUnit}
                    </ion-card-header>
                    <ion-card-content>
                      <ion-note>
                        +1 {this.parameters.depthUnit}{" "}
                        <my-transl tag='depth' text='depth' /> ={" +"}
                        {round(
                          (this.dive_more_depth.getDecoTime() -
                            this.dive.getDecoTime()) /
                            this.divePlan.depth_to_add,
                          1
                        )}{" "}
                        min deco
                      </ion-note>
                      <p class='ion-text-start ion-padding-start'>
                        <my-transl tag='runtime' text='Runtime' />:{" "}
                        {this.dive_more_depth.getRunTime()}
                      </p>
                      <p class='ion-text-start ion-padding-start'>
                        <my-transl tag='decotime' text='Deco time' />:{" "}
                        {this.dive_more_depth.getDecoTime()}
                      </p>
                      {this.dive_more_depth
                        .getProfilePointsDetails()
                        .map((detail) => (
                          <p class='ion-text-start ion-padding-start'>
                            {detail}
                          </p>
                        ))}
                      {this.dive_more_depth
                        .getDecoProfileGroups()
                        .map((detail) => (
                          <p class='ion-text-start ion-padding-start'>
                            {detail}
                          </p>
                        ))}
                    </ion-card-content>
                  </ion-card>
                </ion-col>
              </ion-row>,
              <ion-row>
                <ion-item>
                  {this.dive.introText.map((text) => (
                    <p style={{ fontSize: "smaller" }}>{text}</p>
                  ))}
                </ion-item>
              </ion-row>,
            ]
          ) : (
            <div>
              {this.parameters.configuration != "OC" ? (
                <ion-segment
                  onIonChange={(ev) => this.switchCCRView(ev)}
                  mode='ios'
                  color={Environment.getAppColor()}
                  value={this.selectedCCRSegmentView}
                >
                  <ion-segment-button value={this.parameters.configuration}>
                    {this.parameters.configuration}
                    {this.selectedModelView == "BUHL" ? (
                      <ion-label>
                        ({this.parameters.gfLow}/{this.parameters.gfHigh})
                      </ion-label>
                    ) : undefined}
                    {this.selectedModelView == "VPM" ? (
                      <ion-label>
                        (VPM {this.parameters.conservatism})
                      </ion-label>
                    ) : undefined}
                  </ion-segment-button>
                  <ion-segment-button value='OC'>
                    {TranslationService.getTransl(
                      "bailout-open-circuit",
                      "Bailout Open Circuit"
                    )}

                    {this.selectedModelView == "BUHL" ? (
                      <ion-label>
                        ({this.parameters.gfLow_bailout}/
                        {this.parameters.gfHigh_bailout})
                      </ion-label>
                    ) : undefined}
                    {this.selectedModelView == "VPM" ? (
                      <ion-label>
                        (VPM {this.parameters.conservatism_bailout})
                      </ion-label>
                    ) : undefined}
                  </ion-segment-button>
                </ion-segment>
              ) : undefined}

              <ion-grid class='ion-no-padding'>
                <ion-row>
                  <ion-col size='8' class='ion-text-start ion-padding-start'>
                    <h6 class='ion-no-margin'>
                      <my-transl
                        tag='runtime'
                        text='Runtime'
                        isLabel
                      ></my-transl>
                      :
                    </h6>
                  </ion-col>
                  <ion-col size='4' class='ion-text-end ion-padding-end'>
                    <h6 class='ion-no-margin'>
                      {round(
                        this.selectedCCRView[this.selectedModelView].runtime,
                        0
                      )}{" "}
                      min
                    </h6>
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col size='8' class='ion-text-start ion-padding-start'>
                    <h6 class='ion-no-margin'>
                      <my-transl
                        tag='deco-time'
                        text='Deco Time'
                        isLabel
                      ></my-transl>
                      :
                    </h6>
                  </ion-col>
                  <ion-col size='4' class='ion-text-end ion-padding-end'>
                    <h6 class='ion-no-margin'>
                      {round(
                        this.selectedCCRView[this.selectedModelView].decotime
                      )}{" "}
                      min
                    </h6>
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col size='8' class='ion-text-start ion-padding-start'>
                    <h6 class='ion-no-margin'>
                      <my-transl
                        tag='avg-bottom-depth'
                        text='Avg. bottom depth'
                        isLabel
                      ></my-transl>
                      :
                    </h6>
                  </ion-col>
                  <ion-col size='4' class='ion-text-end ion-padding-end'>
                    <h6 class='ion-no-margin'>
                      {round(
                        this.selectedCCRView[this.selectedModelView]
                          .average_bottom_depth,
                        1
                      )}{" "}
                      {this.parameters.depthUnit}
                    </h6>
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col size='8' class='ion-text-start ion-padding-start'>
                    <h6 class='ion-no-margin'>
                      <my-transl
                        tag='avg-dive-depth'
                        text='Avg. dive depth'
                        isLabel
                      ></my-transl>
                      :
                    </h6>
                  </ion-col>
                  <ion-col size='4' class='ion-text-end ion-padding-end'>
                    <h6 class='ion-no-margin'>
                      {round(
                        this.selectedCCRView[this.selectedModelView]
                          .average_dive_depth,
                        1
                      )}{" "}
                      {this.parameters.depthUnit}
                    </h6>
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col size='8' class='ion-text-start ion-padding-start'>
                    <h6 class='ion-no-margin'>
                      <my-transl
                        tag='start-offgassing'
                        text='Start of offgassing'
                        isLabel
                      ></my-transl>
                      :
                    </h6>
                  </ion-col>
                  <ion-col size='4' class='ion-text-end ion-padding-end'>
                    <h6 class='ion-no-margin'>
                      {round(this.dive.offGassingDepth, 0)}{" "}
                      {this.parameters.depthUnit}
                    </h6>
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col size='8' class='ion-text-start ion-padding-start'>
                    <h6 class='ion-no-margin'>
                      <my-transl tag='cns' text='CNS' isLabel></my-transl>:
                    </h6>
                  </ion-col>
                  <ion-col size='4' class='ion-text-end ion-padding-end'>
                    <h6 class='ion-no-margin'>
                      {round(
                        this.selectedCCRView[this.selectedModelView].cns,
                        0
                      )}
                      %
                    </h6>
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col size='8' class='ion-text-start ion-padding-start'>
                    <h6 class='ion-no-margin'>
                      <my-transl tag='otu' text='OTU' isLabel></my-transl>:
                    </h6>
                  </ion-col>
                  <ion-col size='4' class='ion-text-end ion-padding-end'>
                    <h6 class='ion-no-margin'>
                      {round(
                        this.selectedCCRView[this.selectedModelView].otu,
                        0
                      )}
                    </h6>
                  </ion-col>
                </ion-row>
                {this.parameters.configuration == "pSCR" ? (
                  <ion-row>
                    <ion-col size='8' class='ion-text-start ion-padding-start'>
                      <h6 class='ion-no-margin'>
                        <my-transl
                          tag='backgas-hypoxic-depth'
                          text='BackGas Hypoxic Depth'
                          isLabel
                        />
                        :
                      </h6>
                    </ion-col>
                    <ion-col size='4' class='ion-text-end ion-padding-end'>
                      <h6 class='ion-no-margin'>
                        &lt; {this.dive.backgasHypoxicDepth}{" "}
                        {this.parameters.depthUnit}
                      </h6>
                    </ion-col>
                  </ion-row>
                ) : undefined}
              </ion-grid>
              <ion-grid class='ion-no-padding'>
                <ion-row style={{ paddingRight: "16px" }}>
                  <ion-col size='1'></ion-col>
                  <ion-col class='ion-text-center'>
                    <ion-text color='dark'>
                      <h6>
                        <my-transl tag='depth' text='Depth' isLabel />
                      </h6>
                    </ion-text>
                  </ion-col>
                  <ion-col class='ion-text-center' size='1'></ion-col>
                  <ion-col class='ion-text-center'>
                    <ion-text color='dark'>
                      <h6>
                        <my-transl tag='time' text='Time' isLabel />
                      </h6>
                    </ion-text>
                  </ion-col>
                  <ion-col size='2'></ion-col>
                </ion-row>
              </ion-grid>
              {this.selectedCCRView[this.selectedModelView].profile.map(
                (profile) => (
                  <div class='accordion'>
                    {
                      /* RANGES line */
                      this.selectedCCRView[this.selectedModelView].rangeSums[
                        profile.depth
                      ] ? (
                        <ion-item
                          onClick={() =>
                            this.toggleRange(
                              this.selectedModelView,
                              profile.depth,
                              this.selectedCCRSegmentView
                            )
                          }
                          class={
                            this.showCCRRange[this.selectedModelView][
                              profile.depth
                            ]
                              ? "active"
                              : undefined
                          }
                        >
                          <ion-grid class='ion-no-padding'>
                            <ion-row
                              class={
                                this.showCCRRange[this.selectedModelView][
                                  profile.depth
                                ]
                                  ? "small bold"
                                  : undefined
                              }
                            >
                              <ion-col size='1'>
                                <ion-icon
                                  name={
                                    this.showCCRRange[this.selectedModelView][
                                      profile.depth
                                    ]
                                      ? "remove"
                                      : "add"
                                  }
                                  color='danger'
                                ></ion-icon>
                              </ion-col>
                              <ion-col size='3' class='ion-text-center'>
                                {
                                  this.selectedCCRView[this.selectedModelView]
                                    .rangeDescr[profile.depth]
                                }{" "}
                                {profile.depth}
                                {this.parameters.depthUnit}
                              </ion-col>
                              <ion-col
                                class='ion-text-center'
                                size='1'
                              ></ion-col>
                              <ion-col size='3' class='ion-text-center'>
                                <ion-icon name='time'></ion-icon>
                                <span>
                                  {round(
                                    this.selectedCCRView[this.selectedModelView]
                                      .rangeSums[profile.depth],
                                    0
                                  )}{" "}
                                  min
                                </span>
                              </ion-col>
                              <ion-col>
                                {GasBlenderService.getGasName(profile.gas)}
                              </ion-col>
                            </ion-row>
                          </ion-grid>
                        </ion-item>
                      ) : undefined
                    }

                    {
                      /* PROFILE button line */
                      this.editPlan &&
                      this.selectedCCRView[this.selectedModelView].rangeSums[
                        profile.depth
                      ] &&
                      this.selectedCCRView[this.selectedModelView].rangeCount[
                        profile.depth
                      ] > 2 &&
                      this.showCCRRange[this.selectedModelView][
                        profile.depth
                      ] ? (
                        <ion-list-header>
                          <ion-grid class='ion-no-padding'>
                            <ion-row>
                              <ion-segment
                                onIonChange={(ev) =>
                                  this.rangeSegmentChanged(ev, profile.depth)
                                }
                                mode='ios'
                                color={Environment.getAppColor()}
                                value={
                                  this.selectedCCRView[this.selectedModelView]
                                    .rangeShape[profile.depth]
                                }
                              >
                                <ion-segment-button value='model'>
                                  <ion-label>
                                    {this.selectedModelView}
                                  </ion-label>
                                </ion-segment-button>
                                <ion-segment-button value='equal'>
                                  <ion-label>
                                    {TranslationService.getTransl(
                                      "linear",
                                      "Linear"
                                    )}
                                  </ion-label>
                                </ion-segment-button>
                                <ion-segment-button value='s'>
                                  <ion-label>S</ion-label>
                                </ion-segment-button>
                                <ion-segment-button value='linear'>
                                  <ion-label>Exp</ion-label>
                                </ion-segment-button>
                              </ion-segment>
                            </ion-row>
                          </ion-grid>
                        </ion-list-header>
                      ) : undefined
                    }
                    {
                      /* PROFILE lines */
                      this.isRangeShown(
                        this.selectedModelView,
                        profile.depth,
                        profile.stage
                      ) ? (
                        <ion-item>
                          <ion-grid class='ion-no-padding'>
                            <ion-row align-items-center>
                              <ion-col size='1' class='ion-text-center'>
                                <ion-icon
                                  name={
                                    profile.stage == "descent"
                                      ? "arrow-down-outline"
                                      : profile.stage == "bottom"
                                        ? "arrow-forward-outline"
                                        : "arrow-up-outline"
                                  }
                                  color={
                                    profile.stage == "descent"
                                      ? "secondary"
                                      : profile.stage == "bottom"
                                        ? "primary"
                                        : profile.stage == "offgassing"
                                          ? "favorite"
                                          : "danger"
                                  }
                                ></ion-icon>
                              </ion-col>
                              <ion-col class='ion-text-center'>
                                {profile.depth} {this.parameters.depthUnit}
                              </ion-col>
                              <ion-col size='1' class='ion-text-center'>
                                {profile[profile.rangeShape].stoptime ? (
                                  <ion-icon
                                    name='pause-outline'
                                    color='gue-grey'
                                  ></ion-icon>
                                ) : undefined}
                              </ion-col>
                              <ion-col class='ion-text-center'>
                                {profile[profile.rangeShape].stoptime ? (
                                  <span>
                                    {round(
                                      profile[profile.rangeShape].stoptime,
                                      1
                                    )}{" "}
                                    min
                                  </span>
                                ) : undefined}
                              </ion-col>
                              <ion-col style={{ paddingTop: "0px" }} size='2'>
                                {profile[profile.rangeShape].runtime ? (
                                  <ion-row
                                    style={{
                                      padding: "0px",
                                      fontSize: "small",
                                    }}
                                  >
                                    <span>RT</span>:{" "}
                                    {round(
                                      profile[profile.rangeShape].runtime,
                                      1
                                    )}{" "}
                                    min
                                  </ion-row>
                                ) : undefined}
                                {profile.gas ? (
                                  <ion-row
                                    style={{
                                      padding: "0px",
                                      fontSize: "small",
                                    }}
                                  >
                                    {GasBlenderService.getGasName(profile.gas)}
                                  </ion-row>
                                ) : undefined}

                                {profile.ppO2 ? (
                                  <ion-row
                                    style={{
                                      padding: "0px",
                                      fontSize: "small",
                                    }}
                                  >
                                    ppO2: {profile.ppO2}
                                  </ion-row>
                                ) : undefined}

                                {profile.stage == "offgassing" ? (
                                  <ion-row
                                    style={{
                                      padding: "0px",
                                      fontSize: "small",
                                    }}
                                  >
                                    <my-transl
                                      tag='start-offgassing'
                                      text='Start of offgassing'
                                    />
                                  </ion-row>
                                ) : undefined}
                              </ion-col>
                            </ion-row>
                          </ion-grid>
                        </ion-item>
                      ) : undefined
                    }
                  </div>
                )
              )}
              <ion-item>
                {this.dive.introText.map((text) => (
                  <p style={{ fontSize: "smaller" }}>{text}</p>
                ))}
              </ion-item>
            </div>
          )}
        </div>
      </div>,
    ];
  }
}
