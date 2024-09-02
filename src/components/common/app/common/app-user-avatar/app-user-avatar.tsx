import { Component, Element, h, Prop, State } from "@stencil/core";
import { Subscription } from "rxjs";
import { UserProfile } from "../../../../../interfaces/common/user/user-profile";
import { UserService } from "../../../../../services/common/user";

@Component({
  tag: "app-user-avatar",
  styleUrl: "app-user-avatar.scss",
})
export class AppUserAvatar {
  @Element() el: HTMLElement;
  @Prop() size = 0;
  @State() userProfile: UserProfile;
  userProfileSub: Subscription;

  async disconnectedCallback() {
    this.userProfileSub.unsubscribe();
  }

  componentWillLoad() {
    this.userProfileSub = UserService.userProfile$.subscribe((profile) => {
      this.userProfile = profile;
    });
    if (this.size > 0) {
      this.el.style.width = this.size + "px";
      this.el.style.height = this.size + "px";
    }
  }

  render() {
    return this.userProfile && this.userProfile.uid ? (
      UserService.userProfile.photoURL ? (
        <img
          style={{ borderRadius: "50%" }}
          src={UserService.userProfile.photoURL}
        />
      ) : (
        <ion-button icon-only>
          <ion-icon name='person-circle'></ion-icon>
        </ion-button>
      )
    ) : (
      <ion-button icon-only>
        <ion-icon name='log-in'></ion-icon>
      </ion-button>
    );
  }
}
