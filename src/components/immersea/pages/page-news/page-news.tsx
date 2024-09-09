import { isPlatform, menuController } from "@ionic/core";
import { Component, Element, h, State } from "@stencil/core";
import { ImmerseaService } from "../../../../services/immersea/services";

@Component({
  tag: "page-news",
  styleUrl: "page-news.scss",
})
export class PageNews {
  @State() scrollTop = 0;
  @Element() el: HTMLElement;
  @State() paddingTop: number;
  private slideOpts = {
    slidesPerView: 1.3,
    initialSlide: 1,
    centeredSlides: true,
    spaceBetween: 30,
  };

  componentDidLoad() {
    //height of shrinking header
    this.paddingTop = this.el.children[0].children[0].clientHeight + 20;
  }

  isScrolling(ev) {
    this.scrollTop = ev.detail.scrollTop;
  }

  render() {
    return [
      <ion-content
        fullscreen
        scrollEvents
        onIonScroll={(ev) => this.isScrolling(ev)}
      >
        <app-shrinking-header
          scrollTopValue={this.scrollTop}
          logoUrl='../assets/images/logo_immersea.svg'
          slogan='Immergiti, scopri la Sicilia'
        ></app-shrinking-header>
        <div
          class='main'
          style={
            this.paddingTop > 0
              ? { paddingTop: this.paddingTop + "px" }
              : undefined
          }
        >
          <app-sticky-search
            scrollTopValue={this.scrollTop}
            placeholderValue='dove vuoi andare?'
          ></app-sticky-search>
          <h1 class='title'>Consigliati per te</h1>
          <swiper-container class='swiper' options={this.slideOpts}>
            <swiper-wrapper class='swiper-wrapper'>
              <swiper-slide class='swiper-slide'>
                <ion-card
                  class='image-card'
                  onClick={() =>
                    ImmerseaService.presentInfoPopover({ ciao: "ciao" })
                  }
                >
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
                      <ion-card-title>Capo Gallo</ion-card-title>
                      <ion-card-subtitle>
                        Noto ritrovo si mante e squali bianchi.
                      </ion-card-subtitle>
                    </div>
                  </div>
                </ion-card>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <ion-card class='image-card'>
                  <div
                    class='cover'
                    style={{
                      backgroundImage:
                        "url(" +
                        "https://cdn.traghetti.com/porti/pantelleria59-77556.jpg" +
                        ")",
                    }}
                  >
                    <div class='titles'>
                      <ion-card-title>Pantelleria</ion-card-title>
                      <ion-card-subtitle>
                        Un'isola in mezzo al mare.
                      </ion-card-subtitle>
                    </div>
                  </div>
                </ion-card>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <ion-card class='image-card'>
                  <div
                    class='cover'
                    style={{
                      backgroundImage:
                        "url(" +
                        "https://cdn.traghetti.com/porti/stromboli71-66960.jpg" +
                        ")",
                    }}
                  >
                    <div class='titles'>
                      <ion-card-title>Stromboli</ion-card-title>
                      <ion-card-subtitle>Un vulcano attivo.</ion-card-subtitle>
                    </div>
                  </div>
                </ion-card>
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
          <h1 class='title'>Novità</h1>
          <swiper-container class='swiper' options={this.slideOpts}>
            <swiper-wrapper class='swiper-wrapper'>
              <swiper-slide class='swiper-slide'>
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
                      <ion-card-title>Capo Gallo</ion-card-title>
                      <ion-card-subtitle>
                        Noto ritrovo si mante e squali bianchi.
                      </ion-card-subtitle>
                    </div>
                  </div>
                </ion-card>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <ion-card class='image-card'>
                  <div
                    class='cover'
                    style={{
                      backgroundImage:
                        "url(" +
                        "https://cdn.traghetti.com/porti/pantelleria59-77556.jpg" +
                        ")",
                    }}
                  >
                    <div class='titles'>
                      <ion-card-title>Pantelleria</ion-card-title>
                      <ion-card-subtitle>
                        Un'isola in mezzo al mare.
                      </ion-card-subtitle>
                    </div>
                  </div>
                </ion-card>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <ion-card class='image-card'>
                  <div
                    class='cover'
                    style={{
                      backgroundImage:
                        "url(" +
                        "https://cdn.traghetti.com/porti/stromboli71-66960.jpg" +
                        ")",
                    }}
                  >
                    <div class='titles'>
                      <ion-card-title>Stromboli</ion-card-title>
                      <ion-card-subtitle>Un vulcano attivo.</ion-card-subtitle>
                    </div>
                  </div>
                </ion-card>
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
          <h1 class='title'>Preferiti</h1>
          <swiper-container class='swiper' options={this.slideOpts}>
            <swiper-wrapper class='swiper-wrapper'>
              <swiper-slide class='swiper-slide'>
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
                      <ion-card-title>Capo Gallo</ion-card-title>
                      <ion-card-subtitle>
                        Noto ritrovo si mante e squali bianchi.
                      </ion-card-subtitle>
                    </div>
                  </div>
                </ion-card>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <ion-card class='image-card'>
                  <div
                    class='cover'
                    style={{
                      backgroundImage:
                        "url(" +
                        "https://cdn.traghetti.com/porti/pantelleria59-77556.jpg" +
                        ")",
                    }}
                  >
                    <div class='titles'>
                      <ion-card-title>Pantelleria</ion-card-title>
                      <ion-card-subtitle>
                        Un'isola in mezzo al mare.
                      </ion-card-subtitle>
                    </div>
                  </div>
                </ion-card>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <ion-card class='image-card'>
                  <div
                    class='cover'
                    style={{
                      backgroundImage:
                        "url(" +
                        "https://cdn.traghetti.com/porti/stromboli71-66960.jpg" +
                        ")",
                    }}
                  >
                    <div class='titles'>
                      <ion-card-title>Stromboli</ion-card-title>
                      <ion-card-subtitle>Un vulcano attivo.</ion-card-subtitle>
                    </div>
                  </div>
                </ion-card>
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
          <h1 class='title'>Preferiti</h1>
          <swiper-container class='swiper' options={this.slideOpts}>
            <swiper-wrapper class='swiper-wrapper'>
              <swiper-slide class='swiper-slide'>
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
                      <ion-card-title>Capo Gallo</ion-card-title>
                      <ion-card-subtitle>
                        Noto ritrovo si mante e squali bianchi.
                      </ion-card-subtitle>
                    </div>
                  </div>
                </ion-card>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <ion-card class='image-card'>
                  <div
                    class='cover'
                    style={{
                      backgroundImage:
                        "url(" +
                        "https://cdn.traghetti.com/porti/pantelleria59-77556.jpg" +
                        ")",
                    }}
                  >
                    <div class='titles'>
                      <ion-card-title>Pantelleria</ion-card-title>
                      <ion-card-subtitle>
                        Un'isola in mezzo al mare.
                      </ion-card-subtitle>
                    </div>
                  </div>
                </ion-card>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <ion-card class='image-card'>
                  <div
                    class='cover'
                    style={{
                      backgroundImage:
                        "url(" +
                        "https://cdn.traghetti.com/porti/stromboli71-66960.jpg" +
                        ")",
                    }}
                  >
                    <div class='titles'>
                      <ion-card-title>Stromboli</ion-card-title>
                      <ion-card-subtitle>Un vulcano attivo.</ion-card-subtitle>
                    </div>
                  </div>
                </ion-card>
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
        </div>

        <ion-fab
          vertical='top'
          horizontal={isPlatform("ios") ? "start" : "end"}
          slot='fixed'
        >
          <ion-fab-button
            size='small'
            color='immersea'
            onClick={() => menuController.open("end")}
          >
            <app-user-avatar></app-user-avatar>
          </ion-fab-button>
        </ion-fab>
      </ion-content>,
    ];
  }
}
