import {Component, h, Host, Prop, State, Element} from "@stencil/core";
import {DiveTrip} from "../../../../../interfaces/udive/dive-trip/diveTrip";
import {TranslationService} from "../../../../../services/common/translations";
import {modalController} from "@ionic/core";
import {isString, orderBy, toNumber} from "lodash";
import {UserService} from "../../../../../services/common/user";
import {DiveTripsService} from "../../../../../services/udive/diveTrips";
import Swiper from "swiper";

@Component({
  tag: "modal-dive-trip-update",
  styleUrl: "modal-dive-trip-update.scss",
})
export class ModalDiveTripUpdate {
  @Element() el: HTMLElement;
  @Prop() diveTripId: string = undefined;
  @Prop() collectionId: string;
  @Prop() organiserId: string;
  @State() diveTrip: DiveTrip;
  @State() updateView = true;
  @State() validTrip = false;
  placeholder: string;
  @State() titles = [{tag: "dives"}, {tag: "team"}, {tag: "bookings"}];
  @State() slider: Swiper;

  async componentWillLoad() {
    await this.loadDiveTrip();
    this.placeholder = TranslationService.getTransl(
      "insert-title",
      "Insert title"
    );
  }

  async loadDiveTrip() {
    if (this.diveTripId) {
      this.diveTrip = await DiveTripsService.getDiveTrip(this.diveTripId);
    } else {
      this.diveTrip = new DiveTrip();
      this.diveTrip.organiser = {
        collectionId: this.collectionId,
        id: this.organiserId,
      };
      this.diveTrip.users = {
        [UserService.userRoles.uid]: ["owner"],
      };
    }
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-dive-trip", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
      on: {
        slideChange: () => {
          this.slider ? this.slider.updateAutoHeight() : null;
        },
      },
    });
    this.validateTrip();
  }

  async addDiveTrip(tripIndex?: number, diveIndex?: number) {
    this.diveTrip = await DiveTripsService.addDiveTrip(
      this.diveTrip,
      tripIndex,
      diveIndex
    );
    this.validateTrip();
  }

  removeDiveTrip(index) {
    this.diveTrip = DiveTripsService.removeDiveTrip(this.diveTrip, index);
    this.validateTrip();
  }

  removeTripDive(tripIndex, diveIndex) {
    this.diveTrip = DiveTripsService.removeTripDive(
      this.diveTrip,
      tripIndex,
      diveIndex
    );
    this.updateView = !this.updateView;
  }

  setTitle(ev) {
    this.diveTrip.displayName = ev.target.value;
    this.validateTrip();
  }

  validateTrip() {
    this.diveTrip.tripDives = orderBy(
      this.diveTrip.tripDives,
      "divePlan.dives[0].date"
    );
    this.validTrip =
      isString(this.diveTrip.displayName) &&
      this.diveTrip.displayName.length > 3 &&
      this.diveTrip.tripDives.length > 0;
    this.updateView = !this.updateView;
  }

  async save() {
    await DiveTripsService.updateDiveTrip(this.diveTripId, this.diveTrip);
    return modalController.dismiss(false);
  }

  async cancel() {
    return modalController.dismiss(true);
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color="divetrip">
            <ion-title>
              <ion-input
                placeholder={this.placeholder + "..."}
                inputmode="text"
                onIonInput={(ev) => this.setTitle(ev)}
                value={this.diveTrip.displayName}
              ></ion-input>
            </ion-title>
          </ion-toolbar>
        </ion-header>
        <app-header-segment-toolbar
          color="divetrip"
          swiper={this.slider}
          titles={this.titles}
        ></app-header-segment-toolbar>
        <ion-content class="slides">
          <swiper-container class="slider-dive-trip swiper">
            <swiper-wrapper class="swiper-wrapper">
              <swiper-slide class="swiper-slide">
                <ion-grid>
                  <ion-row class="ion-text-start">
                    {this.diveTrip.tripDives.map((trip, i) => (
                      <ion-col size-sm="12" size-md="6" size-lg="4">
                        <app-dive-trip-card
                          tripDive={trip}
                          editable={true}
                          updateView={this.updateView}
                          onAddDiveEmit={() => this.addDiveTrip(i)}
                          onRemoveDiveTripEmit={() => this.removeDiveTrip(i)}
                          onRemoveTripDiveEmit={(ev) =>
                            this.removeTripDive(i, toNumber(ev.detail))
                          }
                          onUpdateDiveEmit={(ev) =>
                            this.addDiveTrip(i, toNumber(ev.detail))
                          }
                        />
                      </ion-col>
                    ))}
                    <ion-col size-sm="12" size-md="6" size-lg="4">
                      <ion-card onClick={() => this.addDiveTrip()}>
                        <ion-card-content class="ion-text-center">
                          <ion-icon
                            name="add-circle-outline"
                            style={{fontSize: "130px"}}
                          ></ion-icon>
                        </ion-card-content>
                      </ion-card>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </swiper-slide>
              <swiper-slide class="swiper-slide">
                <app-users-list
                  item={this.diveTrip}
                  editable
                  show={["owner", "divemaster", "instructor"]}
                />
              </swiper-slide>

              <swiper-slide class="swiper-slide">
                <ion-grid>
                  <ion-row>
                    {Object.keys(this.diveTrip.tripDives).map((i) => (
                      <ion-col size-sm="12" size-md="12" size-lg="12">
                        <app-dive-trip-bookings
                          diveTrip={this.diveTrip}
                          diveTripId={this.diveTripId}
                          tripDiveIndex={toNumber(i)}
                          editable={true}
                        />
                      </ion-col>
                    ))}
                  </ion-row>
                </ion-grid>
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
        </ion-content>
        <app-modal-footer
          disableSave={!this.validTrip}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
