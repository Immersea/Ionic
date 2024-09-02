import { R as RouterService, D as DatabaseService, U as UserService, b as USERPROFILECOLLECTION, f as firestore } from './utils-5cd4c7bb.js';
import { _ } from './lodash-68d560b6.js';
import { R as collection, Q as query, T as where, W as orderBy, a7 as limitToLast, U as getDocs } from './map-e64442d7.js';

const REVIEWCOLLECTION = "reviews";
class ReviewController {
    async createReview(collectionId, reviewedid, itemCollectionId, itemId, item) {
        const popover = await RouterService.openPopover("popover-create-review", {
            editable: true,
            collectionId: collectionId,
            reviewedId: reviewedid,
            itemCollectionId: itemCollectionId,
            itemId: itemId,
        });
        popover.onDidDismiss().then((res) => {
            if (res && res.data) {
                this.saveReview(res.data, item);
            }
        });
    }
    async showReview(reviewId, allowAnswer = false) {
        const review = await this.getReview(reviewId);
        const popover = await RouterService.openPopover("popover-create-review", {
            editable: false,
            review: review,
            allowAnswer: allowAnswer,
        }, true);
        popover.onDidDismiss().then((res) => {
            if (res && res.data) {
                const review = res.data;
                delete review.reviewdObj;
                delete review.user;
                this.updateReview(reviewId, res.data);
            }
        });
    }
    async getReview(id) {
        const review = await DatabaseService.getDocument(REVIEWCOLLECTION, id);
        if (review) {
            if (review.userId) {
                review.user = await UserService.getMapDataUserDetails(review.userId);
            }
            if (review.reviewed) {
                review.reviewedObj = await UserService.getOrganiser("item", {
                    collectionId: review.reviewed.collectionId,
                    id: review.reviewed.id,
                });
            }
        }
        return review;
    }
    async getReviews(collectionId, id) {
        const res = await this.getReviewSummaryDoc(collectionId, id);
        let reviews = [];
        if (res && res.totReviews > 0) {
            await res.reviews.forEach(async (review) => {
                if (review.userId) {
                    review.user = await UserService.getMapDataUserDetails(review.userId);
                }
                if (review.reviewed) {
                    review.reviewedObj = await UserService.getOrganiser("item", {
                        collectionId: review.reviewed.collectionId,
                        id: review.reviewed.id,
                    });
                }
                reviews.push(review);
            });
        }
        return _.orderBy(reviews, "date", "desc");
    }
    async getReviewSummaryDoc(collectionId, id) {
        return (await DatabaseService.getDocumentCollection(collectionId, id, REVIEWCOLLECTION, REVIEWCOLLECTION));
    }
    //query reviews for user or reviewed
    async queryReviews(collectionId, id) {
        console.log("queryReviews", collectionId, id, USERPROFILECOLLECTION);
        let ref = collection(firestore, REVIEWCOLLECTION);
        let queryRef = null;
        if (collectionId === USERPROFILECOLLECTION) {
            queryRef = query(ref, where("userId", "==", id), orderBy("date"), limitToLast(10));
        }
        else {
            queryRef = query(ref, where("reviewed.collectionId", "==", collectionId), where("reviewed.id", "==", id), orderBy("date"), limitToLast(5));
        }
        const res = await getDocs(queryRef);
        const results = [];
        if (!res.empty) {
            for (let doc of res.docs) {
                const query = doc.data();
                query.user = await UserService.getMapDataUserDetails(query.userId);
                query.reviewedObj = await UserService.getOrganiser("item", {
                    collectionId: query.reviewed.collectionId,
                    id: query.reviewed.id,
                });
                results.push(query);
            }
            return results;
        }
        return null;
    }
    async saveReview(review, item) {
        const res = await DatabaseService.addDocument(REVIEWCOLLECTION, review);
        if (res && res.id && item) {
            !item.reviewIds ? (item.reviewIds = []) : undefined;
            //write review in the item
            item.reviewIds.push({
                uid: UserService.userProfile.uid,
                reviewId: res.id,
            });
            //write review id and userId in the reviewed item
            await DatabaseService.updateDocument(review.reviewItem.collectionId, review.reviewItem.id, item);
        }
    }
    async updateReview(reviewId, review) {
        await DatabaseService.updateDocument(REVIEWCOLLECTION, reviewId, review);
    }
    async getReviewSummary(collectionId, id) {
        const reviews = (await DatabaseService.getDocumentCollection(collectionId, id, REVIEWCOLLECTION, REVIEWCOLLECTION));
        if (reviews && reviews.stars > 0) {
            return reviews;
        }
        else {
            return {
                stars: 0,
                totReviews: 0,
                reviews: [],
                collectionId: collectionId,
            };
        }
    }
}
const ReviewService = new ReviewController();

export { ReviewService as R };

//# sourceMappingURL=reviews-98eac7ec.js.map