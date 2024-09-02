import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {REGION, MEMORY, TIMEOUT, db} from "./c-system";
import {USERPROFILECOLLECTIONNAME} from "./c-users";

export const NOTIFICATIONSCOLLECTIONNAME = "notifications";
export const NOTIFICATIONTOKENSDOCNAME = "tokens";

export const sendNotification = async (
  title: string,
  body: string,
  link: any,
  tokens?: string[],
  topic?: string
) => {
  //payload for PWA
  const payload = {
    data: {
      body: body,
      title: title,
      link: link,
    },
  };
  //payload for native
  /*
  const payload = {
    notification: {
      body: body,
      title: title,
    },
    data: data,
  };*/
  const promises = [];
  if (tokens && tokens.length > 0) {
    tokens.map((token) => {
      promises.push(
        admin
          .messaging()
          .sendToDevice(token, payload)
          .then(() => {
            //console.log("sendToDevice", token, res);
          })
          .catch((err) => {
            console.log("err", token, err);
          })
      );
    });
  } else if (topic) {
    promises.push(
      admin
        .messaging()
        .sendToTopic(topic, payload)
        .then(() => {
          //console.log("sendToTopic", topic, res);
        })
        .catch((err) => {
          console.log("err", topic, err);
        })
    );
  }
  return await Promise.all(promises);
};

//subscribe tokens to a specific topic
export const subscribeToTopic = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onCall(async (data) => {
    const tokens = data.tokens;
    const topic = data.topic;
    return await admin.messaging().subscribeToTopic(tokens, topic);
  });

//subscribe tokens to a specific topic
export const unsubscribeFromTopic = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onCall(async (data) => {
    const tokens = data.tokens;
    const topic = data.topic;
    return await admin.messaging().unsubscribeFromTopic(tokens, topic);
  });

//send notification to Topic
export const sendNotificationToTopic = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onCall(async (data) => {
    const topic = data.topic;
    const title = data.title;
    const body = data.body;
    const notificationData = data.data;
    return await sendNotification(title, body, notificationData, [], topic);
  });

//send notification to tokens
export const sendNotificationToTokens = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .https.onCall(async (data) => {
    const tokens = data.tokens;
    const title = data.title;
    const body = data.body;
    const notificationData = data.data;
    return await sendNotification(title, body, notificationData, tokens, "");
  });

//local function to subscribe tokens to topic
export const subscribeTokensToTopic = (tokens: any, topic: any) => {
  // Subscribe the devices corresponding to the registration tokens to the
  // topic.
  return admin
    .messaging()
    .subscribeToTopic(tokens, topic)
    .then(() => {
      //console.log("subscribeToTopic", topic, tokens, res);
    })
    .catch((err) => {
      console.log("err subscribeToTopic", topic, tokens, err);
    });
};

//local function to unsubscribe tokens from topic
export const unsubscribeTokensFromTopic = (tokens: any, topic: any) => {
  // Unsubscribe the devices corresponding to the registration tokens from
  // the topic.
  return admin
    .messaging()
    .unsubscribeFromTopic(tokens, topic)
    .then(() => {
      //console.log("unsubscribeFromTopic", topic, tokens, res);
    })
    .catch((err) => {
      console.log("err unsubscribeFromTopic", topic, tokens, err);
    });
};

//subscribe user to topic
export const subscribeUserToTopic = async (userId: string, topic: string) => {
  //get user tokens
  const updateTokens = [];
  const promises = [];
  const userNotificationsDocRef = db.doc(
    `/${USERPROFILECOLLECTIONNAME}/${userId}/${NOTIFICATIONSCOLLECTIONNAME}/${NOTIFICATIONTOKENSDOCNAME}`
  );
  const userNotificationsDoc = await userNotificationsDocRef.get();
  const userNotificationsDocData = userNotificationsDoc.data();
  //scroll user tokens
  if (
    userNotificationsDocData !== undefined &&
    Object.keys(userNotificationsDocData).length > 0
  ) {
    const tokens = Object.keys(userNotificationsDocData);
    for (const i in tokens) {
      if (!userNotificationsDocData[tokens[i]].topics[topic]) {
        //if not already subscribed then update
        userNotificationsDocData[tokens[i]].topics[topic] = true;
        updateTokens.push(tokens[i]);
      }
    }
    if (updateTokens.length > 0) {
      //subscribe and update document
      promises.push(subscribeTokensToTopic(updateTokens, topic));
      promises.push(userNotificationsDocRef.set(userNotificationsDocData));
      return promises;
    } else {
      return true;
    }
  } else {
    return true;
  }
};

//subscribe user to topic
export const unsubscribeUserFromTopic = async (
  userId: string,
  topic: string
) => {
  //get user tokens
  const updateTokens = [];
  const promises = [];
  const userNotificationsDocRef = db.doc(
    `/${USERPROFILECOLLECTIONNAME}/${userId}/${NOTIFICATIONSCOLLECTIONNAME}/${NOTIFICATIONTOKENSDOCNAME}`
  );
  const userNotificationsDoc = await userNotificationsDocRef.get();
  const userNotificationsDocData = userNotificationsDoc.data();
  //scroll user tokens
  if (
    userNotificationsDocData &&
    Object.keys(userNotificationsDocData).length > 0
  ) {
    const tokens = Object.keys(userNotificationsDocData);
    for (const i in tokens) {
      if (!userNotificationsDocData[tokens[i]].topics[topic]) {
        //remove topic
        delete userNotificationsDocData[tokens[i]].topics[topic];
        updateTokens.push(tokens[i]);
      }
    }
    if (updateTokens.length > 0) {
      //unsubscribe and update document
      promises.push(unsubscribeTokensFromTopic(updateTokens, topic));
      promises.push(userNotificationsDocRef.set(userNotificationsDocData));
      return promises;
    } else {
      return true;
    }
  } else {
    return true;
  }
};
