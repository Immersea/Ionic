import { Component, h, State } from "@stencil/core";
import { menuController } from "@ionic/core";

@Component({
  tag: "page-sea",
  styleUrl: "page-sea.scss",
})
export class PageSea {
  @State() segmentSelected = "home";
  segmentChanged(ev) {
    this.segmentSelected = ev.detail.value;
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color='immersea'>
          <ion-title>Le meraviglie naturali</ion-title>
          <ion-buttons slot='secondary'>
            <ion-button onClick={() => menuController.open("end")}>
              <app-user-avatar size={32}></app-user-avatar>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
        <ion-toolbar color='immersea'>
          <ion-segment
            mode='md'
            scrollable
            value='home'
            onIonChange={(ev) => this.segmentChanged(ev)}
          >
            <ion-segment-button value='home'>
              <ion-icon name='fish-outline'></ion-icon>
            </ion-segment-button>
            <ion-segment-button value='luoghi'>
              <ion-label>Luoghi</ion-label>
            </ion-segment-button>
            <ion-segment-button value='itinerari'>
              <ion-label>Itinerari</ion-label>
            </ion-segment-button>
            <ion-segment-button value='storie'>
              <ion-label>Storie</ion-label>
            </ion-segment-button>
            <ion-segment-button value='sostenibilita'>
              <ion-label>Sostenibilità</ion-label>
            </ion-segment-button>
          </ion-segment>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        {this.segmentSelected == "home" ? (
          <ion-row>
            <ion-col size='12' sizeSm='6'>
              <ion-card class='image-card'>
                <div
                  class='cover'
                  style={{
                    backgroundImage:
                      "url(" +
                      "https://pbs.twimg.com/media/C98Ym2VXUAIQ-QY.jpg" +
                      ")",
                  }}
                >
                  <div class='titles'>
                    <ion-card-title>Titolo</ion-card-title>
                    <ion-card-subtitle>Sottotitolo</ion-card-subtitle>
                  </div>
                </div>
              </ion-card>
            </ion-col>
            <ion-col size='12' sizeSm='6'>
              <ion-card class='image-card'>
                <div
                  class='cover'
                  style={{
                    backgroundImage:
                      "url(" +
                      "https://image.jimcdn.com/app/cms/image/transf/none/path/sb97633a4ffd1294b/image/i5bbbd714e8d50367/version/1518112206/scuba-diving-in-thailand.jpg" +
                      ")",
                  }}
                >
                  <div class='titles'>
                    <ion-card-title>Titolo</ion-card-title>
                    <ion-card-subtitle>Sottotitolo</ion-card-subtitle>
                  </div>
                </div>
              </ion-card>
            </ion-col>
            <ion-col size='12' sizeSm='6'>
              <ion-card class='image-card'>
                <div
                  class='cover'
                  style={{
                    backgroundImage:
                      "url(" +
                      "https://image.jimcdn.com/app/cms/image/transf/none/path/sb97633a4ffd1294b/image/i5bbbd714e8d50367/version/1518112206/scuba-diving-in-thailand.jpg" +
                      ")",
                  }}
                >
                  <div class='titles'>
                    <ion-card-title>Titolo</ion-card-title>
                    <ion-card-subtitle>Sottotitolo</ion-card-subtitle>
                  </div>
                </div>
              </ion-card>
            </ion-col>
            <ion-col size='12' sizeSm='6'>
              <ion-card class='image-card'>
                <div
                  class='cover'
                  style={{
                    backgroundImage:
                      "url(" +
                      "https://image.jimcdn.com/app/cms/image/transf/none/path/sb97633a4ffd1294b/image/i5bbbd714e8d50367/version/1518112206/scuba-diving-in-thailand.jpg" +
                      ")",
                  }}
                >
                  <div class='titles'>
                    <ion-card-title>Titolo</ion-card-title>
                    <ion-card-subtitle>Sottotitolo</ion-card-subtitle>
                  </div>
                </div>
              </ion-card>
            </ion-col>
            <ion-col size='12' sizeSm='6'>
              <ion-card class='image-card'>
                <div
                  class='cover'
                  style={{
                    backgroundImage:
                      "url(" +
                      "https://image.jimcdn.com/app/cms/image/transf/none/path/sb97633a4ffd1294b/image/i5bbbd714e8d50367/version/1518112206/scuba-diving-in-thailand.jpg" +
                      ")",
                  }}
                >
                  <div class='titles'>
                    <ion-card-title>Titolo</ion-card-title>
                    <ion-card-subtitle>Sottotitolo</ion-card-subtitle>
                  </div>
                </div>
              </ion-card>
            </ion-col>
            <ion-col size='12' sizeSm='6'>
              <ion-card class='image-card'>
                <div
                  class='cover'
                  style={{
                    backgroundImage:
                      "url(" +
                      "https://image.jimcdn.com/app/cms/image/transf/none/path/sb97633a4ffd1294b/image/i5bbbd714e8d50367/version/1518112206/scuba-diving-in-thailand.jpg" +
                      ")",
                  }}
                >
                  <div class='titles'>
                    <ion-card-title>Titolo</ion-card-title>
                    <ion-card-subtitle>Sottotitolo</ion-card-subtitle>
                  </div>
                </div>
              </ion-card>
            </ion-col>
          </ion-row>
        ) : undefined}
        {this.segmentSelected == "luoghi" ? <p>Luoghi</p> : undefined}
        {this.segmentSelected == "itinerari" ? <p>itinerari</p> : undefined}
        {this.segmentSelected == "storie" ? <p>storie</p> : undefined}
        {this.segmentSelected == "sostenibilita" ? (
          <p>sostenibilita</p>
        ) : undefined}
      </ion-content>,
    ];
  }
}
