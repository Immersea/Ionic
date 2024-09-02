import {StorageService} from "../common/storage";
import {doc, onSnapshot} from "firebase/firestore";
import {alertController} from "@ionic/core";
import {DatabaseService, SETTINGSCOLLECTIONNAME} from "../common/database";
import {
  DiveCommunity,
  MapDataDiveCommunity,
  CommunityMember,
} from "../../interfaces/udive/dive-community/diveCommunity";
import {TranslationService} from "../common/translations";
import {UDiveFilterService} from "./ud-db-filter";
import {RouterService} from "../common/router";
import {BehaviorSubject, Subscription} from "rxjs";
import {DIVETRIPSCOLLECTION} from "./diveTrips";
import {ChatsSummary} from "../../interfaces/common/chat/chat";
import {USERCHATSCOLLECTION} from "../common/user";
import {ChatService} from "../common/chat";
import {TripSummary} from "../../interfaces/udive/dive-trip/diveTrip";
import {firestore} from "../../helpers/firebase";

export const DIVECOMMUNITIESCOLLECTION = "diveCommunities";
export const MEMBERSCOLLECTION = "communityMembers";

export class DiveCommunitiesController {
  showNewDivePlans = false;
  diveCommunitiesList: any[] = [];
  diveCommunitiesList$: BehaviorSubject<any[]> = new BehaviorSubject(<any>[]);

  selectedDiveCommunitySub: Subscription;
  selectedDiveCommunity: DiveCommunity;
  selectedDiveCommunityId: string;
  selectedDiveCommunity$: BehaviorSubject<DiveCommunity> = new BehaviorSubject(
    <DiveCommunity>{}
  );
  selectedDiveCommunityTrips$: BehaviorSubject<TripSummary> =
    new BehaviorSubject(<TripSummary>{});
  selectedDiveCommunityTrips: TripSummary;
  selectedDiveCommunityTripsSub: any;

  selectedDiveCommunityMembers$: BehaviorSubject<CommunityMember> =
    new BehaviorSubject(<CommunityMember>{});
  selectedDiveCommunityMembers: CommunityMember;
  selectedDiveCommunityMembersSub: any;

  selectedDiveCommunityChats$: BehaviorSubject<ChatsSummary> =
    new BehaviorSubject(<ChatsSummary>{});
  selectedDiveCommunityChats: ChatsSummary;
  selectedDiveCommunityChatsSub: any;

  init() {
    UDiveFilterService.mapDataSub$.subscribe(() => {
      const collection = UDiveFilterService.getCollectionArray(
        DIVECOMMUNITIESCOLLECTION
      );
      if (collection && collection.length > 0) {
        this.diveCommunitiesList = collection;
        this.diveCommunitiesList$.next(this.diveCommunitiesList);
      }
    });
  }

  async selectDiveCommunityForAdmin(divingId) {
    //check if already subscribed
    if (!this.selectedDiveCommunitySub) {
      const observable = await DatabaseService.getDocumentObservable(
        DIVECOMMUNITIESCOLLECTION,
        divingId
      );
      this.selectedDiveCommunitySub = observable.subscribe((item) => {
        this.selectedDiveCommunity = new DiveCommunity(item);
        this.selectedDiveCommunityId = divingId;
        this.selectedDiveCommunity$.next(this.selectedDiveCommunity);
        this.loadSelectedDiveCommunityData();
      });
    } else {
      this.selectedDiveCommunity$.next(this.selectedDiveCommunity);
    }
  }

