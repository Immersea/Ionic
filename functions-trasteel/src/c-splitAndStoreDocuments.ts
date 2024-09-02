import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {executePromisesInSequence} from "./c-system";

exports.splitAndStoreDocument = functions.region("europe-west1").https.onCall(
  async (
    data: {
      collection: string;
      documentId: any;
      subcollection: string | null;
      subdocumentId: string | null;
      document: any;
      returnPromises: boolean;
    },
    context: any
  ) =>
    splitAndStoreDoc(
      data.collection,
      data.documentId,
      data.subcollection,
      data.subdocumentId,
      data.document,
      data.returnPromises
    )
);

//split documents with more than 1MB to store in firebase
//use returnPromises=true inside functions
//use returnPromises=false for calls from outside functions
export const splitAndStoreDoc = async (
  collection: string,
  documentId: string,
  subcollection: string | null,
  subdocumentId: string | null,
  document: any,
  returnPromises = false
) => {
  return new Promise(async (resolve) => {
    const MAX_SIZE = 950 * 1024; // slightly less than 1MB to account for metadata

    const stringifiedData = JSON.stringify(document);
    const totalLength = Buffer.byteLength(stringifiedData);

    let promises: any[] = [];
    if (totalLength > MAX_SIZE) {
      const partsCount = Math.ceil(totalLength / MAX_SIZE);
      // Split and save new parts

      for (
        let part = 1, offset = 0;
        offset < totalLength;
        part++, offset += MAX_SIZE
      ) {
        const chunk = stringifiedData.slice(offset, offset + MAX_SIZE);
        const partId = `${subdocumentId ? subdocumentId : documentId}_part${part}`;
        let promise = null;
        if (subcollection && subdocumentId) {
          promise = admin
            .firestore()
            .collection(collection)
            .doc(documentId)
            .collection(subcollection)
            .doc(partId)
            .set({data: chunk});
        } else {
          promise = admin
            .firestore()
            .collection(collection)
            .doc(partId)
            .set({data: chunk});
        }
        promises.push(promise);
      }
      const deletePromises = await deleteSplitDoc(
        collection,
        documentId,
        subcollection,
        subdocumentId,
        partsCount + 1,
        true
      );
      promises = promises.concat(deletePromises);
      // Wait for all save operations to complete
      if (returnPromises) {
        resolve(promises);
      } else {
        await executePromisesInSequence(promises);
        resolve({
          message: "Document was split and stored in parts.",
          parts: partsCount,
        });
      }
    } else {
      // Store the document normally if it is within size limit
      promises.push(
        admin.firestore().collection(collection).doc(documentId).set(document)
      );
      //delete split documents if they exist
      const deletePromises = await deleteSplitDoc(
        collection,
        documentId,
        subcollection,
        subdocumentId,
        1,
        true
      );
      promises = promises.concat(deletePromises);
      if (returnPromises) {
        resolve(promises);
      } else {
        await executePromisesInSequence(promises);
        resolve({
          message: "Document was stored in a single part.",
        });
      }
    }
  });
};

//delete old documents on split updates
export const deleteSplitDoc = async (
  collection: string,
  documentId: string,
  subcollection: string | null,
  subdocumentId: string | null,
  fromPart: number = 1,
  returnPromises: boolean = false
) => {
  return new Promise(async (resolve) => {
    // Check if parts exist and delete them
    let partsQuery = null;
    if (subcollection && subdocumentId) {
      partsQuery = await admin
        .firestore()
        .collection(collection)
        .doc(documentId)
        .collection(subcollection)
        .where(
          admin.firestore.FieldPath.documentId(),
          ">=",
          `${subdocumentId}_part${fromPart}`
        )
        .where(
          admin.firestore.FieldPath.documentId(),
          "<=",
          `${subdocumentId}_part999`
        )
        .get();
    } else {
      partsQuery = await admin
        .firestore()
        .collection(collection)
        .where(
          admin.firestore.FieldPath.documentId(),
          ">=",
          `${documentId}_part${fromPart}`
        )
        .where(
          admin.firestore.FieldPath.documentId(),
          "<=",
          `${documentId}_part999`
        )
        .get();
    }
    let deletePromises: any[] = [];
    if (!partsQuery.empty) {
      // Delete all parts since now we can store it as a single document
      deletePromises = partsQuery.docs.map((doc) => doc.ref.delete());
    }
    // Delete the original document if it exists - only for split docs
    if (fromPart > 1) {
      try {
        const docSnapshot = await admin
          .firestore()
          .collection(collection)
          .doc(documentId)
          .get();
        if (docSnapshot.exists) {
          deletePromises.push(
            admin.firestore().collection(collection).doc(documentId).delete()
          );
        }
      } catch (error) {}
    }
    if (returnPromises) {
      resolve(deletePromises);
    } else {
      await executePromisesInSequence(deletePromises);
      resolve({
        message: "Document was deleted.",
      });
    }
  });
};

exports.retrieveAndMergeDocument = functions
  .region("europe-west1")
  .https.onCall(
    async (
      data: {
        collection: string;
        documentId: string;
        subcollection: string;
        subdocumentId: string;
      },
      context: any
    ) =>
      retrieveAndMergeDoc(
        data.collection,
        data.documentId,
        data.subcollection,
        data.subdocumentId
      )
  );

//retieve split documents with more than 1MB stored in firebase
export const retrieveAndMergeDoc = async (
  collection: string,
  documentId: string,
  subcollection: string | null,
  subdocumentId: string | null
) => {
  let partsQuery = null;
  if (subcollection && subdocumentId) {
    partsQuery = await admin
      .firestore()
      .collection(collection)
      .doc(documentId)
      .collection(subcollection)
      .where(
        admin.firestore.FieldPath.documentId(),
        ">=",
        `${subdocumentId}_part1`
      )
      .where(
        admin.firestore.FieldPath.documentId(),
        "<=",
        `${subdocumentId}_part999`
      )
      .get();
  } else {
    partsQuery = await admin
      .firestore()
      .collection(collection)
      .where(
        admin.firestore.FieldPath.documentId(),
        ">=",
        `${documentId}_part1`
      )
      .where(
        admin.firestore.FieldPath.documentId(),
        "<=",
        `${documentId}_part999`
      )
      .get();
  }

  if (!partsQuery.empty) {
    // Document is split into parts
    let fullData = "";
    partsQuery.docs.forEach((doc: any) => {
      fullData += doc.data().data;
    });
    return JSON.parse(fullData);
  } else {
    // Retrieve the whole document normally
    let doc = null;
    if (subcollection && subdocumentId) {
      doc = await admin
        .firestore()
        .collection(collection)
        .doc(documentId)
        .collection(subcollection)
        .doc(subdocumentId)
        .get();
    } else {
      doc = await admin
        .firestore()
        .collection(collection)
        .doc(documentId)
        .get();
    }

    if (doc.exists) {
      return doc.data();
    } else {
      return {message: "Document not found."};
    }
  }
};
