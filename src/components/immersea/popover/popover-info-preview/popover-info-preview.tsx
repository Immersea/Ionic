import {popoverController} from "@ionic/core";
import {Component, h} from "@stencil/core";
import {ImmerseaLocationsService} from "../../../../services/immersea/immerseaLocations";

@Component({
  tag: "popover-info-preview",
  styleUrl: "popover-info-preview.scss",
})
export class PopoverInfoPreview {
  location = {
    id: "123",
    title: "Titolo",
    subtitle: "Sottotitolo",
    description: "Lores ipsum ...",
    coverURL:
      "https://www.gue.com/sites/default/files/education-julian-muehlenhaus-1440.jpg",
    markers: [
      {
        collection: "CIAO",
        id: "123",
        name: "PiPPO",
        icon: {
          type: "ionicon",
          name: "sunny",
          color: "beach",
          size: "large",
        },
        latitude: 45.12345,
        longitude: 12.12345,
        position: {
          geopoint: {
            latitude: 45.12345,
            longitude: 12.12345,
          },
        },
      },
    ],
  };
  close() {
    popoverController.dismiss();
  }
  readMore() {
    this.close();
    ImmerseaLocationsService.presentLocationDetails(this.location.id);
  }
  render() {
    return (
      <div class="outer-content">
        <ion-fab vertical="top" horizontal="start" slot="fixed">
          <ion-fab-button color="immersea" onClick={() => this.close()}>
            <ion-icon name="arrow-back"></ion-icon>
          </ion-fab-button>
        </ion-fab>
        <ion-card>
          <app-item-cover item={this.location} />
          <ion-card-header>
            <ion-item class="ion-no-padding" lines="none">
              <ion-label>
                <h1>{this.location.title}</h1>
              </ion-label>
              <ion-button icon-only slot="end" color="immersea" fill="clear">
                <ion-icon name="share-social-outline"></ion-icon>
              </ion-button>
              <ion-button icon-only slot="end" color="danger" fill="clear">
                <ion-icon name="heart-outline"></ion-icon>
              </ion-button>
            </ion-item>

            {this.location.subtitle ? (
              <ion-card-subtitle>{this.location.subtitle}</ion-card-subtitle>
            ) : undefined}
          </ion-card-header>
          <ion-card-content onClick={() => this.readMore()}>
            <div>
              <p>{this.location.description}</p>
              <a>Leggi di più...</a>
            </div>
            <div class="map-container">
              <app-map
                id="map"
                pageId={"info-preview"}
                markers={this.location.markers}
                center={this.location.markers[0]}
                currentPosition={false}
              ></app-map>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    );
  }
}