  loadSelectedDiveCommunityData() {
    this.selectedDiveCommunityTripsSub = onSnapshot<TripSummary, TripSummary>(
      doc(
        firestore,
        DIVECOMMUNITIESCOLLECTION,
        this.selectedDiveCommunityId,
        SETTINGSCOLLECTIONNAME,
        DIVETRIPSCOLLECTION
      ),
      (diveTrips) => {
        this.selectedDiveCommunityTrips = diveTrips.data();
        this.selectedDiveCommunityTrips$.next(this.selectedDiveCommunityTrips);
      }
    );

    this.selectedDiveCommunityMembersSub = onSnapshot<any, any>(
      doc(
        firestore,
        DIVECOMMUNITIESCOLLECTION,
        this.selectedDiveCommunityId,
        MEMBERSCOLLECTION,
        MEMBERSCOLLECTION
      ),
      (communityMembers) => {
        this.selectedDiveCommunityMembers = communityMembers.data();
        this.selectedDiveCommunityMembers$.next(
          this.selectedDiveCommunityMembers
        );
      }
    );

    this.selectedDiveCommunityChatsSub = onSnapshot<ChatsSummary, ChatsSummary>(
      doc(
        firestore,
        DIVECOMMUNITIESCOLLECTION,
        this.selectedDiveCommunityId,
        USERCHATSCOLLECTION,
        USERCHATSCOLLECTION
      ),
      (chats) => {
        this.selectedDiveCommunityChats = chats.data();
        this.selectedDiveCommunityChats$.next(this.selectedDiveCommunityChats);
      }
    );

    //set user for chat
    ChatService.loadChatsForUser(this.selectedDiveCommunityId);
  }

  unsubscribeDiveCommunityForAdmin() {
    if (this.selectedDiveCommunitySub && this.selectedDiveCommunity) {
      this.selectedDiveCommunity = null;
      this.selectedDiveCommunity$.next(null);
      this.selectedDiveCommunitySub.unsubscribe();
      this.selectedDiveCommunitySub = null;
      this.selectedDiveCommunityTripsSub();
      this.selectedDiveCommunityTrips = null;
      this.selectedDiveCommunityMembersSub();
      this.selectedDiveCommunityMembers = null;
      this.selectedDiveCommunityChatsSub();
      this.selectedDiveCommunityChats = null;
      ChatService.resetChatUser();
    }
  }

  getMapData(collection) {
    const result = {};
    if (collection && Object.keys(collection))
      Object.keys(collection).forEach((item) => {
        result[item] = new MapDataDiveCommunity(collection[item]);
      });
    return result;
  }

  async presentDiveCommunityUpdate(id?) {
    await RouterService.openModal("modal-dive-community-update", {
      diveCommunityId: id,
    });
  }

  async presentDiveCommunityDetails(id, newdive = false) {
    this.showNewDivePlans = newdive;
    RouterService.push("/divecommunity/" + id, "forward");
  }

  async getDiveCommunity(id) {
    const diveCommunity = await DatabaseService.getDocument(
      DIVECOMMUNITIESCOLLECTION,
      id
    );
    return new DiveCommunity(diveCommunity);
  }

  getDiveCommunityDetails(centerId): MapDataDiveCommunity {
    if (this.diveCommunitiesList.length > 0) {
      return this.diveCommunitiesList.find((center) => center.id == centerId);
    } else {
      return null;
    }
  }

  async updateDiveCommunity(id, diveCommunity, userId) {
    if (!id) {
      //set owner of new site
      diveCommunity.users[userId] = ["owner"];
      await DatabaseService.addDocument(
        DIVECOMMUNITIESCOLLECTION,
        diveCommunity
      );
    } else {
      await DatabaseService.updateDocument(
        DIVECOMMUNITIESCOLLECTION,
        id,
        diveCommunity
      );
    }
    return true;
  }

  async deleteDiveCommunity(id) {
    const confirm = await alertController.create({
      header: TranslationService.getTransl(
        "delete-dive-community-header",
        "Delete Community?"
      ),
      message: TranslationService.getTransl(
        "delete-dive-community-message",
        "This community will be deleted! Are you sure?"
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
            DatabaseService.deleteDocument(DIVECOMMUNITIESCOLLECTION, id);
            RouterService.push("/", "root");
          },
        },
      ],
    });
    confirm.present();
  }

  async updatePhotoURL(type: string, uid: string, file: any) {
    return StorageService.updatePhotoURL(
      DIVECOMMUNITIESCOLLECTION,
      type,
      uid,
      file
    );
  }
}
export const DiveCommunitiesService = new DiveCommunitiesController();
