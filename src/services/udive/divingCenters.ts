import { StorageService } from "../common/storage";
import { doc, onSnapshot } from "firebase/firestore";
import { alertController } from "@ionic/core";
import { DatabaseService, SETTINGSCOLLECTIONNAME } from "../common/database";
import {
  DivingCenter,
  MapDataDivingCenter,
} from "../../interfaces/udive/diving-center/divingCenter";
import { TranslationService } from "../common/translations";
import { CLIENTSCOLLECTIONNAME, UDiveFilterService } from "./ud-db-filter";
import { orderBy } from "lodash";
import { RouterService } from "../common/router";
import { DiveSitesService } from "./diveSites";
import { BehaviorSubject, Subscription } from "rxjs";
import { DIVETRIPSCOLLECTION } from "./diveTrips";
import { ChatsSummary } from "../../interfaces/common/chat/chat";
import { USERCHATSCOLLECTION } from "../common/user";
import { ChatService } from "../common/chat";
import { TripSummary } from "../../interfaces/udive/dive-trip/diveTrip";
import { Clients } from "../../interfaces/udive/clients/clients";
import { firestore } from "../../helpers/firebase";

export const DIVECENTERSSCOLLECTION = "divingCenters";

export class DivingCentersController {
  showNewDivePlans = false;
  divingCentersList: any[] = [];
  divingCentersList$: BehaviorSubject<any[]> = new BehaviorSubject(<any>[]);

  selectedDivingCenterSub: Subscription;
  selectedDivingCenter: DivingCenter;
  selectedDivingCenterId: string;
  selectedDivingCenter$: BehaviorSubject<DivingCenter> = new BehaviorSubject(
    <DivingCenter>{}
  );
  selectedDivingCenterTrips$: BehaviorSubject<TripSummary> =
    new BehaviorSubject(<TripSummary>{});
  selectedDivingCenterTrips: TripSummary;
  selectedDivingCenterTripsSub: any;

  selectedDivingCenterClients$: BehaviorSubject<Clients> = new BehaviorSubject(
    <Clients>{}
  );
  selectedDivingCenterClients: Clients;
  selectedDivingCenterClientsSub: any;

  selectedDivingCenterChats$: BehaviorSubject<ChatsSummary> =
    new BehaviorSubject(<ChatsSummary>{});
  selectedDivingCenterChats: ChatsSummary;
  selectedDivingCenterChatsSub: any;

  init() {
    UDiveFilterService.mapDataSub$.subscribe(() => {
      const collection = UDiveFilterService.getCollectionArray(
        DIVECENTERSSCOLLECTION
      );
      if (collection && collection.length > 0) {
        this.divingCentersList = collection;
        this.divingCentersList$.next(this.divingCentersList);
      }
    });
  }

  async selectDivingCenterForAdmin(divingId) {
    //check if already subscribed
    if (!this.selectedDivingCenterSub) {
      const observable = await DatabaseService.getDocumentObservable(
        DIVECENTERSSCOLLECTION,
        divingId
      );
      this.selectedDivingCenterSub = observable.subscribe((item) => {
        this.selectedDivingCenter = new DivingCenter(item);
        this.selectedDivingCenterId = divingId;
        this.selectedDivingCenter$.next(this.selectedDivingCenter);
        this.loadSelectedDivingCenterData();
      });
    } else {
      this.selectedDivingCenter$.next(this.selectedDivingCenter);
    }
  }

  loadSelectedDivingCenterData() {
    this.selectedDivingCenterTripsSub = onSnapshot<TripSummary, TripSummary>(
      doc(
        firestore,
        DIVECENTERSSCOLLECTION,
        this.selectedDivingCenterId,
        SETTINGSCOLLECTIONNAME,
        DIVETRIPSCOLLECTION
      ),
      (diveTrips) => {
        this.selectedDivingCenterTrips = diveTrips.data();
        this.selectedDivingCenterTrips$.next(this.selectedDivingCenterTrips);
      }
    );

    this.selectedDivingCenterClientsSub = onSnapshot<Clients, Clients>(
      doc(
        firestore,
        DIVECENTERSSCOLLECTION,
        this.selectedDivingCenterId,
        CLIENTSCOLLECTIONNAME,
        CLIENTSCOLLECTIONNAME
      ),
      (clients) => {
        this.selectedDivingCenterClients = clients.data();
        this.selectedDivingCenterClients$.next(
          this.selectedDivingCenterClients
        );
      }
    );

    this.selectedDivingCenterChatsSub = onSnapshot<ChatsSummary, ChatsSummary>(
      doc(
        firestore,
        DIVECENTERSSCOLLECTION,
        this.selectedDivingCenterId,
        USERCHATSCOLLECTION,
        USERCHATSCOLLECTION
      ),
      (chats) => {
        this.selectedDivingCenterChats = chats.data();
        this.selectedDivingCenterChats$.next(this.selectedDivingCenterChats);
      }
    );

    //set user for chat
    ChatService.loadChatsForUser(this.selectedDivingCenterId);
  }

