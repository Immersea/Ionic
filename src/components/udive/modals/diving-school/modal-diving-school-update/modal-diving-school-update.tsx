import { Component, h, Host, Prop, State, Element } from "@stencil/core";
import { DivingSchool } from "../../../../../interfaces/udive/diving-school/divingSchool";
import { modalController, popoverController } from "@ionic/core";
import { isNumber, isString, toLower, toNumber } from "lodash";
import { Subscription } from "rxjs";
import { UserService } from "../../../../../services/common/user";
import {
  DivingSchoolsService,
  DIVESCHOOLSSCOLLECTION,
} from "../../../../../services/udive/divingSchools";
import { UserProfile } from "../../../../../interfaces/common/user/user-profile";
import { mapHeight } from "../../../../../helpers/utils";
import Swiper from "swiper";

@Component({
  tag: "modal-diving-school-update",
  styleUrl: "modal-diving-school-update.scss",
})
export class ModalDivingSchoolUpdate {
  @Element() el: HTMLElement;
  @Prop() divingSchoolId: string = undefined;
  @State() divingSchool: DivingSchool;
  @State() updateView = true;
  @State() validDivingSchool = false;
  @State() schoolCourses: any[] = [];
  @State() tmpDivingSchoolId: string;
  @State() showDCId = false;
  divingCourses: {
    divingSchoolCourses: any[];
    divingSchoolCoursesSelect: any[];
  };
  @State() titles = [
    { tag: "map" },
    { tag: "position" },
    { tag: "information" },
    { tag: "diving-courses", text: "Diving Courses" },
    { tag: "team" },
  ];

  mapElement: HTMLAppMapElement;
  @State() slider: Swiper;
  selectCourseElement: HTMLIonSelectElement;
  draggableMarkerPosition: any;
  userProfile: UserProfile;
  userProfileSub$: Subscription;

  async componentWillLoad() {
    this.userProfileSub$ = UserService.userProfile$.subscribe(
      (userProfile: UserProfile) => {
        this.userProfile = new UserProfile(userProfile);
      }
    );
    await this.loadDivingSchool();
  }

  async loadDivingSchool() {
    if (this.divingSchoolId) {
      this.divingSchool = await DivingSchoolsService.getDivingSchool(
        this.divingSchoolId
      );
      this.draggableMarkerPosition = {
        lat: this.divingSchool.position.geopoint.latitude,
        lon: this.divingSchool.position.geopoint.longitude,
      };
    } else {
      this.divingSchool = new DivingSchool();
      this.divingSchool.users = {
        [UserService.userRoles.uid]: ["owner"],
      };
      this.draggableMarkerPosition = {};
    }
    this.loadDivingSchoolCourses();
  }

