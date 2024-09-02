import {StorageService} from "../common/storage";
import {doc, onSnapshot} from "firebase/firestore";
import {alertController} from "@ionic/core";
import {DatabaseService} from "../common/database";
import {
  ServiceCenter,
  MapDataServiceCenter,
} from "../../interfaces/udive/service-center/serviceCenter";
import {TranslationService} from "../common/translations";
import {CLIENTSCOLLECTIONNAME, UDiveFilterService} from "./ud-db-filter";
import {RouterService} from "../common/router";
import {BehaviorSubject, Subscription} from "rxjs";
import {Clients} from "../../interfaces/udive/clients/clients";
import {ChatsSummary} from "../../interfaces/common/chat/chat";
import {USERCHATSCOLLECTION} from "../common/user";
import {ChatService} from "../common/chat";
import {firestore} from "../../helpers/firebase";

export const SERVICECENTERSCOLLECTION = "serviceCenters";

export class ServiceCentersController {
  serviceCentersList: any[] = [];
  serviceCentersList$: BehaviorSubject<any[]> = new BehaviorSubject(<any>[]);
  selectedServiceCenterSub: Subscription;
  selectedServiceCenter: ServiceCenter;
  selectedServiceCenterId: string;
  selectedServiceCenter$: BehaviorSubject<ServiceCenter> = new BehaviorSubject(
    <ServiceCenter>{}
  );
  selectedServiceCenterClients$: BehaviorSubject<Clients> = new BehaviorSubject(
    <Clients>{}
  );
  selectedServiceCenterClients: Clients;
  selectedServiceCenterClientsSub: any;

  selectedServiceCenterChats$: BehaviorSubject<ChatsSummary> =
    new BehaviorSubject(<ChatsSummary>{});
  selectedServiceCenterChats: ChatsSummary;
  selectedServiceCenterChatsSub: any;

  init() {
    UDiveFilterService.mapDataSub$.subscribe(() => {
      const collection = UDiveFilterService.getCollectionArray(
        SERVICECENTERSCOLLECTION
      );
      if (collection && collection.length > 0) {
        this.serviceCentersList = collection;
        this.serviceCentersList$.next(this.serviceCentersList);
      }
    });
  }

  async selectServiceCenterForAdmin(centerId) {
    //check if already subscribed
    if (!this.selectedServiceCenterSub) {
      const observable = await DatabaseService.getDocumentObservable(
        SERVICECENTERSCOLLECTION,
        centerId
      );
      this.selectedServiceCenterSub = observable.subscribe((item) => {
        this.selectedServiceCenter = new ServiceCenter(item);
        this.selectedServiceCenterId = centerId;
        this.selectedServiceCenter$.next(this.selectedServiceCenter);
        this.loadSelectedServiceCenterData();
      });
    } else {
      this.selectedServiceCenter$.next(this.selectedServiceCenter);
    }
  }

  loadSelectedServiceCenterData() {
    this.selectedServiceCenterClientsSub = onSnapshot<Clients, Clients>(
      doc(
        firestore,
        SERVICECENTERSCOLLECTION,
        this.selectedServiceCenterId,
        CLIENTSCOLLECTIONNAME,
        CLIENTSCOLLECTIONNAME
      ),
      (clients) => {
        this.selectedServiceCenterClients = clients.data();
        this.selectedServiceCenterClients$.next(
          this.selectedServiceCenterClients
        );
      }
    );

    this.selectedServiceCenterChatsSub = onSnapshot<ChatsSummary, ChatsSummary>(
      doc(
        firestore,
        SERVICECENTERSCOLLECTION,
        this.selectedServiceCenterId,
        USERCHATSCOLLECTION,
        USERCHATSCOLLECTION
      ),
      (chats) => {
        this.selectedServiceCenterChats = chats.data();
        this.selectedServiceCenterChats$.next(this.selectedServiceCenterChats);
      }
    );

    //set user for chat
    ChatService.loadChatsForUser(this.selectedServiceCenterId);
  }

  unsubscribeServiceCenterForAdmin() {
    if (this.selectedServiceCenterSub && this.selectedServiceCenter) {
      this.selectedServiceCenter = null;
      this.selectedServiceCenter$.next(null);
      this.selectedServiceCenterSub.unsubscribe();
      this.selectedServiceCenterClients$.next(null);
      this.selectedServiceCenterClientsSub();
      this.selectedServiceCenterClients = null;
      this.selectedServiceCenterChats$.next(null);
      this.selectedServiceCenterChatsSub();
      this.selectedServiceCenterChats = null;
      ChatService.resetChatUser();
    }
  }

  getServiceCenterDetails(centerId): MapDataServiceCenter {
    if (this.serviceCentersList.length > 0) {
      return this.serviceCentersList.find((center) => center.id == centerId);
    } else {
      return null;
    }
  }

  getMapData(collection) {
    const result = {};
    if (collection && Object.keys(collection))
      Object.keys(collection).forEach((item) => {
        result[item] = new MapDataServiceCenter(collection[item]);
      });
    return result;
  }

  async presentServiceCenterUpdate(id?) {
    await RouterService.openModal("modal-service-center-update", {
      serviceCenterId: id,
    });
  }

  async presentServiceCenterDetails(id) {
    RouterService.push("/servicecenter/" + id, "forward");
  }

  async getServiceCenter(id) {
    const serviceCenter = await DatabaseService.getDocument(
      SERVICECENTERSCOLLECTION,
      id
    );
    return new ServiceCenter(serviceCenter);
  }

  async updateServiceCenter(id, serviceCenter, userId) {
    if (!id) {
      //set owner of new site
      serviceCenter.users[userId] = ["owner"];
      await DatabaseService.addDocument(
        SERVICECENTERSCOLLECTION,
        serviceCenter
      );
    } else {
      await DatabaseService.updateDocument(
        SERVICECENTERSCOLLECTION,
        id,
        serviceCenter
      );
    }
    return true;
  }

  async deleteServiceCenter(id) {
    const confirm = await alertController.create({
      header: TranslationService.getTransl(
        "delete-diving-school-header",
        "Delete Diving School?"
      ),
      message: TranslationService.getTransl(
        "delete-diving-school-message",
        "This diving school will be deleted! Are you sure?"
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
            DatabaseService.deleteDocument(SERVICECENTERSCOLLECTION, id);
            RouterService.push("/", "root");
          },
        },
      ],
    });
    confirm.present();
  }

  async updatePhotoURL(type: string, uid: string, file: any) {
    return StorageService.updatePhotoURL(
      SERVICECENTERSCOLLECTION,
      type,
      uid,
      file
    );
  }
}
export const ServiceCentersService = new ServiceCentersController();
