import { r as registerInstance, l as createEvent, h } from './index-d515af00.js';
import { a5 as DecoplannerDive, B as SystemService, U as UserService, T as TranslationService, aH as GasBlenderService } from './utils-5cd4c7bb.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-0a7fccce.js';
import './map-e64442d7.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './index-be90eba5.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
import './ionic-global-c07767bf.js';
import './index-93ceac82.js';
import './helpers-ff3eb5b3.js';
import './ios.transition-4bc5d5e6.js';
import './md.transition-b118d52a.js';
import './cubic-bezier-acda64df.js';
import './index-493838d0.js';
import './gesture-controller-a0857859.js';
import './config-45217ee2.js';
import './theme-6bada181.js';
import './index-f47409f3.js';
import './hardware-back-button-da755485.js';
import './overlays-b3ceb97d.js';
import './framework-delegate-779ab78c.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const appDecoplannerProfileCss = "app-decoplanner-profile{width:100%}app-decoplanner-profile .accordion{position:relative;height:auto;padding:0px}";

const AppDecoplannerProfile = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.runTableCalculations = createEvent(this, "runTableCalculations", 7);
        this.showRange = {
            VPM: {},
            BUHL: {},
            CCR: {
                BUHL: {},
                VPM: {},
            },
        };
        this.dive = new DecoplannerDive();
        this.dive_less_time = new DecoplannerDive();
        this.dive_more_time = new DecoplannerDive();
        this.dive_less_depth = new DecoplannerDive();
        this.dive_more_depth = new DecoplannerDive();
        //userSpreadSheet: GoogleSpreadSheet;
        //decoplannerSheet: GoogleSheet;
        this.selectedChartModel = "BUHL";
        this.selectedCCRChart = "CCR";
        this.editPlan = true;
        this.diveDataToShare = undefined;
        this.selectedModelView = "BUHL";
        this.selectedCCRSegmentView = undefined;
        this.updateView = true;
        this.showCCRRange = undefined;
        this.selectedCCRView = undefined;
    }
    updateDiveDataToShare() {
        this.updateViewParams();
    }
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
        if (this.selectedModelView == "tables" &&
            !(await UserService.checkLicence(this.selectedModelView))) {
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
            if (!this.actualConfiguration ||
                this.actualConfiguration != this.parameters.configuration) {
                //update configuration and chart views
                this.selectedCCRChart = this.parameters.configuration;
                this.selectedCCRSegmentView = this.parameters.configuration;
                this.actualConfiguration = this.parameters.configuration;
                this.switchCCRView();
            }
            //update ranges
            if (this.dive &&
                this.dive.VPM &&
                this.dive.VPM.rangeSums &&
                this.dive.BUHL.rangeSums) {
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
        }
        else {
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
    switchCCRView(ev) {
        if (ev)
            this.selectedCCRSegmentView = ev.detail.value;
        if (this.selectedCCRSegmentView == "OC") {
            this.selectedCCRView = this.dive;
            this.showCCRRange = this.showRange;
        }
        else {
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
            this.divePlan.updateRangeShape(this.selectedModelView, depth, this.selectedCCRView[this.selectedModelView].rangeShape[depth], this.selectedCCRSegmentView != "OC");
        }
        this.updateView = !this.updateView;
    }
    render() {
        return [
            h("div", { key: 'dd4b9c3b706625090e10eab49a8b9c4f43a4b255', class: "slider-container" }, h("div", { key: 'cf9a6d43e87ecf3e54bfefc6a0f1a6e61b8745f1', class: "slider-scrollable-header" }, h("ion-segment", { key: '207fc48bcea290077f90f0f304a555334ca7592d', mode: "ios", color: Environment.getAppColor(), onIonChange: (ev) => this.segmentChanged(ev), value: this.selectedModelView }, h("ion-segment-button", { key: '4cd7f5b42696e181dc53d76d36a3f63134ccd725', value: "BUHL" }, h("ion-label", { key: '40cb5c443179b3932b085efcca751a5b55d15f52' }, "BUHL")), h("ion-segment-button", { key: '094d8b16aa089469d6570e515a86c996e91228e1', value: "VPM" }, h("ion-label", { key: 'b65eca167d3793ae36c5f3cf8a7dea39d530d5e5' }, "VPM")), this.editPlan ? (h("ion-segment-button", { value: "tables" }, h("ion-label", null, TranslationService.getTransl("tables", "TABLES")))) : undefined)), h("div", { key: '5ebe37c303e86562e9260eb02a06afad33bf0cd5', class: "slider-scrollable-container" }, this.selectedModelView == "tables" ? ([
                h("ion-row", { "align-items-center": true }, h("ion-col", { size: "12", "size-sm": true }, h("ion-card", null, h("ion-card-header", null, h("ion-segment", { onIonChange: (ev) => this.updateSelectedModel(ev), mode: "ios", color: Environment.getAppColor(), value: this.dive.selectedModel }, h("ion-segment-button", { value: "BUHL" }, h("ion-label", null, "BUHL")), h("ion-segment-button", { value: "VPM" }, h("ion-label", null, "VPM")))), h("ion-card-content", null, h("p", { class: "ion-text-start ion-padding-start" }, h("my-transl", { tag: "runtime", text: "Runtime" }), ":", " ", this.dive.getRunTime()), h("p", { class: "ion-text-start ion-padding-start" }, h("my-transl", { tag: "deco-time", text: "Deco time" }), ":", " ", this.dive.getDecoTime()), this.dive.getProfilePointsDetails().map((detail) => (h("p", { class: "ion-text-start ion-padding-start" }, detail))), this.dive.getDecoProfileGroups().map((detail) => (h("p", { class: "ion-text-start ion-padding-start" }, detail)))))), h("ion-col", { size: "12", "size-sm": true }, h("ion-card", null, h("ion-card-content", null, h("app-form-item", { "label-tag": "time-diff", "label-text": "Time diff. (min)", value: lodash.exports.toString(this.divePlan.time_to_add), name: "depth", "input-type": "number", onFormItemChanged: (ev) => (this.divePlan.time_to_add = lodash.exports.toNumber(ev.detail.value)), onFormItemBlur: () => this.updateTables() }), h("app-form-item", { "label-tag": "depth-diff", "label-text": "Depth diff. (" + this.parameters.depthUnit + ")", value: lodash.exports.toString(this.divePlan.depth_to_add), name: "depth", "input-type": "number", onFormItemChanged: (ev) => (this.divePlan.depth_to_add = lodash.exports.toNumber(ev.detail.value)), onFormItemBlur: () => this.updateTables() }))))),
                h("ion-row", { "align-items-center": true }, h("ion-col", { size: "12", "size-sm": true }, h("ion-card", null, h("ion-card-header", null, "-", this.divePlan.time_to_add, "min"), h("ion-card-content", null, h("ion-note", null, "-1 min ", h("my-transl", { tag: "bottom", text: "bottom" }), " =", " ", lodash.exports.round((this.dive_less_time.getDecoTime() -
                    this.dive.getDecoTime()) /
                    this.divePlan.time_to_add, 1), " ", "min deco"), h("p", { class: "ion-text-start ion-padding-start" }, h("my-transl", { tag: "runtime", text: "Runtime" }), ":", " ", this.dive_less_time.getRunTime()), h("p", { class: "ion-text-start ion-padding-start" }, h("my-transl", { tag: "decotime", text: "Deco time" }), ":", " ", this.dive_less_time.getDecoTime()), this.dive_less_time
                    .getProfilePointsDetails()
                    .map((detail) => (h("p", { class: "ion-text-start ion-padding-start" }, detail))), this.dive_less_time
                    .getDecoProfileGroups()
                    .map((detail) => (h("p", { class: "ion-text-start ion-padding-start" }, detail)))))), h("ion-col", { size: "12", "size-sm": true }, h("ion-card", null, h("ion-card-header", null, "+", this.divePlan.time_to_add, "min"), h("ion-card-content", null, h("ion-note", null, "+1 min ", h("my-transl", { tag: "bottom", text: "bottom" }), " =", " +", lodash.exports.round((this.dive_more_time.getDecoTime() -
                    this.dive.getDecoTime()) /
                    this.divePlan.time_to_add, 1), " ", "min deco"), h("p", { class: "ion-text-start ion-padding-start" }, h("my-transl", { tag: "runtime", text: "Runtime" }), ":", " ", this.dive_more_time.getRunTime()), h("p", { class: "ion-text-start ion-padding-start" }, h("my-transl", { tag: "decotime", text: "Deco time" }), ":", " ", this.dive_more_time.getDecoTime()), this.dive_more_time
                    .getProfilePointsDetails()
                    .map((detail) => (h("p", { class: "ion-text-start ion-padding-start" }, detail))), this.dive_more_time
                    .getDecoProfileGroups()
                    .map((detail) => (h("p", { class: "ion-text-start ion-padding-start" }, detail))))))),
                h("ion-row", { "align-items-center": true }, h("ion-col", { size: "12", "size-sm": true }, h("ion-card", null, h("ion-card-header", null, "-", this.divePlan.depth_to_add, this.parameters.depthUnit), h("ion-card-content", null, h("ion-note", null, "-1 ", this.parameters.depthUnit, " ", h("my-transl", { tag: "depth", text: "depth" }), " =", " ", lodash.exports.round((this.dive_less_depth.getDecoTime() -
                    this.dive.getDecoTime()) /
                    this.divePlan.depth_to_add, 1), " ", "min deco"), h("p", { class: "ion-text-start ion-padding-start" }, h("my-transl", { tag: "runtime", text: "Runtime" }), ":", " ", this.dive_less_depth.getRunTime()), h("p", { class: "ion-text-start ion-padding-start" }, h("my-transl", { tag: "decotime", text: "Deco time" }), ":", " ", this.dive_less_depth.getDecoTime()), this.dive_less_depth
                    .getProfilePointsDetails()
                    .map((detail) => (h("p", { class: "ion-text-start ion-padding-start" }, detail))), this.dive_less_depth
                    .getDecoProfileGroups()
                    .map((detail) => (h("p", { class: "ion-text-start ion-padding-start" }, detail)))))), h("ion-col", { size: "12", "size-sm": true }, h("ion-card", null, h("ion-card-header", null, "+", this.divePlan.depth_to_add, this.parameters.depthUnit), h("ion-card-content", null, h("ion-note", null, "+1 ", this.parameters.depthUnit, " ", h("my-transl", { tag: "depth", text: "depth" }), " =", " +", lodash.exports.round((this.dive_more_depth.getDecoTime() -
                    this.dive.getDecoTime()) /
                    this.divePlan.depth_to_add, 1), " ", "min deco"), h("p", { class: "ion-text-start ion-padding-start" }, h("my-transl", { tag: "runtime", text: "Runtime" }), ":", " ", this.dive_more_depth.getRunTime()), h("p", { class: "ion-text-start ion-padding-start" }, h("my-transl", { tag: "decotime", text: "Deco time" }), ":", " ", this.dive_more_depth.getDecoTime()), this.dive_more_depth
                    .getProfilePointsDetails()
                    .map((detail) => (h("p", { class: "ion-text-start ion-padding-start" }, detail))), this.dive_more_depth
                    .getDecoProfileGroups()
                    .map((detail) => (h("p", { class: "ion-text-start ion-padding-start" }, detail))))))),
                h("ion-row", null, h("ion-item", null, this.dive.introText.map((text) => (h("p", { style: { fontSize: "smaller" } }, text))))),
            ]) : (h("div", null, this.parameters.configuration != "OC" ? (h("ion-segment", { onIonChange: (ev) => this.switchCCRView(ev), mode: "ios", color: Environment.getAppColor(), value: this.selectedCCRSegmentView }, h("ion-segment-button", { value: this.parameters.configuration }, this.parameters.configuration, this.selectedModelView == "BUHL" ? (h("ion-label", null, "(", this.parameters.gfLow, "/", this.parameters.gfHigh, ")")) : undefined, this.selectedModelView == "VPM" ? (h("ion-label", null, "(VPM ", this.parameters.conservatism, ")")) : undefined), h("ion-segment-button", { value: "OC" }, TranslationService.getTransl("bailout-open-circuit", "Bailout Open Circuit"), this.selectedModelView == "BUHL" ? (h("ion-label", null, "(", this.parameters.gfLow_bailout, "/", this.parameters.gfHigh_bailout, ")")) : undefined, this.selectedModelView == "VPM" ? (h("ion-label", null, "(VPM ", this.parameters.conservatism_bailout, ")")) : undefined))) : undefined, h("ion-grid", { class: "ion-no-padding" }, h("ion-row", null, h("ion-col", { size: "8", class: "ion-text-start ion-padding-start" }, h("h6", { class: "ion-no-margin" }, h("my-transl", { tag: "runtime", text: "Runtime", isLabel: true }), ":")), h("ion-col", { size: "4", class: "ion-text-end ion-padding-end" }, h("h6", { class: "ion-no-margin" }, lodash.exports.round(this.selectedCCRView[this.selectedModelView].runtime, 0), " ", "min"))), h("ion-row", null, h("ion-col", { size: "8", class: "ion-text-start ion-padding-start" }, h("h6", { class: "ion-no-margin" }, h("my-transl", { tag: "deco-time", text: "Deco Time", isLabel: true }), ":")), h("ion-col", { size: "4", class: "ion-text-end ion-padding-end" }, h("h6", { class: "ion-no-margin" }, lodash.exports.round(this.selectedCCRView[this.selectedModelView].decotime), " ", "min"))), h("ion-row", null, h("ion-col", { size: "8", class: "ion-text-start ion-padding-start" }, h("h6", { class: "ion-no-margin" }, h("my-transl", { tag: "avg-bottom-depth", text: "Avg. bottom depth", isLabel: true }), ":")), h("ion-col", { size: "4", class: "ion-text-end ion-padding-end" }, h("h6", { class: "ion-no-margin" }, lodash.exports.round(this.selectedCCRView[this.selectedModelView]
                .average_bottom_depth, 1), " ", this.parameters.depthUnit))), h("ion-row", null, h("ion-col", { size: "8", class: "ion-text-start ion-padding-start" }, h("h6", { class: "ion-no-margin" }, h("my-transl", { tag: "avg-dive-depth", text: "Avg. dive depth", isLabel: true }), ":")), h("ion-col", { size: "4", class: "ion-text-end ion-padding-end" }, h("h6", { class: "ion-no-margin" }, lodash.exports.round(this.selectedCCRView[this.selectedModelView]
                .average_dive_depth, 1), " ", this.parameters.depthUnit))), h("ion-row", null, h("ion-col", { size: "8", class: "ion-text-start ion-padding-start" }, h("h6", { class: "ion-no-margin" }, h("my-transl", { tag: "start-offgassing", text: "Start of offgassing", isLabel: true }), ":")), h("ion-col", { size: "4", class: "ion-text-end ion-padding-end" }, h("h6", { class: "ion-no-margin" }, lodash.exports.round(this.dive.offGassingDepth, 0), " ", this.parameters.depthUnit))), h("ion-row", null, h("ion-col", { size: "8", class: "ion-text-start ion-padding-start" }, h("h6", { class: "ion-no-margin" }, h("my-transl", { tag: "cns", text: "CNS", isLabel: true }), ":")), h("ion-col", { size: "4", class: "ion-text-end ion-padding-end" }, h("h6", { class: "ion-no-margin" }, lodash.exports.round(this.selectedCCRView[this.selectedModelView].cns, 0), "%"))), h("ion-row", null, h("ion-col", { size: "8", class: "ion-text-start ion-padding-start" }, h("h6", { class: "ion-no-margin" }, h("my-transl", { tag: "otu", text: "OTU", isLabel: true }), ":")), h("ion-col", { size: "4", class: "ion-text-end ion-padding-end" }, h("h6", { class: "ion-no-margin" }, lodash.exports.round(this.selectedCCRView[this.selectedModelView].otu, 0)))), this.parameters.configuration == "pSCR" ? (h("ion-row", null, h("ion-col", { size: "8", class: "ion-text-start ion-padding-start" }, h("h6", { class: "ion-no-margin" }, h("my-transl", { tag: "backgas-hypoxic-depth", text: "BackGas Hypoxic Depth", isLabel: true }), ":")), h("ion-col", { size: "4", class: "ion-text-end ion-padding-end" }, h("h6", { class: "ion-no-margin" }, "< ", this.dive.backgasHypoxicDepth, " ", this.parameters.depthUnit)))) : undefined), h("ion-grid", { class: "ion-no-padding" }, h("ion-row", { style: { paddingRight: "16px" } }, h("ion-col", { size: "1" }), h("ion-col", { class: "ion-text-center" }, h("ion-text", { color: "dark" }, h("h6", null, h("my-transl", { tag: "depth", text: "Depth", isLabel: true })))), h("ion-col", { class: "ion-text-center", size: "1" }), h("ion-col", { class: "ion-text-center" }, h("ion-text", { color: "dark" }, h("h6", null, h("my-transl", { tag: "time", text: "Time", isLabel: true })))), h("ion-col", { size: "2" }))), this.selectedCCRView[this.selectedModelView].profile.map((profile) => (h("div", { class: "accordion" }, 
            /* RANGES line */
            this.selectedCCRView[this.selectedModelView].rangeSums[profile.depth] ? (h("ion-item", { onClick: () => this.toggleRange(this.selectedModelView, profile.depth, this.selectedCCRSegmentView), class: this.showCCRRange[this.selectedModelView][profile.depth]
                    ? "active"
                    : undefined }, h("ion-grid", { class: "ion-no-padding" }, h("ion-row", { class: this.showCCRRange[this.selectedModelView][profile.depth]
                    ? "small bold"
                    : undefined }, h("ion-col", { size: "1" }, h("ion-icon", { name: this.showCCRRange[this.selectedModelView][profile.depth]
                    ? "remove"
                    : "add", color: "danger" })), h("ion-col", { size: "3", class: "ion-text-center" }, this.selectedCCRView[this.selectedModelView]
                .rangeDescr[profile.depth], " ", profile.depth, this.parameters.depthUnit), h("ion-col", { class: "ion-text-center", size: "1" }), h("ion-col", { size: "3", class: "ion-text-center" }, h("ion-icon", { name: "time" }), h("span", null, lodash.exports.round(this.selectedCCRView[this.selectedModelView]
                .rangeSums[profile.depth], 0), " ", "min")), h("ion-col", null, GasBlenderService.getGasName(profile.gas)))))) : undefined, 
            /* PROFILE button line */
            this.editPlan &&
                this.selectedCCRView[this.selectedModelView].rangeSums[profile.depth] &&
                this.selectedCCRView[this.selectedModelView].rangeCount[profile.depth] > 2 &&
                this.showCCRRange[this.selectedModelView][profile.depth] ? (h("ion-list-header", null, h("ion-grid", { class: "ion-no-padding" }, h("ion-row", null, h("ion-segment", { onIonChange: (ev) => this.rangeSegmentChanged(ev, profile.depth), mode: "ios", color: Environment.getAppColor(), value: this.selectedCCRView[this.selectedModelView]
                    .rangeShape[profile.depth] }, h("ion-segment-button", { value: "model" }, h("ion-label", null, this.selectedModelView)), h("ion-segment-button", { value: "equal" }, h("ion-label", null, TranslationService.getTransl("linear", "Linear"))), h("ion-segment-button", { value: "s" }, h("ion-label", null, "S")), h("ion-segment-button", { value: "linear" }, h("ion-label", null, "Exp"))))))) : undefined, 
            /* PROFILE lines */
            this.isRangeShown(this.selectedModelView, profile.depth, profile.stage) ? (h("ion-item", null, h("ion-grid", { class: "ion-no-padding" }, h("ion-row", { "align-items-center": true }, h("ion-col", { size: "1", class: "ion-text-center" }, h("ion-icon", { name: profile.stage == "descent"
                    ? "arrow-down-outline"
                    : profile.stage == "bottom"
                        ? "arrow-forward-outline"
                        : "arrow-up-outline", color: profile.stage == "descent"
                    ? "secondary"
                    : profile.stage == "bottom"
                        ? "primary"
                        : profile.stage == "offgassing"
                            ? "favorite"
                            : "danger" })), h("ion-col", { class: "ion-text-center" }, profile.depth, " ", this.parameters.depthUnit), h("ion-col", { size: "1", class: "ion-text-center" }, profile[profile.rangeShape].stoptime ? (h("ion-icon", { name: "pause-outline", color: "gue-grey" })) : undefined), h("ion-col", { class: "ion-text-center" }, profile[profile.rangeShape].stoptime ? (h("span", null, lodash.exports.round(profile[profile.rangeShape].stoptime, 1), " ", "min")) : undefined), h("ion-col", { style: { paddingTop: "0px" }, size: "2" }, profile[profile.rangeShape].runtime ? (h("ion-row", { style: {
                    padding: "0px",
                    fontSize: "small",
                } }, h("span", null, "RT"), ":", " ", lodash.exports.round(profile[profile.rangeShape].runtime, 1), " ", "min")) : undefined, profile.gas ? (h("ion-row", { style: {
                    padding: "0px",
                    fontSize: "small",
                } }, GasBlenderService.getGasName(profile.gas))) : undefined, profile.ppO2 ? (h("ion-row", { style: {
                    padding: "0px",
                    fontSize: "small",
                } }, "ppO2: ", profile.ppO2)) : undefined, profile.stage == "offgassing" ? (h("ion-row", { style: {
                    padding: "0px",
                    fontSize: "small",
                } }, h("my-transl", { tag: "start-offgassing", text: "Start of offgassing" }))) : undefined))))) : undefined))), h("ion-item", null, this.dive.introText.map((text) => (h("p", { style: { fontSize: "smaller" } }, text)))))))),
        ];
    }
    static get watchers() { return {
        "diveDataToShare": ["updateDiveDataToShare"]
    }; }
};
AppDecoplannerProfile.style = appDecoplannerProfileCss;

export { AppDecoplannerProfile as app_decoplanner_profile };

//# sourceMappingURL=app-decoplanner-profile.entry.js.map