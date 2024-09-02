import { Component, h, State } from "@stencil/core";
import { Advertising } from "../../../../../interfaces/common/advertising/advertising";
import { AdvertisingService } from "../../../../../services/common/advertising";
import { popoverController } from "@ionic/core";
import { Subscription } from "rxjs";

@Component({
  tag: "app-admin-advertising",
  styleUrl: "app-admin-advertising.scss",
})
export class AppAdminAdvertising {
  advertisingSub: Subscription;
  @State() advertisingArray: Advertising[] = [];
  editable: boolean = true;

  async componentWillLoad() {
    this.advertisingSub = AdvertisingService.advertisingObservable$.subscribe(
      (adverts) => {
        this.advertisingArray = adverts;
      }
    );
    AdvertisingService.getAdvertisingObservable();
  }

  async disconnectedCallback() {
    this.advertisingSub.unsubscribe();
    AdvertisingService.unsubscribeAdvertising();
  }

  async editAdvertising(event, advertising) {
    event.stopPropagation();
    const popover = await popoverController.create({
      component: "popover-edit-advertising",
      componentProps: { advertising: advertising },
      event: null,
      translucent: true,
    });
    popover.onDidDismiss().then(async (ev) => {
      if (ev) {
        const advertising = ev.data;
        await AdvertisingService.updateAdvertising(advertising);
      }
    });
    popover.present();
  }

  async removeAdvertising(event, advertising) {
    event.stopPropagation();
    await AdvertisingService.removeAdvertising(advertising);
  }

  render() {
    return (
      <ion-content>
        {this.editable ? (
          <ion-item
            button
            onClick={(ev) => this.editAdvertising(ev, null)}
            color='light'
          >
            <ion-icon name='add-circle' slot='start' color='beach'></ion-icon>
            <ion-label>
              <my-transl tag='add' text='Add' />
            </ion-label>
          </ion-item>
        ) : undefined}
        {this.advertisingArray.map((advert) => (
          <app-advertising-card
            edit={true}
            advertising={advert}
            onEditEmit={(ev) => this.editAdvertising(ev, advert)}
          />
        ))}
      </ion-content>
    );
  }
}
