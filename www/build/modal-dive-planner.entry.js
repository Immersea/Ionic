import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { a5 as DecoplannerDive, a6 as DivePlan, a3 as DiveStandardsService, a7 as slideHeight, U as UserService } from './utils-cbf49763.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-9be68260.js';
import { S as Swiper } from './swiper-a30cd476.js';
import './map-dae4acde.js';
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
import './customerLocation-71248eea.js';

const modalDivePlannerCss = "modal-dive-planner ion-segment-button{--color-checked:var(--ion-color-planner-contrast)}modal-dive-planner .nopaddingtop{padding-top:0px !important}";

const ModalDivePlanner = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.dive = new DecoplannerDive();
        this.dive_less_time = new DecoplannerDive();
        this.dive_more_time = new DecoplannerDive();
        this.dive_less_depth = new DecoplannerDive();
        this.dive_more_depth = new DecoplannerDive();
        this.selectedChartModel = "BUHL";
        this.selectedModelGasView = "BUHL";
        this.isSaving = false;
        this.showLoadingTab = true;
        this.slider = undefined;
        this.stdConfigurations = [];
        this.index = 0;
        this.userRoles = undefined;
        this.selectedConfiguration = undefined;
        this.diveTripData = undefined;
        this.divePlanModel = undefined;
        this.addDive = false;
        this.showDiveSite = false;
        this.showPositionTab = false;
        this.setDate = false;
        this.updateView = true;
        this.segment = "plan";
        this.showProfiles = false;
        this.titles = [
            { tag: "plan", icon: "chevron-forward", slotIcon: "end" },
            { tag: "profile", disabled: true, icon: "chevron-forward", slotIcon: "end" },
            { tag: "gas", disabled: true, icon: "chevron-forward", slotIcon: "end" },
            { tag: "charts", disabled: true, icon: "chevron-forward", slotIcon: "end" },
            { tag: "settings", disabled: true },
        ];
    }
    componentWillLoad() {
        //convert into DivePlan provider and start calculations for the dive
        this.divePlan = new DivePlan();
        //this.divePlan.setProviders(this.translate)
        let newPlanModel = this.divePlanModel;
        if (!newPlanModel) {
            //insert new dive plan
            let selectedConfiguration = this.selectedConfiguration;
            //add new dive with selected config
            this.divePlan.setConfiguration(selectedConfiguration);
            let dive = this.divePlan.addDive();
            this.divePlan.resetDiveWithConfiguration(dive, selectedConfiguration);
            if (this.diveTripData) {
                this.divePlan.dives[0].diveSiteId = this.diveTripData.diveSiteId
                    ? this.diveTripData.diveSiteId
                    : null;
                this.divePlan.dives[0].divingCenterId = this.diveTripData.divingCenterId
                    ? this.diveTripData.divingCenterId
                    : null;
                this.divePlan.dives[0].date = this.diveTripData.date
                    ? new Date(this.diveTripData.date)
                    : new Date();
            }
        }
        else {
            this.divePlan.setConfiguration(newPlanModel.configuration);
            this.divePlan.setWithDivePlanModel(newPlanModel);
            if (this.addDive) {
                //insert new dive plan
                let dive = this.divePlan.addDive();
                this.divePlan.resetDiveWithConfiguration(dive, newPlanModel.configuration);
                this.index = this.divePlan.dives.length - 1;
                //set dive siteid to previous site
                if (this.index > 0) {
                    this.divePlan.dives[this.index].diveSiteId =
                        this.divePlan.dives[this.index - 1].diveSiteId;
                }
            }
        }
        //set updated date
        if (this.setDate) {
            this.divePlan.dives[this.index].date = new Date();
        }
        this.stdGases = [];
        this.stdDecoGases = [];
        let gases = [];
        DiveStandardsService.getStdGases().forEach((list) => {
            gases.push(list);
        });
        this.stdGases = lodash.exports.filter(gases, { deco: false });
        this.stdGases = lodash.exports.orderBy(this.stdGases, "fromDepth", "asc");
        this.stdDecoGases = lodash.exports.filter(gases, { deco: true });
        this.stdDecoGases = lodash.exports.orderBy(this.stdDecoGases, "fromDepth", "desc");
        this.update();
        this.showLoadingTab = false;
        //this.segment = 1;
        /*setTimeout(() => {
          this.tabsItem.select(this.currentTab);
        });*/
    }
    componentDidLoad() {
        this.slider = new Swiper(".slider-dive-planner", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
        });
        this.update();
    }
    setSliderHeight() {
        //reset sliders height inside slider
        const slideContainers = Array.from(this.el.getElementsByClassName("slide-container"));
        slideContainers.map((container) => {
            container.setAttribute("style", "height: " + slideHeight(null, 3, true) + "px");
        });
        this.slider ? this.slider.updateAutoHeight() : null;
        this.slider ? this.slider.update() : undefined;
    }
    saveDoc(updateView = true) {
        if (updateView)
            this.update();
        //document is saved on modal dismiss
    }
    updateParams(params) {
        //this.divePlan.configuration.parameters = params.detail;
        this.divePlan.setParams(params.detail, false);
        this.update();
    }
    async update() {
        this.divePlan.updateCalculations();
        this.dives = this.divePlan.dives;
        this.dive = this.divePlan.dives[this.index];
        this.selectedChartModel = this.dive.selectedModel;
        this.selectedModelGasView = this.dive.selectedModel;
        //send updated params to other views
        this.diveDataToShare = {
            divePlan: this.divePlan,
            dive_less_time: this.dive_less_time,
            dive_more_time: this.dive_more_time,
            dive_less_depth: this.dive_less_depth,
            dive_more_depth: this.dive_more_depth,
            index: this.index,
            stdGases: this.stdGases,
            stdDecoGases: this.stdDecoGases,
            stdConfigurations: this.stdConfigurations,
            user: this.userRoles,
            showDiveSite: this.showDiveSite,
            showPositionTab: this.showPositionTab,
        };
        //check user licence limitations
        if (this.dive.getDecoTime() >
            UserService.userRoles.licences.getUserLimitations().maxDecoTime) {
            this.showProfiles = false;
            UserService.userRoles.licences.presentLicenceLimitation("decotime");
        }
        else {
            this.showProfiles = true;
        }
        this.titles[1].disabled = !this.showProfiles;
        this.titles[2].disabled = !this.showProfiles;
        this.titles[3].disabled = !this.showProfiles;
        this.titles[4].disabled = !this.showProfiles;
        this.updateView = !this.updateView;
        this.setSliderHeight();
    }
    save() {
        this.el.closest("ion-modal").dismiss(this.divePlan.getDivePlanModel());
    }
    close() {
        this.el.closest("ion-modal").dismiss();
    }
    scrollToTop() {
        this.content ? this.content.scrollToTop() : undefined;
    }
    logScrollStart(ev) {
        this.content = ev.srcElement;
    }
    render() {
        return [
            h("ion-header", { key: 'beea4b5bdafd9ec2f2b6b6cb4dbc3266e1e7ac4b' }, h("app-navbar", { key: 'a5273f83423958339664ae92ec81381135a7004a', tag: "deco-planner", text: "Deco Planner", "extra-title": this.divePlan.configuration.stdName, color: Environment.isDecoplanner() ? "gue-blue" : "planner", modal: true }), h("app-header-segment-toolbar", { key: '74522ae2c20d6c7429e0c3c5712837dabf904722', color: Environment.isDecoplanner() ? "gue-blue" : "planner", swiper: this.slider, titles: this.titles, noHeader: true, class: "nopaddingtop" })),
            h("ion-content", { key: '689d5799b6f8573cdb722eb5791a9b1df6cae319', class: "slides", scrollEvents: true, onIonScrollStart: (ev) => this.logScrollStart(ev) }, h("swiper-container", { key: 'b46775216b3a46fcc581231d3ed17eab6c4d7488', class: "slider-dive-planner swiper" }, h("swiper-wrapper", { key: '7d6bb6d607c7ae7d713e7e62d363c0995bb5fcf7', class: "swiper-wrapper" }, h("swiper-slide", { key: 'd24b14326775a7e2640fde78681e2fbea288909a', class: "swiper-slide" }, h("app-decoplanner-plan", { key: '19f9bb32748c717ed07ec7fe1d14cc0e1dc5aef9', diveDataToShare: this.diveDataToShare, onUpdateParamsEvent: (params) => this.updateParams(params) })), h("swiper-slide", { key: '519d3e4d151d35eb41cf28404771f126b11398e8', class: "swiper-slide" }, h("app-decoplanner-profile", { key: '0917fcd468b4c386aae49e83466c727b27ed74d5', diveDataToShare: this.diveDataToShare })), h("swiper-slide", { key: '467d5f989af983d7cffd407dca98e6d241b30f49', class: "swiper-slide" }, h("app-decoplanner-gas", { key: 'abceaea4e4a163f5e99b1c2493a78dd5573c4bd0', diveDataToShare: this.diveDataToShare, isShown: this.segment == "gas" })), h("swiper-slide", { key: 'a3771ff97aa43ab4a03473effed61d70494a22aa', class: "swiper-slide" }, h("ion-content", { key: '6f7b686fb78fa9437dfba4f48a68ff1cd56c6436', class: "slide-container" }, h("app-decoplanner-charts", { key: 'af7f8897aa3dfca4f5d8b8ed3f52279ca2331212', diveDataToShare: this.diveDataToShare, isShown: this.segment == "charts" }))), h("swiper-slide", { key: '59d7d6e2efed60f287a5de35c97af9405abb7536', class: "swiper-slide" }, h("app-decoplanner-settings", { key: '4ad13415f3225ea6ce9b4d28261474e211ec0434', diveDataToShare: this.diveDataToShare, onUpdateParamsEvent: (params) => this.updateParams(params) }))))),
            h("app-modal-footer", { key: '4d0b2db5286dfe0422a04ccdc0173874dd0d4e70', onCancelEmit: () => this.close(), onSaveEmit: () => this.save() }),
        ];
    }
    get el() { return getElement(this); }
};
ModalDivePlanner.style = modalDivePlannerCss;

export { ModalDivePlanner as modal_dive_planner };

//# sourceMappingURL=modal-dive-planner.entry.js.map