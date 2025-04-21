import { Component, h, Prop, Event, EventEmitter } from "@stencil/core";
import { DiveSitesService } from "../../../../../services/udive/diveSites";
import { distance } from "../../../../../helpers/utils";
import { MapDataDiveSite } from "../../../../../interfaces/udive/dive-site/diveSite";

@Component({
  tag: "app-dive-site-card",
  styleUrl: "app-dive-site-card.scss",
})
export class AppDiveSiteCard {
  @Prop() diveSite: MapDataDiveSite;
  @Prop() startlocation: any;
  @Prop() edit = false;
  @Event() removeEmit: EventEmitter<any>;

  componentDidLoad() {
    console.log("this.startlocation", this.startlocation, this.diveSite);
  }

  removeDiveSite(ev) {
    ev.stopPropagation();
    this.removeEmit.emit(this.diveSite.id);
  }

  render() {
    return (
      <ion-card
        onClick={() =>
          !this.edit
            ? DiveSitesService.presentDiveSiteDetails(this.diveSite.id)
            : null
        }
      >
        <app-item-cover item={this.diveSite} />
        <ion-card-header>
          <ion-item class='ion-no-padding' lines='none'>
            {this.edit ? (
              <ion-button
                icon-only
                slot='end'
                color='danger'
                fill='clear'
                onClick={(ev) => this.removeDiveSite(ev)}
              >
                <ion-icon name='trash-bin-outline'></ion-icon>
              </ion-button>
            ) : undefined}

            <ion-card-title>{this.diveSite.displayName}</ion-card-title>
          </ion-item>
          <ion-card-subtitle>
            {DiveSitesService.getSiteTypeName(this.diveSite.type)}
          </ion-card-subtitle>
          <ion-card-content>
            {this.startlocation
              ? [
                  <my-transl tag='distance' text='Distance'></my-transl>,
                  ": " +
                    distance(
                      this.startlocation.latitude
                        ? this.startlocation.latitude
                        : this.startlocation.position.geopoint.latitude,
                      this.startlocation.longitude
                        ? this.startlocation.longitude
                        : this.startlocation.position.geopoint.longitude,
                      this.diveSite.position.geopoint.latitude,
                      this.diveSite.position.geopoint.longitude
                    ),
                ]
              : undefined}
          </ion-card-content>
        </ion-card-header>
      </ion-card>
    );
  }
}
