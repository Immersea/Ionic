import * as functions from "firebase-functions";
import {
  REGION,
  MEMORY,
  TIMEOUT,
  updateEditorOf,
  db,
  TRIPSCOLLECTIONNAME,
  SETTINGSCOLLECTIONNAME,
  ARCHIVECOLLECTIONNAME,
  CLIENTSCOLLECTIONNAME,
  CHATSCOLLECTIONNAME,
} from "./c-system";
import {SITESCOLLECTIONNAME} from "./ud-diveSites";
import {DCCOLLECTIONNAME} from "./ud-divingCenters";
import {USERPROFILECOLLECTIONNAME} from "./c-users";

export const updateDiveTrips = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(TRIPSCOLLECTIONNAME + "/{diveTripId}")
  .onWrite(async (change, context) => {
    const diveTripId = context.params.diveTripId;
    const diveTrip =
      change && change.after && change.after.data()
        ? change.after.data()
        : null;
    const previousDiveTrip =
      change && change.before && change.before.data()
        ? change.before.data()
        : null;
    if (diveTrip) {
      //update or create
      return Promise.all([
        updateEditorOf(
          TRIPSCOLLECTIONNAME,
          diveTripId,
          diveTrip,
          previousDiveTrip
        ),
        updateOrganisersAndTeamSummary(diveTripId, diveTrip, previousDiveTrip),
        updateUsersBookings(diveTripId, diveTrip, previousDiveTrip),
        updateClientsInOrganiser(diveTripId, diveTrip, previousDiveTrip),
        updateDiveSitesAndCentersWithDiveTrip(
          diveTripId,
          diveTrip,
          previousDiveTrip
        ),
      ]);
    } else {
      //delete
      return Promise.all([
        updateEditorOf(TRIPSCOLLECTIONNAME, diveTripId, null, previousDiveTrip),
        updateOrganisersAndTeamSummary(diveTripId, null, previousDiveTrip),
        updateUsersBookings(diveTripId, null, previousDiveTrip),
        updateClientsInOrganiser(diveTripId, null, previousDiveTrip),
        updateDiveSitesAndCentersWithDiveTrip(
          diveTripId,
          null,
          previousDiveTrip
        ),
        deleteTripChat(previousDiveTrip),
      ]);
    }
  });

const deleteTripChat = (previousDiveTrip: any) => {
  const chatTripRef = db.doc(
    `/${CHATSCOLLECTIONNAME}/${previousDiveTrip.chatId}`
  );
  return chatTripRef.delete();
};

//diveTripSummaryDoc -> used for user, diving centers and schools dive trips list
const diveTripSummaryDoc = (item: any) => {
  const end = new Date(item.tripDives[0].divePlan.dives[0].date);
  let endString = item.tripDives[0].divePlan.dives[0].date;
  item.tripDives.map((trip: any) => {
    trip.divePlan.dives.map((dive: any) => {
      const date = new Date(dive.date);
      if (date > end) {
        endString = dive.date;
      }
    });
  });
  return {
    date: item.tripDives[0].divePlan.dives[0].date,
    end: endString,
    displayName: item.displayName,
    dives: [],
    organiser: item.organiser,
  };
};

const diveSummaryDoc = (dive: any) => {
  return {
    start: dive.date,
    runtime: dive.BUHL ? dive.BUHL.runtime : 60,
  };
};

