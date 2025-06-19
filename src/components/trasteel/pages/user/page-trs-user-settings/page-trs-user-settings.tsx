import { Component, h, State, Element } from "@stencil/core";
import { Subscription } from "rxjs";
import { UserService } from "../../../../../services/common/user";
import { AuthService } from "../../../../../services/common/auth";
import { UserProfile } from "../../../../../interfaces/common/user/user-profile";
import {
  fabButtonTopMarginString,
  slideHeight,
} from "../../../../../helpers/utils";
import { Environment } from "../../../../../global/env";
import Swiper from "swiper";
import {
  SHAPESCOLLECTION,
  ShapesService,
} from "../../../../../services/trasteel/refractories/shapes";
import { TrasteelFilterService } from "../../../../../services/trasteel/common/trs-db-filter";
import {
  DATASHEETSCOLLECTION,
  DatasheetsService,
} from "../../../../../services/trasteel/refractories/datasheets";
import {
  PROJECTSCOLLECTION,
  ProjectsService,
} from "../../../../../services/trasteel/refractories/projects";
import { UserRoles } from "../../../../../components";
import { TrasteelService } from "../../../../../services/trasteel/common/services";

@Component({
  tag: "page-trs-user-settings",
  styleUrl: "page-trs-user-settings.scss",
})
export class PageTrsUserSettings {
  @Element() el: HTMLElement;
  @State() userProfile: UserProfile;
  @State() userRoles: UserRoles;
  userSub$: Subscription;
  titles = [
    { tag: "user-info", text: "My Info" },
    { tag: "admin", text: "Administration" },
  ];
  @State() slider: Swiper;
  @State() updateView = false;
  content: HTMLIonContentElement;

  componentWillLoad() {
    this.userSub$ = UserService.userProfile$.subscribe(
      (userProfile: UserProfile) => {
        this.userProfile = new UserProfile(userProfile);
        this.userRoles = UserService.userRoles;
      }
    );
  }

  async componentDidLoad() {
    this.setSliderHeight();
    //check if user is loaded or trigger local user
    if (!this.userProfile) {
      UserService.initLocalUser();
    }
    this.updateSlider();
  }

