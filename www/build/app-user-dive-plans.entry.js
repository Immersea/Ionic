import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { U as UserService, aD as DivePlansService, d as DiveSitesService, a4 as DiveToolsService, aH as GasBlenderService, T as TranslationService } from './utils-5cd4c7bb.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-0a7fccce.js';
import { d as dateFns } from './index-9b61a50b.js';
import './map-e64442d7.js';
import './_commonjsHelpers-1a56c7bc.js';
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

const appUserDivePlansCss = "app-user-dive-plans{}";

const AppUserDivePlans = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.sitesCollection = [];
        this.userDivePlansArray = [];
        this.updateView = false;
        this.loadingDivePlans = true;
    }
    //@State() creatingNewDivePlan = false;
    //creatingNewDivePlan$: Subscription;
    //@State() editingDivePlan = "";
    //editingDivePlan$: Subscription;
    async componentWillLoad() {
        /*this.creatingNewDivePlan$ = DivePlansService.creatingNewDivePlan$.subscribe(
          (value) => {
            this.creatingNewDivePlan = value;
          }
        );
        this.editingDivePlan$ = DivePlansService.editingDivePlanId$.subscribe(
          (value) => {
            this.editingDivePlan = value;
          }
        );*/
        this.userDivePlans$ = UserService.userDivePlans$.subscribe(async (userDivePlans) => {
            this.loadingDivePlans = false;
            DivePlansService.resetSkeletons();
            if (userDivePlans) {
                this.userDivePlansArray = [];
                Object.keys(userDivePlans).forEach((key) => {
                    let plan = userDivePlans[key];
                    plan.id = key;
                    plan.date = plan.dives[0].date;
                    this.userDivePlansArray.push(plan);
                });
                this.userDivePlansArray = lodash.exports.orderBy(this.userDivePlansArray, "date", "desc");
                this.filterMySites();
            }
        });
        //load all dive sites
        this.diveSitesList$ = DiveSitesService.diveSitesList$.subscribe((collection) => {
            //update dive sites
            this.sitesCollection = collection;
            this.filterMySites();
        });
    }
    disconnectedCallback() {
        //this.creatingNewDivePlan$.unsubscribe();
        //this.editingDivePlan$.unsubscribe();
        this.userDivePlans$.unsubscribe();
        this.diveSitesList$.unsubscribe();
    }
    filterMySites() {
        if (this.sitesCollection.length > 0 && this.userDivePlansArray.length > 0) {
            this.userDivePlansArray.map((divePlan) => {
                divePlan.dives.map((dive) => {
                    dive.diveSite = this.sitesCollection.find((site) => site.id == dive.diveSiteId);
                    this.updateView = !this.updateView;
                });
            });
        }
    }
    update(event, divePlanId, diveId) {
        event.stopPropagation();
        DivePlansService.presentDivePlanUpdate(divePlanId, diveId);
    }
    delete(event, divePlanId, diveId) {
        event.stopPropagation();
        DivePlansService.deleteDiveFromPlan(divePlanId, diveId);
    }
    addDive(event, divePlanId, diveId) {
        event.stopPropagation();
        DivePlansService.addDiveToPlan(divePlanId, diveId);
    }
    deleteDivePlan(event, divePlanId) {
        event.stopPropagation();
        DivePlansService.deleteDivePlan(divePlanId);
    }
    render() {
        return (h(Host, { key: 'a7f706dfcbc983d76c1af504d3b4677b94f862f8' }, this.loadingDivePlans
            ? [
                h("app-skeletons", { skeleton: "userDivePlan" }),
                h("app-skeletons", { skeleton: "userDivePlan" }),
                h("app-skeletons", { skeleton: "userDivePlan" }),
                h("app-skeletons", { skeleton: "userDivePlan" }),
                h("app-skeletons", { skeleton: "userDivePlan" }),
            ]
            : undefined, this.userDivePlansArray.map((divePlan) => (h("ion-card", null, h("ion-item", null, h("ion-label", null, h("h2", null, dateFns.format(divePlan.date, "PP")), h("p", null, divePlan.configuration)), h("ion-button", { fill: "clear", "icon-only": true, slot: "end", color: "danger", onClick: (ev) => this.deleteDivePlan(ev, divePlan.id) }, h("ion-icon", { name: "trash-bin", slot: "end" })), h("ion-button", { fill: "clear", "icon-only": true, color: Environment.isDecoplanner() ? "gue-blue" : "planner", slot: "end", onClick: (ev) => this.addDive(ev, divePlan.id, divePlan.dives.length - 1) }, h("ion-icon", { name: "add-circle", slot: "end" }))), divePlan.dives.map((dive, key) => (h("ion-item", { detail: true, button: true, onClick: () => DivePlansService.presentDivePlanDetails(divePlan.id, key) }, dive.diveSite && dive.diveSite.coverURL ? (h("ion-thumbnail", { slot: "start" }, h("img", { src: dive.diveSite.coverURL }))) : undefined, h("ion-label", null, h("h3", null, dateFns.format(dive.date, "p")), dive.diveSite ? (h("h4", null, dive.diveSite.displayName)) : undefined, dive.profilePoints.map((point) => (h("p", null, point.time, "min @", point.depth, DiveToolsService.depthUnit, " (", GasBlenderService.getGasName(point.gas), ")")))), key > 0 ? (h("ion-button", { fill: "clear", "icon-only": true, slot: "end", color: "danger", onClick: (ev) => this.delete(ev, divePlan.id, key) }, h("ion-icon", { name: "trash", slot: "end" }))) : undefined, h("ion-button", { fill: "clear", "icon-only": true, slot: "end", color: Environment.isDecoplanner() ? "gue-blue" : "planner", onClick: (ev) => this.update(ev, divePlan.id, key) }, h("ion-icon", { name: "create", slot: "end" })))))))), this.userDivePlansArray.length == 0 ? (h("ion-item", null, h("ion-label", null, h("h2", null, TranslationService.getTransl("no-logbooks", "No dives yet. Click on the '+' button to create your first one."))))) : undefined));
    }
};
AppUserDivePlans.style = appUserDivePlansCss;

export { AppUserDivePlans as app_user_dive_plans };

//# sourceMappingURL=app-user-dive-plans.entry.js.map