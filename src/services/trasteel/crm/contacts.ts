import {StorageService} from "../../common/storage";
import {alertController} from "@ionic/core";
import {DatabaseService} from "../../common/database";
import {TranslationService} from "../../common/translations";
import {TrasteelFilterService} from "../common/trs-db-filter";
import {RouterService} from "../../common/router";
import {BehaviorSubject} from "rxjs";
import {
  Contact,
  MapDataContact,
} from "../../../interfaces/trasteel/contact/contact";

export const CONTACTSCOLLECTION = "contacts";

export class ContactsController {
  contactsList: MapDataContact[] = [];
  contactsList$: BehaviorSubject<MapDataContact[]> = new BehaviorSubject([]);
  serviceInit = true;

  //initialise this service inside app-root at the start of the app
  init() {
    //init only once
    if (this.serviceInit) {
      this.serviceInit = false;
      TrasteelFilterService.mapDataSub$.subscribe(() => {
        const collection =
          TrasteelFilterService.getCollectionArray(CONTACTSCOLLECTION);
        if (collection && collection.length > 0) {
          this.contactsList = collection;
          this.contactsList$.next(this.contactsList);
        } else {
          this.contactsList$.next([]);
        }
      });
    }
  }

  createMapData(id, contact: Contact): MapDataContact {
    return new MapDataContact({
      id: id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      customerId: contact.customerId,
      photoURL: contact.photoURL,
      coverURL: contact.coverURL,
    });
  }

  getMapData(collection) {
    const result = {};
    if (collection && Object.keys(collection)) {
      Object.keys(collection).forEach((item) => {
        result[item] = new MapDataContact(collection[item]);
      });
    }
    return result;
  }

  async presentContactUpdate(id?) {
    return await RouterService.openModal("modal-contact-update", {
      contactId: id,
    });
  }

  async presentContactDetails(id) {
    RouterService.push("/" + CONTACTSCOLLECTION + "/" + id, "forward");
  }

  async getContact(id) {
    const contact = new Contact(
      await DatabaseService.getDocument(CONTACTSCOLLECTION, id)
    );
    return contact;
  }

  async updateContact(id, contact, userId) {
    return DatabaseService.saveItem(id, contact, userId, CONTACTSCOLLECTION);
  }

  async deleteContact(id): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const confirm = await alertController.create({
        header: TranslationService.getTransl(
          "delete-contact-header",
          "Delete Contact?"
        ),
        message: TranslationService.getTransl(
          "delete-contact-message",
          "This contact will be deleted! Are you sure?"
        ),
        buttons: [
          {
            text: TranslationService.getTransl("cancel", "Cancel"),
            role: "cancel",
            handler: () => {
              reject();
            },
          },
          {
            text: TranslationService.getTransl("ok", "OK"),
            handler: async () => {
              DatabaseService.deleteItem(CONTACTSCOLLECTION, id);
              RouterService.goBack();
              resolve(null);
            },
          },
        ],
      });
      confirm.present();
    });
  }

  async updatePhotoURL(type: string, uid: string, file: any) {
    return StorageService.updatePhotoURL(CONTACTSCOLLECTION, type, uid, file);
  }

  getContactsDetails(contactId): MapDataContact {
    if (this.contactsList.length > 0) {
      return this.contactsList.find((contact) => contact.id == contactId);
    } else {
      return null;
    }
  }
}
export const ContactsService = new ContactsController();