  setSliderHeight() {
    this.slider = new Swiper(".slider-user-settings", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
    });
    //reset sliders height inside slider
    if (this.userProfile.photoURL || this.userProfile.coverURL) {
      const slideContainers = Array.from(
        this.el.getElementsByClassName("slide-container")
      );
      slideContainers.map((container) => {
        container.setAttribute(
          "style",
          "height: " + (slideHeight(this.userProfile) - 190) + "px"
        );
      });
    }
  }

  disconnectedCallback() {
    this.userSub$.unsubscribe();
  }

  updateSlider() {
    this.updateView = !this.updateView;
    //wait for view to update and then reset slider height
    setTimeout(() => {
      this.slider ? this.slider.update() : undefined;
    }, 100);
    this.scrollToTop();
  }

  scrollToTop() {
    this.content ? this.content.scrollToTop() : undefined;
  }

  logScrollStart(ev) {
    this.content = ev.srcElement;
  }

  checkShapesMapData() {
    ShapesService.checkMapData();
  }

  checkProjectsMapData() {
    ProjectsService.checkMapData();
  }

  checkDatasheetsMapData() {
    DatasheetsService.checkMapData();
  }

  render() {
    return [
      this.userProfile
        ? [
            this.userProfile.coverURL || this.userProfile.photoURL ? (
              <ion-header class='cover'>
                <app-user-cover showUserDetails={false}></app-user-cover>
              </ion-header>
            ) : (
              <app-navbar
                color={Environment.getAppColor()}
                tag='settings'
                text='Settings'
              ></app-navbar>
            ),
            TrasteelService.isRefraDBSuperAdmin() ? (
              <app-header-segment-toolbar
                color={Environment.getAppColor()}
                swiper={this.slider}
                titles={this.titles}
                class='nopaddingtop'
              ></app-header-segment-toolbar>
            ) : undefined,
            <ion-content
              class='slides'
              scrollEvents={true}
              onIonScrollStart={(ev) => this.logScrollStart(ev)}
            >
              {this.userProfile.coverURL || this.userProfile.photoURL
                ? [
                    <ion-fab
                      vertical='top'
                      horizontal='start'
                      slot='fixed'
                      style={{
                        marginTop:
                          "calc(env(safe-area-inset-top) + " +
                          fabButtonTopMarginString(1) +
                          ")",
                      }}
                    >
                      <ion-menu-toggle>
                        <ion-fab-button color='light'>
                          <ion-icon name='menu-outline' />
                        </ion-fab-button>
                      </ion-menu-toggle>
                    </ion-fab>,
                    <ion-fab
                      vertical='top'
                      horizontal='end'
                      slot='fixed'
                      style={{
                        marginTop:
                          "calc(env(safe-area-inset-top) + " +
                          fabButtonTopMarginString(1) +
                          ")",
                      }}
                    >
                      <ion-fab-button
                        color='light'
                        onClick={() => UserService.presentUserUpdate()}
                      >
                        <ion-icon name='create-outline' />
                      </ion-fab-button>
                    </ion-fab>,
                  ]
                : undefined}
              <swiper-container class='slider-user-settings swiper'>
                <swiper-wrapper class='swiper-wrapper'>
                  <swiper-slide class='swiper-slide'>
                    <app-user-cover showCover={false}></app-user-cover>
                    <ion-footer class='ion-no-border'>
                      <ion-toolbar>
                        <ion-button
                          expand='block'
                          fill='solid'
                          color='danger'
                          onClick={() => AuthService.logout()}
                        >
                          <ion-icon slot='start' name='log-out'></ion-icon>
                          <my-transl
                            tag='logout'
                            text='Logout'
                            isLabel
                          ></my-transl>
                        </ion-button>
                      </ion-toolbar>
                    </ion-footer>
                  </swiper-slide>
                  {TrasteelService.isRefraDBSuperAdmin() ? (
                    <swiper-slide class='swiper-slide'>
                      <ion-list>
                        {this.userRoles.isSuperAdmin()
                          ? [
                              <ion-item-divider>
                                <ion-label>SuperAdmin</ion-label>
                              </ion-item-divider>,
                              <ion-item
                                button
                                onClick={() => this.checkShapesMapData()}
                              >
                                <ion-label>Check Shapes MapData</ion-label>
                              </ion-item>,
                              <ion-item
                                button
                                onClick={() => this.checkDatasheetsMapData()}
                              >
                                <ion-label>Check Datasheets MapData</ion-label>
                              </ion-item>,
                              <ion-item
                                button
                                onClick={() => this.checkProjectsMapData()}
                              >
                                <ion-label>Check Projects MapData</ion-label>
                              </ion-item>,
                            ]
                          : undefined}
                        <ion-item-divider>
                          <ion-label>Shapes</ion-label>
                        </ion-item-divider>
                        <ion-item
                          button
                          onClick={() => ShapesService.editShapeTypes()}
                        >
                          <ion-icon
                            name={
                              TrasteelFilterService.getMapDocs(SHAPESCOLLECTION)
                                .icon.name
                            }
                            slot='start'
                          />
                          <ion-label>Edit Types</ion-label>
                        </ion-item>
                        <ion-item-divider>
                          <ion-label>Datasheets</ion-label>
                        </ion-item-divider>
                        <ion-item
                          button
                          onClick={() =>
                            DatasheetsService.editDatasheetSettings(
                              "majorfamily"
                            )
                          }
                        >
                          <ion-icon
                            name={
                              TrasteelFilterService.getMapDocs(
                                DATASHEETSCOLLECTION
                              ).icon.name
                            }
                            slot='start'
                          />
                          <ion-label>Edit Major Families</ion-label>
                        </ion-item>
                        <ion-item
                          button
                          onClick={() =>
                            DatasheetsService.editDatasheetSettings("family")
                          }
                        >
                          <ion-icon
                            name={
                              TrasteelFilterService.getMapDocs(
                                DATASHEETSCOLLECTION
                              ).icon.name
                            }
                            slot='start'
                          />
                          <ion-label>Edit Families</ion-label>
                        </ion-item>
                        <ion-item
                          button
                          onClick={() =>
                            DatasheetsService.editDatasheetSettings("category")
                          }
                        >
                          <ion-icon
                            name={
                              TrasteelFilterService.getMapDocs(
                                DATASHEETSCOLLECTION
                              ).icon.name
                            }
                            slot='start'
                          />
                          <ion-label>Edit Categories</ion-label>
                        </ion-item>
                        <ion-item
                          button
                          onClick={() =>
                            DatasheetsService.editDatasheetSettings(
                              "propertyType"
                            )
                          }
                        >
                          <ion-icon
                            name={
                              TrasteelFilterService.getMapDocs(
                                DATASHEETSCOLLECTION
                              ).icon.name
                            }
                            slot='start'
                          />
                          <ion-label>Edit Property Types</ion-label>
                        </ion-item>
                        <ion-item
                          button
                          onClick={() =>
                            DatasheetsService.editDatasheetSettings(
                              "propertyName"
                            )
                          }
                        >
                          <ion-icon
                            name={
                              TrasteelFilterService.getMapDocs(
                                DATASHEETSCOLLECTION
                              ).icon.name
                            }
                            slot='start'
                          />
                          <ion-label>Edit Property Names</ion-label>
                        </ion-item>
                        <ion-item
                          button
                          onClick={() =>
                            DatasheetsService.editDatasheetSettings(
                              "qualityColorCode"
                            )
                          }
                        >
                          <ion-icon
                            name={
                              TrasteelFilterService.getMapDocs(
                                DATASHEETSCOLLECTION
                              ).icon.name
                            }
                            slot='start'
                          />
                          <ion-label>Edit Quality Color Codes</ion-label>
                        </ion-item>
                        <ion-item-divider>
                          <ion-label>Projects</ion-label>
                        </ion-item-divider>
                        <ion-item
                          button
                          onClick={() =>
                            ProjectsService.editProjectSettings(
                              "bricksAllocationArea"
                            )
                          }
                        >
                          <ion-icon
                            name={
                              TrasteelFilterService.getMapDocs(
                                PROJECTSCOLLECTION
                              ).icon.name
                            }
                            slot='start'
                          />
                          <ion-label>Edit Bricks Allocation Areas</ion-label>
                        </ion-item>
                        <ion-item
                          button
                          onClick={() =>
                            ProjectsService.editProjectSettings(
                              "applicationUnit"
                            )
                          }
                        >
                          <ion-icon
                            name={
                              TrasteelFilterService.getMapDocs(
                                PROJECTSCOLLECTION
                              ).icon.name
                            }
                            slot='start'
                          />
                          <ion-label>Edit Application Units</ion-label>
                        </ion-item>
                        <ion-item
                          button
                          onClick={() =>
                            ProjectsService.editProjectSettings("quantityUnit")
                          }
                        >
                          <ion-icon
                            name={
                              TrasteelFilterService.getMapDocs(
                                PROJECTSCOLLECTION
                              ).icon.name
                            }
                            slot='start'
                          />
                          <ion-label>Edit Quantity Units</ion-label>
                        </ion-item>
                      </ion-list>
                    </swiper-slide>
                  ) : undefined}
                </swiper-wrapper>
              </swiper-container>
            </ion-content>,
          ]
        : undefined,
    ];
  }
}
