import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { E as Environment } from './env-9be68260.js';
import { T as TrasteelService, U as UserTeams } from './services-2650b7f8.js';
import { b as ProductLines } from './user-plans-3e6cb6aa.js';
import { b as actionSheetController, m as modalController } from './overlays-b3ceb97d.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
import './ionic-global-c07767bf.js';
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
import './utils-cbf49763.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-dae4acde.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';
import './framework-delegate-779ab78c.js';

const modalUserTeamsUpdateCss = "modal-user-teams-update ion-list{width:100%}";

const ModalUserTeamsUpdate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.user = undefined;
        this.usersTeams = undefined;
        this.userIndex = undefined;
        this.userTeams = undefined;
        this.updateView = false;
    }
    async componentWillLoad() {
        this.usersTeams = await TrasteelService.getUsersTeams();
        this.userIndex =
            this.usersTeams.usersTeams.length > 0
                ? this.usersTeams.usersTeams.findIndex((x) => x.uid === this.user.uid)
                : -1;
        if (this.userIndex < 0) {
            this.userTeams = new UserTeams(this.user);
        }
        else {
            this.userTeams = this.usersTeams.usersTeams[this.userIndex];
        }
    }
    async addTeam() {
        let buttons = [];
        let teams = Object.keys(ProductLines);
        teams.forEach((team) => {
            if (!this.userTeams.teams.includes(team)) {
                buttons.push({
                    text: team,
                    handler: () => {
                        this.userTeams.teams.push(team);
                        this.updateView = !this.updateView;
                    },
                });
            }
        });
        buttons.push({
            text: "Close",
            icon: "close",
            role: "cancel",
            handler: () => { },
        });
        const actionSheet = await actionSheetController.create({
            header: "Add",
            buttons: buttons,
        });
        await actionSheet.present();
    }
    async deleteTeam(index) {
        this.userTeams.teams.splice(index);
        this.updateView = !this.updateView;
    }
    async save() {
        if (this.userIndex >= 0) {
            this.usersTeams.usersTeams[this.userIndex] = this.userTeams;
        }
        else {
            this.usersTeams.usersTeams.push(this.userTeams);
        }
        TrasteelService.updateUsersTeams(this.usersTeams);
        modalController.dismiss();
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: '78015bb53e5b8f26f9fbf619b60656eda92f2ad8' }, h("ion-header", { key: 'a5edc03dfb22afbe55105f9f2a8dc282bf1b7b42' }, h("ion-toolbar", { key: 'b10fc51e658f02af0f353cfeaa787a6cbb3f8682', color: "trasteel" }, h("ion-title", { key: '9b4e2454d9bed0c745d4cf15cb86e435f83d8c23' }, "USER TEAMS MANAGER"))), h("ion-content", { key: '02b733f8b114afb6753b7e8aa086950a662e7d34' }, h("ion-list", { key: '37ddf22f75a7733703411e1878889d843f6e99a5' }, h("ion-item", { key: '344b397bcfc211ce54c08d5146efb2d6c0ee9069' }, this.user.email), h("ion-item-divider", { key: '1c5566eca3dd8007cc1247ad05f0e13427afc26c' }, h("ion-label", { key: '3c4cda22bf508ad7f31be98624ffa91c426e040a' }, h("my-transl", { key: 'f07781725d55be87761d8539a86540a603d506b6', tag: "teams", text: "Teams" }))), this.userTeams.teams.map((team, index) => (h("ion-item", null, h("ion-label", null, team), h("ion-button", { slot: "end", fill: "clear", onClick: () => this.deleteTeam(index) }, h("ion-icon", { name: "trash", color: "danger" }))))), h("ion-button", { key: '306993e8ad2c25c672e37e083b266116e46dd76a', color: "trasteel", fill: "outline", expand: "full", onClick: () => {
                this.addTeam();
            } }, h("ion-icon", { key: 'f986093fb7f70784dc64748223c8f291b0cd34a8', name: "add", slot: "start" }), h("ion-label", { key: '1f86d43d44e9314bcf1bd8f164f871545517c9e1' }, h("my-transl", { key: '7c9e972b1f56bc26b8e68625a8381c110fccaeb9', tag: "add-team", text: "Add Team" }))))), h("app-modal-footer", { key: '86c7ffb3ec48fdae490e6b2dad4a4f3e66c430e3', color: Environment.getAppColor(), onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalUserTeamsUpdate.style = modalUserTeamsUpdateCss;

export { ModalUserTeamsUpdate as modal_user_teams_update };

//# sourceMappingURL=modal-user-teams-update.entry.js.map