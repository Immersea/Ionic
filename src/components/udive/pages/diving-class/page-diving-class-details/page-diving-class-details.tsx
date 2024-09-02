import {Component, h, Prop, State, Element} from "@stencil/core";
import {Marker} from "../../../../../interfaces/interfaces";
import {RouterService} from "../../../../../services/common/router";
import {Subscription} from "rxjs";
import {UserService} from "../../../../../services/common/user";
import {
  DivingClass,
  Agency,
} from "../../../../../interfaces/udive/diving-class/divingClass";
import {DivingClassesService} from "../../../../../services/udive/divingClasses";
import {SystemService} from "../../../../../services/common/system";
import {fabButtonTopMarginString} from "../../../../../helpers/utils";
import {MapDataDivingSchool} from "../../../../../interfaces/udive/diving-school/divingSchool";
import {
  DivingSchoolsService,
  DIVESCHOOLSSCOLLECTION,
} from "../../../../../services/udive/divingSchools";
import {MapDataUserPubicProfile} from "../../../../../interfaces/common/user/user-public-profile";
import Swiper from "swiper";
import {TranslationService} from "../../../../../services/common/translations";

@Component({
  tag: "page-diving-class-details",
  styleUrl: "page-diving-class-details.scss",
})
export class PageDivingClassDetails {
  @Element() el: HTMLElement;
  @Prop() classid: string;
  @State() divingClass: DivingClass;
  @State() titles = [{tag: "details"}, {tag: "schedule"}, {tag: "bookings"}];
  @State() slider: Swiper;
  markers: Marker[] = [];
  mapElement: HTMLAppMapElement;
  userSub: Subscription;
  @State() userId: string;
  @State() selectedCourse: any;
  @State() selectedAgency: Agency;
  @State() selectedDivingSchool: MapDataDivingSchool;
  @State() instructors: MapDataUserPubicProfile[];
  statusTitles: {
    active: string;
    closed: string;
    cancelled: string;
  };

