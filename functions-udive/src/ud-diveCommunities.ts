import * as functions from "firebase-functions";
import {
  deleteMapData,
  updateEditorOf,
  updateMapData,
  REGION,
  MEMORY,
  TIMEOUT,
} from "./c-system";

export const DCOMCOLLECTIONNAME = "diveCommunities";

export const updateDiveCommunities = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(DCOMCOLLECTIONNAME + "/{diveCommunityId}")
  .onWrite(async (change, context) => {
    const diveCommunityId = context.params.diveCommunityId;
    const diveCommunity = change.after.data();
    const previousDiveCommunity = change.before.data();
    if (change && change.after && change.after.data()) {
      //update or create

      return Promise.all([
        updateEditorOf(
          DCOMCOLLECTIONNAME,
          diveCommunityId,
          diveCommunity,
          previousDiveCommunity
        ),
        createMapData(diveCommunityId, diveCommunity),
      ]);
    } else {
      //delete
      return Promise.all([
        updateEditorOf(
          DCOMCOLLECTIONNAME,
          diveCommunityId,
          null,
          previousDiveCommunity
        ),
        deleteMapData(DCOMCOLLECTIONNAME, diveCommunityId),
      ]);
    }
  });

const createMapData = async (diveCommunityId: string, diveCommunity: any) => {
  const doc = {
    displayName: diveCommunity.displayName,
    photoURL: diveCommunity.photoURL,
    coverURL: diveCommunity.coverURL,
    position: diveCommunity.position,
  };
  return updateMapData(DCOMCOLLECTIONNAME, diveCommunityId, doc);
};
