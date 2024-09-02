import * as functions from "firebase-functions";
import {
  updateSystemData,
  REGION,
  MEMORY,
  TIMEOUT,
  db,
  updateMapData,
  executePromisesInSequence,
} from "./c-system";

export const USERPROFILECOLLECTIONNAME = "userProfiles";
const COLLECTIONROLESNAME = "userRoles";
const COLLECTIONSETTINGSNAME = "userSettings";
const COLLECTIONPUBLICNAME = "userPublicProfiles";

export const createUserAccount = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .auth.user()
  .onCreate((e) => {
    const user = {
      uid: e.uid,
      email: e.email,
      displayName: e.displayName ? e.displayName : "Guest",
      memberSince: e.metadata.creationTime,
      photoURL: e.photoURL,
      phoneNumber: e.phoneNumber,
    };
    const userRoles = {
      uid: e.uid,
      email: e.email,
      roles: e.email ? ["registered"] : ["guest"],
      licences: {
        pro: false,
        trial: {
          level: null,
          duration: null,
          fromDate: null,
        },
      },
    };
    const userSettings = {
      uid: e.uid,
      settings: {
        language: "en",
        units: "Metric",
      },
      userConfigurations: [],
    };
    const userRef = db.doc(`/${USERPROFILECOLLECTIONNAME}/${e.uid}`);
    const userRolesRef = db.doc(`/${COLLECTIONROLESNAME}/${e.uid}`);
    const userSettingsRef = db.doc(`/${COLLECTIONSETTINGSNAME}/${e.uid}`);
    const userPublicRef = db.doc(`/${COLLECTIONPUBLICNAME}/${e.uid}`);
    return executePromisesInSequence([
      userRef.set(user),
      userRolesRef.set(userRoles),
      userSettingsRef.set(userSettings),
      updateSystemData(COLLECTIONPUBLICNAME),
      defineUserPublicProfile(userPublicRef, user, true), // update public profile and set map data if user does not update his profile at registration
    ]);
  });

export const deleteUserAccount = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .auth.user()
  .onDelete((e) => {
    const userRef = db.doc(`/${USERPROFILECOLLECTIONNAME}/${e.uid}`);
    const userRolesRef = db.doc(`/${COLLECTIONROLESNAME}/${e.uid}`);
    const userSettingsRef = db.doc(`/${COLLECTIONSETTINGSNAME}/${e.uid}`);
    const userPublicRef = db.doc(`/${COLLECTIONPUBLICNAME}/${e.uid}`);
    return executePromisesInSequence([
      userRef.delete(),
      userRolesRef.delete(),
      userSettingsRef.delete(),
      userPublicRef.delete(),
      updateSystemData(COLLECTIONPUBLICNAME),
    ]);
  });

export const updateUserProfilePublic = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(USERPROFILECOLLECTIONNAME + "/{userId}")
  .onUpdate(async (change) => {
    if (change && change.after && change.after.data()) {
      const userProfile = change.after.data();
      const userPublicRef = db.doc(
        `/${COLLECTIONPUBLICNAME}/${userProfile.uid}`
      );
      const userPublicDoc = await userPublicRef.get();
      if (userPublicDoc) {
        let userPublicData = userPublicDoc.data();
        if (!userPublicData) {
          userPublicData = {editorOf: {}};
        }
        if (!userPublicData.editorOf) userPublicData.editorOf = {};
        const userPublicCards = userPublicData.cards;
        return defineUserPublicProfile(
          userPublicRef,
          userProfile,
          userPublicCards
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
  });

export const defineUserPublicProfile = async (
  userPublicRef: any,
  userProfile: any,
  newPublicProfile = false
) => {
  const userPublic = {
    uid: userProfile.uid,
    email: userProfile.email ? userProfile.email : null,
    displayName: userProfile.displayName ? userProfile.displayName : null,
    photoURL: userProfile.photoURL ? userProfile.photoURL : null,
  };
  return executePromisesInSequence([
    userPublicRef.set(userPublic),
    await updateMapData(
      COLLECTIONPUBLICNAME,
      userProfile.uid,
      createUserPublicMapData(userPublic)
    ),
  ]);
};

export const createUserPublicMapData = (userPublic: any) => {
  return {
    uid: userPublic.uid,
    email: userPublic.email ? userPublic.email : null,
    displayName: userPublic.displayName ? userPublic.displayName : null,
  };
};
