import { Component, h, Prop, EventEmitter, Event, State } from "@stencil/core";
import { cloneDeep, orderBy } from "lodash";
import { Activity } from "../../../../../interfaces/udive/diving-class/divingClass";
import { popoverController } from "@ionic/core";
import { DivingCentersService } from "../../../../../services/udive/divingCenters";
import { DiveSitesService } from "../../../../../services/udive/diveSites";
import { format, formatDate, isValid } from "date-fns";

@Component({
  tag: "app-dive-course-activities",
  styleUrl: "app-dive-course-activities.scss",
})
export class AppDiveCourseActivities {
  @Prop({ mutable: true }) activities: Activity[];
  @Prop() showDiveLocation: boolean = true;
  @Prop() editable: boolean = false;
  @Event() updateEmit: EventEmitter<Activity[]>;

  @State() updateView = false;

  async editActivity(key?) {
    let activity = null;
    if (key === undefined) {
      activity = new Activity();
    } else {
      activity = new Activity(cloneDeep(this.activities[key]));
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
      const activity = new Activity(ev.data);
      //reset dive date to null
      //if (activity.divePlan) {
      //  activity.divePlan.dives[0].date = null;
      //}
      if (key === undefined) {
        this.activities.push(activity);
      } else {
        this.activities[key] = activity;
      }
      this.activities = orderBy(this.activities, "date");
      console.log("this.activities", this.activities);
      this.update();
    });
    popover.present();
  }

  async deleteActivity(key) {
    this.activities.splice(key, 1);
    this.update();
  }

  update() {
    this.updateEmit.emit(this.activities);
    this.updateView = !this.updateView;
  }

  render() {
    return (
      <ion-list>
        {this.editable ? (
          <ion-list-header>
            <ion-label>
              <my-transl tag='activities' text='Activities' />
            </ion-label>
            <ion-button icon-only onClick={() => this.editActivity()}>
              <ion-icon name='add-circle-outline'></ion-icon>
            </ion-button>
          </ion-list-header>
        ) : undefined}

        {this.activities
          ? this.activities.map((activity, i) => (
              <ion-item>
                <ion-label>
                  <h5>{formatDate(activity.date, "PP")}</h5>
                  <h2>{activity.title}</h2>

                  {activity.divePlan
                    ? [
                        <p>
                          {isValid(activity.divePlan.dives[0].date)
                            ? [
                                <my-transl tag='hour' text='Hour'></my-transl>,
                                ": " +
                                  format(activity.divePlan.dives[0].date, "p"),
                              ]
                            : undefined}
                        </p>,
                        <p>
                          {activity.divePlan.dives[0].divingCenterId
                            ? [
                                <my-transl
                                  tag='diving-center'
                                  text='Diving Center'
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
                                  tag='dive-site'
                                  text='Dive Site'
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
                {this.editable
                  ? [
                      <ion-button
                        icon-only
                        fill='clear'
                        onClick={() => this.editActivity(i)}
                      >
                        <ion-icon name='create-outline'></ion-icon>
                      </ion-button>,
                      <ion-button
                        icon-only
                        fill='clear'
                        onClick={() => this.deleteActivity(i)}
                      >
                        <ion-icon name='trash' color='danger'></ion-icon>
                      </ion-button>,
                    ]
                  : undefined}
              </ion-item>
            ))
          : undefined}
      </ion-list>
    );
  }
}
