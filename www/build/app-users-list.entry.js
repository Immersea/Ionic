import { r as registerInstance, h } from './index-d515af00.js';
import { U as UserService } from './utils-ced1e260.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { p as popoverController } from './overlays-b3ceb97d.js';
import './env-c3ad5e77.js';
import './ionic-global-c07767bf.js';
import './map-fe092362.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
import './index-93ceac82.js';
import './helpers-ff3eb5b3.js';
import './ios.transition-4bc5d5e6.js';
import './md.transition-b118d52a.js';
import './cubic-bezier-acda64df.js';
import './index-493838d0.js';
import './gesture-controller-a0857859.js';
import './config-45217ee2.js';
import './theme-6bada181.js';
import './index-f47409f3.js';
import './hardware-back-button-da755485.js';
import './framework-delegate-779ab78c.js';

const appUsersListCss = "app-users-list{width:100%}";

const AppUsersList = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.isOwner = false;
        this.item = undefined;
        this.editable = false;
        this.show = undefined;
        this.owner = [];
        this.editor = [];
        this.instructor = [];
        this.divemaster = [];
    }
    async componentWillLoad() {
        this.groups = {
            owner: {
                show: this.show.includes("owner"),
                tag: "admin",
                text: "Administrator",
            },
            editor: {
                show: this.show.includes("editor"),
                tag: "editor",
                text: "Editor",
            },
            instructor: {
                show: this.show.includes("instructor"),
                tag: "instructor",
                text: "Instructor",
            },
            divemaster: {
                show: this.show.includes("divemaster"),
                tag: "divemaster",
                text: "Divemaster",
            },
        };
        this.userProfile = UserService.userProfile;
        this.isOwner =
            lodash.exports.isArray(this.item.users[this.userProfile.uid]) &&
                this.item.users[this.userProfile.uid].includes("owner");
        await this.setUsers();
    }
    async setUsers() {
        this.owner = [];
        this.editor = [];
        this.instructor = [];
        for (let userId of Object.keys(this.item.users)) {
            if (this.item.users[userId].includes("owner")) {
                this.owner.push(await UserService.getMapDataUserDetails(userId));
            }
            if (this.item.users[userId].includes("editor")) {
                this.editor.push(await UserService.getMapDataUserDetails(userId));
            }
            if (this.item.users[userId].includes("instructor")) {
                this.instructor.push(await UserService.getMapDataUserDetails(userId));
            }
            if (this.item.users[userId].includes("divemaster")) {
                this.divemaster.push(await UserService.getMapDataUserDetails(userId));
            }
        }
        this.owner = lodash.exports.orderBy(this.owner, "displayName");
        this.editor = lodash.exports.orderBy(this.editor, "displayName");
        this.instructor = lodash.exports.orderBy(this.instructor, "displayName");
        this.divemaster = lodash.exports.orderBy(this.divemaster, "displayName");
    }
    async addUser(role) {
        const popover = await popoverController.create({
            component: "popover-search-user",
            translucent: true,
        });
        popover.onDidDismiss().then((ev) => {
            const userId = ev.data;
            let user = this.item.users[userId];
            if (user && !this.item.users[userId].includes(role)) {
                this.item.users[userId].push(role);
            }
            else if (!user) {
                this.item.users[userId] = [role];
            }
            this.setUsers();
        });
        popover.present();
    }
    removeUser(user, role) {
        const index = this.item.users[user.uid].findIndex((item) => item == role);
        this.item.users[user.uid].splice(index, 1);
        if (this.item.users[user.uid].length == 0) {
            delete this.item.users[user.uid];
        }
        this.setUsers();
    }
    render() {
        return [
            h("ion-list", { key: '187fd79ab3b00f980d009fd956450ca9dc840db2' }, Object.keys(this.groups).map((group) => [
                this.groups[group].show && (this[group].length > 0 || this.editable)
                    ? [
                        h("ion-item", { lines: "full" }, h("my-transl", { tag: this.groups[group].tag, text: this.groups[group].text, isLabel: true }), this.editable &&
                            (this.isOwner || UserService.userRoles.isSuperAdmin()) ? (h("ion-button", { color: "primary", fill: "clear", slot: "end", onClick: () => this.addUser(group) }, h("ion-icon", { name: "add-circle" }))) : undefined),
                    ]
                    : undefined,
                this[group].length > 0
                    ? [
                        this[group].map((user) => (h("ion-item", null, this.editable &&
                            (this.isOwner || UserService.userRoles.isSuperAdmin()) ? (h("ion-button", { "icon-only": true, slot: "end", color: "danger", fill: "clear", disabled: UserService.userRoles.uid == user.uid, onClick: () => this.removeUser(user, group) }, h("ion-icon", { name: "trash-bin-outline" }))) : undefined, user.photoURL ? (h("ion-avatar", { slot: "start" }, h("ion-img", { src: user.photoURL }))) : undefined, h("ion-label", null, user.displayName)))),
                    ]
                    : undefined,
            ])),
        ];
    }
};
AppUsersList.style = appUsersListCss;

export { AppUsersList as app_users_list };

//# sourceMappingURL=app-users-list.entry.js.map