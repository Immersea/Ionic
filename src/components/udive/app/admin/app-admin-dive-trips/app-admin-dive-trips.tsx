import { Component, h, State, Host, Prop } from "@stencil/core";
import { Subscription } from "rxjs";
import {
  UserService,
  USERPROFILECOLLECTION,
} from "../../../../../services/common/user";
import { orderBy } from "lodash";
import { DiveTripsService } from "../../../../../services/udive/diveTrips";
import { UserRoles } from "../../../../../interfaces/common/user/user-roles";
import { UserPubicProfile } from "../../../../../interfaces/common/user/user-public-profile";
import {
  DivingCentersService,
  DIVECENTERSSCOLLECTION,
} from "../../../../../services/udive/divingCenters";
import { MapDataDivingCenter } from "../../../../../interfaces/udive/diving-center/divingCenter";
import { MapDataDivingSchool } from "../../../../../interfaces/udive/diving-school/divingSchool";
import {
  DivingSchoolsService,
  DIVESCHOOLSSCOLLECTION,
} from "../../../../../services/udive/divingSchools";
import { TripSummary } from "../../../../../interfaces/udive/dive-trip/diveTrip";
import {
  DIVECOMMUNITIESCOLLECTION,
  DiveCommunitiesService,
} from "../../../../../services/udive/diveCommunities";
import { MapDataDiveCommunity } from "../../../../../interfaces/udive/dive-community/diveCommunity";
import { TranslationService } from "../../../../../services/common/translations";
import { format } from "date-fns/format";

@Component({
  tag: "app-admin-dive-trips",
  styleUrl: "app-admin-dive-trips.scss",
})
export class AppAdminDiveTrips {
  @Prop() filterByOrganisierId: string;
  @Prop() filterByTrips: any;
  @Prop() future: boolean = false;
  @State() adminDiveTripsArray: any[] = [];
  @State() updateView = false;
  @State() creatingNewDiveTrip = false;
  @State() loadingDiveTrips = true;
  loadingDiveTrips$: Subscription;
  @State() editingDiveTrip = "";
  editingDiveTrip$: Subscription;

  userRoles: UserRoles;
  userRoles$: Subscription;
  userDiveTrips: TripSummary;
  userDiveTrips$: Subscription;
  userPublicProfilesList: UserPubicProfile[] = [];
  userPublicProfilesList$: Subscription;
  divingCentersList: MapDataDivingCenter[] = [];
  divingCentersList$: Subscription;
  diveCommunitiesList: MapDataDiveCommunity[] = [];
  diveCommunitiesList$: Subscription;
  divingSchoolsList: MapDataDivingSchool[] = [];
  divingSchoolsList$: Subscription;

  async componentWillLoad() {
    this.loadingDiveTrips$ = DiveTripsService.creatingNewDiveTrip$.subscribe(
      (value) => {
        this.creatingNewDiveTrip = value;
      }
    );
    this.editingDiveTrip$ = DiveTripsService.editingDiveTripId$.subscribe(
      (value) => {
        this.editingDiveTrip = value;
      }
    );

    //load classes
    //if filterbyorganiserId  ==  loaded school/center -> load classes from school or diving center
    if (this.filterByOrganisierId) {
      if (
        this.filterByOrganisierId ===
        DivingSchoolsService.selectedDivingSchoolId
      ) {
        this.userDiveTrips$ =
          DivingSchoolsService.selectedDivingSchoolTrips$.subscribe((sub) =>
            this.loadDiveTrips(sub)
          );
      } else if (
        this.filterByOrganisierId ===
        DivingCentersService.selectedDivingCenterId
      ) {
        this.userDiveTrips$ =
          DivingCentersService.selectedDivingCenterTrips$.subscribe((sub) =>
            this.loadDiveTrips(sub)
          );
      }
    } else {
      this.userDiveTrips$ = UserService.userDiveTrips$.subscribe((sub) =>
        this.loadDiveTrips(sub)
      );
    }

    //load all users list
    this.userPublicProfilesList$ =
      UserService.userPublicProfilesList$.subscribe((collection) => {
        //update dive sites
        this.userPublicProfilesList = collection;
        this.filter();
      });
    //load all diving centers list
    this.divingCentersList$ = DivingCentersService.divingCentersList$.subscribe(
      (collection) => {
        //update dive sites
        this.divingCentersList = collection;
        this.filter();
      }
    );
    //load all dive communities list
    this.diveCommunitiesList$ =
      DiveCommunitiesService.diveCommunitiesList$.subscribe((collection) => {
        //update dive sites
        this.diveCommunitiesList = collection;
        this.filter();
      });
    //load all diving schools list
    this.divingSchoolsList$ = DivingSchoolsService.divingSchoolsList$.subscribe(
      (collection) => {
        //update dive sites
        this.divingSchoolsList = collection;
        this.filter();
      }
    );
    this.userRoles$ = UserService.userRoles$.subscribe((roles) => {
      this.userRoles = roles;
      this.filter();
    });
  }

  disconnectedCallback() {
    this.userRoles$.unsubscribe();
    this.userDiveTrips$.unsubscribe();
    this.userPublicProfilesList$.unsubscribe();
    this.divingCentersList$.unsubscribe();
    this.diveCommunitiesList$.unsubscribe();
    this.divingSchoolsList$.unsubscribe();
    this.editingDiveTrip$.unsubscribe();
    this.loadingDiveTrips$.unsubscribe();
  }

