import { Component, h, Prop, State, Host, Method } from "@stencil/core";
import { Subscription } from "rxjs";
import { ChatService } from "../../../../../services/common/chat";
import { TranslationService } from "../../../../../services/common/translations";
import { popoverController, alertController } from "@ionic/core";
import { Chat } from "../../../../../interfaces/common/chat/chat";
import { RouterService } from "../../../../../services/common/router";
import { UserService } from "../../../../../services/common/user";
import {
  fromUnixTime,
  differenceInMinutes,
  differenceInDays,
  format,
} from "date-fns";
import { orderBy, toNumber } from "lodash";

@Component({
  tag: "app-chat",
  styleUrl: "app-chat.scss",
})
export class AppChat {
  @Prop() chatId: string;
  chat: Chat;
  @State() messageGroups: any = [];
  chatSub: Subscription;
  showingPopover = false;
  @State() message: string;
  chatContainer: HTMLIonContentElement;
  @State() sendingMessage = false;

  @Method()
  async addParticipants(ev) {
    if (!this.showingPopover) {
      this.showingPopover = true;
      const popover = await popoverController.create({
        component: "popover-chat-participants",
        componentProps: { chat: this.chat },
        event: ev,
        translucent: true,
      });
      popover.onDidDismiss().then(async (ev) => {
        if (ev && ev.data) {
          const participants = ev.data;
          ChatService.updateParticipants(this.chatId, this.chat, participants);
        } else {
          //checkif number of participants is >2
          if (Object.keys(this.chat.participants).length <= 1) {
            const alert = await alertController.create({
              header: TranslationService.getTransl("chat", "Chat"),
              message: TranslationService.getTransl(
                "chat-participants-error",
                "You should add at least another participant to the chat."
              ),
              buttons: [
                {
                  text: TranslationService.getTransl("cancel", "Cancel"),
                  role: "cancel",
                  handler: async () => {
                    RouterService.push("/chat", "root");
                  },
                },
                {
                  text: TranslationService.getTransl("ok", "OK"),
                  handler: async () => {
                    this.addParticipants(null);
                  },
                },
              ],
            });
            alert.present();
          }
        }

        this.showingPopover = false;
      });
      popover.present();
    }
  }

  componentWillLoad() {
    this.chatSub = ChatService.loadedChat$.subscribe((chat: Chat) => {
      if (chat && chat.participants) {
        this.chat = chat;
        this.updateMessagesArrayArray();
        if (Object.keys(this.chat.participants).length == 1) {
          this.addParticipants(null);
        }
      }
    });
    ChatService.loadChatsForUser(UserService.userProfile.uid);
    ChatService.loadChat(this.chatId);
  }

  componentDidLoad() {
    this.chatContainer = document.getElementById(
      "chat-container"
    ) as HTMLIonContentElement;
    this.scrollToBottom();
  }

  disconnectedCallback() {
    ChatService.saveLastChatReadToUser(this.chatId, this.chat);
    this.chatSub.unsubscribe();
    ChatService.unloadChat();
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatContainer.scrollToBottom();
    }, 100);
  }

  updateMessagesArrayArray() {
    this.messageGroups = [];
    let actualMessageSender = null;
    let previousMessageSender = null;
    let previousDate = null;
    let nextMessageSender = null;
    let messageGroupsCount = -1;
    const thread = orderBy(this.chat.thread, "created");
    for (let i = 0; i < thread.length; i++) {
      const message = thread[i];
      actualMessageSender = message.senderId;
      nextMessageSender =
        i == thread.length - 1 ? null : thread[i + 1].senderId;
      //check if is last message
      let isFirst =
        previousMessageSender == null ||
        previousMessageSender != actualMessageSender;
      let isMine = actualMessageSender == ChatService.chatUser.id;
      let isLast = actualMessageSender != nextMessageSender;
      let isSystem = message.senderId == "system";
      const messageObject = {
        content:
          message.content +
          (isSystem
            ? message.senderName == "added"
              ? " " + TranslationService.getTransl("is-in", "is in")
              : " " + TranslationService.getTransl("is-out", "is out")
            : ""),
        created: message.created,
        isFirst: isFirst,
        isLast: isLast,
        senderName: message.senderName,
      };
      if (isFirst) {
        const date = fromUnixTime(toNumber(message.created));
        const showDate = previousDate
          ? differenceInMinutes(previousDate, date) >= 10
          : true;
        if (!isSystem && showDate) {
          //insert message group date
          const today =
            differenceInDays(new Date(), date) >= 1
              ? format(date, "PPPP") // Full textual representation
              : `${format(date, "EEEE")} ${format(date, "p")}`; // Day of the week + time
          this.messageGroups.push({
            isSystem: true,
            messages: [
              {
                content: today,
              },
            ],
          });
          previousDate = date;
          messageGroupsCount++;
        }
        //create message group
        messageGroupsCount++;
        const item = {
          isMine: isMine,
          isSystem: isSystem,
          messages: [messageObject],
        };
        this.messageGroups.push(item);
      } else {
        this.messageGroups[messageGroupsCount].messages.push(messageObject);
      }
      previousMessageSender = message.senderId;
    }
    this.sendingMessage = false;
    this.scrollToBottom();
  }

  handleChange(ev) {
    this.message = ev.target.value;
  }

  handleKey(key) {
    //send message on Enter key
    if (key.code === "Enter") {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage() {
    this.sendingMessage = true;
    const message = this.message;
    this.message = "";
    ChatService.sendChatMessage(this.chatId, this.chat, message);
  }

  render() {
    return (
      <Host>
        <ion-content id='chat-container'>
          {this.messageGroups.map((messageGroup) => [
            <div
              class={
                messageGroup.isMine
                  ? "mine messages"
                  : messageGroup.isSystem
                    ? "system"
                    : "yours messages"
              }
            >
              {messageGroup.messages.map((message) => [
                this.chat &&
                this.chat.participants &&
                Object.keys(this.chat.participants).length > 2 &&
                !messageGroup.isMine &&
                message.isFirst &&
                !messageGroup.isSystem ? (
                  <div class='sendername'>{message.senderName}</div>
                ) : undefined,
                <div
                  class={"message" + (message.isLast ? " last" : "")}
                  innerHTML={message.content}
                ></div>,
              ])}
            </div>,
          ])}
        </ion-content>
        <ion-footer class='chat-footer'>
          <ion-toolbar>
            <ion-item lines='none'>
              {this.sendingMessage ? (
                <ion-spinner name='dots'></ion-spinner>
              ) : undefined}
              <ion-input
                mode='ios'
                placeholder={
                  !this.sendingMessage
                    ? TranslationService.getTransl(
                        "write-message",
                        "Write a message"
                      )
                    : undefined
                }
                autofocus={true}
                clearOnEdit={true}
                value={this.message}
                disabled={this.sendingMessage}
                onIonInput={(ev) => this.handleChange(ev)}
                onKeyUp={(ev) => this.handleKey(ev)}
              ></ion-input>
              <ion-button
                slot='end'
                icon-only
                fill='clear'
                disabled={this.sendingMessage}
                onClick={() => this.sendMessage()}
              >
                <ion-icon name='paper-plane-outline'></ion-icon>
              </ion-button>
            </ion-item>
          </ion-toolbar>
        </ion-footer>
      </Host>
    );
  }
}
