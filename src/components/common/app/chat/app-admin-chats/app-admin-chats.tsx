import {Component, h, State, Prop} from "@stencil/core";
import {Subscription} from "rxjs";
import {UserService} from "../../../../../services/common/user";
import {UserRoles} from "../../../../../interfaces/common/user/user-roles";
import {MapDataUserPubicProfile} from "../../../../../interfaces/common/user/user-public-profile";
import {DivingCentersService} from "../../../../../services/udive/divingCenters";
import {MapDataDivingCenter} from "../../../../../interfaces/udive/diving-center/divingCenter";
import {MapDataDivingSchool} from "../../../../../interfaces/udive/diving-school/divingSchool";
import {DivingSchoolsService} from "../../../../../services/udive/divingSchools";
import {ChatService} from "../../../../../services/common/chat";
import {MapDataServiceCenter} from "../../../../../interfaces/udive/service-center/serviceCenter";
import {ServiceCentersService} from "../../../../../services/udive/serviceCenters";
import {ChatsSummary} from "../../../../../interfaces/common/chat/chat";
import {Environment} from "../../../../../global/env";
import {format, fromUnixTime} from "date-fns";
import {orderBy, toNumber} from "lodash";

@Component({
  tag: "app-admin-chats",
  styleUrl: "app-admin-chats.scss",
})
export class AppAdminChats {
  @Prop() filterByOrganisierId: string;
  @Prop() filterByChats: any;
  @State() adminChatsArray: any[] = [];
  @State() updateView = false;
  @State() creatingNewChat = false;
  @State() loadingChats = true;
  loadingChats$: Subscription;
  @State() editingChat = "";
  editingChat$: Subscription;

  userRoles: UserRoles;
  userRoles$: Subscription;
  userChats: ChatsSummary;
  userChats$: Subscription;
  userPublicProfilesList: MapDataUserPubicProfile[] = [];
  userPublicProfilesList$: Subscription;
  //UDIVE
  divingCentersList: MapDataDivingCenter[] = [];
  divingCentersList$: Subscription;
  divingSchoolsList: MapDataDivingSchool[] = [];
  divingSchoolsList$: Subscription;
  serviceCentersList: MapDataServiceCenter[] = [];
  serviceCentersList$: Subscription;

  async componentWillLoad() {
    this.loadingChats$ = ChatService.creatingNewChat$.subscribe((value) => {
      this.creatingNewChat = value;
    });
    this.editingChat$ = ChatService.editingChatId$.subscribe((value) => {
      this.editingChat = value;
    });

    //wait for user to be load
    this.userRoles$ = UserService.userRoles$.subscribe((roles) => {
      this.userRoles = roles;
      if (this.filterByOrganisierId && !this.userChats$) {
        this.userChats$ = ChatService.servicesChatsList$.subscribe((sub) => {
          this.loadChats(sub);
        });
      } else if (!this.userChats$) {
        this.userChats$ = ChatService.userChatsList$.subscribe((sub) => {
          this.loadChats(sub);
        });
      }
      this.filter();
    });

    //load all users list
    this.userPublicProfilesList$ =
      UserService.userPublicProfilesList$.subscribe((collection) => {
        //update dive sites
        this.userPublicProfilesList = collection;
        this.filter();
      });

    if (Environment.isUdive()) {
      //load all diving centers list
      this.divingCentersList$ =
        DivingCentersService.divingCentersList$.subscribe((collection) => {
          this.divingCentersList = collection;
          this.filter();
        });
      //load all diving schools list
      this.divingSchoolsList$ =
        DivingSchoolsService.divingSchoolsList$.subscribe((collection) => {
          this.divingSchoolsList = collection;
          this.filter();
        });

      //load all service centers list
      this.serviceCentersList$ =
        ServiceCentersService.serviceCentersList$.subscribe((collection) => {
          this.serviceCentersList = collection;
          this.filter();
        });
    }
  }

  disconnectedCallback() {
    this.userRoles$.unsubscribe();
    this.userChats$.unsubscribe();
    this.userPublicProfilesList$.unsubscribe();
    this.editingChat$.unsubscribe();
    this.loadingChats$.unsubscribe();

    if (Environment.isUdive()) {
      this.divingCentersList$.unsubscribe();
      this.divingSchoolsList$.unsubscribe();
      this.serviceCentersList$.unsubscribe();
    }
  }

