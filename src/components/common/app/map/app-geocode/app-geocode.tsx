import {
  Component,
  h,
  Prop,
  Watch,
  State,
  Event,
  EventEmitter,
  Host,
} from "@stencil/core";
import {LOCATIONIQ_GEOCODE} from "../../../../../global/env";
import {LocationIQ} from "../../../../../services/common/map";

@Component({
  tag: "app-geocode",
  styleUrl: "app-geocode.scss",
})
export class AppGeocode {
  @Event() locationsFound: EventEmitter;
  @Event() locationSelected: EventEmitter;
  geocoder: any;
  @Prop({mutable: true}) address: string = "";
  @Prop({mutable: true}) gotFocus: boolean = false;
  timer: number;
  resultFound = false;
  showNoResults = false;

  @State() results: Array<LocationIQ> = [];

  @Watch("address")
  startTimer() {
    this.resultFound = false;
    //wait for user to finish typing
    this.timer = 1500;
    this.countdown();
  }

  countdown() {
    const timer = setTimeout(() => {
      this.timer -= 1;
      if (this.timer == 0) {
        this.fetchGeocode();
      } else {
        clearTimeout(timer);
        this.countdown();
      }
    }, 1);
  }

  async fetchGeocode() {
    if (this.address && this.address.length > 10) {
      const req =
        "https://eu1.locationiq.com/v1/search.php?limit=10&addressdetails=1&key=" +
        LOCATIONIQ_GEOCODE +
        "&q=" +
        this.address.replace(" ", "+") +
        "&format=json&accept-language=en";
      fetch(req).then(
        async (response) => {
          if (response.ok) {
            this.results = await response.json();
            this.showNoResults = false;
            this.locationsFound.emit(this.results);
          } else {
            this.results = [];
            this.showNoResults = true;
            this.locationsFound.emit(false);
          }
        },
        () => {
          this.results = [];
          this.showNoResults = true;
          this.locationsFound.emit(false);
        }
      );
    }
  }

  selectLocation(loc: LocationIQ) {
    this.results = [];
    this.address = loc.display_name;
    this.locationSelected.emit(loc);
    this.resultFound = true;
  }

  render() {
    return (
      <Host>
        {!this.resultFound && this.gotFocus ? (
          <ion-list>
            {this.address &&
            this.address.length > 0 &&
            this.results.length == 0 &&
            !this.showNoResults ? (
              <ion-item color="light">
                <ion-icon
                  name="navigate-circle-outline"
                  slot="start"
                ></ion-icon>
                <ion-label>
                  <ion-skeleton-text
                    animated
                    style={{width: "60%"}}
                  ></ion-skeleton-text>
                </ion-label>
              </ion-item>
            ) : undefined}
            {this.showNoResults ? (
              <ion-item color="danger">
                <ion-icon name="alert" slot="start"></ion-icon>
                <ion-label>
                  <my-transl
                    tag="no-locations"
                    text="No locations found!"
                  ></my-transl>
                </ion-label>
              </ion-item>
            ) : (
              this.results.map((loc) => (
                <ion-item
                  button
                  color="dark"
                  onClick={() => this.selectLocation(loc)}
                >
                  <ion-icon
                    name="navigate-circle-outline"
                    slot="start"
                  ></ion-icon>
                  <ion-label>{loc.display_name}</ion-label>
                </ion-item>
              ))
            )}
          </ion-list>
        ) : undefined}
      </Host>
    );
  }
}
