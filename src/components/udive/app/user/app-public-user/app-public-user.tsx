import {Component, h, Prop, State} from "@stencil/core";
import {UserPubicProfile} from "../../../../../interfaces/common/user/user-public-profile";
import {UserService} from "../../../../../services/common/user";
import {SystemPreference} from "../../../../../interfaces/common/system/system";
import {SystemService} from "../../../../../services/common/system";

@Component({
  tag: "app-public-user",
  styleUrl: "app-public-user.scss",
})
export class AppPublicUser {
  @Prop() userId: string;
  @Prop() userProfile: UserPubicProfile;
  @State() sysPref: SystemPreference;

  async componentWillLoad() {
    if (this.userId) {
      this.userProfile = await UserService.getPublicProfileUserDetails(
        this.userId
      );
    }
    this.sysPref = await SystemService.getSystemPreferences();
  }
  render() {
    return [
      <ion-list>
        {this.userProfile.address ? (
          <ion-item>
            <ion-icon slot="start" name="home-outline"></ion-icon>
            <ion-label class="ion-text-wrap">
              {this.userProfile.address.display_name}
            </ion-label>
          </ion-item>
        ) : undefined}
        {this.userProfile.email ? (
          <ion-item button href={"mailto:" + this.userProfile.email}>
            <ion-icon slot="start" name="at-outline"></ion-icon>
            <ion-label>{this.userProfile.email}</ion-label>
          </ion-item>
        ) : undefined}
        {this.userProfile.website ? (
          <ion-item
            button
            href={"http://" + this.userProfile.website}
            target="_blank"
          >
            <ion-icon slot="start" name="link-outline"></ion-icon>
            <ion-label>{this.userProfile.website}</ion-label>
          </ion-item>
        ) : undefined}
        {this.userProfile.facebook ? (
          <ion-item
            button
            href={"https://www.facebook.com/" + this.userProfile.facebook}
            target="_blank"
          >
            <ion-icon slot="start" name="logo-facebook"></ion-icon>
            <ion-label>{this.userProfile.facebook}</ion-label>
          </ion-item>
        ) : undefined}
        {this.userProfile.instagram ? (
          <ion-item
            button
            href={"https://www.instagram.com/" + this.userProfile.instagram}
            target="_blank"
          >
            <ion-icon slot="start" name="logo-instagram"></ion-icon>
            <ion-label>{this.userProfile.instagram}</ion-label>
          </ion-item>
        ) : undefined}
        {this.userProfile.twitter ? (
          <ion-item
            button
            href={"https://www.twitter.com/" + this.userProfile.twitter}
            target="_blank"
          >
            <ion-icon slot="start" name="logo-twitter"></ion-icon>
            <ion-label>@{this.userProfile.twitter}</ion-label>
          </ion-item>
        ) : undefined}
        {this.userProfile.bio ? (
          <ion-item>
            <ion-label class="ion-text-wrap">
              <ion-text color="primary">
                <my-transl tag="biography" text="Biography" />
              </ion-text>
              <p>{this.userProfile.bio}</p>
            </ion-label>
          </ion-item>
        ) : undefined}
      </ion-list>,
      <ion-grid>
        <ion-row>
          {this.userProfile.cards.length > 0
            ? this.userProfile.cards.map((card) => (
                <ion-col size-sm="12" size-md="6" size-lg="4">
                  <ion-card>
                    {/*this.sysPref.divingAgencies[card.agencyId].certifications[
                      card.certificationId
                    ].coverURL ? (
                      <img
                        src={
                          this.sysPref.divingAgencies[card.agencyId]
                            .certifications[card.certificationId].coverURL
                        }
                      />
                    ) : undefined*/}
                    <ion-card-header>
                      <ion-card-title>{card.certificationId}</ion-card-title>
                      <ion-card-subtitle>{card.agencyId}</ion-card-subtitle>
                    </ion-card-header>
                  </ion-card>
                </ion-col>
              ))
            : undefined}
        </ion-row>
      </ion-grid>,
    ];
  }
}
