import {Component, h, Prop, State} from "@stencil/core";
import {Review} from "../../../../../interfaces/common/reviews/review";
import {ReviewService} from "../../../../../services/common/reviews";
import {format} from "date-fns";

@Component({
  tag: "app-last-reviews",
  styleUrl: "app-last-reviews.scss",
})
export class AppLastReviews {
  @Prop() collectionId: string;
  @Prop() uid: string;
  @State() reviewsList: Review[] = [];

  async componentWillLoad() {
    this.reviewsList = await ReviewService.queryReviews(
      this.collectionId,
      this.uid
    );
  }

  render() {
    return (
      <ion-list>
        {this.reviewsList.map((item) => (
          <ion-card>
            <ion-item>
              {item.user && item.user.photoURL ? (
                <ion-avatar slot="start">
                  <img src={item.user.photoURL} />
                </ion-avatar>
              ) : undefined}
              <ion-label>
                <p>{item.user.displayName}</p>
                <p>{format(item.date, "PPp")}</p>
              </ion-label>
              <ion-note slot="end">
                <app-star-rating
                  stars={5}
                  size={20}
                  rating={item.stars}
                ></app-star-rating>
              </ion-note>
            </ion-item>
            <ion-card-content>
              {item.review}
              {item.answer
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
                    <p>{item.answer}</p>,
                  ]
                : undefined}
            </ion-card-content>
          </ion-card>
        ))}
      </ion-list>
    );
  }
}
