import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { aA as ChatService, T as TranslationService, R as RouterService, U as UserService } from './utils-5cd4c7bb.js';
import './index-be90eba5.js';
import { d as dateFns } from './index-9b61a50b.js';
import { l as lodash } from './lodash-68d560b6.js';
import { p as popoverController, a as alertController } from './overlays-b3ceb97d.js';
import './env-0a7fccce.js';
import './ionic-global-c07767bf.js';
import './map-e64442d7.js';
import './_commonjsHelpers-1a56c7bc.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';
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

const appChatCss = "app-chat{width:100%;height:var(--chatHeight)}app-chat #chat-container{--padding-bottom:65px}app-chat .chat-footer{position:absolute;bottom:0 !important;width:100%}app-chat .messages{padding-left:20px;padding-right:20px;margin-bottom:20px;display:flex;flex-direction:column}app-chat .message{border-radius:20px;padding:8px 15px;margin-top:5px;margin-bottom:5px;display:inline-block}app-chat .system{align-items:center;display:flex;flex-direction:column}app-chat .system .message{color:rgb(68, 68, 68);padding:0;margin-top:5px;margin-bottom:1px;font-size:smaller}app-chat .yours{align-items:flex-start}app-chat .yours .sendername{color:rgb(201, 201, 201);font-size:smaller}app-chat .yours .message{margin-right:25%;background:linear-gradient(to bottom, #eee 0%, rgb(212, 212, 212) 100%);background-attachment:fixed;position:relative}app-chat .yours .message.last:before{content:\"\";position:absolute;z-index:0;bottom:0;left:-7px;height:20px;width:20px;background:linear-gradient(to bottom, #eee 0%, rgb(212, 212, 212) 100%);background-attachment:fixed;border-bottom-right-radius:15px}app-chat .yours .message.last:after{content:\"\";position:absolute;z-index:1;bottom:0;left:-10px;width:10px;height:20px;background:white;border-bottom-right-radius:10px}app-chat .mine{align-items:flex-end}app-chat .mine .timestamp{color:#00d0ea;font-size:smaller}app-chat .mine .message{color:white;margin-left:25%;background:linear-gradient(to bottom, #00d0ea 0%, #0085d1 100%);background-attachment:fixed;position:relative}app-chat .mine .message.last:before{content:\"\";position:absolute;z-index:0;bottom:0;right:-8px;height:20px;width:20px;background:linear-gradient(to bottom, #00d0ea 0%, #0085d1 100%);background-attachment:fixed;border-bottom-left-radius:15px}app-chat .mine .message.last:after{content:\"\";position:absolute;z-index:1;bottom:0;right:-10px;width:10px;height:20px;background:white;border-bottom-left-radius:10px}";

