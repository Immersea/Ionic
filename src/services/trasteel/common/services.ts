import {DatabaseService} from "../../common/database";
import {SYSTEMCOLLECTION} from "../../common/system";
import {UserPubicProfile} from "../../../components";
import {UsersTeams} from "../../../interfaces/trasteel/users/users-teams";
import {RouterService} from "../../common/router";
import {UserService} from "../../common/user";

const USERSTEAMSDOC = "usersTeams";

export class TrasteelServicesController {
  getUserRoles() {
    return [
      "registered",
      "customerDBAdmin",
      "refraDBAdmin",
      "refraTeamAdmin",
      "electDBAdmin",
      "electTeamAdmin",
      "rawDBAdmin",
      "rawTeamAdmin",
      "engDBAdmin",
      "engTeamAdmin",
      "translator",
      "superAdmin",
    ];
  }

  isTeamAdmin(line?): boolean {
    let ret = false;
    switch (line) {
      case "refractories":
        ret = this.isRefraTeamAdmin();
        break;
      case "electrodes":
        ret = this.isElecTeamAdmin();
        break;
      case "rawmaterials":
        ret = this.isRawTeamAdmin();
        break;
      case "engineering":
        ret = this.isEngTeamAdmin();
        break;
      case "longterm":
        ret = false;
        break;
      case undefined:
        ret =
          this.isRefraTeamAdmin() ||
          this.isElecTeamAdmin() ||
          this.isRawTeamAdmin() ||
          this.isEngTeamAdmin();
    }
    return ret;
  }

  isCustomerDBAdmin(): boolean {
    return (
      UserService.userRoles.roles.indexOf("customerDBAdmin") != -1 ||
      UserService.userRoles.isSuperAdmin()
    );
  }

  isRefraDBAdmin(): boolean {
    return (
      UserService.userRoles.roles.indexOf("refraDBAdmin") != -1 ||
      UserService.userRoles.isSuperAdmin()
    );
  }
  isRefraTeamAdmin(): boolean {
    return (
      UserService.userRoles.roles.indexOf("refraTeamAdmin") != -1 ||
      UserService.userRoles.isSuperAdmin()
    );
  }
  isElecDBAdmin(): boolean {
    return (
      UserService.userRoles.roles.indexOf("elecDBAdmin") != -1 ||
      UserService.userRoles.isSuperAdmin()
    );
  }
  isElecTeamAdmin(): boolean {
    return (
      UserService.userRoles.roles.indexOf("elecTeamAdmin") != -1 ||
      UserService.userRoles.isSuperAdmin()
    );
  }
  isRawDBAdmin(): boolean {
    return (
      UserService.userRoles.roles.indexOf("rawDBAdmin") != -1 ||
      UserService.userRoles.isSuperAdmin()
    );
  }
  isRawTeamAdmin(): boolean {
    return (
      UserService.userRoles.roles.indexOf("rawTeamAdmin") != -1 ||
      UserService.userRoles.isSuperAdmin()
    );
  }
  isEngDBAdmin(): boolean {
    return (
      UserService.userRoles.roles.indexOf("engDBAdmin") != -1 ||
      UserService.userRoles.isSuperAdmin()
    );
  }
  isEngTeamAdmin(): boolean {
    return (
      UserService.userRoles.roles.indexOf("engTeamAdmin") != -1 ||
      UserService.userRoles.isSuperAdmin()
    );
  }

  async getUsersTeams(): Promise<UsersTeams> {
    let usersTeams = await DatabaseService.getDocument(
      SYSTEMCOLLECTION,
      USERSTEAMSDOC
    );
    if (usersTeams) {
      usersTeams = new UsersTeams(usersTeams);
    } else {
      usersTeams = new UsersTeams();
    }
    return usersTeams;
  }

  async updateUsersTeams(usersTeams: UsersTeams) {
    await DatabaseService.updateDocument(
      SYSTEMCOLLECTION,
      USERSTEAMSDOC,
      usersTeams
    );
  }

  setUserTeams(user: UserPubicProfile) {
    RouterService.openModal("modal-user-teams-update", {user: user});
  }
}
export const TrasteelService = new TrasteelServicesController();
