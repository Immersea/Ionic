import { Component, h, Prop, State } from "@stencil/core";
import { distance } from "../../../../../helpers/utils";
import { MapDataDivingCenter } from "../../../../../interfaces/udive/diving-center/divingCenter";
import { DivingCentersService } from "../../../../../services/udive/divingCenters";

@Component({
  tag: "app-diving-center-card",
  styleUrl: "app-diving-center-card.scss",
})
export class AppDivingCenterCard {
  @Prop() divingCenterId: string;
  @Prop() startlocation: any;
  @State() divingCenter: MapDataDivingCenter;

  componentWillLoad() {
    this.divingCenter = DivingCentersService.divingCentersList.find(
      (item) => item.id == this.divingCenterId
    );
  }

  render() {
    return (
      <ion-card
        onClick={() =>
          DivingCentersService.presentDivingCenterDetails(this.divingCenterId)
        }
      >
        <app-item-cover item={this.divingCenter} />
        <ion-card-header>
          <ion-item class='ion-no-padding' lines='none'>
            <ion-card-title>{this.divingCenter.displayName}</ion-card-title>
          </ion-item>
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
                      this.divingCenter.position.geopoint.latitude,
                      this.divingCenter.position.geopoint.longitude
                    ),
                ]
              : undefined}
          </ion-card-content>
        </ion-card-header>
      </ion-card>
    );
  }
}
