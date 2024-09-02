import {Component, h, Prop, State} from "@stencil/core";
import {RouterService} from "../../../../../services/common/router";
import {ChatService} from "../../../../../services/common/chat";
import {Subscription} from "rxjs";
import {Chat} from "../../../../../interfaces/common/chat/chat";
import {TranslationService} from "../../../../../services/common/translations";
import {
  DIVETRIPSCOLLECTION,
  DiveTripsService,
} from "../../../../../services/udive/diveTrips";

@Component({
  tag: "page-chat",
  styleUrl: "page-chat.scss",
})
export class PageChat {
  @Prop() chatId: string;
  @State() participants: number;
  @State() chat: Chat;
  @State() title: string;
  @State() subtitle: string;
  chatApp: any;
  chatSub: Subscription;
  @State() additionalDataItem: {
    title: string;
    onclick: any;
  };

  componentWillLoad() {
    this.chatSub = ChatService.loadedChat$.subscribe((chat) => {
      if (chat && chat.participants) {
        this.chat = chat;
        this.participants = Object.keys(chat.participants).length;
        let otherParticipants = [];
        Object.keys(this.chat.participants).map((partId) => {
          if (partId !== ChatService.chatUser.id) {
            otherParticipants.push(this.chat.participants[partId]);
          }
        });

        if (this.chat.name && this.chat.name.length > 0) {
          this.title = this.chat.name;
          this.subtitle = ChatService.getOtherChatParticipants(
            "names",
            this.chat
          );
        } else {
          this.title = ChatService.getOtherChatParticipants("names", this.chat);
          this.subtitle = null;
        }
        if (this.chat.additionalData) {
          this.loadAdditionalDataItem();
        }
      }
    });
  }
  componentDidLoad() {
    this.chatApp = document.getElementsByTagName("app-chat")[0];
  }

  disconnectedCallback() {
    this.chatSub.unsubscribe();
  }

  async loadAdditionalDataItem() {
    if (this.chat.additionalData.collectionId === DIVETRIPSCOLLECTION) {
      this.additionalDataItem = {
        title: TranslationService.getTransl("dive-trip", "Dive Trip"),
        onclick: DiveTripsService.pushDiveTrip,
      };
    }
  }

  showAdditionalDataItem() {}

  addParticipant(ev) {
    this.chatApp.addParticipants(ev);
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="chat">
          <ion-buttons slot="start">
            <ion-button onClick={() => RouterService.goBack()} icon-only>
              <ion-icon name="arrow-back"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>{this.title}</ion-title>
          {this.subtitle ? (
            <ion-title size="small">{this.subtitle}</ion-title>
          ) : undefined}
          <ion-buttons slot="end">
            {this.additionalDataItem ? (
              <ion-button
                fill="outline"
                onClick={() =>
                  this.additionalDataItem.onclick(this.chat.additionalData.id)
                }
              >
                {this.additionalDataItem.title}
                <ion-icon name="open-outline" slot="start"></ion-icon>
              </ion-button>
            ) : undefined}
            <ion-button
              icon-only
              slot="end"
              onClick={(ev) => this.addParticipant(ev)}
            >
              <ion-icon name="people-outline"></ion-icon>
              {this.participants ? (
                <ion-badge color="secondary">{this.participants}</ion-badge>
              ) : undefined}
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        <app-chat chatId={this.chatId} />
      </ion-content>,
    ];
  }
}