  loadChats(userChats: ChatsSummary) {
    ChatService.resetSkeletons();
    this.loadingChats = false;
    if (userChats) {
      let adminChatsArray = [];

      Object.keys(userChats).forEach((key) => {
        let chat = userChats[key] as any;
        chat.id = key;
        adminChatsArray.push(chat);
      });
      adminChatsArray = orderBy(adminChatsArray, "lastMessage.created", "desc");
      this.adminChatsArray = adminChatsArray;
      this.filter();
    }
  }

  async filter() {
    if (this.adminChatsArray.length > 0) {
      //load organiser data
      this.adminChatsArray.map(async (chat) => {
        const organiser = chat.organiser;
        organiser.item = await UserService.getOrganiser("item", organiser);
        if (Environment.isUdive()) {
          chat.owner =
            chat.organiser.id === UserService.userProfile.uid ||
            chat.organiser.id === DivingSchoolsService.selectedDivingSchoolId ||
            chat.organiser.id === DivingCentersService.selectedDivingCenterId ||
            chat.organiser.id ===
              ServiceCentersService.selectedServiceCenterId ||
            chat.organiser.id === ServiceCentersService.selectedServiceCenterId;
        }

        chat.participantNames = ChatService.getOtherChatParticipants(
          "names",
          chat
        );
        chat.photoURL =
          chat.organiser && chat.organiser.item && chat.organiser.item.photoURL
            ? chat.organiser.item.photoURL
            : null;
        //change photo url if there are two users
        const otherParticipants = ChatService.getOtherChatParticipants(
          "list",
          chat
        );
        if (otherParticipants.length == 1) {
          const participant = otherParticipants[0];
          let item = await UserService.getOrganiser("item", participant);
          if (item && item.photoURL) chat.photoURL = item.photoURL;
        }

        //set chat unread
        const userLastRead =
          UserService.userSettings.chatsLastRead &&
          UserService.userSettings.chatsLastRead[chat.id]
            ? UserService.userSettings.chatsLastRead[chat.id]
            : false;
        chat.unread =
          userLastRead && chat.lastMessage
            ? toNumber(chat.lastMessage.created) >
              toNumber(UserService.userSettings.chatsLastRead[chat.id])
            : true;
      });
      //filter by chats id for clients visualisation
      if (this.filterByChats) {
        const chatsArray = Object.keys(this.filterByChats);
        this.adminChatsArray = this.adminChatsArray.filter((chat) =>
          chatsArray.includes(chat.id)
        );
      }
      this.updateView = !this.updateView;
    }
  }

  delete(event, id) {
    event.stopPropagation();
    ChatService.deleteChat(id);
  }

  render() {
    return (
      <ion-list>
        {this.loadingChats
          ? [
              <app-skeletons skeleton="chat" />,
              <app-skeletons skeleton="chat" />,
              <app-skeletons skeleton="chat" />,
              <app-skeletons skeleton="chat" />,
              <app-skeletons skeleton="chat" />,
            ]
          : undefined}
        {this.creatingNewChat ? <app-skeletons skeleton="chat" /> : undefined}
        {this.adminChatsArray.map((chat) =>
          this.editingChat == chat.id ? (
            <app-skeletons skeleton="chat" />
          ) : (
            <ion-item
              button
              onClick={() => ChatService.presentChat(chat.id)}
              detail
            >
              {chat.photoURL ? (
                <ion-avatar slot="start">
                  <ion-img src={chat.photoURL} />
                </ion-avatar>
              ) : (
                <ion-icon slot="start" name="chatbubbles-outline"></ion-icon>
              )}
              <ion-label>
                <h2 style={chat.unread ? {fontWeight: "bold"} : undefined}>
                  {chat.name
                    ? chat.name
                    : chat.participantNames
                      ? chat.participantNames
                      : ""}
                </h2>
                {chat.name ? <p>{chat.participantNames}</p> : undefined}
                {chat.lastMessage ? (
                  <p>
                    {format(
                      fromUnixTime(toNumber(chat.lastMessage.created)),
                      "PPP"
                    )}
                  </p>
                ) : undefined}
              </ion-label>
              {chat.unread ? (
                <ion-icon
                  slot="start"
                  color="danger"
                  name="radio-button-on"
                ></ion-icon>
              ) : undefined}

              {chat.owner ? (
                <ion-button
                  fill="clear"
                  color="danger"
                  icon-only
                  slot="end"
                  onClick={(ev) => this.delete(ev, chat.id)}
                >
                  <ion-icon name="trash" slot="end"></ion-icon>
                </ion-button>
              ) : undefined}
            </ion-item>
          )
        )}
      </ion-list>
    );
  }
}
