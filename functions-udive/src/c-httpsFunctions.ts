import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// Moments library to format dates.
const moment = require("moment");
// CORS Express middleware to enable CORS Requests.
const cors = require("cors")({
  origin: true,
});
import {REGION, MEMORY, TIMEOUT, db, USERROLESCOLLECTION} from "./c-system";
import {isArray} from "lodash";

const setAccessControlDomains = function (req: any, res: any) {
  res.set("Access-Control-Allow-Origin", "https://gue.com");
  res.set("Access-Control-Allow-Origin", "https://u-dive.cloud");
  res.set("Access-Control-Allow-Origin", "http://localhost:3333");
  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send();
  }
};

const getQueryParam = function (req: any, param: any) {
  // [START readQueryParam]
  let query = req.query ? req.query[param] : null;
  // [END readQueryParam]
  // Reading date format from request body query parameter
  if (!query) {
    // [START readBodyParam]
    query = req.body[param];
    // [END readBodyParam]
  }
  try {
    const json = JSON.parse(query);
    query = json;
  } catch (error) {
    //not JSON
  }

  return query;
};
/**
 * Returns the server's date. You must provide a `format` URL query parameter or `format` value in
 * the request body with which we'll try to format the date.
 *
 * Format must follow the Node moment library. See: http://momentjs.com/
 *
 * Example format: "MMMM Do YYYY, h:mm:ss a".
 * Example request using URL query parameters:
 *   https://us-central1-<project-id>.cloudfunctions.net/date?format=MMMM%20Do%20YYYY%2C%20h%3Amm%3Ass%20a
 * Example request using request body with cURL:
 *   curl -H 'Content-Type: application/json' /
 *        -d '{"format": "MMMM Do YYYY, h:mm:ss a"}' /
 *        https://us-central1-<project-id>.cloudfunctions.net/date
 *
 * This endpoint supports CORS.
 */
export const date = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onRequest((req, res) => {
    // [START usingMiddleware]
    // Enable CORS using the `cors` express middleware.
    return cors(req, res, () => {
      setAccessControlDomains(req, res);
      // [END usingMiddleware]
      // Reading date format from URL query parameter.
      const format = getQueryParam(req, "format");
      // [START sendResponse]
      const formattedDate = moment().format(format);
      res.status(200).send({
        date: formattedDate,
      });
      // [END sendResponse]
    });
  });

//start trial period from GUE website
export const startTrialPeriod = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onRequest((req, res) => {
    return cors(req, res, async () => {
      setAccessControlDomains(req, res);
      // Forbidding non POST requests.
      if (req.method !== "POST") {
        res.status(403).send({err: "Forbidden!"});
      } else {
        const uid = getQueryParam(req, "uid");
        const level = getQueryParam(req, "level")
          ? getQueryParam(req, "level")
          : "unlimited";
        const duration = getQueryParam(req, "duration")
          ? getQueryParam(req, "duration")
          : 15;
        const fromDate = getQueryParam(req, "fromDate")
          ? new Date(getQueryParam(req, "fromDate") as string).toISOString()
          : new Date().toISOString();
        const userRolesRef = db.doc(`/${USERROLESCOLLECTION}/${uid}`);
        const userRolesDoc = await userRolesRef.get();
        const userRolesData = userRolesDoc.data();
        if (userRolesData && userRolesData.licences) {
          userRolesData.licences.trial.level = level;
          userRolesData.licences.trial.duration = duration;
          userRolesData.licences.trial.fromDate = fromDate;
          try {
            await userRolesRef.set(userRolesData);
            res.status(200).send({
              ok: "trial started",
              trial: userRolesData.licences.trial,
            });
          } catch (error) {
            res.status(403).send({err: error});
          }
        } else {
          res.status(403).send({err: "User error"});
        }
      }
    });
  });

