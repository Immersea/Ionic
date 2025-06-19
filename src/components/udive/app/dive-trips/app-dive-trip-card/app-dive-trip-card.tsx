import {
  Component,
  h,
  Prop,
  Event,
  EventEmitter,
  Watch,
  State,
  Element,
} from "@stencil/core";
import { DivePlanModel } from "../../../../../interfaces/udive/planner/dive-plan";
import { TranslationService } from "../../../../../services/common/translations";
import { TripDive } from "../../../../../interfaces/udive/dive-trip/diveTrip";
import { MapDataDiveSite } from "../../../../../interfaces/udive/dive-site/diveSite";
import { DiveSitesService } from "../../../../../services/udive/diveSites";
import { MapDataDivingCenter } from "../../../../../interfaces/udive/diving-center/divingCenter";
import { DivingCentersService } from "../../../../../services/udive/divingCenters";
import { Subscription } from "rxjs";
import { UserService } from "../../../../../services/common/user";
import { DivePlansService } from "../../../../../services/udive/divePlans";
import { format } from "date-fns/format";
import { toNumber } from "lodash";
import { Environment } from "../../../../../global/env";

@Component({
  tag: "app-dive-trip-card",
  styleUrl: "app-dive-trip-card.scss",
})
export class AppDiveTripCard {
  @Element() el: HTMLElement;
  @Prop({ mutable: true }) tripDive: TripDive;
  diveSites: MapDataDiveSite[] = [];
  @Prop() editable = false;
  @Event() updateDiveEmit: EventEmitter<DivePlanModel>;
  @Event() addDiveEmit: EventEmitter<any>;
  @Event() removeDiveTripEmit: EventEmitter<any>;
  @Event() removeTripDiveEmit: EventEmitter<number>;
  @Prop({ mutable: true }) updateView = false;
  @State() segment: number = 0;
  divingCenters: MapDataDivingCenter[] = [];
  userSub: Subscription;
  userId: string;
  @State() loogBookButton: boolean;

  @Watch("updateView")
  update() {
    this.findDiveSites();
  }

  componentWillLoad() {
    this.findDiveSites();
    this.userSub = UserService.userProfile$.subscribe((user) => {
      this.userId = user && user.uid ? user.uid : null;
      this.activateLogbook();
    });
    this.userId =
      UserService.userProfile && UserService.userProfile.uid
        ? UserService.userProfile.uid
        : null;
    this.activateLogbook();
  }

  activateLogbook() {
    this.loogBookButton = false;
    this.tripDive.bookings.map((booking) => {
      if (booking.uid == this.userId) {
        this.loogBookButton = true;
      }
    });
  }

  findDiveSites() {
    this.diveSites = [];
    this.divingCenters = [];
    this.tripDive.divePlan.dives.forEach((dive) => {
      this.diveSites.push(
        DiveSitesService.diveSitesList.find(
          (site) => site.id === dive.diveSiteId
        )
      );
      this.divingCenters.push(
        DivingCentersService.divingCentersList.find(
          (dc) => dc.id === dive.divingCenterId
        )
      );
    });
  }

  updateDivePlan(ev, index) {
    ev.stopPropagation();
    this.updateDiveEmit.emit(index);
  }

  removeDiveTrip() {
    this.removeDiveTripEmit.emit();
  }

  addDivePlan() {
    this.addDiveEmit.emit();
  }

  removeDivePlan(ev, i) {
    ev.stopPropagation();
    this.segment = this.segment - 1;
    this.removeTripDiveEmit.emit(i);
  }

  segmentChanged(ev) {
    if (ev.detail.value) {
      this.segment = toNumber(ev.detail.value);
    }
  }

  createDivePlan(plan) {
    if (plan.configuration) {
      DivePlansService.createNewDivePlan(plan);
    } else {
      //dummy plan
      DivePlansService.createNewDivePlanWithConfiguration(plan);
    }
  }

