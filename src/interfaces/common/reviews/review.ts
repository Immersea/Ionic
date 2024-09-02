import { UserService } from "../../../services/common/user";
import { MapDataUserPubicProfile } from "../user/user-public-profile";

export interface ReviewSummary {
  reviewId: string;
  userId: string; //only for beach/kiosk reviews
  reviewed: {
    //only for users review
    collectionId: string;
    id: string;
  };
  reviewedObj?: any; //added after query
  user?: MapDataUserPubicProfile; //added after query
  date: string;
  title: string;
}
export interface ReviewSummaryDoc {
  stars: number;
  totReviews: number;
  collectionId: string;
  reviews: ReviewSummary[];
}

export class Review {
  userId: string;
  reviewed: {
    collectionId: string;
    id: string;
  };
  reviewItem: {
    collectionId: string;
    id: string;
  };
  reviewedObj?: any; //added after query
  user?: MapDataUserPubicProfile; //added after query
  date: Date;
  stars: number;
  title: string;
  review: string;
  answer: string;

  constructor(data?) {
    this.userId = data && data.uid ? data.uid : UserService.userProfile.uid;
    this.reviewed = {
      collectionId:
        data && data.reviewed && data.reviewed.collectionId
          ? data.reviewed.collectionId
          : null,
      id: data && data.reviewed && data.reviewed.id ? data.reviewed.id : null,
    };
    this.reviewItem = {
      collectionId:
        data && data.reviewItem && data.reviewItem.collectionId
          ? data.reviewItem.collectionId
          : null,
      id:
        data && data.reviewItem && data.reviewItem.id
          ? data.reviewItem.id
          : null,
    };
    this.date = data && data.date ? data.date : new Date();
    this.stars = data && data.stars ? data.stars : 5;
    this.title = data && data.title ? data.title : "";
    this.review = data && data.review ? data.review : "";
    this.answer = data && data.answer ? data.answer : "";
  }
}

export interface ReviewsDoc {
  [reviewId: string]: Review;
}
