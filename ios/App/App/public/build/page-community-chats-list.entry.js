import { r as registerInstance, h } from './index-d515af00.js';
import { p as DiveCommunitiesService, aA as ChatService, o as DIVECOMMUNITIESCOLLECTION } from './utils-5cd4c7bb.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-0a7fccce.js';
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
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const pageCommunityChatsListCss = "page-community-chats-list{}";

const PageCommunityChatsList = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.diveCommunity = undefined;
        this.dcId = undefined;
    }
    componentWillLoad() {
        this.dcSubscription =
            DiveCommunitiesService.selectedDiveCommunity$.subscribe((dc) => {
                if (dc && dc.displayName) {
                    this.diveCommunity = dc;
                    this.dcId = DiveCommunitiesService.selectedDiveCommunityId;
                }
            });
    }
    disconnectedCallback() {
        if (this.dcSubscription)
            this.dcSubscription.unsubscribe();
    }
    render() {
        return [
            h("ion-header", { key: '3c32e68b8ef3ff6e3e38311c7733e0573acd4fc1' }, h("app-navbar", { key: 'b79dcf7a975de9a3b3ac27d3c1d8d21949ccb6d3', tag: 'chat', text: 'Chat', color: 'chat' })),
            h("ion-content", { key: 'bcf909839ab9c7e045a033b8aee8f008fa41f943' }, h("ion-fab", { key: 'ff311a1c8383052c8c9d3065aee4d30f64a42567', horizontal: 'end', vertical: 'top', slot: 'fixed', edge: true }, h("ion-fab-button", { key: '819ca75101da98fec0303867eeec9d290d85fe39', color: 'chat', onClick: () => ChatService.addChat(DIVECOMMUNITIESCOLLECTION, this.dcId, this.diveCommunity.displayName) }, h("ion-icon", { key: '579aaddb25f9c66d8faf8309a156adf70d84537a', name: 'add' }))), this.dcId ? (h("app-admin-chats", { filterByOrganisierId: this.dcId })) : undefined),
        ];
    }
};
PageCommunityChatsList.style = pageCommunityChatsListCss;

export { PageCommunityChatsList as page_community_chats_list };

//# sourceMappingURL=page-community-chats-list.entry.js.map