import {
  Component,
  h,
  Prop,
  State,
  Watch,
  Host,
  Event,
  EventEmitter,
} from "@stencil/core";
import {reverseGeocode} from "../../../../../helpers/utils";
import {LocationIQ} from "../../../../../services/common/map";
import {toNumber, toString} from "lodash";

export interface DecimalCoords {
  lat: number;
  lon: number;
}
export interface DMSCoords {
  lat: {
    degrees: number;
    minutes: number;
    seconds: number;
  };
  lon: {
    degrees: number;
    minutes: number;
    seconds: number;
  };
}

@Component({
  tag: "app-coordinates",
  styleUrl: "app-coordinates.scss",
})
export class AppCoordinates {
  @Event() coordinatesEmit: EventEmitter<DecimalCoords>;
  @Event() addressEmit: EventEmitter<LocationIQ>;
  @Prop({mutable: true}) coordinates: DecimalCoords;
  @State() DMSCoordinates: DMSCoords;
  @State() location: LocationIQ;
  timer: number;

  @Watch("coordinates")
  updateCoords() {
    this.convertFromDecimals();
  }

  componentWillLoad() {
    this.convertFromDecimals();
  }

  decimalCoordinatesHandler(event: any) {
    this.coordinates[event.detail.name] = toNumber(event.detail.value);
  }

  DMSCoordinatesHandler(event: any) {
    switch (event.detail.name) {
      case "latitude-degrees":
        this.DMSCoordinates.lat.degrees = toNumber(event.detail.value);
        break;
      case "latitude-minutes":
        this.DMSCoordinates.lat.minutes = toNumber(event.detail.value);
        break;
      case "latitude-seconds":
        this.DMSCoordinates.lat.seconds = toNumber(event.detail.value);
        break;
      case "longitude-degrees":
        this.DMSCoordinates.lon.degrees = toNumber(event.detail.value);
        break;
      case "longitude-minutes":
        this.DMSCoordinates.lon.minutes = toNumber(event.detail.value);
        break;
      case "longitude-seconds":
        this.DMSCoordinates.lon.seconds = toNumber(event.detail.value);
        break;
    }
    this.convertToDecimals();
  }

  convertFromDecimals() {
    if (this.coordinates && this.coordinates.lat) {
      const lat = this.coordinates.lat;
      const lat_degree = Math.trunc(lat);
      const lat_minutesdecimal = (lat - lat_degree) * 60;
      const lat_minutes = Math.trunc(lat_minutesdecimal);
      const lat_seconds = Math.round((lat_minutesdecimal - lat_minutes) * 60);
      const lon = this.coordinates.lon;
      const lon_degree = Math.trunc(lon);
      const lon_minutesdecimal = (lon - lon_degree) * 60;
      const lon_minutes = Math.trunc(lon_minutesdecimal);
      const lon_seconds = Math.round((lon_minutesdecimal - lon_minutes) * 60);
      this.DMSCoordinates = {
        lat: {
          degrees: lat_degree,
          minutes: lat_minutes,
          seconds: lat_seconds,
        },
        lon: {
          degrees: lon_degree,
          minutes: lon_minutes,
          seconds: lon_seconds,
        },
      };
      this.reverseGeocode();
    }
  }

  convertToDecimals() {
    if (this.DMSCoordinates && this.DMSCoordinates.lat) {
      const lat =
        this.DMSCoordinates.lat.degrees +
        this.DMSCoordinates.lat.minutes / 60 +
        this.DMSCoordinates.lat.seconds / 3600;
      const lon =
        this.DMSCoordinates.lon.degrees +
        this.DMSCoordinates.lon.minutes / 60 +
        this.DMSCoordinates.lon.seconds / 3600;
      this.coordinates.lat = lat;
      this.coordinates.lon = lon;
      this.reverseGeocode();
    }
  }
  async reverseGeocode() {
    //set timer for geocode - wait until draggable marker is fixed or coordinates are written
    this.timer = 2000;
    this.countdown();
  }

  async executeReverseGeocode() {
    this.location = await reverseGeocode(
      this.coordinates.lat,
      this.coordinates.lon
    );
    this.addressEmit.emit(this.location);
  }

  countdown() {
    const timer = setTimeout(() => {
      this.timer -= 1;
      if (this.timer == 0) {
        this.executeReverseGeocode();
      } else {
        clearTimeout(timer);
        this.countdown();
      }
    }, 1);
  }

  coordinatesUpdated() {
    this.coordinatesEmit.emit(this.coordinates);
  }

