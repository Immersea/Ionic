import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const logData = (message: string, info: any) => {
  logger.info(message, info, {structuredData: true});
};

// init firebase admin
admin.initializeApp(functions.config().firebase);
admin.firestore().settings({
  ignoreUndefinedProperties: true,
});

export * from "./c-users";
export * from "./c-system";
export * from "./c-callableFunctions";
export * from "./c-splitAndStoreDocuments";
export * from "./customers";
export * from "./contacts";
export * from "./shapes";
export * from "./datasheets";
export * from "./projects";
