import { Component, h, Prop } from "@stencil/core";
import { Marker } from "../../../../../interfaces/interfaces";
import { MapService } from "../../../../../services/common/map";

@Component({
  tag: "app-map-icon",
  styleUrl: "app-map-icon.scss",
})
export class AppMapIcon {
  @Prop() marker: Marker;

  isAvatar = false;
  componentWillLoad() {
    this.isAvatar = this.marker.icon.type === "avatar";
  }

  markerClicked(marker) {
    MapService.markerClicked(marker);
  }

  render() {
    return (
      <div class={!this.isAvatar && this.marker.name ? "bkg" : undefined}>
        {this.isAvatar ? (
          <ion-chip
            color={this.marker.icon.color}
            onClick={() => this.markerClicked(this.marker)}
          >
            {this.marker.icon.url ? (
              <ion-avatar>
                <img src={this.marker.icon.url} />
              </ion-avatar>
            ) : undefined}

            <ion-label>{this.marker.name}</ion-label>
          </ion-chip>
        ) : (
          [
            <ion-icon
              color={this.marker.icon.color}
              size={this.marker.icon.size}
              class={
                this.marker.icon.type == "mapicon"
                  ? "marker map-icon " + this.marker.icon.name
                  : this.marker.icon.type == "udiveicon"
                  ? "marker udive-icon " + this.marker.icon.name
                  : "marker"
              }
              name={
                this.marker.icon.type == "ionicon"
                  ? this.marker.icon.name
                  : undefined
              }
            ></ion-icon>,
            this.marker.name ? (
              <p>
                <strong>
                  <ion-text
                    style={{
                      color: "var(--" + this.marker.icon.color + "-contrast)",
                    }}
                  >
                    {this.marker.name}
                  </ion-text>
                </strong>
              </p>
            ) : undefined,
          ]
        )}
      </div>
    );
  }
}