//start license from GUE website
export const activateLicenses = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onRequest((req, res) => {
    return cors(req, res, async () => {
      setAccessControlDomains(req, res);
      // Forbidding non POST requests.
      if (req.method !== "POST") {
        res.status(403).send({err: "Forbidden!"});
      } else {
        const uid = getQueryParam(req, "uid")
          ? getQueryParam(req, "uid")
          : null;
        const levels = getQueryParam(req, "levels")
          ? getQueryParam(req, "levels")
          : null;
        if (uid && levels) {
          if (isArray(levels)) {
            const userRolesRef = db.doc(`/${USERROLESCOLLECTION}/${uid}`);
            const userRolesDoc = await userRolesRef.get();
            const userRolesData = userRolesDoc.data();
            if (userRolesData && userRolesData.licences) {
              const activatedLevels: any[] = [];
              levels.forEach((level) => {
                if (userRolesData.licences[level] === false) {
                  userRolesData.licences[level] = true;
                  activatedLevels.push(level);
                }
              });
              try {
                await userRolesRef.set(userRolesData);
                res.status(200).send({
                  ok: "licenses activated",
                  levels: activatedLevels,
                });
              } catch (error) {
                res.status(403).send({err: error});
              }
            } else {
              res.status(403).send({err: "UserId not found"});
            }
          } else {
            res.status(403).send({err: "Levels must be an Array"});
          }
        } else {
          res.status(403).send({err: "Missing uid or levels parameters"});
        }
      }
    });
  });

//check if user is already registered
export const getUserIdWithEmail = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onRequest((req, res) => {
    return cors(req, res, async () => {
      setAccessControlDomains(req, res);
      // Forbidding non POST requests.
      if (req.method !== "POST") {
        res.status(403).send({err: "Forbidden!"});
      } else {
        const email = getQueryParam(req, "email");
        try {
          const userRecord = await admin.auth().getUserByEmail(email);
          res.status(200).send({
            data: userRecord,
          });
        } catch (error) {
          res.status(403).send({err: error});
        }
      }
    });
  });

//create new user with email
export const registerUserWithEmail = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onRequest((req, res) => {
    return cors(req, res, async () => {
      setAccessControlDomains(req, res);
      // Forbidding non POST requests.
      if (req.method !== "POST") {
        res.status(403).send({err: "Forbidden!"});
      } else {
        const email = getQueryParam(req, "email");
        const psw = getQueryParam(req, "psw")
          ? getQueryParam(req, "psw")
          : "tmp-password";
        try {
          const user = await admin.auth().createUser({
            email: email,
            emailVerified: false,
            password: psw,
            displayName: email,
            disabled: false,
          });
          const resetLink = await admin.auth().generatePasswordResetLink(email);
          const verificationLink = await admin
            .auth()
            .generateEmailVerificationLink(email);
          //check if user has been created - try for 4 seconds
          for (let i = 0; i < 5; i++) {
            if (await checkUserCreated(user.uid)) {
              //stop loop
              break;
            } else {
              //retry after 1 sec
              await setTimeout(() => undefined, 1000);
            }
          }
          try {
            res.status(200).send({
              data: user,
              reset_link: resetLink,
              verification_link: verificationLink,
            });
          } catch (error) {
            res.status(403).send({err: error});
          }
        } catch (error) {
          res.status(403).send({err: error});
        }
      }
    });
  });

//check if user has been created
const checkUserCreated = async function (uid: string) {
  const userRolesRef = db.doc(`/${USERROLESCOLLECTION}/${uid}`);
  const userRolesDoc = await userRolesRef.get();
  const userRolesData = userRolesDoc.data();
  if (userRolesData && userRolesData.licences) {
    return true;
  } else {
    return false;
  }
};

export const resetPswForEmail = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onRequest((req, res) => {
    return cors(req, res, async () => {
      setAccessControlDomains(req, res);
      // Forbidding non POST requests.
      if (req.method !== "POST") {
        res.status(403).send({err: "Forbidden!"});
      } else {
        const email = getQueryParam(req, "email");

        try {
          const resetLink = await admin.auth().generatePasswordResetLink(email);

          try {
            res.status(200).send({
              reset_link: resetLink,
            });
          } catch (error) {
            res.status(403).send({err: error});
          }
        } catch (error) {
          res.status(403).send({err: error});
        }
      }
    });
  });

//delete user with id
export const deleteUserWithId = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onRequest((req, res) => {
    return cors(req, res, async () => {
      setAccessControlDomains(req, res);
      // Forbidding non POST requests.
      if (req.method !== "POST") {
        res.status(403).send({err: "Forbidden!"});
      } else {
        const uid = getQueryParam(req, "uid");
        try {
          await admin.auth().deleteUser(uid);
          res.status(200).send({
            ok: "user deleted",
          });
        } catch (error) {
          res.status(403).send({err: error});
        }
      }
    });
  });
