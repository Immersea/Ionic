import { Component, h, Host, Prop, State, Element } from "@stencil/core";
import { TranslationService } from "../../../../services/common/translations";
import { isDate, isNumber, isString, toNumber } from "lodash";
import { MapDataDiveSite } from "../../../../interfaces/udive/dive-site/diveSite";
import { popoverController } from "@ionic/core";
import { DiveSitesService } from "../../../../services/udive/diveSites";
import { TripDive } from "../../../../interfaces/udive/dive-trip/diveTrip";
import { MapDataDivingCenter } from "../../../../interfaces/udive/diving-center/divingCenter";
import { DivingCentersService } from "../../../../services/udive/divingCenters";

@Component({
  tag: "popover-new-dive-trip",
  styleUrl: "popover-new-dive-trip.scss",
})
export class PopoverNewDiveTrip {
  @Element() el: HTMLElement;
  @Prop() tripDive: TripDive;
  @Prop() diveIndex: number;
  @State() diveSite: MapDataDiveSite;
  @State() updateView = false;
  @State() noDivePlans = false;
  @State() validTrip = false;
  sitesList: MapDataDiveSite[] = [];
  divingCentersList: MapDataDivingCenter[] = [];
  tripDate: Date;
  divePlanTitle: string;
  divePlanName: string;
  divingCenterId: string;
  participants: number;
  surfaceInterval: number;

  async componentWillLoad() {
    this.sitesList = DiveSitesService.diveSitesList;
    this.divingCentersList = DivingCentersService.divingCentersList;
  }

  componentDidLoad() {
    //if diveIndex is null -> add new dive - else edit existing dive
    if (this.tripDive && this.diveIndex >= 0) {
      this.participants = this.tripDive.numberOfParticipants;
      this.tripDate = this.tripDive.divePlan.dives[0].date;
      this.diveSite = this.sitesList.find(
        (site) =>
          site.id === this.tripDive.divePlan.dives[this.diveIndex].diveSiteId
      );
      this.divingCenterId =
        this.tripDive.divePlan.dives[this.diveIndex].divingCenterId;
      this.setSelectDivePlans();
      this.divePlanTitle = this.tripDive.divePlan.title;
      this.divePlanName = this.tripDive.divePlan.configuration
        ? this.tripDive.divePlan.configuration.stdName
        : null;
      this.surfaceInterval =
        this.diveIndex > 0
          ? this.tripDive.divePlan.dives[this.diveIndex].surfaceInterval
          : undefined;
      this.validateTrip();
    }
  }

  async openSearchSite() {
    const popover = await popoverController.create({
      component: "popover-search-dive-site",
      translucent: true,
    });
    popover.onDidDismiss().then((ev) => {
      this.divePlanName = null;
      const siteId = ev.data;
      this.diveSite = this.sitesList.find((site) => site.id === siteId);
      this.validateTrip();
      this.setSelectDivePlans();
    });
    popover.present();
  }

  setSelectDivePlans() {
    const selectElement: HTMLIonSelectElement =
      this.el.querySelector("#selectDivePlans");
    const customPopoverOptions = {
      header: TranslationService.getTransl("dive-profile", "Dive Profile"),
    };

    selectElement.interfaceOptions = customPopoverOptions;
    //remove previously defined options
    const selectOptions = Array.from(
      selectElement.getElementsByTagName("ion-select-option")
    );
    selectOptions.map((option) => {
      selectElement.removeChild(option);
    });
    if (this.diveSite.divePlans && this.diveSite.divePlans.length > 0) {
      selectElement.placeholder = TranslationService.getTransl(
        "select",
        "Select"
      );
      this.diveSite.divePlans.map((plan) => {
        const selectOption = document.createElement("ion-select-option");
        selectOption.value = plan;
        selectOption.textContent = plan;
        selectElement.appendChild(selectOption);
      });
      this.noDivePlans = false;
      selectElement.disabled = false;
    } else {
      selectElement.placeholder = TranslationService.getTransl(
        "no-profiles",
        "No Dive Profiles available for this site"
      );
      selectElement.disabled = true;
      this.noDivePlans = true;
    }

    const selectDCElement: HTMLIonSelectElement = this.el.querySelector(
      "#selectDivingCenter"
    );
    const customDCPopoverOptions = {
      header: TranslationService.getTransl("diving-center", "Diving Center"),
    };

    selectDCElement.interfaceOptions = customDCPopoverOptions;
    //remove previously defined options
    const selectDCOptions = Array.from(
      selectDCElement.getElementsByTagName("ion-select-option")
    );
    selectDCOptions.map((option) => {
      selectDCElement.removeChild(option);
    });
    if (this.diveSite.divingCenters && this.diveSite.divingCenters.length > 0) {
      selectDCElement.placeholder = TranslationService.getTransl(
        "select",
        "Select"
      );
      //add empty selection
      const selectOption = document.createElement("ion-select-option");
      selectOption.value = null;
      selectOption.textContent = "-";
      selectDCElement.appendChild(selectOption);
      this.diveSite.divingCenters.map((dcId) => {
        const selectOption = document.createElement("ion-select-option");
        const dc = this.divingCentersList.find((dc) => dc.id === dcId);
        selectOption.value = dcId;
        selectOption.textContent = dc.displayName;
        selectDCElement.appendChild(selectOption);
      });
      selectDCElement.disabled = false;
    } else {
      selectDCElement.placeholder = TranslationService.getTransl(
        "no-divecenters",
        "No Diving Centers available for this site"
      );
      selectDCElement.disabled = true;
    }

    this.updateView = !this.updateView;
  }

