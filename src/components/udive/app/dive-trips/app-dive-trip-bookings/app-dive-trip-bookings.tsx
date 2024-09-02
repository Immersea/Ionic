import {Component, h, Prop, State, Element} from "@stencil/core";
import {TranslationService} from "../../../../../services/common/translations";
import {
  TripDive,
  TeamMember,
  DiveTrip,
} from "../../../../../interfaces/udive/dive-trip/diveTrip";
import {isNumber, orderBy, toNumber} from "lodash";
import {UserService} from "../../../../../services/common/user";
import {DiveTripsService} from "../../../../../services/udive/diveTrips";
import {Subscription} from "rxjs";
import {format} from "date-fns";
import {Environment} from "../../../../../global/env";

@Component({
  tag: "app-dive-trip-bookings",
  styleUrl: "app-dive-trip-bookings.scss",
})
export class AppDiveTripBookings {
  @Element() el: HTMLElement;
  @Prop() diveTrip: DiveTrip;
  @Prop() diveTripId: string;
  @Prop() tripDiveIndex: number;
  @Prop() editable = false;
  @State() isEditing = false;
  @State() segment: number = 0;
  @State() tripDive: TripDive;
  @State() bookingsList: any[];
  availableSpots = [];
  @State() waitingRequest = false;
  @State() updateView = false;
  segmentTitles: {
    notinterested: string;
    interested: string;
    attend: string;
  };
  @State() userBooking: TeamMember;
  userSub: Subscription;
  userId: string;
  usersList: any[];
  loogBookButton: boolean;

  componentWillLoad() {
    this.tripDive = this.diveTrip.tripDives[this.tripDiveIndex];
    this.userSub = UserService.userProfile$.subscribe((user) => {
      this.userId = user && user.uid ? user.uid : null;
      this.updateBookingsList();
    });
    this.userId =
      UserService.userProfile && UserService.userProfile.uid
        ? UserService.userProfile.uid
        : null;
    this.updateBookingsList();
    this.segmentTitles = {
      notinterested: TranslationService.getTransl(
        "not-interested",
        "Not Interested"
      ),
      interested: TranslationService.getTransl("interested", "Interested"),
      attend: TranslationService.getTransl("attend", "Attend"),
    };
  }

  disconnectedCallback() {
    this.userSub.unsubscribe();
  }

  async updateBookingsList() {
    this.bookingsList = [];
    this.availableSpots = [];
    this.usersList = [];
    let bookings = orderBy(this.tripDive.bookings, ["team"]);

    //reset team numbers starting from 0
    let teamCount = 0;
    let currentTeam = bookings[0] && bookings[0].team ? bookings[0].team : 0; //normally 0 - if >0 then bring it back to 0
    bookings.map((booking) => {
      if (booking.team > currentTeam) {
        teamCount++;
        currentTeam = booking.team;
      }
      booking.team = teamCount;
    });
    //reset bookings
    this.tripDive.bookings = bookings;

    currentTeam = -1;
    console.log("this.tripDive", this.tripDive);
    for (let booking of bookings) {
      if (booking.team > currentTeam) {
        this.bookingsList.push(booking.team);
        currentTeam = booking.team;
      }
      let listItem = {
        ...booking,
        user: await UserService.getMapDataUserDetails(booking.uid),
      };
      this.bookingsList.push(listItem);
      if (this.userId && booking.uid === this.userId) {
        this.userBooking = booking;
      }
    }
    let confirmedBookings = 0;
    this.tripDive.bookings.map((booking) => {
      if (booking.confirmedOrganiser) {
        confirmedBookings++;
      }
    });
    for (
      let index = 0;
      index < this.tripDive.numberOfParticipants - confirmedBookings;
      index++
    ) {
      this.availableSpots.push(0);
    }
    this.updateView = !this.updateView;
  }
  segmentChanged(ev) {
    if (ev.detail.value) {
      this.segment = toNumber(ev.detail.value);
    }
  }

  async addBooking(ev) {
    const confirmedUser =
      ev.detail.value == "true"
        ? true
        : ev.detail.value == "false"
          ? false
          : null;
    let booking: TeamMember = this.userBooking
      ? this.userBooking
      : {
          role: "diver",
          team: 0,
          uid: this.userId,
          confirmedUser: confirmedUser,
          confirmedOrganiser: false,
        };
    try {
      this.waitingRequest = true;
      const bookings = await DiveTripsService.sendBookingRequest(
        this.diveTripId,
        this.tripDiveIndex,
        booking.role,
        booking.team,
        booking.uid,
        confirmedUser,
        booking.confirmedOrganiser
      );
      this.waitingRequest = false;
      this.tripDive.bookings = bookings;
      this.updateBookingsList();
    } catch (error) {
      this.waitingRequest = false;
    }
  }

  updateBooking(i, ev) {
    const search = this.bookingsList[i];
    const item = this.tripDive.bookings.find(
      (booking) => booking.uid === search.uid
    );
    item.confirmedOrganiser =
      ev.detail.value == "true"
        ? true
        : ev.detail.value == "false"
          ? false
          : null;
  }

  editBookings() {
    this.isEditing = true;
  }

  saveBookings() {
    this.isEditing = false;
    this.updateBookingsList();
  }

  addTeam() {
    //count number of teams
    let teams = 0;
    this.bookingsList.map((booking) => {
      if (isNumber(booking)) teams = booking;
    });
    this.bookingsList.push(teams + 1);
    this.updateView = !this.updateView;
  }

