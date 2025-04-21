import { Component, h, Host, Prop, State, Element } from "@stencil/core";
import { DivingClass } from "../../../../../interfaces/udive/diving-class/divingClass";
import { TranslationService } from "../../../../../services/common/translations";
import { modalController, alertController } from "@ionic/core";
import { cloneDeep, each, isString, toNumber } from "lodash";
import { UserService } from "../../../../../services/common/user";
import { DivingClassesService } from "../../../../../services/udive/divingClasses";
import {
  DivingSchoolsService,
  DIVESCHOOLSSCOLLECTION,
} from "../../../../../services/udive/divingSchools";
import { DivingSchool } from "../../../../../interfaces/udive/diving-school/divingSchool";
import { Agency } from "../../../../../interfaces/udive/diving-class/divingClass";
import { SystemService } from "../../../../../services/common/system";
import Swiper from "swiper";

@Component({
  tag: "modal-diving-class-update",
  styleUrl: "modal-diving-class-update.scss",
})
export class ModalDivingClassUpdate {
  @Element() el: HTMLElement;
  @Prop() divingClassId: string = undefined;
  @Prop() collectionId: string;
  @Prop() organiserId: string;
  @State() divingClass: DivingClass;
  @State() updateView = true;
  @State() validClass = false;
  divingSchool: DivingSchool;
  divingCourses: any[];
  @State() selectedCourse: any;
  divingAgencies: { [agencyId: string]: Agency };
  placeholder: string;
  @State() addressText: string;
  @State() titles = [
    { tag: "details" },
    { tag: "schedule" },
    { tag: "team" },
    { tag: "students" },
  ];
  @State() slider: Swiper;
  appBookings: HTMLAppDiveClassBookingsElement;
  appSchedule: HTMLAppDivingClassScheduleElement;
  selectCourseElement: HTMLIonSelectElement;
  statusTitles: {
    active: string;
    closed: string;
    cancelled: string;
  };
  @State() selectGotFocus: boolean = false;

  async componentWillLoad() {
    await this.loadDivingClass();
    this.statusTitles = {
      active: TranslationService.getTransl("active", "Active"),
      closed: TranslationService.getTransl("closed", "Closed"),
      cancelled: TranslationService.getTransl("cancelled", "Cancelled"),
    };
    this.placeholder = TranslationService.getTransl(
      "insert-title",
      "Insert title"
    );
    //load diving school details
    //check if organiser is the loaded diving school
    if (this.organiserId == DivingSchoolsService.selectedDivingSchoolId) {
      this.divingSchool = DivingSchoolsService.selectedDivingSchool;
    } else if (this.collectionId == DIVESCHOOLSSCOLLECTION) {
      //load diving school
      this.divingSchool = await DivingSchoolsService.getDivingSchool(
        this.organiserId
      );
    }
    this.divingAgencies = SystemService.systemPreferences.divingAgencies;
    this.divingCourses = await SystemService.getDivingCoursesForSchool(
      this.divingSchool
    );

    //select diving class course
    if (this.divingClass && this.divingClass.course) {
      this.selectedCourse = this.divingCourses.find(
        (course) =>
          course.agencyId === this.divingClass.course.agencyId &&
          course.id === this.divingClass.course.certificationId
      );
    }
  }

  async loadDivingClass() {
    if (this.divingClassId) {
      this.divingClass = await DivingClassesService.getDivingClass(
        this.divingClassId
      );
      this.collectionId = this.divingClass.organiser.collectionId;
      this.organiserId = this.divingClass.organiser.id;
    } else {
      this.divingClass = new DivingClass();
      this.divingClass.organiser = {
        collectionId: this.collectionId,
        id: this.organiserId,
      };
      this.divingClass.users = {
        [UserService.userRoles.uid]: ["owner", "instructor"],
      };
    }
    this.addressText =
      this.divingClass.location && this.divingClass.location.display_name
        ? this.divingClass.location.display_name
        : null;
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-dive-class", {
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
    this.appBookings = this.el.getElementsByTagName(
      "app-dive-class-bookings"
    )[0];
    this.appSchedule = this.el.getElementsByTagName(
      "app-diving-class-schedule"
    )[0];
    this.createCourseSelectOptions();
    this.validateClass();
  }

