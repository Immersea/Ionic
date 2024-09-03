import { r as registerInstance, h } from './index-d515af00.js';
import { R as ReviewService } from './reviews-85226e0b.js';
import { d as dateFns } from './index-9b61a50b.js';
import './utils-ced1e260.js';
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
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';

const appLastReviewsCss = "app-last-reviews{}";

const AppLastReviews = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.collectionId = undefined;
        this.uid = undefined;
        this.reviewsList = [];
    }
    async componentWillLoad() {
        this.reviewsList = await ReviewService.queryReviews(this.collectionId, this.uid);
    }
    render() {
        return (h("ion-list", { key: '0790832949277426b3f441c351cc035df4d705ee' }, this.reviewsList.map((item) => (h("ion-card", null, h("ion-item", null, item.user && item.user.photoURL ? (h("ion-avatar", { slot: "start" }, h("img", { src: item.user.photoURL }))) : undefined, h("ion-label", null, h("p", null, item.user.displayName), h("p", null, dateFns.format(item.date, "PPp"))), h("ion-note", { slot: "end" }, h("app-star-rating", { stars: 5, size: 20, rating: item.stars }))), h("ion-card-content", null, item.review, item.answer
            ? [
                h("h2", { style: {
                        borderTop: "1px solid",
                        marginTop: "10px",
                        paddingTop: "10px",
                    } }, h("my-transl", { tag: "answer", text: "Answer" })),
                h("p", null, item.answer),
            ]
            : undefined))))));
    }
};
AppLastReviews.style = appLastReviewsCss;

export { AppLastReviews as app_last_reviews };

//# sourceMappingURL=app-last-reviews.entry.js.map