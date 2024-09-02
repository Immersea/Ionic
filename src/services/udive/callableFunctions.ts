import {alertController} from "@ionic/core";
import {functions} from "../../helpers/firebase";
import {SystemService} from "../common/system";
import {TranslationService} from "../common/translations";
import {httpsCallable} from "firebase/functions";

class CallableFunctionsUdiveController {
  async addBookingToTrip(diveTripId, tripIndex, booking): Promise<any> {
    const addBooking = httpsCallable(functions, "addBooking");
    return addBooking({
      diveTripId: diveTripId,
      tripIndex: tripIndex,
      booking: booking,
    });
  }

  async addStudentToClass(diveClassId, student): Promise<any> {
    const addClassStudent = httpsCallable(functions, "addClassStudent");
    return addClassStudent({
      diveClassId: diveClassId,
      student: student,
    });
  }

  async updateTranslations(): Promise<any> {
    await SystemService.presentLoading("updating");
    let res = null;
    try {
      const updateTranslationsDoc = httpsCallable(
        functions,
        "updateTranslationsDoc"
      );
      res = await updateTranslationsDoc();
    } catch (error) {
      res = {
        error: error,
      };
    }
    SystemService.dismissLoading();
    if (res && res.error) {
      SystemService.presentAlertError(res.error);
      return false;
    } else {
      return true;
    }
  }

  async updateDivingAgency(divingAgencyId, divingAgencyData): Promise<any> {
    await SystemService.presentLoading("updating");
    let res = null;
    try {
      const updateDivingAgency = httpsCallable(functions, "updateDivingAgency");
      res = await updateDivingAgency({
        id: divingAgencyId,
        data: divingAgencyData,
      });
    } catch (error) {
      res = {
        error: error,
      };
    }
    SystemService.dismissLoading();
    if (res && res.error) {
      SystemService.presentAlertError(res.error);
      return false;
    } else {
      return true;
    }
  }

  async archiveData(
    path,
    docName,
    groupByDate,
    groupByField,
    archiveByDate
  ): Promise<any> {
    const archiveData = httpsCallable(functions, "archiveData");
    archiveData({
      path: path,
      docName: docName,
      groupByDate: groupByDate,
      groupByField: groupByField,
      archiveByDate: archiveByDate,
    });
  }

  async startUserTrialPeriod(): Promise<any> {
    await SystemService.presentLoading("please-wait");
    let res = null;
    try {
      const startUserTrialPeriod = httpsCallable(
        functions,
        "startUserTrialPeriod"
      );
      res = await startUserTrialPeriod();
    } catch (error) {
      res = {
        error: error,
      };
    }
    SystemService.dismissLoading();
    if (res && res.error) {
      SystemService.presentAlertError(res.error);
      return false;
    } else {
      let header = TranslationService.getTransl(
        "activate-trial",
        "Start Trial"
      );
      let message = TranslationService.getTransl(
        "activate-trail-message-ok",
        "Your trial licence has been activated!"
      );
      const alert = await alertController.create({
        header: header,
        message: message,
        buttons: [
          {
            text: TranslationService.getTransl("ok", "OK"),
            handler: async () => {},
          },
        ],
      });
      alert.present();
      return true;
    }
  }
}
export const CallableFunctionsUdiveService =
  new CallableFunctionsUdiveController();
