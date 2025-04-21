import * as functions from "firebase-functions";
import {
  REGION,
  MEMORY,
  TIMEOUT,
  updateEditorOf,
  db,
  CLASSESCOLLECTIONNAME,
  SETTINGSCOLLECTIONNAME,
  ARCHIVECOLLECTIONNAME,
  CLIENTSCOLLECTIONNAME,
} from "./c-system";
import {DCCOLLECTIONNAME} from "./ud-divingCenters";
import {USERPROFILECOLLECTIONNAME} from "./c-users";

export const updateDivingClasses = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(CLASSESCOLLECTIONNAME + "/{divingClassId}")
  .onWrite(async (change, context) => {
    const divingClassId = context.params.divingClassId;
    const divingClass =
      change && change.after && change.after.data()
        ? change.after.data()
        : null;
    const previousDivingClass =
      change && change.before && change.before.data()
        ? change.before.data()
        : null;
    if (divingClass) {
      //update or create
      return Promise.all([
        updateEditorOf(
          CLASSESCOLLECTIONNAME,
          divingClassId,
          divingClass,
          previousDivingClass
        ),
        updateOrganisersAndTeamSummary(
          divingClassId,
          divingClass,
          previousDivingClass
        ),
        updateStudentsBookings(divingClassId, divingClass, previousDivingClass),
        updateStudentsInSchool(divingClassId, divingClass, previousDivingClass),
        updateDiveCentersWithDivingClass(
          divingClassId,
          divingClass,
          previousDivingClass
        ),
      ]);
    } else {
      //delete
      return Promise.all([
        updateEditorOf(
          CLASSESCOLLECTIONNAME,
          divingClassId,
          null,
          previousDivingClass
        ),
        updateOrganisersAndTeamSummary(
          divingClassId,
          null,
          previousDivingClass
        ),
        updateStudentsBookings(divingClassId, null, previousDivingClass),
        updateStudentsInSchool(divingClassId, null, previousDivingClass),
        updateDiveCentersWithDivingClass(
          divingClassId,
          null,
          previousDivingClass
        ),
      ]);
    }
  });

//divingClassSummaryDoc -> used for user, diving ceneters and schools class list
const divingClassSummaryDoc = (diveClass: any) => {
  // Extract timestamps
  const timestamps = diveClass.activities.map((activity: any) =>
    new Date(activity.date).getTime()
  );

  // Find minimum and maximum timestamps
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);

  // Convert back to Date objects
  const minDate = new Date(minTimestamp);
  const maxDate = new Date(maxTimestamp);
  const start = minDate.toISOString();
  let end = maxDate.toISOString();
  return {
    date: start,
    end: end,
    displayName: diveClass.name,
    dives: [],
    organiser: diveClass.organiser,
  };
};

const diveSummaryDoc = (dive: any) => {
  return {
    start: dive.date,
    runtime: dive.BUHL ? dive.BUHL.runtime : 60,
  };
};

//divingClassSummary -> creates a list of dives for each site and each center
const divingClassSummary = (divingClass: any) => {
  const divingCentersDives: any = {};
  const organiserDives: any[] = [];

  divingClass.activities.map((activity: any) => {
    if (activity.divePlan) {
      activity.divePlan.dives.map((dive: any) => {
        const divingCenterId = dive.divingCenterId;
        //do not include diving center if it's the same as the organiser
        if (divingCenterId && divingCenterId !== divingClass.organiser.id) {
          if (!divingCentersDives[divingCenterId]) {
            divingCentersDives[divingCenterId] =
              divingClassSummaryDoc(divingClass);
          }
          //push dives for this diving center
          divingCentersDives[divingCenterId].dives.push(diveSummaryDoc(dive));
        }
        //set organiser dives
        organiserDives.push(diveSummaryDoc(dive));
      });
    }
  });
  return {
    divingCentersDives: divingCentersDives,
    organiserDives: organiserDives,
  };
};

//used to delete old dive classes from sites and centers
const checkSummaryDiveDates = (classSummary: any) => {
  let ret = false;
  classSummary.dives.map((dive: any) => {
    if (new Date(dive.date) > new Date()) ret = true;
  });
  return ret;
};

