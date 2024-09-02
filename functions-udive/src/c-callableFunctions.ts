import * as functions from "firebase-functions";
import {
  REGION,
  MEMORY,
  TIMEOUT,
  updateSystemData,
  db,
  SYSTEMCOLLECTION,
  PREFERENCESDOC,
  TRANSLATIONSDOC,
  DIVINGAGENCIESDOC,
  USERROLESCOLLECTION,
  TRIPSCOLLECTIONNAME,
  CLASSESCOLLECTIONNAME,
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

//updateBookings for dive trips
export const addBooking = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onCall(async (data) => {
    const diveTripId = data.diveTripId;
    const tripIndex = data.tripIndex;
    const addBookingData = data.booking;

    const diveTripRef = db.doc(`/${TRIPSCOLLECTIONNAME}/${diveTripId}`);
    const diveTripDoc = await diveTripRef.get();
    const diveTrip = diveTripDoc.data();
    if (diveTrip) {
      const tripDive = diveTrip.tripDives[tripIndex];
      if (!tripDive.bookings) tripDive.bookings = [];
      const userBookingIndex = tripDive.bookings.findIndex(
        (booking: any) => booking.uid === addBookingData.uid
      );
      if (addBookingData.confirmedUser === null && userBookingIndex > -1) {
        tripDive.bookings.splice(userBookingIndex, 1);
      } else if (userBookingIndex > -1) {
        tripDive.bookings[userBookingIndex] = addBookingData;
      } else {
        tripDive.bookings.push(addBookingData);
      }
      try {
        await diveTripRef.set(diveTrip);
        return tripDive.bookings;
      } catch (error) {
        return false;
      }
    }
    return false;
  });

//updateBookings for dive classes
export const addClassStudent = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onCall(async (data) => {
    const diveClassId = data.diveClassId;
    const addStudentData = data.student;

    const diveClassRef = db.doc(`/${CLASSESCOLLECTIONNAME}/${diveClassId}`);
    const diveClassDoc = await diveClassRef.get();
    const diveClass = diveClassDoc.data();
    if (diveClass) {
      if (!diveClass.students) diveClass.students = [];
      const userBookingIndex = diveClass.students.findIndex(
        (booking: any) => booking.uid === addStudentData.uid
      );
      if (addStudentData.status === "removed" && userBookingIndex > -1) {
        diveClass.students.splice(userBookingIndex, 1);
      } else if (userBookingIndex > -1) {
        diveClass.students[userBookingIndex] = addStudentData;
      } else {
        diveClass.students.push(addStudentData);
      }
      try {
        await diveClassRef.set(diveClass);
        return diveClass.students;
      } catch (error) {
        return false;
      }
    }
    return false;
  });

//updateBookings for dive trips
export const updateDivingAgency = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onCall(async (data, context) => {
    //check user
    if (context && context.auth) {
      const uid = context.auth.uid;
      const divingAgencyId = data.id;
      const divingAgencyData = data.data;

      const userRolesRef = db.doc(`/${USERROLESCOLLECTION}/${uid}`);
      const userRolesDoc = await userRolesRef.get();
      const userRolesData = userRolesDoc.data();
      if (
        userRolesData &&
        (userRolesData.roles.includes(
          divingAgencyId.toLowerCase() + "-admin"
        ) ||
          userRolesData.roles.includes("superAdmin"))
      ) {
        //approved user for this agency
        const systemRef = db.doc(`/${SYSTEMCOLLECTION}/${PREFERENCESDOC}`);
        const systemDoc = await systemRef.get();
        const system = systemDoc.data();
        if (system) {
          !system[DIVINGAGENCIESDOC]
            ? (system[DIVINGAGENCIESDOC] = {})
            : undefined;
          //update doc
          system[DIVINGAGENCIESDOC][divingAgencyId] = divingAgencyData;

          try {
            await systemRef.set(system);
            return true;
          } catch (error) {
            return {
              error: error,
            };
          }
        } else {
          return {
            error: "error",
          };
        }
      } else {
        return {
          error: "User not admin for this agency",
        };
      }
    } else {
      return {
        error: "error",
      };
    }
  });

//start trial period from inside the app
export const startUserTrialPeriod = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onCall(async (data, context) => {
    //check user
    if (context && context.auth) {
    } else {
      return {
        error: "error",
      };
    }
    const uid = context.auth.uid;
    const level = "unlimited";
    const duration = 15;
    const fromDate = new Date().toISOString();
    const userRolesRef = db.doc(`/${USERROLESCOLLECTION}/${uid}`);
    const userRolesDoc = await userRolesRef.get();
    const userRolesData = userRolesDoc.data();
    if (userRolesData && userRolesData.licences) {
      userRolesData.licences.trial.level = level;
      userRolesData.licences.trial.duration = duration;
      //update date only if not already set
      userRolesData.licences.trial.fromDate = userRolesData.licences.trial
        .fromDate
        ? userRolesData.licences.trial.fromDate
        : fromDate;
      try {
        await userRolesRef.set(userRolesData);
        return {
          ok: "trial started",
          trial: userRolesData.licences.trial,
        };
      } catch (error) {
        return {
          error: error,
        };
      }
    } else {
      return {
        error: "User error",
      };
    }
  });
