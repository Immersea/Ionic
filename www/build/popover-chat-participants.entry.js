import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { U as UserService, i as DivingCentersService, n as DivingSchoolsService, l as ServiceCentersService, T as TranslationService } from './utils-ced1e260.js';
import './index-be90eba5.js';
import { E as Environment } from './env-c3ad5e77.js';
import { g as getEmailValidator } from './email-validator-5dccf846.js';
import { l as lodash } from './lodash-68d560b6.js';
import { p as popoverController } from './overlays-b3ceb97d.js';
import './map-fe092362.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
import './ionic-global-c07767bf.js';
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

const popoverChatParticipantsCss = "popover-chat-participants{}";

const PopoverChatParticipants = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.usersList = [];
        this.participantsList = [];
        this.addedParticipantsList = [];
        this.removedParticipantsList = [];
        this.userNotFound = false;
        this.modifiedParticipants = false;
        this.chat = undefined;
        this.editable = true;
        this.showList = [];
        this.updateView = false;
    }
    async componentWillLoad() {
        const chatParticipants = Object.keys(this.chat.participants);
        this.usersList = [];
        for (let id of chatParticipants) {
            const participant = this.chat.participants[id];
            if (participant.collectionId == "userProfiles") {
                const publicProfile = await UserService.getPublicProfileUserDetails(participant.id);
                if (publicProfile && publicProfile.uid) {
                    this.usersList.push(publicProfile);
                }
            }
        }
        if (Environment.isUdive()) {
            this.usersList = this.usersList.concat(DivingCentersService.divingCentersList);
            this.usersList = this.usersList.concat(DivingSchoolsService.divingSchoolsList);
            this.usersList = this.usersList.concat(ServiceCentersService.serviceCentersList);
        }
        this.participantsList = lodash.exports.orderBy(this.usersList.filter((participant) => chatParticipants.includes(participant.id) ||
            chatParticipants.includes(participant.uid)), "displayName");
        const userIds = Object.keys(this.chat.users);
        this.ownersIds = userIds.filter((userId) => this.chat.users[userId].includes("owner"));
        if (Environment.isUdive()) {
            this.editable =
                this.ownersIds.includes(UserService.userProfile.uid) ||
                    this.ownersIds.includes(ServiceCentersService.selectedServiceCenterId) ||
                    this.ownersIds.includes(DivingCentersService.selectedDivingCenterId) ||
                    this.ownersIds.includes(DivingSchoolsService.selectedDivingSchoolId);
        }
    }
    async searchUsers(ev) {
        this.searchFilter = ev.target.value.toLowerCase();
        this.showList = [];
        if (getEmailValidator().validate(this.searchFilter)) {
            const user = await UserService.searchUserByEmail(this.searchFilter);
            if (user && user.uid) {
                this.showList.push(user);
                this.userNotFound = false;
            }
            else {
                this.showList = [];
                this.userNotFound = true;
            }
            this.updateView = !this.updateView;
        }
    }
    resetShowList() {
        this.userNotFound = false;
        this.showList = [];
    }
    addUser(user) {
        if (this.participantsList.findIndex((part) => user.uid === part.id) == -1) {
            this.participantsList.push(user);
            this.addedParticipantsList.push(user);
        }
        this.searchFilter = "";
        this.resetShowList();
        this.modifiedParticipants = true;
    }
    removeUser(user) {
        this.participantsList.splice(this.participantsList.findIndex((val) => val.uid === user.uid || val.id === user.id), 1);
        this.addedParticipantsList.splice(this.addedParticipantsList.findIndex((val) => val.uid === user.uid || val.id === user.id), 1);
        this.removedParticipantsList.push(user);
        this.searchFilter = "";
        this.resetShowList();
        this.modifiedParticipants = true;
    }
    changeName(ev) {
        this.chat.name = ev.target.value;
    }
    close() {
        popoverController.dismiss();
    }
    save() {
        popoverController.dismiss({
            chatName: this.chat.name,
            added: this.addedParticipantsList,
            removed: this.removedParticipantsList,
        });
    }
    render() {
        return (h(Host, { key: 'bb9fe351b7486f52b04276bc3dc25942e6116064' }, h("ion-content", { key: '884fbda40924c337ea23c8eb5667231d5e03b3ff' }, h("ion-list", { key: 'ec0869e661512503206bb1fea14d07a2b4c868a8' }, this.editable && Object.keys(this.chat.participants).length > 2 ? (h("ion-item", { color: "chat" }, h("ion-input", { mode: "ios", placeholder: TranslationService.getTransl("chat-name", "Insert Chat Name"), value: this.chat.name, onIonInput: (ev) => this.changeName(ev) }))) : undefined, this.editable
            ? [
                h("ion-header", { translucent: true }, h("ion-toolbar", null, h("ion-title", null, h("my-transl", { tag: "edit-chat-participants", text: "Edit Chat Participants" })))),
            ]
            : undefined, this.participantsList.map((user) => (h("ion-item", null, user.photoURL ? (h("ion-avatar", { slot: "start" }, h("ion-img", { src: user.photoURL }))) : undefined, h("ion-label", null, user.displayName), this.editable &&
            !this.ownersIds.includes(user.uid) &&
            !this.ownersIds.includes(user.id) ? (h("ion-button", { slot: "end", "icon-only": true, fill: "clear", color: "danger", onClick: () => this.removeUser(user) }, h("ion-icon", { name: "person-remove-outline" }))) : undefined)))), this.editable
            ? [
                h("ion-header", { translucent: true }, h("ion-toolbar", null, h("ion-title", null, h("my-transl", { tag: "add-chat-participants", text: "Add Chat Participants" })))),
                h("ion-header", { translucent: true }, h("ion-toolbar", null, h("ion-searchbar", { value: this.searchFilter, placeholder: "Email", inputmode: "email", type: "email", enterkeyhint: "search", clearIcon: "close-circle", autocomplete: "email", onIonInput: () => this.resetShowList(), onIonClear: () => this.resetShowList(), onIonCancel: () => this.resetShowList(), onIonChange: (ev) => this.searchUsers(ev) }))),
            ]
            : undefined, h("ion-list", { key: 'd03b4b6f51c4f7421f60781dfd0375953c58ec4d' }, this.showList.map((user) => (h("ion-item", null, user.photoURL ? (h("ion-avatar", { slot: "start" }, h("ion-img", { src: user.photoURL }))) : undefined, h("ion-label", null, user.displayName), h("ion-button", { slot: "end", "icon-only": true, fill: "clear", color: "success", onClick: () => this.addUser(user) }, h("ion-icon", { name: "person-add-outline" }))))), this.userNotFound ? (h("ion-item", null, h("ion-label", null, h("my-transl", { tag: "user-not-found", text: "User Not Found" })))) : undefined)), h("app-modal-footer", { key: '60a4200070ad5f568cdca934be63fc8cd912a9a6', onCancelEmit: () => this.close(), disableSave: !this.modifiedParticipants, onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
PopoverChatParticipants.style = popoverChatParticipantsCss;

export { PopoverChatParticipants as popover_chat_participants };

//# sourceMappingURL=popover-chat-participants.entry.js.map