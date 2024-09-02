import * as functions from "firebase-functions";
import {REGION, MEMORY, TIMEOUT, updateItemSummary} from "./c-system";

const COLLECTIONNAME = "divePlans";
const USERCOLLECTIONNAME = "userDivePlans";

export const updateDivePlans = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(COLLECTIONNAME + "/{divePlanId}")
  .onWrite(async (change, context) => {
    const divePlanId = context.params.divePlanId;
    if (change && change.after && change.after.data()) {
      //update or create
      const divePlan = change.after.data();
      return updateItemSummary(
        USERCOLLECTIONNAME,
        divePlanId,
        divePlan,
        change.before.data(),
        divePlanSummary
      );
    } else {
      //delete
      return updateItemSummary(
        USERCOLLECTIONNAME,
        divePlanId,
        null,
        change.before.data(),
        divePlanSummary
      );
    }
  });

const divePlanSummary = function (item: any) {
  const dives: any[] = [];
  const summary = {
    configuration: item.configuration.stdName,
    dives: dives,
  };
  for (const dive of item.dives) {
    const diveInfo = {
      diveSiteId: dive.diveSiteId,
      date: dive.date,
      profilePoints: dive.profilePoints,
    };
    summary.dives.push(diveInfo);
  }
  return summary;
};
