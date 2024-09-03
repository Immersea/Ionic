import { r as registerInstance, h } from './index-d515af00.js';
import { U as UserService, B as SystemService } from './utils-ced1e260.js';
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

const appPublicUserCss = "app-public-user{}";

const AppPublicUser = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.userId = undefined;
        this.userProfile = undefined;
        this.sysPref = undefined;
    }
    async componentWillLoad() {
        if (this.userId) {
            this.userProfile = await UserService.getPublicProfileUserDetails(this.userId);
        }
        this.sysPref = await SystemService.getSystemPreferences();
    }
    render() {
        return [
            h("ion-list", { key: '9af7bcd600a3d66945640fd85995a01446a1a316' }, this.userProfile.address ? (h("ion-item", null, h("ion-icon", { slot: "start", name: "home-outline" }), h("ion-label", { class: "ion-text-wrap" }, this.userProfile.address.display_name))) : undefined, this.userProfile.email ? (h("ion-item", { button: true, href: "mailto:" + this.userProfile.email }, h("ion-icon", { slot: "start", name: "at-outline" }), h("ion-label", null, this.userProfile.email))) : undefined, this.userProfile.website ? (h("ion-item", { button: true, href: "http://" + this.userProfile.website, target: "_blank" }, h("ion-icon", { slot: "start", name: "link-outline" }), h("ion-label", null, this.userProfile.website))) : undefined, this.userProfile.facebook ? (h("ion-item", { button: true, href: "https://www.facebook.com/" + this.userProfile.facebook, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-facebook" }), h("ion-label", null, this.userProfile.facebook))) : undefined, this.userProfile.instagram ? (h("ion-item", { button: true, href: "https://www.instagram.com/" + this.userProfile.instagram, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-instagram" }), h("ion-label", null, this.userProfile.instagram))) : undefined, this.userProfile.twitter ? (h("ion-item", { button: true, href: "https://www.twitter.com/" + this.userProfile.twitter, target: "_blank" }, h("ion-icon", { slot: "start", name: "logo-twitter" }), h("ion-label", null, "@", this.userProfile.twitter))) : undefined, this.userProfile.bio ? (h("ion-item", null, h("ion-label", { class: "ion-text-wrap" }, h("ion-text", { color: "primary" }, h("my-transl", { tag: "biography", text: "Biography" })), h("p", null, this.userProfile.bio)))) : undefined),
            h("ion-grid", { key: '40d55136024d9b5dfcca8338dff31d9cc99785c6' }, h("ion-row", { key: '70802d625d4fad499becb2ff7370fa09dec95e0c' }, this.userProfile.cards.length > 0
                ? this.userProfile.cards.map((card) => (h("ion-col", { "size-sm": "12", "size-md": "6", "size-lg": "4" }, h("ion-card", null, h("ion-card-header", null, h("ion-card-title", null, card.certificationId), h("ion-card-subtitle", null, card.agencyId))))))
                : undefined)),
        ];
    }
};
AppPublicUser.style = appPublicUserCss;

export { AppPublicUser as app_public_user };

//# sourceMappingURL=app-public-user.entry.js.map