//diveTripSummary -> creates a list of dives for each site and each center
const diveTripSummary = (diveTrip: any) => {
  const diveSitesDives: {[key: string]: any} = {};
  const divingCentersDives: {[key: string]: any} = {};
  const organiserDives: any[] = [];
  diveTrip.tripDives.map((trip: any) => {
    trip.divePlan.dives.map((dive: any) => {
      const diveSiteId = dive.diveSiteId;
      if (diveSiteId) {
        if (!diveSitesDives[diveSiteId]) {
          diveSitesDives[diveSiteId] = diveTripSummaryDoc(diveTrip);
        }
        //push dives for this dive site
        diveSitesDives[diveSiteId].dives.push(diveSummaryDoc(dive));
      }
      const divingCenterId = dive.divingCenterId;
      //do not include diving center if it's the same as the organiser
      if (divingCenterId && divingCenterId !== diveTrip.organiser.id) {
        if (!divingCentersDives[divingCenterId]) {
          divingCentersDives[divingCenterId] = diveTripSummaryDoc(diveTrip);
        }
        //push dives for this diving center
        divingCentersDives[divingCenterId].dives.push(diveSummaryDoc(dive));
      }
      //set organiser dives
      organiserDives.push(diveSummaryDoc(dive));
    });
  });
  return {
    diveSitesDives: diveSitesDives,
    divingCentersDives: divingCentersDives,
    organiserDives: organiserDives,
  };
};

//used to delete old dive trips from sites and centers
const checkSummaryDiveDates = (tripSummary: any) => {
  let ret = false;
  tripSummary.dives.map((dive: any) => {
    if (new Date(dive.date) > new Date()) ret = true;
  });
  return ret;
};