  updateSlider() {
    this.updateView = !this.updateView;
    //wait for view to update and then reset slider height
    setTimeout(() => {
      this.slider ? this.slider.update() : undefined;
    }, 100);
  }

  createCourseSelectOptions() {
    //create select options
    this.selectCourseElement = this.el.querySelector("#dive-course-select");
    const customSiteTypePopoverOptions = {
      header: TranslationService.getTransl("diving-course", "Diving Course"),
    };
    //remove previously defined options
    const selectOptions = Array.from(
      this.selectCourseElement.getElementsByTagName("ion-select-option")
    );
    selectOptions.map((option) => {
      this.selectCourseElement.removeChild(option);
    });
    this.selectCourseElement.interfaceOptions = customSiteTypePopoverOptions;
    each(this.divingCourses, (course) => {
      const selectOption = document.createElement("ion-select-option");
      selectOption.value = course;
      selectOption.textContent =
        this.divingAgencies[course.agencyId].name + " - " + course.name;
      this.selectCourseElement.appendChild(selectOption);
    });
  }

  async changeCourse(course) {
    if (
      this.selectGotFocus &&
      this.divingClass &&
      this.divingClass.activities &&
      this.divingClass.activities.length > 0
    ) {
      const alert = await alertController.create({
        header: TranslationService.getTransl("diving-course", "Diving Course"),
        message: TranslationService.getTransl(
          "update-class-activities",
          "This will update all class activities! Are you sure?"
        ),
        buttons: [
          {
            text: TranslationService.getTransl("ok", "OK"),
            handler: () => {
              this.selectGotFocus = false;
              this.updateCourseDetails(course);
            },
          },
          {
            text: TranslationService.getTransl("cancel", "Cancel"),
            handler: () => {
              this.selectGotFocus = false;
              this.createCourseSelectOptions();
              this.selectedCourse = { ...this.selectedCourse };
            },
            role: "cancel",
            cssClass: "secondary",
          },
        ],
      });
      alert.present();
    } else {
      this.updateCourseDetails(course);
    }
  }

  updateCourseDetails(course) {
    this.selectedCourse = course;
    this.divingClass.name =
      this.divingAgencies[this.selectedCourse.agencyId].name +
      " - " +
      this.selectedCourse.name;
    this.divingClass.activities = cloneDeep(course.activities);
    this.divingClass.numberOfStudents = course.numberOfStudents;
    this.divingClass.course = {
      certificationId: course.id,
      agencyId: course.agencyId,
    };
    this.appBookings.updateStudentsList();
    this.validateClass();
  }

  selectLocation(location) {
    this.divingClass.location = location;
    this.addressText = location.display_name;
    this.validateClass();
  }

  updateStudents(students) {
    this.divingClass.numberOfStudents = toNumber(students);
    this.appBookings.updateStudentsList();
    this.validateClass();
  }

  updateStatus(status) {
    this.divingClass.status = status;
    this.validateClass();
  }

  handleChange(ev) {
    this.divingClass[ev.detail.name] = ev.detail.value;
    this.validateClass();
  }

  validateClass() {
    this.validClass =
      isString(this.divingClass.name) &&
      this.divingClass.numberOfStudents > 0 &&
      this.divingClass.location &&
      isString(this.divingClass.location.display_name) &&
      isString(this.divingClass.status) &&
      Object.keys(this.divingClass.schedule).length > 0;
    this.updateSlider();
  }

  async save() {
    await DivingClassesService.updateDivingClass(
      this.divingClassId,
      this.divingClass
    );
    return modalController.dismiss(false);
  }

  async cancel() {
    return modalController.dismiss(true);
  }

