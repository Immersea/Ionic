import * as functions from "firebase-functions";
import {REGION, MEMORY, TIMEOUT, db} from "./c-system";
import {USERPROFILECOLLECTIONNAME} from "./c-users";

export const REVIEWCOLLECTION = "reviews";

export const updateReviews = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(REVIEWCOLLECTION + "/{reviewId}")
  .onWrite(async (change, context) => {
    const promises = [];
    const reviewId = context.params.reviewId;
    const review =
      change && change.after && change.after.data()
        ? change.after.data()
        : null;
    const previousReview =
      change && change.before && change.before.data()
        ? change.before.data()
        : null;
    const collectionId = review
      ? review.reviewed.collectionId
      : previousReview
        ? previousReview.reviewed.collectionId
        : null;
    const reviewedId = review
      ? review.reviewed.id
      : previousReview
        ? previousReview.reviewed.id
        : null;
    const summaryReviewRef = db
      .doc(`/${collectionId}/${reviewedId}`)
      .collection(REVIEWCOLLECTION)
      .doc(`/${REVIEWCOLLECTION}`);
    const summaryReviewDoc = await summaryReviewRef.get();
    const summaryReviewData = summaryReviewDoc.data();

    const userId = review
      ? review.userId
      : previousReview
        ? previousReview.userId
        : null;
    const summaryReviewUserRef = db
      .doc(`/${USERPROFILECOLLECTIONNAME}/${userId}`)
      .collection(REVIEWCOLLECTION)
      .doc(`/${REVIEWCOLLECTION}`);
    const summaryReviewUserDoc = await summaryReviewUserRef.get();
    const summaryReviewUserData = summaryReviewUserDoc.data();
    if (review) {
      //update or create review for reviewed item
      const summaryReview = summaryReviewData
        ? summaryReviewData
        : {
            stars: 0,
            totReviews: 0,
            collectionId: collectionId, //used for query top stars in different collections
            reviews: [],
          };
      //calculate new average rating
      summaryReview.stars =
        (summaryReview.stars * summaryReview.totReviews + review.stars) /
        (summaryReview.totReviews + 1);
      summaryReview.totReviews = summaryReview.totReviews + 1;
      summaryReview.reviews.push({
        reviewId: reviewId,
        userId: review.userId,
        date: review.date,
        title: review.title,
      });
      if (previousReview) {
        //check if rating changed
        if (previousReview.stars !== review.stars) {
          promises.push(summaryReviewRef.set(summaryReview));
        }
      } else {
        //new review
        promises.push(summaryReviewRef.set(summaryReview));
        //write review in user reviews
        const summaryReviewUser = summaryReviewUserData
          ? summaryReviewUserData
          : {
              totReviews: 0,
              reviews: [],
            };
        summaryReviewUser.totReviews = summaryReviewUser.totReviews + 1;
        summaryReviewUser.reviews.push({
          reviewId: reviewId,
          reviewed: review.reviewed,
          date: review.date,
          title: review.title,
        });
        promises.push(summaryReviewUserRef.set(summaryReviewUser));
      }
    } else {
      //delete
      //update review for reviewed item
      if (summaryReviewData) {
        summaryReviewData.stars =
          (summaryReviewData.stars * summaryReviewData.totReviews -
            (previousReview ? previousReview.stars : 0)) /
          (summaryReviewData.totReviews - 1);
        summaryReviewData.totReviews = summaryReviewData.totReviews - 1;
        const reviewIndex = summaryReviewData.reviews.findIndex(
          (x: any) => x.reviewId === reviewId
        );
        summaryReviewData.reviews.splice(reviewIndex, 1);
        promises.push(summaryReviewRef.set(summaryReviewData));

        /*
      //delete review from item
      const reviewedItemRef = db.doc(
        `/${review.reviewItem.collectionId}/${review.reviewItem.id}`
      );
      const reviewedItemDoc = await reviewedItemRef.get();
      const reviewedItemData = reviewedItemDoc.data();
      const index = reviewedItemData.reviewIds.findIndex(
        (x) => x.reviewId === reviewId
      );
      reviewedItemData.reviewIds.splice(index, 1);
      promises.push(reviewedItemRef.set(reviewedItemData));
      */
        if (summaryReviewUserData) {
          //delete review from user review
          const reviewUserIndex = summaryReviewUserData.reviews.findIndex(
            (x: any) => x.reviewId === reviewId
          );
          summaryReviewUserData.reviews.splice(reviewUserIndex, 1);
          promises.push(summaryReviewUserRef.set(summaryReviewUserData));
        }
      }
    }
    return Promise.all(promises);
  });