const AppChat = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.showingPopover = false;
        this.chatId = undefined;
        this.messageGroups = [];
        this.message = undefined;
        this.sendingMessage = false;
    }
    async addParticipants(ev) {
        if (!this.showingPopover) {
            this.showingPopover = true;
            const popover = await popoverController.create({
                component: "popover-chat-participants",
                componentProps: { chat: this.chat },
                event: ev,
                translucent: true,
            });
            popover.onDidDismiss().then(async (ev) => {
                if (ev && ev.data) {
                    const participants = ev.data;
                    ChatService.updateParticipants(this.chatId, this.chat, participants);
                }
                else {
                    //checkif number of participants is >2
                    if (Object.keys(this.chat.participants).length <= 1) {
                        const alert = await alertController.create({
                            header: TranslationService.getTransl("chat", "Chat"),
                            message: TranslationService.getTransl("chat-participants-error", "You should add at least another participant to the chat."),
                            buttons: [
                                {
                                    text: TranslationService.getTransl("cancel", "Cancel"),
                                    role: "cancel",
                                    handler: async () => {
                                        RouterService.push("/chat", "root");
                                    },
                                },
                                {
                                    text: TranslationService.getTransl("ok", "OK"),
                                    handler: async () => {
                                        this.addParticipants(null);
                                    },
                                },
                            ],
                        });
                        alert.present();
                    }
                }
                this.showingPopover = false;
            });
            popover.present();
        }
    }
    componentWillLoad() {
        this.chatSub = ChatService.loadedChat$.subscribe((chat) => {
            if (chat && chat.participants) {
                this.chat = chat;
                this.updateMessagesArrayArray();
                if (Object.keys(this.chat.participants).length == 1) {
                    this.addParticipants(null);
                }
            }
        });
        ChatService.loadChatsForUser(UserService.userProfile.uid);
        ChatService.loadChat(this.chatId);
    }
    componentDidLoad() {
        this.chatContainer = document.getElementById("chat-container");
        this.scrollToBottom();
    }
    disconnectedCallback() {
        ChatService.saveLastChatReadToUser(this.chatId, this.chat);
        this.chatSub.unsubscribe();
        ChatService.unloadChat();
    }
    scrollToBottom() {
        setTimeout(() => {
            this.chatContainer.scrollToBottom();
        }, 100);
    }
    updateMessagesArrayArray() {
        this.messageGroups = [];
        let actualMessageSender = null;
        let previousMessageSender = null;
        let previousDate = null;
        let nextMessageSender = null;
        let messageGroupsCount = -1;
        const thread = lodash.exports.orderBy(this.chat.thread, "created");
        for (let i = 0; i < thread.length; i++) {
            const message = thread[i];
            actualMessageSender = message.senderId;
            nextMessageSender =
                i == thread.length - 1 ? null : thread[i + 1].senderId;
            //check if is last message
            let isFirst = previousMessageSender == null ||
                previousMessageSender != actualMessageSender;
            let isMine = actualMessageSender == ChatService.chatUser.id;
            let isLast = actualMessageSender != nextMessageSender;
            let isSystem = message.senderId == "system";
            const messageObject = {
                content: message.content +
                    (isSystem
                        ? message.senderName == "added"
                            ? " " + TranslationService.getTransl("is-in", "is in")
                            : " " + TranslationService.getTransl("is-out", "is out")
                        : ""),
                created: message.created,
                isFirst: isFirst,
                isLast: isLast,
                senderName: message.senderName,
            };
            if (isFirst) {
                const date = dateFns.fromUnixTime(lodash.exports.toNumber(message.created));
                const showDate = previousDate
                    ? dateFns.differenceInMinutes(previousDate, date) >= 10
                    : true;
                if (!isSystem && showDate) {
                    //insert message group date
                    const today = dateFns.differenceInDays(new Date(), date) >= 1
                        ? dateFns.format(date, "PPPP") // Full textual representation
                        : `${dateFns.format(date, "EEEE")} ${dateFns.format(date, "p")}`; // Day of the week + time
                    this.messageGroups.push({
                        isSystem: true,
                        messages: [
                            {
                                content: today,
                            },
                        ],
                    });
                    previousDate = date;
                    messageGroupsCount++;
                }
                //create message group
                messageGroupsCount++;
                const item = {
                    isMine: isMine,
                    isSystem: isSystem,
                    messages: [messageObject],
                };
                this.messageGroups.push(item);
            }
            else {
                this.messageGroups[messageGroupsCount].messages.push(messageObject);
            }
            previousMessageSender = message.senderId;
        }
        this.sendingMessage = false;
        this.scrollToBottom();
    }
    handleChange(ev) {
        this.message = ev.target.value;
    }
    handleKey(key) {
        //send message on Enter key
        if (key.code === "Enter") {
            event.preventDefault();
            this.sendMessage();
        }
    }
    sendMessage() {
        this.sendingMessage = true;
        const message = this.message;
        this.message = "";
        ChatService.sendChatMessage(this.chatId, this.chat, message);
    }
    render() {
        return (h(Host, { key: '6ce6021fbd5b3929c65b8cb7b4cf8764b75ab46e' }, h("ion-content", { key: 'eb3a9278011da47e111839165a2b6054584c4602', id: "chat-container" }, this.messageGroups.map((messageGroup) => [
            h("div", { class: messageGroup.isMine
                    ? "mine messages"
                    : messageGroup.isSystem
                        ? "system"
                        : "yours messages" }, messageGroup.messages.map((message) => [
                this.chat &&
                    this.chat.participants &&
                    Object.keys(this.chat.participants).length > 2 &&
                    !messageGroup.isMine &&
                    message.isFirst &&
                    !messageGroup.isSystem ? (h("div", { class: "sendername" }, message.senderName)) : undefined,
                h("div", { class: "message" + (message.isLast ? " last" : ""), innerHTML: message.content }),
            ])),
        ])), h("ion-footer", { key: 'e68a6de126a6818a675d1a6fb5a6907e97482b7c', class: "chat-footer" }, h("ion-toolbar", { key: '439896a13b6439983d419bc13020d47b1332d7b3' }, h("ion-item", { key: 'a1ee85efffdbaf0e2c961c4f37acf2d67942a886', lines: "none" }, this.sendingMessage ? (h("ion-spinner", { name: "dots" })) : undefined, h("ion-input", { key: '856cf2554c792a0b2ffb623d79d8b352ba645b03', mode: "ios", placeholder: !this.sendingMessage
                ? TranslationService.getTransl("write-message", "Write a message")
                : undefined, autofocus: true, clearOnEdit: true, value: this.message, disabled: this.sendingMessage, onIonInput: (ev) => this.handleChange(ev), onKeyUp: (ev) => this.handleKey(ev) }), h("ion-button", { key: '8f78e20aca20011758d0e8d788291f40ae47cd2a', slot: "end", "icon-only": true, fill: "clear", disabled: this.sendingMessage, onClick: () => this.sendMessage() }, h("ion-icon", { key: '9251529682a977644a1761e456474b177d164a5a', name: "paper-plane-outline" })))))));
    }
};
AppChat.style = appChatCss;

export { AppChat as app_chat };

//# sourceMappingURL=app-chat.entry.js.map