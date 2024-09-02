import * as functions from "firebase-functions";
import {
  REGION,
  MEMORY,
  TIMEOUT,
  //updateEditorOf,
  db,
  CHATSCOLLECTIONNAME,
  SETTINGSCOLLECTIONNAME,
} from "./c-system";
import {USERPROFILECOLLECTIONNAME} from "./c-users";
import {
  subscribeUserToTopic,
  unsubscribeUserFromTopic,
} from "./c-notifications";

export const updateChats = functions
  .region(REGION)
  .runWith({memory: MEMORY, timeoutSeconds: TIMEOUT})
  .firestore.document(CHATSCOLLECTIONNAME + "/{chatId}")
  .onWrite(async (change, context) => {
    const chatId = context.params.chatId;
    const chat =
      change && change.after && change.after.data()
        ? change.after.data()
        : null;
    const previousChat =
      change && change.before && change.before.data()
        ? change.before.data()
        : null;

    if (chat) {
      //update or create
      return Promise.all([
        //updateEditorOf(CHATSCOLLECTIONNAME, chatId, chat, previousChat),
        updateParticipants(chatId, chat, previousChat),
        registerChatNotifications(chatId, chat, previousChat),
      ]);
    } else {
      //delete
      return Promise.all([
        //updateEditorOf(CHATSCOLLECTIONNAME, chatId, null, previousChat),
        updateParticipants(chatId, null, previousChat),
        registerChatNotifications(chatId, null, previousChat),
      ]);
    }
  });

//register chat notifications
const registerChatNotifications = async (
  chatId: string,
  chat: any,
  previousChat: any
) => {
  const topic = "/topics/chat-" + chatId;
  const promises: any[] = [];
  //compare participants
  const newParticipants = chat && chat.participants ? chat.participants : {};
  const previousParticipants =
    previousChat && previousChat.participants ? previousChat.participants : {};

  const addedParticipants = [];
  const removedParticipants = [];

  for (const participantId in newParticipants) {
    if (!previousParticipants || !previousParticipants[participantId]) {
      addedParticipants.push(newParticipants[participantId]);
    }
  }
  for (const participantId in previousParticipants) {
    if (!newParticipants || !newParticipants[participantId]) {
      removedParticipants.push(previousParticipants[participantId]);
    }
  }
  //subscribe new participants
  const newUsersToSubscribe = [];
  for (const participant of addedParticipants) {
    if (participant.collectionId === "userProfiles") {
      //get user tokens
      newUsersToSubscribe.push(participant.id);
    } else {
      //get users from collection
      const collectionRef = db.doc(
        `/${participant.collectionId}/${participant.id}`
      );
      const collectionDoc = await collectionRef.get();
      const collectionData = collectionDoc.data();
      if (collectionData)
        for (const userId in collectionData.users) {
          newUsersToSubscribe.push(userId);
        }
    }
  }

  //unsubscribe removed participants
  const oldUsersToUnsubscribe = [];
  for (const participant of removedParticipants) {
    if (participant.collectionId === "userProfiles") {
      //get user tokens
      oldUsersToUnsubscribe.push(participant.id);
    } else {
      //get users from collection
      const collectionRef = db.doc(
        `/${participant.collectionId}/${participant.id}`
      );
      const collectionDoc = await collectionRef.get();
      const collectionData = collectionDoc.data();
      if (collectionData)
        for (const userId in collectionData.users) {
          oldUsersToUnsubscribe.push(userId);
        }
    }
  }

  //subscribe new participants
  for (const userId of addedParticipants) {
    promises.concat(await subscribeUserToTopic(userId, topic));
  }
  //unsubscribe removed participants
  for (const userId of removedParticipants) {
    promises.concat(await unsubscribeUserFromTopic(userId, topic));
  }
  return promises;
};

