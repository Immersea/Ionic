import { Component, h, State } from "@stencil/core";
import { Subscription } from "rxjs";
import { ChatService } from "../../../../../services/common/chat";
import { DivingSchool } from "../../../../../interfaces/udive/diving-school/divingSchool";
import {
  DivingSchoolsService,
  DIVESCHOOLSSCOLLECTION,
} from "../../../../../services/udive/divingSchools";

@Component({
  tag: "page-school-chats-list",
  styleUrl: "page-school-chats-list.scss",
})
export class PageSchoolChatsList {
  @State() divingSchool: DivingSchool;
  divingSchoolId: string;
  dsSubscription: Subscription;

  componentWillLoad() {
    this.dsSubscription = DivingSchoolsService.selectedDivingSchool$.subscribe(
      (dc) => {
        if (dc && dc.displayName) {
          this.divingSchool = dc;
          this.divingSchoolId = DivingSchoolsService.selectedDivingSchoolId;
        }
      }
    );
  }

  disconnectedCallback() {
    this.dsSubscription.unsubscribe();
  }

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
                DIVESCHOOLSSCOLLECTION,
                this.divingSchoolId,
                this.divingSchool.displayName
              )
            }
          >
            <ion-icon name='add'></ion-icon>
          </ion-fab-button>
        </ion-fab>
        {this.divingSchoolId ? (
          <app-admin-chats filterByOrganisierId={this.divingSchoolId} />
        ) : undefined}
      </ion-content>,
    ];
  }
}
