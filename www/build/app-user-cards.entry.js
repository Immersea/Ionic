import { r as registerInstance, h } from './index-d515af00.js';
import { U as UserService, B as SystemService, R as RouterService, T as TranslationService, aQ as showDate } from './utils-ced1e260.js';
import { U as UserCards, C as Card } from './user-cards-f5f720bb.js';
import './index-be90eba5.js';
import { a as alertController } from './overlays-b3ceb97d.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-c3ad5e77.js';
import './ionic-global-c07767bf.js';
import './map-fe092362.js';
import './index-9b61a50b.js';
import './customerLocation-d18240cd.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
import './index-93ceac82.js';
import './helpers-ff3eb5b3.js';
import './ios.transition-4bc5d5e6.js';
import './md.transition-b118d52a.js';
import './cubic-bezier-acda64df.js';
import './index-493838d0.js';
import './gesture-controller-a0857859.js';
import './config-45217ee2.js';
import './theme-6bada181.js';
import './index-f47409f3.js';
import './hardware-back-button-da755485.js';
import './framework-delegate-779ab78c.js';

const appUserCardsCss = "app-user-cards{width:100%}app-user-cards .card-margins{margin:10px 5px 5px 10px}";

const AppUserCards = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.updateSlider = undefined;
        this.userCards = undefined;
        this.updateView = true;
        this.sysPref = undefined;
    }
    async componentWillLoad() {
        this.userCardsSub$ = UserService.userCards$.subscribe((userCards) => {
            this.userCards = new UserCards(userCards);
            this.updateView = !this.updateView;
            this.updateSlider();
        });
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
    async addCard(i) {
        const confModal = await RouterService.openModal("modal-dive-card", {
            card: this.userCards.cards[i] ? this.userCards.cards[i] : new Card(),
        });
        confModal.onDidDismiss().then((updatedCard) => {
            updatedCard = updatedCard.data;
            if (updatedCard) {
                if (this.userCards.cards[i]) {
                    this.userCards.cards[i] = new Card(updatedCard);
                }
                else {
                    this.userCards.cards.push(new Card(updatedCard));
                }
                this.save();
            }
        });
    }
    async removeCard(event, i) {
        event.stopPropagation();
        const confirm = await alertController.create({
            header: TranslationService.getTransl("delete-card-header", "Delete Dive Card?"),
            message: TranslationService.getTransl("delete-card-message", "This dive card will be deleted! Are you sure?"),
            buttons: [
                {
                    text: TranslationService.getTransl("cancel", "Cancel"),
                    role: "cancel",
                    handler: () => { },
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
        return (h("div", { key: '40916da38ed73b8863f4e05323f8dce14d15e335', class: 'slider-container' }, h("div", { key: '0dd15cc879d4deb468fd81e476441c514ed159eb', class: 'slider-scrollable-container' }, h("ion-grid", { key: '8b054be49df225d54c8657cc3b8afd01894a561f', class: 'ion-no-padding' }, h("ion-row", { key: '3e508438ad03eaf3ef6097c672ea78d803493dc6', class: 'ion-text-start ion-no-padding' }, this.userCards && this.userCards.cards.length > 0
            ? this.userCards.cards.map((card, i) => (h("ion-col", { "size-sm": '12', "size-md": '6', "size-lg": '4', class: 'ion-no-padding' }, h("ion-card", { onClick: () => this.addCard(i), class: 'card-margins' }, card.imgFront ? (h("img", { src: card.imgFront })) : undefined, h("ion-card-header", null, h("ion-card-subtitle", null, h("ion-item", { class: 'ion-no-padding', lines: 'none' }, h("ion-button", { "icon-only": true, slot: 'end', color: 'danger', fill: 'clear', onClick: (ev) => this.removeCard(ev, i) }, h("ion-icon", { name: 'trash-bin-outline' })), h("ion-label", null, h("h2", null, card.course.certificationId))), card.course.agencyName)), h("ion-card-content", null, card.number ? h("p", null, "#", card.number) : undefined, card.instructor ? (h("p", null, h("my-transl", { tag: 'instructor', text: 'Instructor' }), ":", " ", card.instructor)) : undefined, card.certified ? (h("p", null, h("my-transl", { tag: 'certified', text: 'Certified' }), ":", " ", showDate(card.certified, "date"))) : undefined, card.expiry ? (h("p", null, h("my-transl", { tag: 'expiry', text: 'Expiry' }), ":", " ", showDate(card.expiry, "date"))) : undefined, card.comments ? (h("p", null, h("my-transl", { tag: 'comments', text: 'Comments' }), ":", " ", card.comments)) : undefined)))))
            : undefined, h("ion-col", { key: 'bb7c822fc701fd2e0a8ad2441a35d2bd8b888bf1', "size-sm": '12', "size-md": '6', "size-lg": '4', class: 'ion-no-padding' }, h("ion-card", { key: '097a656d4735371fbeac3dd876d28de0952ba315', onClick: () => this.addCard() }, h("ion-card-content", { key: '22a12f747f6e39b5801d8db75e5fc46a239816aa', class: 'ion-text-center' }, h("ion-icon", { key: '214b5b63f55e941f3bab83f56e1cde60c8d43bae', name: 'add-circle-outline', style: { fontSize: "100px" } })))))))));
    }
};
AppUserCards.style = appUserCardsCss;

export { AppUserCards as app_user_cards };

//# sourceMappingURL=app-user-cards.entry.js.map