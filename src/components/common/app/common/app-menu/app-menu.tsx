import { Component, h, State } from "@stencil/core";
import { RouterService } from "../../../../../services/common/router";
import { Environment } from "../../../../../global/env";
import { UDiveMenuService } from "../../../../../services/udive/menus";
import { MenuService } from "../../../../../services/common/menus";
import { UserService } from "../../../../../services/common/user";
import { alertController, isPlatform } from "@ionic/core";
import { UserRoles } from "../../../../../interfaces/common/user/user-roles";
import { TrasteelMenuService } from "../../../../../services/trasteel/common/menus";
import { Browser } from "@capacitor/browser";
import { TranslationService } from "../../../../../services/common/translations";
import { isArray } from "lodash";

@Component({
  tag: "app-menu",
  styleUrl: "app-menu.scss",
})
export class AppMenu {
  @State() userRoles: UserRoles;
  @State() selectedMenu: string;
  @State() appMenu = [];
  @State() url = [];
  @State() coverItemUser: any;
  @State() coverItemAdmin: any;
  @State() adminMenu: any;
  @State() headerColor: string;
  @State() showMenu: boolean | string = true;

  componentWillLoad() {
    UserService.userRoles$.subscribe((roles) => {
      this.userRoles = roles;
      this.renderMenus();
    });
    //get page url and render menu accordingly
    RouterService.routerSub$.subscribe((to) => {
      this.url = to;
      this.renderMenus();
    });
  }

  renderMenus() {
    this.showMenu = "lg"; //if true shows always the menu without auto-hide

    //update selected menu for highlight
    this.selectedMenu = isArray(this.url) ? this.url.join("/") : this.url;
    //create menu for admin
    MenuService.resetMenus();

    if (Environment.isUdive() || Environment.isDecoplanner()) {
      //UDIVE - DECOPLANNER
      UDiveMenuService.renderMenus(this.url);
    } else if (Environment.isTrasteel()) {
      //TRASTEEL
      TrasteelMenuService.renderMenus(this.url);
    }

    this.appMenu = MenuService.appMenu;
    this.coverItemUser = MenuService.coverItemUser;
    this.coverItemAdmin = MenuService.coverItemAdmin;
    this.adminMenu = MenuService.adminMenu;
    this.headerColor = MenuService.headerColor;
  }

  async itemSelect(item) {
    if (item.url) {
      RouterService.push(item.url, "forward");
    } else if (item.externalUrl) {
      const alert = await alertController.create({
        header: TranslationService.getTransl(item.tag, item.text),
        message: TranslationService.getTransl(
          "open-new-window",
          "The page will be opened in a new window"
        ),
        buttons: [
          {
            text: TranslationService.getTransl("cancel", "Cancel"),
            role: "cancel",
          },
          {
            text: TranslationService.getTransl("ok", "OK"),
            handler: async () => {
              await Browser.open({ url: item.externalUrl });
            },
          },
        ],
      });
      alert.present();
    }
  }

