import {
  Advertising,
  AdvertisingDoc,
} from "../../interfaces/common/advertising/advertising";
import { DatabaseService } from "./database";
import { SYSTEMCOLLECTION } from "./system";
import { orderBy } from "lodash";
import { alertController } from "@ionic/core";
import { TranslationService } from "./translations";
import { BehaviorSubject, Subscription } from "rxjs";
import { StorageService } from "./storage";

export const ADVERTISINGDOC = "advertising";

export class AdvertisingController {
  advertisingDoc: AdvertisingDoc;
  advertisingDocSub: Subscription;
  advertisingObservable$: BehaviorSubject<Advertising[]> = new BehaviorSubject(
    <Advertising[]>[]
  );

  async getAdvertisingObservable() {
    const observable = await DatabaseService.getDocumentObservable(
      SYSTEMCOLLECTION,
      ADVERTISINGDOC
    );
    this.advertisingDocSub = observable.subscribe((doc) => {
      this.advertisingDoc = {};
      Object.keys(doc).map((key) => {
        this.advertisingDoc[key] = new Advertising(doc[key]);
      });
      this.advertisingObservable$.next(this.getAdvertisingArray());
    });
  }

  unsubscribeAdvertising() {
    this.advertisingDocSub ? this.advertisingDocSub.unsubscribe() : undefined;
  }

  async getActiveAdvertising(): Promise<Advertising[]> {
    const res = await DatabaseService.getDocument(
      SYSTEMCOLLECTION,
      ADVERTISINGDOC
    );
    this.advertisingDoc = {};
    if (res) {
      Object.keys(res).map((key) => {
        if (res[key].active) {
          this.advertisingDoc[key] = res[key];
        }
      });
    }
    return this.getAdvertisingArray();
  }

  getAdvertisingArray(): Advertising[] {
    const array = [];
    Object.keys(this.advertisingDoc).map((key) => {
      array.push(this.advertisingDoc[key]);
    });
    return orderBy(array, "order");
  }

  async updateAdvertising(advertising: Advertising) {
    this.advertisingDoc[advertising.id] = advertising;
    this.reorderAdvertDoc();
    await this.saveAdvertDoc();
  }

  reorderAdvertDoc() {
    //reorder items
    let array = [];
    Object.keys(this.advertisingDoc).map((key) => {
      array.push(this.advertisingDoc[key]);
    });
    array = orderBy(array, "order");
    let order = 0;
    array.map((item) => {
      item.order = order;
      order++;
      this.advertisingDoc[item.id] = item;
    });
  }

  async saveAdvertDoc() {
    await DatabaseService.updateDocument(
      SYSTEMCOLLECTION,
      ADVERTISINGDOC,
      this.advertisingDoc
    );
  }

  async removeAdvertising(advertising: Advertising) {
    const confirm = await alertController.create({
      header: TranslationService.getTransl(
        "delete-advertising-header",
        "Delete Advertising?"
      ),
      message: TranslationService.getTransl(
        "delete-advertising-message",
        "This advertising will be deleted! Are you sure?"
      ),
      buttons: [
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: () => {
            delete this.advertisingDoc[advertising.id];
            StorageService.deletePhotoURLs(ADVERTISINGDOC, advertising.id);
            this.reorderAdvertDoc();
            this.saveAdvertDoc();
          },
        },
      ],
    });
    confirm.present();
  }

  followAdvertisingLink(advertising) {
    window.open("http://" + advertising.link, "_blank");
  }
}

export const AdvertisingService = new AdvertisingController();
