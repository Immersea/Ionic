import {functions} from "../../helpers/firebase";
import {SystemService} from "../common/system";
import {httpsCallable} from "firebase/functions";
import {MAPDATACOLLECTION} from "./database";
import {Environment} from "../../global/env";

class CallableFunctionsController {
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

  async splitAndStoreDoc(
    collectionId: string,
    documentId: string,
    subcollectionId: string,
    subdocumentId: string,
    document: any,
    returnPromises: boolean
  ): Promise<any> {
    await SystemService.presentLoading("updating");
    let res = null;
    try {
      const splitAndStoreDocFunc = httpsCallable(
        functions,
        "splitAndStoreDocument"
      );
      const data = {
        collection: collectionId,
        documentId: documentId,
        subcollection: subcollectionId,
        subdocumentId: subdocumentId,
        document: document,
        returnPromises: returnPromises,
      };
      console.log("data", data);
      res = await splitAndStoreDocFunc(data);
      Environment.log("splitAndStoreDoc", [
        collectionId,
        documentId,
        subcollectionId,
        subdocumentId,
        document,
        res,
      ]);
    } catch (error) {
      console.log("error1", error);
      res = {
        error: error,
      };
    }
    SystemService.dismissLoading();
    if (res && res.error) {
      SystemService.presentAlertError(res.error);
      return false;
    } else {
      return res;
    }
  }

  async retrieveAndMergeDoc(
    collectionId: string,
    documentId: string,
    subcollectionId?: string,
    subdocumentId?: string
  ): Promise<any> {
    if (collectionId !== MAPDATACOLLECTION)
      await SystemService.presentLoading("loading");
    let res = null;
    try {
      const retrieveAndMergeDoc = httpsCallable(
        functions,
        "retrieveAndMergeDocument"
      );
      res = await retrieveAndMergeDoc({
        collection: collectionId,
        documentId: documentId,
        subcollection: subcollectionId,
        subdocumentId: subdocumentId,
      });
      Environment.log("retrieveAndMergeDocument", [
        collectionId,
        documentId,
        subcollectionId,
        subdocumentId,
        res,
      ]);
    } catch (error) {
      Environment.log("res error", [error]);
      res = {
        error: error,
      };
    }
    if (collectionId !== MAPDATACOLLECTION) SystemService.dismissLoading();
    if (res && res.error) {
      SystemService.presentAlertError(res.error);
      return false;
    } else {
      return res.data;
    }
  }

  async updateSystemsDoc(collectionId: string): Promise<any> {
    let res;
    try {
      const updateSystemsDoc = httpsCallable(functions, "updateSystemsDoc");
      res = await updateSystemsDoc({
        collectionId: collectionId,
      });
      Environment.log("updateSystemsDoc", [collectionId, res]);
    } catch (error) {
      Environment.log("res error", [error]);
      res = {
        error: error,
      };
    }
  }
}
export const CallableFunctionsService = new CallableFunctionsController();