  unsubscribeDivingCenterForAdmin() {
    if (this.selectedDivingCenterSub && this.selectedDivingCenter) {
      this.selectedDivingCenter = null;
      this.selectedDivingCenter$.next(null);
      this.selectedDivingCenterSub.unsubscribe();
      this.selectedDivingCenterSub = null;
      this.selectedDivingCenterTripsSub();
      this.selectedDivingCenterTrips = null;
      this.selectedDivingCenterClientsSub();
      this.selectedDivingCenterClients = null;
      this.selectedDivingCenterChatsSub();
      this.selectedDivingCenterChats = null;
      ChatService.resetChatUser();
    }
  }

  getMapData(collection) {
    const result = {};
    if (collection && Object.keys(collection))
      Object.keys(collection).forEach((item) => {
        result[item] = new MapDataDivingCenter(collection[item]);
      });
    return result;
  }

  async presentDivingCenterUpdate(id?) {
    await RouterService.openModal("modal-diving-center-update", {
      divingCenterId: id,
    });
  }

  async presentDivingCenterDetails(id, newdive = false) {
    this.showNewDivePlans = newdive;
    RouterService.push("/divingcenter/" + id, "forward");
  }

  async getDivingCenter(id) {
    const divingCenter = await DatabaseService.getDocument(
      DIVECENTERSSCOLLECTION,
      id
    );
    return new DivingCenter(divingCenter);
  }

  getDivingCenterDetails(centerId): MapDataDivingCenter {
    if (this.divingCentersList.length > 0) {
      return this.divingCentersList.find((center) => center.id == centerId);
    } else {
      return null;
    }
  }

  async updateDivingCenter(id, divingCenter, userId) {
    if (!id) {
      //set owner of new site
      divingCenter.users[userId] = ["owner"];
      await DatabaseService.addDocument(DIVECENTERSSCOLLECTION, divingCenter);
    } else {
      await DatabaseService.updateDocument(
        DIVECENTERSSCOLLECTION,
        id,
        divingCenter
      );
    }
    return true;
  }

  async deleteDivingCenter(id) {
    const confirm = await alertController.create({
      header: TranslationService.getTransl(
        "delete-dive-center-header",
        "Delete Dive Center?"
      ),
      message: TranslationService.getTransl(
        "delete-dive-center-message",
        "This dive center will be deleted! Are you sure?"
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
            DatabaseService.deleteDocument(DIVECENTERSSCOLLECTION, id);
            RouterService.push("/", "root");
          },
        },
      ],
    });
    confirm.present();
  }

  async updatePhotoURL(type: string, uid: string, file: any) {
    return StorageService.updatePhotoURL(
      DIVECENTERSSCOLLECTION,
      type,
      uid,
      file
    );
  }

  loadDivingCenterSites(divingCenter) {
    const diveSites = DiveSitesService.diveSitesList;

    let divingCenterSites = [];
    let divingCenterSelect = [];
    diveSites.forEach((site) => {
      if (divingCenter.diveSites.includes(site.id)) {
        divingCenterSites.push(site);
      } else {
        divingCenterSelect.push(site);
      }
    });
    divingCenterSites = orderBy(divingCenterSites, "displayName");
    divingCenterSelect = orderBy(divingCenterSelect, "displayName");
    return {
      divingCenterSites: divingCenterSites,
      divingCenterSelect: divingCenterSelect,
    };
  }
}
export const DivingCentersService = new DivingCentersController();
