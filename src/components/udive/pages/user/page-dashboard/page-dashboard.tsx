import {Component, h, State} from "@stencil/core";
import {UserService} from "../../../../../services/common/user";
import {TripSummary} from "../../../../../interfaces/udive/dive-trip/diveTrip";
import {Subscription} from "rxjs";
import {ClassSummary} from "../../../../../interfaces/udive/diving-class/divingClass";
import {UserDivePlans} from "../../../../../interfaces/udive/user/user-dive-plans";
import {Environment} from "../../../../../global/env";

@Component({
  tag: "page-dashboard",
  styleUrl: "page-dashboard.scss",
})
export class PageDashboard {
  @State() diveTrips: TripSummary;
  @State() divingClasses: ClassSummary;
  @State() divePlans: UserDivePlans;

  divingTripsSub: Subscription;
  divingClassesSub: Subscription;
  divePlansSub: Subscription;

  componentWillLoad() {
    this.divingTripsSub = UserService.userDiveTrips$.subscribe(
      async (trips) => {
        this.diveTrips = trips;
      }
    );
    this.divingClassesSub = UserService.userDivingClasses$.subscribe(
      async (classes) => {
        this.divingClasses = classes;
      }
    );
    this.divePlansSub = UserService.userDivePlans$.subscribe(async (plans) => {
      this.divePlans = plans;
    });
  }

  disconnectedCallback() {
    this.divingTripsSub.unsubscribe();
    this.divingClassesSub.unsubscribe();
    this.divePlansSub.unsubscribe();
  }

  render() {
    return [
      <app-navbar
        color={Environment.getAppColor()}
        tag="dashboard"
        text="Dashboard"
      ></app-navbar>,

      <ion-content>
        <ion-grid>
          {/* calendar */}
          <ion-row class="full-row">
            <ion-col>
              <app-calendar
                calendarId="user-dashboard-calendar"
                addEvents={{
                  trips: this.diveTrips,
                  classes: this.divingClasses,
                  dives: this.divePlans,
                }}
              ></app-calendar>
            </ion-col>
          </ion-row>
          <ion-row class="full-row">
            {/* logbook 
            <ion-col class='col-border'>
              <ion-list>
                <ion-list-header>
                  <my-transl tag='logbook' text='Logbook' isLabel />
                </ion-list-header>
                <app-user-dive-plans />
              </ion-list>
            </ion-col>*/}
            {/* dive sites */}
            <ion-col class="col-border">
              <ion-row class="half-row">
                <ion-col>
                  <ion-list>
                    <ion-list-header>
                      <my-transl
                        tag="my-dive-sites"
                        text="My Dive Sites"
                        isLabel
                      />
                    </ion-list-header>
                    <app-user-dive-sites />
                  </ion-list>
                </ion-col>
              </ion-row>
            </ion-col>
            {/* centers/school/service admin */}
            <ion-col class="col-border">
              <ion-row class="half-row">
                <ion-col>
                  <ion-list>
                    <ion-list-header>
                      <my-transl
                        tag="my-diving-centers"
                        text="My Diving Centers"
                        isLabel
                      />
                    </ion-list-header>
                    <app-user-diving-centers />
                  </ion-list>
                </ion-col>
              </ion-row>
              <ion-row class="half-row">
                <ion-col>
                  <ion-list>
                    <ion-list-header>
                      <my-transl
                        tag="my-dive-communities"
                        text="My Dive Communities"
                        isLabel
                      />
                    </ion-list-header>
                    <app-user-dive-communities />
                  </ion-list>
                </ion-col>
              </ion-row>
              <ion-row class="half-row">
                <ion-col>
                  <ion-list>
                    <ion-list-header>
                      <my-transl
                        tag="my-diving-schools"
                        text="My Diving Schools"
                        isLabel
                      />
                    </ion-list-header>
                    <app-user-diving-schools />
                  </ion-list>
                </ion-col>
              </ion-row>
              <ion-row class="half-row">
                <ion-col>
                  <ion-list>
                    <ion-list-header>
                      <my-transl
                        tag="my-service-centers"
                        text="My Service Centers"
                        isLabel
                      />
                    </ion-list-header>
                    <app-user-service-centers />
                  </ion-list>
                </ion-col>
              </ion-row>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>,
    ];
  }
}