const updateDiveCentersWithDivingClass = async (
  divingClassId: any,
  divingClass: any,
  previousDivingClass: any
) => {
  //create list of dive centers
  let divingCentersClassDate: any = {};
  const classSummary = divingClass ? divingClassSummary(divingClass) : null;
  if (divingClass && classSummary) {
    divingCentersClassDate = classSummary.divingCentersDives;
  }
  let deletedPreviousDivingCenters: any = {};
  const previousTripSummary = previousDivingClass
    ? divingClassSummary(previousDivingClass)
    : null;
  if (previousDivingClass && previousTripSummary) {
    deletedPreviousDivingCenters = previousTripSummary.divingCentersDives;
    //keep all centers that are not present in the new summary
    for (const divingCenterId of Object.keys(deletedPreviousDivingCenters)) {
      if (divingCentersClassDate[divingCenterId]) {
        delete deletedPreviousDivingCenters[divingCenterId];
      }
    }
  }

  const promises: any[] = [];

  //insert/remove dive classes in dive centers settings collection
  const diveCentersKeys = Object.keys(divingCentersClassDate);
  if (diveCentersKeys.length > 0) {
    //update or create item
    diveCentersKeys.map(async (divingCenterId) => {
      const divingCenterClassesRef = db
        .doc(`/${DCCOLLECTIONNAME}/${divingCenterId}`)
        .collection(SETTINGSCOLLECTIONNAME)
        .doc(`/${CLASSESCOLLECTIONNAME}`);
      const divingCenterClassesDoc = await divingCenterClassesRef.get();
      const divingCenterClassesData = divingCenterClassesDoc.data();
      const classes: any = {};

      const divingCenterArchiveClassesRef = db
        .doc(`/${DCCOLLECTIONNAME}/${divingCenterId}`)
        .collection(ARCHIVECOLLECTIONNAME)
        .doc(`/${CLASSESCOLLECTIONNAME}`);
      const divingCenterArchiveClassesDoc =
        await divingCenterArchiveClassesRef.get();
      const divingCenterArchiveClassesData =
        divingCenterArchiveClassesDoc.data();
      const archiveClasses = divingCenterArchiveClassesData
        ? divingCenterArchiveClassesData
        : {};
      //archive old classes of dive center
      if (divingCenterClassesData) {
        Object.keys(divingCenterClassesData).map((tripId) => {
          //check dive dates and move old classes to archive
          if (!checkSummaryDiveDates(divingCenterClassesData[tripId])) {
            //keep trip in the list of this center
            classes[tripId] = divingCenterClassesData[tripId];
          } else {
            //move to archive
            archiveClasses[tripId] = divingCenterClassesData[tripId];
          }
        });
      }
      //add new trip if not existing alredy
      classes[divingClassId] = divingCentersClassDate[divingCenterId];
      promises.push(divingCenterClassesRef.set(classes));
      promises.push(divingCenterArchiveClassesRef.set(archiveClasses));
    });
  }

  //remove deleted classes from centers
  const deletedPreviousDivingCentersKeys = Object.keys(
    deletedPreviousDivingCenters
  );
  if (deletedPreviousDivingCentersKeys.length > 0) {
    deletedPreviousDivingCentersKeys.map(async (divingCenterId) => {
      const divingCenterClassesRef = db
        .doc(`/${DCCOLLECTIONNAME}/${divingCenterId}`)
        .collection(SETTINGSCOLLECTIONNAME)
        .doc(`/${CLASSESCOLLECTIONNAME}`);
      const divingCenterClassesDoc = await divingCenterClassesRef.get();
      const divingCenterClassesData = divingCenterClassesDoc.data();
      if (divingCenterClassesData) {
        delete divingCenterClassesData[divingClassId];
        promises.push(divingCenterClassesRef.set(divingCenterClassesData));
      }
    });
  }

  return Promise.all(promises);
};

const updateOrganisersAndTeamSummary = async (
  divingClassId: string,
  divingClass: any,
  previousDivingClass: any
) => {
  const promises = [];
  //insert/remove dive classes in organisers settings collection (schools, users and diving centers)
  const classSummary = divingClass ? divingClassSummary(divingClass) : null;
  if (divingClass) {
    const organiserClassesRef = db
      .doc(`/${divingClass.organiser.collectionId}/${divingClass.organiser.id}`)
      .collection(SETTINGSCOLLECTIONNAME)
      .doc(`/${CLASSESCOLLECTIONNAME}`);
    const organiserClassesDoc = await organiserClassesRef.get();
    const organiserClassesData = organiserClassesDoc.data();
    const classes = organiserClassesData ? organiserClassesData : {};
    classes[divingClassId] = divingClassSummaryDoc(divingClass);
    classes[divingClassId].dives = classSummary
      ? classSummary.organiserDives
      : [];
    promises.push(organiserClassesRef.set(classes));
  } else if (previousDivingClass) {
    //delete divetrip
    const organiserClassesRef = db
      .doc(
        `/${previousDivingClass.organiser.collectionId}/${previousDivingClass.organiser.id}`
      )
      .collection(SETTINGSCOLLECTIONNAME)
      .doc(`/${CLASSESCOLLECTIONNAME}`);
    const organiserClassesDoc = await organiserClassesRef.get();
    const organiserClassesData = organiserClassesDoc.data();
    if (organiserClassesData) {
      delete organiserClassesData[divingClassId];
      promises.push(organiserClassesRef.set(organiserClassesData));
    }
  }

  //insert/remove dive classes into editors and owners
  if (divingClass) {
    //add items to owner or editors lists
    for (const uid of Object.keys(divingClass.users)) {
      //get all userids of owners and editors
      const editorClassesRef = db
        .doc(`/${USERPROFILECOLLECTIONNAME}/${uid}`)
        .collection(SETTINGSCOLLECTIONNAME)
        .doc(`/${CLASSESCOLLECTIONNAME}`);
      const editorClassesDoc = await editorClassesRef.get();
      const editorClassesData = editorClassesDoc.data();
      const classes = editorClassesData ? editorClassesData : {};
      //update
      classes[divingClassId] = divingClassSummaryDoc(divingClass);
      classes[divingClassId].dives = classSummary
        ? classSummary.organiserDives
        : [];
      promises.push(editorClassesRef.set(classes));
    }
  } else if (previousDivingClass) {
    //compare with previous users
    for (const uid of Object.keys(previousDivingClass.users)) {
      //if item is null -> item has been deleted
      if (!divingClass || !divingClass.users[uid]) {
        //user has been removed
        const editorClassesRef = db
          .doc(`/${USERPROFILECOLLECTIONNAME}/${uid}`)
          .collection(SETTINGSCOLLECTIONNAME)
          .doc(`/${CLASSESCOLLECTIONNAME}`);
        const editorClassesDoc = await editorClassesRef.get();
        const editorClassesData = editorClassesDoc.data();
        //update
        if (editorClassesData) {
          delete editorClassesData[divingClassId];
          promises.push(editorClassesRef.set(editorClassesData));
        }
      }
    }
  }
  return Promise.all(promises);
};

