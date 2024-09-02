import * as functions from "firebase-functions";
import {
  REGION,
  MEMORY,
  TIMEOUT,
  updateSystemData,
  db,
  SYSTEMCOLLECTION,
  TRANSLATIONSDOC,
} from "./c-system";

export const updateTranslationsDoc = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onCall(async () => {
    const translationsDataRef = db.doc(
      `/${SYSTEMCOLLECTION}/${TRANSLATIONSDOC}`
    );
    const translationsDataDoc = await translationsDataRef.get();
    let translationsData = translationsDataDoc.data();
    if (!translationsData) translationsData = {};

    const translationsCollRef = db.collection(`/${TRANSLATIONSDOC}`);
    const translationsColl = await translationsCollRef.get();
    const translationsCollDocs = translationsColl.docs;
    for (const snapshot of translationsCollDocs) {
      if (translationsData) translationsData[snapshot.id] = snapshot.data();
    }
    await translationsDataRef.set(translationsData);
    await updateSystemData(TRANSLATIONSDOC);
    return true;
  });

export const updateSystemsDoc = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onCall(
    async (
      data: {
        collectionId: string;
      },
      context: any
    ) => {
      await updateSystemData(data.collectionId);
      return true;
    }
  );
