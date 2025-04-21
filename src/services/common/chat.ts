import { DatabaseService } from "./database";
import { getUserTime } from "../../helpers/utils";
import { BehaviorSubject, Subscription } from "rxjs";
import {
  USERCHATSCOLLECTION,
  USERPROFILECOLLECTION,
  UserService,
} from "./user";
import { alertController } from "@ionic/core";
import { TranslationService } from "./translations";
import {
  Chat,
  ChatParticipant,
  ChatsSummary,
  Message,
} from "../../interfaces/common/chat/chat";
import { RouterService } from "./router";
import {
  DIVESCHOOLSSCOLLECTION,
  DivingSchoolsService,
} from "../udive/divingSchools";
import {
  DIVECENTERSSCOLLECTION,
  DivingCentersService,
} from "../udive/divingCenters";
import {
  SERVICECENTERSCOLLECTION,
  ServiceCentersService,
} from "../udive/serviceCenters";
import { orderBy } from "lodash";
import { Environment } from "../../global/env";
import {
  DiveCommunitiesService,
  DIVECOMMUNITIESCOLLECTION,
} from "../udive/diveCommunities";

class ChatController {
  creatingNewChat$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  creatingNewChat = false; //used to show skeleton on pages during the creation of a dive trip
  editingChatId$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  editingChatId: string;
  chatUser: ChatParticipant;
  loadedChat: Chat;
  loadedChat$: BehaviorSubject<Chat> = new BehaviorSubject(<Chat>{});
  userChatsList$: BehaviorSubject<ChatsSummary> = new BehaviorSubject(
    <ChatsSummary>{}
  );
  servicesChatsList$: BehaviorSubject<ChatsSummary> = new BehaviorSubject(
    <ChatsSummary>{}
  );
  loadedChatSub: Subscription;

  resetSkeletons() {
    this.setCreatingNewChat(false);
    this.setEditingChat("");
  }
  setCreatingNewChat(val: boolean) {
    this.creatingNewChat = val;
    this.creatingNewChat$.next(this.creatingNewChat);
  }
  setEditingChat(val) {
    this.editingChatId = val;
    this.editingChatId$.next(this.editingChatId);
  }

  async getChat(chatId: string): Promise<Chat> {
    return await DatabaseService.getDocument(USERCHATSCOLLECTION, chatId);
  }

  async loadChat(chatId: string) {
    const sub = await DatabaseService.getDocumentObservable(
      USERCHATSCOLLECTION,
      chatId
    );
    this.loadedChatSub = sub.subscribe((chat: Chat) => {
      this.loadedChat = chat;
      this.loadedChat.thread = orderBy(chat.thread, "created");
      this.loadedChat$.next(this.loadedChat);
    });
  }

  saveLastChatReadToUser(chatId: string, chat: Chat) {
    const settings = UserService.userSettings;
    !settings.chatsLastRead ? (settings.chatsLastRead = {}) : undefined;
    settings.chatsLastRead[chatId] =
      chat.thread && chat.thread.length > 0
        ? chat.thread[chat.thread.length - 1].created
        : chat.date;
    UserService.updateUserSettings(settings);
  }

  unloadChat() {
    this.loadedChat = null;
    this.loadedChat$.next(this.loadedChat);
    this.loadedChatSub.unsubscribe();
  }

