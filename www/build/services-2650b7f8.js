import { U as UserService, D as DatabaseService, S as SYSTEMCOLLECTION, R as RouterService } from './utils-cbf49763.js';

class UsersTeams {
    constructor(data) {
        this.usersTeams = [];
        if (data && data.usersTeams && data.usersTeams.length > 0) {
            data.usersTeams.forEach((team) => {
                this.usersTeams.push(new UserTeams(team));
            });
        }
        this.users = {};
        if (data && data.users) {
            Object.keys(data.users).forEach((key) => {
                this.users[key] = data.users[key];
            });
        }
    }
}
class UserTeams {
    constructor(data) {
        this.uid = data && data.uid ? data.uid : null;
        this.email = data && data.email ? data.email : null;
        this.teams = data && data.teams && data.teams.length > 0 ? data.teams : [];
    }
}

const USERSTEAMSDOC = "usersTeams";
class TrasteelServicesController {
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
    isTeamAdmin(line) {
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
    isCustomerDBAdmin() {
        return (UserService.userRoles.roles.indexOf("customerDBAdmin") != -1 ||
            UserService.userRoles.isSuperAdmin());
    }
    isRefraDBAdmin() {
        return (UserService.userRoles.roles.indexOf("refraDBAdmin") != -1 ||
            UserService.userRoles.isSuperAdmin());
    }
    isRefraTeamAdmin() {
        return (UserService.userRoles.roles.indexOf("refraTeamAdmin") != -1 ||
            UserService.userRoles.isSuperAdmin());
    }
    isElecDBAdmin() {
        return (UserService.userRoles.roles.indexOf("elecDBAdmin") != -1 ||
            UserService.userRoles.isSuperAdmin());
    }
    isElecTeamAdmin() {
        return (UserService.userRoles.roles.indexOf("elecTeamAdmin") != -1 ||
            UserService.userRoles.isSuperAdmin());
    }
    isRawDBAdmin() {
        return (UserService.userRoles.roles.indexOf("rawDBAdmin") != -1 ||
            UserService.userRoles.isSuperAdmin());
    }
    isRawTeamAdmin() {
        return (UserService.userRoles.roles.indexOf("rawTeamAdmin") != -1 ||
            UserService.userRoles.isSuperAdmin());
    }
    isEngDBAdmin() {
        return (UserService.userRoles.roles.indexOf("engDBAdmin") != -1 ||
            UserService.userRoles.isSuperAdmin());
    }
    isEngTeamAdmin() {
        return (UserService.userRoles.roles.indexOf("engTeamAdmin") != -1 ||
            UserService.userRoles.isSuperAdmin());
    }
    async getUsersTeams() {
        let usersTeams = await DatabaseService.getDocument(SYSTEMCOLLECTION, USERSTEAMSDOC);
        if (usersTeams) {
            usersTeams = new UsersTeams(usersTeams);
        }
        else {
            usersTeams = new UsersTeams();
        }
        return usersTeams;
    }
    async updateUsersTeams(usersTeams) {
        await DatabaseService.updateDocument(SYSTEMCOLLECTION, USERSTEAMSDOC, usersTeams);
    }
    setUserTeams(user) {
        RouterService.openModal("modal-user-teams-update", { user: user });
    }
}
const TrasteelService = new TrasteelServicesController();

export { TrasteelService as T, UserTeams as U };

//# sourceMappingURL=services-2650b7f8.js.map