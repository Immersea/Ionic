import {Component, h, State, Host, Prop} from "@stencil/core";
import {Subscription} from "rxjs";
import {
  UserService,
  USERPROFILECOLLECTION,
} from "../../../../../services/common/user";
import {orderBy} from "lodash";
import {UserRoles} from "../../../../../interfaces/common/user/user-roles";
import {UserPubicProfile} from "../../../../../interfaces/common/user/user-public-profile";
import {
  DivingCentersService,
  DIVECENTERSSCOLLECTION,
} from "../../../../../services/udive/divingCenters";
import {MapDataDivingCenter} from "../../../../../interfaces/udive/diving-center/divingCenter";
import {MapDataDivingSchool} from "../../../../../interfaces/udive/diving-school/divingSchool";
import {
  DivingSchoolsService,
  DIVESCHOOLSSCOLLECTION,
} from "../../../../../services/udive/divingSchools";
import {DivingClassesService} from "../../../../../services/udive/divingClasses";
import {ClassSummary} from "../../../../../interfaces/udive/diving-class/divingClass";
import {TranslationService} from "../../../../../services/common/translations";
import {format} from "date-fns";

@Component({
  tag: "app-admin-diving-classes",
  styleUrl: "app-admin-diving-classes.scss",
})
export class AppAdminDivingClasses {
  @Prop() filterByOrganisierId: string;
  @Prop() filterByClasses: any;
  @State() adminDivingClassesArray: any[] = [];
  @State() updateView = false;
  @State() creatingNewDivingClass = false;
  @State() loadingDivingClasses = true;
  loadingDivingClasses$: Subscription;
  @State() editingDivingClass = "";
  editingDivingClass$: Subscription;

  userRoles: UserRoles;
  userRoles$: Subscription;
  userDivingClasses: ClassSummary;
  userDivingClasses$: Subscription;
  userPublicProfilesList: UserPubicProfile[] = [];
  userPublicProfilesList$: Subscription;
  divingCentersList: MapDataDivingCenter[] = [];
  divingCentersList$: Subscription;
  divingSchoolsList: MapDataDivingSchool[] = [];
  divingSchoolsList$: Subscription;

  async componentWillLoad() {
    this.loadingDivingClasses$ =
      DivingClassesService.creatingNewDivingClass$.subscribe((value) => {
        this.creatingNewDivingClass = value;
      });
    this.editingDivingClass$ =
      DivingClassesService.editingDivingClassId$.subscribe((value) => {
        this.editingDivingClass = value;
      });
    //load classes
    //if filterbyorganiserId  ==  loaded school -> load classes from school
    if (
      this.filterByOrganisierId &&
      this.filterByOrganisierId === DivingSchoolsService.selectedDivingSchoolId
    ) {
      this.userDivingClasses$ =
        DivingSchoolsService.selectedDivingSchoolClasses$.subscribe((sub) =>
          this.loadDivingClasses(sub)
        );
    } else {
      this.userDivingClasses$ = UserService.userDivingClasses$.subscribe(
        (sub) => this.loadDivingClasses(sub)
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
    this.userDivingClasses$.unsubscribe();
    this.userPublicProfilesList$.unsubscribe();
    this.divingCentersList$.unsubscribe();
    this.divingSchoolsList$.unsubscribe();
    this.editingDivingClass$.unsubscribe();
    this.loadingDivingClasses$.unsubscribe();
  }

  async loadDivingClasses(userDivingClasses: ClassSummary) {
    DivingClassesService.resetSkeletons();
    this.loadingDivingClasses = false;
    if (userDivingClasses) {
      let adminDivingClassesArray = [];
      Object.keys(userDivingClasses).forEach((key) => {
        let adminClass = userDivingClasses[key] as any;
        adminClass.id = key;
        if (
          this.filterByOrganisierId &&
          adminClass.organiser.id == this.filterByOrganisierId
        ) {
          adminDivingClassesArray.push(adminClass);
        } else if (!this.filterByOrganisierId) {
          adminDivingClassesArray.push(adminClass);
        }
      });

      adminDivingClassesArray = orderBy(
        adminDivingClassesArray,
        "date",
        "desc"
      );
      this.adminDivingClassesArray = adminDivingClassesArray;
      this.filter();
    }
  }

  filter() {
    if (this.adminDivingClassesArray.length > 0) {
      //load organiser data
      this.adminDivingClassesArray.map((diveTrip) => {
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
      if (this.filterByClasses) {
        const tripsArray = Object.keys(this.filterByClasses);
        this.adminDivingClassesArray = this.adminDivingClassesArray.filter(
          (trip) => tripsArray.includes(trip.id)
        );
      }
      this.updateView = !this.updateView;
    }
  }

  update(event, id) {
    event.stopPropagation();
    DivingClassesService.presentDivingClassUpdate(null, null, id);
  }

  delete(event, id) {
    event.stopPropagation();
    DivingClassesService.deleteDivingClass(id);
  }

  render() {
    return (
      <Host>
        {this.loadingDivingClasses
          ? [
              <app-skeletons skeleton="diveTrip" />,
              <app-skeletons skeleton="diveTrip" />,
              <app-skeletons skeleton="diveTrip" />,
              <app-skeletons skeleton="diveTrip" />,
              <app-skeletons skeleton="diveTrip" />,
            ]
          : undefined}
        {this.creatingNewDivingClass ? (
          <app-skeletons skeleton="diveTrip" />
        ) : undefined}
        {this.adminDivingClassesArray.map((diveClass) =>
          this.editingDivingClass == diveClass.id ? (
            <app-skeletons skeleton="diveTrip" />
          ) : (
            <ion-item
              button
              onClick={() => DivingClassesService.pushDivingClass(diveClass.id)}
              detail
            >
              {diveClass.organiser &&
              diveClass.organiser.item &&
              diveClass.organiser.item.photoURL ? (
                <ion-avatar slot="start">
                  <ion-img src={diveClass.organiser.item.photoURL} />
                </ion-avatar>
              ) : undefined}
              <ion-label>
                <h2>{diveClass.displayName}</h2>
                <h4>{format(diveClass.date, "PP")}</h4>
                {diveClass.organiser &&
                diveClass.organiser.item &&
                diveClass.organiser.item.displayName ? (
                  <p>
                    <my-transl tag="organiser" text="Organiser" />
                    {": " + diveClass.organiser.item.displayName}
                  </p>
                ) : undefined}
              </ion-label>
              {diveClass.owner ? (
                <ion-button
                  fill="clear"
                  color="danger"
                  icon-only
                  slot="end"
                  onClick={(ev) => this.delete(ev, diveClass.id)}
                >
                  <ion-icon name="trash" slot="end"></ion-icon>
                </ion-button>
              ) : undefined}
              {diveClass.editor ? (
                <ion-button
                  fill="clear"
                  color="divingclass"
                  icon-only
                  slot="end"
                  onClick={(ev) => this.update(ev, diveClass.id)}
                >
                  <ion-icon name="create" slot="end"></ion-icon>
                </ion-button>
              ) : undefined}
            </ion-item>
          )
        )}

        {this.adminDivingClassesArray.length == 0 ? (
          <ion-item>
            <ion-label>
              <h2>
                {TranslationService.getTransl(
                  "no-dive-classes",
                  "No diving classes yet. Look for your next class with our diving schools and instructors!"
                )}
              </h2>
            </ion-label>
          </ion-item>
        ) : undefined}
      </Host>
    );
  }
}