  render() {
    return (
      <ion-split-pane content-id='menu-content' when={this.showMenu}>
        <ion-menu content-id='menu-content' menuId='user'>
          <ion-header>
            <ion-toolbar color={this.headerColor}>
              <img
                slot='start'
                class='logo'
                src={"/assets/images/" + Environment.getAppLogo()}
              />
              <ion-title>{Environment.getAppTitle()}</ion-title>
              {Environment.getAppSubTitle() && !isPlatform("ios") ? (
                <ion-title size='small'>
                  {Environment.getAppSubTitle()}
                </ion-title>
              ) : undefined}
              {/**
               * <ion-buttons slot="end">
                {this.userRoles ? (
                  <ion-button
                    slot="end"
                    fill="clear"
                    onClick={() => AuthService.logout()}
                  >
                    <ion-icon slot="icon-only" name="log-out"></ion-icon>
                  </ion-button>
                ) : (
                  <ion-button
                    slot="end"
                    fill="clear"
                    onClick={() => RouterService.push("/login", "forward")}
                  >
                    <ion-icon slot="icon-only" name="log-in"></ion-icon>
                  </ion-button>
                )}
              </ion-buttons>
               */}
            </ion-toolbar>
          </ion-header>
          <ion-content forceOverscroll={false}>
            {this.userRoles ? (
              <app-user-cover
                showUserDetails={false}
                class='cover'
              ></app-user-cover>
            ) : undefined}
            {this.appMenu.map((list) => (
              <ion-list>
                <ion-list-header>
                  <my-transl
                    tag={list.listTitle.tag}
                    text={list.listTitle.text}
                    isLabel
                  ></my-transl>
                </ion-list-header>
                {list.listButtons.map((p) =>
                  !p.adminOnly ||
                  (p.adminOnly && UserService.userRoles.isAdmin()) ? (
                    <ion-menu-toggle autoHide={false}>
                      <ion-item
                        button
                        onClick={() => this.itemSelect(p)}
                        detail={false}
                        color={
                          this.selectedMenu == p.url ? this.headerColor : ""
                        }
                      >
                        {p.avatar ? (
                          <ion-avatar slot='start'>
                            <img src={p.avatar} />
                          </ion-avatar>
                        ) : p.iconType && p.iconType !== "ionicon" ? (
                          p.iconType == "custom" ? (
                            <ion-icon slot='start' src={p.icon}></ion-icon>
                          ) : (
                            <ion-icon
                              slot='start'
                              class={
                                p.iconType == "mapicon"
                                  ? "map-icon " + p.icon
                                  : p.iconType == "udiveicon"
                                    ? "udive-icon " + p.icon
                                    : undefined
                              }
                            ></ion-icon>
                          )
                        ) : (
                          <ion-icon slot='start' name={p.icon}></ion-icon>
                        )}

                        <ion-label>
                          <my-transl
                            tag={p.tag ? p.tag : null}
                            text={p.text}
                          ></my-transl>
                        </ion-label>
                      </ion-item>
                    </ion-menu-toggle>
                  ) : undefined
                )}
              </ion-list>
            ))}
          </ion-content>
          <ion-footer>
            <ion-title size='small'>
              {"version: " + Environment.getAppVersion()}
            </ion-title>
          </ion-footer>
        </ion-menu>
        <ion-menu content-id='menu-content' menuId='admin'>
          {this.adminMenu
            ? [
                <ion-header>
                  <ion-toolbar color={this.headerColor}>
                    <ion-title>
                      {this.coverItemAdmin
                        ? this.coverItemAdmin.displayName
                        : undefined}
                    </ion-title>
                    <ion-buttons slot='start'>
                      <ion-button fill='clear' href='/'>
                        <ion-icon name='arrow-back-outline'></ion-icon>
                      </ion-button>
                    </ion-buttons>
                  </ion-toolbar>
                </ion-header>,
                <ion-content forceOverscroll={false}>
                  {this.coverItemAdmin &&
                  (this.coverItemAdmin.coverURL ||
                    this.coverItemAdmin.photoURL) ? (
                    <app-item-cover
                      item={this.coverItemAdmin}
                      class='cover'
                    ></app-item-cover>
                  ) : undefined}
                  <ion-list>
                    {this.adminMenu.listButtons.map((p) =>
                      !p.adminOnly ||
                      (p.adminOnly && UserService.userRoles.isAdmin()) ? (
                        <ion-menu-toggle autoHide={false}>
                          <ion-item
                            button
                            onClick={() => this.itemSelect(p)}
                            detail={false}
                            color={
                              this.selectedMenu == p.url ? this.headerColor : ""
                            }
                          >
                            {p.avatar ? (
                              <ion-avatar slot='start'>
                                <img src={p.avatar} />
                              </ion-avatar>
                            ) : p.iconType && p.iconType !== "ionicon" ? (
                              p.iconType == "custom" ? (
                                <ion-icon slot='start' src={p.icon}></ion-icon>
                              ) : (
                                <ion-icon
                                  slot='start'
                                  class={
                                    p.iconType == "mapicon"
                                      ? "map-icon " + p.icon
                                      : p.iconType == "udiveicon"
                                        ? "udive-icon " + p.icon
                                        : undefined
                                  }
                                ></ion-icon>
                              )
                            ) : (
                              <ion-icon slot='start' name={p.icon}></ion-icon>
                            )}

                            <ion-label>
                              <my-transl
                                tag={p.tag ? p.tag : null}
                                text={p.text}
                              ></my-transl>
                            </ion-label>
                          </ion-item>
                        </ion-menu-toggle>
                      ) : undefined
                    )}
                  </ion-list>
                </ion-content>,
                <ion-footer>
                  <ion-title size='small'>
                    {"version: " + Environment.getAppVersion()}
                  </ion-title>
                </ion-footer>,
              ]
            : undefined}
        </ion-menu>
        <ion-router-outlet
          animated={true}
          id='menu-content'
        ></ion-router-outlet>
      </ion-split-pane>
    );
  }
}