  loadDiveTrips(userDiveTrips: TripSummary) {
    DiveTripsService.resetSkeletons();
    this.loadingDiveTrips = false;
    if (userDiveTrips) {
      let adminDiveTripsArray = [];
      console.log("userDiveTrips", userDiveTrips);

      Object.keys(userDiveTrips).forEach((key) => {
        let trip = userDiveTrips[key] as any;
        trip.id = key;
        if (this.future && new Date(trip.end) < new Date()) {
          trip = null;
        }
        if (
          trip &&
          this.filterByOrganisierId &&
          trip.organiser.id == this.filterByOrganisierId
        ) {
          adminDiveTripsArray.push(trip);
        } else if (trip && !this.filterByOrganisierId) {
          adminDiveTripsArray.push(trip);
        }
      });

      adminDiveTripsArray = orderBy(adminDiveTripsArray, "date", "desc");
      this.adminDiveTripsArray = adminDiveTripsArray;
      this.filter();
    }
  }

  filter() {
    if (this.adminDiveTripsArray.length > 0) {
      //load organiser data
      this.adminDiveTripsArray.map((diveTrip) => {
        const organiser = diveTrip.organiser;
        switch (organiser.collectionId) {
          case USERPROFILECOLLECTION:
            organiser.item = this.userPublicProfilesList.find(
              (user) => user.uid === organiser.id
            );
            break;
          case DIVECENTERSSCOLLECTION:
            organiser.item = this.divingCentersList.find(
              (dc) => dc.id === organiser.id
            );
            break;
          case DIVECOMMUNITIESCOLLECTION:
            organiser.item = this.diveCommunitiesList.find(
              (dc) => dc.id === organiser.id
            );
            break;
          case DIVESCHOOLSSCOLLECTION:
            organiser.item = this.divingSchoolsList.find(
              (school) => school.id === organiser.id
            );
            break;
        }
        if (this.userRoles) {
          const role = this.userRoles.editorOf[diveTrip.id];
          diveTrip.editor = role && role.roles && role.roles.length > 0;
          diveTrip.owner = role && role.roles && role.roles.includes("owner");
        }
      });
      //filter by trips id for clients visualisation
      if (this.filterByTrips) {
        const tripsArray = Object.keys(this.filterByTrips);
        this.adminDiveTripsArray = this.adminDiveTripsArray.filter((trip) =>
          tripsArray.includes(trip.id)
        );
      }
      this.updateView = !this.updateView;
    }
  }

  update(event, id) {
    event.stopPropagation();
    DiveTripsService.presentDiveTripUpdate(null, null, id);
  }

  delete(event, id) {
    event.stopPropagation();
    DiveTripsService.deleteDiveTrip(id);
  }

  render() {
    return (
      <Host>
        {this.loadingDiveTrips
          ? [
              <app-skeletons skeleton='diveTrip' />,
              <app-skeletons skeleton='diveTrip' />,
              <app-skeletons skeleton='diveTrip' />,
              <app-skeletons skeleton='diveTrip' />,
              <app-skeletons skeleton='diveTrip' />,
            ]
          : undefined}
        {this.creatingNewDiveTrip ? (
          <app-skeletons skeleton='diveTrip' />
        ) : undefined}
        {this.adminDiveTripsArray.map((diveTrip) =>
          this.editingDiveTrip == diveTrip.id ? (
            <app-skeletons skeleton='diveTrip' />
          ) : (
            <ion-item
              button
              onClick={() => DiveTripsService.pushDiveTrip(diveTrip.id)}
              detail
            >
              {diveTrip.organiser &&
              diveTrip.organiser.item &&
              diveTrip.organiser.item.photoURL ? (
                <ion-avatar slot='start'>
                  <ion-img src={diveTrip.organiser.item.photoURL} />
                </ion-avatar>
              ) : undefined}
              <ion-label>
                <h2>{diveTrip.displayName}</h2>
                <h4>{format(diveTrip.date, "PP")}</h4>
                {diveTrip.organiser &&
                diveTrip.organiser.item &&
                diveTrip.organiser.item.displayName ? (
                  <p>
                    <my-transl tag='organiser' text='Organiser' />
                    {": " + diveTrip.organiser.item.displayName}
                  </p>
                ) : undefined}
              </ion-label>
              {diveTrip.owner ? (
                <ion-button
                  fill='clear'
                  color='danger'
                  icon-only
                  slot='end'
                  onClick={(ev) => this.delete(ev, diveTrip.id)}
                >
                  <ion-icon name='trash' slot='end'></ion-icon>
                </ion-button>
              ) : undefined}
              {diveTrip.editor ? (
                <ion-button
                  fill='clear'
                  color='divetrip'
                  icon-only
                  slot='end'
                  onClick={(ev) => this.update(ev, diveTrip.id)}
                >
                  <ion-icon name='create' slot='end'></ion-icon>
                </ion-button>
              ) : undefined}
            </ion-item>
          )
        )}
        {this.adminDiveTripsArray.length == 0 ? (
          <ion-item
            button={this.future}
            onClick={() =>
              this.future
                ? DiveTripsService.presentDiveTripUpdate(
                    USERPROFILECOLLECTION,
                    UserService.userRoles.uid
                  )
                : null
            }
          >
            <ion-label>
              <h2>
                {this.future
                  ? TranslationService.getTransl(
                      "no-future-dive-trips",
                      "Plan a new dive trip"
                    )
                  : TranslationService.getTransl(
                      "no-dive-trips",
                      "No dive trips yet. Click on the '+' button to create your first one."
                    )}
              </h2>
            </ion-label>
          </ion-item>
        ) : undefined}
      </Host>
    );
  }
}
