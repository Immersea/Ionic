import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { a6 as DivePlan, a3 as DiveStandardsService } from './utils-ced1e260.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-c3ad5e77.js';
import './map-fe092362.js';
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
import './customerLocation-d18240cd.js';

const modalDiveTemplateCss = "modal-dive-template{}";

const ModalDiveTemplate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.updateView = true;
        this.stdConfigurations = [];
        this.index = 0;
        this.userRoles = undefined;
        this.selectedConfiguration = undefined;
        this.showPositionTab = false;
        this.divePlanModel = undefined;
        this.addDive = false;
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
        }
        else {
            this.divePlan.setConfiguration(newPlanModel.configuration);
            this.divePlan.setWithDivePlanModel(newPlanModel);
            if (this.addDive) {
                //insert new dive plan
                let dive = this.divePlan.addDive();
                this.divePlan.resetDiveWithConfiguration(dive, newPlanModel.configuration);
                this.index = this.divePlan.dives.length - 1;
            }
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
        this.diveDataToShare = {
            divePlan: this.divePlan,
            dive_less_time: null,
            dive_more_time: null,
            dive_less_depth: null,
            dive_more_depth: null,
            index: this.index,
            stdGases: this.stdGases,
            stdDecoGases: this.stdDecoGases,
            stdConfigurations: this.stdConfigurations,
            user: this.userRoles,
            showDiveSite: this.showPositionTab,
            showPositionTab: this.showPositionTab,
        };
    }
    updateParams(params) {
        this.divePlan.configuration.parameters = params.detail;
        this.updateView = !this.updateView;
    }
    save() {
        this.el.closest("ion-modal").dismiss(this.divePlan.getDivePlanModel());
    }
    close() {
        this.el.closest("ion-modal").dismiss();
    }
    render() {
        return [
            h("app-navbar", { key: '1261f57110aa3360ba5c2c15c9df326e82588198', tag: "deco-planner", text: "Deco Planner", "extra-title": this.divePlan.configuration.stdName, color: Environment.isDecoplanner() ? "gue-blue" : "planner", modal: true }),
            h("ion-content", { key: '3fafe0070cf7215d3b42d662f634a0752bacae76' }, h("app-decoplanner-plan", { key: 'f1cba7483a8256fa9c4530539e59c0055e677431', diveDataToShare: this.diveDataToShare, onUpdateParamsEvent: (params) => this.updateParams(params) })),
            h("app-modal-footer", { key: '8b19f8b515f94cd6d0e6249667b53ee894068b57', onCancelEmit: () => this.close(), onSaveEmit: () => this.save() }),
        ];
    }
    get el() { return getElement(this); }
};
ModalDiveTemplate.style = modalDiveTemplateCss;

export { ModalDiveTemplate as modal_dive_template };

//# sourceMappingURL=modal-dive-template.entry.js.map