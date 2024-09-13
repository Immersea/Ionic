import { Component, h, Prop, State } from "@stencil/core";
import { Subscription } from "rxjs";
import { UserService } from "../../../../../services/common/user";
import {
  UserCards,
  Card,
} from "../../../../../interfaces/udive/user/user-cards";
import { alertController } from "@ionic/core";
import { TranslationService } from "../../../../../services/common/translations";
import { SystemService } from "../../../../../services/common/system";
import { SystemPreference } from "../../../../../interfaces/common/system/system";
import { RouterService } from "../../../../../services/common/router";
import { showDate } from "../../../../../helpers/utils";

@Component({
  tag: "app-user-cards",
  styleUrl: "app-user-cards.scss",
})
export class AppUserCards {
  @Prop() updateSlider: any;
  @State() userCards: UserCards;
  @State() updateView = true;
  @State() sysPref: SystemPreference;
  userCardsSub$: Subscription;
  async componentWillLoad() {
    this.userCardsSub$ = UserService.userCards$.subscribe(
      (userCards: UserCards) => {
        this.userCards = new UserCards(userCards);
        this.updateView = !this.updateView;
        this.updateSlider();
      }
    );
    this.sysPref = await SystemService.getSystemPreferences();
  }

  componentDidLoad() {
    //check if user is loaded or trigger local user
    if (!this.userCards) {
      UserService.initLocalUser();
    }
  }

  disconnectedCallback() {
    this.userCardsSub$.unsubscribe();
  }

  async addCard(i?) {
    const confModal = await RouterService.openModal("modal-dive-card", {
      card: this.userCards.cards[i] ? this.userCards.cards[i] : new Card(),
    });
    confModal.onDidDismiss().then((updatedCard) => {
      updatedCard = updatedCard.data;
      if (updatedCard) {
        if (this.userCards.cards[i]) {
          this.userCards.cards[i] = new Card(updatedCard);
        } else {
          this.userCards.cards.push(new Card(updatedCard));
        }
        this.save();
      }
    });
  }

  async removeCard(event, i) {
    event.stopPropagation();
    const confirm = await alertController.create({
      header: TranslationService.getTransl(
        "delete-card-header",
        "Delete Dive Card?"
      ),
      message: TranslationService.getTransl(
        "delete-card-message",
        "This dive card will be deleted! Are you sure?"
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
            this.userCards.cards.splice(i, 1);
            this.save();
          },
        },
      ],
    });
    confirm.present();
  }

  save() {
    UserService.updateUserCards(this.userCards);
    this.updateSlider();
  }

  render() {
    return (
      <div class='slider-container'>
        <div class='slider-scrollable-container'>
          <ion-grid class='ion-no-padding'>
            <ion-row class='ion-text-start ion-no-padding cards-container'>
              {this.userCards && this.userCards.cards.length > 0
                ? this.userCards.cards.map((card, i) => (
                    <ion-col
                      size-sm='12'
                      size-md='6'
                      size-lg='4'
                      class='ion-no-padding cards-column'
                    >
                      <ion-card onClick={() => this.addCard(i)} class='card'>
                        <div class='card-content'>
                          {card.imgFront ? (
                            <img src={card.imgFront} />
                          ) : undefined}

                          <ion-card-header>
                            <ion-card-subtitle>
                              <ion-item class='ion-no-padding' lines='none'>
                                <ion-button
                                  icon-only
                                  slot='end'
                                  color='danger'
                                  fill='clear'
                                  onClick={(ev) => this.removeCard(ev, i)}
                                >
                                  <ion-icon name='trash-bin-outline'></ion-icon>
                                </ion-button>
                                <ion-label>
                                  <h2>{card.course.certificationId}</h2>
                                </ion-label>
                              </ion-item>
                              {card.course.agencyName}
                            </ion-card-subtitle>
                          </ion-card-header>
                          <ion-card-content>
                            {card.number ? <p>#{card.number}</p> : undefined}
                            {card.instructor ? (
                              <p>
                                <my-transl tag='instructor' text='Instructor' />
                                : {card.instructor}
                              </p>
                            ) : undefined}
                            {card.certified ? (
                              <p>
                                <my-transl tag='certified' text='Certified' />:{" "}
                                {showDate(card.certified, "date")}
                              </p>
                            ) : undefined}
                            {card.expiry ? (
                              <p>
                                <my-transl tag='expiry' text='Expiry' />:{" "}
                                {showDate(card.expiry, "date")}
                              </p>
                            ) : undefined}
                            {card.comments ? (
                              <p>
                                <my-transl tag='comments' text='Comments' />:{" "}
                                {card.comments}
                              </p>
                            ) : undefined}
                          </ion-card-content>
                        </div>
                      </ion-card>
                    </ion-col>
                  ))
                : undefined}
              {/* Add new card button */}
              <ion-col
                size-sm='12'
                size-md='6'
                size-lg='4'
                class='ion-no-padding cards-column'
              >
                <ion-card class='card add-card' onClick={() => this.addCard()}>
                  <ion-card-content class='card-content add-card-content'>
                    <ion-icon
                      name='add-circle-outline'
                      class='add-icon'
                    ></ion-icon>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>
      </div>
    );
  }
}
