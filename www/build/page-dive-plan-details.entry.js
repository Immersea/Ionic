import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { aD as DivePlansService, a6 as DivePlan, U as UserService, R as RouterService, d as DiveSitesService } from './utils-5cd4c7bb.js';
import { E as Environment } from './env-0a7fccce.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { d as dateFns } from './index-9b61a50b.js';
import { l as lodash } from './lodash-68d560b6.js';
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

const pageDivePlanDetailsCss = "page-dive-plan-details ion-segment-button{--color-checked:var(--ion-color-planner-contrast)}";

const PageDivePlanDetails = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.titles = [
            { tag: "plan", text: "Plan", disabled: false },
            { tag: "profile", text: "Profile", disabled: false },
            { tag: "gas", text: "Gas", disabled: false },
            { tag: "charts", text: "Charts", disabled: false },
        ];
        this.planid = undefined;
        this.diveid = undefined;
        this.divePlan = undefined;
        this.segment = "plan";
        this.segmentNum = 0;
        this.slider = undefined;
    }
    async componentWillLoad() {
        let divePlanModel = await DivePlansService.getDivePlan(this.planid);
        if (divePlanModel) {
            this.divePlan = new DivePlan();
            this.divePlan.setConfiguration(divePlanModel.configuration);
            this.divePlan.setWithDivePlanModel(divePlanModel);
            this.diveid = lodash.exports.toNumber(this.diveid);
            this.dive = this.divePlan.dives[this.diveid];
            this.getDiveSitesDetails();
            this.userRoles = UserService.userRoles;
            //send updated params to other views
            this.diveDataToShare = {
                divePlan: this.divePlan,
                index: this.diveid,
                user: this.userRoles,
                editPlan: false,
                diveSite: this.diveSite,
            };
        }
        else {
            RouterService.goBack();
        }
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-dive-plan", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: true,
            autoHeight: true,
        });
    }
    getDiveSitesDetails() {
        if (this.dive.diveSiteId) {
            this.diveSite = DiveSitesService.getDiveSitesDetails(this.dive.diveSiteId);
        }
    }
    render() {
        return [
            h("ion-header", { key: 'd10e5b67f37299251f4247abccb567c35dd9b24a' }, h("ion-toolbar", { key: '5e8f35e82593f82eb807abe321b0dab2dddc152a', color: Environment.isDecoplanner() ? "gue-blue" : "planner" }, h("ion-buttons", { key: '1a53af151c21a990a74a7cbada4f401f95d8f4cf', slot: "start" }, h("ion-button", { key: '2eb0725cbe57b9ade17952322870790796ac3f9f', onClick: () => RouterService.goBack(), "icon-only": true }, h("ion-icon", { key: '172899b166caf68809930081eb38a4ec2c603d23', name: "arrow-back" }))), h("ion-title", { key: '51c4b488e4fb6bdc45d0fc2f8df2096f9ed58423' }, dateFns.format(this.dive.date, "PP"), this.diveSite ? " - " + this.diveSite.displayName : undefined, " - " + this.divePlan.configuration.stdName))),
            this.diveSite && (this.diveSite.coverURL || this.diveSite.photoURL) ? (h("ion-header", { style: { height: "var(--coverHeight)" } }, h("app-item-cover", { item: this.diveSite }))) : undefined,
            h("app-header-segment-toolbar", { key: 'c70ca2525222eb4edd607eea720b20e9ad1e6308', color: Environment.isDecoplanner() ? "gue-blue" : "planner", swiper: this.slider, titles: this.titles }),
            h("ion-content", { key: 'a904fe29adc49c310549432914b39e3c3811ea90', class: "slides" }, h("swiper-container", { key: '1f7bc875f63592ab091eb8fd38d9098a6a900c9d', class: "slider-dive-plan swiper" }, h("swiper-wrapper", { key: '07b60321ebba2a1ead6cb8af382bb82665085c0f', class: "swiper-wrapper" }, h("swiper-slide", { key: '58181899e6146f28816016779f30f986985aafb0', class: "swiper-slide" }, h("app-decoplanner-showplan", { key: '4c7cff1bf336b93d6f0f006e25cb6f824b640e64', diveDataToShare: this.diveDataToShare })), h("swiper-slide", { key: '9c598421172bbd14b5d56014594a694e1308de8b', class: "swiper-slide" }, h("app-decoplanner-profile", { key: '2fe1025b2fc5a20d67e451add315980683184ffe', diveDataToShare: this.diveDataToShare })), h("swiper-slide", { key: 'b121c797ee17fbd0d70e210a1fbff55ff7bfe51f', class: "swiper-slide" }, h("app-decoplanner-gas", { key: '377f10cc1408695f4cf7d39b99568e18e40bdb50', diveDataToShare: this.diveDataToShare, isShown: this.segment == "gas" })), h("swiper-slide", { key: 'a4294cc9b108467897544a9403a3428620798626', class: "swiper-slide" }, h("app-decoplanner-charts", { key: '739c07bcccf3018982ee79455ac351b4ce88ba97', diveDataToShare: this.diveDataToShare, isShown: this.segment == "charts" }))))),
        ];
    }
    get el() { return getElement(this); }
};
PageDivePlanDetails.style = pageDivePlanDetailsCss;

export { PageDivePlanDetails as page_dive_plan_details };

//# sourceMappingURL=page-dive-plan-details.entry.js.map