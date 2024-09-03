import { r as registerInstance, h } from './index-d515af00.js';
import { aA as ChatService, aB as DIVETRIPSCOLLECTION, T as TranslationService, a9 as DiveTripsService, R as RouterService } from './utils-cbf49763.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-9be68260.js';
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
import './map-dae4acde.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';

const pageChatCss = "page-chat{}";

const PageChat = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.chatId = undefined;
        this.participants = undefined;
        this.chat = undefined;
        this.title = undefined;
        this.subtitle = undefined;
        this.additionalDataItem = undefined;
    }
    componentWillLoad() {
        this.chatSub = ChatService.loadedChat$.subscribe((chat) => {
            if (chat && chat.participants) {
                this.chat = chat;
                this.participants = Object.keys(chat.participants).length;
                let otherParticipants = [];
                Object.keys(this.chat.participants).map((partId) => {
                    if (partId !== ChatService.chatUser.id) {
                        otherParticipants.push(this.chat.participants[partId]);
                    }
                });
                if (this.chat.name && this.chat.name.length > 0) {
                    this.title = this.chat.name;
                    this.subtitle = ChatService.getOtherChatParticipants("names", this.chat);
                }
                else {
                    this.title = ChatService.getOtherChatParticipants("names", this.chat);
                    this.subtitle = null;
                }
                if (this.chat.additionalData) {
                    this.loadAdditionalDataItem();
                }
            }
        });
    }
    componentDidLoad() {
        this.chatApp = document.getElementsByTagName("app-chat")[0];
    }
    disconnectedCallback() {
        this.chatSub.unsubscribe();
    }
    async loadAdditionalDataItem() {
        if (this.chat.additionalData.collectionId === DIVETRIPSCOLLECTION) {
            this.additionalDataItem = {
                title: TranslationService.getTransl("dive-trip", "Dive Trip"),
                onclick: DiveTripsService.pushDiveTrip,
            };
        }
    }
    showAdditionalDataItem() { }
    addParticipant(ev) {
        this.chatApp.addParticipants(ev);
    }
    render() {
        return [
            h("ion-header", { key: 'dd0ee295acebd20ccea5f1b92bcab7fee6c9381b' }, h("ion-toolbar", { key: '7b79220f0ed32fa247778c9f793c473a9ba43a8b', color: "chat" }, h("ion-buttons", { key: '535a8afd2b4d9a662e759efa4d8237798fc20b57', slot: "start" }, h("ion-button", { key: '739804d4b0b48fe4ffb5765d138e4493c418c641', onClick: () => RouterService.goBack(), "icon-only": true }, h("ion-icon", { key: 'ce6a73a8734a8659c41983f1a0839f3feebe1425', name: "arrow-back" }))), h("ion-title", { key: 'a807127187fe1dfcf0fb763cb12febc94f1ec9c0' }, this.title), this.subtitle ? (h("ion-title", { size: "small" }, this.subtitle)) : undefined, h("ion-buttons", { key: 'f1980422ae5ca74e6b794dc558be12373e2d53e8', slot: "end" }, this.additionalDataItem ? (h("ion-button", { fill: "outline", onClick: () => this.additionalDataItem.onclick(this.chat.additionalData.id) }, this.additionalDataItem.title, h("ion-icon", { name: "open-outline", slot: "start" }))) : undefined, h("ion-button", { key: '4103f5bc51b4bdc29f7a011daf9db9e6955dc26e', "icon-only": true, slot: "end", onClick: (ev) => this.addParticipant(ev) }, h("ion-icon", { key: '90a43bcfdda579f44a0444548cceec526eaae00b', name: "people-outline" }), this.participants ? (h("ion-badge", { color: "secondary" }, this.participants)) : undefined)))),
            h("ion-content", { key: '77b847aa20c9fd41ef38452043e3ede06d85ddb5' }, h("app-chat", { key: '08cd2b0e1182f22cfa671026cd71c16a79ed9d97', chatId: this.chatId })),
        ];
    }
};
PageChat.style = pageChatCss;

export { PageChat as page_chat };

//# sourceMappingURL=page-chat.entry.js.map