  async loadDivingSchoolCourses() {
    this.schoolCourses = [];
    //settimeout necessary to refresh cards
    setTimeout(async () => {
      this.divingCourses = await DivingSchoolsService.loadDivingSchoolCourses(
        this.divingSchool
      );
      this.divingCourses.divingSchoolCourses.forEach((course) => {
        this.schoolCourses.push(course);
      });
      this.updateView = !this.updateView;
    }, 10);
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-diving-school", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
    });
    //reset map height inside slide
    await customElements.whenDefined("app-map");
    this.mapElement = this.el.querySelector("#map") as any;
    const mapContainer = this.el.querySelector("#map-container");
    mapContainer.setAttribute(
      "style",
      "height: " + mapHeight(this.divingSchool, true) + "px"
    ); //-cover photo -slider  - footer

    this.mapElement["mapLoaded"]().then(() => {
      this.mapElement.triggerMapResize();
    });
    this.mapElement.triggerMapResize();
    this.validateDiveSchool();
  }

  disconnectedCallback() {
    this.userProfileSub$.unsubscribe();
  }

  updateLocation(ev) {
    this.draggableMarkerPosition = {
      lat: toNumber(ev.detail.lat),
      lon: toNumber(ev.detail.lon),
    };
    this.divingSchool.setPosition(ev.detail.lat, ev.detail.lon);
    this.validateDiveSchool();
  }

  updateAddress(ev) {
    this.divingSchool.setAddress(ev.detail);
  }

  handleChange(ev) {
    if (
      ev.detail.name == "facebook" ||
      ev.detail.name == "instagram" ||
      ev.detail.name == "twitter" ||
      ev.detail.name == "website" ||
      ev.detail.name == "email"
    ) {
      const val = toLower(ev.detail.value).split(" ").join("-");
      this.divingSchool[ev.detail.name] = val;
    } else if (ev.detail.name == "id") {
      this.setTmpId(ev.detail.value);
    } else {
      this.divingSchool[ev.detail.name] = ev.detail.value;
    }
    this.updateView = !this.updateView;
    this.validateDiveSchool();
  }

  setTmpId(value) {
    this.tmpDivingSchoolId = toLower(value)
      .trim()
      .split(" ")
      .join("-")
      .substring(0, 16);
  }
  uniqueIdValid(ev) {
    if (ev.detail) {
      this.divingSchoolId = this.tmpDivingSchoolId;
    } else {
      this.divingSchoolId = null;
    }
  }

  updateImageUrls(ev) {
    const imageType = ev.detail.type;
    const url = ev.detail.url;
    if (imageType == "photo") {
      this.divingSchool.photoURL = url;
    } else {
      this.divingSchool.coverURL = url;
    }
  }

  validateDiveSchool() {
    this.validDivingSchool =
      isNumber(this.divingSchool.position.geopoint.latitude) &&
      isNumber(this.divingSchool.position.geopoint.longitude) &&
      isString(this.divingSchool.displayName) &&
      isString(this.divingSchool.description);
  }

  async openAddDiveCourse() {
    const popover = await popoverController.create({
      component: "popover-search-diving-course",
      translucent: true,
    });
    popover.onDidDismiss().then((ev) => {
      const course = ev.data;
      if (course && course.certificationId) {
        this.divingSchool.divingCourses.push(course);
        this.loadDivingSchoolCourses();
      }
    });
    popover.present();
  }

  removeDiveCourse(removeCourse) {
    const index = this.divingSchool.divingCourses.findIndex(
      (course) =>
        course.agencyId === removeCourse.agencyId &&
        course.certificationId === removeCourse.certificationId
    );
    this.divingSchool.divingCourses.splice(index, 1);
    this.loadDivingSchoolCourses();
  }

  async save() {
    await DivingSchoolsService.updateDivingSchool(
      this.divingSchoolId,
      this.divingSchool,
      this.userProfile.uid
    );
    return modalController.dismiss();
  }

  async cancel() {
    return modalController.dismiss();
  }

  render() {
    return (
      <Host>
        <ion-header>
          <app-upload-cover
            item={{
              collection: DIVESCHOOLSSCOLLECTION,
              id: this.divingSchoolId,
              photoURL: this.divingSchool.photoURL,
              coverURL: this.divingSchool.coverURL,
            }}
            onCoverUploaded={(ev) => this.updateImageUrls(ev)}
          ></app-upload-cover>
        </ion-header>
        <app-header-segment-toolbar
          color='divingschool'
          swiper={this.slider}
          titles={this.titles}
        ></app-header-segment-toolbar>
        <ion-content class='slides'>
          <swiper-container class='slider-diving-school swiper'>
            <swiper-wrapper class='swiper-wrapper'>
              <swiper-slide class='swiper-slide'>
                <div id='map-container'>
                  <app-map
                    id='map'
                    pageId='dive-sites'
                    draggableMarkerPosition={this.draggableMarkerPosition}
                    onDragMarkerEnd={(ev) => this.updateLocation(ev)}
                  ></app-map>
                </div>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <app-coordinates
                  coordinates={this.draggableMarkerPosition}
                  onCoordinatesEmit={(ev) => this.updateLocation(ev)}
                  onAddressEmit={(ev) => this.updateAddress(ev)}
                ></app-coordinates>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <ion-list class='ion-no-padding'>
                  <ion-list-header>
                    <my-transl
                      tag='general-information'
                      text='General Information'
                      isLabel
                    />
                  </ion-list-header>
                  <app-form-item
                    label-tag='name'
                    label-text='Name'
                    value={this.divingSchool.displayName}
                    name='displayName'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  {this.showDCId ? (
                    <app-form-item
                      label-tag='unique-id'
                      label-text='Unique ID'
                      value={this.tmpDivingSchoolId}
                      name='id'
                      input-type='text'
                      onFormItemChanged={(ev) => this.handleChange(ev)}
                      onIsValid={(ev) => this.uniqueIdValid(ev)}
                      validator={[
                        "required",
                        {
                          name: "uniqueid",
                          options: { type: DIVESCHOOLSSCOLLECTION },
                        },
                      ]}
                    ></app-form-item>
                  ) : undefined}
                  <app-form-item
                    label-tag='description'
                    label-text='Description'
                    value={this.divingSchool.description}
                    name='description'
                    textRows={10}
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag='phone'
                    label-text='Phone'
                    value={this.divingSchool.phoneNumber}
                    name='phoneNumber'
                    input-type='tel'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  <app-form-item
                    label-tag='email'
                    label-text='Email'
                    value={this.divingSchool.email}
                    name='email'
                    input-type='email'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["email"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag='website'
                    label-text='Website'
                    value={this.divingSchool.website}
                    name='website'
                    input-type='url'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  {this.divingSchool.website ? (
                    <a
                      class='ion-padding-start'
                      href={"http://" + this.divingSchool.website}
                      target='_blank'
                    >
                      {"http://" + this.divingSchool.website}
                    </a>
                  ) : undefined}
                  <app-form-item
                    label-tag='facebook-id'
                    label-text='Facebook ID'
                    value={this.divingSchool.facebook}
                    name='facebook'
                    input-type='url'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  {this.divingSchool.facebook ? (
                    <a
                      class='ion-padding-start'
                      href={
                        "https://www.facebook.com/" + this.divingSchool.facebook
                      }
                      target='_blank'
                    >
                      {"https://www.facebook.com/" + this.divingSchool.facebook}
                    </a>
                  ) : undefined}
                  <app-form-item
                    label-tag='instagram-id'
                    label-text='Instagram ID'
                    value={this.divingSchool.instagram}
                    name='instagram'
                    input-type='url'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  {this.divingSchool.instagram ? (
                    <a
                      class='ion-padding-start'
                      href={
                        "https://www.instagram.com/" +
                        this.divingSchool.instagram
                      }
                      target='_blank'
                    >
                      {"https://www.instagram.com/" +
                        this.divingSchool.instagram}
                    </a>
                  ) : undefined}
                  <app-form-item
                    label-tag='twitter id'
                    label-text='Twitter ID'
                    value={this.divingSchool.twitter}
                    name='twitter'
                    input-type='url'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  {this.divingSchool.twitter ? (
                    <a
                      class='ion-padding-start'
                      href={
                        "https://www.twitter.com/" + this.divingSchool.twitter
                      }
                      target='_blank'
                    >
                      {"https://www.twitter.com/" + this.divingSchool.twitter}
                    </a>
                  ) : undefined}
                </ion-list>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <ion-grid>
                  <ion-row class='ion-text-start'>
                    {this.schoolCourses.map((course) => (
                      <ion-col size-sm='12' size-md='6' size-lg='4'>
                        <app-dive-course-card
                          divingCourse={course}
                          edit={true}
                          onRemoveEmit={(ev) =>
                            this.removeDiveCourse(ev.detail)
                          }
                        />
                      </ion-col>
                    ))}
                    <ion-col size-sm='12' size-md='6' size-lg='4'>
                      <ion-card onClick={() => this.openAddDiveCourse()}>
                        <ion-card-content class='ion-text-center'>
                          <ion-icon
                            name='add-circle-outline'
                            style={{ fontSize: "130px" }}
                          ></ion-icon>
                        </ion-card-content>
                      </ion-card>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <app-users-list
                  item={this.divingSchool}
                  editable
                  show={["owner", "editor", "instructor"]}
                />
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
        </ion-content>
        <app-modal-footer
          disableSave={!this.validDivingSchool}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