const updateStudentsBookings = async (
  divingClassId: string,
  divingClass: any,
  previousDivingClass: any
) => {
  const promises: any = {};
  //insert/remove dive classes into students who booked for the dive class
  if (divingClass) {
    let classesData: any = {};
    for (const student of divingClass.students) {
      if (student.uid) {
        //add dive class to student collection
        const userClassesDocRef = db
          .doc(`/${USERPROFILECOLLECTIONNAME}/${student.uid}`)
          .collection(SETTINGSCOLLECTIONNAME)
          .doc(`/${CLASSESCOLLECTIONNAME}`);
        if (!promises[student.uid]) {
          //load data and update dives
          const userClassesDoc = await userClassesDocRef.get();
          const userClassesDocData = userClassesDoc.data();
          //set userclasses for this user
          if (userClassesDocData) classesData = userClassesDocData;
          //update
          classesData[divingClassId] = divingClassSummaryDoc(divingClass);
        }
        divingClass.activities.map((activity: any) => {
          if (activity.divePlan && activity.divePlan.dives) {
            const dives = activity.divePlan.dives;
            for (const dive of dives) {
              classesData[divingClassId].dives.push(diveSummaryDoc(dive));
            }
          }
        });
        promises[student.uid] = userClassesDocRef.set(classesData);
      }
    }
  }
  //compare bookings and previous bookings to find deleted bookings
  //valid also if item is deleted
  if (previousDivingClass) {
    for (const student of divingClass.students) {
      if (student.uid && !Object.keys(promises).includes(student.uid)) {
        const userClassesDocRef = db
          .doc(`/${USERPROFILECOLLECTIONNAME}/${student.uid}`)
          .collection(SETTINGSCOLLECTIONNAME)
          .doc(`/${CLASSESCOLLECTIONNAME}`);
        const userClassesDoc = await userClassesDocRef.get();
        const userClassesDocData = userClassesDoc.data();
        //update
        if (userClassesDocData) {
          delete userClassesDocData[divingClassId];
          promises[student.uid] = userClassesDocRef.set(userClassesDocData);
        }
      }
    }
  }
  const promisesArray: any = [];
  Object.keys(promises).map((userId) => {
    promisesArray.push(promises[userId]);
  });
  return Promise.all(promisesArray);
};

const updateStudentsInSchool = async (
  divingClassId: any,
  divingClass: any,
  previousDivingClass: any
) => {
  //insert/remove dive classes into students who booked for the dive class
  let studentsData: any = {};
  if (divingClass) {
    const organiserStudentsRef = db
      .doc(`/${divingClass.organiser.collectionId}/${divingClass.organiser.id}`)
      .collection(SETTINGSCOLLECTIONNAME)
      .doc(`/${CLIENTSCOLLECTIONNAME}`);
    //load data and update student's status
    const organiserStudentsDoc = await organiserStudentsRef.get();
    const organiserStudentsDocData = organiserStudentsDoc.data();
    if (organiserStudentsDocData) studentsData = organiserStudentsDocData;
    for (const student of divingClass.students) {
      if (student.uid) {
        if (!studentsData[student.uid]) {
          studentsData[student.uid] = {classes: {}};
        } else if (!studentsData[student.uid].classes) {
          studentsData[student.uid].classes = {};
        }
        //set student status in the class
        studentsData[student.uid].classes[divingClassId] = student.status;
      }
    }
    return organiserStudentsRef.set(studentsData);
  } else if (previousDivingClass) {
    //class has been deleted
    const organiserStudentsRef = db
      .doc(
        `/${previousDivingClass.organiser.collectionId}/${previousDivingClass.organiser.id}`
      )
      .collection(SETTINGSCOLLECTIONNAME)
      .doc(`/${CLIENTSCOLLECTIONNAME}`);
    //load data and update student's status
    const organiserStudentsDoc = await organiserStudentsRef.get();
    studentsData = organiserStudentsDoc.data();
    for (const student of previousDivingClass.students) {
      if (student.uid) {
        //update
        delete studentsData[student.uid].classes[divingClassId];
      }
    }
    return organiserStudentsRef.set(studentsData);
  }
  return true;
};