const updateDiveSitesAndCentersWithDiveTrip = async (
  diveTripId: string,
  diveTrip: any,
  previousDiveTrip: any
) => {
  //create list of dive sites
  let diveSitesTripDate: {[key: string]: any} = {};
  let divingCentersTripDate: {[key: string]: any} = {};
  const tripSummary = diveTrip ? diveTripSummary(diveTrip) : null;
  if (diveTrip && tripSummary) {
    diveSitesTripDate = tripSummary.diveSitesDives;
    divingCentersTripDate = tripSummary.divingCentersDives;
  }
  let deletedPreviousDiveSites: {[key: string]: any} = {};
  let deletedPreviousDivingCenters: {[key: string]: any} = {};
  const previousTripSummary = previousDiveTrip
    ? diveTripSummary(previousDiveTrip)
    : null;
  if (previousDiveTrip && previousTripSummary) {
    deletedPreviousDiveSites = previousTripSummary.diveSitesDives;
    deletedPreviousDivingCenters = previousTripSummary.divingCentersDives;
    //keep all sites that are not present in the new summary
    Object.keys(deletedPreviousDiveSites).map((diveSiteId) => {
      if (diveSitesTripDate[diveSiteId]) {
        delete deletedPreviousDiveSites[diveSiteId];
      }
    });
    Object.keys(deletedPreviousDivingCenters).map((divingCenterId) => {
      if (divingCentersTripDate[divingCenterId]) {
        delete deletedPreviousDivingCenters[divingCenterId];
      }
    });
  }

  const promises: any[] = [];

  //insert/remove dive trips in sites settings collection
  const diveSitesKeys = Object.keys(diveSitesTripDate);
  if (diveSitesKeys.length > 0) {
    //update or create item
    diveSitesKeys.map(async (diveSiteId) => {
      const diveSiteTripsRef = db
        .doc(`/${SITESCOLLECTIONNAME}/${diveSiteId}`)
        .collection(SETTINGSCOLLECTIONNAME)
        .doc(`/${TRIPSCOLLECTIONNAME}`);
      const diveSiteTripsDoc = await diveSiteTripsRef.get();
      const diveSiteTripsData = diveSiteTripsDoc.data();
      const trips: {[key: string]: any} = {};
      //delete old trips from dive site
      if (diveSiteTripsData) {
        Object.keys(diveSiteTripsData).map((tripId) => {
          //check dive dates and delete old trips
          const checkTripDates = checkSummaryDiveDates(
            diveSiteTripsData[tripId]
          );
          if (!checkTripDates) {
            //keep trip in the list of this site
            trips[tripId] = diveSiteTripsData[tripId];
          }
        });
      }
      //add new trip
      trips[diveTripId] = diveSitesTripDate[diveSiteId];
      promises.push(diveSiteTripsRef.set(trips));
    });
  }

  //insert/remove dive trips in dive centers settings collection
  const diveCentersKeys = Object.keys(divingCentersTripDate);
  if (diveCentersKeys.length > 0) {
    //update or create item
    diveCentersKeys.map(async (divingCenterId) => {
      const divingCenterTripsRef = db
        .doc(`/${DCCOLLECTIONNAME}/${divingCenterId}`)
        .collection(SETTINGSCOLLECTIONNAME)
        .doc(`/${TRIPSCOLLECTIONNAME}`);
      const divingCenterTripsDoc = await divingCenterTripsRef.get();
      const divingCenterTripsData = divingCenterTripsDoc.data();
      const trips: {[key: string]: any} = {};

      const divingCenterArchiveTripsRef = db
        .doc(`/${DCCOLLECTIONNAME}/${divingCenterId}`)
        .collection(ARCHIVECOLLECTIONNAME)
        .doc(`/${TRIPSCOLLECTIONNAME}`);
      const divingCenterArchiveTripsDoc =
        await divingCenterArchiveTripsRef.get();
      const divingCenterArchiveTripsData = divingCenterArchiveTripsDoc.data();
      const archiveTrips = divingCenterArchiveTripsData
        ? divingCenterArchiveTripsData
        : {};
      //archive old trips of dive center
      if (divingCenterTripsData) {
        Object.keys(divingCenterTripsData).map((tripId) => {
          //check dive dates and move old trips to archive
          if (!checkSummaryDiveDates(divingCenterTripsData[tripId])) {
            //keep trip in the list of this center
            trips[tripId] = divingCenterTripsData[tripId];
          } else {
            //move to archive
            archiveTrips[tripId] = divingCenterTripsData[tripId];
          }
        });
      }
      //add new trip if not existing alredy
      trips[diveTripId] = divingCentersTripDate[divingCenterId];
      promises.push(divingCenterTripsRef.set(trips));
      promises.push(divingCenterArchiveTripsRef.set(archiveTrips));
    });
  }

  //remove deleted trips from sites and centers
  const deletedPreviousDiveSitesKeys = Object.keys(deletedPreviousDiveSites);
  if (deletedPreviousDiveSitesKeys.length > 0) {
    deletedPreviousDiveSitesKeys.map(async (diveSiteId) => {
      const diveSiteTripsRef = db
        .doc(`/${SITESCOLLECTIONNAME}/${diveSiteId}`)
        .collection(SETTINGSCOLLECTIONNAME)
        .doc(`/${TRIPSCOLLECTIONNAME}`);
      const diveSiteTripsDoc = await diveSiteTripsRef.get();
      const diveSiteTripsData = diveSiteTripsDoc.data();
      if (diveSiteTripsData) {
        delete diveSiteTripsData[diveTripId];
        promises.push(diveSiteTripsRef.set(diveSiteTripsData));
      }
    });
  }

  const deletedPreviousDivingCentersKeys = Object.keys(
    deletedPreviousDivingCenters
  );
  if (deletedPreviousDivingCentersKeys.length > 0) {
    deletedPreviousDivingCentersKeys.map(async (divingCenterId) => {
      const divingCenterTripsRef = db
        .doc(`/${DCCOLLECTIONNAME}/${divingCenterId}`)
        .collection(SETTINGSCOLLECTIONNAME)
        .doc(`/${TRIPSCOLLECTIONNAME}`);
      const divingCenterTripsDoc = await divingCenterTripsRef.get();
      const divingCenterTripsData = divingCenterTripsDoc.data();
      if (divingCenterTripsData) {
        delete divingCenterTripsData[diveTripId];
        promises.push(divingCenterTripsRef.set(divingCenterTripsData));
      }
    });
  }

  return Promise.all(promises);
};

