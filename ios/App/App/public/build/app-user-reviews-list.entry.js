import { r as registerInstance, h } from './index-d515af00.js';
import { b as USERPROFILECOLLECTION } from './utils-5cd4c7bb.js';
import { R as ReviewService } from './reviews-98eac7ec.js';
import { d as dateFns } from './index-9b61a50b.js';
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
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const appUserReviewsListCss = "app-user-reviews-list{}";

const AppUserReviewsList = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.collectionId = undefined;
        this.uid = undefined;
        this.reviewsList = [];
    }
    async componentDidLoad() {
        this.reviewsList = await ReviewService.getReviews(this.collectionId, this.uid);
    }
    openItem(review) {
        ReviewService.showReview(review.reviewId, this.collectionId !== USERPROFILECOLLECTION);
    }
    render() {
        return (h("ion-list", { key: '28361511910199da0aa7a3349a7556bd99fdbc9f' }, this.reviewsList.map((item) => (h("ion-item", { button: true, onClick: () => this.openItem(item) }, this.collectionId === USERPROFILECOLLECTION ? (item.reviewedObj && item.reviewedObj.photoURL ? (h("ion-avatar", { slot: "start" }, h("img", { src: item.reviewedObj.photoURL }))) : undefined) : item.user && item.user.photoURL ? (h("ion-avatar", { slot: "start" }, h("img", { src: item.user.photoURL }))) : undefined, h("ion-label", null, h("h3", null, this.collectionId === USERPROFILECOLLECTION
            ? item.reviewedObj.displayName
            : item.user.displayName), h("p", null, dateFns.format(item.date, "PPp"))))))));
    }
};
AppUserReviewsList.style = appUserReviewsListCss;

export { AppUserReviewsList as app_user_reviews_list };

//# sourceMappingURL=app-user-reviews-list.entry.js.map