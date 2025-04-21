import { Component, h, Prop, State, Element, Method } from "@stencil/core";
import { TranslationService } from "../../../../../services/common/translations";
import {
  DivingClass,
  Student,
} from "../../../../../interfaces/udive/diving-class/divingClass";
import { UserService } from "../../../../../services/common/user";
import { DivingClassesService } from "../../../../../services/udive/divingClasses";
import { Subscription } from "rxjs";
import { alertController } from "@ionic/core";
import { toNumber } from "lodash";
import { Environment } from "../../../../../global/env";

@Component({
  tag: "app-dive-class-bookings",
  styleUrl: "app-dive-class-bookings.scss",
})
export class AppDiveClassBookings {
  @Element() el: HTMLElement;
  @Prop({ mutable: true }) divingClass: DivingClass;
  @Prop() divingClassId: string;
  @Prop() editable = false;
  @State() isEditing = false;
  @State() segment: number = 0;
  @State() studentsList: any[];
  availableSpots = [];
  @State() waitingRequest = false;
  @State() updateView = false;
  segmentTitles: {
    cancelled: string;
    applied: string;
    registered: string;
    denied: string;
  };
  @State() userBooking: Student;
  userSub: Subscription;
  userId: string;
  usersList: any[];
  loogBookButton: boolean;

  @Method()
  async updateStudentsList() {
    this.studentsList = [];
    this.availableSpots = [];
    this.usersList = [];
    let students = this.divingClass.students;
    for (let student of students) {
      let listItem = {
        ...student,
        user: await UserService.getMapDataUserDetails(student.uid),
      };
      //show all students only to organiser
      if (this.editable) {
        this.studentsList.push(listItem);
      } else if (
        listItem.status == "applied" ||
        listItem.status == "registered"
      ) {
        this.studentsList.push(listItem);
      }

      if (this.userId && student.uid === this.userId) {
        this.userBooking = student;
      }
    }
    if (this.divingClass.status == "active") {
      let registeredStudents = 0;
      this.divingClass.students.map((student) => {
        if (student.status == "registered") {
          registeredStudents++;
        }
      });
      for (
        let index = 0;
        index < this.divingClass.numberOfStudents - registeredStudents;
        index++
      ) {
        this.availableSpots.push(0);
      }
    }

    this.updateView = !this.updateView;
    return true;
  }

  componentWillLoad() {
    this.userId =
      UserService.userProfile && UserService.userProfile.uid
        ? UserService.userProfile.uid
        : null;
    if (this.userId) {
      this.updateStudentsList();
    } else {
      this.userSub = UserService.userProfile$.subscribe((user) => {
        this.userId = user && user.uid ? user.uid : null;
        this.updateStudentsList();
      });
    }

    this.segmentTitles = {
      cancelled: TranslationService.getTransl("cancelled", "Cancelled"),
      applied: TranslationService.getTransl("applied", "Applied"),
      registered: TranslationService.getTransl("registered", "Registered"),
      denied: TranslationService.getTransl("denied", "Denied"),
    };
  }

  disconnectedCallback() {
    this.userSub ? this.userSub.unsubscribe() : undefined;
  }

  segmentChanged(ev) {
    if (ev.detail.value) {
      this.segment = toNumber(ev.detail.value);
    }
  }