const updateOrganisersAndTeamSummary = async (
  diveTripId: string,
  diveTrip: any,
  previousDiveTrip: any
) => {
  const promises = [];
  //insert/remove dive trips in organisers settings collection (schools, users and diving centers)
  const tripSummary = diveTrip ? diveTripSummary(diveTrip) : null;

  if (diveTrip) {
    const organiserTripsRef = db
      .doc(`/${diveTrip.organiser.collectionId}/${diveTrip.organiser.id}`)
      .collection(SETTINGSCOLLECTIONNAME)
      .doc(`/${TRIPSCOLLECTIONNAME}`);
    const organiserTripsDoc = await organiserTripsRef.get();
    const organiserTripsData = organiserTripsDoc.data();
    const trips = organiserTripsData ? organiserTripsData : {};
    trips[diveTripId] = diveTripSummaryDoc(diveTrip);
    trips[diveTripId].dives = tripSummary ? tripSummary.organiserDives : [];
    promises.push(organiserTripsRef.set(trips));
  } else if (previousDiveTrip) {
    //delete divetrip
    const organiserTripsRef = db
      .doc(
        `/${previousDiveTrip.organiser.collectionId}/${previousDiveTrip.organiser.id}`
      )
      .collection(SETTINGSCOLLECTIONNAME)
      .doc(`/${TRIPSCOLLECTIONNAME}`);
    const organiserTripsDoc = await organiserTripsRef.get();
    const organiserTripsData = organiserTripsDoc.data();
    if (organiserTripsData) {
      delete organiserTripsData[diveTripId];
      promises.push(organiserTripsRef.set(organiserTripsData));
    }
  }

  //insert/remove dive trips into editors and owners
  if (diveTrip) {
    //add items to owner or editors lists
    for (const uid of Object.keys(diveTrip.users)) {
      //get all userids of owners and editors
      const editorTripsRef = db
        .doc(`/${USERPROFILECOLLECTIONNAME}/${uid}`)
        .collection(SETTINGSCOLLECTIONNAME)
        .doc(`/${TRIPSCOLLECTIONNAME}`);
      const editorTripsDoc = await editorTripsRef.get();
      const editorTripsData = editorTripsDoc.data();
      const trips = editorTripsData ? editorTripsData : {};
      //update
      trips[diveTripId] = diveTripSummaryDoc(diveTrip);
      trips[diveTripId].dives = tripSummary ? tripSummary.organiserDives : [];
      promises.push(editorTripsRef.set(trips));
    }
  } else if (previousDiveTrip) {
    //compare with previous users
    for (const uid of Object.keys(previousDiveTrip.users)) {
      //if item is null -> item has been deleted
      if (!diveTrip || !diveTrip.users[uid]) {
        //user has been removed
        const editorTripsRef = db
          .doc(`/${USERPROFILECOLLECTIONNAME}/${uid}`)
          .collection(SETTINGSCOLLECTIONNAME)
          .doc(`/${TRIPSCOLLECTIONNAME}`);
        const editorTripsDoc = await editorTripsRef.get();
        const editorTripsData = editorTripsDoc.data();
        //update
        if (editorTripsData) {
          delete editorTripsData[diveTripId];
          promises.push(editorTripsRef.set(editorTripsData));
        }
      }
    }
  }
  return Promise.all(promises);
};