  render() {
    return (
      <Host>
        {this.selectedCourse && this.selectedCourse.photoURL ? (
          <ion-header>
            <app-item-cover item={this.selectedCourse} />
          </ion-header>
        ) : undefined}

        {this.selectedCourse ? (
          <ion-header>
            <ion-toolbar color='divingclass'>
              <ion-title>{this.divingClass.name}</ion-title>
            </ion-toolbar>
          </ion-header>
        ) : undefined}

        <app-header-segment-toolbar
          color='divingclass'
          swiper={this.slider}
          titles={this.titles}
        ></app-header-segment-toolbar>
        <ion-content class='slides'>
          <swiper-container class='slider-dive-class swiper'>
            <swiper-wrapper class='swiper-wrapper'>
              <swiper-slide class='swiper-slide'>
                <ion-list>
                  <ion-item>
                    <ion-select
                      label={TranslationService.getTransl(
                        "diving-course",
                        "Diving Course"
                      )}
                      id='dive-course-select'
                      interface='action-sheet'
                      onIonChange={(ev) => this.changeCourse(ev.detail.value)}
                      onIonFocus={() => (this.selectGotFocus = true)}
                      placeholder={TranslationService.getTransl(
                        "select",
                        "Select"
                      )}
                      value={this.selectedCourse}
                    ></ion-select>
                  </ion-item>
                  <app-form-item
                    label-tag='name'
                    label-text='Name'
                    value={this.divingClass.name}
                    name='name'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <ion-item>
                    <ion-select
                      label={TranslationService.getTransl(
                        "number-of-students",
                        "Number of Students"
                      )}
                      value={this.divingClass.numberOfStudents}
                      onIonChange={(ev) => this.updateStudents(ev.detail.value)}
                      interface='popover'
                    >
                      <ion-select-option value={1}>1</ion-select-option>
                      <ion-select-option value={2}>2</ion-select-option>
                      <ion-select-option value={3}>3</ion-select-option>
                      <ion-select-option value={4}>4</ion-select-option>
                      <ion-select-option value={5}>5</ion-select-option>
                      <ion-select-option value={6}>6</ion-select-option>
                      <ion-select-option value={7}>7</ion-select-option>
                      <ion-select-option value={8}>8</ion-select-option>
                      <ion-select-option value={9}>9</ion-select-option>
                      <ion-select-option value={10}>10</ion-select-option>
                      <ion-select-option value={11}>11</ion-select-option>
                      <ion-select-option value={12}>12</ion-select-option>
                      <ion-select-option value={13}>13</ion-select-option>
                      <ion-select-option value={14}>14</ion-select-option>
                      <ion-select-option value={15}>15</ion-select-option>
                    </ion-select>
                  </ion-item>
                  <app-form-item
                    label-tag='location'
                    label-text='Location'
                    value={this.addressText}
                    name='location'
                    input-type='text'
                    onFormItemChanged={(ev) =>
                      (this.addressText = ev.detail.value)
                    }
                    onFormLocationSelected={(ev) =>
                      this.selectLocation(ev.detail)
                    }
                    validator={["address"]}
                  ></app-form-item>
                  <ion-item>
                    <ion-select
                      label={TranslationService.getTransl("status", "Status")}
                      value={this.divingClass.status}
                      onIonChange={(ev) => this.updateStatus(ev.detail.value)}
                      interface='popover'
                    >
                      <ion-select-option value='active'>
                        {this.statusTitles.active}
                      </ion-select-option>
                      <ion-select-option value='closed'>
                        {this.statusTitles.closed}
                      </ion-select-option>
                      <ion-select-option value='cancelled'>
                        {this.statusTitles.cancelled}
                      </ion-select-option>
                    </ion-select>
                  </ion-item>
                  <app-form-item
                    label-tag='comments'
                    label-text='Comments'
                    value={this.divingClass.comments}
                    name='comments'
                    input-type='text'
                    textRows={4}
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                </ion-list>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <app-diving-class-schedule
                  divingClass={this.divingClass}
                  editable={true}
                  onUpdateEmit={() => this.validateClass()}
                />
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <app-users-list
                  item={this.divingClass}
                  editable
                  show={["owner", "divemaster", "instructor"]}
                />
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <app-dive-class-bookings
                  divingClass={this.divingClass}
                  divingClassId={this.divingClassId}
                  editable={true}
                />
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
        </ion-content>
        <app-modal-footer
          disableSave={!this.validClass}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
