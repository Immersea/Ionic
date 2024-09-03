import { r as registerInstance, h } from './index-d515af00.js';
import { i as DivingCentersService, aA as ChatService, c as DIVECENTERSSCOLLECTION } from './utils-cbf49763.js';
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

const pageDivingChatsListCss = "page-diving-chats-list{}";

const PageDivingChatsList = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.divingCenter = undefined;
        this.dcId = undefined;
    }
    componentWillLoad() {
        this.dcSubscription = DivingCentersService.selectedDivingCenter$.subscribe((dc) => {
            if (dc && dc.displayName) {
                this.divingCenter = dc;
                this.dcId = DivingCentersService.selectedDivingCenterId;
            }
        });
    }
    disconnectedCallback() {
        if (this.dcSubscription)
            this.dcSubscription.unsubscribe();
    }
    render() {
        return [
            h("ion-header", { key: 'ed205b614e3cf79adcbc9bca3f533bcf50be3807' }, h("app-navbar", { key: 'b181b4b278a3de343a7ed1cf69ba6a666483ae9b', tag: 'chat', text: 'Chat', color: 'chat' })),
            h("ion-content", { key: '48aadee39e3a8f81a8de1706487c7f885e3bb505' }, h("ion-fab", { key: 'cae9a0db8990331fe4f60943385cb7b1570b56d6', horizontal: 'end', vertical: 'top', slot: 'fixed', edge: true }, h("ion-fab-button", { key: '729f9f8af9ec363077f18c5a0d13ee6faf065b65', color: 'chat', onClick: () => ChatService.addChat(DIVECENTERSSCOLLECTION, this.dcId, this.divingCenter.displayName) }, h("ion-icon", { key: 'def5b633f54bddc60ebdfd98371d3d47b1587d5e', name: 'add' }))), this.dcId ? (h("app-admin-chats", { filterByOrganisierId: this.dcId })) : undefined),
        ];
    }
};
PageDivingChatsList.style = pageDivingChatsListCss;

export { PageDivingChatsList as page_diving_chats_list };

//# sourceMappingURL=page-diving-chats-list.entry.js.map