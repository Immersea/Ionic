import { r as registerInstance, h } from './index-d515af00.js';
import { l as ServiceCentersService, aA as ChatService, k as SERVICECENTERSCOLLECTION } from './utils-ced1e260.js';
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

const pageServiceChatsListCss = "page-service-chats-list{}";

const PageServiceChatsList = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.serviceCenter = undefined;
    }
    componentWillLoad() {
        this.scSubscription =
            ServiceCentersService.selectedServiceCenter$.subscribe((sc) => {
                if (sc && sc.displayName) {
                    this.serviceCenter = sc;
                    this.scId = ServiceCentersService.selectedServiceCenterId;
                }
            });
    }
    disconnectedCallback() {
        if (this.scSubscription)
            this.scSubscription.unsubscribe();
    }
    render() {
        return [
            h("ion-header", { key: 'c79d9b8a2e2c3940fe8d103126622e25be42f665' }, h("app-navbar", { key: 'fbaffb6b949acf024d914aff0d4988ec1b1881f8', tag: 'chat', text: 'Chat', color: 'chat' })),
            h("ion-content", { key: 'f6de31542d2560d87f37797d9800a9de13820dd4' }, h("ion-fab", { key: 'e644049aceace9fb0019008e810dd7a21ad9e7f5', horizontal: 'end', vertical: 'top', slot: 'fixed', edge: true }, h("ion-fab-button", { key: 'aafa913d74e61c00ff6ba0ebbe9daad41f614b12', color: 'chat', onClick: () => ChatService.addChat(SERVICECENTERSCOLLECTION, this.scId, this.serviceCenter.displayName) }, h("ion-icon", { key: 'f849721f74a42041b462c0df89aad36bf91ba908', name: 'add' }))), this.scId ? (h("app-admin-chats", { filterByOrganisierId: this.scId })) : undefined),
        ];
    }
};
PageServiceChatsList.style = pageServiceChatsListCss;

export { PageServiceChatsList as page_service_chats_list };

//# sourceMappingURL=page-service-chats-list.entry.js.map