import { r as registerInstance, h } from './index-d515af00.js';
import { aA as ChatService, U as UserService, i as DivingCentersService, n as DivingSchoolsService, l as ServiceCentersService } from './utils-5cd4c7bb.js';
import { E as Environment } from './env-0a7fccce.js';
import { d as dateFns } from './index-9b61a50b.js';
import { l as lodash } from './lodash-68d560b6.js';
import './map-e64442d7.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-be90eba5.js';
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
import './overlays-b3ceb97d.js';
import './framework-delegate-779ab78c.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const appAdminChatsCss = "app-admin-chats{}";

const AppAdminChats = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.userPublicProfilesList = [];
        //UDIVE
        this.divingCentersList = [];
        this.divingSchoolsList = [];
        this.serviceCentersList = [];
        this.filterByOrganisierId = undefined;
        this.filterByChats = undefined;
        this.adminChatsArray = [];
        this.updateView = false;
        this.creatingNewChat = false;
        this.loadingChats = true;
        this.editingChat = "";
    }
    async componentWillLoad() {
        this.loadingChats$ = ChatService.creatingNewChat$.subscribe((value) => {
            this.creatingNewChat = value;
        });
        this.editingChat$ = ChatService.editingChatId$.subscribe((value) => {
            this.editingChat = value;
        });
        //wait for user to be load
        this.userRoles$ = UserService.userRoles$.subscribe((roles) => {
            this.userRoles = roles;
            if (this.filterByOrganisierId && !this.userChats$) {
                this.userChats$ = ChatService.servicesChatsList$.subscribe((sub) => {
                    this.loadChats(sub);
                });
            }
            else if (!this.userChats$) {
                this.userChats$ = ChatService.userChatsList$.subscribe((sub) => {
                    this.loadChats(sub);
                });
            }
            this.filter();
        });
        //load all users list
        this.userPublicProfilesList$ =
            UserService.userPublicProfilesList$.subscribe((collection) => {
                //update dive sites
                this.userPublicProfilesList = collection;
                this.filter();
            });
        if (Environment.isUdive()) {
            //load all diving centers list
            this.divingCentersList$ =
                DivingCentersService.divingCentersList$.subscribe((collection) => {
                    this.divingCentersList = collection;
                    this.filter();
                });
            //load all diving schools list
            this.divingSchoolsList$ =
                DivingSchoolsService.divingSchoolsList$.subscribe((collection) => {
                    this.divingSchoolsList = collection;
                    this.filter();
                });
            //load all service centers list
            this.serviceCentersList$ =
                ServiceCentersService.serviceCentersList$.subscribe((collection) => {
                    this.serviceCentersList = collection;
                    this.filter();
                });
        }
    }
    disconnectedCallback() {
        this.userRoles$.unsubscribe();
        this.userChats$.unsubscribe();
        this.userPublicProfilesList$.unsubscribe();
        this.editingChat$.unsubscribe();
        this.loadingChats$.unsubscribe();
        if (Environment.isUdive()) {
            this.divingCentersList$.unsubscribe();
            this.divingSchoolsList$.unsubscribe();
            this.serviceCentersList$.unsubscribe();
        }
    }
    loadChats(userChats) {
        ChatService.resetSkeletons();
        this.loadingChats = false;
        if (userChats) {
            let adminChatsArray = [];
            Object.keys(userChats).forEach((key) => {
                let chat = userChats[key];
                chat.id = key;
                adminChatsArray.push(chat);
            });
            adminChatsArray = lodash.exports.orderBy(adminChatsArray, "lastMessage.created", "desc");
            this.adminChatsArray = adminChatsArray;
            this.filter();
        }
    }
    async filter() {
        if (this.adminChatsArray.length > 0) {
            //load organiser data
            this.adminChatsArray.map(async (chat) => {
                const organiser = chat.organiser;
                organiser.item = await UserService.getOrganiser("item", organiser);
                if (Environment.isUdive()) {
                    chat.owner =
                        chat.organiser.id === UserService.userProfile.uid ||
                            chat.organiser.id === DivingSchoolsService.selectedDivingSchoolId ||
                            chat.organiser.id === DivingCentersService.selectedDivingCenterId ||
                            chat.organiser.id ===
                                ServiceCentersService.selectedServiceCenterId ||
                            chat.organiser.id === ServiceCentersService.selectedServiceCenterId;
                }
                chat.participantNames = ChatService.getOtherChatParticipants("names", chat);
                chat.photoURL =
                    chat.organiser && chat.organiser.item && chat.organiser.item.photoURL
                        ? chat.organiser.item.photoURL
                        : null;
                //change photo url if there are two users
                const otherParticipants = ChatService.getOtherChatParticipants("list", chat);
                if (otherParticipants.length == 1) {
                    const participant = otherParticipants[0];
                    let item = await UserService.getOrganiser("item", participant);
                    if (item && item.photoURL)
                        chat.photoURL = item.photoURL;
                }
                //set chat unread
                const userLastRead = UserService.userSettings.chatsLastRead &&
                    UserService.userSettings.chatsLastRead[chat.id]
                    ? UserService.userSettings.chatsLastRead[chat.id]
                    : false;
                chat.unread =
                    userLastRead && chat.lastMessage
                        ? lodash.exports.toNumber(chat.lastMessage.created) >
                            lodash.exports.toNumber(UserService.userSettings.chatsLastRead[chat.id])
                        : true;
            });
            //filter by chats id for clients visualisation
            if (this.filterByChats) {
                const chatsArray = Object.keys(this.filterByChats);
                this.adminChatsArray = this.adminChatsArray.filter((chat) => chatsArray.includes(chat.id));
            }
            this.updateView = !this.updateView;
        }
    }
    delete(event, id) {
        event.stopPropagation();
        ChatService.deleteChat(id);
    }
    render() {
        return (h("ion-list", { key: '4cdabcd73a5b5dd075543311ef46f0d973d9f42c' }, this.loadingChats
            ? [
                h("app-skeletons", { skeleton: "chat" }),
                h("app-skeletons", { skeleton: "chat" }),
                h("app-skeletons", { skeleton: "chat" }),
                h("app-skeletons", { skeleton: "chat" }),
                h("app-skeletons", { skeleton: "chat" }),
            ]
            : undefined, this.creatingNewChat ? h("app-skeletons", { skeleton: "chat" }) : undefined, this.adminChatsArray.map((chat) => this.editingChat == chat.id ? (h("app-skeletons", { skeleton: "chat" })) : (h("ion-item", { button: true, onClick: () => ChatService.presentChat(chat.id), detail: true }, chat.photoURL ? (h("ion-avatar", { slot: "start" }, h("ion-img", { src: chat.photoURL }))) : (h("ion-icon", { slot: "start", name: "chatbubbles-outline" })), h("ion-label", null, h("h2", { style: chat.unread ? { fontWeight: "bold" } : undefined }, chat.name
            ? chat.name
            : chat.participantNames
                ? chat.participantNames
                : ""), chat.name ? h("p", null, chat.participantNames) : undefined, chat.lastMessage ? (h("p", null, dateFns.format(dateFns.fromUnixTime(lodash.exports.toNumber(chat.lastMessage.created)), "PPP"))) : undefined), chat.unread ? (h("ion-icon", { slot: "start", color: "danger", name: "radio-button-on" })) : undefined, chat.owner ? (h("ion-button", { fill: "clear", color: "danger", "icon-only": true, slot: "end", onClick: (ev) => this.delete(ev, chat.id) }, h("ion-icon", { name: "trash", slot: "end" }))) : undefined)))));
    }
};
AppAdminChats.style = appAdminChatsCss;

export { AppAdminChats as app_admin_chats };

//# sourceMappingURL=app-admin-chats.entry.js.map