//chatSummaryDoc -> used for user, diving centers and schools dive chats list
const chatSummaryDoc = (chat: any) => {
  //find organiser
  let owner = "";
  Object.keys(chat.users).forEach((userId) => {
    if (chat.users[userId].includes("owner")) {
      owner = userId;
    }
  });

  let lastMessage = null;
  if (chat.thread && chat.thread.length > 0) {
    for (let i = chat.thread.length - 1; i >= 0; i--) {
      const message = chat.thread[i];
      if (message.senderId !== "system") {
        lastMessage = message;
        break;
      }
    }
  } else {
    lastMessage = {created: chat.date};
  }

  return {
    lastMessage: lastMessage,
    name: chat.name,
    participants: chat.participants,
    organiser: chat.participants[owner],
  };
};

const updateParticipants = async (
  chatId: string,
  chat: any,
  previousChat: any
) => {
  const promises = [];
  //insert/remove chats in organisers settings collection (schools, users and diving centers)
  if (chat) {
    //compare users with previous chat
    let previous: any[] = [];
    const actual = Object.keys(chat.participants);
    if (previousChat) {
      previous = Object.keys(previousChat.participants);
    }
    //const added = actual.filter((x) => !previous.includes(x));
    const removed = previous.filter((x) => !actual.includes(x));
    /*if (
      added.length > 0 ||
      removed.length > 0 ||
      (previousChat && chat.name != previousChat.name)
    ) {*/
    for (const uid of actual) {
      //get all userids of participants
      const editorChatsRef = db
        .doc(`/${chat.participants[uid].collectionId}/${uid}`)
        .collection(CHATSCOLLECTIONNAME)
        .doc(`/${CHATSCOLLECTIONNAME}`);
      const editorChatsDoc = await editorChatsRef.get();
      const editorChatsData = editorChatsDoc.data();
      const chats = editorChatsData ? editorChatsData : {};
      //update
      chats[chatId] = chatSummaryDoc(chat);
      promises.push(editorChatsRef.set(chats));
    }
    //}
    for (const uid of removed) {
      //remove participants
      const editorChatsRef = db
        .doc(`/${previousChat.participants[uid].collectionId}/${uid}`)
        .collection(CHATSCOLLECTIONNAME)
        .doc(`/${CHATSCOLLECTIONNAME}`);
      const editorChatsDoc = await editorChatsRef.get();
      const editorChatsData = editorChatsDoc.data();
      const chats = editorChatsData ? editorChatsData : {};
      //update
      delete chats[chatId];
      promises.push(editorChatsRef.set(chats));

      //delete chat last read from user settings
      if (
        previousChat.participants[uid].collectionId ===
        USERPROFILECOLLECTIONNAME
      ) {
        promises.push(await deleteChatLastRead(chatId, uid));
      }
    }
  } else if (previousChat) {
    //delete chat
    for (const uid of Object.keys(previousChat.participants)) {
      //remove participants
      const editorChatsRef = db
        .doc(`/${previousChat.participants[uid].collectionId}/${uid}`)
        .collection(CHATSCOLLECTIONNAME)
        .doc(`/${CHATSCOLLECTIONNAME}`);
      const editorChatsDoc = await editorChatsRef.get();
      const editorChatsData = editorChatsDoc.data();
      const chats = editorChatsData ? editorChatsData : {};
      //update
      delete chats[chatId];
      promises.push(editorChatsRef.set(chats));

      //delete chat last read from user settings
      if (
        previousChat.participants[uid].collectionId ===
        USERPROFILECOLLECTIONNAME
      ) {
        promises.push(await deleteChatLastRead(chatId, uid));
      }
    }
  }
  return Promise.all(promises);
};

const deleteChatLastRead = async (chatId: string, uid: string) => {
  //remove chat from last read settings
  const editorSettingsRef = db
    .doc(`/${USERPROFILECOLLECTIONNAME}/${uid}`)
    .collection(SETTINGSCOLLECTIONNAME)
    .doc(`/${SETTINGSCOLLECTIONNAME}`);
  const editorSettingsDoc = await editorSettingsRef.get();
  const editorSettingsData = editorSettingsDoc.data();
  if (
    editorSettingsData &&
    editorSettingsData.chatsLastRead &&
    editorSettingsData.chatsLastRead[chatId]
  ) {
    delete editorSettingsData.chatsLastRead[chatId];
    return editorSettingsRef.set(editorSettingsData);
  } else {
    return true;
  }
};
