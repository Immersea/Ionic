import { Component, h, Prop, Host, State } from "@stencil/core";
import { Subscription } from "rxjs";
import { UserService } from "../../../../../services/common/user";
import { UserProfile } from "../../../../../interfaces/common/user/user-profile";
import { UserSettings } from "../../../../../interfaces/udive/user/user-settings";
import { Environment } from "../../../../../global/env";
import { AuthService } from "../../../../../services/common/auth";

@Component({
  tag: "app-user-cover",
  styleUrl: "app-user-cover.scss",
})
export class AppUserCover {
  @State() userProfile: UserProfile;
  @State() userSettings: UserSettings;
  userProfileSub$: Subscription;
  userSettingsSub$: Subscription;
  @Prop() tmbPosition?: string;
  @Prop() showCover?: boolean = true;
  @Prop() showUserDetails?: boolean = true;
  @State() updateView = false;

  componentWillLoad() {
    if (!this.userProfile) {
      this.userProfileSub$ = UserService.userProfile$.subscribe(
        (userProfile: UserProfile) => {
          this.userProfile = new UserProfile(userProfile);
        }
      );
      this.userSettingsSub$ = UserService.userSettings$.subscribe(
        (userSettings: UserSettings) => {
          this.userSettings = new UserSettings(userSettings);
        }
      );
    }
  }

  componentDidLoad() {
    //check if user is loaded or trigger local user
    if (!this.userProfile) {
      UserService.initLocalUser();
    }
  }

  disconnectedCallback() {
    this.userProfileSub$ ? this.userProfileSub$.unsubscribe() : undefined;
    this.userSettingsSub$ ? this.userSettingsSub$.unsubscribe() : undefined;
  }

  render() {
    return (
      <Host>
        {this.showCover && this.userProfile && this.userProfile.uid ? (
          [
            <div
              class='cover-main'
              style={{
                backgroundImage: this.userProfile.coverURL
                  ? "url(" + this.userProfile.coverURL + ")"
                  : "url('./assets/images/friendship2SM.jpg')",
              }}
            >
              <slot />
            </div>,
            <ion-thumbnail
              style={{
                marginLeft: this.tmbPosition == "left" ? "10%" : "auto",
                marginRight: this.tmbPosition == "right" ? "10%" : "auto",
              }}
            >
              <img
                src={
                  this.userProfile.photoURL
                    ? this.userProfile.photoURL
                    : "assets/images/avatar.png"
                }
                alt={this.userProfile.displayName}
              />
            </ion-thumbnail>,
          ]
        ) : (
          <div
            class='cover-main'
            style={{
              backgroundImage: "url('./assets/images/friendship2SM.jpg')",
            }}
          >
            <slot />
          </div>
        )}
        {this.showUserDetails && this.userProfile && this.userProfile.uid ? (
          <div>
            <ion-row>
              <ion-col>
                <h1 class='name'>{this.userProfile.displayName}</h1>
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col>
                <p class='info'>
                  <ion-icon name='mail'></ion-icon> {this.userProfile.email}
                </p>
              </ion-col>
            </ion-row>
            {this.userProfile.address ? (
              <ion-row>
                <ion-col>
                  <p class='info'>
                    <ion-icon name='navigate-outline'></ion-icon>{" "}
                    {this.userProfile.address.display_name}
                  </p>
                </ion-col>
              </ion-row>
            ) : undefined}
            {this.userSettings
              ? [
                  !Environment.isTrasteel() ? (
                    <ion-row>
                      <ion-col>
                        <p class='info'>
                          <my-transl tag='units' text='Units' />:{" "}
                          {this.userSettings.settings.units}
                        </p>
                      </ion-col>
                    </ion-row>
                  ) : undefined,
                  <ion-row>
                    <ion-col>
                      <app-language-picker
                        class='info'
                        selectedLangCode={this.userSettings.getLanguage()}
                      />
                    </ion-col>
                  </ion-row>,
                ]
              : undefined}
            {this.userProfile.bio ? (
              <ion-row>
                <ion-col>
                  <ion-card class='info'>
                    <ion-card-subtitle>
                      <my-transl tag='biography' text='Biography'></my-transl>
                    </ion-card-subtitle>
                    <ion-card-content>{this.userProfile.bio}</ion-card-content>
                  </ion-card>
                </ion-col>
              </ion-row>
            ) : undefined}
            <ion-row>
              <ion-col>
                <ion-button
                  expand='block'
                  color={Environment.getAppColor()}
                  onClick={() => UserService.presentUserUpdate()}
                >
                  <ion-icon name='create' slot='start'></ion-icon>
                  <ion-label>
                    <my-transl tag='edit' text='Edit' />
                  </ion-label>
                </ion-button>
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col class='ion-text-right ion-padding-end'>
                <a onClick={() => AuthService.deleteUser()}>
                  <my-transl
                    tag='delete-account'
                    text='Delete Account'
                  ></my-transl>
                </a>
              </ion-col>
            </ion-row>
          </div>
        ) : undefined}
      </Host>
    );
  }
}
