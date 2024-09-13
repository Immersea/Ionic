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
import { TranslationService } from "../../../../../services/common/translations";

@Component({
  tag: "page-user-settings",
  styleUrl: "page-user-settings.scss",
})
export class PageUserSettings {
  @Element() el: HTMLElement;
  @State() userProfile: UserProfile;
  userSub$: Subscription;
  @State() titles = [
    { tag: "user-info", text: "My Info" },
    { tag: "dive-cards" },
    { tag: "user-confs", text: "My Dive Configurations" },
    { tag: "licences" },
    //{tag: "notifications"},
  ];
  segmentTitles: {
    configurations: string;
    tanks: string;
  };
  selectedSegment = "configurations";
  @State() slider: Swiper;
  @State() updateView = false;
  content: HTMLIonContentElement;

  componentWillLoad() {
    this.segmentTitles = {
      configurations: TranslationService.getTransl(
        "configurations",
        "Configurations"
      ),
      tanks: TranslationService.getTransl("tanks", "Tanks"),
    };
    this.userSub$ = UserService.userProfile$.subscribe(
      (userProfile: UserProfile) => {
        this.userProfile = new UserProfile(userProfile);
      }
    );

    this.updateView = !this.updateView;
  }

  async componentDidLoad() {
    this.setSliderHeight();
    //check if user is loaded or trigger local user
    if (!this.userProfile) {
      UserService.initLocalUser();
    }
    this.updateSlider();
  }

  segmentChartChanged(ev) {
    this.selectedSegment = ev.detail.value;
    this.updateSlider();
  }

  updateSlider() {
    this.updateView = !this.updateView;
    setTimeout(() => {
      //reset slider height to show address
      this.slider ? this.slider.update() : undefined;
    }, 100);
  }

  setSliderHeight() {
    this.slider = new Swiper(".slider-user-settings", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
    });
    //reset sliders height inside slider
    const slideContainers = Array.from(
      this.el.getElementsByClassName("slide-container")
    );
    slideContainers.map((container) => {
      container.setAttribute(
        "style",
        "height: " + slideHeight(this.userProfile) + "px"
      );
    });
  }

  disconnectedCallback() {
    this.userSub$.unsubscribe();
  }

  logScrollStart(ev) {
    this.content = ev.srcElement;
  }

  render() {
    return [
      this.userProfile
        ? [
            <ion-header class='cover-header'>
              <app-user-cover showUserDetails={false}></app-user-cover>
            </ion-header>,
            <app-header-segment-toolbar
              color={Environment.getAppColor()}
              swiper={this.slider}
              titles={this.titles}
            ></app-header-segment-toolbar>,
            <ion-content
              class='slides'
              scrollEvents={true}
              onIonScrollStart={(ev) => this.logScrollStart(ev)}
            >
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
              </ion-fab>
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
              </ion-fab>
              <swiper-container class='slider-user-settings swiper'>
                <swiper-wrapper class='swiper-wrapper'>
                  <swiper-slide class='swiper-slide'>
                    <app-user-cover showCover={false}></app-user-cover>
                    <ion-button
                      expand='block'
                      fill='solid'
                      color='danger'
                      onClick={() => AuthService.logout()}
                    >
                      <ion-icon slot='start' name='log-out'></ion-icon>
                      <my-transl tag='logout' text='Logout' isLabel></my-transl>
                    </ion-button>
                  </swiper-slide>
                  <swiper-slide class='swiper-slide'>
                    <app-user-cards
                      updateSlider={() => this.updateSlider()}
                    ></app-user-cards>
                  </swiper-slide>
                  <swiper-slide class='swiper-slide'>
                    <div class='ion-no-padding'>
                      <ion-row>
                        <ion-col>
                          <ion-segment
                            onIonChange={(ev) => this.segmentChartChanged(ev)}
                            color={Environment.getAppColor()}
                            mode='ios'
                            value={this.selectedSegment}
                          >
                            <ion-segment-button value='configurations'>
                              <ion-label>
                                {this.segmentTitles.configurations}
                              </ion-label>
                            </ion-segment-button>
                            <ion-segment-button value='tanks'>
                              <ion-label>{this.segmentTitles.tanks}</ion-label>
                            </ion-segment-button>
                          </ion-segment>
                        </ion-col>
                      </ion-row>
                    </div>
                    {this.selectedSegment == "configurations" ? (
                      <app-user-configurations></app-user-configurations>
                    ) : (
                      <app-user-tanks></app-user-tanks>
                    )}
                  </swiper-slide>
                  <swiper-slide class='swiper-slide'>
                    <app-user-licences></app-user-licences>
                  </swiper-slide>
                  {/**
                   * <swiper-slide class="swiper-slide">
                    <ion-content class="slide-container">
                      <app-user-manage-notifications></app-user-manage-notifications>
                    </ion-content>
                  </swiper-slide>
                   */}
                </swiper-wrapper>
              </swiper-container>
            </ion-content>,
          ]
        : undefined,
    ];
  }
}
