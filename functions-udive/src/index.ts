import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

//init firebase admin
admin.initializeApp(functions.config().firebase);
admin.firestore().settings({ignoreUndefinedProperties: true});

export * from "./c-users";
export * from "./ud-diveSites";
export * from "./ud-divingCenters";
export * from "./ud-diveCommunities";
export * from "./ud-divingSchools";
export * from "./ud-serviceCenters";
export * from "./ud-divePlans";
export * from "./ud-diveTrips";
export * from "./ud-divingClasses";
export * from "./c-system";
export * from "./c-splitAndStoreDocuments";
export * from "./c-chats";
export * from "./c-notifications";
export * from "./c-callableFunctions";
export * from "./c-httpsFunctions";
export * from "./c-reviews";
