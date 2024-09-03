import { r as registerInstance, l as createEvent, h } from './index-d515af00.js';
import { l as lodash } from './lodash-68d560b6.js';
import { d as dateFns } from './index-9b61a50b.js';
import './_commonjsHelpers-1a56c7bc.js';

const appDivingClassScheduleCss = "app-diving-class-schedule{}";

const AppDivingClassSchedule = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.scheduleEmit = createEvent(this, "scheduleEmit", 7);
        this.divingClass = undefined;
        this.editable = false;
        this.scheduleArray = [];
    }
    async updateClassSchedule() {
        this.scheduleArray = [];
        if (this.divingClass.activities && this.divingClass.activities.length > 0) {
            const schedule = {};
            //get all schedule days
            this.divingClass.activities.map((activity) => {
                schedule[activity.day] = null;
            });
            Object.keys(schedule).map((day) => {
                const dayNum = lodash.exports.toNumber(day);
                const activityPreviousDate = this.divingClass.schedule[dayNum - 1]
                    ? this.divingClass.schedule[dayNum - 1]
                    : new Date();
                const date = this.divingClass.schedule[dayNum];
                /*const activityDate =
                  date && moment(date).diff(moment(activityPreviousDate), "days") >= 1
                    ? moment(this.divingClass.schedule[dayNum])
                    : moment(activityPreviousDate).add(1, "day");
                schedule[day] = moment(activityDate.format("LL")).toDate();*/
                const activityDate = date && dateFns.differenceInDays(date, activityPreviousDate) >= 1
                    ? this.divingClass.schedule[dayNum]
                    : dateFns.addDays(activityPreviousDate, 1);
                // Formatting the date to 'LL' format (e.g., "September 4, 1986") and converting it to a JavaScript Date object.
                const formattedDate = dateFns.format(activityDate, "PP"); // 'PP' corresponds to 'LL' in moment.js
                schedule[day] = new Date(formattedDate);
                this.divingClass.schedule[day] = schedule[day];
            });
            lodash.exports.orderBy(Object.keys(schedule)).forEach((day) => {
                this.scheduleArray.push({
                    day: day,
                    date: dateFns.parseISO(schedule[day]),
                });
            });
            this.saveDatesToDives();
        }
        this.scheduleEmit.emit(true);
    }
    componentWillLoad() {
        this.updateClassSchedule();
    }
    updateActivities(ev) {
        this.divingClass.activities = ev.detail;
        this.updateClassSchedule();
    }
    updateDate(day, dateString) {
        this.divingClass.schedule[day] = new Date(dateString);
        this.updateClassSchedule();
    }
    saveDatesToDives() {
        this.divingClass.activities = this.divingClass.activities.map((activity) => {
            if (activity.divePlan) {
                /*const date = moment(this.divingClass.schedule[activity.day])
                  .add(12, "hours")
                  .toDate();*/
                // Add 12 hours to the date
                const date = dateFns.addHours(this.divingClass.schedule[activity.day], 12);
                activity.divePlan.dives[0].date = date;
            }
            return activity;
        });
    }
    render() {
        return (h("ion-grid", { key: '76ed45f5aff29f7668f8efb5a8082f28cb63aca6' }, h("ion-row", { key: '5bfe23009364fba7e4a6c50bca818390160813ea' }, this.scheduleArray.map((day) => (h("ion-col", { size: "3" }, h("ion-card", null, h("ion-card-title", null, h("my-transl", { tag: "day", text: "Day" }), " " + day.day), h("ion-card-content", null, h("ion-datetime", { presentation: "date", onIonChange: (ev) => this.updateDate(day.day, ev.detail.value), max: "2050", readonly: !this.editable, value: day.date.toISOString() }))))))), h("ion-row", { key: 'e44d9c1b368e34ccf92ea517d21a31c7232a2fc5' }, h("app-dive-course-activities", { key: 'ff1f391fd697beb0bdbe4a8c5fbd1246a69927fa', schedule: this.divingClass.activities, editable: this.editable, onScheduleEmit: (ev) => this.updateActivities(ev) }))));
    }
};
AppDivingClassSchedule.style = appDivingClassScheduleCss;

export { AppDivingClassSchedule as app_diving_class_schedule };

//# sourceMappingURL=app-diving-class-schedule.entry.js.map