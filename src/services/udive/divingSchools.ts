import { StorageService } from "../common/storage";
import { doc, onSnapshot } from "firebase/firestore";
import { alertController } from "@ionic/core";
import { DatabaseService, SETTINGSCOLLECTIONNAME } from "../common/database";
import { TranslationService } from "../common/translations";
import { CLIENTSCOLLECTIONNAME, UDiveFilterService } from "./ud-db-filter";
import { orderBy } from "lodash";
import { RouterService } from "../common/router";
import { BehaviorSubject, Subscription } from "rxjs";
import { SystemService } from "../common/system";
import { DIVINGCLASSESSCOLLECTION } from "./divingClasses";
import { DIVETRIPSCOLLECTION } from "./diveTrips";
import { ClassSummary } from "../../interfaces/udive/diving-class/divingClass";
import { TripSummary } from "../../interfaces/udive/dive-trip/diveTrip";
import { USERCHATSCOLLECTION } from "../common/user";
import { ChatService } from "../common/chat";
import {
  DivingSchool,
  MapDataDivingSchool,
} from "../../interfaces/udive/diving-school/divingSchool";
import { Clients } from "../../interfaces/udive/clients/clients";
import { ChatsSummary } from "../../interfaces/common/chat/chat";
import { firestore } from "../../helpers/firebase";

export const DIVESCHOOLSSCOLLECTION = "divingSchools";

export class DivingSchoolsController {
  showNewDivingCourses = false;
  divingSchoolsList: any[] = [];
  divingSchoolsList$: BehaviorSubject<any[]> = new BehaviorSubject(<any>[]);
  selectedDivingSchoolSub: Subscription;
  selectedDivingSchool: DivingSchool;
  selectedDivingSchoolId: string;
  selectedDivingSchool$: BehaviorSubject<DivingSchool> = new BehaviorSubject(
    <DivingSchool>{}
  );
  selectedDivingSchoolClasses$: BehaviorSubject<ClassSummary> =
    new BehaviorSubject(<ClassSummary>{});
  selectedDivingSchoolClasses: ClassSummary;
  selectedDivingSchoolClassesSub: any;
  selectedDivingSchoolTrips$: BehaviorSubject<TripSummary> =
    new BehaviorSubject(<TripSummary>{});
  selectedDivingSchoolTrips: TripSummary;
  selectedDivingSchoolTripsSub: any;
  selectedDivingSchoolClients$: BehaviorSubject<Clients> = new BehaviorSubject(
    <Clients>{}
  );
  selectedDivingSchoolClients: Clients;
  selectedDivingSchoolClientsSub: any;

  selectedDivingSchoolChats$: BehaviorSubject<ChatsSummary> =
    new BehaviorSubject(<ChatsSummary>{});
  selectedDivingSchoolChats: ChatsSummary;
  selectedDivingSchoolChatsSub: any;

  init() {
    UDiveFilterService.mapDataSub$.subscribe(() => {
      const collection = UDiveFilterService.getCollectionArray(
        DIVESCHOOLSSCOLLECTION
      );
      if (collection && collection.length > 0) {
        this.divingSchoolsList = collection;
        this.divingSchoolsList$.next(this.divingSchoolsList);
      }
    });
  }

  async selectDivingSchoolForAdmin(schoolId) {
    //check if already subscribed
    if (!this.selectedDivingSchoolSub) {
      const observable = await DatabaseService.getDocumentObservable(
        DIVESCHOOLSSCOLLECTION,
        schoolId
      );
      this.selectedDivingSchoolSub = observable.subscribe((item) => {
        this.selectedDivingSchool = new DivingSchool(item);
        this.selectedDivingSchoolId = schoolId;
        this.selectedDivingSchool$.next(this.selectedDivingSchool);
        this.loadSelectedDivingData();
      });
    } else {
      this.selectedDivingSchool$.next(this.selectedDivingSchool);
    }
  }

  loadSelectedDivingData() {
    this.selectedDivingSchoolClassesSub = onSnapshot<
      ChatsSummary,
      ChatsSummary
    >(
      doc(
        firestore,
        DIVESCHOOLSSCOLLECTION,
        this.selectedDivingSchoolId,
        SETTINGSCOLLECTIONNAME,
        DIVINGCLASSESSCOLLECTION
      ),
      (divingClasses) => {
        this.selectedDivingSchoolClasses = divingClasses.data();
        this.selectedDivingSchoolClasses$.next(
          this.selectedDivingSchoolClasses
        );
      }
    );

    this.selectedDivingSchoolTripsSub = onSnapshot<TripSummary, TripSummary>(
      doc(
        firestore,
        DIVESCHOOLSSCOLLECTION,
        this.selectedDivingSchoolId,
        SETTINGSCOLLECTIONNAME,
        DIVETRIPSCOLLECTION
      ),
      (diveTrips) => {
        this.selectedDivingSchoolTrips = diveTrips.data();
        this.selectedDivingSchoolTrips$.next(this.selectedDivingSchoolTrips);
      }
    );

    this.selectedDivingSchoolClientsSub = onSnapshot<Clients, Clients>(
      doc(
        firestore,
        DIVESCHOOLSSCOLLECTION,
        this.selectedDivingSchoolId,
        CLIENTSCOLLECTIONNAME,
        CLIENTSCOLLECTIONNAME
      ),
      (clients) => {
        this.selectedDivingSchoolClients = clients.data();
        this.selectedDivingSchoolClients$.next(
          this.selectedDivingSchoolClients
        );
      }
    );

    this.selectedDivingSchoolChatsSub = onSnapshot<ChatsSummary, ChatsSummary>(
      doc(
        firestore,
        DIVESCHOOLSSCOLLECTION,
        this.selectedDivingSchoolId,
        USERCHATSCOLLECTION,
        USERCHATSCOLLECTION
      ),
      (chats) => {
        this.selectedDivingSchoolChats = chats.data();
        this.selectedDivingSchoolChats$.next(this.selectedDivingSchoolChats);
      }
    );

    //set user for chat
    ChatService.loadChatsForUser(this.selectedDivingSchoolId);
  }

