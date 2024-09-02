import {Component, h, Prop, EventEmitter, Event, State} from "@stencil/core";
import {cloneDeep, orderBy} from "lodash";
import {Activity} from "../../../../../interfaces/udive/diving-class/divingClass";
import {popoverController} from "@ionic/core";
import {DivingCentersService} from "../../../../../services/udive/divingCenters";
import {DiveSitesService} from "../../../../../services/udive/diveSites";
import {format, isValid} from "date-fns";

@Component({
  tag: "app-dive-course-activities",
  styleUrl: "app-dive-course-activities.scss",
})
export class AppDiveCourseActivities {
  @Prop() schedule: Activity[];
  @Prop() showDiveLocation: boolean = true;
  @Prop() editable: boolean = false;

  @Event() scheduleEmit: EventEmitter<Activity[]>;
  @State() updateView = false;

  async reorderActivities(reorder) {
    const schedule = cloneDeep(this.schedule);
    const itemMove = schedule.splice(reorder.detail.from, 1)[0];
    schedule.splice(reorder.detail.to, 0, itemMove);
    schedule.forEach((cert, order) => {
      cert.order = order;
    });
    reorder.detail.complete(schedule);
    this.schedule = orderBy(schedule, ["days", "order"]);
  }

  async editActivity(key?) {
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
    } else {
      activity = cloneDeep(this.schedule[key]);
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
        } else {
          this.schedule[key] = activity;
        }
      }
      this.scheduleEmit.emit(this.schedule);
      this.updateView = !this.updateView;
    });
    popover.present();
  }

  render() {
    return (
      <ion-list>
        <ion-list-header>
          <ion-label>
            <my-transl tag="activities" text="Activities" />
          </ion-label>
          {this.editable ? (
            <ion-button icon-only onClick={() => this.editActivity()}>
              <ion-icon name="add-circle-outline"></ion-icon>
            </ion-button>
          ) : undefined}
        </ion-list-header>
        {this.schedule ? (
          <ion-reorder-group
            disabled={!this.editable}
            onIonItemReorder={(ev) => this.reorderActivities(ev)}
          >
            {this.schedule.map((activity, i) => (
              <ion-item>
                <ion-reorder slot="end"></ion-reorder>
                <ion-label>
                  <h5>Day {activity.day}</h5>
                  <h2>
                    <my-transl
                      tag={activity.title.tag}
                      text={activity.title.text}
                    ></my-transl>
                  </h2>

                  {activity.divePlan
                    ? [
                        <p>
                          {isValid(activity.divePlan.dives[0].date)
                            ? [
                                <my-transl tag="hour" text="Hour"></my-transl>,
                                ": " +
                                  format(activity.divePlan.dives[0].date, "p"),
                              ]
                            : undefined}
                        </p>,
                        <p>
                          {activity.divePlan.dives[0].divingCenterId
                            ? [
                                <my-transl
                                  tag="diving-center"
                                  text="Diving Center"
                                ></my-transl>,
                                ": " +
                                  DivingCentersService.getDivingCenterDetails(
                                    activity.divePlan.dives[0].divingCenterId
                                  ).displayName,
                              ]
                            : undefined}
                        </p>,
                        <p>
                          {activity.divePlan.dives[0].diveSiteId
                            ? [
                                <my-transl
                                  tag="dive-site"
                                  text="Dive Site"
                                ></my-transl>,
                                ": " +
                                  DiveSitesService.getDiveSitesDetails(
                                    activity.divePlan.dives[0].diveSiteId
                                  ).displayName,
                              ]
                            : undefined}
                        </p>,
                      ]
                    : undefined}
                </ion-label>
                {this.editable ? (
                  <ion-button
                    icon-only
                    fill="clear"
                    onClick={() => this.editActivity(i)}
                  >
                    <ion-icon name="create-outline"></ion-icon>
                  </ion-button>
                ) : undefined}
              </ion-item>
            ))}
          </ion-reorder-group>
        ) : undefined}
      </ion-list>
    );
  }
}