  updateDate(ev) {
    this.tripDate = new Date(ev.detail.value);
    this.validateTrip();
  }

  updateSurfaceInterval(value) {
    this.surfaceInterval = value;
    this.validateTrip();
  }

  updateParticipants(ev) {
    this.participants = toNumber(ev.detail.value);
    this.validateTrip();
  }

  updateTitle(ev) {
    this.divePlanTitle = ev.detail.value;
    this.validateTrip();
  }

  updateDivePlanName(ev) {
    this.divePlanName = ev.detail.value;
  }

  updateDivingCenter(ev) {
    this.divingCenterId = ev.detail.value;
  }

  validateTrip() {
    //
    this.validTrip =
      ((!this.diveIndex && !this.tripDive) || this.diveIndex === 0
        ? isDate(this.tripDate) &&
          isNumber(this.participants) &&
          isString(this.divePlanTitle)
        : isNumber(this.surfaceInterval)) &&
      this.diveSite &&
      isString(this.diveSite.id);
    this.updateView = !this.updateView;
  }

  async save() {
    popoverController.dismiss({
      participants: this.participants,
      date: this.tripDate,
      title: this.divePlanTitle,
      diveSiteId: this.diveSite.id,
      divingCenterId: this.divingCenterId,
      divePlanName: this.divePlanName,
      surfaceInterval: this.surfaceInterval,
    });
  }

  cancel() {
    popoverController.dismiss();
  }

  render() {
    return (
      <Host>
        <ion-toolbar>
          <ion-title>
            <my-transl tag='dive-trip' text='Dive Trip' />
          </ion-title>
        </ion-toolbar>
        {(!this.diveIndex && !this.tripDive) || this.diveIndex === 0 ? (
          [
            <app-form-item
              label-tag='date-time'
              label-text='Date/Time'
              value={
                this.tripDate
                  ? this.tripDate.toISOString()
                  : new Date().toISOString()
              }
              name='tripDate'
              input-type='date'
              datePresentation='date-time'
              lines='inset'
              onFormItemChanged={(ev) => this.updateDate(ev)}
            ></app-form-item>,
            <app-form-item
              label-tag='title'
              label-text='Title'
              value={this.divePlanTitle}
              name='divePlanTitle'
              input-type='text'
              lines='inset'
              onFormItemChanged={(ev) => this.updateTitle(ev)}
            ></app-form-item>,
            <app-form-item
              label-tag='number-participants'
              label-text='Max Number of Participants'
              value={this.participants}
              name='participants'
              input-type='number'
              lines='inset'
              onFormItemChanged={(ev) => this.updateParticipants(ev)}
            ></app-form-item>,
          ]
        ) : (
          <ion-item>
            <ion-select
              label={TranslationService.getTransl(
                "surface-interval",
                "Surface Interval"
              )}
              onIonChange={(ev) => this.updateSurfaceInterval(ev.detail.value)}
              value={this.surfaceInterval}
            >
              <ion-select-option value={0.5}>0:30</ion-select-option>
              <ion-select-option value={1}>1:00</ion-select-option>
              <ion-select-option value={1.5}>1:30</ion-select-option>
              <ion-select-option value={2}>2:00</ion-select-option>
              <ion-select-option value={2.5}>2:30</ion-select-option>
              <ion-select-option value={3}>3:00</ion-select-option>
              <ion-select-option value={3.5}>3:30</ion-select-option>
              <ion-select-option value={4}>4:00</ion-select-option>
              <ion-select-option value={4.5}>4:30</ion-select-option>
              <ion-select-option value={5}>5:00</ion-select-option>
              <ion-select-option value={5.5}>5:30</ion-select-option>
              <ion-select-option value={6}>6:00</ion-select-option>
              <ion-select-option value={6.5}>6:30</ion-select-option>
              <ion-select-option value={7}>7:00</ion-select-option>
              <ion-select-option value={7.5}>7:30</ion-select-option>
              <ion-select-option value={8}>8:00</ion-select-option>
              <ion-select-option value={8.5}>8:30</ion-select-option>
              <ion-select-option value={9}>9:00</ion-select-option>
              <ion-select-option value={9.5}>9:30</ion-select-option>
              <ion-select-option value={10}>10:00</ion-select-option>
              <ion-select-option value={10.5}>10:30</ion-select-option>
              <ion-select-option value={11}>11:00</ion-select-option>
              <ion-select-option value={11.5}>11:30</ion-select-option>
              <ion-select-option value={12}>12:00</ion-select-option>
            </ion-select>
          </ion-item>
        )}

        <ion-item button onClick={() => this.openSearchSite()}>
          <ion-input
            label={TranslationService.getTransl("dive-site", "Dive Site")}
            label-placement='floating'
            placeholder={TranslationService.getTransl(
              "select-dive-site",
              "Select Dive Site"
            )}
            value={this.diveSite ? this.diveSite.displayName : undefined}
          ></ion-input>
          <ion-icon slot='end' name='search-outline'></ion-icon>
        </ion-item>
        <ion-item>
          <ion-select
            label={TranslationService.getTransl("dive-profile", "Dive Profile")}
            id='selectDivePlans'
            onIonChange={(ev) => this.updateDivePlanName(ev)}
            disabled={true}
            value={this.divePlanName}
          ></ion-select>
        </ion-item>
        <ion-item>
          <ion-select
            label={TranslationService.getTransl(
              "diving-center",
              "Diving Center"
            )}
            id='selectDivingCenter'
            onIonChange={(ev) => this.updateDivingCenter(ev)}
            disabled={true}
            value={this.divingCenterId}
          ></ion-select>
        </ion-item>

        <app-modal-footer
          disableSave={!this.validTrip}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