  async componentWillLoad() {
    this.userSub = UserService.userProfile$.subscribe((user) => {
      this.userId = user && user.uid ? user.uid : null;
    });
    this.divingClass = await DivingClassesService.getDivingClass(this.classid);
    this.userId =
      UserService.userProfile && UserService.userProfile.uid
        ? UserService.userProfile.uid
        : null;

    this.statusTitles = {
      active: TranslationService.getTransl("active", "Active"),
      closed: TranslationService.getTransl("closed", "Closed"),
      cancelled: TranslationService.getTransl("cancelled", "Cancelled"),
    };

    const divingCourses = await SystemService.getDivingCoursesForSchool();
    //select diving class course
    if (this.divingClass && this.divingClass.course) {
      this.selectedCourse = divingCourses.find(
        (course) =>
          course.agencyId === this.divingClass.course.agencyId &&
          course.id === this.divingClass.course.certificationId
      );
    }
    this.selectedAgency = (await SystemService.getDivingAgencies())[
      this.selectedCourse.agencyId
    ];
    if (this.divingClass.organiser.collectionId === DIVESCHOOLSSCOLLECTION)
      this.selectedDivingSchool = DivingSchoolsService.getDivingSchoolDetails(
        this.divingClass.organiser.id
      );
    this.instructors = [];
    for (let userId of Object.keys(this.divingClass.users)) {
      if (this.divingClass.users[userId].includes("instructor")) {
        this.instructors.push(await UserService.getMapDataUserDetails(userId));
      }
    }
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-diving-class", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: true,
      autoHeight: true,
    });
  }

  disconnectedCallback() {
    this.userSub.unsubscribe();
  }

  render() {
    return [
      this.selectedCourse && this.selectedCourse.photoURL ? (
        <ion-header>
          <app-item-cover item={this.selectedCourse} />
        </ion-header>
      ) : undefined,
      <ion-header>
        <ion-toolbar
          color="divingclass"
          class={
            this.selectedCourse && this.selectedCourse.photoURL
              ? "no-safe-padding"
              : undefined
          }
        >
          <ion-buttons slot="start">
            {!this.selectedCourse ? (
              <ion-button onClick={() => RouterService.goBack()} icon-only>
                <ion-icon name="arrow-back"></ion-icon>
              </ion-button>
            ) : undefined}
          </ion-buttons>
          <ion-title>{this.divingClass.name}</ion-title>
        </ion-toolbar>
      </ion-header>,

      <app-header-segment-toolbar
        color="divingclass"
        swiper={this.slider}
        titles={this.titles}
      ></app-header-segment-toolbar>,
      <ion-content class="slides">
        {this.selectedCourse && this.selectedCourse.coverURL ? (
          <ion-fab
            vertical="top"
            horizontal="start"
            slot="fixed"
            style={{marginTop: fabButtonTopMarginString(2)}}
          >
            <ion-fab-button
              onClick={() => RouterService.goBack()}
              class="fab-icon"
            >
              <ion-icon name="arrow-back-circle-outline"></ion-icon>
            </ion-fab-button>
          </ion-fab>
        ) : undefined}
        <swiper-container class="slider-diving-class swiper">
          <swiper-wrapper class="swiper-wrapper">
            <swiper-slide class="swiper-slide">
              <ion-list>
                {this.selectedDivingSchool ? (
                  <ion-item>
                    <ion-avatar slot="start">
                      <img src={this.selectedDivingSchool.photoURL}></img>
                    </ion-avatar>
                    <ion-label>
                      {this.selectedDivingSchool.displayName}
                    </ion-label>
                  </ion-item>
                ) : undefined}
                {this.selectedAgency ? (
                  <ion-item>
                    <ion-avatar slot="start">
                      <img src={this.selectedAgency.photoURL}></img>
                    </ion-avatar>
                    <ion-label>{this.selectedAgency.name}</ion-label>
                  </ion-item>
                ) : undefined}
                {this.selectedCourse ? (
                  <ion-item>
                    <ion-avatar slot="start">
                      <img src={this.selectedCourse.photoURL}></img>
                    </ion-avatar>
                    <ion-label>{this.selectedCourse.name}</ion-label>
                  </ion-item>
                ) : undefined}
                <ion-item>
                  <ion-icon slot="start" name="navigate-outline"></ion-icon>
                  <ion-label>
                    {this.divingClass.location.display_name}
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-icon slot="start" name="scan-outline"></ion-icon>
                  <ion-label>
                    <my-transl tag="status" text="Status"></my-transl>
                  </ion-label>
                  <ion-note slot="end">
                    {this.statusTitles[this.divingClass.status]}
                  </ion-note>
                </ion-item>
                <ion-list-header>
                  <my-transl tag="instructor" text="Instructor" />
                </ion-list-header>
                {this.instructors.map((instructor) => (
                  <ion-item>
                    {instructor.photoURL ? (
                      <ion-avatar slot="start">
                        <img src={instructor.photoURL}></img>
                      </ion-avatar>
                    ) : (
                      <ion-icon slot="start" name="person"></ion-icon>
                    )}
                    <ion-label>{instructor.displayName}</ion-label>
                  </ion-item>
                ))}
                {this.divingClass.comments
                  ? [
                      <ion-list-header>
                        <my-transl tag="comments" text="Comments" />
                      </ion-list-header>,
                      <ion-item>
                        <ion-label class="ion-text-wrap">
                          {this.divingClass.comments}
                        </ion-label>
                      </ion-item>,
                    ]
                  : undefined}
              </ion-list>
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <app-diving-class-schedule divingClass={this.divingClass} />
            </swiper-slide>
            <swiper-slide class="swiper-slide">
              <ion-grid>
                <ion-row class="ion-text-start">
                  {!this.userId ? (
                    <div
                      style={{
                        marginTop: "10%",
                        marginLeft: "auto",
                        marginRight: "auto",
                      }}
                    >
                      <ion-card>
                        <ion-card-header>
                          <ion-card-title>
                            <my-transl
                              tag="please-login"
                              text="Please login to view this page"
                            />
                          </ion-card-title>
                        </ion-card-header>
                      </ion-card>
                    </div>
                  ) : (
                    <app-dive-class-bookings
                      divingClass={this.divingClass}
                      divingClassId={this.classid}
                    />
                  )}
                </ion-row>
              </ion-grid>
            </swiper-slide>
          </swiper-wrapper>
        </swiper-container>
      </ion-content>,
    ];
  }
}