  async applyToClass() {
    const alert = await alertController.create({
      header: TranslationService.getTransl(
        "apply-to-class",
        "Apply to this class"
      ),
      message: TranslationService.getTransl(
        "apply-to-class-message",
        "Please check first with the instructor eventual preconditions to apply to this class. Are you sure?"
      ),
      buttons: [
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: async () => {
            this.userBooking = {
              uid: this.userId,
              status: "applied",
              evaluations: [],
            };
            this.saveBooking(this.userBooking);
          },
        },
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          role: "cancel",
        },
      ],
    });
    alert.present();
  }

  async saveBooking(booking) {
    try {
      this.waitingRequest = true;
      const bookings = await DivingClassesService.sendBookingRequest(
        this.divingClassId,
        booking.uid,
        booking.status,
        booking.evaluations
      );
      this.waitingRequest = false;
      this.divingClass.students = bookings;
      this.updateStudentsList();
    } catch (error) {
      this.waitingRequest = false;
    }
  }

  updateBooking(i, ev) {
    const search = this.studentsList[i];
    const item = this.divingClass.students.find(
      (student) => student.uid === search.uid
    );
    item.status = ev.detail.value;
  }

  editStudents() {
    this.isEditing = true;
  }

  saveStudents() {
    this.isEditing = false;
    this.updateStudentsList();
  }

  render() {
    return (
      <ion-list>
        <ion-item lines='none'>
          <ion-label>
            {TranslationService.getTransl(
              "max-participants",
              "Max xxx participants",
              { xxx: this.divingClass.numberOfStudents }
            )}
          </ion-label>
          {this.editable &&
          this.divingClass.students &&
          this.divingClass.students.length > 0 ? (
            !this.isEditing ? (
              <ion-button slot='end' onClick={() => this.editStudents()}>
                <my-transl tag='edit' text='Edit' />
              </ion-button>
            ) : (
              [
                <ion-button slot='end' onClick={() => this.saveStudents()}>
                  <my-transl tag='save' text='Save' />
                </ion-button>,
              ]
            )
          ) : undefined}
        </ion-item>
        {!this.editable &&
        !this.waitingRequest &&
        this.divingClass.status == "active" &&
        (!this.userBooking ||
          (this.userBooking && this.userBooking.status == null)) ? (
          <ion-button expand='block' onClick={() => this.applyToClass()}>
            <my-transl tag='apply-to-class' text='Apply to this class' />
          </ion-button>
        ) : undefined}
        {this.userBooking &&
        (this.userBooking.status == "cancelled" ||
          this.userBooking.status == "denied") ? (
          <ion-button expand='block' color='warning'>
            <my-transl
              tag={this.userBooking.status}
              text={this.userBooking.status}
            />
          </ion-button>
        ) : undefined}
        {this.waitingRequest ? (
          <app-skeletons skeleton='diveTripBooking' />
        ) : undefined}
        {this.studentsList.map((student, k) =>
          student.uid == this.userId && this.waitingRequest ? (
            <app-skeletons skeleton='diveTripBooking' />
          ) : (
            <ion-item>
              {!this.isEditing && student.user.photoURL ? (
                <ion-avatar slot='start'>
                  <ion-img src={student.user.photoURL} />
                </ion-avatar>
              ) : undefined}
              <ion-label>{student.user.displayName}</ion-label>
              {!this.isEditing ? (
                <ion-note slot='end'>
                  {TranslationService.getTransl(student.status, student.status)}
                </ion-note>
              ) : (
                <ion-segment
                  style={{
                    maxWidth: "40%",
                    marginLeft: "15%",
                  }}
                  slot='end'
                  mode='ios'
                  color={Environment.getAppColor()}
                  onIonChange={(ev) => this.updateBooking(k, ev)}
                  value={student.status}
                >
                  <ion-segment-button value='cancelled'>
                    <my-transl tag='cancelled' text='Cancelled' />
                  </ion-segment-button>
                  <ion-segment-button value='applied'>
                    <my-transl tag='applied' text='Applied' />
                  </ion-segment-button>
                  <ion-segment-button value='registered'>
                    <my-transl tag='registered' text='Registered' />
                  </ion-segment-button>
                  <ion-segment-button value='denied'>
                    <my-transl tag='denied' text='Denied' />
                  </ion-segment-button>
                </ion-segment>
              )}
            </ion-item>
          )
        )}
        {this.availableSpots.map(() => (
          <ion-item>
            <ion-icon slot='start' name='person-add-outline'></ion-icon>
            <ion-label>
              <my-transl tag='available' text='Available' />
            </ion-label>
          </ion-item>
        ))}
      </ion-list>
    );
  }
}
