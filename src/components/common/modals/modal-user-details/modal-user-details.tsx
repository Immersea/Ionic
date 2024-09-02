import {Component, h, Prop, Host, State} from "@stencil/core";
import {DatabaseService} from "../../../../services/common/database";
import {UserPubicProfile} from "../../../../interfaces/common/user/user-public-profile";
import {modalController} from "@ionic/core";
import {USERPUBLICPROFILECOLLECTION} from "../../../../services/common/user";
import {SystemService} from "../../../../services/common/system";
import {SystemPreference} from "../../../../interfaces/common/system/system";

@Component({
  tag: "modal-user-details",
  styleUrl: "modal-user-details.scss",
})
export class ModalUserDetails {
  @Prop() userId: string;
  user: UserPubicProfile;
  @State() sysPref: SystemPreference;

  async componentWillLoad() {
    this.user = await DatabaseService.getDocument(
      USERPUBLICPROFILECOLLECTION,
      this.userId
    );
    this.sysPref = await SystemService.getSystemPreferences();
  }

  close() {
    return modalController.dismiss();
  }

  render() {
    return (
      <Host>
        <ion-content>
          <ion-fab vertical="top" horizontal="end" slot="fixed">
            <ion-fab-button size="small" onClick={() => this.close()}>
              <ion-icon name="close"></ion-icon>
            </ion-fab-button>
          </ion-fab>
          <app-item-cover item={this.user}></app-item-cover>
          <ion-grid>
            <ion-row>
              <ion-col>
                <h1 class="name">{this.user.displayName}</h1>
              </ion-col>
            </ion-row>
            {this.user.address ? (
              <ion-row>
                <ion-col>
                  <p class="info">
                    <ion-icon name="navigate-outline"></ion-icon>{" "}
                    {this.user.address.display_name}
                  </p>
                </ion-col>
              </ion-row>
            ) : undefined}
            {this.user.bio ? (
              <ion-row>
                <ion-col>
                  <ion-card class="info">
                    <ion-card-subtitle>
                      <my-transl tag="biography" text="Biography"></my-transl>
                    </ion-card-subtitle>
                    <ion-card-content>{this.user.bio}</ion-card-content>
                  </ion-card>
                </ion-col>
              </ion-row>
            ) : undefined}
            {this.user.email ? (
              <ion-item button href={"mailto:" + this.user.email}>
                <ion-icon slot="start" name="at-outline"></ion-icon>
                <ion-label>{this.user.email}</ion-label>
              </ion-item>
            ) : undefined}
            {this.user.website ? (
              <ion-item
                button
                href={"http://" + this.user.website}
                target="_blank"
              >
                <ion-icon slot="start" name="link-outline"></ion-icon>
                <ion-label>{this.user.website}</ion-label>
              </ion-item>
            ) : undefined}
            {this.user.facebook ? (
              <ion-item
                button
                href={"https://www.facebook.com/" + this.user.facebook}
                target="_blank"
              >
                <ion-icon slot="start" name="logo-facebook"></ion-icon>
                <ion-label>{this.user.facebook}</ion-label>
              </ion-item>
            ) : undefined}
            {this.user.instagram ? (
              <ion-item
                button
                href={"https://www.instagram.com/" + this.user.instagram}
                target="_blank"
              >
                <ion-icon slot="start" name="logo-instagram"></ion-icon>
                <ion-label>{this.user.instagram}</ion-label>
              </ion-item>
            ) : undefined}
            {this.user.twitter ? (
              <ion-item
                button
                href={"https://www.twitter.com/" + this.user.twitter}
                target="_blank"
              >
                <ion-icon slot="start" name="logo-twitter"></ion-icon>
                <ion-label>@{this.user.twitter}</ion-label>
              </ion-item>
            ) : undefined}
            {this.user.cards && this.user.cards.length > 0
              ? [
                  <ion-row>
                    <ion-col>
                      <h1 class="name">
                        <my-transl
                          tag="dive-cards"
                          text="Dive Cards"
                        ></my-transl>
                      </h1>
                    </ion-col>
                  </ion-row>,
                  <ion-row class="ion-text-start">
                    {this.user.cards.map((card) => (
                      <ion-col size-sm="12" size-md="6" size-lg="4">
                        <ion-card>
                          <ion-card-header>
                            <ion-item class="ion-no-padding" lines="none">
                              <ion-card-title>
                                {card.certificationId}
                              </ion-card-title>
                            </ion-item>
                            <ion-card-subtitle>
                              {card.agencyId}
                            </ion-card-subtitle>
                          </ion-card-header>
                        </ion-card>
                      </ion-col>
                    ))}
                  </ion-row>,
                ]
              : undefined}
          </ion-grid>
        </ion-content>
      </Host>
    );
  }
}
