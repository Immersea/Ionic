import * as functions from "firebase-functions";
import {updateSystemData, REGION, MEMORY, TIMEOUT, db} from "./c-system";

export const USERPROFILECOLLECTIONNAME = "userProfiles";
const COLLECTIONROLESNAME = "userRoles";
const COLLECTIONCARDSNAME = "userCards";
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
    const user_cards = {
      uid: e.uid,
      email: e.email,
      cards: [],
    };
    const user_roles = {
      uid: e.uid,
      email: e.email,
      roles: e.email ? ["registered"] : ["guest"],
      licences: {
        pro: false,
        reb: false,
        tables: false,
        trimix: false,
        configs: false,
        rec1: false,
        rec2: false,
        rec3: false,
        tech1: false,
        tech2: false,
        unlimited: false,
        trial: {
          level: null,
          duration: null,
          fromDate: null,
        },
      },
    };
    const user_settings = {
      uid: e.uid,
      localPlans: [],
      userTanks: [],
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
    const userCardsRef = db.doc(`/${COLLECTIONCARDSNAME}/${e.uid}`);
    return Promise.all([
      userRef.set(user),
      userRolesRef.set(user_roles),
      userSettingsRef.set(user_settings),
      userCardsRef.set(user_cards),
      updateSystemData(COLLECTIONPUBLICNAME),
      defineUserPublicProfile(userPublicRef, user, null, true), //update public profile and set map data if user does not update his profile at registration
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
    const userCardsRef = db.doc(`/${COLLECTIONCARDSNAME}/${e.uid}`);
    return Promise.all([
      userRef.delete(),
      userRolesRef.delete(),
      userSettingsRef.delete(),
      userCardsRef.delete(),
      userPublicRef.delete(),
      deleteUserFromMapData(e.uid),
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
      const userPublicDocData = userPublicDoc.data()
        ? userPublicDoc.data()
        : undefined;
      if (userPublicDocData) {
        const userPublicCards = userPublicDocData.cards;
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

export const updateUserProfilePublicCards = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(COLLECTIONCARDSNAME + "/{userId}")
  .onUpdate(async (change) => {
    if (change && change.after && change.after.data()) {
      const userCards = change.after.data();
      const userPublicRef = db.doc(`/${COLLECTIONPUBLICNAME}/${userCards.uid}`);
      const userPublicDoc = await userPublicRef.get();
      const userPublic = userPublicDoc.data();
      const cards: any[] = [];
      if (userCards.cards.length > 0 && userPublic) {
        for (const card of userCards.cards) {
          cards.push({
            agencyId: card.course.agencyId,
            certificationId: card.course.certificationId,
          });
        }
        userPublic.cards = cards;
        return updateMapData(userPublicRef, userPublic);
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
  userPublicCards: any,
  newPublicProfile = false
) => {
  const user_public = {
    uid: userProfile.uid,
    email: userProfile.email ? userProfile.email : null,
    displayName: userProfile.displayName ? userProfile.displayName : null,
    photoURL: userProfile.photoURL ? userProfile.photoURL : null,
    coverURL: userProfile.coverURL ? userProfile.coverURL : null,
    address: userProfile.address ? userProfile.address : null,
    position: userProfile.address
      ? {
          geopoint: {
            Wa: userProfile.address.lat,
            za: userProfile.address.lon,
          },
        }
      : null,
    bio: userProfile.bio ? userProfile.bio : null,
    website: userProfile.website ? userProfile.website : null,
    twitter: userProfile.twitter ? userProfile.twitter : null,
    phoneNumber: userProfile.phoneNumber ? userProfile.phoneNumber : null,
    facebook: userProfile.facebook ? userProfile.facebook : null,
    instagram: userProfile.instagram ? userProfile.instagram : null,
    cards: userPublicCards ? userPublicCards : null,
  };
  //removed creation of mapdata for users
  //return updateMapData(userPublicRef, user_public, newPublicProfile);
  return userPublicRef.set(user_public);
};

const updateMapData = async (
  userPublicRef: any,
  user_public: any,
  newPublicProfile = false
) => {
  //update map data
  const mapDataRef = db.doc(`/mapData/${COLLECTIONPUBLICNAME}`);
  const mapDataDoc = await mapDataRef.get();
  let mapData = mapDataDoc.data();
  const newDoc = mapData ? false : true;
  mapData = mapData ? mapData : {};
  mapData[user_public.uid] = {
    displayName: user_public.displayName,
    photoURL: user_public.photoURL,
    coverURL: user_public.coverURL,
    cards: user_public.cards,
    position: user_public.address
      ? {
          geopoint: {
            Wa: user_public.address.lat,
            za: user_public.address.lon,
          },
        }
      : null,
  };
  if (newDoc) {
    return Promise.all([
      userPublicRef.set(user_public),
      mapDataRef.set(mapData),
      updateSystemData(COLLECTIONPUBLICNAME),
    ]);
  } else if (newPublicProfile) {
    return Promise.all([
      userPublicRef.set(user_public),
      mapDataRef.update(mapData),
      updateSystemData(COLLECTIONPUBLICNAME),
    ]);
  } else {
    return Promise.all([
      userPublicRef.update(user_public),
      mapDataRef.update(mapData),
      updateSystemData(COLLECTIONPUBLICNAME),
    ]);
  }
};

const deleteUserFromMapData = async (uid: string) => {
  //update map data
  const mapDataRef = db.doc(`/mapData/${COLLECTIONPUBLICNAME}`);
  const mapDataDoc = await mapDataRef.get();
  const mapData = mapDataDoc.data();
  if (mapData) {
    delete mapData[uid];
    return mapDataRef.set(mapData);
  } else {
    return null;
  }
};
