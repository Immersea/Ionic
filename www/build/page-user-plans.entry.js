import { r as registerInstance, h } from './index-d515af00.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { U as UserPlansService } from './user-plans-05ccb84f.js';
import { U as UserPlans, a as UserPlan, b as ProductLines } from './user-plans-3e6cb6aa.js';
import { U as UserService, j as CustomersService } from './utils-cbf49763.js';
import { T as TrasteelService } from './services-2650b7f8.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-9be68260.js';
import './map-dae4acde.js';
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
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';

const pageUserPlansCss = "page-user-plans{}";

const PageUserPlans = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.titles = [
            { tag: "personal", text: "Personal", disabled: false },
            { tag: "team", text: "Team", disabled: false },
        ];
        this.usersList = [];
        this.uid = undefined;
        this.userPlans = undefined;
        this.slider = undefined;
        this.usersTeams = undefined;
        this.selectedUser = undefined;
        this.updateView = false;
    }
    async componentWillLoad() {
        await this.loadUserPlans();
    }
    async loadUserPlans() {
        if (this.uid) {
            //open other user plan
            let userPlans = new UserPlans(await UserPlansService.getPlansOfUser(this.uid));
            this.userPlans = new UserPlans();
            this.userPlans.users = userPlans.users;
            //filter user plans by team manager
            userPlans.userPlans.map((userPlan) => {
                const plan = new UserPlan();
                plan.customerId = userPlan.customerId;
                plan.otherName = userPlan.otherName;
                plan.planOfActions = [];
                userPlan.planOfActions.map((planofaction) => {
                    if (planofaction.product == "refractories" &&
                        TrasteelService.isRefraTeamAdmin()) {
                        plan.planOfActions.push(planofaction);
                    }
                    else if (planofaction.product == "electrodes" &&
                        TrasteelService.isElecTeamAdmin()) {
                        plan.planOfActions.push(planofaction);
                    }
                    else if (planofaction.product == "engineering" &&
                        TrasteelService.isEngTeamAdmin()) {
                        plan.planOfActions.push(planofaction);
                    }
                    else if (planofaction.product == "rawmaterials" &&
                        TrasteelService.isRawTeamAdmin()) {
                        plan.planOfActions.push(planofaction);
                    }
                });
                if (plan.planOfActions.length > 0) {
                    this.userPlans.userPlans.push(plan);
                }
            });
            this.selectedUser = await UserService.getPublicProfileUserDetails(this.uid);
            this.updateSlider();
        }
        else {
            //personal user plans
            this.userPlansSub = UserPlansService.userPlans$.subscribe((userPlans) => {
                this.userPlans = userPlans;
                this.updateSlider();
            });
            TrasteelService.isTeamAdmin()
                ? (this.usersListSub = UserService.userPublicProfilesList$.subscribe((userProfiles) => {
                    this.usersList = userProfiles;
                    this.updateSlider();
                }))
                : undefined;
        }
    }
    disconnectedCallback() {
        if (this.uid) {
            //open other user plan
        }
        else {
            TrasteelService.isTeamAdmin()
                ? this.usersListSub.unsubscribe()
                : undefined;
            this.userPlansSub.unsubscribe();
        }
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-plans" + this.uid, {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
            on: {
                slideChange: () => {
                    this.slider ? this.slider.updateAutoHeight() : null;
                },
            },
        });
        if (!this.uid && TrasteelService.isTeamAdmin()) {
            this.usersTeams = await TrasteelService.getUsersTeams();
        }
    }
    updateSlider() {
        setTimeout(() => {
            //reset slider height
            this.slider ? this.slider.update() : undefined;
        }, 100);
    }
    async editPlan(index) {
        const modal = await UserPlansService.presentUserPlansUpdate(this.uid, this.userPlans, index);
        modal.onDidDismiss().then(() => {
            if (this.uid)
                this.loadUserPlans(); //update data for team user
        });
    }
    renderTeam() {
        //list users for this team
        if (this.usersTeams &&
            this.usersTeams.usersTeams &&
            this.usersTeams.usersTeams.length > 0) {
            const userIds = {};
            this.usersTeams.usersTeams.map((team) => {
                if (team.uid !== UserService.userProfile.uid) {
                    userIds[team.uid] = true;
                }
            });
            let users = [];
            Object.keys(userIds).map((uid) => {
                users.push(this.usersList.find((x) => x.uid == uid));
            });
            users = lodash.exports.orderBy(users, "displayName");
            return users.length > 0
                ? [
                    users.map((user) => [
                        h("ion-item", { button: true, onClick: () => UserPlansService.openUsersPlans(user.uid) }, user.displayName + " - " + user.email),
                    ]),
                ]
                : null;
        }
        else
            return null;
    }
    render() {
        return [
            h("ion-header", { key: 'fea53a538e671f7b12d487d3bff2c9c7ce08d120' }, h("app-navbar", { key: '1c6947aabac70fcebfc3ab6112dfac7c4e9a64c3', tag: this.uid == null ? "plan-of-actions" : null, text: this.uid == null
                    ? "Plan of Actions"
                    : "Plan of Actions - " + this.selectedUser.displayName, color: Environment.getAppColor(), backButton: this.uid != null })),
            !this.uid && TrasteelService.isTeamAdmin() ? (h("app-header-segment-toolbar", { color: Environment.getAppColor(), swiper: this.slider, titles: this.titles })) : undefined,
            h("ion-content", { key: '6cb4afdf1e3d71eee051aabc5cdb3a8b38e87559', class: "slides" }, h("ion-fab", { key: '41d32187daa3946f6a66de89af8ae2a2eb2ad1f7', vertical: "top", horizontal: "end", slot: "fixed", edge: true }, h("ion-fab-button", { key: '5a125f969e6be2c7371518332fb8df67e4176223', size: "small", onClick: () => this.editPlan(), color: Environment.getAppColor() }, h("ion-icon", { key: '5db26861f18216aa584b7d49c867d1b22e07d8ba', name: "add" }))), h("swiper-container", { key: '2521904f940ee5eab44d9353bbe118789370d425', class: "slider-plans" + this.uid + " swiper" }, h("swiper-wrapper", { key: 'ddffa3c1f163e5830d5b89e3ccd6ce02565dca59', class: "swiper-wrapper" }, h("swiper-slide", { key: '55151138a677830a1e46bfa34e4dfd85777889c7', class: "swiper-slide" }, h("div", { key: '0c5da40321d0dddae98fd399cb7482419a2b5087', class: "ion-padding-top" }), this.userPlans &&
                this.userPlans.userPlans &&
                this.userPlans.userPlans.length > 0 ? (this.userPlans.userPlans.map((userPlan, index) => [
                h("ion-item", { button: true, onClick: () => this.editPlan(index) }, h("ion-grid", { class: "ion-no-padding" }, h("ion-row", { class: "ion-no-padding" }, h("ion-col", null, h("ion-item-divider", { color: "trasteel" }, userPlan.customerId != null
                    ? CustomersService.getCustomersDetails(userPlan.customerId).fullName
                    : userPlan.otherName))), userPlan.planOfActions.map((plan) => [
                    h("ion-row", { class: "ion-no-padding" }, h("ion-col", null, h("app-item-detail", { lines: "none", "label-tag": "product", "label-text": "Product", detailText: ProductLines[plan.product] })), h("ion-col", null, h("app-item-detail", { lines: "none", "label-tag": "updated", "label-text": "Updated", detailText: new Date(plan.updated).toLocaleDateString() })), h("ion-col", null, h("app-item-detail", { lines: "none", "label-tag": "due-date", "label-text": "Due Date", detailText: new Date(plan.dueDate).toLocaleDateString() }))),
                    h("ion-row", { class: "ion-no-padding" }, h("ion-col", null, h("app-item-detail", { lines: "none", "label-tag": "actual-situation", "label-text": "Actual Situation", detailText: plan.situation })), h("ion-col", null, h("app-item-detail", { lines: "none", "label-tag": "plan", "label-text": "Plan", detailText: plan.plan }))),
                    h("ion-row", { class: "ion-no-padding" }, h("ion-item-divider", null)),
                ]))),
            ])) : (h("ion-item", null, h("ion-label", null, "Insert a new plan of actions")))), !this.uid && TrasteelService.isTeamAdmin() ? (h("swiper-slide", { class: "swiper-slide" }, h("ion-list", null, this.renderTeam()))) : undefined))),
        ];
    }
};
PageUserPlans.style = pageUserPlansCss;

export { PageUserPlans as page_user_plans };

//# sourceMappingURL=page-user-plans.entry.js.map