import { Component, Prop, State, h } from "@stencil/core";
import Swiper from "swiper";
import { UserPlansService } from "../../../../../services/trasteel/crm/user-plans";
import {
  ProductLines,
  UserPlan,
  UserPlans,
} from "../../../../../interfaces/trasteel/users/user-plans";
import { Subscription } from "rxjs";
import { CustomersService } from "../../../../../services/trasteel/crm/customers";
import { TrasteelService } from "../../../../../services/trasteel/common/services";
import { UsersTeams } from "../../../../../interfaces/trasteel/users/users-teams";
import { UserService } from "../../../../../services/common/user";
import { UserPubicProfile } from "../../../../../components";
import { orderBy } from "lodash";
import { Environment } from "../../../../../global/env";

@Component({
  tag: "page-user-plans",
  styleUrl: "page-user-plans.scss",
})
export class PageUserPlans {
  @Prop() uid: string;
  @State() userPlans: UserPlans;
  userPlansSub: Subscription;
  titles = [
    { tag: "personal", text: "Personal", disabled: false },
    { tag: "team", text: "Team", disabled: false },
  ];
  @State() slider: Swiper;
  @State() usersTeams: UsersTeams;
  usersListSub: Subscription;
  usersList: UserPubicProfile[] = [];
  @State() selectedUser: UserPubicProfile;
  @State() updateView = false;

  async componentWillLoad() {
    await this.loadUserPlans();
  }

  async loadUserPlans() {
    if (this.uid) {
      //open other user plan
      let userPlans: UserPlans = new UserPlans(
        await UserPlansService.getPlansOfUser(this.uid)
      );
      this.userPlans = new UserPlans();
      this.userPlans.users = userPlans.users;
      //filter user plans by team manager
      userPlans.userPlans.map((userPlan) => {
        const plan = new UserPlan();
        plan.customerId = userPlan.customerId;
        plan.otherName = userPlan.otherName;
        plan.planOfActions = [];
        userPlan.planOfActions.map((planofaction) => {
          if (
            planofaction.product == "refractories" &&
            TrasteelService.isRefraTeamAdmin()
          ) {
            plan.planOfActions.push(planofaction);
          } else if (
            planofaction.product == "electrodes" &&
            TrasteelService.isElecTeamAdmin()
          ) {
            plan.planOfActions.push(planofaction);
          } else if (
            planofaction.product == "engineering" &&
            TrasteelService.isEngTeamAdmin()
          ) {
            plan.planOfActions.push(planofaction);
          } else if (
            planofaction.product == "rawmaterials" &&
            TrasteelService.isRawTeamAdmin()
          ) {
            plan.planOfActions.push(planofaction);
          }
        });
        if (plan.planOfActions.length > 0) {
          this.userPlans.userPlans.push(plan);
        }
      });
      this.selectedUser = await UserService.getPublicProfileUserDetails(
        this.uid
      );
      this.updateSlider();
    } else {
      //personal user plans
      this.userPlansSub = UserPlansService.userPlans$.subscribe((userPlans) => {
        this.userPlans = userPlans;
        this.updateSlider();
      });
      TrasteelService.isTeamAdmin()
        ? (this.usersListSub = UserService.userPublicProfilesList$.subscribe(
            (userProfiles) => {
              this.usersList = userProfiles;
              this.updateSlider();
            }
          ))
        : undefined;
    }
  }

