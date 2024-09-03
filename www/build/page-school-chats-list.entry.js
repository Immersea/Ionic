import { r as registerInstance, h } from './index-d515af00.js';
import { n as DivingSchoolsService, aA as ChatService, m as DIVESCHOOLSSCOLLECTION } from './utils-ced1e260.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-c3ad5e77.js';
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
import './map-fe092362.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';

const pageSchoolChatsListCss = "page-school-chats-list{}";

const PageSchoolChatsList = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.divingSchool = undefined;
    }
    componentWillLoad() {
        this.dsSubscription = DivingSchoolsService.selectedDivingSchool$.subscribe((dc) => {
            if (dc && dc.displayName) {
                this.divingSchool = dc;
                this.divingSchoolId = DivingSchoolsService.selectedDivingSchoolId;
            }
        });
    }
    disconnectedCallback() {
        this.dsSubscription.unsubscribe();
    }
    render() {
        return [
            h("ion-header", { key: '6fc90770f04bede2a95e5dde50bba8a7fef580c5' }, h("app-navbar", { key: '2b8f92fea25d2b7c4abd116138a205fa4746d77b', tag: 'chat', text: 'Chat', color: 'chat' })),
            h("ion-content", { key: '9c7bd746b6b46c4f8cdedcbb2ad200a2d9056146' }, h("ion-fab", { key: '0d662856744da657b39b1f90241f8bffa5d664ce', horizontal: 'end', vertical: 'top', slot: 'fixed', edge: true }, h("ion-fab-button", { key: '55779ec7bacc035d010cda6f8791724ec5aaec41', color: 'chat', onClick: () => ChatService.addChat(DIVESCHOOLSSCOLLECTION, this.divingSchoolId, this.divingSchool.displayName) }, h("ion-icon", { key: 'ec9deab374bacf3e04b5d45701527d95b2cf7668', name: 'add' }))), this.divingSchoolId ? (h("app-admin-chats", { filterByOrganisierId: this.divingSchoolId })) : undefined),
        ];
    }
};
PageSchoolChatsList.style = pageSchoolChatsListCss;

export { PageSchoolChatsList as page_school_chats_list };

//# sourceMappingURL=page-school-chats-list.entry.js.map