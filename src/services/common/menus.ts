import {menuController} from "@ionic/core";

export class MenuController {
  appMenu = [];
  url = [];
  coverItemUser: any;
  coverItemAdmin: any;
  adminMenu: any;
  headerColor: string;

  resetMenus() {
    this.appMenu = [];
    this.adminMenu = {
      listButtons: [],
    };
  }

  enableMenu(menu: "admin" | "user") {
    if (menu == "user") {
      menuController.enable(true, "user");
      menuController.enable(false, "admin");
    } else {
      menuController.enable(false, "user");
      menuController.enable(true, "admin");
    }
  }
}

export const MenuService = new MenuController();
