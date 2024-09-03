import { r as registerInstance, h } from './index-d515af00.js';
import { R as ReviewService } from './reviews-a0a22621.js';
import { d as dateFns } from './index-9b61a50b.js';
import './utils-cbf49763.js';
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
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';

const appReviewDetailsCss = "app-review-details{}";

const AppReviewDetails = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.reviewId = undefined;
        this.color = undefined;
        this.review = undefined;
    }
    async componentWillLoad() {
        this.review = await ReviewService.getReview(this.reviewId);
    }
    render() {
        return this.review ? (h("ion-card", { color: this.color }, h("ion-card-header", null, h("ion-card-subtitle", null, h("my-transl", { tag: "your-review", text: "Your Review" })), h("ion-card-title", null, this.review.title), h("ion-card-subtitle", null, dateFns.format(this.review.date, "PPp")), h("app-star-rating", { stars: 5, size: 20, rating: this.review.stars })), h("ion-card-content", null, this.review.review, this.review.answer
            ? [
                h("h2", { style: {
                        borderTop: "1px solid",
                        marginTop: "10px",
                        paddingTop: "10px",
                    } }, h("my-transl", { tag: "answer", text: "Answer" })),
                h("p", null, this.review.answer),
            ]
            : undefined))) : undefined;
    }
};
AppReviewDetails.style = appReviewDetailsCss;

export { AppReviewDetails as app_review_details };

//# sourceMappingURL=app-review-details.entry.js.map