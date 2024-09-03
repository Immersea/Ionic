import { r as registerInstance, l as createEvent, h } from './index-d515af00.js';
import { l as lodash } from './lodash-68d560b6.js';
import './index-be90eba5.js';
import { i as DivingCentersService, d as DiveSitesService } from './utils-cbf49763.js';
import { d as dateFns } from './index-9b61a50b.js';
import { p as popoverController } from './overlays-b3ceb97d.js';
import './_commonjsHelpers-1a56c7bc.js';
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
import './env-9be68260.js';
import './map-dae4acde.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';
import './framework-delegate-779ab78c.js';

const appDiveCourseActivitiesCss = "app-dive-course-activities{width:100%}";

const AppDiveCourseActivities = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.scheduleEmit = createEvent(this, "scheduleEmit", 7);
        this.schedule = undefined;
        this.showDiveLocation = true;
        this.editable = false;
        this.updateView = false;
    }
    async reorderActivities(reorder) {
        const schedule = lodash.exports.cloneDeep(this.schedule);
        const itemMove = schedule.splice(reorder.detail.from, 1)[0];
        schedule.splice(reorder.detail.to, 0, itemMove);
        schedule.forEach((cert, order) => {
            cert.order = order;
        });
        reorder.detail.complete(schedule);
        this.schedule = lodash.exports.orderBy(schedule, ["days", "order"]);
    }
    async editActivity(key) {
        let activity = null;
        let maxDay = 1;
        let order = 0;
        if (this.schedule) {
            this.schedule.map((activity) => {
                if (activity.day > maxDay) {
                    maxDay = activity.day;
                }
            });
            order = this.schedule.length;
        }
        if (key === undefined) {
            activity = {
                order: order,
                type: null, //theory, dry, dive
                title: {
                    tag: null,
                    text: null,
                },
                day: maxDay,
                completed: false,
                divePlan: null,
            };
        }
        else {
            activity = lodash.exports.cloneDeep(this.schedule[key]);
        }
        const popover = await popoverController.create({
            component: "popover-new-class-activity",
            componentProps: {
                activity: activity,
                showDiveLocation: this.showDiveLocation,
            },
            translucent: true,
        });
        popover.onDidDismiss().then((ev) => {
            const activity = ev.data;
            //reset dive date to null
            if (activity.divePlan) {
                activity.divePlan.dives[0].date = null;
            }
            if (activity) {
                if (key === undefined) {
                    !this.schedule ? (this.schedule = []) : undefined;
                    this.schedule.push(activity);
                }
                else {
                    this.schedule[key] = activity;
                }
            }
            this.scheduleEmit.emit(this.schedule);
            this.updateView = !this.updateView;
        });
        popover.present();
    }
    render() {
        return (h("ion-list", { key: '2e7c9d38ad81edf2fb4e101de95814063b43b015' }, h("ion-list-header", { key: '6a0d8e474ae5819e0845fbf622312c6d954105b3' }, h("ion-label", { key: 'b35d373ddab9473615a14bde35aee17332f5fa4f' }, h("my-transl", { key: 'c109a1ec8b73ec17caf67e3c88fe8557edec889e', tag: "activities", text: "Activities" })), this.editable ? (h("ion-button", { "icon-only": true, onClick: () => this.editActivity() }, h("ion-icon", { name: "add-circle-outline" }))) : undefined), this.schedule ? (h("ion-reorder-group", { disabled: !this.editable, onIonItemReorder: (ev) => this.reorderActivities(ev) }, this.schedule.map((activity, i) => (h("ion-item", null, h("ion-reorder", { slot: "end" }), h("ion-label", null, h("h5", null, "Day ", activity.day), h("h2", null, h("my-transl", { tag: activity.title.tag, text: activity.title.text })), activity.divePlan
            ? [
                h("p", null, dateFns.isValid(activity.divePlan.dives[0].date)
                    ? [
                        h("my-transl", { tag: "hour", text: "Hour" }),
                        ": " +
                            dateFns.format(activity.divePlan.dives[0].date, "p"),
                    ]
                    : undefined),
                h("p", null, activity.divePlan.dives[0].divingCenterId
                    ? [
                        h("my-transl", { tag: "diving-center", text: "Diving Center" }),
                        ": " +
                            DivingCentersService.getDivingCenterDetails(activity.divePlan.dives[0].divingCenterId).displayName,
                    ]
                    : undefined),
                h("p", null, activity.divePlan.dives[0].diveSiteId
                    ? [
                        h("my-transl", { tag: "dive-site", text: "Dive Site" }),
                        ": " +
                            DiveSitesService.getDiveSitesDetails(activity.divePlan.dives[0].diveSiteId).displayName,
                    ]
                    : undefined),
            ]
            : undefined), this.editable ? (h("ion-button", { "icon-only": true, fill: "clear", onClick: () => this.editActivity(i) }, h("ion-icon", { name: "create-outline" }))) : undefined))))) : undefined));
    }
};
AppDiveCourseActivities.style = appDiveCourseActivitiesCss;

export { AppDiveCourseActivities as app_dive_course_activities };

//# sourceMappingURL=app-dive-course-activities.entry.js.map