  render() {
    return (
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-item class='ion-no-padding' lines='none'>
              <ion-label>
                {format(this.tripDive.divePlan.dives[0].date, "PP")}
              </ion-label>
              {this.editable
                ? [
                    <ion-button
                      icon-only
                      slot='end'
                      color='danger'
                      fill='clear'
                      onClick={() => this.removeDiveTrip()}
                    >
                      <ion-icon name='trash-bin-outline'></ion-icon>
                    </ion-button>,
                    <ion-button
                      icon-only
                      slot='end'
                      color='divetrip'
                      fill='clear'
                      onClick={() => this.addDivePlan()}
                    >
                      <ion-icon name='add-circle'></ion-icon>
                    </ion-button>,
                  ]
                : undefined}
            </ion-item>
          </ion-card-title>
          <ion-card-subtitle>
            {this.tripDive.divePlan.title +
              " -> " +
              TranslationService.getTransl(
                "max-participants",
                "Max xxx participants",
                { xxx: this.tripDive.numberOfParticipants }
              )}
          </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          {this.tripDive.divePlan.dives.length > 1 ? (
            <ion-toolbar>
              <ion-segment
                mode='md'
                color={Environment.getAppColor()}
                onIonChange={(ev) => this.segmentChanged(ev)}
                value={this.segment.toString()}
              >
                {Object.keys(this.tripDive.divePlan.dives).map((i) => (
                  <ion-segment-button value={i}>
                    <ion-label>
                      <my-transl tag='dive' text='Dive' />
                      {" " +
                        (toNumber(i) + 1) +
                        ": " +
                        format(this.tripDive.divePlan.dives[i].date, "p")}
                    </ion-label>
                  </ion-segment-button>
                ))}
              </ion-segment>
            </ion-toolbar>
          ) : undefined}
          <ion-card>
            {this.diveSites[this.segment] ? (
              <app-item-cover item={this.diveSites[this.segment]} />
            ) : undefined}
            <ion-card-header>
              <ion-card-subtitle>
                {this.diveSites[this.segment] ? (
                  <h2>{this.diveSites[this.segment].displayName}</h2>
                ) : undefined}
                {this.divingCenters[this.segment] ? (
                  <h3>{this.divingCenters[this.segment].displayName}</h3>
                ) : undefined}
              </ion-card-subtitle>
              <ion-card-title>
                <ion-item class='ion-no-padding' lines='none'>
                  <ion-label>
                    {format(
                      this.tripDive.divePlan.dives[this.segment].date,
                      "p"
                    )}
                  </ion-label>
                  {this.editable
                    ? [
                        this.segment > 0 ? (
                          <ion-button
                            icon-only
                            slot='end'
                            color='danger'
                            fill='clear'
                            onClick={(ev) =>
                              this.removeDivePlan(ev, this.segment)
                            }
                          >
                            <ion-icon name='trash-bin-outline'></ion-icon>
                          </ion-button>
                        ) : undefined,
                        <ion-button
                          icon-only
                          slot='end'
                          color='primary'
                          fill='clear'
                          onClick={(ev) =>
                            this.updateDivePlan(ev, this.segment)
                          }
                        >
                          <ion-icon name='create'></ion-icon>
                        </ion-button>,
                      ]
                    : undefined}
                </ion-item>
              </ion-card-title>
            </ion-card-header>
            {this.tripDive.divePlan.configuration ? (
              <ion-card-content>
                {this.tripDive.divePlan.dives[this.segment]
                  .getProfilePointsDetails()
                  .map((detail) => (
                    <p class='ion-text-start'>{detail}</p>
                  ))}
              </ion-card-content>
            ) : undefined}
          </ion-card>
        </ion-card-content>
        {!this.editable && this.loogBookButton ? (
          <ion-button
            expand='full'
            color='secondary'
            onClick={() => this.createDivePlan(this.tripDive.divePlan)}
          >
            {this.tripDive.divePlan.dives.length == 1 ? (
              <my-transl tag='log-dive' text='Log Dive' />
            ) : (
              <my-transl tag='log-dives' text='Log Dives' />
            )}
          </ion-button>
        ) : undefined}
      </ion-card>
    );
  }
}
