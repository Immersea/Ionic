import { menuController } from "@ionic/core";
import { Component, h, Host, State } from "@stencil/core";
import { Subscription } from "rxjs";
import { UserRoles } from "../../../../interfaces/common/user/user-roles";
import { AuthService } from "../../../../services/common/auth";
import { RouterService } from "../../../../services/common/router";
import { UserService } from "../../../../services/common/user";

@Component({
  tag: "app-immersea-profile",
  styleUrl: "app-immersea-profile.scss",
})
export class AppImmerseaProfile {
  @State() userRoles: UserRoles;
  userRolesSub: Subscription;

  componentWillLoad() {
    this.userRolesSub = UserService.userRoles$.subscribe((roles) => {
      this.userRoles = roles;
    });
  }
  async disconnectedCallback() {
    this.userRolesSub.unsubscribe();
  }

  openMenu(menu) {
    switch (menu) {
      case "user-update":
        UserService.presentUserUpdate();
        break;
      case "preferiti":
        break;
      case "impostazioni":
        break;
      case "immersea-admin":
        RouterService.push("/admin/immersea", "root");
        break;
      default:
        break;
    }
    menuController.close();
  }

  render() {
    return (
      <Host>
        <ion-content>
          {this.userRoles && this.userRoles.uid ? (
            [
              <div
                class='user-avatar'
                onClick={() => this.openMenu("user-update")}
              >
                <ion-row class='ion-align-items-center'>
                  <ion-col class='ion-text-center'>
                    <app-user-avatar size={140}></app-user-avatar>
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col class='ion-text-center'>
                    {UserService.userProfile
                      ? UserService.userProfile.displayName
                      : null}
                  </ion-col>
                </ion-row>
              </div>,
              <div class='menu-items'>
                <ion-row>
                  <ion-col class='ion-text-center'>
                    <ion-button
                      fill='clear'
                      expand='full'
                      size='large'
                      onClick={() => this.openMenu("preferiti")}
                    >
                      Preferiti
                    </ion-button>
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col class='ion-text-center'>
                    <ion-button
                      fill='clear'
                      expand='full'
                      size='large'
                      onClick={() => this.openMenu("impostazioni")}
                    >
                      Impostazioni
                    </ion-button>
                  </ion-col>
                </ion-row>
                {this.userRoles.isImmerseaAdmin() ? (
                  <ion-row>
                    <ion-col class='ion-text-center'>
                      <ion-button
                        fill='clear'
                        expand='full'
                        size='large'
                        onClick={() => this.openMenu("immersea-admin")}
                      >
                        Admin
                      </ion-button>
                    </ion-col>
                  </ion-row>
                ) : undefined}
              </div>,
            ]
          ) : (
            <page-login></page-login>
          )}
        </ion-content>
        {this.userRoles && this.userRoles.uid
          ? [
              <ion-footer class='ion-no-border'>
                <ion-toolbar>
                  <ion-button
                    expand='block'
                    fill='solid'
                    color='danger'
                    onClick={() => AuthService.logout()}
                  >
                    <ion-icon slot='start' name='log-out'></ion-icon>
                    <my-transl tag='logout' text='Logout' isLabel></my-transl>
                  </ion-button>
                </ion-toolbar>
              </ion-footer>,
            ]
          : undefined}
      </Host>
    );
  }
}