const updateUsersBookings = async (
  diveTripId: string,
  diveTrip: any,
  previousDiveTrip: any
) => {
  const promises: {[key: string]: any} = {};
  //insert/remove dive trips into users who booked for the dive trip
  if (diveTrip) {
    let tripsData: {[key: string]: any} = {};
    for (const tripDive of diveTrip.tripDives) {
      for (const booking of tripDive.bookings) {
        if (booking.uid) {
          const userTripsDocRef = db
            .doc(`/${USERPROFILECOLLECTIONNAME}/${booking.uid}`)
            .collection(SETTINGSCOLLECTIONNAME)
            .doc(`/${TRIPSCOLLECTIONNAME}`);
          if (!promises[booking.uid]) {
            //load data and update dives
            const userTripsDoc = await userTripsDocRef.get();
            const userTripsDocData = userTripsDoc.data();
            //set usertrips for this user
            if (userTripsDocData) tripsData = userTripsDocData;
            //update
            tripsData[diveTripId] = diveTripSummaryDoc(diveTrip);
          }
          if (tripDive.divePlan && tripDive.divePlan.dives) {
            const dives = tripDive.divePlan.dives;
            for (const dive of dives) {
              tripsData[diveTripId].dives.push(diveSummaryDoc(dive));
            }
          }
          promises[booking.uid] = userTripsDocRef.set(tripsData);
        }
      }
    }
  }
  //compare bookings and previous bookings to find deleted bookings
  //valid also if item is deleted
  if (previousDiveTrip) {
    for (const tripDive of previousDiveTrip.tripDives) {
      for (const booking of tripDive.bookings) {
        if (booking.uid && !Object.keys(promises).includes(booking.uid)) {
          const userTripsDocRef = db
            .doc(`/${USERPROFILECOLLECTIONNAME}/${booking.uid}`)
            .collection(SETTINGSCOLLECTIONNAME)
            .doc(`/${TRIPSCOLLECTIONNAME}`);
          const userTripsDoc = await userTripsDocRef.get();
          const userTripsDocData = userTripsDoc.data();
          //update
          if (userTripsDocData) {
            delete userTripsDocData[diveTripId];
            promises[booking.uid] = userTripsDocRef.set(userTripsDocData);
          }
        }
      }
    }
  }
  const promisesArray: any[] = [];
  Object.keys(promises).map((userId) => {
    promisesArray.push(promises[userId]);
  });
  return Promise.all(promisesArray);
};

const updateClientsInOrganiser = async (
  diveTripId: string,
  diveTrip: any,
  previousDiveTrip: any
) => {
  //insert/remove dive classes into students who booked for the dive class
  if (diveTrip) {
    let tripsData: {[key: string]: any} = {};
    const organiserBookingsRef = db
      .doc(`/${diveTrip.organiser.collectionId}/${diveTrip.organiser.id}`)
      .collection(SETTINGSCOLLECTIONNAME)
      .doc(`/${CLIENTSCOLLECTIONNAME}`);
    //load data and update student's status
    const organiserBookingsDoc = await organiserBookingsRef.get();
    const organiserBookingsDocData = organiserBookingsDoc.data();
    if (organiserBookingsDocData) tripsData = organiserBookingsDocData;
    for (const tripDive of diveTrip.tripDives) {
      for (const booking of tripDive.bookings) {
        if (booking.uid) {
          if (!tripsData[booking.uid]) {
            tripsData[booking.uid] = {trips: {}};
          } else if (!tripsData[booking.uid].trips) {
            tripsData[booking.uid].trips = {};
          }
          //set client in the trip
          tripsData[booking.uid].trips[diveTripId] = true;
        }
      }
    }
    return organiserBookingsRef.set(tripsData);
  } else if (previousDiveTrip) {
    let tripsData: any = {};

    //class has been deleted
    const organiserBookingsRef = db
      .doc(
        `/${previousDiveTrip.organiser.collectionId}/${previousDiveTrip.organiser.id}`
      )
      .collection(SETTINGSCOLLECTIONNAME)
      .doc(`/${CLIENTSCOLLECTIONNAME}`);
    //load data and update student's status
    const organiserBookingsDoc = await organiserBookingsRef.get();
    tripsData = organiserBookingsDoc.data();
    for (const tripDive of diveTrip.tripDives) {
      for (const booking of tripDive.bookings) {
        if (booking.uid) {
          //delete
          delete tripsData[booking.uid].trips[diveTripId];
        }
      }
    }
    return organiserBookingsRef.set(tripsData);
  }
  return true;
};
