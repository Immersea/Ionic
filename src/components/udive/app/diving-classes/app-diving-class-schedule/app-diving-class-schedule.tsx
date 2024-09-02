import {
  Component,
  h,
  Prop,
  State,
  Event,
  EventEmitter,
  Method,
} from "@stencil/core";
import {orderBy, toNumber} from "lodash";
import {DivingClass} from "../../../../../interfaces/udive/diving-class/divingClass";
import {addDays, addHours, differenceInDays, format, parseISO} from "date-fns";

@Component({
  tag: "app-diving-class-schedule",
  styleUrl: "app-diving-class-schedule.scss",
})
export class AppDivingClassSchedule {
  @Event() scheduleEmit: EventEmitter<any>;
  @Prop({mutable: true}) divingClass: DivingClass;
  @Prop() editable: boolean = false;
  @State() scheduleArray: any[] = [];

  @Method()
  async updateClassSchedule() {
    this.scheduleArray = [];
    if (this.divingClass.activities && this.divingClass.activities.length > 0) {
      const schedule = {};
      //get all schedule days
      this.divingClass.activities.map((activity) => {
        schedule[activity.day] = null;
      });
      Object.keys(schedule).map((day) => {
        const dayNum = toNumber(day);
        const activityPreviousDate = this.divingClass.schedule[dayNum - 1]
          ? this.divingClass.schedule[dayNum - 1]
          : new Date();
        const date = this.divingClass.schedule[dayNum];
        /*const activityDate =
          date && moment(date).diff(moment(activityPreviousDate), "days") >= 1
            ? moment(this.divingClass.schedule[dayNum])
            : moment(activityPreviousDate).add(1, "day");
        schedule[day] = moment(activityDate.format("LL")).toDate();*/

        const activityDate =
          date && differenceInDays(date, activityPreviousDate) >= 1
            ? this.divingClass.schedule[dayNum]
            : addDays(activityPreviousDate, 1);

        // Formatting the date to 'LL' format (e.g., "September 4, 1986") and converting it to a JavaScript Date object.
        const formattedDate = format(activityDate, "PP"); // 'PP' corresponds to 'LL' in moment.js
        schedule[day] = new Date(formattedDate);

        this.divingClass.schedule[day] = schedule[day];
      });

      orderBy(Object.keys(schedule)).forEach((day) => {
        this.scheduleArray.push({
          day: day,
          date: parseISO(schedule[day]),
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
    this.divingClass.activities = this.divingClass.activities.map(
      (activity) => {
        if (activity.divePlan) {
          /*const date = moment(this.divingClass.schedule[activity.day])
            .add(12, "hours")
            .toDate();*/
          // Add 12 hours to the date
          const date = addHours(this.divingClass.schedule[activity.day], 12);
          activity.divePlan.dives[0].date = date;
        }
        return activity;
      }
    );
  }

  render() {
    return (
      <ion-grid>
        <ion-row>
          {this.scheduleArray.map((day) => (
            <ion-col size="3">
              <ion-card>
                <ion-card-title>
                  <my-transl tag="day" text="Day" />
                  {" " + day.day}
                </ion-card-title>
                <ion-card-content>
                  <ion-datetime
                    presentation="date"
                    onIonChange={(ev) =>
                      this.updateDate(day.day, ev.detail.value)
                    }
                    max="2050"
                    readonly={!this.editable}
                    value={day.date.toISOString()}
                  ></ion-datetime>
                </ion-card-content>
              </ion-card>
            </ion-col>
          ))}
        </ion-row>
        <ion-row>
          <app-dive-course-activities
            schedule={this.divingClass.activities}
            editable={this.editable}
            onScheduleEmit={(ev) => this.updateActivities(ev)}
          />
        </ion-row>
      </ion-grid>
    );
  }
}