  unsubscribeDivingSchoolForAdmin() {
    if (this.selectedDivingSchoolSub && this.selectedDivingSchool) {
      this.selectedDivingSchool = null;
      this.selectedDivingSchool$.next(null);
      this.selectedDivingSchoolSub.unsubscribe();
      this.selectedDivingSchoolSub = null;
      this.selectedDivingSchoolClasses$.next(null);
      this.selectedDivingSchoolClassesSub();
      this.selectedDivingSchoolClasses = null;
      this.selectedDivingSchoolTrips$.next(null);
      this.selectedDivingSchoolTripsSub();
      this.selectedDivingSchoolTrips = null;
      this.selectedDivingSchoolClients$.next(null);
      this.selectedDivingSchoolClientsSub();
      this.selectedDivingSchoolClients = null;
      this.selectedDivingSchoolChats$.next(null);
      this.selectedDivingSchoolChatsSub();
      this.selectedDivingSchoolChats = null;
      ChatService.resetChatUser();
    }
  }

  getDivingSchoolDetails(schoolId): MapDataDivingSchool {
    if (this.divingSchoolsList.length > 0) {
      return this.divingSchoolsList.find((school) => school.id == schoolId);
    } else {
      return null;
    }
  }

  getMapData(collection) {
    const result = {};
    if (collection && Object.keys(collection))
      Object.keys(collection).forEach((item) => {
        result[item] = new MapDataDivingSchool(collection[item]);
      });
    return result;
  }

  async presentDivingSchoolUpdate(id?) {
    await RouterService.openModal("modal-diving-school-update", {
      divingSchoolId: id,
    });
  }

  async presentDivingSchoolDetails(id, newcourse = false) {
    this.showNewDivingCourses = newcourse;
    RouterService.push("/divingschool/" + id, "forward");
  }

  async getDivingSchool(id) {
    const divingSchool = await DatabaseService.getDocument(
      DIVESCHOOLSSCOLLECTION,
      id
    );
    return new DivingSchool(divingSchool);
  }

  async updateDivingSchool(id, divingSchool, userId) {
    if (!id) {
      //set owner of new site
      divingSchool.users[userId] = ["owner"];
      await DatabaseService.addDocument(DIVESCHOOLSSCOLLECTION, divingSchool);
    } else {
      await DatabaseService.updateDocument(
        DIVESCHOOLSSCOLLECTION,
        id,
        divingSchool
      );
    }
    return true;
  }

  async deleteDivingSchool(id) {
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
            DatabaseService.deleteDocument(DIVESCHOOLSSCOLLECTION, id);
            RouterService.push("/", "root");
          },
        },
      ],
    });
    confirm.present();
  }

  async updatePhotoURL(type: string, uid: string, file: any) {
    return StorageService.updatePhotoURL(
      DIVESCHOOLSSCOLLECTION,
      type,
      uid,
      file
    );
  }

  async loadDivingSchoolCourses(divingSchool: DivingSchool) {
    const divingAgencies = await SystemService.getDivingAgencies();
    let divingSchoolCourses = [];
    let divingSchoolCoursesSelect = [];
    const courses = divingSchool.divingCourses;
    Object.keys(divingAgencies).forEach((agencyId) => {
      const agency = divingAgencies[agencyId];
      Object.keys(agency.certifications).forEach((certId) => {
        const certification = agency.certifications[certId];
        const find = courses.findIndex(
          (course) =>
            course.agencyId === agencyId && course.certificationId === certId
        );
        const course = {
          agencyId: agencyId,
          certificationId: certId,
          group: certification.group,
          order: certification.order,
        };
        if (find > -1) {
          //course not found in school list
          divingSchoolCourses.push(course);
        } else {
          divingSchoolCoursesSelect.push(course);
        }
      });
    });
    divingSchoolCourses = orderBy(divingSchoolCourses, [
      "agencyId",
      "group",
      "order",
    ]);
    divingSchoolCoursesSelect = orderBy(divingSchoolCoursesSelect, [
      "agencyId",
      "group",
      "order",
    ]);
    return {
      divingSchoolCourses: divingSchoolCourses,
      divingSchoolCoursesSelect: divingSchoolCoursesSelect,
    };
  }
}
export const DivingSchoolsService = new DivingSchoolsController();
