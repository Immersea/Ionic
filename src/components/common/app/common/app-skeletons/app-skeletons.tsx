import { Component, h, Prop } from "@stencil/core";

@Component({
  tag: "app-skeletons",
  styleUrl: "app-skeletons.scss",
})
export class AppSkeletons {
  @Prop() skeleton: string;

  createSkeleton() {
    switch (this.skeleton) {
      case "chat":
        return (
          <ion-item>
            <ion-avatar slot='start'>
              <ion-skeleton-text animated></ion-skeleton-text>
            </ion-avatar>
            <ion-label>
              <h1>
                <ion-skeleton-text
                  animated
                  style={{ width: "50%" }}
                ></ion-skeleton-text>
              </h1>
              <p>
                <ion-skeleton-text
                  animated
                  style={{ width: "70%" }}
                ></ion-skeleton-text>
              </p>
            </ion-label>
            <ion-note>
              <ion-skeleton-text animated></ion-skeleton-text>
            </ion-note>
          </ion-item>
        );
      case "diveTrip":
        return (
          <ion-item>
            <ion-avatar slot='start'>
              <ion-skeleton-text animated></ion-skeleton-text>
            </ion-avatar>
            <ion-label>
              <h2>
                <ion-skeleton-text
                  animated
                  style={{ width: "50%" }}
                ></ion-skeleton-text>
              </h2>
              <h4>
                <ion-skeleton-text
                  animated
                  style={{ width: "60%" }}
                ></ion-skeleton-text>
              </h4>
              <p>
                <ion-skeleton-text
                  animated
                  style={{ width: "70%" }}
                ></ion-skeleton-text>
              </p>
            </ion-label>
          </ion-item>
        );
      case "diveTripBooking":
        return (
          <ion-item>
            <ion-avatar slot='start'>
              <ion-skeleton-text animated></ion-skeleton-text>
            </ion-avatar>
            <ion-label>
              <ion-skeleton-text
                animated
                style={{ width: "80%" }}
              ></ion-skeleton-text>
            </ion-label>
          </ion-item>
        );
      case "userDivePlan":
        return (
          <ion-card>
            <ion-item>
              <ion-label>
                <h2>
                  <ion-skeleton-text
                    animated
                    style={{ width: "40%" }}
                  ></ion-skeleton-text>
                </h2>
                <p>
                  <ion-skeleton-text
                    animated
                    style={{ width: "60%" }}
                  ></ion-skeleton-text>
                </p>
              </ion-label>
            </ion-item>
            <ion-item detail>
              <ion-thumbnail slot='start'>
                <ion-skeleton-text animated></ion-skeleton-text>
              </ion-thumbnail>
              <ion-label>
                <h3>
                  <ion-skeleton-text
                    animated
                    style={{ width: "50%" }}
                  ></ion-skeleton-text>
                </h3>
                <h4>
                  <ion-skeleton-text
                    animated
                    style={{ width: "60%" }}
                  ></ion-skeleton-text>
                </h4>
                <p>
                  <ion-skeleton-text
                    animated
                    style={{ width: "80%" }}
                  ></ion-skeleton-text>
                </p>
              </ion-label>
            </ion-item>
          </ion-card>
        );
    }
  }
  render() {
    return this.createSkeleton();
  }
}
