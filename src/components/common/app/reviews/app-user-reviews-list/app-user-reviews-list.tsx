import { Component, h, Prop, State } from "@stencil/core";
import { ReviewSummary } from "../../../../../interfaces/common/reviews/review";
import { USERPROFILECOLLECTION } from "../../../../../services/common/user";
import { ReviewService } from "../../../../../services/common/reviews";
import { format } from "date-fns/format";

@Component({
  tag: "app-user-reviews-list",
  styleUrl: "app-user-reviews-list.scss",
})
export class AppUserReviewsList {
  @Prop() collectionId: string;
  @Prop() uid: string;
  @State() reviewsList: ReviewSummary[] = [];

  async componentDidLoad() {
    this.reviewsList = await ReviewService.getReviews(
      this.collectionId,
      this.uid
    );
  }
  openItem(review) {
    ReviewService.showReview(
      review.reviewId,
      this.collectionId !== USERPROFILECOLLECTION
    );
  }

  render() {
    return (
      <ion-list>
        {this.reviewsList.map((item) => (
          <ion-item button onClick={() => this.openItem(item)}>
            {this.collectionId === USERPROFILECOLLECTION ? (
              item.reviewedObj && item.reviewedObj.photoURL ? (
                <ion-avatar slot='start'>
                  <img src={item.reviewedObj.photoURL} />
                </ion-avatar>
              ) : undefined
            ) : item.user && item.user.photoURL ? (
              <ion-avatar slot='start'>
                <img src={item.user.photoURL} />
              </ion-avatar>
            ) : undefined}
            <ion-label>
              <h3>
                {this.collectionId === USERPROFILECOLLECTION
                  ? item.reviewedObj.displayName
                  : item.user.displayName}
              </h3>
              <p>{format(item.date, "PPp")}</p>
            </ion-label>
          </ion-item>
        ))}
      </ion-list>
    );
  }
}