  reorderTeams(ev) {
    const from = ev.detail.from; //starting position
    const to = ev.detail.to; //end position
    //find original item
    const search = this.bookingsList[from];
    const item = this.tripDive.bookings.find(
      (booking) => booking.uid === search.uid
    );
    //find new position on bookingsList
    let found = false;
    let team = 0;
    this.bookingsList.map((booking, i) => {
      //set current team number
      if (isNumber(booking)) team = booking;
      if (to <= i && !found) {
        item.team = team;
        found = true;
      }
    });
    this.bookingsList = ev.detail.complete(this.bookingsList);
  }

  render() {
    return (
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-item class="ion-no-padding" lines="none">
              <ion-label>
                {format(this.tripDive.divePlan.dives[0].date, "PP")}
              </ion-label>
            </ion-item>
          </ion-card-title>
          <ion-card-subtitle>
            <ion-item class="ion-no-padding" lines="none">
              <ion-label>
                {this.tripDive.divePlan.title +
                  " -> " +
                  TranslationService.getTransl(
                    "max-participants",
                    "Max xxx participants",
                    {xxx: this.tripDive.numberOfParticipants}
                  )}
              </ion-label>
              {this.editable &&
              this.tripDive.bookings &&
              this.tripDive.bookings.length > 0 ? (
                !this.isEditing ? (
                  <ion-button slot="end" onClick={() => this.editBookings()}>
                    <my-transl tag="edit" text="Edit" />
                  </ion-button>
                ) : (
                  [
                    <ion-button slot="end" onClick={() => this.addTeam()}>
                      <my-transl tag="add-team" text="Add Team" />
                    </ion-button>,
                    <ion-button slot="end" onClick={() => this.saveBookings()}>
                      <my-transl tag="save" text="Save" />
                    </ion-button>,
                  ]
                )
              ) : undefined}
            </ion-item>
          </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          {!this.editable ? (
            <ion-segment
              mode="ios"
              color={Environment.getAppColor()}
              disabled={this.waitingRequest}
              onIonChange={(ev) => this.addBooking(ev)}
              value={
                this.userBooking
                  ? this.userBooking.confirmedUser.toString()
                  : ""
              }
            >
              <ion-segment-button value="" layout="icon-start">
                <ion-icon name="close-outline"></ion-icon>
                <ion-label>{this.segmentTitles.notinterested}</ion-label>
              </ion-segment-button>
              <ion-segment-button value="false" layout="icon-start">
                <ion-icon name="help-outline"></ion-icon>
                <ion-label>{this.segmentTitles.interested}</ion-label>
              </ion-segment-button>
              <ion-segment-button value="true" layout="icon-start">
                <ion-icon name="checkmark-outline"></ion-icon>
                <ion-label>{this.segmentTitles.attend}</ion-label>
              </ion-segment-button>
            </ion-segment>
          ) : undefined}

          <ion-list>
            <ion-reorder-group
              disabled={!this.isEditing}
              onIonItemReorder={(ev) => this.reorderTeams(ev)}
            >
              {this.waitingRequest && !this.userBooking ? (
                <app-skeletons skeleton="diveTripBooking" />
              ) : undefined}
              {this.bookingsList.map((booking, k) =>
                isNumber(booking) ? (
                  <ion-item-divider>
                    <ion-label>Team {booking + 1}</ion-label>
                  </ion-item-divider>
                ) : booking.uid == this.userId && this.waitingRequest ? (
                  <app-skeletons skeleton="diveTripBooking" />
                ) : (
                  <ion-item>
                    {!this.isEditing && booking.user.photoURL ? (
                      <ion-avatar slot="start">
                        <ion-img src={booking.user.photoURL} />
                      </ion-avatar>
                    ) : (
                      <ion-reorder slot="start"></ion-reorder>
                    )}
                    <ion-label>{booking.user.displayName}</ion-label>
                    {booking.confirmedUser ? (
                      <ion-icon
                        slot="end"
                        color="success"
                        name="checkmark-outline"
                      ></ion-icon>
                    ) : (
                      <ion-icon
                        slot="end"
                        color="warning"
                        name="help-outline"
                      ></ion-icon>
                    )}
                    {!this.isEditing ? (
                      booking.confirmedOrganiser ? (
                        <ion-icon
                          slot="end"
                          color="success"
                          name="checkmark-outline"
                        ></ion-icon>
                      ) : (
                        <ion-icon
                          slot="end"
                          color="warning"
                          name="help-outline"
                        ></ion-icon>
                      )
                    ) : (
                      <ion-segment
                        style={{
                          maxWidth: "40%",
                          marginLeft: "15%",
                        }}
                        slot="end"
                        mode="ios"
                        color={Environment.getAppColor()}
                        onIonChange={(ev) => this.updateBooking(k, ev)}
                        value={booking.confirmedOrganiser.toString()}
                      >
                        <ion-segment-button value="">
                          <ion-icon
                            color="danger"
                            name="close-outline"
                          ></ion-icon>
                        </ion-segment-button>
                        <ion-segment-button value="false">
                          <ion-icon
                            color="warning"
                            name="help-outline"
                          ></ion-icon>
                        </ion-segment-button>
                        <ion-segment-button value="true">
                          <ion-icon
                            color="success"
                            name="checkmark-outline"
                          ></ion-icon>
                        </ion-segment-button>
                      </ion-segment>
                    )}
                  </ion-item>
                )
              )}
            </ion-reorder-group>
            {this.availableSpots.map(() => (
              <ion-item>
                <ion-icon slot="start" name="person-add-outline"></ion-icon>
                <ion-label>
                  <my-transl tag="available" text="Available" />
                </ion-label>
              </ion-item>
            ))}
          </ion-list>
        </ion-card-content>
      </ion-card>
    );
  }
}
