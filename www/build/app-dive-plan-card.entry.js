import { r as registerInstance, l as createEvent, h } from './index-d515af00.js';
import { d as DiveSitesService, aD as DivePlansService, T as TranslationService } from './utils-cbf49763.js';
import './index-be90eba5.js';
import { E as Environment } from './env-9be68260.js';
import { a as alertController } from './overlays-b3ceb97d.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-dae4acde.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';
import './ionic-global-c07767bf.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
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
import './framework-delegate-779ab78c.js';

const appDivePlanCardCss = "app-dive-plan-card{width:100%;height:100%}";

const AppDiveSiteCard = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.viewEmit = createEvent(this, "viewEmit", 7);
        this.removeEmit = createEvent(this, "removeEmit", 7);
        this.divePlan = undefined;
        this.edit = false;
    }
    componentWillLoad() {
        this.diveSite = DiveSitesService.diveSitesList.find((site) => site.id === this.divePlan.dives[0].diveSiteId);
    }
    async viewDivePlan(ev) {
        ev.stopPropagation();
        const modal = await DivePlansService.presentDiveTemplateUpdate(this.divePlan);
        if (modal) {
            this.viewEmit.emit(modal);
        }
    }
    async removeDivePlan(ev) {
        ev.stopPropagation();
        const confirm = await alertController.create({
            header: TranslationService.getTransl("delete-dive-header", "Delete dive?"),
            message: TranslationService.getTransl("delete-dive-message", "This dive plan will be deleted! Are you sure?"),
            buttons: [
                {
                    text: TranslationService.getTransl("cancel", "Cancel"),
                    role: "cancel",
                    handler: () => { },
                },
                {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: () => {
                        this.removeEmit.emit();
                    },
                },
            ],
        });
        confirm.present();
    }
    render() {
        return (h("ion-card", { key: 'fc169f0f61835228274298a59985872e92175209', onClick: (ev) => (this.edit ? this.viewDivePlan(ev) : undefined) }, this.diveSite ? h("app-item-cover", { item: this.diveSite }) : undefined, h("ion-card-header", { key: 'ba83d850cd15b69c1f83fe209d2fe51a12f7d726' }, h("ion-item", { key: '99e5b6fecd8b021062c90aafc251b0ebcf7d0249', class: 'ion-no-padding', lines: 'none' }, this.edit ? (h("ion-button", { "icon-only": true, slot: 'end', color: 'danger', fill: 'clear', onClick: (ev) => this.removeDivePlan(ev) }, h("ion-icon", { name: 'trash-bin-outline' }))) : undefined, h("ion-card-title", { key: '8f61f1dd49f8f816ee18d904656eee1e805a006c' }, this.divePlan.configuration.stdName)), h("ion-card-subtitle", { key: 'b54de254c9ed3387d6c2b5278c8b65f378b4bd1a' }, this.divePlan.dives[0].getProfilePointsDetails().map((detail) => (h("p", { class: 'ion-text-start' }, detail))))), h("ion-card-content", { key: 'f380d1c7dfa15106c471171111f8090e1a36c060' }, this.divePlan.configuration.configuration.bottom.length > 0 ? (h("p", null, h("my-transl", { tag: 'bottom-tanks', text: 'Bottom Tanks' }), ":")) : undefined, this.divePlan.configuration.configuration.bottom.map((tank) => (h("p", null, tank.name + "->" + tank.gas.toString()))), this.divePlan.configuration.configuration.deco.length > 0 ? (h("p", null, h("my-transl", { tag: 'deco-tanks', text: 'Deco Tanks' }), ":")) : undefined, this.divePlan.configuration.configuration.deco.map((tank) => (h("p", null, tank.name + "->" + tank.gas.toString())))), !this.edit ? (h("ion-button", { expand: 'full', color: Environment.isDecoplanner() ? "gue-blue" : "planner", onClick: () => DivePlansService.createNewDivePlan(this.divePlan) }, h("my-transl", { tag: 'plan-dive', text: 'Plan a Dive' }))) : undefined));
    }
};
AppDiveSiteCard.style = appDivePlanCardCss;

export { AppDiveSiteCard as app_dive_plan_card };

//# sourceMappingURL=app-dive-plan-card.entry.js.map