  disconnectedCallback() {
    if (this.uid) {
      //open other user plan
    } else {
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

  async editPlan(index?) {
    const modal = await UserPlansService.presentUserPlansUpdate(
      this.uid,
      this.userPlans,
      index
    );
    modal.onDidDismiss().then(() => {
      if (this.uid) this.loadUserPlans(); //update data for team user
    });
  }

  renderTeam() {
    //list users for this team
    if (
      this.usersTeams &&
      this.usersTeams.usersTeams &&
      this.usersTeams.usersTeams.length > 0
    ) {
      const userIds = {};
      this.usersTeams.usersTeams.map((team) => {
        if (team.uid !== UserService.userProfile.uid) {
          userIds[team.uid] = true;
        }
      });
      let users: UserPubicProfile[] = [];
      Object.keys(userIds).map((uid) => {
        users.push(this.usersList.find((x) => x.uid == uid));
      });
      users = orderBy(users, "displayName");
      return users.length > 0
        ? [
            users.map((user) => [
              <ion-item
                button
                onClick={() => UserPlansService.openUsersPlans(user.uid)}
              >
                {user.displayName + " - " + user.email}
              </ion-item>,
            ]),
          ]
        : null;
    } else return null;
  }

  render() {
    return [
      <ion-header>
        <app-navbar
          tag={this.uid == null ? "plan-of-actions" : null}
          text={
            this.uid == null
              ? "Plan of Actions"
              : "Plan of Actions - " + this.selectedUser.displayName
          }
          color={Environment.getAppColor()}
          backButton={this.uid != null}
        ></app-navbar>
      </ion-header>,
      !this.uid && TrasteelService.isTeamAdmin() ? (
        <app-header-segment-toolbar
          color={Environment.getAppColor()}
          swiper={this.slider}
          titles={this.titles}
        ></app-header-segment-toolbar>
      ) : undefined,
      <ion-content class='slides'>
        <ion-fab vertical='top' horizontal='end' slot='fixed' edge>
          <ion-fab-button
            size='small'
            onClick={() => this.editPlan()}
            color={Environment.getAppColor()}
          >
            <ion-icon name='add'></ion-icon>
          </ion-fab-button>
        </ion-fab>
        <swiper-container class={"slider-plans" + this.uid + " swiper"}>
          <swiper-wrapper class='swiper-wrapper'>
            {/* PERSONAL */}
            <swiper-slide class='swiper-slide'>
              <div class='ion-padding-top'></div>
              {this.userPlans &&
              this.userPlans.userPlans &&
              this.userPlans.userPlans.length > 0 ? (
                this.userPlans.userPlans.map((userPlan, index) => [
                  <ion-item button onClick={() => this.editPlan(index)}>
                    <ion-grid class='ion-no-padding'>
                      <ion-row class='ion-no-padding'>
                        <ion-col>
                          <ion-item-divider color='trasteel'>
                            {userPlan.customerId != null
                              ? CustomersService.getCustomersDetails(
                                  userPlan.customerId
                                ).fullName
                              : userPlan.otherName}
                          </ion-item-divider>
                        </ion-col>
                      </ion-row>
                      {userPlan.planOfActions.map((plan) => [
                        <ion-row class='ion-no-padding'>
                          <ion-col>
                            <app-item-detail
                              lines='none'
                              label-tag='product'
                              label-text='Product'
                              detailText={ProductLines[plan.product]}
                            ></app-item-detail>
                          </ion-col>
                          <ion-col>
                            <app-item-detail
                              lines='none'
                              label-tag='updated'
                              label-text='Updated'
                              detailText={new Date(
                                plan.updated
                              ).toLocaleDateString()}
                            ></app-item-detail>
                          </ion-col>
                          <ion-col>
                            <app-item-detail
                              lines='none'
                              label-tag='due-date'
                              label-text='Due Date'
                              detailText={new Date(
                                plan.dueDate
                              ).toLocaleDateString()}
                            ></app-item-detail>
                          </ion-col>
                        </ion-row>,
                        <ion-row class='ion-no-padding'>
                          <ion-col>
                            <app-item-detail
                              lines='none'
                              label-tag='actual-situation'
                              label-text='Actual Situation'
                              detailText={plan.situation}
                            ></app-item-detail>
                          </ion-col>
                          <ion-col>
                            <app-item-detail
                              lines='none'
                              label-tag='plan'
                              label-text='Plan'
                              detailText={plan.plan}
                            ></app-item-detail>
                          </ion-col>
                        </ion-row>,
                        <ion-row class='ion-no-padding'>
                          <ion-item-divider></ion-item-divider>
                        </ion-row>,
                      ])}
                    </ion-grid>
                  </ion-item>,
                ])
              ) : (
                <ion-item>
                  <ion-label>Insert a new plan of actions</ion-label>
                </ion-item>
              )}
            </swiper-slide>
            {/* TEAM */}
            {!this.uid && TrasteelService.isTeamAdmin() ? (
              <swiper-slide class='swiper-slide'>
                <ion-list>{this.renderTeam()}</ion-list>
              </swiper-slide>
            ) : undefined}
          </swiper-wrapper>
        </swiper-container>
      </ion-content>,
    ];
  }
}
