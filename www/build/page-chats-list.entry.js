import { r as registerInstance, h } from './index-d515af00.js';
import { aA as ChatService, b as USERPROFILECOLLECTION, U as UserService } from './utils-cbf49763.js';
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

const pageChatsListCss = "page-chats-list{}";

const PageChatsList = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    render() {
        return [
            h("ion-header", { key: '78365925dde7b3bf60531179eac57f926bc0cae5' }, h("app-navbar", { key: '9493bfc25afbccbac1361e2ecb59e5dc449cc2de', tag: 'chat', text: 'Chat', color: 'chat' })),
            h("ion-content", { key: '526e2e765fe25ec90ebc9fa6916da10b5988f49f' }, h("ion-fab", { key: 'b427cca5a42d505f79b1e4ee6b393fc879470fc1', horizontal: 'end', vertical: 'top', slot: 'fixed', edge: true }, h("ion-fab-button", { key: 'a09c9fc02a57c0d3c37c9595f46c2dc274cd0b71', color: 'chat', onClick: () => ChatService.addChat(USERPROFILECOLLECTION, UserService.userProfile.uid, UserService.userProfile.displayName) }, h("ion-icon", { key: '4166ab0d8c5c7041a06fdf10892d0e3eef53b0d9', name: 'add' }))), h("app-admin-chats", { key: 'a0832f9d98826703ad5c5253f25d18c2684ab54a' })),
        ];
    }
};
PageChatsList.style = pageChatsListCss;

export { PageChatsList as page_chats_list };

//# sourceMappingURL=page-chats-list.entry.js.map