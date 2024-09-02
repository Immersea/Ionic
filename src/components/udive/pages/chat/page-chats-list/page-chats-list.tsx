import { Component, h } from "@stencil/core";
import { ChatService } from "../../../../../services/common/chat";
import {
  USERPROFILECOLLECTION,
  UserService,
} from "../../../../../services/common/user";

@Component({
  tag: "page-chats-list",
  styleUrl: "page-chats-list.scss",
})
export class PageChatsList {
  render() {
    return [
      <ion-header>
        <app-navbar tag='chat' text='Chat' color='chat'></app-navbar>
      </ion-header>,
      <ion-content>
        <ion-fab horizontal='end' vertical='top' slot='fixed' edge>
          <ion-fab-button
            color='chat'
            onClick={() =>
              ChatService.addChat(
                USERPROFILECOLLECTION,
                UserService.userProfile.uid,
                UserService.userProfile.displayName
              )
            }
          >
            <ion-icon name='add'></ion-icon>
          </ion-fab-button>
        </ion-fab>
        <app-admin-chats />
      </ion-content>,
    ];
  }
}
