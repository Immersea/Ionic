import { Component, h, Prop, State, Event, EventEmitter } from "@stencil/core";
import { DivingClass } from "../../../../../interfaces/udive/diving-class/divingClass";

@Component({
  tag: "app-diving-class-schedule",
  styleUrl: "app-diving-class-schedule.scss",
})
export class AppDivingClassSchedule {
  @Event() scheduleEmit: EventEmitter<any>;
  @Prop({ mutable: true }) divingClass: DivingClass;
  @Prop() editable: boolean = false;
  @State() scheduleArray: any[] = [];
  @Event() updateEmit: EventEmitter<boolean>;

  updateActivities(data) {
    this.divingClass.activities = data.detail;
    this.updateEmit.emit(true);
  }

  updateDate(day, dateString) {
    this.divingClass.schedule[day] = new Date(dateString);
    this.updateEmit.emit(true);
  }

  saveDatesToDives() {
    this.divingClass.activities = this.divingClass.activities.map(
      (activity) => {
        if (activity.divePlan) {
          /*const date = moment(this.divingClass.schedule[activity.day])
            .add(12, "hours")
            .toDate();*/
          // Add 12 hours to the date
          //const date = addHours(this.divingClass.schedule[activity.day], 12);
          //activity.divePlan.dives[0].date = date;
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
            <ion-col size='3'>
              <ion-card>
                <ion-card-title>
                  <my-transl tag='day' text='Day' />
                  {" " + day.day}
                </ion-card-title>
                <ion-card-content>
                  <ion-datetime
                    presentation='date'
                    onIonChange={(ev) =>
                      this.updateDate(day.day, ev.detail.value)
                    }
                    max='2050'
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
            activities={this.divingClass.activities}
            editable={this.editable}
            onUpdateEmit={(data) => this.updateActivities(data)}
          />
        </ion-row>
      </ion-grid>
    );
  }
}
