import {Component, h, Prop, State} from "@stencil/core";
import {Review} from "../../../../../interfaces/common/reviews/review";
import {ReviewService} from "../../../../../services/common/reviews";
import {format} from "date-fns";

@Component({
  tag: "app-review-details",
  styleUrl: "app-review-details.scss",
})
export class AppReviewDetails {
  @Prop() reviewId: string;
  @Prop() color: string;
  @State() review: Review;

  async componentWillLoad() {
    this.review = await ReviewService.getReview(this.reviewId);
  }
  render() {
    return this.review ? (
      <ion-card color={this.color}>
        <ion-card-header>
          <ion-card-subtitle>
            <my-transl tag="your-review" text="Your Review" />
          </ion-card-subtitle>
          <ion-card-title>{this.review.title}</ion-card-title>
          <ion-card-subtitle>
            {format(this.review.date, "PPp")}
          </ion-card-subtitle>
          <app-star-rating
            stars={5}
            size={20}
            rating={this.review.stars}
          ></app-star-rating>
        </ion-card-header>

        <ion-card-content>
          {this.review.review}
          {this.review.answer
            ? [
                <h2
                  style={{
                    borderTop: "1px solid",
                    marginTop: "10px",
                    paddingTop: "10px",
                  }}
                >
                  <my-transl tag="answer" text="Answer" />
                </h2>,
                <p>{this.review.answer}</p>,
              ]
            : undefined}
        </ion-card-content>
      </ion-card>
    ) : undefined;
  }
}