  render() {
    return (
      <Host>
        {this.coordinates &&
        this.coordinates.lat &&
        this.DMSCoordinates &&
        this.DMSCoordinates.lat ? (
          <ion-grid>
            <ion-row>
              <ion-col>
                <app-form-item
                  label-tag="latitude"
                  label-text="Latitude"
                  value={toString(this.coordinates.lat)}
                  name="lat"
                  input-type="number"
                  onFormItemChanged={(ev) => this.decimalCoordinatesHandler(ev)}
                  onFormItemBlur={() => this.coordinatesUpdated()}
                  validator={[
                    {
                      name: "minmaxvalue",
                      options: {min: -90, max: 90},
                    },
                  ]}
                ></app-form-item>
              </ion-col>
              <ion-col>
                <ion-row>
                  <ion-col>
                    <app-form-item
                      label-tag="degrees"
                      label-text="Degrees"
                      value={toString(this.DMSCoordinates.lat.degrees)}
                      name="latitude-degrees"
                      input-type="number"
                      onFormItemChanged={(ev) => this.DMSCoordinatesHandler(ev)}
                      onFormItemBlur={() => this.coordinatesUpdated()}
                      validator={[
                        {
                          name: "minmaxvalue",
                          options: {min: -90, max: 90},
                        },
                      ]}
                    ></app-form-item>
                  </ion-col>
                  <ion-col>
                    <app-form-item
                      label-tag="minutes"
                      label-text="Minutes"
                      value={toString(
                        Math.abs(this.DMSCoordinates.lat.minutes)
                      )}
                      name="latitude-minutes"
                      input-type="number"
                      onFormItemChanged={(ev) => this.DMSCoordinatesHandler(ev)}
                      onFormItemBlur={() => this.coordinatesUpdated()}
                      validator={[
                        {
                          name: "minmaxvalue",
                          options: {min: 0, max: 60},
                        },
                      ]}
                    ></app-form-item>
                  </ion-col>
                  <ion-col>
                    <app-form-item
                      label-tag="seconds"
                      label-text="Seconds"
                      value={toString(
                        Math.abs(this.DMSCoordinates.lat.seconds)
                      )}
                      name="latitude-seconds"
                      input-type="number"
                      onFormItemChanged={(ev) => this.DMSCoordinatesHandler(ev)}
                      onFormItemBlur={() => this.coordinatesUpdated()}
                      validator={[
                        {
                          name: "minmaxvalue",
                          options: {min: 0, max: 60},
                        },
                      ]}
                    ></app-form-item>
                  </ion-col>
                </ion-row>
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col>
                <app-form-item
                  label-tag="longitude"
                  label-text="Longitude"
                  value={toString(this.coordinates.lon)}
                  name="lon"
                  input-type="number"
                  onFormItemChanged={(ev) => this.decimalCoordinatesHandler(ev)}
                  onFormItemBlur={() => this.coordinatesUpdated()}
                  validator={[
                    {
                      name: "minmaxvalue",
                      options: {min: -180, max: 180},
                    },
                  ]}
                ></app-form-item>
              </ion-col>
              <ion-col>
                <ion-row>
                  <ion-col>
                    <app-form-item
                      label-tag="degrees"
                      label-text="Degrees"
                      value={toString(this.DMSCoordinates.lon.degrees)}
                      name="longitude-degrees"
                      input-type="number"
                      onFormItemChanged={(ev) => this.DMSCoordinatesHandler(ev)}
                      onFormItemBlur={() => this.coordinatesUpdated()}
                      validator={[
                        {
                          name: "minmaxvalue",
                          options: {min: -180, max: 180},
                        },
                      ]}
                    ></app-form-item>
                  </ion-col>
                  <ion-col>
                    <app-form-item
                      label-tag="minutes"
                      label-text="Minutes"
                      value={toString(
                        Math.abs(this.DMSCoordinates.lon.minutes)
                      )}
                      name="longitude-minutes"
                      input-type="number"
                      onFormItemChanged={(ev) => this.DMSCoordinatesHandler(ev)}
                      onFormItemBlur={() => this.coordinatesUpdated()}
                      validator={[
                        {
                          name: "minmaxvalue",
                          options: {min: 0, max: 60},
                        },
                      ]}
                    ></app-form-item>
                  </ion-col>
                  <ion-col>
                    <app-form-item
                      label-tag="seconds"
                      label-text="Seconds"
                      value={toString(
                        Math.abs(this.DMSCoordinates.lon.seconds)
                      )}
                      name="longitude-seconds"
                      input-type="number"
                      onFormItemChanged={(ev) => this.DMSCoordinatesHandler(ev)}
                      onFormItemBlur={() => this.coordinatesUpdated()}
                      validator={[
                        {
                          name: "minmaxvalue",
                          options: {min: 0, max: 60},
                        },
                      ]}
                    ></app-form-item>
                  </ion-col>
                </ion-row>
              </ion-col>
            </ion-row>
            {this.location ? (
              <ion-row>
                <ion-col>
                  <ion-item color="dark" lines="none">
                    <ion-icon
                      name="navigate-circle-outline"
                      slot="start"
                    ></ion-icon>
                    <ion-label>{this.location.display_name}</ion-label>
                  </ion-item>
                </ion-col>
              </ion-row>
            ) : undefined}
          </ion-grid>
        ) : undefined}
      </Host>
    );
  }
}