  async addChat(collectionId: string, userId: string, displayName: string) {
    const confirm = await alertController.create({
      header: TranslationService.getTransl("add-chat-header", "Add Chat"),
      message: TranslationService.getTransl(
        "add-chat-message",
        "Do you want to add a new chat?"
      ),
      buttons: [
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: async () => {
            const res = await this.createNewChat(
              collectionId,
              userId,
              displayName
            );
            if (res && res.id) this.presentChat(res.id);
          },
        },
      ],
    });
    confirm.present();
  }

  async createNewChat(
    collectionId: string,
    userId: string,
    displayName: string,
    additionalData?: any
  ) {
    this.setCreatingNewChat(true);
    const time = await getUserTime();
    //create chat document
    const newChat = {
      name: "",
      date: Math.floor(time.getTime() / 1000).toString(), //moment(time).format("X")
      participants: {},
      additionalData: additionalData,
      users: {},
      thread: [],
    } as Chat;
    newChat.participants[userId] = {
      collectionId: collectionId,
      id: userId,
      displayName: displayName,
    };
    newChat.users[userId] = ["owner"];
    const res = await DatabaseService.addDocument(USERCHATSCOLLECTION, newChat);
    this.setCreatingNewChat(false);
    return res;
  }

  async createChatWithParticipants(
    owner: ChatParticipant,
    otherParticipants: ChatParticipant[],
    chatId?: string,
    name?: string,
    thread?: Message[],
    additionalData?: any
  ) {
    const time = await getUserTime();
    //create chat document
    const newChat = {
      name: name ? name : "",
      date: Math.floor(time.getTime() / 1000).toString(),
      additionalData: additionalData,
      participants: {},
      users: {},
      thread: thread ? thread : [],
    } as Chat;
    newChat.participants[owner.id] = {
      collectionId: owner.collectionId,
      id: owner.id,
      displayName: owner.displayName,
    };
    newChat.users[owner.id] = ["owner"];
    otherParticipants.forEach((participant) => {
      newChat.participants[participant.id] = {
        collectionId: participant.collectionId,
        id: participant.id,
        displayName: participant.displayName,
      };
      newChat.users[participant.id] = ["editor"];
    });
    let res = null;
    if (chatId) {
      res = await DatabaseService.updateDocument(
        USERCHATSCOLLECTION,
        chatId,
        newChat
      );
    } else {
      res = await DatabaseService.addDocument(USERCHATSCOLLECTION, newChat);
    }
    return res;
  }

  resetChatUser() {
    //don't reset if we are in admin pages
    if (!RouterService.pageTo.includes("admin")) {
      this.servicesChatsList$ = null;
      this.loadChatsForUser();
    }
  }

  loadChatsForUser(filterByOrganisierId?) {
    if (filterByOrganisierId) {
      if (
        filterByOrganisierId === DivingSchoolsService.selectedDivingSchoolId
      ) {
        this.servicesChatsList$ =
          DivingSchoolsService.selectedDivingSchoolChats$;
        this.chatUser = {
          collectionId: DIVESCHOOLSSCOLLECTION,
          id: filterByOrganisierId,
          displayName: DivingSchoolsService.selectedDivingSchool.displayName,
        };
      } else if (
        filterByOrganisierId === DivingCentersService.selectedDivingCenterId
      ) {
        this.servicesChatsList$ =
          DivingCentersService.selectedDivingCenterChats$;
        this.chatUser = {
          collectionId: DIVECENTERSSCOLLECTION,
          id: filterByOrganisierId,
          displayName: DivingCentersService.selectedDivingCenter.displayName,
        };
      } else if (
        filterByOrganisierId === DiveCommunitiesService.selectedDiveCommunityId
      ) {
        this.servicesChatsList$ =
          DiveCommunitiesService.selectedDiveCommunityChats$;
        this.chatUser = {
          collectionId: DIVECOMMUNITIESCOLLECTION,
          id: filterByOrganisierId,
          displayName: DiveCommunitiesService.selectedDiveCommunity.displayName,
        };
      } else if (
        filterByOrganisierId === ServiceCentersService.selectedServiceCenterId
      ) {
        this.servicesChatsList$ =
          ServiceCentersService.selectedServiceCenterChats$;
        this.chatUser = {
          collectionId: SERVICECENTERSCOLLECTION,
          id: filterByOrganisierId,
          displayName: ServiceCentersService.selectedServiceCenter.displayName,
        };
      }
    } else {
      UserService.userChats$.subscribe((chats) => {
        this.userChatsList$.next(chats);
      });

      this.chatUser = {
        collectionId: USERPROFILECOLLECTION,
        id: UserService.userProfile ? UserService.userProfile.uid : null,
        displayName: UserService.userProfile.displayName,
      };
    }
  }

  getOtherChatParticipants(type, chat): any {
    const participants = Object.keys(chat.participants).length;
    let otherParticipants = [];
    let names = "";
    Object.keys(chat.participants).map((key) => {
      if (
        chat.participants[key] &&
        chat.participants[key].id &&
        chat.participants[key].id !== this.chatUser.id
      ) {
        otherParticipants.push(chat.participants[key]);
      }
    });

    otherParticipants = orderBy(otherParticipants, "displayName");
    names = "";
    if (participants == 1) {
      names = "...";
    } else {
      for (let i = 0; i < otherParticipants.length; i++) {
        names =
          names +
          otherParticipants[i].displayName +
          (i < otherParticipants.length - 1 ? ", " : "");
      }
    }
    /*const trimLength = 30;
    if (this.title.length >= trimLength) {
      this.title = this.title.substring(0, trimLength) + "...";
    }*/

    if (type == "names") return names;
    else return otherParticipants;
  }

  updateParticipants(chatId: string, chat: Chat, participants: any) {
    if (participants && participants.added && participants.added.length > 0) {
      participants.added.map(async (user) => {
        chat.thread.push(
          await ChatService.createChatMessage(
            "system",
            "added",
            user.displayName
          )
        );
        chat.participants[user.uid] = {
          collectionId: user.collectionId
            ? user.collectionId
            : this.getUserCollection(user),
          id: user.uid,
          displayName: user.displayName,
        };
        chat.users[user.uid] = ["editor"];
      });
    }
    if (
      participants &&
      participants.removed &&
      participants.removed.length > 0
    ) {
      participants.removed.map(async (user) => {
        chat.thread.push(
          await ChatService.createChatMessage(
            "system",
            "removed",
            user.displayName
          )
        );
        //in case of UserPublicProfile
        delete chat.participants[user.uid];
        delete chat.users[user.uid];
        //in case of other collections
        delete chat.participants[user.id];
        delete chat.users[user.id];
      });
    }
    this.updateChat(chatId, chat);
  }

  getUserCollection(user) {
    if (Environment.isDecoplanner()) {
      if (user.cards) {
        return USERPROFILECOLLECTION;
      }
    } else if (Environment.isUdive()) {
      if (user.cards) {
        return USERPROFILECOLLECTION;
      } else if (user.divingCourses) {
        return DIVESCHOOLSSCOLLECTION;
      } else if (user.diveSites) {
        return DIVECENTERSSCOLLECTION;
      } else {
        return SERVICECENTERSCOLLECTION;
      }
    }
  }

  presentChat(chatId: string) {
    if (window.location.pathname.includes("admin")) {
      if (window.location.pathname.includes("divingschools")) {
        RouterService.push(
          "/admin/divingschools/" +
            DivingSchoolsService.selectedDivingSchoolId +
            "/chat/" +
            chatId,
          "forward"
        );
      } else if (window.location.pathname.includes("divingcenters")) {
        RouterService.push(
          "/admin/divingcenters/" +
            DivingCentersService.selectedDivingCenterId +
            "/chat/" +
            chatId,
          "forward"
        );
      } else if (window.location.pathname.includes("servicecenters")) {
        RouterService.push(
          "/admin/servicecenters/" +
            ServiceCentersService.selectedServiceCenterId +
            "/chat/" +
            chatId,
          "forward"
        );
      }
    } else {
      RouterService.push("/chat/" + chatId, "forward");
    }
  }

  async sendChatMessage(chatId, chat, message) {
    chat.thread.push(
      await ChatService.createChatMessage(
        this.chatUser.id,
        this.chatUser.displayName,
        message
      )
    );
    this.updateChat(chatId, chat);
  }

  async createChatMessage(senderId, senderName, content) {
    const time = await getUserTime();
    return {
      content: content,
      created: Math.floor(time.getTime() / 1000).toString(), //format unix timestamp
      senderId: senderId,
      senderName: senderName,
    };
  }

  async updateChat(chatId, chatPayload) {
    const time = await getUserTime();
    chatPayload.date = Math.floor(time.getTime() / 1000).toString();
    DatabaseService.updateDocument(USERCHATSCOLLECTION, chatId, chatPayload);
  }

  async deleteChat(id) {
    const confirm = await alertController.create({
      header: TranslationService.getTransl(
        "delete-chat-header",
        "Delete Chat?"
      ),
      message: TranslationService.getTransl(
        "delete-chat-message",
        "This chat will be deleted! Are you sure?"
      ),
      buttons: [
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: () => {
            ChatService.setEditingChat(id);
            DatabaseService.deleteDocument(USERCHATSCOLLECTION, id);
          },
        },
      ],
    });
    confirm.present();
  }
}

export const ChatService = new ChatController();
