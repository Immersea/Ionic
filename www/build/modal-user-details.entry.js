import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { D as DatabaseService, q as USERPUBLICPROFILECOLLECTION, B as SystemService } from './utils-ced1e260.js';
import './index-be90eba5.js';
import { m as modalController } from './overlays-b3ceb97d.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-c3ad5e77.js';
import './ionic-global-c07767bf.js';
import './map-fe092362.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
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

const modalUserDetailsCss = "modal-user-details ion-grid{height:100%;padding:0}modal-user-details ion-row{align-items:center;text-align:center;width:100%}modal-user-details .name{margin-top:20px;font-weight:600;font-size:18pt;color:#777}modal-user-details .info{margin-top:-5px;margin-bottom:5px;font-family:\"Montserrat\", sans-serif;font-size:11pt;color:#aaa}";

const ModalUserDetails = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.userId = undefined;
        this.sysPref = undefined;
    }
    async componentWillLoad() {
        this.user = await DatabaseService.getDocument(USERPUBLICPROFILECOLLECTION, this.userId);
        this.sysPref = await SystemService.getSystemPreferences();
    }
    close() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: 'c0f38510bcaf0b461101b57588691e0cee1184b3' }, h("ion-content", { key: '21bbed34d24b2702f3ce9a1c9967dccaf9379348' }, h("ion-fab", { key: '686d36c281178f742ffdc517e21c553d4729fd54', vertical: "top", horizontal: "end", slot: "fixed" }, h("ion-fab-button", { key: '091e820a7fb5f5285a9a0330a6e2491373ff88cf', size: "small", onClick: () => this.close() }, h("ion-icon", { key: '77714722bcacbc4585bed49b3632100e2eb0c531', name: "close" }))), h("app-item-cover", { key: '97c55c1fefad3b0b277ca1f4e44fb29af7588f60', item: this.user }), h("ion-grid", { key: '4675bddeb263aa871f3016c1a15483601a0c3227' }, h("ion-row", { key: '427753270b0f844539a26e2eda3f621482fef7e6' }, h("ion-col", { key: '822daa21061c46f4895ce5911c938cafe64bb841' }, h("h1", { key: '12833f79167ae0841f5e223846d397b00d5f8ffb', class: "name" }, this.user.displayName))), this.user.address ? (h("ion-row", null, h("ion-col", null, h("p", { class: "info" }, h("ion-icon", { name: "navigate-outline" }), " ", this.user.address.display_name)))) : undefined, this.user.bio ? (h("ion-row", null, h("ion-col", null, h("ion-card", { class: "info" }, h("ion-card-subtitle", null, h("my-transl", { tag: "biography", text: "Biography" })), h("ion-card-content", null, this.user.bio))))) : undefined, this.user.email ? (h("ion-item", { button: true, href: "mailto:" + this.user.email }, h("ion-icon", { slot: "start", name: "at-outline" }), h("ion-label", null, this.user.email))) : undefined, this.user.website ? (h("ion-item", { button: true, href: "http://" + this.user.website, target: "_blank" }, h("ion-icon", { slot: "start", name: "link-outline" }), h("ion-label", null, this.user.website))) : undefined, this.user.facebook ? (h("ion-item", { button: true, href: "https://www.facebook.com/" + this.user.facebook, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-facebook" }), h("ion-label", null, this.user.facebook))) : undefined, this.user.instagram ? (h("ion-item", { button: true, href: "https://www.instagram.com/" + this.user.instagram, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-instagram" }), h("ion-label", null, this.user.instagram))) : undefined, this.user.twitter ? (h("ion-item", { button: true, href: "https://www.twitter.com/" + this.user.twitter, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-twitter" }), h("ion-label", null, "@", this.user.twitter))) : undefined, this.user.cards && this.user.cards.length > 0
            ? [
                h("ion-row", null, h("ion-col", null, h("h1", { class: "name" }, h("my-transl", { tag: "dive-cards", text: "Dive Cards" })))),
                h("ion-row", { class: "ion-text-start" }, this.user.cards.map((card) => (h("ion-col", { "size-sm": "12", "size-md": "6", "size-lg": "4" }, h("ion-card", null, h("ion-card-header", null, h("ion-item", { class: "ion-no-padding", lines: "none" }, h("ion-card-title", null, card.certificationId)), h("ion-card-subtitle", null, card.agencyId))))))),
            ]
            : undefined))));
    }
};
ModalUserDetails.style = modalUserDetailsCss;

export { ModalUserDetails as modal_user_details };

//# sourceMappingURL=modal-user-details.entry.js.map