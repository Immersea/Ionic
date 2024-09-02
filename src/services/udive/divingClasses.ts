import {SystemService} from "../common/system";
import {BehaviorSubject} from "rxjs";
import {RouterService} from "../common/router";
import {DatabaseService, SETTINGSCOLLECTIONNAME} from "../common/database";
import {popoverController, alertController} from "@ionic/core";
import {TranslationService} from "../common/translations";
import {DivingSchoolsService} from "./divingSchools";
import {DivingCentersService} from "./divingCenters";
import {DivingCourse} from "../../interfaces/udive/diving-school/divingSchool";
import {
  DivingClass,
  Student,
} from "../../interfaces/udive/diving-class/divingClass";
import {CallableFunctionsUdiveService} from "./callableFunctions";

export const DIVINGCLASSESSCOLLECTION = "divingClasses";

export class DivingClassesController {
  creatingNewDivingClass$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  creatingNewDivingClass = false; //used to show skeleton on pages during the creation of a dive trip
  editingDivingClassId$: BehaviorSubject<string> = new BehaviorSubject<string>(
    ""
  );
  editingDivingClassId: string;

  divingAgencies: any;

  init() {
    SystemService.systemPreferences$.subscribe((prefs) => {
      this.divingAgencies = prefs.divingAgencies;
    });
  }

  getCourseDetails(course: DivingCourse) {
    if (this.divingAgencies) {
      return {
        agency: this.divingAgencies[course.agencyId],
        course:
          this.divingAgencies[course.agencyId].certifications[
            course.certificationId
          ],
      };
    } else return null;
  }

  resetSkeletons() {
    this.setCreatingNewDivingClass(false);
    this.setEditingDivingClass("");
  }
  setCreatingNewDivingClass(val) {
    this.creatingNewDivingClass = val;
    this.creatingNewDivingClass$.next(this.creatingNewDivingClass);
  }
  setEditingDivingClass(val) {
    this.editingDivingClassId = val;
    this.editingDivingClassId$.next(this.editingDivingClassId);
  }

  async presentDivingClassUpdate(collectionId, organiserId, id?) {
    if (id) {
      //this.setEditingDivingClass(id);
      this.setCreatingNewDivingClass(false);
    } else {
      this.setEditingDivingClass("");
      this.setCreatingNewDivingClass(true);
    }
    const editModal = await RouterService.openModal(
      "modal-diving-class-update",
      {
        divingClassId: id,
        collectionId: collectionId,
        organiserId: organiserId,
      }
    );
    editModal.onDidDismiss().then((cancelled) => {
      if (cancelled.data) {
        this.resetSkeletons();
      }
    });
  }

  async presentDivingClassDetails(id) {
    if (window.location.pathname.includes("admin")) {
      if (window.location.pathname.includes("divingschools")) {
        RouterService.push(
          "/admin/divingschools/" +
            DivingSchoolsService.selectedDivingSchoolId +
            "/divingclasses/" +
            id,
          "forward"
        );
      } else if (window.location.pathname.includes("divingcenters")) {
        RouterService.push(
          "/admin/divingcenters/" +
            DivingCentersService.selectedDivingCenterId +
            "/divingclasses/" +
            id,
          "forward"
        );
      }
    } else {
      RouterService.push("/divingclasses/" + id, "forward");
    }
  }

  async pushDivingClass(id) {
    RouterService.pushToActualUrl(id, "forward");
  }

  async getDivingClass(id) {
    const divingClass = await DatabaseService.getDocument(
      DIVINGCLASSESSCOLLECTION,
      id
    );
    return new DivingClass(divingClass);
  }

  async getClassesSummary(collection, id) {
    console.log("nnot working getClassesSummary", collection, id);
    const diveClasses = null; /*DatabaseService.getDocumentCollectionObservable(
      collection,
      id,
      SETTINGSCOLLECTIONNAME,
      DIVINGCLASSESSCOLLECTION
    );*/
    return diveClasses;
  }
  async getArchiveClassSummary(collection, id) {
    const diveClasses = DatabaseService.getDocumentCollection(
      collection,
      id,
      SETTINGSCOLLECTIONNAME,
      DIVINGCLASSESSCOLLECTION
    );
    return diveClasses;
  }

  async updateDivingClass(id, divingClass) {
    if (!id) {
      await DatabaseService.addDocument(DIVINGCLASSESSCOLLECTION, divingClass);
    } else {
      await DatabaseService.updateDocument(
        DIVINGCLASSESSCOLLECTION,
        id,
        divingClass
      );
    }
    return true;
  }

  async addDivingClass(divingClass: DivingClass): Promise<DivingClass> {
    return new Promise(async (resolve) => {
      const popover = await popoverController.create({
        component: "popover-new-diving-class",
        translucent: true,
        componentProps: {},
      });
      popover.onDidDismiss().then(async () => {
        //const tripData = ev.data;
        resolve(divingClass);
      });
      popover.present();
    });
  }

  async deleteDivingClass(id) {
    const confirm = await alertController.create({
      header: TranslationService.getTransl(
        "delete-diving-class-header",
        "Delete Diving Class?"
      ),
      message: TranslationService.getTransl(
        "delete-diving-class-message",
        "This diving class will be deleted! Are you sure?"
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
            this.setEditingDivingClass(id);
            DatabaseService.deleteDocument(DIVINGCLASSESSCOLLECTION, id);
          },
        },
      ],
    });
    confirm.present();
  }

  async sendBookingRequest(
    divingClassId,
    uid,
    status,
    evaluations
  ): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      const student: Student = {
        uid: uid,
        status: status,
        evaluations: evaluations,
      };
      try {
        const res = await CallableFunctionsUdiveService.addStudentToClass(
          divingClassId,
          student
        );
        resolve(res.data);
      } catch (error) {
        SystemService.presentAlertError(error);
        reject(error);
      }
    });
  }
}
export const DivingClassesService = new DivingClassesController();
