import {Component, State, h} from "@stencil/core";

@Component({
  tag: "page-trs-dashboard",
  styleUrl: "page-trs-dashboard.scss",
})
export class PageTrsDashboard {
  @State() companies: any[] = [];

  componentWillLoad() {}

  componentDidLoad() {}

  render() {
    return [
      <ion-header>
        <app-navbar
          tag="dashboard"
          text="Dashboard"
          color="trasteel"
        ></app-navbar>
      </ion-header>,
      <ion-content>
        {this.companies.length == 0 ? (
          <div>
            <ion-item>
              <ion-thumbnail slot="start">
                <ion-skeleton-text></ion-skeleton-text>
              </ion-thumbnail>
              <ion-label>
                <h2>
                  <ion-skeleton-text
                    animated
                    style={{width: "80%"}}
                  ></ion-skeleton-text>
                </h2>
                <ion-skeleton-text
                  animated
                  style={{width: "60%"}}
                ></ion-skeleton-text>
              </ion-label>
            </ion-item>
          </div>
        ) : (
          <ion-list>
            {this.companies.forEach((company) => [
              <ion-item-sliding>
                <ion-item>
                  <ion-thumbnail slot="start">
                    <img src={company?.img} />
                  </ion-thumbnail>
                  <ion-label>
                    <h2>{company?.name}</h2>
                    <p>{company?.phone}</p>
                  </ion-label>
                </ion-item>

                <ion-item-options side="start">
                  <ion-item-option color="primary">
                    Mark Favorite
                  </ion-item-option>
                </ion-item-options>

                <ion-item-options side="end">
                  <ion-item-option color="danger">Delete</ion-item-option>
                </ion-item-options>
              </ion-item-sliding>,
            ])}
          </ion-list>
        )}
      </ion-content>,
    ];
  }
}
