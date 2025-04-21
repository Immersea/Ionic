import { Component, h, State } from "@stencil/core";
import { UserService } from "../../../../../services/common/user";
import { TripSummary } from "../../../../../interfaces/udive/dive-trip/diveTrip";
import { Subscription } from "rxjs";
import { ClassSummary } from "../../../../../interfaces/udive/diving-class/divingClass";
import { UserDivePlans } from "../../../../../interfaces/udive/user/user-dive-plans";
import { Environment } from "../../../../../global/env";

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
        tag='dashboard'
        text='Dashboard'
      ></app-navbar>,

      <ion-content>
        <ion-grid class='ion-no-padding'>
          {/* calendar */}
          <ion-row class='ion-no-padding cards-container'>
            <ion-col size='6' class='ion-no-padding cards-column'>
              <ion-card class='card'>
                <div class='card-content'>
                  <ion-card-content>
                    <app-calendar
                      calendarId='user-dashboard-calendar'
                      addEvents={{
                        trips: this.diveTrips,
                        classes: this.divingClasses,
                        dives: this.divePlans,
                      }}
                    ></app-calendar>
                  </ion-card-content>
                </div>
              </ion-card>
            </ion-col>
            {/* dive trips */}
            <ion-col size='6' class='ion-no-padding cards-column'>
              <ion-card class='card'>
                <div class='card-content'>
                  <ion-card-header>
                    <ion-card-title>
                      <my-transl tag='my-next-plans' text='My Next Plans' />
                    </ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <ion-list>
                      <ion-list-header>Trips</ion-list-header>
                      <app-admin-dive-trips future />
                      <ion-list-header>Classes</ion-list-header>
                      <app-admin-diving-classes future />
                    </ion-list>
                  </ion-card-content>
                </div>
              </ion-card>
            </ion-col>
            {/* dive sites */}
            <ion-col size='6' class='ion-no-padding cards-column'>
              <ion-card class='card'>
                <div class='card-content'>
                  <ion-card-header>
                    <ion-card-title>
                      <my-transl tag='my-dive-sites' text='My Dive Sites' />{" "}
                    </ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <ion-list>
                      <app-user-dive-sites />
                    </ion-list>
                  </ion-card-content>
                </div>
              </ion-card>
            </ion-col>
            {/* centers/school/service admin */}
            <ion-col size='6' class='ion-no-padding cards-column'>
              <ion-card class='card'>
                <div class='card-content'>
                  <ion-card-header>
                    <ion-card-title>
                      <my-transl
                        tag='my-diving-centers'
                        text='My Diving Centers'
                      />{" "}
                    </ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <ion-list>
                      <app-user-diving-centers />
                    </ion-list>
                  </ion-card-content>
                </div>
              </ion-card>
            </ion-col>
            <ion-col size='6' class='ion-no-padding cards-column'>
              <ion-card class='card'>
                <div class='card-content'>
                  <ion-card-header>
                    <ion-card-title>
                      <my-transl
                        tag='my-dive-communities'
                        text='My Dive Communities'
                      />
                    </ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <ion-list>
                      <app-user-dive-communities />
                    </ion-list>
                  </ion-card-content>
                </div>
              </ion-card>
            </ion-col>
            <ion-col size='6' class='ion-no-padding cards-column'>
              <ion-card class='card'>
                <ion-card-header>
                  <ion-card-title>
                    <my-transl
                      tag='my-diving-schools'
                      text='My Diving Schools'
                    />
                  </ion-card-title>
                </ion-card-header>
                <div class='card-content'>
                  <ion-card-content>
                    <ion-list>
                      <app-user-diving-schools />
                    </ion-list>
                  </ion-card-content>
                </div>
              </ion-card>
            </ion-col>
            <ion-col size='6' class='ion-no-padding cards-column'>
              <ion-card class='card'>
                <div class='card-content'>
                  <ion-card-header>
                    <ion-card-title>
                      <my-transl
                        tag='my-service-centers'
                        text='My Service Centers'
                      />
                    </ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <ion-list>
                      <app-user-service-centers />
                    </ion-list>
                  </ion-card-content>
                </div>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>,
    ];
  }
}
